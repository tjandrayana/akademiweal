package handler

import (
	"net/http"
	"strconv"
)

// listLessons handles GET /lessons?level=1
func (h *Handler) listLessons(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query().Get("level")
	if q == "" {
		respondJSON(w, http.StatusBadRequest, nil, "level is required")
		return
	}
	level, err := strconv.Atoi(q)
	if err != nil || level < 1 {
		respondJSON(w, http.StatusBadRequest, nil, "invalid level")
		return
	}

	lessons, err := h.service.ListLessonsByLevel(r.Context(), level)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, nil, "failed to load lessons")
		return
	}

	respondJSON(w, http.StatusOK, lessons, "")
}
