import fetch from 'node-fetch'
import dotenv from 'dotenv'

dotenv.config()

const {
  RAPIDAPI_KEY,
  SEPHORA_API_HOST,
  ULTA_API_HOST,
  MAKEUP_API_URL,
  SKINCARE_API_URL
} = process.env

class ExternalApiService {
  
  // Sephora API (RapidAPI) - Requires API key
  async fetchSephoraProducts(query = '', limit = 20) {
    if (!RAPIDAPI_KEY) {
      console.warn('RapidAPI key not configured for Sephora API')
      return { products: [], error: 'API key required' }
    }

    try {
      const url = `https://${SEPHORA_API_HOST}/products/search?keyword=${encodeURIComponent(query)}&limit=${limit}`
      
      const response = await fetch(url, {
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': SEPHORA_API_HOST
        }
      })

      if (!response.ok) {
        throw new Error(`Sephora API error: ${response.status}`)
      }

      const data = await response.json()
      return this.normalizeSephoraData(data)
    } catch (error) {
      console.error('Sephora API error:', error)
      return { products: [], error: error.message }
    }
  }

  // Makeup API (Free)
  async fetchMakeupProducts(brand = '', product_type = '') {
    try {
      let url = `${MAKEUP_API_URL}/products.json`
      const params = new URLSearchParams()
      
      if (brand) {
        params.append('brand', brand)
      }
      if (product_type) {
        params.append('product_type', product_type)
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }

      console.log('Fetching from Makeup API:', url)
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Makeup API error: ${response.status}`)
      }

      const data = await response.json()
      console.log('Makeup API response length:', data?.length)
      return this.normalizeMakeupData(data)
    } catch (error) {
      console.error('Makeup API error:', error)
      return { products: [], error: error.message }
    }
  }

  // Ulta API (RapidAPI) - Requires API key
  async fetchUltaProducts(query = 'skincare', limit = 20) {
    if (!RAPIDAPI_KEY) {
      console.warn('RapidAPI key not configured for Ulta API')
      return { products: [], error: 'API key required' }
    }

    try {
      const url = `https://${ULTA_API_HOST}/products/search?keyword=${encodeURIComponent(query)}&limit=${limit}`
      
      const response = await fetch(url, {
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': ULTA_API_HOST
        }
      })

      if (!response.ok) {
        throw new Error(`Ulta API error: ${response.status}`)
      }

      const data = await response.json()
      return this.normalizeUltaData(data)
    } catch (error) {
      console.error('Ulta API error:', error)
      return { products: [], error: error.message }
    }
  }

  // SkinCare API (Free)
  async fetchSkincareProducts() {
    try {
      const response = await fetch(`${SKINCARE_API_URL}/products`)
      
      if (!response.ok) {
        throw new Error(`SkinCare API error: ${response.status}`)
      }

      const data = await response.json()
      return this.normalizeSkincareData(data)
    } catch (error) {
      console.error('SkinCare API error:', error)
      return { products: [], error: error.message }
    }
  }

  // Get all products from multiple sources
  async fetchAllExternalProducts() {
    try {
      const [makeup, skincare, dummy] = await Promise.allSettled([
        this.fetchMakeupProducts(),
        this.fetchSkincareProducts(),
        this.generateDummyProducts()
      ])

      let allProducts = []

      if (makeup.status === 'fulfilled' && makeup.value.products) {
        allProducts = [...allProducts, ...makeup.value.products]
      }

      if (skincare.status === 'fulfilled' && skincare.value.products) {
        allProducts = [...allProducts, ...skincare.value.products]
      }

      // Add dummy products if external APIs fail or return no data
      if (dummy.status === 'fulfilled' && dummy.value.products) {
        allProducts = [...allProducts, ...dummy.value.products]
      }

      return {
        products: allProducts,
        total: allProducts.length,
        sources: {
          makeup: makeup.status === 'fulfilled' ? makeup.value.products?.length || 0 : 0,
          skincare: skincare.status === 'fulfilled' ? skincare.value.products?.length || 0 : 0,
          dummy: dummy.status === 'fulfilled' ? dummy.value.products?.length || 0 : 0
        }
      }
    } catch (error) {
      console.error('Error fetching all external products:', error)
      // Fallback to dummy data
      const dummyData = await this.generateDummyProducts()
      return { 
        products: dummyData.products, 
        error: error.message,
        sources: { dummy: dummyData.products.length }
      }
    }
  }

  // Normalize Sephora data to our schema
  normalizeSephoraData(data) {
    if (!data || !Array.isArray(data.products)) {
      return { products: [] }
    }

    const products = data.products.map(item => ({
      externalId: item.id,
      name: item.displayName || item.name,
      brand: item.brand?.displayName || item.brandName,
      category: this.categorizeSephoraProduct(item.category || item.primaryCategory),
      price: item.currentSku?.listPrice || item.price || 0,
      image: item.image?.large || item.heroImage,
      description: item.shortDescription || item.longDescription || '',
      rating: item.rating || 0,
      reviewCount: item.reviews || 0,
      ingredients: this.extractIngredients(item.ingredients),
      skinTypeSuitability: this.determineSkinTypes(item.category, item.ingredients),
      source: 'sephora',
      externalUrl: item.targetUrl
    }))

    return { products }
  }

  // Normalize Makeup API data
  normalizeMakeupData(data) {
    if (!Array.isArray(data)) {
      return { products: [] }
    }

    console.log('Processing makeup data, total items:', data.length)

    const products = data
      .filter(item => {
        // Include all cosmetic products, not just skincare
        return item && item.name && item.brand
      })
      .map(item => ({
        externalId: item.id?.toString(),
        name: item.name,
        brand: item.brand,
        category: this.categorizeMakeupProduct(item.product_type || item.category),
        price: parseFloat(item.price) || 0,
        image: item.image_link,
        description: item.description || '',
        rating: parseFloat(item.rating) || 0,
        reviewCount: 0,
        ingredients: [],
        skinTypeSuitability: this.determineSkinTypesByCategory(item.product_type),
        source: 'makeup-api',
        externalUrl: item.product_link
      }))
      .filter(product => product.name && product.brand) // Remove invalid products

    console.log('Normalized makeup products:', products.length)
    return { products }
  }

  // Normalize Ulta API data
  normalizeUltaData(data) {
    if (!data || !Array.isArray(data.products)) {
      return { products: [] }
    }

    const products = data.products.map(item => ({
      externalId: item.id?.toString(),
      name: item.displayName || item.name,
      brand: item.brand?.displayName || item.brandName,
      category: this.categorizeUltaProduct(item.category || item.primaryCategory),
      price: parseFloat(item.currentSku?.listPrice || item.price) || 0,
      image: item.image?.large || item.heroImage,
      description: item.shortDescription || item.longDescription || '',
      rating: parseFloat(item.rating) || 0,
      reviewCount: parseInt(item.reviews) || 0,
      ingredients: this.extractIngredients(item.ingredients),
      skinTypeSuitability: this.determineSkinTypes(item.category, item.ingredients),
      source: 'ulta',
      externalUrl: item.targetUrl
    }))

    return { products }
  }

  // Normalize SkinCare API data
  normalizeSkincareData(data) {
    if (!Array.isArray(data)) {
      return { products: [] }
    }

    const products = data.map(item => ({
      externalId: item.id,
      name: item.name,
      brand: item.brand || 'Unknown',
      category: item.category || 'Skincare',
      price: parseFloat(item.price) || 0,
      image: item.image_url || item.image,
      description: item.description || '',
      rating: parseFloat(item.rating) || 0,
      reviewCount: item.review_count || 0,
      ingredients: Array.isArray(item.ingredients) ? item.ingredients : [],
      skinTypeSuitability: item.skin_types || ['all'],
      source: 'skincare-api'
    }))

    return { products }
  }

  // Helper methods
  categorizeSephoraProduct(category) {
    if (!category) return 'Other'
    
    const categoryMap = {
      'face wash': 'Cleanser',
      'cleanser': 'Cleanser',
      'moisturizer': 'Moisturizer',
      'serum': 'Serum',
      'sunscreen': 'Sunscreen',
      'eye cream': 'Eye Care',
      'face mask': 'Mask',
      'toner': 'Toner',
      'exfoliant': 'Exfoliant'
    }

    const lowerCategory = category.toLowerCase()
    for (const [key, value] of Object.entries(categoryMap)) {
      if (lowerCategory.includes(key)) {
        return value
      }
    }
    return 'Other'
  }

  categorizeMakeupProduct(productType) {
    const typeMap = {
      'face_wash': 'Cleanser',
      'cleanser': 'Cleanser',
      'moisturizer': 'Moisturizer',
      'serum': 'Serum',
      'sunscreen': 'Sunscreen',
      'eye_cream': 'Eye Care',
      'face_mask': 'Mask',
      'toner': 'Toner',
      'foundation': 'Foundation',
      'concealer': 'Concealer',
      'powder': 'Powder',
      'blush': 'Blush',
      'bronzer': 'Bronzer',
      'eyeshadow': 'Eyeshadow',
      'eyeliner': 'Eyeliner',
      'mascara': 'Mascara',
      'lipstick': 'Lipstick',
      'lip_gloss': 'Lip Gloss',
      'lip_liner': 'Lip Liner',
      'nail_polish': 'Nail Polish'
    }
    return typeMap[productType] || 'Beauty Product'
  }

  categorizeUltaProduct(category) {
    if (!category) {
      return 'Other'
    }
    
    const categoryMap = {
      'face wash': 'Cleanser',
      'cleanser': 'Cleanser',
      'moisturizer': 'Moisturizer',
      'serum': 'Serum',
      'sunscreen': 'Sunscreen',
      'eye cream': 'Eye Care',
      'face mask': 'Mask',
      'toner': 'Toner',
      'foundation': 'Foundation',
      'concealer': 'Concealer',
      'powder': 'Powder',
      'blush': 'Blush',
      'bronzer': 'Bronzer',
      'eyeshadow': 'Eyeshadow',
      'eyeliner': 'Eyeliner',
      'mascara': 'Mascara',
      'lipstick': 'Lipstick',
      'lip gloss': 'Lip Gloss',
      'nail polish': 'Nail Polish'
    }

    const lowerCategory = category.toLowerCase()
    for (const [key, value] of Object.entries(categoryMap)) {
      if (lowerCategory.includes(key)) {
        return value
      }
    }
    return 'Beauty Product'
  }

  isSkincareProduct(productType) {
    const skincareTypes = [
      'face_wash', 'cleanser', 'moisturizer', 'serum', 
      'sunscreen', 'eye_cream', 'face_mask', 'toner'
    ]
    return skincareTypes.includes(productType)
  }

  extractIngredients(ingredientsText) {
    if (!ingredientsText) return []
    if (Array.isArray(ingredientsText)) return ingredientsText
    
    // Basic ingredient extraction from text
    return ingredientsText
      .split(/[,;]/)
      .map(ingredient => ingredient.trim())
      .filter(ingredient => ingredient.length > 0)
      .slice(0, 10) // Limit to first 10 ingredients
  }

  determineSkinTypes(category, ingredients) {
    // Basic skin type determination logic
    const skinTypes = []
    const categoryLower = (category || '').toLowerCase()
    const ingredientsText = (ingredients || '').toLowerCase()

    if (categoryLower.includes('oil') || ingredientsText.includes('oil')) {
      skinTypes.push('dry')
    }
    if (categoryLower.includes('gel') || ingredientsText.includes('salicylic')) {
      skinTypes.push('oily')
    }
    if (ingredientsText.includes('gentle') || ingredientsText.includes('sensitive')) {
      skinTypes.push('sensitive')
    }
    
    return skinTypes.length > 0 ? skinTypes : ['all']
  }

  determineSkinTypesByCategory(category) {
    const categoryMap = {
      'cleanser': ['oily', 'combination'],
      'moisturizer': ['dry', 'normal'],
      'serum': ['all'],
      'sunscreen': ['all']
    }
    return categoryMap[category] || ['all']
  }

  // Generate dummy skincare products for demonstration
  async generateDummyProducts() {
    const dummyProducts = [
      {
        externalId: 'dummy-1',
        name: 'Hydrating Gentle Cleanser',
        brand: 'SkinBloom Essentials',
        category: 'Cleanser',
        price: 24.99,
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
        description: 'A gentle, hydrating cleanser suitable for all skin types. Removes impurities without stripping natural oils.',
        rating: 4.5,
        reviewCount: 127,
        ingredients: ['Water', 'Glycerin', 'Sodium Cocoyl Isethionate', 'Ceramides', 'Hyaluronic Acid'],
        skinTypeSuitability: ['all'],
        source: 'dummy-api'
      },
      {
        externalId: 'dummy-2',
        name: 'Vitamin C Brightening Serum',
        brand: 'Glow Labs',
        category: 'Serum',
        price: 45.00,
        image: 'https://images.unsplash.com/photo-1570554886111-e80fcca6a029?w=400',
        description: 'Powerful vitamin C serum that brightens skin and reduces dark spots.',
        rating: 4.7,
        reviewCount: 89,
        ingredients: ['L-Ascorbic Acid', 'Vitamin E', 'Ferulic Acid', 'Water', 'Glycerin'],
        skinTypeSuitability: ['normal', 'combination', 'oily'],
        source: 'dummy-api'
      },
      {
        externalId: 'dummy-3',
        name: 'Intensive Repair Moisturizer',
        brand: 'DermaHeal',
        category: 'Moisturizer',
        price: 32.50,
        image: 'https://images.unsplash.com/photo-1556228724-56d22e8e8cd2?w=400',
        description: 'Rich moisturizer with peptides and ceramides for dry and mature skin.',
        rating: 4.3,
        reviewCount: 156,
        ingredients: ['Shea Butter', 'Ceramides', 'Peptides', 'Niacinamide', 'Squalane'],
        skinTypeSuitability: ['dry', 'mature'],
        source: 'dummy-api'
      },
      {
        externalId: 'dummy-4',
        name: 'Daily Sun Protection SPF 50',
        brand: 'SunGuard',
        category: 'Sunscreen',
        price: 28.99,
        image: 'https://images.unsplash.com/photo-1556228578-dd8f3c3d4b6b?w=400',
        description: 'Broad-spectrum sunscreen with zinc oxide and titanium dioxide.',
        rating: 4.4,
        reviewCount: 203,
        ingredients: ['Zinc Oxide', 'Titanium Dioxide', 'Octinoxate', 'Water', 'Glycerin'],
        skinTypeSuitability: ['all'],
        source: 'dummy-api'
      },
      {
        externalId: 'dummy-5',
        name: 'Retinol Night Treatment',
        brand: 'AgeLess Pro',
        category: 'Serum',
        price: 67.00,
        image: 'https://images.unsplash.com/photo-1556228724-56d52e8e8cd2?w=400',
        description: 'Advanced retinol treatment for anti-aging and skin renewal.',
        rating: 4.6,
        reviewCount: 78,
        ingredients: ['Retinol', 'Hyaluronic Acid', 'Vitamin E', 'Jojoba Oil', 'Ceramides'],
        skinTypeSuitability: ['normal', 'combination', 'mature'],
        source: 'dummy-api'
      },
      {
        externalId: 'dummy-6',
        name: 'Salicylic Acid Exfoliating Toner',
        brand: 'ClearSkin',
        category: 'Toner',
        price: 19.99,
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
        description: 'Gentle exfoliating toner with salicylic acid for acne-prone skin.',
        rating: 4.2,
        reviewCount: 134,
        ingredients: ['Salicylic Acid', 'Witch Hazel', 'Niacinamide', 'Water', 'Glycerin'],
        skinTypeSuitability: ['oily', 'combination', 'acne-prone'],
        source: 'dummy-api'
      },
      {
        externalId: 'dummy-7',
        name: 'Hydrating Eye Cream',
        brand: 'EyeCare Plus',
        category: 'Eye Care',
        price: 42.00,
        image: 'https://images.unsplash.com/photo-1570554886124-e80fcca6a029?w=400',
        description: 'Lightweight eye cream that reduces puffiness and fine lines.',
        rating: 4.1,
        reviewCount: 92,
        ingredients: ['Caffeine', 'Peptides', 'Hyaluronic Acid', 'Vitamin K', 'Ceramides'],
        skinTypeSuitability: ['all'],
        source: 'dummy-api'
      },
      {
        externalId: 'dummy-8',
        name: 'Purifying Clay Mask',
        brand: 'ClayWorks',
        category: 'Mask',
        price: 15.99,
        image: 'https://images.unsplash.com/photo-1556228724-56d22e8e8cd2?w=400',
        description: 'Deep cleansing clay mask with bentonite and charcoal.',
        rating: 4.0,
        reviewCount: 167,
        ingredients: ['Bentonite Clay', 'Activated Charcoal', 'Tea Tree Oil', 'Water', 'Glycerin'],
        skinTypeSuitability: ['oily', 'combination', 'acne-prone'],
        source: 'dummy-api'
      }
    ]

    return { products: dummyProducts }
  }
}

export default new ExternalApiService()
