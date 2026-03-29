/** v2 "Penny Plains" zone — React SVG with bright sky, hills, flowers, start sign */
export function ZonePennyPlainsScenery() {
  return (
    <svg
      className="scenery"
      style={{ width: '100%', height: '100%', display: 'block' }}
      viewBox="0 0 366 420"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ppSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60D0FF" />
          <stop offset="50%" stopColor="#98E8FF" />
          <stop offset="100%" stopColor="#C8F4FF" />
        </linearGradient>
      </defs>
      <rect width="366" height="420" fill="url(#ppSky)" />
      {/* Big kawaii sun */}
      <circle cx="60" cy="70" r="48" fill="#FFE040" opacity="0.2" />
      <circle cx="60" cy="70" r="36" fill="#FFE840" opacity="0.35" />
      <circle cx="60" cy="70" r="26" fill="#FFF060" opacity="0.6" />
      <circle cx="60" cy="70" r="18" fill="#FFF880" opacity="0.9" />
      <circle cx="54" cy="65" r="3" fill="#F0A020" />
      <circle cx="66" cy="65" r="3" fill="#F0A020" />
      <path d="M52,72 Q60,78 68,72" stroke="#F0A020" strokeWidth="2" fill="none" strokeLinecap="round" />
      <line x1="60" y1="38" x2="60" y2="26" stroke="#FFE040" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
      <line x1="85" y1="45" x2="93" y2="37" stroke="#FFE040" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
      <line x1="96" y1="70" x2="108" y2="70" stroke="#FFE040" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
      <line x1="35" y1="45" x2="27" y2="37" stroke="#FFE040" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
      {/* Clouds */}
      <g style={{ animation: 'iq-cloud-drift 11s ease-in-out infinite alternate' }}>
        <ellipse cx="240" cy="70" rx="52" ry="30" fill="white" opacity="0.95" />
        <ellipse cx="214" cy="80" rx="36" ry="26" fill="white" opacity="0.95" />
        <ellipse cx="266" cy="82" rx="40" ry="24" fill="white" opacity="0.95" />
        <ellipse cx="240" cy="88" rx="48" ry="17" fill="white" opacity="0.95" />
      </g>
      {/* Rolling green hills */}
      <path d="M0,420 Q40,340 100,368 Q160,394 220,350 Q280,312 340,348 Q355,355 366,348 L366,420 Z" fill="#30C050" />
      <path d="M0,420 Q60,354 140,374 Q220,393 300,360 Q338,346 366,360 L366,420 Z" fill="#40D864" />
      <path d="M0,420 Q80,370 180,386 Q280,401 366,376 L366,420 Z" fill="#60E880" />
      {/* Flowers */}
      <circle cx="30" cy="365" r="3" fill="#FF6060" /><circle cx="36" cy="362" r="3" fill="#FF6060" />
      <circle cx="33" cy="357" r="3" fill="#FF6060" /><circle cx="27" cy="360" r="3" fill="#FF6060" />
      <circle cx="33" cy="361" r="5" fill="#FFE040" />
      <rect x="32" y="365" width="3" height="14" rx="1" fill="#30A840" />
      <circle cx="88" cy="372" r="3" fill="#FF90C0" /><circle cx="94" cy="369" r="3" fill="#FF90C0" />
      <circle cx="91" cy="364" r="3" fill="#FF90C0" /><circle cx="85" cy="367" r="3" fill="#FF90C0" />
      <circle cx="91" cy="368" r="5" fill="#FFE040" />
      <rect x="90" y="372" width="3" height="12" rx="1" fill="#30A840" />
      <circle cx="270" cy="368" r="3" fill="#B050FF" /><circle cx="276" cy="365" r="3" fill="#B050FF" />
      <circle cx="273" cy="360" r="3" fill="#B050FF" /><circle cx="267" cy="363" r="3" fill="#B050FF" />
      <circle cx="273" cy="364" r="5" fill="#FFE040" />
      <rect x="272" y="368" width="3" height="14" rx="1" fill="#30A840" />
      <circle cx="330" cy="373" r="3" fill="#FF6060" /><circle cx="336" cy="370" r="3" fill="#FF6060" />
      <circle cx="333" cy="365" r="3" fill="#FF6060" /><circle cx="327" cy="368" r="3" fill="#FF6060" />
      <circle cx="333" cy="369" r="5" fill="#FFE040" />
      <rect x="332" y="373" width="3" height="12" rx="1" fill="#30A840" />
      {/* Coins on grass */}
      <circle cx="148" cy="369" r="8" fill="#C8900A" /><circle cx="148" cy="367" r="8" fill="#F5C518" />
      <text x="148" y="371" textAnchor="middle" fontSize="8" fill="#9A6800" fontWeight="900" fontFamily="Arial">$</text>
      <circle cx="220" cy="374" r="7" fill="#C8900A" /><circle cx="220" cy="372" r="7" fill="#F5C518" />
      <text x="220" y="376" textAnchor="middle" fontSize="7" fill="#9A6800" fontWeight="900" fontFamily="Arial">$</text>
      {/* Start sign */}
      <rect x="166" y="290" width="10" height="80" rx="4" fill="#8B5E3C" />
      <rect x="126" y="260" width="114" height="42" rx="14" fill="#FF5090" />
      <rect x="126" y="260" width="114" height="42" rx="14" fill="none" stroke="white" strokeWidth="3" />
      <text x="183" y="286" textAnchor="middle" fontSize="18" fontFamily="sans-serif" fill="white" fontWeight="900">🚀 START!</text>
      <polygon points="183,255 193,265 173,265" fill="white" />
      <polygon points="176,295 194,300 176,305" fill="#F5C518" style={{ animation: 'iq-waving-flag 2.5s ease-in-out infinite' }} />
      {/* Rainbow */}
      <path d="M18,200 Q183,80 348,200" fill="none" stroke="#FF6060" strokeWidth="7" opacity="0.18" />
      <path d="M26,204 Q183,92 340,204" fill="none" stroke="#FF9030" strokeWidth="7" opacity="0.18" />
      <path d="M34,208 Q183,104 332,208" fill="none" stroke="#FFE040" strokeWidth="7" opacity="0.18" />
      <path d="M42,212 Q183,116 324,212" fill="none" stroke="#40D840" strokeWidth="7" opacity="0.18" />
      <path d="M50,216 Q183,128 316,216" fill="none" stroke="#40B0FF" strokeWidth="7" opacity="0.18" />
    </svg>
  )
}
