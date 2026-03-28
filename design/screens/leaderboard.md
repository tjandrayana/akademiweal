# Leaderboard Screen — AkademiWeal

**Purpose**: Show weekly XP ranking. Drive friendly competition and streak retention.
**Scope**: MVP — show top 10 + user's own rank.

---

## Layout

```
┌─────────────────────────────────┐
│  STATUS BAR                     │
├─────────────────────────────────┤
│  HEADER                         │
│        Peringkat   [⏱ 3h left] │
├─────────────────────────────────┤
│                                 │
│  [Week tab selector]            │
│  [Minggu Ini]  [Minggu Lalu]    │
│                                 │
│  [Top 3 Podium]                 │
│                                 │
│  [Rank list 4–10]               │
│                                 │
│  [YOUR RANK card — sticky]      │
│                                 │
├─────────────────────────────────┤
│  BOTTOM NAV                     │
└─────────────────────────────────┘
```

---

## Week Tab Selector

```
2 tabs, pill style:
  [Minggu Ini]  [Minggu Lalu]

Active: green bg, white text
Inactive: transparent, #6B7280
```

---

## Top 3 Podium

```
Layout: horizontal row, center item elevated

Positions (left to right): 2nd, 1st, 3rd

  1st place (center, tallest):
    Avatar: 72px
    Crown: 👑 above avatar
    Name: 14px, weight 700
    XP: "1,240 XP" — gold, weight 800
    Podium height: 80px, gold (#F59E0B)

  2nd place (left):
    Avatar: 56px
    Medal: 🥈
    Name: 13px, weight 600
    XP: "980 XP" — #9CA3AF
    Podium height: 56px, silver (#D1D5DB)

  3rd place (right):
    Avatar: 56px
    Medal: 🥉
    Name: 13px, weight 600
    XP: "720 XP" — #92400E
    Podium height: 44px, bronze (#D97706 light)
```

---

## Rank List (4–10)

```
Each row:
  Height: 64px
  Padding: 0 16px
  Divider: 1px #F3F4F6

  Layout: [rank number] [avatar 40px] [name + streak] [XP]

  Rank number: 24px circle, bg #F3F4F6, text 13px weight 700
  Name: 14px, weight 600
  Streak: "🔥 5" — 12px, #EA580C (below name)
  XP: "560 XP" — 14px, weight 700, right-aligned

  If this is current user's rank:
    Row bg: #DCFCE7 (subtle green highlight)
    Rank circle: #22C55E, white text
```

---

## User's Own Rank Card (Sticky Bottom)

```
Position: sticky at bottom of scroll, above nav
Background: white
Shadow: 0 -4px 12px rgba(0,0,0,0.08)
Border-top: 2px solid #22C55E
Padding: 12px 16px

Layout: [#12] [avatar 40px] [You · 🔥 7] [240 XP]

"#12" rank — 18px, weight 800, #111827
"Kamu" — 14px, weight 600
XP — 14px, weight 700

Below row: "Kamu perlu 40 XP lagi untuk naik ke peringkat 11"
           12px, #6B7280
```

---

## Reset Timer

```
Top-right of header: "Reset dalam 2h 34m"
Style: small pill, bg #FEF3C7, text #D97706, 11px
Updates live (countdown)
```

---

## Empty State (No participants)

```
Weal: waving, friendly
Text: "Jadilah yang pertama!\nMulai belajar untuk masuk peringkat."
CTA: "Mulai Belajar"
```
