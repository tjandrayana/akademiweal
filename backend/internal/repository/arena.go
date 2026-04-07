package repository

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
)

// ── Structs ────────────────────────────────────────────────────────────────

type ArenaSeason struct {
	ID     int64  `json:"id"`
	Date   string `json:"date"`
	Status string `json:"status"`
}

type ArenaHolding struct {
	StockCode        string  `json:"stock_code"`
	Name             string  `json:"name"`
	Sector           string  `json:"sector"`
	Lots             int     `json:"lots"`
	AvgPricePerShare int64   `json:"avg_price_per_share"`
	CurrentPrice     int64   `json:"current_price"`
	CurrentValue     int64   `json:"current_value"`
	PnL              int64   `json:"pnl"`
	PnLPct           float64 `json:"pnl_pct"`
}

type ArenaOrder struct {
	ID          int64   `json:"id"`
	StockCode   string  `json:"stock_code"`
	OrderType   string  `json:"order_type"`
	Lots        int     `json:"lots"`
	LimitPrice  int64   `json:"limit_price"`
	Status      string  `json:"status"`
	FilledPrice *int64  `json:"filled_price,omitempty"`
	CreatedAt   string  `json:"created_at"`
}

type ArenaHomeData struct {
	Season        ArenaSeason    `json:"season"`
	Cash          int64          `json:"cash"`
	HoldingsValue int64          `json:"holdings_value"`
	TotalValue    int64          `json:"total_value"`
	ReturnPct     float64        `json:"return_pct"`
	Rank          int64          `json:"rank"`
	TotalTraders  int64          `json:"total_traders"`
	Holdings      []ArenaHolding `json:"holdings"`
	Orders        []ArenaOrder   `json:"orders"`
}

type ArenaLBEntry struct {
	Rank          int64   `json:"rank"`
	UserID        int64   `json:"user_id"`
	DisplayName   string  `json:"display_name"`
	TotalValue    int64   `json:"total_value"`
	ReturnPct     float64 `json:"return_pct"`
	IsCurrentUser bool    `json:"is_current_user"`
}

const startingCapital int64 = 10_000_000

// ── Helpers ────────────────────────────────────────────────────────────────

// jakartaDate returns today's date in WIB (UTC+7).
func jakartaDate() string {
	loc, _ := time.LoadLocation("Asia/Jakarta")
	if loc == nil {
		loc = time.FixedZone("WIB", 7*3600)
	}
	return time.Now().In(loc).Format("2006-01-02")
}

// emailToDisplay returns the local-part of an email (before @).
func emailToDisplay(email string) string {
	if idx := strings.Index(email, "@"); idx > 0 {
		return email[:idx]
	}
	return email
}

// ── Season ─────────────────────────────────────────────────────────────────

// GetOrCreateTodaySeason upserts a season for today (WIB) and returns it.
func (r *Repository) GetOrCreateTodaySeason(ctx context.Context) (*ArenaSeason, error) {
	date := jakartaDate()
	const q = `
		INSERT INTO arena_seasons (date)
		VALUES ($1)
		ON CONFLICT (date) DO UPDATE SET date = EXCLUDED.date
		RETURNING id, date::text, status
	`
	var s ArenaSeason
	if err := r.db.Pool.QueryRow(ctx, q, date).Scan(&s.ID, &s.Date, &s.Status); err != nil {
		return nil, fmt.Errorf("repository: upsert arena season: %w", err)
	}
	return &s, nil
}

// ── Portfolio ──────────────────────────────────────────────────────────────

// GetOrCreatePortfolio upserts a portfolio for the user in this season.
func (r *Repository) GetOrCreatePortfolio(ctx context.Context, userID, seasonID int64) (cash int64, portfolioID int64, err error) {
	const q = `
		INSERT INTO arena_portfolios (user_id, season_id, cash)
		VALUES ($1, $2, $3)
		ON CONFLICT (user_id, season_id) DO UPDATE SET user_id = EXCLUDED.user_id
		RETURNING id, cash
	`
	err = r.db.Pool.QueryRow(ctx, q, userID, seasonID, startingCapital).Scan(&portfolioID, &cash)
	if err != nil {
		return 0, 0, fmt.Errorf("repository: upsert arena portfolio: %w", err)
	}
	return cash, portfolioID, nil
}

// ── Home data ──────────────────────────────────────────────────────────────

// GetArenaHome returns a complete snapshot of the user's arena state.
func (r *Repository) GetArenaHome(ctx context.Context, userID, seasonID int64) (*ArenaHomeData, error) {
	season, err := r.GetOrCreateTodaySeason(ctx)
	if err != nil {
		return nil, err
	}

	cash, _, err := r.GetOrCreatePortfolio(ctx, userID, seasonID)
	if err != nil {
		return nil, err
	}

	holdings, err := r.getHoldings(ctx, userID, seasonID)
	if err != nil {
		return nil, err
	}

	var holdingsValue int64
	for _, h := range holdings {
		holdingsValue += h.CurrentValue
	}

	orders, err := r.GetArenaOrders(ctx, userID, seasonID)
	if err != nil {
		return nil, err
	}

	totalValue := cash + holdingsValue
	returnPct := float64(totalValue-startingCapital) / float64(startingCapital) * 100

	rank, totalTraders, err := r.getUserArenaRank(ctx, userID, seasonID)
	if err != nil {
		rank = 0
		totalTraders = 0
	}

	return &ArenaHomeData{
		Season:        *season,
		Cash:          cash,
		HoldingsValue: holdingsValue,
		TotalValue:    totalValue,
		ReturnPct:     returnPct,
		Rank:          rank,
		TotalTraders:  totalTraders,
		Holdings:      holdings,
		Orders:        orders,
	}, nil
}

func (r *Repository) getHoldings(ctx context.Context, userID, seasonID int64) ([]ArenaHolding, error) {
	simT := replaySimTime()
	q := `
SELECT
  ah.stock_code,
  s.name,
  COALESCE(s.sector,''),
  ah.lots,
  ah.avg_price_per_share,
  COALESCE(
    (SELECT close FROM stock_minute_bars
     WHERE stock_code = ah.stock_code AND bar_time <= $3
     ORDER BY bar_time DESC LIMIT 1),
    CAST(COALESCE(
      (SELECT price_close FROM stock_daily_snapshots
       WHERE stock_code = ah.stock_code ORDER BY snapshot_date DESC LIMIT 1),
      0
    ) AS BIGINT)
  ) AS current_price
FROM arena_holdings ah
JOIN stocks s ON s.code = ah.stock_code
WHERE ah.user_id = $1 AND ah.season_id = $2 AND ah.lots > 0
ORDER BY ah.stock_code
`
	rows, err := r.db.Pool.Query(ctx, q, userID, seasonID, simT)
	if err != nil {
		return nil, fmt.Errorf("repository: get arena holdings: %w", err)
	}
	defer rows.Close()

	var out []ArenaHolding
	for rows.Next() {
		var h ArenaHolding
		if err := rows.Scan(&h.StockCode, &h.Name, &h.Sector, &h.Lots, &h.AvgPricePerShare, &h.CurrentPrice); err != nil {
			return nil, fmt.Errorf("repository: scan holding: %w", err)
		}
		h.CurrentValue = int64(h.Lots) * 100 * h.CurrentPrice
		costBasis := int64(h.Lots) * 100 * h.AvgPricePerShare
		h.PnL = h.CurrentValue - costBasis
		if costBasis > 0 {
			h.PnLPct = float64(h.PnL) / float64(costBasis) * 100
		}
		out = append(out, h)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("repository: iterate holdings: %w", err)
	}
	if out == nil {
		out = []ArenaHolding{}
	}
	return out, nil
}

// ── Orders ─────────────────────────────────────────────────────────────────

func (r *Repository) GetArenaOrders(ctx context.Context, userID, seasonID int64) ([]ArenaOrder, error) {
	const q = `
		SELECT id, stock_code, order_type, lots, limit_price, status, filled_price, created_at::text
		FROM arena_orders
		WHERE user_id = $1 AND season_id = $2
		ORDER BY created_at DESC
		LIMIT 20
	`
	rows, err := r.db.Pool.Query(ctx, q, userID, seasonID)
	if err != nil {
		return nil, fmt.Errorf("repository: get arena orders: %w", err)
	}
	defer rows.Close()

	var out []ArenaOrder
	for rows.Next() {
		var o ArenaOrder
		if err := rows.Scan(&o.ID, &o.StockCode, &o.OrderType, &o.Lots, &o.LimitPrice, &o.Status, &o.FilledPrice, &o.CreatedAt); err != nil {
			return nil, fmt.Errorf("repository: scan order: %w", err)
		}
		out = append(out, o)
	}
	if out == nil {
		out = []ArenaOrder{}
	}
	return out, nil
}

// PlaceOrder executes a limit order in a single transaction.
// Buy: reserves cash; fills immediately if snapshot_price <= limit_price.
// Sell: checks available lots; fills immediately if snapshot_price >= limit_price.
func (r *Repository) PlaceOrder(ctx context.Context, userID, seasonID int64, stockCode, orderType string, lots int, limitPrice int64) (*ArenaOrder, error) {
	tx, err := r.db.Pool.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("repository: begin tx: %w", err)
	}
	defer tx.Rollback(ctx) //nolint:errcheck

	// 1. Current simulated price (minute bar replay, or daily fallback)
	snapshotPrice, err := currentSimulatedPrice(ctx, tx, stockCode)
	if err != nil || snapshotPrice == 0 {
		return nil, fmt.Errorf("tidak ada data harga untuk %s", stockCode)
	}

	// 2. Portfolio cash
	var portfolioID, cash int64
	if err := tx.QueryRow(ctx,
		`SELECT id, cash FROM arena_portfolios WHERE user_id=$1 AND season_id=$2`,
		userID, seasonID,
	).Scan(&portfolioID, &cash); err != nil {
		return nil, fmt.Errorf("portfolio tidak ditemukan")
	}

	var status = "pending"
	var filledPrice *int64
	now := time.Now()

	switch orderType {
	case "buy":
		cost := int64(lots) * 100 * limitPrice
		if cash < cost {
			return nil, fmt.Errorf("saldo tidak cukup (tersedia Rp %d, butuh Rp %d)", cash, cost)
		}
		// Reserve cash at limit price
		if _, err := tx.Exec(ctx,
			`UPDATE arena_portfolios SET cash = cash - $1 WHERE id = $2`, cost, portfolioID,
		); err != nil {
			return nil, fmt.Errorf("gagal reservasi saldo: %w", err)
		}

		// Immediate fill: snapshot_price <= limit_price
		if snapshotPrice <= limitPrice {
			status = "filled"
			fp := snapshotPrice
			filledPrice = &fp
			// Refund overpay
			actualCost := int64(lots) * 100 * snapshotPrice
			if refund := cost - actualCost; refund > 0 {
				tx.Exec(ctx, `UPDATE arena_portfolios SET cash = cash + $1 WHERE id = $2`, refund, portfolioID) //nolint:errcheck
			}
			if err := upsertHolding(ctx, tx, userID, seasonID, stockCode, lots, snapshotPrice); err != nil {
				return nil, err
			}
		}

	case "sell":
		var heldLots int
		tx.QueryRow(ctx, //nolint:errcheck
			`SELECT COALESCE(lots,0) FROM arena_holdings WHERE user_id=$1 AND season_id=$2 AND stock_code=$3`,
			userID, seasonID, stockCode,
		).Scan(&heldLots)

		var pendingSell int
		tx.QueryRow(ctx, //nolint:errcheck
			`SELECT COALESCE(SUM(lots),0) FROM arena_orders WHERE user_id=$1 AND season_id=$2 AND stock_code=$3 AND order_type='sell' AND status='pending'`,
			userID, seasonID, stockCode,
		).Scan(&pendingSell)

		if heldLots-pendingSell < lots {
			return nil, fmt.Errorf("lot tidak mencukupi (tersedia %d lot)", heldLots-pendingSell)
		}

		// Immediate fill: snapshot_price >= limit_price
		if snapshotPrice >= limitPrice {
			status = "filled"
			fp := snapshotPrice
			filledPrice = &fp
			proceeds := int64(lots) * 100 * snapshotPrice
			if _, err := tx.Exec(ctx,
				`UPDATE arena_portfolios SET cash = cash + $1 WHERE id = $2`, proceeds, portfolioID,
			); err != nil {
				return nil, fmt.Errorf("gagal update saldo: %w", err)
			}
			if _, err := tx.Exec(ctx,
				`UPDATE arena_holdings SET lots = lots - $1 WHERE user_id=$2 AND season_id=$3 AND stock_code=$4`,
				lots, userID, seasonID, stockCode,
			); err != nil {
				return nil, fmt.Errorf("gagal update holdings: %w", err)
			}
		}

	default:
		return nil, fmt.Errorf("order_type tidak valid")
	}

	// 3. Insert order record
	var o ArenaOrder
	if err := tx.QueryRow(ctx, `
		INSERT INTO arena_orders (user_id, season_id, stock_code, order_type, lots, limit_price, status, filled_price, filled_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
		RETURNING id, stock_code, order_type, lots, limit_price, status, filled_price, created_at::text
	`, userID, seasonID, stockCode, orderType, lots, limitPrice, status, filledPrice,
		func() *time.Time {
			if status == "filled" {
				return &now
			}
			return nil
		}(),
	).Scan(&o.ID, &o.StockCode, &o.OrderType, &o.Lots, &o.LimitPrice, &o.Status, &o.FilledPrice, &o.CreatedAt); err != nil {
		return nil, fmt.Errorf("repository: insert order: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("repository: commit order: %w", err)
	}
	return &o, nil
}

// CancelOrder cancels a pending order and refunds cash for buy orders.
func (r *Repository) CancelOrder(ctx context.Context, orderID, userID int64) error {
	tx, err := r.db.Pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx) //nolint:errcheck

	var orderType string
	var lots int
	var limitPrice, seasonID int64
	if err := tx.QueryRow(ctx,
		`SELECT order_type, lots, limit_price, season_id FROM arena_orders WHERE id=$1 AND user_id=$2 AND status='pending'`,
		orderID, userID,
	).Scan(&orderType, &lots, &limitPrice, &seasonID); err != nil {
		if err == pgx.ErrNoRows {
			return fmt.Errorf("order tidak ditemukan atau sudah tidak aktif")
		}
		return err
	}

	if _, err := tx.Exec(ctx,
		`UPDATE arena_orders SET status='cancelled' WHERE id=$1`, orderID,
	); err != nil {
		return err
	}

	// Refund reserved cash for buy orders
	if orderType == "buy" {
		refund := int64(lots) * 100 * limitPrice
		if _, err := tx.Exec(ctx,
			`UPDATE arena_portfolios SET cash = cash + $1 WHERE user_id=$2 AND season_id=$3`,
			refund, userID, seasonID,
		); err != nil {
			return err
		}
	}

	return tx.Commit(ctx)
}

// ── Leaderboard ────────────────────────────────────────────────────────────

const leaderboardQuery = `
SELECT
  u.id,
  u.email,
  ap.cash + COALESCE((
    SELECT SUM(ah.lots * 100 * CAST(
      COALESCE((
        SELECT price_close FROM stock_daily_snapshots WHERE stock_code = ah.stock_code ORDER BY snapshot_date DESC LIMIT 1
      ), 0) AS BIGINT))
    FROM arena_holdings ah
    WHERE ah.user_id = ap.user_id AND ah.season_id = ap.season_id AND ah.lots > 0
  ), 0) AS total_value
FROM arena_portfolios ap
JOIN users u ON u.id = ap.user_id
WHERE ap.season_id = $1
ORDER BY total_value DESC
LIMIT $2
`

func (r *Repository) GetArenaLeaderboard(ctx context.Context, seasonID int64, currentUserID int64, limit int) ([]ArenaLBEntry, error) {
	rows, err := r.db.Pool.Query(ctx, leaderboardQuery, seasonID, limit)
	if err != nil {
		return nil, fmt.Errorf("repository: arena leaderboard: %w", err)
	}
	defer rows.Close()

	var out []ArenaLBEntry
	rank := int64(1)
	for rows.Next() {
		var e ArenaLBEntry
		var email string
		if err := rows.Scan(&e.UserID, &email, &e.TotalValue); err != nil {
			return nil, fmt.Errorf("repository: scan lb entry: %w", err)
		}
		e.Rank = rank
		e.DisplayName = emailToDisplay(email)
		e.ReturnPct = float64(e.TotalValue-startingCapital) / float64(startingCapital) * 100
		e.IsCurrentUser = e.UserID == currentUserID
		out = append(out, e)
		rank++
	}
	if out == nil {
		out = []ArenaLBEntry{}
	}
	return out, nil
}

func (r *Repository) getUserArenaRank(ctx context.Context, userID, seasonID int64) (rank, total int64, err error) {
	const q = `
	SELECT
	  COUNT(*) + 1 AS rank,
	  (SELECT COUNT(*) FROM arena_portfolios WHERE season_id=$2) AS total
	FROM arena_portfolios ap
	WHERE ap.season_id = $2
	  AND (ap.cash + COALESCE((
	    SELECT SUM(ah.lots * 100 * CAST(
	      COALESCE((SELECT price_close FROM stock_daily_snapshots WHERE stock_code = ah.stock_code ORDER BY snapshot_date DESC LIMIT 1),0
	    ) AS BIGINT))
	    FROM arena_holdings ah WHERE ah.user_id = ap.user_id AND ah.season_id = ap.season_id AND ah.lots > 0
	  ), 0)) > (ap.cash + COALESCE((
	    SELECT SUM(ah2.lots * 100 * CAST(
	      COALESCE((SELECT price_close FROM stock_daily_snapshots WHERE stock_code = ah2.stock_code ORDER BY snapshot_date DESC LIMIT 1),0
	    ) AS BIGINT))
	    FROM arena_holdings ah2 WHERE ah2.user_id = $1 AND ah2.season_id = $2 AND ah2.lots > 0
	  ), 0))
	`
	err = r.db.Pool.QueryRow(ctx, q, userID, seasonID).Scan(&rank, &total)
	return
}

// ── Internal helpers ───────────────────────────────────────────────────────

// currentSimulatedPrice returns the live simulated price for stockCode.
// Prefers the current minute bar (yesterday's intraday replay), falls back to daily snapshot.
func currentSimulatedPrice(ctx context.Context, tx pgx.Tx, stockCode string) (int64, error) {
	simT := replaySimTime()
	var price int64
	err := tx.QueryRow(ctx,
		`SELECT close FROM stock_minute_bars WHERE stock_code=$1 AND bar_time <= $2 ORDER BY bar_time DESC LIMIT 1`,
		stockCode, simT,
	).Scan(&price)
	if err == nil && price > 0 {
		return price, nil
	}
	// Fall back to daily snapshot
	var dailyPrice float64
	err = tx.QueryRow(ctx,
		`SELECT COALESCE(price_close, 0) FROM stock_daily_snapshots WHERE stock_code=$1 ORDER BY snapshot_date DESC LIMIT 1`,
		stockCode,
	).Scan(&dailyPrice)
	if err != nil {
		return 0, err
	}
	return int64(dailyPrice), nil
}

func upsertHolding(ctx context.Context, tx pgx.Tx, userID, seasonID int64, stockCode string, lots int, fillPrice int64) error {
	_, err := tx.Exec(ctx, `
		INSERT INTO arena_holdings (user_id, season_id, stock_code, lots, avg_price_per_share)
		VALUES ($1, $2, $3, $4::int, $5::bigint)
		ON CONFLICT (user_id, season_id, stock_code) DO UPDATE SET
		  avg_price_per_share = (arena_holdings.lots * arena_holdings.avg_price_per_share + $4::int * $5::bigint)
		                        / (arena_holdings.lots + $4::int),
		  lots = arena_holdings.lots + $4::int
	`, userID, seasonID, stockCode, lots, fillPrice)
	return err
}
