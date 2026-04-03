-- Add source reference column for lesson citations.
-- Nullable; existing lessons have no source attached.
ALTER TABLE lessons
  ADD COLUMN IF NOT EXISTS source_reference TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS insight TEXT;
