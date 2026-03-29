ALTER TABLE users
    ADD COLUMN IF NOT EXISTS password_hash TEXT;

COMMENT ON COLUMN users.password_hash IS 'bcrypt hash; NULL for legacy email-only accounts until claimed via register';
