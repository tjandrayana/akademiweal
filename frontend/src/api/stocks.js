import { apiGet, apiPost } from './client'

/**
 * @typedef {object} StockFeedItem
 * @property {string} code
 * @property {string} name
 * @property {string} sector
 * @property {boolean} is_premium
 * @property {number} price_close
 * @property {number} price_change_pct
 * @property {string} volume_label
 * @property {string} market_cap_label
 * @property {string} pe_ratio
 * @property {string} ai_summary_snip
 * @property {string} snapshot_date
 */

/**
 * @typedef {object} StockDetail
 * @property {string} code
 * @property {string} name
 * @property {string} sector
 * @property {boolean} is_premium
 * @property {number} price_close
 * @property {number} price_change_pct
 * @property {string} volume_label
 * @property {string} market_cap_label
 * @property {string} pe_ratio
 * @property {string} ai_summary
 * @property {string} quiz_question
 * @property {string[]} quiz_options
 * @property {string} snapshot_date
 */

/** @returns {Promise<StockFeedItem[]>} */
export function fetchStockFeed(opts) {
  return apiGet('/stocks/feed', opts).then(d => d?.stocks ?? [])
}

/**
 * @param {string} code
 * @returns {Promise<StockDetail>}
 */
export function fetchStockToday(code, opts) {
  return apiGet(`/stocks/${code}/today`, opts)
}

/**
 * @param {string} code
 * @param {number} answerIndex
 * @returns {Promise<{ correct: boolean, xp: number, explanation: string }>}
 */
export function submitStockQuiz(code, answerIndex) {
  return apiPost(`/stocks/${code}/quiz`, { answer_index: answerIndex })
}

/** @returns {Promise<{ rank: number }>} */
export function fetchMyRank() {
  return apiGet('/me/rank')
}
