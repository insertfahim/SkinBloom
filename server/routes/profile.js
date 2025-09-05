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
import { authRequired, dermatologistRequired } from '../middleware/auth.js'
import User from '../models/User.js'
import Profile from '../models/Profile.js'
import { upsertProfile, getMyProfile } from '../controllers/profile.js'

const r = Router()

// user doc (minus password)
r.get('/', authRequired, async (req, res) => {
    const user = await User.findById(req.user.id).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(user)
})

// Dermatologist view user profile for consultation
r.get('/user/:userId', dermatologistRequired, async (req, res) => {
    try {
        const { userId } = req.params
        
        // Get user basic info
        const user = await User.findById(userId).select('name email role createdAt')
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }
        
        // Get user's skin profile
        const profile = await Profile.findOne({ userId }).select('photo age gender skinType concerns allergies notes consultationPhotos')
        
        // Return limited profile info for dermatologist consultation
        res.json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                memberSince: user.createdAt
            },
            profile: profile ? {
                photo: profile.photo,
                age: profile.age,
                gender: profile.gender,
                skinType: profile.skinType,
                concerns: profile.concerns,
                allergies: profile.allergies,
                notes: profile.notes,
                consultationPhotos: profile.consultationPhotos
            } : null
        })
    } catch (error) {
        console.error('Error fetching user profile for dermatologist:', error)
        res.status(500).json({ error: error.message })
    }
})

// skin profile
r.get('/me', authRequired, getMyProfile)
r.post('/me', authRequired, upsertProfile)

export default r
