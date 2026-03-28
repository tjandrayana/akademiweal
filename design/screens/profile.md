# Profile Screen — AkademiWeal

**Purpose**: Show user's progress, achievements, and weekly stats. Motivational, not overwhelming.

---

## Layout

```
┌─────────────────────────────────┐
│  STATUS BAR                     │
├─────────────────────────────────┤
│  HEADER                         │
│  [←]     Profil      [⚙️]       │
├─────────────────────────────────┤
│  SCROLL CONTENT                 │
│                                 │
│  [Avatar + Name + Level]        │
│  [XP Level Progress Bar]        │
│                                 │
│  [Stats Row: Streak/XP/Medals]  │
│                                 │
│  [Weekly Activity Chart]        │
│                                 │
│  [Achievements Section]         │
│                                 │
│  [Settings Links]               │
│                                 │
├─────────────────────────────────┤
│  BOTTOM NAV                     │
└─────────────────────────────────┘
```

---

## Avatar + Name Section

```
Layout:   centered column
Padding:  24px top

Avatar:
  Size:   80px circle
  Border: 3px solid #22C55E (if active streak) / #E5E7EB
  Ring:   4px glow #DCFCE7 (active streak only)
  Image:  user photo or initials (default: letter avatar on green bg)
  Tap:    opens avatar picker (future feature, show "Coming Soon" toast in MVP)

Name:
  Text:   display name — 20px, weight 700, #111827

Username / ID:
  Text:   "@username" or "ID: #1234" — 13px, #6B7280

Level Badge:
  Pill:   "⚡ Level 3 — Pemula Cerdas" — 12px, weight 600
  Bg:     #DCFCE7, text #15803D
  Margin: 8px top

Edit Profile button:
  Style: secondary outline, 36px height, 120px width
  Text:  "Edit Profil" — 13px
  Tap:   → Edit Profile screen (future feature)
```

### Level Label Names
```
Level 1: Pemula        (Beginner)
Level 2: Penabung      (Saver)
Level 3: Pemula Cerdas (Smart Beginner)
Level 4: Investor Muda (Young Investor)
Level 5: Ahli Keuangan (Finance Expert)
```

---

## XP Progress Bar

```
Container: mx-16px, margin-top 16px

Label row:
  Left:  "Progress Level 3 → 4" — 12px, #6B7280
  Right: "240 / 300 XP" — 12px, weight 700, #D97706

Progress bar:
  Height:  12px
  Track:   #E5E7EB, radius 999px
  Fill:    gradient #22C55E → #86EFAC
  Width:   80% (240/300)
  Animation: fills on mount, 600ms ease-out

Below bar: "Butuh 60 XP lagi untuk naik level" — 11px, #9CA3AF
```

---

## Stats Row

```
3 cards in a row, mx-16px, gap 10px:

① Streak
  Icon:  🔥 in #FFF7ED circle
  Value: "12" — 24px, weight 800, #EA580C
  Label: "Hari Terpanjang" — 11px, #6B7280

② Total XP
  Icon:  ⭐ in #FEF3C7 circle
  Value: "240" — 24px, weight 800, #D97706
  Label: "Total XP" — 11px, #6B7280

③ Lessons Done
  Icon:  📚 in #EEF2FF circle
  Value: "8" — 24px, weight 800, #6366F1
  Label: "Pelajaran" — 11px, #6B7280
```

---

## Weekly Activity Chart

```
Section header: "Aktivitas Minggu Ini" — h3
Card: white, radius 16px, padding 20px, mx-16px

Chart type: Bar chart (simple, no library needed in MVP — use CSS bars)

Layout:
  7 columns (Mon–Sun), equal width
  Each bar:
    Max height: 80px
    Width: 24px
    Radius: 4px top only
    Active day (has activity): #22C55E
    Today (with/without activity): darker #16A34A
    No activity: #F3F4F6

Day labels: below bars, 10px, #9CA3AF, "Sen Sel Rab Kam Jum Sab Min"
XP labels: above bars on hover/tap (show tooltip: "32 XP")

Below chart:
  Row: "Total minggu ini: 156 XP  ·  4 hari aktif" — 12px, #6B7280
```

---

## Achievements / Badges

```
Section header row:
  Left: "Pencapaian" — h3
  Right: "Lihat Semua →" — 12px, #22C55E

Grid: 4 columns, gap 12px, mx-16px

Badge tile (each):
  Size:     72px × 80px
  BG:       white
  Radius:   12px
  Shadow:   shadow-sm
  Icon:     emoji or SVG (40px)
  Label:    10px, centered, 2 lines max

  States:
    Earned:  full color, white bg
    Locked:  grayscale icon, #F3F4F6 bg, 🔒 overlay (small, top-right)

Achievement list (MVP — first 8 shown):
  🔥 "7 Hari Beruntun"       — 7-day streak
  ⭐ "Bintang Pertama"        — first 3-star lesson
  🚀 "Langkah Pertama"        — complete lesson 1
  🏆 "Juara Quiz"             — 5 perfect quizzes
  📚 "Perpustakaan Mini"      — complete 5 lessons
  💰 "Investor Muda"          — complete Level 2
  🌟 "Minggu Sempurna"        — 7-day streak with daily goal met
  🎯 "Tepat Sasaran"          — 3 perfect scores in a row
```

---

## Settings Links

```
Section: small list of tappable rows, mx-16px

Rows (each 52px, divider between):
  🔔 Pengingat Belajar      → opens reminder time picker
  🌙 Mode Gelap             → toggle switch
  📱 Bahasa                 → "Indonesia" → picker
  ❤️  Premium              → premium upsell screen
  📤 Bagikan Aplikasi       → native share
  ℹ️  Tentang               → about screen
  🚪 Keluar                 → logout confirmation dialog
```

---

## Empty Achievements State

```
If user has 0 achievements earned:
  Weal mascot: curious expression
  Text: "Selesaikan pelajaran untuk\nmendapatkan pencapaian!"
  CTA: "Mulai Belajar" → goes to Home
```
