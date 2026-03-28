/**
 * API client — agent/frontend.md: attach token, handle errors, do not assume success.
 */

export const TOKEN_KEY = 'token'

function apiBaseURL() {
  const full = import.meta.env.VITE_API_URL
  if (full != null && String(full).trim() !== '') {
    return String(full).replace(/\/$/, '')
  }
  // Dev: same-origin /api (Vite proxy — see vite.config.js).
  if (import.meta.env.DEV) {
    return ''
  }
  // Production: same full URL as dev proxy (Vercel must set this at build time; redeploy after changing).
  const proxyTarget = import.meta.env.VITE_API_PROXY_TARGET
  if (proxyTarget != null && String(proxyTarget).trim() !== '') {
    try {
      const u = new URL(proxyTarget)
      return u.origin
    } catch {
      /* ignore */
    }
  }
  const h = import.meta.env.VITE_API_HOST
  const p = import.meta.env.VITE_API_PORT
  const hasHost = h != null && String(h).trim() !== ''
  const hasPort = p != null && String(p).trim() !== ''
  if (!hasHost && !hasPort) {
    return ''
  }
  const host = hasHost ? String(h).trim() : 'localhost'
  const port = hasPort ? String(p).trim() : '9001'
  return `http://${host}:${port}`
}

function buildURL(pathWithQuery) {
  const path = pathWithQuery.startsWith('/') ? pathWithQuery : `/${pathWithQuery}`
  const base = apiBaseURL()
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
