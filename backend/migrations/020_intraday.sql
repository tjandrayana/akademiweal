-- Intraday minute bars: stores previous trading day's 1-min OHLCV.
-- The fetcher (scripts/fetch_intraday.py) runs daily before market open.
-- Today's Arena replays yesterday's data at the same clock time.

CREATE TABLE IF NOT EXISTS stock_minute_bars (
  id          BIGSERIAL PRIMARY KEY,
  stock_code  TEXT NOT NULL REFERENCES stocks(code),
  bar_time    TIMESTAMPTZ NOT NULL,   -- actual historical timestamp (yesterday)
  open        BIGINT NOT NULL,
  high        BIGINT NOT NULL,
  low         BIGINT NOT NULL,
  close       BIGINT NOT NULL,
  volume      BIGINT NOT NULL DEFAULT 0,
  UNIQUE(stock_code, bar_time)
);
CREATE INDEX IF NOT EXISTS idx_minute_bars_lookup ON stock_minute_bars(stock_code, bar_time DESC);

-- Expand stock universe: LQ45 blue chips (Yahoo Finance: <CODE>.JK)
INSERT INTO stocks (code, name, sector, is_premium) VALUES
  ('BMRI', 'Bank Mandiri',                'Perbankan',      FALSE),
  ('BBNI', 'Bank Negara Indonesia',       'Perbankan',      FALSE),
  ('BRIS', 'Bank Syariah Indonesia',      'Perbankan',      FALSE),
  ('ANTM', 'Aneka Tambang',              'Pertambangan',   FALSE),
  ('PTBA', 'Bukit Asam',                 'Pertambangan',   FALSE),
  ('ADRO', 'Adaro Energy Indonesia',     'Pertambangan',   FALSE),
  ('ITMG', 'Indo Tambangraya Megah',     'Pertambangan',   FALSE),
  ('UNVR', 'Unilever Indonesia',          'Konsumer',       FALSE),
  ('ICBP', 'Indofood CBP',               'Konsumer',       FALSE),
  ('INDF', 'Indofood Sukses Makmur',     'Konsumer',       FALSE),
  ('MYOR', 'Mayora Indah',               'Konsumer',       FALSE),
  ('HMSP', 'HM Sampoerna',               'Konsumer',       FALSE),
  ('GGRM', 'Gudang Garam',               'Konsumer',       FALSE),
  ('CPIN', 'Charoen Pokphand Indonesia', 'Konsumer',       FALSE),
  ('KLBF', 'Kalbe Farma',                'Kesehatan',      FALSE),
  ('SIDO', 'Industri Jamu Sido Muncul',  'Kesehatan',      FALSE),
  ('SMGR', 'Semen Indonesia',            'Industri',       FALSE),
  ('INTP', 'Indocement Tunggal',         'Industri',       FALSE),
  ('PGAS', 'Perusahaan Gas Negara',      'Energi',         FALSE),
  ('EXCL', 'XL Axiata',                  'Telekomunikasi', FALSE),
  ('TOWR', 'Sarana Menara Nusantara',    'Telekomunikasi', FALSE),
  ('UNTR', 'United Tractors',            'Otomotif',       FALSE),
  ('JSMR', 'Jasa Marga',                 'Infrastruktur',  FALSE),
  ('WIKA', 'Wijaya Karya',               'Infrastruktur',  FALSE)
ON CONFLICT (code) DO NOTHING;
