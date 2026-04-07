package repository

import (
	"context"
	"encoding/json"
	"fmt"
)

// StockFeedItem is a summary row returned for the feed list.
type StockFeedItem struct {
	Code            string  `json:"code"`
	Name            string  `json:"name"`
	Sector          string  `json:"sector"`
	IsPremium       bool    `json:"is_premium"`
	PriceClose      float64 `json:"price_close"`
	PriceChangePct  float64 `json:"price_change_pct"`
	VolumeLabel     string  `json:"volume_label"`
	MarketCapLabel  string  `json:"market_cap_label"`
	PERatio         string  `json:"pe_ratio"`
	AISummarySnip   string  `json:"ai_summary_snip"` // first 120 chars of summary
	SnapshotDate    string  `json:"snapshot_date"`
}

// StockSnapshot is the full detail row for a single stock.
type StockSnapshot struct {
	Code             string   `json:"code"`
	Name             string   `json:"name"`
	Sector           string   `json:"sector"`
	IsPremium        bool     `json:"is_premium"`
	PriceClose       float64  `json:"price_close"`
	PriceChangePct   float64  `json:"price_change_pct"`
	VolumeLabel      string   `json:"volume_label"`
	MarketCapLabel   string   `json:"market_cap_label"`
	PERatio          string   `json:"pe_ratio"`
	AISummary        string   `json:"ai_summary"`
	QuizQuestion     string   `json:"quiz_question"`
	QuizOptions      []string `json:"quiz_options"`
	QuizCorrectIndex int      `json:"quiz_correct_index"`
	QuizExplanation  string   `json:"quiz_explanation"`
	SnapshotDate     string   `json:"snapshot_date"`
}

const stockFeedQuery = `
SELECT DISTINCT ON (s.code)
  s.code, s.name, COALESCE(s.sector,''), s.is_premium,
  COALESCE(sds.price_close, 0),
  COALESCE(sds.price_change_pct, 0),
  COALESCE(sds.volume_label,''),
  COALESCE(sds.market_cap_label,''),
  COALESCE(sds.pe_ratio,''),
  COALESCE(LEFT(sds.ai_summary, 120),''),
  COALESCE(sds.snapshot_date::text,'')
FROM stocks s
LEFT JOIN stock_daily_snapshots sds ON sds.stock_code = s.code
ORDER BY s.code, sds.snapshot_date DESC NULLS LAST
`

const stockDetailQuery = `
SELECT DISTINCT ON (s.code)
  s.code, s.name, COALESCE(s.sector,''), s.is_premium,
  COALESCE(sds.price_close, 0),
  COALESCE(sds.price_change_pct, 0),
  COALESCE(sds.volume_label,''),
  COALESCE(sds.market_cap_label,''),
  COALESCE(sds.pe_ratio,''),
  COALESCE(sds.ai_summary,''),
  COALESCE(sds.quiz_question,''),
  COALESCE(sds.quiz_options,'[]'::jsonb),
  COALESCE(sds.quiz_correct_index, 0),
  COALESCE(sds.quiz_explanation,''),
  COALESCE(sds.snapshot_date::text,'')
FROM stocks s
LEFT JOIN stock_daily_snapshots sds ON sds.stock_code = s.code
WHERE s.code = $1
ORDER BY s.code, sds.snapshot_date DESC NULLS LAST
LIMIT 1
`

// GetStockFeed returns the latest snapshot for every stock.
func (r *Repository) GetStockFeed(ctx context.Context) ([]StockFeedItem, error) {
	rows, err := r.db.Pool.Query(ctx, stockFeedQuery)
	if err != nil {
		return nil, fmt.Errorf("repository: stock feed query: %w", err)
	}
	defer rows.Close()

	var out []StockFeedItem
	for rows.Next() {
		var item StockFeedItem
		if err := rows.Scan(
			&item.Code, &item.Name, &item.Sector, &item.IsPremium,
			&item.PriceClose, &item.PriceChangePct,
			&item.VolumeLabel, &item.MarketCapLabel, &item.PERatio,
			&item.AISummarySnip, &item.SnapshotDate,
		); err != nil {
			return nil, fmt.Errorf("repository: scan stock feed: %w", err)
		}
		out = append(out, item)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("repository: iterate stock feed: %w", err)
	}
	if out == nil {
		out = []StockFeedItem{}
	}
	return out, nil
}

// GetStockDetail returns the latest snapshot for a single stock code.
func (r *Repository) GetStockDetail(ctx context.Context, code string) (*StockSnapshot, error) {
	row := r.db.Pool.QueryRow(ctx, stockDetailQuery, code)

	var snap StockSnapshot
	var optionsJSON []byte
	if err := row.Scan(
		&snap.Code, &snap.Name, &snap.Sector, &snap.IsPremium,
		&snap.PriceClose, &snap.PriceChangePct,
		&snap.VolumeLabel, &snap.MarketCapLabel, &snap.PERatio,
		&snap.AISummary,
		&snap.QuizQuestion,
		&optionsJSON,
		&snap.QuizCorrectIndex,
		&snap.QuizExplanation,
		&snap.SnapshotDate,
	); err != nil {
		return nil, fmt.Errorf("repository: scan stock detail %q: %w", code, err)
	}
	if len(optionsJSON) > 0 {
		if err := json.Unmarshal(optionsJSON, &snap.QuizOptions); err != nil {
			return nil, fmt.Errorf("repository: parse quiz options: %w", err)
		}
	}
	return &snap, nil
}

// GetUserRank returns the user's rank on the XP leaderboard (1-based).
func (r *Repository) GetUserRank(ctx context.Context, userID int64) (int64, error) {
	const q = `
		SELECT COUNT(*) + 1
		FROM users
		WHERE xp_total > (SELECT xp_total FROM users WHERE id = $1)
	`
	var rank int64
	if err := r.db.Pool.QueryRow(ctx, q, userID).Scan(&rank); err != nil {
		return 0, fmt.Errorf("repository: get user rank: %w", err)
	}
	return rank, nil
}
