# AkademiWeal — App Audit Report

**Date**: 2026-03-29 (v4 — post-improvement audit + new issue triage)
**Auditor**: Claude Code (Senior UI/UX + Engineering Review)
**Scope**: Frontend — UI/UX, code quality, gamification design, product gaps
**Files read**: All 13 pages/components, gamification.js, useGamificationStats.js, sounds.js, api/client.js, tracking/events.js, index.css, App.jsx

---

## Resolution Log — Original 20 Issues (verified against live source)

| # | Issue | Status | Evidence |
|---|--------|--------|----------|
| 1 | Streak never incremented | ✅ Fixed | `recordDailyStreak()` in `gamification.js:50`; called in `Result.jsx:53` |
| 2 | Wrong answer shows no explanation | ✅ Fixed | `Lesson.jsx:465–474` shows `correctAnswer` + `lesson.explanation` |
| 3 | Leaderboard/Profile routes missing | ✅ Fixed | Both routes in `App.jsx:39–40`; pages exist with `<BottomNav />` |
| 4 | English strings in Lesson | ✅ Fixed | All lesson strings are Indonesian |
| 5 | Daily reward false expectations | ✅ Fixed | Replaced with "Fitur ini akan menyusul" neutral card |
| 6 | Onboarding data not persisted | ✅ Fixed | `Onboarding.jsx:39–44` saves goal+time; Home shows "Fokus:" label |
| 7 | Level tabs not gated | ✅ Fixed | `isLevelUnlocked()` + toast + `🔒` display |
| 8 | `XP_PER_LESSON_COMPLETE` never called | ✅ Fixed | `Lesson.jsx:186`: `xpTotal = sessionXp + XP_PER_LESSON_COMPLETE` |
| 9 | Current node on every level | ✅ Fixed | `isCurrent` gated by `selectedLevel === activePathLevel` |
| 10 | Exit lesson without confirmation | ✅ Fixed | `requestExitLesson()` + bottom-sheet confirmation dialog |
| 11 | Stars always ⭐⭐⭐ | ✅ Fixed | `starsForCurrentLesson()` uses `wrongBeforeCorrect`; `markLessonComplete(id, stars)` persists |
| 12 | Mascot 🐂 clipping | ✅ Fixed | Mascot now lives inside the circle button; no overflow |
| 13 | Lesson illustration hardcoded to 📊 | ✅ Fixed | `LESSON_EMOJIS` cycling array in `Home.jsx:16` |
| 14 | XP text duplicated on Result | ✅ Fixed | Static "+X XP" line removed; `XPDisplay` only |
| 15 | Progress bar ignores intro step | ✅ Fixed | Fractional `(activeIndex + 0.5)` offset when `lessonStep === 0` |
| 16 | Section card "SEDANG BELAJAR" for all levels | ✅ Fixed | `sectionLabel` computed: TERKUNCI / SELESAI / SEDANG BELAJAR |
| 17 | Dead import `getCompletedLessons` in Home | ✅ Fixed | Import updated to `{ LEVEL_NAMES, getStarsForLesson }` |
| 18 | Lesson header duplicated 3× | ✅ Fixed | `LessonHeader` component extracted; used in all 3 states |
| 19 | `pb-48` magic number | ✅ Fixed | Removed; chip zone now uses `flex-1 flex-col justify-center` |
| 20 | XP economy too slow | ✅ Improved | With `XP_PER_LESSON_COMPLETE`, ~16 XP/session → Level 2 in ~3 sessions |

---

## Previous New Issues (N1–N3) — Status Update

| # | Issue | Status |
|---|--------|--------|
| N1 | Level tabs flicker as locked on first load | ✅ Fixed |
| N2 | Leaderboard/Profile have no BottomNav | ✅ Fixed |
| N3 | Level gating silently fails if all-levels fetch errors | ✅ Fixed |

---

## New Issues — Found in This Audit (v3)

---

### A1. BottomNav: three tabs highlight simultaneously on /home — ✅ Fixed

**Fix applied**: `BottomNav.jsx` — "Pelajaran" and "Hadiah" tabs now have `path: null, disabled: true`. Active state is gated by `!disabled && location.pathname === path`, so only the true current route highlights. Disabled tabs render at `opacity-25` with `cursor-not-allowed` and `aria-disabled`.

---

### A2. "Pelajaran" and "Hadiah" nav tabs do nothing — ✅ Fixed

**Fix applied**: `BottomNav.jsx` — Both tabs have `disabled: true`. The `onClick` handler returns early if `disabled || !path`. `aria-label` reads `"${label} — segera hadir"`. Native `disabled` attribute prevents all clicks.

---

### A3. Profile chart data is entirely fabricated — ✅ Fixed

**Fix applied**: `gamification.js` — Added `DAILY_XP_KEY`, `recordDailyXp()` (called from `addXp()`), and `getWeeklyXp()` which returns real per-day XP from localStorage. `Profile.jsx` now imports `getWeeklyXp` and passes real data to `XPLineChart`. Fabricated constants removed.

---

### A4. Profile "Ikuti" and "Bagikan" buttons are dead — ✅ Fixed

**Fix applied**: `Profile.jsx` — "Ikuti" is now `disabled` with `aria-disabled="true"`, `opacity-50`, `cursor-not-allowed`, and a `title` tooltip. "Bagikan" has a real `handleShare()` wired to Web Share API with clipboard fallback and a toast confirmation.

---

### A5. Login.jsx contains English error strings — ✅ Fixed

**Fix applied**: `Login.jsx` — `'Enter your email'` → `'Masukkan email kamu'`; `'Login failed'` → `'Login gagal. Coba lagi.'`

---

### A6. No audio mute toggle — ✅ Fixed

**Fix applied**: `sounds.js` — Added `isMuted()`, `toggleMute()`, and `MUTE_KEY` constant. `tone()` now returns early if `isMuted()`. `Home.jsx` — Added mute button in header (🔊/🔕) wired to `handleToggleMute()` with `muted` state initialized from `isMuted()`.

---

### A7. `useGamificationStats.js` defines XP_KEY locally instead of importing it — ✅ Fixed

**Fix applied**: `gamification.js` — `XP_KEY` is now exported (`export const XP_KEY`). `useGamificationStats.js` — local `const XP_KEY` line removed; `XP_KEY` added to the import from `'../lib/gamification'`.

---

### A8. `trackAppOpen()` called redundantly in Login.jsx — ✅ Fixed

**Fix applied**: `Login.jsx` — `trackAppOpen()` call removed from `handleSubmit`. The entire `import { trackAppOpen } from '../tracking/events'` line removed (it was the only import from that module).

---

### A9. `Result.jsx` and `Lesson.jsx` have redundant `max-w-md mx-auto` — ✅ Fixed

**Fix applied**: `Result.jsx` — outer div class updated, `max-w-md mx-auto` removed. `Lesson.jsx` — all four state divs (loading, error, no-lesson, main quiz) updated, `max-w-md mx-auto` removed from each.

---

### A10. Profile uses redundant `getLevelName(xp)` call — ✅ Fixed

**Fix applied**: `Profile.jsx` rewritten. `levelName` is now destructured from `useGamificationStats()` directly (the hook already returns it). No separate `getLevelName()` import or call.

---

### A11. Profile uses `<div className="pb-20" />` spacer hack — ✅ Fixed

**Fix applied**: `Profile.jsx` — ghost `<div className="pb-20" />` removed. The outer container now has `pb-24` to keep content above the nav bar.

---

## Still Open from Previous Audit

All previously open issues (N1, N3) are now resolved. No issues remain open.

---

## v4 Post-Audit: New Issues Found (2026-03-29)

Code verification pass against all 10 source files. All v3 fixes confirmed present.
Three new issues found — one was a false alarm.

---

### B1. Lives display hardcoded — ✅ Fixed

**Root cause**: `Home.jsx` hardcoded `❤️ 3` — the number never changed regardless of wrong answers. No lives logic existed in `gamification.js`.

**Fix applied**:
- `gamification.js` — Added `LIVES_KEY`, `MAX_LIVES = 3`, `LIVES_UPDATED_EVENT`, `getLives()`, `deductLife()`, `resetLives()`
- `useGamificationStats.js` — Added `lives` to returned stats; listens to `LIVES_UPDATED_EVENT`
- `Home.jsx` — Replaced hardcoded `3` with `lives` from hook; `aria-label` now dynamic
- `Lesson.jsx` — Calls `deductLife()` on every wrong answer submission
- `Result.jsx` — Calls `resetLives()` on `handleContinue()` (lives fully restored after completing a session)

**Lives rules**:
| Event | Lives change |
|-------|-------------|
| Wrong answer in Lesson | −1 (floor 0) |
| Session complete (Result → Lanjut) | Reset to 3 |
| App first launch | Defaults to 3 |

> Note: 0 lives does not block lesson entry yet — display-only for now. Hard-blocking is a future improvement (B1-future).

---

### B2. XP double-counting — ✅ Not a bug (closed)

**Investigation**: Suspected `addXp()` was called twice — once in `Lesson.jsx` per correct answer and once in `Result.jsx`.

**Actual finding**: `Lesson.jsx` only updates local React state (`setSessionXp`). It never calls `addXp()`. `Result.jsx` is the sole committer via `addXp(xp)` in `handleContinue()`. XP is committed exactly once per session. No fix needed.

---

### B3. Leaderboard page is a stub — ⏳ Open (product gap)

**Finding**: `Leaderboard.jsx` renders a single "Segera Hadir" placeholder with no data. The backend has no `/leaderboard` API endpoint. This is a known product gap, not a bug.

**Plan when ready**:
1. Backend: Add `GET /leaderboard` returning top-N users sorted by XP
2. Frontend: Replace stub with ranked list (avatar, username, XP, level badge)
3. Requires user accounts to be tied to XP — currently XP lives in `localStorage` only

---

## Priority Fix Summary (all issues, ranked)

| # | Issue | Priority | Status |
|---|-------|----------|--------|
| A1 | 3 tabs active simultaneously on /home | 🟠 P1 | ✅ Fixed |
| A2 | "Pelajaran" + "Hadiah" tabs navigate nowhere | 🟠 P1 | ✅ Fixed |
| N1 | Level tabs flicker as locked on load | 🟠 P1 | ✅ Fixed — localStorage cache seeded after fetch |
| A3 | Profile weekly chart is fake data | 🟠 P1 | ✅ Fixed — real daily XP via `getWeeklyXp()` |
| A4 | Profile "Ikuti"/"Bagikan" are dead buttons | 🟠 P1 | ✅ Fixed — Ikuti disabled, Bagikan uses Web Share API |
| B1 | Lives hardcoded to 3, never deducts | 🟠 P1 | ✅ Fixed — lives tracked in localStorage, deducted on wrong answer, reset on session complete |
| A5 | Login.jsx English error strings | 🟡 P2 | ✅ Fixed |
| A6 | No audio mute toggle | 🟡 P2 | ✅ Fixed — header toggle + `isMuted()` guard in `tone()` |
| N3 | Level gating silently fails on API error | 🟡 P2 | ✅ Fixed — catch block no longer clears cached data |
| B2 | XP double-counting (suspected) | 🟡 P2 | ✅ Not a bug — `addXp()` called once in `Result.jsx` only |
| A7 | `XP_KEY` duplicated in useGamificationStats | 🔵 P3 | ✅ Fixed |
| A8 | `trackAppOpen` called redundantly in Login | 🔵 P3 | ✅ Fixed |
| A9 | `max-w-md` redundant in Result + Lesson | 🔵 P3 | ✅ Fixed |
| A10 | `getLevelName` redundant call in Profile | 🔵 P3 | ✅ Fixed |
| A11 | `<div pb-20 />` ghost spacer in Profile | 🔵 P3 | ✅ Fixed |
| B3 | Leaderboard is a stub, no backend API | 🔵 P3 | ⏳ Open — product gap, needs backend + user-linked XP |

---

## Remaining Known Gaps (not bugs)

| Gap | Notes |
|-----|-------|
| Lives block at 0 | Lives display shows 0 but lesson still starts — hard-block is a future improvement |
| Backend progress sync | All XP, streaks, stars, lives in `localStorage` — cleared if user switches device or clears storage |
| Daily reward feature | Replaced with "Fitur ini akan menyusul" placeholder — feature not built |
| "Pelajaran" / "Hadiah" tabs | Permanently disabled "segera hadir" — content not built |
| Leaderboard | Stub page, no backend — see B3 above |

---

## What's Working Well (v4)

- **Learning path map** — 3-state visual hierarchy (84/58/50px), pulse ring, "Mulai" CTA, opacity dimming on completed/locked nodes. Duolingo-level clarity.
- **Lesson quiz flow** — two-zone layout, reactive mascot (🎉/😅/🐂), speech bubble, instruction badge, chip word-bank, color-coded feedback panel, exit confirmation.
- **SVG landscape scenes** — inline SVG hero in Lesson + LessonIntro with hills, trees, sky gradient. Edge-to-edge, no external assets needed.
- **Sound design** — 10 distinct effects across all interactions (chip tap, submit, correct, wrong, complete, celebration, navigation, step advance, locked, launch). Web Audio API, no files, lazy init. Now with mute toggle persisted to localStorage.
- **Gamification core** — streak calendar math, XP counter, level thresholds, star persistence per lesson, daily XP tracking (rolling 30-day log), lives system (deducted on wrong answer, reset on session complete), all in localStorage with custom events for reactivity.
- **Responsive shell** — `App.jsx` green-gradient outer + `max-w-md` white card with `sm:shadow` ring. Works on desktop and mobile.
- **Glassmorphism BottomNav** — `bg-white/85 backdrop-blur-xl`, opacity-45 on inactive, active pill, safe-area inset support. Disabled tabs at opacity-25.
- **Result celebration screen** — gradient hero (green/blue based on score), star-pop animation, XP counter animation, confetti, correct fan-fare.
- **Animations** — `mascot-bounce`, `mascot-shake`, `pulse-ring`, `confetti-drift`, `star-pop`, `xp-reward-settle`, `lesson-fade` — all with `prefers-reduced-motion` fallbacks.
- **Accessibility** — `aria-label`, `aria-current`, `aria-disabled`, `role`, `aria-live`, `focus-visible` throughout. Screen-reader-safe.
- **Error + loading states** — every API call has retry UI; abort controllers on unmount.
- **Tracking** — `app_open`, `lesson_start`, `answer_click`, `lesson_complete` events with idle-callback scheduling.
- **Code quality** — clean separation of concerns (api/, lib/, hooks/, components/, pages/); `cn()` utility; no dead imports; consistent Tailwind v4 `@theme {}` tokens.
