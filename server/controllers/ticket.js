import Ticket from '../models/Ticket.js'

export async function createTicket(req,res){
  try{
    const t = await Ticket.create({ ...req.body, user: req.user.id })
    res.json(t)
  }catch(e){ res.status(500).json({error:e.message}) }
}

export async function listTickets(req,res){
  try{
    const q = req.user.role === 'dermatologist' ? {} : { user:req.user.id }
    const items = await Ticket.find(q).sort({ createdAt:-1 })
    res.json(items)
  }catch(e){ res.status(500).json({error:e.message}) }
}

export async function answerTicket(req,res){
  try{
    if(req.user.role!=='dermatologist') return res.status(403).json({error:'Dermatologists only'})
    const t = await Ticket.findByIdAndUpdate(req.params.id, { answer:req.body.answer, status:'answered', answeredBy:req.user.id }, { new:true })
    res.json(t)
  }catch(e){ res.status(500).json({error:e.message}) }
}