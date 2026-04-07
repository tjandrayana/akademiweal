# AkademiWeal — Session Notes

## Conversation Log

### Date: 2026-04-03

---

### User
> Please change the "Aksi" to be data from source_reference

### Claude
Replaced the static "Aksi" card in `LessonIntro.jsx` with a dynamic card that shows `source_reference` data (📚 Sumber label, warm tan style) when available, falling back to the green Aksi card if no source exists. Also removed the duplicate standalone citation block below the cards.

---

### User
> Why still no source shown in the Lesson UI? And the "Aksi" still there

### Claude
Root cause: backend `Lesson` struct and SQL query did not include `source_reference`. Fixed:
- Added `SourceReference *string` to Go `Lesson` struct with `json:"source_reference,omitempty"`
- Added `source_reference` to `lessonSelectByLevel` SQL query
- Added `sourceRefNS sql.NullString` to row scan
- Ran migration `016_lesson_source_reference.sql` (column already existed)
- Ran migration `017_seed_new_curriculum.sql` — 100 lessons seeded successfully

---

### User
> When I want to run the SQL @migrations/017_seed_new_curriculum.sql in the production I got error: column "insight" does not exist

### Claude
Production DB was missing migrations 014 (insight) and 016 (source_reference). Made `017` self-contained by prepending:
```sql
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS insight TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS source_reference TEXT;
```

---

### User
> Can you take a look into @../notetaking/summary-2026-03-29.md what can be implemented now?

### Claude
Audited the backlog. Ranked items by effort:
- 🟢 Easy: User name in HUD (email local-part from JWT or /me), Logout UI, shared unlock path constant
- 🟡 Medium: "Your rank" on leaderboard (needs backend rank query), Guest lock UX on Pelajaran list
- 🔴 Deferred: Server-side completion persistence, two-device XP mismatch, rate limits, password reset

---

### User
> Please take a look into @migrations/. Help to audit the SQL files, if not relate anymore please delete it

### Claude
Audited 17 migration files. Deleted 6 obsolete seed files whose data was wiped by subsequent `TRUNCATE` statements:
- `004_sample_intro_lesson.sql`
- `007_seed_curriculum.sql`
- `009_lesson_explanations_sample.sql`
- `010_map_80_lessons.sql`
- `013_backfill_lesson_explanations.sql`
- `015_seed_curriculum_zones_json.sql`

Kept 12 files: all schema migrations + active curriculum seed (017).

---

### User
> You are a Senior Fullstack Software Engineer with senior UI/UX skills. Please take a look the prototype in @../assets/phase-2/akademiweal_full_prototype.html then create a plan for implementation.

### Claude
See Phase 2 implementation plan below.

---

## Phase 2 — Stock Feed + AI Analysis: Implementation Plan

### What the prototype shows

| Screen | Purpose |
|--------|---------|
| **Feed** | Daily IDX stock cards with price, % change, AI snippet. Free limit: 3 analyses/day |
| **Stock Detail** | AI summary, key indicators (P/E, Volume, Mkt Cap), learning quiz tied to today's movement |
| **Quests & Progress** | Enhanced gamification — missions, badges, leaderboard with user's own rank shown |
| **Premium** | Freemium upgrade page: Rp 30.000/month, brokerage referral (free month), B2B white-label |

### Core insight: Extend, don't rebuild

The current app already has auth, XP, streaks, leaderboard, bottom nav, and mascot. Phase 2 **adds a Feed tab** on top of the existing structure. Nothing gets replaced — Phase 1 (learning path) becomes "Belajar", Phase 2 becomes "Feed".

---

### Architecture decisions

#### 1. Stock data source
- **MVP**: Manually curated daily JSON or simple scheduled scrape from Yahoo Finance (`finance.yahoo.com/quote/BBCA.JK`)
- **v2**: Real-time feed via Alpha Vantage free tier or IDX official API
- **Key**: Store in DB as `stock_daily_snapshots` — don't call external API on every user request

#### 2. AI summaries
- Scheduled Go cron job runs after market close (~16:30 WIB)
- Calls Claude API (`claude-sonnet-4-6`) per stock with: price change, volume, news context → returns `summary` + `quiz_question` + `quiz_options` + `quiz_answer` + `quiz_explanation`
- Stored in `stock_daily_snapshots` table — zero latency on user request

#### 3. Quiz system
- Reuse existing lesson/quiz UI pattern (already polished with A/B/C/D, feedback, XP)
- Each stock gets one quiz per day, tied to the daily snapshot
- XP reward: 25 XP per correct answer (matches prototype)

#### 4. Usage limits
- `daily_usage` table: `(user_id, date, count)` — incremented on each stock detail open
- Free tier: 3/day. Enforced server-side on `GET /stocks/:code/today`
- Premium: unlimited

#### 5. Freemium / subscription
- Add `plan TEXT DEFAULT 'free'` column to `users` table
- For MVP: manual upgrade (admin SQL) or simple promo code system
- v2: Midtrans payment gateway (most common in Indonesia)

---

### Database schema (new tables)

```sql
-- Static stock registry
CREATE TABLE stocks (
  code TEXT PRIMARY KEY,          -- 'BBCA', 'BBRI'
  name TEXT NOT NULL,             -- 'Bank Central Asia'
  sector TEXT,
  is_premium BOOLEAN DEFAULT FALSE -- locked for free users
);

-- Daily market snapshot + AI content (one row per stock per day)
CREATE TABLE stock_daily_snapshots (
  id BIGSERIAL PRIMARY KEY,
  stock_code TEXT REFERENCES stocks(code),
  snapshot_date DATE NOT NULL,
  price_close NUMERIC(12,2),
  price_change_pct NUMERIC(6,2),
  volume_vs_avg_pct NUMERIC(6,2),
  market_cap_label TEXT,          -- 'Rp1.175T'
  pe_ratio TEXT,                  -- '24.3x'
  ai_summary TEXT,
  quiz_question TEXT,
  quiz_options JSONB,             -- ["opt A", "opt B", "opt C"]
  quiz_correct_index INT,
  quiz_explanation TEXT,
  generated_at TIMESTAMPTZ,
  UNIQUE(stock_code, snapshot_date)
);

-- Per-user daily usage counter
CREATE TABLE daily_usage (
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  usage_date DATE NOT NULL,
  analysis_count INT DEFAULT 0,
  PRIMARY KEY (user_id, usage_date)
);

-- Missions definitions + user progress
CREATE TABLE missions (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,       -- 'weekly_analyst', 'perfect_quiz'
  title TEXT NOT NULL,
  description TEXT,
  target_count INT NOT NULL,
  xp_reward INT NOT NULL,
  reset_period TEXT               -- 'weekly', 'daily', 'once'
);

CREATE TABLE user_mission_progress (
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  mission_id INT REFERENCES missions(id),
  current_count INT DEFAULT 0,
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, mission_id)
);
```

---

### Backend new endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/stocks/feed` | Today's stock list (code, name, price, change, snippet). Respects free/premium |
| `GET` | `/stocks/:code/today` | Full detail: AI summary, indicators, quiz. Increments daily_usage |
| `POST` | `/stocks/:code/quiz` | Submit quiz answer → returns XP, explanation |
| `GET` | `/me/missions` | User's active missions + progress |
| `GET` | `/me/rank` | User's rank on leaderboard |

---

### Frontend new pages & components

| File | Type | Description |
|------|------|-------------|
| `src/pages/Feed.jsx` | Page | Stock feed list. Daily limit bar. Premium upsell at bottom |
| `src/pages/StockDetail.jsx` | Page | AI summary, key metrics grid, quiz widget |
| `src/pages/Premium.jsx` | Page | Plan comparison, referral CTA, B2B section |
| `src/components/StockCard.jsx` | Component | Reusable card: code, name, price, % badge, snippet |
| `src/components/StockQuiz.jsx` | Component | Quiz widget (reuse Lesson.jsx pattern) |
| `src/components/MissionCard.jsx` | Component | Mission progress bar card |
| `src/hooks/useStockFeed.js` | Hook | Fetch + cache daily feed |

**Bottom nav change**: Replace disabled "Hadiah" tab with "Feed" (📈 icon), pointing to `/feed`.

---

### Phased rollout

#### Phase 2A — MVP (ship first)
1. Static stock data (5 IDX blue chips hardcoded or from JSON)
2. Feed page + stock detail page with static AI summaries
3. Quiz per stock (reuse lesson quiz UI)
4. Daily usage limit (3 free / day) enforced server-side
5. "Feed" tab in bottom nav
6. User rank shown on Leaderboard page (`GET /me/rank`)

#### Phase 2B — AI-powered
7. Cron job: fetch Yahoo Finance prices + call Claude API → populate `stock_daily_snapshots`
8. 50+ IDX stocks
9. Premium page with plan comparison
10. Missions system (weekly analyst, perfect quiz streak)

#### Phase 2C — Monetization
11. Midtrans payment integration
12. Brokerage referral tracking (Ajaib deeplink + webhook)
13. B2B white-label inquiry form
14. Technical indicators (RSI, MACD) for premium users

---

### Reuse map from Phase 1

| Phase 1 | Reused in Phase 2 |
|---------|------------------|
| Auth (JWT, login/register) | ✅ Identical |
| XP system (`addXp`, `getTotalXp`) | ✅ Stock quiz grants XP |
| Streak (`recordDailyStreak`) | ✅ Feed visit counts as daily activity |
| Leaderboard (`GET /leaderboard`) | ✅ Same table, add rank endpoint |
| Mascot evolution | ✅ Shows on Feed HUD |
| Lesson quiz UI pattern | ✅ `StockQuiz` is a simplified `Lesson.jsx` |
| `Button`, `XPDisplay`, `BottomNav` | ✅ All reused |

---

---

### Date: 2026-04-04

---

### User
> Please help to add simulation date picker — default H-1 but user can pick from dates in DB.

### Claude
- Added `GET /stocks/{code}/sim-dates` backend endpoint (repository → service → handler → route)
- `GetAvailableDates` query: DISTINCT dates from `stock_minute_bars`, excludes today (WIB), newest-first, limit 30
- Frontend: `fetchSimDates()` in `arena.js`; `ArenaStock.jsx` loads date chips on mount; shimmer skeleton during load; "Mulai Simulasi" disabled until date selected

---

### User
> Error in browser console: ArenaStock.jsx:87 — duplicate key `6575`

### Claude
Fixed: `yTicks.map(({ price }) => <span key={price}>` changed to `key={i}` (index). Root cause: when chart has only one bar, `maxP = midP = minP = 6575` → three children with same key.

---

### User
> Professor audit: review app connectivity (home, feed, arena). Honest, detailed, critical. Write to fins-prof-audit-2026-04-04.md.

### Claude
Full audit written to `notetaking/fins-prof-audit-2026-04-04.md`. Overall grade: C+ (potential A). Key finding: three excellent pillars with no corridors between them. Five prioritized improvements: (1) Feed→Arena deep link, (2) Arena debrief screen, (3) Lesson→Feed bridge, (4) Arena daily mission, (5) Quiz→Lesson backlink.

---

## Summary Table

| Area | Status |
|------|--------|
| LessonIntro source_reference card | ✅ Done |
| Backend source_reference field | ✅ Done |
| Migration 017 self-contained for production | ✅ Done |
| Obsolete migration cleanup (6 files deleted) | ✅ Done |
| Phase 2 implementation plan | ✅ Documented |
| Sim date picker (DB-driven chips) | ✅ Done |
| Duplicate key bug fix (ArenaStock yTicks) | ✅ Done |
| Professor audit (fins-prof-audit-2026-04-04.md) | ✅ Done |
| Feed → Arena deep link ("Simulasikan Saham Ini") | 🔲 Priority 1 |
| Arena debrief screen (P&L + annotated chart + lesson link) | 🔲 Priority 2 |
| Lesson → Feed contextual bridge | 🔲 Priority 3 |
| Arena daily mission | 🔲 Priority 4 |
| Quiz → Lesson backlink | 🔲 Priority 5 |
| User name in HUD | 🔲 Next (easy) |
| Logout UI | 🔲 Next (easy) |
| User rank on leaderboard | 🔲 Next (medium) |
| Language register consistency (kamu vs Anda) | 🔲 Polish |
| Design token migration | 🔲 Polish |
| Onboarding tour (3 screens) | 🔲 Polish |
| Phase 2A MVP build | 🔲 Planned |
