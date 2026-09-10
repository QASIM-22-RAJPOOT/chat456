import express from 'express'
import authRoutes from './routes/authRoutes.js'

const app = express()

// Read JSON data sent by the frontend.
app.use(express.json())
app.use('/api/auth', authRoutes)

// A basic route to check the backend.
app.get('/', (req, res) => {
  res.json({ message: 'Backend is running' })
})

// Respond when a route does not exist.
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
  })
})

export default app
