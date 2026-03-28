package service

import (
	"github.com/fluxystack/akademiweal/backend/internal/auth"
	"github.com/fluxystack/akademiweal/backend/internal/repository"
	"github.com/fluxystack/akademiweal/backend/internal/tracking"
)

type Service struct {
	repo    *repository.Repository
	signer  *auth.Signer
	tracker *tracking.Tracker
}

func New(repo *repository.Repository, signer *auth.Signer, tracker *tracking.Tracker) *Service {
	return &Service{repo: repo, signer: signer, tracker: tracker}
}

func (s *Service) HealthStatus() string {
	return "ok"
}
