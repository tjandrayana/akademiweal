import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAuthToken } from '../api/client'
import { pullAndPushXp } from '../api/progress'
import { fetchLessonsByLevel } from '../api/lessons'
import { BottomNav } from '../components/BottomNav'
import MapScreen from '../components/MapScreen'
import MascotEvolution from '../components/MascotEvolution'
import { useGamificationStats } from '../hooks/useGamificationStats'
import { getDisplayMascotEvolutionLevel, getLevelName } from '../lib/gamification'
import { storageKey } from '../lib/progressScope'
import { CURRICULUM_LEVELS, LEVELS_CACHE_KEY } from '../lib/curriculum'
import { computeLessonPathProgress, lessonForMapLevel } from '../lib/mapProgress'
import {
  ensureBackgroundMusicStarted,
  syncBackgroundMusicWithMute,
} from '../lib/backgroundMusic'
import { isMuted, playLevelStart, toggleMute } from '../lib/sounds'
import { GUEST_MAX_FREE_PATH_STEP, GUEST_UNLOCK_PATH, isLoggedIn } from '../lib/guestGate'

// ── HUD sub-components ────────────────────────────────────────

function MascotAvatar({ mascotEvolutionLevel }) {
  return (
    <Link
      to="/profile"
      aria-label="Buka profil dan maskot"
      style={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        border: '2.5px solid #FFB830',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        boxShadow: '0 0 14px rgba(255,184,48,0.45)',
        flexShrink: 0,
        background: 'linear-gradient(135deg,#FF8C30,#C05010)',
        textDecoration: 'none',
      }}
    >
      {/* render mascot slightly larger than the circle so the face fills it */}
      <div style={{ marginTop: -2, flexShrink: 0 }}>
        <MascotEvolution level={mascotEvolutionLevel} size={48} />
      </div>
    </Link>
  )
}

function HudLevelBadge({ levelName }) {
  return (
    <div
      style={{
        marginTop: 4,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 10,
        fontWeight: 900,
        letterSpacing: 1,
        background: 'linear-gradient(135deg,rgba(0,220,140,0.18),rgba(0,200,120,0.08))',
        border: '1px solid rgba(0,220,140,0.35)',
        borderRadius: 100,
        padding: '2px 9px',
        color: '#00DC8C',
        whiteSpace: 'nowrap',
      }}
    >
      ⚡ {levelName}
    </div>
  )
}

function HudCoins({ xp }) {
  return (
    <div
      aria-label={`${xp.toLocaleString()} XP`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: 'rgba(255,184,48,0.12)',
        border: '1.5px solid rgba(255,184,48,0.3)',
        borderRadius: 100,
        padding: '5px 12px',
        fontWeight: 800,
        fontSize: 14,
        color: '#FFB830',
        boxShadow: '0 0 8px rgba(255,184,48,0.15)',
      }}
    >
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: 'linear-gradient(135deg,#FFB830,#FF8C00)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          fontWeight: 900,
          color: '#7A4000',
          flexShrink: 0,
        }}
        aria-hidden="true"
      >
        $
      </div>
      {xp.toLocaleString()}
    </div>
  )
}

function HudHearts({ lives, maxLives = 3 }) {
  return (
    <div
      style={{ display: 'flex', gap: 2 }}
      aria-label={`${lives} nyawa tersisa`}
    >
      {[...Array(maxLives)].map((_, i) => (
        <span
          key={i}
          style={{ fontSize: 15, opacity: i < lives ? 1 : 0.2 }}
          aria-hidden="true"
        >
          ❤️
        </span>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────

export function Home() {
  const navigate = useNavigate()
  const { xp, levelName, completedLessons, lives } = useGamificationStats()

  const [lessonsByLevel, setLessonsByLevel] = useState(() => {
    try {
      const cached = localStorage.getItem(LEVELS_CACHE_KEY)
      if (cached) return JSON.parse(cached)
    } catch {
      /* ignore */
    }
    return {}
  })
  const [levelsLoading, setLevelsLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [muted, setMuted] = useState(() => isMuted())

  useEffect(() => {
    let cancelled = false
    async function loadAll() {
      try {
        const pairs = await Promise.all(
          CURRICULUM_LEVELS.map(async (lv) => {
            const data = await fetchLessonsByLevel(lv)
            return [lv, Array.isArray(data) ? data : []]
          }),
        )
        if (!cancelled) {
          const next = Object.fromEntries(pairs)
          setLessonsByLevel(next)
          try {
            localStorage.setItem(LEVELS_CACHE_KEY, JSON.stringify(next))
          } catch {
            /* ignore */
          }
        }
      } catch {
        /* leave lessonsByLevel as-is */
      } finally {
        if (!cancelled) setLevelsLoading(false)
      }
    }
    loadAll()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(t)
  }, [toast])

  useEffect(() => {
    if (!getAuthToken()) return
    pullAndPushXp().catch(() => {})
  }, [])

  const mapProgress = useMemo(
    () => computeLessonPathProgress(lessonsByLevel, completedLessons, CURRICULUM_LEVELS),
    [lessonsByLevel, completedLessons],
  )

  const displayMascotLevel = useMemo(
    () =>
      getDisplayMascotEvolutionLevel(
        xp,
        mapProgress.stepTotal > 0 ? mapProgress.stepCurrent : 1,
      ),
    [xp, mapProgress.stepCurrent, mapProgress.stepTotal],
  )

  const hudLevelLabel = useMemo(() => `⚡ ${getLevelName(xp)}`, [xp])

  function handleToggleMute() {
    const next = toggleMute()
    setMuted(next)
    if (!next) ensureBackgroundMusicStarted()
    syncBackgroundMusicWithMute()
  }

  const goToLesson = useCallback(
    (lessonId) => {
      const pathLevel = CURRICULUM_LEVELS.find((lv) =>
        (lessonsByLevel[lv] || []).some((l) => l.id === lessonId),
      )
      if (!pathLevel) return
      playLevelStart()
      navigate(`/lesson?level=${pathLevel}&lessonId=${lessonId}`)
    },
    [navigate, lessonsByLevel],
  )

  const handleMapPlayLevel = useCallback(
    (mapLevel) => {
      if (!isLoggedIn() && mapLevel > GUEST_MAX_FREE_PATH_STEP) {
        navigate(GUEST_UNLOCK_PATH, {
          state: { reason: 'guest_limit', from: { pathname: '/home' } },
        })
        return
      }
      const hit = lessonForMapLevel(mapLevel, lessonsByLevel, CURRICULUM_LEVELS)
      if (!hit) {
        setToast('Pelajaran untuk tahap ini belum tersedia.')
        return
      }
      goToLesson(hit.lesson.id)
    },
    [navigate, lessonsByLevel, goToLesson],
  )

  const goalLabel = useMemo(() => {
    try {
      const id = localStorage.getItem(storageKey('onboarding_goal'))
      if (!id) return null
      const labels = { zero: 'Belajar dari nol', start: 'Siap mulai investasi', more: 'Tambah pengetahuan' }
      return labels[id] ?? null
    } catch {
      return null
    }
  }, [])

  const flatCount = useMemo(
    () => CURRICULUM_LEVELS.reduce((n, lv) => n + (lessonsByLevel[lv]?.length || 0), 0),
    [lessonsByLevel],
  )

  return (
    <div className="flex flex-col min-h-svh" style={{ background: '#0F0A1E' }}>

      {/* ── Toast ── */}
      {toast && (
        <div
          role="status"
          style={{
            position: 'fixed', top: 56, left: '50%', transform: 'translateX(-50%)',
            zIndex: 50, maxWidth: 320, width: 'max-content',
            background: '#1A1030', border: '1px solid rgba(255,184,48,0.25)',
            borderRadius: 16, padding: '10px 18px',
            color: '#FFF8EC', fontSize: 13, fontWeight: 700,
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
          }}
        >
          {toast}
        </div>
      )}

      {/* ── HUD (top bar) ── */}
      <div
        style={{
          background: 'linear-gradient(180deg,rgba(15,10,30,0.98) 0%,rgba(15,10,30,0.94) 100%)',
          borderBottom: '2px solid rgba(255,184,48,0.15)',
          padding: '10px 16px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        {/* Left: mascot avatar + name + level */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <MascotAvatar mascotEvolutionLevel={displayMascotLevel} />
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontWeight: 900, fontSize: 16, color: '#FFF8EC',
                lineHeight: 1, whiteSpace: 'nowrap',
              }}
            >
              Investor
            </div>
            <HudLevelBadge levelName={levelName} />
          </div>
        </div>

        {/* Right: coins + hearts + mute */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <HudCoins xp={xp} />
          <HudHearts lives={lives} />
          <button
            type="button"
            onClick={handleToggleMute}
            aria-label={muted ? 'Aktifkan suara' : 'Matikan suara'}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 18, lineHeight: 1, padding: 4, borderRadius: 8,
            }}
          >
            {muted ? '🔕' : '🔊'}
          </button>
        </div>
      </div>

      {/* ── Map: fills remaining height; no vertical scroll on map ── */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden pb-20">
        {goalLabel && (
          <p
            className="shrink-0"
            style={{
              margin: 0, padding: '8px 16px 4px',
              fontSize: 11, fontWeight: 700, color: '#6A4A9A',
              letterSpacing: '0.5px',
            }}
          >
            Fokus: {goalLabel}
          </p>
        )}

        <div className="flex-1 flex flex-col min-h-0 px-3 pt-1 pb-0">
          {levelsLoading ? (
            <div
              role="status"
              style={{ textAlign: 'center', padding: '80px 0', color: '#6A4A9A', fontSize: 14, fontWeight: 700 }}
            >
              Memuat peta…
            </div>
          ) : flatCount === 0 ? (
            <div
              style={{ textAlign: 'center', padding: '80px 16px', color: '#6A4A9A', fontSize: 14, lineHeight: 1.6 }}
            >
              Belum ada pelajaran. Periksa koneksi dan coba buka ulang halaman.
            </div>
          ) : (
            <MapScreen
              className="min-h-0 flex-1"
              hideGameNav
              hideHud
              progress={mapProgress}
              stepCurrent={mapProgress.stepCurrent}
              stepTotal={mapProgress.stepTotal}
              playerName="Weal Learner"
              hudLevelLabel={hudLevelLabel}
              coinsDisplay={xp.toLocaleString()}
              lives={lives}
              mascotEvolutionLevel={displayMascotLevel}
              guestMaxPathStep={isLoggedIn() ? null : GUEST_MAX_FREE_PATH_STEP}
              onPlayLevel={handleMapPlayLevel}
            />
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
