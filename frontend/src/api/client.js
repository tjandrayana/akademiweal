/**
 * API client — agent/frontend.md: attach token, handle errors, do not assume success.
 */

export const TOKEN_KEY = 'token'

function stripTrailingSlash(s) {
  return s.replace(/\/$/, '')
}

let missingProdApiUrlWarned = false

function apiBaseURL() {
  /**
   * Development: same-origin `/api` → Vite proxies to `VITE_API_URL` (see vite.config.js).
   * Production: `VITE_API_URL` only (`https://…` or path-only `/api` if you terminate API on the same host).
   */
  if (import.meta.env.DEV) {
    return ''
  }

  const rawUrl = import.meta.env.VITE_API_URL
  if (rawUrl != null && String(rawUrl).trim() !== '') {
    return stripTrailingSlash(String(rawUrl).trim())
  }

  if (import.meta.env.PROD && typeof window !== 'undefined' && !missingProdApiUrlWarned) {
    missingProdApiUrlWarned = true
    console.warn(
      '[AkademiWeal] VITE_API_URL is unset; using same-origin /api. Set VITE_API_URL for production (e.g. https://akademiweal.drghartanto.com).',
    )
  }
  return ''
}

let mixedContentWarned = false

/** Call after apiBaseURL() in the browser — HTTPS pages cannot fetch http:// APIs. */
function warnIfMixedContent(base) {
  if (mixedContentWarned || typeof window === 'undefined' || !base) return
  if (!window.location.protocol.startsWith('https')) return
  if (!base.startsWith('http://')) return
  mixedContentWarned = true
  console.error(
    '[AkademiWeal API] Mixed content: HTTPS page but API base is http://… Browsers block that. ' +
      'Set VITE_API_URL to https://your-api or use path-only /api behind a same-origin proxy.',
  )
}

function buildURL(pathWithQuery) {
  const path = pathWithQuery.startsWith('/') ? pathWithQuery : `/${pathWithQuery}`
  const base = apiBaseURL()
  warnIfMixedContent(base)
  if (base) {
    return `${base}${path}`
  }
  return `/api${path}`
}

function notifyUnauthorized() {
  try {
    window.dispatchEvent(new CustomEvent('api:unauthorized'))
  } catch {
    /* ignore */
  }
}

async function parseJsonResponse(res) {
  try {
    return await res.json()
  } catch {
    return {}
  }
}

/**
 * @param {Response} res
 * @param {{ skipUnauthorizedEvent?: boolean }} [opts]
 */
async function handleEnvelope(res, opts = {}) {
  const body = await parseJsonResponse(res)

  if (res.status === 401) {
    try {
      localStorage.removeItem(TOKEN_KEY)
    } catch {
      /* ignore */
    }
    if (!opts.skipUnauthorizedEvent) {
      notifyUnauthorized()
    }
    throw new Error('Session expired. Sign in again.')
  }

  if (!res.ok) {
    const err = body?.error
    const msg =
      typeof err === 'string' && err.length > 0
        ? err
        : `Request failed (${res.status})`
    throw new Error(msg)
  }

  if (body?.error != null && body.error !== '') {
    throw new Error(String(body.error))
  }

  return body.data
}

/**
 * @param {string} pathWithQuery
 * @param {{ signal?: AbortSignal, skipAuth?: boolean }} [opts]
 */
export async function apiGet(pathWithQuery, opts = {}) {
  const { signal, skipAuth } = opts
  const token = skipAuth ? null : localStorage.getItem(TOKEN_KEY)
  const headers = {
    Accept: 'application/json',
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(buildURL(pathWithQuery), {
    method: 'GET',
    signal,
    headers,
  })

  return handleEnvelope(res)
}

/**
 * @param {string} pathWithQuery
 * @param {object} [jsonBody]
 * @param {{ signal?: AbortSignal, skipAuth?: boolean }} [opts]
 */
export async function apiPost(pathWithQuery, jsonBody, opts = {}) {
  const { signal, skipAuth } = opts
  const token = skipAuth ? null : localStorage.getItem(TOKEN_KEY)
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(buildURL(pathWithQuery), {
    method: 'POST',
    signal,
    headers,
    body: JSON.stringify(jsonBody ?? {}),
  })

  return handleEnvelope(res, {
    skipUnauthorizedEvent: Boolean(skipAuth),
  })
}

export function setAuthToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearAuthToken() {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* ignore */
  }
}

export function getAuthToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}
