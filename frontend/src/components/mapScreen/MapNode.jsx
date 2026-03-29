import clsx from 'clsx'

/**
 * Standard lesson node — completed / current / locked.
 * Parent `.map-node-anchor` supplies absolute position (percent).
 */
export function MapNode({ node, status, onActivate, floatDelay = 0 }) {
  const locked = status === 'locked'
  const isCurrent = status === 'current'

  const numColor = locked ? '#7A8AA8' : status === 'completed' ? '#ffffff' : '#7A4000'
  const starColor = locked ? null : status === 'completed' ? '#FFE840' : '#7A4000'

  function handleClick() {
    if (!locked) onActivate(node)
  }
  function handleKey(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  return (
    <button
      type="button"
      disabled={locked}
      tabIndex={locked ? -1 : 0}
      className={clsx(
        'map-node map-node--lesson',
        status,
        isCurrent && 'map-node--current map-node--enter-pulse',
      )}
      style={{
        animationDelay: locked ? undefined : `${floatDelay}s`,
      }}
      onClick={handleClick}
      onKeyDown={handleKey}
      aria-label={
        locked
          ? `Langkah ${node.level} terkunci`
          : `Langkah ${node.level}${status === 'completed' ? ', selesai' : ', aktif'}`
      }
    >
      <span className="map-node-num" style={{ color: numColor }}>
        {node.level}
      </span>
      <div className="map-node-stars">
        {locked ? (
          <span className="map-node-lock" aria-hidden="true">
            🔒
          </span>
        ) : (
          (node.stars || [1, 1, 1]).map((s, i) => (
            <span
              key={i}
              className="map-node-star"
              style={{ color: s ? starColor : 'rgba(255,255,255,0.25)' }}
              aria-hidden="true"
            >
              ★
            </span>
          ))
        )}
      </div>
    </button>
  )
}
