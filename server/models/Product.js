import mongoose from 'mongoose'

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: String,
  category: String, // Cleanser, Serum, Moisturizer, etc.
  ingredients: [String],
  skinTypeSuitability: [String], // e.g. ['oily','dry']
  price: { type: Number, default: 0 },
  image: String,
  description: String,
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 }
}, { timestamps: true })

export default mongoose.model('Product', ProductSchema)