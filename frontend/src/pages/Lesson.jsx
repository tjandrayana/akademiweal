import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { fetchLessonsByLevel } from '../api/lessons'
import { XP_PER_CORRECT, XP_PER_LESSON_COMPLETE, markLessonComplete, deductLife } from '../lib/gamification'
import { playCorrect, playWrong, playComplete, playTap, playSelect, playStepNext } from '../lib/sounds'
import { EVENTS, trackEvent } from '../tracking/events'
import { AppHeader } from '../components/AppHeader'
import { Button } from '../components/Button'
import { LessonIntro } from '../components/LessonIntro'
import { ProgressBar } from '../components/ProgressBar'
import { cn } from '../lib/cn'

function hasIntroContent(lesson) {
  if (!lesson) return false
  return (lesson.hook ?? '').trim().length > 0 || (lesson.body ?? '').trim().length > 0
}

/* ─────────────────────────────────────────────
   Shared header used in all lesson states
───────────────────────────────────────────── */
function LessonHeader({ onExit, progressValue, sessionXp, xpGain, answered, result }) {
  return (
    <AppHeader
      mode="lesson"
      variant="light"
      className="py-2"
      left={
        <button
          type="button"
          onClick={onExit}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-bold text-muted transition-colors hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          aria-label="Keluar dari pelajaran"
        >
          ✕
        </button>
      }
      center={
        <div className="w-full min-w-0">
          <ProgressBar value={progressValue} />
        </div>
      }
      right={
        <div className="inline-flex max-w-[min(100%,9rem)] items-center gap-0.5 rounded-full border border-yellow-100 bg-yellow-50 px-2 py-1.5 sm:px-3">
          <span className="shrink-0 text-sm leading-none" aria-hidden="true">
            ⭐
          </span>
          <span
            className={cn(
              'text-xs font-extrabold tabular-nums sm:text-sm',
              sessionXp > 0 ? 'text-yellow-600' : 'text-gray-400',
            )}
          >
            {sessionXp}
          </span>
          {answered && result === 'correct' && xpGain != null && (
            <span className="animate-lesson-xp-pop ml-0.5 text-xs font-extrabold text-primary sm:text-sm">
              +{xpGain}
            </span>
          )}
        </div>
      }
    />
  )
}

export function Lesson() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const levelParam = searchParams.get('level')
  const lessonIdParam = searchParams.get('lessonId')
  const level = useMemo(() => {
    const n = parseInt(levelParam ?? '1', 10)
    return Number.isFinite(n) && n >= 1 ? n : 1
  }, [levelParam])

  const [lessons, setLessons] = useState(null)
  const [loadState, setLoadState] = useState('loading')
  const [loadError, setLoadError] = useState(null)

  const [activeIndex, setActiveIndex] = useState(0)
  const [pendingAnswer, setPendingAnswer] = useState(null)   // selected but not submitted
  const [selected, setSelected] = useState(null)             // submitted answer
  const [result, setResult] = useState(null)
  const [xpGain, setXpGain] = useState(null)
  const [sessionXp, setSessionXp] = useState(0)
  const [sessionCorrect, setSessionCorrect] = useState(0)
  const [sessionAttempted, setSessionAttempted] = useState(0)
  const [lessonStep, setLessonStep] = useState(0)
  const [wrongBeforeCorrect, setWrongBeforeCorrect] = useState(0)
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false)
  const lessonStartSentRef = useRef(null)

  const lesson = useMemo(
    () => (lessons?.length ? lessons[Math.min(activeIndex, lessons.length - 1)] : null),
    [lessons, activeIndex],
  )

  const answered = result !== null

  const loadLessons = useCallback(
    async (signal) => {
      setLoadState('loading')
      setLoadError(null)
      try {
        const data = await fetchLessonsByLevel(level, { signal })
        if (!Array.isArray(data)) throw new Error('Invalid response')
        setLessons(data)
        setLoadState('ready')
      } catch (e) {
        if (e?.name === 'AbortError') return
        setLessons(null)
        setLoadError(e instanceof Error ? e.message : 'Something went wrong')
        setLoadState('error')
      }
    },
    [level],
  )

  useEffect(() => {
    const ac = new AbortController()
    loadLessons(ac.signal)
    return () => ac.abort()
  }, [loadLessons])

  useEffect(() => {
    setSessionXp(0)
    setSessionCorrect(0)
    setSessionAttempted(0)
  }, [level])

  useEffect(() => {
    setLessonStep(0)
    setWrongBeforeCorrect(0)
  }, [lesson?.id])

  useEffect(() => {
    if (!lessons?.length) return
    if (lessonIdParam != null && lessonIdParam !== '') {
      const id = Number(lessonIdParam)
      if (Number.isFinite(id)) {
        const idx = lessons.findIndex((l) => l.id === id)
        if (idx >= 0) { setActiveIndex(idx); return }
      }
    }
    setActiveIndex(0)
  }, [lessons, lessonIdParam])

  useEffect(() => {
    if (!lessons?.length) return
    setActiveIndex((i) => Math.min(i, lessons.length - 1))
  }, [lessons])

  useEffect(() => {
    setSelected(null)
    setResult(null)
    setXpGain(null)
    setPendingAnswer(null)
  }, [level, lesson?.id])

  useEffect(() => {
    if (loadState !== 'ready' || !lesson) return
    if (lessonStartSentRef.current === lesson.id) return
    lessonStartSentRef.current = lesson.id
    trackEvent(EVENTS.LESSON_START, { lesson_id: lesson.id, level })
  }, [loadState, lesson, level])

  const totalInLevel = lessons?.length ?? 0
  const progressValue = useMemo(() => {
    if (totalInLevel <= 0) return 0
    const hasIntro = lesson && hasIntroContent(lesson)
    if (!hasIntro) return Math.round(((activeIndex + 1) / totalInLevel) * 100)
    if (lessonStep === 0) return Math.round(((activeIndex + 0.5) / totalInLevel) * 100)
    return Math.round(((activeIndex + 1) / totalInLevel) * 100)
  }, [totalInLevel, lesson, activeIndex, lessonStep])

  const hasNextLesson = lessons != null && activeIndex + 1 < lessons.length

  function starsForCurrentLesson() {
    if (result !== 'correct') return 1
    if (wrongBeforeCorrect === 0) return 3
    if (wrongBeforeCorrect === 1) return 2
    return 1
  }

  function handleNext() {
    if (!lessons?.length) return
    if (answered && lesson != null) {
      markLessonComplete(lesson.id, starsForCurrentLesson())
    }
    if (hasNextLesson) {
      setActiveIndex((i) => i + 1)
      setSelected(null)
      setResult(null)
      setXpGain(null)
      setPendingAnswer(null)
    } else {
      playComplete()
      const totalQ = sessionAttempted > 0 ? sessionAttempted : lessons.length
      const xpTotal = sessionXp + XP_PER_LESSON_COMPLETE
      navigate('/result', {
        replace: true,
        state: { xp: xpTotal, correct: sessionCorrect, total: totalQ },
      })
    }
  }

  /** Submit the pending answer (called by PERIKSA button) */
  function handleSubmit() {
    if (!lesson || !pendingAnswer || answered) return
    playTap()
    trackEvent(EVENTS.ANSWER_CLICK, { lesson_id: lesson.id, level })
    const choice = pendingAnswer
    setSelected(choice)
    setSessionAttempted((n) => n + 1)
    if (choice === lesson.answer) {
      playCorrect()
      trackEvent(EVENTS.LESSON_COMPLETE, { lesson_id: lesson.id, level })
      setXpGain(XP_PER_CORRECT)
      setSessionXp((x) => x + XP_PER_CORRECT)
      setSessionCorrect((c) => c + 1)
      setResult('correct')
    } else {
      playWrong()
      deductLife()
      setWrongBeforeCorrect((n) => n + 1)
      setResult('wrong')
    }
  }

  function requestExitLesson() {
    const hasProgress =
      sessionAttempted > 0 || sessionXp > 0 || (lesson != null && lessonStep > 0 && hasIntroContent(lesson))
    if (hasProgress) {
      setExitConfirmOpen(true)
    } else {
      navigate('/home')
    }
  }

  /* ── Loading ── */
  if (loadState === 'loading') {
    return (
      <div className="flex min-h-svh flex-col bg-white">
        <LessonHeader onExit={() => navigate('/home')} progressValue={0} sessionXp={0} xpGain={null} answered={false} result={null} />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center" role="status" aria-live="polite">
          <div className="text-5xl animate-bounce" aria-hidden="true">🐂</div>
          <p className="m-0 text-base font-semibold text-muted">Memuat pelajaran…</p>
        </div>
      </div>
    )
  }

  /* ── Error ── */
  if (loadState === 'error') {
    return (
      <div className="flex min-h-svh flex-col bg-white">
        <LessonHeader onExit={() => navigate('/home')} progressValue={0} sessionXp={0} xpGain={null} answered={false} result={null} />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center" role="alert">
          <span className="text-5xl" aria-hidden="true">😕</span>
          <p className="m-0 text-base font-semibold text-text">{loadError}</p>
          <Button type="button" variant="primary" className="w-full" onClick={() => loadLessons(undefined)}>Coba lagi</Button>
          <Button type="button" variant="secondary" className="w-full" onClick={() => navigate('/home')}>Kembali ke beranda</Button>
        </div>
      </div>
    )
  }

  /* ── No lesson ── */
  if (!lesson) {
    return (
      <div className="flex min-h-svh flex-col bg-white">
        <LessonHeader onExit={() => navigate('/home')} progressValue={0} sessionXp={0} xpGain={null} answered={false} result={null} />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
          <span className="text-6xl" aria-hidden="true">🐂</span>
          <p className="m-0 text-base font-semibold text-text">Belum ada pelajaran untuk level {level}.</p>
          <Button type="button" variant="secondary" className="w-full" onClick={() => navigate('/home')}>Kembali ke beranda</Button>
        </div>
      </div>
    )
  }

  const displayOptions = (lesson.options ?? []).slice(0, 4)
  const correctAnswer = lesson.answer
  const showIntro = hasIntroContent(lesson) && lessonStep === 0

  return (
    <div className="flex min-h-svh flex-col bg-white overflow-hidden">
      <LessonHeader
        onExit={requestExitLesson}
        progressValue={progressValue}
        sessionXp={sessionXp}
        xpGain={xpGain}
        answered={answered}
        result={result}
      />

      {showIntro ? (
        /* ── Intro screen ── */
        <div className="flex w-full flex-1 flex-col overflow-hidden">
          <LessonIntro
            title={lesson.title}
            hook={lesson.hook}
            body={lesson.body}
            onContinue={() => { playStepNext(); setLessonStep(1) }}
          />
        </div>
      ) : (
        /* ── Two-zone quiz layout ── */
        <div className="flex flex-1 flex-col overflow-hidden">

          {/* ── ZONE 1: Illustrated scene ── */}
          <div
            className="relative shrink-0 overflow-hidden"
            style={{ minHeight: 240 }}
          >
            {/* SVG landscape background */}
            <svg
              viewBox="0 0 400 240"
              preserveAspectRatio="xMidYMid slice"
              className="absolute inset-0 w-full h-full"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="ls-sky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5BBDE4" />
                  <stop offset="100%" stopColor="#A8D8F0" />
                </linearGradient>
              </defs>

              {/* Sky */}
              <rect width="400" height="240" fill="url(#ls-sky)" />

              {/* Sun */}
              <circle cx="348" cy="36" r="26" fill="#FFF9C4" opacity="0.55" />
              <circle cx="348" cy="36" r="18" fill="#FFE082" opacity="0.8" />

              {/* Cloud left */}
              <g opacity="0.97">
                <ellipse cx="72" cy="54" rx="44" ry="21" fill="white" />
                <ellipse cx="93" cy="44" rx="31" ry="26" fill="white" />
                <ellipse cx="55" cy="51" rx="27" ry="17" fill="white" />
              </g>

              {/* Cloud right */}
              <g opacity="0.92">
                <ellipse cx="308" cy="42" rx="39" ry="19" fill="white" />
                <ellipse cx="330" cy="32" rx="27" ry="23" fill="white" />
                <ellipse cx="292" cy="40" rx="23" ry="15" fill="white" />
              </g>

              {/* Back hills — soft light green */}
              <path d="M0 178 C55 148 110 165 165 152 C220 139 270 128 320 148 C355 163 378 152 400 158 L400 240 L0 240 Z" fill="#B8E4A0" />

              {/* Back trees — left cluster */}
              {/* Pine left-1 */}
              <polygon points="36,158 49,120 62,158" fill="#3A9B5C" />
              <polygon points="33,170 49,134 65,170" fill="#4DB870" />
              <rect x="45" y="168" width="8" height="13" fill="#7B5E45" rx="2" />
              {/* Round tree left-2 */}
              <ellipse cx="82" cy="160" rx="15" ry="17" fill="#3A9B5C" />
              <ellipse cx="82" cy="152" rx="11" ry="13" fill="#52C97A" />
              <rect x="79" y="173" width="6" height="10" fill="#7B5E45" rx="2" />

              {/* Back trees — right cluster */}
              {/* Pine right-1 */}
              <polygon points="318,152 332,113 346,152" fill="#3A9B5C" />
              <polygon points="315,164 332,127 349,164" fill="#4DB870" />
              <rect x="328" y="162" width="8" height="13" fill="#7B5E45" rx="2" />
              {/* Round tree right-2 */}
              <ellipse cx="362" cy="163" rx="16" ry="18" fill="#3A9B5C" />
              <ellipse cx="362" cy="155" rx="12" ry="14" fill="#52C97A" />
              <rect x="359" y="177" width="6" height="10" fill="#7B5E45" rx="2" />

              {/* Mid hill — medium green */}
              <path d="M0 198 C45 178 95 188 148 181 C200 174 250 167 300 178 C338 186 368 180 400 184 L400 240 L0 240 Z" fill="#72C464" />

              {/* Ground strip */}
              <rect y="218" width="400" height="22" fill="#5CAF55" />

              {/* Ground highlight */}
              <path d="M0 218 Q100 214 200 218 Q300 222 400 218" stroke="#6DC95E" strokeWidth="3" fill="none" opacity="0.6" />

              {/* Grass tufts */}
              <path d="M18 218 Q20 210 22 218" stroke="#4A9A47" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M23 218 Q25 212 27 218" stroke="#4A9A47" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M155 218 Q157 211 159 218" stroke="#4A9A47" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M240 218 Q242 212 244 218" stroke="#4A9A47" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M340 218 Q342 210 344 218" stroke="#4A9A47" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M346 218 Q348 213 350 218" stroke="#4A9A47" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>

            {/* Mascot + speech bubble */}
            <div className="relative z-10 flex items-start gap-3 px-5 pt-5 pb-14">
              {/* Large mascot — reacts to answer */}
              <div
                key={result ?? 'idle'}
                className={cn(
                  'shrink-0 flex h-[88px] w-[88px] items-center justify-center rounded-full text-[52px] leading-none shadow-xl border-4 border-white transition-colors duration-300',
                  !answered && 'bg-white/90',
                  answered && result === 'correct' && 'bg-yellow-100 animate-mascot-bounce',
                  answered && result === 'wrong' && 'bg-red-100 animate-mascot-shake',
                )}
                aria-hidden="true"
              >
                {answered && result === 'correct' ? '🎉' : answered && result === 'wrong' ? '😅' : '🐂'}
              </div>

              {/* Speech bubble */}
              <div className="relative flex-1 mt-2">
                {/* Bubble tail */}
                <div className="absolute -left-[9px] top-4 w-0 h-0
                  border-t-[9px] border-t-transparent
                  border-r-[9px] border-r-gray-200
                  border-b-[9px] border-b-transparent" />
                <div className="absolute -left-[7px] top-4 w-0 h-0
                  border-t-[9px] border-t-transparent
                  border-r-[9px] border-r-white
                  border-b-[9px] border-b-transparent" />
                <div className="rounded-2xl rounded-tl-sm border-2 border-gray-200 bg-white px-4 py-3 shadow-md">
                  <p className="m-0 text-sm text-muted font-semibold mb-1">{lesson.title}</p>
                  <p className="m-0 text-[0.9375rem] font-bold text-text leading-snug">{lesson.question}</p>
                </div>
              </div>
            </div>

            {/* Instruction badge — floats above the white card overlap */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
              <span className={cn(
                'whitespace-nowrap rounded-full px-4 py-1 text-[11px] font-extrabold uppercase tracking-widest shadow-sm',
                !answered && 'bg-white/80 text-gray-600',
                answered && result === 'correct' && 'bg-green-500 text-white',
                answered && result === 'wrong' && 'bg-red-500 text-white',
              )}>
                {answered
                  ? result === 'correct' ? '🎉 Luar Biasa!'
                  : '💡 Hampir Benar'
                  : 'Pilih jawaban yang tepat'}
              </span>
            </div>
          </div>

          {/* ── ZONE 2: White answer card ── */}
          <div
            className={cn(
              'relative z-10 -mt-5 flex flex-1 flex-col rounded-t-[28px] bg-white overflow-hidden',
              'shadow-[0_-6px_24px_rgba(0,0,0,0.10)]',
            )}
          >
            {/* Answer zone — shows selection / feedback */}
            <div className="px-4 pt-5 pb-3">
              <div
                className={cn(
                  'min-h-[56px] flex items-center justify-center rounded-2xl border-2 px-4 py-3 transition-all duration-300',
                  !answered && !pendingAnswer && 'border-dashed border-gray-200 bg-gray-50',
                  !answered && pendingAnswer && 'border-primary/60 bg-green-50',
                  answered && result === 'correct' && 'border-green-500 bg-green-50',
                  answered && result === 'wrong' && 'border-red-400 bg-red-50',
                )}
                role="status"
                aria-live="polite"
              >
                {!answered && !pendingAnswer && (
                  <p className="m-0 text-sm text-gray-400 font-semibold">Ketuk jawaban di bawah</p>
                )}
                {!answered && pendingAnswer && (
                  <p className="m-0 text-base font-bold text-text">{pendingAnswer}</p>
                )}
                {answered && result === 'correct' && (
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 font-bold text-sm">{selected}</span>
                    {xpGain != null && (
                      <span className="ml-2 text-xs font-extrabold bg-primary text-white rounded-full px-2.5 py-0.5">
                        +{xpGain} XP
                      </span>
                    )}
                  </div>
                )}
                {answered && result === 'wrong' && (
                  <div className="text-center">
                    <p className="m-0 text-sm font-bold text-red-700">
                      Jawaban: <span className="underline">{correctAnswer}</span>
                    </p>
                    {lesson?.explanation?.trim() && (
                      <p className="m-0 mt-1 text-xs text-red-600 leading-snug">{lesson.explanation.trim()}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Word-bank chips */}
            <div className="flex-1 flex flex-col justify-center px-4 py-2">
              <div
                className="flex flex-wrap justify-center gap-2.5"
                role="group"
                aria-label="Pilihan jawaban"
              >
                {displayOptions.map((option) => {
                  const isPending = !answered && pendingAnswer === option
                  const isCorrect = answered && option === correctAnswer
                  const isWrong = answered && selected === option && option !== correctAnswer
                  const isNeutral = answered && option !== selected && option !== correctAnswer

                  return (
                    <button
                      key={`${lesson.id}-${option}`}
                      type="button"
                      disabled={answered}
                      onClick={() => { if (!answered) { playSelect(); setPendingAnswer(option === pendingAnswer ? null : option) } }}
                      className={cn(
                        'px-5 py-3.5 rounded-2xl border-2 text-sm font-bold transition-all duration-150',
                        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                        !answered && !isPending && 'bg-white border-gray-200 border-b-[3px] border-b-gray-300 text-text shadow-sm hover:border-gray-300 hover:bg-gray-50 active:translate-y-px active:border-b',
                        isPending && 'bg-green-50 border-primary border-b-[3px] border-b-green-700 text-primary shadow-sm scale-[1.03]',
                        isCorrect && 'bg-green-50 border-green-500 border-b-[3px] border-b-green-700 text-green-800 cursor-default',
                        isWrong && 'bg-red-50 border-red-400 border-b-[3px] border-b-red-600 text-red-700 cursor-default',
                        isNeutral && 'bg-white border-gray-100 text-gray-400 opacity-35 cursor-default',
                      )}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ── PERIKSA / LANJUT button ── */}
            <div
              className={cn(
                'px-4 pb-6 pt-3 border-t transition-colors duration-300',
                answered && result === 'correct' && 'border-green-200 bg-green-50',
                answered && result === 'wrong' && 'border-red-200 bg-red-50',
                !answered && 'border-gray-100',
              )}
            >
              <Button
                type="button"
                variant="primary"
                className="w-full font-extrabold text-base tracking-wide"
                disabled={!pendingAnswer && !answered}
                onClick={answered ? handleNext : handleSubmit}
              >
                {answered
                  ? hasNextLesson ? 'LANJUT →' : 'SELESAI 🎉'
                  : pendingAnswer ? 'PERIKSA →' : 'Pilih Jawaban'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Exit confirmation dialog ── */}
      {exitConfirmOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 px-4 pb-8 pt-12"
          role="dialog"
          aria-modal="true"
          aria-labelledby="exit-lesson-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-border bg-white p-5 shadow-xl">
            <h2 id="exit-lesson-title" className="m-0 text-lg font-bold text-text">Yakin mau keluar?</h2>
            <p className="mt-2 m-0 text-sm text-muted leading-relaxed">Progress kamu di sesi ini akan hilang.</p>
            <div className="mt-4 flex flex-col gap-2">
              <Button type="button" variant="primary" className="w-full font-bold" onClick={() => setExitConfirmOpen(false)}>
                Tetap di sini
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="w-full font-bold"
                onClick={() => { setExitConfirmOpen(false); navigate('/home') }}
              >
                Keluar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
