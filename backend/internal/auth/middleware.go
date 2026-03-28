package auth

import (
	"encoding/json"
	"net/http"
	"strings"
)

type response struct {
	Data  any `json:"data"`
	Error any `json:"error"`
}

// Middleware validates Authorization: Bearer <jwt> and sets user_id on the request context.
func (s *Signer) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		raw := r.Header.Get("Authorization")
		const prefix = "Bearer "
		if len(raw) < len(prefix) || raw[:len(prefix)] != prefix {
			writeAuthError(w, "missing or invalid authorization header")
			return
		}
		token := strings.TrimSpace(raw[len(prefix):])
		if token == "" {
			writeAuthError(w, "missing token")
			return
		}
		userID, err := s.ParseUserID(token)
		if err != nil {
			writeAuthError(w, "invalid or expired token")
			return
		}
		next.ServeHTTP(w, r.WithContext(ContextWithUserID(r.Context(), userID)))
	})
}

func writeAuthError(w http.ResponseWriter, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusUnauthorized)
	_ = json.NewEncoder(w).Encode(response{Data: nil, Error: msg})
}
