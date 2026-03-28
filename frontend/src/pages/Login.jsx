import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { loginWithEmail } from '../api/auth'
import { Button } from '../components/Button'
import { TextField } from '../components/TextField'

export function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const sessionExpired = location.state?.reason === 'session'

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    const trimmed = email.trim()
    if (!trimmed) {
      setError('Masukkan email kamu')
      return
    }
    setLoading(true)
    try {
      await loginWithEmail(trimmed)
      const fromPath = location.state?.from?.pathname
      const to = fromPath && fromPath !== '/login' ? fromPath : '/home'
      navigate(to, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login gagal. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-[#F9FAFB] px-4 py-8">
      {/* App logo */}
      <div className="mb-6 text-center">
        <p className="m-0 text-2xl font-extrabold text-primary">🎯 AkademiWeal</p>
        <p className="m-0 mt-1 text-sm text-muted">Platform belajar investasi #1</p>
      </div>

      {/* Login card */}
      <div className="w-full max-w-sm rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
        <header className="mb-5">
          <h1 className="m-0 text-xl font-extrabold leading-tight tracking-tight text-text">
            Masuk ke akun
          </h1>
          <p className="m-0 mt-1 text-sm text-muted">Masukkan email kamu untuk melanjutkan</p>
        </header>

        {sessionExpired ? (
          <p className="m-0 mb-4 text-sm font-semibold text-error" role="status">
            Sesi berakhir. Silakan masuk kembali.
          </p>
        ) : null}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          <TextField
            id="login-email"
            name="email"
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            placeholder="kamu@contoh.com"
            autoComplete="email"
            inputMode="email"
          />

          {error ? (
            <p className="m-0 text-sm font-semibold text-error" role="alert">
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            variant="primary"
            className="w-full font-bold"
            disabled={loading}
          >
            {loading ? 'Memproses…' : 'Lanjut →'}
          </Button>
        </form>
      </div>

      {/* Footer link */}
      <p className="m-0 mt-5 text-center text-sm text-muted">
        Belum punya akun?{' '}
        <Link
          className="font-bold text-primary no-underline hover:underline"
          to="/onboarding"
        >
          Mulai di sini
        </Link>
      </p>
    </div>
  )
}
