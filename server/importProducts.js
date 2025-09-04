import mongoose from 'mongoose'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import Product from './models/Product.js'

// Load environment variables
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err))

async function importProducts() {
  try {
    // Read and parse CSV file
    const csvPath = path.join(__dirname, '..', 'products_60.csv')
    const csvContent = fs.readFileSync(csvPath, 'utf8')
    
    // Split by lines and remove header
    const lines = csvContent.trim().split('\n')
    const header = lines[0].split(',')
    const dataLines = lines.slice(1)
    
    console.log(`📁 Found ${dataLines.length} products in CSV`)
    
    // Clear existing products
    await Product.deleteMany({})
    console.log('🗑️ Cleared existing products')
    
    const products = []
    
    dataLines.forEach((line, index) => {
      try {
        // Handle CSV parsing with potential commas in quoted fields
        const values = []
        let current = ''
        let inQuotes = false
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i]
          if (char === '"') {
            inQuotes = !inQuotes
          } else if (char === ',' && !inQuotes) {
            values.push(current.trim())
            current = ''
          } else {
            current += char
          }
        }
        values.push(current.trim()) // Don't forget the last value
        
        if (values.length >= 8) {
          const [name, brand, category, skinType, description, step, popular, image] = values
          
          const product = {
            name: name.replace(/"/g, ''),
            brand: brand.replace(/"/g, ''),
            category: category.replace(/"/g, ''),
            skinType: skinType.replace(/"/g, '').split(';').map(s => s.trim()),
            description: description.replace(/"/g, ''),
            step: parseInt(step) || 1,
            popular: popular.toLowerCase().includes('true'),
            image: generateProductImage(name.replace(/"/g, ''), category.replace(/"/g, '')),
            price: Math.floor(Math.random() * 80) + 20, // Random price 20-100
            originalPrice: Math.floor(Math.random() * 100) + 60, // Higher original price for discounts
            rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // Random rating 3.0-5.0
            reviewCount: Math.floor(Math.random() * 500) + 10,
            ingredients: generateIngredients(category.replace(/"/g, '')),
            benefits: generateBenefits(category.replace(/"/g, '')),
            howToUse: generateHowToUse(category.replace(/"/g, '')),
            inStock: true,
            stockQuantity: Math.floor(Math.random() * 50) + 10,
            featured: Math.random() < 0.2, // 20% chance to be featured
            discount: Math.random() < 0.3 ? Math.floor(Math.random() * 30) + 10 : 0 // 30% chance of discount
          }
          
          products.push(product)
        }
      } catch (err) {
        console.warn(`⚠️ Error parsing line ${index + 1}:`, err.message)
      }
    })
    
    // Insert products
    const inserted = await Product.insertMany(products)
    console.log(`✅ Successfully imported ${inserted.length} products`)
    
    // Show sample products
    console.log('\n📦 Sample products:')
    inserted.slice(0, 3).forEach(p => {
      console.log(`- ${p.name} (${p.brand}) - $${p.price}`)
    })
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Import error:', error)
    process.exit(1)
  }
}

function generateProductImage(productName, category) {
  // Generate a placeholder image URL based on product
  const cleanName = productName.toLowerCase().replace(/[^a-z0-9]/g, '-')
  const categoryMap = {
    'Cleanser': 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop',
    'Toner': 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop',
    'Serum': 'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=400&h=400&fit=crop',
    'Treatment': 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&h=400&fit=crop',
    'Moisturizer': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop',
    'Sunscreen': 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=400&h=400&fit=crop'
  }
  
  return categoryMap[category] || 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop'
}

function generateIngredients(category) {
  const ingredientsByCategory = {
    'Cleanser': ['Water', 'Sodium Lauryl Sulfate', 'Glycerin', 'Cocamidopropyl Betaine', 'Salicylic Acid'],
    'Toner': ['Water', 'Alcohol Denat', 'Glycolic Acid', 'Niacinamide', 'Witch Hazel'],
    'Serum': ['Water', 'Hyaluronic Acid', 'Vitamin C', 'Niacinamide', 'Retinol'],
    'Treatment': ['Water', 'Benzoyl Peroxide', 'Salicylic Acid', 'Retinol', 'Azelaic Acid'],
    'Moisturizer': ['Water', 'Glycerin', 'Ceramides', 'Hyaluronic Acid', 'Dimethicone'],
    'Sunscreen': ['Zinc Oxide', 'Titanium Dioxide', 'Octinoxate', 'Avobenzone', 'Water']
  }
  
  const baseIngredients = ingredientsByCategory[category] || ['Water', 'Glycerin', 'Dimethicone']
  return baseIngredients.slice(0, 5)
}

function generateBenefits(category) {
  const benefitsByCategory = {
    'Cleanser': ['Removes impurities', 'Gentle on skin', 'Maintains pH balance', 'Deep cleansing'],
    'Toner': ['Balances pH', 'Minimizes pores', 'Removes residue', 'Preps skin'],
    'Serum': ['Hydrates deeply', 'Anti-aging', 'Brightening', 'Targets concerns'],
    'Treatment': ['Acne fighting', 'Exfoliating', 'Anti-inflammatory', 'Skin renewal'],
    'Moisturizer': ['Hydrates skin', 'Locks in moisture', 'Softens skin', 'Barrier protection'],
    'Sunscreen': ['UV protection', 'Prevents sun damage', 'Anti-aging', 'Broad spectrum']
  }
  
  return benefitsByCategory[category] || ['Improves skin health', 'Gentle formula', 'Dermatologist tested']
}

function generateHowToUse(category) {
  const usageByCategory = {
    'Cleanser': 'Apply to damp skin, gently massage, rinse with lukewarm water. Use morning and evening.',
    'Toner': 'Apply to clean skin with cotton pad or pat gently with hands. Follow with serum or moisturizer.',
    'Serum': 'Apply 2-3 drops to clean skin. Gently pat and allow to absorb before next step.',
    'Treatment': 'Apply a thin layer to affected areas. Start with 2-3 times per week, increase as tolerated.',
    'Moisturizer': 'Apply to clean skin morning and evening. Massage gently until fully absorbed.',
    'Sunscreen': 'Apply generously 15 minutes before sun exposure. Reapply every 2 hours.'
  }
  
  return usageByCategory[category] || 'Follow package instructions for best results.'
}

importProducts()
