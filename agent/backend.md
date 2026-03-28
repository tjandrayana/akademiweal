# 🤖 Backend AI Agent Guidance (Golang + Chi + PostgreSQL)

## 🎯 Goal

Build a clean, scalable backend for a gamified investment learning app.

---

## 🧠 Architecture Principles

* Use clean architecture:

  * handler → service → repository → DB
* Keep logic in service layer
* Keep handler thin (only parsing + response)
* Avoid tight coupling

---

## 📁 Folder Structure

* `/internal/handler` → HTTP layer
* `/internal/service` → business logic
* `/internal/repository` → DB access
* `/internal/db` → connection

---

## 🗄️ Database Rules

* Use PostgreSQL
* Prefer simple queries over complex ORM
* Use JSONB only when needed (e.g. lesson options)
* Always index:

  * foreign keys
  * frequently queried fields

---

## 🔐 Auth Rules

* Use JWT
* Extract `user_id` in middleware
* Do not trust client input for user_id

---

## 🎮 Gamification Rules

* XP logic must be centralized (service layer)
* Streak must be based on time difference
* Never calculate XP on frontend

---

## 📊 Event Tracking

* Every important action must trigger an event:

  * app_open
  * lesson_start
  * lesson_complete
  * answer_correct
  * answer_wrong

* Events must be non-blocking (do not slow API)

---

## 🌐 API Design

* Use REST
* JSON only
* Standard response format:

```
{
  "data": {},
  "error": null
}
```

---

## ⚡ Performance Rules

* Avoid N+1 queries
* Keep handlers fast (<100ms)
* Use connection pooling

---

## 🧪 Development Rules

* Start with simple implementation
* Avoid premature optimization
* Write modular code (easy to refactor)

---

## ❌ Do NOT

* Do not mix DB logic in handler
* Do not hardcode values
* Do not over-engineer (no microservices)

---

## ✅ When Generating Code

Always:

1. Explain structure briefly
2. Keep functions small
3. Use clear naming
4. Follow existing patterns

---

## 🧠 Mindset

Prioritize:

* simplicity
* readability
* iteration speed

Over:

* perfection
* complexity
