import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { fetchStockBars, fetchAllBars, fetchSimDates, fetchOrImportBars, placeArenaOrder } from '../api/arena'
import { BottomNav } from '../components/BottomNav'
import { OjkDisclaimer } from '../components/OjkDisclaimer'

// ── Chart ─────────────────────────────────────────────────────────────────

function IntradayChart({ bars, allBars, simIdx, simMode }) {
  const [tooltipIdx, setTooltipIdx] = useState(null)

  // In simulation mode show growing slice of allBars, else show live bars.
  const display = simMode !== 'idle' && allBars.length > 0
    ? allBars.slice(0, simIdx + 1)
    : bars

  // Clear tooltip when simulation advances so it doesn't linger on old position
  useEffect(() => { setTooltipIdx(null) }, [display.length])

  if (display.length < 2) {
    const isSimLoading = simMode === 'loading'
    return (
      <div style={{ height: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <p style={{ fontSize: 20 }}>{isSimLoading ? '⌛' : '⏳'}</p>
        <p style={{ fontSize: 12, color: 'var(--arena-text-muted)' }}>
          {isSimLoading ? 'Mengambil data simulasi…' : 'Menunggu data intraday pasar…'}
        </p>
        {!isSimLoading && <p style={{ fontSize: 11, color: 'var(--arena-text-dim)' }}>Data tersedia saat pasar buka (09:00 WIB)</p>}
      </div>
    )
  }

  const closes  = display.map(b => b.close)
  const minP    = Math.min(...closes)
  const maxP    = Math.max(...closes)
  const pad     = (maxP - minP) * 0.1 || maxP * 0.005
  const lo      = minP - pad
  const hi      = maxP + pad
  const range   = hi - lo || 1
  const W = 300
  const H = 120

  const pts = closes.map((p, i) => {
    const x = closes.length < 2 ? W / 2 : (i / (closes.length - 1)) * W
    const y = H - ((p - lo) / range) * H
    return [x, y]
  })

  const linePts  = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const lastX    = pts[pts.length - 1][0]
  const areaPath = `M0,${pts[0][1].toFixed(1)} L${linePts} L${lastX.toFixed(1)},${H} L0,${H} Z`

  const up        = closes[closes.length - 1] >= closes[0]
  const lineColor = up ? 'var(--arena-accent)' : 'var(--arena-sell)'
  const [cx, cy]  = pts[pts.length - 1]

  const midP = Math.round((maxP + minP) / 2)
  const fmt  = v => Number(v).toLocaleString('id-ID')
  const yPct = p => (1 - (p - lo) / range) * 100

  const yTicks = [
    { price: maxP, pct: yPct(maxP) },
    { price: midP, pct: yPct(midP) },
    { price: minP, pct: yPct(minP) },
  ]

  const labelW = 44

  // Pointer handlers — work for both mouse and touch
  function handleMove(e) {
    const rect     = e.currentTarget.getBoundingClientRect()
    const clientX  = e.touches ? e.touches[0].clientX : e.clientX
    const ratio    = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    setTooltipIdx(Math.round(ratio * (display.length - 1)))
  }

  const ti     = tooltipIdx
  const tipBar = ti !== null ? display[ti] : null
  // x position of crosshair as % of chart-area width (SVG viewBox 0–W maps 1:1 to 0–100%)
  const tipXPct = ti !== null ? (pts[ti][0] / W) * 100 : 0

  return (
    <div style={{ display: 'flex', height: H, alignItems: 'stretch' }}>

      {/* Y-axis label column */}
      <div style={{ position: 'relative', width: labelW, flexShrink: 0 }}>
        {yTicks.map(({ price, pct }, i) => (
          <span key={i} style={{
            position: 'absolute', right: 4,
            top: `${pct}%`, transform: 'translateY(-50%)',
            fontSize: 11, fontWeight: 700,
            color: 'rgba(160,210,185,0.8)',
            lineHeight: 1, whiteSpace: 'nowrap',
          }}>
            {fmt(price)}
          </span>
        ))}
      </div>

      {/* Chart area — interactive */}
      <div
        style={{ position: 'relative', flex: 1, overflow: 'hidden', touchAction: 'none', cursor: 'crosshair' }}
        onMouseMove={handleMove}
        onMouseLeave={() => setTooltipIdx(null)}
        onTouchStart={handleMove}
        onTouchMove={handleMove}
        onTouchEnd={() => setTooltipIdx(null)}
      >
        {/* Horizontal grid lines */}
        {yTicks.map(({ price, pct }, i) => (
          <div key={i} style={{
            position: 'absolute', left: 0, right: 0,
            top: `${pct}%`,
            borderTop: '1px dashed rgba(255,255,255,0.07)',
            pointerEvents: 'none',
          }} />
        ))}

        <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: 'block' }}>
          <defs>
            <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={lineColor} stopOpacity="0.35" />
              <stop offset="100%" stopColor={lineColor} stopOpacity="0"    />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#fill)" />
          <polyline points={linePts} stroke={lineColor} strokeWidth="2.5" fill="none" strokeLinejoin="round" strokeLinecap="round" />

          {/* Live trailing dot — hidden while tooltip is active */}
          {ti === null && (
            <>
              <circle cx={cx.toFixed(1)} cy={cy.toFixed(1)} r="5"  fill={lineColor} />
              <circle cx={cx.toFixed(1)} cy={cy.toFixed(1)} r="10" fill={lineColor} opacity="0.2" />
            </>
          )}

          {/* Crosshair vertical line + dot */}
          {ti !== null && pts[ti] && (
            <>
              <line
                x1={pts[ti][0].toFixed(1)} y1="0"
                x2={pts[ti][0].toFixed(1)} y2={H}
                stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="3,3"
              />
              <circle
                cx={pts[ti][0].toFixed(1)} cy={pts[ti][1].toFixed(1)}
                r="5" fill="white" stroke={lineColor} strokeWidth="2"
              />
            </>
          )}
        </svg>

        {/* OHLC tooltip bubble */}
        {tipBar && (
          <div style={{
            position: 'absolute', top: 4, pointerEvents: 'none', zIndex: 10,
            // Flip to left side when crosshair is in the right 55% of the chart
            left:  tipXPct <= 55 ? `calc(${tipXPct}% + 8px)` : undefined,
            right: tipXPct >  55 ? `calc(${100 - tipXPct}% + 8px)` : undefined,
            background: 'rgba(6,18,10,0.94)',
            border: '1px solid rgba(74,222,128,0.45)',
            borderRadius: 9, padding: '7px 10px',
            minWidth: 118,
            boxShadow: '0 4px 16px rgba(0,0,0,0.45)',
          }}>
            <p style={{ fontSize: 11, color: 'var(--arena-accent)', fontWeight: 800, marginBottom: 3 }}>
              {tipBar.bar_time?.slice(11, 16)} WIB
            </p>
            <p style={{ fontSize: 15, fontWeight: 900, color: 'white', fontFamily: "'Fredoka One',cursive", marginBottom: 4, lineHeight: 1 }}>
              Rp {fmt(tipBar.close)}
            </p>
            <div style={{ display: 'flex', gap: 7 }}>
              <span style={{ fontSize: 10, color: '#A0D0C0' }}>O {fmt(tipBar.open)}</span>
              <span style={{ fontSize: 10, color: 'var(--arena-accent)' }}>H {fmt(tipBar.high)}</span>
              <span style={{ fontSize: 10, color: 'var(--arena-sell)' }}>L {fmt(tipBar.low)}</span>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}

// ── Simulation controls ───────────────────────────────────────────────────

const SPEEDS = [
  { label: '1×',   ms: 60_000, hint: '1 mnt/bar' },
  { label: '5×',   ms: 12_000, hint: '12 dtk/bar' },
  { label: '10×',  ms:  6_000, hint: '6 dtk/bar'  },
  { label: '100×', ms:    600, hint: '0.6 dtk/bar' },
]

// Returns the bar index whose time best matches current WIB clock,
// if the market is open. Returns 0 if outside market hours.
function findStartIndex(allBars) {
  if (!allBars.length) return 0
  // Always derive WIB from UTC epoch (safe regardless of browser timezone)
  const wib = new Date(Date.now() + 7 * 3_600_000)
  const day       = wib.getUTCDay()   // 0=Sun … 6=Sat
  const h         = wib.getUTCHours()
  const m         = wib.getUTCMinutes()
  const totalMins = h * 60 + m
  // Treat the full trading day window (09:00–16:00 WIB) as "in market"
  // so users just after the 15:00 close still get positioned at current time.
  const inMarket  = day >= 1 && day <= 5 &&
    totalMins >= 9 * 60 && totalMins < 16 * 60
  if (!inMarket) return 0
  let bestIdx = 0
  for (let i = 0; i < allBars.length; i++) {
    const bt      = allBars[i].bar_time ?? '' // "2026-04-02T09:00:00" WIB
    const barMins = parseInt(bt.slice(11, 13), 10) * 60 + parseInt(bt.slice(14, 16), 10)
    if (barMins <= totalMins) bestIdx = i
    else break
  }
  return bestIdx
}

function SimControls({ simMode, simIdx, allBars, speedIdx, simStartTime, simDate, simDates, dateStatus, fetchPct, fetchStep, onSimDateChange, onStart, onPause, onResume, onStop, onSpeedChange }) {
  const total     = allBars.length
  const progress  = total > 1 ? (simIdx / (total - 1)) * 100 : 0
  const simTime   = allBars[simIdx]?.bar_time?.slice(11, 16) ?? '—'
  const firstTime = allBars[0]?.bar_time?.slice(11, 16)      ?? '09:00'
  const lastTime  = allBars[total - 1]?.bar_time?.slice(11, 16) ?? '15:00'

  const dateLabel = simDate
    ? new Date(simDate + 'T00:00:00+07:00').toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : '—'

  if (simMode === 'idle') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* Date picker card */}
        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '10px 12px', border: '1px solid var(--arena-border)' }}>
          <p style={{ fontSize: 10, color: 'var(--arena-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>
            📅 Pilih Data Simulasi
          </p>

          {/* Free date input */}
          <input
            type="date"
            value={simDate}
            max={new Date(Date.now() - 86400000).toISOString().slice(0, 10)}
            onChange={e => onSimDateChange(e.target.value)}
            style={{
              width: '100%', padding: '7px 10px', borderRadius: 8, fontSize: 13,
              background: 'rgba(255,255,255,0.08)', color: '#E8F4EE',
              border: '1px solid var(--arena-border)', marginBottom: 8,
              colorScheme: 'dark',
            }}
          />

          {simDates.length > 0 && (
            /* Scrollable date chips (quick access to dates already in DB) */
            <div className="scrollbar-none" style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
              {simDates.map(d => {
                const chipLabel = new Date(d + 'T00:00:00+07:00').toLocaleDateString('id-ID', {
                  weekday: 'short', day: 'numeric', month: 'short',
                })
                const selected = d === simDate
                return (
                  <button key={d} type="button" onClick={() => onSimDateChange(d)}
                    style={{
                      flexShrink: 0, padding: '6px 12px', borderRadius: 20, cursor: 'pointer',
                      border: `1.5px solid ${selected ? 'rgba(74,222,128,0.6)' : 'rgba(255,255,255,0.15)'}`,
                      background: selected ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.05)',
                      color: selected ? 'var(--arena-accent)' : 'var(--arena-text-muted)',
                      fontSize: 12, fontWeight: selected ? 800 : 600,
                      whiteSpace: 'nowrap',
                    }}>
                    {chipLabel}
                  </button>
                )
              })}
            </div>
          )}

          {simDate && dateStatus === 'ok' && (
            <p style={{ fontSize: 11, color: 'var(--arena-accent)', fontWeight: 700, marginTop: 7 }}>{dateLabel}</p>
          )}

          {dateStatus === 'weekend' && (
            <p style={{ fontSize: 11, color: 'var(--arena-sell)', fontWeight: 700, marginTop: 7 }}>
              🚫 Pasar tutup hari itu (libur weekend)
            </p>
          )}

          {dateStatus === 'error' && (
            <p style={{ fontSize: 11, color: 'var(--arena-sell)', fontWeight: 700, marginTop: 7 }}>
              ⚠️ Data tidak tersedia untuk tanggal ini. Coba tanggal lain.
            </p>
          )}

          {/* Fetch progress bar */}
          {(dateStatus === 'fetching' || fetchPct > 0) && dateStatus !== 'weekend' && (
            <div style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--arena-text-muted)', marginBottom: 4 }}>
                <span>{fetchStep}</span>
                <span>{fetchPct}%</span>
              </div>
              <div style={{ height: 6, background: 'var(--arena-border)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  width: `${fetchPct}%`, height: '100%',
                  background: fetchPct === 100
                    ? 'var(--arena-accent)'
                    : 'linear-gradient(90deg, #28A060, var(--arena-accent))',
                  borderRadius: 3, transition: 'width 0.5s ease',
                }} />
              </div>
            </div>
          )}
        </div>

        {/* Start button */}
        <button
          type="button"
          onClick={onStart}
          disabled={!simDate || dateStatus !== 'ok'}
          style={{
            width: '100%', padding: '13px', borderRadius: 12,
            background: (simDate && dateStatus === 'ok') ? 'var(--arena-accent-dim)' : 'rgba(255,255,255,0.05)',
            color: (simDate && dateStatus === 'ok') ? 'var(--arena-accent)' : 'var(--arena-text-dim)',
            border: `1.5px solid ${(simDate && dateStatus === 'ok') ? 'var(--arena-accent-border)' : 'var(--arena-border)'}`,
            fontFamily: "'Fredoka One',cursive", fontSize: 16,
            cursor: (simDate && dateStatus === 'ok') ? 'pointer' : 'not-allowed',
            letterSpacing: '0.5px',
          }}
        >
          {dateStatus === 'fetching' ? '⏳ Mengambil data…' : '▶ Mulai Simulasi'}
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Progress bar */}
      <div style={{ position: 'relative' }}>
        <div style={{ height: 10, background: 'var(--arena-border)', borderRadius: 5, overflow: 'hidden' }}>
          <div style={{
            width: `${progress}%`, height: '100%',
            background: 'linear-gradient(90deg,#28A060,var(--arena-accent))',
            borderRadius: 5, transition: 'width 0.15s linear',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
          <span style={{ fontSize: 11, color: 'var(--arena-text-dim)' }}>{firstTime}</span>
          <span style={{ fontSize: 12, fontWeight: 900, color: 'var(--arena-accent)', fontFamily: "'Fredoka One',cursive" }}>
            {simTime} WIB
          </span>
          <span style={{ fontSize: 11, color: 'var(--arena-text-dim)' }}>{lastTime}</span>
        </div>
      </div>

      {/* Buttons row */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {/* Play / Pause */}
        {simMode === 'playing' ? (
          <button type="button" onClick={onPause}
            style={{ ...simBtn, background: 'rgba(255,255,255,0.12)', color: 'white', flex: 1 }}>
            ⏸ Jeda
          </button>
        ) : simMode === 'paused' ? (
          <button type="button" onClick={onResume}
            style={{ ...simBtn, background: 'rgba(74,222,128,0.2)', color: 'var(--arena-accent)', flex: 1 }}>
            ▶ Lanjut
          </button>
        ) : (
          <button type="button" onClick={onStart}
            style={{ ...simBtn, background: 'rgba(74,222,128,0.2)', color: 'var(--arena-accent)', flex: 1 }}>
            ↺ Ulangi
          </button>
        )}

        {/* Stop */}
        <button type="button" onClick={onStop}
          style={{ ...simBtn, background: 'rgba(255,255,255,0.07)', color: 'var(--arena-text-muted)', flex: 1 }}>
          ⏹ Stop
        </button>

        {/* Speed selector */}
        <div style={{ display: 'flex', gap: 4, flexDirection: 'column', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {SPEEDS.map((s, i) => (
              <button key={s.label} type="button" onClick={() => onSpeedChange(i)}
                style={{
                  minHeight: 44, padding: '0 10px', borderRadius: 8,
                  fontSize: 12, fontWeight: 800, cursor: 'pointer',
                  background: speedIdx === i ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.07)',
                  color: speedIdx === i ? 'var(--arena-accent)' : 'var(--arena-text-muted)',
                  border: `1px solid ${speedIdx === i ? 'var(--arena-accent-border)' : 'var(--arena-border)'}`,
                }}>
                {s.label}
              </button>
            ))}
          </div>
          <span style={{ fontSize: 11, color: 'var(--arena-text-dim)' }}>{SPEEDS[speedIdx].hint}</span>
        </div>
      </div>

      {/* Data date + bar counter */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 11, color: 'var(--arena-text-dim)' }}>
          Simulasi berdasarkan data <span style={{ color: 'var(--arena-text-muted)', fontWeight: 700 }}>{dateLabel}</span>
        </p>
        <p style={{ fontSize: 11, color: 'var(--arena-text-dim)', marginTop: 2 }}>
          {simMode === 'done'
            ? 'Simulasi selesai'
            : simStartTime
              ? `Mulai ${simStartTime} WIB · Bar ${simIdx + 1} / ${total}`
              : `Bar ${simIdx + 1} / ${total}`}
        </p>
      </div>
    </div>
  )
}

const simBtn = {
  padding: '9px 0', borderRadius: 10, fontSize: 14, fontWeight: 700,
  cursor: 'pointer', border: '1px solid var(--arena-border)',
  fontFamily: "'Fredoka One',cursive",
}

// ── OHLC pill ─────────────────────────────────────────────────────────────

function OHLCStat({ label, value, color }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: 11, color: '#5A8070', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: 12, fontWeight: 900, color: color ?? 'white', fontFamily: "'Fredoka One',cursive" }}>
        {value != null ? Number(value).toLocaleString('id-ID') : '—'}
      </p>
    </div>
  )
}

// ── Trade bottom sheet ────────────────────────────────────────────────────

function TradeSheet({ open, orderType: initialOrderType, onClose, code, stock, holding, currentPrice }) {
  const [orderType, setOrderType]   = useState(initialOrderType)
  const [lots, setLots]             = useState(1)
  const [limitPrice, setLimitPrice] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult]         = useState(null)
  const [error, setError]           = useState(null)

  // Reset state every time the sheet opens
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

  // Keep limit price in sync when switching buy ↔ sell
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
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 100 }}
      />

      {/* Sheet panel */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 448, zIndex: 101,
        background: 'white', borderRadius: '20px 20px 0 0',
        maxHeight: '88vh', display: 'flex', flexDirection: 'column',
        animation: 'slide-up 0.3s cubic-bezier(0.2, 0.85, 0.25, 1) forwards',
      }}>

        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px', flexShrink: 0 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: '#E0D8D0' }} />
        </div>

        {/* Header */}
        <div style={{ padding: '6px 16px 12px', borderBottom: '1px solid #F0EDE8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div>
            <p style={{ fontSize: 20, fontWeight: 900, color: '#1A2030', fontFamily: "'Fredoka One',cursive", lineHeight: 1 }}>{code}</p>
            {stock?.name && <p style={{ fontSize: 11, color: '#8A8080', marginTop: 2 }}>{stock.name}</p>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {currentPrice && (
              <p style={{ fontSize: 17, fontWeight: 900, color: '#1A2030', fontFamily: "'Fredoka One',cursive" }}>
                Rp {Number(currentPrice).toLocaleString('id-ID')}
              </p>
            )}
            <button type="button" onClick={onClose}
              style={{ width: 32, height: 32, borderRadius: 16, border: '1.5px solid #E0D8D0', background: '#F8F6F2', cursor: 'pointer', fontSize: 15, color: '#6A6060', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable form */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 32 }}>

          {result ? (
            /* ── Success state ── */
            <>
              <div style={{
                borderRadius: 18, padding: '28px 20px', textAlign: 'center',
                background: result.status === 'filled' ? '#E8FFF0' : '#FFFBF0',
                border: `2px solid ${result.status === 'filled' ? '#40C860' : '#FFD060'}`,
              }}>
                <span style={{ fontSize: 40 }}>{result.status === 'filled' ? '✅' : '⏳'}</span>
                <p style={{ fontFamily: "'Fredoka One',cursive", fontSize: 20, color: result.status === 'filled' ? '#20A040' : '#CC8800', margin: '10px 0 6px' }}>
                  {result.status === 'filled' ? 'Order Terisi!' : 'Order Diterima'}
                </p>
                <p style={{ fontSize: 13, color: '#4A4040', lineHeight: 1.7 }}>
                  {result.order_type === 'buy' ? 'Beli' : 'Jual'}{' '}
                  <strong>{result.lots} lot</strong> {result.stock_code}{' '}
                  @ Rp {(result.filled_price ?? result.limit_price).toLocaleString('id-ID')}
                </p>
                {result.status !== 'filled' && (
                  <p style={{ fontSize: 11, color: '#8A7060', marginTop: 8, lineHeight: 1.5 }}>
                    Order akan dicek setiap menit.<br />
                    Terisi otomatis jika harga memenuhi limit.
                  </p>
                )}
              </div>
              <button type="button" onClick={onClose}
                style={{
                  width: '100%', padding: '14px', borderRadius: 13, cursor: 'pointer',
                  background: 'linear-gradient(180deg,#48D870,#28B050)', color: 'white',
                  border: '2px solid #20A040', boxShadow: '0 4px 0 #189030',
                  fontFamily: "'Fredoka One',cursive", fontSize: 16,
                }}>
                Kembali ke Chart
              </button>
            </>
          ) : (
            /* ── Form ── */
            <>
              {/* Buy / Sell toggle */}
              <div style={{ display: 'flex', background: '#F0EDE8', borderRadius: 12, padding: 4, gap: 4 }}>
                {['buy', 'sell'].map(type => (
                  <button key={type} type="button" onClick={() => setOrderType(type)}
                    style={{
                      flex: 1, padding: '11px', borderRadius: 10, border: 'none', cursor: 'pointer',
                      fontFamily: "'Fredoka One',cursive", fontSize: 16,
                      background: orderType === type
                        ? (type === 'buy' ? 'linear-gradient(180deg,#48D870,#28B050)' : 'linear-gradient(180deg,#FF7070,#E03040)')
                        : 'transparent',
                      color: orderType === type ? 'white' : '#8A8080',
                      boxShadow: orderType === type ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                      transition: 'all 0.15s',
                    }}>
                    {type === 'buy' ? '⬆ Beli' : '⬇ Jual'}
                  </button>
                ))}
              </div>

              {/* Sell warning */}
              {orderType === 'sell' && !holding && (
                <div style={{ background: '#FFF8E8', border: '1.5px solid #FFD060', borderRadius: 12, padding: '10px 14px' }}>
                  <p style={{ fontSize: 12, color: '#8A6000', fontWeight: 700 }}>
                    ⚠ Kamu belum punya saham {code}. Order jual memerlukan saham yang dimiliki.
                  </p>
                </div>
              )}

              {/* Lots */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#6A6060', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Jumlah Lot <span style={{ fontWeight: 400, color: '#A09080' }}>(1 lot = 100 lembar)</span>
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button type="button" onClick={() => setLots(l => Math.max(1, l - 1))}
                    style={{ width: 44, height: 44, borderRadius: 10, border: '2px solid #E0D8D0', background: 'white', fontSize: 20, cursor: 'pointer', fontWeight: 700, color: '#4A4040' }}>−</button>
                  <input
                    type="number" min={1} value={lots}
                    onChange={e => setLots(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    style={{ flex: 1, height: 44, textAlign: 'center', border: '2px solid #E0D8D0', borderRadius: 10, fontSize: 20, fontWeight: 900, color: '#1A2030', fontFamily: "'Fredoka One',cursive", outline: 'none' }}
                  />
                  <button type="button" onClick={() => setLots(l => l + 1)}
                    style={{ width: 44, height: 44, borderRadius: 10, border: '2px solid #E0D8D0', background: 'white', fontSize: 20, cursor: 'pointer', fontWeight: 700, color: '#4A4040' }}>+</button>
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  {[1, 5, 10, 50].map(v => (
                    <button key={v} type="button" onClick={() => setLots(v)}
                      style={{
                        flex: 1, padding: '7px 0', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                        border: `1.5px solid ${lots === v ? '#28A060' : '#E0D8D0'}`,
                        background: lots === v ? '#E8FFF0' : 'white',
                        color: lots === v ? '#20A040' : '#6A6060',
                      }}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Limit price */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#6A6060', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Harga Limit <span style={{ fontWeight: 400, color: '#A09080' }}>(Rp / lembar)</span>
                  </p>
                  {currentPrice && (
                    <button type="button" onClick={() => setLimitPrice(String(Math.round(currentPrice)))}
                      style={{ fontSize: 11, color: '#28A060', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, padding: 0 }}>
                      Pakai harga kini
                    </button>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 15, color: '#8A8080', fontWeight: 700 }}>Rp</span>
                  <input
                    type="number" min={1} value={limitPrice}
                    onChange={e => setLimitPrice(e.target.value)}
                    style={{
                      width: '100%', height: 52, paddingLeft: 40, paddingRight: 14,
                      border: `2px solid ${fillHint?.ok ? '#40C860' : fillHint ? '#FFB830' : '#E0D8D0'}`,
                      borderRadius: 12, fontSize: 18, fontWeight: 900, color: '#1A2030', outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>
                {fillHint && (
                  <p style={{ fontSize: 11, fontWeight: 700, marginTop: 5, color: fillHint.ok ? '#20A040' : '#8A6000' }}>
                    {fillHint.ok ? '✅' : '⏳'} {fillHint.text}
                  </p>
                )}
              </div>

              {/* Order summary */}
              {parsedLimitPrice > 0 && (
                <div style={{ background: '#F8F6F2', borderRadius: 14, padding: '14px', border: '1px solid #EDE8E0' }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#8A8080', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
                    Ringkasan Order
                  </p>
                  {[
                    { label: 'Saham',    value: `${code} · ${lots} lot · ${(lots * 100).toLocaleString('id-ID')} lembar` },
                    { label: 'Limit',    value: `Rp ${parsedLimitPrice.toLocaleString('id-ID')} / lembar` },
                    { label: isBuy ? 'Total (maks)' : 'Est. Hasil', value: `Rp ${totalValue.toLocaleString('id-ID')}` },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #F0EDE8' }}>
                      <span style={{ fontSize: 12, color: '#8A8080' }}>{label}</span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: '#1A2030' }}>{value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Disclaimer */}
              <OjkDisclaimer compact />

              {/* Error */}
              {error && (
                <div style={{ background: '#FFF0F0', border: '1.5px solid #FFB0B0', borderRadius: 12, padding: '10px 14px' }}>
                  <p style={{ fontSize: 13, color: '#E03040', fontWeight: 700 }}>{error}</p>
                </div>
              )}

              {/* Submit */}
              <button type="button" onClick={handleSubmit} disabled={!canSubmit}
                style={{
                  width: '100%', padding: '15px', borderRadius: 14,
                  fontFamily: "'Fredoka One',cursive", fontSize: 18,
                  cursor: canSubmit ? 'pointer' : 'not-allowed',
                  background: canSubmit
                    ? (isBuy ? 'linear-gradient(180deg,#48D870,#28B050)' : 'linear-gradient(180deg,#FF7070,#E03040)')
                    : '#E8E4E0',
                  color: canSubmit ? 'white' : '#A09080',
                  border: canSubmit ? (isBuy ? '2px solid #20A040' : '2px solid #C02030') : '2px solid #D8D0C8',
                  boxShadow: canSubmit ? (isBuy ? '0 4px 0 #189030' : '0 4px 0 #A01020') : '0 2px 0 #C0B8B0',
                  transition: 'all 0.2s',
                }}>
                {submitting ? 'Memproses…' : isBuy ? '⬆ Pasang Order Beli' : '⬇ Pasang Order Jual'}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}

// ── Debrief ───────────────────────────────────────────────────────────────

function lessonHint(changePct) {
  if (changePct > 3)  return { zone: 'Zone 5', topic: 'Momentum & Breakout',       desc: 'Harga naik kuat hari ini — sinyal momentum bullish. Volume yang tinggi mengonfirmasi kekuatan gerakan ini.' }
  if (changePct < -3) return { zone: 'Zone 3', topic: 'Manajemen Risiko & Stop Loss', desc: 'Harga turun signifikan. Investor yang memasang stop loss terlindungi dari kerugian yang lebih dalam.' }
  if (Math.abs(changePct) <= 1) return { zone: 'Zone 4', topic: 'Support & Resistance', desc: 'Harga bergerak sideways — ciri khas fase konsolidasi di antara level support dan resistance.' }
  if (changePct > 0)  return { zone: 'Zone 4', topic: 'Analisis Tren Naik',        desc: 'Kenaikan moderat. Perhatikan apakah harga menutup di atas moving average — tanda tren naik yang sehat.' }
  return               { zone: 'Zone 4', topic: 'Analisis Tren Turun',             desc: 'Penurunan moderat. Harga menutup di bawah support bisa menjadi sinyal pelemahan tren.' }
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

  // Mini sparkline
  const closes = allBars.map(b => b.close)
  const minC = Math.min(...closes), maxC = Math.max(...closes)
  const rangeC = maxC - minC || 1
  const W = 280, H = 48
  const pts = closes.map((p, i) => {
    const x = closes.length < 2 ? W / 2 : (i / (closes.length - 1)) * W
    const y = H - ((p - minC) / rangeC) * H
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
  const lastX = closes.length > 1 ? ((closes.length - 1) / (closes.length - 1)) * W : W / 2
  const areaPath = `M0,${H - ((closes[0] - minC) / rangeC) * H} L${pts} L${lastX},${H} L0,${H} Z`
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

        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px', flexShrink: 0 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)' }} />
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 32px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Title */}
          <div>
            <p style={{ fontFamily: "'Fredoka One',cursive", fontSize: 20, color: 'var(--arena-accent)', margin: 0 }}>
              🏁 Sesi Selesai
            </p>
            <p style={{ fontSize: 11, color: 'var(--arena-text-muted)', marginTop: 2 }}>{code} · {dateLabel}</p>
          </div>

          {/* Sparkline */}
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

          {/* Price stats */}
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

          {/* Change summary */}
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

          {/* Lesson hint */}
          <div style={{ background: 'rgba(74,222,128,0.07)', borderLeft: '3px solid var(--arena-accent)', borderRadius: '0 12px 12px 0', padding: '12px 14px' }}>
            <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--arena-accent)', marginBottom: 4 }}>
              📚 Konsep yang berlaku hari ini · {hint.zone}
            </p>
            <p style={{ fontSize: 13, fontWeight: 800, color: 'white', marginBottom: 4 }}>{hint.topic}</p>
            <p style={{ fontSize: 11, color: '#A0C8B0', lineHeight: 1.6 }}>{hint.desc}</p>
          </div>

          {/* CTAs */}
          <button
            type="button"
            onClick={() => navigate(`/stocks/${code.toLowerCase()}`)}
            style={{
              width: '100%', padding: '13px 16px', borderRadius: 14, cursor: 'pointer',
              background: 'linear-gradient(135deg,#1A5A30,#0E3A1A)',
              border: '1.5px solid var(--arena-accent-border)',
              fontFamily: "'Fredoka One',cursive", fontSize: 15, color: 'var(--arena-accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}
          >
            <span>Baca analisis AI {code} di Feed</span>
            <span>→</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(`/lesson?level=${parseInt(hint.zone.replace(/\D/g, ''), 10) || 4}`)}
            style={{
              width: '100%', padding: '13px 16px', borderRadius: 14, cursor: 'pointer',
              background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.15)',
              fontFamily: "'Fredoka One',cursive", fontSize: 14, color: '#C8E8D8',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}
          >
            <span>📚 Pelajari: {hint.topic}</span>
            <span>→</span>
          </button>

          <button
            type="button"
            onClick={onRestart}
            style={{
              width: '100%', padding: '10px', borderRadius: 12, cursor: 'pointer',
              background: 'transparent', border: '1px solid var(--arena-border)',
              fontSize: 13, fontWeight: 700, color: '#5A8070',
            }}
          >
            Pilih tanggal lain
          </button>
        </div>
      </div>
    </>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────

export function ArenaStock() {
  const { code } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const passedStock   = location.state?.stock   ?? null
  const passedHolding = location.state?.holding ?? null
  const codeUpper     = code?.toUpperCase() ?? ''

  // ── Live bars (real-time, limited to current clock) ──────────────────
  const [bars, setBars]             = useState([])
  const [currentPrice, setCurrentPrice] = useState(passedStock?.price_close ?? null)
  const [prevPrice, setPrevPrice]   = useState(null)
  const [loadingBars, setLoadingBars] = useState(true)
  const [replayDate, setReplayDate] = useState('')
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

  // Fetch available simulation dates from DB
  useEffect(() => {
    fetchSimDates(codeUpper)
      .then(res => {
        const dates = res?.dates ?? []
        setSimDates(dates)
        if (dates.length > 0) setSimDate(dates[0]) // default to newest
      })
      .catch(() => {})
  }, [codeUpper]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Trade sheet state ────────────────────────────────────────────────
  const [tradeSheet, setTradeSheet] = useState({ open: false, orderType: 'buy' })

  // ── Simulation state ─────────────────────────────────────────────────
  const [simDates, setSimDates] = useState([])          // available dates from DB, newest first
  const [simDate, setSimDate]   = useState('')          // YYYY-MM-DD selected by user
  const [dateStatus, setDateStatus] = useState('ok')   // ok | weekend | fetching | error
  const [fetchPct, setFetchPct]     = useState(0)
  const [fetchStep, setFetchStep]   = useState('')
  const [simMode, setSimMode]   = useState('idle')   // idle | loading | playing | paused | done
  const [allBars, setAllBars]   = useState([])
  const [simIdx, setSimIdx]     = useState(0)
  const [speedIdx, setSpeedIdx] = useState(0)        // default 1×
  const [simStartTime, setSimStartTime] = useState('')
  const simTimerRef             = useRef(null)

  function clearSimTimer() {
    if (simTimerRef.current) {
      clearInterval(simTimerRef.current)
      simTimerRef.current = null
    }
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

    // Weekend check (JS Date day: 0=Sun, 6=Sat)
    const dow = new Date(dateStr + 'T12:00:00+07:00').getDay()
    if (dow === 0 || dow === 6) {
      setDateStatus('weekend')
      return
    }

    // Already in DB — use directly
    if (simDates.includes(dateStr)) {
      setDateStatus('ok')
      return
    }

    // Need to fetch from Yahoo Finance — animate progress
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
      await fetchOrImportBars(codeUpper, dateStr)
      clearInterval(timer)
      setFetchPct(100)
      setFetchStep('Selesai!')
      // Add date to chips list so it shows in future
      setSimDates(prev => [...new Set([dateStr, ...prev])].sort((a, b) => b.localeCompare(a)))
      setDateStatus('ok')
      setTimeout(() => { setFetchPct(0); setFetchStep('') }, 1500)
    } catch {
      clearInterval(timer)
      setFetchPct(0)
      setFetchStep('')
      setDateStatus('error')
    }
  }

  async function handleStart() {
    clearSimTimer()
    setSimMode('loading')
    setSimIdx(0)
    setSimStartTime('')
    try {
      const data = await fetchAllBars(codeUpper, simDate)
      const full = data?.bars ?? []
      if (full.length === 0) {
        setSimMode('idle')
        return
      }
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

  function handlePause() {
    clearSimTimer()
    setSimMode('paused')
  }

  function handleResume() {
    setSimMode('playing')
    startTicking(simIdx, allBars)
  }

  function handleStop() {
    clearSimTimer()
    setSimMode('idle')
    setSimIdx(0)
    setAllBars([])
    setSimStartTime('')
  }

  function handleSpeedChange(idx) {
    setSpeedIdx(idx)
    if (simMode === 'playing') {
      clearSimTimer()
      startTicking(simIdx, allBars)
    }
  }

  // Restart ticking with updated speed when speedIdx changes while playing
  useEffect(() => {
    if (simMode === 'playing' && allBars.length > 0) {
      clearSimTimer()
      startTicking(simIdx, allBars)
    }
    return clearSimTimer
  }, [speedIdx]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => clearSimTimer(), [])

  // ── Derived display values ────────────────────────────────────────────
  const inSim        = simMode !== 'idle'
  const displayBars  = inSim && allBars.length > 0 ? allBars.slice(0, simIdx + 1) : bars
  const displayPrice = inSim && allBars[simIdx] ? allBars[simIdx].close : currentPrice
  const priceFlash   = !inSim && prevPrice != null && prevPrice !== currentPrice

  const openPrice = displayBars.length > 0 ? displayBars[0].open  : null
  const dayHigh   = displayBars.length > 0 ? Math.max(...displayBars.map(b => b.high)) : null
  const dayLow    = displayBars.length > 0 ? Math.min(...displayBars.map(b => b.low))  : null
  const lastBar   = displayBars.length > 0 ? displayBars[displayBars.length - 1] : null

  const changePct = openPrice && displayPrice
    ? ((displayPrice - openPrice) / openPrice * 100)
    : (passedStock?.price_change_pct ?? null)
  const up = (changePct ?? 0) >= 0

  // Live P&L for holding card — updates with simulation price
  const holdingPnl    = passedHolding && displayPrice != null
    ? (displayPrice - passedHolding.avg_price_per_share) * passedHolding.lots * 100
    : passedHolding?.pnl ?? 0
  const holdingPnlPct = passedHolding?.avg_price_per_share > 0 && displayPrice != null
    ? (displayPrice - passedHolding.avg_price_per_share) / passedHolding.avg_price_per_share * 100
    : passedHolding?.pnl_pct ?? 0

  const replayLabel = replayDate
    ? new Date(replayDate + 'T00:00:00+07:00').toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    : null

  // ── Skeleton loading state ────────────────────────────────────────────
  if (loadingBars && bars.length === 0) {
    return (
      <div className="flex min-h-svh flex-col bg-white">
        <div style={{ background: 'linear-gradient(135deg,var(--arena-bg-deep),var(--arena-bg-mid))', padding: '14px 16px 20px' }}>
          <button type="button" onClick={() => navigate('/arena')}
            style={{ fontSize: 12, color: 'var(--arena-accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, padding: 0, marginBottom: 16 }}>
            ← Arena
          </button>
          {/* Title skeleton */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="skeleton-dark" style={{ width: 80, height: 28 }} />
              <div className="skeleton-dark" style={{ width: 140, height: 14 }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
              <div className="skeleton-dark" style={{ width: 100, height: 28 }} />
              <div className="skeleton-dark" style={{ width: 60, height: 14 }} />
            </div>
          </div>
          {/* Chart skeleton */}
          <div className="skeleton-dark" style={{ height: 120, borderRadius: 10, margin: '0 -16px' }} />
          {/* OHLC skeleton */}
          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 12, gap: 8 }}>
            {[1,2,3,4].map(i => <div key={i} className="skeleton-dark" style={{ height: 36, flex: 1, borderRadius: 8 }} />)}
          </div>
          {/* Controls skeleton */}
          <div className="skeleton-dark" style={{ height: 44, borderRadius: 12, marginTop: 14 }} />
        </div>
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="skeleton" style={{ height: 72, borderRadius: 14 }} />
          <div className="skeleton" style={{ height: 56, borderRadius: 12 }} />
          <div className="skeleton" style={{ height: 80, borderRadius: 12 }} />
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col bg-white">

      {/* ── Dark chart header ──────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(135deg,var(--arena-bg-deep),var(--arena-bg-mid))', padding: '14px 16px 0', color: 'white' }}>

        {/* Nav row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <button type="button" onClick={() => navigate('/arena')}
            style={{ fontSize: 12, color: 'var(--arena-accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, padding: 0 }}>
            ← Arena
          </button>
          {replayLabel && !inSim && (
            <span style={{ fontSize: 10, color: 'var(--arena-accent)', background: 'var(--arena-accent-dim)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 6, padding: '2px 8px', fontWeight: 700 }}>
              ⏱ REPLAY {replayLabel}
            </span>
          )}
          {inSim && (() => {
            const dl = simDate
              ? new Date(simDate + 'T00:00:00+07:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
              : ''
            return (
              <span style={{ fontSize: 10, color: '#FFD060', background: 'rgba(255,208,96,0.15)', border: '1px solid rgba(255,208,96,0.35)', borderRadius: 6, padding: '2px 8px', fontWeight: 800 }}>
                {simMode === 'loading' ? '⌛ Memuat…'
                  : simMode === 'done'    ? `✅ Selesai · ${dl}`
                  : `▶ SIMULASI · ${dl}`}
              </span>
            )
          })()}
          {loadingBars && !inSim && (
            <span style={{ fontSize: 10, color: 'var(--arena-text-muted)' }}>memuat…</span>
          )}
        </div>

        {/* Title + price */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <p style={{ fontSize: 26, fontWeight: 900, fontFamily: "'Fredoka One',cursive", color: 'white', lineHeight: 1, marginBottom: 2 }}>
              {codeUpper}
            </p>
            <p style={{ fontSize: 12, color: 'var(--arena-text-muted)' }}>{passedStock?.name ?? ''}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{
              fontSize: 24, fontWeight: 900, fontFamily: "'Fredoka One',cursive", lineHeight: 1,
              color: priceFlash ? (up ? 'var(--arena-accent)' : 'var(--arena-sell)') : 'white',
              transition: 'color 0.4s',
            }}>
              {displayPrice ? `Rp ${Number(displayPrice).toLocaleString('id-ID')}` : '—'}
            </p>
            {changePct != null && (
              <p style={{ fontSize: 13, fontWeight: 800, color: up ? 'var(--arena-accent)' : 'var(--arena-sell)', marginTop: 3 }}>
                {changePct >= 0 ? '+' : ''}{changePct.toFixed(2)}%
              </p>
            )}
          </div>
        </div>

        {/* Chart */}
        <div style={{ borderRadius: '10px 10px 0 0', overflow: 'hidden', background: 'rgba(0,0,0,0.25)', margin: '0 -16px' }}>
          <IntradayChart bars={bars} allBars={allBars} simIdx={simIdx} simMode={simMode} />
        </div>

        {/* Time axis */}
        {displayBars.length > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 16px 8px' }}>
            <span style={{ fontSize: 11, color: 'var(--arena-text-dim)' }}>{displayBars[0].bar_time?.slice(11, 16)} WIB</span>
            <span style={{ fontSize: 11, color: 'var(--arena-accent)', fontWeight: 700 }}>
              {displayBars[displayBars.length - 1].bar_time?.slice(11, 16)} WIB · {displayBars.length} bar
            </span>
          </div>
        )}

        {/* OHLC row */}
        {lastBar && (
          <div style={{
            display: 'flex', justifyContent: 'space-around',
            background: 'rgba(0,0,0,0.2)',
            margin: '0 -16px', padding: '10px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
          }}>
            <OHLCStat label="Open"   value={openPrice} />
            <OHLCStat label="High"   value={dayHigh}   color="var(--arena-accent)" />
            <OHLCStat label="Low"    value={dayLow}    color="var(--arena-sell)" />
            <OHLCStat label="Volume" value={lastBar.volume} color="#A0D0C0" />
          </div>
        )}

        {/* Simulation controls (inside dark header so they feel like a playback panel) */}
        <div style={{ padding: '12px 0 16px' }}>
          <SimControls
            simMode={simMode}
            simIdx={simIdx}
            allBars={allBars}
            speedIdx={speedIdx}
            simStartTime={simStartTime}
            simDate={simDate}
            simDates={simDates}
            dateStatus={dateStatus}
            fetchPct={fetchPct}
            fetchStep={fetchStep}
            onSimDateChange={handleDatePick}
            onStart={handleStart}
            onPause={handlePause}
            onResume={handleResume}
            onStop={handleStop}
            onSpeedChange={handleSpeedChange}
          />
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: 120 }}>

        {/* Holding card */}
        {passedHolding ? (
          <div style={{ background: '#E8FFF0', border: '1.5px solid #B0EFC0', borderRadius: 14, padding: '12px 16px', marginBottom: 14 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#1A7040', marginBottom: 6 }}>📦 Kamu punya saham ini</p>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 900, color: '#1A2030' }}>{passedHolding.lots} lot · {(passedHolding.lots * 100).toLocaleString('id-ID')} lembar</p>
                <p style={{ fontSize: 11, color: 'var(--arena-text-dim)' }}>avg Rp {passedHolding.avg_price_per_share.toLocaleString('id-ID')}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 14, fontWeight: 900, color: holdingPnl >= 0 ? '#20A040' : '#E03040' }}>
                  {holdingPnl >= 0 ? '+' : ''}Rp {Math.abs(holdingPnl).toLocaleString('id-ID')}
                </p>
                <p style={{ fontSize: 11, fontWeight: 700, color: holdingPnlPct >= 0 ? '#20A040' : '#E03040' }}>
                  {holdingPnlPct >= 0 ? '+' : ''}{holdingPnlPct.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ background: '#F8F6F2', border: '1px solid #EDE8E0', borderRadius: 14, padding: '12px 16px', marginBottom: 14 }}>
            <p style={{ fontSize: 12, color: '#A09080' }}>📭 Kamu belum punya saham {codeUpper}</p>
          </div>
        )}

        {/* Key metrics */}
        {passedStock && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 14 }}>
            {[
              { label: 'P/E Ratio', value: passedStock.pe_ratio        },
              { label: 'Volume',    value: passedStock.volume_label     },
              { label: 'Mkt Cap',   value: passedStock.market_cap_label },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: '#F8F6F2', borderRadius: 12, padding: '10px 8px', textAlign: 'center', border: '1px solid #EDE8E0' }}>
                <p style={{ fontSize: 11, color: '#A09080', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{label}</p>
                <p style={{ fontSize: 13, fontWeight: 900, color: '#1A2030', fontFamily: "'Fredoka One',cursive" }}>{value || '—'}</p>
              </div>
            ))}
          </div>
        )}

        {/* OJK disclaimer */}
        <div style={{ marginBottom: 10 }}>
          <OjkDisclaimer />
        </div>

        {/* Limit order explainer */}
        <div style={{ background: '#F5FDF8', borderLeft: '3px solid #28A060', borderRadius: '0 12px 12px 0', padding: '10px 14px' }}>
          <p style={{ fontSize: 12, fontWeight: 800, color: '#1A6040', marginBottom: 4 }}>💡 Cara kerja limit order</p>
          <p style={{ fontSize: 11, color: '#2A4A3A', lineHeight: 1.65 }}>
            <b>Beli:</b> order terisi jika harga turun ke limit-mu.<br />
            <b>Jual:</b> order terisi jika harga naik ke limit-mu.<br />
            Order yang belum terisi hangus di akhir hari.
          </p>
        </div>
      </div>

      {/* ── Sticky Buy / Sell footer ───────────────────────────────── */}
      <div style={{
        position: 'fixed', bottom: 64, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 448, padding: '10px 16px',
        background: 'white', borderTop: '1px solid #EDE8E0',
        display: 'flex', gap: 10,
      }}>
        <button type="button"
          onClick={() => setTradeSheet({ open: true, orderType: 'buy' })}
          style={{
            flex: 1, padding: '13px', borderRadius: 14,
            fontFamily: "'Fredoka One',cursive", fontSize: 17, cursor: 'pointer',
            background: 'linear-gradient(180deg,#48D870,#28B050)',
            color: 'white', border: '2px solid #20A040', boxShadow: '0 4px 0 #189030',
          }}>
          ⬆ Beli
        </button>
        <button type="button"
          onClick={() => setTradeSheet({ open: true, orderType: 'sell' })}
          disabled={!passedHolding}
          style={{
            flex: 1, padding: '13px', borderRadius: 14,
            fontFamily: "'Fredoka One',cursive", fontSize: 17,
            cursor: passedHolding ? 'pointer' : 'not-allowed',
            background: passedHolding ? 'linear-gradient(180deg,#FF7070,#E03040)' : '#E8E4E0',
            color: passedHolding ? 'white' : '#A09080',
            border: passedHolding ? '2px solid #C02030' : '2px solid #D8D0C8',
            boxShadow: passedHolding ? '0 4px 0 #A01020' : '0 2px 0 #C0B8B0',
          }}>
          {passedHolding ? '⬇ Jual' : 'Belum punya'}
        </button>
      </div>

      <DebriefSheet
        open={simMode === 'done'}
        onClose={handleStop}
        onRestart={handleStop}
        code={codeUpper}
        allBars={allBars}
        simDate={simDate}
        navigate={navigate}
      />

      <TradeSheet
        open={tradeSheet.open}
        orderType={tradeSheet.orderType}
        onClose={() => setTradeSheet(s => ({ ...s, open: false }))}
        code={codeUpper}
        stock={passedStock}
        holding={passedHolding}
        currentPrice={displayPrice}
      />

      <BottomNav />
    </div>
  )
}
