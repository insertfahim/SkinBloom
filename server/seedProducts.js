import mongoose from 'mongoose'
import Product from './models/Product.js'

const MONGO_URI = 'mongodb+srv://skinbloomUser:sKin123bLoom@cluster0.xif9ar7.mongodb.net/skinbloom'

const sampleProducts = [
  {
    name: "Axis-Y Dark Spot Correcting Glow Serum",
    brand: "Axis-Y",
    category: "Serum",
    ingredients: ["Niacinamide", "Vitamin C", "Rice Bran", "Willow Bark"],
    skinTypeSuitability: ["oily", "combination", "normal"],
    price: 1299,
    description: "A brightening serum that targets dark spots and uneven skin tone with 5% Niacinamide.",
    rating: 4.5,
    reviewCount: 324
  },
  {
    name: "The Ordinary Niacinamide 10% + Zinc 1%",
    brand: "The Ordinary",
    category: "Serum",
    ingredients: ["Niacinamide", "Zinc PCA", "Hyaluronic Acid"],
    skinTypeSuitability: ["oily", "combination", "sensitive"],
    price: 699,
    description: "High-strength niacinamide serum to reduce appearance of skin blemishes and congestion.",
    rating: 4.3,
    reviewCount: 892
  },
  {
    name: "CeraVe Foaming Facial Cleanser",
    brand: "CeraVe",
    category: "Cleanser",
    ingredients: ["Ceramides", "Hyaluronic Acid", "Niacinamide"],
    skinTypeSuitability: ["normal", "oily"],
    price: 949,
    description: "Gentle foaming cleanser that removes excess oil without disrupting the skin barrier.",
    rating: 4.6,
    reviewCount: 567
  },
  {
    name: "La Roche-Posay Anthelios Sunscreen SPF 60",
    brand: "La Roche-Posay",
    category: "Sunscreen",
    ingredients: ["Zinc Oxide", "Titanium Dioxide", "Antioxidants"],
    skinTypeSuitability: ["all", "sensitive"],
    price: 1599,
    description: "Broad-spectrum SPF 60 sunscreen with antioxidant protection for sensitive skin.",
    rating: 4.7,
    reviewCount: 423
  },
  {
    name: "Neutrogena Hydra Boost Water Gel",
    brand: "Neutrogena",
    category: "Moisturizer",
    ingredients: ["Hyaluronic Acid", "Olive Extract", "Glycerin"],
    skinTypeSuitability: ["dry", "normal", "combination"],
    price: 799,
    description: "Lightweight water gel moisturizer that provides 72-hour hydration.",
    rating: 4.2,
    reviewCount: 256
  },
  {
    name: "Paula's Choice 2% BHA Liquid Exfoliant",
    brand: "Paula's Choice",
    category: "Toner",
    ingredients: ["Salicylic Acid", "Green Tea Extract"],
    skinTypeSuitability: ["oily", "combination"],
    price: 2399,
    description: "Gentle BHA exfoliant that unclogs pores and smooths wrinkles.",
    rating: 4.8,
    reviewCount: 1203
  },
  {
    name: "Innisfree Super Volcanic Pore Clay Mask",
    brand: "Innisfree",
    category: "Mask",
    ingredients: ["Volcanic Ash", "Bentonite Clay"],
    skinTypeSuitability: ["oily", "combination"],
    price: 1099,
    description: "Deep-cleansing clay mask with Jeju volcanic ash to control sebum.",
    rating: 4.4,
    reviewCount: 189
  },
  {
    name: "Minimalist Vitamin C 10% Face Serum",
    brand: "Minimalist",
    category: "Serum",
    ingredients: ["L-Ascorbic Acid", "Vitamin E", "Ferulic Acid"],
    skinTypeSuitability: ["normal", "dry", "combination"],
    price: 599,
    description: "Stable Vitamin C serum for brightening and anti-aging benefits.",
    rating: 4.1,
    reviewCount: 445
  },
  {
    name: "Cetaphil Gentle Skin Cleanser",
    brand: "Cetaphil",
    category: "Cleanser",
    ingredients: ["Glycerin", "Cetyl Alcohol", "Sodium Lauryl Sulfate"],
    skinTypeSuitability: ["sensitive", "dry", "normal"],
    price: 449,
    description: "Mild, non-irritating cleanser suitable for sensitive and dry skin types.",
    rating: 4.5,
    reviewCount: 678
  },
  {
    name: "Olay Regenerist Micro-Sculpting Cream",
    brand: "Olay",
    category: "Moisturizer",
    ingredients: ["Niacinamide", "Peptides", "Hyaluronic Acid"],
    skinTypeSuitability: ["normal", "dry", "combination"],
    price: 1899,
    description: "Anti-aging moisturizer with amino-peptides and niacinamide for firmer skin.",
    rating: 4.3,
    reviewCount: 234
  }
]

async function seedProducts() {
  try {
    await mongoose.connect(MONGO_URI)
    console.log('✅ Connected to MongoDB')
    
    // Clear existing products
    await Product.deleteMany({})
    console.log('🧹 Cleared existing products')
    
    // Insert sample products
    const products = await Product.insertMany(sampleProducts)
    console.log(`🌱 Seeded ${products.length} products`)
    
    console.log('Sample products:')
    products.forEach(p => {
      console.log(`- ${p.name} by ${p.brand} (${p.category}) - ₹${p.price}`)
    })
    
    mongoose.disconnect()
    console.log('✅ Database seeding completed!')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

seedProducts()
