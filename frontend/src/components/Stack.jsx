import { cn } from '../lib/cn'

const GAP = {
  1: 'gap-2',
  2: 'gap-4',
  3: 'gap-6',
  4: 'gap-8',
}

/**
 * Vertical rhythm — 8px grid (gap-2 = 8px, gap-4 = 16px, …)
 * @param {{ gap?: 1|2|3|4, children: import('react').ReactNode, className?: string }} props
 */
export function Stack({ gap = 2, children, className = '' }) {
  const g = GAP[gap] ?? GAP[2]
  return <div className={cn('flex flex-col', g, className)}>{children}</div>
}
