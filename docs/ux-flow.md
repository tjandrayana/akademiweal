# UX Flow — AkademiWeal

---

## App Navigation Structure

```
App Entry
├── First Launch → Onboarding (4 screens) → Home
└── Returning User → Home

Home (Learning Map)
├── Tap node → Lesson Flow
│   ├── Step 1: Hook
│   ├── Step 2: Micro Content
│   ├── Step 3: Interaction
│   ├── Step 4: Quiz (1–2 questions)
│   └── Step 5: Reward Screen
│       ├── Level Up Modal (if triggered)
│       └── → Home (next node unlocked)
├── Tap completed node → Review / Retry bottom sheet
└── Tap daily reward → Daily Reward bottom sheet

Bottom Navigation
├── 🏠 Belajar → Home (Learning Map)
├── 📖 Pelajaran → Lesson List (flat list of all lessons)
├── 🏆 Peringkat → Leaderboard
├── ⭐ Hadiah → Rewards / Achievements
└── 👤 Profil → Profile Screen
```

---

## Critical User Journeys

### 1. First-Time User (< 60 seconds to first lesson)
```
App Open
  → Splash (1.5s)
  → Onboarding Screen 1 (Welcome)     ← tap "Mulai"
  → Onboarding Screen 2 (Goal)        ← select + tap "Lanjut"
  → Onboarding Screen 3 (Time)        ← select + tap "Lanjut"
  → Onboarding Screen 4 (Streak Hook) ← tap "Mulai Belajar"
  → Home (map shown, node 1 pulsing)
  → Tap Node 1 → LESSON START
```

### 2. Returning User (Daily Loop)
```
App Open
  → Home
  → If streak at risk: streak warning banner
  → If daily reward: reward banner
  → Tap current node → lesson
  → Complete lesson → Reward screen
  → Back to Home (next node unlocked)
  → Optionally: view leaderboard or profile
```

### 3. Out of Lives Flow
```
Wrong answer during quiz
  → Lives - 1 (heart shake animation)
  → If lives = 0:
    → "Nyawa Habis" bottom sheet
    → Option A: Watch ad → +3 lives → continue
    → Option B: Retry lesson (lose progress)
    → Option C: Back to map
```

### 4. Level Up Flow
```
Complete final lesson of a level
  → Reward screen (with full XP)
  → Level Up Modal overlay (celebration)
  → "New lessons unlocked" preview
  → Back to Home (new level section visible)
```

---

## Screen Transition Rules

| From | To | Transition |
|---|---|---|
| Onboarding → Home | Slide left | 300ms ease |
| Home → Lesson | Slide up (sheet) | 300ms ease-out |
| Lesson step → step | Slide left | 250ms ease |
| Lesson → Reward | Fade + scale in | 400ms spring |
| Reward → Home | Slide down | 300ms ease-in |
| Any → Profile | Slide left | 300ms ease |
| Tab switch | Cross-fade | 200ms |

---

## Gamification Loop

```
Daily trigger: push notification → App Open
  ↓
Home: see streak status + daily goal
  ↓
Start lesson (motivated by streak risk or reward)
  ↓
Complete lesson: XP gain + stars + streak maintained
  ↓
Reward screen: feel accomplished
  ↓
Continue? → next lesson OR stop for today
  ↓
Leaderboard check (optional): see rank → competitive motivation
  ↓
Tomorrow: same loop
```

---

## Notification Strategy

| Trigger | Message | Time |
|---|---|---|
| Daily reminder (user-set time) | "🔥 Streakmu menunggu! Belajar 3 menit sekarang" | User-set |
| Streak at risk (20:00 if not done) | "⚠️ Streak 7 hari kamu hampir putus!" | 20:00 |
| Level up teaser | "🎉 Kamu hampir Level 3! 1 pelajaran lagi" | After last lesson |
| Daily reward available | "🎁 Hadiah harianmu sudah siap!" | 09:00 |

---

## Error States

| Scenario | Screen | Handling |
|---|---|---|
| No internet | Lesson | "Tidak ada koneksi. Coba lagi?" + retry button |
| API error | Home | Skeleton loader → error card with retry |
| Session expired | Any | Redirect to login (silent re-auth if possible) |
| Lesson data missing | Lesson | "Pelajaran tidak tersedia" + back to map |
