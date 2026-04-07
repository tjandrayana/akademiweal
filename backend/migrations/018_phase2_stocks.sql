-- Phase 2A: Stock feed tables + seed data.
-- stocks: static registry. stock_daily_snapshots: one row per stock per day (AI-generated).

CREATE TABLE IF NOT EXISTS stocks (
  code        TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  sector      TEXT,
  is_premium  BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS stock_daily_snapshots (
  id                 BIGSERIAL PRIMARY KEY,
  stock_code         TEXT NOT NULL REFERENCES stocks(code),
  snapshot_date      DATE NOT NULL,
  price_close        NUMERIC(12,2),
  price_change_pct   NUMERIC(6,2),
  volume_label       TEXT,
  market_cap_label   TEXT,
  pe_ratio           TEXT,
  ai_summary         TEXT,
  quiz_question      TEXT,
  quiz_options       JSONB,
  quiz_correct_index INT,
  quiz_explanation   TEXT,
  UNIQUE(stock_code, snapshot_date)
);

-- Stock registry (5 IDX blue chips; ASII is premium-only)
INSERT INTO stocks (code, name, sector, is_premium) VALUES
  ('BBCA', 'Bank Central Asia',    'Perbankan',       FALSE),
  ('BBRI', 'Bank Rakyat Indonesia','Perbankan',       FALSE),
  ('GOTO', 'GoTo Gojek Tokopedia', 'Teknologi',       FALSE),
  ('TLKM', 'Telkom Indonesia',     'Telekomunikasi',  FALSE),
  ('ASII', 'Astra International',  'Otomotif',        TRUE)
ON CONFLICT (code) DO NOTHING;

-- Seed snapshot for 2026-04-03 (latest wins when cron not yet running)
INSERT INTO stock_daily_snapshots
  (stock_code, snapshot_date, price_close, price_change_pct, volume_label, market_cap_label, pe_ratio, ai_summary, quiz_question, quiz_options, quiz_correct_index, quiz_explanation)
VALUES
(
  'BBCA', '2026-04-03', 9575, 2.1, '+34%', 'Rp1.175T', '24.3x',
  'BBCA naik 2.1% setelah Bank Indonesia mempertahankan suku bunga acuan di 5.75%. Keputusan ini positif bagi bank dengan Net Interest Margin tinggi karena biaya dana tidak naik. Volume transaksi meningkat 34% di atas rata-rata 30 hari.',
  'Mengapa BI menahan suku bunga bisa positif untuk saham bank seperti BBCA?',
  '["Karena bunga pinjaman tetap tinggi, margin keuntungan bank terjaga","Karena bank mendapat dana lebih murah dari BI langsung","Karena suku bunga rendah otomatis mendorong orang nabung di bank"]'::jsonb,
  0,
  'Ketika BI menahan suku bunga, biaya dana (cost of fund) bank tidak naik. Sementara bunga pinjaman yang sudah ada tetap tinggi. Selisih ini disebut Net Interest Margin (NIM) — BBCA punya NIM tertinggi di industri, sekitar 5.8%.'
),
(
  'BBRI', '2026-04-03', 4120, 1.4, '+18%', 'Rp625T', '12.1x',
  'Sentimen positif dari laporan NPL yang membaik ke 2.98% di kuartal terakhir. Penurunan kredit macet ini menunjukkan kualitas portofolio BBRI membaik, terutama di segmen UMKM yang jadi core business mereka.',
  'Apa itu NPL dan mengapa penurunannya menjadi sinyal positif untuk saham bank?',
  '["NPL adalah laba bersih; penurunannya berarti bank lebih hemat","NPL adalah kredit macet; penurunannya berarti risiko gagal bayar berkurang","NPL adalah jumlah nasabah baru; penurunannya berarti pertumbuhan melambat"]'::jsonb,
  1,
  'Non-Performing Loan (NPL) adalah rasio kredit bermasalah terhadap total kredit. Semakin rendah NPL, semakin sedikit kredit yang gagal dibayar. Ini mengurangi risiko kerugian bank dan meningkatkan kepercayaan investor.'
),
(
  'GOTO', '2026-04-03', 87, -3.3, '+52%', 'Rp107T', 'N/A',
  'Tekanan jual dari isu divestasi saham Alibaba Group di pasar sekunder. Alibaba dikabarkan melepas sebagian kepemilikannya di GOTO, memicu kekhawatiran oversupply saham di pasar dan menekan harga.',
  'Mengapa aksi jual oleh investor besar seperti Alibaba bisa menekan harga saham GOTO?',
  '["Karena Alibaba akan menghapus fitur Tokopedia dari platformnya","Karena pasokan saham bertambah tiba-tiba sementara permintaan tetap sama","Karena ini berarti GOTO akan bangkrut dalam waktu dekat"]'::jsonb,
  1,
  'Saat pemegang saham besar menjual dalam jumlah besar, supply saham di pasar meningkat drastis. Jika permintaan (demand) tidak ikut naik, harga tertekan turun — ini hukum dasar supply & demand yang berlaku di pasar saham.'
),
(
  'TLKM', '2026-04-03', 3240, 0.6, '+11%', 'Rp321T', '17.8x',
  'Stabil menyusul pengumuman kemitraan infrastruktur data center dengan Microsoft Azure. Kemitraan ini berpotensi menambah pendapatan segmen enterprise TLKM yang sudah berkontribusi sekitar 40% dari total revenue.',
  'Mengapa kemitraan dengan perusahaan teknologi besar bisa meningkatkan nilai saham TLKM?',
  '["Karena TLKM akan segera diakuisisi oleh Microsoft","Karena membuka aliran pendapatan baru dari segmen enterprise yang tumbuh pesat","Karena harga saham Microsoft otomatis mendongkrak TLKM"]'::jsonb,
  1,
  'Kemitraan strategis membuka akses ke segmen klien enterprise yang punya margin lebih tinggi. Data center adalah industri yang tumbuh pesat seiring adopsi cloud — dan TLKM sudah punya infrastruktur jaringan kuat sebagai modal utama.'
),
(
  'ASII', '2026-04-03', 5150, -0.9, '+8%', 'Rp208T', '11.4x',
  'Koreksi tipis di tengah kekhawatiran perlambatan penjualan mobil domestik. Data Gaikindo menunjukkan penjualan wholesale turun 4.2% YoY di bulan lalu, menekan sentimen saham otomotif secara keseluruhan.',
  'Apa yang dimaksud dengan data penjualan wholesale dalam konteks industri otomotif?',
  '["Penjualan langsung ke konsumen akhir di showroom","Penjualan dari pabrikan atau distributor ke dealer","Penjualan ekspor ke pasar luar negeri"]'::jsonb,
  1,
  'Wholesale dalam otomotif mengacu pada penjualan dari pabrikan (seperti Toyota/Honda) ke jaringan dealer — bukan ke konsumen akhir. Ini indikator awal permintaan sebelum retail sales tercatat.'
)
ON CONFLICT (stock_code, snapshot_date) DO NOTHING;
