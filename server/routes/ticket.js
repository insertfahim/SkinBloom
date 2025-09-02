import { Router } from 'express'
import { authRequired } from '../middleware/auth.js'
import { createTicket, listTickets, answerTicket } from '../controllers/ticket.js'
const r = Router()
r.get('/', authRequired, listTickets)
r.post('/', authRequired, createTicket)
r.post('/:id/answer', authRequired, answerTicket)
export default r