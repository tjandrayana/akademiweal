import { cn } from '../lib/cn'

/** House — back to map / home */
export function HeaderHomeIcon({ className }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M3 10.5L12 3L21 10.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V10.5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Share / bagikan — upload-arrow metaphor */
export function HeaderShareIcon({ className }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M12 4v12m-4-8l4-4 4 4M5 20h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Person icon — nav / header profile shortcut */
export function HeaderProfileIcon({ className }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

const shellLight =
  'border-b border-gray-100/80 bg-white/95 text-gray-900 backdrop-blur-md shadow-[0_1px_12px_rgba(0,0,0,0.05)]'
const shellDark =
  'border-b border-white/10 bg-iq-navy-mid/95 text-white backdrop-blur-md shadow-[0_1px_12px_rgba(0,0,0,0.2)]'

/**
 * Sticky top bar: centered brand (home/profile) or flexible center (lesson).
 *
 * @param {'home' | 'lesson' | 'profile'} mode
 * @param {'light' | 'dark'} variant — dark = InvestQuest strip on Profile
 */
export function AppHeader({
  left,
  center,
  right,
  mode = 'home',
  variant = 'light',
  className,
}) {
  const grid =
    mode === 'lesson'
      ? 'grid-cols-[auto_minmax(0,1fr)_auto]'
      : 'grid-cols-[1fr_auto_1fr]'

  return (
    <header
      className={cn(
        'sticky top-0 z-20 grid min-h-14 items-center gap-x-1 px-2 sm:px-4',
        'pt-[max(0px,env(safe-area-inset-top))]',
        grid,
        variant === 'dark' ? shellDark : shellLight,
        className,
      )}
    >
      <div className="flex min-w-0 justify-start">{left}</div>
      <div
        className={cn(
          'flex min-w-0 items-center justify-center',
          mode === 'lesson' && 'px-1',
        )}
      >
        {center}
      </div>
      <div className="flex min-w-0 items-center justify-end gap-0.5 sm:gap-1">{right}</div>
    </header>
  )
}

/** Center block: 🐂 + AkademiWeal — used on Home & Profile top bars */
export function AppHeaderBrandTitle({ dark = false }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-0.5 px-1">
      <div className="flex min-w-0 max-w-[min(100%,11.5rem)] items-center justify-center gap-1 sm:max-w-none sm:gap-1.5">
        <span className="shrink-0 text-base leading-none sm:text-lg" aria-hidden="true">
          🐂
        </span>
        <span
          className={cn(
            'min-w-0 truncate text-[13px] font-extrabold tracking-tight sm:text-[15px]',
            dark && 'brightness-110',
          )}
          style={{
            background: dark
              ? 'linear-gradient(135deg, var(--color-iq-gold-soft), var(--color-iq-gold-bright), var(--color-iq-gold-deep))'
              : 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          AkademiWeal
        </span>
      </div>
      <span
        className={cn(
          'h-0.5 w-10 shrink-0 rounded-full sm:w-12',
          dark
            ? 'bg-gradient-to-r from-iq-gold-bright/0 via-iq-teal/90 to-iq-gold-bright/0'
            : 'bg-gradient-to-r from-primary/0 via-iq-teal/80 to-primary/0',
        )}
        aria-hidden="true"
      />
    </div>
  )
}
