# 📱 Gamified Investment Learning App

This project is a mobile-first application that teaches investment basics using gamification.

The name "Akademiweal" combines elements from different linguistic roots. "Akademi" is derived from the Greek word "Akademia," which refers to a place of learning or education, often associated with philosophical teachings. The second part, "weal," comes from Old English, meaning "well-being" or "prosperity." Together, "Akademiweal" suggests a place of learning focused on achieving financial well-being, aligning well with the project's goal of teaching investment basics through gamification.

## 🎯 Goal

Help beginners learn investment in 3 minutes per day through:

* Micro learning
* Gamification (XP, streak, level)
* Interactive quizzes

---

## 🤖 AI Agent Instructions

Before generating any code:

1. Read relevant docs based on task
2. Follow design system strictly
3. Prioritize simplicity (MVP first)
4. Do not over-engineer

---

## 📂 Docs Guide

* Product → `/docs/product.md`
* UX Flow → `/docs/ux-flow.md`
* Gamification → `/docs/gamification.md`
* Content → `/docs/content.md`
* Design → `/design/*`

---

## 🚀 Development Principle

* Build fast
* Validate with users
* Iterate based on retention

---

## Environment variables (`.env`)

**Backend** (`backend/`)

1. Copy `backend/.env.example` to `backend/.env`.
2. Configure Postgres with **`DB_HOST`**, **`DB_PORT`**, **`DB_USER`**, **`DB_PASSWORD`**, **`DB_NAME`**, **`DB_SSLMODE`** (remote Supabase typically needs **`require`**). If **`DB_HOST`** is omitted, **`DATABASE_URL`** is used when set (e.g. some CI setups).
3. Set **`JWT_SECRET`** and HTTP listen address: **`HTTP_HOST`** + **`HTTP_PORT`** (empty host = listen on all interfaces, port default `9001`). Optional legacy **`HTTP_ADDR`** (e.g. `:9001`) overrides host/port when set.
4. `main` loads `./.env` then overlays `backend/.env` so backend-specific values win.

**Frontend** (`frontend/`)

1. Copy `frontend/.env.example` to `frontend/.env` or `frontend/.env.local`.
2. For the dev server proxy, set **`VITE_API_HOST`** + **`VITE_API_PORT`**, or set **`VITE_API_PROXY_TARGET`** to a full URL (e.g. `https://api.example.com`) when the API is on a domain without a `:9001` port.
3. In development, the app calls `/api` (proxy); no need for `VITE_API_URL` unless you bypass the proxy.
4. For production builds, set **`VITE_API_URL`** to a full API base URL (e.g. `https://api…`), or set host/port so the client uses `http://HOST:PORT`, or leave host/port unset to keep same-origin `/api` behind your reverse proxy.

**Gitignore**

* `.env` and `frontend/.env.local` are ignored; `*.env.example` files are safe to commit.
