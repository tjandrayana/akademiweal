package handler

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
)

// GET /stocks/feed — public, returns latest snapshot per stock.
func (h *Handler) stockFeed(w http.ResponseWriter, r *http.Request) {
	items, err := h.service.GetStockFeed(r.Context())
	if err != nil {
		log.Printf("stockFeed: %v", err)
		respondJSON(w, http.StatusInternalServerError, nil, "gagal memuat feed saham")
		return
	}
	respondJSON(w, http.StatusOK, map[string]any{"stocks": items}, "")
}

// GET /stocks/{code}/today — auth required, returns full detail + quiz.
func (h *Handler) stockToday(w http.ResponseWriter, r *http.Request) {
	code := strings.ToUpper(chi.URLParam(r, "code"))
	if code == "" {
		respondJSON(w, http.StatusBadRequest, nil, "kode saham diperlukan")
		return
	}
	snap, err := h.service.GetStockDetail(r.Context(), code)
	if err != nil {
		log.Printf("stockToday %s: %v", code, err)
		respondJSON(w, http.StatusNotFound, nil, "data saham tidak ditemukan")
		return
	}
	// Hide quiz answer from response — client must POST to check
	out := map[string]any{
		"code":             snap.Code,
		"name":             snap.Name,
		"sector":           snap.Sector,
		"is_premium":       snap.IsPremium,
		"price_close":      snap.PriceClose,
		"price_change_pct": snap.PriceChangePct,
		"volume_label":     snap.VolumeLabel,
		"market_cap_label": snap.MarketCapLabel,
		"pe_ratio":         snap.PERatio,
		"ai_summary":       snap.AISummary,
		"quiz_question":    snap.QuizQuestion,
		"quiz_options":     snap.QuizOptions,
		"snapshot_date":    snap.SnapshotDate,
	}
	respondJSON(w, http.StatusOK, out, "")
}

// POST /stocks/{code}/quiz — auth required, check answer, return XP.
func (h *Handler) stockQuiz(w http.ResponseWriter, r *http.Request) {
	code := strings.ToUpper(chi.URLParam(r, "code"))
	if code == "" {
		respondJSON(w, http.StatusBadRequest, nil, "kode saham diperlukan")
		return
	}
	var body struct {
		AnswerIndex int `json:"answer_index"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		respondJSON(w, http.StatusBadRequest, nil, "invalid json")
		return
	}
	correct, explanation, err := h.service.CheckStockQuiz(r.Context(), code, body.AnswerIndex)
	if err != nil {
		log.Printf("stockQuiz %s: %v", code, err)
		respondJSON(w, http.StatusNotFound, nil, "data kuis tidak ditemukan")
		return
	}
	xp := 0
	if correct {
		xp = 25
	}
	respondJSON(w, http.StatusOK, map[string]any{
		"correct":     correct,
		"xp":          xp,
		"explanation": explanation,
	}, "")
}

// GET /me/rank — auth required.
func (h *Handler) meRank(w http.ResponseWriter, r *http.Request) {
	userID, ok := h.signer.UserIDFromRequest(r)
	if !ok {
		respondJSON(w, http.StatusUnauthorized, nil, "unauthorized")
		return
	}
	rank, err := h.service.GetUserRank(r.Context(), userID)
	if err != nil {
		log.Printf("meRank: %v", err)
		respondJSON(w, http.StatusInternalServerError, nil, "gagal mengambil peringkat")
		return
	}
	respondJSON(w, http.StatusOK, map[string]int64{"rank": rank}, "")
}
