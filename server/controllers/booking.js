import Booking from '../models/Booking.js'
import User from '../models/User.js'
import Ticket from '../models/Ticket.js'
import Consultation from '../models/Consultation.js'
import Notification from '../models/Notification.js'
import Stripe from 'stripe'

// Lazy load Stripe client
let stripeClient
function getStripeClient() {
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY)
  }
  return stripeClient
}

// Helper function to create notifications
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

// Get available time slots for a dermatologist
export async function getAvailableSlots(req, res) {
  try {
    const { dermatologistId } = req.params
    const { date, sessionType = 'video_call' } = req.query
    
    const dermatologist = await User.findById(dermatologistId)
    if (!dermatologist || dermatologist.role !== 'dermatologist') {
      return res.status(404).json({ error: 'Dermatologist not found' })
    }
    
    // Get the day of week for the requested date
    const requestedDate = new Date(date)
    const dayOfWeek = requestedDate.toLocaleDateString('en-US', { weekday: 'lowercase' })
    
    // Get dermatologist's availability for that day
    const dayAvailability = dermatologist.availability?.[dayOfWeek] || []
    
    if (dayAvailability.length === 0) {
      return res.json({ slots: [] })
    }
    
    // Get existing bookings for that date
    const startOfDay = new Date(requestedDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(requestedDate)
    endOfDay.setHours(23, 59, 59, 999)
    
    const existingBookings = await Booking.find({
      dermatologist: dermatologistId,
      scheduledDateTime: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $in: ['scheduled', 'confirmed', 'in_progress'] }
    })
    
    const bookedSlots = existingBookings.map(booking => 
      booking.scheduledDateTime.toTimeString().substring(0, 5)
    )
    
    // Generate available slots
    const slots = []
    const sessionDuration = sessionType === 'video_call' ? 60 : 30 // minutes
    
    dayAvailability.forEach(timeRange => {
      const startTime = timeRange.start
      const endTime = timeRange.end
      
      let currentTime = startTime
      while (currentTime < endTime) {
        if (!bookedSlots.includes(currentTime)) {
          const slotDateTime = new Date(requestedDate)
          const [hours, minutes] = currentTime.split(':')
          slotDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)
          
          // Only show future slots
          if (slotDateTime > new Date()) {
            slots.push({
              id: `${date}-${currentTime}`,
              date,
              time: currentTime,
              dateTime: slotDateTime,
              available: true
            })
          }
        }
        
        // Add session duration + buffer time
        const [hours, minutes] = currentTime.split(':')
        const totalMinutes = parseInt(hours) * 60 + parseInt(minutes) + sessionDuration + 15
        const newHours = Math.floor(totalMinutes / 60)
        const newMinutes = totalMinutes % 60
        currentTime = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`
      }
    })
    
    res.json({ slots })
    
  } catch (error) {
    console.error('Error getting available slots:', error)
    res.status(500).json({ error: error.message })
  }
}

// Create a new booking
export async function createBooking(req, res) {
  try {
    const {
      dermatologistId,
      sessionType,
      scheduledDateTime,
      patientNotes,
      ticketId
    } = req.body
    
    // Validate dermatologist
    const dermatologist = await User.findById(dermatologistId)
    if (!dermatologist || dermatologist.role !== 'dermatologist') {
      return res.status(404).json({ error: 'Dermatologist not found' })
    }
    
    // Check if slot is still available
    const existingBooking = await Booking.findOne({
      dermatologist: dermatologistId,
      scheduledDateTime: new Date(scheduledDateTime),
      status: { $in: ['scheduled', 'confirmed', 'in_progress'] }
    })
    
    if (existingBooking) {
      return res.status(400).json({ error: 'Time slot is no longer available' })
    }
    
    // Calculate consultation fee
    const consultationFee = dermatologist.consultationFee?.[sessionType] || 
      (sessionType === 'video_call' ? 100 : sessionType === 'follow_up' ? 30 : 50)
    
    // Create booking
    const booking = await Booking.create({
      patient: req.user.id,
      dermatologist: dermatologistId,
      sessionType,
      scheduledDateTime: new Date(scheduledDateTime),
      consultationFee,
      patientNotes,
      ticket: ticketId || null
    })
    
    await booking.populate('patient', 'name email')
    await booking.populate('dermatologist', 'name specialization')
    
    // Create notifications
    await createNotification(
      dermatologist._id,
      'booking_created',
      'New Booking Request',
      `${booking.patient.name} has booked a ${sessionType.replace('_', ' ')} consultation for ${new Date(scheduledDateTime).toLocaleString()}`,
      {
        booking: booking._id,
        sender: req.user.id,
        actionRequired: true,
        actionUrl: `/dermatologist/bookings/${booking._id}`,
        actionText: 'View Booking'
      }
    )
    
    await createNotification(
      req.user.id,
      'booking_created',
      'Booking Confirmed',
      `Your ${sessionType.replace('_', ' ')} consultation with Dr. ${dermatologist.name} has been booked for ${new Date(scheduledDateTime).toLocaleString()}`,
      {
        booking: booking._id,
        actionUrl: `/bookings/${booking._id}`,
        actionText: 'View Booking'
      }
    )
    
    res.status(201).json({
      success: true,
      booking,
      message: 'Booking created successfully'
    })
    
  } catch (error) {
    console.error('Error creating booking:', error)
    res.status(500).json({ error: error.message })
  }
}

// Get user's bookings
export async function getUserBookings(req, res) {
  try {
    const { status, upcoming } = req.query
    let query = { patient: req.user.id }
    
    if (status && status !== 'all') {
      query.status = status
    }
    
    if (upcoming === 'true') {
      query.scheduledDateTime = { $gte: new Date() }
    }
    
    const bookings = await Booking.find(query)
      .populate('dermatologist', 'name specialization rating')
      .populate('ticket', 'concern status')
      .populate('consultation', 'diagnosis status')
      .sort({ scheduledDateTime: -1 })
    
    res.json({ bookings })
    
  } catch (error) {
    console.error('Error getting user bookings:', error)
    res.status(500).json({ error: error.message })
  }
}

// Get dermatologist's bookings
export async function getDermatologistBookings(req, res) {
  try {
    const { status, date } = req.query
    let query = { dermatologist: req.user.id }
    
    if (status && status !== 'all') {
      query.status = status
    }
    
    if (date) {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)
      
      query.scheduledDateTime = {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }
    
    const bookings = await Booking.find(query)
      .populate('patient', 'name email')
      .populate('ticket', 'concern status photos')
      .populate('consultation', 'diagnosis status')
      .sort({ scheduledDateTime: 1 })
    
    res.json({ bookings })
    
  } catch (error) {
    console.error('Error getting dermatologist bookings:', error)
    res.status(500).json({ error: error.message })
  }
}

// Get single booking details
export async function getBooking(req, res) {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('patient', 'name email')
      .populate('dermatologist', 'name specialization consultationFee')
      .populate('ticket', 'concern status photos symptoms')
      .populate('consultation')
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' })
    }
    
    // Check access permissions
    const hasAccess = 
      booking.patient._id.toString() === req.user.id ||
      booking.dermatologist._id.toString() === req.user.id ||
      req.user.role === 'admin'
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' })
    }
    
    res.json({ booking })
    
  } catch (error) {
    console.error('Error getting booking:', error)
    res.status(500).json({ error: error.message })
  }
}

// Update booking status
export async function updateBookingStatus(req, res) {
  try {
    const { status, notes } = req.body
    
    const booking = await Booking.findById(req.params.id)
      .populate('patient', 'name email')
      .populate('dermatologist', 'name')
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' })
    }
    
    // Check permissions
    const canUpdate = 
      booking.dermatologist._id.toString() === req.user.id ||
      (booking.patient._id.toString() === req.user.id && ['cancelled'].includes(status)) ||
      req.user.role === 'admin'
    
    if (!canUpdate) {
      return res.status(403).json({ error: 'Access denied' })
    }
    
    booking.status = status
    if (notes) {
      if (req.user.id === booking.dermatologist._id.toString()) {
        booking.dermatologistNotes = notes
      } else {
        booking.patientNotes = notes
      }
    }
    
    await booking.save()
    
    // Create notifications based on status change
    let notificationTitle, notificationMessage
    
    switch (status) {
      case 'confirmed':
        notificationTitle = 'Booking Confirmed'
        notificationMessage = `Dr. ${booking.dermatologist.name} has confirmed your consultation on ${booking.scheduledDateTime.toLocaleString()}`
        break
      case 'cancelled':
        notificationTitle = 'Booking Cancelled'
        notificationMessage = `Your consultation with Dr. ${booking.dermatologist.name} has been cancelled`
        break
      case 'completed':
        notificationTitle = 'Consultation Completed'
        notificationMessage = `Your consultation with Dr. ${booking.dermatologist.name} has been completed`
        break
    }
    
    if (notificationTitle) {
      const recipientId = req.user.id === booking.patient._id.toString() 
        ? booking.dermatologist._id 
        : booking.patient._id
        
      await createNotification(
        recipientId,
        'booking_updated',
        notificationTitle,
        notificationMessage,
        {
          booking: booking._id,
          sender: req.user.id
        }
      )
    }
    
    res.json({
      success: true,
      booking,
      message: 'Booking updated successfully'
    })
    
  } catch (error) {
    console.error('Error updating booking:', error)
    res.status(500).json({ error: error.message })
  }
}

// Start consultation session
export async function startConsultation(req, res) {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('patient', 'name email')
      .populate('dermatologist', 'name')
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' })
    }
    
    if (booking.dermatologist._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' })
    }
    
    if (booking.status !== 'confirmed') {
      return res.status(400).json({ error: 'Booking must be confirmed to start consultation' })
    }
    
    // Update status
    booking.status = 'in_progress'
    
    // Generate meeting link for video calls
    if (booking.sessionType === 'video_call') {
      booking.meetingId = `meeting-${booking._id}`
      booking.meetingLink = `${process.env.FRONTEND_URL}/video-call/${booking.meetingId}`
    }
    
    await booking.save()
    
    // Notify patient
    await createNotification(
      booking.patient._id,
      'consultation_started',
      'Consultation Started',
      `Your consultation with Dr. ${booking.dermatologist.name} has started`,
      {
        booking: booking._id,
        meetingLink: booking.meetingLink,
        actionUrl: booking.meetingLink || `/bookings/${booking._id}`,
        actionText: booking.sessionType === 'video_call' ? 'Join Call' : 'View Details'
      }
    )
    
    res.json({
      success: true,
      booking,
      meetingLink: booking.meetingLink,
      message: 'Consultation started successfully'
    })
    
  } catch (error) {
    console.error('Error starting consultation:', error)
    res.status(500).json({ error: error.message })
  }
}

// Create payment session for booking
export async function createBookingPayment(req, res) {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('patient', 'name email')
      .populate('dermatologist', 'name')
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' })
    }
    
    if (booking.patient._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' })
    }
    
    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ error: 'Payment already completed' })
    }
    
    // Create Stripe checkout session
    const session = await getStripeClient().checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: booking.patient.email,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${booking.sessionType.replace('_', ' ').toUpperCase()} Consultation - Dr. ${booking.dermatologist.name}`,
            description: `Scheduled for ${booking.scheduledDateTime.toLocaleString()}`
          },
          unit_amount: Math.round(booking.consultationFee * 100)
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/bookings/${booking._id}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/bookings/${booking._id}/payment/cancel`,
      metadata: {
        bookingId: booking._id.toString(),
        patientId: booking.patient._id.toString(),
        dermatologistId: booking.dermatologist._id.toString(),
        type: 'booking_payment'
      }
    })
    
    res.json({
      success: true,
      sessionId: session.id,
      url: session.url
    })
    
  } catch (error) {
    console.error('Error creating booking payment:', error)
    res.status(500).json({ error: error.message })
  }
}

// Verify booking payment
export async function verifyBookingPayment(req, res) {
  try {
    const { sessionId } = req.body
    const session = await getStripeClient().checkout.sessions.retrieve(sessionId)
    
    if (!session || session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' })
    }
    
    const bookingId = session.metadata.bookingId
    const booking = await Booking.findById(bookingId)
      .populate('patient', 'name email')
      .populate('dermatologist', 'name')
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' })
    }
    
    // Update payment status
    booking.paymentStatus = 'paid'
    booking.paymentId = session.payment_intent
    booking.paymentDate = new Date()
    await booking.save()
    
    // Notify dermatologist about payment
    await createNotification(
      booking.dermatologist._id,
      'payment_received',
      'Payment Received',
      `Payment of $${booking.consultationFee} has been received for consultation with ${booking.patient.name}`,
      {
        booking: booking._id,
        sender: booking.patient._id,
        payment: session.payment_intent
      }
    )
    
    res.json({
      success: true,
      booking,
      message: 'Payment verified successfully'
    })
    
  } catch (error) {
    console.error('Error verifying booking payment:', error)
    res.status(500).json({ error: error.message })
  }
}
