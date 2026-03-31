import { apiGet } from './client'

/**
 * @typedef {object} LessonDTO
 * @property {number} id
 * @property {number} level
 * @property {string} title
 * @property {string} question
 * @property {string[]} options
 * @property {string} answer
 * @property {string} [hook]
 * @property {string} [body]
 * @property {string} [explanation]
 * @property {string} [insight]
 * @property {string} [source_reference]
 */

/**
 * @param {number} level
 * @param {{ signal?: AbortSignal }} [opts]
 * @returns {Promise<LessonDTO[]>}
 */
export function fetchLessonsByLevel(level, opts) {
  const q = new URLSearchParams({ level: String(level) })
  return apiGet(`/lessons?${q.toString()}`, opts)
}

/** Same query in flight → one HTTP request (safe now that we do not abort shared fetches). */
const bulkInflight = new Map()

/**
 * Batch-fetch lessons for one HTTP request (GET /lessons?levels=1,2,3).
 * @param {number[]} levels
 * @param {{ signal?: AbortSignal }} [opts]
 * @returns {Promise<Record<string, LessonDTO[]>>} keys are level strings "1","2",…
 */
export function fetchLessonsByLevels(levels, opts) {
  const key = [...levels].sort((a, b) => a - b).join(',')
  const pending = bulkInflight.get(key)
  if (pending) {
    return pending
  }
  const q = new URLSearchParams({ levels: key })
  const p = apiGet(`/lessons?${q.toString()}`, opts).finally(() => {
    bulkInflight.delete(key)
  })
  bulkInflight.set(key, p)
  return p
}
