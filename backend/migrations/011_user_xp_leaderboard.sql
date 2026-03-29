-- Server-side total XP for leaderboard and cross-device sync (client sends total; server uses GREATEST).
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS xp_total BIGINT NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_users_leaderboard ON users (xp_total DESC, id ASC);
