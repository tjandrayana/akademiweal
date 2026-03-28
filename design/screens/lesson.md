# Lesson Screen — AkademiWeal

**Purpose**: Deliver a micro-lesson (2–3 min) in a step-by-step, gamified flow.
**Format**: Hook → Content → Interaction → Quiz → Reward

---

## Layout Template (All lesson steps share this shell)

```
┌─────────────────────────────────┐
│  STATUS BAR                     │
├─────────────────────────────────┤
│  LESSON HEADER (fixed)          │
│  [✕]  [━━━━━━━━━━━━]  [❤️❤️❤️] │
├─────────────────────────────────┤
│                                 │
│                                 │
│  CONTENT AREA (scrollable)      │
│                                 │
│                                 │
│                                 │
│                                 │
├─────────────────────────────────┤
│  ACTION FOOTER (fixed)          │
│  [Primary Button / Check]       │
└─────────────────────────────────┘
```

### Lesson Header
```
Height:     56px
Left:       ✕ close (24px icon, #6B7280)
Center:     Progress bar — steps done / total steps
            E.g. lesson with 5 steps → bar at 40% after step 2
Right:      ❤️❤️❤️ lives
```

### Action Footer
```
Height:     80px (includes safe area padding)
Background: white
Shadow:     0 -2px 8px rgba(0,0,0,0.06)
Button:     full-width, 56px, Primary style
            Label changes by step:
              Hook/Content:  "Lanjut →"
              Pre-quiz:      "Aku Mengerti"
              Quiz:          "Periksa" (after selecting answer)
              Feedback:      "Lanjut →" (after seeing result)
```

---

## Step 1 — Hook

**Goal**: Create curiosity or emotional relevance in 1 sentence.

```
Layout:
┌─────────────────────────────────┐
│  [Lesson topic label pill]      │  ← e.g. "💵 Apa Itu Uang"
│                                 │
│  [Hero Illustration]            │  ← 200px, centered
│  (topic-relevant, flat style)   │
│                                 │
│  [Hook Question / Statement]    │  ← h2, centered, 3 lines max
│                                 │
│  [Short context]                │  ← body, #6B7280, centered
│                                 │
└─────────────────────────────────┘

Example (L1 "Inflation"):
  Illustration: price tag getting bigger, scared person
  Hook: "Kenapa Rp100.000 tahun lalu terasa lebih berharga?"
  Context: "Ini bukan sihir. Namanya inflasi."

Footer button: "Pelajari →"
```

---

## Step 2 — Micro Content

**Goal**: Deliver 2–3 key sentences. Visual-first.

```
Layout:
┌─────────────────────────────────┐
│  [Content Card 1]               │
│  ┌──────────────────────────┐   │
│  │ Icon/Visual (60px)       │   │
│  │ Heading (h3)             │   │
│  │ Body text (14px, 2 lines)│   │
│  └──────────────────────────┘   │
│                                 │
│  [Content Card 2]               │
│  ┌──────────────────────────┐   │
│  │ Icon/Visual              │   │
│  │ Heading                  │   │
│  │ Body text                │   │
│  └──────────────────────────┘   │
│                                 │
│  [Content Card 3 — optional]    │
│                                 │
└─────────────────────────────────┘

Content Card:
  Background: white
  Radius: 16px
  Padding: 16px
  Shadow: shadow-sm
  Icon: 48px emoji or SVG, in colored circle (56px)
  Heading: 16px, weight 700
  Body: 14px, #4B5563, line-height 1.5

Example (L1 "Inflation"):
  Card 1: 📈 "Harga Naik Setiap Tahun"
           "Rata-rata harga naik 4-5% per tahun di Indonesia."
  Card 2: 💰 "Uang Kasmu Menyusut"
           "Rp1.000.000 hari ini hanya bernilai Rp960.000 tahun depan."
  Card 3: 🛡️ "Investasi = Perlindungan"
           "Investasi yang baik mengalahkan inflasi."

Footer button: "Aku Mengerti →"
```

---

## Step 3 — Interaction (Swipe / Tap)

**Goal**: Light engagement before quiz. 2 variants:

### Variant A — True/False Tap
```
Layout:
  Statement card (large, centered):
    Background: #F3F4F6
    Radius: 16px
    Padding: 24px
    Text: 18px, weight 600, centered
    Example: "Inflasi membuat tabungan lebih bernilai"

  2 large buttons side by side:
    Left: "✓ Benar" — green outline button
    Right: "✗ Salah" — red outline button
    Height: 64px each

  After tap → instant feedback card slides in below:
    Correct: green bg, "Tepat! 🎉" + brief explanation
    Wrong: red bg, "Belum tepat 🤔" + correction
```

### Variant B — Drag Match
```
Layout:
  Left column: terms (3 items, cards)
  Right column: definitions (3 items, cards, scrambled)
  Connecting line drawn when user drags term to definition

  When all matched: "Periksa" button activates
  After checking: lines turn green (correct) or red (wrong)

Note: MVP can simplify to Variant A for speed
```

### Footer button: "Periksa" (enabled after interaction)

---

## Step 4 — Quiz

**Goal**: Test comprehension with 2–4 options.

```
Layout:
┌─────────────────────────────────┐
│  [Question number: 1 of 2]      │  ← small caption, #6B7280
│                                 │
│  [Question text]                │  ← h3, 18px, weight 700
│                                 │
│  [Optional: illustration/chart] │  ← 120px if relevant
│                                 │
│  [Option A card]                │
│  [Option B card]                │
│  [Option C card]                │
│  [Option D card]                │  ← optional 4th
│                                 │
└─────────────────────────────────┘

Question text:
  Font: 18px, weight 700, #111827
  Max 2 lines

Option Card (Quiz Option Card from components):
  Height: 60px
  Left: letter circle (A/B/C/D) — 32px, #E5E7EB bg
  Text: 16px, weight 500
  Right: checkmark/x (shows after answer submitted)

States:
  Default:   white bg, #E5E7EB border
  Tapped:    #DCFCE7 bg, #22C55E border (before check)
  Correct:   #DCFCE7 bg, #22C55E border + ✓ icon, letter circle turns green
  Wrong:     #FEE2E2 bg, #EF4444 border + ✗ icon, letter circle turns red
  Others dim: opacity 0.5 after answer revealed

Footer button: "Periksa" → disabled until option selected
```

### Correct Answer Feedback (Bottom Banner)
```
Slides up from bottom, above footer:
  Background: #DCFCE7
  Border-top: 3px solid #22C55E
  Icon: ✓ in green circle (40px)
  Title: "Benar! 🎉" — 18px, weight 700, #15803D
  Body:  Brief explanation (optional, 1 line)
  XP pop:  "+2 XP" gold badge floats up and fades

Footer button changes to: "Lanjut →" (green)
```

### Wrong Answer Feedback (Bottom Banner)
```
Background: #FEE2E2
Border-top: 3px solid #EF4444
Icon:  ✗ in red circle (40px)
Title: "Hampir Benar! 💪" — 18px, weight 700, #DC2626
Explanation: Shows correct answer + 1-line reason
Lives: one heart turns gray (❤️ → 🩶) with shake animation

Footer: "Lanjut →" (red tint)
```

---

## Step 5 — Reward (Lesson Complete)

**See `reward.md` for full spec.**

Quick summary:
- Confetti burst
- XP gained summary
- Stars earned (1–3)
- "Lanjut ke Pelajaran Berikutnya" CTA

---

## Lesson State: Out of Lives

```
Trigger: Lives = 0 after wrong answer
Modal (bottom sheet):

  Weal mascot: sad expression, 120px
  Title: "Nyawa Habis 😢"
  Body: "Tonton iklan untuk mengisi ulang\natau tunggu 4 jam"

  Options:
  ① Primary: "🎬 Tonton Iklan (+3 ❤️)"
  ② Secondary: "Ulangi dari Awal" (without lives penalty for first attempt)
  ③ Ghost: "Kembali ke Peta"

  Timer: "Isi ulang dalam 3:47:22" shown below options
```

---

## Progress Tracking (per lesson step)

```
Total steps per lesson: 5 (hook, content, interaction, quiz1, quiz2)
Progress bar segments: 5 equal segments
Each segment fills when step is completed:
  - Completed: #22C55E
  - Current: pulsing light green
  - Remaining: #E5E7EB
```

---

## Keyboard / Input Handling

- No text input in MVP (all tap-based)
- Ensure options are accessible above keyboard if any future text input is added
- Tap area minimum: 48px height (WCAG standard)

---

## Lesson Types Reference

| Level | Lesson | Hook Example |
|---|---|---|
| L1 | Apa Itu Uang | "Uang itu apa, sebenarnya?" |
| L1 | Kenapa Investasi | "Kenapa diam itu rugi?" |
| L1 | Inflasi | "Rp100rb sekarang vs 10 tahun lalu" |
| L1 | Risiko vs Return | "Makin tinggi untung, makin...?" |
| L2 | Deposito | "Titipkan uang, dapat bunga" |
| L2 | Reksa Dana | "Investasi bareng-bareng" |
| L3 | Saham | "Jadi pemilik perusahaan dengan Rp10.000" |
