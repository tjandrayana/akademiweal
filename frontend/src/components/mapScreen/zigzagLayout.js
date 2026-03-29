/**
 * Percent-based zig-zag layout for one zone (9 lesson nodes + boss).
 * Vertical distribution uses even spacing in the middle band; boss is anchored
 * bottom-center so it stays clear of the bottom nav safe area when the map
 * fills the viewport (see MapContainer).
 */

/** Alternate horizontal rails — mobile-first, keeps nodes inside safe margins */
const RAIL_LEFT = '17%'
const RAIL_RIGHT = '83%'

/**
 * @returns {{ left: string, top: string }[]} length 10 — indices 0–8 lessons, 9 boss
 */
export function getZigzagSlotPositions() {
  /** Lesson row tops: upper band through lower-mid (boss sits below in reserved band) */
  const positions = []
  for (let i = 0; i < 9; i++) {
    const t = 12 + (i / 8) * 54
    positions.push({
      left: i % 2 === 0 ? RAIL_LEFT : RAIL_RIGHT,
      top: `${t}%`,
    })
  }
  positions.push({ left: '50%', top: '82%' })
  return positions
}

/**
 * Normalized points for SVG path in viewBox "0 0 100 100" (percentage space).
 * @returns {{ x: number, y: number }[]}
 */
export function getZigzagPathPointsNormalized() {
  return getZigzagSlotPositions().map((p) => ({
    x: parseFloat(p.left) || 0,
    y: parseFloat(p.top) || 0,
  }))
}
