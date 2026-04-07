import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchArenaToday, cancelArenaOrder, fetchArenaLeaderboard } from '../api/arena'
import { fetchStockFeed } from '../api/stocks'
import { BottomNav } from '../components/BottomNav'

// ── Helpers ────────────────────────────────────────────────────────────────

function formatCash(v) {
  return v >= 1_000_000 ? (v / 1_000_000).toFixed(1) + 'jt' : v.toLocaleString('id-ID')
}

const MASCOTS = ['🦊', '🐂', '🦬', '🦁', '🦅', '🐯', '🦋', '🦉']
function getMascot(name) {
  if (!name) return MASCOTS[0]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) & 0xffffffff
  return MASCOTS[Math.abs(hash) % MASCOTS.length]
}

function getMarketStatus() {
  const wib  = new Date(Date.now() + 7 * 3_600_000)
  const day  = wib.getUTCDay()
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

function sectorEmoji(sector) {
  const map = {
    'Perbankan':      '🏦',
    'Teknologi':      '💻',
    'Telekomunikasi': '📡',
    'Otomotif':       '🚗',
    'Pertambangan':   '⛏️',
    'Konsumer':       '🛒',
    'Kesehatan':      '🏥',
    'Industri':       '🏭',
    'Energi':         '⚡',
    'Infrastruktur':  '🏗️',
  }
  return map[sector] ?? '📈'
}

// ── Small shared components ────────────────────────────────────────────────

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

function ChangeBadge({ pct }) {
  const up = pct >= 0
  return (
    <span style={{
      fontSize: 11, fontWeight: 900, padding: '3px 8px', borderRadius: 100,
      background: up ? '#E8FFF0' : '#FFF0F0',
      color: up ? '#20A040' : '#E03040',
      border: `1.5px solid ${up ? '#B0EFC0' : '#FFB0B0'}`,
    }}>
      {up ? '▲' : '▼'}{up ? '+' : ''}{Number(pct).toFixed(1)}%
    </span>
  )
}

// ── Daily Mission ──────────────────────────────────────────────────────────

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

  const donePct = isDone ? 1 : 0

  return (
    <div style={{
      background: 'linear-gradient(135deg,#F8FFF8,#F0FFF4)',
      border: '2px solid rgba(96,232,128,0.4)',
      borderRadius: 14,
      padding: '12px 14px',
      marginBottom: 14,
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#60A870', margin: 0 }}>
          ⚡ Misi Hari Ini
        </p>
        {isDone && (
          <span style={{ fontSize: 11, fontWeight: 800, color: '#20A040' }}>✅ Selesai</span>
        )}
      </div>

      {/* Progress bar */}
      <div style={{ height: 8, background: '#E8E0D8', borderRadius: 100, marginBottom: 12, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${donePct * 100}%`,
          background: isDone ? 'linear-gradient(90deg,#FFB830,#FFE060)' : '#E8E0D8',
          borderRadius: 100,
          transition: 'width 0.4s',
        }} />
      </div>

      {/* Mission body */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
        <span style={{ fontSize: 24, lineHeight: 1, flexShrink: 0 }}>{mission.icon}</span>
        <div>
          <p style={{ fontSize: 14, fontWeight: 900, color: '#1A2030', margin: 0, marginBottom: 3 }}>{mission.title}</p>
          <p style={{ fontSize: 12, color: '#6A7A6A', lineHeight: 1.6, margin: 0 }}>{mission.desc}</p>
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
        <p style={{ fontSize: 11, color: '#4A8060', fontWeight: 700, margin: 0 }}>
          Kamu sudah menyelesaikan misi hari ini! Kembali besok untuk tantangan baru.
        </p>
      )}
    </div>
  )
}

// ── Countdown to 15:00 WIB ────────────────────────────────────────────────

function useCountdown(seasonDate) {
  const [label, setLabel] = useState('')
  useEffect(() => {
    function calc() {
      const now   = Date.now()
      const base  = seasonDate ? new Date(seasonDate + 'T08:00:00Z') : new Date()
      const end   = new Date(base.getFullYear(), base.getMonth(), base.getDate(), 8, 0, 0, 0)
      // 15:00 WIB = 08:00 UTC
      const target = new Date(seasonDate ? seasonDate + 'T08:00:00Z' : new Date().toISOString().slice(0,10) + 'T08:00:00Z')
      const diff = target.getTime() - now
      if (diff <= 0) { setLabel('Sesi Selesai'); return }
      const h = Math.floor(diff / 3_600_000)
      const m = Math.floor((diff % 3_600_000) / 60_000)
      const s = Math.floor((diff % 60_000) / 1_000)
      setLabel(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`)
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [seasonDate])
  return label
}

// ── Arena Banner SVG ───────────────────────────────────────────────────────

function ArenaBanner() {
  return (
    <svg width="100%" height="240" viewBox="0 0 375 240" preserveAspectRatio="none" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#0F0820" />
          <stop offset="55%"  stopColor="#1A0A3A" />
          <stop offset="100%" stopColor="#1A1030" />
        </linearGradient>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#00DC8C" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#00DC8C" stopOpacity="0"    />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="375" height="240" fill="url(#bgGrad)" />

      {/* Grid lines horizontal */}
      <line x1="0" y1="60"  x2="375" y2="60"  stroke="rgba(255,184,48,0.08)" strokeWidth="1" />
      <line x1="0" y1="120" x2="375" y2="120" stroke="rgba(255,184,48,0.06)" strokeWidth="1" />
      <line x1="0" y1="180" x2="375" y2="180" stroke="rgba(255,184,48,0.08)" strokeWidth="1" />

      {/* Grid lines vertical */}
      <line x1="62"  y1="0" x2="62"  y2="240" stroke="rgba(255,184,48,0.05)" strokeWidth="1" />
      <line x1="125" y1="0" x2="125" y2="240" stroke="rgba(255,184,48,0.05)" strokeWidth="1" />
      <line x1="187" y1="0" x2="187" y2="240" stroke="rgba(255,184,48,0.05)" strokeWidth="1" />
      <line x1="250" y1="0" x2="250" y2="240" stroke="rgba(255,184,48,0.05)" strokeWidth="1" />
      <line x1="312" y1="0" x2="312" y2="240" stroke="rgba(255,184,48,0.05)" strokeWidth="1" />

      {/* Chart fill */}
      <path
        d="M0,170 L30,155 L60,162 L90,140 L110,148 L140,118 L165,125 L190,100 L215,108 L245,82 L268,90 L295,65 L320,72 L345,50 L375,42 L375,220 L0,220 Z"
        fill="url(#chartFill)"
      />

      {/* Chart line */}
      <path
        d="M0,170 L30,155 L60,162 L90,140 L110,148 L140,118 L165,125 L190,100 L215,108 L245,82 L268,90 L295,65 L320,72 L345,50 L375,42"
        fill="none"
        stroke="#00DC8C"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Current price dot outer pulse */}
      <circle cx="375" cy="42" r="10" fill="#00DC8C" opacity="0.2" />
      {/* Current price dot */}
      <circle cx="375" cy="42" r="5" fill="#00DC8C" />

      {/* Floating ticker labels */}
      <text x="20"  y="28" fill="rgba(0,220,140,0.5)"   fontFamily="'Courier New',monospace" fontSize="10" fontWeight="bold">BBCA +2.4%</text>
      <text x="160" y="22" fill="rgba(255,184,48,0.5)"  fontFamily="'Courier New',monospace" fontSize="10" fontWeight="bold">TLKM +1.1%</text>
      <text x="280" y="30" fill="rgba(255,80,96,0.5)"   fontFamily="'Courier New',monospace" fontSize="10" fontWeight="bold">GOTO -0.8%</text>

      {/* Stars */}
      <text x="28"  y="100" fill="#F5C518" opacity="0.5" fontSize="16">★</text>
      <text x="340" y="120" fill="#F5C518" opacity="0.4" fontSize="16">★</text>
    </svg>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────

const TABS = [
  { key: 'portofolio', label: 'Portofolio' },
  { key: 'pasar',      label: 'Pasar'      },
  { key: 'ranking',    label: 'Ranking'    },
]

const STARTING_CAPITAL = 10_000_000

export function Arena() {
  const navigate = useNavigate()

  const [data,          setData]          = useState(null)
  const [stocks,        setStocks]        = useState([])
  const [lb,            setLb]            = useState([])
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState(null)
  const [cancelling,    setCancelling]    = useState(null)
  const [showAllOrders, setShowAllOrders] = useState(false)
  const [activeTab,     setActiveTab]     = useState('portofolio')
  const [search,        setSearch]        = useState('')
  const [activeSector,  setActiveSector]  = useState('Semua')
  const [sortAsc,       setSortAsc]       = useState(false)
  const [lbLeague,      setLbLeague]      = useState('emas')

  function load() {
    setLoading(true)
    Promise.all([
      fetchArenaToday(),
      fetchStockFeed(),
      fetchArenaLeaderboard().catch(() => []),
    ])
      .then(([arena, feed, leaderboard]) => {
        setData(arena)
        setStocks(feed ?? [])
        const entries = Array.isArray(leaderboard) ? leaderboard : (leaderboard?.entries ?? [])
        setLb(entries)
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

  const countdown = useCountdown(data?.season?.date)

  // ── Loading skeleton ────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex min-h-svh flex-col bg-white">
        <div style={{ background: 'linear-gradient(135deg,#0F0820,#1A0A3A)', height: 240 }} />
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

  // Derived data
  const pendingOrders  = data.orders.filter(o => o.status === 'pending')
  const filledOrders   = data.orders.filter(o => o.status === 'filled')
  const holdingMap     = Object.fromEntries(data.holdings.map(h => [h.stock_code, h]))
  const pnlAmount      = data.total_value - STARTING_CAPITAL
  const pnlUp          = pnlAmount >= 0
  const marketStatus   = getMarketStatus()

  // Stocks list filtering
  const sectors = ['Semua', ...Array.from(new Set(stocks.map(s => s.sector).filter(Boolean)))]
  const filteredStocks = stocks
    .filter(s => {
      const q = search.toLowerCase()
      const matchSearch = !q || s.code.toLowerCase().includes(q) || (s.name && s.name.toLowerCase().includes(q))
      const matchSector = activeSector === 'Semua' || s.sector === activeSector
      return matchSearch && matchSector
    })
    .slice()
    .sort((a, b) => {
      const diff = Number(a.price_change_pct) - Number(b.price_change_pct)
      return sortAsc ? diff : -diff
    })

  // Leaderboard league threshold
  function userLeague() {
    if (!lb.length || !data.rank) return 'perunggu'
    const pct = data.rank / lb.length
    if (pct <= 0.1) return 'emas'
    if (pct <= 0.3) return 'perak'
    return 'perunggu'
  }

  const topLb = lb.slice(0, 3)

  // Podium order: 2nd, 1st, 3rd
  const podiumOrder = [topLb[1], topLb[0], topLb[2]]

  return (
    <div className="flex min-h-svh flex-col bg-white">

      {/* ── Arena Banner (SVG + overlapping card) ────────────────────── */}
      <div style={{ position: 'relative' }}>
        <ArenaBanner />

        {/* Portfolio card overlapping bottom of banner */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'white',
          borderRadius: '26px 26px 0 0',
          padding: '18px 16px 10px',
          zIndex: 5,
        }}>
          <p style={{ fontSize: 10, color: '#B0A090', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 4 }}>
            Total Portofolio (Virtual)
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
            <p style={{ fontSize: 36, fontFamily: "'Fredoka One',cursive", color: '#1A1A1A', margin: 0, lineHeight: 1 }}>
              Rp {data.total_value.toLocaleString('id-ID')}
            </p>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: pnlUp ? '#E8FFF0' : '#FFF0F0',
              color: pnlUp ? '#20A040' : '#E03040',
              border: `1.5px solid ${pnlUp ? '#B0EFC0' : '#FFB0B0'}`,
              borderRadius: 100,
              padding: '4px 12px',
              fontSize: 13,
              fontWeight: 900,
            }}>
              {pnlUp ? '▲' : '▼'} {pnlUp ? '+' : '-'}Rp {Math.abs(pnlAmount).toLocaleString('id-ID')}
              {' '}({pnlUp ? '+' : ''}{data.return_pct ? Number(data.return_pct).toFixed(2) : '0.00'}%)
            </span>
            <span style={{ fontSize: 11, color: '#60B080', fontWeight: 600 }}>Hari ini</span>
          </div>

          {/* Quick stats row */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {[
              { label: 'Saldo',    value: 'Rp ' + formatCash(data.cash),         up: false },
              { label: 'Investasi',value: 'Rp ' + formatCash(data.holdings_value), up: false },
              { label: 'Posisi',   value: data.holdings.length + ' saham',        up: data.holdings.length > 0 },
              { label: 'Orders',   value: filledOrders.length + ' terisi',         up: filledOrders.length > 0 },
            ].map(item => (
              <div key={item.label} style={{
                flex: 1, background: '#FAFAF8', border: '2px solid #F0EDE8',
                borderRadius: 14, padding: '8px 10px', textAlign: 'center',
              }}>
                <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#B0A090', marginBottom: 3, margin: 0 }}>
                  {item.label}
                </p>
                <p style={{ fontSize: 16, fontFamily: "'Fredoka One',cursive", color: item.up ? '#20A040' : '#2A1A06', margin: 0, marginTop: 3 }}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab bar ──────────────────────────────────────────────────────── */}
      <div style={{ background: 'white', borderBottom: '2px solid #EDE8E0', display: 'flex', position: 'sticky', top: 0, zIndex: 10 }}>
        {TABS.map(tab => (
          <button key={tab.key} type="button"
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1, padding: '12px 0', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 800,
              color: activeTab === tab.key ? '#1A1A1A' : '#8A8080',
              borderBottom: `2.5px solid ${activeTab === tab.key ? '#FFB830' : 'transparent'}`,
              transition: 'color 0.15s',
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ──────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 90 }}>

        {/* ── PORTOFOLIO TAB ───────────────────────────────────────────── */}
        {activeTab === 'portofolio' && (
          <div style={{ padding: '16px 16px 0' }}>

            {/* Rank banner */}
            {data.rank > 0 && (
              <div style={{
                background: 'linear-gradient(135deg,#FFF8E0,#FFF0D0)',
                border: '2px solid #F5C518',
                borderRadius: 16,
                padding: '12px 14px',
                marginBottom: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                boxShadow: '0 3px 0 rgba(245,197,24,0.2)',
              }}>
                {/* Rank badge */}
                <div style={{
                  width: 48, height: 48, borderRadius: 24, flexShrink: 0,
                  background: 'linear-gradient(135deg,#FFD040,#FFB020)',
                  boxShadow: '0 3px 0 #CC8000',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Fredoka One',cursive", fontSize: 22, color: '#7A4000',
                }}>
                  #{data.rank}
                </div>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#9A6800', textTransform: 'uppercase', letterSpacing: '1.5px', margin: 0, marginBottom: 2 }}>
                    Peringkatmu hari ini
                  </p>
                  <p style={{ fontFamily: "'Fredoka One',cursive", fontSize: 17, color: '#7A4000', margin: 0 }}>
                    Top {data.rank} dari {data.total_traders} trader!
                  </p>
                </div>
              </div>
            )}

            {/* Daily Mission */}
            <DailyMission data={data} navigate={navigate} onSwitchTab={setActiveTab} />

            {/* Holdings section */}
            {data.holdings.length > 0 ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <p style={{ fontSize: 11, fontWeight: 900, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#A09080', margin: 0 }}>
                    📦 Saham Kamu
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('pasar')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 800, color: '#FFB830' }}
                  >
                    ➕ Beli Saham
                  </button>
                </div>
                <div style={{ marginBottom: 16 }}>
                  {data.holdings.map(h => {
                    const stockInfo = stocks.find(s => s.code === h.stock_code)
                    const emoji = stockInfo ? sectorEmoji(stockInfo.sector) : '📈'
                    const color = stockInfo ? sectorColor(stockInfo.sector) : '#A09080'
                    return (
                      <div
                        key={h.stock_code}
                        onClick={() => navigate(`/arena/stock/${h.stock_code}`, { state: { holding: h, cash: data.cash } })}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '12px 0',
                          borderBottom: '1.5px solid #F8F4F0',
                          cursor: 'pointer',
                        }}
                      >
                        {/* Logo */}
                        <div style={{
                          width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                          background: color + '22',
                          border: `2px solid ${color}44`,
                          boxShadow: '0 3px 0 rgba(0,0,0,0.08)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 20,
                        }}>
                          {emoji}
                        </div>
                        {/* Info */}
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                            <p style={{ fontSize: 16, fontFamily: "'Fredoka One',cursive", color: '#1A1A1A', margin: 0 }}>{h.stock_code}</p>
                          </div>
                          <p style={{ fontSize: 11, color: '#8A7A6A', margin: 0 }}>
                            {h.lots} lot · avg Rp {h.avg_price_per_share.toLocaleString('id-ID')}
                          </p>
                        </div>
                        {/* Right */}
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: 16, fontFamily: "'Fredoka One',cursive", color: '#1A1A1A', margin: 0, marginBottom: 2 }}>
                            Rp {formatCash(h.current_value)}
                          </p>
                          <p style={{ fontSize: 12, fontWeight: 700, color: h.pnl >= 0 ? '#20A040' : '#E03040', margin: 0 }}>
                            {h.pnl >= 0 ? '▲ +' : '▼ -'}Rp {Math.abs(h.pnl).toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                    )
                  })}
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

            {/* Pending orders */}
            {pendingOrders.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 900, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#A09080', marginBottom: 10 }}>
                  ⏳ Order Pending ({pendingOrders.length})
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
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
                        <p style={{ fontSize: 11, color: '#8A8080', margin: 0 }}>{o.lots} lot · Rp {o.limit_price.toLocaleString('id-ID')}</p>
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
              </div>
            )}

            {/* FAB */}
            <div
              onClick={() => setActiveTab('pasar')}
              style={{
                margin: '16px 0',
                background: 'linear-gradient(180deg,#48D870,#28B050)',
                border: '2px solid #20A040',
                borderRadius: 16,
                padding: 14,
                textAlign: 'center',
                cursor: 'pointer',
                fontFamily: "'Fredoka One',cursive",
                fontSize: 17,
                color: 'white',
                boxShadow: '0 5px 0 #189030',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              ⚡ Beli / Jual Saham
            </div>
          </div>
        )}

        {/* ── PASAR TAB ────────────────────────────────────────────────── */}
        {activeTab === 'pasar' && (
          <div>
            {/* Balance bar */}
            <div style={{
              background: '#F0FFF4',
              borderBottom: '2px solid #60E880',
              padding: '10px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 900, color: '#60A870', textTransform: 'uppercase', letterSpacing: '1.5px', margin: 0, marginBottom: 2 }}>
                  SALDO TERSEDIA
                </p>
                <p style={{ fontFamily: "'Fredoka One',cursive", fontSize: 20, color: '#1A5A1A', margin: 0 }}>
                  Rp {data.cash.toLocaleString('id-ID')}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#60A870', margin: 0, marginBottom: 4 }}>Market</p>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  fontSize: 11, fontWeight: 800,
                  background: marketStatus.open ? '#E8FFF0' : '#FFF0F0',
                  color: marketStatus.open ? '#20A040' : '#E03040',
                  border: `1.5px solid ${marketStatus.open ? '#B0EFC0' : '#FFB0B0'}`,
                  borderRadius: 100, padding: '3px 10px',
                }}>
                  <span style={{ width: 7, height: 7, borderRadius: 4, background: marketStatus.open ? '#20A040' : '#E03040', display: 'inline-block' }} />
                  {marketStatus.open ? 'BUKA · LIVE' : 'TUTUP'}
                </span>
              </div>
            </div>

            {/* Search bar */}
            <div style={{
              margin: '12px 16px',
              background: '#F0EDE8',
              borderRadius: 14,
              display: 'flex',
              gap: 8,
              padding: '10px 12px',
              border: '2px solid #E8E0D8',
              alignItems: 'center',
            }}>
              <span style={{ fontSize: 16 }}>🔍</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari saham IDX... (BBCA, TLKM)"
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  fontSize: 14, fontFamily: 'Nunito, sans-serif', fontWeight: 700, color: '#1A1A1A',
                }}
              />
            </div>

            {/* Sector filter chips */}
            <div style={{
              display: 'flex',
              gap: 8,
              padding: '0 16px',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              marginBottom: 12,
            }}>
              {sectors.map(sector => {
                const active = activeSector === sector
                return (
                  <button
                    key={sector}
                    type="button"
                    onClick={() => setActiveSector(sector)}
                    style={{
                      flexShrink: 0,
                      borderRadius: 100,
                      padding: '6px 14px',
                      fontSize: 11,
                      fontWeight: 900,
                      cursor: 'pointer',
                      border: `1.5px solid ${active ? '#CC8800' : '#E8E0D8'}`,
                      background: active ? '#FFB830' : 'white',
                      color: active ? '#7A4000' : '#8A7A6A',
                      boxShadow: active ? '0 2px 0 #AA6600' : 'none',
                    }}
                  >
                    {sector}
                  </button>
                )
              })}
            </div>

            {/* Sort header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px', marginBottom: 8 }}>
              <p style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: '#B0A090', margin: 0 }}>SAHAM</p>
              <button
                type="button"
                onClick={() => setSortAsc(v => !v)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 900, color: '#FFB830' }}
              >
                % Harian {sortAsc ? '↑' : '↓'}
              </button>
            </div>

            {/* Stock rows */}
            {filteredStocks.length === 0 ? (
              <div style={{ padding: '24px 16px', textAlign: 'center' }}>
                <p style={{ fontSize: 12, color: '#A09080' }}>Tidak ada saham ditemukan.</p>
              </div>
            ) : (
              <div>
                {filteredStocks.map(stock => {
                  const holding = holdingMap[stock.code]
                  const color   = sectorColor(stock.sector)
                  const emoji   = sectorEmoji(stock.sector)
                  return (
                    <div
                      key={stock.code}
                      onClick={() => navigate(`/arena/stock/${stock.code}`, { state: { stock, holding: holding ?? null, cash: data.cash } })}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '12px 16px',
                        borderBottom: '1.5px solid #F8F4F0',
                        cursor: 'pointer',
                      }}
                    >
                      {/* Stock logo */}
                      <div style={{
                        width: 46, height: 46, borderRadius: 14, flexShrink: 0,
                        background: color + '22',
                        border: `2px solid ${color}44`,
                        boxShadow: '0 3px 0 rgba(0,0,0,0.08)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 22,
                      }}>
                        {emoji}
                      </div>
                      {/* Left info */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                          <p style={{ fontSize: 16, fontFamily: "'Fredoka One',cursive", color: '#1A1A1A', margin: 0 }}>{stock.code}</p>
                          {holding && (
                            <span style={{ fontSize: 10, fontWeight: 800, color: '#28A060', background: '#E8FFF0', border: '1px solid #B0EFC0', borderRadius: 100, padding: '1px 6px' }}>⭐</span>
                          )}
                        </div>
                        <p style={{ fontSize: 11, color: '#8A7A6A', margin: 0, marginBottom: 1 }}>{stock.name || stock.code}</p>
                        <p style={{ fontSize: 10, color: '#B0A090', margin: 0 }}>{stock.sector} · IDX</p>
                      </div>
                      {/* Right */}
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 16, fontFamily: "'Fredoka One',cursive", color: '#1A1A1A', margin: 0, marginBottom: 3 }}>
                          Rp {Number(stock.price_close).toLocaleString('id-ID')}
                        </p>
                        <ChangeBadge pct={stock.price_change_pct} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* FAB */}
            <div style={{ padding: '0 16px' }}>
              <div
                onClick={() => setActiveTab('pasar')}
                style={{
                  margin: '16px 0',
                  background: 'linear-gradient(180deg,#48D870,#28B050)',
                  border: '2px solid #20A040',
                  borderRadius: 16,
                  padding: 14,
                  textAlign: 'center',
                  cursor: 'pointer',
                  fontFamily: "'Fredoka One',cursive",
                  fontSize: 17,
                  color: 'white',
                  boxShadow: '0 5px 0 #189030',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                ⚡ Beli / Jual Saham
              </div>
            </div>
          </div>
        )}

        {/* ── RANKING TAB ──────────────────────────────────────────────── */}
        {activeTab === 'ranking' && (
          <div>

            {/* Dark ranking header with podium */}
            <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
              <svg width="100%" height="200" viewBox="0 0 375 200" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0 }}>
                <defs>
                  <linearGradient id="rankBg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#1A0A3A" />
                    <stop offset="100%" stopColor="#0F0820" />
                  </linearGradient>
                  <radialGradient id="trophyGlow" cx="50%" cy="100%" r="50%">
                    <stop offset="0%"   stopColor="#FFD040" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#FFD040" stopOpacity="0"   />
                  </radialGradient>
                </defs>
                <rect width="375" height="200" fill="url(#rankBg)" />
                <ellipse cx="187" cy="200" rx="160" ry="40" fill="url(#trophyGlow)" />
                {/* Confetti dots */}
                {[
                  [30, 20, '#FFD040'], [60, 50, '#FF5060'], [90, 15, '#00DC8C'],
                  [120, 40, '#FFB830'], [150, 25, '#8B5CF6'], [200, 10, '#FFD040'],
                  [240, 45, '#00DC8C'], [280, 20, '#FF5060'], [320, 35, '#FFB830'],
                  [350, 15, '#8B5CF6'], [45, 80, '#FFD040'], [310, 70, '#00DC8C'],
                ].map(([cx, cy, fill], i) => (
                  <circle key={i} cx={cx} cy={cy} r="3" fill={fill} opacity="0.6" />
                ))}
                <text x="20"  y="100" fill="#F5C518" opacity="0.5" fontSize="16">★</text>
                <text x="340" y="80"  fill="#F5C518" opacity="0.4" fontSize="16">★</text>
              </svg>

              {/* Podium */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                gap: 0,
              }}>
                {podiumOrder.map((entry, idx) => {
                  // idx 0 = 2nd place, idx 1 = 1st place, idx 2 = 3rd place
                  const realRank   = idx === 0 ? 2 : idx === 1 ? 1 : 3
                  const blockH     = realRank === 1 ? 72 : realRank === 2 ? 52 : 40
                  const avatarSize = realRank === 1 ? 66 : 56
                  const blockColor = realRank === 1
                    ? 'linear-gradient(135deg,#FFD040,#FFB020)'
                    : realRank === 2
                      ? 'linear-gradient(135deg,#C8D8E8,#A0B8CC)'
                      : 'linear-gradient(135deg,#E0A860,#C07838)'
                  const borderColor = realRank === 1 ? '#FFD040' : realRank === 2 ? '#A0B8CC' : '#C07838'

                  if (!entry) return <div key={idx} style={{ width: 90 }} />
                  return (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 90 }}>
                      {realRank === 1 && <p style={{ fontSize: 18, marginBottom: 2 }}>👑</p>}
                      <div style={{
                        width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2,
                        background: '#2A1A4A',
                        border: `3px solid ${borderColor}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: realRank === 1 ? 30 : 24,
                        marginBottom: 4,
                      }}>
                        {getMascot(entry.display_name)}
                      </div>
                      <p style={{
                        fontSize: 10, fontWeight: 800, color: 'white', margin: 0, marginBottom: 4,
                        maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center',
                      }}>
                        {entry.display_name}
                      </p>
                      <div style={{
                        width: 80, height: blockH,
                        background: blockColor,
                        borderRadius: '8px 8px 0 0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: "'Fredoka One',cursive", fontSize: 16,
                        color: realRank === 1 ? '#7A4000' : realRank === 2 ? '#3A5060' : '#6A3000',
                      }}>
                        #{realRank}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div style={{ padding: '16px 16px 0' }}>

              {/* League toggle */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                {[
                  { key: 'emas',    label: 'Liga Emas'    },
                  { key: 'perak',   label: 'Liga Perak'   },
                  { key: 'perunggu',label: 'Liga Perunggu' },
                ].map(league => {
                  const active = lbLeague === league.key
                  return (
                    <button
                      key={league.key}
                      type="button"
                      onClick={() => setLbLeague(league.key)}
                      style={{
                        flex: 1,
                        borderRadius: 10,
                        padding: '8px 4px',
                        fontSize: 11,
                        fontWeight: 800,
                        border: 'none',
                        cursor: 'pointer',
                        background: active ? 'linear-gradient(135deg,#FFD040,#FFB020)' : '#F0EDE8',
                        color: active ? '#7A4000' : '#8A7A6A',
                        boxShadow: active ? '0 3px 0 #CC8000' : 'none',
                      }}
                    >
                      {league.label}
                    </button>
                  )
                })}
              </div>

              {/* Countdown banner */}
              <div style={{
                background: 'linear-gradient(135deg,#FFF0F0,#FFE8E8)',
                border: '2px solid rgba(255,80,96,0.25)',
                borderRadius: 14,
                padding: '10px 14px',
                marginBottom: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>⏰</span>
                  <div>
                    <p style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#E03040', margin: 0, marginBottom: 2 }}>
                      SESI BERAKHIR
                    </p>
                    <p style={{ fontFamily: "'Fredoka One',cursive", fontSize: 18, color: '#E03040', margin: 0 }}>
                      {countdown || '--:--:--'}
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 11, color: '#8A7A6A', margin: 0, marginBottom: 2 }}>Top 3 menang</p>
                  <p style={{ fontSize: 13, fontWeight: 900, color: '#CC8000', margin: 0 }}>+500 XP 🎁</p>
                </div>
              </div>

              {/* Section label */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <p style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#A09080', margin: 0 }}>
                  📊 Semua Trader
                </p>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#8A7A6A' }}>{lb.length} trader</span>
              </div>

              {/* Leaderboard rows */}
              {lb.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <p style={{ fontSize: 12, color: '#A09080' }}>Memuat papan peringkat...</p>
                </div>
              ) : (
                <div style={{ marginBottom: 16 }}>
                  {lb.map((entry, i) => {
                    const rank    = i + 1
                    const isYou   = entry.is_self || (data.rank === rank)
                    const rankBg  = rank === 1
                      ? 'linear-gradient(135deg,#FFD040,#FFB020)'
                      : rank === 2
                        ? 'linear-gradient(135deg,#C8D8E8,#A0B8CC)'
                        : rank === 3
                          ? 'linear-gradient(135deg,#E0A860,#C07838)'
                          : '#F0EDE8'
                    const rankColor = rank === 1 ? '#7A4000'
                      : rank === 2 ? '#3A5060'
                      : rank === 3 ? '#6A3000'
                      : '#8A7A6A'
                    const rankShadow = rank <= 3 ? (rank === 1 ? '0 2px 0 #CC8000' : '0 2px 0 rgba(0,0,0,0.1)') : 'none'
                    const retPct = entry.return_pct ?? 0
                    return (
                      <div
                        key={entry.user_id ?? i}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: isYou ? '12px 8px' : '12px 0',
                          borderBottom: '1.5px solid #F8F4F0',
                          ...(isYou ? {
                            background: 'linear-gradient(135deg,#FFF8E0,#FFF0D0)',
                            borderRadius: 14,
                            border: '2px solid rgba(245,197,24,0.3)',
                            margin: '4px 0',
                          } : {}),
                        }}
                      >
                        {/* Rank badge */}
                        <div style={{
                          width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                          background: rankBg,
                          boxShadow: rankShadow,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: "'Fredoka One',cursive", fontSize: 14,
                          color: rankColor,
                        }}>
                          {rank}
                        </div>
                        {/* Avatar */}
                        <div style={{
                          width: 40, height: 40, borderRadius: 20, flexShrink: 0,
                          background: '#EDE8F8',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 20,
                          border: '2px solid #E0D8F0',
                        }}>
                          {getMascot(entry.display_name)}
                        </div>
                        {/* Info */}
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <p style={{ fontFamily: "'Fredoka One',cursive", fontSize: 15, color: '#1A1A1A', margin: 0 }}>
                              {entry.display_name}
                            </p>
                            {isYou && (
                              <span style={{ fontSize: 9, fontWeight: 900, background: '#FFB830', color: '#7A4000', borderRadius: 100, padding: '2px 6px', letterSpacing: '0.5px' }}>
                                KAMU
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: 10, color: '#B0A090', margin: 0 }}>
                            {rank <= Math.ceil(lb.length * 0.1) ? '🥇 Liga Emas' : rank <= Math.ceil(lb.length * 0.3) ? '🥈 Liga Perak' : '🥉 Liga Perunggu'}
                          </p>
                        </div>
                        {/* Right */}
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontFamily: "'Fredoka One',cursive", fontSize: 16, color: retPct >= 0 ? '#20A040' : '#E03040', margin: 0, marginBottom: 2 }}>
                            {retPct >= 0 ? '+' : ''}{Number(retPct).toFixed(2)}%
                          </p>
                          <p style={{ fontSize: 11, color: '#A0908A', margin: 0 }}>
                            Rp {formatCash(entry.total_value ?? 0)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      <BottomNav />
    </div>
  )
}
