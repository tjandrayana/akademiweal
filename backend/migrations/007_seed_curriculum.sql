-- Curriculum from docs/content.md — Indonesian copy, quiz answers match option strings exactly.

-- Level 1 — Basic Finance (4 lessons): evolve sample row + add three more
UPDATE lessons SET
  title = 'Apa itu uang',
  hook = 'Uang punya peran penting',
  body = 'Uang dipakai sebagai alat tukar, menyimpan nilai, dan satuan hitung. Memahami ini jadi fondasi sebelum bicara investasi.',
  question = 'Fungsi utama uang sebagai alat tukar artinya?',
  options = '["Hiasan","Mempermudah jual beli","Menghilangkan harga"]'::jsonb,
  answer = 'Mempermudah jual beli'
WHERE level = 1 AND title = 'Intro Investasi';

INSERT INTO lessons (level, title, hook, body, question, options, answer)
SELECT
  1,
  'Apa itu uang',
  'Uang punya peran penting',
  'Uang dipakai sebagai alat tukar, menyimpan nilai, dan satuan hitung. Memahami ini jadi fondasi sebelum bicara investasi.',
  'Fungsi utama uang sebagai alat tukar artinya?',
  '["Hiasan","Mempermudah jual beli","Menghilangkan harga"]'::jsonb,
  'Mempermudah jual beli'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level = 1 AND title = 'Apa itu uang');

INSERT INTO lessons (level, title, hook, body, question, options, answer)
SELECT 1,
  'Mengapa investasi?',
  'Biar nilai tidak "tergerus"',
  'Menabung aman, tapi nilai uang bisa turun karena inflasi. Investasi bertujuan mengembangkan dana dalam jangka panjang sesuai toleransi risiko.',
  'Alasan umum orang mulai investasi adalah?',
  '["Menghindari pajak","Mengembangkan uang dari waktu ke waktu","Menang lomba"]'::jsonb,
  'Mengembangkan uang dari waktu ke waktu'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level = 1 AND title = 'Mengapa investasi?');

INSERT INTO lessons (level, title, hook, body, question, options, answer)
SELECT 1,
  'Inflasi',
  'Harga naik, daya beli turun',
  'Inflasi adalah kenaikan harga barang dan jasa secara umum. Uang yang sama bisa membeli lebih sedikit dari tahun ke tahun.',
  'Inflasi mempengaruhi daya beli dengan cara?',
  '["Membuat semua barang gratis","Mengurangi nilai uang terhadap barang","Menghapus suku bunga"]'::jsonb,
  'Mengurangi nilai uang terhadap barang'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level = 1 AND title = 'Inflasi');

INSERT INTO lessons (level, title, hook, body, question, options, answer)
SELECT 1,
  'Risiko vs imbal hasil',
  'Tidak ada makan siang gratis',
  'Imbal hasil yang lebih tinggi biasanya diikuti risiko yang lebih besar. Kunci-nya memahami profil risiko dan jangka waktu.',
  'Pernyataan yang paling tepat tentang risiko dan return?',
  '["Return tinggi selalu tanpa risiko","Biasanya return lebih tinggi berarti risiko lebih besar","Risiko hanya ada di saham"]'::jsonb,
  'Biasanya return lebih tinggi berarti risiko lebih besar'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level = 1 AND title = 'Risiko vs imbal hasil');

-- Level 2 — Safe Instruments
INSERT INTO lessons (level, title, hook, body, question, options, answer)
SELECT 2,
  'Deposito',
  'Produk perbankan yang relatif tenang',
  'Deposito mengunci dana untuk jangka tertentu dan umumnya menawarkan bunga tetap. Dana diasuransikan sesuai ketentuan LPS.',
  'Ciri umum deposito dibanding tabihan biasa?',
  '["Bebas tarik kapan saja tanpa aturan","Dana terkunci periode tertentu","Tidak ada bunga"]'::jsonb,
  'Dana terkunci periode tertentu'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level = 2 AND title = 'Deposito');

INSERT INTO lessons (level, title, hook, body, question, options, answer)
SELECT 2,
  'Reksa dana',
  'Investasi kolektif, terkelola profesional',
  'Reksa dana mengumpulkan dana banyak investor untuk diinvestasikan dalam portofolio sesuai prospektus. Ada berbagai jenis risiko dan profil.',
  'Reksa dana cocok untuk pemula karena?',
  '["Dikelola profesional sesuai prospektus","Menjamin untung pasti","Tanpa risiko sama sekali"]'::jsonb,
  'Dikelola profesional sesuai prospektus'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level = 2 AND title = 'Reksa dana');

-- Level 3 — Stocks
INSERT INTO lessons (level, title, hook, body, question, options, answer)
SELECT 3,
  'Apa itu saham?',
  'Kepemilikan sebagian perusahaan',
  'Saham mewakili klaim atas aset dan laba perusahaan. Harga dipengaruhi kinerja, sentimen, dan kondisi pasar.',
  'Membeli saham berarti kamu?',
  '["Meminjamkan uang tanpa hak suara","Memiliki sebagian kecil perusahaan","Menjamin harga naik"]'::jsonb,
  'Memiliki sebagian kecil perusahaan'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level = 3 AND title = 'Apa itu saham?');

INSERT INTO lessons (level, title, hook, body, question, options, answer)
SELECT 3,
  'Pergerakan harga',
  'Naik-turun itu normal',
  'Harga saham berfluktuasi karena permintaan dan penawaran, berita, dan ekspektasi investor. Volatilitas bukan hal yang aneh.',
  'Volatilitas harga saham artinya?',
  '["Harga tidak pernah berubah","Harga bisa berfluktuasi","Harga selalu naik"]'::jsonb,
  'Harga bisa berfluktuasi'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level = 3 AND title = 'Pergerakan harga');

INSERT INTO lessons (level, title, hook, body, question, options, answer)
SELECT 3,
  'Risiko saham',
  'Bisa rugi, perlu disiplin',
  'Risiko utama termasuk penurunan harga dan likuiditas. Mitigasi: diversifikasi, horizon panjang, dan tidak mengikuti FOMO.',
  'Salah satu risiko investasi saham adalah?',
  '["Harga bisa turun","Tidak ada risiko","Bunga tetap dijamin pemerintah"]'::jsonb,
  'Harga bisa turun'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level = 3 AND title = 'Risiko saham');

-- Level 4 — Strategy
INSERT INTO lessons (level, title, hook, body, question, options, answer)
SELECT 4,
  'Diversifikasi',
  'Jangan taruh telur satu keranjang',
  'Mengalokasikan dana ke berbagai instrumen atau sektor membantu meredam dampak jika satu aset buruk.',
  'Ide utama diversifikasi adalah?',
  '["Memusatkan semua di satu saham","Menyebar risiko ke berbagai aset","Menghindari investasi sama sekali"]'::jsonb,
  'Menyebar risiko ke berbagai aset'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level = 4 AND title = 'Diversifikasi');

INSERT INTO lessons (level, title, hook, body, question, options, answer)
SELECT 4,
  'Investasi jangka panjang',
  'Waktu jadi teman',
  'Horizon panjang membantu menunggu siklus pasar dan manfaat bunga majemuk. Hindari keputusan impulsif jangka pendek.',
  'Alasan umum memilih horizon panjang?',
  '["Menghindari bunga majemuk","Memberi waktu untuk pertumbuhan dan mengurangi noise jangka pendek","Menjamin tidak ada fluktuasi"]'::jsonb,
  'Memberi waktu untuk pertumbuhan dan mengurangi noise jangka pendek'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level = 4 AND title = 'Investasi jangka panjang');

-- Level 5 — Application
INSERT INTO lessons (level, title, hook, body, question, options, answer)
SELECT 5,
  'Skenario nyata',
  'Teori ketemu praktik',
  'Misalnya: punya dana darurat dulu, baru alokasi investasi. Sesuaikan dengan tujuan dan profil risiko.',
  'Sebelum menambah alokasi investasi, prioritas umum yang bijak?',
  '["Pinjam untuk investasi","Pastikan dana darurat dan utang terkendali","Ikuti tips tanpa rencana"]'::jsonb,
  'Pastikan dana darurat dan utang terkendali'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level = 5 AND title = 'Skenario nyata');

INSERT INTO lessons (level, title, hook, body, question, options, answer)
SELECT 5,
  'Pengambilan keputusan',
  'Ceklist sebelum jalan',
  'Tulis tujuan, jangka waktu, risiko yang bisa ditoleransi, dan biaya. Hindari FOMO dan pastikan paham produknya.',
  'Langkah sehat sebelum membeli produk investasi?',
  '["Beli karena FOMO","Baca prospektus / fakta dan cocokkan dengan tujuan","Abaikan biaya"]'::jsonb,
  'Baca prospektus / fakta dan cocokkan dengan tujuan'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level = 5 AND title = 'Pengambilan keputusan');
