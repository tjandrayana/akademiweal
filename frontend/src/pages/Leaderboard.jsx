import { Link } from 'react-router-dom'
import { AppHeader, HeaderHomeIcon, HeaderProfileIcon } from '../components/AppHeader'
import { BottomNav } from '../components/BottomNav'

/** Placeholder until backend leaderboard exists (audit P0). */
export function Leaderboard() {
  return (
    <div className="flex min-h-svh flex-col max-w-md mx-auto bg-bg">
      <AppHeader
        mode="home"
        variant="light"
        left={
          <Link
            to="/home"
            className="flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-primary/10 hover:text-primary"
            aria-label="Beranda"
          >
            <HeaderHomeIcon />
          </Link>
        }
        center={
          <span className="text-[15px] font-extrabold tracking-tight text-text">Peringkat</span>
        }
        right={
          <Link
            to="/profile"
            className="flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-primary/10 hover:text-primary"
            aria-label="Profil"
          >
            <HeaderProfileIcon />
          </Link>
        }
      />

      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 pb-24 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-yellow-50 text-5xl shadow-sm" aria-hidden="true">
          🏆
        </div>
        <h2 className="m-0 text-xl font-extrabold text-text">Segera Hadir</h2>
        <p className="m-0 text-sm text-muted leading-relaxed">
          Papan peringkat akan segera hadir.<br />Terus belajar dan kumpulkan XP!
        </p>
      </div>

      <BottomNav />
    </div>
  )
}
