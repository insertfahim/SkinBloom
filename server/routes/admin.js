import express from 'express'
import { 
  getCategories, 
  addCategory,
  updateProductCategory,
  bulkUpdateCategories,
  getProductsByCategory,
  getCategoryStats
} from '../controllers/admin.js'
import { authRequired } from '../middleware/auth.js'

const router = express.Router()

// Middleware to check admin role
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}

// Apply authentication to all admin routes
router.use(authRequired)
router.use(requireAdmin)

// Category management routes
router.get('/categories', getCategories)
router.post('/categories', addCategory)
router.get('/categories/stats', getCategoryStats)
router.get('/categories/:category/products', getProductsByCategory)

// Product category management
router.put('/products/category', updateProductCategory)
router.put('/products/categories/bulk', bulkUpdateCategories)

export default router
