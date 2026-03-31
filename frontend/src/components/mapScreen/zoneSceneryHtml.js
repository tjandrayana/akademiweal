/** Zone scenery HTML strings (innerHTML of SVG) — v2 colorful designs */

export const ZONE_VIEWBOX = {
  10: '0 0 366 400',
  9: '0 0 366 380',
  8: '0 0 366 400',
  7: '0 0 366 380',
  6: '0 0 366 380',
  5: '0 0 366 370',
  4: '0 0 366 370',
  3: '0 0 366 370',
  2: '0 0 366 370',
  1: '0 0 366 420',
}

/** Per-zone trail path data + stroke color for animated dashed trail */
export const ZONE_TRAIL_PATHS = {
  10: { d: 'M183,380 Q120,350 100,305 Q80,265 150,245 Q210,230 260,270 Q310,305 270,345', color: '#FF8040' },
  9: { d: 'M183,370 Q110,340 100,290 Q92,252 140,235 Q190,220 245,255 Q290,282 260,325', color: '#B8A8E8' },
  8: { d: 'M183,380 Q120,350 100,305 Q80,265 150,245 Q210,230 260,270 Q310,305 270,345', color: '#FF8040' },
  7: { d: 'M183,370 Q110,340 100,290 Q92,252 140,235 Q190,220 245,255 Q290,282 260,325', color: '#B8A8E8' },
  6: { d: 'M183,370 Q115,345 105,298 Q96,258 142,238 Q188,220 242,258 Q280,286 258,328', color: '#60D880' },
  5: { d: 'M183,360 Q110,332 102,285 Q94,248 142,230 Q192,214 246,252 Q284,280 256,320', color: '#FFD040' },
  4: { d: 'M183,360 Q112,332 104,286 Q98,250 144,232 Q192,216 246,254 Q282,282 256,322', color: '#60D0FF' },
  3: { d: 'M183,362 Q113,334 104,288 Q96,252 142,234 Q192,218 246,254 Q282,280 258,322', color: '#B060FF' },
  2: { d: 'M183,362 Q112,335 103,288 Q96,252 142,234 Q190,218 245,255 Q282,280 256,322', color: '#FFE040' },
  1: { d: 'M255,410 Q183,390 115,370 Q176,350 258,330 Q183,312 108,295 Q183,275 262,255 Q183,235 108,215 Q183,195 255,178', color: '#60E880' },
}

export const SCENERY_ZONE_8_HTML = `
  <defs>
    <linearGradient id="sky8" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FF6B35"/>
      <stop offset="40%" stop-color="#FF9B5A"/>
      <stop offset="80%" stop-color="#FFD090"/>
      <stop offset="100%" stop-color="#FFE8C0"/>
    </linearGradient>
    <linearGradient id="volcano8" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#C84020"/>
      <stop offset="100%" stop-color="#8A2010"/>
    </linearGradient>
    <radialGradient id="lavaGlow8" cx="50%" cy="0%" r="70%">
      <stop offset="0%" stop-color="#FF6020" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="#FF6020" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="366" height="400" fill="url(#sky8)"/>
  <circle cx="183" cy="60" r="50" fill="#FFD040" opacity="0.3"/>
  <circle cx="183" cy="60" r="36" fill="#FFE060" opacity="0.4"/>
  <circle cx="183" cy="60" r="24" fill="#FFE880" opacity="0.6"/>
  <line x1="183" y1="18" x2="183" y2="5" stroke="#FFE060" stroke-width="3" stroke-linecap="round" opacity="0.5"/>
  <line x1="215" y1="28" x2="224" y2="19" stroke="#FFE060" stroke-width="3" stroke-linecap="round" opacity="0.5"/>
  <line x1="225" y1="60" x2="240" y2="60" stroke="#FFE060" stroke-width="3" stroke-linecap="round" opacity="0.5"/>
  <line x1="151" y1="28" x2="142" y2="19" stroke="#FFE060" stroke-width="3" stroke-linecap="round" opacity="0.5"/>
  <line x1="141" y1="60" x2="126" y2="60" stroke="#FFE060" stroke-width="3" stroke-linecap="round" opacity="0.5"/>
  <g opacity="0.9" style="animation:iq-cloud-drift 8s ease-in-out infinite alternate">
    <ellipse cx="70" cy="100" rx="40" ry="24" fill="white"/>
    <ellipse cx="50" cy="106" rx="28" ry="20" fill="white"/>
    <ellipse cx="90" cy="108" rx="30" ry="18" fill="white"/>
    <ellipse cx="70" cy="112" rx="38" ry="14" fill="white"/>
  </g>
  <g opacity="0.85" style="animation:iq-cloud-drift 12s ease-in-out infinite alternate-reverse">
    <ellipse cx="300" cy="85" rx="44" ry="26" fill="white"/>
    <ellipse cx="278" cy="92" rx="30" ry="20" fill="white"/>
    <ellipse cx="322" cy="94" rx="32" ry="20" fill="white"/>
    <ellipse cx="300" cy="98" rx="40" ry="14" fill="white"/>
  </g>
  <polygon points="60,380 183,180 306,380" fill="#C84020"/>
  <polygon points="80,380 183,192 286,380" fill="#E05030"/>
  <path d="M150,210 Q183,195 216,210" fill="#FF8050" opacity="0.8"/>
  <ellipse cx="183" cy="205" rx="28" ry="14" fill="url(#lavaGlow8)"/>
  <ellipse cx="183" cy="208" rx="20" ry="9" fill="#FF6020" opacity="0.6"/>
  <circle cx="174" cy="186" r="7" fill="#FF6020" opacity="0.8" style="animation:iq-float 1.4s ease-in-out infinite"/>
  <circle cx="192" cy="178" r="5" fill="#FF8040" opacity="0.7" style="animation:iq-float 1.8s ease-in-out infinite 0.4s"/>
  <circle cx="183" cy="172" r="4" fill="#FFA060" opacity="0.6" style="animation:iq-float 1.2s ease-in-out infinite 0.8s"/>
  <g style="animation:iq-coin-bob 2s ease-in-out infinite">
    <circle cx="70" cy="240" r="30" fill="#C8900A"/><circle cx="70" cy="237" r="30" fill="#E0A818"/><circle cx="70" cy="234" r="30" fill="#F5C518"/>
    <circle cx="70" cy="234" r="22" fill="#FFD740"/>
    <text x="70" y="241" text-anchor="middle" font-size="22" fill="#9A6800" font-weight="900" font-family="Arial">$</text>
  </g>
  <g style="animation:iq-coin-bob 2.4s ease-in-out infinite 0.6s">
    <circle cx="296" cy="255" r="26" fill="#C8900A"/><circle cx="296" cy="252" r="26" fill="#E0A818"/><circle cx="296" cy="249" r="26" fill="#F5C518"/>
    <circle cx="296" cy="249" r="19" fill="#FFD740"/>
    <text x="296" y="256" text-anchor="middle" font-size="18" fill="#9A6800" font-weight="900" font-family="Arial">$</text>
  </g>
  <path d="M0,340 Q40,320 80,335 Q120,348 160,328 Q200,312 240,330 Q280,346 320,330 Q344,322 366,332 L366,400 L0,400 Z" fill="#C87830"/>
  <path d="M0,355 Q50,342 110,355 Q170,366 230,352 Q290,340 366,354 L366,400 L0,400 Z" fill="#D48840"/>
  <rect x="22" y="340" width="44" height="34" rx="6" fill="#8A5010"/>
  <rect x="22" y="340" width="44" height="34" rx="6" fill="none" stroke="#C87830" stroke-width="2"/>
  <rect x="22" y="340" width="44" height="14" rx="6" fill="#A06020"/>
  <rect x="36" y="348" width="16" height="10" rx="5" fill="#F5C518"/>
  <text x="44" y="371" text-anchor="middle" font-size="9" fill="#FFD740" font-family="sans-serif">Chest!</text>
  <text x="30" y="155" font-size="18" fill="#FFE060" opacity="0.7" style="animation:iq-sparkle 2s infinite 0.3s">★</text>
  <text x="326" y="168" font-size="14" fill="#FFD040" opacity="0.6" style="animation:iq-sparkle 2.4s infinite 0.9s">★</text>
`

export const SCENERY_ZONE_7_HTML = `
  <defs>
    <linearGradient id="sky7" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0E0830"/>
      <stop offset="50%" stop-color="#1E1050"/>
      <stop offset="100%" stop-color="#2A1870"/>
    </linearGradient>
  </defs>
  <rect width="366" height="380" fill="url(#sky7)"/>
  <circle cx="20" cy="20" r="2" fill="white" opacity="0.9"/>
  <circle cx="50" cy="8" r="1.5" fill="white" opacity="0.7"/>
  <circle cx="90" cy="25" r="2.5" fill="#C8A8FF" opacity="0.8"/>
  <circle cx="140" cy="12" r="1.5" fill="white" opacity="0.6"/>
  <circle cx="180" cy="5" r="2" fill="#A0C0FF" opacity="0.8"/>
  <circle cx="220" cy="18" r="2" fill="white" opacity="0.7"/>
  <circle cx="270" cy="8" r="1.5" fill="#C8A8FF" opacity="0.7"/>
  <circle cx="310" cy="22" r="2.5" fill="white" opacity="0.8"/>
  <circle cx="350" cy="14" r="2" fill="#A0C0FF" opacity="0.6"/>
  <circle cx="35" cy="55" r="1.5" fill="white" opacity="0.5"/>
  <circle cx="115" cy="48" r="2" fill="#C8A8FF" opacity="0.6"/>
  <circle cx="290" cy="50" r="2" fill="white" opacity="0.6"/>
  <circle cx="290" cy="65" r="42" fill="#E8E0C8" opacity="0.15"/>
  <circle cx="290" cy="65" r="36" fill="#F0E8D0" opacity="0.25"/>
  <circle cx="290" cy="65" r="28" fill="#FFF5E0" opacity="0.5"/>
  <circle cx="290" cy="65" r="22" fill="#FFFAE8" opacity="0.7"/>
  <circle cx="282" cy="58" r="5" fill="#EEE0C0" opacity="0.7"/>
  <circle cx="298" cy="70" r="4" fill="#EEE0C0" opacity="0.6"/>
  <polygon points="0,380 60,210 120,280 180,160 240,250 300,170 366,220 366,380" fill="#1A0E40"/>
  <polygon points="0,380 80,240 140,300 200,190 260,270 320,200 366,240 366,380" fill="#2A1860"/>
  <polygon points="30,380 70,240 110,380" fill="#0A8080"/>
  <polygon points="40,380 70,248 100,380" fill="#10A8A0"/>
  <polygon points="50,380 70,252 90,380" fill="#20C8B8" opacity="0.8"/>
  <ellipse cx="70" cy="260" rx="20" ry="10" fill="#20C8B8" opacity="0.3" style="animation:iq-sparkle 2s ease-in-out infinite"/>
  <polygon points="256,380 296,230 336,380" fill="#802060"/>
  <polygon points="264,380 296,238 328,380" fill="#A02880"/>
  <polygon points="272,380 296,242 320,380" fill="#C040A0" opacity="0.8"/>
  <ellipse cx="296" cy="250" rx="20" ry="10" fill="#E040B0" opacity="0.3" style="animation:iq-sparkle 2.4s ease-in-out infinite 0.5s"/>
  <polygon points="138,380 183,195 228,380" fill="#806000"/>
  <polygon points="148,380 183,203 218,380" fill="#B08800"/>
  <polygon points="158,380 183,208 208,380" fill="#E0B010" opacity="0.8"/>
  <ellipse cx="183" cy="220" rx="20" ry="8" fill="#F5C518" opacity="0.4" style="animation:iq-sparkle 1.8s ease-in-out infinite 0.3s"/>
  <text x="46" y="185" text-anchor="middle" font-size="22" fill="#F7931A" opacity="0.5" font-family="sans-serif">₿</text>
  <text x="318" y="175" text-anchor="middle" font-size="20" fill="#627EEA" opacity="0.5" font-family="sans-serif">Ξ</text>
  <ellipse cx="183" cy="380" rx="200" ry="40" fill="#C040A0" opacity="0.1"/>
  <rect x="0" y="355" width="366" height="25" fill="#180C38"/>
`

export const SCENERY_ZONE_6_HTML = `
  <defs>
    <linearGradient id="sky6" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#4FC8FF"/>
      <stop offset="60%" stop-color="#A0ECFF"/>
      <stop offset="100%" stop-color="#D0F8E8"/>
    </linearGradient>
  </defs>
  <rect width="366" height="380" fill="url(#sky6)"/>
  <g style="animation:iq-cloud-drift 10s ease-in-out infinite alternate">
    <ellipse cx="80" cy="70" rx="48" ry="28" fill="white" opacity="0.9"/>
    <ellipse cx="55" cy="78" rx="35" ry="24" fill="white" opacity="0.9"/>
    <ellipse cx="108" cy="80" rx="38" ry="22" fill="white" opacity="0.9"/>
    <ellipse cx="80" cy="86" rx="45" ry="16" fill="white" opacity="0.9"/>
  </g>
  <g style="animation:iq-cloud-drift 15s ease-in-out infinite alternate-reverse">
    <ellipse cx="290" cy="55" rx="52" ry="30" fill="white" opacity="0.85"/>
    <ellipse cx="262" cy="64" rx="36" ry="24" fill="white" opacity="0.85"/>
    <ellipse cx="318" cy="66" rx="38" ry="24" fill="white" opacity="0.85"/>
    <ellipse cx="290" cy="72" rx="48" ry="17" fill="white" opacity="0.85"/>
  </g>
  <path d="M0,380 Q60,300 130,330 Q200,358 270,310 Q320,280 366,320 L366,380 Z" fill="#2DB860"/>
  <path d="M0,380 Q80,320 180,345 Q280,368 366,338 L366,380 Z" fill="#38D470"/>
  <path d="M0,380 Q100,350 200,362 Q300,374 366,358 L366,380 Z" fill="#50E880"/>
  <rect x="42" y="230" width="12" height="100" rx="5" fill="#8B5E3C"/>
  <circle cx="48" cy="225" r="42" fill="#1A9A40"/>
  <circle cx="48" cy="215" r="38" fill="#20B848"/>
  <circle cx="28" cy="228" r="28" fill="#1A9A40"/>
  <circle cx="68" cy="228" r="30" fill="#1A9A40"/>
  <circle cx="48" cy="205" r="34" fill="#2ACC58"/>
  <circle cx="30" cy="205" r="10" fill="#C8900A"/><circle cx="30" cy="203" r="10" fill="#F5C518"/>
  <text x="30" y="207" text-anchor="middle" font-size="10" fill="#8A6000" font-weight="900" font-family="Arial">$</text>
  <circle cx="58" cy="196" r="9" fill="#C8900A"/><circle cx="58" cy="194" r="9" fill="#F5C518"/>
  <text x="58" y="198" text-anchor="middle" font-size="9" fill="#8A6000" font-weight="900" font-family="Arial">$</text>
  <rect x="304" y="210" width="12" height="120" rx="5" fill="#8B5E3C"/>
  <circle cx="310" cy="205" r="46" fill="#1A9A40"/>
  <circle cx="310" cy="193" r="42" fill="#20B848"/>
  <circle cx="286" cy="210" r="30" fill="#1A9A40"/>
  <circle cx="334" cy="212" r="32" fill="#1A9A40"/>
  <circle cx="310" cy="182" r="38" fill="#2ACC58"/>
  <circle cx="290" cy="192" r="10" fill="#C8900A"/><circle cx="290" cy="190" r="10" fill="#F5C518"/>
  <text x="290" y="194" text-anchor="middle" font-size="10" fill="#8A6000" font-weight="900" font-family="Arial">$</text>
  <circle cx="326" cy="185" r="9" fill="#C8900A"/><circle cx="326" cy="183" r="9" fill="#F5C518"/>
  <text x="326" y="187" text-anchor="middle" font-size="9" fill="#8A6000" font-weight="900" font-family="Arial">$</text>
  <path d="M20,160 Q183,50 346,160" fill="none" stroke="#FF6060" stroke-width="6" opacity="0.2"/>
  <path d="M28,162 Q183,60 338,162" fill="none" stroke="#FF9030" stroke-width="6" opacity="0.2"/>
  <path d="M36,164 Q183,70 330,164" fill="none" stroke="#FFE040" stroke-width="6" opacity="0.2"/>
  <path d="M44,166 Q183,80 322,166" fill="none" stroke="#40D840" stroke-width="6" opacity="0.2"/>
  <path d="M52,168 Q183,90 314,168" fill="none" stroke="#40A0FF" stroke-width="6" opacity="0.2"/>
  <circle cx="130" cy="155" r="7" fill="#F5C518" opacity="0.6" style="animation:iq-coin-bob 1.5s infinite 0.2s"/>
  <circle cx="200" cy="148" r="6" fill="#F5C518" opacity="0.6" style="animation:iq-coin-bob 1.3s infinite 0.4s"/>
  <circle cx="238" cy="140" r="5" fill="#F5C518" opacity="0.5" style="animation:iq-coin-bob 2s infinite 1s"/>
`

export const SCENERY_ZONE_5_HTML = `
  <defs>
    <linearGradient id="sky5" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFA040"/>
      <stop offset="40%" stop-color="#FFCC70"/>
      <stop offset="100%" stop-color="#FFE8A0"/>
    </linearGradient>
  </defs>
  <rect width="366" height="370" fill="url(#sky5)"/>
  <g opacity="0.7" style="animation:iq-cloud-drift 11s ease-in-out infinite alternate">
    <ellipse cx="75" cy="80" rx="44" ry="26" fill="#FFF8E0"/>
    <ellipse cx="52" cy="88" rx="30" ry="22" fill="#FFF8E0"/>
    <ellipse cx="98" cy="90" rx="34" ry="20" fill="#FFF8E0"/>
  </g>
  <rect x="68" y="280" width="230" height="12" rx="3" fill="#D4940A"/>
  <rect x="60" y="268" width="246" height="14" rx="3" fill="#E0A818"/>
  <rect x="52" y="254" width="262" height="16" rx="3" fill="#F5C518"/>
  <rect x="88" y="160" width="190" height="98" rx="4" fill="#E8A018"/>
  <rect x="100" y="165" width="16" height="93" rx="5" fill="#F0B428"/>
  <rect x="126" y="165" width="16" height="93" rx="5" fill="#ECA020"/>
  <rect x="152" y="165" width="16" height="93" rx="5" fill="#F0B428"/>
  <rect x="178" y="165" width="16" height="93" rx="5" fill="#ECA020"/>
  <rect x="204" y="165" width="16" height="93" rx="5" fill="#F0B428"/>
  <rect x="230" y="165" width="16" height="93" rx="5" fill="#ECA020"/>
  <rect x="250" y="165" width="16" height="93" rx="5" fill="#F0B428"/>
  <polygon points="78,162 183,100 288,162" fill="#D4940A"/>
  <polygon points="88,162 183,108 278,162" fill="#F5C518"/>
  <polygon points="100,162 183,118 266,162" fill="#FFD740"/>
  <circle cx="183" cy="136" r="22" fill="#E8A018"/>
  <path d="M183,136 L183,114 A22,22,0,0,1 203,147 Z" fill="#FF6B35" opacity="0.9"/>
  <path d="M183,136 L203,147 A22,22,0,0,1 175,158 Z" fill="#00C896" opacity="0.9"/>
  <path d="M183,136 L175,158 A22,22,0,0,1 163,127 Z" fill="#6B4FF8" opacity="0.9"/>
  <path d="M183,136 L163,127 A22,22,0,0,1 183,114 Z" fill="#FF9B30" opacity="0.9"/>
  <rect x="162" y="230" width="42" height="28" rx="4" fill="#C88010"/>
  <rect x="182" y="68" width="4" height="36" rx="2" fill="#C88010"/>
  <polygon points="186,70 205,78 186,86" fill="#F5C518" style="animation:iq-waving-flag 2s ease-in-out infinite"/>
  <rect x="28" y="260" width="8" height="90" rx="4" fill="#8B5E3C"/>
  <ellipse cx="32" cy="255" rx="22" ry="30" fill="#20A840"/>
  <ellipse cx="18" cy="265" rx="18" ry="16" fill="#28C050"/>
  <ellipse cx="46" cy="265" rx="18" ry="16" fill="#1A9A38"/>
  <rect x="330" y="260" width="8" height="90" rx="4" fill="#8B5E3C"/>
  <ellipse cx="334" cy="255" rx="22" ry="30" fill="#20A840"/>
  <ellipse cx="320" cy="265" rx="18" ry="16" fill="#28C050"/>
  <ellipse cx="348" cy="265" rx="18" ry="16" fill="#1A9A38"/>
  <path d="M0,310 Q40,295 90,308 Q150,322 210,305 Q270,290 330,308 Q348,314 366,310 L366,370 L0,370 Z" fill="#E8B840"/>
  <path d="M0,330 Q60,318 130,330 Q200,342 270,326 Q318,316 366,328 L366,370 L0,370 Z" fill="#F0C858"/>
  <circle cx="48" cy="322" r="7" fill="#F5C518" style="animation:iq-coin-bob 2.2s infinite 0.5s"/>
  <circle cx="316" cy="318" r="7" fill="#F5C518" style="animation:iq-coin-bob 1.8s infinite 1s"/>
`

export const SCENERY_ZONE_4_HTML = `
  <defs>
    <linearGradient id="sky4" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#38C8FF"/>
      <stop offset="50%" stop-color="#70DEFF"/>
      <stop offset="100%" stop-color="#A0F0FF"/>
    </linearGradient>
    <linearGradient id="ocean4" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1890CC"/>
      <stop offset="100%" stop-color="#0A5A90"/>
    </linearGradient>
  </defs>
  <rect width="366" height="370" fill="url(#sky4)"/>
  <circle cx="60" cy="60" r="36" fill="#FFE060" opacity="0.3"/>
  <circle cx="60" cy="60" r="28" fill="#FFE860" opacity="0.5"/>
  <circle cx="60" cy="60" r="20" fill="#FFF080" opacity="0.8"/>
  <g style="animation:iq-cloud-drift 9s ease-in-out infinite alternate">
    <ellipse cx="200" cy="65" rx="50" ry="28" fill="white" opacity="0.92"/>
    <ellipse cx="174" cy="74" rx="34" ry="24" fill="white" opacity="0.92"/>
    <ellipse cx="226" cy="76" rx="36" ry="22" fill="white" opacity="0.92"/>
    <ellipse cx="200" cy="82" rx="46" ry="16" fill="white" opacity="0.92"/>
  </g>
  <rect x="0" y="250" width="366" height="120" fill="url(#ocean4)"/>
  <path d="M0,252 Q30,242 60,252 Q90,262 120,252 Q150,242 180,252 Q210,262 240,252 Q270,242 300,252 Q330,262 366,252" fill="none" stroke="white" stroke-width="3" opacity="0.4"/>
  <path d="M0,268 Q40,257 80,268 Q120,278 160,268 Q200,258 240,268 Q280,278 320,268 Q344,260 366,268" fill="none" stroke="white" stroke-width="2.5" opacity="0.3"/>
  <ellipse cx="100" cy="300" rx="30" ry="6" fill="white" opacity="0.15"/>
  <ellipse cx="260" cy="320" rx="25" ry="5" fill="white" opacity="0.12"/>
  <rect x="150" y="230" width="66" height="24" rx="8" fill="#E87030"/>
  <rect x="157" y="218" width="50" height="14" rx="4" fill="#F0A048"/>
  <polygon points="183,180 183,232 220,232" fill="white" opacity="0.9"/>
  <polygon points="183,192 183,232 148,232" fill="#FFE8D0" opacity="0.8"/>
  <rect x="182" y="172" width="3" height="62" rx="1" fill="#8B5E3C"/>
  <polygon points="185,174 200,180 185,186" fill="#FF5050" style="animation:iq-waving-flag 1.5s ease-in-out infinite"/>
  <g style="animation:iq-coin-bob 2s ease-in-out infinite">
    <rect x="38" y="230" width="42" height="30" rx="8" fill="#8B5010"/>
    <rect x="38" y="228" width="42" height="18" rx="8" fill="#A06020"/>
    <rect x="50" y="234" width="18" height="10" rx="5" fill="#F5C518"/>
  </g>
  <g transform="rotate(-8,100,165)" style="animation:iq-float 2.2s ease-in-out infinite 0.3s">
    <rect x="70" y="150" width="58" height="40" rx="8" fill="white"/>
    <rect x="70" y="150" width="58" height="40" rx="8" fill="none" stroke="#3A70C0" stroke-width="2"/>
    <text x="99" y="166" text-anchor="middle" font-size="10" fill="#3A70C0" font-family="sans-serif" font-weight="900">BOND</text>
    <text x="99" y="181" text-anchor="middle" font-size="8" fill="#60A0E0" font-family="sans-serif">5.2% APY</text>
  </g>
  <g transform="rotate(6,276,155)" style="animation:iq-float 2.6s ease-in-out infinite 0.9s">
    <rect x="248" y="142" width="58" height="40" rx="8" fill="white"/>
    <rect x="248" y="142" width="58" height="40" rx="8" fill="none" stroke="#3A70C0" stroke-width="2"/>
    <text x="277" y="158" text-anchor="middle" font-size="10" fill="#3A70C0" font-family="sans-serif" font-weight="900">BOND</text>
    <text x="277" y="173" text-anchor="middle" font-size="8" fill="#60A0E0" font-family="sans-serif">3.8% APY</text>
  </g>
  <ellipse cx="320" cy="248" rx="28" ry="10" fill="#F0C858"/>
  <rect x="318" y="220" width="5" height="30" rx="2" fill="#8B5E3C"/>
  <ellipse cx="320" cy="218" rx="14" ry="18" fill="#20A840"/>
`

export const SCENERY_ZONE_3_HTML = `
  <defs>
    <linearGradient id="sky3" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#60C8FF"/>
      <stop offset="70%" stop-color="#A8E0FF"/>
      <stop offset="100%" stop-color="#D0F0FF"/>
    </linearGradient>
  </defs>
  <rect width="366" height="370" fill="url(#sky3)"/>
  <g opacity="0.9" style="animation:iq-cloud-drift 13s ease-in-out infinite alternate">
    <ellipse cx="110" cy="55" rx="46" ry="26" fill="white"/>
    <ellipse cx="86" cy="63" rx="32" ry="22" fill="white"/>
    <ellipse cx="134" cy="65" rx="34" ry="20" fill="white"/>
    <ellipse cx="110" cy="70" rx="43" ry="15" fill="white"/>
  </g>
  <rect x="0" y="180" width="56" height="190" rx="6" fill="#FF7060"/>
  <rect x="0" y="170" width="56" height="16" rx="4" fill="#FF8878"/>
  <rect x="8" y="190" width="14" height="12" rx="3" fill="#FFE8E0" opacity="0.8"/>
  <rect x="28" y="190" width="14" height="12" rx="3" fill="#FFD8D0" opacity="0.7"/>
  <rect x="8" y="210" width="14" height="12" rx="3" fill="#FFE8E0" opacity="0.9"/>
  <rect x="28" y="210" width="14" height="12" rx="3" fill="#FFE8E0" opacity="0.8"/>
  <rect x="50" y="155" width="66" height="215" rx="6" fill="#18B8A0"/>
  <rect x="50" y="143" width="66" height="16" rx="4" fill="#20D0B0"/>
  <rect x="56" y="158" width="54" height="22" rx="4" fill="#0A2820"/>
  <text x="83" y="172" text-anchor="middle" font-size="8" fill="#00E8B8" font-family="monospace" font-weight="bold">AAPL↑2.4%</text>
  <rect x="108" y="120" width="58" height="250" rx="6" fill="#8050E0"/>
  <rect x="108" y="108" width="58" height="16" rx="4" fill="#9060F0"/>
  <rect x="135" y="76" width="4" height="36" rx="2" fill="#6040B0"/>
  <circle cx="137" cy="74" r="7" fill="#FF5090" opacity="0.8"/>
  <circle cx="137" cy="74" r="4.5" fill="#FF80B8" style="animation:iq-sparkle 1.5s ease-in-out infinite"/>
  <rect x="160" y="138" width="54" height="232" rx="6" fill="#E8B018"/>
  <rect x="160" y="126" width="54" height="16" rx="4" fill="#F5C518"/>
  <text x="187" y="178" text-anchor="middle" font-size="38" fill="#FFE060" font-weight="900" font-family="Arial" opacity="0.4">$</text>
  <rect x="208" y="145" width="56" height="225" rx="6" fill="#3888E8"/>
  <rect x="208" y="133" width="56" height="16" rx="4" fill="#50A0FF"/>
  <rect x="258" y="165" width="52" height="205" rx="6" fill="#E840A0"/>
  <rect x="258" y="153" width="52" height="16" rx="4" fill="#F060B8"/>
  <rect x="304" y="188" width="62" height="182" rx="6" fill="#FF7020"/>
  <rect x="304" y="176" width="62" height="16" rx="4" fill="#FF8838"/>
  <rect x="0" y="354" width="366" height="16" fill="#D0C8C0"/>
  <polyline points="28,118 60,100 92,108 124,86 156,94 188,72 220,80 252,62 284,70 316,52 348,60" fill="none" stroke="#00E0B0" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/>
`

export const SCENERY_ZONE_2_HTML = `
  <defs>
    <linearGradient id="sky2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFB830"/>
      <stop offset="50%" stop-color="#FFD870"/>
      <stop offset="100%" stop-color="#FFEC90"/>
    </linearGradient>
  </defs>
  <rect width="366" height="370" fill="url(#sky2)"/>
  <circle cx="296" cy="68" r="50" fill="#FFE040" opacity="0.25"/>
  <circle cx="296" cy="68" r="38" fill="#FFE840" opacity="0.4"/>
  <circle cx="296" cy="68" r="28" fill="#FFF060" opacity="0.7"/>
  <circle cx="296" cy="68" r="20" fill="#FFF880" opacity="0.9"/>
  <g opacity="0.85" style="animation:iq-cloud-drift 12s ease-in-out infinite alternate">
    <ellipse cx="90" cy="75" rx="48" ry="28" fill="white"/>
    <ellipse cx="66" cy="83" rx="34" ry="24" fill="white"/>
    <ellipse cx="114" cy="85" rx="36" ry="22" fill="white"/>
  </g>
  <path d="M0,370 Q40,300 100,330 Q160,358 220,310 Q280,270 340,306 Q354,312 366,308 L366,370 Z" fill="#F0B820"/>
  <path d="M0,370 Q60,318 140,340 Q220,360 300,330 Q340,320 366,328 L366,370 Z" fill="#F8C838"/>
  <path d="M0,370 Q80,340 180,354 Q280,368 366,348 L366,370 Z" fill="#FFD858"/>
  <rect x="44" y="238" width="18" height="110" rx="8" fill="#28A840"/>
  <rect x="18" y="260" width="42" height="16" rx="8" fill="#28A840"/>
  <rect x="48" y="285" width="38" height="16" rx="8" fill="#28A840"/>
  <line x1="44" y1="248" x2="36" y2="244" stroke="#20903A" stroke-width="2"/>
  <line x1="62" y1="252" x2="70" y2="248" stroke="#20903A" stroke-width="2"/>
  <g style="animation:iq-coin-bob 2s ease-in-out infinite">
    <circle cx="18" cy="258" r="12" fill="#C8900A"/><circle cx="18" cy="256" r="12" fill="#F5C518"/>
    <circle cx="18" cy="256" r="9" fill="#FFD740"/>
    <text x="18" y="260" text-anchor="middle" font-size="10" fill="#9A6800" font-weight="900" font-family="Arial">$</text>
  </g>
  <g style="animation:iq-coin-bob 1.7s ease-in-out infinite 0.5s">
    <circle cx="86" cy="284" r="10" fill="#C8900A"/><circle cx="86" cy="282" r="10" fill="#F5C518"/>
    <circle cx="86" cy="282" r="7" fill="#FFD740"/>
    <text x="86" y="286" text-anchor="middle" font-size="9" fill="#9A6800" font-weight="900" font-family="Arial">$</text>
  </g>
  <rect x="296" y="218" width="20" height="130" rx="9" fill="#30C050"/>
  <rect x="268" y="242" width="44" height="16" rx="8" fill="#30C050"/>
  <rect x="300" y="270" width="40" height="16" rx="8" fill="#30C050"/>
  <g style="animation:iq-coin-bob 2.3s ease-in-out infinite 0.3s">
    <circle cx="268" cy="240" r="12" fill="#C8900A"/><circle cx="268" cy="238" r="12" fill="#F5C518"/>
    <circle cx="268" cy="238" r="9" fill="#FFD740"/>
    <text x="268" y="242" text-anchor="middle" font-size="10" fill="#9A6800" font-weight="900" font-family="Arial">$</text>
  </g>
  <g style="animation:iq-coin-bob 1.9s ease-in-out infinite 0.9s">
    <circle cx="340" cy="270" r="10" fill="#C8900A"/><circle cx="340" cy="268" r="10" fill="#F5C518"/>
    <circle cx="340" cy="268" r="7" fill="#FFD740"/>
    <text x="340" y="272" text-anchor="middle" font-size="9" fill="#9A6800" font-weight="900" font-family="Arial">$</text>
  </g>
  <ellipse cx="183" cy="270" rx="38" ry="32" fill="#FFB0D0"/>
  <ellipse cx="183" cy="268" rx="34" ry="28" fill="#FFC8E0"/>
  <circle cx="204" cy="260" r="12" fill="#FFC8E0"/>
  <circle cx="178" cy="260" r="5" fill="white"/>
  <circle cx="190" cy="260" r="5" fill="white"/>
  <circle cx="179" cy="261" r="3" fill="#3A2010"/>
  <circle cx="191" cy="261" r="3" fill="#3A2010"/>
  <ellipse cx="196" cy="265" rx="7" ry="5" fill="#FFAAC8"/>
  <circle cx="193" cy="265" r="2" fill="#FF88B0" opacity="0.7"/>
  <circle cx="199" cy="265" r="2" fill="#FF88B0" opacity="0.7"/>
  <rect x="175" y="242" width="16" height="5" rx="2" fill="#E090B8"/>
  <ellipse cx="183" cy="240" rx="8" ry="5" fill="#F5C518" style="animation:iq-coin-bob 1.5s ease-in-out infinite"/>
  <ellipse cx="162" cy="246" rx="11" ry="14" fill="#FFB0D0" transform="rotate(-20,162,246)"/>
  <ellipse cx="162" cy="246" rx="7" ry="9" fill="#FFC8E0" transform="rotate(-20,162,246)"/>
  <rect x="160" y="296" width="12" height="16" rx="6" fill="#FFB0D0"/>
  <rect x="178" y="298" width="12" height="16" rx="6" fill="#FFB0D0"/>
  <rect x="196" y="296" width="12" height="16" rx="6" fill="#FFB0D0"/>
  <rect x="152" y="317" width="62" height="16" rx="6" fill="white" opacity="0.7"/>
  <text x="183" y="328" text-anchor="middle" font-size="9" fill="#E070A8" font-family="sans-serif" font-weight="900">Savings Bank!</text>
`

export const SCENERY_BY_ZONE = {
  10: SCENERY_ZONE_8_HTML,
  9: SCENERY_ZONE_7_HTML,
  8: SCENERY_ZONE_8_HTML,
  7: SCENERY_ZONE_7_HTML,
  6: SCENERY_ZONE_6_HTML,
  5: SCENERY_ZONE_5_HTML,
  4: SCENERY_ZONE_4_HTML,
  3: SCENERY_ZONE_3_HTML,
  2: SCENERY_ZONE_2_HTML,
}
