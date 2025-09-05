import Ticket from '../models/Ticket.js'
import Consultation from '../models/Consultation.js'
import Notification from '../models/Notification.js'
import User from '../models/User.js'
import Product from '../models/Product.js'
import Profile from '../models/Profile.js'
import Stripe from 'stripe'
import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'

// Lazy load Stripe client
let stripeClient
function getStripeClient() {
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY)
  }
  return stripeClient
}

// Notification helper function
async function createNotification(recipient, type, title, message, additionalData = {}) {
  try {
    await Notification.create({
      recipient,
      type,
      title,
      message,
      ...additionalData
    })
  } catch (error) {
    console.error('Error creating notification:', error)
  }
}

// Submit a new consultation request
export async function createTicket(req, res) {
  try {
    const {
      concern,
      skinType,
      symptoms,
      duration,
      previousTreatments,
      allergies,
      photos,
      consultationType,
      preferredDermatologist,
      preferredSlot,
      urgency
    } = req.body

    // Validate required fields
    if (!concern) {
      return res.status(400).json({ 
        error: 'Concern description is required' 
      })
    }

    // For photo reviews, at least one photo is required
    if (consultationType === 'photo_review' && (!photos || photos.length === 0)) {
      return res.status(400).json({ 
        error: 'At least one photo is required for photo review consultations' 
      })
    }

    // Set consultation fee based on type
    let consultationFee = 50; // default for photo_review
    if (consultationType === 'video_call') consultationFee = 100;
    if (consultationType === 'follow_up') consultationFee = 30;

    // Create the ticket
    const ticket = await Ticket.create({
      user: req.user.id,
      concern,
      skinType,
      symptoms: Array.isArray(symptoms) ? symptoms : (symptoms ? [symptoms] : []),
      duration,
      previousTreatments,
      allergies,
      photos: photos ? photos.map(photo => ({
        url: photo.url,
        description: photo.description || ''
      })) : [],
      consultationType: consultationType || 'photo_review',
      preferredDermatologist: preferredDermatologist || null,
      preferredSlot: preferredSlot || null,
      urgency: urgency || 'medium',
      priority: urgency || 'medium',
      consultationFee,
      status: 'submitted'
    })

    // Populate user info
    await ticket.populate('user', 'name email')

    // Create notification for user
    await createNotification(
      req.user.id,
      'ticket_submitted',
      'Consultation Request Submitted',
      `Your ${consultationType?.replace('_', ' ') || 'photo review'} consultation has been submitted successfully. Ticket ID: ${ticket._id}`,
      { 
        ticket: ticket._id,
        actionRequired: true,
        actionUrl: `/tickets/${ticket._id}`,
        actionText: 'View Ticket'
      }
    )

    // Notify preferred dermatologist or all available dermatologists
    let dermatologists = []
    if (preferredDermatologist) {
      const preferredDerm = await User.findById(preferredDermatologist)
      if (preferredDerm && preferredDerm.role === 'dermatologist' && preferredDerm.isActive) {
        dermatologists = [preferredDerm]
      }
    }
    
    if (dermatologists.length === 0) {
      dermatologists = await User.find({ role: 'dermatologist', isActive: true })
    }

    for (const derm of dermatologists) {
      await createNotification(
        derm._id,
        'ticket_submitted',
        'New Consultation Request',
        `A new ${consultationType?.replace('_', ' ') || 'photo review'} consultation has been submitted by ${ticket.user.name}`,
        { 
          ticket: ticket._id,
          sender: req.user.id,
          actionRequired: true,
          actionUrl: `/dermatologist/tickets/${ticket._id}`,
          actionText: 'Review Consultation'
        }
      )
    }

    res.status(201).json({
      success: true,
      ticket,
      message: 'Consultation request submitted successfully'
    })

  } catch (error) {
    console.error('Error creating ticket:', error)
    res.status(500).json({ error: error.message })
  }
}

// List tickets based on user role
export async function listTickets(req, res) {
  try {
    const { status, page = 1, limit = 10 } = req.query
    let query = {}

    // Build query based on user role
    if (req.user.role === 'dermatologist') {
      query = { $or: [{ dermatologist: req.user.id }, { status: 'submitted' }] }
    } else {
      query = { user: req.user.id }
    }

    // Add status filter if provided
    if (status && status !== 'all') {
      query.status = status
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: [
        { path: 'user', select: 'name email profilePicture' },
        { path: 'dermatologist', select: 'name email profilePicture' },
        { path: 'recommendedProducts.product', select: 'name brand price image' }
      ]
    }

    const tickets = await Ticket.find(query)
      .populate(options.populate)
      .sort(options.sort)
      .limit(options.limit * options.page)
      .skip((options.page - 1) * options.limit)

    const total = await Ticket.countDocuments(query)

    res.json({
      tickets,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        pages: Math.ceil(total / options.limit)
      }
    })

  } catch (error) {
    console.error('Error listing tickets:', error)
    res.status(500).json({ error: error.message })
  }
}

// Get single ticket details
export async function getTicket(req, res) {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('user', 'name email profilePicture')
      .populate('dermatologist', 'name email profilePicture qualifications')
      .populate('recommendedProducts.product', 'name brand price image description')
      .populate('messages.sender', 'name role')

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' })
    }

    // Check access permissions
    const hasAccess = 
      ticket.user._id.toString() === req.user.id ||
      (ticket.dermatologist && ticket.dermatologist._id.toString() === req.user.id) ||
      req.user.role === 'dermatologist' ||
      req.user.role === 'admin'

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' })
    }

    res.json(ticket)

  } catch (error) {
    console.error('Error getting ticket:', error)
    res.status(500).json({ error: error.message })
  }
}

// Assign ticket to dermatologist
export async function assignTicket(req, res) {
  try {
    if (req.user.role !== 'dermatologist') {
      return res.status(403).json({ error: 'Only dermatologists can assign tickets' })
    }

    const ticket = await Ticket.findById(req.params.id)
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' })
    }

    if (ticket.dermatologist) {
      return res.status(400).json({ error: 'Ticket already assigned' })
    }

    // Assign ticket
    ticket.dermatologist = req.user.id
    ticket.status = 'assigned'
    await ticket.save()

    await ticket.populate('user', 'name email')
    await ticket.populate('dermatologist', 'name qualifications')

    // Notify user
    await createNotification(
      ticket.user._id,
      'ticket_assigned',
      'Consultation Assigned',
      `Your consultation has been assigned to Dr. ${ticket.dermatologist.name}`,
      { 
        ticket: ticket._id,
        sender: req.user.id,
        actionUrl: `/tickets/${ticket._id}`,
        actionText: 'View Progress'
      }
    )

    res.json({
      success: true,
      ticket,
      message: 'Ticket assigned successfully'
    })

  } catch (error) {
    console.error('Error assigning ticket:', error)
    res.status(500).json({ error: error.message })
  }
}

// Provide consultation and recommendations
export async function provideConsultation(req, res) {
  try {
    if (req.user.role !== 'dermatologist') {
      return res.status(403).json({ error: 'Only dermatologists can provide consultations' })
    }

    const {
      diagnosis,
      recommendations,
      recommendedProducts,
      followUpRequired,
      followUpDate,
      consultationFee
    } = req.body

    const ticket = await Ticket.findById(req.params.id)
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' })
    }

    // Check if dermatologist is assigned to this ticket
    if (ticket.dermatologist && ticket.dermatologist.toString() !== req.user.id) {
      return res.status(403).json({ error: 'You are not assigned to this ticket' })
    }

    // Update ticket with consultation
    ticket.diagnosis = diagnosis
    ticket.recommendations = recommendations
    ticket.recommendedProducts = recommendedProducts || []
    ticket.followUpRequired = followUpRequired || false
    ticket.followUpDate = followUpDate
    ticket.consultationFee = consultationFee || 50
    ticket.status = 'answered'
    ticket.answeredBy = req.user.id
    ticket.answeredAt = new Date()

    if (!ticket.dermatologist) {
      ticket.dermatologist = req.user.id
    }

    await ticket.save()

    // Create consultation record
    const consultation = await Consultation.create({
      ticket: ticket._id,
      user: ticket.user,
      dermatologist: req.user.id,
      diagnosis,
      recommendations,
      treatmentPlan: recommendedProducts?.map((item, index) => ({
        step: index + 1,
        instruction: item.instructions,
        products: [item.product]
      })) || [],
      followUpRequired,
      followUpDate,
      consultationNotes: `Diagnosis: ${diagnosis}\n\nRecommendations: ${recommendations}`,
      status: 'completed',
      completedAt: new Date()
    })

    await ticket.populate('user', 'name email')
    await ticket.populate('dermatologist', 'name qualifications')

    // Generate consultation PDF
    const pdfUrl = await generateConsultationPDF(ticket, consultation)
    consultation.pdfUrl = pdfUrl
    ticket.consultationPdfUrl = pdfUrl
    await consultation.save()
    await ticket.save()

    // Notify user
    await createNotification(
      ticket.user._id,
      'consultation_ready',
      'Consultation Ready',
      `Your consultation is complete! Dr. ${ticket.dermatologist.name} has provided diagnosis and recommendations.`,
      { 
        ticket: ticket._id,
        consultation: consultation._id,
        sender: req.user.id,
        actionRequired: true,
        actionUrl: `/tickets/${ticket._id}`,
        actionText: 'View Consultation'
      }
    )

    res.json({
      success: true,
      ticket,
      consultation,
      message: 'Consultation provided successfully'
    })

  } catch (error) {
    console.error('Error providing consultation:', error)
    res.status(500).json({ error: error.message })
  }
}

// Mark consultation as solved
export async function markAsSolved(req, res) {
  try {
    if (req.user.role !== 'dermatologist') {
      return res.status(403).json({ error: 'Only dermatologists can mark consultations as solved' })
    }

    const ticket = await Ticket.findById(req.params.id)
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' })
    }

    if (ticket.dermatologist.toString() !== req.user.id) {
      return res.status(403).json({ error: 'You are not assigned to this ticket' })
    }

    ticket.status = 'solved'
    ticket.solvedAt = new Date()
    await ticket.save()

    await ticket.populate('user', 'name email')

    // Notify user about payment requirement
    await createNotification(
      ticket.user._id,
      'payment_required',
      'Payment Required',
      `Your consultation is complete. Please proceed with payment of $${ticket.consultationFee} to download your consultation report.`,
      { 
        ticket: ticket._id,
        sender: req.user.id,
        actionRequired: true,
        actionUrl: `/tickets/${ticket._id}/payment`,
        actionText: 'Make Payment'
      }
    )

    res.json({
      success: true,
      ticket,
      message: 'Consultation marked as solved. User notified for payment.'
    })

  } catch (error) {
    console.error('Error marking consultation as solved:', error)
    res.status(500).json({ error: error.message })
  }
}

// Create payment session for consultation
export async function createPaymentSession(req, res) {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('user', 'name email')
      .populate('dermatologist', 'name')

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' })
    }

    // Check if user owns this ticket
    if (ticket.user._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' })
    }

    if (ticket.status !== 'solved') {
      return res.status(400).json({ error: 'Consultation not yet completed' })
    }

    if (ticket.paymentStatus === 'paid') {
      return res.status(400).json({ error: 'Payment already completed' })
    }

    // Create Stripe checkout session
    const session = await getStripeClient().checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: ticket.user.email,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Dermatology Consultation - Dr. ${ticket.dermatologist.name}`,
            description: `Consultation for: ${ticket.concern.substring(0, 100)}...`,
            images: ticket.photos?.length > 0 ? [ticket.photos[0].url] : []
          },
          unit_amount: Math.round(ticket.consultationFee * 100)
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/tickets/${ticket._id}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/tickets/${ticket._id}/payment/cancel`,
      metadata: {
        ticketId: ticket._id.toString(),
        userId: ticket.user._id.toString(),
        dermatologistId: ticket.dermatologist._id.toString(),
        type: 'consultation_payment'
      }
    })

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url
    })

  } catch (error) {
    console.error('Error creating payment session:', error)
    res.status(500).json({ error: error.message })
  }
}

// Verify consultation payment
export async function verifyPayment(req, res) {
  try {
    const { sessionId } = req.params
    const session = await getStripeClient().checkout.sessions.retrieve(sessionId)

    if (!session || session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' })
    }

    const ticketId = session.metadata.ticketId
    const ticket = await Ticket.findById(ticketId)
      .populate('user', 'name email')
      .populate('dermatologist', 'name email')

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' })
    }

    // Update payment status
    ticket.paymentStatus = 'paid'
    ticket.paymentId = session.payment_intent
    ticket.paymentDate = new Date()
    ticket.status = 'paid'
    await ticket.save()

    // Generate payment receipt PDF
    const receiptUrl = await generatePaymentReceiptPDF(ticket, session)
    ticket.paymentReceiptUrl = receiptUrl
    await ticket.save()

    // Notify both user and dermatologist
    await createNotification(
      ticket.user._id,
      'payment_confirmed',
      'Payment Confirmed',
      `Payment of $${ticket.consultationFee} has been confirmed. You can now download your consultation report and payment receipt.`,
      { 
        ticket: ticket._id,
        payment: session.payment_intent,
        actionRequired: true,
        actionUrl: `/tickets/${ticket._id}`,
        actionText: 'Download Reports'
      }
    )

    await createNotification(
      ticket.dermatologist._id,
      'payment_received',
      'Payment Received',
      `Payment of $${ticket.consultationFee} has been received for consultation with ${ticket.user.name}.`,
      { 
        ticket: ticket._id,
        sender: ticket.user._id,
        payment: session.payment_intent,
        actionUrl: `/dermatologist/tickets/${ticket._id}`,
        actionText: 'View Consultation'
      }
    )

    res.json({
      success: true,
      ticket,
      paymentDetails: {
        amount: session.amount_total / 100,
        currency: session.currency,
        paymentIntent: session.payment_intent
      },
      message: 'Payment verified successfully'
    })

  } catch (error) {
    console.error('Error verifying payment:', error)
    res.status(500).json({ error: error.message })
  }
}

// Generate consultation PDF
async function generateConsultationPDF(ticket, consultation) {
  try {
    const doc = new PDFDocument({ margin: 50 })
    const filename = `consultation-${ticket._id}-${Date.now()}.pdf`
    const filepath = path.join(process.cwd(), 'uploads', 'consultations', filename)

    // Ensure directory exists
    const dir = path.dirname(filepath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    // Pipe the PDF to a file
    doc.pipe(fs.createWriteStream(filepath))

    // Header
    doc.fontSize(20).font('Helvetica-Bold')
    doc.text('SkinBloom Dermatology Consultation Report', { align: 'center' })
    doc.moveDown(2)

    // Patient Information
    doc.fontSize(16).font('Helvetica-Bold')
    doc.text('Patient Information', { underline: true })
    doc.moveDown(0.5)
    
    doc.fontSize(12).font('Helvetica')
    doc.text(`Name: ${ticket.user.name}`)
    doc.text(`Consultation Date: ${ticket.answeredAt.toLocaleDateString()}`)
    doc.text(`Ticket ID: ${ticket._id}`)
    doc.moveDown()

    // Dermatologist Information
    doc.fontSize(16).font('Helvetica-Bold')
    doc.text('Dermatologist Information', { underline: true })
    doc.moveDown(0.5)
    
    doc.fontSize(12).font('Helvetica')
    doc.text(`Dr. ${ticket.dermatologist.name}`)
    doc.moveDown()

    // Concern
    doc.fontSize(16).font('Helvetica-Bold')
    doc.text('Chief Concern', { underline: true })
    doc.moveDown(0.5)
    
    doc.fontSize(12).font('Helvetica')
    doc.text(ticket.concern, { align: 'justify' })
    doc.moveDown()

    // Patient Details
    if (ticket.skinType || ticket.symptoms?.length || ticket.duration) {
      doc.fontSize(16).font('Helvetica-Bold')
      doc.text('Patient Details', { underline: true })
      doc.moveDown(0.5)
      
      doc.fontSize(12).font('Helvetica')
      if (ticket.skinType) doc.text(`Skin Type: ${ticket.skinType}`)
      if (ticket.symptoms?.length) doc.text(`Symptoms: ${ticket.symptoms.join(', ')}`)
      if (ticket.duration) doc.text(`Duration: ${ticket.duration}`)
      if (ticket.previousTreatments) doc.text(`Previous Treatments: ${ticket.previousTreatments}`)
      if (ticket.allergies) doc.text(`Known Allergies: ${ticket.allergies}`)
      doc.moveDown()
    }

    // Diagnosis
    doc.fontSize(16).font('Helvetica-Bold')
    doc.text('Diagnosis', { underline: true })
    doc.moveDown(0.5)
    
    doc.fontSize(12).font('Helvetica')
    doc.text(ticket.diagnosis, { align: 'justify' })
    doc.moveDown()

    // Recommendations
    doc.fontSize(16).font('Helvetica-Bold')
    doc.text('Treatment Recommendations', { underline: true })
    doc.moveDown(0.5)
    
    doc.fontSize(12).font('Helvetica')
    doc.text(ticket.recommendations, { align: 'justify' })
    doc.moveDown()

    // Recommended Products
    if (ticket.recommendedProducts?.length) {
      doc.fontSize(16).font('Helvetica-Bold')
      doc.text('Recommended Products', { underline: true })
      doc.moveDown(0.5)
      
      ticket.recommendedProducts.forEach((item, index) => {
        doc.fontSize(12).font('Helvetica-Bold')
        doc.text(`${index + 1}. ${item.product?.name || 'Product'}`)
        doc.fontSize(11).font('Helvetica')
        if (item.instructions) doc.text(`   Instructions: ${item.instructions}`)
        if (item.priority) doc.text(`   Priority: ${item.priority}`)
        doc.moveDown(0.3)
      })
      doc.moveDown()
    }

    // Follow-up
    if (ticket.followUpRequired) {
      doc.fontSize(16).font('Helvetica-Bold')
      doc.text('Follow-up Instructions', { underline: true })
      doc.moveDown(0.5)
      
      doc.fontSize(12).font('Helvetica')
      doc.text(`Follow-up required: Yes`)
      if (ticket.followUpDate) {
        doc.text(`Recommended follow-up date: ${ticket.followUpDate.toLocaleDateString()}`)
      }
      doc.moveDown()
    }

    // Footer
    doc.fontSize(10).font('Helvetica')
    doc.text('This consultation report is confidential and intended solely for the patient named above.', {
      align: 'center',
      y: doc.page.height - 100
    })

    // Finalize the PDF
    doc.end()

    return `/uploads/consultations/${filename}`

  } catch (error) {
    console.error('Error generating consultation PDF:', error)
    throw error
  }
}

// Generate payment receipt PDF
async function generatePaymentReceiptPDF(ticket, paymentSession) {
  try {
    const doc = new PDFDocument({ margin: 50 })
    const filename = `payment-receipt-${ticket._id}-${Date.now()}.pdf`
    const filepath = path.join(process.cwd(), 'uploads', 'receipts', filename)

    // Ensure directory exists
    const dir = path.dirname(filepath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    // Pipe the PDF to a file
    doc.pipe(fs.createWriteStream(filepath))

    // Header
    doc.fontSize(20).font('Helvetica-Bold')
    doc.text('SkinBloom Payment Receipt', { align: 'center' })
    doc.moveDown(2)

    // Receipt Information
    doc.fontSize(16).font('Helvetica-Bold')
    doc.text('Payment Details', { underline: true })
    doc.moveDown(0.5)
    
    doc.fontSize(12).font('Helvetica')
    doc.text(`Receipt Number: ${paymentSession.payment_intent}`)
    doc.text(`Payment Date: ${new Date(paymentSession.created * 1000).toLocaleDateString()}`)
    doc.text(`Amount Paid: $${(paymentSession.amount_total / 100).toFixed(2)} ${paymentSession.currency.toUpperCase()}`)
    doc.text(`Payment Method: ${paymentSession.payment_method_types[0].toUpperCase()}`)
    doc.moveDown()

    // Service Information
    doc.fontSize(16).font('Helvetica-Bold')
    doc.text('Service Information', { underline: true })
    doc.moveDown(0.5)
    
    doc.fontSize(12).font('Helvetica')
    doc.text(`Service: Dermatology Consultation`)
    doc.text(`Consultation ID: ${ticket._id}`)
    doc.text(`Patient: ${ticket.user.name}`)
    doc.text(`Dermatologist: Dr. ${ticket.dermatologist.name}`)
    doc.moveDown()

    // Footer
    doc.fontSize(10).font('Helvetica')
    doc.text('Thank you for choosing SkinBloom for your skincare consultation needs.', {
      align: 'center',
      y: doc.page.height - 100
    })

    // Finalize the PDF
    doc.end()

    return `/uploads/receipts/${filename}`

  } catch (error) {
    console.error('Error generating payment receipt PDF:', error)
    throw error
  }
}

// Add message to ticket
export async function addMessage(req, res) {
  try {
    const { message } = req.body
    const ticket = await Ticket.findById(req.params.id)

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' })
    }

    // Check access permissions
    const hasAccess = 
      ticket.user.toString() === req.user.id ||
      (ticket.dermatologist && ticket.dermatologist.toString() === req.user.id) ||
      req.user.role === 'admin'

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' })
    }

    ticket.messages.push({
      sender: req.user.id,
      message,
      timestamp: new Date()
    })

    await ticket.save()
    await ticket.populate('messages.sender', 'name role')

    res.json({
      success: true,
      message: ticket.messages[ticket.messages.length - 1]
    })

  } catch (error) {
    console.error('Error adding message:', error)
    res.status(500).json({ error: error.message })
  }
}

// Legacy function for backward compatibility
export async function answerTicket(req, res) {
  // Redirect to the new provideConsultation function
  return provideConsultation(req, res)
}

// Get user's tickets specifically
export async function getUserTickets(req, res) {
  try {
    const tickets = await Ticket.find({ user: req.user.id })
      .populate('user', 'name email')
      .populate('dermatologist', 'name')
      .sort({ createdAt: -1 })

    res.json(tickets)
  } catch (error) {
    console.error('Error getting user tickets:', error)
    res.status(500).json({ error: error.message })
  }
}

// Get single ticket by ID
export async function getTicketById(req, res) {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('user', 'name email')
      .populate('dermatologist', 'name')

    if (!ticket) return res.status(404).json({ error: 'Ticket not found' })

    // Check if user owns this ticket or is a dermatologist
    if (ticket.user._id.toString() !== req.user.id && req.user.role !== 'dermatologist') {
      return res.status(403).json({ error: 'Access denied' })
    }

    res.json(ticket)
  } catch (error) {
    console.error('Error getting ticket:', error)
    res.status(500).json({ error: error.message })
  }
}

// Get dermatologist tickets
export async function getDermatologistTickets(req, res) {
  try {
    // Build query: Dermatologist sees tickets assigned to them OR unassigned newly submitted ones
    // Admin sees everything.
    const baseQuery = {}
    if (req.user.role !== 'admin') {
      baseQuery.$or = [
        { dermatologist: req.user.id },
        { dermatologist: { $exists: false } },
        { dermatologist: null }
      ]
    }

    // Fetch tickets with minimal user info first
    const tickets = await Ticket.find(baseQuery)
      .populate('user', 'name role')
      .populate('dermatologist', 'name role')
      .sort({ priority: -1, createdAt: -1 })

    // Collect userIds for profile enrichment
    const userIds = tickets.map(t => t.user?._id).filter(Boolean)
    const profiles = await Profile.find({ userId: { $in: userIds } })
      .select('userId age gender photo')
    const profileMap = new Map(profiles.map(p => [p.userId.toString(), p]))

    // Map backend statuses to simplified front-end statuses the dashboard expects
    const statusMap = {
      submitted: 'pending',
      assigned: 'assigned',
      in_review: 'in-consultation',
      answered: 'consultation-provided',
      solved: 'resolved',
      paid: 'paid',
      closed: 'closed'
    }

    const sanitized = tickets.map(t => {
      const profile = t.user ? profileMap.get(t.user._id.toString()) : null
      return {
        _id: t._id,
        concern: t.concern,
    symptoms: t.symptoms || [],
        status: statusMap[t.status] || t.status,
        rawStatus: t.status,
        priority: t.priority,
        paymentStatus: t.paymentStatus, // pending | paid | refunded
  isPaid: t.paymentStatus === 'paid',
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        user: t.user ? {
          _id: t.user._id,
            name: t.user.name,
            role: t.user.role,
            profile: profile ? {
              age: profile.age,
              gender: profile.gender,
      photo: profile.photo,
      concerns: profile.concerns,
      qualification: profile.qualification
            } : null
        } : null,
        dermatologist: t.dermatologist ? {
          _id: t.dermatologist._id,
          name: t.dermatologist.name,
          role: t.dermatologist.role
        } : null,
        photos: (t.photos || []).map(p => p.url),
        diagnosis: t.diagnosis,
        recommendations: t.recommendations,
        recommendedProducts: (t.recommendedProducts || []).map(rp => ({
          product: rp.product,
          instructions: rp.instructions,
          priority: rp.priority
        }))
      }
    })

    res.json({
      tickets: sanitized,
      meta: {
        counts: {
          pending: sanitized.filter(t => t.status === 'pending').length,
          assigned: sanitized.filter(t => t.status === 'assigned').length,
          inConsultation: sanitized.filter(t => t.status === 'in-consultation').length,
          provided: sanitized.filter(t => t.status === 'consultation-provided').length,
          resolved: sanitized.filter(t => t.status === 'resolved').length,
          paid: sanitized.filter(t => t.status === 'paid').length
        },
        total: sanitized.length
      }
    })
  } catch (error) {
    console.error('Error getting dermatologist tickets:', error)
    res.status(500).json({ error: error.message })
  }
}

// Process payment alias
export async function processPayment(req, res) {
  return createPaymentSession(req, res)
}

// Mark as resolved alias
export async function markAsResolved(req, res) {
  return markAsSolved(req, res)
}

// PDF Generation endpoint functions
export async function downloadConsultationPDF(req, res) {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('user', 'name email')
      .populate('dermatologist', 'name')

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' })
    }
    if (!ticket.consultation) {
      return res.status(404).json({ error: 'No consultation found' })
    }

    // Check access
    if (ticket.user._id.toString() !== req.user.id && req.user.role !== 'dermatologist') {
      return res.status(403).json({ error: 'Access denied' })
    }

    const PDFDocument = require('pdfkit')
    const doc = new PDFDocument()

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=consultation-${ticket._id}.pdf`)

    doc.pipe(res)

    // PDF Header
    doc.fontSize(20).text('Medical Consultation Report', { align: 'center' })
    doc.moveDown()

    // Patient Information
    doc.fontSize(14).text('Patient Information:', { underline: true })
    doc.fontSize(12)
    doc.text(`Name: ${ticket.user.name}`)
    doc.text(`Email: ${ticket.user.email}`)
    doc.text(`Skin Type: ${ticket.skinType || 'Not specified'}`)
    doc.text(`Date: ${new Date(ticket.createdAt).toLocaleDateString()}`)
    doc.moveDown()

    // Concern
    doc.fontSize(14).text('Patient Concern:', { underline: true })
    doc.fontSize(12).text(ticket.concern)
    doc.moveDown()

    if (ticket.symptoms) {
      doc.fontSize(14).text('Symptoms:', { underline: true })
      doc.fontSize(12).text(ticket.symptoms)
      doc.moveDown()
    }

    // Consultation Details
    doc.fontSize(14).text('Professional Consultation:', { underline: true })
    doc.fontSize(12)
    doc.text(`Dermatologist: Dr. ${ticket.dermatologist?.name || 'Unknown'}`)
    doc.text(`Diagnosis: ${ticket.consultation.diagnosis}`)
    doc.moveDown()

    if (ticket.consultation.treatmentPlan) {
      doc.text(`Treatment Plan: ${ticket.consultation.treatmentPlan}`)
      doc.moveDown()
    }

    if (ticket.consultation.recommendedProducts?.length > 0) {
      doc.text('Recommended Products:')
      ticket.consultation.recommendedProducts.forEach(product => {
        doc.text(`- ${product.name}`)
      })
    }

    doc.end()

  } catch (error) {
    console.error('Error generating consultation PDF:', error)
    res.status(500).json({ error: error.message })
  }
}

export async function downloadPaymentReceiptPDF(req, res) {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('user', 'name email')

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' })
    }
    if (ticket.paymentStatus !== 'completed') {
      return res.status(404).json({ error: 'Payment not completed' })
    }

    // Check access
    if (ticket.user._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' })
    }

    const PDFDocument = require('pdfkit')
    const doc = new PDFDocument()

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=receipt-${ticket._id}.pdf`)

    doc.pipe(res)

    // PDF Header
    doc.fontSize(20).text('Payment Receipt', { align: 'center' })
    doc.moveDown()

    // Payment Information
    doc.fontSize(14).text('Payment Details:', { underline: true })
    doc.fontSize(12)
    doc.text(`Receipt ID: ${ticket._id}`)
    doc.text(`Patient: ${ticket.user.name}`)
    doc.text(`Email: ${ticket.user.email}`)
    doc.text(`Service: Dermatology Consultation`)
    doc.text(`Amount: $50.00`)
    doc.text(`Payment Date: ${new Date(ticket.paymentDate).toLocaleDateString()}`)
    doc.text(`Payment Status: Completed`)
    doc.moveDown()

    // Service Details
    doc.fontSize(14).text('Service Details:', { underline: true })
    doc.fontSize(12)
    doc.text(`Consultation Date: ${new Date(ticket.createdAt).toLocaleDateString()}`)
    doc.text(`Consultation Type: ${ticket.urgency} Priority`)
    doc.text(`Skin Type Assessment: ${ticket.skinType || 'Not specified'}`)

    doc.end()

  } catch (error) {
    console.error('Error generating payment receipt PDF:', error)
    res.status(500).json({ error: error.message })
  }
}