import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['user', 'admin', 'dermatologist'], 
    default: 'user',
    required: true
  },
  profileCompleted: { type: Boolean, default: false },
  lastLogin: { type: Date },
  isActive: { type: Boolean, default: true }
}, { timestamps: true })

// Index for efficient role-based queries
UserSchema.index({ role: 1 })
UserSchema.index({ email: 1 }, { unique: true })

export default mongoose.model('User', UserSchema)