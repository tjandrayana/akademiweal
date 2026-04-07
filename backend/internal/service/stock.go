package service

import (
	"context"
	"fmt"

	"github.com/fluxystack/akademiweal/backend/internal/repository"
)

func (s *Service) GetStockFeed(ctx context.Context) ([]repository.StockFeedItem, error) {
	return s.repo.GetStockFeed(ctx)
}

func (s *Service) GetStockDetail(ctx context.Context, code string) (*repository.StockSnapshot, error) {
	if code == "" {
		return nil, fmt.Errorf("stock code required")
	}
	return s.repo.GetStockDetail(ctx, code)
}

// CheckStockQuiz returns (isCorrect, explanation) for the submitted answer index.
func (s *Service) CheckStockQuiz(ctx context.Context, code string, answerIndex int) (bool, string, error) {
	snap, err := s.repo.GetStockDetail(ctx, code)
	if err != nil {
		return false, "", err
	}
	correct := answerIndex == snap.QuizCorrectIndex
	return correct, snap.QuizExplanation, nil
}

func (s *Service) GetUserRank(ctx context.Context, userID int64) (int64, error) {
	return s.repo.GetUserRank(ctx, userID)
}

func (s *Service) GetBarsToday(ctx context.Context, code string) ([]repository.MinuteBar, error) {
	return s.repo.GetBarsToday(ctx, code)
}

func (s *Service) GetAllBarsForDate(ctx context.Context, code string, date string) ([]repository.MinuteBar, error) {
	return s.repo.GetAllBarsForDate(ctx, code, date)
}

func (s *Service) GetAvailableDates(ctx context.Context, code string) ([]string, error) {
	return s.repo.GetAvailableDates(ctx, code)
}

func (s *Service) FetchAndStoreBars(ctx context.Context, code, date string) ([]repository.MinuteBar, error) {
	return s.repo.FetchAndStoreBarsFromYahoo(ctx, code, date)
}
