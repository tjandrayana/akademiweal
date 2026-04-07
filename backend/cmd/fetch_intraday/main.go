// fetch_intraday fetches yesterday's 1-minute OHLCV data for IDX stocks from
// Yahoo Finance and stores it in stock_minute_bars + stock_daily_snapshots.
//
// Run daily at ~07:00 WIB (00:00 UTC), before IDX market opens at 09:00 WIB.
//
// Usage (from repo root):
//
//	cd backend && go run ./cmd/fetch_intraday/
//	DATABASE_URL=postgres://... go run ./cmd/fetch_intraday/
package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"math"
	"net/http"
	"net/http/cookiejar"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

// ── Constants ────────────────────────────────────────────────────────────────

const userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

var wib = time.FixedZone("WIB", 7*3600)

// IDX stocks: LQ45 blue chips + popular names.
// Yahoo Finance tickers append ".JK" (e.g. BBCA → BBCA.JK).
var stockCodes = []string{
	"BBCA", "BBRI", "BMRI", "BBNI", "BRIS",
	"GOTO", "TLKM", "EXCL", "TOWR",
	"ASII", "UNTR",
	"ANTM", "PTBA", "ADRO", "ITMG",
	"UNVR", "ICBP", "INDF", "MYOR", "HMSP", "GGRM", "CPIN",
	"KLBF", "SIDO",
	"SMGR", "INTP",
	"PGAS",
	"JSMR", "WIKA",
}

// ── Time helpers ─────────────────────────────────────────────────────────────

// lastTradingDay returns the most recent weekday (Mon–Fri) before today WIB.
func lastTradingDay() time.Time {
	d := time.Now().In(wib).AddDate(0, 0, -1)
	for d.Weekday() == time.Saturday || d.Weekday() == time.Sunday {
		d = d.AddDate(0, 0, -1)
	}
	return d
}

// inMarketHours checks whether a WIB time falls within IDX trading sessions:
//   - Session 1: 09:00–11:30
//   - Session 2: 13:30–16:00
func inMarketHours(t time.Time) bool {
	m := t.In(wib).Hour()*60 + t.In(wib).Minute()
	return (m >= 9*60 && m < 11*60+30) || (m >= 13*60+30 && m < 16*60)
}

// ── Yahoo Finance client ──────────────────────────────────────────────────────

type yfClient struct {
	http  *http.Client
	crumb string
}

func newYFClient(ctx context.Context) (*yfClient, error) {
	jar, _ := cookiejar.New(nil)
	c := &http.Client{Jar: jar, Timeout: 30 * time.Second}

	// Step 1: visit Yahoo Finance to obtain session cookies.
	req, _ := http.NewRequestWithContext(ctx, "GET", "https://finance.yahoo.com/", nil)
	req.Header.Set("User-Agent", userAgent)
	req.Header.Set("Accept", "text/html,application/xhtml+xml")
	resp, err := c.Do(req)
	if err != nil {
		return nil, fmt.Errorf("yahoo init: %w", err)
	}
	resp.Body.Close()

	// Step 2: fetch crumb token.
	req2, _ := http.NewRequestWithContext(ctx, "GET",
		"https://query2.finance.yahoo.com/v1/test/getcrumb", nil)
	req2.Header.Set("User-Agent", userAgent)
	resp2, err := c.Do(req2)
	if err != nil {
		return nil, fmt.Errorf("yahoo crumb request: %w", err)
	}
	defer resp2.Body.Close()
	b, _ := io.ReadAll(resp2.Body)
	crumb := strings.TrimSpace(string(b))
	if crumb == "" || strings.HasPrefix(crumb, "<") {
		return nil, fmt.Errorf("invalid crumb (got %q)", clip(crumb, 80))
	}
	log.Printf("yahoo crumb ok (%s…)", clip(crumb, 8))
	return &yfClient{http: c, crumb: crumb}, nil
}

// ── Yahoo Finance chart API ───────────────────────────────────────────────────

// chartResult holds the parsed v8/finance/chart response.
type chartResult struct {
	Meta struct {
		Symbol             string  `json:"symbol"`
		PreviousClose      float64 `json:"previousClose"`
		RegularMarketPrice float64 `json:"regularMarketPrice"`
		SharesOutstanding  float64 `json:"sharesOutstanding"`
		TrailingPE         float64 `json:"trailingPE"`
	} `json:"meta"`
	Timestamp  []int64 `json:"timestamp"`
	Indicators struct {
		Quote []struct {
			Open   []*float64 `json:"open"`
			High   []*float64 `json:"high"`
			Low    []*float64 `json:"low"`
			Close  []*float64 `json:"close"`
			Volume []*float64 `json:"volume"`
		} `json:"quote"`
	} `json:"indicators"`
}

func (y *yfClient) fetchChart(ctx context.Context, symbol string, p1, p2 int64, interval string) (*chartResult, error) {
	u := fmt.Sprintf(
		"https://query1.finance.yahoo.com/v8/finance/chart/%s?period1=%d&period2=%d&interval=%s&includePrePost=false&crumb=%s",
		url.PathEscape(symbol), p1, p2, interval, url.QueryEscape(y.crumb),
	)
	req, _ := http.NewRequestWithContext(ctx, "GET", u, nil)
	req.Header.Set("User-Agent", userAgent)
	req.Header.Set("Accept", "application/json")

	resp, err := y.http.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("HTTP %d: %s", resp.StatusCode, clip(string(body), 120))
	}

	var envelope struct {
		Chart struct {
			Result []*chartResult `json:"result"`
			Error  *struct {
				Code        string `json:"code"`
				Description string `json:"description"`
			} `json:"error"`
		} `json:"chart"`
	}
	if err := json.Unmarshal(body, &envelope); err != nil {
		return nil, fmt.Errorf("json decode: %w", err)
	}
	if envelope.Chart.Error != nil {
		return nil, fmt.Errorf("yahoo: %s — %s", envelope.Chart.Error.Code, envelope.Chart.Error.Description)
	}
	if len(envelope.Chart.Result) == 0 || envelope.Chart.Result[0] == nil {
		return nil, fmt.Errorf("empty result")
	}
	return envelope.Chart.Result[0], nil
}

// ── Bar processing ────────────────────────────────────────────────────────────

type bar struct {
	code    string
	barTime time.Time // UTC
	open    int64
	high    int64
	low     int64
	close   int64
	volume  int64
}

func ptrToIDR(f *float64) int64 {
	if f == nil || *f <= 0 {
		return 0
	}
	return int64(*f)
}

func ptrToInt64(f *float64) int64 {
	if f == nil {
		return 0
	}
	return int64(*f)
}

func minInt(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func processStock(ctx context.Context, y *yfClient, pool *pgxpool.Pool, code string, replayDate time.Time) error {
	sym := code + ".JK"
	p1 := time.Date(replayDate.Year(), replayDate.Month(), replayDate.Day(), 0, 0, 0, 0, wib).Unix()
	p2 := p1 + 86400

	res, err := y.fetchChart(ctx, sym, p1, p2, "1m")
	if err != nil {
		return fmt.Errorf("1m fetch: %w", err)
	}

	if len(res.Timestamp) == 0 || len(res.Indicators.Quote) == 0 {
		return fmt.Errorf("no chart data")
	}
	q := res.Indicators.Quote[0]
	n := minInt(len(res.Timestamp), minInt(len(q.Close), minInt(len(q.Open), minInt(len(q.High), len(q.Low)))))

	var bars []bar
	for i := 0; i < n; i++ {
		if q.Close[i] == nil || *q.Close[i] <= 0 {
			continue
		}
		t := time.Unix(res.Timestamp[i], 0)
		if !inMarketHours(t) {
			continue
		}
		bars = append(bars, bar{
			code:    code,
			barTime: t.UTC(),
			open:    ptrToIDR(q.Open[i]),
			high:    ptrToIDR(q.High[i]),
			low:     ptrToIDR(q.Low[i]),
			close:   ptrToIDR(q.Close[i]),
			volume:  ptrToInt64(q.Volume[i]),
		})
	}
	if len(bars) == 0 {
		return fmt.Errorf("no bars within market hours")
	}

	// ── Insert into DB ──────────────────────────────────────────────────

	tx, err := pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback(ctx) //nolint:errcheck

	for _, b := range bars {
		if _, err := tx.Exec(ctx, `
			INSERT INTO stock_minute_bars (stock_code, bar_time, open, high, low, close, volume)
			VALUES ($1,$2,$3,$4,$5,$6,$7)
			ON CONFLICT (stock_code, bar_time) DO UPDATE SET
			  open=EXCLUDED.open, high=EXCLUDED.high,
			  low=EXCLUDED.low, close=EXCLUDED.close, volume=EXCLUDED.volume
		`, b.code, b.barTime, b.open, b.high, b.low, b.close, b.volume); err != nil {
			return fmt.Errorf("insert bar: %w", err)
		}
	}

	// ── Daily snapshot ──────────────────────────────────────────────────

	first, last := bars[0], bars[len(bars)-1]
	priceClose := last.close
	pctChg := 0.0
	if first.open > 0 {
		pctChg = float64(priceClose-first.open) / float64(first.open) * 100
	}

	var totalVol int64
	var dayHigh, dayLow int64 = first.high, first.low
	for _, b := range bars {
		totalVol += b.volume
		if b.high > dayHigh {
			dayHigh = b.high
		}
		if b.low < dayLow {
			dayLow = b.low
		}
	}

	if _, err := tx.Exec(ctx, `
		INSERT INTO stock_daily_snapshots
		  (stock_code, snapshot_date, price_close, price_change_pct,
		   volume_label, market_cap_label, pe_ratio)
		VALUES ($1,$2,$3,$4,$5,$6,$7)
		ON CONFLICT (stock_code, snapshot_date) DO UPDATE SET
		  price_close=EXCLUDED.price_close,
		  price_change_pct=EXCLUDED.price_change_pct,
		  volume_label=EXCLUDED.volume_label,
		  market_cap_label=EXCLUDED.market_cap_label,
		  pe_ratio=EXCLUDED.pe_ratio
	`, code, replayDate.Format("2006-01-02"), priceClose,
		round2(pctChg), fmtVolume(totalVol),
		fmtMarketCap(priceClose, res.Meta.SharesOutstanding),
		fmtPE(res.Meta.TrailingPE),
	); err != nil {
		return fmt.Errorf("insert snapshot: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("commit: %w", err)
	}

	log.Printf("  %-6s %d bars  close=Rp%d  %.2f%%", code, len(bars), priceClose, pctChg)
	return nil
}

// ── Formatters ────────────────────────────────────────────────────────────────

func fmtVolume(v int64) string {
	switch {
	case v >= 1_000_000_000:
		return fmt.Sprintf("%.1fM lot", float64(v)/1_000_000_000)
	case v >= 1_000_000:
		return fmt.Sprintf("%.1fjt lot", float64(v)/1_000_000)
	case v >= 1_000:
		return fmt.Sprintf("%.1frb lot", float64(v)/1_000)
	default:
		return fmt.Sprintf("%d lot", v)
	}
}

func fmtMarketCap(close int64, shares float64) string {
	if shares == 0 {
		return "—"
	}
	mc := float64(close) * shares
	switch {
	case mc >= 1e12:
		return fmt.Sprintf("Rp%.1fT", mc/1e12)
	case mc >= 1e9:
		return fmt.Sprintf("Rp%.1fM", mc/1e9)
	default:
		return fmt.Sprintf("Rp%.0fjt", mc/1e6)
	}
}

func fmtPE(pe float64) string {
	if pe <= 0 || math.IsNaN(pe) || math.IsInf(pe, 0) {
		return "N/A"
	}
	return fmt.Sprintf("%.1fx", pe)
}

func round2(f float64) float64 { return math.Round(f*100) / 100 }

func clip(s string, n int) string {
	if len(s) <= n {
		return s
	}
	return s[:n] + "…"
}

// ── Main ──────────────────────────────────────────────────────────────────────

func main() {
	_ = godotenv.Load(".env")
	_ = godotenv.Overload(filepath.Join("backend", ".env"))

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL is not set")
	}

	ctx := context.Background()

	pool, err := pgxpool.New(ctx, dbURL)
	if err != nil {
		log.Fatalf("connect db: %v", err)
	}
	defer pool.Close()

	replayDate := lastTradingDay()
	log.Printf("Fetching intraday data — replay date: %s", replayDate.Format("2006-01-02 (Mon)"))

	yf, err := newYFClient(ctx)
	if err != nil {
		log.Fatalf("init yahoo finance: %v", err)
	}

	var ok, fail int
	for _, code := range stockCodes {
		if err := processStock(ctx, yf, pool, code, replayDate); err != nil {
			log.Printf("  %-6s FAILED — %v", code, err)
			fail++
		} else {
			ok++
		}
		// Polite delay to avoid Yahoo rate-limiting.
		time.Sleep(600 * time.Millisecond)
	}

	log.Printf("\nDone: %d ok, %d failed — replay date %s", ok, fail, replayDate.Format("2006-01-02"))
}
