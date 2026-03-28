# Onboarding Screens — AkademiWeal

**Goal**: Get user to first lesson in under 20 seconds. No login friction. Build emotional hook.

---

## Overall Layout Pattern

```
┌─────────────────────────────┐
│                             │  ← Status bar (system)
│   [Progress dots]           │  ← 4 dots, top center
│                             │
│   [Illustration / Mascot]   │  ← 280px hero area
│                             │
│   [Title]                   │  ← display size, centered
│   [Subtitle]                │  ← body, #6B7280, centered
│                             │
│                             │
│   [Selection cards]         │  ← screens 2 & 3 only
│                             │
│   [Primary CTA]             │  ← fixed bottom, 56px, full-width
│   [Secondary / Skip]        │  ← ghost button below CTA
└─────────────────────────────┘
```

Background: warm cream gradient `linear-gradient(160deg, #FFF7ED 0%, #FEF3C7 100%)`
Padding: 24px horizontal

---

## Screen 1 — Welcome

### Visual
- **Illustration**: Weal the bull mascot (160px) standing on a podium with a graduation cap, holding a small gold coin. Colorful, flat-style.
- Background blobs: soft green and amber shapes behind mascot

### Content
```
Title:    "Belajar Investasi\nJadi Mudah 🚀"
          28px, weight 800, #111827

Subtitle: "Cukup 3 menit sehari untuk mulai\nmembangun masa depan keuanganmu."
          16px, #6B7280, centered

CTA:      "Mulai Sekarang"   ← Primary green button
Skip:     "Lewati"           ← Ghost button
```

### Progress Dots
- 4 dots, current = filled green, rest = #E5E7EB, 8px diameter

### Behavior
- Tap CTA → slide to Screen 2
- Tap Skip → jump to Home (mark onboarding complete)
- Entry animation: mascot bounces in (scale 0.8 → 1.0, 400ms spring)

---

## Screen 2 — Goal Selection

### Visual
- **Illustration**: 3 small icons arranged in a row: seedling (🌱), chart-up (📈), graduation cap (🎓)
- Illustration height: 120px (smaller, leave room for options)

### Content
```
Title:    "Apa tujuanmu?"
          24px, weight 700

Subtitle: "Kami akan sesuaikan perjalanan\nbelajarmu"
          14px, #6B7280
```

### Selection Cards (3 options)
```
Layout: vertical stack, gap 12px
Each card:
  Height:     64px
  Radius:     12px
  Border:     2px solid #E5E7EB
  Background: white
  Layout:     icon (32px) | label (16px, weight 600) | radio circle

  Options:
  ① 🌱  "Belajar dari nol"
  ② 📈  "Siap mulai investasi"
  ③ 📚  "Tambah pengetahuan"

Selected state:
  Border: 2px solid #22C55E
  Background: #DCFCE7
  Radio: filled green circle
```

### CTA
```
"Lanjut →"   → enabled only when 1 option is selected
```

### Behavior
- Tap option → instant highlight (150ms)
- CTA activates after selection
- Selected card gets scale(1.02) micro-bounce

---

## Screen 3 — Time Commitment

### Visual
- **Illustration**: A small clock/calendar icon with a flame, 100px

### Content
```
Title:    "Berapa menit per hari?"
          24px, weight 700

Subtitle: "Konsistensi kecil lebih baik\ndari belajar sekaligus"
          14px, #6B7280
```

### Selection Cards (3 options, horizontal row)
```
Layout: 3 cards in a row, equal width, gap 12px
Each card:
  Height:     100px
  Radius:     16px
  Border:     2px solid #E5E7EB
  Background: white
  Layout:     centered column
    - Time emoji (32px)
    - Duration value: "3", "5", "10" — 28px, weight 800
    - "menit" label: 12px, #6B7280

Options:
  ⚡ 3 menit   (fastest / recommended badge)
  📖 5 menit
  🏆 10 menit

"Direkomendasikan" badge on "3 menit" card:
  Small pill, bg #22C55E, text white, 10px, absolute top-right
```

### Behavior
- Tap → highlight + scale bounce
- "3 menit" pre-selected by default

---

## Screen 4 — Streak Launch

### Visual
- **Full bleed illustration**: Weal mascot jumping with confetti, arms raised, big smile
- Background: gradient green `linear-gradient(160deg, #DCFCE7 0%, #F0FDF4 100%)`
- Confetti particles: animated, 800ms burst

### Content
```
Streak pill (top):
  🔥 "Hari ke-1"
  Bg: #FEF3C7, text #92400E, radius 999px, padding 8px 16px

Title:    "Mulai Streakmu\nHari Ini! 🔥"
          28px, weight 800, #111827

Subtitle: "Belajar setiap hari = investasi\nterbaik dalam hidupmu"
          16px, #6B7280

Stats preview (3 mini cards in row):
  🔥 Streak: 0 hari
  ⭐ XP: 0
  🎯 Level: 1
```

### CTA
```
Primary:  "Mulai Belajar! →"   ← green, 56px, full width
          → navigates to Home screen
```

### Behavior
- Entry animation: confetti burst + mascot bounces in
- CTA tap → transition to Home with celebration particle effect
- Save onboarding_complete = true, save goal + time_commitment to user profile
