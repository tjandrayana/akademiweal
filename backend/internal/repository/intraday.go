package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
)

// MinuteBar is one 1-minute OHLCV candle.
type MinuteBar struct {
	BarTime string `json:"bar_time"`
	Open    int64  `json:"open"`
	High    int64  `json:"high"`
	Low     int64  `json:"low"`
	Close   int64  `json:"close"`
	Volume  int64  `json:"volume"`
}

// ── Time helpers ──────────────────────────────────────────────────────────

func jakartaLoc() *time.Location {
	loc, _ := time.LoadLocation("Asia/Jakarta")
	if loc == nil {
		loc = time.FixedZone("WIB", 7*3600)
	}
	return loc
}

// lastTradingDay returns the most recent weekday (Mon–Fri) before today WIB.
func lastTradingDay() time.Time {
	loc := jakartaLoc()
	d := time.Now().In(loc).AddDate(0, 0, -1)
	for d.Weekday() == time.Saturday || d.Weekday() == time.Sunday {
		d = d.AddDate(0, 0, -1)
	}
	return d
}

// replaySimTime returns a timestamp in the replay day that matches the
// current WIB clock time.
// Example: today 10:30 WIB → yesterday's date at 10:30 WIB.
func replaySimTime() time.Time {
	loc := jakartaLoc()
	now := time.Now().In(loc)
	rd := lastTradingDay()
	return time.Date(rd.Year(), rd.Month(), rd.Day(),
		now.Hour(), now.Minute(), 0, 0, loc)
}

// ── Queries ───────────────────────────────────────────────────────────────

// GetCurrentBar returns the most recent minute bar for stockCode up to the
// current simulated time (yesterday's bars, replayed at today's clock).
func (r *Repository) GetCurrentBar(ctx context.Context, stockCode string) (*MinuteBar, error) {
	simT := replaySimTime()
	const q = `
		SELECT to_char(bar_time AT TIME ZONE 'Asia/Jakarta', 'YYYY-MM-DD"T"HH24:MI:SS') AS bar_time,
		       open, high, low, close, volume
		FROM stock_minute_bars
		WHERE stock_code = $1
		  AND bar_time <= $2
		ORDER BY bar_time DESC
		LIMIT 1
	`
	var b MinuteBar
	err := r.db.Pool.QueryRow(ctx, q, stockCode, simT).Scan(
		&b.BarTime, &b.Open, &b.High, &b.Low, &b.Close, &b.Volume,
	)
	if err != nil {
		return nil, fmt.Errorf("repository: get current bar %s: %w", stockCode, err)
	}
	return &b, nil
}

// GetBarsToday returns all minute bars up to the current simulated time,
// for building the intraday chart on the frontend.
func (r *Repository) GetBarsToday(ctx context.Context, stockCode string) ([]MinuteBar, error) {
	rd := lastTradingDay()
	simT := replaySimTime()
	const q = `
		SELECT to_char(bar_time AT TIME ZONE 'Asia/Jakarta', 'YYYY-MM-DD"T"HH24:MI:SS') AS bar_time,
		       open, high, low, close, volume
		FROM stock_minute_bars
		WHERE stock_code = $1
		  AND bar_time::date = $2::date
		  AND bar_time <= $3
		ORDER BY bar_time ASC
	`
	rows, err := r.db.Pool.Query(ctx, q, stockCode, rd.Format("2006-01-02"), simT)
	if err != nil {
		return nil, fmt.Errorf("repository: get bars today %s: %w", stockCode, err)
	}
	defer rows.Close()

	var out []MinuteBar
	for rows.Next() {
		var b MinuteBar
		if err := rows.Scan(&b.BarTime, &b.Open, &b.High, &b.Low, &b.Close, &b.Volume); err != nil {
			return nil, fmt.Errorf("repository: scan bar: %w", err)
		}
		out = append(out, b)
	}
	if out == nil {
		out = []MinuteBar{}
	}
	return out, nil
}

// GetAllBarsForDate returns every minute bar for the given date (no time cap).
// Used by the frontend simulation playback mode.
// If date is empty or invalid, falls back to the last trading day.
func (r *Repository) GetAllBarsForDate(ctx context.Context, stockCode string, date string) ([]MinuteBar, error) {
	loc := jakartaLoc()
	rd := lastTradingDay()
	if date != "" {
		if parsed, err := time.ParseInLocation("2006-01-02", date, loc); err == nil {
			rd = parsed
		}
	}

	const q = `
		SELECT to_char(bar_time AT TIME ZONE 'Asia/Jakarta', 'YYYY-MM-DD"T"HH24:MI:SS') AS bar_time,
		       open, high, low, close, volume
		FROM stock_minute_bars
		WHERE stock_code = $1
		  AND bar_time::date = $2::date
		ORDER BY bar_time ASC
	`
	rows, err := r.db.Pool.Query(ctx, q, stockCode, rd.Format("2006-01-02"))
	if err != nil {
		return nil, fmt.Errorf("repository: get all bars %s: %w", stockCode, err)
	}
	defer rows.Close()

	var out []MinuteBar
	for rows.Next() {
		var b MinuteBar
		if err := rows.Scan(&b.BarTime, &b.Open, &b.High, &b.Low, &b.Close, &b.Volume); err != nil {
			return nil, fmt.Errorf("repository: scan bar: %w", err)
		}
		out = append(out, b)
	}
	if out == nil {
		out = []MinuteBar{}
	}
	return out, nil
}

// GetAvailableDates returns all trading dates that have bar data for stockCode,
// newest first, excluding today. Used to populate the simulation date chips.
func (r *Repository) GetAvailableDates(ctx context.Context, stockCode string) ([]string, error) {
	loc := jakartaLoc()
	today := time.Now().In(loc).Format("2006-01-02")
	const q = `
		SELECT DISTINCT to_char(bar_time AT TIME ZONE 'Asia/Jakarta', 'YYYY-MM-DD') AS d
		FROM stock_minute_bars
		WHERE stock_code = $1
		  AND to_char(bar_time AT TIME ZONE 'Asia/Jakarta', 'YYYY-MM-DD') < $2
		ORDER BY d DESC
		LIMIT 30
	`
	rows, err := r.db.Pool.Query(ctx, q, stockCode, today)
	if err != nil {
		return nil, fmt.Errorf("repository: get available dates %s: %w", stockCode, err)
	}
	defer rows.Close()
	var out []string
	for rows.Next() {
		var d string
		if err := rows.Scan(&d); err != nil {
			return nil, fmt.Errorf("repository: scan date: %w", err)
		}
		out = append(out, d)
	}
	if out == nil {
		out = []string{}
	}
	return out, nil
}

// ── Yahoo Finance import ───────────────────────────────────────────────────

// FetchAndStoreBarsFromYahoo fetches 1-minute OHLCV bars from Yahoo Finance
// for the given stock and date (YYYY-MM-DD), stores them in stock_minute_bars,
// and returns the resulting bars. If bars already exist in the DB for that
// date, it skips the network call and returns from the DB directly.
func (r *Repository) FetchAndStoreBarsFromYahoo(ctx context.Context, stockCode, date string) ([]MinuteBar, error) {
	// Return cached data if already in DB.
	existing, err := r.GetAllBarsForDate(ctx, stockCode, date)
	if err == nil && len(existing) > 0 {
		return existing, nil
	}

	loc := jakartaLoc()
	day, err := time.ParseInLocation("2006-01-02", date, loc)
	if err != nil {
		return nil, fmt.Errorf("repository: invalid date %q: %w", date, err)
	}

	// IDX Sesi 1 opens 09:00, Sesi 2 closes 15:00 — fetch 09:00–16:00 to be safe.
	start := time.Date(day.Year(), day.Month(), day.Day(), 9, 0, 0, 0, loc)
	end := time.Date(day.Year(), day.Month(), day.Day(), 16, 0, 0, 0, loc)

	yurl := fmt.Sprintf(
		"https://query1.finance.yahoo.com/v8/finance/chart/%s.JK?interval=1m&period1=%d&period2=%d",
		stockCode, start.Unix(), end.Unix(),
	)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, yurl, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("User-Agent", "Mozilla/5.0 (compatible; AkademiWeal/1.0)")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("repository: yahoo finance request: %w", err)
	}
	defer resp.Body.Close()

	var yf struct {
		Chart struct {
			Result []struct {
				Timestamps []int64 `json:"timestamp"`
				Indicators struct {
					Quote []struct {
						Open   []*float64 `json:"open"`
						High   []*float64 `json:"high"`
						Low    []*float64 `json:"low"`
						Close  []*float64 `json:"close"`
						Volume []*float64 `json:"volume"`
					} `json:"quote"`
				} `json:"indicators"`
			} `json:"result"`
		} `json:"chart"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&yf); err != nil {
		return nil, fmt.Errorf("repository: yahoo decode: %w", err)
	}

	results := yf.Chart.Result
	if len(results) == 0 || len(results[0].Timestamps) == 0 {
		return nil, fmt.Errorf("repository: no data from Yahoo Finance for %s on %s", stockCode, date)
	}
	res := results[0]
	if len(res.Indicators.Quote) == 0 {
		return nil, fmt.Errorf("repository: empty quote from Yahoo Finance")
	}
	q := res.Indicators.Quote[0]

	for i, ts := range res.Timestamps {
		if i >= len(q.Open) || q.Open[i] == nil || q.Close[i] == nil {
			continue
		}
		var vol int64
		if i < len(q.Volume) && q.Volume[i] != nil {
			vol = int64(*q.Volume[i])
		}
		t := time.Unix(ts, 0).In(loc)
		if _, err := r.db.Pool.Exec(ctx,
			`INSERT INTO stock_minute_bars (stock_code, bar_time, open, high, low, close, volume)
			 VALUES ($1, $2, $3, $4, $5, $6, $7)
			 ON CONFLICT (stock_code, bar_time) DO NOTHING`,
			stockCode, t,
			int64(*q.Open[i]), int64(*q.High[i]), int64(*q.Low[i]), int64(*q.Close[i]), vol,
		); err != nil {
			log.Printf("repository: storeBars insert %s %v: %v", stockCode, t, err)
		}
	}

	return r.GetAllBarsForDate(ctx, stockCode, date)
}

// ── Background fill job ───────────────────────────────────────────────────

type pendingOrderRow struct {
	id         int64
	userID     int64
	seasonID   int64
	portfolioID int64
	stockCode  string
	orderType  string
	lots       int
	limitPrice int64
}

// FillPendingOrders runs every minute: checks all pending arena orders against
// the current simulated bar and fills them if the limit price is reached.
// Buy fills when bar.Low ≤ limitPrice; sell fills when bar.High ≥ limitPrice.
func (r *Repository) FillPendingOrders(ctx context.Context) {
	loc := jakartaLoc()
	now := time.Now().In(loc)

	// Only run during IDX market hours (09:00–15:00 WIB)
	hour := now.Hour()
	if hour < 9 || hour >= 16 {
		return
	}

	todayDate := now.Format("2006-01-02")

	// Fetch all pending orders for today's open seasons
	const qOrders = `
		SELECT o.id, o.user_id, o.season_id,
		       ap.id AS portfolio_id,
		       o.stock_code, o.order_type, o.lots, o.limit_price
		FROM arena_orders o
		JOIN arena_seasons s ON s.id = o.season_id
		JOIN arena_portfolios ap ON ap.user_id = o.user_id AND ap.season_id = o.season_id
		WHERE o.status = 'pending'
		  AND s.date = $1
		  AND s.status = 'open'
	`
	rows, err := r.db.Pool.Query(ctx, qOrders, todayDate)
	if err != nil {
		log.Printf("fillPendingOrders: query: %v", err)
		return
	}

	var orders []pendingOrderRow
	for rows.Next() {
		var o pendingOrderRow
		if err := rows.Scan(&o.id, &o.userID, &o.seasonID, &o.portfolioID,
			&o.stockCode, &o.orderType, &o.lots, &o.limitPrice); err != nil {
			continue
		}
		orders = append(orders, o)
	}
	rows.Close()

	for _, o := range orders {
		bar, err := r.GetCurrentBar(ctx, o.stockCode)
		if err != nil {
			continue
		}
		r.tryFillOrder(ctx, o, bar)
	}
}

func (r *Repository) tryFillOrder(ctx context.Context, o pendingOrderRow, bar *MinuteBar) {
	var shouldFill bool
	var fillPrice int64

	switch o.orderType {
	case "buy":
		if bar.Low <= o.limitPrice {
			shouldFill = true
			// Fill at limit price (conservative; real markets fill at bar.Open if gap-down)
			fillPrice = o.limitPrice
			if bar.Open <= o.limitPrice {
				fillPrice = bar.Open // filled at open if it gapped below limit
			}
		}
	case "sell":
		if bar.High >= o.limitPrice {
			shouldFill = true
			fillPrice = o.limitPrice
			if bar.Open >= o.limitPrice {
				fillPrice = bar.Open
			}
		}
	}

	if !shouldFill {
		return
	}

	tx, err := r.db.Pool.Begin(ctx)
	if err != nil {
		return
	}
	defer tx.Rollback(ctx) //nolint:errcheck

	// Mark filled
	now := time.Now()
	if _, err := tx.Exec(ctx,
		`UPDATE arena_orders SET status='filled', filled_price=$1, filled_at=$2 WHERE id=$3 AND status='pending'`,
		fillPrice, now, o.id,
	); err != nil {
		return
	}

	switch o.orderType {
	case "buy":
		// Cash was reserved at limitPrice; refund difference
		reservedCost := int64(o.lots) * 100 * o.limitPrice
		actualCost := int64(o.lots) * 100 * fillPrice
		if refund := reservedCost - actualCost; refund > 0 {
			tx.Exec(ctx, //nolint:errcheck
				`UPDATE arena_portfolios SET cash = cash + $1 WHERE id = $2`, refund, o.portfolioID)
		}
		if err := upsertHolding(ctx, tx, o.userID, o.seasonID, o.stockCode, o.lots, fillPrice); err != nil {
			return
		}
	case "sell":
		proceeds := int64(o.lots) * 100 * fillPrice
		if _, err := tx.Exec(ctx,
			`UPDATE arena_portfolios SET cash = cash + $1 WHERE id = $2`, proceeds, o.portfolioID,
		); err != nil {
			return
		}
		if _, err := tx.Exec(ctx,
			`UPDATE arena_holdings SET lots = lots - $1 WHERE user_id=$2 AND season_id=$3 AND stock_code=$4`,
			o.lots, o.userID, o.seasonID, o.stockCode,
		); err != nil {
			return
		}
	}

	if err := tx.Commit(ctx); err != nil {
		log.Printf("tryFillOrder commit order %d: %v", o.id, err)
	}
}

// ExpirePendingOrders marks all still-pending orders as expired at market close.
func (r *Repository) ExpirePendingOrders(ctx context.Context) {
	todayDate := jakartaLoc()
	dateStr := time.Now().In(todayDate).Format("2006-01-02")

	// Refund reserved cash for pending buy orders first
	const qBuys = `
		SELECT o.id, o.user_id, o.season_id, o.lots, o.limit_price
		FROM arena_orders o
		JOIN arena_seasons s ON s.id = o.season_id
		WHERE o.status = 'pending' AND o.order_type = 'buy' AND s.date = $1
	`
	rows, _ := r.db.Pool.Query(ctx, qBuys, dateStr)
	type buyRefund struct{ id, userID, seasonID int64; lots int; limitPrice int64 }
	var buys []buyRefund
	for rows.Next() {
		var b buyRefund
		rows.Scan(&b.id, &b.userID, &b.seasonID, &b.lots, &b.limitPrice) //nolint:errcheck
		buys = append(buys, b)
	}
	rows.Close()

	for _, b := range buys {
		refund := int64(b.lots) * 100 * b.limitPrice
		r.db.Pool.Exec(ctx, //nolint:errcheck
			`UPDATE arena_portfolios SET cash = cash + $1 WHERE user_id=$2 AND season_id=$3`,
			refund, b.userID, b.seasonID)
	}

	// Expire all pending orders
	r.db.Pool.Exec(ctx, //nolint:errcheck
		`UPDATE arena_orders SET status='expired'
		 WHERE status='pending'
		   AND season_id IN (SELECT id FROM arena_seasons WHERE date=$1)`,
		dateStr)

	// Close the season
	r.db.Pool.Exec(ctx, //nolint:errcheck
		`UPDATE arena_seasons SET status='closed' WHERE date=$1`, dateStr)
}

// StartFillJob launches the background goroutine that fills orders every minute.
// Call once from main(). Stops when ctx is cancelled.
func (r *Repository) StartFillJob(ctx context.Context) {
	go func() {
		ticker := time.NewTicker(time.Minute)
		defer ticker.Stop()
		for {
			select {
			case <-ctx.Done():
				return
			case t := <-ticker.C:
				loc := jakartaLoc()
				now := t.In(loc)
				// Market close: expire remaining orders at 15:01 WIB
				if now.Hour() == 15 && now.Minute() == 1 {
					r.ExpirePendingOrders(ctx)
				} else {
					r.FillPendingOrders(ctx)
				}
			}
		}
	}()
	log.Println("arena fill job started")
}
