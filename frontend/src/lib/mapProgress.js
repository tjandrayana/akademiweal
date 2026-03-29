/**
 * Maps AkademiWeal lesson completion to linear map step (1 … N lessons).
 */

export function flattenLessonsInOrder(lessonsByLevel, levelOrder) {
  return levelOrder.flatMap((lv) => lessonsByLevel[lv] || [])
}

export function computeLessonPathProgress(lessonsByLevel, completedLessonIds, levelOrder) {
  const flat = flattenLessonsInOrder(lessonsByLevel, levelOrder)
  const total = flat.length
  if (total === 0) {
    return {
      currentMapLevel: 1,
      completedLevels: new Set(),
      allComplete: false,
      stepTotal: 0,
      stepCurrent: 0,
    }
  }
  const done = flat.filter((l) => completedLessonIds.has(l.id)).length
  const allComplete = done >= total
  const currentMapLevel = allComplete ? total : Math.min(done + 1, total)
  return {
    currentMapLevel,
    completedLevels: new Set(),
    allComplete,
    stepTotal: total,
    stepCurrent: allComplete ? total : done + 1,
  }
}

export function lessonForMapLevel(mapLevel, lessonsByLevel, levelOrder) {
  const flat = flattenLessonsInOrder(lessonsByLevel, levelOrder)
  const lesson = flat[mapLevel - 1]
  if (!lesson) {
    return null
  }
  const pathLevel = levelOrder.find((lv) => (lessonsByLevel[lv] || []).some((l) => l.id === lesson.id))
  if (pathLevel == null) {
    return null
  }
  return { lesson, pathLevel }
}

/**
 * Global path index (1 … N) for a lesson id, or null if not in the flattened curriculum.
 * @param {number} lessonId
 * @param {Record<number, unknown[]>} lessonsByLevel
 * @param {number[]} levelOrder
 * @returns {number | null}
 */
export function lessonGlobalStep(lessonId, lessonsByLevel, levelOrder) {
  const flat = flattenLessonsInOrder(lessonsByLevel, levelOrder)
  const idx = flat.findIndex((l) => l.id === Number(lessonId))
  return idx >= 0 ? idx + 1 : null
}

/**
 * Same linear gating as `resolveMapNodeStatus` / map `node.level` vs `computeLessonPathProgress`.
 * @param {number} step1Based 1 … N in `flattenLessonsInOrder` order
 * @param {{ currentMapLevel: number, allComplete?: boolean }} progress
 * @returns {'completed' | 'current' | 'locked'}
 */
export function lessonStepOnPathStatus(step1Based, progress) {
  if (progress.allComplete) {
    return 'completed'
  }
  const L = step1Based
  const c = progress.currentMapLevel
  if (L < c) return 'completed'
  if (L === c) return 'current'
  return 'locked'
}

