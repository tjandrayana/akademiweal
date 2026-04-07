import { apiGet, apiPost } from './client'

/** @returns {Promise<import('./arena').ArenaHomeData>} */
export function fetchArenaToday() {
  return apiGet('/arena/today')
}

/**
 * @param {{ stock_code: string, order_type: 'buy'|'sell', lots: number, limit_price: number }} body
 */
export function placeArenaOrder(body) {
  return apiPost('/arena/orders', body)
}

/** @param {number} id */
export function cancelArenaOrder(id) {
  return apiPost(`/arena/orders/${id}/cancel`, {})
}

/** @returns {Promise<{ entries: ArenaLBEntry[] }>} */
export function fetchArenaLeaderboard() {
  return apiGet('/arena/leaderboard')
}

/**
 * Intraday bars up to the current simulated clock time (live mode).
 * @param {string} code
 * @param {{ signal?: AbortSignal }} [opts]
 * @returns {Promise<{ bars: MinuteBar[], current_price: number }>}
 */
export function fetchStockBars(code, opts) {
  return apiGet(`/stocks/${code}/bars`, opts)
}

/**
 * All bars for a given date — used by simulation playback mode.
 * @param {string} code
 * @param {string} [date]  YYYY-MM-DD; omit to use last trading day
 * @param {{ signal?: AbortSignal }} [opts]
 * @returns {Promise<{ bars: MinuteBar[], current_price: number }>}
 */
export function fetchAllBars(code, date, opts) {
  const qs = date ? `full=1&date=${encodeURIComponent(date)}` : 'full=1'
  return apiGet(`/stocks/${code}/bars?${qs}`, opts)
}

/**
 * Returns the list of dates that have bar data for a stock (newest first).
 * @param {string} code
 * @returns {Promise<{ dates: string[] }>}
 */
export function fetchSimDates(code) {
  return apiGet(`/stocks/${code}/sim-dates`)
}

/**
 * Fetch bars from Yahoo Finance for a specific date and store them in the DB.
 * If bars already exist in the DB, returns them directly.
 * @param {string} code
 * @param {string} date  YYYY-MM-DD
 * @param {{ signal?: AbortSignal }} [opts]
 * @returns {Promise<{ bars: MinuteBar[], current_price: number }>}
 */
export function fetchOrImportBars(code, date, opts) {
  return apiPost(`/stocks/${code}/fetch-bars`, { date }, opts)
}
