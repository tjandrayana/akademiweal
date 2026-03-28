# 🤖 Frontend AI Agent Guidance (Vite + React)

## 🎯 Goal

Build a mobile-first, gamified learning UI with high engagement and simplicity.

---

## 🧠 UX Principles

* One screen = one purpose
* Large tap targets (mobile-first)
* Immediate feedback (no delay)
* Visible progress at all times

---

## 🎨 Design Rules

* Use consistent spacing (8px grid)
* Rounded UI (12–16px radius)
* Minimal layout (no clutter)
* Friendly tone

---

## 📁 Structure

* `/components` → reusable UI
* `/pages` → screens
* `/hooks` → logic (optional)

---

## 🧱 Component Rules

Always reuse components:

* Button
* Card
* ProgressBar

Do not duplicate UI logic.

---

## 🎮 Gamification UX

* Show XP gain after every action
* Use color feedback:

  * green = correct
  * red = wrong
* Animate success (simple scale / fade)

---

## 🔄 State Management

* Use local state (useState) for MVP
* Keep state minimal
* Avoid complex global state early

---

## 🔐 Auth Handling

* Store token in localStorage
* Attach token to all API calls
* Handle unauthorized gracefully

---

## 📊 Event Tracking

Trigger tracking on:

* app open
* lesson start
* answer click
* lesson complete

Tracking must NOT block UI.

---

## 📡 API Rules

* Always handle loading state
* Always handle error state
* Do not assume API success

---

## ⚡ Performance

* Keep components small
* Avoid unnecessary re-render
* Lazy load when needed

---

## 🎯 UX Details (Critical)

### Lesson Screen:

* Progress bar always visible
* Question centered
* Options large and clickable

### Home Screen:

* Show streak + XP clearly
* Learning path simple

---

## ❌ Do NOT

* Do not create complex layouts
* Do not use tiny buttons
* Do not delay feedback

---

## ✅ When Generating UI

Always:

1. Follow design system
2. Keep layout clean
3. Use reusable components
4. Prioritize mobile UX

---

## 🧠 Mindset

Focus on:

* engagement
* clarity
* speed

Over:

* fancy UI
* unnecessary features
