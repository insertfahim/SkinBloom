// import express from "express";
// import fetch from "node-fetch";

// const router = express.Router();
// const BASE_URL = "https://skincare-api.herokuapp.com";

// router.get("/", async (req, res) => {
//     try {
//         const response = await fetch(`${BASE_URL}/products`);
//         const products = await response.json();
//         res.json(products);
//     } catch (err) {
//         res.status(500).json({ error: "Failed to fetch skincare products" });
//     }
//     });

//     router.get("/:id", async (req, res) => {
//     try {
//         const response = await fetch(`${BASE_URL}/products/${req.params.id}`);
//         const product = await response.json();
//         res.json(product);
//     } catch (err) {
//         res.status(500).json({ error: "Error fetching product details" });
//     }
// });

// export default router;

import { Router } from 'express'
import { authRequired, requireRole } from '../middleware/auth.js'
import { createProduct, getProduct, listProducts, fetchExternalProducts, importExternalProducts } from '../controllers/product.js'

const r = Router()

// Public listing (homepage/shop needs this)
r.get('/', listProducts)

// Get single product by ID (public)
r.get('/:id', getProduct)

// External products endpoints
r.get('/external', fetchExternalProducts)

// Admin-only endpoints
r.post('/', authRequired, requireRole('admin'), createProduct)
r.post('/import', authRequired, requireRole('admin'), importExternalProducts)

export default r
