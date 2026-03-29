-- Replace curriculum with 80 lessons (8 zones × 10 steps) for full map parity.
-- Map order: level 1 = langkah 1–10 (zona 1), level 2 = 11–20, … level 8 = 71–80.
-- Requires: no FK to lessons (see 001–009).

TRUNCATE lessons RESTART IDENTITY CASCADE;

INSERT INTO lessons (level, title, hook, body, question, options, answer)
SELECT
  ((n - 1) / 10) + 1 AS level,
  'Langkah ' || LPAD(n::text, 3, '0') || ' · Zona ' || (((n - 1) / 10) + 1),
  'Terus melangkah — kebiasaan belajar membentuk hasil jangka panjang.',
  'Kuis singkat menguatkan konsep sebelum kamu lanjut ke langkah berikutnya.',
  CASE ((n - 1) % 10)
    WHEN 0 THEN 'Fungsi uang sebagai alat tukar berarti?'
    WHEN 1 THEN 'Inflasi cenderung mempengaruhi daya beli dengan cara?'
    WHEN 2 THEN 'Hubungan umum risiko dan imbal hasil yang wajar?'
    WHEN 3 THEN 'Ide utama diversifikasi portofolio adalah?'
    WHEN 4 THEN 'Deposito umumnya memiliki ciri?'
    WHEN 5 THEN 'Reksa dana dikelola oleh?'
    WHEN 6 THEN 'Membeli saham berarti memiliki?'
    WHEN 7 THEN 'Volatilitas pasar mengindikasikan?'
    WHEN 8 THEN 'Sebelum menambah investasi, prioritas umum yang bijak?'
    WHEN 9 THEN 'Alasan memilih horizon investasi lebih panjang?'
  END,
  CASE ((n - 1) % 10)
    WHEN 0 THEN '["Hanya hiasan","Mempermudah pertukaran barang/jasa","Menghapus harga"]'::jsonb
    WHEN 1 THEN '["Harga barang turun terus","Nilai uang terhadap barang bisa turun","Semua barang gratis"]'::jsonb
    WHEN 2 THEN '["Return tinggi tanpa risiko","Biasanya return lebih tinggi mengikuti risiko lebih besar","Risiko hanya di obligasi"]'::jsonb
    WHEN 3 THEN '["Semua uang di satu saham","Menyebar ke berbagai aset/sektor","Menghindari semua instrumen"]'::jsonb
    WHEN 4 THEN '["Bebas tarik kapan saja","Dana terkunci periode tertentu","Tanpa bunga"]'::jsonb
    WHEN 5 THEN '["Investor perorangan saja","Manajer investasi sesuai prospektus","Tanpa regulasi"]'::jsonb
    WHEN 6 THEN '["Hutang ke perusahaan","Kepemilikan sebagian perusahaan","Jaminan untung"]'::jsonb
    WHEN 7 THEN '["Harga tidak berubah","Harga bisa berfluktuasi","Harga selalu naik"]'::jsonb
    WHEN 8 THEN '["Utang kartu dulu","Dana darurat dan utang terkendali","Ikuti rumor"]'::jsonb
    WHEN 9 THEN '["Menghindari bunga majemuk","Mengurangi noise jangka pendek dan memberi waktu tumbuh","Menjamin tidak ada risiko"]'::jsonb
  END,
  CASE ((n - 1) % 10)
    WHEN 0 THEN 'Mempermudah pertukaran barang/jasa'
    WHEN 1 THEN 'Nilai uang terhadap barang bisa turun'
    WHEN 2 THEN 'Biasanya return lebih tinggi mengikuti risiko lebih besar'
    WHEN 3 THEN 'Menyebar ke berbagai aset/sektor'
    WHEN 4 THEN 'Dana terkunci periode tertentu'
    WHEN 5 THEN 'Manajer investasi sesuai prospektus'
    WHEN 6 THEN 'Kepemilikan sebagian perusahaan'
    WHEN 7 THEN 'Harga bisa berfluktuasi'
    WHEN 8 THEN 'Dana darurat dan utang terkendali'
    WHEN 9 THEN 'Mengurangi noise jangka pendek dan memberi waktu tumbuh'
  END
FROM generate_series(1, 80) AS n;
