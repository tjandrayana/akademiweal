import { useEffect } from 'react'
import { Navigate, useLocation, useNavigate, Link } from 'react-router-dom'
import { syncXpTotal } from '../api/progress'
import { addXp, getTotalXp, getMascotEvolutionLevel, recordDailyStreak, resetLives } from '../lib/gamification'
import { storageKey } from '../lib/progressScope'
import MascotEvolution, { getMascotByLevel } from '../components/MascotEvolution'
import { Button } from '../components/Button'
import { XPDisplay } from '../components/XPDisplay'
import { useGamificationStats } from '../hooks/useGamificationStats'
import { playCelebration, playNavigate } from '../lib/sounds'

// Zone → Feed stock bridge: maps each zone to the most relevant stock in Feed
const ZONE_FEED_BRIDGE = {
  1:  { code: 'BBCA', reason: 'Lihat kepemilikan nyata saham perbankan terbesar RI' },
  2:  { code: 'BBRI', reason: 'Laporan keuangan BBRI — contoh nyata konsep yang baru kamu pelajari' },
  3:  { code: 'GOTO', reason: 'GoTo — sentimen pasar bergerak cepat, cocok untuk latihan psikologi trading' },
  4:  { code: 'BBCA', reason: 'Harga BBCA sensitif terhadap suku bunga BI — saham dan obligasi terhubung' },
  5:  { code: 'BBRI', reason: 'BBRI termasuk dalam banyak ETF IDX30 dan LQ45' },
  6:  { code: 'TLKM', reason: 'Telkom rutin bagi dividen — cek dividend yield-nya hari ini' },
  7:  { code: 'GOTO', reason: 'GoTo — volatilitas tinggi mirip aset kripto, cocok pelajari risiko' },
  8:  { code: 'TLKM', reason: 'Telkom cocok jadi anchor portofolio defensif jangka panjang' },
  9:  { code: 'BBCA', reason: 'BBCA sering jadi pilihan utama strategi portofolio konservatif' },
  10: { code: 'BBRI', reason: 'BBRI + BBCA — contoh klasik diversifikasi portofolio perbankan' },
}

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

  const { xp, correct, total, zone } = state
  const msg = encouragementMessage(correct, total)
  const stars = correct === total ? 3 : correct / total >= 0.5 ? 2 : 1
  const isPerfect = stars === 3

  // Preview tier-up before addXp — no side effects at render time
  const currentXp = getTotalXp()
  const currentTier = getMascotByLevel(getMascotEvolutionLevel(currentXp))
  const nextTier = getMascotByLevel(getMascotEvolutionLevel(currentXp + xp))
  const celebKey = storageKey('last_celebrated_mascot_tier')
  const lastCelebrated = (() => { try { return localStorage.getItem(celebKey) } catch { return null } })()
  const hasTierUp = nextTier.name !== currentTier.name && nextTier.name !== lastCelebrated

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
    const newXp = getTotalXp()
    resetLives()
    syncXpTotal(newXp).catch(() => {})
    if (hasTierUp) {
      try { localStorage.setItem(celebKey, nextTier.name) } catch { /* ignore */ }
    }
    navigate('/home', { replace: true })
  }

  return (
    <div className="flex min-h-svh flex-col overflow-hidden">

      {/* ── ZONE 1: Hero — tier-up evolution OR normal celebration ── */}
      <div
        className="relative shrink-0 flex flex-col items-center justify-end pb-16 pt-10 px-6"
        style={{
          background: hasTierUp
            ? `linear-gradient(160deg, #06112a 0%, #0b1c44 50%, ${nextTier.color}22 100%)`
            : isPerfect
              ? 'linear-gradient(180deg, var(--color-iq-navy) 0%, var(--color-primary-dark) 44%, var(--color-primary) 100%)'
              : 'linear-gradient(180deg, var(--color-iq-navy-mid) 0%, var(--color-iq-teal-dark) 42%, var(--color-primary) 100%)',
          minHeight: 260,
        }}
      >
        {/* Confetti / sparkles */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          {(hasTierUp
            ? [{ top: '8%', left: '12%', e: '✨', d: '0s' }, { top: '14%', right: '10%', e: '⭐', d: '0.2s' }, { top: '28%', left: '6%', e: '💫', d: '0.4s' }, { top: '18%', right: '18%', e: '✨', d: '0.6s' }]
            : [{ top: 16, left: 32, e: '⭐', d: '0s' }, { top: 24, right: 40, e: '✨', d: '0.15s' }, { top: 48, left: '33%', e: '🌟', d: '0.3s' }, { top: 12, right: '33%', e: '💫', d: '0.45s' }, { top: 32, left: '50%', e: '⭐', d: '0.6s' }]
          ).map((c, i) => (
            <span
              key={i}
              className={`absolute text-lg ${hasTierUp ? 'animate-sparkle' : 'animate-confetti-drift'}`}
              style={{ top: c.top, left: c.left, right: c.right, animationDelay: c.d, animationDuration: hasTierUp ? '0.7s' : '1.4s' }}
            >
              {c.e}
            </span>
          ))}
        </div>

        {hasTierUp ? (
          /* ── Mascot evolution reveal ── */
          <>
            <div style={{
              background: `linear-gradient(90deg, ${nextTier.tierColor}, ${nextTier.color})`,
              borderRadius: 100, padding: '4px 16px', marginBottom: 12,
              fontFamily: "'Fredoka One',cursive", fontSize: 11, fontWeight: 900,
              letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(0,0,0,0.75)',
            }}>
              ✨ Maskot Berevolusi!
            </div>
            <div style={{
              borderRadius: 24, overflow: 'hidden',
              background: `linear-gradient(180deg, ${nextTier.color}40 0%, rgba(6,17,42,0.97) 60%)`,
              border: `3px solid ${nextTier.tierColor}`,
              boxShadow: `0 0 0 5px ${nextTier.tierColor}28, 0 12px 40px rgba(0,0,0,0.7)`,
              animation: nextTier.anim, marginBottom: 10,
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 20px 6px' }}>
                <MascotEvolution level={nextTier.minLevel} size={100} />
              </div>
              <div style={{
                background: `linear-gradient(90deg, ${nextTier.tierColor}, ${nextTier.color})`,
                textAlign: 'center', fontSize: 9, fontWeight: 900,
                letterSpacing: '2px', color: 'rgba(0,0,0,0.75)',
                padding: '5px', textTransform: 'uppercase',
              }}>
                {nextTier.tier} · {nextTier.name}
              </div>
            </div>
            <p style={{ margin: '0 0 2px', fontFamily: "'Fredoka One',cursive", fontSize: 24, color: 'white', textAlign: 'center' }}>
              {nextTier.name}
            </p>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: nextTier.tierColor, letterSpacing: '1px', textTransform: 'uppercase' }}>
              {nextTier.species}
            </p>
          </>
        ) : (
          /* ── Normal completion ── */
          <>
            <div className="flex items-center justify-center gap-3 mb-4" aria-label={`${stars} dari 3 bintang`}>
              {[1, 2, 3].map((s, i) => (
                <span
                  key={s}
                  className="text-4xl leading-none"
                  style={{
                    animationDelay: `${i * 180}ms`,
                    animation: s <= stars ? 'star-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) both' : 'none',
                    filter: s <= stars ? 'none' : 'grayscale(1) opacity(0.25)',
                    display: 'block',
                  }}
                  aria-hidden="true"
                >
                  ⭐
                </span>
              ))}
            </div>
            <div
              className="flex h-28 w-28 items-center justify-center rounded-[2rem] bg-white/20 border-4 border-white/40 shadow-2xl text-[72px] leading-none animate-mascot-bounce"
              aria-hidden="true"
              style={{ backdropFilter: 'blur(4px)' }}
            >
              {isPerfect ? '🏆' : '🐂'}
            </div>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 border border-white/30 px-4 py-1.5">
              <span className="text-sm leading-none" aria-hidden="true">🎉</span>
              <span className="text-sm font-extrabold text-white tracking-wide">
                {isPerfect ? 'Sempurna!' : 'Level Selesai!'}
              </span>
            </div>
          </>
        )}
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
        <div className="px-5 pb-8 pt-2 border-t border-gray-100 flex flex-col gap-3">
          {/* Feed bridge — contextual link to a relevant stock */}
          {zone && ZONE_FEED_BRIDGE[zone] && (() => {
            const { code, reason } = ZONE_FEED_BRIDGE[zone]
            return (
              <Link
                to={`/stocks/${code.toLowerCase()}`}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', borderRadius: 12, textDecoration: 'none',
                  background: '#F5FDF8', border: '1.5px solid #B0EFC0',
                }}
              >
                <div>
                  <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase', color: '#1A7040', margin: 0, marginBottom: 2 }}>
                    📈 Lihat di Feed
                  </p>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#1A2030', margin: 0 }}>
                    {code} — {reason}
                  </p>
                </div>
                <span style={{ fontSize: 18, marginLeft: 8 }}>→</span>
              </Link>
            )
          })()}

          <Button
            type="button"
            variant="primary"
            className="w-full font-extrabold text-base tracking-wide"
            onClick={handleContinue}
          >
            {hasTierUp ? 'Kembali ke Peta 🗺️' : 'Lanjut Belajar →'}
          </Button>
        </div>
      </div>
    </div>
  )
}
