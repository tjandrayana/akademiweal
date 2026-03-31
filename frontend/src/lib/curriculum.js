/** 10 akademi levels × 10 lessons = 100 langkah (satu zona peta per level). */
export const CURRICULUM_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

/** Shared with Home + Pelajaran so lesson batch cache stays in sync. */
export const LEVELS_CACHE_KEY = 'akademiweal_levels_cache'

/** @returns {Record<number, unknown[]>} */
export function readLevelsCache() {
  try {
    const raw = localStorage.getItem(LEVELS_CACHE_KEY)
    if (raw) {
      const p = JSON.parse(raw)
      return typeof p === 'object' && p !== null ? p : {}
    }
  } catch {
    /* ignore */
  }
  return {}
}

/** Short zone titles — aligned with `MapScreen` zona copy. */
export const AKADEMI_ZONE_SHORT = {
  1: 'Dataran Penny',
  2: 'Gurun Dolar',
  3: 'Jalan Saham',
  4: 'Teluk Obligasi',
  5: 'Kerajaan ETF',
  6: 'Lembah Dividen',
  7: 'Puncak Kripto',
  8: 'Bawah Tanah Naga',
  9: 'Puncak Strategi',
  10: 'Lembah Pikiran',
}
