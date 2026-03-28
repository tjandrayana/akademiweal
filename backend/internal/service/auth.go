package service

import (
	"context"
	"errors"
	"fmt"
	"net/mail"
	"strings"

	"github.com/jackc/pgx/v5"
)

// Login finds or creates a user by email and returns a JWT (user_id only from DB, never from client).
func (s *Service) Login(ctx context.Context, rawEmail string) (string, error) {
	email := strings.TrimSpace(strings.ToLower(rawEmail))
	if email == "" {
		return "", fmt.Errorf("invalid email")
	}
	if _, err := mail.ParseAddress(email); err != nil {
		return "", fmt.Errorf("invalid email")
	}

	u, err := s.repo.GetUserByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			id, cerr := s.repo.CreateUser(ctx, email)
			if cerr != nil {
				return "", cerr
			}
			return s.signer.Issue(id)
		}
		return "", err
	}
	return s.signer.Issue(u.ID)
}
