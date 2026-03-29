import { storageKey } from './progressScope'

/* ── XP ── */

export const XP_UPDATED_EVENT = 'akademiweal-xp-updated'
export const STREAK_UPDATED_EVENT = 'akademiweal-streak-updated'
export const XP_PER_CORRECT = 2
/** Bonus XP when finishing the last lesson of a level (session complete). */
export const XP_PER_LESSON_COMPLETE = 10

function notifyXpUpdated() {
  try {
    window.dispatchEvent(new CustomEvent(XP_UPDATED_EVENT))
  } catch {
    /* ignore */
  }
}

function notifyStreakUpdated() {
  try {
    window.dispatchEvent(new CustomEvent(STREAK_UPDATED_EVENT))
  } catch {
    /* ignore */
  }
}

function localDateString(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parseLocalDate(s) {
  const [yy, mm, dd] = s.split('-').map(Number)
  return new Date(yy, mm - 1, dd)
}

function calendarDaysBetween(a, b) {
  const ms = 24 * 60 * 60 * 1000
  return Math.round((b.getTime() - a.getTime()) / ms)
}

/**
 * Call once per day when the user completes a meaningful session (e.g. Result → Lanjut).
 * Increments streak on consecutive days; resets after a gap; idempotent same calendar day.
 */
export function recordDailyStreak() {
  try {
    const today = localDateString(new Date())
    const lastKey = storageKey('last_activity_date')
    const streakKey = storageKey('streak_days')
    const last = localStorage.getItem(lastKey)
    let streak = parseInt(localStorage.getItem(streakKey) || '0', 10)
    if (!Number.isFinite(streak) || streak < 0) {
      streak = 0
    }

    if (last === today) {
      notifyStreakUpdated()
      return streak
    }

    if (!last) {
      streak = 1
    } else {
      const prev = parseLocalDate(last)
      const now = parseLocalDate(today)
      const diff = calendarDaysBetween(prev, now)
      if (diff === 1) {
        streak += 1
      } else if (diff > 1) {
        streak = 1
      } else {
        streak = Math.max(1, streak)
      }
    }

    localStorage.setItem(streakKey, String(streak))
    localStorage.setItem(lastKey, today)
    notifyStreakUpdated()
    return streak
  } catch {
    return 0
  }
}

/** Current streak days for the logged-in user (local). */
export function getStreakDays() {
  try {
    const n = parseInt(localStorage.getItem(storageKey('streak_days')) || '0', 10)
    return Number.isFinite(n) && n >= 0 ? n : 0
  } catch {
    return 0
  }
}

/** Current persisted total XP (local, per user). */
export function getTotalXp() {
  try {
    const n = parseInt(localStorage.getItem(storageKey('xp')) || '0', 10)
    return Number.isFinite(n) ? Math.max(0, n) : 0
  } catch {
    return 0
  }
}

/**
 * Adopt the higher of local and server totals (offline-safe). Fires XP_UPDATED_EVENT when local changes.
 * @param {number} serverXp
 * @returns {number} resulting total
 */
export function mergeServerXp(serverXp) {
  const s = Math.max(0, Math.floor(Number(serverXp) || 0))
  const xpKey = storageKey('xp')
  try {
    const cur = getTotalXp()
    const next = Math.max(cur, s)
    if (next !== cur) {
      localStorage.setItem(xpKey, String(next))
      notifyXpUpdated()
    }
    return next
  } catch {
    return getTotalXp()
  }
}

/** Persist total XP to localStorage. Fires XP_UPDATED_EVENT. */
export function addXp(amount) {
  if (!Number.isFinite(amount) || amount <= 0) {
    return
  }
  const xpKey = storageKey('xp')
  try {
    const cur = parseInt(localStorage.getItem(xpKey) || '0', 10)
    const next = (Number.isFinite(cur) ? cur : 0) + Math.floor(amount)
    localStorage.setItem(xpKey, String(next))
    recordDailyXp(Math.floor(amount))
    notifyXpUpdated()
  } catch {
    /* ignore */
  }
}

/** Record XP earned today (called from addXp). Keeps a rolling 30-day log. */
function recordDailyXp(amount) {
  try {
    const today = localDateString(new Date())
    const dailyKey = storageKey('daily_xp')
    const raw = localStorage.getItem(dailyKey)
    let map = {}
    try {
      if (raw) map = JSON.parse(raw)
    } catch {
      map = {}
    }
    map[today] = (Number(map[today]) || 0) + amount
    const cutoff = localDateString(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
    Object.keys(map).forEach((k) => {
      if (k < cutoff) delete map[k]
    })
    localStorage.setItem(dailyKey, JSON.stringify(map))
  } catch {
    /* ignore */
  }
}

/**
 * Returns array of 7 numbers: XP earned on each of the last 7 calendar days,
 * oldest first. Day 0 = 6 days ago, Day 6 = today.
 */
export function getWeeklyXp() {
  try {
    const raw = localStorage.getItem(storageKey('daily_xp'))
    const map = raw ? JSON.parse(raw) : {}
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      return Number(map[localDateString(d)]) || 0
    })
  } catch {
    return Array(7).fill(0)
  }
}

/* ── Levels ── */

/**
 * Cumulative XP needed to *reach* that level (index 0 = Level 1 start).
 * Level 1 starts at 0 XP, Level 2 starts at 50 XP, etc.
 */
export const LEVEL_THRESHOLDS = [0, 50, 125, 225, 375]

export const LEVEL_NAMES = [
  'Pemula',
  'Penabung',
  'Pemula Cerdas',
  'Investor Muda',
  'Ahli Keuangan',
]

/** Returns current level 1–5 based on total XP. */
export function getLevel(xp) {
  const safeXp = Math.max(0, Math.floor(Number(xp) || 0))
  let level = 1
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (safeXp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1
      break
    }
  }
  return Math.min(level, LEVEL_THRESHOLDS.length)
}

/** Returns the display name for the current level. */
export function getLevelName(xp) {
  const level = getLevel(xp)
  return LEVEL_NAMES[level - 1] ?? LEVEL_NAMES[0]
}

/**
 * Returns the total XP threshold for the *next* level,
 * or null if the user is already at max level.
 */
export function getXpForNextLevel(xp) {
  const level = getLevel(xp)
  if (level >= LEVEL_THRESHOLDS.length) {
    return null
  }
  return LEVEL_THRESHOLDS[level]
}

/** Returns XP accumulated since the start of the current level. */
export function getXpInCurrentLevel(xp) {
  const safeXp = Math.max(0, Math.floor(Number(xp) || 0))
  const level = getLevel(safeXp)
  const levelStart = LEVEL_THRESHOLDS[level - 1] ?? 0
  return safeXp - levelStart
}

/**
 * Maps total XP to the numeric level used by MascotEvolution (tiers 1–10, 11–25, …).
 * Grows with XP so the mascot evolves alongside the learning path.
 */
export function getMascotEvolutionLevel(xp) {
  const safeXp = Math.max(0, Math.floor(Number(xp) || 0))
  return Math.max(1, Math.min(120, 1 + Math.floor(safeXp / 6)))
}

/**
 * Mascot shown on map/profile: never ahead of the learning path.
 * Server XP can exceed path progress (e.g. after login); without this, Zona 1 still showed Toro (XP tier 11+).
 * @param {number} xp
 * @param {number} pathStep path `stepCurrent` (1 … N from lesson order), or 1 while loading
 */
export function getDisplayMascotEvolutionLevel(xp, pathStep) {
  const fromXp = getMascotEvolutionLevel(xp)
  const step = Number(pathStep)
  if (!Number.isFinite(step)) {
    return fromXp
  }
  const cap = Math.max(1, Math.min(120, Math.floor(step)))
  return Math.min(fromXp, cap)
}

/* ── Lives ── */

export const MAX_LIVES = 3
export const LIVES_UPDATED_EVENT = 'akademiweal-lives-updated'

function notifyLivesUpdated() {
  try {
    window.dispatchEvent(new CustomEvent(LIVES_UPDATED_EVENT))
  } catch {
    /* ignore */
  }
}

/** Returns current lives (0–MAX_LIVES). Defaults to MAX_LIVES if never set. */
export function getLives() {
  try {
    const raw = localStorage.getItem(storageKey('lives'))
    if (raw === null) return MAX_LIVES
    const n = parseInt(raw, 10)
    return Number.isFinite(n) ? Math.min(Math.max(n, 0), MAX_LIVES) : MAX_LIVES
  } catch {
    return MAX_LIVES
  }
}

/** Removes one life. Floors at 0. */
export function deductLife() {
  try {
    const current = getLives()
    const next = Math.max(0, current - 1)
    localStorage.setItem(storageKey('lives'), String(next))
    notifyLivesUpdated()
    return next
  } catch {
    return 0
  }
}

/** Restores lives to MAX_LIVES. Call on lesson completion. */
export function resetLives() {
  try {
    localStorage.setItem(storageKey('lives'), String(MAX_LIVES))
    notifyLivesUpdated()
  } catch {
    /* ignore */
  }
}

/* ── Completed lessons ── */

export const COMPLETED_LESSONS_EVENT = 'akademiweal-completed-lessons-updated'

function notifyCompletedLessonsUpdated() {
  try {
    window.dispatchEvent(new CustomEvent(COMPLETED_LESSONS_EVENT))
  } catch {
    /* ignore */
  }
}

/**
 * @param {number} lessonId
 * @param {1|2|3} [stars] — optional; stored for path node display
 */
export function markLessonComplete(lessonId, stars) {
  if (lessonId == null) {
    return
  }
  try {
    const completedKey = storageKey('completed_lessons')
    const starsKey = storageKey('lesson_stars')
    const completed = getCompletedLessons()
    completed.add(Number(lessonId))
    localStorage.setItem(completedKey, JSON.stringify(Array.from(completed)))
    if (stars != null && stars >= 1 && stars <= 3) {
      let map = {}
      try {
        const raw = localStorage.getItem(starsKey)
        if (raw) {
          const p = JSON.parse(raw)
          if (typeof p === 'object' && p !== null) {
            map = p
          }
        }
      } catch {
        map = {}
      }
      map[String(lessonId)] = stars
      localStorage.setItem(starsKey, JSON.stringify(map))
    }
    notifyCompletedLessonsUpdated()
  } catch {
    /* ignore */
  }
}

/** @param {number} lessonId @returns {1|2|3} */
export function getStarsForLesson(lessonId) {
  try {
    const raw = localStorage.getItem(storageKey('lesson_stars'))
    if (!raw) {
      return 3
    }
    const map = JSON.parse(raw)
    const s = map?.[String(lessonId)]
    if (s === 1 || s === 2 || s === 3) {
      return s
    }
    return 3
  } catch {
    return 3
  }
}

/** Returns a Set<number> of completed lesson IDs from localStorage. */
export function getCompletedLessons() {
  try {
    const raw = localStorage.getItem(storageKey('completed_lessons'))
    if (!raw) {
      return new Set()
    }
    const arr = JSON.parse(raw)
    if (!Array.isArray(arr)) {
      return new Set()
    }
    return new Set(arr.map(Number).filter(Number.isFinite))
  } catch {
    return new Set()
  }
}
