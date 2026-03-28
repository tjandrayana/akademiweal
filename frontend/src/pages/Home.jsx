import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchLessonsByLevel } from '../api/lessons'
import { Button } from '../components/Button'
import { ProgressBar } from '../components/ProgressBar'
import { StatCard } from '../components/StatCard'
import { BottomNav } from '../components/BottomNav'
import { useGamificationStats } from '../hooks/useGamificationStats'
import { LEVEL_NAMES, getStarsForLesson } from '../lib/gamification'
import { cn } from '../lib/cn'
import { playNavigate, playLocked, playLevelStart, isMuted, toggleMute } from '../lib/sounds'

/** Matches docs/content.md levels 1–5 */
const LEVELS = [1, 2, 3, 4, 5]
const LEVELS_CACHE_KEY = 'akademiweal_levels_cache'

/** Cycling emoji set for lesson nodes */
const LESSON_EMOJIS = ['💵', '📈', '🌡️', '⚖️', '🏦', '📊', '📉', '🔄', '⚠️', '🎯', '🌱', '🏠', '🧠']

// Path layout constants — node positions in SVG coordinate space (x: 0–100, y: pixels)
const PATH_LX = 27   // left column x  (% of container width)
const PATH_RX = 73   // right column x
const PATH_ROW_H = 168  // vertical distance between nodes (px) — increased for larger current node
const PATH_TOP_PAD = 68
const PATH_BOT_PAD = 60

/** Compute absolute node positions for the winding path */
function getNodePositions(count) {
  return Array.from({ length: count }, (_, i) => ({
    x: i % 2 === 0 ? PATH_LX : PATH_RX,
    y: PATH_TOP_PAD + i * PATH_ROW_H,
  }))
}

/** Build a smooth bezier SVG path string through the node positions */
function buildPathD(positions) {
  if (!positions.length) return ''
  let d = `M ${positions[0].x} ${positions[0].y}`
  for (let i = 1; i < positions.length; i++) {
    const p = positions[i - 1]
    const c = positions[i]
    const midY = (p.y + c.y) / 2
    // Cubic bezier: hold x at origin until halfway, then curve to destination x
    d += ` C ${p.x} ${midY} ${c.x} ${midY} ${c.x} ${c.y}`
  }
  return d
}

// Dramatic size ratio — current must dominate at a glance (1.45× completed)
const NODE_SIZE = { current: 84, completed: 58, locked: 50 }

/**
 * Map node — 3 states with maximum visual hierarchy.
 *
 * Design rule: user's eye snaps to current within 200ms of opening the map.
 *
 *   current   → 84px · mascot inside · strong glow · proper "Mulai" CTA button
 *   completed → 58px · 75% opacity (whole node recedes) · check · stars
 *   locked    → 50px · 35% opacity (invisible by design) · lock · no label
 */
function MapNode({ lesson, index, isCompleted, isCurrent, isLocked, onClick }) {
  const emoji = LESSON_EMOJIS[index % LESSON_EMOJIS.length]
  const stars = isCompleted ? getStarsForLesson(lesson.id) : 0

  const size = isCurrent ? NODE_SIZE.current : isCompleted ? NODE_SIZE.completed : NODE_SIZE.locked

  const maxChars = isCurrent ? 13 : 10
  const truncatedTitle =
    lesson.title.length > maxChars ? lesson.title.slice(0, maxChars - 1) + '…' : lesson.title

  // Color strategy:
  //   current   → vivid teal saturated  →  "ACTION REQUIRED"
  //   completed → desaturated green     →  "history, passive"
  //   locked    → cold gray             →  "unavailable"
  const bg = isLocked
    ? 'linear-gradient(160deg, #E2E8F0 0%, #94A3B8 100%)'
    : isCompleted
      ? 'linear-gradient(160deg, #4ADE80 0%, #15803D 100%)'
      : 'linear-gradient(160deg, #6EE7B7 0%, #059669 100%)'

  const pressColor = isLocked ? '#64748B' : isCompleted ? '#14532d' : '#065F46'
  // Shadow depth scales with importance
  const shadowDepth = isCurrent ? 10 : isCompleted ? 4 : 3
  // Glow is 4× stronger on current — it literally glows
  const glowBlur = isCurrent ? 40 : isCompleted ? 8 : 0
  const glowColor = isLocked
    ? 'transparent'
    : isCompleted
      ? 'rgba(34,197,94,0.18)'
      : 'rgba(16,185,129,0.70)'

  const iconSize = Math.round(size * 0.40)

  return (
    // Opacity lives on the WRAPPER — stars, label, everything recedes together
    <div
      className={cn(
        'flex flex-col items-center gap-1',
        isCompleted && 'opacity-75',
        isLocked && 'opacity-35',
      )}
    >
      {/* ── Circle + pulse ring ── */}
      <div className="relative flex items-center justify-center">
        {isCurrent && (
          <div
            className="absolute rounded-full animate-pulse-ring pointer-events-none"
            style={{ width: size + 28, height: size + 28 }}
            aria-hidden="true"
          />
        )}

        <button
          type="button"
          aria-label={`${isLocked ? 'Terkunci: ' : isCurrent ? 'Mulai: ' : 'Ulangi: '}${lesson.title}`}
          disabled={isLocked}
          onClick={isLocked ? undefined : onClick}
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            background: bg,
            boxShadow: `0 ${shadowDepth}px 0 ${pressColor}, 0 ${shadowDepth + 5}px ${glowBlur}px ${glowColor}`,
            border: `${isCurrent ? 5 : 3}px solid rgba(255,255,255,${isCurrent ? 0.70 : 0.40})`,
            transition: 'transform 0.2s ease-out, filter 0.15s ease',
          }}
          className={cn(
            'flex items-center justify-center',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
            // Current: hover lifts slightly, press snaps to 0.95 and springs back
            isCurrent && 'hover:scale-[1.06] hover:brightness-105 active:scale-95',
            // Completed: subtle hover — users can replay but it doesn't compete with current
            isCompleted && 'hover:brightness-110 active:scale-95',
            // Locked: clearly disabled
            isLocked && 'cursor-not-allowed',
          )}
        >
          {/* Current → 🐂 mascot inside ("tap me!") instead of topic emoji */}
          {isCurrent ? (
            <span
              style={{ fontSize: iconSize + 10 }}
              className="leading-none select-none"
              aria-hidden="true"
            >
              🐂
            </span>
          ) : isCompleted ? (
            <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M5 13l4 4L19 7"
                stroke="white"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : isLocked ? (
            <span
              style={{ fontSize: iconSize }}
              className="leading-none select-none"
              aria-hidden="true"
            >
              🔒
            </span>
          ) : (
            <span
              style={{ fontSize: iconSize + 2 }}
              className="leading-none select-none"
              aria-hidden="true"
            >
              {emoji}
            </span>
          )}
        </button>
      </div>

      {/* Stars — completed only, all same size */}
      {isCompleted && (
        <div className="flex gap-0.5" aria-label={`${stars} dari 3 bintang`}>
          {[1, 2, 3].map((s) => (
            <span
              key={s}
              className={cn('text-sm leading-none', s <= stars ? 'text-yellow-400' : 'text-black/15')}
              aria-hidden="true"
            >
              ★
            </span>
          ))}
        </div>
      )}

      {/* Title — current is larger and bolder, others are quiet */}
      {!isLocked && (
        <span
          className={cn(
            'text-center leading-tight text-gray-900 mt-0.5 truncate',
            isCurrent ? 'text-sm font-bold max-w-[92px]' : 'text-xs font-medium max-w-[64px]',
          )}
          style={{ textShadow: '0 1px 4px rgba(255,255,255,1)' }}
        >
          {truncatedTitle}
        </span>
      )}

      {/* "MULAI" — a real pressable CTA button, not a decorative pill */}
      {isCurrent && (
        <button
          type="button"
          onClick={onClick}
          className={cn(
            'mt-1.5 rounded-full bg-primary px-5 py-1.5',
            'text-[11px] font-extrabold uppercase tracking-wider text-white',
            'shadow-[0_3px_0_#15803D]',
            'transition-all duration-100',
            'active:translate-y-[2px] active:shadow-[0_1px_0_#15803D]',
          )}
        >
          Mulai →
        </button>
      )}
    </div>
  )
}

/**
 * The winding learning-path map.
 * Uses an SVG bezier curve as the actual sandy road; nodes are absolutely
 * positioned at each curve point so they sit ON the path (not beside it).
 */
function LearningPathMap({ lessons, completedLessons, activePathLevel, selectedLevel, onGoToLesson }) {
  const positions = getNodePositions(lessons.length)
  const pathD = buildPathD(positions)
  const totalH = PATH_TOP_PAD + lessons.length * PATH_ROW_H + PATH_BOT_PAD

  return (
    <div
      className="relative -mx-4 overflow-hidden rounded-2xl"
      style={{
        height: totalH,
        // Bright nature gradient — light sky at top, vivid green grass
        background: 'linear-gradient(180deg, #B8E4FF 0%, #CCF0A0 12%, #8FD660 40%, #9EDF6A 70%, #C2EE88 100%)',
      }}
    >
      {/* Sky fade at top */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24 z-0"
        style={{ background: 'linear-gradient(180deg, rgba(180,225,255,0.85) 0%, transparent 100%)' }}
        aria-hidden="true"
      />

      {/* ── Sandy winding road SVG ── */}
      {/*
        viewBox x: 0–100 (maps to 0–100% of container width)
        viewBox y: 0–totalH (maps to 0–totalH px)
        preserveAspectRatio="none" lets x & y scale independently.
        vectorEffect="non-scaling-stroke" keeps strokeWidth in screen pixels.
      */}
      <svg
        viewBox={`0 0 100 ${totalH}`}
        width="100%"
        height={totalH}
        preserveAspectRatio="none"
        className="absolute inset-0 pointer-events-none z-0"
        aria-hidden="true"
      >
        {/* Road edge / shadow */}
        <path d={pathD} stroke="#A07830" strokeWidth="58" strokeLinecap="round" fill="none"
          vectorEffect="non-scaling-stroke" opacity="0.28" />
        {/* Main sandy fill */}
        <path d={pathD} stroke="#E8C878" strokeWidth="52" strokeLinecap="round" fill="none"
          vectorEffect="non-scaling-stroke" />
        {/* Centre highlight */}
        <path d={pathD} stroke="#F8E8B8" strokeWidth="24" strokeLinecap="round" fill="none"
          vectorEffect="non-scaling-stroke" opacity="0.55" />
      </svg>

      {/* ── Nature decorations ── */}
      {/* Left trees — stay in the left grass, away from the LEFT_X column */}
      <div className="pointer-events-none select-none absolute z-[2]" aria-hidden="true"
        style={{ top: 8, left: 4, fontSize: 44, filter: 'drop-shadow(2px 5px 3px rgba(0,0,0,0.18))' }}>🌲</div>
      <div className="pointer-events-none select-none absolute z-[2]" aria-hidden="true"
        style={{ top: PATH_TOP_PAD + 1.4 * PATH_ROW_H, left: 2, fontSize: 38, filter: 'drop-shadow(2px 4px 3px rgba(0,0,0,0.15))' }}>🌳</div>
      <div className="pointer-events-none select-none absolute z-[2]" aria-hidden="true"
        style={{ top: PATH_TOP_PAD + 3.2 * PATH_ROW_H, left: 4, fontSize: 40, filter: 'drop-shadow(2px 4px 3px rgba(0,0,0,0.15))' }}>🌲</div>
      <div className="pointer-events-none select-none absolute z-[2] opacity-85" aria-hidden="true"
        style={{ bottom: 32, left: 10, fontSize: 26 }}>🌸</div>

      {/* Right trees */}
      <div className="pointer-events-none select-none absolute z-[2]" aria-hidden="true"
        style={{ top: 14, right: 4, fontSize: 44, filter: 'drop-shadow(-2px 5px 3px rgba(0,0,0,0.18))' }}>🌳</div>
      <div className="pointer-events-none select-none absolute z-[2]" aria-hidden="true"
        style={{ top: PATH_TOP_PAD + 2.4 * PATH_ROW_H, right: 4, fontSize: 38, filter: 'drop-shadow(-2px 4px 3px rgba(0,0,0,0.15))' }}>🌲</div>
      <div className="pointer-events-none select-none absolute z-[2]" aria-hidden="true"
        style={{ bottom: PATH_BOT_PAD + 0.3 * PATH_ROW_H, right: 6, fontSize: 38, filter: 'drop-shadow(-2px 4px 4px rgba(0,0,0,0.20))' }}>🏕️</div>
      <div className="pointer-events-none select-none absolute z-[2] opacity-80" aria-hidden="true"
        style={{ bottom: 20, right: 12, fontSize: 24 }}>🌺</div>

      {/* ── Shield nodes — positioned ON the path curve ── */}
      {lessons.map((lesson, i) => {
        const { x, y } = positions[i]
        const isCompleted = completedLessons.has(lesson.id)
        const prevCompleted = i === 0 || completedLessons.has(lessons[i - 1]?.id)
        const isCurrent = !isCompleted && prevCompleted && selectedLevel === activePathLevel
        const isLocked = !isCompleted && !prevCompleted

        return (
          <div
            key={lesson.id}
            className="absolute z-10"
            style={{
              // x: percentage of container width (PATH_LX / PATH_RX directly = %)
              left: `${x}%`,
              // y: pixel offset from top
              top: y,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <MapNode
              lesson={lesson}
              index={i}
              isCompleted={isCompleted}
              isCurrent={isCurrent}
              isLocked={isLocked}
              onClick={() => onGoToLesson(lesson.id)}
            />
          </div>
        )
      })}
    </div>
  )
}

function isLevelUnlocked(level, lessonsByLevel, completedLessons) {
  if (level <= 1) {
    return true
  }
  const prev = lessonsByLevel[level - 1]
  if (!prev?.length) {
    return false
  }
  return prev.every((l) => completedLessons.has(l.id))
}

export function Home() {
  const navigate = useNavigate()
  const { streak, xp, level, completedLessons } = useGamificationStats()

  const [selectedLevel, setSelectedLevel] = useState(1)
  const [lessonsByLevel, setLessonsByLevel] = useState(() => {
    try {
      const cached = localStorage.getItem(LEVELS_CACHE_KEY)
      if (cached) return JSON.parse(cached)
    } catch { /* ignore */ }
    return {}
  })
  const [lessons, setLessons] = useState(null)
  const [loadState, setLoadState] = useState('loading')
  const [loadError, setLoadError] = useState(null)
  const [toast, setToast] = useState(null)
  const [muted, setMuted] = useState(() => isMuted())

  const loadLessons = useCallback(async (signal) => {
    setLoadState('loading')
    setLoadError(null)
    try {
      const data = await fetchLessonsByLevel(selectedLevel, { signal })
      if (!Array.isArray(data)) {
        throw new Error('Invalid response')
      }
      setLessons(data)
      setLoadState('ready')
    } catch (e) {
      if (e?.name === 'AbortError') {
        return
      }
      setLessons(null)
      setLoadError(e instanceof Error ? e.message : 'Something went wrong')
      setLoadState('error')
    }
  }, [selectedLevel])

  useEffect(() => {
    const ac = new AbortController()
    loadLessons(ac.signal)
    return () => ac.abort()
  }, [loadLessons])

  useEffect(() => {
    let cancelled = false
    async function loadAll() {
      try {
        const pairs = await Promise.all(
          LEVELS.map(async (lv) => {
            const data = await fetchLessonsByLevel(lv)
            return [lv, Array.isArray(data) ? data : []]
          }),
        )
        if (!cancelled) {
          setLessonsByLevel(Object.fromEntries(pairs))
          try { localStorage.setItem(LEVELS_CACHE_KEY, JSON.stringify(Object.fromEntries(pairs))) } catch { /* ignore */ }
        }
      } catch {
        /* leave lessonsByLevel as-is (cached or default) */
      }
    }
    loadAll()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!toast) {
      return
    }
    const t = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(t)
  }, [toast])

  const activePathLevel = useMemo(() => {
    for (const lv of LEVELS) {
      const list = lessonsByLevel[lv]
      if (!list?.length) {
        continue
      }
      if (list.some((l) => !completedLessons.has(l.id))) {
        return lv
      }
    }
    return null
  }, [lessonsByLevel, completedLessons])

  function handleToggleMute() {
    const next = toggleMute()
    setMuted(next)
  }

  function goToLesson(lessonId) {
    playLevelStart()
    navigate(`/lesson?level=${selectedLevel}&lessonId=${lessonId}`)
  }

  function selectLevel(lv) {
    if (!isLevelUnlocked(lv, lessonsByLevel, completedLessons)) {
      playLocked()
      setToast(`Selesaikan Level ${lv - 1} terlebih dahulu`)
      return
    }
    playNavigate()
    setSelectedLevel(lv)
  }

  const completedCount = lessons ? lessons.filter((l) => completedLessons.has(l.id)).length : 0
  const progressPct = lessons?.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0

  const levelDisplayName = LEVEL_NAMES[selectedLevel - 1] ?? `Level ${selectedLevel}`
  const levelUnlocked = isLevelUnlocked(selectedLevel, lessonsByLevel, completedLessons)
  const allLessonsInLevelDone =
    lessons != null && lessons.length > 0 && lessons.every((l) => completedLessons.has(l.id))

  const sectionLabel = !levelUnlocked
    ? 'LEVEL TERKUNCI'
    : allLessonsInLevelDone
      ? 'LEVEL SELESAI'
      : 'SEDANG BELAJAR'

  const goalLabel = useMemo(() => {
    try {
      const id = localStorage.getItem('akademiweal_onboarding_goal')
      if (!id) {
        return null
      }
      const labels = { zero: 'Belajar dari nol', start: 'Siap mulai investasi', more: 'Tambah pengetahuan' }
      return labels[id] ?? null
    } catch {
      return null
    }
  }, [])

  return (
    <div className="flex flex-col min-h-svh bg-[#F9FAFB]">
      {toast ? (
        <div
          className="fixed top-14 left-1/2 z-50 max-w-sm -translate-x-1/2 rounded-xl bg-gray-900 px-4 py-2 text-center text-sm font-semibold text-white shadow-lg"
          role="status"
        >
          {toast}
        </div>
      ) : null}

      <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-2 border-b border-gray-100/80 bg-white/95 px-4 backdrop-blur-md shadow-[0_1px_12px_rgba(0,0,0,0.05)]">
        {/* Streak pill */}
        <div
          className="flex items-center gap-1.5 rounded-full bg-orange-50 border border-orange-100 px-3 py-1.5"
          aria-label={`Streak: ${streak} hari`}
        >
          <span className="text-sm leading-none" aria-hidden="true">🔥</span>
          <span className="text-sm font-extrabold text-orange-600">{streak}</span>
        </div>

        {/* Brand */}
        <div className="flex items-center gap-1.5">
          <span className="text-lg leading-none" aria-hidden="true">🐂</span>
          <span
            className="text-[15px] font-extrabold tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #15803D, #22C55E)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            AkademiWeal
          </span>
        </div>

        {/* Right: lives + mute */}
        <div className="flex items-center gap-1.5">
          <div
            className="flex items-center gap-1 rounded-full bg-red-50 border border-red-100 px-3 py-1.5"
            aria-label="3 nyawa tersisa"
          >
            <span className="text-sm leading-none" aria-hidden="true">❤️</span>
            <span className="text-sm font-extrabold text-red-500">3</span>
          </div>
          <button
            type="button"
            onClick={handleToggleMute}
            aria-label={muted ? 'Aktifkan suara' : 'Matikan suara'}
            className="flex h-8 w-8 items-center justify-center rounded-full text-base hover:bg-gray-100 transition-colors"
          >
            {muted ? '🔕' : '🔊'}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-20">
        {goalLabel ? (
          <p className="m-0 px-4 pt-4 text-xs font-semibold text-muted">Fokus: {goalLabel}</p>
        ) : null}

        <div className="grid grid-cols-3 gap-3 px-4 pt-4 pb-2">
          <StatCard
            icon="🔥"
            iconBg="bg-orange-50"
            value={streak}
            label="Hari Beruntun"
            valueColor="text-orange-500"
          />
          <StatCard
            icon="⭐"
            iconBg="bg-yellow-50"
            value={xp}
            label="Total XP"
            valueColor="text-yellow-600"
          />
          <StatCard
            icon="🎯"
            iconBg="bg-green-50"
            value={level}
            label="Level"
            valueColor="text-primary"
          />
        </div>

        <div className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-none" role="tablist" aria-label="Pilih level">
          {LEVELS.map((lv) => {
            const unlocked = isLevelUnlocked(lv, lessonsByLevel, completedLessons)
            return (
              <button
                key={lv}
                type="button"
                role="tab"
                aria-selected={selectedLevel === lv}
                aria-disabled={!unlocked}
                onClick={() => selectLevel(lv)}
                className={cn(
                  'shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary',
                  selectedLevel === lv
                    ? 'bg-primary text-white shadow-[0_2px_0_#15803D] scale-105'
                    : unlocked
                      ? 'bg-white text-gray-600 border border-gray-200 shadow-sm hover:border-gray-300 hover:shadow'
                      : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-60',
                )}
              >
                {unlocked ? `Level ${lv}` : `🔒 ${lv}`}
              </button>
            )
          })}
        </div>

        <div className="mx-4 my-2 rounded-2xl overflow-hidden shadow-md">
          <div
            className="p-4 text-white"
            style={{ background: 'linear-gradient(135deg, #14532d 0%, #16A34A 50%, #22C55E 100%)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-2xl leading-none shadow-inner border border-white/20"
                aria-hidden="true"
              >
                🏅
              </div>
              <div className="flex-1 min-w-0">
                <p className="m-0 text-[10px] font-extrabold uppercase opacity-70 tracking-widest">{sectionLabel}</p>
                <p className="m-0 text-base font-extrabold leading-snug truncate">
                  Level {selectedLevel} — {levelDisplayName}
                </p>
                {loadState === 'ready' && lessons != null && (
                  <p className="m-0 mt-0.5 text-xs opacity-75">
                    {completedCount} / {lessons.length} pelajaran selesai
                  </p>
                )}
              </div>
              {allLessonsInLevelDone && (
                <div className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-lg" aria-hidden="true">
                  ✅
                </div>
              )}
            </div>
            <div className="mt-3">
              <ProgressBar value={progressPct} variant="white" />
            </div>
          </div>
        </div>

        <div className="px-4 py-4">
          {loadState === 'loading' && (
            <div className="flex flex-col gap-4" role="status" aria-live="polite" aria-label="Memuat pelajaran">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-xl bg-gray-200 animate-pulse" />
              ))}
            </div>
          )}

          {loadState === 'error' && (
            <div className="flex flex-col items-center gap-4 py-8 text-center" role="alert">
              <span className="text-5xl" aria-hidden="true">
                😕
              </span>
              <p className="m-0 text-base font-semibold text-text">{loadError}</p>
              <Button type="button" variant="primary" className="w-full" onClick={() => loadLessons(undefined)}>
                Coba lagi
              </Button>
            </div>
          )}

          {loadState === 'ready' && lessons != null && lessons.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <span className="text-[100px] leading-none" style={{ fontSize: '100px' }} aria-hidden="true">
                🐂
              </span>
              <p className="m-0 text-base font-bold text-text">Belum ada pelajaran untuk level ini</p>
              <p className="m-0 text-sm text-muted">Cek lagi nanti</p>
            </div>
          )}

          {loadState === 'ready' && lessons != null && lessons.length > 0 && (
            <LearningPathMap
              lessons={lessons}
              completedLessons={completedLessons}
              activePathLevel={activePathLevel}
              selectedLevel={selectedLevel}
              onGoToLesson={goToLesson}
            />
          )}
        </div>

        <div className="mx-4 my-2 mb-4 rounded-2xl border border-dashed border-border bg-white p-4 text-center shadow-sm">
          <p className="m-0 text-sm font-semibold text-muted">Hadiah harian</p>
          <p className="m-0 mt-1 text-xs text-muted">Fitur ini akan menyusul — fokus pada pelajaranmu dulu ya.</p>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
