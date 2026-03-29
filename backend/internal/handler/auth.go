package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"github.com/fluxystack/akademiweal/backend/internal/auth"
	"github.com/fluxystack/akademiweal/backend/internal/service"
)

func (h *Handler) login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		respondJSON(w, http.StatusMethodNotAllowed, nil, "method not allowed")
		return
	}
	var body struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		respondJSON(w, http.StatusBadRequest, nil, "invalid json")
		return
	}

	res, err := h.service.Login(r.Context(), body.Email, body.Password)
	if err != nil {
		if strings.HasPrefix(err.Error(), "invalid email") ||
			strings.HasPrefix(err.Error(), "masukkan kata sandi") {
			respondJSON(w, http.StatusBadRequest, nil, err.Error())
			return
		}
		if errors.Is(err, service.ErrPasswordNotSet) {
			respondJSON(w, http.StatusBadRequest, nil, "Akun ini belum punya kata sandi. Daftar dulu dengan email yang sama.")
			return
		}
		if errors.Is(err, service.ErrInvalidCredentials) {
			respondJSON(w, http.StatusUnauthorized, nil, "Email atau kata sandi salah.")
			return
		}
		respondJSON(w, http.StatusInternalServerError, nil, "login failed")
		return
	}

	respondJSON(w, http.StatusOK, map[string]any{"token": res.Token, "xp": res.XP}, "")
}

func (h *Handler) register(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		respondJSON(w, http.StatusMethodNotAllowed, nil, "method not allowed")
		return
	}
	var body struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		respondJSON(w, http.StatusBadRequest, nil, "invalid json")
		return
	}

	res, err := h.service.Register(r.Context(), body.Email, body.Password)
	if err != nil {
		if strings.HasPrefix(err.Error(), "invalid email") {
			respondJSON(w, http.StatusBadRequest, nil, err.Error())
			return
		}
		if strings.Contains(err.Error(), "kata sandi") {
			respondJSON(w, http.StatusBadRequest, nil, err.Error())
			return
		}
		if errors.Is(err, service.ErrEmailTaken) {
			respondJSON(w, http.StatusConflict, nil, "Email sudah terdaftar. Coba masuk.")
			return
		}
		respondJSON(w, http.StatusInternalServerError, nil, "register failed")
		return
	}

	respondJSON(w, http.StatusOK, map[string]any{"token": res.Token, "xp": res.XP}, "")
}

func (h *Handler) me(w http.ResponseWriter, r *http.Request) {
	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		respondJSON(w, http.StatusUnauthorized, nil, "unauthorized")
		return
	}
	xp, err := h.service.GetUserXPTotal(r.Context(), userID)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, nil, "failed to load profile")
		return
	}
	respondJSON(w, http.StatusOK, map[string]any{"user_id": userID, "xp": xp}, "")
}
