import { useEffect, useState } from 'react'
import MascotEvolution, { getMascotByLevel } from './MascotEvolution'

const ZONE_SKY = {
  1:  ['#60D0FF', '#98E8FF', '#C8F4FF'],
  2:  ['#FFB830', '#FFD870', '#FFEC90'],
  3:  ['#60C8FF', '#A8E0FF', '#D0F0FF'],
  4:  ['#38C8FF', '#70DEFF', '#A0F0FF'],
  5:  ['#FFA040', '#FFCC70', '#FFE8A0'],
  6:  ['#4FC8FF', '#A0ECFF', '#D0F8E8'],
  7:  ['#1A0850', '#2A1870', '#3A2888'],
  8:  ['#FF6B35', '#FF9B5A', '#FFD090'],
  9:  ['#0369A1', '#38BDF8', '#BAE6FD'],
  10: ['#5B21B6', '#8B5CF6', '#DDD6FE'],
}

const ZONE_GROUND = {
  1: '#40D864', 2: '#F8C838', 3: '#40D864', 4: '#1890CC',
  5: '#E8B840', 6: '#38D470', 7: '#180C38', 8: '#C87830',
  9: '#0C4A6E', 10: '#4C1D95',
}

// Short mascot guide phrases — what the mascot *says*, not the card content
const GUIDE = {
  idle:    'Halo! Yuk belajar bareng 📚',
  hook:    'Mulai dari pertanyaan ini dulu...',
  context: 'Sekarang, kenali konteksnya...',
  insight: 'Nah, ini intinya yang penting!',
  action:  'Siap? Waktunya buktikan! 🎯',
}

// How long each card stays "active" before the next appears (ms)
const STEP_DELAY = 1400

/**
 * Lesson intro: mascot guides through content automatically.
 * Cards reveal one-by-one — no taps required until "Mulai Kuis".
 */
export function LessonIntro({ title, hook, body, explanation, insight, source_reference, level = 1, mascotEvolutionLevel = 1, streak = 0, onContinue }) {
  const safeLevel = Math.min(Math.max(1, level), 10)
  const [sky1,, sky3] = ZONE_SKY[safeLevel] || ZONE_SKY[1]
  const ground = ZONE_GROUND[safeLevel] || ZONE_GROUND[1]
  const gradId = `intro-sky-${safeLevel}`
  const isDark = safeLevel === 7 || safeLevel === 10
  const mascotTier = getMascotByLevel(mascotEvolutionLevel)

  const cards = [
    hook?.trim()                             && { key: 'hook',    emoji: '💡', label: 'Hook',    guide: GUIDE.hook,    text: hook.trim(),                            color: '#C88000', bg: '#FFFBEA', border: '#F5C518' },
    body?.trim()                             && { key: 'context', emoji: '📖', label: 'Konteks', guide: GUIDE.context, text: body.trim(),                            color: '#5070A0', bg: '#F5F7FF', border: '#C8D4F0' },
    (explanation?.trim() || insight?.trim()) && { key: 'insight', emoji: '🧠', label: 'Insight', guide: GUIDE.insight, text: explanation?.trim() || insight?.trim(), color: '#1278A0', bg: '#EBF8FF', border: '#90D0F0' },
    // Source card — shows citation if available, otherwise generic action prompt
    { key: 'action', emoji: source_reference?.trim() ? '📚' : '🚀', label: source_reference?.trim() ? 'Sumber' : 'Aksi', guide: GUIDE.action, text: source_reference?.trim() || 'Yuk buktikan pemahamanmu — quiz sudah menunggu!', color: source_reference?.trim() ? '#7A5A30' : '#1A8050', bg: source_reference?.trim() ? '#FDF8F0' : '#EDFAF4', border: source_reference?.trim() ? '#E0C890' : '#6FD4A8' },
  ].filter(Boolean)

  // Auto-reveal cards one at a time
  const [visibleCount, setVisibleCount] = useState(0)

  useEffect(() => {
    const timers = []
    timers.push(setTimeout(() => setVisibleCount(1), 500))
    for (let i = 1; i < cards.length; i++) {
      timers.push(setTimeout(() => setVisibleCount(i + 1), 500 + i * STEP_DELAY))
    }
    return () => timers.forEach(clearTimeout)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const activeCard = cards[visibleCount - 1] ?? null
  const allRevealed = visibleCount >= cards.length

  // Mascot speech phrase — short guide, NOT the full card text
  const mascotSpeech = activeCard ? activeCard.guide : GUIDE.idle

  return (
    <div className="flex flex-1 flex-col overflow-hidden animate-lesson-fade">

      {/* ── Zone scene ── */}
      <div className="relative shrink-0 overflow-hidden" style={{ height: 100 }}>
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          viewBox="0 0 370 100"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={sky1} />
              <stop offset="100%" stopColor={sky3} />
            </linearGradient>
          </defs>
          <rect width="370" height="100" fill={`url(#${gradId})`} />
          {safeLevel !== 7 && safeLevel !== 10 && (
            <>
              <circle cx="40" cy="34" r="20" fill="#FFE840" opacity="0.22"/>
              <circle cx="40" cy="34" r="13" fill="#FFF060" opacity="0.45"/>
            </>
          )}
          {safeLevel !== 7 && safeLevel !== 8 && (
            <g style={{ animation: 'iq-cloud-drift 10s ease-in-out infinite alternate' }}>
              <ellipse cx="275" cy="26" rx="42" ry="18" fill="white" opacity="0.9"/>
              <ellipse cx="254" cy="33" rx="28" ry="14" fill="white" opacity="0.85"/>
            </g>
          )}
          <path d="M0,100 Q80,82 180,88 Q280,94 370,80 L370,100 Z" fill={ground} opacity="0.8"/>
          <path d="M0,100 Q100,94 200,97 Q300,100 370,92 L370,100 Z" fill={ground}/>
        </svg>

        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center', gap: 8, zIndex: 10,
        }}>
          <div style={{
            background: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.18)',
            backdropFilter: 'blur(6px)', borderRadius: 100, padding: '4px 14px',
            fontFamily: "'Fredoka One',cursive", fontSize: 12, color: 'white',
            textShadow: '0 1px 4px rgba(0,0,0,0.2)',
          }}>
            📚 Materi Baru · Zona {safeLevel}
          </div>
          {streak > 0 && (
            <div style={{
              background: 'linear-gradient(135deg,rgba(255,140,48,0.88),rgba(255,80,16,0.88))',
              backdropFilter: 'blur(6px)', borderRadius: 100, padding: '4px 12px',
              fontFamily: "'Fredoka One',cursive", fontSize: 12, color: 'white',
            }}>
              🔥 {streak} hari
            </div>
          )}
        </div>
      </div>

      {/* ── White sheet ── */}
      <div
        className="relative z-10 -mt-4 flex flex-1 flex-col rounded-t-[28px] bg-white overflow-hidden"
        style={{ boxShadow: '0 -6px 24px rgba(0,0,0,0.10)' }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 2, background: '#E8E0D8', margin: '10px auto 0' }} />

        {/* Lesson title */}
        <p style={{
          margin: '8px 16px 0', fontFamily: "'Fredoka One',cursive",
          fontSize: 17, fontWeight: 900, color: '#2A2020', lineHeight: 1.25, textAlign: 'center',
        }}>
          {title || 'Pelajaran Baru'}
        </p>

        {/* ── Mascot + speech bubble (guide phrase only) ── */}
        <div style={{ padding: '10px 14px 0', display: 'flex', gap: 10, alignItems: 'flex-end', flexShrink: 0 }}>
          <div style={{
            width: 68, flexShrink: 0, borderRadius: 15, overflow: 'hidden',
            background: `linear-gradient(180deg, ${mascotTier.color}40 0%, rgba(15,10,30,0.96) 60%)`,
            border: `2px solid ${mascotTier.tierColor}`,
            boxShadow: `0 0 0 3px ${mascotTier.tierColor}22, 0 6px 18px rgba(0,0,0,0.4)`,
            animation: mascotTier.anim,
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 4 }}>
              <MascotEvolution level={mascotEvolutionLevel} size={68} />
            </div>
            <div style={{
              background: `linear-gradient(90deg, ${mascotTier.tierColor}, ${mascotTier.color})`,
              textAlign: 'center', fontSize: 8, fontWeight: 900, letterSpacing: '1px',
              color: 'rgba(0,0,0,0.8)', padding: '3px', textTransform: 'uppercase',
            }}>
              {mascotTier.name}
            </div>
          </div>

          {/* Speech bubble — shows SHORT guide phrase, not card content */}
          <div
            key={mascotSpeech}
            style={{
              flex: 1,
              background: activeCard ? activeCard.bg : '#F8F6F2',
              border: `2px solid ${activeCard ? activeCard.border : '#EDE8E0'}`,
              borderRadius: '16px 16px 16px 4px',
              padding: '10px 13px',
              animation: 'iq-bubble-in 0.3s cubic-bezier(0.34,1.56,0.64,1) both',
            }}
          >
            <p style={{
              margin: 0, fontSize: 13, fontWeight: 800,
              color: activeCard ? activeCard.color : '#A09080',
              lineHeight: 1.45,
            }}>
              {mascotSpeech}
            </p>
          </div>
        </div>

        {/* ── Revealed content cards ── */}
        <div className="scrollbar-none" style={{ flex: 1, overflowY: 'auto', padding: '10px 14px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {cards.slice(0, visibleCount).map((card, i) => (
            <div
              key={card.key}
              style={{
                background: card.bg,
                border: `1.5px solid ${card.border}`,
                borderRadius: 12,
                padding: '10px 13px',
                animation: 'lesson-fade-in 0.35s ease both',
                opacity: i < visibleCount - 1 ? 0.5 : 1,
                transition: 'opacity 0.4s ease',
              }}
            >
              <div style={{
                fontSize: 9, fontWeight: 900, letterSpacing: '1.5px',
                textTransform: 'uppercase', color: card.color, marginBottom: 4,
              }}>
                {card.emoji} {card.label}
              </div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#2A2020', lineHeight: 1.5 }}>
                {card.text}
              </p>
            </div>
          ))}

          {/* Skeleton placeholders for unrevealed cards */}
          {cards.slice(visibleCount).map((card) => (
            <div
              key={`sk-${card.key}`}
              style={{
                borderRadius: 12, padding: '10px 13px',
                background: '#F5F3F0', border: '1.5px solid #EDE8E0', opacity: 0.4,
              }}
            >
              <div style={{ height: 7, width: 55, borderRadius: 4, background: '#DDD8D0', marginBottom: 8 }} />
              <div style={{ height: 7, width: '80%', borderRadius: 4, background: '#DDD8D0', marginBottom: 5 }} />
              <div style={{ height: 7, width: '55%', borderRadius: 4, background: '#DDD8D0' }} />
            </div>
          ))}

          <div style={{ height: 6 }} />
        </div>

        {/* Progress dots */}
        {cards.length > 1 && (
          <div style={{ display: 'flex', gap: 5, justifyContent: 'center', alignItems: 'center', padding: '7px 0 3px' }}>
            {cards.map((card, i) => (
              <div
                key={card.key}
                style={{
                  height: 6, borderRadius: 3,
                  width: i === visibleCount - 1 ? 20 : 6,
                  background: i < visibleCount ? card.color : '#E0D8D0',
                  transition: 'all 0.4s ease',
                }}
              />
            ))}
          </div>
        )}

        {/* ── CTA ── */}
        <div style={{ padding: '10px 16px 24px', borderTop: '1px solid #F0EDE8' }}>
          <button
            type="button"
            onClick={onContinue}
            style={{
              width: '100%', padding: '15px 20px', borderRadius: 16, cursor: 'pointer',
              fontFamily: "'Fredoka One',cursive", fontSize: 18,
              background: allRevealed
                ? 'linear-gradient(180deg,#48D870,#28B050)'
                : 'linear-gradient(180deg,#A8D8A8,#80B880)',
              color: 'white',
              border: allRevealed ? '2px solid #20A040' : '2px solid #90C890',
              boxShadow: allRevealed ? '0 5px 0 #189030' : '0 3px 0 #60A060',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              transition: 'background 0.5s, box-shadow 0.5s, border-color 0.5s',
            }}
          >
            <span>Mulai Kuis</span><span>🎯</span>
          </button>
          <p style={{
            margin: '6px 0 0', textAlign: 'center', fontSize: 10, fontWeight: 900,
            letterSpacing: '1.5px', textTransform: 'uppercase',
            color: allRevealed ? '#20A040' : '#C0B0A0',
            transition: 'color 0.5s',
          }}>
            {allRevealed ? 'Siap belajar!' : `${cards.length - visibleCount} materi lagi…`}
          </p>
        </div>
      </div>
    </div>
  )
}
