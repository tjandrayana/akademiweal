-- Paper Trading Arena: daily virtual trading with limit orders.
-- Season = one trading day. Starting capital = Rp 10,000,000 per user per day.

CREATE TABLE arena_seasons (
  id         BIGSERIAL PRIMARY KEY,
  date       DATE NOT NULL UNIQUE,
  status     TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE arena_portfolios (
  id        BIGSERIAL PRIMARY KEY,
  user_id   BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  season_id BIGINT NOT NULL REFERENCES arena_seasons(id),
  cash      BIGINT NOT NULL DEFAULT 10000000,  -- available cash in IDR (not reserved)
  UNIQUE(user_id, season_id)
);

CREATE INDEX idx_arena_portfolios_season ON arena_portfolios(season_id);

CREATE TABLE arena_holdings (
  id                   BIGSERIAL PRIMARY KEY,
  user_id              BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  season_id            BIGINT NOT NULL REFERENCES arena_seasons(id),
  stock_code           TEXT NOT NULL REFERENCES stocks(code),
  lots                 INT NOT NULL DEFAULT 0 CHECK(lots >= 0),
  avg_price_per_share  BIGINT NOT NULL DEFAULT 0,
  UNIQUE(user_id, season_id, stock_code)
);

CREATE TABLE arena_orders (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  season_id   BIGINT NOT NULL REFERENCES arena_seasons(id),
  stock_code  TEXT NOT NULL REFERENCES stocks(code),
  order_type  TEXT NOT NULL CHECK(order_type IN ('buy','sell')),
  lots        INT NOT NULL CHECK(lots > 0),
  limit_price BIGINT NOT NULL CHECK(limit_price > 0),
  status      TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','filled','cancelled','expired')),
  filled_price BIGINT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  filled_at   TIMESTAMPTZ
);

CREATE INDEX idx_arena_orders_user_season  ON arena_orders(user_id, season_id);
CREATE INDEX idx_arena_orders_pending      ON arena_orders(status, season_id) WHERE status = 'pending';

alter table public.arena_seasons enable row level security;
alter table public.arena_portfolios enable row level security;
alter table public.arena_holdings enable row level security;
alter table public.arena_orders enable row level security;