import fs from 'fs'
import path from 'path'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Product from './models/Product.js'

dotenv.config()

// Map incoming CSV categories to schema enum values
const CATEGORY_MAP = {
  'Cleanser': 'Cleanser',
  'Toner': 'Toner',
  'Serum': 'Serum',
  'Treatment': 'Treatment',
  'Moisturizer': 'Moisturizer',
  'Sunscreen': 'Sunscreen',
  'Mask': 'Face Mask',
  'Exfoliant': 'Exfoliant',
  'Eye': 'Eye Cream',
  'Lip': 'Lip Care',
  'Essence': 'Essence',
  'Body': 'Body Lotion',
  'Spot Treatment': 'Spot Treatment',
  'Oil': 'Face Oil'
}

function mapCategory(raw) {
  if(!raw) return 'Other'
  // exact match
  if (CATEGORY_MAP[raw]) return CATEGORY_MAP[raw]
  // attempt partial
  const key = Object.keys(CATEGORY_MAP).find(k => raw.toLowerCase().includes(k.toLowerCase()))
  return key ? CATEGORY_MAP[key] : 'Other'
}

function parseBool(v){
  if(typeof v !== 'string') return false
  return ['true','yes','1','y'].includes(v.trim().toLowerCase())
}

// Add helper to connect with retry
async function connectWithRetry(uri, attempts = 3){
  for(let i=1;i<=attempts;i++){
    try{
      if(mongoose.connection.readyState === 1){
        console.log('ℹ️ Reusing existing MongoDB connection')
        return
      }
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 })
      console.log('✅ Connected to MongoDB')
      return
    }catch(err){
      console.warn(`⚠️ Mongo connect attempt ${i} failed: ${err.code || err.message}`)
      if(i === attempts){
        console.error('❌ Could not connect to MongoDB. If SRV lookup fails, ensure DNS works or try replacing the connection string with a direct host form like:\n mongodb+srv://<user>:<pass>@cluster0.xif9ar7.mongodb.net/skinbloom?retryWrites=true&w=majority')
        throw err
      }
      await new Promise(r=>setTimeout(r, 2000))
    }
  }
}

async function run(){
  const csvPath = path.resolve(process.cwd(), '..', 'products_60.csv')
  if(!fs.existsSync(csvPath)){
    console.error('CSV file not found at', csvPath)
    process.exit(1)
  }
  await connectWithRetry(process.env.MONGO_URI)
  console.log('✅ Connected to MongoDB')

  const content = fs.readFileSync(csvPath,'utf8')
  const lines = content.split(/\r?\n/).filter(l=>l.trim())
  const header = lines.shift().split(',')

  const products = []
  for(const line of lines){
    // Handle quoted commas by simple split unless complexity grows
    const parts = line.match(/(")([^"]*)(")|[^,]+/g)?.map(p=> p.replace(/^"|"$/g,'').trim()) || []
    if(parts.length < 8) continue
    const [name, brand, category, skinType, description, step, popular, image] = parts

    const skinTypes = skinType.split(/;|\//).map(s=>s.trim()).filter(Boolean)

    products.push({
      name,
      brand,
      category: mapCategory(category),
      description,
      briefDescription: description,
      image: image && image.startsWith('http') ? image : undefined,
      images: image && image.startsWith('http') ? [image] : [],
      skinType: skinTypes,
      skinTypeSuitability: skinTypes,
      tags: [ `step-${step}`, ...(parseBool(popular) ? ['popular'] : []) ],
  // price fields filled later
  price: 0,
  originalPrice: 0,
      currency: 'BDT',
      source: 'csv-import'
    })
  }

  console.log(`Parsed ${products.length} products from CSV`)

  function generatePrice(p){
    const c = p.category || ''
    const brand = (p.brand || '').toLowerCase()
    const premiumBrands = ['estee', 'la roche', 'murad', 'tatcha', 'drunk elephant', 'shiseido', 'kiehl', 'skin', 'sunday riley']
    const isPremium = premiumBrands.some(b => brand.includes(b))
    function rand(min,max){ return Math.round(Math.random() * (max-min) + min) }
    let priceRange
    if(c === 'Cleanser') priceRange = [800, 1800]
    else if(c === 'Toner' || c === 'Essence') priceRange = [1000, 2000]
    else if(c === 'Serum' || c === 'Treatment' || c === 'Spot Treatment') priceRange = isPremium ? [2500, 5200] : [1500, 3800]
    else if(c === 'Moisturizer' || c === 'Face Mask') priceRange = [1200, 3500]
    else if(c === 'Sunscreen') priceRange = [900, 2800]
    else if(c === 'Exfoliant') priceRange = [900, 2500]
    else if(c === 'Eye Cream') priceRange = [1500, 3500]
    else if(c === 'Lip Care') priceRange = [300, 1200]
    else if(c === 'Body Lotion') priceRange = [800, 1800]
    else if(c === 'Face Oil') priceRange = [1800, 4000]
    else priceRange = [1000, 2000]
    const price = rand(...priceRange)
    const markup = rand(10, 25) // percent
    const originalPrice = Math.round(price * (1 + markup / 100))
    return { price, originalPrice }
  }

  let inserted = 0, skipped = 0, updated = 0
  for(const p of products){
    try{
      // Avoid duplicates by name + brand
      const exists = await Product.findOne({ name: p.name, brand: p.brand })
      if(exists){
        // If existing has zero price, upgrade it
        if(exists.price === 0){
          const pr = generatePrice(p)
            exists.price = pr.price
            exists.originalPrice = pr.originalPrice
            exists.tags = Array.from(new Set([...(exists.tags||[]), ...p.tags]))
            exists.source = exists.source || 'csv-import'
            await exists.save()
            updated++
        } else {
          skipped++
        }
        continue
      }
      const pr = generatePrice(p)
      p.price = pr.price
      p.originalPrice = pr.originalPrice
      await Product.create(p)
      inserted++
    }catch(e){
      console.error('Failed to insert', p.name, e.message)
      skipped++
    }
  }

  console.log(`✅ Import finished. Inserted: ${inserted}, Updated: ${updated}, Skipped: ${skipped}`)
  await mongoose.connection.close()
  process.exit(0)
}

run().catch(e=>{ console.error(e); process.exit(1) })
