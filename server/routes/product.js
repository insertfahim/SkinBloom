// import { Router } from 'express';
// import { authRequired } from '../middleware/auth.js';
// import { createProduct, listProducts } from '../controllers/product.js';

// const r = Router();

// // Public product listing
// r.get('/', listProducts);

// // Only authenticated (ideally admin) can create products
// r.post('/', authRequired, createProduct);

// export default r;
import { Router } from 'express'
import { authRequired, requireRole } from '../middleware/auth.js'
import { createProduct, listProducts } from '../controllers/product.js'

const r = Router()

// Public listing (homepage/shop needs this)
r.get('/', listProducts)

// Admin-only create
r.post('/', authRequired, requireRole('admin'), createProduct)

export default r
