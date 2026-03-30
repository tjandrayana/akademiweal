import MascotEvolution from './MascotEvolution'

const ZONE_SKY = {
  1: ['#60D0FF', '#98E8FF', '#C8F4FF'],
  2: ['#FFB830', '#FFD870', '#FFEC90'],
  3: ['#60C8FF', '#A8E0FF', '#D0F0FF'],
  4: ['#38C8FF', '#70DEFF', '#A0F0FF'],
  5: ['#FFA040', '#FFCC70', '#FFE8A0'],
  6: ['#4FC8FF', '#A0ECFF', '#D0F8E8'],
  7: ['#1A0850', '#2A1870', '#3A2888'],
  8: ['#FF6B35', '#FF9B5A', '#FFD090'],
}

const ZONE_GROUND = {
  1: '#40D864',
  2: '#F8C838',
  3: '#40D864',
  4: '#1890CC',
  5: '#E8B840',
  6: '#38D470',
  7: '#180C38',
  8: '#C87830',
}

/**
 * Hook + micro content before quiz / interaction.
 * Two-zone layout: illustrated hero (top) + white content card (bottom).
 *
 * @param {{ title: string, hook: string, body: string, explanation?: string, level?: number, mascotEvolutionLevel?: number, streak?: number, onContinue: () => void }} props
 */
export function LessonIntro({ title, hook, body, explanation, level = 1, mascotEvolutionLevel = 1, streak = 0, onContinue }) {
  const safeLevel = Math.min(Math.max(1, level), 8)
  const [sky1, , sky3] = ZONE_SKY[safeLevel] || ZONE_SKY[1]
  const ground = ZONE_GROUND[safeLevel] || ZONE_GROUND[1]
  const gradId = `intro-sky-${safeLevel}`
  const isDark = safeLevel === 7

  return (
    <div className="flex flex-1 flex-col overflow-hidden animate-lesson-fade">

      {/* ── Zone scene ── */}
      <div className="relative shrink-0 overflow-hidden" style={{ height: 230 }}>
        {/* Zone-aware SVG background */}
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          viewBox="0 0 370 230"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={sky1} />
              <stop offset="100%" stopColor={sky3} />
            </linearGradient>
          </defs>
          <rect width="370" height="230" fill={`url(#${gradId})`} />

          {/* Sun / orb decoration */}
          {(safeLevel === 2 || safeLevel === 5) ? (
            <>
              <circle cx="310" cy="52" r="38" fill="#FFE040" opacity="0.2"/>
              <circle cx="310" cy="52" r="26" fill="#FFF060" opacity="0.5"/>
            </>
          ) : safeLevel <= 6 ? (
            <>
              <circle cx="50" cy="50" r="32" fill="#FFE840" opacity="0.25"/>
              <circle cx="50" cy="50" r="20" fill="#FFF060" opacity="0.5"/>
            </>
          ) : null}

          {/* Clouds */}
          {safeLevel !== 7 && safeLevel !== 8 && (
            <g style={{ animation: 'iq-cloud-drift 10s ease-in-out infinite alternate' }}>
              <ellipse cx="260" cy="45" rx="50" ry="28" fill="white" opacity="0.9"/>
              <ellipse cx="236" cy="54" rx="35" ry="24" fill="white" opacity="0.9"/>
              <ellipse cx="284" cy="56" rx="37" ry="22" fill="white" opacity="0.9"/>
            </g>
          )}

          {/* Ground */}
          <path d={`M0,230 Q60,195 130,208 Q200,220 270,198 Q320,184 370,198 L370,230 Z`} fill={ground} opacity="0.8"/>
          <path d={`M0,230 Q80,208 180,216 Q280,224 370,212 L370,230 Z`} fill={ground}/>
        </svg>

        {/* Mascot + badges — centered overlay */}
        <div
          style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            zIndex: 10,
          }}
        >
          {/* "Materi Baru" badge */}
          <div style={{
            background: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.18)',
            backdropFilter: 'blur(6px)',
            borderRadius: 100,
            padding: '5px 14px',
            marginBottom: 10,
          }}>
            <span style={{
              fontFamily: "'Fredoka One',cursive",
              fontSize: 13,
              color: 'white',
              textShadow: '0 1px 4px rgba(0,0,0,0.2)',
            }}>
              📚 Materi Baru
            </span>
          </div>

          {/* Bouncing mascot circle */}
          <div style={{
            width: 96, height: 96, borderRadius: '50%',
            background: 'white', border: '4px solid rgba(255,255,255,0.9)',
            boxShadow: '0 6px 24px rgba(0,0,0,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'mcard-bounce 2.5s ease-in-out infinite',
            overflow: 'hidden',
          }}>
            <div style={{ marginTop: -2 }}>
              <MascotEvolution level={mascotEvolutionLevel} size={96} />
            </div>
          </div>

          {/* Zone label badge */}
          <div style={{
            background: 'rgba(0,0,0,0.18)',
            backdropFilter: 'blur(6px)',
            borderRadius: 100,
            padding: '5px 16px',
            marginTop: 8,
          }}>
            <span style={{
              fontFamily: "'Fredoka One',cursive",
              fontSize: 15,
              color: 'white',
              textShadow: '0 1px 4px rgba(0,0,0,0.2)',
            }}>
              Zona {safeLevel}
            </span>
          </div>
        </div>
      </div>

      {/* ── White sheet ── */}
      <div
        className="relative z-10 -mt-5 flex flex-1 flex-col rounded-t-[28px] bg-white overflow-hidden"
        style={{ boxShadow: '0 -6px 24px rgba(0,0,0,0.10)' }}
      >
        {/* Sheet handle */}
        <div style={{ width: 40, height: 4, borderRadius: 2, background: '#E8E0D8', margin: '12px auto 0' }} />

        <div className="flex flex-1 flex-col px-4 pt-3 pb-3 overflow-y-auto">

          {/* Streak badge */}
          {streak > 0 && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'linear-gradient(135deg,#FF8C30,#FF6010)',
              borderRadius: 100, padding: '6px 16px',
              marginBottom: 12, alignSelf: 'center',
              boxShadow: '0 3px 0 #CC4010',
            }}>
              <span style={{ fontSize: 16 }}>🔥</span>
              <span style={{
                fontFamily: "'Fredoka One',cursive",
                fontSize: 14, color: 'white',
                textShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }}>
                Streak {streak} Hari!
              </span>
            </div>
          )}

          {/* Tip card (yellow) */}
          <div style={{
            background: 'linear-gradient(135deg,#FFF8E8,#FFF0D0)',
            border: '2px solid #F5C518',
            borderRadius: 16, padding: '14px 16px',
            marginBottom: 14, display: 'flex', gap: 12,
          }}>
            <span style={{ fontSize: 24, flexShrink: 0, marginTop: 2 }}>💡</span>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: '#8A6000', lineHeight: 1.5 }}>
              {hook || 'Terus melangkah — kebiasaan belajar membentuk hasil jangka panjang!'}
            </p>
          </div>

          {/* Content card */}
          <div style={{
            background: '#FAFAF8', border: '2px solid #F0EDE8',
            borderRadius: 16, padding: 16, marginBottom: 14,
          }}>
            <div style={{
              fontSize: 11, fontWeight: 900, letterSpacing: 2,
              textTransform: 'uppercase', color: '#B0A090', marginBottom: 8,
            }}>
              📖 Apa yang kamu pelajari
            </div>
            <p style={{ margin: 0, fontSize: 13, color: '#4A3A2A', lineHeight: 1.7, fontWeight: 600 }}>
              {body || 'Kuis singkat membantu memperkuat konsep sebelum kamu lanjut ke langkah berikutnya.'}
            </p>
          </div>

          {/* Explanation card (optional from DB seed) */}
          {typeof explanation === 'string' && explanation.trim().length > 0 && (
            <div style={{
              background: 'linear-gradient(135deg,#EEF9FF,#DFF2FF)',
              border: '2px solid #9FD7F5',
              borderRadius: 14, padding: '12px 14px',
              marginBottom: 14, display: 'flex', gap: 10, alignItems: 'flex-start',
            }}>
              <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>🧠</span>
              <div>
                <div style={{
                  fontSize: 10, fontWeight: 900, letterSpacing: 1.5,
                  textTransform: 'uppercase', color: '#2A6A8A', marginBottom: 4,
                }}>
                  Penjelasan
                </div>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#215A72', lineHeight: 1.5 }}>
                  {explanation.trim()}
                </p>
              </div>
            </div>
          )}

          {/* Fun fact strip (blue) */}
          <div style={{
            background: 'linear-gradient(135deg,#E8F8FF,#D0F0FF)',
            border: '2px solid #80D0F0',
            borderRadius: 14, padding: '12px 14px',
            marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center',
          }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>🤩</span>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#2A6A8A', lineHeight: 1.5 }}>
              Tahukah kamu? Investasi rutin sejak muda bisa melipatgandakan kekayaanmu berkali-kali lipat!
            </p>
          </div>

          <div className="flex-1" />
        </div>

        {/* CTA anchored to bottom */}
        <div className="px-4 pb-6 pt-2">
          <button
            type="button"
            onClick={onContinue}
            style={{
              width: '100%', padding: 16, borderRadius: 16,
              border: 'none', cursor: 'pointer',
              fontFamily: "'Fredoka One',cursive", fontSize: 18,
              background: 'linear-gradient(180deg,#48D870,#28B050)',
              color: 'white', boxShadow: '0 5px 0 #189030',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}
          >
            <span>Lanjut ke Kuis</span>
            <span style={{ fontSize: 20 }}>→</span>
          </button>
          <p style={{
            margin: '10px 0 0', textAlign: 'center',
            fontSize: 11, fontWeight: 900,
            letterSpacing: '1.5px', textTransform: 'uppercase', color: '#B0A090',
          }}>
            Quiz di langkah berikutnya
          </p>
        </div>
      </div>
    </div>
  )
}
