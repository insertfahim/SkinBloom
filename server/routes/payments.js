import { Router } from 'express'
import { authRequired } from '../middleware/auth.js'
import { 
    createConsultationCheckout, 
    createProductCheckout,
    verifyPayment,
    getPaymentOptions
} from '../controllers/payments.js'

const r = Router()

// Consultation payment endpoint
r.post('/consultation', createConsultationCheckout)

// Product checkout endpoint
r.post('/checkout', authRequired, createProductCheckout)

// Payment verification endpoint
r.get('/verify/:sessionId', verifyPayment)

// Get payment options (EMI, discounts etc)
r.get('/options', getPaymentOptions)

export default r

