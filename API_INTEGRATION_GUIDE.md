# SkinBloom API Integration Guide

## Overview
This guide explains how to integrate external product APIs into your SkinBloom application to extract beauty and skincare product data.

## 🚀 Quick Start

### 1. Start the Server
```bash
cd server
npm install
npm start
```

### 2. Start the Client
```bash
cd client
npm install
npm run dev
```

### 3. Test the API Integration
```bash
cd server
node testApis.js
```

## 📋 Available APIs

### 1. **Makeup API** (✅ FREE - WORKING)
- **URL**: http://makeup-api.herokuapp.com/
- **Documentation**: https://makeup-api.herokuapp.com/
- **API Key**: Not required
- **Data**: 900+ makeup and beauty products
- **Brands**: Maybelline, ColourPop, Revlon, L'Oreal, etc.
- **Product Types**: Foundation, Lipstick, Eyeshadow, Mascara, etc.

**Example Usage:**
```javascript
// All products
GET /api/products/external?source=makeup

// By brand
GET /api/products/external?source=makeup&brand=maybelline

// By product type
GET /api/products/external?source=makeup&product_type=lipstick
```

### 2. **SkinCare API** (❌ Currently Down)
- **URL**: https://skincare-api.herokuapp.com/
- **Status**: 404 - Service unavailable
- **Alternative**: Use dummy data or other APIs

### 3. **Sephora API** (💰 PREMIUM - RapidAPI)
- **URL**: https://rapidapi.com/apidojo/api/sephora
- **API Key Required**: Yes (RapidAPI subscription)
- **Cost**: Free tier available (limited requests)
- **Data**: Real Sephora products with prices, ratings, reviews

**How to Get API Key:**
1. Go to [RapidAPI.com](https://rapidapi.com/)
2. Create a free account
3. Subscribe to [Sephora API](https://rapidapi.com/apidojo/api/sephora)
4. Copy your RapidAPI key
5. Add to `.env` file: `RAPIDAPI_KEY=your_key_here`

### 4. **Dummy Data** (✅ BUILT-IN)
- **Source**: Custom generated data
- **Products**: 8 featured skincare products
- **Purpose**: Demonstration and fallback

## 🔧 Configuration

### Environment Variables (.env)
```bash
# Database
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

# Server
PORT=5000
FRONTEND_URL=http://localhost:5173

# Payment (Stripe)
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable

# External APIs
RAPIDAPI_KEY=your_rapidapi_key_here
SEPHORA_API_HOST=sephora.p.rapidapi.com
MAKEUP_API_URL=http://makeup-api.herokuapp.com/api/v1
SKINCARE_API_URL=https://skincare-api.herokuapp.com
```

## 📡 API Endpoints

### Get All Products (Local + External)
```http
GET /api/products
```

**Query Parameters:**
- `search` - Search term
- `category` - Product category
- `sortBy` - Sort option (name, price-low, price-high, brand)
- `source` - Data source (all, local, external)

**Example:**
```bash
curl "http://localhost:5000/api/products?search=moisturizer&source=all"
```

### Get External Products Only
```http
GET /api/products/external
```

**Query Parameters:**
- `source` - API source (makeup, skincare, sephora, all)

**Example:**
```bash
curl "http://localhost:5000/api/products/external?source=makeup"
```

### Import External Products (Admin Only)
```http
POST /api/products/import
```

**Body:**
```json
{
  "source": "makeup",
  "limit": 50,
  "query": "moisturizer"
}
```

## 💻 Frontend Integration

### Products Component Features
- ✅ Search across all products
- ✅ Filter by category
- ✅ Sort by name, price, brand
- ✅ Filter by data source (local, external, all)
- ✅ Display product images
- ✅ Show source badges
- ✅ Link to original product pages
- ✅ Responsive grid layout

### Usage Example
```jsx
import Products from './ui/Products'

function App() {
  return (
    <div>
      <Products />
    </div>
  )
}
```

## 🎯 How to Get More API Keys

### 1. RapidAPI (Recommended)
- **Website**: https://rapidapi.com/
- **Free Tier**: Yes (limited requests)
- **Available APIs**: Sephora, Ulta, Amazon Products, etc.
- **Steps**:
  1. Create account
  2. Browse API marketplace
  3. Subscribe to APIs
  4. Copy API key from dashboard

### 2. Alternative Beauty APIs

#### A. **Ulta API** (RapidAPI)
- **URL**: https://rapidapi.com/apidojo/api/ulta
- **Cost**: Free tier available
- **Data**: Ulta beauty products

#### B. **Amazon Product API** (RapidAPI)
- **URL**: https://rapidapi.com/axesso/api/axesso-amazon-data-service
- **Cost**: Free tier available
- **Data**: Amazon beauty products

#### C. **eBay API**
- **URL**: https://developer.ebay.com/
- **Cost**: Free with registration
- **Data**: eBay beauty products

#### D. **Walmart API**
- **URL**: https://developer.walmart.com/
- **Cost**: Free with approval
- **Data**: Walmart beauty products

### 3. Custom API Sources

#### Option 1: Web Scraping
```javascript
// Example: Scrape product data from websites
import puppeteer from 'puppeteer'

async function scrapeProducts(url) {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(url)
  
  const products = await page.evaluate(() => {
    // Extract product data from page
    return Array.from(document.querySelectorAll('.product')).map(el => ({
      name: el.querySelector('.product-name')?.textContent,
      price: el.querySelector('.price')?.textContent,
      image: el.querySelector('img')?.src
    }))
  })
  
  await browser.close()
  return products
}
```

#### Option 2: RSS/XML Feeds
```javascript
// Example: Parse product feeds
import xml2js from 'xml2js'

async function parseProductFeed(feedUrl) {
  const response = await fetch(feedUrl)
  const xml = await response.text()
  const parser = new xml2js.Parser()
  const result = await parser.parseStringPromise(xml)
  return result.products.product
}
```

## 🛠️ Extending the System

### Add New API Source
1. **Update Service** (`services/externalApiService.js`):
```javascript
async fetchNewApiProducts() {
  try {
    const response = await fetch('https://new-api.com/products')
    const data = await response.json()
    return this.normalizeNewApiData(data)
  } catch (error) {
    return { products: [], error: error.message }
  }
}

normalizeNewApiData(data) {
  return {
    products: data.map(item => ({
      externalId: item.id,
      name: item.name,
      brand: item.brand,
      category: item.category,
      price: item.price,
      image: item.image,
      source: 'new-api'
    }))
  }
}
```

2. **Update Controller** (`controllers/product.js`):
```javascript
case 'new-api':
  result = await externalApiService.fetchNewApiProducts()
  break
```

3. **Update Frontend** to handle new source.

### Database Schema for Products
```javascript
{
  name: String,              // Product name
  brand: String,             // Brand name
  category: String,          // Product category
  price: Number,             // Price in USD
  image: String,             // Image URL
  description: String,       // Product description
  ingredients: [String],     // List of ingredients
  skinTypeSuitability: [String], // Suitable skin types
  rating: Number,            // Average rating
  reviewCount: Number,       // Number of reviews
  
  // Import tracking
  importedFrom: String,      // Source API
  originalExternalId: String, // Original product ID
  originalUrl: String,       // Original product URL
  
  // Admin fields
  isActive: Boolean,         // Product visibility
  featuredProduct: Boolean   // Featured status
}
```

## 🚦 Rate Limiting and Best Practices

### API Rate Limits
- **Makeup API**: No documented limits
- **RapidAPI (Sephora)**: Varies by subscription
- **Recommendation**: Cache responses, use pagination

### Caching Strategy
```javascript
// Example: Redis caching
import redis from 'redis'

const client = redis.createClient()

async function getCachedProducts(key) {
  const cached = await client.get(key)
  if (cached) {
    return JSON.parse(cached)
  }
  
  const fresh = await fetchFromAPI()
  await client.setex(key, 3600, JSON.stringify(fresh)) // 1 hour cache
  return fresh
}
```

### Error Handling
```javascript
const fallbackChain = [
  () => externalApiService.fetchSephoraProducts(),
  () => externalApiService.fetchMakeupProducts(),
  () => externalApiService.generateDummyProducts()
]

async function fetchWithFallback() {
  for (const fetchFn of fallbackChain) {
    try {
      const result = await fetchFn()
      if (result.products.length > 0) {
        return result
      }
    } catch (error) {
      console.warn('API failed, trying next:', error.message)
    }
  }
  
  return { products: [], error: 'All APIs failed' }
}
```

## 📊 Data Sources Summary

| API | Status | Cost | Products | Setup |
|-----|--------|------|----------|-------|
| Makeup API | ✅ Working | Free | 900+ | No setup |
| Dummy Data | ✅ Working | Free | 8 | Built-in |
| Sephora API | 🔑 API Key | Freemium | 1000s | RapidAPI account |
| SkinCare API | ❌ Down | Free | 0 | N/A |

## 🎉 Success!

You now have a fully functional beauty/skincare product API system that:

1. ✅ Fetches data from multiple external APIs
2. ✅ Provides fallback dummy data
3. ✅ Supports search, filtering, and sorting
4. ✅ Displays products in a modern UI
5. ✅ Handles errors gracefully
6. ✅ Supports admin product import
7. ✅ Tracks data sources
8. ✅ Links to original product pages

## 🔗 Useful Links

- [RapidAPI Marketplace](https://rapidapi.com/)
- [Makeup API Documentation](https://makeup-api.herokuapp.com/)
- [Postman Collection](https://documenter.getpostman.com/view/your-collection)
- [GitHub Repository](https://github.com/your-repo)

Happy coding! 🚀
