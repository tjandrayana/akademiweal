package auth

import (
	"errors"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// Signer issues and validates HS256 JWTs. user_id is only ever taken from verified claims.
type Signer struct {
	secret []byte
}

// NewSignerFromEnv reads JWT_SECRET. If empty, uses an insecure dev default and logs a warning.
func NewSignerFromEnv() (*Signer, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "dev-insecure-jwt-secret-change-me"
		fmt.Fprintf(os.Stderr, "warning: JWT_SECRET not set; using insecure default for development\n")
	}
	return &Signer{secret: []byte(secret)}, nil
}

// Issue creates a JWT with subject = user_id (string). Expires in 24h.
func (s *Signer) Issue(userID int64) (string, error) {
	claims := jwt.MapClaims{
		"sub": strconv.FormatInt(userID, 10),
		"exp": time.Now().Add(24 * time.Hour).Unix(),
		"iat": time.Now().Unix(),
	}
	tok := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return tok.SignedString(s.secret)
}

// ParseUserID validates the token and returns user_id from the "sub" claim.
func (s *Signer) ParseUserID(tokenString string) (int64, error) {
	tok, err := jwt.Parse(tokenString, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return s.secret, nil
	})
	if err != nil || !tok.Valid {
		return 0, err
	}
	claims, ok := tok.Claims.(jwt.MapClaims)
	if !ok {
		return 0, errors.New("invalid claims")
	}
	sub, err := claims.GetSubject()
	if err != nil || sub == "" {
		return 0, errors.New("missing sub")
	}
	id, err := strconv.ParseInt(sub, 10, 64)
	if err != nil {
		return 0, err
	}
	return id, nil
}

// UserIDFromRequest returns (userID, true) if Authorization Bearer is valid; otherwise (0, false).
func (s *Signer) UserIDFromRequest(r *http.Request) (int64, bool) {
	raw := r.Header.Get("Authorization")
	const prefix = "Bearer "
	if len(raw) < len(prefix) || raw[:len(prefix)] != prefix {
		return 0, false
	}
	token := strings.TrimSpace(raw[len(prefix):])
	if token == "" {
		return 0, false
	}
	uid, err := s.ParseUserID(token)
	if err != nil {
		return 0, false
	}
	return uid, true
}
