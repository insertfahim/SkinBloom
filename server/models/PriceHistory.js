import mongoose from 'mongoose'

const PriceHistorySchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  externalProductId: String,
  productSource: {
    type: String,
    enum: ['local', 'makeup-api', 'sephora', 'ulta', 'dummy-api'],
    required: true
  },
  
  // Product identification
  productName: String,
  productBrand: String,
  
  // Price tracking
  priceHistory: [{
    price: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    },
    source: String, // Which API/store
    recordedAt: {
      type: Date,
      default: Date.now
    },
    isOnSale: {
      type: Boolean,
      default: false
    },
    originalPrice: Number,
    discount: Number // Percentage
  }],
  
  // Current pricing
  currentPrice: Number,
  lowestPrice: Number,
  highestPrice: Number,
  averagePrice: Number,
  
  // Price alerts
  priceAlerts: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    targetPrice: Number,
    alertType: {
      type: String,
      enum: ['below', 'above', 'drop_percent'],
      default: 'below'
    },
    threshold: Number, // For percentage drops
    isActive: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    lastTriggered: Date
  }],
  
  // Tracking metadata
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  updateFrequency: {
    type: String,
    enum: ['hourly', 'daily', 'weekly'],
    default: 'daily'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true 
})

// Indexes for performance
PriceHistorySchema.index({ productId: 1 })
PriceHistorySchema.index({ externalProductId: 1, productSource: 1 })
PriceHistorySchema.index({ lastUpdated: 1 })
PriceHistorySchema.index({ 'priceAlerts.userId': 1 })

// Update price statistics before saving
PriceHistorySchema.pre('save', function(next) {
  if (this.priceHistory && this.priceHistory.length > 0) {
    const prices = this.priceHistory.map(p => p.price)
    this.lowestPrice = Math.min(...prices)
    this.highestPrice = Math.max(...prices)
    this.averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length
    this.currentPrice = prices[prices.length - 1] // Most recent price
  }
  next()
})

export default mongoose.model('PriceHistory', PriceHistorySchema)
