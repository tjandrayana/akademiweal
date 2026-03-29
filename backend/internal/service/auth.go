package service

import (
	"context"
	"errors"
	"fmt"
	"net/mail"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"golang.org/x/crypto/bcrypt"
)

const (
	bcryptCost         = bcrypt.DefaultCost
	minPasswordLen     = 8
	maxPasswordBytes   = 72 // bcrypt limit
	registerErrShortPW = "kata sandi minimal 8 karakter"
	registerErrLongPW  = "kata sandi terlalu panjang"
)

// ErrInvalidCredentials means login failed (wrong email/password or unknown user).
var ErrInvalidCredentials = errors.New("invalid credentials")

// ErrEmailTaken means register failed because the email already has a password.
var ErrEmailTaken = errors.New("email taken")

// ErrPasswordNotSet means the account exists but has no password yet (legacy); user should register to set one.
var ErrPasswordNotSet = errors.New("password not set")

// LoginResult is returned after a successful login or register.
type LoginResult struct {
	Token string
	XP    int64
}

func normalizeEmail(raw string) (string, error) {
	email := strings.TrimSpace(strings.ToLower(raw))
	if email == "" {
		return "", fmt.Errorf("invalid email")
	}
	if _, err := mail.ParseAddress(email); err != nil {
		return "", fmt.Errorf("invalid email")
	}
	return email, nil
}

func isUniqueViolation(err error) bool {
	var pgErr *pgconn.PgError
	return errors.As(err, &pgErr) && pgErr.Code == "23505"
}

// Register creates an account or sets a password on a legacy email-only row, then returns a JWT.
func (s *Service) Register(ctx context.Context, rawEmail, password string) (*LoginResult, error) {
	email, err := normalizeEmail(rawEmail)
	if err != nil {
		return nil, err
	}
	pw := strings.TrimSpace(password)
	if len(pw) < minPasswordLen {
		return nil, fmt.Errorf("%s", registerErrShortPW)
	}
	if len([]byte(pw)) > maxPasswordBytes {
		return nil, fmt.Errorf("%s", registerErrLongPW)
	}

	hashBytes, err := bcrypt.GenerateFromPassword([]byte(pw), bcryptCost)
	if err != nil {
		return nil, err
	}
	hash := string(hashBytes)

	id, err := s.repo.InsertUserWithPassword(ctx, email, hash)
	if err != nil {
		if isUniqueViolation(err) {
			id, err = s.repo.ClaimPasswordForEmail(ctx, email, hash)
			if err != nil {
				if errors.Is(err, pgx.ErrNoRows) {
					return nil, ErrEmailTaken
				}
				return nil, err
			}
			u, gerr := s.repo.GetUserByEmail(ctx, email)
			if gerr != nil {
				return nil, gerr
			}
			tok, ierr := s.signer.Issue(id)
			if ierr != nil {
				return nil, ierr
			}
			return &LoginResult{Token: tok, XP: u.XPTotal}, nil
		}
		return nil, err
	}

	tok, ierr := s.signer.Issue(id)
	if ierr != nil {
		return nil, ierr
	}
	return &LoginResult{Token: tok, XP: 0}, nil
}

// Login verifies email and password and returns a JWT.
func (s *Service) Login(ctx context.Context, rawEmail, password string) (*LoginResult, error) {
	email, err := normalizeEmail(rawEmail)
	if err != nil {
		return nil, err
	}
	pw := strings.TrimSpace(password)
	if pw == "" {
		return nil, fmt.Errorf("masukkan kata sandi")
	}
	if len([]byte(pw)) > maxPasswordBytes {
		return nil, ErrInvalidCredentials
	}

	u, err := s.repo.GetUserByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrInvalidCredentials
		}
		return nil, err
	}
	if !u.PasswordHash.Valid || strings.TrimSpace(u.PasswordHash.String) == "" {
		return nil, ErrPasswordNotSet
	}
	if err := bcrypt.CompareHashAndPassword([]byte(u.PasswordHash.String), []byte(pw)); err != nil {
		return nil, ErrInvalidCredentials
	}

	tok, ierr := s.signer.Issue(u.ID)
	if ierr != nil {
		return nil, ierr
	}
	return &LoginResult{Token: tok, XP: u.XPTotal}, nil
}
