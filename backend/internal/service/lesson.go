package service

import (
	"context"

	"github.com/fluxystack/akademiweal/backend/internal/repository"
)

// ListLessonsByLevel returns lessons for a learning-path level (repository-backed).
func (s *Service) ListLessonsByLevel(ctx context.Context, level int) ([]repository.Lesson, error) {
	return s.repo.GetLessonsByLevel(ctx, level)
}

// ListLessonsForLevels returns lessons keyed by level for batch home loading.
func (s *Service) ListLessonsForLevels(ctx context.Context, levels []int) (map[int][]repository.Lesson, error) {
	return s.repo.GetLessonsForLevels(ctx, levels)
}
