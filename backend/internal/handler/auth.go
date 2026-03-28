package handler

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/fluxystack/akademiweal/backend/internal/auth"
)

func (h *Handler) login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		respondJSON(w, http.StatusMethodNotAllowed, nil, "method not allowed")
		return
	}
	var body struct {
		Email string `json:"email"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		respondJSON(w, http.StatusBadRequest, nil, "invalid json")
		return
	}

	token, err := h.service.Login(r.Context(), body.Email)
	if err != nil {
		if strings.HasPrefix(err.Error(), "invalid email") {
			respondJSON(w, http.StatusBadRequest, nil, err.Error())
			return
		}
		respondJSON(w, http.StatusInternalServerError, nil, "login failed")
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"token": token}, "")
}

func (h *Handler) me(w http.ResponseWriter, r *http.Request) {
	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		respondJSON(w, http.StatusUnauthorized, nil, "unauthorized")
		return
	}
	respondJSON(w, http.StatusOK, map[string]int64{"user_id": userID}, "")
}
