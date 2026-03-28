# Reward Screen — AkademiWeal

**Purpose**: Celebrate lesson completion, show XP earned, reinforce streak.
**Emotional goal**: User must feel accomplished and want to continue immediately.

---

## Layout

```
┌─────────────────────────────────┐
│  STATUS BAR                     │
├─────────────────────────────────┤
│                                 │
│  [Confetti animation]           │  ← full screen, 800ms burst
│                                 │
│  [Stars Row]                    │  ← ⭐⭐⭐ earned stars
│                                 │
│  [Weal Mascot — celebrating]    │  ← 160px, arms up, bouncing
│                                 │
│  [Title]                        │  ← "Pelajaran Selesai! 🎉"
│  [Subtitle]                     │  ← topic name
│                                 │
│  [XP Summary Card]              │
│                                 │
│  [Streak Status]                │
│                                 │
│  [Primary CTA]                  │
│  [Secondary: Home]              │
│                                 │
└─────────────────────────────────┘
```

Background: gradient `linear-gradient(180deg, #DCFCE7 0%, #F0FDF4 60%, white 100%)`

---

## Stars Row

```
Layout:   3 stars, centered, gap 8px
Timing:   Stars animate in one by one with 200ms delay each
          Scale from 0 → 1.2 → 1.0 with spring bounce
          Each star: 48px

Star earned:    ⭐ gold, filled (#F59E0B), with glow
Star not earned: ☆ gray (#D1D5DB)

Star criteria:
  ⭐      Completed lesson (always)
  ⭐⭐    No more than 1 wrong answer
  ⭐⭐⭐  Perfect score (all correct, no lives lost)
```

---

## Weal Mascot (Celebrating State)
```
Version:   arms raised, confetti around head, big smile
Size:      160px
Animation: bounce (scale 0.95 ↔ 1.05, 800ms loop) for 3s then idle
Position:  centered, below stars
```

---

## Title & Subtitle

```
Title:    "Pelajaran Selesai! 🎉"
          28px, weight 800, #111827

Subtitle: "[topic name]"  ← e.g. "Inflasi — Level 1"
          16px, #6B7280
```

---

## XP Summary Card

```
Card spec:
  Background: white
  Radius:     16px
  Padding:    20px
  Shadow:     shadow-md
  Margin:     0 24px

Layout: 3 rows

Row 1: Lesson Complete bonus
  Left: ✅ icon (24px green circle)
  Label: "Pelajaran Selesai"
  Right: "+10 XP" — gold, weight 700

Row 2: Correct answers bonus
  Left: 💡 icon
  Label: "Jawaban Benar (3/3)"
  Right: "+6 XP" — gold, weight 700

Row 3: Perfect bonus (if earned)
  Left: 🌟 icon
  Label: "Sempurna!"
  Right: "+5 XP" — gold, weight 700

Divider: 1px #F3F4F6

Total row:
  Background: #FEF3C7
  Radius: 8px
  Padding: 12px
  Left:  "Total XP Diperoleh"  — 14px, weight 700
  Right: "+21 XP"  — 20px, weight 800, #D97706

  Note: Numbers count up with animation (0 → 21, 600ms)
```

---

## Streak Status

```
Layout:   centered row with icon + text

If streak maintained:
  🔥 "Streak 7 hari! Pertahankan!"
  Color: #EA580C
  Bg pill: #FFF7ED

If new streak (day 1):
  🔥 "Streak Dimulai! Belajar lagi besok"
  Color: #EA580C

If streak broken and now restored:
  🔥 "Streak dimulai lagi dari 1"
  Color: #9CA3AF (neutral, not discouraging)
```

---

## CTAs

### Primary CTA
```
Text:       "Pelajaran Berikutnya →"
            OR "Selesai untuk Hari Ini 🌟" (if daily goal met)
Style:      Primary green, 56px, full-width, mx-24px
```

### Secondary
```
Text:       "Kembali ke Peta"
Style:      Ghost button, 44px
```

---

## Level Up Modal (Overlay)

**Triggered when**: XP gain pushes user to a new level.

```
Overlay: rgba(0,0,0,0.5) full screen
Modal:
  Center card, 300px wide
  Background: white
  Radius: 24px
  Padding: 32px

  Animation: scale 0 → 1 with spring + confetti burst

  Content:
    ⚡ Level badge (80px animated gold spin)
    Title: "Level Up! 🎉" — 28px, weight 800
    Subtitle: "Kamu sekarang Level 3!" — 16px, #6B7280
    New unlock text: "Bab Baru Terbuka: Reksa Dana"

    CTA: "Lanjutkan!" — full-width primary
```

---

## Share Card (Optional, bottom of reward)

```
Small section below CTAs:

"Bagikan pencapaianmu"  ← 12px, #6B7280, centered

Share card preview (mini, 200×100px):
  App gradient background
  Stars earned + XP + lesson name
  "belajar di AkademiWeal"

  Share button: secondary outline, "📤 Bagikan"
  → native share sheet
```

---

## Confetti Spec

```
Particles:  40–60 pieces
Colors:     #22C55E, #F59E0B, #6366F1, #EF4444, #FBBF24
Shapes:     circles + rectangles
Animation:  burst from center-top, fall with gravity
Duration:   800ms burst + 1.5s fall
Library:    canvas-confetti (lightweight)
```
