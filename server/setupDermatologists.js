import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import User from './models/User.js'
import Profile from './models/Profile.js'
import dotenv from 'dotenv'

dotenv.config()

const dermatologists = [
  {
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@skinbloom.com',
    password: 'password123',
    specialization: 'Acne Treatment & Hormonal Skin Issues',
    yearsOfExperience: 8,
    medicalLicense: 'MD-SJ-2015-001',
    bio: 'Specialized in treating acne, hormonal imbalances, and teenage skin problems. Over 8 years of experience helping patients achieve clear, healthy skin.',
    consultationFee: {
      photoReview: 45,
      videoCall: 90,
      followUp: 25
    },
    availability: {
      monday: [{ start: '09:00', end: '17:00' }],
      tuesday: [{ start: '09:00', end: '17:00' }],
      wednesday: [{ start: '09:00', end: '17:00' }],
      thursday: [{ start: '09:00', end: '17:00' }],
      friday: [{ start: '09:00', end: '15:00' }],
      saturday: [],
      sunday: []
    },
    profile: {
      qualification: 'MD Dermatology, Board Certified',
      age: 35,
      gender: 'female'
    }
  },
  {
    name: 'Dr. Michael Chen',
    email: 'michael.chen@skinbloom.com',
    password: 'password123',
    specialization: 'Anti-aging & Cosmetic Dermatology',
    yearsOfExperience: 12,
    medicalLicense: 'MD-MC-2011-002',
    bio: 'Expert in anti-aging treatments, wrinkle reduction, and cosmetic dermatology procedures. Helping patients look and feel their best for over 12 years.',
    consultationFee: {
      photoReview: 60,
      videoCall: 120,
      followUp: 40
    },
    availability: {
      monday: [{ start: '10:00', end: '18:00' }],
      tuesday: [{ start: '10:00', end: '18:00' }],
      wednesday: [{ start: '10:00', end: '18:00' }],
      thursday: [{ start: '10:00', end: '18:00' }],
      friday: [{ start: '10:00', end: '16:00' }],
      saturday: [{ start: '09:00', end: '13:00' }],
      sunday: []
    },
    profile: {
      qualification: 'MD Dermatology, Cosmetic Surgery Fellowship',
      age: 42,
      gender: 'male'
    }
  },
  {
    name: 'Dr. Emily Rodriguez',
    email: 'emily.rodriguez@skinbloom.com',
    password: 'password123',
    specialization: 'Sensitive Skin & Allergic Reactions',
    yearsOfExperience: 6,
    medicalLicense: 'MD-ER-2017-003',
    bio: 'Specializes in sensitive skin conditions, allergic reactions, and dermatitis. Passionate about helping patients with reactive skin find gentle, effective solutions.',
    consultationFee: {
      photoReview: 50,
      videoCall: 100,
      followUp: 30
    },
    availability: {
      monday: [{ start: '08:00', end: '16:00' }],
      tuesday: [{ start: '08:00', end: '16:00' }],
      wednesday: [{ start: '08:00', end: '16:00' }],
      thursday: [{ start: '08:00', end: '16:00' }],
      friday: [{ start: '08:00', end: '14:00' }],
      saturday: [],
      sunday: [{ start: '10:00', end: '14:00' }]
    },
    profile: {
      qualification: 'MD Dermatology, Allergy & Immunology',
      age: 31,
      gender: 'female'
    }
  }
]

async function createDermatologists() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ Connected to MongoDB')

    for (const dermData of dermatologists) {
      // Check if dermatologist already exists
      const existingUser = await User.findOne({ email: dermData.email })
      if (existingUser) {
        console.log(`⚠️  Dermatologist ${dermData.name} already exists`)
        continue
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(dermData.password, 10)

      // Create user
      const user = await User.create({
        name: dermData.name,
        email: dermData.email,
        password: hashedPassword,
        role: 'dermatologist',
        specialization: dermData.specialization,
        yearsOfExperience: dermData.yearsOfExperience,
        medicalLicense: dermData.medicalLicense,
        bio: dermData.bio,
        consultationFee: dermData.consultationFee,
        availability: dermData.availability,
        isActive: true,
        profileCompleted: true
      })

      // Create profile
      await Profile.create({
        userId: user._id,
        qualification: dermData.profile.qualification,
        age: dermData.profile.age,
        gender: dermData.profile.gender,
        dermatologistRecommended: true
      })

      console.log(`✅ Created dermatologist: ${dermData.name}`)
    }

    console.log('\n🎉 All dermatologists created successfully!')
    
    // Display login credentials
    console.log('\n📋 Login Credentials:')
    dermatologists.forEach(derm => {
      console.log(`${derm.name}: ${derm.email} / password123`)
    })

  } catch (error) {
    console.error('❌ Error creating dermatologists:', error)
  } finally {
    await mongoose.disconnect()
    console.log('📤 Disconnected from MongoDB')
  }
}

createDermatologists()
