import clsx from 'clsx'
import { TIERS } from '../MascotEvolution'

const TIER_CLASS = ['t-bronze', 't-silver', 't-gold', 't-platinum', 't-legend']

/** Short labels — Indonesian */
const TIER_LABELS_ID = ['Perunggu', 'Perak', 'Emas', 'Platinum', 'Legenda']

/**
 * Horizontal evolution timeline — tap a tier (Level 1–5) to open mascot detail.
 * @param {{ mascotEvolutionLevel: number, onSelectTier?: (tierIndex: number) => void }} props
 */
export function MascotEvolutionTimeline({ mascotEvolutionLevel, onSelectTier }) {
  const interactive = typeof onSelectTier === 'function'

  return (
    <div className="profile-iq-timeline-wrap">
      <p className="m-0 mb-1 text-center text-[10px] font-extrabold uppercase tracking-[0.2em] text-iq-teal">
        Evolusi maskot
        {interactive ? (
          <span className="ml-1.5 inline-block text-[9px] font-extrabold normal-case tracking-normal text-[#7b95c8]">
            (ketuk level)
          </span>
        ) : null}
      </p>
      <div className="profile-iq-timeline">
        {TIERS.map((tier, i) => {
          const active =
            mascotEvolutionLevel >= tier.minLevel &&
            (tier.maxLevel === Infinity ? true : mascotEvolutionLevel <= tier.maxLevel)
          const range =
            tier.maxLevel === Infinity ? `${tier.minLevel}+` : `${tier.minLevel}–${tier.maxLevel}`

          const node = (
            <>
              <div className="profile-iq-evo-dot">{i + 1}</div>
              <span className="profile-iq-evo-name">{TIER_LABELS_ID[i]}</span>
              <span className="profile-iq-evo-lvl">
                {tier.tier} · Lv {range}
              </span>
            </>
          )

          return (
            <div key={tier.tier} className="flex items-center">
              {interactive ? (
                <button
                  type="button"
                  className={clsx('profile-iq-evo-node', TIER_CLASS[i], active && 'active')}
                  onClick={() => onSelectTier(i)}
                  aria-label={`Level ${i + 1}: ${TIER_LABELS_ID[i]} ${tier.tier}, ${tier.name} ${tier.species}`}
                >
                  {node}
                </button>
              ) : (
                <div className={clsx('profile-iq-evo-node', TIER_CLASS[i], active && 'active')}>{node}</div>
              )}
              {i < TIERS.length - 1 ? <div className="profile-iq-evo-arrow" aria-hidden="true" /> : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
