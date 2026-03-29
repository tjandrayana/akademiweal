import clsx from 'clsx'

/**
 * Boss node — larger, warm aura, optional reward hint from popup data.
 */
export function BossNode({ node, status, onActivate, rewardPreview }) {
  const locked = status === 'locked'
  const isCurrent = status === 'current'

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
        'map-node map-node--boss',
        status,
        isCurrent && 'map-node--current map-node--enter-pulse',
      )}
      onClick={handleClick}
      onKeyDown={handleKey}
      aria-label={locked ? 'Boss terkunci' : 'Boss zona, tantangan akhir'}
    >
      <span className="map-node-boss-aura" aria-hidden="true" />
      <span className="map-node-boss-icon">{node.icon}</span>
      <span className="map-node-boss-label">BOSS</span>
      {rewardPreview ? (
        <span className="map-node-boss-reward">{rewardPreview}</span>
      ) : null}
    </button>
  )
}
