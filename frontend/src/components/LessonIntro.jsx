import { Button } from './Button'

/**
 * Hook + micro content before quiz / interaction.
 * Two-zone layout: illustrated hero (top) + white content card (bottom).
 *
 * @param {{ title: string, hook: string, body: string, onContinue: () => void }} props
 */
export function LessonIntro({ title, hook, body, onContinue }) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden animate-lesson-fade">

      {/* ── Zone 1: Hero landscape ── */}
      <div
        className="relative shrink-0 overflow-hidden"
        style={{ minHeight: 240 }}
      >
        {/* SVG landscape background */}
        <svg
          viewBox="0 0 400 240"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="intro-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5BBDE4" />
              <stop offset="100%" stopColor="#A8D8F0" />
            </linearGradient>
          </defs>

          {/* Sky */}
          <rect width="400" height="240" fill="url(#intro-sky)" />

          {/* Sun */}
          <circle cx="348" cy="36" r="26" fill="#FFF9C4" opacity="0.55" />
          <circle cx="348" cy="36" r="18" fill="#FFE082" opacity="0.8" />

          {/* Cloud left */}
          <g opacity="0.97">
            <ellipse cx="72" cy="54" rx="44" ry="21" fill="white" />
            <ellipse cx="93" cy="44" rx="31" ry="26" fill="white" />
            <ellipse cx="55" cy="51" rx="27" ry="17" fill="white" />
          </g>

          {/* Cloud right */}
          <g opacity="0.92">
            <ellipse cx="308" cy="42" rx="39" ry="19" fill="white" />
            <ellipse cx="330" cy="32" rx="27" ry="23" fill="white" />
            <ellipse cx="292" cy="40" rx="23" ry="15" fill="white" />
          </g>

          {/* Back hills */}
          <path d="M0 178 C55 148 110 165 165 152 C220 139 270 128 320 148 C355 163 378 152 400 158 L400 240 L0 240 Z" fill="#B8E4A0" />

          {/* Back trees left */}
          <polygon points="36,158 49,120 62,158" fill="#3A9B5C" />
          <polygon points="33,170 49,134 65,170" fill="#4DB870" />
          <rect x="45" y="168" width="8" height="13" fill="#7B5E45" rx="2" />
          <ellipse cx="82" cy="160" rx="15" ry="17" fill="#3A9B5C" />
          <ellipse cx="82" cy="152" rx="11" ry="13" fill="#52C97A" />
          <rect x="79" y="173" width="6" height="10" fill="#7B5E45" rx="2" />

          {/* Back trees right */}
          <polygon points="318,152 332,113 346,152" fill="#3A9B5C" />
          <polygon points="315,164 332,127 349,164" fill="#4DB870" />
          <rect x="328" y="162" width="8" height="13" fill="#7B5E45" rx="2" />
          <ellipse cx="362" cy="163" rx="16" ry="18" fill="#3A9B5C" />
          <ellipse cx="362" cy="155" rx="12" ry="14" fill="#52C97A" />
          <rect x="359" y="177" width="6" height="10" fill="#7B5E45" rx="2" />

          {/* Mid hill */}
          <path d="M0 198 C45 178 95 188 148 181 C200 174 250 167 300 178 C338 186 368 180 400 184 L400 240 L0 240 Z" fill="#72C464" />

          {/* Ground */}
          <rect y="218" width="400" height="22" fill="#5CAF55" />
          <path d="M0 218 Q100 214 200 218 Q300 222 400 218" stroke="#6DC95E" strokeWidth="3" fill="none" opacity="0.6" />

          {/* Grass tufts */}
          <path d="M18 218 Q20 210 22 218" stroke="#4A9A47" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M23 218 Q25 212 27 218" stroke="#4A9A47" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M155 218 Q157 211 159 218" stroke="#4A9A47" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M340 218 Q342 210 344 218" stroke="#4A9A47" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>

        {/* Mascot + title overlay */}
        <div className="relative z-10 flex flex-col items-center justify-center gap-3 px-6 pt-6 pb-16 h-full" style={{ minHeight: 240 }}>
          {/* Mascot in frosted circle */}
          <div
            className="flex h-24 w-24 items-center justify-center rounded-full bg-white/85 border-4 border-white shadow-2xl text-[56px] leading-none animate-mascot-bounce"
            aria-hidden="true"
          >
            🐂
          </div>

          {/* Title */}
          <h2
            id="lesson-intro-title"
            className="m-0 text-2xl font-extrabold text-white leading-tight tracking-tight text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]"
          >
            {title}
          </h2>

          {/* "Materi baru" badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/25 border border-white/40 px-3 py-1 backdrop-blur-sm">
            <span className="text-xs leading-none" aria-hidden="true">📚</span>
            <span className="text-xs font-bold text-white tracking-wide drop-shadow-sm">Materi Baru</span>
          </div>
        </div>
      </div>

      {/* ── Zone 2: Content card ── */}
      <div
        className="relative z-10 -mt-5 flex flex-1 flex-col rounded-t-[28px] bg-white overflow-hidden"
        style={{ boxShadow: '0 -6px 24px rgba(0,0,0,0.10)' }}
      >
        <div className="flex flex-1 flex-col gap-3 px-5 pt-6 pb-4">

          {/* Hook — blue highlight card */}
          {hook ? (
            <div className="rounded-2xl bg-blue-50 border border-blue-100 px-4 py-4">
              <div className="flex items-start gap-3">
                <span className="text-xl leading-none shrink-0 mt-0.5" aria-hidden="true">💡</span>
                <p className="m-0 text-base font-bold leading-snug text-text">{hook}</p>
              </div>
            </div>
          ) : null}

          {/* Body — subtle card */}
          {body ? (
            <div className="rounded-2xl bg-gray-50 border border-gray-100 px-4 py-4">
              <p className="m-0 text-sm leading-relaxed text-text">{body}</p>
            </div>
          ) : null}

          <div className="flex-1" />
        </div>

        {/* CTA anchored to bottom */}
        <div className="px-5 pb-6 pt-2 border-t border-gray-100">
          <Button
            type="button"
            variant="primary"
            className="w-full font-bold"
            onClick={onContinue}
          >
            Lanjut ke Quiz →
          </Button>
          <p className="m-0 mt-2.5 text-center text-xs font-semibold uppercase tracking-wide text-muted">
            Quiz di langkah berikutnya
          </p>
        </div>
      </div>
    </div>
  )
}
