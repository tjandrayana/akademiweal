-- Backfill lesson explanations for existing rows without overriding curated copy.
-- Safe for production: only fills NULL/empty explanation values.
UPDATE lessons
SET explanation = CASE answer
  WHEN 'Mempermudah jual beli' THEN
    'Alat tukar mempermudah pertukaran barang dan jasa tanpa barter langsung.'
  WHEN 'Mempermudah pertukaran barang/jasa' THEN
    'Alat tukar mempermudah pertukaran barang dan jasa tanpa barter langsung.'
  WHEN 'Mengembangkan uang dari waktu ke waktu' THEN
    'Investasi membidik pertumbuhan jangka panjang; menabung lebih ke penyimpanan nilai.'
  WHEN 'Mengurangi nilai uang terhadap barang' THEN
    'Inflasi membuat harga rata-rata naik, sehingga daya beli uang menurun seiring waktu.'
  WHEN 'Nilai uang terhadap barang bisa turun' THEN
    'Inflasi membuat harga rata-rata naik, sehingga uang yang sama membeli lebih sedikit.'
  WHEN 'Biasanya return lebih tinggi berarti risiko lebih besar' THEN
    'Secara umum, potensi return yang lebih tinggi datang bersama ketidakpastian yang juga lebih besar.'
  WHEN 'Biasanya return lebih tinggi mengikuti risiko lebih besar' THEN
    'Secara umum, potensi imbal hasil lebih tinggi datang bersama risiko yang juga lebih tinggi.'
  WHEN 'Menyebar risiko ke berbagai aset' THEN
    'Diversifikasi tidak menghilangkan risiko sepenuhnya, tetapi membantu mengurangi konsentrasi pada satu sumber risiko.'
  WHEN 'Menyebar ke berbagai aset/sektor' THEN
    'Diversifikasi membantu menurunkan dampak ketika satu aset atau sektor berkinerja buruk.'
  WHEN 'Dana terkunci periode tertentu' THEN
    'Berbeda dari tabungan biasa, deposito memiliki tenor sehingga pencairan mengikuti ketentuan periode.'
  WHEN 'Dikelola profesional sesuai prospektus' THEN
    'Manajer investasi mengelola portofolio sesuai mandat, sehingga investor tidak harus memilih setiap aset sendiri.'
  WHEN 'Manajer investasi sesuai prospektus' THEN
    'Reksa dana dikelola manajer investasi berdasarkan mandat dan prospektus produk.'
  WHEN 'Memiliki sebagian kecil perusahaan' THEN
    'Saham menunjukkan porsi kepemilikan, bukan produk dengan keuntungan yang dijamin.'
  WHEN 'Kepemilikan sebagian perusahaan' THEN
    'Pemegang saham memiliki bagian kepemilikan perusahaan, termasuk hak ekonomi tertentu.'
  WHEN 'Harga bisa berfluktuasi' THEN
    'Volatilitas berarti harga dapat naik dan turun dalam periode waktu yang relatif singkat.'
  WHEN 'Harga bisa turun' THEN
    'Saham tidak menjamin nilai selalu naik; manajemen risiko tetap penting dalam setiap keputusan investasi.'
  WHEN 'Pastikan dana darurat dan utang terkendali' THEN
    'Fondasi keuangan yang stabil membantu kamu berinvestasi lebih tenang dan tidak mudah panik saat pasar turun.'
  WHEN 'Dana darurat dan utang terkendali' THEN
    'Fondasi finansial seperti dana darurat dan utang sehat biasanya didahulukan sebelum menambah risiko.'
  WHEN 'Memberi waktu untuk pertumbuhan dan mengurangi noise jangka pendek' THEN
    'Periode lebih panjang memberi ruang untuk compounding dan membantu investor tidak reaktif pada gejolak harian.'
  WHEN 'Mengurangi noise jangka pendek dan memberi waktu tumbuh' THEN
    'Horizon panjang memberi waktu untuk compounding dan membantu meredam noise pasar jangka pendek.'
  WHEN 'Baca prospektus / fakta dan cocokkan dengan tujuan' THEN
    'Keputusan investasi yang baik dimulai dari memahami produk, biaya, dan kecocokannya dengan rencana pribadi.'
  ELSE explanation
END
WHERE (explanation IS NULL OR BTRIM(explanation) = '')
  AND answer IN (
    'Mempermudah jual beli',
    'Mempermudah pertukaran barang/jasa',
    'Mengembangkan uang dari waktu ke waktu',
    'Mengurangi nilai uang terhadap barang',
    'Nilai uang terhadap barang bisa turun',
    'Biasanya return lebih tinggi berarti risiko lebih besar',
    'Biasanya return lebih tinggi mengikuti risiko lebih besar',
    'Menyebar risiko ke berbagai aset',
    'Menyebar ke berbagai aset/sektor',
    'Dana terkunci periode tertentu',
    'Dikelola profesional sesuai prospektus',
    'Manajer investasi sesuai prospektus',
    'Memiliki sebagian kecil perusahaan',
    'Kepemilikan sebagian perusahaan',
    'Harga bisa berfluktuasi',
    'Harga bisa turun',
    'Pastikan dana darurat dan utang terkendali',
    'Dana darurat dan utang terkendali',
    'Memberi waktu untuk pertumbuhan dan mengurangi noise jangka pendek',
    'Mengurangi noise jangka pendek dan memberi waktu tumbuh',
    'Baca prospektus / fakta dan cocokkan dengan tujuan'
  );
