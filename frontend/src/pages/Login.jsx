import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser } from '../api/auth.js'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    if (loading) return
    if (!email.trim() || !password) {
      setMessage('Please enter your email and password.')
      return
    }
    setLoading(true)
    setMessage('')
    try {
      await loginUser({ email: email.trim().toLowerCase(), password })
      setPassword('')
      navigate('/chat', { replace: true })
    } catch (error) {
      setMessage(error.message || 'Unable to reach the backend.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-red-100 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold">Login</h1>
        <div>
          <label htmlFor="email" className="mb-1 block">Email</label>
          <input
            id="email" name="email" type="email" autoComplete="email" required
            value={email} onChange={(event) => { setEmail(event.target.value); setMessage('') }}
            className="w-full rounded border border-gray-300 p-2"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block">Password</label>
          <input
            id="password" name="password" autoComplete="current-password" required
            type={showPassword ? 'text' : 'password'}
            value={password} onChange={(event) => { setPassword(event.target.value); setMessage('') }}
            className="w-full rounded border border-gray-300 p-2"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-controls="password"
            aria-pressed={showPassword}
            className="mt-2 text-sm text-blue-600 underline"
          >
            {showPassword ? 'Hide password' : 'Show password'}
          </button>
        </div>
        <button type="submit" disabled={loading} className="w-full rounded bg-blue-600 p-2 text-white hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Logging in...' : 'Login'}
        </button>
        {message && <p role="status" className="text-sm text-gray-700">{message}</p>}
        <p className="text-center text-sm">
          Don't have an account? <Link to="/register" className="text-blue-600 underline">Register</Link>
        </p>
      </form>
    </main>
  )
}

export default Login
