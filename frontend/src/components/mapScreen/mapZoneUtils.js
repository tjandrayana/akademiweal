/**
 * Vertical stack order (top → bottom) in the full map scroll — matches MapScreen.css .zone-*--light heights.
 */

/** Pixel height per zone (must match MapScreen.css) */
export const ZONE_HEIGHT_PX = {
  8: 400,
  7: 380,
  6: 380,
  5: 370,
  4: 370,
  3: 370,
  2: 370,
  1: 420,
}

/** Zones drawn from top of canvas to bottom */
export const ZONE_STACK_TOP_TO_BOTTOM = [8, 7, 6, 5, 4, 3, 2, 1]

/** Learning order for pagination (Penny → Dragon) */
export const ZONE_LEARNING_ORDER = [1, 2, 3, 4, 5, 6, 7, 8]

export const MAP_PATH_SVG_HEIGHT = 3400

/** Y offset of a zone’s top edge inside the full path/canvas coordinate system */
export function zoneStackOffsetY(zoneId) {
  let y = 0
  for (const z of ZONE_STACK_TOP_TO_BOTTOM) {
    if (z === zoneId) return y
    y += ZONE_HEIGHT_PX[z] ?? 360
  }
  return 0
}

export function totalStackHeightPx() {
  return ZONE_STACK_TOP_TO_BOTTOM.reduce((s, z) => s + (ZONE_HEIGHT_PX[z] ?? 360), 0)
}

/** Global map has 80 langkah: zona Z = langkah (Z-1)*10 + 1 … Z*10 */
const MAP_STEP_MAX = 80

/**
 * Which zone contains this map level (1 … 80).
 * @param {number} mapLevel
 * @returns {number} zone id 1–8
 */
export function findZoneForMapLevel(mapLevel) {
  if (!Number.isFinite(mapLevel) || mapLevel < 1) return 1
  if (mapLevel > MAP_STEP_MAX) return 8
  return Math.ceil(mapLevel / 10)
}
