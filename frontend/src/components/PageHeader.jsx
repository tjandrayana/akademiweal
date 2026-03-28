import { cn } from '../lib/cn'

/**
 * Title + optional subtitle — design/design-system.md
 */
export function PageHeader({ title, subtitle, titleId }) {
  return (
    <header className="text-left">
      <h1
        id={titleId}
        className={cn('mb-2 text-xl font-bold leading-tight tracking-tight text-text')}
      >
        {title}
      </h1>
      {subtitle ? <p className="m-0 text-base text-muted">{subtitle}</p> : null}
    </header>
  )
}
