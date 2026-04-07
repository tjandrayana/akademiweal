import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchStockFeed } from '../api/stocks'
import { BottomNav } from '../components/BottomNav'
import { storageKey } from '../lib/progressScope'
import { playNavigate } from '../lib/sounds'

const FREE_LIMIT = 3

function todayKey() {
  return storageKey(`stock_analyses_${new Date().toISOString().slice(0, 10)}`)
}

function getUsedCount() {
  try { return parseInt(localStorage.getItem(todayKey()) ?? '0', 10) || 0 } catch { return 0 }
}

function incrementUsed() {
  try { localStorage.setItem(todayKey(), String(getUsedCount() + 1)) } catch { /* ignore */ }
}

function ChangeBadge({ pct }) {
  const up = pct >= 0
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 6,
      background: up ? '#E8FFF0' : '#FFF0F0',
      color: up ? '#20A040' : '#E03040',
      border: `1px solid ${up ? '#B0EFC0' : '#FFB0B0'}`,
    }}>
      {up ? '+' : ''}{pct.toFixed(1)}%
    </span>
  )
}

function StockCard({ stock, usedCount, onClick }) {
  const locked = stock.is_premium
  const limitReached = !locked && usedCount >= FREE_LIMIT

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%', textAlign: 'left', background: 'white',
        border: '1.5px solid #F0EDE8', borderRadius: 16,
        padding: '12px 14px', cursor: locked || limitReached ? 'default' : 'pointer',
        opacity: locked ? 0.55 : 1,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        transition: 'border-color 0.15s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontSize: 15, fontWeight: 900, color: '#1A2030', fontFamily: "'Fredoka One',cursive" }}>
              {stock.code}
            </span>
            <span style={{ fontSize: 10, color: '#A09080', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {stock.sector}
            </span>
          </div>
          <p style={{ fontSize: 11, color: '#8A8080', marginTop: 1 }}>{stock.name}</p>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 800, color: '#1A2030' }}>
            Rp {Number(stock.price_close).toLocaleString('id-ID')}
          </p>
          <div style={{ marginTop: 2 }}>
            <ChangeBadge pct={stock.price_change_pct} />
          </div>
        </div>
      </div>

      {locked ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 0' }}>
          <span style={{ fontSize: 12 }}>🔒</span>
          <span style={{ fontSize: 11, color: '#A09080' }}>Buka dengan Premium · +45 saham lagi</span>
        </div>
      ) : (
        <>
          <p style={{ fontSize: 12, color: '#5A5050', lineHeight: 1.5, marginBottom: 6 }}>
            {stock.ai_summary_snip}{stock.ai_summary_snip?.length >= 120 ? '…' : ''}
          </p>
          {limitReached ? (
            <p style={{ fontSize: 10, color: '#E08030', fontWeight: 700 }}>
              🔒 Batas analisis gratis hari ini habis
            </p>
          ) : (
            <p style={{ fontSize: 10, color: '#28A060', fontWeight: 700 }}>
              Ketuk untuk analisis lengkap + kuis →
            </p>
          )}
        </>
      )}
    </button>
  )
}

export function Feed() {
  const navigate = useNavigate()
  const [stocks, setStocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [usedCount, setUsedCount] = useState(getUsedCount)

  useEffect(() => {
    const controller = new AbortController()
    fetchStockFeed({ signal: controller.signal })
      .then(setStocks)
      .catch(err => { if (err.name !== 'AbortError') setError(err.message) })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [])

  function handleOpen(stock) {
    if (stock.is_premium) return
    if (usedCount >= FREE_LIMIT) return
    incrementUsed()
    setUsedCount(getUsedCount())
    playNavigate()
    navigate(`/stocks/${stock.code}`)
  }

  const remaining = Math.max(0, FREE_LIMIT - usedCount)

  return (
    <div className="flex min-h-svh flex-col bg-white">

      {/* Header */}
      <div style={{
        padding: '14px 16px 10px',
        borderBottom: '1px solid #F0EDE8',
        background: 'white',
        position: 'sticky', top: 0, zIndex: 20,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 10, color: '#A09080', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              IDX · Hari ini
            </p>
            <p style={{ fontSize: 17, fontWeight: 900, color: '#1A2030', fontFamily: "'Fredoka One',cursive" }}>
              Feed Saham 📈
            </p>
          </div>
          {/* IHSG placeholder */}
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 10, color: '#A09080' }}>IHSG</p>
            <p style={{ fontSize: 13, fontWeight: 800, color: '#20A040' }}>7.284 &nbsp;+0.8%</p>
          </div>
        </div>

        {/* Daily limit bar */}
        <div style={{
          marginTop: 10, background: '#FFFBF0', border: '1px solid #F5D880',
          borderRadius: 10, padding: '6px 12px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 11, color: '#8A6010', fontWeight: 600 }}>
            Analisis gratis tersisa hari ini
          </span>
          <span style={{ fontSize: 12, color: '#8A6010', fontWeight: 800 }}>
            {remaining} / {FREE_LIMIT}
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', paddingBottom: 80, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading && (
          <>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ background: '#F5F3F0', borderRadius: 16, padding: '14px', border: '1.5px solid #EDE8E0', opacity: 0.6 }}>
                <div style={{ height: 12, width: 80, borderRadius: 6, background: '#E0D8D0', marginBottom: 8 }} />
                <div style={{ height: 8, width: '90%', borderRadius: 4, background: '#E0D8D0', marginBottom: 5 }} />
                <div style={{ height: 8, width: '70%', borderRadius: 4, background: '#E0D8D0' }} />
              </div>
            ))}
          </>
        )}

        {error && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#E03040', fontSize: 13 }}>
            Gagal memuat feed. Coba lagi.
          </div>
        )}

        {!loading && !error && stocks.map(stock => (
          <StockCard
            key={stock.code}
            stock={stock}
            usedCount={usedCount}
            onClick={() => handleOpen(stock)}
          />
        ))}
      </div>

      <BottomNav />
    </div>
  )
}
