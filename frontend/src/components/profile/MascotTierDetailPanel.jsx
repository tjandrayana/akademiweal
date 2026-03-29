import clsx from 'clsx'
import { useEffect } from 'react'
import { TIERS } from '../MascotEvolution'

const TIER_LABELS_ID = ['Perunggu', 'Perak', 'Emas', 'Platinum', 'Legenda']

function tierMatchesUser(mascotEvolutionLevel, tier) {
  return (
    mascotEvolutionLevel >= tier.minLevel &&
    (tier.maxLevel === Infinity ? true : mascotEvolutionLevel <= tier.maxLevel)
  )
}

/**
 * Modal: one evolution tier with large mascot SVG (Penny → Aurum).
 * @param {{ open: boolean, onClose: () => void, tierIndex: number | null, mascotEvolutionLevel: number }} props
 */
export function MascotTierDetailPanel({ open, onClose, tierIndex, mascotEvolutionLevel }) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open || tierIndex == null || tierIndex < 0 || tierIndex >= TIERS.length) {
    return null
  }

  const tier = TIERS[tierIndex]
  const MascotSvg = tier.Component
  const idLabel = TIER_LABELS_ID[tierIndex]
  const range =
    tier.maxLevel === Infinity ? `${tier.minLevel}+` : `${tier.minLevel}–${tier.maxLevel}`
  const isCurrent = tierMatchesUser(mascotEvolutionLevel, tier)

  return (
    <div
      className="profile-evo-modal-overlay fixed inset-0 z-[60] flex items-end justify-center sm:items-center p-0 sm:p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="profile-evo-modal m-0 w-full max-w-md max-h-[min(90vh,760px)] flex flex-col rounded-t-3xl sm:rounded-3xl bg-[#0b1c44] border border-white/10 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mascot-tier-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 flex items-center justify-between gap-3 px-5 pt-4 pb-2 border-b border-white/10">
          <h2
            id="mascot-tier-modal-title"
            className="m-0 font-['Fredoka_One',cursive] text-lg text-[#f5c518] tracking-wide"
          >
            Level {tierIndex + 1}
          </h2>
          <button
            type="button"
            className="flex h-10 min-w-10 items-center justify-center rounded-full text-white/80 hover:bg-white/10 text-xl leading-none"
            onClick={onClose}
            aria-label="Tutup"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto px-5 pb-4 pt-4 flex-1 min-h-0 flex flex-col items-center text-center">
          <p className="m-0 text-sm font-extrabold uppercase tracking-[0.12em] text-[#7b95c8]">
            {idLabel} · {tier.tier}
          </p>
          <p className="m-0 mt-2 text-xl font-extrabold text-[#f0e6c8] leading-tight">
            {tier.name}{' '}
            <span className="font-semibold text-[#a0bee8]">({tier.species})</span>
          </p>
          <p className="m-0 mt-1 text-[11px] font-bold text-[#6a85b2]">Level evolusi {range}</p>
          {isCurrent ? (
            <span className="mt-2 inline-block rounded-full bg-[#00c896]/20 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[#00c896]">
              Maskot kamu sekarang
            </span>
          ) : null}

          <div
            className={clsx(
              'mt-6 flex w-full max-w-[280px] items-center justify-center rounded-3xl border border-[#f5c518]/20 bg-[#06112a]/80 py-6 px-4',
              isCurrent && 'ring-1 ring-[#f5c518]/35',
            )}
          >
            <MascotSvg size={220} />
          </div>

          <blockquote className="m-0 mt-6 max-w-sm text-sm italic leading-relaxed text-[#a0bee8]">
            &ldquo;{tier.quote}&rdquo;
          </blockquote>

          <p className="m-0 mt-4 w-full text-left text-[10px] font-extrabold uppercase tracking-wider text-[#5a7aa8]">
            Kemampuan
          </p>
          <ul className="m-0 mt-2 w-full list-none space-y-1.5 pl-0 text-left text-sm text-[#c8d8e8]">
            {tier.perks.map((p) => (
              <li key={p} className="flex gap-2">
                <span className="text-[#00c896]" aria-hidden="true">
                  ✓
                </span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="shrink-0 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 border-t border-white/10">
          <button
            type="button"
            className="w-full py-3 rounded-2xl font-extrabold text-[#06112a] bg-gradient-to-r from-[#f5c518] to-[#ffe97a] hover:opacity-95 active:opacity-90"
            onClick={onClose}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}
