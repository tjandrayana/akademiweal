package db

import "github.com/jackc/pgx/v5/pgxpool"

// DB wraps *pgxpool.Pool for dependency injection through repository/service layers.
type DB struct {
	Pool *pgxpool.Pool
}

// Close releases the database connection pool.
func (d *DB) Close() error {
	if d == nil || d.Pool == nil {
		return nil
	}
	d.Pool.Close()
	return nil
}
