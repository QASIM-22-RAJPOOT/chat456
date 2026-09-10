import User from '../models/User.js'
import { hashPassword, verifyPassword } from '../utils/password.js'

const validEmail = (email) => typeof email === 'string' && email.trim().length <= 254
  && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
const validPassword = (password) => typeof password === 'string'
  && password.trim().length > 0 && password.length <= 128
const publicUser = (user) => ({ id: user._id, name: user.name, email: user.email })

export async function register(req, res) {
  const { name, email, password } = req.body ?? {}
  if (typeof name !== 'string' || !name.trim() || name.trim().length > 100
    || !validEmail(email) || !validPassword(password) || password.length < 8) {
    return res.status(400).json({
      message: 'Enter a name (1–100 characters), valid email and password (8–128 characters).',
    })
  }
  try {
    const normalizedEmail = email.trim().toLowerCase()
    if (await User.exists({ email: normalizedEmail })) {
      return res.status(409).json({ message: 'An account with this email already exists.' })
    }
    const passwordHash = await hashPassword(password)
    const user = await User.create({ name: name.trim(), email: normalizedEmail, passwordHash })
    return res.status(201).json({ message: 'Account created. You can now log in.', user: publicUser(user) })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'An account with this email already exists.' })
    }
    return res.status(500).json({ message: 'Unable to create account. Please try again.' })
  }
}

export async function login(req, res) {
  const { email, password } = req.body ?? {}
  if (!validEmail(email) || !validPassword(password)) {
    return res.status(400).json({ message: 'Enter a valid email and password.' })
  }
  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash')
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }
    return res.status(200).json({ message: 'Login successful.', user: publicUser(user) })
  } catch {
    return res.status(500).json({ message: 'Unable to log in. Please try again.' })
  }
}
