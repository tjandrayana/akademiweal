import { useEffect } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { addXp, recordDailyStreak } from '../lib/gamification'
import { Button } from '../components/Button'
import { XPDisplay } from '../components/XPDisplay'
import { useGamificationStats } from '../hooks/useGamificationStats'
import { playCelebration, playNavigate } from '../lib/sounds'

function encouragementMessage(correct, total) {
  if (total === 0) return 'Terus belajar, setiap langkah itu berarti.'
  const ratio = correct / total
  if (ratio >= 1)   return 'Sempurna! Kamu kuasai semua materi hari ini!'
  if (ratio >= 0.5) return 'Bagus! Sedikit lagi kamu makin jago 💪'
  return 'Latihan bikin paham — tetap semangat ya! 📚'
}

function isValidResultState(s) {
  return (
    s != null &&
    typeof s.xp === 'number' &&
    typeof s.correct === 'number' &&
    typeof s.total === 'number' &&
    s.total >= 1 &&
    s.xp >= 0 &&
    s.correct >= 0 &&
    s.correct <= s.total
  )
}

/**
 * Post-session result: celebratory success screen.
 * Expects `{ xp, correct, total }` from `navigate('/result', { state })` after a lesson run.
 */
export function Result() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { streak } = useGamificationStats()

  if (!isValidResultState(state)) {
    return <Navigate to="/home" replace />
  }

  const { xp, correct, total } = state
  const msg = encouragementMessage(correct, total)
  const stars = correct === total ? 3 : correct / total >= 0.5 ? 2 : 1
  const isPerfect = stars === 3

  // For perfect score, layer an extra fanfare on top of playComplete() from Lesson
  useEffect(() => {
    if (!isPerfect) return
    const id = setTimeout(() => playCelebration(), 320)
    return () => clearTimeout(id)
  }, [isPerfect])

  function handleContinue() {
    playNavigate()
    recordDailyStreak()
    addXp(xp)
    navigate('/home', { replace: true })
  }

  return (
    <div className="flex min-h-svh flex-col overflow-hidden">

      {/* ── ZONE 1: Celebration hero ── */}
      <div
        className="relative shrink-0 flex flex-col items-center justify-end pb-16 pt-10 px-6"
        style={{
          background: isPerfect
            ? 'linear-gradient(180deg, #14532d 0%, #16A34A 55%, #22C55E 100%)'
            : 'linear-gradient(180deg, #1d4ed8 0%, #2563EB 55%, #3B82F6 100%)',
          minHeight: 260,
        }}
      >
        {/* Confetti dots — decorative */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          {[
            { top: 16, left: 32,  emoji: '⭐' },
            { top: 24, right: 40, emoji: '✨' },
            { top: 48, left: '33%', emoji: '🌟' },
            { top: 12, right: '33%', emoji: '💫' },
            { top: 32, left: '50%', emoji: '⭐' },
          ].map((conf, i) => (
            <span
              key={i}
              className="absolute text-lg animate-confetti-drift"
              style={{ top: conf.top, left: conf.left, right: conf.right, animationDelay: `${i * 0.15}s`, animationDuration: '1.4s' }}
            >
              {conf.emoji}
            </span>
          ))}
        </div>

        {/* Stars row */}
        <div className="flex items-center justify-center gap-3 mb-4" aria-label={`${stars} dari 3 bintang`}>
          {[1, 2, 3].map((s, i) => (
            <span
              key={s}
              className="text-4xl leading-none"
              style={{
                animationDelay: `${i * 180}ms`,
                animation: s <= stars
                  ? 'star-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) both'
                  : 'none',
                filter: s <= stars ? 'none' : 'grayscale(1) opacity(0.25)',
                display: 'block',
              }}
              aria-hidden="true"
            >
              ⭐
            </span>
          ))}
        </div>

        {/* Mascot in styled card */}
        <div
          className="flex h-28 w-28 items-center justify-center rounded-[2rem] bg-white/20 border-4 border-white/40 shadow-2xl text-[72px] leading-none animate-mascot-bounce"
          aria-hidden="true"
          style={{ backdropFilter: 'blur(4px)' }}
        >
          {isPerfect ? '🏆' : '🐂'}
        </div>

        {/* Level complete badge */}
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 border border-white/30 px-4 py-1.5">
          <span className="text-sm leading-none" aria-hidden="true">🎉</span>
          <span className="text-sm font-extrabold text-white tracking-wide">
            {isPerfect ? 'Sempurna!' : 'Level Selesai!'}
          </span>
        </div>
      </div>

      {/* ── ZONE 2: White stats card ── */}
      <div
        className="relative z-10 -mt-5 flex flex-1 flex-col rounded-t-[28px] bg-white overflow-hidden"
        style={{ boxShadow: '0 -6px 24px rgba(0,0,0,0.10)' }}
      >
        <div className="flex flex-col gap-4 px-5 pt-6 pb-4 flex-1">

          {/* XP reward — hero stat */}
          <div className="flex flex-col items-center justify-center rounded-2xl bg-yellow-50 border border-yellow-100 py-5 gap-1 animate-lesson-feedback">
            <p className="m-0 text-xs font-bold uppercase tracking-wider text-yellow-600">⭐ XP Didapat</p>
            <XPDisplay xp={xp} />
            <p className="m-0 text-xs text-yellow-600 font-semibold">ditambahkan ke akunmu</p>
          </div>

          {/* Stats row: score + streak */}
          <div className="grid grid-cols-2 gap-3">
            {/* Accuracy */}
            <div className="flex flex-col items-center justify-center rounded-2xl bg-green-50 border border-green-100 py-4 gap-0.5">
              <span className="text-2xl font-extrabold text-green-700 tabular-nums">
                {correct}/{total}
              </span>
              <span className="text-xs font-semibold text-green-600">Jawaban Benar</span>
            </div>

            {/* Streak */}
            <div className="flex flex-col items-center justify-center rounded-2xl bg-orange-50 border border-orange-100 py-4 gap-0.5">
              <div className="flex items-center gap-1">
                <span className="text-xl leading-none" aria-hidden="true">🔥</span>
                <span className="text-2xl font-extrabold text-orange-600 tabular-nums">
                  {streak > 0 ? streak : 1}
                </span>
              </div>
              <span className="text-xs font-semibold text-orange-500">Hari Streak</span>
            </div>
          </div>

          {/* Encouragement */}
          <p className="m-0 text-center text-sm leading-relaxed text-muted px-2">
            {msg}
          </p>

          <div className="flex-1" />

        </div>

        {/* CTA anchored to bottom */}
        <div className="px-5 pb-8 pt-2 border-t border-gray-100">
          <Button
            type="button"
            variant="primary"
            className="w-full font-extrabold text-base tracking-wide"
            onClick={handleContinue}
          >
            Lanjut Belajar →
          </Button>
        </div>
      </div>
    </div>
  )
}
