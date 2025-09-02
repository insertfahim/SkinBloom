import Product from '../models/Product.js'
import Profile from '../models/Profile.js'
import { suggestProductsForSkin } from '../utils/suggest.js'
import externalApiService from '../services/externalApiService.js'

export async function createProduct(req,res){
  try{
    const p = await Product.create(req.body)
    res.json(p)
  }catch(e){ res.status(500).json({error:e.message}) }
}

export async function getProduct(req, res) {
  try {
    const { id } = req.params
    const product = await Product.findById(id)
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    
    res.json(product)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export async function listProducts(req,res){
  try{
    const { search, category, skinType, sortBy, source = 'all' } = req.query
    
    let query = {}
    
    // Add search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { ingredients: { $elemMatch: { $regex: search, $options: 'i' } } }
      ]
    }
    
    // Add category filter
    if (category) {
      query.category = { $regex: category, $options: 'i' }
    }
    
    // Add skin type filter
    if (skinType) {
      query.skinTypeSuitability = { $elemMatch: { $regex: skinType, $options: 'i' } }
    }
    
    let localProducts = []
    let externalProducts = []
    
    // Fetch local products
    if (source === 'all' || source === 'local') {
      let productsQuery = Product.find(query)
      
      // Add sorting
      if (sortBy) {
        switch(sortBy) {
          case 'price-low':
            productsQuery = productsQuery.sort({ price: 1 })
            break
          case 'price-high':
            productsQuery = productsQuery.sort({ price: -1 })
            break
          case 'brand':
            productsQuery = productsQuery.sort({ brand: 1 })
            break
          default:
            productsQuery = productsQuery.sort({ name: 1 })
        }
      }
      
      localProducts = await productsQuery
    }
    
    // Fetch external products
    if (source === 'all' || source === 'external') {
      const externalData = await externalApiService.fetchAllExternalProducts()
      externalProducts = externalData.products || []
      
      // Apply filters to external products
      if (search) {
        externalProducts = externalProducts.filter(product => 
          product.name.toLowerCase().includes(search.toLowerCase()) ||
          (product.brand && product.brand.toLowerCase().includes(search.toLowerCase()))
        )
      }
      
      if (category) {
        externalProducts = externalProducts.filter(product => 
          product.category.toLowerCase().includes(category.toLowerCase())
        )
      }
      
      if (skinType) {
        externalProducts = externalProducts.filter(product => 
          product.skinTypeSuitability.some(type => 
            type.toLowerCase().includes(skinType.toLowerCase())
          )
        )
      }
      
      // Sort external products
      if (sortBy) {
        switch(sortBy) {
          case 'price-low':
            externalProducts.sort((a, b) => a.price - b.price)
            break
          case 'price-high':
            externalProducts.sort((a, b) => b.price - a.price)
            break
          case 'brand':
            externalProducts.sort((a, b) => (a.brand || '').localeCompare(b.brand || ''))
            break
          default:
            externalProducts.sort((a, b) => a.name.localeCompare(b.name))
        }
      }
    }
    
    // Combine products
    const allProducts = [...localProducts, ...externalProducts]
    
    // suggest based on user's skin type if available
    if(req.user){
      const prof = await Profile.findOne({ user:req.user.id })
      const suggested = suggestProductsForSkin(allProducts, prof?.skinType)
      return res.json({ 
        products: allProducts, 
        suggested, 
        total: allProducts.length,
        sources: {
          local: localProducts.length,
          external: externalProducts.length
        }
      })
    }
    
    res.json({ 
      products: allProducts, 
      total: allProducts.length,
      sources: {
        local: localProducts.length,
        external: externalProducts.length
      }
    })
  }catch(e){ res.status(500).json({error:e.message}) }
}

// Fetch external products only
export async function fetchExternalProducts(req, res) {
  try {
    const { source = 'all' } = req.query
    
    let result = { products: [], sources: {} }
    
    switch(source) {
      case 'makeup':
        result = await externalApiService.fetchMakeupProducts()
        break
      case 'skincare':
        result = await externalApiService.fetchSkincareProducts()
        break
      case 'sephora':
        const { query = 'skincare' } = req.query
        result = await externalApiService.fetchSephoraProducts(query)
        break
      default:
        result = await externalApiService.fetchAllExternalProducts()
    }
    
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Import external products to local database
export async function importExternalProducts(req, res) {
  try {
    const { source = 'all', limit = 50 } = req.body
    
    // Only admins can import products
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' })
    }
    
    let externalData
    
    switch(source) {
      case 'makeup':
        externalData = await externalApiService.fetchMakeupProducts()
        break
      case 'skincare':
        externalData = await externalApiService.fetchSkincareProducts()
        break
      case 'sephora':
        const { query = 'skincare' } = req.body
        externalData = await externalApiService.fetchSephoraProducts(query, limit)
        break
      default:
        externalData = await externalApiService.fetchAllExternalProducts()
    }
    
    if (!externalData.products || externalData.products.length === 0) {
      return res.json({ message: 'No products found to import', imported: 0 })
    }
    
    // Limit the number of products to import
    const productsToImport = externalData.products.slice(0, limit)
    const importResults = []
    
    for (const productData of productsToImport) {
      try {
        // Check if product already exists (by external ID or name + brand)
        const existingProduct = await Product.findOne({
          $or: [
            { externalId: productData.externalId },
            { 
              name: productData.name, 
              brand: productData.brand 
            }
          ]
        })
        
        if (!existingProduct) {
          // Remove externalId and source before saving to avoid conflicts
          const { externalId, source, externalUrl, ...productForDb } = productData
          const newProduct = await Product.create({
            ...productForDb,
            importedFrom: source,
            originalExternalId: externalId,
            originalUrl: externalUrl
          })
          importResults.push({ success: true, product: newProduct._id, name: productData.name })
        } else {
          importResults.push({ success: false, reason: 'Already exists', name: productData.name })
        }
      } catch (error) {
        importResults.push({ success: false, reason: error.message, name: productData.name })
      }
    }
    
    const successCount = importResults.filter(r => r.success).length
    const failCount = importResults.filter(r => !r.success).length
    
    res.json({
      message: `Import completed: ${successCount} imported, ${failCount} skipped`,
      imported: successCount,
      skipped: failCount,
      details: importResults
    })
    
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}