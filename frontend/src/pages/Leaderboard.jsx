import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAuthToken } from '../api/client'
import { fetchLeaderboard, fetchMeProgress } from '../api/progress'
import { AppHeader, HeaderHomeIcon, HeaderProfileIcon } from '../components/AppHeader'
import { BottomNav } from '../components/BottomNav'
import { cn } from '../lib/cn'
import { getLevelName } from '../lib/gamification'

function medalForRank(rank) {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return null
}

export function Leaderboard() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [myUserId, setMyUserId] = useState(null)

  const load = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const data = await fetchLeaderboard(50)
      setEntries(Array.isArray(data?.entries) ? data.entries : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat peringkat')
      setEntries([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!getAuthToken()) return
    fetchMeProgress()
      .then((me) => {
        if (me != null && typeof me.user_id === 'number') {
          setMyUserId(me.user_id)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <div className="flex min-h-svh flex-col max-w-md mx-auto bg-bg">
      <AppHeader
        mode="home"
        variant="light"
        left={
          <Link
            to="/home"
            className="flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-primary/10 hover:text-primary"
            aria-label="Beranda"
          >
            <HeaderHomeIcon />
          </Link>
        }
        center={
          <span className="text-[15px] font-extrabold tracking-tight text-text">Peringkat</span>
        }
        right={
          <Link
            to="/profile"
            className="flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-primary/10 hover:text-primary"
            aria-label="Profil"
          >
            <HeaderProfileIcon />
          </Link>
        }
      />

      <div className="flex flex-1 flex-col overflow-y-auto px-4 pb-24 pt-3">
        <p className="m-0 mb-3 text-center text-xs font-semibold leading-relaxed text-muted">
          Berdasarkan total XP tersimpan di server. Main tanpa login tidak masuk papan.
        </p>

        {loading ? (
          <p className="m-0 py-8 text-center text-sm font-semibold text-muted" role="status">
            Memuat papan peringkat…
          </p>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <p className="m-0 text-sm font-semibold text-error">{error}</p>
            <button
              type="button"
              onClick={() => load()}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-extrabold text-white"
            >
              Coba lagi
            </button>
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <span className="text-5xl" aria-hidden="true">
              🏆
            </span>
            <p className="m-0 text-sm font-extrabold text-text">Belum ada data peringkat</p>
            <p className="m-0 text-xs text-muted leading-relaxed">
              Selesaikan pelajaran dan sinkronkan XP (masuk dengan email) untuk muncul di sini.
            </p>
          </div>
        ) : (
          <ul className="m-0 list-none space-y-2 p-0">
            {entries.map((row) => {
              const medal = medalForRank(row.rank)
              const mine = myUserId != null && row.user_id === myUserId
              return (
                <li key={`${row.user_id}-${row.rank}`}>
                  <div
                    className={cn(
                      'flex items-center gap-3 rounded-2xl border bg-white px-3 py-3 shadow-sm',
                      mine ? 'border-primary ring-2 ring-primary/25' : 'border-gray-100',
                    )}
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-lg font-extrabold text-text"
                      aria-hidden={medal != null}
                    >
                      {medal ?? row.rank}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="m-0 truncate text-sm font-extrabold text-text">{row.label}</p>
                      <p className="m-0 mt-0.5 text-[11px] font-semibold text-muted">
                        {getLevelName(row.xp)} · {row.xp.toLocaleString()} XP
                      </p>
                    </div>
                    {mine ? (
                      <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-extrabold text-primary">
                        Kamu
                      </span>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
