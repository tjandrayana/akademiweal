import { getAuthToken } from '../api/client'
import { getUserIdFromToken } from './progressScope'

const DEFAULT_GUEST_MAX_FREE = 5
const CURRICULUM_PATH_MAX = 80

function readGuestMaxFreePathStep() {
  const raw = import.meta.env.VITE_GUEST_MAX_FREE_PATH_STEP
  if (raw == null || String(raw).trim() === '') {
    return DEFAULT_GUEST_MAX_FREE
  }
  const n = parseInt(String(raw), 10)
  if (!Number.isFinite(n) || n < 1) {
    return DEFAULT_GUEST_MAX_FREE
  }
  return Math.min(n, CURRICULUM_PATH_MAX)
}

/**
 * How many linear path steps (langkah 1…N) a guest can play before login/register.
 * Set `VITE_GUEST_MAX_FREE_PATH_STEP` in `.env` (default 5 when unset / invalid).
 */
export const GUEST_MAX_FREE_PATH_STEP = readGuestMaxFreePathStep()

/** Playful interstitial before login/register when the guest free path ends. */
export const GUEST_UNLOCK_PATH = '/sambung-belajar'

export function isLoggedIn() {
  const t = getAuthToken()
  return Boolean(t && getUserIdFromToken(t))
}

export function guestMustLoginForPathStep(pathStep) {
  if (isLoggedIn()) {
    return false
  }
  const n = Number(pathStep)
  return Number.isFinite(n) && n > GUEST_MAX_FREE_PATH_STEP
}
