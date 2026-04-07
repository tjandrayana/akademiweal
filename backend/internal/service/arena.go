package service

import (
	"context"

	"github.com/fluxystack/akademiweal/backend/internal/repository"
)

func (s *Service) GetTodayArena(ctx context.Context, userID int64) (*repository.ArenaHomeData, error) {
	season, err := s.repo.GetOrCreateTodaySeason(ctx)
	if err != nil {
		return nil, err
	}
	return s.repo.GetArenaHome(ctx, userID, season.ID)
}

func (s *Service) PlaceArenaOrder(ctx context.Context, userID int64, stockCode, orderType string, lots int, limitPrice int64) (*repository.ArenaOrder, error) {
	season, err := s.repo.GetOrCreateTodaySeason(ctx)
	if err != nil {
		return nil, err
	}
	if _, _, err := s.repo.GetOrCreatePortfolio(ctx, userID, season.ID); err != nil {
		return nil, err
	}
	return s.repo.PlaceOrder(ctx, userID, season.ID, stockCode, orderType, lots, limitPrice)
}

func (s *Service) CancelArenaOrder(ctx context.Context, orderID, userID int64) error {
	return s.repo.CancelOrder(ctx, orderID, userID)
}

func (s *Service) GetArenaLeaderboard(ctx context.Context, userID int64) ([]repository.ArenaLBEntry, error) {
	season, err := s.repo.GetOrCreateTodaySeason(ctx)
	if err != nil {
		return nil, err
	}
	return s.repo.GetArenaLeaderboard(ctx, season.ID, userID, 50)
}
