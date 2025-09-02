import { Router } from 'express'
import { authRequired } from '../middleware/auth.js'
import {
  getUserComparisons,
  createComparison,
  addToComparison,
  removeFromComparison,
  getComparison,
  shareComparison,
  getSharedComparison,
  updateComparison,
  deleteComparison
} from '../controllers/comparison.js'

const r = Router()

// Public route for shared comparisons
r.get('/shared/:shareToken', getSharedComparison)

// All other routes require authentication
r.use(authRequired)

// Get user's comparisons
r.get('/', getUserComparisons)

// Create new comparison
r.post('/', createComparison)

// Get specific comparison
r.get('/:comparisonId', getComparison)

// Update comparison
r.put('/:comparisonId', updateComparison)

// Delete comparison
r.delete('/:comparisonId', deleteComparison)

// Add product to comparison
r.post('/:comparisonId/add', addToComparison)

// Remove product from comparison
r.delete('/:comparisonId/remove', removeFromComparison)

// Share comparison
r.post('/:comparisonId/share', shareComparison)

export default r
