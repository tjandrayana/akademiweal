// MascotEvolution.jsx — v2 chibi redesign with per-tier animations
// Usage:  <MascotEvolution level={32} size={200} showLabel />
//
// Mascot tiers:
//   Penny  (Baby Bull)  — Level  1–10   · Bronze   · bounce
//   Toro   (Smart Bull) — Level 11–25   · Silver   · pulse
//   Vixen  (Clever Fox) — Level 26–45   · Gold     · wiggle
//   Mane   (Royal Lion) — Level 46–70   · Platinum · bounce (3s)
//   Aurum  (Gold Dragon)— Level 71+     · Legend   · pulse (2.5s)

// ─────────────────────────────────────────────────────────────
// 1. SVG COMPONENTS  (v2 chibi designs)
// ─────────────────────────────────────────────────────────────

const PennyBull = ({ size = 200 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 230" width={size} height={size * (230 / 200)} aria-label="Penny the Baby Bull">
    <ellipse cx="100" cy="224" rx="52" ry="8" fill="#D4A020" opacity="0.2"/>
    <ellipse cx="100" cy="185" rx="46" ry="40" fill="#6B9FE8"/>
    <ellipse cx="100" cy="180" rx="28" ry="25" fill="#8AB8F0" opacity="0.5"/>
    <rect x="88" y="162" width="24" height="16" rx="6" fill="#3A78D8"/>
    <rect x="92" y="165" width="16" height="10" rx="4" fill="#5A90E8"/>
    <rect x="82" y="148" width="8" height="20" rx="4" fill="#3A78D8"/>
    <rect x="110" y="148" width="8" height="20" rx="4" fill="#3A78D8"/>
    <ellipse cx="54" cy="175" rx="14" ry="11" fill="#E8A048" transform="rotate(-20,54,175)"/>
    <ellipse cx="40" cy="162" rx="12" ry="10" fill="#E8A048" transform="rotate(-40,40,162)"/>
    <ellipse cx="146" cy="175" rx="14" ry="11" fill="#E8A048" transform="rotate(20,146,175)"/>
    <ellipse cx="160" cy="162" rx="12" ry="10" fill="#E8A048" transform="rotate(40,160,162)"/>
    <g style={{ animation: 'mcard-coin-bounce 1.8s ease-in-out infinite' }}>
      <circle cx="168" cy="148" r="18" fill="#D4940A"/>
      <circle cx="168" cy="146" r="18" fill="#F0B020"/>
      <circle cx="168" cy="144" r="18" fill="#F5C518"/>
      <circle cx="168" cy="144" r="14" fill="#FFD740"/>
      <text x="168" y="150" textAnchor="middle" fontSize="16" fontWeight="900" fill="#9A6800" fontFamily="Arial,sans-serif">$</text>
      <ellipse cx="162" cy="138" rx="5" ry="3" fill="white" opacity="0.5" transform="rotate(-30,162,138)"/>
    </g>
    <ellipse cx="80" cy="218" rx="16" ry="11" fill="#3A78D8"/>
    <ellipse cx="120" cy="218" rx="16" ry="11" fill="#3A78D8"/>
    <ellipse cx="78" cy="220" rx="18" ry="9" fill="#2A2A3A"/>
    <ellipse cx="122" cy="220" rx="18" ry="9" fill="#2A2A3A"/>
    <ellipse cx="72" cy="217" rx="7" ry="4" fill="#3A3A4A" opacity="0.7"/>
    <ellipse cx="116" cy="217" rx="7" ry="4" fill="#3A3A4A" opacity="0.7"/>
    <ellipse cx="102" cy="116" rx="72" ry="70" fill="#D48830" opacity="0.2"/>
    <circle cx="100" cy="112" r="70" fill="#F0A848"/>
    <ellipse cx="82" cy="76" rx="30" ry="22" fill="#F8C870" opacity="0.5"/>
    <ellipse cx="68" cy="50" rx="11" ry="16" fill="#F8D870" transform="rotate(-12,68,50)"/>
    <ellipse cx="132" cy="50" rx="11" ry="16" fill="#F8D870" transform="rotate(12,132,50)"/>
    <ellipse cx="66" cy="38" rx="7" ry="9" fill="#FFE898" transform="rotate(-12,66,38)"/>
    <ellipse cx="134" cy="38" rx="7" ry="9" fill="#FFE898" transform="rotate(12,134,38)"/>
    <circle cx="30" cy="100" r="22" fill="#E89838"/>
    <circle cx="30" cy="100" r="14" fill="#F8B858"/>
    <circle cx="30" cy="100" r="8" fill="#F0A848"/>
    <circle cx="170" cy="100" r="22" fill="#E89838"/>
    <circle cx="170" cy="100" r="14" fill="#F8B858"/>
    <circle cx="170" cy="100" r="8" fill="#F0A848"/>
    <ellipse cx="74" cy="105" rx="26" ry="28" fill="white"/>
    <ellipse cx="126" cy="105" rx="26" ry="28" fill="white"/>
    <ellipse cx="74" cy="94" rx="26" ry="14" fill="#E8D4B8" opacity="0.3"/>
    <ellipse cx="126" cy="94" rx="26" ry="14" fill="#E8D4B8" opacity="0.3"/>
    <circle cx="74" cy="108" r="18" fill="#5A3010"/>
    <circle cx="126" cy="108" r="18" fill="#5A3010"/>
    <circle cx="74" cy="108" r="16" fill="#7A4820"/>
    <circle cx="126" cy="108" r="16" fill="#7A4820"/>
    <circle cx="76" cy="110" r="10" fill="#1A0800"/>
    <circle cx="128" cy="110" r="10" fill="#1A0800"/>
    <circle cx="82" cy="100" r="8" fill="white"/>
    <circle cx="134" cy="100" r="8" fill="white"/>
    <circle cx="70" cy="114" r="4" fill="white" opacity="0.7"/>
    <circle cx="122" cy="114" r="4" fill="white" opacity="0.7"/>
    <circle cx="85" cy="104" r="2.5" fill="white" opacity="0.5"/>
    <circle cx="137" cy="104" r="2.5" fill="white" opacity="0.5"/>
    <ellipse cx="74" cy="105" rx="26" ry="28" fill="none" stroke="#E8A048" strokeWidth="2" opacity="0.3"/>
    <ellipse cx="126" cy="105" rx="26" ry="28" fill="none" stroke="#E8A048" strokeWidth="2" opacity="0.3"/>
    <path d="M50,90 Q74,78 98,90" stroke="#3A1A00" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
    <path d="M102,90 Q126,78 150,90" stroke="#3A1A00" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
    <ellipse cx="100" cy="132" rx="28" ry="20" fill="#F8C098"/>
    <ellipse cx="90" cy="125" rx="12" ry="7" fill="#FFDAC0" opacity="0.6"/>
    <path d="M100,131 C100,131 96,127 93,129 C90,131 90,135 100,140 C110,135 110,131 107,129 C104,127 100,131 100,131 Z" fill="#E05050"/>
    <path d="M76,146 Q100,162 124,146" stroke="#C87040" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
    <rect x="88" y="148" width="12" height="9" rx="4" fill="white"/>
    <rect x="102" y="148" width="12" height="9" rx="4" fill="white"/>
    <ellipse cx="46" cy="124" rx="18" ry="12" fill="#FF9090" opacity="0.32"/>
    <ellipse cx="154" cy="124" rx="18" ry="12" fill="#FF9090" opacity="0.32"/>
    <g style={{ animation: 'mcard-sparkle 2s ease-in-out infinite 0.2s' }}>
      <path d="M24,60 L26,52 L28,60 L36,62 L28,64 L26,72 L24,64 L16,62 Z" fill="#F5C518" opacity="0.8"/>
    </g>
    <g style={{ animation: 'mcard-sparkle 2.4s ease-in-out infinite 0.8s' }}>
      <path d="M175,58 L177,52 L179,58 L185,60 L179,62 L177,68 L175,62 L169,60 Z" fill="#F5C518" opacity="0.7"/>
    </g>
    <circle cx="18" cy="85" r="3" fill="#F5C518" style={{ animation: 'mcard-sparkle 1.8s ease-in-out infinite 0.5s' }}/>
    <circle cx="182" cy="80" r="2.5" fill="#F0A030" style={{ animation: 'mcard-sparkle 2.2s ease-in-out infinite 1s' }}/>
    <circle cx="20" cy="140" r="2" fill="#F5C518" style={{ animation: 'mcard-sparkle 2s ease-in-out infinite 1.4s' }}/>
  </svg>
)

const ToroBull = ({ size = 200 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 230" width={size} height={size * (230 / 200)} aria-label="Toro the Smart Bull">
    <ellipse cx="100" cy="224" rx="50" ry="8" fill="#6090B0" opacity="0.18"/>
    <ellipse cx="100" cy="185" rx="48" ry="42" fill="#2A4A8A"/>
    <ellipse cx="100" cy="178" rx="30" ry="28" fill="#3A5AAA" opacity="0.5"/>
    <path d="M78,155 L100,163 L122,155 L126,148 Q100,142 74,148 Z" fill="#F0F0E8"/>
    <path d="M100,163 L78,155" stroke="#D8D8CC" strokeWidth="1" fill="none"/>
    <path d="M100,163 L122,155" stroke="#D8D8CC" strokeWidth="1" fill="none"/>
    <path d="M92,155 L100,161 L108,155 L106,200 L100,208 L94,200 Z" fill="#E85A30"/>
    <circle cx="98" cy="168" r="3" fill="white" opacity="0.7"/>
    <circle cx="102" cy="178" r="3" fill="white" opacity="0.7"/>
    <circle cx="99" cy="188" r="2.5" fill="white" opacity="0.6"/>
    <rect x="93" y="151" width="14" height="10" rx="4" fill="#C84020"/>
    <ellipse cx="52" cy="178" rx="16" ry="12" fill="#C89040" transform="rotate(-15,52,178)"/>
    <ellipse cx="148" cy="178" rx="16" ry="12" fill="#C89040" transform="rotate(15,148,178)"/>
    <ellipse cx="38" cy="168" rx="13" ry="14" fill="#C89040"/>
    <rect x="32" y="155" width="10" height="16" rx="5" fill="#C89040"/>
    <ellipse cx="37" cy="154" rx="7" ry="8" fill="#D8A050"/>
    <rect x="148" y="158" width="32" height="24" rx="6" fill="#3A2A18"/>
    <rect x="148" y="158" width="32" height="24" rx="6" fill="none" stroke="#5A4030" strokeWidth="1.5"/>
    <rect x="156" y="153" width="16" height="8" rx="4" fill="none" stroke="#5A4030" strokeWidth="2"/>
    <line x1="148" y1="170" x2="180" y2="170" stroke="#5A4030" strokeWidth="1.5"/>
    <circle cx="164" cy="170" r="3" fill="#C89040"/>
    <ellipse cx="82" cy="218" rx="16" ry="10" fill="#1A3A7A"/>
    <ellipse cx="118" cy="218" rx="16" ry="10" fill="#1A3A7A"/>
    <ellipse cx="80" cy="220" rx="18" ry="9" fill="#181820"/>
    <ellipse cx="120" cy="220" rx="18" ry="9" fill="#181820"/>
    <ellipse cx="102" cy="110" rx="72" ry="68" fill="#8A6028" opacity="0.15"/>
    <circle cx="100" cy="108" r="68" fill="#C89A50"/>
    <ellipse cx="82" cy="72" rx="28" ry="20" fill="#E0B870" opacity="0.5"/>
    <path d="M64,52 Q48,22 58,10 Q64,4 66,28 Q54,36 66,54" fill="#F0D080"/>
    <path d="M136,52 Q152,22 142,10 Q136,4 134,28 Q146,36 134,54" fill="#F0D080"/>
    <ellipse cx="60" cy="28" rx="5" ry="8" fill="white" opacity="0.3" transform="rotate(-15,60,28)"/>
    <ellipse cx="140" cy="28" rx="5" ry="8" fill="white" opacity="0.3" transform="rotate(15,140,28)"/>
    <circle cx="28" cy="98" r="24" fill="#B88840"/>
    <circle cx="28" cy="98" r="15" fill="#D8A858"/>
    <circle cx="28" cy="98" r="8" fill="#C89A50"/>
    <circle cx="172" cy="98" r="24" fill="#B88840"/>
    <circle cx="172" cy="98" r="15" fill="#D8A858"/>
    <circle cx="172" cy="98" r="8" fill="#C89A50"/>
    <ellipse cx="72" cy="102" rx="25" ry="26" fill="white"/>
    <ellipse cx="72" cy="90" rx="24" ry="12" fill="#D4C0A0" opacity="0.2"/>
    <circle cx="72" cy="106" r="17" fill="#3A2010"/>
    <circle cx="72" cy="106" r="14" fill="#5A3418"/>
    <circle cx="74" cy="108" r="9" fill="#0C0400"/>
    <circle cx="80" cy="98" r="8" fill="white"/>
    <circle cx="68" cy="112" r="4" fill="white" opacity="0.6"/>
    <circle cx="82" cy="100" r="2.5" fill="white" opacity="0.5"/>
    <path d="M48,88 Q72,76 96,88" stroke="#3A2010" strokeWidth="4" fill="none" strokeLinecap="round"/>
    <path d="M100,102 Q126,88 150,102" stroke="#3A2010" strokeWidth="5" fill="none" strokeLinecap="round"/>
    <path d="M108,100 Q126,94 144,100" stroke="#3A2010" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.4"/>
    <ellipse cx="72" cy="102" rx="28" ry="28" fill="none" stroke="#3A2A1A" strokeWidth="3"/>
    <ellipse cx="128" cy="102" rx="25" ry="25" fill="none" stroke="#3A2A1A" strokeWidth="3"/>
    <line x1="100" y1="102" x2="103" y2="102" stroke="#3A2A1A" strokeWidth="3"/>
    <line x1="44" y1="96" x2="24" y2="90" stroke="#3A2A1A" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="153" y1="96" x2="176" y2="90" stroke="#3A2A1A" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M56,90 Q64,86 72,88" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5"/>
    <path d="M114,90 Q122,86 130,88" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5"/>
    <ellipse cx="100" cy="128" rx="30" ry="21" fill="#E0B090"/>
    <ellipse cx="88" cy="120" rx="13" ry="8" fill="#F0C8A8" opacity="0.55"/>
    <ellipse cx="100" cy="126" rx="8" ry="6" fill="#9A5A20"/>
    <ellipse cx="97" cy="124" rx="3" ry="2" fill="#B87040" opacity="0.5"/>
    <path d="M74,140 Q100,158 126,140" stroke="#9A5A20" strokeWidth="4" fill="none" strokeLinecap="round"/>
    <rect x="86" y="143" width="13" height="10" rx="4" fill="white"/>
    <rect x="101" y="143" width="13" height="10" rx="4" fill="white"/>
    <line x1="100" y1="143" x2="100" y2="153" stroke="#D0C0B0" strokeWidth="1"/>
    <ellipse cx="44" cy="122" rx="18" ry="11" fill="#FF8888" opacity="0.3"/>
    <ellipse cx="156" cy="122" rx="18" ry="11" fill="#FF8888" opacity="0.3"/>
    <g style={{ animation: 'mcard-sparkle 2s ease-in-out infinite 0.3s' }}>
      <path d="M18,60 L20,54 L22,60 L28,62 L22,64 L20,70 L18,64 L12,62 Z" fill="#6AAAE0" opacity="0.8"/>
    </g>
    <g style={{ animation: 'mcard-sparkle 2.6s ease-in-out infinite 1s' }}>
      <path d="M175,55 L177,50 L179,55 L184,57 L179,59 L177,64 L175,59 L170,57 Z" fill="#6AAAE0" opacity="0.7"/>
    </g>
  </svg>
)

const VixenFox = ({ size = 200 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 240" width={size} height={size * (240 / 210)} aria-label="Vixen the Clever Fox">
    <ellipse cx="105" cy="234" rx="52" ry="8" fill="#C89000" opacity="0.2"/>
    <ellipse cx="172" cy="190" rx="32" ry="42" fill="#D4601A" transform="rotate(-20,172,190)"/>
    <ellipse cx="172" cy="190" rx="24" ry="34" fill="#E87030" transform="rotate(-20,172,190)"/>
    <ellipse cx="182" cy="162" rx="16" ry="22" fill="#F8EEE0" transform="rotate(-20,182,162)"/>
    <ellipse cx="184" cy="156" rx="11" ry="15" fill="white" transform="rotate(-20,184,156)" opacity="0.8"/>
    <ellipse cx="100" cy="192" rx="50" ry="44" fill="#E8701A"/>
    <ellipse cx="100" cy="185" rx="32" ry="30" fill="#F8F0E0"/>
    <circle cx="92" cy="182" r="4" fill="#F5C518" opacity="0.6"/>
    <circle cx="105" cy="188" r="3.5" fill="#F5C518" opacity="0.5"/>
    <circle cx="108" cy="175" r="3" fill="#F5C518" opacity="0.5"/>
    <circle cx="95" cy="196" r="3" fill="#F5C518" opacity="0.4"/>
    <ellipse cx="50" cy="182" rx="18" ry="13" fill="#D4601A" transform="rotate(-20,50,182)"/>
    <ellipse cx="150" cy="182" rx="18" ry="13" fill="#D4601A" transform="rotate(20,150,182)"/>
    <ellipse cx="36" cy="170" rx="16" ry="14" fill="#D4601A"/>
    <ellipse cx="36" cy="170" rx="12" ry="10" fill="#E87030"/>
    <ellipse cx="164" cy="170" rx="14" ry="12" fill="#D4601A"/>
    <rect x="152" y="150" width="30" height="22" rx="5" fill="#0A1228"/>
    <polyline points="157,166 163,159 169,162 176,154" fill="none" stroke="#00C896" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <text x="166" y="160" fontSize="5" fill="#F5C518" fontFamily="monospace" fontWeight="bold">+15%</text>
    <ellipse cx="82" cy="226" rx="16" ry="10" fill="#C45010"/>
    <ellipse cx="118" cy="226" rx="16" ry="10" fill="#C45010"/>
    <ellipse cx="80" cy="228" rx="18" ry="9" fill="#2A1A08"/>
    <ellipse cx="120" cy="228" rx="18" ry="9" fill="#2A1A08"/>
    <ellipse cx="102" cy="105" rx="72" ry="68" fill="#D4601A" opacity="0.15"/>
    <circle cx="100" cy="100" r="68" fill="#E8701A"/>
    <polygon points="52,52 28,8 76,40" fill="#D4601A"/>
    <polygon points="52,52 34,16 70,44" fill="#F07030"/>
    <polygon points="54,50 38,22 68,42" fill="#F8EEE0"/>
    <polygon points="148,52 172,8 124,40" fill="#D4601A"/>
    <polygon points="148,52 166,16 130,44" fill="#F07030"/>
    <polygon points="146,50 162,22 132,42" fill="#F8EEE0"/>
    <ellipse cx="100" cy="110" rx="48" ry="44" fill="#F8EEE0"/>
    <ellipse cx="100" cy="128" rx="28" ry="20" fill="white"/>
    <ellipse cx="72" cy="98" rx="24" ry="25" fill="white"/>
    <ellipse cx="128" cy="98" rx="24" ry="25" fill="white"/>
    <circle cx="72" cy="101" r="16" fill="#C07800"/>
    <circle cx="128" cy="101" r="16" fill="#C07800"/>
    <circle cx="72" cy="101" r="13" fill="#E09000"/>
    <circle cx="128" cy="101" r="13" fill="#E09000"/>
    <circle cx="74" cy="103" r="9" fill="#0A0400"/>
    <circle cx="130" cy="103" r="9" fill="#0A0400"/>
    <circle cx="80" cy="94" r="7" fill="white"/>
    <circle cx="136" cy="94" r="7" fill="white"/>
    <circle cx="68" cy="108" r="3.5" fill="white" opacity="0.65"/>
    <circle cx="124" cy="108" r="3.5" fill="white" opacity="0.65"/>
    <circle cx="83" cy="97" r="2" fill="white" opacity="0.5"/>
    <path d="M50,85 Q72,73 94,85" stroke="#5A2800" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
    <path d="M106,85 Q128,73 150,85" stroke="#5A2800" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
    <ellipse cx="100" cy="128" rx="9" ry="7" fill="#E05050"/>
    <ellipse cx="97" cy="126" rx="3.5" ry="2.5" fill="#F08080" opacity="0.6"/>
    <line x1="72" y1="133" x2="36" y2="125" stroke="#C87040" strokeWidth="1.5" opacity="0.5"/>
    <line x1="72" y1="138" x2="36" y2="138" stroke="#C87040" strokeWidth="1.5" opacity="0.5"/>
    <line x1="128" y1="133" x2="164" y2="125" stroke="#C87040" strokeWidth="1.5" opacity="0.5"/>
    <line x1="128" y1="138" x2="164" y2="138" stroke="#C87040" strokeWidth="1.5" opacity="0.5"/>
    <path d="M74,144 Q100,162 126,144" stroke="#9A4010" strokeWidth="4" fill="none" strokeLinecap="round"/>
    <rect x="86" y="147" width="12" height="10" rx="4" fill="white"/>
    <rect x="100" y="147" width="12" height="10" rx="4" fill="white"/>
    <line x1="99" y1="147" x2="99" y2="157" stroke="#D0C0B0" strokeWidth="1"/>
    <ellipse cx="48" cy="118" rx="18" ry="11" fill="#FF9090" opacity="0.32"/>
    <ellipse cx="152" cy="118" rx="18" ry="11" fill="#FF9090" opacity="0.32"/>
    <g style={{ animation: 'mcard-sparkle 2.2s ease-in-out infinite 0.4s' }}>
      <path d="M22,60 L24,54 L26,60 L32,62 L26,64 L24,70 L22,64 L16,62 Z" fill="#F5C518" opacity="0.8"/>
    </g>
    <g style={{ animation: 'mcard-sparkle 1.9s ease-in-out infinite 1.1s' }}>
      <path d="M178,60 L180,55 L182,60 L187,62 L182,64 L180,69 L178,64 L173,62 Z" fill="#F5C518" opacity="0.7"/>
    </g>
  </svg>
)

const ManeLion = ({ size = 200 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 240" width={size} height={size * (240 / 210)} aria-label="Mane the Royal Lion">
    <ellipse cx="105" cy="234" rx="54" ry="8" fill="#8A5A10" opacity="0.18"/>
    <ellipse cx="105" cy="192" rx="52" ry="46" fill="#8A4A90"/>
    <ellipse cx="105" cy="184" rx="34" ry="32" fill="#A060A8" opacity="0.5"/>
    <path d="M58,175 Q105,165 152,175" stroke="#F5C518" strokeWidth="2" fill="none" opacity="0.5"/>
    <path d="M52,190 Q105,180 158,190" stroke="#F5C518" strokeWidth="1.5" fill="none" opacity="0.3"/>
    <circle cx="105" cy="195" r="18" fill="#6A3878"/>
    <circle cx="105" cy="193" r="16" fill="#7A4888"/>
    <path d="M105,181 L107,189 L115,189 L109,194 L111,202 L105,197 L99,202 L101,194 L95,189 L103,189 Z" fill="#F5C518"/>
    <ellipse cx="52" cy="185" rx="18" ry="13" fill="#C89838" transform="rotate(-20,52,185)"/>
    <ellipse cx="158" cy="185" rx="18" ry="13" fill="#C89838" transform="rotate(20,158,185)"/>
    <ellipse cx="36" cy="174" rx="16" ry="14" fill="#C89838"/>
    <ellipse cx="36" cy="174" rx="12" ry="10" fill="#D8A848"/>
    <ellipse cx="174" cy="172" rx="14" ry="12" fill="#C89838"/>
    <rect x="168" y="148" width="6" height="32" rx="3" fill="#C89838"/>
    <circle cx="171" cy="145" r="10" fill="#C8900A"/>
    <circle cx="171" cy="143" r="10" fill="#F5C518"/>
    <circle cx="171" cy="143" r="7" fill="#FFD740"/>
    <path d="M167,137 L171,128 L175,137 L184,140 L175,143 L171,152 L167,143 L158,140 Z" fill="#F5C518"/>
    <ellipse cx="85" cy="228" rx="17" ry="11" fill="#6A3878"/>
    <ellipse cx="125" cy="228" rx="17" ry="11" fill="#6A3878"/>
    <ellipse cx="83" cy="230" rx="19" ry="10" fill="#2A1828"/>
    <ellipse cx="127" cy="230" rx="19" ry="10" fill="#2A1828"/>
    <circle cx="105" cy="105" r="82" fill="#D4780A"/>
    <circle cx="105" cy="105" r="76" fill="#E88A18"/>
    <circle cx="105" cy="105" r="70" fill="#F0A030"/>
    <circle cx="34" cy="80" r="22" fill="#E88A18"/>
    <circle cx="176" cy="80" r="22" fill="#E88A18"/>
    <circle cx="28" cy="110" r="20" fill="#D4780A"/>
    <circle cx="182" cy="110" r="20" fill="#D4780A"/>
    <circle cx="42" cy="52" r="18" fill="#E88A18"/>
    <circle cx="168" cy="52" r="18" fill="#E88A18"/>
    <circle cx="72" cy="36" r="17" fill="#F0A030"/>
    <circle cx="138" cy="36" r="17" fill="#F0A030"/>
    <circle cx="105" cy="28" r="18" fill="#E88A18"/>
    <circle cx="105" cy="108" r="62" fill="#E8B050"/>
    <ellipse cx="88" cy="74" rx="25" ry="18" fill="#F0C870" opacity="0.5"/>
    <rect x="74" y="46" width="62" height="20" rx="6" fill="#F5C518"/>
    <rect x="74" y="26" width="14" height="22" rx="7" fill="#F5C518"/>
    <rect x="98" y="20" width="14" height="28" rx="7" fill="#F5C518"/>
    <rect x="122" y="26" width="14" height="22" rx="7" fill="#F5C518"/>
    <circle cx="81" cy="30" r="6" fill="#FF5050"/>
    <circle cx="81" cy="30" r="4" fill="#FF8080"/>
    <circle cx="105" cy="24" r="7" fill="#8050FF"/>
    <circle cx="105" cy="24" r="5" fill="#B090FF"/>
    <circle cx="129" cy="30" r="6" fill="#00C896"/>
    <circle cx="129" cy="30" r="4" fill="#60E8B8"/>
    <rect x="76" y="48" width="58" height="6" rx="3" fill="white" opacity="0.3"/>
    <circle cx="36" cy="92" r="22" fill="#D4901A"/>
    <circle cx="36" cy="92" r="14" fill="#E8A830"/>
    <circle cx="36" cy="92" r="8" fill="#E8B050"/>
    <circle cx="174" cy="92" r="22" fill="#D4901A"/>
    <circle cx="174" cy="92" r="14" fill="#E8A830"/>
    <circle cx="174" cy="92" r="8" fill="#E8B050"/>
    <ellipse cx="80" cy="108" rx="26" ry="27" fill="white"/>
    <ellipse cx="130" cy="108" rx="26" ry="27" fill="white"/>
    <ellipse cx="80" cy="96" rx="25" ry="13" fill="#D4C0A0" opacity="0.2"/>
    <ellipse cx="130" cy="96" rx="25" ry="13" fill="#D4C0A0" opacity="0.2"/>
    <circle cx="80" cy="112" r="18" fill="#806010"/>
    <circle cx="130" cy="112" r="18" fill="#806010"/>
    <circle cx="80" cy="112" r="15" fill="#C09020"/>
    <circle cx="130" cy="112" r="15" fill="#C09020"/>
    <circle cx="82" cy="114" r="10" fill="#0A0600"/>
    <circle cx="132" cy="114" r="10" fill="#0A0600"/>
    <circle cx="88" cy="104" r="8" fill="white"/>
    <circle cx="138" cy="104" r="8" fill="white"/>
    <circle cx="76" cy="118" r="4" fill="white" opacity="0.65"/>
    <circle cx="126" cy="118" r="4" fill="white" opacity="0.65"/>
    <circle cx="90" cy="106" r="2.5" fill="white" opacity="0.5"/>
    <path d="M56,94 Q80,82 104,94" stroke="#6A4010" strokeWidth="4" fill="none" strokeLinecap="round"/>
    <path d="M106,94 Q130,82 154,94" stroke="#6A4010" strokeWidth="4" fill="none" strokeLinecap="round"/>
    <ellipse cx="105" cy="132" rx="14" ry="10" fill="#9A5A10"/>
    <ellipse cx="101" cy="129" rx="5" ry="3.5" fill="#C07A30" opacity="0.5"/>
    <ellipse cx="100" cy="135" rx="4" ry="3" fill="#7A4008"/>
    <ellipse cx="110" cy="135" rx="4" ry="3" fill="#7A4008"/>
    <path d="M72,148 Q105,172 138,148" stroke="#9A5A10" strokeWidth="5" fill="none" strokeLinecap="round"/>
    <rect x="85" y="151" width="12" height="11" rx="5" fill="white"/>
    <rect x="99" y="151" width="12" height="11" rx="5" fill="white"/>
    <rect x="113" y="151" width="12" height="11" rx="5" fill="white"/>
    <line x1="98" y1="151" x2="98" y2="162" stroke="#D0C0B0" strokeWidth="1"/>
    <line x1="112" y1="151" x2="112" y2="162" stroke="#D0C0B0" strokeWidth="1"/>
    <ellipse cx="105" cy="164" rx="12" ry="8" fill="#FF7070" opacity="0.85"/>
    <line x1="105" y1="157" x2="105" y2="172" stroke="#E05060" strokeWidth="1.5" opacity="0.5"/>
    <ellipse cx="50" cy="130" rx="20" ry="13" fill="#FF8888" opacity="0.35"/>
    <ellipse cx="160" cy="130" rx="20" ry="13" fill="#FF8888" opacity="0.35"/>
    <g style={{ animation: 'mcard-sparkle 2.1s ease-in-out infinite 0.5s' }}>
      <path d="M18,65 L20,59 L22,65 L28,67 L22,69 L20,75 L18,69 L12,67 Z" fill="#C8A8F8" opacity="0.8"/>
    </g>
    <g style={{ animation: 'mcard-sparkle 2.5s ease-in-out infinite 1.2s' }}>
      <path d="M182,60 L184,55 L186,60 L191,62 L186,64 L184,69 L182,64 L177,62 Z" fill="#C8A8F8" opacity="0.8"/>
    </g>
    <circle cx="20" cy="100" r="3" fill="#F5C518" style={{ animation: 'mcard-sparkle 1.8s ease-in-out infinite 0.8s' }}/>
    <circle cx="190" cy="98" r="3" fill="#F5C518" style={{ animation: 'mcard-sparkle 2.2s ease-in-out infinite 1.4s' }}/>
  </svg>
)

const AurumDragon = ({ size = 200 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 248" width={size} height={size * (248 / 220)} aria-label="Aurum the Golden Dragon">
    <ellipse cx="110" cy="242" rx="58" ry="9" fill="#B08800" opacity="0.22"/>
    <path d="M42,120 Q10,80 22,55 Q36,42 52,72 Q38,85 50,108" fill="#D4A000" opacity="0.9"/>
    <path d="M44,118 Q18,84 28,64 Q38,56 50,80 Q40,90 52,110" fill="#F5C518" opacity="0.7"/>
    <path d="M44,116 Q34,98 38,78" stroke="#D4A000" strokeWidth="1.2" fill="none" opacity="0.5"/>
    <path d="M178,120 Q210,80 198,55 Q184,42 168,72 Q182,85 170,108" fill="#D4A000" opacity="0.9"/>
    <path d="M176,118 Q202,84 192,64 Q182,56 170,80 Q180,90 168,110" fill="#F5C518" opacity="0.7"/>
    <path d="M176,116 Q186,98 182,78" stroke="#D4A000" strokeWidth="1.2" fill="none" opacity="0.5"/>
    <ellipse cx="110" cy="200" rx="62" ry="52" fill="#C89000"/>
    <ellipse cx="110" cy="200" rx="58" ry="48" fill="#D4A010"/>
    <ellipse cx="110" cy="200" rx="42" ry="38" fill="#F0C030"/>
    <ellipse cx="110" cy="198" rx="34" ry="30" fill="#F5C840"/>
    <ellipse cx="98" cy="192" rx="10" ry="7" fill="#F8D860" opacity="0.6"/>
    <ellipse cx="118" cy="188" rx="10" ry="7" fill="#F8D860" opacity="0.6"/>
    <ellipse cx="106" cy="208" rx="12" ry="7" fill="#F8D860" opacity="0.5"/>
    <path d="M110,186 L112,194 L120,194 L114,199 L116,207 L110,202 L104,207 L106,199 L100,194 L108,194 Z" fill="#F5C518"/>
    <path d="M64,185 Q110,175 156,185" stroke="#C89000" strokeWidth="1.5" fill="none" opacity="0.4"/>
    <path d="M58,205 Q110,195 162,205" stroke="#B88000" strokeWidth="1" fill="none" opacity="0.3"/>
    <ellipse cx="50" cy="188" rx="20" ry="14" fill="#C89000"/>
    <ellipse cx="44" cy="192" rx="16" ry="13" fill="#D4A010"/>
    <ellipse cx="34" cy="190" rx="7" ry="6" fill="#E8B820"/>
    <ellipse cx="30" cy="197" rx="6" ry="5" fill="#E8B820"/>
    <ellipse cx="36" cy="202" rx="6" ry="5" fill="#E8B820"/>
    <ellipse cx="170" cy="188" rx="20" ry="14" fill="#C89000"/>
    <ellipse cx="176" cy="192" rx="16" ry="13" fill="#D4A010"/>
    <ellipse cx="186" cy="190" rx="7" ry="6" fill="#E8B820"/>
    <ellipse cx="190" cy="197" rx="6" ry="5" fill="#E8B820"/>
    <ellipse cx="184" cy="202" rx="6" ry="5" fill="#E8B820"/>
    <ellipse cx="86" cy="236" rx="18" ry="12" fill="#B88000"/>
    <ellipse cx="134" cy="236" rx="18" ry="12" fill="#B88000"/>
    <ellipse cx="84" cy="238" rx="20" ry="10" fill="#7A5800"/>
    <ellipse cx="136" cy="238" rx="20" ry="10" fill="#7A5800"/>
    <path d="M162,220 Q190,230 192,215 Q190,200 178,205" stroke="#C89000" strokeWidth="22" fill="none" strokeLinecap="round"/>
    <path d="M162,220 Q190,230 192,215 Q190,200 178,205" stroke="#D4A010" strokeWidth="14" fill="none" strokeLinecap="round"/>
    <ellipse cx="192" cy="204" rx="8" ry="12" fill="#F5C518" transform="rotate(30,192,204)"/>
    <ellipse cx="185" cy="196" rx="6" ry="10" fill="#F0B820" transform="rotate(20,185,196)"/>
    <circle cx="88" cy="148" r="11" fill="#B88000" style={{ animation: 'mcard-coin-bounce 1.2s ease-in-out infinite 0s' }}/>
    <circle cx="88" cy="146" r="11" fill="#F5C518" style={{ animation: 'mcard-coin-bounce 1.2s ease-in-out infinite 0s' }}/>
    <text x="88" y="151" textAnchor="middle" fontSize="11" fill="#8A5800" fontWeight="900" fontFamily="Arial,sans-serif" style={{ animation: 'mcard-coin-bounce 1.2s ease-in-out infinite 0s' }}>$</text>
    <circle cx="66" cy="135" r="8" fill="#C89000" style={{ animation: 'mcard-coin-bounce 1.2s ease-in-out infinite 0.3s' }}/>
    <circle cx="66" cy="133" r="8" fill="#F5C518" style={{ animation: 'mcard-coin-bounce 1.2s ease-in-out infinite 0.3s' }}/>
    <text x="66" y="137" textAnchor="middle" fontSize="8" fill="#8A5800" fontWeight="900" fontFamily="Arial,sans-serif" style={{ animation: 'mcard-coin-bounce 1.2s ease-in-out infinite 0.3s' }}>$</text>
    <circle cx="50" cy="120" r="6" fill="#D4A010" style={{ animation: 'mcard-coin-bounce 1.2s ease-in-out infinite 0.6s' }}/>
    <circle cx="50" cy="118" r="6" fill="#F5C518" style={{ animation: 'mcard-coin-bounce 1.2s ease-in-out infinite 0.6s' }}/>
    <text x="50" y="122" textAnchor="middle" fontSize="7" fill="#8A5800" fontWeight="900" fontFamily="Arial,sans-serif" style={{ animation: 'mcard-coin-bounce 1.2s ease-in-out infinite 0.6s' }}>$</text>
    <ellipse cx="112" cy="112" rx="82" ry="78" fill="#B08000" opacity="0.15"/>
    <circle cx="110" cy="108" r="78" fill="#C89000"/>
    <circle cx="110" cy="104" r="74" fill="#D4A010"/>
    <ellipse cx="90" cy="68" rx="32" ry="22" fill="#E8B820" opacity="0.45"/>
    <path d="M60,95 Q80,88 100,93" stroke="#B88000" strokeWidth="1.5" fill="none" opacity="0.3"/>
    <path d="M120,93 Q140,88 160,95" stroke="#B88000" strokeWidth="1.5" fill="none" opacity="0.3"/>
    <path d="M72,50 Q50,22 62,8 Q70,2 72,24 Q58,34 74,50" fill="#F5C518"/>
    <ellipse cx="64" cy="18" rx="7" ry="10" fill="#FFE060" transform="rotate(-15,64,18)"/>
    <path d="M148,50 Q170,22 158,8 Q150,2 148,24 Q162,34 146,50" fill="#F5C518"/>
    <ellipse cx="156" cy="18" rx="7" ry="10" fill="#FFE060" transform="rotate(15,156,18)"/>
    <circle cx="90" cy="48" r="10" fill="#E8B020"/>
    <circle cx="110" cy="42" r="11" fill="#E8B020"/>
    <circle cx="130" cy="48" r="10" fill="#E8B020"/>
    <circle cx="90" cy="48" r="7" fill="#F0C030"/>
    <circle cx="110" cy="42" r="8" fill="#F0C030"/>
    <circle cx="130" cy="48" r="7" fill="#F0C030"/>
    <ellipse cx="79" cy="105" rx="28" ry="29" fill="white"/>
    <ellipse cx="141" cy="105" rx="28" ry="29" fill="white"/>
    <circle cx="79" cy="109" r="20" fill="#A06000"/>
    <circle cx="141" cy="109" r="20" fill="#A06000"/>
    <circle cx="79" cy="109" r="17" fill="#D08010"/>
    <circle cx="141" cy="109" r="17" fill="#D08010"/>
    <circle cx="79" cy="109" r="13" fill="#F0A020"/>
    <circle cx="141" cy="109" r="13" fill="#F0A020"/>
    <circle cx="81" cy="111" r="9" fill="#0A0600"/>
    <circle cx="143" cy="111" r="9" fill="#0A0600"/>
    <circle cx="88" cy="100" r="9" fill="white"/>
    <circle cx="150" cy="100" r="9" fill="white"/>
    <circle cx="75" cy="116" r="4.5" fill="white" opacity="0.65"/>
    <circle cx="137" cy="116" r="4.5" fill="white" opacity="0.65"/>
    <circle cx="90" cy="102" r="3" fill="white" opacity="0.5"/>
    <ellipse cx="79" cy="105" rx="28" ry="29" fill="none" stroke="#C89000" strokeWidth="2" opacity="0.3"/>
    <ellipse cx="141" cy="105" rx="28" ry="29" fill="none" stroke="#C89000" strokeWidth="2" opacity="0.3"/>
    <path d="M54,91 Q79,78 104,91" stroke="#7A5000" strokeWidth="4" fill="none" strokeLinecap="round"/>
    <path d="M116,91 Q141,78 166,91" stroke="#7A5000" strokeWidth="4" fill="none" strokeLinecap="round"/>
    <ellipse cx="110" cy="132" rx="32" ry="22" fill="#E8A820"/>
    <ellipse cx="98" cy="124" rx="14" ry="9" fill="#F0B840" opacity="0.5"/>
    <ellipse cx="100" cy="132" rx="7" ry="5" fill="#9A7000"/>
    <ellipse cx="120" cy="132" rx="7" ry="5" fill="#9A7000"/>
    <path d="M76,148 Q110,170 144,148" stroke="#9A6800" strokeWidth="5" fill="none" strokeLinecap="round"/>
    <rect x="88" y="151" width="13" height="12" rx="5" fill="white"/>
    <rect x="103" y="149" width="14" height="13" rx="5" fill="white"/>
    <rect x="119" y="151" width="13" height="12" rx="5" fill="white"/>
    <line x1="102" y1="149" x2="102" y2="162" stroke="#D0C0A0" strokeWidth="1"/>
    <line x1="118" y1="149" x2="118" y2="162" stroke="#D0C0A0" strokeWidth="1"/>
    <ellipse cx="110" cy="165" rx="14" ry="9" fill="#FF7070" opacity="0.8"/>
    <line x1="110" y1="158" x2="110" y2="174" stroke="#E05060" strokeWidth="1.5" opacity="0.5"/>
    <ellipse cx="48" cy="124" rx="22" ry="14" fill="#FF9090" opacity="0.35"/>
    <ellipse cx="172" cy="124" rx="22" ry="14" fill="#FF9090" opacity="0.35"/>
    <g style={{ animation: 'mcard-sparkle 1.8s ease-in-out infinite 0s' }}>
      <path d="M20,62 L23,54 L26,62 L34,65 L26,68 L23,76 L20,68 L12,65 Z" fill="#F5C518" opacity="0.9"/>
    </g>
    <g style={{ animation: 'mcard-sparkle 2.1s ease-in-out infinite 0.6s' }}>
      <path d="M190,58 L193,51 L196,58 L203,61 L196,64 L193,71 L190,64 L183,61 Z" fill="#F5C518" opacity="0.9"/>
    </g>
    <g style={{ animation: 'mcard-sparkle 2.5s ease-in-out infinite 1.1s' }}>
      <path d="M12,130 L14,125 L16,130 L21,132 L16,134 L14,139 L12,134 L7,132 Z" fill="#F5C518" opacity="0.8"/>
    </g>
    <g style={{ animation: 'mcard-sparkle 1.9s ease-in-out infinite 1.6s' }}>
      <path d="M198,128 L200,124 L202,128 L207,130 L202,132 L200,136 L198,132 L193,130 Z" fill="#F5C518" opacity="0.8"/>
    </g>
    <circle cx="30" cy="98" r="4" fill="#F5C518" style={{ animation: 'mcard-sparkle 2.3s ease-in-out infinite 0.9s' }}/>
    <circle cx="190" cy="95" r="4" fill="#F5C518" style={{ animation: 'mcard-sparkle 2s ease-in-out infinite 1.5s' }}/>
  </svg>
)

// ─────────────────────────────────────────────────────────────
// 2. TIER CONFIG
// ─────────────────────────────────────────────────────────────

const TIERS = [
  {
    minLevel: 1,  maxLevel: 10,
    name: 'Penny',   species: 'Baby Bull',     tier: 'Bronze',
    color: '#E8A060', tierColor: '#CD7F32',
    Component: PennyBull,
    anim: 'mcard-bounce 2.4s ease-in-out infinite',
    quote: 'Every coin counts! I\'m gonna be rich... eventually! 🪙',
    perks: ['Coin Finder', 'Beginner Shield', 'Luck Boost'],
  },
  {
    minLevel: 11, maxLevel: 25,
    name: 'Toro',    species: 'Smart Bull',    tier: 'Silver',
    color: '#C8D8E8', tierColor: '#A8B8D0',
    Component: ToroBull,
    anim: 'mcard-pulse 2s ease-in-out infinite',
    quote: "Two bear markets survived. Zero chill lost. 📊",
    perks: ['Market Scanner', 'Portfolio Tracker', 'Risk Detector'],
  },
  {
    minLevel: 26, maxLevel: 45,
    name: 'Vixen',   species: 'Clever Fox',   tier: 'Gold',
    color: '#FFE97A', tierColor: '#F5C518',
    Component: VixenFox,
    anim: 'mcard-wiggle 3s ease-in-out infinite',
    quote: 'I find deals others miss. Also I have the fluffiest tail! 🦊',
    perks: ['Pattern Recognition', 'Value Trap Detector', 'Short Squeeze Alert'],
  },
  {
    minLevel: 46, maxLevel: 70,
    name: 'Mane',    species: 'Royal Lion',    tier: 'Platinum',
    color: '#E8E0F8', tierColor: '#B8A8E8',
    Component: ManeLion,
    anim: 'mcard-bounce 3s ease-in-out infinite',
    quote: 'My portfolio roars louder than me! 🦁👑',
    perks: ['Portfolio Rebalancer', 'Macro Intelligence', 'Dividend Oracle'],
  },
  {
    minLevel: 71, maxLevel: Infinity,
    name: 'Aurum',   species: 'Golden Dragon', tier: 'Legend',
    color: '#FFD700', tierColor: '#C89000',
    Component: AurumDragon,
    anim: 'mcard-pulse 2.5s ease-in-out infinite',
    quote: "I breathe COINS, not fire. Much more profitable! 🪙🐉",
    perks: ['Time Machine Backtester', 'Global Macro Oracle', 'All Abilities Unlocked'],
  },
]

// ─────────────────────────────────────────────────────────────
// 3. HELPER
// ─────────────────────────────────────────────────────────────

export function getMascotByLevel(level) {
  return TIERS.find(t => level >= t.minLevel && level <= t.maxLevel) ?? TIERS[0]
}

// ─────────────────────────────────────────────────────────────
// 4. MAIN COMPONENT
// ─────────────────────────────────────────────────────────────

/**
 * MascotEvolution
 *
 * @param {number}  level      - User's current level (1–∞)
 * @param {number}  size       - Width in px (default 200)
 * @param {boolean} showLabel  - Show name + tier badge below mascot
 * @param {boolean} showQuote  - Show character quote
 * @param {boolean} showPerks  - Show perk chips
 * @param {string}  className  - Extra CSS class for wrapper
 */
export default function MascotEvolution({
  level = 1,
  size = 200,
  showLabel = false,
  showQuote = false,
  showPerks = false,
  className = '',
}) {
  const mascot = getMascotByLevel(level)
  const { Component, anim, name, species, tier, color, tierColor, quote, perks } = mascot

  return (
    <div
      className={className}
      style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
    >
      <div style={{ animation: anim }}>
        <Component size={size} />
      </div>

      {showLabel && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 900, fontSize: size * 0.1, color }}>
            {name}
          </div>
          <div style={{
            fontSize: size * 0.065,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: tierColor,
            marginTop: 2,
          }}>
            {tier} · {species}
          </div>
        </div>
      )}

      {showQuote && (
        <p style={{
          fontStyle: 'italic',
          fontSize: size * 0.068,
          color: '#A0BEE8',
          maxWidth: size * 1.4,
          textAlign: 'center',
          lineHeight: 1.6,
        }}>
          "{quote}"
        </p>
      )}

      {showPerks && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
          {perks.map(perk => (
            <span
              key={perk}
              style={{
                fontSize: size * 0.055,
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 100,
                border: `1px solid ${tierColor}55`,
                background: `${tierColor}15`,
                color: tierColor,
              }}
            >
              {perk}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// 5. NAMED SVG EXPORTS (use these when you only need 1 mascot)
// ─────────────────────────────────────────────────────────────

export { PennyBull, ToroBull, VixenFox, ManeLion, AurumDragon }
export { TIERS }
