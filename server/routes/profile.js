// import { Router } from 'express';
// import { authRequired } from '../middleware/auth.js';
// import { upsertProfile, getMyProfile } from '../controllers/profile.js';

// const r = Router();

// // Get my profile
// r.get('/', authRequired, getMyProfile);

// // Update or create profile
// r.post('/', authRequired, upsertProfile);

// export default r;

import { Router } from 'express'
import { authRequired } from '../middleware/auth.js'
import User from '../models/User.js'
import { upsertProfile, getMyProfile } from '../controllers/profile.js'

const r = Router()

// user doc (minus password)
r.get('/', authRequired, async (req, res) => {
    const user = await User.findById(req.user.id).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(user)
})

// skin profile
r.get('/me', authRequired, getMyProfile)
r.post('/me', authRequired, upsertProfile)

export default r
