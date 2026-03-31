import clsx from 'clsx'
import { useCallback, useEffect, useMemo, useState } from 'react'
import './MapScreen.css'
import MascotEvolution from './MascotEvolution'
import { defaultMapProgress, MAP_NODES } from './mapScreen/mapNodes'
import { findZoneForMapLevel } from './mapScreen/mapZoneUtils'
import { MapContainer } from './mapScreen/MapContainer'

const ZONES_TOTAL = 10

const ZONE_BANNER_META = {
  10: {
    label: '🧠 Lembah Pikiran',
    range: 'Langkah 91–100',
    rangeStyle: { background: '#F3E8FF', color: '#6B21A8' },
  },
  9: {
    label: '📊 Puncak Strategi',
    range: 'Langkah 81–90',
    rangeStyle: { background: '#E0F2FE', color: '#0369A1' },
  },
  8: {
    label: '🐉 Bawah Tanah Naga',
    range: 'Langkah 71–80',
    rangeStyle: { background: '#FFE8D8', color: '#E05020' },
  },
  7: {
    label: '🏔 Puncak Kripto',
    range: 'Langkah 61–70',
    rangeStyle: { background: '#F0E8FF', color: '#8040C0' },
  },
  6: {
    label: '🌿 Lembah Dividen',
    range: 'Langkah 51–60',
    rangeStyle: { background: '#E0F8E8', color: '#1A9A40' },
  },
  5: {
    label: '🏛 Kerajaan ETF',
    range: 'Langkah 41–50',
    rangeStyle: { background: '#FFF3D0', color: '#C87000' },
  },
  4: {
    label: '🌊 Teluk Obligasi',
    range: 'Langkah 31–40',
    rangeStyle: { background: '#E0F0FF', color: '#1870C0' },
  },
  3: {
    label: '🏙 Jalan Saham',
    range: 'Langkah 21–30',
    rangeStyle: { background: '#E8E8FF', color: '#4040C0' },
  },
  2: {
    label: '🏜 Gurun Dolar',
    range: 'Langkah 11–20',
    rangeStyle: { background: '#FFE8D8', color: '#C24010' },
  },
  1: {
    label: '🌱 Dataran Penny',
    range: 'Langkah 1–10',
    rangeStyle: { background: '#E0F8E8', color: '#1A8A40' },
  },
}

const ZONE_ORDER = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]

const ZONE_LABEL_SHORT = {
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

/**
 * Learning map — full-height flex child: header rows + MapContainer (flex:1).
 * No internal vertical scroll; zig-zag layout lives in MapContainer.
 */
export default function MapScreen({
  progress: progressProp,
  showPageHeader = false,
  hideGameNav = false,
  hideHud = false,
  playerName = 'Investor',
  hudLevelLabel = '⚡ Pemula',
  coinsDisplay = '0',
  lives = 3,
  mascotEvolutionLevel = 1,
  guestMaxPathStep = null,
  stepCurrent,
  stepTotal,
  onPlayLevel,
  onSelectNode,
  className,
}) {
  const defaultProgress = useMemo(() => defaultMapProgress(), [])
  const progress = progressProp ?? defaultProgress
  const [popup, setPopup] = useState(null)
  const [navTab, setNavTab] = useState('map')
  const [activeZone, setActiveZone] = useState(() => findZoneForMapLevel(progress.currentMapLevel ?? 1))
  /** Short delay so current node can run entry pulse after mount */
  const [mapReady, setMapReady] = useState(false)

  const nodesByZone = useMemo(() => {
    const m = new Map()
    for (const z of ZONE_ORDER) m.set(z, MAP_NODES.filter((n) => n.zone === z))
    return m
  }, [])

  useEffect(() => {
    setActiveZone(findZoneForMapLevel(progress.currentMapLevel ?? 1))
  }, [progress.currentMapLevel])

  useEffect(() => {
    setMapReady(false)
    const id = requestAnimationFrame(() => setMapReady(true))
    return () => cancelAnimationFrame(id)
  }, [activeZone])

  const goPrevZone = useCallback(() => setActiveZone((z) => Math.max(1, z - 1)), [])
  const goNextZone = useCallback(() => setActiveZone((z) => Math.min(ZONES_TOTAL, z + 1)), [])
  const closePopup = useCallback(() => setPopup(null), [])

  const openNode = useCallback(
    (node) => {
      setPopup(node)
      onSelectNode?.(node)
    },
    [onSelectNode],
  )

  const handlePlay = useCallback(() => {
    if (!popup) return
    onPlayLevel?.(popup.level)
    closePopup()
  }, [popup, onPlayLevel, closePopup])

  const stepLabel =
    stepTotal != null && stepCurrent != null && stepTotal > 0
      ? `Langkah ${stepCurrent} dari ${stepTotal}`
      : null

  const meta = ZONE_BANNER_META[activeZone]
  const progressPct =
    stepTotal != null && stepCurrent != null && stepTotal > 0
      ? Math.min(100, Math.max(0, (stepCurrent / stepTotal) * 100))
      : 0

  const zoneNodes = nodesByZone.get(activeZone) ?? []

  return (
    <div className={clsx('iq-map-screen flex flex-col flex-1 min-h-0', className)}>
      {showPageHeader && (
        <header className="page-header shrink-0" style={{ textAlign: 'center', marginBottom: 24 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 4,
              textTransform: 'uppercase',
              color: '#FFB830',
              marginBottom: 10,
            }}
          >
            AkademiWeal · Peta Dunia
          </div>
          <div
            style={{
              fontFamily: "'Fredoka One',cursive",
              fontSize: 36,
              background: 'linear-gradient(135deg,#FFE060,#FFB830,#FF8C00)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            🗺 Peta Dunia
          </div>
        </header>
      )}

      <div className="map-shell map-shell--flex">
        {!hideHud && (
          <div className="game-hud shrink-0">
            <div className="hud-left">
              <div className="hud-avatar">
                <div style={{ marginTop: -2 }}>
                  <MascotEvolution level={mascotEvolutionLevel} size={48} />
                </div>
              </div>
              <div className="hud-text">
                <div className="hud-name">{playerName}</div>
                <div className="hud-level">{hudLevelLabel}</div>
                {stepLabel && <div className="hud-step">{stepLabel}</div>}
              </div>
            </div>
            <div className="hud-right">
              <div className="hud-coin" title="Total XP">
                <div className="hud-coin-icon">$</div>
                {coinsDisplay}
              </div>
              <div className="hud-lives" aria-label={`${lives} nyawa`}>
                {[...Array(3)].map((_, i) => (
                  <span key={i} className={clsx('hud-heart', i >= lives && 'hud-heart--empty')}>
                    ❤️
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="map-zone-header shrink-0">
          <div className="map-zone-pagination" role="navigation" aria-label="Pilih zona peta">
            <button
              type="button"
              className="map-zone-page-btn"
              onClick={goPrevZone}
              disabled={activeZone <= 1}
              aria-label="Zona sebelumnya"
            >
              ←
            </button>
            <div className="map-zone-page-info">
              <span className="map-zone-page-num">Zona {activeZone} / {ZONES_TOTAL}</span>
              <span className="map-zone-page-name">{ZONE_LABEL_SHORT[activeZone]}</span>
            </div>
            <button
              type="button"
              className="map-zone-page-btn"
              onClick={goNextZone}
              disabled={activeZone >= ZONES_TOTAL}
              aria-label="Zona berikutnya"
            >
              →
            </button>
          </div>

          {meta && (
            <div className="map-zone-progress-block">
              <div className="map-zone-progress-row">
                <span className="map-zone-range-pill" style={meta.rangeStyle}>
                  {meta.range}
                </span>
                {(stepTotal ?? 0) > 0 ? (
                  <span className="map-zone-progress-fraction" aria-live="polite">
                    {stepCurrent} / {stepTotal}
                  </span>
                ) : null}
              </div>
              <div
                className="map-zone-progress-track"
                role="progressbar"
                aria-valuenow={stepTotal > 0 ? stepCurrent : 0}
                aria-valuemin={0}
                aria-valuemax={stepTotal > 0 ? stepTotal : 0}
                aria-label="Progres pembelajaran"
              >
                <div className="map-zone-progress-fill" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* flex:1 — immersive map surface, no scroll */}
        <div className="map-stage">
          <MapContainer
            zoneId={activeZone}
            nodes={zoneNodes}
            progress={progress}
            mascotEvolutionLevel={mascotEvolutionLevel}
            guestMaxPathStep={guestMaxPathStep}
            onOpenNode={openNode}
            mapReady={mapReady}
          />
        </div>

        {popup && (
          <div className="iq-map-popup">
            <div
              className="iq-map-popup-strip"
              style={{ background: popup.popup?.stripColor ?? 'linear-gradient(90deg,#FFB830,#FF8C00)' }}
            />
            <div className="iq-map-popup-body">
              <div className="iq-map-popup-head">
                <div>
                  <div className="iq-map-popup-title">{popup.popup?.title ?? 'Level'}</div>
                  <div className="iq-map-popup-sub">{popup.popup?.sub ?? ''}</div>
                </div>
                <button type="button" onClick={closePopup} className="iq-map-popup-close" aria-label="Tutup">
                  ✕
                </button>
              </div>
              <div className="iq-map-popup-desc">{popup.popup?.desc}</div>
              <div className="iq-map-popup-actions">
                <div className="iq-map-popup-reward">🎁 {popup.popup?.reward}</div>
                <button
                  type="button"
                  onClick={handlePlay}
                  className={clsx('iq-map-popup-play', popup.popup?.isBossAction && 'iq-map-popup-play--boss')}
                >
                  {popup.popup?.isBossAction ? 'Tantang!' : 'Mulai!'}
                </button>
              </div>
            </div>
          </div>
        )}

        {!hideGameNav && (
          <nav className="game-nav shrink-0" aria-label="Map navigation">
            {[
              { id: 'map', icon: '🗺', label: 'Map' },
              { id: 'portfolio', icon: '📊', label: 'Portfolio' },
              { id: 'mascot', icon: '🐂', label: 'Mascot' },
              { id: 'ranks', icon: '🏆', label: 'Ranks' },
              { id: 'profile', icon: '👤', label: 'Profile' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                className={clsx('nav-btn', navTab === t.id && 'active')}
                onClick={() => setNavTab(t.id)}
              >
                <span className="nav-icon">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </nav>
        )}
      </div>
    </div>
  )
}
