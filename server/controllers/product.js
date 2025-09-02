import Product from '../models/Product.js'
import Profile from '../models/Profile.js'
import { suggestProductsForSkin } from '../utils/suggest.js'

export async function createProduct(req,res){
  try{
    const p = await Product.create(req.body)
    res.json(p)
  }catch(e){ res.status(500).json({error:e.message}) }
}

export async function listProducts(req,res){
  try{
    const { search, category, skinType, sortBy } = req.query
    
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
    
    const products = await productsQuery
    
    // suggest based on user's skin type if available
    if(req.user){
      const prof = await Profile.findOne({ user:req.user.id })
      const suggested = suggestProductsForSkin(products, prof?.skinType)
      return res.json({ products, suggested, total: products.length })
    }
    res.json({ products, total: products.length })
  }catch(e){ res.status(500).json({error:e.message}) }
}