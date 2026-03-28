import { cn } from '../lib/cn'

/**
 * @param {{ value: number, label?: string, variant?: 'default' | 'white' }} props
 */
export function ProgressBar({ value, label, variant = 'default' }) {
  const clamped = Math.min(100, Math.max(0, Number(value) || 0))
  const isWhite = variant === 'white'

  return (
    <div
      className="w-full"
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {label ? (
        <div className="mb-2 text-[0.8125rem] font-semibold text-muted">{label}</div>
      ) : null}
      <div
        className={cn(
          'h-2 overflow-hidden rounded-full',
          isWhite ? 'bg-white/30' : 'bg-border',
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-[width] duration-[600ms] ease-out',
            isWhite ? 'bg-white' : 'bg-primary',
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
