import { Router } from 'express'
import { authRequired } from '../middleware/auth.js'
import {
  getPriceHistory,
  trackProductPrice,
  setPriceAlert,
  getUserPriceAlerts,
  updatePriceTracking,
  removePriceAlert,
  getPriceTrackingStats
} from '../controllers/priceTracking.js'

const r = Router()

// All routes require authentication
r.use(authRequired)

// Get price history for a product
r.get('/history', getPriceHistory)

// Start/update price tracking for a product
r.post('/track', trackProductPrice)

// Set price alert
r.post('/alert', setPriceAlert)

// Get user's price alerts
r.get('/alerts', getUserPriceAlerts)

// Remove price alert
r.delete('/alert/:alertId', removePriceAlert)

// Update price tracking (manual refresh)
r.post('/update', updatePriceTracking)

// Get price tracking statistics
r.get('/stats', getPriceTrackingStats)

export default r
