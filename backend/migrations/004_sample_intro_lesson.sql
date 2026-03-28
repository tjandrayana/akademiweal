-- Sample lesson: level 1. options is JSONB; answer TEXT must exactly match one option string (see repository.Lesson).
INSERT INTO lessons (level, title, question, options, answer)
SELECT
  1,
  'Intro Investasi',
  'Apa itu investasi?',
  '["Menabung","Mengembangkan uang","Belanja"]'::jsonb,
  'Mengembangkan uang'
WHERE NOT EXISTS (
  SELECT 1 FROM lessons WHERE level = 1 AND title = 'Intro Investasi'
);
