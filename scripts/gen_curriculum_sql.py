#!/usr/bin/env python3
"""Emit backend/migrations/015_seed_curriculum_zones_json.sql from assets/curriculum_zones_1_10_id.json."""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
JSON_PATH = ROOT / "assets" / "curriculum_zones_1_10_id.json"
OUT_PATH = ROOT / "backend" / "migrations" / "015_seed_curriculum_zones_json.sql"


def esc(s: str) -> str:
    return str(s).replace("'", "''")


def main() -> None:
    data = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    lines = [
        "-- Loads curriculum from assets/curriculum_zones_1_10_id.json (100 rows, zone → level).",
        "-- Requires: 014_lesson_insight.sql. Replaces all lessons.",
        "-- Regenerate: python3 scripts/gen_curriculum_sql.py",
        "",
        "TRUNCATE lessons RESTART IDENTITY CASCADE;",
        "",
    ]
    for row in data:
        opts = json.dumps(row["options"], ensure_ascii=False)
        vals = [
            str(row["id"]),
            str(row["zone"]),
            f"'{esc(row['title'])}'",
            f"'{esc(row['question'])}'",
            f"'{esc(opts)}'::jsonb",
            f"'{esc(row['answer'])}'",
            f"'{esc(row['hook'])}'",
            f"'{esc(row['body'])}'",
            f"'{esc(row['explanation'])}'",
            f"'{esc(row['insight'])}'",
        ]
        lines.append(
            "INSERT INTO lessons (id, level, title, question, options, answer, hook, body, explanation, insight) VALUES ("
            + ", ".join(vals)
            + ");"
        )
    lines.append("")
    lines.append(
        "SELECT setval(pg_get_serial_sequence('lessons', 'id'), (SELECT COALESCE(MAX(id), 1) FROM lessons));"
    )
    OUT_PATH.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {OUT_PATH}")


if __name__ == "__main__":
    main()
