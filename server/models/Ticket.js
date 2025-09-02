import mongoose from 'mongoose'

const TicketSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  concern: String,
  photoUrl: String,
  status: { type: String, enum:['open','answered','closed'], default: 'open' },
  answer: String,
  answeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true })

export default mongoose.model('Ticket', TicketSchema)