import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { fetchLessonsByLevel } from '../api/lessons'
import { CURRICULUM_LEVELS } from '../lib/curriculum'
import { GUEST_MAX_FREE_PATH_STEP, GUEST_UNLOCK_PATH, isLoggedIn } from '../lib/guestGate'
import { XP_PER_CORRECT, XP_PER_LESSON_COMPLETE, markLessonComplete, deductLife, getDisplayMascotEvolutionLevel } from '../lib/gamification'
import { playCorrect, playWrong, playComplete, playTap, playSelect, playStepNext } from '../lib/sounds'
import { EVENTS, trackEvent } from '../tracking/events'
import { Button } from '../components/Button'
import { LessonIntro } from '../components/LessonIntro'
import MascotEvolution, { getMascotByLevel } from '../components/MascotEvolution'
import { useGamificationStats } from '../hooks/useGamificationStats'
import { cn } from '../lib/cn'

function hasIntroContent(lesson) {
  if (!lesson) return false
  return (lesson.hook ?? '').trim().length > 0 || (lesson.body ?? '').trim().length > 0
}

/* ─────────────────────────────────────────────
   Zone-aware SVG scene for quiz area
───────────────────────────────────────────── */
const LESSON_SKY_STOPS = {
  1: ['#60D0FF', '#C8F4FF'],
  2: ['#FFB830', '#FFEC90'],
  3: ['#60C8FF', '#D0F0FF'],
  4: ['#38C8FF', '#A0F0FF'],
  5: ['#FFA040', '#FFE8A0'],
  6: ['#4FC8FF', '#D0F8E8'],
  7: ['#1A0850', '#3A2888'],
  8: ['#FF6B35', '#FFD090'],
  9: ['#0369A1', '#BAE6FD'],
  10: ['#5B21B6', '#DDD6FE'],
}
const LESSON_GROUND_COLOR = {
  1: '#40D864', 2: '#F8C838', 3: '#40D864', 4: '#1890CC',
  5: '#E8B840', 6: '#38D470', 7: '#180C38', 8: '#C87830',
  9: '#0C4A6E', 10: '#4C1D95',
}

function ZoneLessonScene({ level }) {
  const [s1, s2] = LESSON_SKY_STOPS[level] || LESSON_SKY_STOPS[1]
  const gnd = LESSON_GROUND_COLOR[level] || LESSON_GROUND_COLOR[1]
  const gradId = `lsn-sky-${level}`
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 370 200" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={s1} />
          <stop offset="100%" stopColor={s2} />
        </linearGradient>
      </defs>
      <rect width="370" height="200" fill={`url(#${gradId})`} />
      {level === 2 || level === 5 ? (
        <>
          <circle cx="310" cy="52" r="38" fill="#FFE040" opacity="0.2"/>
          <circle cx="310" cy="52" r="26" fill="#FFF060" opacity="0.5"/>
        </>
      ) : level <= 6 ? (
        <>
          <circle cx="50" cy="50" r="32" fill="#FFE840" opacity="0.25"/>
          <circle cx="50" cy="50" r="20" fill="#FFF060" opacity="0.5"/>
        </>
      ) : null}
      {level !== 7 && level !== 8 && (
        <g style={{ animation: 'iq-cloud-drift 10s ease-in-out infinite alternate' }}>
          <ellipse cx="260" cy="45" rx="50" ry="28" fill="white" opacity="0.9"/>
          <ellipse cx="236" cy="54" rx="35" ry="24" fill="white" opacity="0.9"/>
          <ellipse cx="284" cy="56" rx="37" ry="22" fill="white" opacity="0.9"/>
        </g>
      )}
      <path d={`M0,200 Q60,165 130,178 Q200,190 270,168 Q320,154 370,168 L370,200 Z`} fill={gnd} opacity="0.8"/>
      <path d={`M0,200 Q80,178 180,186 Q280,194 370,182 L370,200 Z`} fill={gnd}/>
      {/* Floating coins */}
      <circle cx="22" cy="155" r="9" fill="#C8900A" style={{ animation: 'iq-coin-bob 1.8s ease-in-out infinite 0.3s' }}/>
      <circle cx="22" cy="153" r="9" fill="#F5C518" style={{ animation: 'iq-coin-bob 1.8s ease-in-out infinite 0.3s' }}/>
      <text x="22" y="157" textAnchor="middle" fontSize="10" fill="#9A6800" fontWeight="900" fontFamily="Arial" style={{ animation: 'iq-coin-bob 1.8s ease-in-out infinite 0.3s' }}>$</text>
      <circle cx="348" cy="148" r="8" fill="#C8900A" style={{ animation: 'iq-coin-bob 2.2s ease-in-out infinite 0.9s' }}/>
      <circle cx="348" cy="146" r="8" fill="#F5C518" style={{ animation: 'iq-coin-bob 2.2s ease-in-out infinite 0.9s' }}/>
      <text x="348" y="150" textAnchor="middle" fontSize="9" fill="#9A6800" fontWeight="900" fontFamily="Arial" style={{ animation: 'iq-coin-bob 2.2s ease-in-out infinite 0.9s' }}>$</text>
      {/* Dotted hint path */}
      <path d="M0,140 Q60,120 120,132 Q180,142 240,125 Q300,110 370,122" fill="none" stroke="white" strokeWidth="3" strokeDasharray="8 6" opacity="0.4" style={{ animation: 'iq-path-dash 2s linear infinite' }}/>
    </svg>
  )
}

/* ─────────────────────────────────────────────
   Shared header used in all lesson states
───────────────────────────────────────────── */
function LessonHeader({ onExit, progressValue, sessionXp, xpGain, answered, result }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px 8px', background: '#FAFAF8', borderBottom: '1px solid #F0EDE8' }}>
      <button
        type="button"
        onClick={onExit}
        style={{
          width: 34, height: 34, borderRadius: '50%',
          background: '#F0EDE8', border: '2px solid #E0D8D0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, color: '#8A7A6A', cursor: 'pointer', fontWeight: 900, flexShrink: 0,
        }}
        aria-label="Keluar dari pelajaran"
      >✕</button>
      <div style={{ flex: 1, height: 14, background: '#F0EDE8', borderRadius: 100, overflow: 'hidden', border: '2px solid #E0D8D0' }}>
        <div style={{
          height: '100%', borderRadius: 100,
          background: 'linear-gradient(90deg,#40C860,#60E880)',
          boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.4)',
          transition: 'width 0.6s ease',
          width: `${progressValue}%`,
        }} />
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        background: '#FFF8E0', border: '2px solid #F5C518',
        borderRadius: 100, padding: '5px 12px',
        flexShrink: 0, boxShadow: '0 3px 0 #C8A010',
      }}>
        <span style={{ fontSize: 16 }}>⭐</span>
        <span style={{ fontFamily: "'Fredoka One',cursive", fontSize: 15, color: '#9A6800' }}>
          {sessionXp}
          {answered && result === 'correct' && xpGain != null && (
            <span style={{ marginLeft: 4, fontSize: 13, color: '#20A040' }}>+{xpGain}</span>
          )}
        </span>
      </div>
    </div>
  )
}

export function Lesson() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const levelParam = searchParams.get('level')
  const lessonIdParam = searchParams.get('lessonId')
  const level = useMemo(() => {
    const n = parseInt(levelParam ?? '1', 10)
    return Number.isFinite(n) && n >= 1 ? n : 1
  }, [levelParam])

  const { streak, xp, lives: livesFromStats, completedLessons } = useGamificationStats()

  const [lessons, setLessons] = useState(null)
  const [loadState, setLoadState] = useState('loading')
  const [loadError, setLoadError] = useState(null)

  const [activeIndex, setActiveIndex] = useState(0)
  const [pendingAnswer, setPendingAnswer] = useState(null)   // selected but not submitted
  const [selected, setSelected] = useState(null)             // submitted answer
  const [result, setResult] = useState(null)
  const [xpGain, setXpGain] = useState(null)
  const [xpPopupVisible, setXpPopupVisible] = useState(false)
  const [sessionXp, setSessionXp] = useState(0)
  const [sessionCorrect, setSessionCorrect] = useState(0)
  const [sessionAttempted, setSessionAttempted] = useState(0)
  const [lessonStep, setLessonStep] = useState(0)
  const [wrongBeforeCorrect, setWrongBeforeCorrect] = useState(0)
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false)
  const [priorLevelLessonCount, setPriorLevelLessonCount] = useState(0)
  const lessonStartSentRef = useRef(null)
  // Snapshot of completed lessons when this level session begins — used to block replay XP
  const sessionCompletedRef = useRef(null)

  const lesson = useMemo(
    () => (lessons?.length ? lessons[Math.min(activeIndex, lessons.length - 1)] : null),
    [lessons, activeIndex],
  )

  // Cap mascot tier by path step — same logic as Home, prevents tier mismatch
  const displayMascotLevel = useMemo(() => {
    const step = priorLevelLessonCount + activeIndex + 1
    return getDisplayMascotEvolutionLevel(xp, step > 0 ? step : 1)
  }, [xp, priorLevelLessonCount, activeIndex])
  const mascotTier = useMemo(() => getMascotByLevel(displayMascotLevel), [displayMascotLevel])

  // Shuffle options once per lesson so the correct answer isn't always in the same slot
  const shuffledOptions = useMemo(() => {
    const opts = (lesson?.options ?? []).slice(0, 4)
    const arr = [...opts]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }, [lesson?.id]) // re-shuffle only when the lesson changes, stable within a session

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
    let cancelled = false
    const ac = new AbortController()
    ;(async () => {
      let before = 0
      for (const lv of CURRICULUM_LEVELS) {
        if (lv >= level) break
        try {
          const data = await fetchLessonsByLevel(lv, { signal: ac.signal })
          if (cancelled) return
          before += Array.isArray(data) ? data.length : 0
        } catch {
          /* ignore */
        }
      }
      if (!cancelled) setPriorLevelLessonCount(before)
    })()
    return () => {
      cancelled = true
      ac.abort()
    }
  }, [level])

  useEffect(() => {
    setSessionXp(0)
    setSessionCorrect(0)
    setSessionAttempted(0)
    // Snapshot which lessons were already complete before this session started
    sessionCompletedRef.current = new Set(completedLessons)
  }, [level]) // eslint-disable-line react-hooks/exhaustive-deps — intentional: snapshot once per level, not on every completedLessons change

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
    setXpPopupVisible(false)
  }, [level, lesson?.id])

  // Auto-hide XP popup after a short moment
  useEffect(() => {
    if (!(result === 'correct' && xpGain != null && xpGain > 0)) return
    setXpPopupVisible(true)
    const t = window.setTimeout(() => setXpPopupVisible(false), 900)
    return () => window.clearTimeout(t)
  }, [result, xpGain])

  useEffect(() => {
    if (loadState !== 'ready' || !lesson) return
    if (lessonStartSentRef.current === lesson.id) return
    lessonStartSentRef.current = lesson.id
    trackEvent(EVENTS.LESSON_START, { lesson_id: lesson.id, level })
  }, [loadState, lesson, level])

  useEffect(() => {
    if (loadState !== 'ready' || !lessons?.length || !lesson) return
    if (isLoggedIn()) return
    const pathStep = priorLevelLessonCount + activeIndex + 1
    if (pathStep > GUEST_MAX_FREE_PATH_STEP) {
      navigate(GUEST_UNLOCK_PATH, { replace: true, state: { reason: 'guest_limit', from: location } })
    }
  }, [
    loadState,
    lessons,
    lesson,
    priorLevelLessonCount,
    activeIndex,
    navigate,
    location,
  ])

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
      const nextStep = priorLevelLessonCount + activeIndex + 2
      if (!isLoggedIn() && nextStep > GUEST_MAX_FREE_PATH_STEP) {
        navigate(GUEST_UNLOCK_PATH, { replace: true, state: { reason: 'guest_limit', from: location } })
        return
      }
      setActiveIndex((i) => i + 1)
      setSelected(null)
      setResult(null)
      setXpGain(null)
      setPendingAnswer(null)
      setXpPopupVisible(false)
    } else {
      playComplete()
      const totalQ = sessionAttempted > 0 ? sessionAttempted : lessons.length
      const hasNewCompletions = lessons.some((l) => !sessionCompletedRef.current?.has(l.id))
      const xpTotal = sessionXp + (hasNewCompletions ? XP_PER_LESSON_COMPLETE : 0)
      navigate('/result', {
        replace: true,
        state: { xp: xpTotal, correct: sessionCorrect, total: totalQ, zone: level },
      })
    }
  }

  /** Submit the pending answer (called by Cek Jawaban button) */
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
      const alreadyDone = sessionCompletedRef.current?.has(lesson.id) ?? false
      const earned = alreadyDone ? 0 : XP_PER_CORRECT
      setXpGain(earned > 0 ? earned : null)
      if (earned > 0) setSessionXp((x) => x + earned)
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

  const displayOptions = shuffledOptions
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
            explanation={lesson.explanation}
            insight={lesson.insight}
            source_reference={lesson.source_reference}
            level={level}
            mascotEvolutionLevel={displayMascotLevel}
            streak={streak}
            onContinue={() => { playStepNext(); setLessonStep(1) }}
          />
        </div>
      ) : (
        /* ── Two-zone quiz layout ── */
        <div className="flex flex-1 flex-col overflow-hidden">

          {/* ── ZONE: Illustrated scene with mascot + question ── */}
          <div className="relative shrink-0 overflow-hidden" style={{ height: 200 }}>
            {/* Zone-aware background SVG */}
            <ZoneLessonScene level={level} />

            {/* Mascot left + speech bubble right */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', alignItems: 'flex-end', gap: 0, padding: '0 12px', zIndex: 10 }}>
              {/* Profile-style mascot card */}
              <div style={{
                width: 88, flexShrink: 0, marginBottom: 8,
                borderRadius: 20, overflow: 'hidden',
                background: `linear-gradient(180deg, ${mascotTier.color}40 0%, rgba(15,10,30,0.96) 55%)`,
                border: `2.5px solid ${mascotTier.tierColor}`,
                boxShadow: `0 0 0 4px ${mascotTier.tierColor}22, 0 8px 24px rgba(0,0,0,0.55)`,
                animation: mascotTier.anim,
              }}>
                <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 4 }}>
                  <MascotEvolution level={displayMascotLevel} size={88} />
                </div>
                <div style={{
                  background: `linear-gradient(90deg, ${mascotTier.tierColor}, ${mascotTier.color})`,
                  textAlign: 'center', fontSize: 9, fontWeight: 900, letterSpacing: '1.5px',
                  color: 'rgba(0,0,0,0.8)', padding: '4px 4px', textTransform: 'uppercase',
                }}>
                  {mascotTier.name}
                </div>
              </div>
              <div style={{
                background: 'white', borderRadius: '18px 18px 18px 4px',
                padding: '14px 16px', marginLeft: 10, marginBottom: 16,
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                flex: 1, maxWidth: 240, border: '2px solid rgba(0,0,0,0.06)',
              }}>
                <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#8A9AB0', marginBottom: 4 }}>Zona {level}</div>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#2A2020', lineHeight: 1.4 }}>{lesson.question}</div>
              </div>
            </div>
          </div>

          {/* XP popup on correct */}
          {xpPopupVisible && answered && result === 'correct' && xpGain != null && (
            <div style={{
              position: 'fixed', top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
              background: 'linear-gradient(135deg,#FFD040,#FFB020)',
              borderRadius: 20, padding: '20px 32px', textAlign: 'center',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)', zIndex: 100,
              fontFamily: "'Fredoka One',cursive", pointerEvents: 'none',
              animation: 'iq-xp-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards',
            }}>
              <div style={{ fontSize: 48, color: '#7A4000', lineHeight: 1 }}>+{xpGain}</div>
              <div style={{ fontSize: 16, color: '#AA6000' }}>XP!</div>
              <div style={{ fontSize: 28, marginTop: 4 }}>🎉</div>
            </div>
          )}

          {/* ── White quiz sheet ── */}
          <div className="relative z-10 -mt-3 flex flex-1 flex-col rounded-t-[28px] bg-white overflow-hidden" style={{ boxShadow: '0 -6px 24px rgba(0,0,0,0.10)' }}>
            {/* Sheet handle */}
            <div style={{ width: 40, height: 4, borderRadius: 2, background: '#E8E0D8', margin: '12px auto 0' }} />

            <div className="flex flex-1 flex-col px-4 pt-3 pb-3 overflow-y-auto">
              {/* Question number + hearts */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'linear-gradient(135deg,#FFD040,#FFB020)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'Fredoka One',cursive", fontSize: 14, color: '#7A4000',
                    boxShadow: '0 2px 0 #CC8000',
                  }}>
                    {activeIndex + 1}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#B0A090' }}>dari {totalInLevel} soal</span>
                </div>
                <div style={{ display: 'flex', gap: 3 }}>
                  {[...Array(3)].map((_, i) => (
                    <span key={i} style={{ fontSize: 18, opacity: i < livesFromStats ? 1 : 0.2 }} aria-hidden="true">❤️</span>
                  ))}
                </div>
              </div>

              {/* Answer preview box */}
              <div style={{
                border: answered
                  ? result === 'correct' ? '2.5px solid #40C860' : '2.5px solid #FF5060'
                  : pendingAnswer ? '2.5px solid #FFB830' : '2.5px dashed #D8D0C8',
                borderRadius: 14, padding: '14px 16px', marginBottom: 12,
                background: answered
                  ? result === 'correct' ? '#F0FFF4' : '#FFF0F0'
                  : pendingAnswer ? '#FFF8E8' : '#FAFAF8',
                minHeight: 52, display: 'flex', alignItems: 'center',
                fontSize: 14, fontWeight: 700,
                color: pendingAnswer || answered ? '#2A2020' : '#C0B8B0',
                transition: 'all 0.2s',
              }} role="status" aria-live="polite">
                {!answered && !pendingAnswer && 'Ketuk jawaban di bawah 👇'}
                {!answered && pendingAnswer && `✏️ ${pendingAnswer}`}
                {answered && result === 'correct' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: '#20A040', fontWeight: 800 }}>{selected}</span>
                    {xpGain != null && (
                      <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 900, background: '#28B050', color: 'white', borderRadius: 100, padding: '2px 10px' }}>+{xpGain} XP</span>
                    )}
                  </div>
                )}
                {answered && result === 'wrong' && (
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: '#E03040' }}>
                      Jawaban benar: <span style={{ textDecoration: 'underline' }}>{correctAnswer}</span>
                    </p>
                    {lesson?.explanation?.trim() && (
                      <p style={{ margin: '4px 0 0', fontSize: 12, color: '#9A3A3A', lineHeight: 1.4 }}>{lesson.explanation.trim()}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Feedback banner */}
              {answered && (
                <div style={{
                  borderRadius: 16, padding: '14px 16px', marginBottom: 12,
                  display: 'flex', gap: 12, alignItems: 'center',
                  background: result === 'correct' ? '#E8FFF0' : '#FFF0F0',
                  border: `2px solid ${result === 'correct' ? '#40C860' : '#FF5060'}`,
                }}>
                  <span style={{ fontSize: 28, flexShrink: 0 }}>{result === 'correct' ? '🎉' : '💪'}</span>
                  <div>
                    <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 17, color: result === 'correct' ? '#20A040' : '#E03040', marginBottom: 2 }}>
                      {result === 'correct' ? `Mantap Sekali! +${xpGain} XP!` : 'Hampir Benar! Coba Lagi!'}
                    </div>
                    <div style={{ fontSize: 12, color: '#6A5A4A', fontWeight: 700, lineHeight: 1.4 }}>
                      {result === 'correct'
                        ? `${selected} — jawaban yang tepat!`
                        : `Jawaban yang benar adalah "${correctAnswer}". Ingat ya!`}
                    </div>
                  </div>
                </div>
              )}

              {/* Source citation — shown after answering */}
              {answered && lesson?.source_reference?.trim() && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 10px', borderRadius: 8, marginBottom: 8,
                  background: '#F8F6F2', border: '1px solid #EDE8E0',
                }}>
                  <span style={{ fontSize: 11 }}>📚</span>
                  <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: '#A09080', letterSpacing: '0.3px', fontStyle: 'italic' }}>
                    Sumber: {lesson.source_reference.trim()}
                  </p>
                </div>
              )}

              {/* Answer options — A/B/C/D list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
                {displayOptions.map((option, idx) => {
                  const letters = ['A', 'B', 'C', 'D']
                  const letterColors = [
                    { bg: '#FFF0E8', color: '#FF7030' },
                    { bg: '#E8F8FF', color: '#2090D0' },
                    { bg: '#F0FFF0', color: '#30A850' },
                    { bg: '#F8F0FF', color: '#8040C0' },
                  ]
                  const lc = letterColors[idx] || letterColors[0]
                  const isPending = !answered && pendingAnswer === option
                  const isCorrect = answered && option === correctAnswer
                  const isWrong = answered && selected === option && option !== correctAnswer
                  const isLocked = answered && !isCorrect && !isWrong

                  return (
                    <button
                      key={`${lesson.id}-${option}`}
                      type="button"
                      disabled={answered}
                      onClick={() => { if (!answered) { playSelect(); setPendingAnswer(option === pendingAnswer ? null : option) } }}
                      style={{
                        background: isPending ? '#FFF8E8' : isCorrect ? '#F0FFF4' : isWrong ? '#FFF0F0' : 'white',
                        border: `2.5px solid ${isPending ? '#FFB830' : isCorrect ? '#40C860' : isWrong ? '#FF5060' : '#E8E0D8'}`,
                        borderRadius: 16, padding: 0, cursor: answered ? 'default' : 'pointer',
                        transition: 'transform .15s, box-shadow .15s',
                        boxShadow: isPending ? '0 3px 0 #CC8800' : isCorrect ? '0 3px 0 #288040' : isWrong ? '0 3px 0 #CC2030' : '0 3px 0 #D8D0C8',
                        overflow: 'hidden', display: 'flex', alignItems: 'center',
                        opacity: isLocked ? 0.45 : 1,
                      }}
                    >
                      <div style={{
                        width: 44, height: 52,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: "'Fredoka One',cursive", fontSize: 18, flexShrink: 0,
                        borderRight: '2px solid #F0EDE8',
                        background: isCorrect ? '#E8FFF0' : isWrong ? '#FFE8E8' : lc.bg,
                        color: isCorrect ? '#20A040' : isWrong ? '#E03040' : lc.color,
                      }}>
                        {isCorrect ? '✓' : isWrong ? '✗' : letters[idx]}
                      </div>
                      <div style={{ padding: '14px 14px', fontSize: 13, fontWeight: 800, color: isCorrect ? '#1A6A30' : isWrong ? '#9A2020' : '#2A2020', lineHeight: 1.4, flex: 1, textAlign: 'left' }}>
                        {option}
                      </div>
                      {(isCorrect || isWrong) && (
                        <div style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, marginRight: 10, background: isCorrect ? '#E0FFF0' : '#FFE0E0' }}>
                          {isCorrect ? '✅' : '❌'}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* CTA button */}
            <div style={{
              padding: '12px 16px 24px',
              borderTop: `1px solid ${answered && result === 'correct' ? '#C0F0D0' : answered && result === 'wrong' ? '#FFD0D0' : '#F0EDE8'}`,
              background: answered && result === 'correct' ? '#F0FFF4' : answered && result === 'wrong' ? '#FFF0F0' : 'white',
            }}>
              <button
                type="button"
                disabled={!pendingAnswer && !answered}
                onClick={answered ? handleNext : handleSubmit}
                style={{
                  width: '100%', padding: 16, borderRadius: 16, border: 'none',
                  cursor: (!pendingAnswer && !answered) ? 'not-allowed' : 'pointer',
                  fontFamily: "'Fredoka One',cursive", fontSize: 18,
                  background: !pendingAnswer && !answered
                    ? '#E8E0D8'
                    : answered
                    ? 'linear-gradient(180deg,#48D870,#28B050)'
                    : 'linear-gradient(180deg,#FFD040,#FFB020)',
                  color: !pendingAnswer && !answered ? '#A0988E' : answered ? 'white' : '#7A4000',
                  boxShadow: !pendingAnswer && !answered ? '0 4px 0 #D0C8C0' : answered ? '0 5px 0 #189030' : '0 5px 0 #CC8000',
                  border: !pendingAnswer && !answered ? '2px solid #D8D0C8' : answered ? '2px solid #20A040' : '2px solid #E8A010',
                  transition: 'background 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                }}
              >
                <span>
                  {answered
                    ? hasNextLesson ? 'Soal Berikutnya →' : 'Selesai! 🎉'
                    : pendingAnswer ? 'Cek Jawaban! ✓' : 'Pilih Jawaban Dulu'}
                </span>
              </button>
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
