# Design Files — AkademiWeal

## Quick Reference

| File | What it covers |
|---|---|
| `design-system.md` | Colors, typography, spacing, motion, mascot |
| `components.md` | All reusable UI components with full specs |
| `screens/onboarding.md` | 4-screen onboarding flow |
| `screens/home.md` | Learning map + stats + daily reward |
| `screens/lesson.md` | Full lesson flow (hook → quiz → reward) |
| `screens/reward.md` | Lesson complete + XP + level-up modal |
| `screens/profile.md` | User stats, achievements, weekly chart |
| `screens/leaderboard.md` | Weekly XP ranking, podium, user rank |

## Design Principles (non-negotiable)

1. **One screen, one purpose** — never crowd two tasks on one screen
2. **Feedback is instant** — no tap should go without visual response within 100ms
3. **Progress is always visible** — XP, streak, lesson progress shown at all times
4. **Green = right, red = wrong** — consistent and universal across all quiz screens
5. **Mobile-first tap targets** — minimum 48px height for all interactive elements
6. **Mascot for emotion** — Weal appears only at emotional peaks (reward, error, level-up)

## Color Quick Reference

```
Primary (Green):  #22C55E
Gold (XP/Streak): #F59E0B
Background:       #F9FAFB
Card BG:          #FFFFFF
Text Primary:     #111827
Text Secondary:   #6B7280
Error (Red):      #EF4444
```

## Key Measurements

```
Button height:    56px
Nav height:       64px
Card radius:      16px
Button radius:    12px
Base padding:     16px
Grid unit:        8px
```
