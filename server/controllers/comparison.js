import Comparison from '../models/Comparison.js'
import Product from '../models/Product.js'
import crypto from 'crypto'

// Get user's comparisons
export async function getUserComparisons(req, res) {
  try {
    const comparisons = await Comparison.find({ user: req.user.id })
      .populate('products.productId')
      .sort({ updatedAt: -1 })
    
    res.json({
      comparisons,
      total: comparisons.length
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Create new comparison
export async function createComparison(req, res) {
  try {
    const { name = 'Product Comparison', products = [], compareFields = ['price', 'rating', 'ingredients'] } = req.body

    const comparison = new Comparison({
      user: req.user.id,
      name,
      products: [],
      compareFields
    })

    // Add products to comparison
    for (const productInfo of products) {
      const productItem = await prepareProductForComparison(productInfo)
      if (productItem) {
        comparison.products.push(productItem)
      }
    }

    await comparison.save()
    res.json({ 
      message: 'Comparison created',
      comparison
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Add product to comparison
export async function addToComparison(req, res) {
  try {
    const { comparisonId } = req.params
    const productInfo = req.body

    const comparison = await Comparison.findOne({ 
      _id: comparisonId, 
      user: req.user.id 
    })

    if (!comparison) {
      return res.status(404).json({ error: 'Comparison not found' })
    }

    // Check if product already exists
    const exists = comparison.products.some(item => {
      if (productInfo.productSource === 'local') {
        return item.productId?.toString() === productInfo.productId
      } else {
        return item.externalProductId === productInfo.externalProductId && 
               item.productSource === productInfo.productSource
      }
    })

    if (exists) {
      return res.status(400).json({ error: 'Product already in comparison' })
    }

    // Limit to 5 products for better UX
    if (comparison.products.length >= 5) {
      return res.status(400).json({ error: 'Maximum 5 products allowed in comparison' })
    }

    const productItem = await prepareProductForComparison(productInfo)
    if (!productItem) {
      return res.status(400).json({ error: 'Invalid product data' })
    }

    comparison.products.push(productItem)
    await comparison.save()

    res.json({ 
      message: 'Product added to comparison',
      comparison
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Remove product from comparison
export async function removeFromComparison(req, res) {
  try {
    const { comparisonId } = req.params
    const { productId, externalProductId, productSource } = req.body

    const comparison = await Comparison.findOne({ 
      _id: comparisonId, 
      user: req.user.id 
    })

    if (!comparison) {
      return res.status(404).json({ error: 'Comparison not found' })
    }

    const initialLength = comparison.products.length
    comparison.products = comparison.products.filter(item => {
      if (productSource === 'local') {
        return item.productId?.toString() !== productId
      } else {
        return !(item.externalProductId === externalProductId && item.productSource === productSource)
      }
    })

    if (comparison.products.length === initialLength) {
      return res.status(404).json({ error: 'Product not found in comparison' })
    }

    await comparison.save()
    res.json({ message: 'Product removed from comparison' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get specific comparison
export async function getComparison(req, res) {
  try {
    const { comparisonId } = req.params

    const comparison = await Comparison.findOne({ 
      _id: comparisonId, 
      user: req.user.id 
    }).populate('products.productId')

    if (!comparison) {
      return res.status(404).json({ error: 'Comparison not found' })
    }

    res.json({ comparison })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Share comparison (generate public link)
export async function shareComparison(req, res) {
  try {
    const { comparisonId } = req.params

    const comparison = await Comparison.findOne({ 
      _id: comparisonId, 
      user: req.user.id 
    })

    if (!comparison) {
      return res.status(404).json({ error: 'Comparison not found' })
    }

    // Generate share token
    comparison.shareToken = crypto.randomBytes(32).toString('hex')
    comparison.sharedAt = new Date()
    comparison.isPublic = true

    await comparison.save()

    res.json({ 
      message: 'Comparison shared',
      shareUrl: `/compare/shared/${comparison.shareToken}`,
      shareToken: comparison.shareToken
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get shared comparison
export async function getSharedComparison(req, res) {
  try {
    const { shareToken } = req.params

    const comparison = await Comparison.findOne({ 
      shareToken,
      isPublic: true 
    }).populate('products.productId')

    if (!comparison) {
      return res.status(404).json({ error: 'Shared comparison not found' })
    }

    res.json({ comparison })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Update comparison settings
export async function updateComparison(req, res) {
  try {
    const { comparisonId } = req.params
    const { name, compareFields, isPublic } = req.body

    const comparison = await Comparison.findOne({ 
      _id: comparisonId, 
      user: req.user.id 
    })

    if (!comparison) {
      return res.status(404).json({ error: 'Comparison not found' })
    }

    if (name !== undefined) {
      comparison.name = name
    }
    if (compareFields !== undefined) {
      comparison.compareFields = compareFields
    }
    if (isPublic !== undefined) {
      comparison.isPublic = isPublic
    }

    await comparison.save()
    res.json({ message: 'Comparison updated', comparison })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Delete comparison
export async function deleteComparison(req, res) {
  try {
    const { comparisonId } = req.params

    const result = await Comparison.findOneAndDelete({ 
      _id: comparisonId, 
      user: req.user.id 
    })

    if (!result) {
      return res.status(404).json({ error: 'Comparison not found' })
    }

    res.json({ message: 'Comparison deleted' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Helper function to prepare product data for comparison
async function prepareProductForComparison(productInfo) {
  try {
    const { 
      productId, 
      externalProductId, 
      productSource = 'local',
      productData
    } = productInfo

    let finalProductData = productData

    // If it's a local product, get data from database
    if (productSource === 'local' && productId) {
      const dbProduct = await Product.findById(productId)
      if (!dbProduct) {
        return null
      }
      finalProductData = {
        name: dbProduct.name,
        brand: dbProduct.brand,
        category: dbProduct.category,
        price: dbProduct.price,
        image: dbProduct.image,
        rating: dbProduct.rating,
        reviewCount: dbProduct.reviewCount,
        ingredients: dbProduct.ingredients,
        skinTypeSuitability: dbProduct.skinTypeSuitability,
        description: dbProduct.description
      }
    }

    return {
      productId: productSource === 'local' ? productId : undefined,
      externalProductId: productSource !== 'local' ? externalProductId : undefined,
      productSource,
      productData: finalProductData
    }
  } catch (error) {
    console.error('Error preparing product for comparison:', error)
    return null
  }
}
