import { useEffect, useState } from 'react'
import {
  XP_KEY,
  XP_UPDATED_EVENT,
  STREAK_UPDATED_EVENT,
  COMPLETED_LESSONS_EVENT,
  LIVES_UPDATED_EVENT,
  STREAK_KEY,
  getCompletedLessons,
  getLevel,
  getLevelName,
  getXpForNextLevel,
  getXpInCurrentLevel,
  getMascotEvolutionLevel,
  getLives,
} from '../lib/gamification'

function readStats() {
  try {
    const streak = parseInt(localStorage.getItem(STREAK_KEY) || '0', 10)
    const xp = parseInt(localStorage.getItem(XP_KEY) || '0', 10)
    const safeStreak = Number.isFinite(streak) ? streak : 0
    const safeXp = Number.isFinite(xp) ? xp : 0
    return {
      streak: safeStreak,
      xp: safeXp,
      level: getLevel(safeXp),
      levelName: getLevelName(safeXp),
      xpForNext: getXpForNextLevel(safeXp),
      xpInLevel: getXpInCurrentLevel(safeXp),
      mascotEvolutionLevel: getMascotEvolutionLevel(safeXp),
      completedLessons: getCompletedLessons(),
      lives: getLives(),
    }
  } catch {
    return {
      streak: 0,
      xp: 0,
      level: 1,
      levelName: 'Pemula',
      xpForNext: 50,
      xpInLevel: 0,
      mascotEvolutionLevel: 1,
      completedLessons: new Set(),
      lives: 3,
    }
  }
}

/**
 * Reactive gamification stats.
 * Re-reads when XP or completed-lessons are updated.
 *
 * @returns {{ streak, xp, level, levelName, xpForNext, xpInLevel, mascotEvolutionLevel, completedLessons, lives }}
 */
export function useGamificationStats() {
  const [stats, setStats] = useState(() => readStats())

  useEffect(() => {
    function refresh() {
      setStats(readStats())
    }
    window.addEventListener(XP_UPDATED_EVENT, refresh)
    window.addEventListener(STREAK_UPDATED_EVENT, refresh)
    window.addEventListener(COMPLETED_LESSONS_EVENT, refresh)
    window.addEventListener(LIVES_UPDATED_EVENT, refresh)
    return () => {
      window.removeEventListener(XP_UPDATED_EVENT, refresh)
      window.removeEventListener(STREAK_UPDATED_EVENT, refresh)
      window.removeEventListener(COMPLETED_LESSONS_EVENT, refresh)
      window.removeEventListener(LIVES_UPDATED_EVENT, refresh)
    }
  }, [])

  return stats
}
