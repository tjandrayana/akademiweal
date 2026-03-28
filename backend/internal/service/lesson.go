package service

import (
	"context"

	"github.com/fluxystack/akademiweal/backend/internal/repository"
)

// ListLessonsByLevel returns lessons for a learning-path level (repository-backed).
func (s *Service) ListLessonsByLevel(ctx context.Context, level int) ([]repository.Lesson, error) {
	return s.repo.GetLessonsByLevel(ctx, level)
}
