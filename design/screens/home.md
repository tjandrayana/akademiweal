# Home Screen — AkademiWeal

**Purpose**: Show learning progress at a glance + motivate user to continue the path.
**Inspired by**: Duolingo map (path nodes) + clean dashboard stats.

---

## Layout Overview

```
┌─────────────────────────────────┐
│  STATUS BAR                     │
├─────────────────────────────────┤
│  TOP BAR                        │  ← fixed, 56px
│  [🔥 Streak]  [Logo]  [❤️ Lives] │
├─────────────────────────────────┤
│                                 │
│  STATS ROW                      │  ← 3 stat cards
│  [🔥 Streak] [⭐ XP] [🎯 Level] │
│                                 │
├─────────────────────────────────┤
│                                 │
│  SECTION LABEL CARD             │  ← "Level 1 — Dasar Keuangan"
│                                 │
│  LEARNING PATH (scroll)         │  ← Duolingo-style snake path
│                                 │
│       [Node 5 — locked]         │
│      ╱                          │
│  [Node 4 — locked]              │
│      ╲                          │
│       [Node 3 — current] 🐂     │  ← Weal mascot sitting here
│      ╱                          │
│  [Node 2 — completed ★★★]       │
│      ╲                          │
│       [Node 1 — completed ★★★]  │
│                                 │
│  [Daily Reward Banner]          │  ← only if not claimed today
│                                 │
├─────────────────────────────────┤
│  BOTTOM NAV                     │  ← fixed, 64px
└─────────────────────────────────┘
```

---

## Top Bar

```
Height:     56px
Background: white
Shadow:     shadow-sm
Padding:    0 16px

Left:       🔥 [streak_count] "hari"
            Background: #FFF7ED pill
            Text: #EA580C, 14px, weight 700

Center:     App logo (wordmark "AkademiWeal", 16px, green)

Right:      ❤️❤️❤️ (lives remaining)
            Each heart: 20px, red if active, gray if lost
            Tap → info bottom sheet about lives
```

---

## Stats Row

```
Layout:     3 equal cards in a row, gap 10px
Container:  padding 16px horizontal, margin-top 8px

Card spec:  (from component library "Stat Card")

① Streak Card
  Icon:    🔥 in #FFF7ED circle
  Value:   "7" — 24px, weight 800, #EA580C
  Label:   "Hari Beruntun" — 11px, #6B7280

② XP Card
  Icon:    ⭐ in #FEF3C7 circle
  Value:   "240" — 24px, weight 800, #D97706
  Label:   "Total XP" — 11px, #6B7280

③ Level Card
  Icon:    🎯 in #DCFCE7 circle
  Value:   "2" — 24px, weight 800, #15803D
  Label:   "Level" — 11px, #6B7280
```

---

## Section Label Card

```
Layout:     full-width card, 16px horizontal margin
Height:     auto, padding 14px 16px
Radius:     12px
Background: #22C55E
Text color: white
Content:
  - Small label: "SEDANG BELAJAR" — 10px, weight 700, opacity 0.8
  - Title: "Level 1 — Dasar Keuangan" — 16px, weight 700
  - Progress: "Pelajaran 3 dari 5" — 12px, opacity 0.85
  - Mini progress bar: white fill on rgba(white,0.3) track
```

---

## Learning Path (Main Scroll Area)

### Background
```
Full-width illustrated path background:
  - Soft green gradient top → white bottom
  - Winding road/path illustration (SVG, decorative)
  - Small decorative elements: coins, charts, trees (not interactive)
```

### Path Layout (Snake / Zigzag)
```
Nodes alternate left and right as user scrolls up:
  Row 1 (bottom): Node centered
  Row 2:          Node offset left
  Row 3:          Node offset right
  ...

Node spacing: ~100px vertical between nodes
Path line: dashed green line connecting nodes (SVG)
```

### Node States

#### Completed Node
```
Shape:    64px circle
BG:       #22C55E
Icon:     relevant topic icon (white, 28px)
Border:   none
Stars:    3 small stars below node (⭐⭐⭐ or ⭐⭐☆ or ⭐☆☆)
Stars color: #F59E0B (earned) / #D1D5DB (not earned)
```

#### Current Node (Next to do)
```
Shape:    72px circle (slightly larger)
BG:       #22C55E
Icon:     topic icon, white, 32px
Ring:     4px ring #16A34A + outer pulse ring animation
          (pulsing opacity 0.3 → 0, scale 1 → 1.3, 2s loop)
Mascot:   Weal character (48px) sitting/floating beside this node
Label:    topic name below, 12px, weight 600, #374151
```

#### Locked Node
```
Shape:    64px circle
BG:       #D1D5DB
Icon:     🔒 lock icon, white, 24px
Border:   none
Label:    topic name below, 12px, #9CA3AF
Tap:      show "Complete previous lessons to unlock" toast
```

#### Checkpoint Node (between levels)
```
Shape:    80px circle (larger, special)
BG:       gold gradient (#F59E0B → #D97706)
Icon:     🏆 trophy, white, 36px
Label:    "CHECKPOINT" — 10px, weight 700, gold
Tap (if unlocked): opens level completion modal
```

### Node Topic Icons
```
L1 - What is money:      💵
L1 - Why invest:         📈
L1 - Inflation:          🌡️
L1 - Risk vs Return:     ⚖️
L2 - Deposits:           🏦
L2 - Mutual Funds:       📊
L3 - Stocks:             📉
L3 - Price Movement:     🔄
L3 - Risk:               ⚠️
L4 - Diversification:    🎯
L4 - Long-term:          🌱
L5 - Real Scenarios:     🏠
L5 - Decision Making:    🧠
```

---

## Daily Reward Banner

```
Condition:  Only visible if user hasn't claimed today's reward
Position:   Below path, above bottom nav
Layout:     full-width card, mx-4, floating style

Content:
  Left:     🎁 icon (48px, animated gentle wobble)
  Center:   "Hadiah Harian Tersedia!" — 14px, weight 700
             "Klaim sekarang" — 12px, #6B7280
  Right:    "Klaim →" button — small, green outline

Dismiss:    user can dismiss (X) to see it tomorrow
Tap:        opens Daily Reward bottom sheet
```

---

## Daily Reward Bottom Sheet

```
Header:   🎁 "Hadiah Harian" — h2
Day grid: 7 circular day buttons (Sun–Sat)
          Past: green checkmark
          Today: gold + pulsing
          Future: gray locked

Today's reward preview:
  "🔥 Bonus 5 XP + Streak Dijaga"
  or "+2 Lives"
  or "Pelajaran Terbuka"

CTA: "Klaim Hadiah!" — full-width primary button
     → triggers XP animation + confetti burst
```

---

## Floating XP Toast

```
Trigger:  When user returns to home after completing a lesson
Position: Top center, below status bar
Content:  "⭐ +10 XP"
Style:    Green pill, slide down + fade out after 2s
```

---

## Empty State (0 lessons started)

```
This only shows the first time before any lessons are done.
Weal mascot: excited, pointing at first node
Overlay arrow pointing to Node 1
Text: "Tap untuk mulai!" — 14px, weight 600
```

---

## Navigation to Lesson
- Tap **current node** → navigate to Lesson screen
- Tap **completed node** → show "Review or retry?" bottom sheet
- Tap **locked node** → show toast "Selesaikan pelajaran sebelumnya dulu"
