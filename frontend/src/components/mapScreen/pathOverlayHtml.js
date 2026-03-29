/** Path winding road overlay — inner HTML for <svg> */

export const PATH_OVERLAY_INNER_HTML = `
      <defs>
        <marker id="iqMapArrowM" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M2 1L8 5L2 9" fill="none" stroke="rgba(245,197,24,0.5)" stroke-width="2"/>
        </marker>
      </defs>
      <!-- Zone 1 path (Penny Plains) — bottom section -->
      <!-- Lv 1 (255,50) → Lv 3 (115,82+2920=3002) ... wait, I need to calculate absolute positions -->
      <!-- Zone 1 starts at: zone8(380)+zone7(360)+zone6(360)+zone5(360)+zone4(360)+zone3(360)+zone2(360) = 2940px from top -->
      <!-- Zone 1 top = 2940, height 400. So zone1 nodes absolute y = 2940 + node_y -->
      <!-- Lv1: x=255, abs_y=2940+50=2990 | Lv3: x=115, abs_y=2940+82=3022 -->
      <!-- Lv5: x=258, abs_y=2940+130=3070 | Lv7: x=108, abs_y=2940+178=3118 -->
      <!-- Lv8: x=262, abs_y=2940+225=3165 | Lv9: x=105, abs_y=2940+278=3218 -->
      <!-- Lv10: x=270, abs_y=2940+330=3270 -->

      <!-- Zone 2 (Dollar Dunes) top = 2940-360=2580 -->
      <!-- Lv11: x=105, abs=2580+210=2790 | Lv13: x=270, abs=2580+260=2840 -->
      <!-- Lv15(boss): x=183, abs=2580+328=2908 -->

      <!-- Zone 3 (Stock Market Street) top = 2580-360=2220 -->
      <!-- Lv16: x=115, abs=2220+106=2326 | Lv18: x=260, abs=2220+158=2378 -->
      <!-- Lv21: x=105, abs=2220+212=2432 | Lv23: x=270, abs=2220+260=2480 -->
      <!-- Boss: x=183, abs=2220+330=2550 -->

      <!-- Zone 4 (Bond Bay) top=1860 -->
      <!-- Lv26: x=130, abs=1860+108=1968 | Lv28: x=255, abs=1860+158=2018 -->
      <!-- Lv30: x=105, abs=1860+208=2068 | Lv33: x=270, abs=1860+258=2118 -->
      <!-- Boss: x=183, abs=1860+328=2188 -->

      <!-- Zone 5 (ETF Empire) top=1500 -->
      <!-- Lv36: x=240, abs=1500+104=1604 | Lv38: x=130, abs=1500+152=1652 -->
      <!-- Lv40: x=264, abs=1500+206=1706 | Lv43: x=110, abs=1500+260=1760 -->
      <!-- Boss: x=183, abs=1500+330=1830 -->

      <!-- Zone 6 (Dividend Valley) top=1140 -->
      <!-- Lv46: x=140, abs=1140+100=1240 | Lv51: x=260, abs=1140+152=1292 -->
      <!-- Lv54: x=110, abs=1140+206=1346 | Lv57: x=270, abs=1140+258=1398 -->
      <!-- Boss: x=183, abs=1140+328=1468 -->

      <!-- Zone 7 (Crypto Peaks) top=780 -->
      <!-- Lv61: x=120, abs=780+110=890 | Lv63: x=240, abs=780+158=938 -->
      <!-- Lv65: x=100, abs=780+210=990 | Lv67: x=280, abs=780+260=1040 -->
      <!-- Boss: x=183, abs=780+330=1110 -->

      <!-- Zone 8 (Dragon's Vault) top=380 (zone8 height=380) wait zone8=380px -->
      <!-- Lv71: x=150, abs=380+152=532 | Lv72: x=260, abs=380+200=580 -->
      <!-- Lv73: x=100, abs=380+250=630 | BossD: x=183, abs=380+320=700 -->

      <!-- MAIN PATH — thick dotted gold/teal winding road -->

      <!-- Zone 1 internal path -->
      <path d="M255,2990 Q183,3006 115,3022 Q183,3046 258,3070 Q183,3094 108,3118 Q183,3142 262,3165 Q183,3192 105,3218 Q183,3244 270,3270" 
        fill="none" stroke="rgba(245,197,24,0.25)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M255,2990 Q183,3006 115,3022 Q183,3046 258,3070 Q183,3094 108,3118 Q183,3142 262,3165 Q183,3192 105,3218 Q183,3244 270,3270" 
        fill="none" stroke="rgba(245,197,24,0.55)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"
        stroke-dasharray="12 8"/>

      <!-- Zone 1 to 2 connector (lv10 to lv11) -->
      <path d="M270,3270 Q183,3300 183,3340 Q183,3370 183,3400 Q183,3410 105,2790" 
        fill="none" stroke="rgba(200,144,10,0.3)" stroke-width="8" stroke-linecap="round"/>
      <path d="M270,3270 Q183,3300 183,3340" 
        fill="none" stroke="rgba(200,144,10,0.5)" stroke-width="3" stroke-dasharray="12 8" stroke-linecap="round"/>

      <!-- Zone 2 internal path (completed — teal) -->
      <path d="M105,2790 Q183,2815 270,2840 Q183,2874 183,2908" 
        fill="none" stroke="rgba(0,200,150,0.3)" stroke-width="8" stroke-linecap="round"/>
      <path d="M105,2790 Q183,2815 270,2840 Q183,2874 183,2908" 
        fill="none" stroke="rgba(0,200,150,0.6)" stroke-width="3" stroke-linecap="round" stroke-dasharray="12 8"/>

      <!-- Zone 2 to 3 connector -->
      <path d="M183,2908 Q183,2950 183,2980 Q183,3000 183,3020" 
        fill="none" stroke="rgba(100,120,180,0.2)" stroke-width="8" stroke-linecap="round"/>

      <!-- Zone 3 internal (locked — dim) -->
      <path d="M115,2326 Q183,2352 260,2378 Q183,2405 105,2432 Q183,2456 270,2480 Q183,2515 183,2550" 
        fill="none" stroke="rgba(80,100,160,0.2)" stroke-width="8" stroke-linecap="round"/>
      <path d="M115,2326 Q183,2352 260,2378 Q183,2405 105,2432 Q183,2456 270,2480 Q183,2515 183,2550" 
        fill="none" stroke="rgba(80,100,160,0.3)" stroke-width="2.5" stroke-dasharray="10 10" stroke-linecap="round"/>

      <!-- Zone 4 internal (locked) -->
      <path d="M130,1968 Q183,1993 255,2018 Q183,2043 105,2068 Q183,2093 270,2118 Q183,2153 183,2188" 
        fill="none" stroke="rgba(60,90,140,0.2)" stroke-width="8" stroke-linecap="round"/>
      <path d="M130,1968 Q183,1993 255,2018 Q183,2043 105,2068 Q183,2093 270,2118 Q183,2153 183,2188" 
        fill="none" stroke="rgba(60,90,140,0.25)" stroke-width="2" stroke-dasharray="10 10" stroke-linecap="round"/>

      <!-- Zone 5 internal (locked) -->
      <path d="M240,1604 Q183,1628 130,1652 Q183,1679 264,1706 Q183,1733 110,1760 Q183,1795 183,1830" 
        fill="none" stroke="rgba(60,60,30,0.25)" stroke-width="8" stroke-linecap="round"/>
      <path d="M240,1604 Q183,1628 130,1652 Q183,1679 264,1706 Q183,1733 110,1760 Q183,1795 183,1830" 
        fill="none" stroke="rgba(60,60,30,0.3)" stroke-width="2" stroke-dasharray="10 10" stroke-linecap="round"/>

      <!-- Zone 6 internal (locked) -->
      <path d="M140,1240 Q183,1266 260,1292 Q183,1319 110,1346 Q183,1372 270,1398 Q183,1433 183,1468" 
        fill="none" stroke="rgba(0,80,40,0.2)" stroke-width="8" stroke-linecap="round"/>
      <path d="M140,1240 Q183,1266 260,1292 Q183,1319 110,1346 Q183,1372 270,1398 Q183,1433 183,1468" 
        fill="none" stroke="rgba(0,80,40,0.25)" stroke-width="2" stroke-dasharray="10 10" stroke-linecap="round"/>

      <!-- Zone 7 internal (locked) -->
      <path d="M120,890 Q183,914 240,938 Q183,964 100,990 Q183,1015 280,1040 Q183,1075 183,1110" 
        fill="none" stroke="rgba(80,60,160,0.2)" stroke-width="8" stroke-linecap="round"/>
      <path d="M120,890 Q183,914 240,938 Q183,964 100,990 Q183,1015 280,1040 Q183,1075 183,1110" 
        fill="none" stroke="rgba(80,60,160,0.25)" stroke-width="2" stroke-dasharray="10 10" stroke-linecap="round"/>

      <!-- Zone 8 internal (locked — dark red) -->
      <path d="M150,532 Q183,556 260,580 Q183,605 100,630 Q183,665 183,700" 
        fill="none" stroke="rgba(120,20,20,0.2)" stroke-width="8" stroke-linecap="round"/>
      <path d="M150,532 Q183,556 260,580 Q183,605 100,630 Q183,665 183,700" 
        fill="none" stroke="rgba(120,20,20,0.25)" stroke-width="2" stroke-dasharray="10 10" stroke-linecap="round"/>

      <!-- Zone connector bridges (between zones) -->
      <path d="M183,1830 Q183,1860 183,1900 Q183,1940 130,1968" fill="none" stroke="rgba(60,60,30,0.2)" stroke-width="5" stroke-dasharray="8 8"/>
      <path d="M183,1468 Q183,1500 183,1540 Q183,1570 240,1604" fill="none" stroke="rgba(0,80,40,0.18)" stroke-width="5" stroke-dasharray="8 8"/>
      <path d="M183,1110 Q183,1140 183,1180 Q183,1210 140,1240" fill="none" stroke="rgba(80,60,160,0.18)" stroke-width="5" stroke-dasharray="8 8"/>
      <path d="M183,700 Q183,740 183,780 Q183,830 120,890" fill="none" stroke="rgba(120,20,20,0.15)" stroke-width="5" stroke-dasharray="8 8"/>
      <path d="M183,2188 Q183,2220 183,2260 Q183,2300 115,2326" fill="none" stroke="rgba(60,90,140,0.18)" stroke-width="5" stroke-dasharray="8 8"/>
      <path d="M183,2550 Q183,2580 183,2620 Q183,2660 130,2790" fill="none" stroke="rgba(100,120,180,0.15)" stroke-width="5" stroke-dasharray="8 8"/>
    `
