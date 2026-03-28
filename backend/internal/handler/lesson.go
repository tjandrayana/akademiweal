package handler

import (
	"context"
	"errors"
	"net/http"
	"strconv"
	"strings"
)

// listLessons handles GET /lessons?level=1 or GET /lessons?levels=1,2,3 (batch for home).
func (h *Handler) listLessons(w http.ResponseWriter, r *http.Request) {
	if levelsQ := strings.TrimSpace(r.URL.Query().Get("levels")); levelsQ != "" {
		var levels []int
		for _, part := range strings.Split(levelsQ, ",") {
			part = strings.TrimSpace(part)
			if part == "" {
				continue
			}
			v, err := strconv.Atoi(part)
			if err != nil || v < 1 {
				respondJSON(w, http.StatusBadRequest, nil, "invalid levels")
				return
			}
			levels = append(levels, v)
		}
		if len(levels) == 0 {
			respondJSON(w, http.StatusBadRequest, nil, "levels is empty")
			return
		}

		byLevel, err := h.service.ListLessonsForLevels(r.Context(), levels)
		if err != nil {
			if errors.Is(err, context.Canceled) {
				return // client disconnected or aborted fetch (e.g. React Strict Mode cleanup)
			}
			respondJSON(w, http.StatusInternalServerError, nil, "failed to load lessons")
			return
		}
		out := make(map[string]any, len(byLevel))
		for lv, list := range byLevel {
			out[strconv.Itoa(lv)] = list
		}
		respondJSON(w, http.StatusOK, out, "")
		return
	}

	q := r.URL.Query().Get("level")
	if q == "" {
		respondJSON(w, http.StatusBadRequest, nil, "level or levels is required")
		return
	}
	level, err := strconv.Atoi(q)
	if err != nil || level < 1 {
		respondJSON(w, http.StatusBadRequest, nil, "invalid level")
		return
	}

	lessons, err := h.service.ListLessonsByLevel(r.Context(), level)
	if err != nil {
		if errors.Is(err, context.Canceled) {
			return
		}
		respondJSON(w, http.StatusInternalServerError, nil, "failed to load lessons")
		return
	}

	respondJSON(w, http.StatusOK, lessons, "")
}
