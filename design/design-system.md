# Design System — AkademiWeal

**Style direction**: Playful + trustworthy. Duolingo's gamified energy meets a clean financial dashboard. Warm, encouraging, never intimidating.

---

## Color Tokens

### Primary Palette

| Token | Hex | Usage |
|---|---|---|
| `primary` | `#22C55E` | CTA buttons, progress fill, correct answer, active nav |
| `primary-dark` | `#16A34A` | Button press state, active border |
| `primary-light` | `#DCFCE7` | Correct answer background, success banner |

### Secondary Palette (Financial / Reward)

| Token | Hex | Usage |
|---|---|---|
| `gold` | `#F59E0B` | XP badges, streak flame, gold level icons |
| `gold-light` | `#FEF3C7` | XP badge background, highlight cards |
| `indigo` | `#6366F1` | Level badges (locked), premium features |
| `indigo-light` | `#EEF2FF` | Premium card background |

### Semantic Colors

| Token | Hex | Usage |
|---|---|---|
| `success` | `#22C55E` | Correct answer feedback |
| `error` | `#EF4444` | Wrong answer feedback, lives lost |
| `error-light` | `#FEE2E2` | Wrong answer background |
| `warning` | `#F97316` | Streak warning (last chance) |
| `neutral-50` | `#F9FAFB` | Page background |
| `neutral-100` | `#F3F4F6` | Card alt background, input bg |
| `neutral-200` | `#E5E7EB` | Dividers, borders |
| `neutral-500` | `#6B7280` | Secondary text, placeholder |
| `neutral-900` | `#111827` | Primary text |

### Gradient (Map / Hero backgrounds)

```
Learning Map BG: linear-gradient(180deg, #86EFAC 0%, #DCFCE7 60%, #F0FDF4 100%)
Onboarding BG:   linear-gradient(160deg, #FFF7ED 0%, #FEF3C7 100%)
Reward BG:       linear-gradient(160deg, #DCFCE7 0%, #D1FAE5 100%)
```

---

## Typography

**Font**: `Nunito` — rounded, friendly, excellent for mobile readability.
Fallback: `system-ui, -apple-system, sans-serif`

| Role | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| `display` | 28px | 800 | 1.2 | Onboarding hero titles |
| `h1` | 24px | 700 | 1.3 | Screen titles |
| `h2` | 20px | 700 | 1.3 | Section headers |
| `h3` | 18px | 600 | 1.4 | Card titles, question text |
| `body-lg` | 16px | 400 | 1.5 | Lesson content, options |
| `body` | 14px | 400 | 1.5 | Body copy, labels |
| `caption` | 12px | 500 | 1.4 | Metadata, badges |
| `label` | 12px | 700 | 1 | ALL CAPS labels, tab labels |

---

## Spacing (8px grid)

| Token | Value | Usage |
|---|---|---|
| `space-1` | 4px | Icon gaps, tiny nudges |
| `space-2` | 8px | Between label and value |
| `space-3` | 12px | Icon + text in badge |
| `space-4` | 16px | Standard component padding |
| `space-5` | 20px | Card internal padding |
| `space-6` | 24px | Section gap |
| `space-8` | 32px | Large section gap |
| `space-10` | 40px | Screen section gap |
| `space-12` | 48px | Hero spacing |

---

## Border Radius

| Token | Value | Usage |
|---|---|---|
| `radius-sm` | 8px | Small chips, tags |
| `radius-md` | 12px | Buttons, input fields |
| `radius-lg` | 16px | Cards, modals |
| `radius-xl` | 24px | Bottom sheets, large cards |
| `radius-full` | 999px | Badges, avatars, pills |

---

## Elevation / Shadow

| Level | CSS | Usage |
|---|---|---|
| `shadow-sm` | `0 1px 3px rgba(0,0,0,0.08)` | Cards at rest |
| `shadow-md` | `0 4px 12px rgba(0,0,0,0.10)` | Floating cards, bottom nav |
| `shadow-lg` | `0 8px 24px rgba(0,0,0,0.12)` | Modals, bottom sheets |

---

## Iconography

- Library: **Phosphor Icons** (rounded style, consistent weight)
- Size: 24px for nav, 20px for inline, 16px for badges
- Stroke weight: `regular` for UI, `bold` for CTAs
- Custom: Use emoji-style colored SVG icons for streak (🔥), XP (⭐), coins (💰)

---

## Mascot — "Weal" the Bull Calf

A friendly, baby bull character in green/gold palette.
- Expresses: happy (correct answer), curious (lesson), celebrating (level up), sleeping (missed streak)
- Used on: onboarding, reward screens, empty states
- Size: 120–160px on hero, 48px on small cards
- Do NOT use on every screen — reserve for emotional moments

---

## Motion & Animation

| Type | Duration | Easing | Usage |
|---|---|---|---|
| Micro-feedback | 150ms | ease-out | Button tap, option select |
| Screen transition | 300ms | ease-in-out | Page slide |
| XP pop-up | 400ms | spring(1, 80, 10) | XP gain animation |
| Progress fill | 600ms | ease-out | Progress bar update |
| Confetti burst | 800ms | ease-out | Lesson complete, level up |
| Scale bounce | 200ms | spring | Correct answer card |

Rules:
- All transitions: `transform` and `opacity` only (GPU-composited)
- Never animate `height`, `width`, or `margin`
- Reduce motion: respect `prefers-reduced-motion`

---

## Bottom Navigation

5 tabs, icon + label:

| Tab | Icon | Label |
|---|---|---|
| Home | house | Belajar |
| Lessons | book-open | Pelajaran |
| Leaderboard | trophy | Peringkat |
| Rewards | star | Hadiah |
| Profile | user | Profil |

- Height: 64px + safe area
- Active tab: `primary` color icon + bold label + subtle green underline pill
- Inactive: `neutral-500`
- Center button (ADD-style): not used in MVP
