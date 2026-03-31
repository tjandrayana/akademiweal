import clsx from 'clsx'
import { ZonePennyPlainsScenery } from './ZonePennyPlainsScenery'
import { SCENERY_BY_ZONE, ZONE_VIEWBOX } from './zoneSceneryHtml'
import { MapPath } from './MapPath'
import { BossNode } from './BossNode'
import { MapNode } from './MapNode'
import { MapAvatar } from './MapAvatar'
import { resolveMapNodeStatus } from './mapNodes'
import { getZigzagSlotPositions } from './zigzagLayout'

/** Accent for dashed path — tuned per zone */
const ZONE_PATH_ACCENT = {
  1: '#38bdf8',
  2: '#ea580c',
  3: '#6366f1',
  4: '#0ea5e9',
  5: '#d97706',
  6: '#16a34a',
  7: '#9333ea',
  8: '#f97316',
  9: '#7c3aed',
  10: '#ea580c',
}

/**
 * Full-bleed map stage: dimmed scenery + trail + nodes + avatar on current.
 * Fills parent height (flex:1) — parent must be flex column with min-h-0.
 */
export function MapContainer({
  zoneId,
  nodes,
  progress,
  mascotEvolutionLevel,
  onOpenNode,
  mapReady,
  guestMaxPathStep = null,
}) {
  const slots = getZigzagSlotPositions()
  const sorted = [...nodes].sort((a, b) => a.level - b.level)
  const pathAccent = ZONE_PATH_ACCENT[zoneId] ?? '#ffffff'

  return (
    <div className={clsx('map-container', mapReady && 'map-container--ready')}>
      {/* Background: full height, slightly darkened for node contrast */}
      <div className="map-container-bg">
        {zoneId === 1 ? (
          <ZonePennyPlainsScenery />
        ) : (
          <svg
            className="map-container-scenery"
            viewBox={ZONE_VIEWBOX[zoneId]}
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: SCENERY_BY_ZONE[zoneId] }}
          />
        )}
      </div>

      <div className="map-container-trail">
        <MapPath zoneAccent={pathAccent} />
      </div>

      <div className="map-container-nodes">
        {sorted.map((node, idx) => {
          const status = resolveMapNodeStatus(node, progress, {
            guestMaxPathStep: guestMaxPathStep ?? undefined,
          })
          const pos = slots[idx] ?? slots[slots.length - 1]
          const isBoss = node.role === 'boss'

          const anchorClass = clsx(
            'map-node-anchor',
            status === 'current' && 'map-node-anchor--current',
            status === 'locked' && 'map-node-anchor--locked',
          )

          if (isBoss) {
            const reward =
              typeof node.popup?.reward === 'string' ? node.popup.reward.split('+')[0].trim() : null
            return (
              <div
                key={node.id}
                className={anchorClass}
                style={{ left: pos.left, top: pos.top }}
              >
                {status === 'current' ? (
                  <div className="map-node-avatar-wrap">
                    <MapAvatar mascotEvolutionLevel={mascotEvolutionLevel} />
                  </div>
                ) : null}
                <BossNode node={node} status={status} onActivate={onOpenNode} rewardPreview={reward} />
              </div>
            )
          }

          return (
            <div key={node.id} className={anchorClass} style={{ left: pos.left, top: pos.top }}>
              {status === 'current' ? (
                <div className="map-node-avatar-wrap">
                  <MapAvatar mascotEvolutionLevel={mascotEvolutionLevel} />
                </div>
              ) : null}
              <MapNode node={node} status={status} onActivate={onOpenNode} floatDelay={idx * 0.12} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
