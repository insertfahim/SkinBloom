import mongoose from 'mongoose'

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: String,
  category: { 
    type: String,
    enum: [
      // Skincare Categories
      'Cleanser', 'Moisturizer', 'Serum', 'Sunscreen', 'Toner', 'Face Mask', 'Eye Cream', 'Lip Care',
      'Face Oil', 'Exfoliant', 'Treatment', 'Essence', 'Mist', 'Spot Treatment', 'Night Cream', 'Day Cream',
      'Anti-Aging', 'Hydrating', 'Brightening', 'Acne Treatment',
      
      // Makeup Categories  
      'Foundation', 'Concealer', 'Powder', 'Blush', 'Bronzer', 'Highlighter',
      'Eyeshadow', 'Mascara', 'Eyeliner', 'Eyebrow', 'Lipstick', 'Lip Gloss', 'Lip Liner',
      'Setting Spray', 'Primer',
      
      // Body Care Categories
      'Body Lotion', 'Body Wash', 'Body Oil', 'Hand Cream', 'Foot Care', 'Deodorant',
      'Body Scrub', 'Body Mist',
      
      // Hair Care Categories
      'Shampoo', 'Conditioner', 'Hair Mask', 'Hair Oil', 'Hair Serum', 'Styling Products',
      
      // Tools Categories
      'Brushes', 'Sponges', 'Tools', 'Accessories',
      
      // Other
      'Other'
    ],
    default: 'Other'
  },
  
  // Basic product info
  description: String,
  briefDescription: String,
  ingredients: [String],
  keyBenefits: [String],
  howToUse: [String],
  
  // Pricing (in Bangladeshi Taka)
  price: { type: Number, default: 0 },
  originalPrice: Number, // For discount calculation
  currency: { type: String, default: 'BDT' },
  discount: Number, // Percentage
  
  // Images
  image: String, // Main product image
  images: [String], // Multiple product images
  
  // Product details
  size: String, // e.g., "30ml", "236ml"
  weight: String, // e.g., "35g", "250g"
  skinType: [String], // e.g., ['All skin types', 'Oily skin']
  concerns: [String], // e.g., ['Acne', 'Blemishes', 'Large pores']
  
  // Rating and reviews
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  
  // Stock management
  stockQuantity: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  
  // Product links
  productLink: String, // External product page
  
  // Tags and metadata
  tags: [String], // e.g., ['bestseller', 'vegan', 'cruelty-free']
  source: { type: String, default: 'local' }, // 'local', 'makeup-api', 'sephora', etc.
  
  // SEO fields
  seoTitle: String,
  seoDescription: String,
  seoKeywords: [String],
  slug: String,
  
  // Admin fields
  adminNotes: String,
  
  // Legacy fields for compatibility
  skinTypeSuitability: [String], // Deprecated, use skinType instead
  isAvailable: { type: Boolean, default: true },
  
  // Fields for imported products
  importedFrom: String,
  originalExternalId: String,
  originalUrl: String,
  externalId: String
}, { timestamps: true })

// Index for better search performance
ProductSchema.index({ name: 'text', brand: 'text', description: 'text', tags: 'text' })
ProductSchema.index({ category: 1 })
ProductSchema.index({ skinTypeSuitability: 1 })
ProductSchema.index({ price: 1 })
ProductSchema.index({ rating: -1 })
ProductSchema.index({ featuredProduct: 1 })
ProductSchema.index({ isActive: 1, isAvailable: 1 })
ProductSchema.index({ slug: 1 }, { unique: true, sparse: true })

// Generate slug before saving
ProductSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }
  next()
})

export default mongoose.model('Product', ProductSchema)