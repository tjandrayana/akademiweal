import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AppHeader,
  AppHeaderBrandTitle,
  HeaderHomeIcon,
  HeaderShareIcon,
} from '../components/AppHeader'
import { BottomNav } from '../components/BottomNav'
import MascotEvolution, { getMascotByLevel } from '../components/MascotEvolution'
import { MascotEvolutionTimeline } from '../components/profile/MascotEvolutionTimeline'
import { MascotTierDetailPanel } from '../components/profile/MascotTierDetailPanel'
import { ProfileMascotDecor } from '../components/profile/ProfileMascotDecor'
import '../components/profile/profile-investquest.css'
import { useGamificationStats } from '../hooks/useGamificationStats'
import { getWeeklyXp } from '../lib/gamification'

const WEEK_DAYS = ['S', 'M', 'S', 'R', 'K', 'J', 'M']

/** Progress within current mascot tier (0–100). */
function tierProgressPct(level, mascot) {
  if (mascot.maxLevel === Infinity) {
    return Math.min(100, Math.max(0, ((level - mascot.minLevel) / 45) * 100))
  }
  const range = mascot.maxLevel - mascot.minLevel + 1
  const pos = Math.min(range, Math.max(1, level - mascot.minLevel + 1))
  return Math.min(100, (pos / range) * 100)
}

function XPLineChart({ data }) {
  const W = 270
  const H = 72
  const PAD = 6
  const maxVal = Math.max(...data, 1)

  const xDenom = Math.max(1, data.length - 1)

  function pt(val, i) {
    const x = PAD + (i / xDenom) * (W - PAD * 2)
    const y = H - PAD - (val / maxVal) * (H - PAD * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }

  /* <polyline points> = space-separated "x,y" pairs — not path "M/L" syntax */
  const lineD = data.map((v, i) => pt(v, i)).join(' ')
  const hasAnyXp = data.some((v) => v > 0)

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      aria-hidden="true"
      className={hasAnyXp ? 'text-iq-teal' : 'text-gray-300'}
    >
      <polyline
        points={lineD}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {data.map((v, i) => {
        const [x, y] = pt(v, i).split(',').map(Number)
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="3.5"
            fill={v > 0 ? 'currentColor' : '#D1D5DB'}
            stroke="white"
            strokeWidth="1"
          />
        )
      })}
    </svg>
  )
}

export function Profile() {
  const {
    xp,
    streak,
    level,
    levelName,
    completedLessons,
    mascotEvolutionLevel,
    xpForNext,
    xpInLevel,
  } = useGamificationStats()
  const completedCount = completedLessons.size
  const weeklyXp = getWeeklyXp()

  const mascot = useMemo(() => getMascotByLevel(mascotEvolutionLevel), [mascotEvolutionLevel])
  const tierPct = useMemo(
    () => tierProgressPct(mascotEvolutionLevel, mascot),
    [mascotEvolutionLevel, mascot],
  )
  const levelXpPct =
    xpForNext > 0 ? Math.min(100, Math.round((xpInLevel / xpForNext) * 1000) / 10) : 100
  const streakWeekPct = Math.min(100, (Math.min(streak, 7) / 7) * 100)

  const [shareToast, setShareToast] = useState(null)
  const [tierDetailIndex, setTierDetailIndex] = useState(null)

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
    <div className="profile-iq flex flex-col min-h-svh max-w-md mx-auto bg-iq-navy pb-24">
      {shareToast && (
        <div
          className="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-lg"
          role="status"
        >
          {shareToast}
        </div>
      )}

      <MascotTierDetailPanel
        open={tierDetailIndex != null}
        tierIndex={tierDetailIndex}
        onClose={() => setTierDetailIndex(null)}
        mascotEvolutionLevel={mascotEvolutionLevel}
      />

      <AppHeader
        mode="profile"
        variant="dark"
        left={
          <Link
            to="/home"
            className="flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/10"
            aria-label="Kembali ke beranda"
          >
            <HeaderHomeIcon />
          </Link>
        }
        center={<AppHeaderBrandTitle dark />}
        right={
          <button
            type="button"
            onClick={handleShare}
            className="flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/10"
            aria-label="Bagikan profil"
          >
            <HeaderShareIcon />
          </button>
        }
      />

      <div className="bg-iq-navy px-4 pb-4 pt-1 text-center">
        <p className="profile-iq-sub m-0">Profil &amp; evolusi maskot</p>
        <span className="profile-iq-tag mt-2 inline-block">InvestQuest × Weal</span>
      </div>

      <section className="profile-iq-stage-wrap" aria-labelledby="profile-mascot-heading">
        <div className="profile-iq-stage">
          <ProfileMascotDecor />
          <div className="profile-iq-stage-inner">
            <h2 id="profile-mascot-heading" className="sr-only">
              Maskot kamu
            </h2>
            <MascotEvolution
              level={mascotEvolutionLevel}
              size={196}
              showLabel={false}
              showQuote={false}
              showPerks={false}
              className="drop-shadow-[0_12px_32px_rgba(0,0,0,0.35)]"
            />
            <div>
              <p className="profile-iq-char-name m-0">{mascot.name}</p>
              <p className="profile-iq-char-sub m-0">
                {mascot.tier} · {levelName}
              </p>
              <p className="profile-iq-char-desc m-0">{mascot.species}</p>
            </div>

            <div className="w-full max-w-[300px] space-y-3">
              <div>
                <p className="profile-iq-stat-label m-0">Progres dalam tier maskot</p>
                <div className="profile-iq-stat-bar">
                  <div className="profile-iq-stat-fill-gold" style={{ width: `${tierPct}%` }} />
                </div>
              </div>
              <div>
                <p className="profile-iq-stat-label m-0">XP menuju level berikutnya</p>
                <div className="profile-iq-stat-bar">
                  <div className="profile-iq-stat-fill-teal" style={{ width: `${levelXpPct}%` }} />
                </div>
                <p className="m-0 mt-1 text-center text-[11px] font-semibold text-iq-muted-blue">
                  {xpInLevel.toLocaleString()} / {xpForNext.toLocaleString()} XP
                </p>
              </div>
              <div>
                <p className="profile-iq-stat-label m-0">Streak minggu ini</p>
                <div className="profile-iq-stat-bar">
                  <div className="profile-iq-stat-fill-teal" style={{ width: `${streakWeekPct}%` }} />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <MascotEvolutionTimeline
        mascotEvolutionLevel={mascotEvolutionLevel}
        onSelectTier={(i) => setTierDetailIndex(i)}
      />

      <section className="profile-iq-detail" aria-labelledby="profile-quote-heading">
        <h3 id="profile-quote-heading" className="sr-only">
          Kutipan &amp; kemampuan
        </h3>
        <blockquote className="profile-iq-quote">&ldquo;{mascot.quote}&rdquo;</blockquote>
        <p className="profile-iq-perks-label m-0">Kemampuan aktif</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {mascot.perks.map((perk) => (
            <span key={perk} className="profile-iq-perk-pill">
              {perk}
            </span>
          ))}
        </div>
      </section>

      <div className="profile-iq-light flex flex-col gap-3 px-4 pt-2 pb-4">
        <div className="grid grid-cols-3 divide-x divide-gray-200 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {[
            { label: 'Pelajaran', value: completedCount },
            { label: 'Total XP', value: xp.toLocaleString() },
            { label: 'Level', value: level },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center py-4 gap-0.5">
              <span className="text-xl font-extrabold text-gray-900">{value}</span>
              <span className="text-[11px] text-gray-500 font-semibold">{label}</span>
            </div>
          ))}
        </div>

        <button
          type="button"
          disabled
          aria-disabled="true"
          title="Fitur sosial segera hadir"
          className="w-full py-2.5 rounded-xl border-2 border-gray-200 text-gray-300 text-sm font-bold cursor-not-allowed opacity-50 bg-white"
        >
          Ikuti
        </button>

        <div className="rounded-2xl bg-white border border-gray-200 p-4 flex items-center gap-3 shadow-sm">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-3xl leading-none"
            aria-hidden="true"
          >
            🔥
          </div>
          <div>
            <p className="m-0 text-lg font-extrabold text-gray-900">{streak} hari beruntun</p>
            <p className="m-0 text-xs text-gray-500">Streak aktif</p>
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

        <div className="rounded-2xl bg-white border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="m-0 text-sm font-bold text-gray-900">XP Mingguan</p>
            <span className="flex items-center gap-1 text-[11px] text-gray-500">
              <span className="inline-block w-4 h-0.5 bg-iq-teal rounded" />
              XP kamu
            </span>
          </div>
          <div className="flex justify-center">
            <XPLineChart data={weeklyXp} />
          </div>
          <div className="flex justify-between mt-2 px-1">
            {WEEK_DAYS.map((d, i) => (
              <span key={i} className="text-[10px] text-gray-500 font-semibold w-8 text-center">
                {d}
              </span>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-500 text-center mb-2">
          Akun penuh dan pengaturan akan menyusul.
        </p>
      </div>

      <BottomNav />
    </div>
  )
}
