import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { fetchStockBars, fetchAllBars, fetchSimDates, fetchOrImportBars, placeArenaOrder } from '../api/arena'
import { OjkDisclaimer } from '../components/OjkDisclaimer'

// ── EMA / RSI helpers ──────────────────────────────────────────────────────

function calcEMA(data, n) {
  const k = 2 / (n + 1)
  let e = data[0], result = []
  for (let i = 0; i < data.length; i++) {
    e = i === 0 ? data[0] : data[i] * k + e * (1 - k)
    result.push(e)
  }
  return result
}

function calcRSI(closes, period = 14) {
  if (closes.length < period + 1) return 50
  const slice = closes.slice(-period - 1)
  let g = 0, l = 0
  for (let i = 1; i < slice.length; i++) {
    const d = slice[i] - slice[i - 1]
    d > 0 ? (g += d) : (l -= d)
  }
  const rs = l === 0 ? Infinity : g / l
  return parseFloat((100 - 100 / (1 + rs)).toFixed(1))
}

// ── Canvas chart component ─────────────────────────────────────────────────

function CandleChart({ bars, chartType, showEma, showVolume }) {
  const mainRef = useRef(null)
  const volRef  = useRef(null)
  const [tooltip, setTooltip] = useState(null)

  const closes = bars.map(b => b.close)
  const ema9   = closes.length > 1 ? calcEMA(closes, 9)  : []
  const ema21  = closes.length > 1 ? calcEMA(closes, 21) : []
  const ema50  = closes.length > 1 ? calcEMA(closes, 50) : []

  useEffect(() => {
    const canvas = mainRef.current
    if (!canvas || bars.length < 2) return

    const dpr  = window.devicePixelRatio || 1
    const cssW = canvas.offsetWidth
    const cssH = 220
    canvas.width  = cssW * dpr
    canvas.height = cssH * dpr
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)

    const pad = { l: 8, r: 52, t: 10, b: 26 }
    const cw  = cssW - pad.l - pad.r
    const ch  = cssH - pad.t - pad.b

    const allPrices = bars.flatMap(b => [b.high, b.low])
    if (showEma && ema9.length) allPrices.push(...ema9, ...ema21, ...ema50)
    const rawMin = Math.min(...allPrices)
    const rawMax = Math.max(...allPrices)
    const spread = rawMax - rawMin || rawMax * 0.01
    const minP = rawMin - spread * 0.05
    const maxP = rawMax + spread * 0.05

    const py  = v => pad.t + (1 - (v - minP) / (maxP - minP)) * ch
    const gap = cw / bars.length
    const barW = Math.max(2, gap * 0.7)

    // Grid lines + price labels
    ctx.strokeStyle = '#21262d'
    ctx.lineWidth   = 1
    for (let i = 0; i <= 4; i++) {
      const y = pad.t + i * (ch / 4)
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(cssW - pad.r, y); ctx.stroke()
      const val = maxP - (i / 4) * (maxP - minP)
      ctx.fillStyle  = '#8b949e'
      ctx.font       = '11px sans-serif'
      ctx.textAlign  = 'left'
      ctx.fillText(Math.round(val).toLocaleString('id-ID'), cssW - pad.r + 4, y + 4)
    }

    if (chartType === 'bar') {
      bars.forEach((b, i) => {
        const x    = pad.l + i * gap + gap / 2
        const isUp = b.close >= b.open
        const col  = isUp ? '#3fb950' : '#f85149'
        ctx.strokeStyle = col; ctx.lineWidth = 1.5
        ctx.beginPath(); ctx.moveTo(x, py(b.high)); ctx.lineTo(x, py(b.low)); ctx.stroke()
        const bodyTop = py(Math.max(b.open, b.close))
        const bodyBot = py(Math.min(b.open, b.close))
        const bh      = Math.max(2, bodyBot - bodyTop)
        ctx.fillStyle = col
        ctx.fillRect(x - barW / 2, bodyTop, barW, bh)
        if (!isUp) {
          ctx.strokeStyle = '#f85149'; ctx.lineWidth = 1
          ctx.strokeRect(x - barW / 2, bodyTop, barW, bh)
        }
      })
    } else {
      // Line chart
      ctx.strokeStyle = '#c9d1d9'; ctx.lineWidth = 2
      ctx.beginPath()
      bars.forEach((b, i) => {
        const x = pad.l + i * gap + gap / 2
        i === 0 ? ctx.moveTo(x, py(b.close)) : ctx.lineTo(x, py(b.close))
      })
      ctx.stroke()
      // Fill gradient
      ctx.fillStyle = 'rgba(88,166,255,0.07)'
      ctx.beginPath()
      bars.forEach((b, i) => {
        const x = pad.l + i * gap + gap / 2
        i === 0 ? ctx.moveTo(x, py(b.close)) : ctx.lineTo(x, py(b.close))
      })
      const lastX = pad.l + (bars.length - 1) * gap + gap / 2
      ctx.lineTo(lastX, cssH - pad.b)
      ctx.lineTo(pad.l + gap / 2, cssH - pad.b)
      ctx.closePath(); ctx.fill()
    }

    // EMA lines
    if (showEma && ema9.length > 1) {
      [[ema9, '#f0e050'], [ema21, '#58a6ff'], [ema50, '#ff7b54']].forEach(([arr, col]) => {
        ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.setLineDash([])
        ctx.beginPath()
        arr.forEach((v, i) => {
          const x = pad.l + i * gap + gap / 2
          i === 0 ? ctx.moveTo(x, py(v)) : ctx.lineTo(x, py(v))
        })
        ctx.stroke()
      })
    }

    // X-axis time labels
    const n     = bars.length
    const xIdxs = [0, Math.floor(n / 4), Math.floor(n / 2), Math.floor(3 * n / 4), n - 1]
    ctx.fillStyle = '#8b949e'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center'
    xIdxs.forEach(i => {
      if (i < bars.length) {
        const x = pad.l + i * gap + gap / 2
        const t = bars[i].bar_time?.slice(11, 16) ?? ''
        ctx.fillText(t, x, cssH - 4)
      }
    })
  }, [bars, chartType, showEma]) // eslint-disable-line

  // Volume canvas
  useEffect(() => {
    const canvas = volRef.current
    if (!canvas || !showVolume || bars.length < 1) return
    const dpr  = window.devicePixelRatio || 1
    const cssW = canvas.offsetWidth
    const cssH = 60
    canvas.width  = cssW * dpr
    canvas.height = cssH * dpr
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, cssW, cssH)

    const pad  = { l: 8, r: 52, t: 6, b: 14 }
    const cw   = cssW - pad.l - pad.r
    const ch   = cssH - pad.t - pad.b
    const gap  = cw / bars.length
    const barW = Math.max(2, gap * 0.7)
    const maxV = Math.max(...bars.map(b => b.volume || 0))

    bars.forEach((b, i) => {
      const x  = pad.l + i * gap + gap / 2
      const bh = Math.max(2, ((b.volume || 0) / (maxV || 1)) * ch)
      const col = b.close >= b.open ? 'rgba(63,185,80,.7)' : 'rgba(248,81,73,.7)'
      ctx.fillStyle = col
      ctx.fillRect(x - barW / 2, cssH - pad.b - bh, barW, bh)
    })

    if (maxV > 0) {
      const maxK = (maxV / 1000).toFixed(0) + 'K'
      ctx.fillStyle = '#8b949e'; ctx.font = '10px sans-serif'; ctx.textAlign = 'left'
      ctx.fillText(maxK, cssW - pad.r + 4, pad.t + 10)
    }
  }, [bars, showVolume])

  function handleMouseMove(e) {
    const canvas = mainRef.current
    if (!canvas || bars.length < 1) return
    const rect = canvas.getBoundingClientRect()
    const cssX = e.clientX - rect.left
    const pad  = { l: 8, r: 52 }
    const cw   = rect.width - pad.l - pad.r
    const gap  = cw / bars.length
    const idx  = Math.floor((cssX - pad.l) / gap)
    if (idx >= 0 && idx < bars.length) {
      setTooltip({ x: Math.min(cssX + 10, rect.width - 130), y: e.clientY - rect.top - 10, idx })
    }
  }

  const tipBar = tooltip !== null ? bars[tooltip.idx] : null

  return (
    <div style={{ padding: '0 14px 4px' }}>
      <div style={{ position: 'relative', width: '100%' }}>
        <canvas
          ref={mainRef}
          style={{ display: 'block', width: '100%', height: 220 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setTooltip(null)}
        />
        {tipBar && (
          <div style={{
            position: 'absolute', left: tooltip.x, top: tooltip.y,
            background: '#1c2128', border: '0.5px solid #30363d', borderRadius: 6,
            padding: '6px 10px', fontSize: 11, color: '#e6edf3', pointerEvents: 'none',
            whiteSpace: 'nowrap', zIndex: 10,
          }}>
            O <b>{tipBar.open?.toLocaleString('id-ID')}</b>{' '}
            H <b style={{ color: '#3fb950' }}>{tipBar.high?.toLocaleString('id-ID')}</b>{' '}
            L <b style={{ color: '#f85149' }}>{tipBar.low?.toLocaleString('id-ID')}</b>{' '}
            C <b>{tipBar.close?.toLocaleString('id-ID')}</b>
            {tipBar.volume > 0 && <><br />Vol <b>{((tipBar.volume || 0) / 1000).toFixed(0)}K</b></>}
          </div>
        )}
      </div>
      {showEma && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '2px 0 4px', fontSize: 11, color: '#8b949e' }}>
          {[['#f0e050', 'EMA 9'], ['#58a6ff', 'EMA 21'], ['#ff7b54', 'EMA 50']].map(([c, l]) => (
            <span key={l}>
              <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: c, marginRight: 3 }} />
              {l}
            </span>
          ))}
        </div>
      )}
      {showVolume && (
        <canvas ref={volRef} style={{ display: 'block', width: '100%', height: 60 }} />
      )}
    </div>
  )
}

// ── Simulation speeds ──────────────────────────────────────────────────────

const SPEEDS = [
  { label: '1×',   ms: 60_000 },
  { label: '5×',   ms: 12_000 },
  { label: '10×',  ms:  6_000 },
  { label: '100×', ms:    600 },
]

function findStartIndex(allBars) {
  if (!allBars.length) return 0
  const wib       = new Date(Date.now() + 7 * 3_600_000)
  const day       = wib.getUTCDay()
  const h         = wib.getUTCHours()
  const m         = wib.getUTCMinutes()
  const totalMins = h * 60 + m
  const inMarket  = day >= 1 && day <= 5 && totalMins >= 9 * 60 && totalMins < 16 * 60
  if (!inMarket) return 0
  let bestIdx = 0
  for (let i = 0; i < allBars.length; i++) {
    const bt      = allBars[i].bar_time ?? ''
    const barMins = parseInt(bt.slice(11, 13), 10) * 60 + parseInt(bt.slice(14, 16), 10)
    if (barMins <= totalMins) bestIdx = i
    else break
  }
  return bestIdx
}

// ── Trade bottom sheet ─────────────────────────────────────────────────────

function TradeSheet({ open, orderType: initialOrderType, onClose, code, stock, holding, currentPrice }) {
  const [orderType, setOrderType]   = useState(initialOrderType)
  const [lots, setLots]             = useState(1)
  const [limitPrice, setLimitPrice] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult]         = useState(null)
  const [error, setError]           = useState(null)

  useEffect(() => {
    if (open) {
      setOrderType(initialOrderType)
      setLots(1)
      setResult(null)
      setError(null)
      const p = currentPrice ?? stock?.price_close
      setLimitPrice(p ? String(Math.round(p)) : '')
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (open && !result) {
      const p = currentPrice ?? stock?.price_close
      if (p) setLimitPrice(String(Math.round(p)))
    }
  }, [orderType]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null

  const parsedLimitPrice = parseInt(limitPrice, 10) || 0
  const totalValue       = lots * 100 * parsedLimitPrice
  const isBuy            = orderType === 'buy'
  const canSubmit        = lots > 0 && parsedLimitPrice > 0 && !submitting

  const refPrice = currentPrice ?? stock?.price_close ?? null
  let fillHint = null
  if (refPrice && parsedLimitPrice > 0) {
    if (orderType === 'buy') {
      fillHint = parsedLimitPrice >= refPrice
        ? { ok: true,  text: 'Akan langsung terisi — limit ≥ harga saat ini' }
        : { ok: false, text: `Pending — menunggu harga turun ke Rp ${parsedLimitPrice.toLocaleString('id-ID')}` }
    } else {
      fillHint = parsedLimitPrice <= refPrice
        ? { ok: true,  text: 'Akan langsung terisi — limit ≤ harga saat ini' }
        : { ok: false, text: `Pending — menunggu harga naik ke Rp ${parsedLimitPrice.toLocaleString('id-ID')}` }
    }
  }

  async function handleSubmit() {
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      const order = await placeArenaOrder({
        stock_code:  code,
        order_type:  orderType,
        lots,
        limit_price: parsedLimitPrice,
      })
      setResult(order)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{
      background: 'white', borderTop: '2px solid #E0D8D0',
      animation: 'slide-up 0.25s cubic-bezier(0.2, 0.85, 0.25, 1) forwards',
    }}>
        {/* compact drag handle + header */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 6px', flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#E0D8D0' }} />
        </div>
        <div style={{ padding: '0 14px 8px', borderBottom: '1px solid #F0EDE8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <p style={{ fontSize: 18, fontWeight: 900, color: '#1A2030', fontFamily: "'Fredoka One',cursive", lineHeight: 1 }}>
            {code}
            {currentPrice && <span style={{ fontSize: 14, fontWeight: 700, color: '#4A4040', marginLeft: 8 }}>Rp {Number(currentPrice).toLocaleString('id-ID')}</span>}
          </p>
          <button type="button" onClick={onClose}
            style={{ width: 28, height: 28, borderRadius: 14, border: '1.5px solid #E0D8D0', background: '#F8F6F2', cursor: 'pointer', fontSize: 13, color: '#6A6060', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ✕
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 20 }}>
          {result ? (
            <>
              <div style={{
                borderRadius: 16, padding: '20px 16px', textAlign: 'center',
                background: result.status === 'filled' ? '#E8FFF0' : '#FFFBF0',
                border: `2px solid ${result.status === 'filled' ? '#40C860' : '#FFD060'}`,
              }}>
                <span style={{ fontSize: 34 }}>{result.status === 'filled' ? '✅' : '⏳'}</span>
                <p style={{ fontFamily: "'Fredoka One',cursive", fontSize: 18, color: result.status === 'filled' ? '#20A040' : '#CC8800', margin: '8px 0 4px' }}>
                  {result.status === 'filled' ? 'Order Terisi!' : 'Order Diterima'}
                </p>
                <p style={{ fontSize: 12, color: '#4A4040', lineHeight: 1.6 }}>
                  {result.order_type === 'buy' ? 'Beli' : 'Jual'}{' '}
                  <strong>{result.lots} lot</strong> {result.stock_code}{' '}
                  @ Rp {(result.filled_price ?? result.limit_price).toLocaleString('id-ID')}
                </p>
              </div>
              <button type="button" onClick={onClose}
                style={{
                  width: '100%', padding: '13px', borderRadius: 13, cursor: 'pointer',
                  background: 'linear-gradient(180deg,#48D870,#28B050)', color: 'white',
                  border: '2px solid #20A040', boxShadow: '0 3px 0 #189030',
                  fontFamily: "'Fredoka One',cursive", fontSize: 16,
                }}>
                Kembali ke Chart
              </button>
            </>
          ) : (
            <>
              {/* buy / sell toggle */}
              <div style={{ display: 'flex', background: '#F0EDE8', borderRadius: 10, padding: 3, gap: 3 }}>
                {['buy', 'sell'].map(type => (
                  <button key={type} type="button" onClick={() => setOrderType(type)}
                    style={{
                      flex: 1, padding: '8px', borderRadius: 8, border: 'none', cursor: 'pointer',
                      fontFamily: "'Fredoka One',cursive", fontSize: 15,
                      background: orderType === type
                        ? (type === 'buy' ? 'linear-gradient(180deg,#48D870,#28B050)' : 'linear-gradient(180deg,#FF7070,#E03040)')
                        : 'transparent',
                      color: orderType === type ? 'white' : '#8A8080',
                      boxShadow: orderType === type ? '0 2px 6px rgba(0,0,0,0.12)' : 'none',
                      transition: 'all 0.15s',
                    }}>
                    {type === 'buy' ? '⬆ Beli' : '⬇ Jual'}
                  </button>
                ))}
              </div>

              {orderType === 'sell' && !holding && (
                <p style={{ fontSize: 11, color: '#8A6000', fontWeight: 700, background: '#FFF8E8', border: '1.5px solid #FFD060', borderRadius: 10, padding: '7px 11px' }}>
                  ⚠ Belum punya {code} — order jual perlu saham yang dimiliki.
                </p>
              )}

              {/* lot selector */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <button type="button" onClick={() => setLots(l => Math.max(1, l - 1))}
                    style={{ width: 38, height: 38, borderRadius: 9, border: '2px solid #E0D8D0', background: 'white', fontSize: 18, cursor: 'pointer', fontWeight: 700, color: '#4A4040', flexShrink: 0 }}>−</button>
                  <input
                    type="number" min={1} value={lots}
                    onChange={e => setLots(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    style={{ flex: 1, height: 38, textAlign: 'center', border: '2px solid #E0D8D0', borderRadius: 9, fontSize: 18, fontWeight: 900, color: '#1A2030', fontFamily: "'Fredoka One',cursive", outline: 'none' }}
                  />
                  <button type="button" onClick={() => setLots(l => l + 1)}
                    style={{ width: 38, height: 38, borderRadius: 9, border: '2px solid #E0D8D0', background: 'white', fontSize: 18, cursor: 'pointer', fontWeight: 700, color: '#4A4040', flexShrink: 0 }}>+</button>
                  {[1, 5, 10, 50].map(v => (
                    <button key={v} type="button" onClick={() => setLots(v)}
                      style={{
                        flex: 1, height: 38, borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                        border: `1.5px solid ${lots === v ? '#28A060' : '#E0D8D0'}`,
                        background: lots === v ? '#E8FFF0' : 'white',
                        color: lots === v ? '#20A040' : '#6A6060',
                      }}>
                      {v}
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: 10, color: '#A09080', textAlign: 'right' }}>{lots} lot = {(lots * 100).toLocaleString('id-ID')} lembar</p>
              </div>

              {/* limit price */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#6A6060', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Harga Limit</p>
                  {currentPrice && (
                    <button type="button" onClick={() => setLimitPrice(String(Math.round(currentPrice)))}
                      style={{ fontSize: 10, color: '#28A060', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, padding: 0 }}>
                      Pakai harga kini
                    </button>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#8A8080', fontWeight: 700 }}>Rp</span>
                  <input
                    type="number" min={1} value={limitPrice}
                    onChange={e => setLimitPrice(e.target.value)}
                    style={{
                      width: '100%', height: 46, paddingLeft: 36, paddingRight: 12,
                      border: `2px solid ${fillHint?.ok ? '#40C860' : fillHint ? '#FFB830' : '#E0D8D0'}`,
                      borderRadius: 10, fontSize: 17, fontWeight: 900, color: '#1A2030', outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>
                {fillHint && (
                  <p style={{ fontSize: 10, fontWeight: 700, marginTop: 4, color: fillHint.ok ? '#20A040' : '#8A6000' }}>
                    {fillHint.ok ? '✅' : '⏳'} {fillHint.text}
                  </p>
                )}
              </div>

              {/* compact summary + submit */}
              {parsedLimitPrice > 0 && (
                <p style={{ fontSize: 11, color: '#6A6060', textAlign: 'right' }}>
                  {isBuy ? 'Total' : 'Est. Hasil'}: <strong style={{ color: '#1A2030' }}>Rp {totalValue.toLocaleString('id-ID')}</strong>
                  <span style={{ color: '#A09080' }}> · {lots} lot @ Rp {parsedLimitPrice.toLocaleString('id-ID')}</span>
                </p>
              )}

              {error && (
                <p style={{ fontSize: 12, color: '#E03040', fontWeight: 700, background: '#FFF0F0', border: '1.5px solid #FFB0B0', borderRadius: 10, padding: '7px 11px' }}>{error}</p>
              )}

              <button type="button" onClick={handleSubmit} disabled={!canSubmit}
                style={{
                  width: '100%', padding: '13px', borderRadius: 13,
                  fontFamily: "'Fredoka One',cursive", fontSize: 17,
                  cursor: canSubmit ? 'pointer' : 'not-allowed',
                  background: canSubmit
                    ? (isBuy ? 'linear-gradient(180deg,#48D870,#28B050)' : 'linear-gradient(180deg,#FF7070,#E03040)')
                    : '#E8E4E0',
                  color: canSubmit ? 'white' : '#A09080',
                  border: canSubmit ? (isBuy ? '2px solid #20A040' : '2px solid #C02030') : '2px solid #D8D0C8',
                  boxShadow: canSubmit ? (isBuy ? '0 4px 0 #189030' : '0 4px 0 #A01020') : '0 2px 0 #C0B8B0',
                  transition: 'all 0.2s', flexShrink: 0,
                }}>
                {submitting ? 'Memproses…' : isBuy ? '⬆ Pasang Order Beli' : '⬇ Pasang Order Jual'}
              </button>
            </>
          )}
        </div>
    </div>
  )
}

// ── Debrief sheet ──────────────────────────────────────────────────────────

function lessonHint(changePct) {
  if (changePct > 3)  return { zone: 'Zone 5', topic: 'Momentum & Breakout',          desc: 'Harga naik kuat hari ini — sinyal momentum bullish. Volume yang tinggi mengonfirmasi kekuatan gerakan ini.' }
  if (changePct < -3) return { zone: 'Zone 3', topic: 'Manajemen Risiko & Stop Loss', desc: 'Harga turun signifikan. Investor yang memasang stop loss terlindungi dari kerugian yang lebih dalam.' }
  if (Math.abs(changePct) <= 1) return { zone: 'Zone 4', topic: 'Support & Resistance', desc: 'Harga bergerak sideways — ciri khas fase konsolidasi di antara level support dan resistance.' }
  if (changePct > 0)  return { zone: 'Zone 4', topic: 'Analisis Tren Naik',           desc: 'Kenaikan moderat. Perhatikan apakah harga menutup di atas moving average — tanda tren naik yang sehat.' }
  return               { zone: 'Zone 4', topic: 'Analisis Tren Turun',                desc: 'Penurunan moderat. Harga menutup di bawah support bisa menjadi sinyal pelemahan tren.' }
}

function DebriefSheet({ open, onClose, onRestart, code, allBars, simDate, navigate }) {
  if (!open || allBars.length === 0) return null

  const openPrice  = allBars[0].open
  const closePrice = allBars[allBars.length - 1].close
  const high       = Math.max(...allBars.map(b => b.high))
  const low        = Math.min(...allBars.map(b => b.low))
  const changePct  = openPrice > 0 ? ((closePrice - openPrice) / openPrice) * 100 : 0
  const up         = changePct >= 0
  const fmt        = v => Number(v).toLocaleString('id-ID')
  const hint       = lessonHint(changePct)

  const dateLabel = simDate
    ? new Date(simDate + 'T00:00:00+07:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : ''

  const closes  = allBars.map(b => b.close)
  const minC    = Math.min(...closes), maxC = Math.max(...closes)
  const rangeC  = maxC - minC || 1
  const W = 280, H = 48
  const pts = closes.map((p, i) => {
    const x = closes.length < 2 ? W / 2 : (i / (closes.length - 1)) * W
    const y = H - ((p - minC) / rangeC) * H
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
  const lastX     = closes.length > 1 ? ((closes.length - 1) / (closes.length - 1)) * W : W / 2
  const areaPath  = `M0,${H - ((closes[0] - minC) / rangeC) * H} L${pts} L${lastX},${H} L0,${H} Z`
  const lineColor = up ? 'var(--arena-accent)' : 'var(--arena-sell)'

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 110 }} />
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 448, zIndex: 111,
        background: '#0E2218', borderRadius: '20px 20px 0 0',
        maxHeight: '88vh', display: 'flex', flexDirection: 'column',
        animation: 'slide-up 0.3s cubic-bezier(0.2,0.85,0.25,1) forwards',
        border: '1px solid rgba(74,222,128,0.2)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px', flexShrink: 0 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)' }} />
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 32px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <p style={{ fontFamily: "'Fredoka One',cursive", fontSize: 20, color: 'var(--arena-accent)', margin: 0 }}>
              🏁 Sesi Selesai
            </p>
            <p style={{ fontSize: 11, color: 'var(--arena-text-muted)', marginTop: 2 }}>{code} · {dateLabel}</p>
          </div>

          <div style={{ borderRadius: 10, overflow: 'hidden', background: 'rgba(0,0,0,0.3)', height: H + 4 }}>
            <svg width="100%" height={H + 4} viewBox={`0 0 ${W} ${H + 4}`} preserveAspectRatio="none" style={{ display: 'block' }}>
              <defs>
                <linearGradient id="db-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={lineColor} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={lineColor} stopOpacity="0.02" />
                </linearGradient>
              </defs>
              <path d={areaPath} fill="url(#db-fill)" />
              <polyline points={pts} fill="none" stroke={lineColor} strokeWidth="2" strokeLinejoin="round" />
            </svg>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
            {[
              { label: 'Harga Buka',  value: `Rp ${fmt(openPrice)}`,  color: 'white' },
              { label: 'Harga Tutup', value: `Rp ${fmt(closePrice)}`, color: up ? 'var(--arena-accent)' : 'var(--arena-sell)' },
              { label: 'Tertinggi',   value: `Rp ${fmt(high)}`,       color: 'var(--arena-accent)' },
              { label: 'Terendah',    value: `Rp ${fmt(low)}`,        color: 'var(--arena-sell)' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '10px 12px', border: '1px solid var(--arena-surface)' }}>
                <p style={{ fontSize: 10, color: 'var(--arena-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>{label}</p>
                <p style={{ fontSize: 13, fontWeight: 900, color, fontFamily: "'Fredoka One',cursive" }}>{value}</p>
              </div>
            ))}
          </div>

          <div style={{
            borderRadius: 12, padding: '12px 16px', textAlign: 'center',
            background: up ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)',
            border: `1.5px solid ${up ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`,
          }}>
            <p style={{ fontSize: 26, fontWeight: 900, fontFamily: "'Fredoka One',cursive", color: up ? 'var(--arena-accent)' : 'var(--arena-sell)', margin: 0 }}>
              {up ? '+' : ''}{changePct.toFixed(2)}%
            </p>
            <p style={{ fontSize: 11, color: 'var(--arena-text-muted)', marginTop: 2 }}>
              Perubahan harga sepanjang hari
            </p>
          </div>

          <div style={{ background: 'rgba(74,222,128,0.07)', borderLeft: '3px solid var(--arena-accent)', borderRadius: '0 12px 12px 0', padding: '12px 14px' }}>
            <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--arena-accent)', marginBottom: 4 }}>
              📚 Konsep yang berlaku hari ini · {hint.zone}
            </p>
            <p style={{ fontSize: 13, fontWeight: 800, color: 'white', marginBottom: 4 }}>{hint.topic}</p>
            <p style={{ fontSize: 11, color: '#A0C8B0', lineHeight: 1.6 }}>{hint.desc}</p>
          </div>

          <button type="button" onClick={() => navigate(`/stocks/${code.toLowerCase()}`)}
            style={{
              width: '100%', padding: '13px 16px', borderRadius: 14, cursor: 'pointer',
              background: 'linear-gradient(135deg,#1A5A30,#0E3A1A)',
              border: '1.5px solid var(--arena-accent-border)',
              fontFamily: "'Fredoka One',cursive", fontSize: 15, color: 'var(--arena-accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
            <span>Baca analisis AI {code} di Feed</span>
            <span>→</span>
          </button>

          <button type="button" onClick={() => navigate(`/lesson?level=${parseInt(hint.zone.replace(/\D/g, ''), 10) || 4}`)}
            style={{
              width: '100%', padding: '13px 16px', borderRadius: 14, cursor: 'pointer',
              background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.15)',
              fontFamily: "'Fredoka One',cursive", fontSize: 14, color: '#C8E8D8',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
            <span>📚 Pelajari: {hint.topic}</span>
            <span>→</span>
          </button>

          <button type="button" onClick={onRestart}
            style={{
              width: '100%', padding: '10px', borderRadius: 12, cursor: 'pointer',
              background: 'transparent', border: '1px solid var(--arena-border)',
              fontSize: 13, fontWeight: 700, color: '#5A8070',
            }}>
            Pilih tanggal lain
          </button>
        </div>
      </div>
    </>
  )
}

// ── Bandarmology panel ─────────────────────────────────────────────────────

function BandPanel({ code, simIdx }) {
  // Seeded fake data based on stock code + bar index
  function seed(s) { let x = s; return () => { x = Math.sin(x) * 10000; return x - Math.floor(x) } }
  const hashCode = (code ?? '').split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) & 0xffffff, 1)
  const rng      = seed(hashCode + (simIdx || 0) * 0.1)

  const netFlow   = ((rng() - 0.45) * 6).toFixed(1)
  const netUp     = parseFloat(netFlow) >= 0
  const brokers   = ['YU (UBS)', 'CS (CIMB)', 'BK (JP Morgan)', 'DH (Deutsche)', 'ZP (Kim Eng)']
  const broker    = brokers[Math.floor(rng() * brokers.length)]
  const isAccum   = rng() > 0.42
  const buyPct    = Math.round(40 + rng() * 40)
  const sellPct   = 100 - buyPct

  return (
    <div style={{ background: '#161b22', border: '0.5px solid #30363d', borderRadius: 8, margin: '6px 14px', padding: '10px 12px' }}>
      <div style={{ fontSize: 11, color: '#bc8cff', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8 }}>
        Bandarmology — aliran dana besar
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {[
          { label: 'Net Foreign Flow', value: `${netUp ? '+' : ''}Rp ${Math.abs(netFlow)}M`, color: netUp ? '#3fb950' : '#f85149' },
          { label: 'Broker dominan',   value: broker,                                         color: '#bc8cff' },
          { label: 'Akumulasi/Distribusi', value: isAccum ? 'Akumulasi' : 'Distribusi',      color: isAccum ? '#3fb950' : '#f85149' },
          { label: 'Big hand signal',  value: `Beli ${buyPct}%`,                              color: '#3fb950' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: '#0d1117', borderRadius: 6, padding: 8, border: '0.5px solid #21262d' }}>
            <div style={{ fontSize: 10, color: '#8b949e', marginBottom: 3 }}>{label}</div>
            <div style={{ fontSize: 14, fontWeight: 500, color }}>{value}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 8 }}>
        <div style={{ fontSize: 11, color: '#8b949e', marginBottom: 3 }}>Tekanan Beli vs Jual</div>
        <div style={{ display: 'flex', height: 7, borderRadius: 4, overflow: 'hidden', margin: '6px 0 3px' }}>
          <div style={{ width: `${buyPct}%`, background: '#3fb950' }} />
          <div style={{ width: `${sellPct}%`, background: '#f85149' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
          <span style={{ color: '#3fb950' }}>Beli {buyPct}%</span>
          <span style={{ color: '#f85149' }}>Jual {sellPct}%</span>
        </div>
      </div>
    </div>
  )
}

// ── RSI panel ──────────────────────────────────────────────────────────────

function RsiPanel({ rsiValue }) {
  const rsi     = rsiValue ?? 50
  const rsiColor = rsi < 30 ? '#f85149' : rsi > 70 ? '#3fb950' : '#e3b341'
  return (
    <div style={{ background: '#161b22', border: '0.5px solid #30363d', borderRadius: 8, margin: '4px 14px 6px', padding: '10px 12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: '#e3b341', textTransform: 'uppercase', letterSpacing: '0.6px' }}>RSI (14)</span>
        <span style={{ fontSize: 15, fontWeight: 500, color: '#e3b341' }}>{rsi}</span>
      </div>
      <div style={{ background: '#21262d', borderRadius: 4, height: 9, position: 'relative', margin: '5px 0' }}>
        <div style={{ height: 9, borderRadius: 4, width: `${rsi}%`, background: rsiColor, transition: 'width .4s' }} />
        <div style={{ position: 'absolute', left: '30%', top: 0, height: 9, width: '0.5px', background: '#f85149', opacity: 0.6 }} />
        <div style={{ position: 'absolute', left: '70%', top: 0, height: 9, width: '0.5px', background: '#3fb950', opacity: 0.6 }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#8b949e' }}>
        <span style={{ color: '#f85149' }}>Oversold 30</span>
        <span>Netral</span>
        <span style={{ color: '#3fb950' }}>Overbought 70</span>
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────

export function ArenaStock() {
  const { code } = useParams()
  const location  = useLocation()
  const navigate  = useNavigate()

  const passedStock   = location.state?.stock   ?? null
  const passedHolding = location.state?.holding ?? null
  const passedCash    = location.state?.cash    ?? null
  const codeUpper     = code?.toUpperCase() ?? ''

  // ── Chart display state ───────────────────────────────────────────────
  const [chartType, setChartType] = useState('line')
  const [showEma,   setShowEma]   = useState(true)
  const [showVol,   setShowVol]   = useState(true)
  const [showBand,  setShowBand]  = useState(false)
  const [showRsi,   setShowRsi]   = useState(false)

  // ── Live bars ─────────────────────────────────────────────────────────
  const [bars, setBars]               = useState([])
  const [currentPrice, setCurrentPrice] = useState(passedStock?.price_close ?? null)
  const [prevPrice, setPrevPrice]     = useState(null)
  const [loadingBars, setLoadingBars] = useState(true)
  const [replayDate, setReplayDate]   = useState('')
  const liveAbortRef = useRef(null)

  const fetchLiveBars = useCallback(() => {
    if (liveAbortRef.current) liveAbortRef.current.abort()
    liveAbortRef.current = new AbortController()
    fetchStockBars(codeUpper, { signal: liveAbortRef.current.signal })
      .then(data => {
        const newBars  = data?.bars ?? []
        const newPrice = data?.current_price > 0 ? data.current_price : (passedStock?.price_close ?? 0)
        setBars(newBars)
        setCurrentPrice(prev => { setPrevPrice(prev); return newPrice })
        if (newBars.length > 0) setReplayDate(newBars[0].bar_time?.slice(0, 10) ?? '')
      })
      .catch(() => {})
      .finally(() => setLoadingBars(false))
  }, [codeUpper]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchLiveBars()
    const id = setInterval(fetchLiveBars, 60_000)
    return () => { clearInterval(id); liveAbortRef.current?.abort() }
  }, [fetchLiveBars])

  // ── Simulation dates ──────────────────────────────────────────────────
  const [simDates, setSimDates]       = useState([])
  const [simDate, setSimDate]         = useState('')
  const [dateStatus, setDateStatus]   = useState('ok')
  const [fetchPct, setFetchPct]       = useState(0)
  const [fetchStep, setFetchStep]     = useState('')

  useEffect(() => {
    fetchSimDates(codeUpper)
      .then(res => {
        const dates = res?.dates ?? []
        setSimDates(dates)
        if (dates.length > 0) setSimDate(dates[0])
      })
      .catch(() => {})
  }, [codeUpper]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Simulation engine ─────────────────────────────────────────────────
  const [simMode, setSimMode]         = useState('idle')
  const [allBars, setAllBars]         = useState([])
  const [simIdx, setSimIdx]           = useState(0)
  const [speedIdx, setSpeedIdx]       = useState(3) // default 100×
  const [simStartTime, setSimStartTime] = useState('')
  const simTimerRef = useRef(null)

  function clearSimTimer() {
    if (simTimerRef.current) { clearInterval(simTimerRef.current); simTimerRef.current = null }
  }

  function startTicking(fromIdx, barsData) {
    clearSimTimer()
    const speedMs = SPEEDS[speedIdx].ms
    simTimerRef.current = setInterval(() => {
      setSimIdx(prev => {
        const next = prev + 1
        if (next >= barsData.length) {
          clearSimTimer()
          setSimMode('done')
          return barsData.length - 1
        }
        return next
      })
    }, speedMs)
  }

  async function handleDatePick(dateStr) {
    if (!dateStr) return
    setSimDate(dateStr)
    setFetchPct(0); setFetchStep('') // reset previous fetch bar
    const dow = new Date(dateStr + 'T12:00:00+07:00').getDay()
    if (dow === 0 || dow === 6) { setDateStatus('weekend'); return }
    if (simDates.includes(dateStr)) { setDateStatus('ok'); return }

    setDateStatus('fetching')
    setFetchPct(5)
    setFetchStep('Menghubungi Yahoo Finance…')
    const STEPS = [
      { pct: 30, label: 'Menghubungi Yahoo Finance…' },
      { pct: 65, label: 'Mengunduh data historis…' },
      { pct: 85, label: 'Menyimpan ke database…' },
    ]
    let stepIdx = 0
    const timer = setInterval(() => {
      if (stepIdx < STEPS.length) {
        setFetchPct(STEPS[stepIdx].pct)
        setFetchStep(STEPS[stepIdx].label)
        stepIdx++
      }
    }, 1400)

    try {
      const result = await fetchOrImportBars(codeUpper, dateStr)
      clearInterval(timer)
      const barCount = result?.bars?.length ?? 0
      setFetchPct(100)
      setFetchStep(`✅ ${barCount > 0 ? barCount + ' bar' : 'Data'} siap — klik Mulai Simulasi`)
      setSimDates(prev => [...new Set([dateStr, ...prev])].sort((a, b) => b.localeCompare(a)))
      setDateStatus('ok')
      // Keep the 100% bar visible — cleared when simulation starts or date changes
    } catch {
      clearInterval(timer)
      setFetchPct(0); setFetchStep('')
      setDateStatus('error')
    }
  }

  async function handleStart() {
    clearSimTimer()
    setFetchPct(0); setFetchStep('') // clear fetch progress bar
    setSimMode('loading')
    setSimIdx(0)
    setSimStartTime('')
    try {
      const data     = await fetchAllBars(codeUpper, simDate)
      const full     = data?.bars ?? []
      if (full.length === 0) { setSimMode('idle'); return }
      const startIdx = findStartIndex(full)
      setAllBars(full)
      setSimMode('playing')
      setSimIdx(startIdx)
      setSimStartTime(full[startIdx]?.bar_time?.slice(11, 16) ?? '')
      startTicking(startIdx, full)
    } catch {
      setSimMode('idle')
    }
  }

  function handlePause()  { clearSimTimer(); setSimMode('paused') }
  function handleResume() { setSimMode('playing'); startTicking(simIdx, allBars) }
  function handleStop()   { clearSimTimer(); setSimMode('idle'); setSimIdx(0); setAllBars([]); setSimStartTime('') }

  function handleSpeedChange(idx) {
    setSpeedIdx(idx)
    if (simMode === 'playing') { clearSimTimer(); startTicking(simIdx, allBars) }
  }

  useEffect(() => {
    if (simMode === 'playing' && allBars.length > 0) {
      clearSimTimer()
      startTicking(simIdx, allBars)
    }
    return clearSimTimer
  }, [speedIdx]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => clearSimTimer(), [])

  // ── Trade sheet ───────────────────────────────────────────────────────
  const [tradeSheet, setTradeSheet] = useState({ open: false, orderType: 'buy' })

  // ── Derived values ────────────────────────────────────────────────────
  const inSim        = simMode !== 'idle'
  const displayBars  = inSim && allBars.length > 0 ? allBars.slice(0, simIdx + 1) : bars
  const displayPrice = inSim && allBars[simIdx] ? allBars[simIdx].close : currentPrice

  const openPrice = displayBars.length > 0 ? displayBars[0].open  : null
  const dayHigh   = displayBars.length > 0 ? Math.max(...displayBars.map(b => b.high)) : null
  const dayLow    = displayBars.length > 0 ? Math.min(...displayBars.map(b => b.low))  : null
  const lastBar   = displayBars.length > 0 ? displayBars[displayBars.length - 1] : null

  const changePct = openPrice && displayPrice
    ? ((displayPrice - openPrice) / openPrice * 100)
    : (passedStock?.price_change_pct ?? null)
  const up = (changePct ?? 0) >= 0

  const holdingPnl = passedHolding && displayPrice != null
    ? (displayPrice - passedHolding.avg_price_per_share) * passedHolding.lots * 100
    : passedHolding?.pnl ?? 0

  const closes   = displayBars.map(b => b.close)
  const rsiValue = closes.length > 1 ? calcRSI(closes) : 50

  // Sim badge date label
  const simDateLabel = simDate
    ? new Date(simDate + 'T00:00:00+07:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    : ''

  // Bar counter
  const totalBars    = inSim ? allBars.length : displayBars.length
  const currentBarNo = inSim ? simIdx + 1 : displayBars.length

  // Scrub progress
  const scrubPct = totalBars > 1 ? ((simIdx / (totalBars - 1)) * 100) : 0
  const simTime  = allBars[simIdx]?.bar_time?.slice(11, 16) ?? '—'
  const firstTime = allBars[0]?.bar_time?.slice(11, 16)    ?? '09:00'

  // Sisa kas display
  const sisaKas = passedCash != null
    ? (passedCash >= 1_000_000 ? (passedCash / 1_000_000).toFixed(1) + 'jt' : passedCash.toLocaleString('id-ID'))
    : '—'

  // ── Skeleton ─────────────────────────────────────────────────────────
  if (loadingBars && bars.length === 0) {
    return (
      <div style={{ background: '#0d1117', minHeight: '100svh', color: '#e6edf3' }}>
        <div style={{ padding: '10px 14px', borderBottom: '0.5px solid #30363d', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button type="button" onClick={() => navigate('/arena')}
            style={{ color: '#58a6ff', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            ← Arena
          </button>
          <span style={{ fontSize: 11, color: '#8b949e' }}>Memuat…</span>
        </div>
        <div style={{ padding: '12px 14px' }}>
          <div style={{ height: 22, width: 80, background: '#21262d', borderRadius: 4, marginBottom: 6 }} />
          <div style={{ height: 14, width: 160, background: '#21262d', borderRadius: 4, marginBottom: 16 }} />
          <div style={{ height: 220, background: '#161b22', borderRadius: 8 }} />
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#0d1117', minHeight: '100svh', color: '#e6edf3', maxWidth: 448, margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>

      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '0.5px solid #30363d' }}>
        <button type="button" onClick={() => navigate('/arena')}
          style={{ color: '#58a6ff', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          ← Arena
        </button>

        {inSim && simMode !== 'loading' ? (
          <div style={{ background: '#1f2d1f', border: '0.5px solid #3fb950', color: '#3fb950', borderRadius: 20, padding: '3px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#3fb950', display: 'inline-block', animation: 'blink 1.4s infinite' }} />
            SIMULASI · {simDateLabel}
          </div>
        ) : (
          <div style={{ fontSize: 12, color: '#8b949e' }}>{codeUpper}</div>
        )}

        <div style={{ fontSize: 11, color: '#8b949e' }}>
          {inSim ? `Bar ${currentBarNo}/${totalBars}` : `${displayBars.length} bar`}
        </div>
      </div>

      {/* ── Stock header ─────────────────────────────────────────────── */}
      <div style={{ padding: '12px 14px 8px', borderBottom: '0.5px solid #21262d' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>{codeUpper}</h2>
            <p style={{ color: '#8b949e', fontSize: 12, marginTop: 2 }}>{passedStock?.name ?? ''}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 24, fontWeight: 600 }}>
              {displayPrice ? `Rp ${Number(displayPrice).toLocaleString('id-ID')}` : '—'}
            </div>
            {changePct != null && (
              <div style={{ fontSize: 13, marginTop: 2, color: up ? '#3fb950' : '#f85149' }}>
                {changePct >= 0 ? '+' : ''}{changePct.toFixed(2)}%
              </div>
            )}
          </div>
        </div>

        {/* OHLCV strip — hidden when trade form is open to save space */}
        <div style={{ display: tradeSheet.open ? 'none' : 'flex', marginTop: 10, border: '0.5px solid #21262d', borderRadius: 8, overflow: 'hidden' }}>
          {[
            { label: 'Open',  value: openPrice,                        color: '#e6edf3' },
            { label: 'High',  value: dayHigh,                          color: '#3fb950' },
            { label: 'Low',   value: dayLow,                           color: '#f85149' },
            { label: 'Close', value: lastBar?.close,                   color: '#e6edf3' },
            { label: 'Vol',   value: lastBar?.volume > 0 ? `${((lastBar.volume || 0) / 1000).toFixed(0)}K` : '—', color: '#e6edf3', raw: true },
          ].map(({ label, value, color, raw }, idx, arr) => (
            <div key={label} style={{ flex: 1, textAlign: 'center', padding: '6px 4px', borderRight: idx < arr.length - 1 ? '0.5px solid #21262d' : 'none' }}>
              <div style={{ fontSize: 10, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</div>
              <div style={{ fontSize: 13, fontWeight: 500, marginTop: 2, color }}>
                {raw ? value : (value != null ? Number(value).toLocaleString('id-ID') : '—')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Chart type bar — hidden when trade form is open ─────────── */}
      <div style={{ margin: '10px 14px 0', border: '0.5px solid #30363d', borderRadius: 8, overflow: 'hidden', display: tradeSheet.open ? 'none' : 'flex', width: 'fit-content' }}>
        {[['line', '⋯ Line'], ['bar', '▐ Bar']].map(([type, label], i, arr) => (
          <button key={type} type="button" onClick={() => setChartType(type)}
            style={{
              padding: '5px 14px', fontSize: 12, cursor: 'pointer', border: 'none',
              borderRight: i < arr.length - 1 ? '0.5px solid #30363d' : 'none',
              background: chartType === type ? '#1f3a5f' : 'transparent',
              color: chartType === type ? '#58a6ff' : '#8b949e',
              transition: 'all .15s',
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Indicator tabs — hidden when trade form is open ──────────── */}
      <div style={{ display: tradeSheet.open ? 'none' : 'flex', gap: 6, padding: '8px 14px 4px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {/* EMA */}
        <button type="button" onClick={() => setShowEma(v => !v)}
          style={{
            padding: '4px 10px', borderRadius: 20, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap',
            border: `0.5px solid ${showEma ? '#58a6ff' : '#30363d'}`,
            background: showEma ? '#1f3a5f' : 'transparent',
            color: showEma ? '#58a6ff' : '#8b949e',
          }}>
          EMA 9/21/50
        </button>
        {/* Volume */}
        <button type="button" onClick={() => setShowVol(v => !v)}
          style={{
            padding: '4px 10px', borderRadius: 20, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap',
            border: `0.5px solid ${showVol ? '#3fb950' : '#30363d'}`,
            background: showVol ? '#1f2d1f' : 'transparent',
            color: showVol ? '#3fb950' : '#8b949e',
          }}>
          Volume
        </button>
        {/* Bandarmology */}
        <button type="button" onClick={() => setShowBand(v => !v)}
          style={{
            padding: '4px 10px', borderRadius: 20, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap',
            border: `0.5px solid ${showBand ? '#bc8cff' : '#30363d'}`,
            background: showBand ? '#2d1f3a' : 'transparent',
            color: showBand ? '#bc8cff' : '#8b949e',
          }}>
          Bandarmology
        </button>
        {/* RSI */}
        <button type="button" onClick={() => setShowRsi(v => !v)}
          style={{
            padding: '4px 10px', borderRadius: 20, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap',
            border: `0.5px solid ${showRsi ? '#e3b341' : '#30363d'}`,
            background: showRsi ? '#2d2a1f' : 'transparent',
            color: showRsi ? '#e3b341' : '#8b949e',
          }}>
          RSI 14
        </button>
        {/* Bollinger ↗ */}
        <button type="button" onClick={() => navigate('/lesson?level=4')}
          style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap', border: '0.5px solid #30363d', background: 'transparent', color: '#8b949e' }}>
          Bollinger ↗
        </button>
        {/* MACD ↗ */}
        <button type="button" onClick={() => navigate('/lesson?level=4')}
          style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap', border: '0.5px solid #30363d', background: 'transparent', color: '#8b949e' }}>
          MACD ↗
        </button>
      </div>

      {/* ── Canvas chart ─────────────────────────────────────────────── */}
      {displayBars.length >= 2 ? (
        <CandleChart
          bars={displayBars}
          chartType={chartType}
          showEma={showEma}
          showVolume={showVol && !tradeSheet.open}
        />
      ) : (
        <div style={{ height: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '0 14px' }}>
          <p style={{ fontSize: 20 }}>{simMode === 'loading' ? '⌛' : '⏳'}</p>
          <p style={{ fontSize: 12, color: '#8b949e' }}>
            {simMode === 'loading' ? 'Mengambil data simulasi…' : 'Menunggu data intraday pasar…'}
          </p>
          {simMode === 'idle' && <p style={{ fontSize: 11, color: '#6e7681' }}>Data tersedia saat pasar buka (09:00 WIB)</p>}
        </div>
      )}

      {/* ── Bandarmology panel — hidden when trade form is open ──────── */}
      {showBand && !tradeSheet.open && <BandPanel code={codeUpper} simIdx={simIdx} />}

      {/* ── RSI panel — hidden when trade form is open ───────────────── */}
      {showRsi && !tradeSheet.open && <RsiPanel rsiValue={rsiValue} />}

      {/* ── Playback / sim controls ──────────────────────────────────── */}
      {simMode !== 'idle' ? (
        <div style={{ padding: '6px 14px 8px' }}>
          {/* Scrub row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
            <span style={{ fontSize: 11, color: '#8b949e', flexShrink: 0 }}>{firstTime}</span>
            <div
              style={{ flex: 1, height: 4, background: '#21262d', borderRadius: 2, cursor: 'pointer', position: 'relative' }}
              onClick={e => {
                const rect = e.currentTarget.getBoundingClientRect()
                const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
                const idx  = Math.max(0, Math.min(allBars.length - 1, Math.round(pct * (allBars.length - 1))))
                setSimIdx(idx)
              }}
            >
              <div style={{ width: `${scrubPct}%`, height: 4, background: '#58a6ff', borderRadius: 2, pointerEvents: 'none' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#58a6ff', position: 'absolute', top: -4, left: `${scrubPct}%`, transform: 'translateX(-50%)', cursor: 'pointer' }} />
            </div>
            <span style={{ fontSize: 11, color: '#58a6ff', flexShrink: 0 }}>{simTime}</span>
          </div>
          {/* Controls row */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {simMode === 'playing' ? (
              <button type="button" onClick={handlePause}
                style={{ background: '#1f3a5f', border: '0.5px solid #58a6ff', color: '#58a6ff', borderRadius: 6, padding: '5px 12px', fontSize: 13, cursor: 'pointer' }}>
                ⏸ Jeda
              </button>
            ) : simMode === 'paused' ? (
              <button type="button" onClick={handleResume}
                style={{ background: '#1f3a5f', border: '0.5px solid #58a6ff', color: '#58a6ff', borderRadius: 6, padding: '5px 12px', fontSize: 13, cursor: 'pointer' }}>
                ▶ Lanjut
              </button>
            ) : (
              <button type="button" onClick={handleStart}
                style={{ background: '#161b22', border: '0.5px solid #30363d', color: '#e6edf3', borderRadius: 6, padding: '5px 12px', fontSize: 13, cursor: 'pointer' }}>
                ↺ Ulangi
              </button>
            )}
            <button type="button" onClick={handleStop}
              style={{ background: '#161b22', border: '0.5px solid #30363d', color: '#e6edf3', borderRadius: 6, padding: '5px 12px', fontSize: 13, cursor: 'pointer' }}>
              ■ Stop
            </button>
            <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
              {SPEEDS.map((s, i) => (
                <button key={s.label} type="button" onClick={() => handleSpeedChange(i)}
                  style={{
                    background: speedIdx === i ? '#1f2d1f' : '#161b22',
                    border: `0.5px solid ${speedIdx === i ? '#3fb950' : '#30363d'}`,
                    color: speedIdx === i ? '#3fb950' : '#8b949e',
                    borderRadius: 4, padding: '3px 8px', fontSize: 11, cursor: 'pointer',
                  }}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ── Idle: date picker ── */
        <div style={{ padding: '8px 14px 10px' }}>
          <div style={{ background: '#161b22', borderRadius: 10, padding: '10px 12px', border: '0.5px solid #30363d' }}>
            <p style={{ fontSize: 10, color: '#8b949e', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>
              📅 Pilih Data Simulasi
            </p>

            <input
              type="date"
              value={simDate}
              max={new Date(Date.now() - 86400000).toISOString().slice(0, 10)}
              onChange={e => handleDatePick(e.target.value)}
              style={{
                width: '100%', padding: '7px 10px', borderRadius: 8, fontSize: 13,
                background: 'rgba(255,255,255,0.05)', color: '#e6edf3',
                border: '0.5px solid #30363d', marginBottom: 8,
                colorScheme: 'dark', outline: 'none',
              }}
            />

            {simDates.length > 0 && (
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2, scrollbarWidth: 'none' }}>
                {simDates.map(d => {
                  const chipLabel = new Date(d + 'T00:00:00+07:00').toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })
                  const selected  = d === simDate
                  return (
                    <button key={d} type="button" onClick={() => handleDatePick(d)}
                      style={{
                        flexShrink: 0, padding: '6px 12px', borderRadius: 20, cursor: 'pointer',
                        border: `0.5px solid ${selected ? '#3fb950' : '#30363d'}`,
                        background: selected ? 'rgba(63,185,80,0.15)' : 'transparent',
                        color: selected ? '#3fb950' : '#8b949e',
                        fontSize: 12, whiteSpace: 'nowrap',
                      }}>
                      {chipLabel}
                    </button>
                  )
                })}
              </div>
            )}

            {simDate && dateStatus === 'ok' && (
              <p style={{ fontSize: 11, color: '#3fb950', marginTop: 7 }}>
                {new Date(simDate + 'T00:00:00+07:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}
            {dateStatus === 'weekend' && (
              <p style={{ fontSize: 11, color: '#f85149', marginTop: 7 }}>🚫 Pasar tutup hari itu (libur weekend)</p>
            )}
            {dateStatus === 'error' && (
              <p style={{ fontSize: 11, color: '#f85149', marginTop: 7 }}>⚠️ Data tidak tersedia. Coba tanggal lain.</p>
            )}

            {(dateStatus === 'fetching' || fetchPct > 0) && dateStatus !== 'weekend' && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#8b949e', marginBottom: 4 }}>
                  <span>{fetchStep}</span><span>{fetchPct}%</span>
                </div>
                <div style={{ height: 6, background: '#21262d', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${fetchPct}%`, height: '100%', background: fetchPct === 100 ? '#3fb950' : '#58a6ff', borderRadius: 3, transition: 'width 0.5s ease' }} />
                </div>
              </div>
            )}
          </div>

          <button type="button" onClick={handleStart}
            disabled={!simDate || dateStatus !== 'ok'}
            style={{
              width: '100%', padding: '11px', borderRadius: 8, marginTop: 8,
              background: simDate && dateStatus === 'ok' ? '#1f4d2a' : 'rgba(255,255,255,0.05)',
              color: simDate && dateStatus === 'ok' ? '#3fb950' : '#6e7681',
              border: `0.5px solid ${simDate && dateStatus === 'ok' ? '#3fb950' : '#30363d'}`,
              fontSize: 14, cursor: simDate && dateStatus === 'ok' ? 'pointer' : 'not-allowed',
            }}>
            {dateStatus === 'fetching' ? '⏳ Mengambil data…' : '▶ Mulai Simulasi'}
          </button>
        </div>
      )}

      {/* ── Inline trade form OR learn pill + action row + portfolio strip ── */}
      {tradeSheet.open ? (
        <TradeSheet
          open={tradeSheet.open}
          orderType={tradeSheet.orderType}
          onClose={() => setTradeSheet(s => ({ ...s, open: false }))}
          code={codeUpper}
          stock={passedStock}
          holding={passedHolding}
          currentPrice={displayPrice}
        />
      ) : (
        <>
          {/* Learn pill */}
          <div
            onClick={() => navigate('/lesson?level=4')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#1f2d1f', border: '0.5px solid #3fb950', color: '#3fb950', borderRadius: 20, padding: '4px 10px', fontSize: 11, margin: '0 14px 8px', cursor: 'pointer' }}>
            📚 Pelajari sinyal ini →
          </div>

          {/* Action row */}
          <div style={{ display: 'flex', gap: 8, padding: '0 14px 10px' }}>
            <button type="button"
              onClick={() => setTradeSheet({ open: true, orderType: 'buy' })}
              style={{ flex: 1, background: '#1f4d2a', border: '0.5px solid #3fb950', color: '#3fb950', borderRadius: 8, padding: 11, fontSize: 15, fontWeight: 500, cursor: 'pointer', textAlign: 'center' }}>
              ↑ Beli
            </button>
            <button type="button"
              onClick={() => setTradeSheet({ open: true, orderType: 'sell' })}
              style={{ flex: 1, background: '#3a1a1a', border: '0.5px solid #f85149', color: '#f85149', borderRadius: 8, padding: 11, fontSize: 15, fontWeight: 500, cursor: passedHolding ? 'pointer' : 'default', textAlign: 'center', opacity: passedHolding ? 1 : 0.5 }}>
              ↓ Jual
            </button>
          </div>

          {/* Portfolio strip */}
          <div style={{ background: '#161b22', borderTop: '0.5px solid #21262d', display: 'flex', justifyContent: 'space-around', padding: '10px 0' }}>
            {[
              { label: 'Modal',       value: 'Rp 10jt',                  color: '#e6edf3' },
              { label: 'Lot dimiliki', value: `${passedHolding?.lots ?? 0} lot`, color: passedHolding ? '#3fb950' : '#e6edf3' },
              {
                label: 'P&L',
                value: passedHolding
                  ? `${holdingPnl >= 0 ? '+' : ''}Rp ${Math.abs(holdingPnl).toLocaleString('id-ID')}`
                  : '—',
                color: passedHolding ? (holdingPnl >= 0 ? '#3fb950' : '#f85149') : '#8b949e',
              },
              { label: 'Sisa kas',    value: sisaKas,                     color: '#e6edf3' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</div>
                <div style={{ fontSize: 14, fontWeight: 500, marginTop: 2, color }}>{value}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Debrief sheet ────────────────────────────────────────────── */}
      <DebriefSheet
        open={simMode === 'done'}
        onClose={handleStop}
        onRestart={handleStop}
        code={codeUpper}
        allBars={allBars}
        simDate={simDate}
        navigate={navigate}
      />

      {/* blink keyframe injected inline */}
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
    </div>
  )
}
