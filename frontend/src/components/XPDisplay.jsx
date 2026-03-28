import { useEffect, useRef, useState } from 'react'
import { cn } from '../lib/cn'

const DURATION_MS = 520

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3
}

/**
 * Counts XP from 0 → xp, then a short scale settle. Respects prefers-reduced-motion.
 */
export function XPDisplay({ xp, className }) {
  const [displayXP, setDisplayXP] = useState(0)
  const [settled, setSettled] = useState(false)
  const rafRef = useRef(0)

  useEffect(() => {
    const target = Math.max(0, Math.floor(Number(xp) || 0))
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let cancelled = false

    const boot = requestAnimationFrame(() => {
      if (cancelled) {
        return
      }
      if (reduced) {
        setDisplayXP(target)
        setSettled(true)
        return
      }
      if (target === 0) {
        setDisplayXP(0)
        setSettled(true)
        return
      }
      setDisplayXP(0)
      setSettled(false)

      const start = performance.now()
      const tick = (now) => {
        if (cancelled) {
          return
        }
        const elapsed = now - start
        const t = Math.min(1, elapsed / DURATION_MS)
        const eased = easeOutCubic(t)
        setDisplayXP(Math.round(target * eased))
        if (t < 1) {
          rafRef.current = requestAnimationFrame(tick)
        } else {
          setDisplayXP(target)
          setSettled(true)
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(boot)
      cancelAnimationFrame(rafRef.current)
    }
  }, [xp])

  return (
    <p
      className={cn(
        'm-0 inline-block origin-center text-5xl font-extrabold tabular-nums text-primary drop-shadow-[0_2px_12px_rgba(88,204,2,0.35)]',
        settled && displayXP > 0 && 'animate-xp-reward-settle',
        className,
      )}
      aria-live="polite"
    >
      +{displayXP}
    </p>
  )
}
