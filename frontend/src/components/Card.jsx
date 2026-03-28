import { cn } from '../lib/cn'

export function Card({ children, className = '' }) {
  return (
    <div
      className={cn(
        'rounded-xl bg-surface p-4 shadow-sm',
        className,
      )}
    >
      {children}
    </div>
  )
}
