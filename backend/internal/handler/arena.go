package handler

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"

	"github.com/fluxystack/akademiweal/backend/internal/auth"
)

// GET /arena/today — returns full portfolio snapshot for today's season.
func (h *Handler) arenaToday(w http.ResponseWriter, r *http.Request) {
	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		respondJSON(w, http.StatusUnauthorized, nil, "unauthorized")
		return
	}
	data, err := h.service.GetTodayArena(r.Context(), userID)
	if err != nil {
		log.Printf("arenaToday: %v", err)
		respondJSON(w, http.StatusInternalServerError, nil, "gagal memuat arena")
		return
	}
	respondJSON(w, http.StatusOK, data, "")
}

// POST /arena/orders — place a limit order.
func (h *Handler) arenaPlaceOrder(w http.ResponseWriter, r *http.Request) {
	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		respondJSON(w, http.StatusUnauthorized, nil, "unauthorized")
		return
	}
	var body struct {
		StockCode  string `json:"stock_code"`
		OrderType  string `json:"order_type"`
		Lots       int    `json:"lots"`
		LimitPrice int64  `json:"limit_price"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		respondJSON(w, http.StatusBadRequest, nil, "invalid json")
		return
	}
	if body.StockCode == "" || (body.OrderType != "buy" && body.OrderType != "sell") || body.Lots <= 0 || body.LimitPrice <= 0 {
		respondJSON(w, http.StatusBadRequest, nil, "parameter tidak valid")
		return
	}
	order, err := h.service.PlaceArenaOrder(r.Context(), userID, body.StockCode, body.OrderType, body.Lots, body.LimitPrice)
	if err != nil {
		log.Printf("arenaPlaceOrder: %v", err)
		respondJSON(w, http.StatusBadRequest, nil, err.Error())
		return
	}
	respondJSON(w, http.StatusOK, order, "")
}

// POST /arena/orders/{id}/cancel — cancel a pending order.
func (h *Handler) arenaCancelOrder(w http.ResponseWriter, r *http.Request) {
	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		respondJSON(w, http.StatusUnauthorized, nil, "unauthorized")
		return
	}
	orderID, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil || orderID <= 0 {
		respondJSON(w, http.StatusBadRequest, nil, "order id tidak valid")
		return
	}
	if err := h.service.CancelArenaOrder(r.Context(), orderID, userID); err != nil {
		log.Printf("arenaCancelOrder: %v", err)
		respondJSON(w, http.StatusBadRequest, nil, err.Error())
		return
	}
	respondJSON(w, http.StatusOK, map[string]bool{"cancelled": true}, "")
}

// GET /arena/leaderboard — ranked by % return for today's season.
func (h *Handler) arenaLeaderboard(w http.ResponseWriter, r *http.Request) {
	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		respondJSON(w, http.StatusUnauthorized, nil, "unauthorized")
		return
	}
	entries, err := h.service.GetArenaLeaderboard(r.Context(), userID)
	if err != nil {
		log.Printf("arenaLeaderboard: %v", err)
		respondJSON(w, http.StatusInternalServerError, nil, "gagal memuat leaderboard")
		return
	}
	respondJSON(w, http.StatusOK, map[string]any{"entries": entries}, "")
}
