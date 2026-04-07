import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { placeArenaOrder } from '../api/arena'
import { BottomNav } from '../components/BottomNav'
import { OjkDisclaimer } from '../components/OjkDisclaimer'

export function ArenaTrade() {
  const { code }   = useParams()
  const location   = useLocation()
  const navigate   = useNavigate()

  const passedStock   = location.state?.stock     ?? null
  const passedHolding = location.state?.holding   ?? null
  const initialType   = location.state?.orderType ?? 'buy'

  const codeUpper = code?.toUpperCase() ?? ''

  const [orderType, setOrderType] = useState(initialType)
  const [lots, setLots]           = useState(1)
  const [limitPrice, setLimitPrice] = useState(
    passedStock?.price_close ? String(Math.round(passedStock.price_close)) : ''
  )

  const [submitting, setSubmitting] = useState(false)
  const [result, setResult]         = useState(null)
  const [error, setError]           = useState(null)

  // Keep limit price in sync when switching orderType (reset to current price)
  useEffect(() => {
    if (passedStock?.price_close && !result) {
      setLimitPrice(String(Math.round(passedStock.price_close)))
    }
  }, [orderType]) // eslint-disable-line react-hooks/exhaustive-deps

  const parsedLimitPrice = parseInt(limitPrice, 10) || 0
  const totalValue       = lots * 100 * parsedLimitPrice

  const currentPrice = passedStock?.price_close ?? null

  // Fill hint
  let fillHint = null
  if (currentPrice && parsedLimitPrice > 0) {
    if (orderType === 'buy') {
      fillHint = parsedLimitPrice >= currentPrice
        ? { ok: true,  text: 'Akan langsung terisi — limit ≥ harga saat ini' }
        : { ok: false, text: `Pending — menunggu harga turun ke Rp ${parsedLimitPrice.toLocaleString('id-ID')}` }
    } else {
      fillHint = parsedLimitPrice <= currentPrice
        ? { ok: true,  text: 'Akan langsung terisi — limit ≤ harga saat ini' }
        : { ok: false, text: `Pending — menunggu harga naik ke Rp ${parsedLimitPrice.toLocaleString('id-ID')}` }
    }
  }

  async function handleSubmit() {
    if (submitting || result || lots <= 0 || parsedLimitPrice <= 0) return
    setSubmitting(true)
    setError(null)
    try {
      const order = await placeArenaOrder({
        stock_code:  codeUpper,
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

  // ── Success ───────────────────────────────────────────────────────

  if (result) {
    const filled = result.status === 'filled'
    return (
      <div className="flex min-h-svh flex-col bg-white">
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #F0EDE8' }}>
          <button type="button" onClick={() => navigate('/arena')} style={{ fontSize: 13, color: '#28A060', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, padding: 0 }}>
            ← Kembali ke Arena
          </button>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', gap: 14 }}>
          <div style={{
            width: '100%', borderRadius: 20, padding: '28px 20px', textAlign: 'center',
            background: filled ? '#E8FFF0' : '#FFFBF0',
            border: `2px solid ${filled ? '#40C860' : '#FFD060'}`,
          }}>
            <span style={{ fontSize: 44 }}>{filled ? '✅' : '⏳'}</span>
            <p style={{ fontFamily: "'Fredoka One',cursive", fontSize: 22, color: filled ? '#20A040' : '#CC8800', margin: '10px 0 6px' }}>
              {filled ? 'Order Terisi!' : 'Order Diterima'}
            </p>
            <p style={{ fontSize: 13, color: '#4A4040', lineHeight: 1.7 }}>
              {result.order_type === 'buy' ? 'Beli' : 'Jual'}{' '}
              <strong>{result.lots} lot</strong> {result.stock_code}{' '}
              @ Rp {(result.filled_price ?? result.limit_price).toLocaleString('id-ID')}
            </p>
            {!filled && (
              <p style={{ fontSize: 12, color: '#8A7060', marginTop: 8, lineHeight: 1.5 }}>
                Order kamu akan dicek setiap menit.<br />
                Akan terisi otomatis jika harga memenuhi limit.
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, width: '100%' }}>
            <button type="button" onClick={() => navigate(`/arena/stock/${codeUpper}`, { state: { stock: passedStock } })}
              style={{ flex: 1, padding: '13px', borderRadius: 13, border: '2px solid #EDE8E0', background: 'white', fontSize: 14, fontWeight: 700, color: '#4A4040', cursor: 'pointer' }}>
              ← Chart
            </button>
            <button type="button" onClick={() => navigate('/arena')}
              style={{
                flex: 2, padding: '13px', borderRadius: 13,
                fontFamily: "'Fredoka One',cursive", fontSize: 16, cursor: 'pointer',
                background: 'linear-gradient(180deg,#48D870,#28B050)',
                color: 'white', border: '2px solid #20A040', boxShadow: '0 4px 0 #189030',
              }}>
              Lihat Portfolio
            </button>
          </div>
        </div>
        <BottomNav />
      </div>
    )
  }

  const canSubmit = lots > 0 && parsedLimitPrice > 0 && !submitting
  const isBuy = orderType === 'buy'

  return (
    <div className="flex min-h-svh flex-col bg-white">

      {/* ── OJK Disclaimer banner ── */}
      <div style={{ padding: '8px 16px', borderBottom: '1px solid #FDE68A' }}>
        <OjkDisclaimer />
      </div>

      {/* ── Compact header ───────────────────────────────────────── */}
      <div style={{ padding: '12px 16px 12px', borderBottom: '1px solid #F0EDE8', background: 'white', position: 'sticky', top: 0, zIndex: 20 }}>
        <button type="button" onClick={() => navigate(-1)}
          style={{ fontSize: 12, color: '#28A060', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, padding: 0, marginBottom: 8 }}>
          ← Kembali ke Chart
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 20, fontWeight: 900, color: '#1A2030', fontFamily: "'Fredoka One',cursive", lineHeight: 1 }}>{codeUpper}</p>
            {passedStock?.name && <p style={{ fontSize: 11, color: '#8A8080', marginTop: 2 }}>{passedStock.name}</p>}
          </div>
          {currentPrice && (
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 18, fontWeight: 900, color: '#1A2030', fontFamily: "'Fredoka One',cursive" }}>
                Rp {Number(currentPrice).toLocaleString('id-ID')}
              </p>
              {passedStock?.price_change_pct != null && (
                <p style={{ fontSize: 11, fontWeight: 700, color: passedStock.price_change_pct >= 0 ? '#20A040' : '#E03040' }}>
                  {passedStock.price_change_pct >= 0 ? '+' : ''}{Number(passedStock.price_change_pct).toFixed(2)}%
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Form ─────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: 90, display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Buy / Sell toggle */}
        <div style={{ display: 'flex', background: '#F0EDE8', borderRadius: 12, padding: 4, gap: 4 }}>
          {['buy', 'sell'].map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setOrderType(type)}
              style={{
                flex: 1, padding: '11px', borderRadius: 10, border: 'none', cursor: 'pointer',
                fontFamily: "'Fredoka One',cursive", fontSize: 16,
                background: orderType === type
                  ? (type === 'buy' ? 'linear-gradient(180deg,#48D870,#28B050)' : 'linear-gradient(180deg,#FF7070,#E03040)')
                  : 'transparent',
                color: orderType === type ? 'white' : '#8A8080',
                boxShadow: orderType === type ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {type === 'buy' ? '⬆ Beli' : '⬇ Jual'}
            </button>
          ))}
        </div>

        {/* Sell warning if no holding */}
        {orderType === 'sell' && !passedHolding && (
          <div style={{ background: '#FFF8E8', border: '1.5px solid #FFD060', borderRadius: 12, padding: '10px 14px' }}>
            <p style={{ fontSize: 12, color: '#8A6000', fontWeight: 700 }}>
              ⚠ Kamu belum punya saham {codeUpper}. Order jual memerlukan saham yang dimiliki.
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
              { label: 'Saham',    value: `${codeUpper} · ${lots} lot · ${(lots * 100).toLocaleString('id-ID')} lembar` },
              { label: 'Limit',   value: `Rp ${parsedLimitPrice.toLocaleString('id-ID')} / lembar` },
              { label: isBuy ? 'Total (maks)' : 'Est. Hasil', value: `Rp ${totalValue.toLocaleString('id-ID')}` },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #F0EDE8' }}>
                <span style={{ fontSize: 12, color: '#8A8080' }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#1A2030' }}>{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* OJK disclaimer below submit */}
        <OjkDisclaimer compact />

        {error && (
          <div style={{ background: '#FFF0F0', border: '1.5px solid #FFB0B0', borderRadius: 12, padding: '10px 14px' }}>
            <p style={{ fontSize: 13, color: '#E03040', fontWeight: 700 }}>{error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="button" onClick={handleSubmit} disabled={!canSubmit}
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
          }}
        >
          {submitting ? 'Memproses…' : isBuy ? '⬆ Pasang Order Beli' : '⬇ Pasang Order Jual'}
        </button>
      </div>

      <BottomNav />
    </div>
  )
}
