import { apiPost, setAuthToken } from './client'

/**
 * POST /login with email only; stores JWT in localStorage on success.
 * @param {string} email
 * @returns {Promise<string>} token
 */
export async function loginWithEmail(email) {
  const data = await apiPost('/login', { email }, { skipAuth: true })
  if (!data || typeof data.token !== 'string') {
    throw new Error('Invalid login response')
  }
  setAuthToken(data.token)
  return data.token
}
