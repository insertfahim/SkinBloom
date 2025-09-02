import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export async function register(req,res){
  try{
    const { name,email,password, role } = req.body
    const exists = await User.findOne({ email })
    if(exists) return res.status(400).json({error:'Email in use'})
    const hashed = await bcrypt.hash(password, 10)
    const user = await User.create({ name,email,password:hashed, role: role || 'user' })
    const token = jwt.sign({ id:user._id, role:user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  }catch(e){ res.status(500).json({error:e.message}) }
}

export async function login(req,res){
  try{
    const { email,password } = req.body
    const user = await User.findOne({ email })
    if(!user) return res.status(400).json({error:'Invalid credentials'})
    const ok = await bcrypt.compare(password, user.password)
    if(!ok) return res.status(400).json({error:'Invalid credentials'})
    const token = jwt.sign({ id:user._id, role:user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    })
  }catch(e){ res.status(500).json({error:e.message}) }
}