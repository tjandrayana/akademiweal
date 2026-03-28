import { cn } from '../lib/cn'

/**
 * @param {{ total: number, current: number, variant?: 'default' | 'pill' }} props
 */
export function StepDots({ total, current, variant = 'default' }) {
  const pill = variant === 'pill'
  return (
    <div className="flex shrink-0 justify-center gap-2 py-2 pb-4" aria-hidden="true">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={cn(
            'rounded-full bg-border transition-[width,background,transform] duration-200 ease-out',
            pill
              ? i === current
                ? 'h-2 w-7 bg-primary'
                : 'h-2 w-2'
              : i === current
                ? 'h-2 w-2 scale-[1.15] bg-primary'
                : 'h-2 w-2',
          )}
        />
      ))}
    </div>
  )
}
