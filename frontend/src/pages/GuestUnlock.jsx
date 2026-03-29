import { useCallback, useMemo, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { GUEST_MAX_FREE_PATH_STEP, isLoggedIn } from '../lib/guestGate'
import { cn } from '../lib/cn'
import { playTap } from '../lib/sounds'

const decorSpots = [
  { emoji: '✨', style: { left: '6%', top: '10%' }, delay: '0s' },
  { emoji: '⭐', style: { right: '8%', top: '14%' }, delay: '0.4s' },
  { emoji: '💫', style: { left: '12%', top: '28%' }, delay: '0.8s' },
  { emoji: '🪙', style: { right: '14%', top: '38%' }, delay: '1.1s' },
  { emoji: '📈', style: { left: '8%', bottom: '22%' }, delay: '0.2s' },
  { emoji: '🎯', style: { right: '10%', bottom: '18%' }, delay: '0.9s' },
]

function coinQuip(taps) {
  if (taps <= 0) {
    return 'Ketuk koin emasnya — janji cuma buat senyum, bukan beli kopi ☕'
  }
  const lines = [
    'Satu ketukan! Tabungan attitude-mu naik +0,0001%.',
    'Dua kali — Bursa belum buka, tapi semangatmu udah IPO.',
    'Tiga! Kamu layak jadi cover story newsletter fiktif.',
    'Empat ketukan = diversifikasi… ketukan.',
    'Lima! Level free-nya habis, level seriusnya nunggu akun kamu.',
    'Masih ngetik? Koinnya protes… boong, dia senang kok.',
    'Komposer musik investasi bilang: lanjutkan riff ini 🎵',
    'Fun fact: setiap ketukan membantu kita menunda deadline (bukan).',
    'CEO fiktif AkademiWeal memberi quote: "Nice tap!"',
    'Okay superstar, saatnya sambung belajar beneran di akun ya.',
  ]
  return lines[Math.min(taps - 1, lines.length - 1)]
}

/**
 * Playful full-screen bridge after the guest demo path — premium, friendly, interactive.
 */
export function GuestUnlock() {
  const navigate = useNavigate()
  const location = useLocation()
  const [tapPhase, setTapPhase] = useState(0)
  const [tapCount, setTapCount] = useState(0)

  const from = useMemo(
    () => location.state?.from ?? { pathname: '/home', search: '', hash: '' },
    [location.state],
  )

  const authCarry = useMemo(
    () => ({ reason: 'guest_limit', from }),
    [from],
  )

  const onCoinTap = useCallback(() => {
    playTap()
    setTapCount((n) => n + 1)
    setTapPhase((p) => p + 1)
  }, [])

  const gotoBack = useCallback(() => {
    playTap()
    navigate(from.pathname || '/home', { replace: true })
  }, [navigate, from.pathname])

  if (isLoggedIn()) {
    return <Navigate to={from.pathname || '/home'} replace />
  }

  return (
    <div
      className="relative flex min-h-svh flex-col overflow-hidden"
      style={{
        background:
          'radial-gradient(120% 80% at 50% 0%, rgba(245,197,24,0.22) 0%, transparent 55%), linear-gradient(165deg, #0b1432 0%, #14204a 38%, #1a2d6b 72%, #0f1a40 100%)',
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 30%, #22c55e 0%, transparent 45%), radial-gradient(circle at 80% 70%, #f5c518 0%, transparent 40%)',
        }}
      />

      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div
          className="animate-guest-unlock-shine absolute -left-1/2 top-[22%] h-48 w-[200%] bg-gradient-to-r from-transparent via-white to-transparent"
          style={{ transform: 'rotate(-8deg)' }}
        />
        {decorSpots.map(({ emoji, style, delay }, i) => (
          <span
            key={i}
            className="animate-guest-unlock-float absolute select-none text-2xl sm:text-3xl"
            style={{
              ...style,
              animationDelay: delay,
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.35))',
            }}
          >
            {emoji}
          </span>
        ))}
      </div>

      <header className="relative z-20 flex shrink-0 items-center justify-between px-4 pt-[max(12px,env(safe-area-inset-top))] pb-2">
        <span
          className="text-xs font-extrabold uppercase tracking-[0.2em]"
          style={{ color: 'rgba(240,230,200,0.55)' }}
        >
          AkademiWeal
        </span>
        <button
          type="button"
          onClick={gotoBack}
          className="rounded-full px-3 py-1.5 text-xs font-bold text-[#FFF8EC]/80 transition-colors hover:bg-white/10 hover:text-[#FFF8EC]"
        >
          ← Kembali
        </button>
      </header>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 pb-10 pt-2">
        <div
          className={cn(
            'animate-guest-unlock-card mb-8 w-full max-w-[min(100%,20rem)] rounded-[1.75rem] border p-6',
            'border-white/[0.14] bg-white/[0.07] backdrop-blur-xl',
          )}
          style={{
            boxShadow:
              '0 24px 80px rgba(0,0,0,0.45), inset 0 1px 0 0 rgba(255,255,255,0.12)',
          }}
        >
          <p
            className="m-0 mb-2 text-center text-[11px] font-extrabold uppercase tracking-[0.28em]"
            style={{ color: 'rgba(245,197,36,0.88)' }}
          >
            Checkpoint imut ✓
          </p>
          <h1 className="m-0 text-center text-[1.35rem] font-black leading-snug tracking-tight text-[#FFF8EC] sm:text-2xl">
            Wuhuu! {GUEST_MAX_FREE_PATH_STEP} langkah gratis sudah kamu jelajahi
          </h1>
          <p className="m-0 mt-3 text-center text-sm font-semibold leading-relaxed text-[#b8c8ec]">
            Kunci map berikutnya &amp; simpan XP ke awan — butuh akun, gratis kok. Tenang: progres lokalmu ikut
            pindah pas kamu masuk.
          </p>

          <div className="mt-6 flex flex-col items-center gap-3">
            <p className="m-0 text-center text-xs font-bold text-[#8fa5d4]">Psst… ketuk koinnya</p>
            <button
              type="button"
              onClick={onCoinTap}
              key={tapPhase}
              className={cn(
                'animate-guest-unlock-coin flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full border-4 border-[#f5c518]/90',
                'bg-gradient-to-br from-[#ffe97a] via-[#f5c518] to-[#d4940a] text-4xl shadow-[0_12px_40px_rgba(245,197,36,0.45)]',
                'cursor-pointer transition-transform hover:scale-[1.03] active:scale-[0.97]',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f5c518]',
              )}
              aria-label="Ketuk koin untuk reaksi lucu"
            >
              <span className="drop-shadow-md">🪙</span>
            </button>
            <p
              className="m-0 min-h-[2.75rem] px-2 text-center text-sm font-bold leading-snug text-[#FFF8EC]"
              key={`q-${tapCount}`}
            >
              {coinQuip(tapCount)}
            </p>
          </div>
        </div>

        <div className="flex w-full max-w-sm flex-col gap-3">
          <Button
            type="button"
            className="w-full font-extrabold shadow-[0_6px_0_#16A34A] active:translate-y-1 active:shadow-none"
            onClick={() => {
              playTap()
              navigate('/login', { state: authCarry })
            }}
          >
            Masuk &amp; lanjut belajar →
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-full border-2 border-white/20 bg-white/10 font-extrabold text-[#FFF8EC] backdrop-blur-sm hover:bg-white/15"
            onClick={() => {
              playTap()
              navigate('/register', { state: authCarry })
            }}
          >
            Buat akun baru ✨
          </Button>
        </div>

        <p className="mt-6 text-center text-xs font-semibold text-[#7b8ec4]">
          Sudah punya akun lain?{' '}
          <Link
            to="/login"
            state={authCarry}
            className="font-extrabold text-[#f5c518] underline-offset-2 hover:underline"
          >
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  )
}
