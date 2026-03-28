# Component Library — AkademiWeal

---

## Button

### Primary Button
```
Height:       56px
Radius:       12px
Background:   #22C55E
Text:         white, 16px, weight 700
Shadow:       0 4px 0 #16A34A  (gives "3D press" feel)
Padding:      0 24px
Active state: translateY(4px) + shadow removed (press down effect)
Width:        full-width (mobile default)
```

### Secondary Button
```
Height:       56px
Radius:       12px
Background:   white
Border:       2px solid #E5E7EB
Text:         #111827, 16px, weight 600
Active:       background #F3F4F6
```

### Ghost / Text Button
```
Height:       44px
Background:   transparent
Text:         #6B7280, 14px, weight 600
Usage:        "Skip", "Maybe later"
```

### Danger Button (Wrong answer feedback)
```
Background:   #EF4444
Shadow:       0 4px 0 #DC2626
Text:         white
```

---

## Card

### Base Card
```
Background:   white
Radius:       16px
Padding:      20px
Shadow:       shadow-sm
Border:       none
```

### Stat Card (XP / Streak / Coins)
```
Size:         flex-1, min 100px
Radius:       16px
Padding:      16px
Background:   white
Shadow:       shadow-sm
Content:
  - Icon (24px) in colored circle (40px)
  - Value (24px, weight 800)
  - Label (12px, #6B7280)
```

### Lesson Node Card (Map)
```
Shape:        64px × 64px circle
States:
  - completed: #22C55E background + star icon, white
  - current:   #22C55E with pulse ring animation + icon
  - locked:    #D1D5DB background + lock icon
Stars:        0–3 stars shown below node for completed
```

### Quiz Option Card
```
Height:       64px minimum
Radius:       12px
Border:       2px solid #E5E7EB
Background:   white
Text:         16px, weight 600, #111827
States:
  - selected (pending):  border #22C55E, bg #DCFCE7
  - correct:             border #22C55E, bg #DCFCE7 + check icon
  - incorrect:           border #EF4444, bg #FEE2E2 + x icon
  - unselected-wrong:    dim opacity 0.5
Active:       scale(0.98) on press
```

---

## Progress Bar

### Lesson Progress
```
Container:    full width, height 8px, bg #E5E7EB, radius 999px
Fill:         height 8px, bg #22C55E, radius 999px
Transition:   width 600ms ease-out
```

### XP Level Progress (Profile)
```
Container:    full width, height 12px, bg #E5E7EB, radius 999px
Fill:         gradient: #22C55E → #86EFAC
Label:        "X / Y XP" shown above right
```

### Circular Progress (Streak / Daily goal)
```
Size:         64px
Stroke:       6px
Track:        #E5E7EB
Fill:         #F59E0B (gold for streak)
Center:       icon or number
```

---

## Badge / Chip

### XP Badge
```
Bg:           #FEF3C7
Text:         #92400E, 12px, weight 700
Icon:         ⭐ 14px
Radius:       999px
Padding:      4px 8px
```

### Streak Badge
```
Bg:           #FFF7ED
Text:         #9A3412, 12px, weight 700
Icon:         🔥 14px
Radius:       999px
Padding:      4px 8px
```

### Level Badge
```
Bg:           #EEF2FF
Text:         #3730A3, 12px, weight 700
Icon:         ⚡ 14px
Radius:       999px
Padding:      4px 8px
```

### Correct/Incorrect Banner (Feedback)
```
Position:     fixed bottom, above keyboard safe area
Height:       auto, padding 16px 20px
Correct bg:   #DCFCE7
Correct text: #15803D, 16px, weight 700
Incorrect bg: #FEE2E2
Incorrect text: #DC2626, 16px, weight 700
Contains:     icon + message + "Continue" button
Animation:    slide up 300ms
```

---

## Header

### Lesson Header
```
Height:       56px
Contents:
  Left:   X close button (24px, #6B7280)
  Center: ProgressBar (flex-grow)
  Right:  Lives display (❤️ × 3) or XP badge
Padding:  16px horizontal
```

### Screen Header
```
Height:       56px
Contents:
  Left:   Back arrow (optional) or avatar
  Center: Title (h2, centered)
  Right:  Notification bell or streak badge
Padding:  16px horizontal
```

---

## Avatar / Profile Ring

```
Size:         56px (small), 80px (large)
Shape:        circle
Border:       3px solid #22C55E (has streak) / #E5E7EB (no streak)
Ring glow:    0 0 0 4px #DCFCE7 when active streak
```

---

## XP Gain Popup

```
Trigger:      after correct answer or lesson complete
Position:     floats up from answer, fades out
Content:      "+10 XP" or "+2 XP"
Style:        gold color, bold, scale bounce → float up → fade out
Duration:     800ms total
```

---

## Bottom Sheet (Modal)

```
Overlay:      rgba(0,0,0,0.4)
Sheet bg:     white
Radius:       24px 24px 0 0
Drag handle:  4px × 32px, #D1D5DB, centered top
Padding:      24px
Animation:    slide up 300ms ease-out
```

---

## Empty State

```
Illustration: Weal mascot (sad/sleeping, 120px)
Title:        h2
Subtitle:     body, #6B7280
CTA:          Primary Button
Centered layout
```

---

## Skeleton Loader

```
Color:        #F3F4F6 → #E5E7EB (shimmer)
Radius:       matches component
Animation:    shimmer 1.5s loop
Use:          only for API-dependent content
```
