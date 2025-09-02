import mongoose from 'mongoose'

const WishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    externalProductId: String, // For external API products
    productSource: {
      type: String,
      enum: ['local', 'makeup-api', 'sephora', 'ulta', 'dummy-api'],
      default: 'local'
    },
    productData: {
      name: String,
      brand: String,
      category: String,
      price: Number,
      image: String,
      externalUrl: String
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    priceAlert: {
      enabled: {
        type: Boolean,
        default: false
      },
      targetPrice: Number,
      currentPrice: Number,
      lastChecked: Date
    }
  }],
  
  // Wishlist metadata
  isPublic: {
    type: Boolean,
    default: false
  },
  name: {
    type: String,
    default: 'My Wishlist'
  },
  description: String
}, { 
  timestamps: true 
})

// Index for faster queries
WishlistSchema.index({ user: 1 })
WishlistSchema.index({ 'products.productId': 1 })
WishlistSchema.index({ 'products.externalProductId': 1 })

export default mongoose.model('Wishlist', WishlistSchema)
