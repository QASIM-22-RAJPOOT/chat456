import app from './app.js'
import dotenv from 'dotenv'
import connectDB from './db.js'

dotenv.config({ path: new URL('./.env', import.meta.url), quiet: true })

const PORT = process.env.PORT || 5000

try {
  await connectDB()
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
  })
} catch (error) {
  console.error(error.code === 'MISSING_MONGODB_URI'
    ? 'Startup failed: MONGODB_URI is empty. Add your MongoDB connection string to backend/.env.'
    : 'Startup failed. Check backend/.env, MongoDB credentials and network access.')
  process.exitCode = 1
}
