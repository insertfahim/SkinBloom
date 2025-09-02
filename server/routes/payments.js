// import { Router } from 'express'
// // import { authRequired } from '../middleware/auth.js'
// import { createConsultationCheckout } from '../controllers/payments.js'

// const r = Router()
// r.post('/consultation', authRequired, createConsultationCheckout)
// export default r

import { Router } from 'express'
import { createConsultationCheckout } from '../controllers/Payments.js'

const r = Router()

// Public payment endpoint
r.post('/consultation', createConsultationCheckout)

export default r

