package repository

import "github.com/fluxystack/akademiweal/backend/internal/db"

type Repository struct {
	db *db.DB
}

func New(database *db.DB) *Repository {
	return &Repository{db: database}
}
