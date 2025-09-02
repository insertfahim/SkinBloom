import Wishlist from '../models/Wishlist.js'
import Product from '../models/Product.js'

// Get user's wishlist
export async function getUserWishlist(req, res) {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id })
      .populate('products.productId')
    
    if (!wishlist) {
      return res.json({ 
        products: [], 
        total: 0,
        wishlist: { name: 'My Wishlist', isPublic: false }
      })
    }
    
    res.json({
      products: wishlist.products,
      total: wishlist.products.length,
      wishlist: {
        _id: wishlist._id,
        name: wishlist.name,
        description: wishlist.description,
        isPublic: wishlist.isPublic,
        createdAt: wishlist.createdAt,
        updatedAt: wishlist.updatedAt
      }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Add product to wishlist
export async function addToWishlist(req, res) {
  try {
    const { 
      productId, 
      externalProductId, 
      productSource = 'local',
      productData,
      enablePriceAlert = false,
      targetPrice
    } = req.body

    let wishlist = await Wishlist.findOne({ user: req.user.id })
    
    if (!wishlist) {
      wishlist = new Wishlist({
        user: req.user.id,
        products: []
      })
    }

    // Check if product already exists in wishlist
    const existingIndex = wishlist.products.findIndex(item => {
      if (productSource === 'local') {
        return item.productId?.toString() === productId
      } else {
        return item.externalProductId === externalProductId && item.productSource === productSource
      }
    })

    if (existingIndex !== -1) {
      return res.status(400).json({ error: 'Product already in wishlist' })
    }

    // Prepare product data
    let finalProductData = productData
    
    // If it's a local product, get data from database
    if (productSource === 'local' && productId) {
      const dbProduct = await Product.findById(productId)
      if (!dbProduct) {
        return res.status(404).json({ error: 'Product not found' })
      }
      finalProductData = {
        name: dbProduct.name,
        brand: dbProduct.brand,
        category: dbProduct.category,
        price: dbProduct.price,
        image: dbProduct.image
      }
    }

    // Add to wishlist
    const newWishlistItem = {
      productId: productSource === 'local' ? productId : undefined,
      externalProductId: productSource !== 'local' ? externalProductId : undefined,
      productSource,
      productData: finalProductData,
      priceAlert: {
        enabled: enablePriceAlert,
        targetPrice: targetPrice,
        currentPrice: finalProductData?.price
      }
    }

    wishlist.products.push(newWishlistItem)
    await wishlist.save()

    res.json({ 
      message: 'Product added to wishlist',
      wishlistItem: newWishlistItem
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Remove product from wishlist
export async function removeFromWishlist(req, res) {
  try {
    const { productId, externalProductId, productSource } = req.body

    const wishlist = await Wishlist.findOne({ user: req.user.id })
    if (!wishlist) {
      return res.status(404).json({ error: 'Wishlist not found' })
    }

    // Find and remove the product
    const initialLength = wishlist.products.length
    wishlist.products = wishlist.products.filter(item => {
      if (productSource === 'local') {
        return item.productId?.toString() !== productId
      } else {
        return !(item.externalProductId === externalProductId && item.productSource === productSource)
      }
    })

    if (wishlist.products.length === initialLength) {
      return res.status(404).json({ error: 'Product not found in wishlist' })
    }

    await wishlist.save()
    res.json({ message: 'Product removed from wishlist' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Update wishlist settings
export async function updateWishlistSettings(req, res) {
  try {
    const { name, description, isPublic } = req.body

    let wishlist = await Wishlist.findOne({ user: req.user.id })
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user.id })
    }

    if (name !== undefined) wishlist.name = name
    if (description !== undefined) wishlist.description = description
    if (isPublic !== undefined) wishlist.isPublic = isPublic

    await wishlist.save()
    res.json({ message: 'Wishlist updated', wishlist })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Update price alert for wishlist item
export async function updatePriceAlert(req, res) {
  try {
    const { productId, externalProductId, productSource, enabled, targetPrice } = req.body

    const wishlist = await Wishlist.findOne({ user: req.user.id })
    if (!wishlist) {
      return res.status(404).json({ error: 'Wishlist not found' })
    }

    // Find the product in wishlist
    const productIndex = wishlist.products.findIndex(item => {
      if (productSource === 'local') {
        return item.productId?.toString() === productId
      } else {
        return item.externalProductId === externalProductId && item.productSource === productSource
      }
    })

    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found in wishlist' })
    }

    // Update price alert
    wishlist.products[productIndex].priceAlert = {
      enabled: enabled !== undefined ? enabled : wishlist.products[productIndex].priceAlert.enabled,
      targetPrice: targetPrice !== undefined ? targetPrice : wishlist.products[productIndex].priceAlert.targetPrice,
      currentPrice: wishlist.products[productIndex].productData.price
    }

    await wishlist.save()
    res.json({ message: 'Price alert updated' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get public wishlist by user ID
export async function getPublicWishlist(req, res) {
  try {
    const { userId } = req.params
    
    const wishlist = await Wishlist.findOne({ 
      user: userId, 
      isPublic: true 
    }).populate('products.productId')
    
    if (!wishlist) {
      return res.status(404).json({ error: 'Public wishlist not found' })
    }
    
    res.json({
      products: wishlist.products,
      total: wishlist.products.length,
      wishlist: {
        name: wishlist.name,
        description: wishlist.description,
        createdAt: wishlist.createdAt
      }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
