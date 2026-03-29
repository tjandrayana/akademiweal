package repository

import (
	"context"
	"database/sql"
	"fmt"
)

// User is a row in users.
type User struct {
	ID           int64
	Email        string
	XPTotal      int64
	PasswordHash sql.NullString
}

// GetUserByEmail returns a user by normalized email, or ErrNoRows from pgx when missing.
func (r *Repository) GetUserByEmail(ctx context.Context, email string) (*User, error) {
	if r == nil || r.db == nil || r.db.Pool == nil {
		return nil, fmt.Errorf("repository: database not initialized")
	}
	var u User
	err := r.db.Pool.QueryRow(ctx,
		`SELECT id, email, COALESCE(xp_total, 0), password_hash FROM users WHERE email = $1`,
		email,
	).Scan(&u.ID, &u.Email, &u.XPTotal, &u.PasswordHash)
	if err != nil {
		return nil, err
	}
	return &u, nil
}

// InsertUserWithPassword creates a user with a bcrypt password hash.
func (r *Repository) InsertUserWithPassword(ctx context.Context, email, passwordHash string) (int64, error) {
	if r == nil || r.db == nil || r.db.Pool == nil {
		return 0, fmt.Errorf("repository: database not initialized")
	}
	var id int64
	err := r.db.Pool.QueryRow(ctx,
		`INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id`,
		email, passwordHash,
	).Scan(&id)
	if err != nil {
		return 0, err
	}
	return id, nil
}

// ClaimPasswordForEmail sets password_hash when the account exists and hash is still NULL (legacy rows).
func (r *Repository) ClaimPasswordForEmail(ctx context.Context, email, passwordHash string) (int64, error) {
	if r == nil || r.db == nil || r.db.Pool == nil {
		return 0, fmt.Errorf("repository: database not initialized")
	}
	var id int64
	err := r.db.Pool.QueryRow(ctx,
		`UPDATE users SET password_hash = $2 WHERE email = $1 AND password_hash IS NULL RETURNING id`,
		email, passwordHash,
	).Scan(&id)
	if err != nil {
		return 0, err
	}
	return id, nil
}

// GetUserXPTotal returns xp_total for a user.
func (r *Repository) GetUserXPTotal(ctx context.Context, userID int64) (int64, error) {
	if r == nil || r.db == nil || r.db.Pool == nil {
		return 0, fmt.Errorf("repository: database not initialized")
	}
	var xp int64
	err := r.db.Pool.QueryRow(ctx,
		`SELECT COALESCE(xp_total, 0) FROM users WHERE id = $1`,
		userID,
	).Scan(&xp)
	if err != nil {
		return 0, err
	}
	return xp, nil
}

// SyncUserXPMax sets xp_total to GREATEST(current, clientXP). Returns the new stored value.
func (r *Repository) SyncUserXPMax(ctx context.Context, userID int64, clientXP int64) (int64, error) {
	if r == nil || r.db == nil || r.db.Pool == nil {
		return 0, fmt.Errorf("repository: database not initialized")
	}
	var out int64
	err := r.db.Pool.QueryRow(ctx, `
		UPDATE users SET xp_total = GREATEST(COALESCE(xp_total, 0), $2)
		WHERE id = $1
		RETURNING xp_total
	`, userID, clientXP).Scan(&out)
	if err != nil {
		return 0, err
	}
	return out, nil
}

// LeaderboardUser is a raw row for leaderboard listing.
type LeaderboardUser struct {
	UserID int64
	Email  string
	XP     int64
}

// ListLeaderboard returns users ordered by xp_total descending.
func (r *Repository) ListLeaderboard(ctx context.Context, limit int) ([]LeaderboardUser, error) {
	if r == nil || r.db == nil || r.db.Pool == nil {
		return nil, fmt.Errorf("repository: database not initialized")
	}
	if limit < 1 {
		limit = 50
	}
	if limit > 100 {
		limit = 100
	}
	rows, err := r.db.Pool.Query(ctx, `
		SELECT id, email, COALESCE(xp_total, 0)
		FROM users
		ORDER BY xp_total DESC, id ASC
		LIMIT $1
	`, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []LeaderboardUser
	for rows.Next() {
		var e LeaderboardUser
		if err := rows.Scan(&e.UserID, &e.Email, &e.XP); err != nil {
			return nil, err
		}
		list = append(list, e)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return list, nil
}
