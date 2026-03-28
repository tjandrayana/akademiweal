import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { StepDots } from '../components/StepDots'
import { cn } from '../lib/cn'
import { playSelect, playStepNext, playCelebration } from '../lib/sounds'

const GOALS = [
  { id: 'zero',  icon: '🌱', label: 'Belajar dari nol',      desc: 'Belum pernah investasi sama sekali', iconBg: 'bg-green-100' },
  { id: 'start', icon: '📈', label: 'Siap mulai investasi',  desc: 'Sudah tahu dasar, mau action',        iconBg: 'bg-blue-100' },
  { id: 'more',  icon: '📚', label: 'Tambah pengetahuan',    desc: 'Sudah investasi, mau lebih paham',    iconBg: 'bg-purple-100' },
]

const TIMES = [
  { id: '3',  icon: '⚡', label: '3 menit',  recommended: true },
  { id: '5',  icon: '🎯', label: '5 menit',  recommended: false },
  { id: '10', icon: '🏆', label: '10 menit', recommended: false },
]

const TOTAL_STEPS = 4

const STEP_BG = {
  0: 'bg-gradient-to-b from-[#FFF7ED] to-[#FEF3C7]',
  1: 'bg-[#F9FAFB]',
  2: 'bg-[#F9FAFB]',
  3: 'bg-gradient-to-b from-[#DCFCE7] to-[#F0FDF4]',
}

export function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [goalId, setGoalId] = useState(null)
  const [timeId, setTimeId] = useState('3')

  function goBack() {
    setStep((s) => Math.max(s - 1, 0))
  }

  function goNext() {
    playStepNext()
    try {
      if (step === 1 && goalId != null) {
        localStorage.setItem('akademiweal_onboarding_goal', goalId)
      }
      if (step === 2 && timeId != null) {
        localStorage.setItem('akademiweal_onboarding_time', timeId)
      }
    } catch {
      /* ignore */
    }
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1))
  }

  function finishOnboarding() {
    playCelebration()
    try {
      localStorage.setItem('akademiweal_onboarding_done', 'true')
    } catch {
      /* ignore */
    }
    navigate('/home', { replace: true })
  }

  function skip() {
    try {
      localStorage.setItem('akademiweal_onboarding_done', 'true')
    } catch {
      /* ignore */
    }
    navigate('/home', { replace: true })
  }

  return (
    <div
      className={cn(
        'flex min-h-svh flex-col items-stretch transition-colors duration-300',
        STEP_BG[step],
      )}
    >
      {/* Top bar — brand + back + skip */}
      <div className="mx-auto w-full max-w-md shrink-0 px-4 pt-4">
        <div className="flex items-center justify-between h-10 mb-1">
          {/* Back button (hidden on step 0) */}
          {step > 0 ? (
            <button
              type="button"
              onClick={goBack}
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-black/5 transition-colors"
              aria-label="Kembali"
            >
              ←
            </button>
          ) : (
            <div className="w-9" />
          )}

          {/* Brand */}
          <span className="text-sm font-extrabold text-primary tracking-tight">AkademiWeal</span>

          {/* Skip (only steps 0–2) */}
          {step < 3 ? (
            <button
              type="button"
              onClick={skip}
              className="text-xs font-semibold text-muted hover:text-text transition-colors px-2 py-1"
            >
              Lewati
            </button>
          ) : (
            <div className="w-14" />
          )}
        </div>

        {/* Step dots */}
        <StepDots total={TOTAL_STEPS} current={step} variant="pill" />
      </div>

      {/* Step content */}
      <div className="mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col px-4 pb-8">
        <div
          key={step}
          className="animate-onb-step flex min-h-0 w-full flex-1 flex-col"
          role="region"
          aria-live="polite"
          aria-label={`Langkah ${step + 1} dari ${TOTAL_STEPS}`}
        >

          {/* ── Step 0: Welcome ── */}
          {step === 0 && (
            <section
              className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 py-4 text-center"
              aria-labelledby="onb-welcome-title"
            >
              {/* Mascot hero */}
              <div
                className="flex h-44 w-44 items-center justify-center rounded-[2rem] bg-white shadow-lg text-8xl leading-none"
                style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)' }}
                aria-hidden="true"
              >
                🐂
              </div>

              <div className="flex flex-col gap-2">
                <h1
                  id="onb-welcome-title"
                  className="m-0 text-3xl font-extrabold leading-tight tracking-tight text-text"
                >
                  Belajar Investasi<br />Jadi Mudah
                </h1>
                <p className="m-0 text-base leading-relaxed text-muted">
                  Cuma 3 menit sehari untuk mulai<br />membangun masa depan keuanganmu
                </p>
              </div>

              {/* Feature pills */}
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  { icon: '🎯', text: 'Micro learning' },
                  { icon: '🔥', text: 'Streak harian' },
                  { icon: '⭐', text: 'Kumpulkan XP' },
                ].map(({ icon, text }) => (
                  <div
                    key={text}
                    className="flex items-center gap-1.5 rounded-full bg-white/80 border border-white px-3 py-1.5 shadow-sm"
                  >
                    <span className="text-sm leading-none" aria-hidden="true">{icon}</span>
                    <span className="text-xs font-bold text-text">{text}</span>
                  </div>
                ))}
              </div>

              <div className="mt-2 w-full">
                <Button
                  type="button"
                  variant="primary"
                  className="w-full font-bold text-base"
                  onClick={goNext}
                >
                  Mulai Sekarang →
                </Button>
              </div>
            </section>
          )}

          {/* ── Step 1: Goal ── */}
          {step === 1 && (
            <section
              className="flex min-h-0 flex-1 flex-col gap-5 pt-2"
              aria-labelledby="onb-goal-title"
            >
              <div className="text-center">
                <h1
                  id="onb-goal-title"
                  className="m-0 text-2xl font-extrabold leading-tight tracking-tight text-text"
                >
                  Apa tujuanmu?
                </h1>
                <p className="m-0 mt-1.5 text-sm text-muted">Kami sesuaikan perjalananmu</p>
              </div>

              <div
                className="flex flex-col gap-3"
                role="group"
                aria-label="Pilih satu tujuan"
              >
                {GOALS.map((g) => {
                  const selected = goalId === g.id
                  return (
                    <button
                      key={g.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => { playSelect(); setGoalId(g.id) }}
                      className={cn(
                        'flex w-full items-center gap-4 rounded-2xl border-2 bg-white px-4 py-4 text-left transition-all duration-150 active:scale-[0.98]',
                        selected
                          ? 'border-primary bg-green-50 shadow-sm'
                          : 'border-transparent shadow-sm hover:border-gray-200',
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl leading-none',
                          g.iconBg,
                        )}
                        aria-hidden="true"
                      >
                        {g.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="m-0 text-base font-bold text-text">{g.label}</p>
                        <p className="m-0 text-xs text-muted mt-0.5">{g.desc}</p>
                      </div>
                      {selected && (
                        <div
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white text-xs font-bold"
                          aria-hidden="true"
                        >
                          ✓
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              <div className="mt-auto pt-2">
                <Button
                  type="button"
                  variant="primary"
                  className="w-full font-bold"
                  disabled={goalId == null}
                  onClick={goNext}
                >
                  Lanjut →
                </Button>
              </div>
            </section>
          )}

          {/* ── Step 2: Time ── */}
          {step === 2 && (
            <section
              className="flex min-h-0 flex-1 flex-col gap-5 pt-2"
              aria-labelledby="onb-time-title"
            >
              <div className="text-center">
                <h1
                  id="onb-time-title"
                  className="m-0 text-2xl font-extrabold leading-tight tracking-tight text-text"
                >
                  Berapa menit per hari?
                </h1>
                <p className="m-0 mt-1.5 text-sm text-muted">
                  Konsistensi kecil lebih baik dari belajar sekali
                </p>
              </div>

              <div
                className="flex flex-col gap-3"
                role="group"
                aria-label="Pilih waktu belajar per hari"
              >
                {TIMES.map((t) => {
                  const selected = timeId === t.id
                  return (
                    <button
                      key={t.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => { playSelect(); setTimeId(t.id) }}
                      className={cn(
                        'relative flex w-full items-center gap-4 rounded-2xl border-2 bg-white px-4 py-4 text-left transition-all duration-150 active:scale-[0.98]',
                        selected
                          ? 'border-primary bg-green-50'
                          : 'border-transparent shadow-sm hover:border-gray-200',
                      )}
                    >
                      {t.recommended && (
                        <span className="absolute -top-2.5 right-3 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold text-white whitespace-nowrap">
                          Direkomendasikan
                        </span>
                      )}
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-2xl leading-none"
                        aria-hidden="true"
                      >
                        {t.icon}
                      </div>
                      <div className="flex-1">
                        <p className="m-0 text-base font-bold text-text">{t.label}</p>
                        <p className="m-0 text-xs text-muted mt-0.5">
                          {t.id === '3' ? 'Cocok untuk pemula, mudah dijaga' :
                           t.id === '5' ? 'Belajar lebih dalam setiap sesi' :
                           'Untuk yang serius naik level cepat'}
                        </p>
                      </div>
                      {selected && (
                        <div
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white text-xs font-bold"
                          aria-hidden="true"
                        >
                          ✓
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              <div className="mt-auto pt-2">
                <Button
                  type="button"
                  variant="primary"
                  className="w-full font-bold"
                  onClick={goNext}
                >
                  Lanjut →
                </Button>
              </div>
            </section>
          )}

          {/* ── Step 3: Celebrate + Start ── */}
          {step === 3 && (
            <section
              className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 py-4 text-center"
              aria-labelledby="onb-start-title"
            >
              {/* Streak day pill */}
              <div
                className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 border border-orange-200 px-4 py-1.5"
                aria-hidden="true"
              >
                <span className="text-base leading-none">🔥</span>
                <span className="text-sm font-bold text-orange-600">Hari ke-1</span>
              </div>

              {/* Mascot — branded card */}
              <div
                className="relative flex h-44 w-44 items-center justify-center rounded-[2rem] bg-gradient-to-b from-green-400 to-green-600 text-8xl leading-none shadow-xl"
                style={{ boxShadow: '0 8px 40px rgba(34,197,94,0.35), 0 2px 8px rgba(0,0,0,0.10)' }}
                aria-hidden="true"
              >
                🐂
                {/* Sparkles */}
                <span className="absolute -top-2 -right-1 text-2xl animate-bounce" style={{ animationDelay: '0.1s' }}>✨</span>
                <span className="absolute -bottom-1 -left-2 text-xl animate-bounce" style={{ animationDelay: '0.3s' }}>⭐</span>
              </div>

              <div className="flex flex-col gap-2">
                <h1
                  id="onb-start-title"
                  className="m-0 text-3xl font-extrabold leading-tight tracking-tight text-text"
                >
                  Kamu siap! 🎉<br />Mulai streakmu hari ini
                </h1>
                <p className="m-0 text-sm leading-relaxed text-muted">
                  Bangun kebiasaan belajar setiap hari<br />bersama Weal si banteng keuangan
                </p>
              </div>

              {/* Mini stat pills */}
              <div className="flex gap-2" aria-label="Statistik awal">
                {[
                  { icon: '🔥', value: '0 hari' },
                  { icon: '⭐', value: '0 XP' },
                  { icon: '🎯', value: 'Level 1' },
                ].map(({ icon, value }) => (
                  <div
                    key={value}
                    className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-sm border border-gray-100"
                  >
                    <span className="text-sm leading-none" aria-hidden="true">{icon}</span>
                    <span className="text-xs font-bold text-text">{value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-2 w-full">
                <Button
                  type="button"
                  variant="primary"
                  className="w-full font-bold text-base"
                  onClick={finishOnboarding}
                >
                  Lihat Peta Belajarku →
                </Button>
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  )
}
