import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchLessonsByLevels } from '../api/lessons'
import {
  AppHeader,
  HeaderHomeIcon,
  HeaderProfileIcon,
} from '../components/AppHeader'
import { BottomNav } from '../components/BottomNav'
import '../components/profile/profile-akademiweal.css'
import { useGamificationStats } from '../hooks/useGamificationStats'
import {
  AKADEMI_ZONE_SHORT,
  CURRICULUM_LEVELS,
  LEVELS_CACHE_KEY,
} from '../lib/curriculum'
import { cn } from '../lib/cn'
import { getStarsForLesson } from '../lib/gamification'
import {
  computeLessonPathProgress,
  flattenLessonsInOrder,
  lessonForMapLevel,
  lessonStepOnPathStatus,
} from '../lib/mapProgress'
import { playLevelStart } from '../lib/sounds'

/** Same zone icons as the map — quick visual anchor */
const ZONE_EMOJI = ['🌱', '🏜', '🏙', '🌊', '🏛', '🌿', '🏔', '🐉']

/**
 * Pelajaran-only header gold line under AppHeader.
 * - subtle: whisper of gold (default)
 * - balanced: previous default
 * - strong: bold HUD, closest to “arcade” map chrome
 */
const PELAJARAN_HEADER_HUD_INTENSITY = 'subtle'

const PELAJARAN_HEADER_HUD_CLASS =
  {
    subtle: 'pelajaran-iq-header-hud--subtle',
    balanced: 'pelajaran-iq-header-hud--balanced',
    strong: 'pelajaran-iq-header-hud--strong',
  }[PELAJARAN_HEADER_HUD_INTENSITY] ?? 'pelajaran-iq-header-hud--subtle'

function PelajaranHeaderTitle() {
  return (
    <div className="flex flex-col items-center gap-0.5 px-1">
      <span
        className="text-[15px] font-extrabold tracking-tight"
        style={{
          background:
            'linear-gradient(135deg, var(--color-iq-gold-soft), var(--color-iq-gold-bright), var(--color-iq-gold-deep))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        Pelajaran
      </span>
      <span
        className="h-0.5 w-10 shrink-0 rounded-full bg-gradient-to-r from-iq-gold-bright/0 via-iq-teal/90 to-iq-gold-bright/0"
        aria-hidden="true"
      />
    </div>
  )
}

function StarsRow({ count }) {
  const n = Math.min(3, Math.max(0, count))
  return (
    <span className="text-[11px] tracking-tight" aria-label={`${n} dari 3 bintang`}>
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={i <= n ? 'text-[color:var(--color-iq-gold-bright)]' : 'text-[#4a4068]'}
        >
          ★
        </span>
      ))}
    </span>
  )
}

export function Pelajaran() {
  const navigate = useNavigate()
  const { completedLessons } = useGamificationStats()

  const [lessonsByLevel, setLessonsByLevel] = useState(() => {
    try {
      const cached = localStorage.getItem(LEVELS_CACHE_KEY)
      if (cached) return JSON.parse(cached)
    } catch {
      /* ignore */
    }
    return {}
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await fetchLessonsByLevels(CURRICULUM_LEVELS)
        if (!cancelled && data && typeof data === 'object') {
          const next = {}
          for (const lv of CURRICULUM_LEVELS) {
            const key = String(lv)
            next[lv] = Array.isArray(data[key]) ? data[key] : []
          }
          setLessonsByLevel(next)
          try {
            localStorage.setItem(LEVELS_CACHE_KEY, JSON.stringify(next))
          } catch {
            /* ignore */
          }
        }
      } catch {
        /* keep cache */
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const mapProgress = useMemo(
    () => computeLessonPathProgress(lessonsByLevel, completedLessons, CURRICULUM_LEVELS),
    [lessonsByLevel, completedLessons],
  )

  const flatLessons = useMemo(
    () => flattenLessonsInOrder(lessonsByLevel, CURRICULUM_LEVELS),
    [lessonsByLevel],
  )

  const totalLessons = flatLessons.length
  const doneCount = useMemo(() => {
    if (totalLessons === 0) return 0
    return flatLessons.filter((l) => completedLessons.has(l.id)).length
  }, [flatLessons, completedLessons, totalLessons])

  const continueHit = useMemo(() => {
    if (!totalLessons || mapProgress.allComplete) return null
    return lessonForMapLevel(mapProgress.stepCurrent, lessonsByLevel, CURRICULUM_LEVELS)
  }, [lessonsByLevel, mapProgress, totalLessons])

  const activeZone = continueHit?.pathLevel ?? 1

  const pathProgressPct =
    totalLessons > 0 ? Math.min(100, Math.round((doneCount / totalLessons) * 100)) : 0

  const activeZoneLabel = AKADEMI_ZONE_SHORT[activeZone] ?? `Zona ${activeZone}`

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

  const pathStepIndex = useCallback(
    (lessonId) => {
      const idx = flatLessons.findIndex((l) => l.id === lessonId)
      return idx >= 0 ? idx + 1 : 0
    },
    [flatLessons],
  )

  function renderContinueHero() {
    if (loading) {
      return (
        <div className="pelajaran-iq-continue-inner py-2">
          <p className="m-0 text-sm font-semibold text-iq-slate" role="status">
            Memuat kurikulum…
          </p>
        </div>
      )
    }
    if (!totalLessons) {
      return (
        <div className="pelajaran-iq-continue-inner py-2">
          <p className="m-0 text-sm leading-relaxed text-iq-slate">
            Belum ada data pelajaran. Periksa koneksi lalu buka ulang halaman.
          </p>
        </div>
      )
    }
    if (mapProgress.allComplete) {
      return (
        <div className="pelajaran-iq-continue-inner py-2">
          <p className="m-0 text-4xl" aria-hidden="true">
            🎉
          </p>
          <p className="profile-iq-char-name m-0 mt-3 text-[clamp(1.5rem,5vw,1.85rem)]">Semua zona selesai!</p>
          <p className="pelajaran-iq-continue-zone m-0 mt-2 max-w-[260px] mx-auto">
            Ulangi pelajaran kapan saja dari daftar di bawah — perjalanan AkademiWeal milikmu.
          </p>
        </div>
      )
    }
    if (!continueHit) return null
    return (
      <div className="pelajaran-iq-continue-inner py-1">
        <span className="pelajaran-iq-continue-badge">
          Langkah {mapProgress.stepCurrent} / {mapProgress.stepTotal}
        </span>
        <p className="pelajaran-iq-continue-title px-1">{continueHit.lesson.title}</p>
        <p className="pelajaran-iq-continue-zone">
          {ZONE_EMOJI[continueHit.pathLevel - 1] ?? '📚'}{' '}
          {AKADEMI_ZONE_SHORT[continueHit.pathLevel] ?? `Level ${continueHit.pathLevel}`}
        </p>
        <button
          type="button"
          onClick={() => goToLesson(continueHit.lesson.id)}
          className="pelajaran-iq-cta mx-auto"
        >
          Lanjutkan perjalanan →
        </button>
      </div>
    )
  }

  return (
    <div className="profile-iq akademiweal-page-shell flex min-h-svh flex-col max-w-md mx-auto pb-24">
      <AppHeader
        mode="profile"
        variant="dark"
        className={cn('akademiweal-header', PELAJARAN_HEADER_HUD_CLASS)}
        left={
          <Link
            to="/home"
            className="flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/10"
            aria-label="Beranda"
          >
            <HeaderHomeIcon className="text-white/90" />
          </Link>
        }
        center={<PelajaranHeaderTitle />}
        right={
          <Link
            to="/profile"
            className="flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/10"
            aria-label="Profil"
          >
            <HeaderProfileIcon className="text-white/90" />
          </Link>
        }
      />

      <div className="shrink-0 px-4 pb-3 pt-1 text-center">
        <p className="profile-iq-sub m-0">Kurikulum &amp; jalur langkah</p>
        <span className="profile-iq-tag mt-2 inline-block">AkademiWeal</span>
      </div>

      <section className="profile-iq-stage-wrap pt-0 pb-4" aria-labelledby="pelajaran-lanjut-heading">
        <h2 id="pelajaran-lanjut-heading" className="sr-only">
          Lanjut belajar
        </h2>
        <div className="profile-iq-stage">{renderContinueHero()}</div>
      </section>

      <div className="akademiweal-page-scroll flex flex-1 flex-col gap-5">
        <section aria-labelledby="pelajaran-jalur-heading" className="pelajaran-iq-progress-card">
          <h2
            id="pelajaran-jalur-heading"
            className="profile-iq-stat-label m-0 text-[#7b95c8]"
          >
            Progres kurikulum
          </h2>
          {loading ? (
            <p className="m-0 mt-2 text-xs text-[#a0bee8]">Memuat…</p>
          ) : !totalLessons ? (
            <p className="m-0 mt-2 text-xs text-[#a0bee8]">Belum ada data langkah.</p>
          ) : (
            <>
              <div className="mt-3 flex items-start gap-3">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/25 to-orange-500/15 text-2xl shadow-inner ring-1 ring-amber-400/25"
                  aria-hidden="true"
                >
                  📚
                </div>
                <div className="min-w-0 flex-1">
                  <p className="m-0 text-base font-extrabold leading-snug text-[#FFF8EC] tabular-nums">
                    {doneCount}/{totalLessons} pelajaran selesai
                  </p>
                  <p className="m-0 mt-1 text-xs font-semibold text-[#a0bee8]">
                    {mapProgress.allComplete ? 'Semua zona terbuka' : `Fokus: ${activeZoneLabel}`}
                  </p>
                </div>
              </div>
              <div className="profile-iq-stat-bar mt-4" role="progressbar" aria-valuenow={pathProgressPct} aria-valuemin={0} aria-valuemax={100} aria-label={`Progres kurikulum ${pathProgressPct} persen`}>
                <div className="profile-iq-stat-fill-teal" style={{ width: `${pathProgressPct}%` }} />
              </div>
              {!mapProgress.allComplete && mapProgress.stepTotal > 0 ? (
                <p className="m-0 mt-2 text-[11px] leading-relaxed text-[#8b9ec9]">
                  Langkah berikutnya nomor{' '}
                  <span className="font-extrabold text-[#FFF8EC]">{mapProgress.stepCurrent}</span> pada
                  jalur yang sama dengan peta.
                </p>
              ) : null}
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/10 pt-4">
                <Link to="/home" className="pelajaran-iq-link">
                  🗺 Peta belajar
                </Link>
                <Link to="/profile" className="pelajaran-iq-link">
                  Statistik &amp; maskot
                </Link>
              </div>
            </>
          )}
        </section>

        <section aria-labelledby="pelajaran-kurikulum-heading">
          <div className="flex items-end justify-between gap-2">
            <h2
              id="pelajaran-kurikulum-heading"
              className="m-0 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#6A4A9A]"
            >
              Delapan zona
            </h2>
            <span className="text-[10px] font-bold text-[#7b95c8]">Ketuk untuk buka</span>
          </div>
          <p className="m-0 mt-2 text-xs leading-relaxed text-[#a0bee8]">
            Setiap zona punya sepuluh langkah kuis — urutannya mengikuti petualangan di peta.
          </p>

          <div className="mt-4 flex flex-col gap-2.5">
            {CURRICULUM_LEVELS.map((lv) => {
              const list = lessonsByLevel[lv] || []
              const zoneName = AKADEMI_ZONE_SHORT[lv] ?? `Zona ${lv}`
              const emoji = ZONE_EMOJI[lv - 1] ?? '📖'
              return (
                <details
                  key={lv}
                  className="pelajaran-iq-zone group"
                  open={lv === activeZone}
                >
                  <summary className="pelajaran-iq-zone-summary">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/[0.08] text-xl shadow-sm ring-1 ring-amber-400/18"
                          aria-hidden="true"
                        >
                          {emoji}
                        </span>
                        <div className="min-w-0 text-left">
                          <span className="text-[10px] font-extrabold uppercase tracking-wide text-iq-teal">
                            Zona {lv}
                          </span>
                          <p className="m-0 text-sm font-extrabold text-[#FFF8EC]">{zoneName}</p>
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-extrabold text-[#d8d4e8] ring-1 ring-white/10">
                        {list.length}
                      </span>
                    </div>
                  </summary>
                  <ul className="m-0 list-none space-y-1 border-t border-white/[0.08] bg-black/30 px-2 py-2">
                    {list.length === 0 ? (
                      <li className="px-2 py-3 text-xs font-medium text-[#8b9ec9]">Memuat…</li>
                    ) : (
                      list.map((lesson) => {
                        const step = pathStepIndex(lesson.id)
                        const status =
                          step > 0 ? lessonStepOnPathStatus(step, mapProgress) : 'locked'
                        const stars =
                          status === 'completed' || completedLessons.has(lesson.id)
                            ? getStarsForLesson(lesson.id)
                            : 0
                        const canOpen = status !== 'locked'

                        return (
                          <li key={lesson.id}>
                            <div
                              className={cn(
                                'flex items-start gap-2 rounded-xl px-2.5 py-2.5 transition-colors border border-transparent',
                                status === 'current' && 'pelajaran-iq-lesson-current',
                                status !== 'current' && 'bg-white/[0.06] border-white/[0.06]',
                              )}
                            >
                              <div className="min-w-0 flex-1">
                                <p className="m-0 text-xs font-extrabold leading-snug text-[#FFF8EC]">
                                  {lesson.title}
                                </p>
                                <div className="mt-1 flex flex-wrap items-center gap-2">
                                  {status === 'locked' && (
                                    <span className="text-[10px] font-bold uppercase tracking-wide text-[#6A4A9A]">
                                      🔒 Terkunci
                                    </span>
                                  )}
                                  {status === 'current' && (
                                    <span className="text-[10px] font-extrabold uppercase tracking-wide text-iq-teal">
                                      ● Sedang dilalui
                                    </span>
                                  )}
                                  {status === 'completed' && <StarsRow count={stars} />}
                                </div>
                              </div>
                              <button
                                type="button"
                                disabled={!canOpen}
                                onClick={() => canOpen && goToLesson(lesson.id)}
                                className={cn(
                                  'shrink-0 rounded-xl px-3 py-2 text-[11px] font-extrabold transition-all',
                                  canOpen
                                    ? 'bg-iq-teal text-white shadow-[0_4px_16px_rgba(0,200,150,0.35)] hover:brightness-110 active:scale-[0.98]'
                                    : 'cursor-not-allowed bg-white/[0.08] text-white/35',
                                )}
                              >
                                {status === 'completed' ? 'Ulangi' : status === 'current' ? 'Mulai' : '—'}
                              </button>
                            </div>
                          </li>
                        )
                      })
                    )}
                  </ul>
                </details>
              )
            })}
          </div>
        </section>
      </div>

      <BottomNav />
    </div>
  )
}
