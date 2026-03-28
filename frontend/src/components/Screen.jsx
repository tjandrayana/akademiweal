import { cn } from '../lib/cn'

/**
 * Mobile-first column shell — design/design-system.md (padding 16px, max width, bg).
 */
export function Screen({ children, className = '', as, ...rest }) {
  const Root = as ?? 'main'
  return (
    <Root
      className={cn(
        'mx-auto flex min-h-svh w-full max-w-md flex-col gap-4 bg-bg p-4 text-base text-text antialiased',
        className,
      )}
      {...rest}
    >
      {children}
    </Root>
  )
}
