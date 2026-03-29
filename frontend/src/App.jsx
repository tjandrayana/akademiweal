import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import {
  ensureBackgroundMusicStarted,
  registerBackgroundMusicAutostart,
  stopBackgroundMusic,
} from './lib/backgroundMusic'
import { isMuted } from './lib/sounds'
import { UnauthorizedRedirect } from './UnauthorizedRedirect'
import { trackAppOpen } from './tracking/events'
import { Home } from './pages/Home'
import { Leaderboard } from './pages/Leaderboard'
import { Lesson } from './pages/Lesson'
import { Login } from './pages/Login'
import { Onboarding } from './pages/Onboarding'
import { Profile } from './pages/Profile'
import { Result } from './pages/Result'

/** Redirect / → /onboarding for first-timers, /home for returning users */
function RootRedirect() {
  try {
    if (localStorage.getItem('akademiweal_onboarding_done') === 'true') {
      return <Navigate to="/home" replace />
    }
  } catch {
    /* ignore */
  }
  return <Navigate to="/onboarding" replace />
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
          <Route path="/" element={<RootRedirect />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/lesson" element={<Lesson />} />
          <Route path="/result" element={<Result />} />
        </Routes>
      </div>
    </div>
  )
}
