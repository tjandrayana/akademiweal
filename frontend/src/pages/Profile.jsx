import { useState } from 'react'
import { BottomNav } from '../components/BottomNav'
import { useGamificationStats } from '../hooks/useGamificationStats'
import { getWeeklyXp } from '../lib/gamification'

const WEEK_DAYS = ['S', 'M', 'S', 'R', 'K', 'J', 'M']

function XPLineChart({ data }) {
  const W = 270
  const H = 72
  const PAD = 6
  const maxVal = Math.max(...data, 1)

  function pt(val, i) {
    const x = PAD + (i / (data.length - 1)) * (W - PAD * 2)
    const y = H - PAD - (val / maxVal) * (H - PAD * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }

  const lineD = data.map((v, i) => pt(v, i)).join(' L ')
  const hasAnyXp = data.some((v) => v > 0)

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      <polyline points={lineD} fill="none" stroke={hasAnyXp ? '#22C55E' : '#D1D5DB'} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((v, i) => {
        const [x, y] = pt(v, i).split(',').map(Number)
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="3.5"
            fill={v > 0 ? '#22C55E' : '#D1D5DB'}
            stroke="white"
            strokeWidth="1"
          />
        )
      })}
    </svg>
  )
}

export function Profile() {
  const { xp, streak, level, levelName, completedLessons } = useGamificationStats()
  const completedCount = completedLessons.size
  const weeklyXp = getWeeklyXp()

  const [shareToast, setShareToast] = useState(null)

  async function handleShare() {
    const text = `Aku sudah menyelesaikan ${completedCount} pelajaran dan kumpulkan ${xp} XP di AkademiWeal! 🐂`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'AkademiWeal', text, url: window.location.origin })
      } else {
        await navigator.clipboard.writeText(text)
        setShareToast('Teks disalin!')
        setTimeout(() => setShareToast(null), 2000)
      }
    } catch {
      /* user cancelled or share failed */
    }
  }

  return (
    <div className="flex flex-col min-h-svh max-w-md mx-auto bg-[#F9FAFB] pb-24">
      {shareToast && (
        <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-lg" role="status">
          {shareToast}
        </div>
      )}

      {/* Mascot header */}
      <div className="relative bg-gradient-to-b from-[#14532d] to-[#22C55E] pt-12 pb-8 flex flex-col items-center gap-2">
        <div
          className="flex h-24 w-24 items-center justify-center rounded-full bg-white/20 text-6xl leading-none shadow-lg border-4 border-white/30"
          aria-hidden="true"
        >
          🐂
        </div>
        <h1 className="m-0 text-xl font-extrabold text-white tracking-tight">Weal Learner</h1>
        <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold text-white">{levelName}</span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 divide-x divide-border bg-white border-b border-border">
        {[
          { label: 'Pelajaran', value: completedCount },
          { label: 'Total XP', value: xp.toLocaleString() },
          { label: 'Level', value: level },
        ].map(({ label, value }) => (
          <div key={label} className="flex flex-col items-center py-4 gap-0.5">
            <span className="text-xl font-extrabold text-text">{value}</span>
            <span className="text-[11px] text-muted font-semibold">{label}</span>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 px-4 pt-4 pb-2">
        <button
          type="button"
          disabled
          aria-disabled="true"
          title="Fitur sosial segera hadir"
          className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-300 text-sm font-bold cursor-not-allowed opacity-50"
        >
          Ikuti
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="flex-1 py-2.5 rounded-xl border-2 border-border text-muted text-sm font-bold transition-colors hover:bg-gray-50 active:bg-gray-100"
        >
          Bagikan
        </button>
      </div>

      {/* Streak card */}
      <div className="mx-4 mb-3 rounded-2xl bg-white border border-border p-4 flex items-center gap-3 shadow-sm">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-3xl leading-none" aria-hidden="true">
          🔥
        </div>
        <div>
          <p className="m-0 text-lg font-extrabold text-text">{streak} hari beruntun</p>
          <p className="m-0 text-xs text-muted">Streak aktif</p>
        </div>
        <div className="ml-auto flex items-center gap-0.5" aria-label={`${streak} hari`}>
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className={`h-6 w-1.5 rounded-full ${i < Math.min(streak, 7) ? 'bg-orange-400' : 'bg-gray-100'}`}
            />
          ))}
        </div>
      </div>

      {/* Weekly XP chart — real data */}
      <div className="mx-4 mb-4 rounded-2xl bg-white border border-border p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="m-0 text-sm font-bold text-text">XP Mingguan</p>
          <span className="flex items-center gap-1 text-[11px] text-muted">
            <span className="inline-block w-4 h-0.5 bg-primary rounded" />
            XP kamu
          </span>
        </div>
        <div className="flex justify-center">
          <XPLineChart data={weeklyXp} />
        </div>
        <div className="flex justify-between mt-2 px-1">
          {WEEK_DAYS.map((d, i) => (
            <span key={i} className="text-[10px] text-muted font-semibold w-8 text-center">{d}</span>
          ))}
        </div>
      </div>

      <p className="mx-4 text-xs text-muted text-center mb-4">Akun penuh dan pengaturan akan menyusul.</p>

      <BottomNav />
    </div>
  )
}
