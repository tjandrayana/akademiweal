import { getAuthToken } from '../api/client'

/**
 * Reads JWT `sub` (user id) without verifying signature — UI/storage namespacing only; API enforces auth.
 * @param {string | null} token
 * @returns {number | null}
 */
export function getUserIdFromToken(token) {
  if (!token || typeof token !== 'string') {
    return null
  }
  const parts = token.split('.')
  if (parts.length !== 3) {
    return null
  }
  let b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
  while (b64.length % 4) {
    b64 += '='
  }
  try {
    const payload = JSON.parse(atob(b64))
    const sub = payload?.sub
    const n = parseInt(sub, 10)
    return Number.isFinite(n) && n > 0 ? n : null
  } catch {
    return null
  }
}

/**
 * Per-user localStorage key. When not logged in, returns an isolated prelogin bucket (unused on gated routes).
 * @param {string} suffix stable suffix e.g. 'xp', 'completed_lessons'
 */
export function storageKey(suffix) {
  const uid = getUserIdFromToken(getAuthToken())
  if (uid == null) {
    return `akademiweal_prelogin_${suffix}`
  }
  return `akademiweal_u${uid}_${suffix}`
}

const LEGACY_KEYS = {
  xp: 'akademiweal_xp',
  daily_xp: 'akademiweal_daily_xp',
  streak_days: 'akademiweal_streak_days',
  last_activity_date: 'akademiweal_last_activity_date',
  lives: 'akademiweal_lives',
  completed_lessons: 'akademiweal_completed_lessons',
  lesson_stars: 'akademiweal_lesson_stars',
  onboarding_done: 'akademiweal_onboarding_done',
  onboarding_goal: 'akademiweal_onboarding_goal',
  onboarding_time: 'akademiweal_onboarding_time',
}

/**
 * One-time copy from old global keys into `akademiweal_u{id}_*` so existing players keep progress after login.
 * @param {number} userId
 */
export function migrateLegacyProgressIfNeeded(userId) {
  const uid = String(userId)
  const namespaced = (suffix) => `akademiweal_u${uid}_${suffix}`
  try {
    for (const [suffix, legacyKey] of Object.entries(LEGACY_KEYS)) {
      const nextKey = namespaced(suffix)
      if (localStorage.getItem(nextKey) !== null) {
        continue
      }
      const v = localStorage.getItem(legacyKey)
      if (v !== null && v !== '') {
        localStorage.setItem(nextKey, v)
      }
    }
  } catch {
    /* ignore */
  }
}

/**
 * Merges guest (`akademiweal_prelogin_*`) progress into the logged-in user namespace, then clears prelogin keys.
 * Call after setAuthToken + migrateLegacyProgressIfNeeded.
 * @param {number} userId
 */
export function migrateGuestProgressToUser(userId) {
  const uid = String(userId)
  const ns = (suffix) => `akademiweal_u${uid}_${suffix}`
  const pre = (suffix) => `akademiweal_prelogin_${suffix}`

  try {
    const suffixes = Object.keys(LEGACY_KEYS)
    const hasGuest = suffixes.some((s) => localStorage.getItem(pre(s)) != null)
    if (!hasGuest) {
      return
    }

    const parseJsonObj = (raw) => {
      try {
        if (!raw) return {}
        const o = JSON.parse(raw)
        return typeof o === 'object' && o !== null ? o : {}
      } catch {
        return {}
      }
    }
    const parseJsonArr = (raw) => {
      try {
        if (!raw) return []
        const a = JSON.parse(raw)
        return Array.isArray(a) ? a.map(Number).filter(Number.isFinite) : []
      } catch {
        return []
      }
    }

    const gXp = parseInt(localStorage.getItem(pre('xp')) || '0', 10)
    const uXp = parseInt(localStorage.getItem(ns('xp')) || '0', 10)
    localStorage.setItem(
      ns('xp'),
      String(Math.max(Number.isFinite(gXp) ? gXp : 0, Number.isFinite(uXp) ? uXp : 0)),
    )

    const gDaily = parseJsonObj(localStorage.getItem(pre('daily_xp')))
    const uDaily = parseJsonObj(localStorage.getItem(ns('daily_xp')))
    const mergedDaily = { ...uDaily }
    for (const [k, v] of Object.entries(gDaily)) {
      mergedDaily[k] = (Number(mergedDaily[k]) || 0) + (Number(v) || 0)
    }
    localStorage.setItem(ns('daily_xp'), JSON.stringify(mergedDaily))

    const gSt = parseInt(localStorage.getItem(pre('streak_days')) || '0', 10)
    const uSt = parseInt(localStorage.getItem(ns('streak_days')) || '0', 10)
    localStorage.setItem(ns('streak_days'), String(Math.max(gSt, uSt)))

    const gLast = localStorage.getItem(pre('last_activity_date'))
    const uLast = localStorage.getItem(ns('last_activity_date'))
    const pickLast = !uLast ? gLast : !gLast ? uLast : gLast > uLast ? gLast : uLast
    if (pickLast) {
      localStorage.setItem(ns('last_activity_date'), pickLast)
    }

    const gLives = parseInt(localStorage.getItem(pre('lives')) || '3', 10)
    const uLives = parseInt(localStorage.getItem(ns('lives')) || '3', 10)
    localStorage.setItem(ns('lives'), String(Math.max(gLives, uLives)))

    const ids = new Set([...parseJsonArr(localStorage.getItem(ns('completed_lessons'))), ...parseJsonArr(localStorage.getItem(pre('completed_lessons')))])
    localStorage.setItem(ns('completed_lessons'), JSON.stringify(Array.from(ids)))

    const gStars = parseJsonObj(localStorage.getItem(pre('lesson_stars')))
    const uStars = parseJsonObj(localStorage.getItem(ns('lesson_stars')))
    const mergedStars = { ...uStars }
    for (const [k, v] of Object.entries(gStars)) {
      mergedStars[k] = Math.max(Number(mergedStars[k]) || 0, Number(v) || 0)
    }
    localStorage.setItem(ns('lesson_stars'), JSON.stringify(mergedStars))

    for (const suffix of ['onboarding_done', 'onboarding_goal', 'onboarding_time']) {
      const cur = localStorage.getItem(ns(suffix))
      if (cur == null || cur === '') {
        const g = localStorage.getItem(pre(suffix))
        if (g != null && g !== '') {
          localStorage.setItem(ns(suffix), g)
        }
      }
    }

    for (const s of suffixes) {
      localStorage.removeItem(pre(s))
    }
  } catch {
    /* ignore */
  }
}

/**
 * After login/register: honor deep link, else onboarding vs home.
 * @param {import('react-router-dom').NavigateFunction} navigate
 * @param {import('react-router-dom').Location} location
 */
export function navigateAfterAuth(navigate, location) {
  const fromPath = location.state?.from?.pathname
  if (
    fromPath &&
    fromPath !== '/login' &&
    fromPath !== '/register' &&
    fromPath !== '/sambung-belajar'
  ) {
    navigate(fromPath, { replace: true })
    return
  }
  try {
    if (localStorage.getItem(storageKey('onboarding_done')) === 'true') {
      navigate('/home', { replace: true })
    } else {
      navigate('/onboarding', { replace: true })
    }
  } catch {
    navigate('/onboarding', { replace: true })
  }
}
