-- Short takeaway for intro strip / “Tahukah kamu?” style copy (nullable).
ALTER TABLE lessons
  ADD COLUMN IF NOT EXISTS insight TEXT;
