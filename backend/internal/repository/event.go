package repository

import (
	"context"
	"encoding/json"
	"fmt"
)

// InsertEvent persists one row. Called from the async tracker only.
// userID nil means anonymous (no auth).
func (r *Repository) InsertEvent(ctx context.Context, userID *int64, eventName string, metadata map[string]any) error {
	if r == nil || r.db == nil || r.db.Pool == nil {
		return fmt.Errorf("repository: database not initialized")
	}
	if metadata == nil {
		metadata = map[string]any{}
	}
	raw, err := json.Marshal(metadata)
	if err != nil {
		return fmt.Errorf("repository: metadata json: %w", err)
	}
	var uid any
	if userID != nil {
		uid = *userID
	} else {
		uid = nil
	}
	_, err = r.db.Pool.Exec(ctx,
		`INSERT INTO events (user_id, event_name, metadata) VALUES ($1, $2, $3::jsonb)`,
		uid, eventName, raw,
	)
	if err != nil {
		return fmt.Errorf("repository: insert event: %w", err)
	}
	return nil
}
