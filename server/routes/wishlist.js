import { Router } from 'express'
import { authRequired } from '../middleware/auth.js'
import {
  getUserWishlist,
  addToWishlist,
  removeFromWishlist,
  updateWishlistSettings,
  updatePriceAlert,
  getPublicWishlist
} from '../controllers/wishlist.js'

const r = Router()

// All wishlist routes require authentication
r.use(authRequired)

// Get user's wishlist
r.get('/', getUserWishlist)

// Add product to wishlist
r.post('/add', addToWishlist)

// Remove product from wishlist
r.delete('/remove', removeFromWishlist)

// Update wishlist settings
r.put('/settings', updateWishlistSettings)

// Update price alert for wishlist item
r.put('/price-alert', updatePriceAlert)

// Public wishlist (no auth required)
r.get('/public/:userId', getPublicWishlist)

export default r
