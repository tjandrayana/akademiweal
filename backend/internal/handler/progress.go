package handler

import (
	"encoding/json"
	"net/http"

	"github.com/fluxystack/akademiweal/backend/internal/auth"
)

func (h *Handler) syncProgress(w http.ResponseWriter, r *http.Request) {
	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		respondJSON(w, http.StatusUnauthorized, nil, "unauthorized")
		return
	}
	if r.Method != http.MethodPost {
		respondJSON(w, http.StatusMethodNotAllowed, nil, "method not allowed")
		return
	}
	var body struct {
		XP int64 `json:"xp"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		respondJSON(w, http.StatusBadRequest, nil, "invalid json")
		return
	}
	xp, err := h.service.SyncXP(r.Context(), userID, body.XP)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, nil, "sync failed")
		return
	}
	respondJSON(w, http.StatusOK, map[string]int64{"xp": xp}, "")
}
