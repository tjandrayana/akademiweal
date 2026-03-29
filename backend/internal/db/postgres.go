package db

import (
	"context"
	"fmt"
	"net"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Config holds PostgreSQL connection settings loaded from the environment.
type Config struct {
	Host     string
	HostAddr string // optional; IPv4/IPv6 literal to dial (avoids broken IPv6 DNS when unset)
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string

	MaxOpenConns    int
	MaxIdleConns    int
	ConnMaxLifetime time.Duration
	ConnMaxIdleTime time.Duration
}

func getEnv(key, defaultVal string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return defaultVal
}

func getEnvInt(key string, defaultVal int) int {
	v := os.Getenv(key)
	if v == "" {
		return defaultVal
	}
	n, err := strconv.Atoi(v)
	if err != nil {
		return defaultVal
	}
	return n
}

func getEnvDuration(key string, defaultVal time.Duration) time.Duration {
	v := os.Getenv(key)
	if v == "" {
		return defaultVal
	}
	d, err := time.ParseDuration(v)
	if err != nil {
		return defaultVal
	}
	return d
}

// ConfigFromEnv builds Config from environment variables.
//
// Primary: DB_HOST, DB_HOSTADDR (optional), DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, DB_SSLMODE
// (password may contain & * ( etc.; encoded in dsn via url.UserPassword).
// DB_PREFER_IPV4: optional; set to true/1 when a remote host (e.g. Supabase) needs IPv4-only DNS/dial.
// Pooling: DB_MAX_OPEN_CONNS, DB_MAX_IDLE_CONNS, DB_CONN_MAX_LIFETIME, DB_CONN_MAX_IDLE_TIME
//
// DATABASE_URL is used only when DB_HOST is not set in the environment (e.g. some deploy pipelines).
func ConfigFromEnv() Config {
	return Config{
		Host:     strings.TrimSpace(getEnv("DB_HOST", "localhost")),
		HostAddr: strings.TrimSpace(os.Getenv("DB_HOSTADDR")),
		Port:     strings.TrimSpace(getEnv("DB_PORT", "5432")),
		User:     strings.TrimSpace(getEnv("DB_USER", "postgres")),
		Password: getEnv("DB_PASSWORD", "postgres"),
		DBName:   strings.TrimSpace(getEnv("DB_NAME", "akademiweal")),
		SSLMode:  strings.TrimSpace(getEnv("DB_SSLMODE", "disable")),

		MaxOpenConns:    getEnvInt("DB_MAX_OPEN_CONNS", 25),
		MaxIdleConns:    getEnvInt("DB_MAX_IDLE_CONNS", 5),
		ConnMaxLifetime: getEnvDuration("DB_CONN_MAX_LIFETIME", 5*time.Minute),
		ConnMaxIdleTime: getEnvDuration("DB_CONN_MAX_IDLE_TIME", time.Minute),
	}
}

// dsn builds a postgresql:// connection string from discrete DB_* env fields.
func (c Config) dsn() string {
	u := url.URL{
		Scheme: "postgresql",
		User:   url.UserPassword(c.User, c.Password),
		Path:   "/" + strings.TrimPrefix(c.DBName, "/"),
		Host:   net.JoinHostPort(c.Host, c.Port),
	}
	q := url.Values{}
	q.Set("sslmode", c.SSLMode)
	// if c.HostAddr != "" {
	// 	q.Set("hostaddr", c.HostAddr)
	// }
	u.RawQuery = q.Encode()
	return u.String()
}

// preferIPv4FromEnv is opt-in only. The old default (treat “unset” as true) added hostaddr= for
// localhost and triggered FATAL: unrecognized configuration parameter "hostaddr" (SQLSTATE 42704)
// on some local Postgres builds. Remote IPv6 issues: set DB_PREFER_IPV4=true.
func preferIPv4FromEnv() bool {
	v := strings.ToLower(strings.TrimSpace(os.Getenv("DB_PREFER_IPV4")))
	return v == "true" || v == "1" || v == "yes"
}

// lookupIPv4Strings returns hostnames or IPv4 literals suitable for tcp4 dialing — never IPv6 (tcp4 cannot dial v6).
func lookupIPv4Strings(ctx context.Context, host string) ([]string, error) {
	if host == "" {
		return nil, fmt.Errorf("empty host")
	}
	if ip := net.ParseIP(host); ip != nil {
		if ip.To4() != nil {
			return []string{ip.String()}, nil
		}
		return nil, fmt.Errorf("host is an IPv6 literal %q; omit DB_PREFER_IPV4 or use DB_HOSTADDR with an IPv4 address", host)
	}
	var sys net.Resolver
	ips, err := sys.LookupIP(ctx, "ip4", host)
	if err == nil && len(ips) > 0 {
		return ipsToStrings(ips), nil
	}
	// Some resolvers omit A records; ask a public DNS explicitly.
	ips2, err2 := lookupIPv4ViaPublicDNS(ctx, host)
	if err2 == nil && len(ips2) > 0 {
		return ipsToStrings(ips2), nil
	}
	if err2 != nil {
		if err != nil {
			return nil, fmt.Errorf("IPv4 lookup for %q: system: %v; public DNS: %w", host, err, err2)
		}
		return nil, fmt.Errorf("IPv4 lookup for %q (public DNS): %w", host, err2)
	}
	if err != nil {
		return nil, fmt.Errorf("IPv4 lookup for %q: %w", host, err)
	}
	return nil, fmt.Errorf("no IPv4 (A) record for %q; set DB_HOSTADDR to the IPv4 from `dig +short A <host>`", host)
}

func ipsToStrings(ips []net.IP) []string {
	out := make([]string, len(ips))
	for i, ip := range ips {
		out[i] = ip.String()
	}
	return out
}

// lookupIPv4ViaPublicDNS asks Google Public DNS directly (UDP) for A records when the system resolver returns none.
func lookupIPv4ViaPublicDNS(ctx context.Context, host string) ([]net.IP, error) {
	r := &net.Resolver{
		PreferGo: true,
		Dial: func(ctx context.Context, network, _ string) (net.Conn, error) {
			d := net.Dialer{Timeout: 8 * time.Second}
			return d.DialContext(ctx, "udp", "8.8.8.8:53")
		},
	}
	return r.LookupIP(ctx, "ip4", host)
}

func preferIPv4Lookup(ctx context.Context, host string) ([]string, error) {
	return lookupIPv4Strings(ctx, host)
}

// augmentDSNWithIPv4Hostaddr adds hostaddr=<IPv4> to postgresql:// URIs when an A record exists.
// Forces the TCP dial to IPv4 even if LookupFunc were ignored or mis-ordered.
func augmentDSNWithIPv4Hostaddr(dsn string) string {
	if !preferIPv4FromEnv() {
		return dsn
	}
	u, err := url.Parse(dsn)
	if err != nil {
		return dsn
	}
	if u.Scheme != "postgres" && u.Scheme != "postgresql" {
		return dsn
	}
	q := u.Query()
	if q.Get("hostaddr") != "" {
		return dsn
	}
	host := u.Hostname()
	if host == "" || net.ParseIP(host) != nil {
		return dsn
	}
	h := strings.ToLower(host)
	if h == "localhost" || h == "127.0.0.1" || h == "::1" {
		return dsn
	}
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	ips, err := lookupIPv4Strings(ctx, host)
	if err != nil || len(ips) == 0 {
		return dsn
	}
	q.Set("hostaddr", ips[0])
	u.RawQuery = q.Encode()
	return u.String()
}

func applyPoolConfig(pcfg *pgxpool.Config, cfg Config) {
	pcfg.MaxConns = int32(cfg.MaxOpenConns)
	pcfg.MinIdleConns = int32(cfg.MaxIdleConns)
	pcfg.MaxConnLifetime = cfg.ConnMaxLifetime
	pcfg.MaxConnIdleTime = cfg.ConnMaxIdleTime
}

// applyPgxQueryExecMode defaults to the simple query protocol so pgx does not register server-side
// named prepared statements (stmtcache_*). Those conflict with PgBouncer transaction pooling,
// RDS Proxy, and similar proxies, producing SQLSTATE 42P05 ("prepared statement … already exists").
// Set DB_PGX_USE_PREPARED_STATEMENTS=1 to restore pgx's default extended protocol + statement cache.
func applyPgxQueryExecMode(pcfg *pgxpool.Config) {
	if strings.TrimSpace(os.Getenv("DB_PGX_USE_PREPARED_STATEMENTS")) == "1" {
		return
	}
	pcfg.ConnConfig.DefaultQueryExecMode = pgx.QueryExecModeSimpleProtocol
}

// applyForceIPv4DialAndLookup forces TCP over IPv4 (critical for Supabase when IPv6 is unroutable) and prefers A-record DNS.
// Unix-socket connections keep pgx's default dialer from ParseConfig. ConnectTimeout from DSN is preserved on the dialer.
func applyForceIPv4DialAndLookup(pcfg *pgxpool.Config) {
	if !preferIPv4FromEnv() {
		return
	}
	defaultDial := pcfg.ConnConfig.DialFunc
	if defaultDial == nil {
		return
	}
	timeout := pcfg.ConnConfig.ConnectTimeout
	pcfg.ConnConfig.DialFunc = func(ctx context.Context, network, addr string) (net.Conn, error) {
		if network != "tcp" {
			return defaultDial(ctx, network, addr)
		}
		host, _, splitErr := net.SplitHostPort(addr)
		if splitErr == nil {
			if ip := net.ParseIP(host); ip != nil && ip.To4() == nil {
				// IPv6 literal — tcp4 cannot be used; delegate to default dialer.
				return defaultDial(ctx, network, addr)
			}
		}
		var d net.Dialer
		if timeout > 0 {
			d.Timeout = timeout
		}
		return d.DialContext(ctx, "tcp4", addr)
	}
	pcfg.ConnConfig.LookupFunc = func(ctx context.Context, host string) ([]string, error) {
		addrs, err := preferIPv4Lookup(ctx, host)
		if err == nil && len(addrs) > 0 {
			return addrs, nil
		}
		// IPv4-only lookup failed (host may have AAAA records only, or DNS returned nothing).
		// Fall back to the system resolver so cloud hosts like Supabase still connect.
		var sys net.Resolver
		fallback, sysErr := sys.LookupHost(ctx, host)
		if sysErr != nil {
			return nil, fmt.Errorf("DNS lookup for %q: IPv4: %v; fallback: %w", host, err, sysErr)
		}
		return fallback, nil
	}
}

// OpenPostgres opens a pgx pool using the given config.
func OpenPostgres(cfg Config) (*DB, error) {
	return openPostgresDSN(cfg.dsn(), cfg)
}

// ensureSSLMode adds sslmode=require to the DSN when no sslmode is present and the host is
// non-local. This makes DATABASE_URL from Supabase (and other cloud providers) work out of
// the box without requiring the caller to append ?sslmode=require manually.
// An explicitly set sslmode (require, disable, prefer, …) is always preserved as-is.
func ensureSSLMode(dsn string) string {
	u, err := url.Parse(dsn)
	if err != nil {
		return dsn
	}
	if u.Scheme != "postgres" && u.Scheme != "postgresql" {
		return dsn
	}
	q := u.Query()
	if q.Get("sslmode") != "" {
		return dsn // already explicit — don't override
	}
	host := u.Hostname()
	if host == "localhost" || host == "127.0.0.1" || host == "::1" || host == "" {
		return dsn // local dev — leave as-is
	}
	q.Set("sslmode", "require")
	u.RawQuery = q.Encode()
	return u.String()
}

// openPostgresDSN builds a pool from a libpq URI (same as pgx.Connect / DATABASE_URL).
func openPostgresDSN(dsn string, poolCfg Config) (*DB, error) {
	dsn = ensureSSLMode(dsn)
	dsn = augmentDSNWithIPv4Hostaddr(dsn)
	pcfg, err := pgxpool.ParseConfig(dsn)
	if err != nil {
		return nil, err
	}
	applyForceIPv4DialAndLookup(pcfg)
	applyPoolConfig(pcfg, poolCfg)
	applyPgxQueryExecMode(pcfg)

	ctx := context.Background()
	pool, err := pgxpool.NewWithConfig(ctx, pcfg)
	if err != nil {
		return nil, err
	}
	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, err
	}

	return &DB{Pool: pool}, nil
}

// OpenFromEnv opens PostgreSQL. If DB_HOST is present in the environment, discrete DB_* vars are used (recommended).
// Otherwise DATABASE_URL is used when set; if neither applies, defaults from ConfigFromEnv (local postgres).
func OpenFromEnv() (*DB, error) {
	cfg := ConfigFromEnv()
	if _, set := os.LookupEnv("DB_HOST"); set {
		return OpenPostgres(cfg)
	}
	if u := strings.TrimSpace(os.Getenv("DATABASE_URL")); u != "" {
		return openPostgresDSN(u, cfg)
	}
	return OpenPostgres(cfg)
}
