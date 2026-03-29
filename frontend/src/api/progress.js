/**
 * Server XP sync + leaderboard (envelope: body.data).
 */

import { apiGet, apiPost, getAuthToken } from './client'
import { getTotalXp, mergeServerXp } from '../lib/gamification'

/**
 * @returns {Promise<{ user_id: number, xp: number }>}
 */
export async function fetchMeProgress() {
  return apiGet('/me')
}

/**
 * Pushes local total XP; server uses GREATEST; merges response back into local.
 * @param {number} total
 */
export async function syncXpTotal(total) {
  if (!getAuthToken()) {
    return null
  }
  const t = Math.max(0, Math.floor(Number(total) || 0))
  const data = await apiPost('/me/sync', { xp: t })
  if (data && typeof data.xp === 'number') {
    mergeServerXp(data.xp)
  }
  return data
}

/** Pull /me then push current local so server catches offline gains. */
export async function pullAndPushXp() {
  if (!getAuthToken()) return
  try {
    const me = await fetchMeProgress()
    if (me && typeof me.xp === 'number') {
      mergeServerXp(me.xp)
    }
  } catch {
    /* offline / 401 — ignore */
  }
  try {
    await syncXpTotal(getTotalXp())
  } catch {
    /* ignore */
  }
}

/**
 * @param {number} [limit]
 * @returns {Promise<{ entries: Array<{ rank: number, user_id: number, xp: number, label: string }> }>}
 */
export async function fetchLeaderboard(limit = 50) {
  const q = new URLSearchParams()
  if (limit) q.set('limit', String(limit))
  const qs = q.toString()
  return apiGet(`/leaderboard${qs ? `?${qs}` : ''}`, { skipAuth: true })
}
