package db

import "database/sql"

// DB wraps *sql.DB for dependency injection through repository/service layers.
type DB struct {
	SQL *sql.DB
}

// Close releases the database connection pool.
func (d *DB) Close() error {
	if d == nil || d.SQL == nil {
		return nil
	}
	return d.SQL.Close()
}
