import mongoose from 'mongoose'
import User from './models/User.js'

export default async function connectDB() {
  const uri = process.env.MONGODB_URI?.trim()
  if (!uri) {
    const error = new Error('Set MONGODB_URI in backend/.env')
    error.code = 'MISSING_MONGODB_URI'
    throw error
  }
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 })
  await User.init()
  console.log('MongoDB connected')
}
