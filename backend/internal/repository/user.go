package repository

import (
	"context"
	"fmt"
)

// User is a row in users.
type User struct {
	ID    int64
	Email string
}

// GetUserByEmail returns a user by normalized email, or sql.ErrNoRows.
func (r *Repository) GetUserByEmail(ctx context.Context, email string) (*User, error) {
	if r == nil || r.db == nil || r.db.SQL == nil {
		return nil, fmt.Errorf("repository: database not initialized")
	}
	var u User
	err := r.db.SQL.QueryRowContext(ctx,
		`SELECT id, email FROM users WHERE email = $1`,
		email,
	).Scan(&u.ID, &u.Email)
	if err != nil {
		return nil, err
	}
	return &u, nil
}

// CreateUser inserts a user and returns id.
func (r *Repository) CreateUser(ctx context.Context, email string) (int64, error) {
	if r == nil || r.db == nil || r.db.SQL == nil {
		return 0, fmt.Errorf("repository: database not initialized")
	}
	var id int64
	err := r.db.SQL.QueryRowContext(ctx,
		`INSERT INTO users (email) VALUES ($1) RETURNING id`,
		email,
	).Scan(&id)
	if err != nil {
		return 0, err
	}
	return id, nil
}
