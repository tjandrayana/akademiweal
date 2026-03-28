-- lessons: quiz content per level. options is a JSON array of strings, e.g. ["A","B","C","D"].
CREATE TABLE IF NOT EXISTS lessons (
    id SERIAL PRIMARY KEY,
    level INTEGER NOT NULL,
    title TEXT NOT NULL,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    answer TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_lessons_level ON lessons (level);
