import { getTotalXp, mergeServerXp, XP_UPDATED_EVENT } from '../lib/gamification'
import { getUserIdFromToken, migrateGuestProgressToUser, migrateLegacyProgressIfNeeded } from '../lib/progressScope'
import { apiPost, setAuthToken } from './client'
import { syncXpTotal } from './progress'

async function applyAuthPayload(data) {
  if (!data || typeof data.token !== 'string') {
    throw new Error('Jawaban server tidak valid')
  }
  setAuthToken(data.token)
  const uid = getUserIdFromToken(data.token)
  if (uid != null) {
    migrateLegacyProgressIfNeeded(uid)
    migrateGuestProgressToUser(uid)
    // Notify any mounted HUD components that XP may have changed after guest merge
    try { window.dispatchEvent(new CustomEvent(XP_UPDATED_EVENT)) } catch { /* ignore */ }
  }
  if (typeof data.xp === 'number' && Number.isFinite(data.xp)) {
    mergeServerXp(data.xp)
  }
  try {
    await syncXpTotal(getTotalXp())
  } catch {
    /* best-effort push */
  }
  return data.token
}

/**
 * POST /register with email + password; stores JWT on success.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<string>} token
 */
export async function registerWithEmail(email, password) {
  const data = await apiPost('/register', { email, password }, { skipAuth: true })
  return applyAuthPayload(data)
}

/**
 * POST /login with email + password; stores JWT on success.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<string>} token
 */
export async function loginWithEmail(email, password) {
  const data = await apiPost('/login', { email, password }, { skipAuth: true })
  return applyAuthPayload(data)
}
