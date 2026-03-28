import { BottomNav } from '../components/BottomNav'

/** Placeholder until backend leaderboard exists (audit P0). */
export function Leaderboard() {
  return (
    <div className="flex min-h-svh flex-col max-w-md mx-auto bg-[#F9FAFB]">
      <header className="sticky top-0 z-20 flex h-14 items-center justify-center border-b border-gray-100 bg-white px-4 shadow-sm">
        <span className="text-base font-extrabold text-text">Peringkat</span>
      </header>

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
