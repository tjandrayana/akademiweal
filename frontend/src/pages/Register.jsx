import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getAuthToken } from '../api/client'
import { registerWithEmail } from '../api/auth'
import { navigateAfterAuth } from '../lib/progressScope'
import { Button } from '../components/Button'
import { TextField } from '../components/TextField'

export function Register() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const guestLimit = location.state?.reason === 'guest_limit'

  useEffect(() => {
    if (getAuthToken()) {
      navigateAfterAuth(navigate, location)
    }
  }, [navigate, location])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setError('Masukkan email kamu')
      return
    }
    if (!password) {
      setError('Buat kata sandi (minimal 8 karakter)')
      return
    }
    if (password.length < 8) {
      setError('Kata sandi minimal 8 karakter')
      return
    }
    if (password !== confirm) {
      setError('Konfirmasi kata sandi tidak cocok')
      return
    }
    setLoading(true)
    try {
      await registerWithEmail(trimmedEmail, password)
      navigateAfterAuth(navigate, location)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Pendaftaran gagal. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-[#F9FAFB] px-4 py-8">
      <div className="mb-6 text-center">
        <p className="m-0 text-2xl font-extrabold text-primary">🎯 AkademiWeal</p>
        <p className="m-0 mt-1 text-sm text-muted">Buat akun untuk simpan progres & peringkat</p>
      </div>

      <div className="w-full max-w-sm rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
        <header className="mb-5">
          <h1 className="m-0 text-xl font-extrabold leading-tight tracking-tight text-text">
            Daftar
          </h1>
          <p className="m-0 mt-1 text-sm text-muted">Gunakan email aktif dan kata sandi yang kuat</p>
        </header>

        {guestLimit ? (
          <p className="m-0 mb-4 text-sm font-semibold text-primary" role="status">
            Progres percobaanmu akan ikut tersimpan ke akun setelah daftar.
          </p>
        ) : null}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          <TextField
            id="register-email"
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
          <TextField
            id="register-password"
            name="password"
            type="password"
            label="Kata sandi"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            placeholder="Minimal 8 karakter"
            autoComplete="new-password"
          />
          <TextField
            id="register-password-confirm"
            name="confirm"
            type="password"
            label="Konfirmasi kata sandi"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            disabled={loading}
            placeholder="Ulangi kata sandi"
            autoComplete="new-password"
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
            {loading ? 'Memproses…' : 'Buat akun'}
          </Button>
        </form>
      </div>

      <p className="m-0 mt-5 text-center text-sm text-muted">
        Sudah punya akun?{' '}
        <Link
          className="font-bold text-primary no-underline hover:underline"
          to="/login"
          state={location.state}
        >
          Masuk
        </Link>
      </p>
    </div>
  )
}
