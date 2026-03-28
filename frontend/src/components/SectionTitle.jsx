import { cn } from '../lib/cn'

export function SectionTitle({ children, id, as }) {
  const Heading = as ?? 'h2'
  return (
    <Heading id={id} className={cn('m-0 text-xl font-bold leading-snug text-text')}>
      {children}
    </Heading>
  )
}
