package repository

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"
)

// Lesson is a row from the lessons table.
type Lesson struct {
	ID          int64    `json:"id"`
	Level       int      `json:"level"`
	Title       string   `json:"title"`
	Question    string   `json:"question"`
	Options     []string `json:"options"`
	Answer      string   `json:"answer"`
	Hook        *string  `json:"hook,omitempty"`
	Body        *string  `json:"body,omitempty"`
	Explanation *string  `json:"explanation,omitempty"`
}

const lessonSelectByLevel = `
SELECT id, level, title, question, options, answer, hook, body, explanation
FROM lessons
WHERE level = $1
ORDER BY id
`

func retryableLessonReadErr(err error) bool {
	if err == nil || errors.Is(err, context.Canceled) {
		return false
	}
	s := strings.ToLower(err.Error())
	return strings.Contains(s, "timeout") ||
		strings.Contains(s, "connection") ||
		strings.Contains(s, "broken pipe") ||
		strings.Contains(s, "reset") ||
		strings.Contains(s, "eof") ||
		strings.Contains(s, "bad connection") ||
		strings.Contains(s, "conn busy") ||
		strings.Contains(s, "try again") ||
		strings.Contains(s, "temporary failure")
}

// GetLessonsByLevel returns all lessons for the given level.
// options JSONB is unmarshaled into []string.
func (r *Repository) GetLessonsByLevel(ctx context.Context, level int) ([]Lesson, error) {
	if r == nil || r.db == nil || r.db.Pool == nil {
		return nil, fmt.Errorf("repository: database not initialized")
	}

	var lastErr error
	for attempt := 0; attempt < 2; attempt++ {
		if attempt > 0 {
			select {
			case <-ctx.Done():
				return nil, ctx.Err()
			case <-time.After(50 * time.Millisecond):
			}
		}
		list, err := r.queryLessonsByLevel(ctx, level)
		if err == nil {
			return list, nil
		}
		lastErr = err
		if errors.Is(err, context.Canceled) {
			return nil, err
		}
		if !retryableLessonReadErr(err) {
			return nil, err
		}
	}
	return nil, lastErr
}

func (r *Repository) queryLessonsByLevel(ctx context.Context, level int) ([]Lesson, error) {
	rows, err := r.db.Pool.Query(ctx, lessonSelectByLevel, level)
	if err != nil {
		return nil, fmt.Errorf("repository: query lessons by level: %w", err)
	}
	defer rows.Close()

	var out []Lesson
	for rows.Next() {
		var (
			lesson      Lesson
			optionsJSON []byte
			hookNS      sql.NullString
			bodyNS      sql.NullString
			explainNS   sql.NullString
		)
		if err := rows.Scan(
			&lesson.ID,
			&lesson.Level,
			&lesson.Title,
			&lesson.Question,
			&optionsJSON,
			&lesson.Answer,
			&hookNS,
			&bodyNS,
			&explainNS,
		); err != nil {
			return nil, fmt.Errorf("repository: scan lesson: %w", err)
		}
		opts, err := parseOptionsJSON(optionsJSON)
		if err != nil {
			return nil, err
		}
		lesson.Options = opts
		if hookNS.Valid {
			s := hookNS.String
			lesson.Hook = &s
		}
		if bodyNS.Valid {
			s := bodyNS.String
			lesson.Body = &s
		}
		if explainNS.Valid {
			s := explainNS.String
			lesson.Explanation = &s
		}
		out = append(out, lesson)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("repository: iterate lessons: %w", err)
	}
	if out == nil {
		out = []Lesson{}
	}
	return out, nil
}

// GetLessonsForLevels returns lessons grouped by level (one query per level; small fixed N).
func (r *Repository) GetLessonsForLevels(ctx context.Context, levels []int) (map[int][]Lesson, error) {
	out := make(map[int][]Lesson)
	for _, lv := range levels {
		list, err := r.GetLessonsByLevel(ctx, lv)
		if err != nil {
			return nil, err
		}
		out[lv] = list
	}
	return out, nil
}

func parseOptionsJSON(raw []byte) ([]string, error) {
	if len(raw) == 0 {
		return []string{}, nil
	}
	var opts []string
	if err := json.Unmarshal(raw, &opts); err != nil {
		return nil, fmt.Errorf("repository: parse options jsonb: %w", err)
	}
	return opts, nil
}
