/**
 * Client → POST /events (non-blocking). Uses requestIdleCallback or setTimeout(0); errors ignored.
 * Works with or without JWT; backend stores user_id when Bearer is valid.
 */

import { apiPost, getAuthToken } from '../api/client'

const APP_OPEN_KEY = 'akademiweal_tracking_app_open'

/** Allowed analytics names (must match backend allowedEventNames). */
export const EVENTS = {
  APP_OPEN: 'app_open',
  LESSON_START: 'lesson_start',
  ANSWER_CLICK: 'answer_click',
  LESSON_COMPLETE: 'lesson_complete',
}

function scheduleSend(run) {
  if (typeof window === 'undefined') {
    return
  }
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(() => run(), { timeout: 3000 })
  } else {
    setTimeout(run, 0)
  }
}

/**
 * @param {string} eventName
 * @param {Record<string, unknown>} [metadata]
 */
export function trackEvent(eventName, metadata = {}) {
  const meta = metadata && typeof metadata === 'object' ? metadata : {}
  scheduleSend(() => {
    void apiPost(
      '/events',
      { event_name: eventName, metadata: meta },
      { skipAuth: !getAuthToken() },
    ).catch(() => {})
  })
}

/** Once per tab session after auth (sends only if JWT present). */
export function trackAppOpen() {
  if (!getAuthToken()) {
    return
  }
  try {
    if (sessionStorage.getItem(APP_OPEN_KEY) === '1') {
      return
    }
    sessionStorage.setItem(APP_OPEN_KEY, '1')
  } catch {
    /* ignore */
  }
  trackEvent(EVENTS.APP_OPEN, {})
}
