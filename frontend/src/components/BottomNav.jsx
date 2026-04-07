import { useLocation, useNavigate } from 'react-router-dom'
import { cn } from '../lib/cn'
import { playNavigate } from '../lib/sounds'

function IconHome({ active }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 10.5L12 3L21 10.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V10.5z"
        stroke={active ? '#22C55E' : '#9CA3AF'}
        strokeWidth="2"
        strokeLinejoin="round"
        fill={active ? '#DCFCE7' : 'none'}
      />
      <rect x="9" y="14" width="6" height="7" rx="1" fill={active ? '#22C55E' : '#9CA3AF'} />
    </svg>
  )
}

function IconArena({ active }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2L2 7l10 5 10-5-10-5z"
        stroke={active ? '#22C55E' : '#9CA3AF'}
        strokeWidth="2"
        strokeLinejoin="round"
        fill={active ? '#DCFCE7' : 'none'}
      />
      <path d="M2 12l10 5 10-5" stroke={active ? '#22C55E' : '#9CA3AF'} strokeWidth="2" strokeLinejoin="round" />
      <path d="M2 17l10 5 10-5" stroke={active ? '#22C55E' : '#9CA3AF'} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}

function IconTrophy({ active }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8 21h8M12 17v4M5 3H3v4a4 4 0 004 4h.5M19 3h2v4a4 4 0 01-4 4h-.5"
        stroke={active ? '#22C55E' : '#9CA3AF'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 3h9v8a4.5 4.5 0 01-9 0V3z"
        stroke={active ? '#22C55E' : '#9CA3AF'}
        strokeWidth="2"
        fill={active ? '#DCFCE7' : 'none'}
      />
    </svg>
  )
}

function IconFeed({ active }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" stroke={active ? '#22C55E' : '#9CA3AF'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="16 7 22 7 22 13" stroke={active ? '#22C55E' : '#9CA3AF'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={active ? '#DCFCE7' : 'none'} />
    </svg>
  )
}

function IconPerson({ active }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4" stroke={active ? '#22C55E' : '#9CA3AF'} strokeWidth="2" fill={active ? '#DCFCE7' : 'none'} />
      <path
        d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
        stroke={active ? '#22C55E' : '#9CA3AF'}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

const TABS = [
  { path: '/home',        Icon: IconHome,   label: 'Belajar'  },
  { path: '/feed',        Icon: IconFeed,   label: 'Feed'      },
  { path: '/arena',       Icon: IconArena,  label: 'Arena'    },
  { path: '/leaderboard', Icon: IconTrophy, label: 'Peringkat' },
  { path: '/profile',     Icon: IconPerson, label: 'Profil'   },
]

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed bottom-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2 border-t border-primary/20 bg-white/90 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.08),inset_0_1px_0_0_rgba(0,200,150,0.1)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}
    >
      <div className="flex h-16 items-stretch">
        {TABS.map(({ path, Icon, label, disabled }, i) => {
          const active = !disabled && location.pathname === path
          const isCenter = i === 2

          return (
            <button
              key={`${label}-${i}`}
              type="button"
              aria-label={disabled ? `${label} — segera hadir` : label}
              aria-current={active ? 'page' : undefined}
              aria-disabled={disabled}
              disabled={disabled}
              onClick={() => {
                if (disabled || !path) return
                playNavigate()
                navigate(path)
              }}
              className={cn(
                'relative flex flex-1 flex-col items-center justify-center gap-0.5 text-center',
                'transition-all duration-150 focus-visible:outline-none',
                active ? 'opacity-100' : 'opacity-45',
                disabled && 'cursor-not-allowed opacity-25',
              )}
            >
              {active && (
                <span
                  aria-hidden="true"
                  className="absolute top-1/2 left-1/2 h-10 w-14 -translate-x-1/2 -translate-y-[58%] rounded-2xl bg-primary/20 pointer-events-none"
                />
              )}

              <span className={cn('relative z-10', isCenter && active && 'scale-110')}>
                <Icon active={active} />
              </span>

              <span
                className={cn(
                  'relative z-10 text-[10px] leading-none',
                  active ? 'font-extrabold text-primary' : 'font-medium text-gray-500',
                )}
              >
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
