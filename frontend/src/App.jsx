import { useEffect } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import {
  ensureBackgroundMusicStarted,
  registerBackgroundMusicAutostart,
  stopBackgroundMusic,
} from './lib/backgroundMusic'
import { isMuted } from './lib/sounds'
import { UnauthorizedRedirect } from './UnauthorizedRedirect'
import { trackAppOpen } from './tracking/events'
import { getAuthToken } from './api/client'
import { GUEST_UNLOCK_PATH } from './lib/guestGate'
import { getUserIdFromToken, storageKey } from './lib/progressScope'
import { Home } from './pages/Home'
import { Leaderboard } from './pages/Leaderboard'
import { Lesson } from './pages/Lesson'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { GuestUnlock } from './pages/GuestUnlock'
import { Onboarding } from './pages/Onboarding'
import { Pelajaran } from './pages/Pelajaran'
import { Profile } from './pages/Profile'
import { Result } from './pages/Result'

/** Logged-in: onboarding vs home. Guest: go straight to home (try before sign-in). */
function RootRedirect() {
  const token = getAuthToken()
  const uid = getUserIdFromToken(token)
  if (!token || uid == null) {
    return <Navigate to="/home" replace />
  }
  try {
    if (localStorage.getItem(storageKey('onboarding_done')) === 'true') {
      return <Navigate to="/home" replace />
    }
  } catch {
    /* ignore */
  }
  return <Navigate to="/onboarding" replace />
}

function RequireAuth() {
  const loc = useLocation()
  const token = getAuthToken()
  const uid = getUserIdFromToken(token)
  if (!token || uid == null) {
    return <Navigate to="/login" replace state={{ from: loc }} />
  }
  return <Outlet />
}

/** Pause BGM during lesson / result; resume on other routes when unmuted. */
function BackgroundMusicRouteSync() {
  const { pathname } = useLocation()
  useEffect(() => {
    const lessonLike = pathname === '/lesson' || pathname === '/result'
    if (lessonLike) stopBackgroundMusic()
    else if (!isMuted()) ensureBackgroundMusicStarted()
  }, [pathname])
  return null
}

export default function App() {
  useEffect(() => {
    trackAppOpen()
    return registerBackgroundMusicAutostart()
  }, [])

  return (
    <div className="min-h-svh bg-gradient-to-br from-primary-light via-white to-primary-light">
      <div className="relative mx-auto min-h-svh w-full max-w-md bg-bg sm:shadow-[0_0_80px_rgba(0,0,0,0.10)] sm:ring-1 sm:ring-black/[0.04]">
        <BackgroundMusicRouteSync />
        <UnauthorizedRedirect />
        <Routes>
          <Route path={GUEST_UNLOCK_PATH} element={<GuestUnlock />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<RootRedirect />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/home" element={<Home />} />
          <Route path="/pelajaran" element={<Pelajaran />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/lesson" element={<Lesson />} />
          <Route path="/result" element={<Result />} />
          <Route element={<RequireAuth />}>
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </div>
    </div>
  )
}
