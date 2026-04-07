package handler

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"

	"github.com/fluxystack/akademiweal/backend/internal/repository"
)

// GET /stocks/{code}/sim-dates — returns the list of dates that have bar data.
func (h *Handler) stockSimDates(w http.ResponseWriter, r *http.Request) {
	code := strings.ToUpper(chi.URLParam(r, "code"))
	if code == "" {
		respondJSON(w, http.StatusBadRequest, nil, "kode saham diperlukan")
		return
	}
	dates, err := h.service.GetAvailableDates(r.Context(), code)
	if err != nil {
		log.Printf("stockSimDates %s: %v", code, err)
		respondJSON(w, http.StatusOK, map[string]any{"dates": []string{}}, "")
		return
	}
	respondJSON(w, http.StatusOK, map[string]any{"dates": dates}, "")
}

// POST /stocks/{code}/fetch-bars — fetches bars for a given date from Yahoo
// Finance (if not already in DB) and returns them. Body: { "date": "YYYY-MM-DD" }.
func (h *Handler) stockFetchBars(w http.ResponseWriter, r *http.Request) {
	code := strings.ToUpper(chi.URLParam(r, "code"))
	if code == "" {
		respondJSON(w, http.StatusBadRequest, nil, "kode saham diperlukan")
		return
	}

	var body struct {
		Date string `json:"date"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Date == "" {
		respondJSON(w, http.StatusBadRequest, nil, "date diperlukan (YYYY-MM-DD)")
		return
	}

	// Reject weekends early.
	if d, err := time.Parse("2006-01-02", body.Date); err == nil {
		dow := d.Weekday()
		if dow == time.Saturday || dow == time.Sunday {
			respondJSON(w, http.StatusBadRequest, nil, "pasar tutup di hari weekend")
			return
		}
	} else {
		respondJSON(w, http.StatusBadRequest, nil, "format tanggal tidak valid")
		return
	}

	bars, err := h.service.FetchAndStoreBars(r.Context(), code, body.Date)
	if err != nil {
		log.Printf("stockFetchBars %s %s: %v", code, body.Date, err)
		respondJSON(w, http.StatusBadRequest, nil, "data tidak tersedia untuk tanggal tersebut")
		return
	}

	var currentClose int64
	if len(bars) > 0 {
		currentClose = bars[len(bars)-1].Close
	}
	respondJSON(w, http.StatusOK, map[string]any{
		"bars":          bars,
		"current_price": currentClose,
	}, "")
}

// GET /stocks/{code}/bars — returns minute bars for the live intraday chart.
//   ?full=1         → all bars for the replay day (simulation playback mode)
//   ?full=1&date=YYYY-MM-DD → all bars for a specific date
//   default         → bars up to current simulated clock time (live mode)
func (h *Handler) stockBars(w http.ResponseWriter, r *http.Request) {
	code := strings.ToUpper(chi.URLParam(r, "code"))
	if code == "" {
		respondJSON(w, http.StatusBadRequest, nil, "kode saham diperlukan")
		return
	}

	var (
		bars []repository.MinuteBar
		err  error
	)
	if r.URL.Query().Get("full") == "1" {
		date := r.URL.Query().Get("date") // optional YYYY-MM-DD; empty → last trading day
		bars, err = h.service.GetAllBarsForDate(r.Context(), code, date)
	} else {
		bars, err = h.service.GetBarsToday(r.Context(), code)
	}
	if err != nil {
		log.Printf("stockBars %s: %v", code, err)
		respondJSON(w, http.StatusOK, map[string]any{"bars": []any{}}, "")
		return
	}

	var currentClose int64
	if len(bars) > 0 {
		currentClose = bars[len(bars)-1].Close
	}
	respondJSON(w, http.StatusOK, map[string]any{
		"bars":          bars,
		"current_price": currentClose,
	}, "")
}
