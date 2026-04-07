import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchStockToday, submitStockQuiz } from '../api/stocks'
import { addXp } from '../lib/gamification'
import { playSelect, playCorrect, playWrong } from '../lib/sounds'
import { BottomNav } from '../components/BottomNav'

function ChangeBadge({ pct }) {
  const up = pct >= 0
  return (
    <span style={{
      fontSize: 13, fontWeight: 800, padding: '3px 10px', borderRadius: 8,
      background: up ? '#E8FFF0' : '#FFF0F0',
      color: up ? '#20A040' : '#E03040',
      border: `1.5px solid ${up ? '#B0EFC0' : '#FFB0B0'}`,
    }}>
      {up ? '+' : ''}{Number(pct).toFixed(1)}%
    </span>
  )
}

// Maps quiz content to the most relevant lesson zone
const ZONE_LABELS = {
  1: 'Dataran Penny',
  2: 'Gurun Dolar',
  3: 'Jalan Saham',
  4: 'Teluk Obligasi',
  5: 'Kerajaan ETF',
  6: 'Lembah Dividen',
  7: 'Puncak Kripto',
  8: 'Bawah Tanah Naga',
}
function guessLessonZone(stockCode, question = '', explanation = '') {
  const t = `${question} ${explanation}`.toLowerCase()
  if (/p\/e|price.earning|valuasi|earning|laba|fundamental/.test(t))  return { level: 2, label: 'Analisis Fundamental' }
  if (/dividen|yield|pembagian|passive income/.test(t))               return { level: 6, label: 'Dividen & Pendapatan Pasif' }
  if (/volume|breakout|momentum|penguatan/.test(t))                   return { level: 5, label: 'Momentum & Breakout' }
  if (/support|resistance|teknikal|chart|pola|moving average/.test(t)) return { level: 4, label: 'Analisis Teknikal' }
  if (/risiko|stop.loss|rugi|kerugian|manajemen risiko/.test(t))      return { level: 3, label: 'Manajemen Risiko' }
  if (/diversi|portofolio|etf|alokasi/.test(t))                      return { level: 5, label: 'ETF & Diversifikasi' }
  if (/kripto|volatil|spekulasi/.test(t))                             return { level: 7, label: 'Aset Volatil' }
  // Fallback by stock sector
  if (['BBCA', 'BBRI'].includes(stockCode?.toUpperCase())) return { level: 2, label: 'Analisis Fundamental Perbankan' }
  if (stockCode?.toUpperCase() === 'GOTO')                return { level: 3, label: 'Psikologi Trading & Risiko' }
  if (stockCode?.toUpperCase() === 'TLKM')                return { level: 6, label: 'Dividen & Pendapatan Pasif' }
  return { level: 1, label: 'Dasar-Dasar Investasi' }
}

const LETTERS = ['A', 'B', 'C', 'D']
const LETTER_COLORS = [
  { bg: '#FFF0E8', color: '#FF7030' },
  { bg: '#E8F8FF', color: '#2090D0' },
  { bg: '#F0FFF0', color: '#30A850' },
  { bg: '#F8F0FF', color: '#8040C0' },
]

export function StockDetail() {
  const { code } = useParams()
  const navigate = useNavigate()

  const [stock, setStock] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Quiz state
  const [selected, setSelected] = useState(null)
  const [result, setResult] = useState(null) // { correct, xp, explanation }
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!code) return
    const controller = new AbortController()
    fetchStockToday(code.toUpperCase(), { signal: controller.signal })
      .then(setStock)
      .catch(err => { if (err.name !== 'AbortError') setError(err.message) })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [code])

  async function handleSubmit() {
    if (selected === null || submitting || result) return
    setSubmitting(true)
    playSelect()
    try {
      const res = await submitStockQuiz(code.toUpperCase(), selected)
      setResult(res)
      if (res.correct) {
        playCorrect()
        addXp(res.xp)
      } else {
        playWrong()
      }
    } catch {
      // ignore
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-svh flex-col bg-white">
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #F0EDE8' }}>
          <button type="button" onClick={() => navigate('/feed')} style={{ fontSize: 13, color: '#28A060', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, padding: 0 }}>
            ← Kembali ke Feed
          </button>
        </div>
        <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: 80, borderRadius: 16, background: '#F5F3F0', border: '1px solid #EDE8E0', opacity: 0.6 }} />
          ))}
        </div>
      </div>
    )
  }

  if (error || !stock) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center bg-white gap-4 px-6">
        <p style={{ fontSize: 14, color: '#E03040', textAlign: 'center' }}>
          {error || 'Data saham tidak ditemukan.'}
        </p>
        <button type="button" onClick={() => navigate('/feed')} style={{ fontSize: 13, color: '#28A060', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
          ← Kembali ke Feed
        </button>
      </div>
    )
  }

  const answered = Boolean(result)

  return (
    <div className="flex min-h-svh flex-col bg-white">

      {/* Header */}
      <div style={{ padding: '12px 16px 10px', borderBottom: '1px solid #F0EDE8', background: 'white', position: 'sticky', top: 0, zIndex: 20 }}>
        <button type="button" onClick={() => navigate('/feed')} style={{ fontSize: 12, color: '#28A060', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, padding: 0, marginBottom: 8 }}>
          ← Kembali ke Feed
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontSize: 22, fontWeight: 900, color: '#1A2030', fontFamily: "'Fredoka One',cursive", lineHeight: 1.1 }}>
              {stock.code}
            </p>
            <p style={{ fontSize: 11, color: '#8A8080' }}>{stock.name}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 18, fontWeight: 900, color: '#1A2030', fontFamily: "'Fredoka One',cursive" }}>
              Rp {Number(stock.price_close).toLocaleString('id-ID')}
            </p>
            <div style={{ marginTop: 3 }}>
              <ChangeBadge pct={stock.price_change_pct} />
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', paddingBottom: 90 }}>

        {/* AI Summary */}
        <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#A09080', marginBottom: 6 }}>
          ✦ Ringkasan AI hari ini
        </p>
        <div style={{
          background: '#F5FDF8', borderLeft: '3px solid #28A060',
          borderRadius: '0 12px 12px 0', padding: '10px 14px',
          fontSize: 13, color: '#2A3A2A', lineHeight: 1.65, marginBottom: 16,
        }}>
          {stock.ai_summary}
        </div>

        {/* Key metrics */}
        <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#A09080', marginBottom: 8 }}>
          Indikator kunci
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 20 }}>
          {[
            { label: 'P/E Ratio', value: stock.pe_ratio },
            { label: 'Volume', value: stock.volume_label },
            { label: 'Mkt Cap', value: stock.market_cap_label },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: '#F8F6F2', borderRadius: 12, padding: '10px 8px', textAlign: 'center', border: '1px solid #EDE8E0' }}>
              <p style={{ fontSize: 9, color: '#A09080', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
              <p style={{ fontSize: 14, fontWeight: 900, color: '#1A2030', fontFamily: "'Fredoka One',cursive" }}>{value || '—'}</p>
            </div>
          ))}
        </div>

        {/* Arena CTA */}
        <button
          type="button"
          onClick={() => navigate(`/arena/stock/${code.toUpperCase()}`)}
          style={{
            width: '100%', marginBottom: 16, padding: '13px 16px',
            borderRadius: 14, cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'space-between',
            background: 'linear-gradient(135deg,#1A3A2A,#0E2218)',
            border: '1.5px solid rgba(74,222,128,0.25)',
            boxShadow: '0 4px 0 #081410',
          }}
        >
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontFamily: "'Fredoka One',cursive", fontSize: 15, color: '#4ADE80', margin: 0 }}>
              Simulasikan di Arena
            </p>
            <p style={{ fontSize: 11, color: '#7AB090', margin: 0, marginTop: 1 }}>
              Coba trading {code.toUpperCase()} dengan data nyata
            </p>
          </div>
          <span style={{ fontSize: 22 }}>📈</span>
        </button>

        {/* Divider */}
        <div style={{ height: 1, background: '#F0EDE8', marginBottom: 16 }} />

        {/* Quiz */}
        {stock.quiz_question && (
          <>
            <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#A09080', marginBottom: 8 }}>
              Belajar dari analisis ✦
            </p>
            <div style={{ background: '#F8F6F2', borderRadius: 14, padding: '14px', border: '1px solid #EDE8E0', marginBottom: 12 }}>
              <p style={{ fontSize: 13, fontWeight: 800, color: '#1A2030', lineHeight: 1.5, marginBottom: 12 }}>
                {stock.quiz_question}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(stock.quiz_options ?? []).map((opt, idx) => {
                  const lc = LETTER_COLORS[idx] || LETTER_COLORS[0]
                  const isPending = !answered && selected === idx
                  const isCorrect = answered && result?.correct && selected === idx
                  const isWrong = answered && !result?.correct && selected === idx

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={answered}
                      onClick={() => { if (!answered) setSelected(idx) }}
                      style={{
                        background: isPending ? '#FFF8E8' : isCorrect ? '#F0FFF4' : isWrong ? '#FFF0F0' : 'white',
                        border: `2px solid ${isPending ? '#FFB830' : isCorrect ? '#40C860' : isWrong ? '#FF5060' : '#E8E0D8'}`,
                        borderRadius: 12, padding: 0, cursor: answered ? 'default' : 'pointer',
                        overflow: 'hidden', display: 'flex', alignItems: 'center',
                        boxShadow: isPending ? '0 2px 0 #CC8800' : isCorrect ? '0 2px 0 #288040' : isWrong ? '0 2px 0 #CC2030' : '0 2px 0 #D8D0C8',
                        opacity: answered && selected !== idx ? 0.45 : 1,
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{
                        width: 40, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: "'Fredoka One',cursive", fontSize: 16, flexShrink: 0,
                        borderRight: '1.5px solid #F0EDE8',
                        background: isCorrect ? '#E8FFF0' : isWrong ? '#FFE8E8' : lc.bg,
                        color: isCorrect ? '#20A040' : isWrong ? '#E03040' : lc.color,
                      }}>
                        {isCorrect ? '✓' : isWrong ? '✗' : LETTERS[idx]}
                      </div>
                      <div style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700, color: isCorrect ? '#1A6A30' : isWrong ? '#9A2020' : '#2A2020', lineHeight: 1.4, flex: 1, textAlign: 'left' }}>
                        {opt}
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Submit button */}
              {!answered && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={selected === null || submitting}
                  style={{
                    width: '100%', marginTop: 12, padding: '13px', borderRadius: 12,
                    fontFamily: "'Fredoka One',cursive", fontSize: 16, cursor: selected === null ? 'not-allowed' : 'pointer',
                    background: selected !== null ? 'linear-gradient(180deg,#48D870,#28B050)' : '#E8E4E0',
                    color: selected !== null ? 'white' : '#A09080',
                    border: selected !== null ? '2px solid #20A040' : '2px solid #D8D0C8',
                    boxShadow: selected !== null ? '0 4px 0 #189030' : '0 2px 0 #C0B8B0',
                    transition: 'all 0.2s',
                  }}
                >
                  {submitting ? 'Memeriksa…' : 'Periksa Jawaban ✓'}
                </button>
              )}

              {/* Feedback */}
              {answered && (
                <div style={{
                  marginTop: 12, borderRadius: 12, padding: '12px 14px',
                  background: result.correct ? '#E8FFF0' : '#FFF0F0',
                  border: `2px solid ${result.correct ? '#40C860' : '#FF5060'}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 22 }}>{result.correct ? '🎉' : '💪'}</span>
                    <div>
                      <p style={{ fontFamily: "'Fredoka One',cursive", fontSize: 16, color: result.correct ? '#20A040' : '#E03040', margin: 0 }}>
                        {result.correct ? `Tepat! +${result.xp} XP` : 'Belum tepat'}
                      </p>
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: '#3A3030', lineHeight: 1.6, margin: 0 }}>
                    {result.explanation}
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate(`/arena/stock/${code.toUpperCase()}`)}
                    style={{
                      marginTop: 10, width: '100%', padding: '10px',
                      borderRadius: 10, cursor: 'pointer',
                      background: 'linear-gradient(135deg,#1A3A2A,#0E2218)',
                      border: '1.5px solid rgba(74,222,128,0.3)',
                      fontFamily: "'Fredoka One',cursive", fontSize: 14, color: '#4ADE80',
                    }}
                  >
                    Latih trading {code.toUpperCase()} di Arena →
                  </button>

                  {/* Lesson backlink */}
                  {(() => {
                    const { level, label } = guessLessonZone(code, stock.quiz_question, result.explanation)
                    return (
                      <button
                        type="button"
                        onClick={() => navigate(`/lesson?level=${level}`)}
                        style={{
                          marginTop: 8, width: '100%', padding: '10px 12px',
                          borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                          background: result.correct ? 'rgba(32,160,64,0.06)' : 'rgba(224,48,64,0.05)',
                          border: `1px solid ${result.correct ? '#B0EFC0' : '#FFB0B0'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        }}
                      >
                        <div>
                          <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase', color: '#A09080', margin: 0, marginBottom: 1 }}>
                            📚 Pelajari konsep ini · Zone {level}
                          </p>
                          <p style={{ fontSize: 12, fontWeight: 700, color: '#1A2030', margin: 0 }}>
                            {ZONE_LABELS[level] ?? label} — {label}
                          </p>
                        </div>
                        <span style={{ fontSize: 14, color: '#28A060', marginLeft: 8 }}>→</span>
                      </button>
                    )
                  })()}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
