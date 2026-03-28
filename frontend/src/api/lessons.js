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
