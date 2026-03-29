/**
 * Maps AkademiWeal lesson completion to InvestQuest map step (1 … N lessons).
 */

export function flattenLessonsInOrder(lessonsByLevel, levelOrder) {
  return levelOrder.flatMap((lv) => lessonsByLevel[lv] || [])
}

export function computeInvestQuestMapProgress(lessonsByLevel, completedLessonIds, levelOrder) {
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
