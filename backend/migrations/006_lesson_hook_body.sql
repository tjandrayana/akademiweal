-- Optional hook + micro content before quiz (see docs/content.md lesson format).
ALTER TABLE lessons
  ADD COLUMN IF NOT EXISTS hook TEXT,
  ADD COLUMN IF NOT EXISTS body TEXT;
