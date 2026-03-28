import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * Listens for 401 from api/client and redirects to /login without blocking UI.
 */
export function UnauthorizedRedirect() {
  const navigate = useNavigate()

  useEffect(() => {
    function onUnauthorized() {
      navigate('/login', {
        replace: true,
        state: { reason: 'session', from: { pathname: window.location.pathname } },
      })
    }
    window.addEventListener('api:unauthorized', onUnauthorized)
    return () => window.removeEventListener('api:unauthorized', onUnauthorized)
  }, [navigate])

  return null
}
