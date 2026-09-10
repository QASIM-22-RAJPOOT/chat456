import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../api/auth.js'

function Register() {
  const navigate = useNavigate()
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    if (loading) return
    const form = event.currentTarget
    const data = new FormData(event.currentTarget)
    const name = data.get('name').trim()
    const email = data.get('email').trim().toLowerCase()
    const password = data.get('password')
    if (!name || !email || !password.trim()) {
      setMessage('Please fill in all fields.')
      return
    }
    setLoading(true)
    setMessage('')
    try {
      await registerUser({ name, email, password })
      form.reset()
      navigate('/chat', { replace: true })
    } catch (error) {
      setMessage(error.message || 'Unable to reach the backend.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-red-200 px-4">
      <form onSubmit={handleSubmit} onChange={() => setMessage('')} className="w-full max-w-sm space-y-4 rounded-xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold">Register</h1>
        <div>
          <label htmlFor="name" className="mb-1 block">Name</label>
          <input id="name" name="name" type="text" autoComplete="name" required className="w-full rounded border border-gray-300 p-2" />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" required className="w-full rounded border border-gray-300 p-2" />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block">Password</label>
          <input
            id="password" name="password" type="password"
            autoComplete="new-password" minLength={8} maxLength={128} required
            className="w-full rounded border border-gray-300 p-2"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-600 p-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Register'}
        </button>
        {message && <p role="status" className="text-sm text-gray-700">{message}</p>}
        <p className="text-center text-sm">
          Already have an account? <Link to="/login" className="text-blue-600 underline">Login</Link>
        </p>
      </form>
    </main>
  )
}

export default Register
