import { getZigzagPathPointsNormalized } from './zigzagLayout'

/**
 * Dashed trail connecting zig-zag slots in normalized 0–100 coordinates.
 * Renders above dimmed scenery, below nodes.
 */
export function MapPath({ zoneAccent = '#ffffff' }) {
  const pts = getZigzagPathPointsNormalized()
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  return (
    <svg
      className="map-path-svg"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d={d}
        fill="none"
        stroke="white"
        strokeWidth="1.2"
        strokeOpacity="0.18"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d={d}
        fill="none"
        stroke={zoneAccent}
        strokeWidth="0.55"
        strokeOpacity="0.75"
        strokeDasharray="3 2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        className="map-path-dash"
      />
    </svg>
  )
}
