// gen_curriculum_sql reads assets/curriculum_zones_1_10_id.json and writes
// backend/migrations/015_seed_curriculum_zones_json.sql.
//
// Usage (from repo root):
//
//	cd backend && go run ./cmd/gen_curriculum_sql/
//	cd backend && go run ./cmd/gen_curriculum_sql/ --json ../assets/my.json --out ../backend/migrations/015.sql
package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"runtime"
	"strings"
)

// Lesson mirrors one row in the curriculum JSON.
type Lesson struct {
	ID          int             `json:"id"`
	Zone        int             `json:"zone"`
	Title       string          `json:"title"`
	Question    string          `json:"question"`
	Options     json.RawMessage `json:"options"` // already a JSON array
	Answer      string          `json:"answer"`
	Hook        string          `json:"hook"`
	Body        string          `json:"body"`
	Explanation string          `json:"explanation"`
	Insight     string          `json:"insight"`
}

// esc escapes a string for use inside a single-quoted SQL literal.
func esc(s string) string {
	return strings.ReplaceAll(s, "'", "''")
}

// repoRoot walks up from this source file's directory to find the repo root
// (identified by the presence of a "backend" subdirectory).
// Falls back to "../../.." relative to the binary if the source is unavailable.
func repoRoot() string {
	_, file, _, ok := runtime.Caller(0)
	if !ok {
		// Fallback: assume binary is at backend/cmd/gen_curriculum_sql/
		ex, _ := os.Executable()
		return filepath.Join(filepath.Dir(ex), "..", "..", "..")
	}
	// file = .../backend/cmd/gen_curriculum_sql/main.go → up 3 levels = repo root
	return filepath.Join(filepath.Dir(file), "..", "..", "..")
}

func main() {
	root := repoRoot()

	jsonPath := flag.String("json", filepath.Join(root, "assets", "curriculum_zones_1_10_id.json"), "path to curriculum JSON")
	outPath := flag.String("out", filepath.Join(root, "backend", "migrations", "015_seed_curriculum_zones_json.sql"), "output SQL file path")
	flag.Parse()

	data, err := os.ReadFile(*jsonPath)
	if err != nil {
		log.Fatalf("read json: %v", err)
	}

	var lessons []Lesson
	if err := json.Unmarshal(data, &lessons); err != nil {
		log.Fatalf("parse json: %v", err)
	}

	var sb strings.Builder
	sb.WriteString("-- Loads curriculum from assets/curriculum_zones_1_10_id.json (100 rows, zone → level).\n")
	sb.WriteString("-- Requires: 014_lesson_insight.sql. Replaces all lessons.\n")
	sb.WriteString("-- Regenerate: cd backend && go run ./cmd/gen_curriculum_sql/\n")
	sb.WriteString("\n")
	sb.WriteString("TRUNCATE lessons RESTART IDENTITY CASCADE;\n")
	sb.WriteString("\n")

	for _, l := range lessons {
		// Options: re-encode the raw JSON as a single-quoted JSONB literal.
		optJSON, err := json.Marshal(json.RawMessage(l.Options))
		if err != nil {
			log.Fatalf("encode options for lesson %d: %v", l.ID, err)
		}

		sb.WriteString(fmt.Sprintf(
			"INSERT INTO lessons (id, level, title, question, options, answer, hook, body, explanation, insight) VALUES (%d, %d, '%s', '%s', '%s'::jsonb, '%s', '%s', '%s', '%s', '%s');\n",
			l.ID,
			l.Zone,
			esc(l.Title),
			esc(l.Question),
			esc(string(optJSON)),
			esc(l.Answer),
			esc(l.Hook),
			esc(l.Body),
			esc(l.Explanation),
			esc(l.Insight),
		))
	}

	sb.WriteString("\n")
	sb.WriteString("SELECT setval(pg_get_serial_sequence('lessons', 'id'), (SELECT COALESCE(MAX(id), 1) FROM lessons));\n")

	if err := os.WriteFile(*outPath, []byte(sb.String()), 0o644); err != nil {
		log.Fatalf("write sql: %v", err)
	}

	log.Printf("wrote %d lessons → %s", len(lessons), *outPath)
}
