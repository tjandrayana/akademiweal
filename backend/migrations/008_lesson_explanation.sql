-- Optional short explanation after a wrong answer (learning feedback).
ALTER TABLE lessons
  ADD COLUMN IF NOT EXISTS explanation TEXT;
