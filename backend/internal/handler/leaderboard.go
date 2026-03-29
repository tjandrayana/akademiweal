package handler

import (
	"log"
	"net/http"
	"strconv"
)

func (h *Handler) leaderboard(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		respondJSON(w, http.StatusMethodNotAllowed, nil, "method not allowed")
		return
	}
	limit := 50
	if q := r.URL.Query().Get("limit"); q != "" {
		if n, err := strconv.Atoi(q); err == nil && n > 0 {
			limit = n
		}
	}
	rows, err := h.service.Leaderboard(r.Context(), limit)
	if err != nil {
		log.Printf("leaderboard: %v", err)
		respondJSON(w, http.StatusInternalServerError, nil, "failed to load leaderboard")
		return
	}
	respondJSON(w, http.StatusOK, map[string]any{"entries": rows}, "")
}
