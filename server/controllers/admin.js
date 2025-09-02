import Product from '../models/Product.js'

// Get all available categories
export async function getCategories(req, res) {
  try {
    // Get categories from schema enum
    const categoryEnum = Product.schema.paths.category.enumValues
    
    // Get categories actually used in database with counts
    const categoryCounts = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])

    const categoriesWithCounts = categoryEnum.map(category => {
      const found = categoryCounts.find(item => item._id === category)
      return {
        name: category,
        count: found ? found.count : 0
      }
    })

    res.json({
      categories: categoriesWithCounts,
      total: categoryEnum.length
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Add new category (Admin only)
export async function addCategory(req, res) {
  try {
    const { categoryName } = req.body

    if (!categoryName || categoryName.trim() === '') {
      return res.status(400).json({ error: 'Category name is required' })
    }

    const formattedName = categoryName.trim()
    
    // Get current enum values
    const currentEnum = Product.schema.paths.category.enumValues
    
    if (currentEnum.includes(formattedName)) {
      return res.status(400).json({ error: 'Category already exists' })
    }

    // Note: In production, you would need to modify the schema dynamically
    // For now, we'll return instructions for manual update
    res.json({
      message: 'To add a new category, update the Product schema enum in models/Product.js',
      instruction: `Add '${formattedName}' to the category enum array`,
      currentCategories: currentEnum
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Update product category (Admin only)
export async function updateProductCategory(req, res) {
  try {
    const { productId, newCategory } = req.body

    // Validate category
    const validCategories = Product.schema.paths.category.enumValues
    if (!validCategories.includes(newCategory)) {
      return res.status(400).json({ 
        error: 'Invalid category',
        validCategories
      })
    }

    const product = await Product.findByIdAndUpdate(
      productId,
      { category: newCategory },
      { new: true }
    )

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    res.json({
      message: 'Product category updated',
      product: {
        _id: product._id,
        name: product.name,
        category: product.category
      }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Bulk update categories (Admin only)
export async function bulkUpdateCategories(req, res) {
  try {
    const { updates } = req.body // Array of { productId, newCategory }

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ error: 'Updates array is required' })
    }

    const validCategories = Product.schema.paths.category.enumValues
    const results = []

    for (const update of updates) {
      try {
        const { productId, newCategory } = update

        if (!validCategories.includes(newCategory)) {
          results.push({
            productId,
            success: false,
            error: 'Invalid category'
          })
          continue
        }

        const product = await Product.findByIdAndUpdate(
          productId,
          { category: newCategory },
          { new: true }
        )

        if (!product) {
          results.push({
            productId,
            success: false,
            error: 'Product not found'
          })
        } else {
          results.push({
            productId,
            success: true,
            oldCategory: update.oldCategory,
            newCategory
          })
        }
      } catch (error) {
        results.push({
          productId: update.productId,
          success: false,
          error: error.message
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    const failCount = results.filter(r => !r.success).length

    res.json({
      message: `Bulk update completed: ${successCount} success, ${failCount} failed`,
      results,
      summary: { successCount, failCount }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get products by category for admin management
export async function getProductsByCategory(req, res) {
  try {
    const { category } = req.params
    const { page = 1, limit = 50 } = req.query

    const skip = (page - 1) * limit

    const products = await Product.find({ category })
      .select('name brand category price isActive featuredProduct createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    const total = await Product.countDocuments({ category })

    res.json({
      products,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get category statistics
export async function getCategoryStats(req, res) {
  try {
    const stats = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          avgRating: { $avg: '$rating' },
          activeCount: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          featuredCount: {
            $sum: { $cond: [{ $eq: ['$featuredProduct', true] }, 1, 0] }
          }
        }
      },
      {
        $sort: { count: -1 }
      }
    ])

    const totalProducts = await Product.countDocuments()
    const totalCategories = stats.length

    res.json({
      categoryStats: stats,
      summary: {
        totalProducts,
        totalCategories,
        avgProductsPerCategory: Math.round(totalProducts / totalCategories)
      }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
