/**
 * Map nodes — 10 zones × 10 langkah (global map level 1–100).
 * Positions: winding path template reused per zone (matches single-zone viewport).
 */

/** @typedef {'completed' | 'current' | 'locked'} MapNodeStatus */

const genericLocked = {
  title: 'Level terkunci',
  sub: 'Terus bermain',
  desc: 'Selesaikan langkah sebelumnya di jalur untuk membuka tahap ini.',
  reward: '—',
  isBossAction: false,
}

/**
 * @param {{ currentMapLevel: number, completedLevels: Set<number>, allComplete?: boolean }} progress
 * @param {{ level: number }} node
 * @param {{ guestMaxPathStep?: number | null }} [options] when set, guests cannot play nodes beyond this global step
 * @returns {MapNodeStatus}
 */
export function resolveMapNodeStatus(node, progress, options = {}) {
  const cap = options.guestMaxPathStep
  if (cap != null && Number.isFinite(cap) && node.level > cap) {
    return 'locked'
  }
  if (progress.allComplete) {
    return 'completed'
  }
  const { currentMapLevel, completedLevels } = progress
  const L = node.level
  if (completedLevels.has(L)) return 'completed'
  if (L === currentMapLevel) return 'current'
  if (L < currentMapLevel) return 'completed'
  return 'locked'
}

/**
 * Default demo progress.
 * @returns {{ currentMapLevel: number, completedLevels: Set<number> }}
 */
export function defaultMapProgress() {
  return {
    currentMapLevel: 1,
    completedLevels: new Set(),
  }
}

/**
 * Legacy pixel positions (unused at runtime). Live layout is percent zig-zag in
 * `zigzagLayout.js` + `MapContainer.jsx`.
 */
const NODE_TEMPLATE = [
  { left: 255, top: 45 },
  { left: 115, top: 77 },
  { left: 260, top: 109 },
  { left: 108, top: 141 },
  { left: 258, top: 173 },
  { left: 115, top: 205 },
  { left: 262, top: 237 },
  { left: 105, top: 269 },
  { left: 270, top: 301 },
  { left: 183, top: 328 },
]

const ZONE_BOSS_ICON = ['🌱', '🏜', '🏙', '🌊', '🏛', '🌿', '🏔', '🐉', '📊', '🧠']

const ZONE_BOSS_STYLE = [
  { borderColor: '#047857', boxShadow: '0 0 16px rgba(4,120,87,0.25)' },
  { borderColor: '#C2410C', boxShadow: '0 0 16px rgba(194,65,12,0.25)' },
  { borderColor: '#1E40AF', boxShadow: '0 0 16px rgba(30,64,175,0.25)' },
  { borderColor: '#1D4ED8', boxShadow: '0 0 16px rgba(29,78,216,0.25)' },
  { borderColor: '#A16207', boxShadow: '0 0 16px rgba(161,98,7,0.28)' },
  { borderColor: '#15803D', boxShadow: '0 0 16px rgba(21,128,61,0.28)' },
  { borderColor: '#5B21B6', boxShadow: '0 0 18px rgba(91,33,182,0.3)' },
  { borderColor: '#9A3412', boxShadow: '0 0 20px rgba(154,52,18,0.35)' },
  { borderColor: '#5B21B6', boxShadow: '0 0 18px rgba(91,33,182,0.28)' },
  { borderColor: '#9A3412', boxShadow: '0 0 20px rgba(154,52,18,0.32)' },
]

function buildMapNodes() {
  const nodes = []
  for (let zone = 1; zone <= 10; zone++) {
    const bossIcon = ZONE_BOSS_ICON[zone - 1]
    const bossChrome = ZONE_BOSS_STYLE[zone - 1]
    for (let i = 0; i < 10; i++) {
      const mapLevel = (zone - 1) * 10 + i + 1
      const stepInZone = i + 1
      const pos = NODE_TEMPLATE[i]
      const isBoss = stepInZone === 10

      if (isBoss) {
        nodes.push({
          id: `z${zone}-boss`,
          zone,
          left: pos.left,
          top: pos.top,
          level: mapLevel,
          role: 'boss',
          bossStyled: true,
          icon: bossIcon,
          customNodeStyle: bossChrome,
          bossLabelColor: '#EA580C',
          popup: {
            title: `Boss Zona ${zone}`,
            sub: 'Tantangan akhir',
            desc: 'Selesaikan tantangan untuk melanjutkan petualangan ke zona berikutnya.',
            reward: `${60 + zone * 20} XP + 🏆`,
            isBossAction: true,
          },
        })
      } else {
        nodes.push({
          id: `z${zone}-s${stepInZone}`,
          zone,
          left: pos.left,
          top: pos.top,
          level: mapLevel,
          role: 'lesson',
          popup: {
            title: `Langkah ${mapLevel}`,
            sub: `Zona ${zone} · Latihan ${stepInZone}`,
            desc: 'Selesaikan kuis untuk mengumpulkan XP dan membuka jalan ke langkah berikutnya.',
            reward: `${12 + stepInZone * 3} XP + 🪙`,
            isBossAction: false,
          },
          stars: [1, 1, 1],
        })
      }
    }
  }
  return nodes
}

export const MAP_NODES = buildMapNodes()
