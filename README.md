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
2. Adjust `DB_*`, `JWT_SECRET`, and optional `HTTP_ADDR` (default `:9001`).
3. The server loads the first file that exists: `.env` (when you run from `backend/`) or `backend/.env` (when you run from the repo root).

**Frontend** (`frontend/`)

1. Copy `frontend/.env.example` to `frontend/.env` or `frontend/.env.local`.
2. Leave `VITE_API_URL` unset in development to use the Vite proxy (`/api` → backend).
3. Set `VITE_API_URL` to a full API base URL when not using the proxy (e.g. deployed API).

**Gitignore**

* `.env` and `frontend/.env.local` are ignored; `*.env.example` files are safe to commit.
