package service

import (
	"context"
	"fmt"
	"strings"
)

const maxXpSanity = int64(1_000_000_000)

// SyncXP persists max(server XP, client-reported total). clientXP is the user's full local total.
func (s *Service) SyncXP(ctx context.Context, userID int64, clientXP int64) (int64, error) {
	if clientXP < 0 {
		clientXP = 0
	}
	if clientXP > maxXpSanity {
		clientXP = maxXpSanity
	}
	return s.repo.SyncUserXPMax(ctx, userID, clientXP)
}

// GetUserXPTotal returns stored xp_total for a user.
func (s *Service) GetUserXPTotal(ctx context.Context, userID int64) (int64, error) {
	return s.repo.GetUserXPTotal(ctx, userID)
}

// LeaderboardRow is one ranked row for GET /leaderboard.
type LeaderboardRow struct {
	Rank   int    `json:"rank"`
	UserID int64  `json:"user_id"`
	XP     int64  `json:"xp"`
	Label  string `json:"label"`
}

// Leaderboard returns top users by xp_total.
func (s *Service) Leaderboard(ctx context.Context, limit int) ([]LeaderboardRow, error) {
	entries, err := s.repo.ListLeaderboard(ctx, limit)
	if err != nil {
		return nil, err
	}
	out := make([]LeaderboardRow, len(entries))
	for i := range entries {
		out[i] = LeaderboardRow{
			Rank:   i + 1,
			UserID: entries[i].UserID,
			XP:     entries[i].XP,
			Label:  leaderboardPublicLabel(entries[i].Email, entries[i].UserID),
		}
	}
	return out, nil
}

func leaderboardPublicLabel(email string, userID int64) string {
	email = strings.TrimSpace(strings.ToLower(email))
	at := strings.IndexByte(email, '@')
	local := email
	if at >= 0 {
		local = strings.TrimSpace(email[:at])
	}
	if local == "" {
		return fmt.Sprintf("Pemain #%d", userID)
	}
	r := []rune(local)
	if len(r) > 12 {
		return string(r[:10]) + "…"
	}
	return string(r)
}
