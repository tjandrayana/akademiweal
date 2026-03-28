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

/**
 * Batch-fetch lessons for one HTTP request (GET /lessons?levels=1,2,3).
 * (No in-flight dedupe: sharing one fetch across Strict Mode mounts caused aborted requests to reject shared promises.)
 * @param {number[]} levels
 * @param {{ signal?: AbortSignal }} [opts]
 * @returns {Promise<Record<string, LessonDTO[]>>} keys are level strings "1","2",…
 */
export function fetchLessonsByLevels(levels, opts) {
  const key = [...levels].sort((a, b) => a - b).join(',')
  const q = new URLSearchParams({ levels: key })
  return apiGet(`/lessons?${q.toString()}`, opts)
}
