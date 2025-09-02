import mongoose from 'mongoose'

const ComparisonSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    default: 'Product Comparison'
  },
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    externalProductId: String,
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
      rating: Number,
      reviewCount: Number,
      ingredients: [String],
      skinTypeSuitability: [String],
      description: String,
      externalUrl: String
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Comparison settings
  compareFields: [{
    type: String,
    enum: ['price', 'rating', 'ingredients', 'skinTypeSuitability', 'brand', 'reviewCount'],
    default: ['price', 'rating', 'ingredients']
  }],
  
  isPublic: {
    type: Boolean,
    default: false
  },
  
  // Share settings
  shareToken: String,
  sharedAt: Date
}, { 
  timestamps: true 
})

// Index for faster queries
ComparisonSchema.index({ user: 1 })
ComparisonSchema.index({ shareToken: 1 })

export default mongoose.model('Comparison', ComparisonSchema)
