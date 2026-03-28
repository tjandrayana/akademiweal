package handler

import (
	"encoding/json"
	"net/http"
	"strings"
	"unicode/utf8"

)

var allowedEventNames = map[string]struct{}{
	"app_open":        {},
	"lesson_start":    {},
	"lesson_complete": {},
	"answer_click":    {},
	"answer_correct":  {},
	"answer_wrong":    {},
}

func (h *Handler) createEvent(w http.ResponseWriter, r *http.Request) {
	var userID *int64
	if uid, ok := h.signer.UserIDFromRequest(r); ok {
		userID = &uid
	}

	var body struct {
		EventName string         `json:"event_name"`
		Metadata  map[string]any `json:"metadata"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		respondJSON(w, http.StatusBadRequest, nil, "invalid json")
		return
	}

	name := strings.TrimSpace(body.EventName)
	if name == "" || utf8.RuneCountInString(name) > 128 {
		respondJSON(w, http.StatusBadRequest, nil, "invalid event_name")
		return
	}
	if _, ok := allowedEventNames[name]; !ok {
		respondJSON(w, http.StatusBadRequest, nil, "unknown event_name")
		return
	}

	meta := body.Metadata
	if meta == nil {
		meta = map[string]any{}
	}

	h.service.EnqueueEvent(userID, name, meta)

	respondJSON(w, http.StatusAccepted, map[string]bool{"accepted": true}, "")
}
