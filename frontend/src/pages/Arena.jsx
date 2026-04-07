import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchArenaToday, cancelArenaOrder } from '../api/arena'
import { fetchStockFeed } from '../api/stocks'
import { BottomNav } from '../components/BottomNav'

// ── Shared small components ───────────────────────────────────────────────

function ReturnBadge({ pct }) {
  const up = pct >= 0
  return (
    <span style={{
      fontSize: 12, fontWeight: 800, padding: '3px 9px', borderRadius: 7,
      background: up ? 'rgba(74,222,128,0.18)' : 'rgba(248,113,113,0.18)',
      color: up ? 'var(--arena-accent)' : '#F87171',
      border: `1px solid ${up ? 'rgba(74,222,128,0.35)' : 'rgba(248,113,113,0.35)'}`,
    }}>
      {up ? '+' : ''}{Number(pct).toFixed(2)}%
    </span>
  )
}

function ChangeBadge({ pct }) {
  const up = pct >= 0
  return (
    <span style={{
      fontSize: 11, fontWeight: 800, padding: '2px 7px', borderRadius: 6,
      background: up ? '#E8FFF0' : '#FFF0F0',
      color: up ? '#20A040' : '#E03040',
      border: `1px solid ${up ? '#B0EFC0' : '#FFB0B0'}`,
    }}>
      {up ? '+' : ''}{Number(pct).toFixed(1)}%
    </span>
  )
}

function StatusPill({ status }) {
  const cfg = {
    pending:   { bg: '#FFF8E8', color: '#CC8800', border: '#FFD060', label: 'Pending'  },
    filled:    { bg: '#E8FFF0', color: '#20A040', border: '#60E080', label: 'Terisi'   },
    cancelled: { bg: '#F5F5F5', color: '#909090', border: '#D0D0D0', label: 'Batal'    },
    expired:   { bg: '#FFF0F0', color: '#E03040', border: '#FFB0B0', label: 'Expired'  },
  }
  const c = cfg[status] || cfg.pending
  return (
    <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 6, background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
      {c.label}
    </span>
  )
}

function SectionLabel({ children }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 900, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#A09080', marginBottom: 8 }}>
      {children}
    </p>
  )
}

// ── Daily Mission ─────────────────────────────────────────────────────────

const DAILY_MISSIONS = [
  { icon: '⏱', title: 'Replay Weekend',    desc: 'Buka mode simulasi dan tonton 1 hari penuh pergerakan harga BBCA.',            cta: 'Mulai Simulasi', stock: 'BBCA', tab: null,    check: ()  => false },
  { icon: '🏦', title: 'Beli Saham Bank',   desc: 'Pasang 1 order beli BBCA atau BBRI hari ini dan perhatikan gerakannya.',       cta: 'Beli BBCA',      stock: 'BBCA', tab: null,    check: d  => d.orders.some(o => o.order_type === 'buy' && ['BBCA','BBRI'].includes(o.stock_code)) },
  { icon: '📊', title: 'Pantau Volume',     desc: 'Buka chart TLKM dan pasang 1 order berdasarkan pergerakan volume hari ini.',   cta: 'Buka TLKM',      stock: 'TLKM', tab: null,    check: d  => d.orders.some(o => o.stock_code === 'TLKM') },
  { icon: '💻', title: 'Saham Teknologi',   desc: 'Baca analisis GOTO di Feed, lalu pasang order berdasarkan pandanganmu.',       cta: 'Buka GOTO',      stock: 'GOTO', tab: null,    check: d  => d.orders.some(o => o.stock_code === 'GOTO') },
  { icon: '🎯', title: 'Diversifikasi',     desc: 'Miliki saham dari minimal 2 kode berbeda secara bersamaan di portofolio.',     cta: 'Lihat Pasar',    stock: null,   tab: 'pasar', check: d  => d.holdings.length >= 2 },
  { icon: '🚀', title: 'Breakout Hunter',   desc: 'Temukan saham yang naik hari ini, pasang order beli sebelum pasar tutup.',     cta: 'Lihat Pasar',    stock: null,   tab: 'pasar', check: d  => d.orders.some(o => o.order_type === 'buy') },
  { icon: '📅', title: 'Simulasi Weekend',  desc: 'Pilih tanggal historis dan selesaikan 1 sesi penuh simulasi trading BBRI.',    cta: 'Mulai Simulasi', stock: 'BBRI', tab: null,    check: ()  => false },
]

function DailyMission({ data, navigate, onSwitchTab }) {
  const wibNow  = new Date(Date.now() + 7 * 3_600_000)
  const dateKey = wibNow.toISOString().slice(0, 10)
  const lsKey   = `arena_mission_${dateKey}`
  const mission = DAILY_MISSIONS[wibNow.getUTCDay()]

  const [manualDone, setManualDone] = useState(() => {
    try { return localStorage.getItem(lsKey) === '1' } catch { return false }
  })

  const autoDone = mission.check(data)
  const isDone   = manualDone || autoDone

  // Auto-persist when auto-detected
  useEffect(() => {
    if (autoDone) { try { localStorage.setItem(lsKey, '1') } catch {} }
  }, [autoDone, lsKey])

  function handleCta() {
    if (mission.stock) {
      navigate(`/arena/stock/${mission.stock}`)
    } else if (mission.tab) {
      onSwitchTab(mission.tab)
    }
  }

  function handleManualDone() {
    try { localStorage.setItem(lsKey, '1') } catch {}
    setManualDone(true)
  }

  return (
    <div style={{
      borderRadius: 14, marginBottom: 16, overflow: 'hidden',
      border: isDone ? '1.5px solid rgba(74,222,128,0.4)' : '1.5px solid rgba(255,208,96,0.4)',
      background: isDone ? 'rgba(74,222,128,0.06)' : 'rgba(255,208,96,0.06)',
    }}>
      {/* Header */}
      <div style={{
        padding: '10px 14px 8px',
        borderBottom: `1px solid ${isDone ? 'rgba(74,222,128,0.15)' : 'rgba(255,208,96,0.15)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: '1.5px', textTransform: 'uppercase', color: isDone ? 'var(--arena-accent)' : '#CC8800', margin: 0 }}>
          ⚡ Misi Hari Ini
        </p>
        {isDone && (
          <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--arena-accent)' }}>✅ Selesai</span>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '10px 14px 12px' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
          <span style={{ fontSize: 24, lineHeight: 1, flexShrink: 0 }}>{mission.icon}</span>
          <div>
            <p style={{ fontSize: 14, fontWeight: 900, color: '#1A2030', margin: 0, marginBottom: 3 }}>{mission.title}</p>
            <p style={{ fontSize: 12, color: '#5A6A5A', lineHeight: 1.6, margin: 0 }}>{mission.desc}</p>
          </div>
        </div>

        {!isDone ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={handleCta}
              style={{
                flex: 1, padding: '10px', borderRadius: 10, cursor: 'pointer',
                background: 'linear-gradient(180deg,#48D870,#28B050)',
                color: 'white', border: '2px solid #20A040', boxShadow: '0 3px 0 #189030',
                fontFamily: "'Fredoka One',cursive", fontSize: 13,
              }}
            >
              {mission.cta} →
            </button>
            {/* Manual done for simulation-type missions (auto-check always returns false) */}
            {!autoDone && mission.stock && (
              <button
                type="button"
                onClick={handleManualDone}
                style={{
                  padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                  background: 'white', border: '1.5px solid #D0C8C0',
                  fontSize: 12, fontWeight: 700, color: '#8A8080',
                }}
              >
                Tandai ✓
              </button>
            )}
          </div>
        ) : (
          <p style={{ fontSize: 11, color: '#4A8060', fontWeight: 700 }}>
            Kamu sudah menyelesaikan misi hari ini! Kembali besok untuk tantangan baru.
          </p>
        )}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────

const TABS = [
  { key: 'portofolio', label: 'Portofolio' },
  { key: 'pasar',      label: 'Pasar'      },
  { key: 'riwayat',   label: 'Riwayat'    },
]

export function Arena() {
  const navigate = useNavigate()

  const [data, setData]       = useState(null)
  const [stocks, setStocks]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [cancelling, setCancelling] = useState(null)
  const [showAllOrders, setShowAllOrders] = useState(false)
  const [activeTab, setActiveTab] = useState('portofolio')

  function load() {
    setLoading(true)
    Promise.all([fetchArenaToday(), fetchStockFeed()])
      .then(([arena, feed]) => {
        setData(arena)
        setStocks(feed ?? [])
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function handleCancel(orderId) {
    if (cancelling) return
    setCancelling(orderId)
    try {
      await cancelArenaOrder(orderId)
      load()
    } catch (err) {
      alert(err.message)
    } finally {
      setCancelling(null)
    }
  }

  // ── Loading skeleton ────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex min-h-svh flex-col bg-white">
        <div style={{ background: 'linear-gradient(135deg,var(--arena-bg-deep),var(--arena-bg-mid))', height: 180 }} />
        <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ height: 60, borderRadius: 12, background: '#F5F3F0', opacity: 0.6 }} />
          ))}
        </div>
        <BottomNav />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center bg-white gap-4 px-6">
        <p style={{ fontSize: 14, color: '#E03040', textAlign: 'center' }}>{error || 'Gagal memuat.'}</p>
        <button type="button" onClick={load} style={{ fontSize: 13, color: '#28A060', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Coba lagi</button>
        <BottomNav />
      </div>
    )
  }

  const dateDisplay = new Date(data.season.date + 'T00:00:00+07:00').toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  const pendingOrders = data.orders.filter(o => o.status === 'pending')
  const visibleOrders = showAllOrders ? data.orders : data.orders.slice(0, 5)
  const holdingMap    = Object.fromEntries(data.holdings.map(h => [h.stock_code, h]))

  return (
    <div className="flex min-h-svh flex-col bg-white">

      {/* ── Dark hero ───────────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(135deg,var(--arena-bg-deep),var(--arena-bg-mid))', padding: '16px 16px 20px' }}>
        <p style={{ fontSize: 10, color: 'var(--arena-accent)', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700, marginBottom: 2 }}>
          ⚡ Arena Saham · Simulasi Trading
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          <p style={{ fontSize: 11, color: 'var(--arena-text-muted)' }}>{dateDisplay}</p>
          {(() => {
            const s = getMarketStatus()
            return (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                fontSize: 11, fontWeight: 700,
                background: s.open ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.12)',
                color: s.open ? 'var(--arena-accent)' : '#F87171',
                border: `1px solid ${s.open ? 'rgba(74,222,128,0.35)' : 'rgba(248,113,113,0.3)'}`,
                borderRadius: 20, padding: '3px 10px',
              }}>
                <span>{s.open ? '🟢' : '🔴'}</span>
                {s.open ? 'Pasar Buka' : 'Pasar Tutup'} · {s.text}
              </span>
            )
          })()}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
          <div>
            <p style={{ fontSize: 11, color: '#80B090', marginBottom: 2 }}>Nilai Portfolio</p>
            <p style={{ fontSize: 28, fontWeight: 900, fontFamily: "'Fredoka One',cursive", color: 'white', lineHeight: 1 }}>
              Rp {data.total_value.toLocaleString('id-ID')}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <ReturnBadge pct={data.return_pct} />
            {data.total_traders > 0 && (
              <p style={{ fontSize: 11, color: 'var(--arena-text-muted)', marginTop: 4 }}>
                #{data.rank} dari {data.total_traders} trader
              </p>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { label: 'Kas',   value: `Rp ${data.cash.toLocaleString('id-ID')}`           },
            { label: 'Saham', value: `Rp ${data.holdings_value.toLocaleString('id-ID')}` },
          ].map(({ label, value }) => (
            <div key={label} style={{
              flex: 1, background: 'var(--arena-surface)', borderRadius: 10,
              padding: '8px 10px', border: '1px solid var(--arena-border)',
            }}>
              <p style={{ fontSize: 11, color: '#80B090', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
              <p style={{ fontSize: 13, fontWeight: 900, color: 'white', fontFamily: "'Fredoka One',cursive" }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tab bar ─────────────────────────────────────────────────── */}
      <div style={{ background: 'white', borderBottom: '1.5px solid #EDE8E0', display: 'flex', position: 'sticky', top: 0, zIndex: 10 }}>
        {TABS.map(tab => (
          <button key={tab.key} type="button"
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1, padding: '12px 0', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 800,
              color: activeTab === tab.key ? '#28A060' : '#8A8080',
              borderBottom: `2.5px solid ${activeTab === tab.key ? '#28A060' : 'transparent'}`,
              transition: 'color 0.15s',
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ─────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 90 }}>

        {/* ── Portofolio tab ────────────────────────────────────────── */}
        {activeTab === 'portofolio' && (
          <div style={{ padding: '16px 16px 0' }}>
            <DailyMission data={data} navigate={navigate} onSwitchTab={setActiveTab} />

            {data.holdings.length > 0 ? (
              <>
                <SectionLabel>Saham Dimiliki ({data.holdings.length})</SectionLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                  {data.holdings.map(h => (
                    <button
                      key={h.stock_code}
                      type="button"
                      onClick={() => navigate(`/arena/stock/${h.stock_code}`, { state: { holding: h } })}
                      style={{
                        background: 'white', border: '1.5px solid #EDE8E0', borderRadius: 14,
                        padding: '12px 14px', cursor: 'pointer', textAlign: 'left',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        boxShadow: '0 2px 0 #E8E0D8',
                      }}
                    >
                      <div>
                        <p style={{ fontSize: 15, fontWeight: 900, color: '#1A2030', fontFamily: "'Fredoka One',cursive", marginBottom: 2 }}>{h.stock_code}</p>
                        <p style={{ fontSize: 11, color: '#8A8080' }}>{h.lots} lot · avg Rp {h.avg_price_per_share.toLocaleString('id-ID')}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 14, fontWeight: 900, color: '#1A2030' }}>Rp {h.current_value.toLocaleString('id-ID')}</p>
                        <p style={{ fontSize: 12, fontWeight: 800, color: h.pnl >= 0 ? '#20A040' : '#E03040', marginTop: 2 }}>
                          {h.pnl >= 0 ? '+' : ''}Rp {Math.abs(h.pnl).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ paddingTop: 36, textAlign: 'center' }}>
                <p style={{ fontSize: 36, marginBottom: 10 }}>📭</p>
                <p style={{ fontSize: 15, fontWeight: 800, color: '#1A2030', marginBottom: 6 }}>Belum ada saham</p>
                <p style={{ fontSize: 12, color: '#A09080', marginBottom: 24, lineHeight: 1.6 }}>
                  Mulai beli saham pertamamu<br />dari tab Pasar.
                </p>
                <button type="button" onClick={() => setActiveTab('pasar')}
                  style={{
                    padding: '12px 28px', borderRadius: 12, cursor: 'pointer',
                    background: 'linear-gradient(180deg,#48D870,#28B050)', color: 'white',
                    border: '2px solid #20A040', boxShadow: '0 3px 0 #189030',
                    fontFamily: "'Fredoka One',cursive", fontSize: 15,
                  }}>
                  Lihat Pasar →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Pasar tab ─────────────────────────────────────────────── */}
        {activeTab === 'pasar' && (
          <div style={{ padding: '16px 16px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <SectionLabel>Pasar Hari Ini</SectionLabel>
              <span style={{ fontSize: 10, color: '#A09080' }}>Tap untuk chart & order</span>
            </div>

            {stocks.length === 0 ? (
              <div style={{ background: '#F8F6F2', borderRadius: 12, padding: 14, border: '1px solid #EDE8E0', textAlign: 'center', marginBottom: 16 }}>
                <p style={{ fontSize: 12, color: '#A09080' }}>Data pasar belum tersedia.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                {stocks.map(stock => {
                  const holding = holdingMap[stock.code]
                  return (
                    <button
                      key={stock.code}
                      type="button"
                      onClick={() => navigate(`/arena/stock/${stock.code}`, { state: { stock, holding: holding ?? null } })}
                      style={{
                        background: 'white', border: '1.5px solid #EDE8E0', borderRadius: 14,
                        padding: '11px 14px', cursor: 'pointer', textAlign: 'left',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        boxShadow: '0 2px 0 #E8E0D8',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 3, height: 36, borderRadius: 3, background: sectorColor(stock.sector), flexShrink: 0 }} />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <p style={{ fontSize: 14, fontWeight: 900, color: '#1A2030', fontFamily: "'Fredoka One',cursive", margin: 0 }}>
                              {stock.code}
                            </p>
                            {holding && (
                              <span style={{ fontSize: 11, fontWeight: 800, color: '#28A060', background: '#E8FFF0', border: '1px solid #B0EFC0', borderRadius: 4, padding: '1px 5px' }}>
                                {holding.lots} lot
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: 10, color: '#A09080', margin: 0 }}>{stock.sector}</p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 14, fontWeight: 900, color: '#1A2030', fontFamily: "'Fredoka One',cursive", margin: 0 }}>
                          Rp {Number(stock.price_close).toLocaleString('id-ID')}
                        </p>
                        <div style={{ marginTop: 3 }}>
                          <ChangeBadge pct={stock.price_change_pct} />
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Riwayat tab ───────────────────────────────────────────── */}
        {activeTab === 'riwayat' && (
          <div style={{ padding: '16px 16px 0' }}>

            {/* Pending orders */}
            {pendingOrders.length > 0 && (
              <>
                <SectionLabel>Order Aktif ({pendingOrders.length})</SectionLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                  {pendingOrders.map(o => (
                    <div key={o.id} style={{
                      background: '#FFFBF0', border: '1.5px solid #FFE090', borderRadius: 12,
                      padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 2 }}>
                          <span style={{ fontSize: 13, fontWeight: 900, color: '#1A2030' }}>{o.stock_code}</span>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 5, color: o.order_type === 'buy' ? '#20A040' : '#E03040', background: o.order_type === 'buy' ? '#E8FFF0' : '#FFF0F0' }}>
                            {o.order_type === 'buy' ? 'BELI' : 'JUAL'}
                          </span>
                        </div>
                        <p style={{ fontSize: 11, color: '#8A8080' }}>{o.lots} lot · Rp {o.limit_price.toLocaleString('id-ID')}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCancel(o.id)}
                        disabled={cancelling === o.id}
                        style={{ fontSize: 11, fontWeight: 700, color: '#E03040', background: 'none', border: '1px solid #FFB0B0', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', opacity: cancelling === o.id ? 0.5 : 1 }}
                      >
                        {cancelling === o.id ? '…' : 'Batal'}
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Order history */}
            {data.orders.length > 0 ? (
              <>
                <SectionLabel>Riwayat Order</SectionLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                  {visibleOrders.map(o => (
                    <div key={o.id} style={{
                      background: 'white', border: '1px solid #EDE8E0', borderRadius: 10,
                      padding: '9px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: o.order_type === 'buy' ? '#20A040' : '#E03040', background: o.order_type === 'buy' ? '#E8FFF0' : '#FFF0F0', padding: '2px 6px', borderRadius: 5 }}>
                          {o.order_type === 'buy' ? 'B' : 'J'}
                        </span>
                        <div>
                          <p style={{ fontSize: 12, fontWeight: 800, color: '#1A2030' }}>{o.stock_code} · {o.lots} lot</p>
                          <p style={{ fontSize: 10, color: '#A09080' }}>
                            limit Rp {o.limit_price.toLocaleString('id-ID')}
                            {o.filled_price ? ` → Rp ${o.filled_price.toLocaleString('id-ID')}` : ''}
                          </p>
                        </div>
                      </div>
                      <StatusPill status={o.status} />
                    </div>
                  ))}
                </div>
                {data.orders.length > 5 && (
                  <button
                    type="button"
                    onClick={() => setShowAllOrders(v => !v)}
                    style={{ width: '100%', padding: '10px', marginBottom: 16, borderRadius: 10, border: '1.5px solid #EDE8E0', background: 'white', fontSize: 12, fontWeight: 700, color: '#8A8080', cursor: 'pointer' }}
                  >
                    {showAllOrders ? 'Tampilkan lebih sedikit' : `Lihat semua ${data.orders.length} order`}
                  </button>
                )}
              </>
            ) : (
              <div style={{ paddingTop: 36, textAlign: 'center' }}>
                <p style={{ fontSize: 36, marginBottom: 10 }}>🗂️</p>
                <p style={{ fontSize: 15, fontWeight: 800, color: '#1A2030', marginBottom: 6 }}>Belum ada riwayat order</p>
                <p style={{ fontSize: 12, color: '#A09080' }}>Order yang kamu pasang akan muncul di sini.</p>
              </div>
            )}
          </div>
        )}

      </div>

      <BottomNav />
    </div>
  )
}

function getMarketStatus() {
  const wib  = new Date(Date.now() + 7 * 3_600_000)
  const day  = wib.getUTCDay()          // 0=Sun … 6=Sat
  const mins = wib.getUTCHours() * 60 + wib.getUTCMinutes()

  if (day === 0 || day === 6) return { open: false, text: 'Libur Weekend' }
  if (mins >= 9*60      && mins < 11*60+30) return { open: true,  text: 'Sesi 1 · s/d 11:30' }
  if (mins >= 11*60+30  && mins < 13*60+30) return { open: false, text: 'Istirahat · Buka 13:30' }
  if (mins >= 13*60+30  && mins < 15*60)    return { open: true,  text: 'Sesi 2 · s/d 15:00' }
  if (mins < 9*60)                          return { open: false, text: 'Buka 09:00 WIB' }
  return { open: false, text: 'Tutup · Buka Besok' }
}

function sectorColor(sector) {
  const map = {
    'Perbankan':      '#3B82F6',
    'Teknologi':      '#8B5CF6',
    'Telekomunikasi': '#06B6D4',
    'Otomotif':       '#F59E0B',
    'Pertambangan':   '#78716C',
    'Konsumer':       '#EC4899',
    'Kesehatan':      '#10B981',
    'Industri':       '#F97316',
    'Energi':         '#EF4444',
    'Infrastruktur':  '#6366F1',
  }
  return map[sector] ?? '#A09080'
}
