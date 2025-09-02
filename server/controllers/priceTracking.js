import PriceHistory from '../models/PriceHistory.js'
import Product from '../models/Product.js'
import externalApiService from '../services/externalApiService.js'

// Get price history for a product
export async function getPriceHistory(req, res) {
  try {
    const { productId, externalProductId, productSource } = req.query

    let query = {}
    if (productSource === 'local' && productId) {
      query.productId = productId
    } else if (externalProductId && productSource) {
      query.externalProductId = externalProductId
      query.productSource = productSource
    } else {
      return res.status(400).json({ error: 'Product identification required' })
    }

    const priceHistory = await PriceHistory.findOne(query)
    
    if (!priceHistory) {
      return res.json({ 
        priceHistory: [],
        currentPrice: null,
        lowestPrice: null,
        highestPrice: null,
        averagePrice: null
      })
    }

    res.json({
      priceHistory: priceHistory.priceHistory.sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt)),
      currentPrice: priceHistory.currentPrice,
      lowestPrice: priceHistory.lowestPrice,
      highestPrice: priceHistory.highestPrice,
      averagePrice: priceHistory.averagePrice,
      lastUpdated: priceHistory.lastUpdated
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Create or update price tracking for a product
export async function trackProductPrice(req, res) {
  try {
    const { 
      productId, 
      externalProductId, 
      productSource,
      productName,
      productBrand,
      currentPrice,
      updateFrequency = 'daily'
    } = req.body

    let query = {}
    if (productSource === 'local' && productId) {
      query.productId = productId
    } else if (externalProductId && productSource) {
      query.externalProductId = externalProductId
      query.productSource = productSource
    } else {
      return res.status(400).json({ error: 'Product identification required' })
    }

    let priceHistory = await PriceHistory.findOne(query)

    if (!priceHistory) {
      // Create new price tracking
      priceHistory = new PriceHistory({
        ...query,
        productName,
        productBrand,
        priceHistory: [],
        updateFrequency,
        isActive: true
      })
    }

    // Add current price to history
    priceHistory.priceHistory.push({
      price: currentPrice,
      source: productSource,
      recordedAt: new Date()
    })

    priceHistory.lastUpdated = new Date()
    await priceHistory.save()

    res.json({ 
      message: 'Price tracking enabled',
      priceHistory: {
        currentPrice: priceHistory.currentPrice,
        lowestPrice: priceHistory.lowestPrice,
        highestPrice: priceHistory.highestPrice,
        averagePrice: priceHistory.averagePrice
      }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Set price alert for a product
export async function setPriceAlert(req, res) {
  try {
    const { 
      productId, 
      externalProductId, 
      productSource,
      targetPrice,
      alertType = 'below',
      threshold
    } = req.body

    let query = {}
    if (productSource === 'local' && productId) {
      query.productId = productId
    } else if (externalProductId && productSource) {
      query.externalProductId = externalProductId
      query.productSource = productSource
    } else {
      return res.status(400).json({ error: 'Product identification required' })
    }

    let priceHistory = await PriceHistory.findOne(query)

    if (!priceHistory) {
      return res.status(404).json({ error: 'Product not found in price tracking. Please start tracking first.' })
    }

    // Check if user already has an alert for this product
    const existingAlert = priceHistory.priceAlerts.find(
      alert => alert.userId.toString() === req.user.id
    )

    if (existingAlert) {
      // Update existing alert
      existingAlert.targetPrice = targetPrice
      existingAlert.alertType = alertType
      existingAlert.threshold = threshold
      existingAlert.isActive = true
    } else {
      // Create new alert
      priceHistory.priceAlerts.push({
        userId: req.user.id,
        targetPrice,
        alertType,
        threshold,
        isActive: true
      })
    }

    await priceHistory.save()

    res.json({ message: 'Price alert set successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get user's price alerts
export async function getUserPriceAlerts(req, res) {
  try {
    const priceHistories = await PriceHistory.find({
      'priceAlerts.userId': req.user.id,
      'priceAlerts.isActive': true
    }).populate('productId')

    const alerts = []
    
    priceHistories.forEach(history => {
      const userAlert = history.priceAlerts.find(
        alert => alert.userId.toString() === req.user.id && alert.isActive
      )
      
      if (userAlert) {
        alerts.push({
          _id: userAlert._id,
          productId: history.productId,
          externalProductId: history.externalProductId,
          productSource: history.productSource,
          productName: history.productName,
          productBrand: history.productBrand,
          currentPrice: history.currentPrice,
          targetPrice: userAlert.targetPrice,
          alertType: userAlert.alertType,
          threshold: userAlert.threshold,
          createdAt: userAlert.createdAt,
          lastTriggered: userAlert.lastTriggered
        })
      }
    })

    res.json({ alerts, total: alerts.length })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Update price tracking (manual refresh)
export async function updatePriceTracking(req, res) {
  try {
    const { productId, externalProductId, productSource } = req.body

    let query = {}
    if (productSource === 'local' && productId) {
      query.productId = productId
    } else if (externalProductId && productSource) {
      query.externalProductId = externalProductId
      query.productSource = productSource
    } else {
      return res.status(400).json({ error: 'Product identification required' })
    }

    const priceHistory = await PriceHistory.findOne(query)
    if (!priceHistory) {
      return res.status(404).json({ error: 'Product not found in price tracking' })
    }

    // Fetch current price from external API
    let currentPrice = null
    
    try {
      if (productSource === 'makeup-api') {
        // This would need to be implemented based on the specific API
        // For now, simulate price update
        const lastPrice = priceHistory.currentPrice || 0
        currentPrice = lastPrice + (Math.random() - 0.5) * 2 // Random price fluctuation
      } else if (productSource === 'sephora') {
        // Implement Sephora price check
        // currentPrice = await fetchSephoraPrice(externalProductId)
      }
    } catch (error) {
      console.log('Error fetching current price:', error.message)
    }

    if (currentPrice !== null) {
      // Add new price point
      priceHistory.priceHistory.push({
        price: currentPrice,
        source: productSource,
        recordedAt: new Date()
      })

      priceHistory.lastUpdated = new Date()
      await priceHistory.save()

      // Check for price alerts
      await checkPriceAlerts(priceHistory)

      res.json({ 
        message: 'Price updated',
        currentPrice: priceHistory.currentPrice,
        previousPrice: priceHistory.priceHistory[priceHistory.priceHistory.length - 2]?.price
      })
    } else {
      res.json({ message: 'Could not fetch current price' })
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Remove price alert
export async function removePriceAlert(req, res) {
  try {
    const { alertId } = req.params

    const priceHistory = await PriceHistory.findOne({
      'priceAlerts._id': alertId,
      'priceAlerts.userId': req.user.id
    })

    if (!priceHistory) {
      return res.status(404).json({ error: 'Price alert not found' })
    }

    priceHistory.priceAlerts = priceHistory.priceAlerts.filter(
      alert => alert._id.toString() !== alertId
    )

    await priceHistory.save()
    res.json({ message: 'Price alert removed' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Helper function to check price alerts
async function checkPriceAlerts(priceHistory) {
  try {
    const currentPrice = priceHistory.currentPrice
    const alertsToTrigger = []

    priceHistory.priceAlerts.forEach(alert => {
      if (!alert.isActive) return

      let shouldTrigger = false

      switch (alert.alertType) {
        case 'below':
          shouldTrigger = currentPrice <= alert.targetPrice
          break
        case 'above':
          shouldTrigger = currentPrice >= alert.targetPrice
          break
        case 'drop_percent':
          const previousPrice = priceHistory.priceHistory[priceHistory.priceHistory.length - 2]?.price
          if (previousPrice) {
            const dropPercent = ((previousPrice - currentPrice) / previousPrice) * 100
            shouldTrigger = dropPercent >= alert.threshold
          }
          break
      }

      if (shouldTrigger) {
        alert.lastTriggered = new Date()
        alertsToTrigger.push(alert)
      }
    })

    if (alertsToTrigger.length > 0) {
      await priceHistory.save()
      // Here you would send notifications (email, push, etc.)
      console.log(`Triggered ${alertsToTrigger.length} price alerts for ${priceHistory.productName}`)
    }
  } catch (error) {
    console.error('Error checking price alerts:', error)
  }
}

// Get price tracking statistics
export async function getPriceTrackingStats(req, res) {
  try {
    const stats = await PriceHistory.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          avgPricePoints: { $avg: { $size: '$priceHistory' } },
          totalAlerts: { $sum: { $size: '$priceAlerts' } }
        }
      }
    ])

    const userAlerts = await PriceHistory.countDocuments({
      'priceAlerts.userId': req.user.id,
      'priceAlerts.isActive': true
    })

    res.json({
      totalTrackedProducts: stats[0]?.totalProducts || 0,
      averagePricePoints: Math.round(stats[0]?.avgPricePoints || 0),
      totalActiveAlerts: stats[0]?.totalAlerts || 0,
      userActiveAlerts: userAlerts
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
