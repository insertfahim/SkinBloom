import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import User from './models/User.js'

dotenv.config()

async function createSimpleTestUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ Connected to MongoDB')

    // Delete existing test user
    await User.deleteOne({ email: 'simpletest@test.com' })

    // Create test user with simple password
    const hashedPassword = await bcrypt.hash('123', 10)
    const testUser = await User.create({
      name: 'Simple Test User',
      email: 'simpletest@test.com',
      password: hashedPassword,
      role: 'user'
    })

    console.log('✅ Simple test user created successfully:', testUser.email)
    console.log('📧 Email: simpletest@test.com')
    console.log('🔑 Password: 123')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error creating test user:', error)
    process.exit(1)
  }
}

createSimpleTestUser()
