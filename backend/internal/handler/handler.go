package handler

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/fluxystack/akademiweal/backend/internal/auth"
	"github.com/fluxystack/akademiweal/backend/internal/service"
)

type Handler struct {
	service *service.Service
	signer  *auth.Signer
}

func New(svc *service.Service, signer *auth.Signer) *Handler {
	return &Handler{service: svc, signer: signer}
}

func (h *Handler) Routes() http.Handler {
	r := chi.NewRouter()

	r.Get("/health", h.health)
	r.Post("/login", h.login)
	r.Get("/lessons", h.listLessons)
	r.Post("/events", h.createEvent)

	r.Group(func(r chi.Router) {
		r.Use(h.signer.Middleware)
		r.Get("/me", h.me)
	})

	return r
}

type response struct {
	Data  any `json:"data"`
	Error any `json:"error"`
}

func (h *Handler) health(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	_ = json.NewEncoder(w).Encode(response{
		Data: map[string]string{
			"status": h.service.HealthStatus(),
		},
		Error: nil,
	})
}

func respondJSON(w http.ResponseWriter, status int, data any, errMsg string) {
	w.Header().Set("Content-Type", "application/json")
	var errOut any
	if errMsg != "" {
		errOut = errMsg
	} else {
		errOut = nil
	}
	if status != http.StatusOK {
		w.WriteHeader(status)
	}
	_ = json.NewEncoder(w).Encode(response{
		Data:  data,
		Error: errOut,
	})
}
