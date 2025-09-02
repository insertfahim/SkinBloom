// import express from 'express'
// import cors from 'cors'
// import morgan from 'morgan'
// import dotenv from 'dotenv'
// import mongoose from 'mongoose'

// import authRoutes from './routes/auth.js'
// import profileRoutes from './routes/profile.js'
// import routineRoutes from './routes/routine.js'
// import productRoutes from './routes/product.js'
// import feedbackRoutes from './routes/feedback.js'
// import timelineRoutes from './routes/timeline.js'
// import ticketRoutes from './routes/ticket.js'

// dotenv.config()
// const app = express()
// app.use(cors())
// app.use(express.json())
// app.use(morgan('dev'))

// const PORT = process.env.PORT || 5000
// const MONGO_URI = process.env.MONGO_URI

// mongoose.connect(MONGO_URI)
// //   useNewUrlParser: true,
// //   useUnifiedTopology: true
// // })
// .then(() => {
//   console.log('✅ MongoDB Connected')
//   app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
// })
// .catch(err => {
//   console.error('❌ Mongo connection error:', err)
//   process.exit(1)
// })


// app.get('/', (req, res) => res.json({ok:true, service:'Skinbloom API'}))

// app.use('/api/auth', authRoutes)
// app.use('/api/profile', profileRoutes)
// app.use('/api/routine', routineRoutes)
// app.use('/api/products', productRoutes)
// app.use('/api/feedback', feedbackRoutes)
// app.use('/api/timeline', timelineRoutes)
// app.use('/api/tickets', ticketRoutes)
// import express from "express";
// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import cors from "cors";
// import path from "path";

// import authRoutes from "./routes/auth.js";
// import profileRoutes from "./routes/profile.js";
// import productRoutes from "./routes/product.js";
// import routineRoutes from "./routes/routine.js";
// import analysisRoutes from "./routes/analysis.js";
// import uploadRoutes from "./routes/upload.js";

// dotenv.config();
// const app = express();
// const PORT = process.env.PORT || 5000;
// const JWT_SECRET = process.env.JWT_SECRET;

// // ✅ JWT Secret Safety Check
// if (!JWT_SECRET) {
//   console.error("❌ JWT_SECRET not set in .env file");
//   process.exit(1);
// }

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// // Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/profile", profileRoutes);
// app.use("/api/products", productRoutes);
// app.use("/api/routines", routineRoutes);
// app.use("/api/analysis", analysisRoutes);
// app.use("/api/upload", uploadRoutes);

// // MongoDB Connection
// mongoose
//   .connect(process.env.MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => {
//     console.log("✅ MongoDB connected");
//     app.listen(PORT, () =>
//       console.log(`🚀 Server running on http://localhost:${PORT}`)
//     );
//   })
//   .catch((err) => console.error("❌ MongoDB connection error:", err));
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import mongoose from 'mongoose'

// routes
import authRoutes from './routes/auth.js'
import profileRoutes from './routes/profile.js'
import routineRoutes from './routes/routine.js'
import productRoutes from './routes/product.js'
import feedbackRoutes from './routes/feedback.js'
import timelineRoutes from './routes/timeline.js'
import ticketRoutes from './routes/ticket.js'
import reminderRoutes from './routes/reminder.js'
import uploadRoutes from './routes/upload.js'
import paymentRoutes from './routes/payments.js'

// env
dotenv.config()
const { PORT = 5000, MONGO_URI, JWT_SECRET, FRONTEND_URL = 'http://localhost:5173' } = process.env

if (!JWT_SECRET) {
  console.error('❌ JWT_SECRET not set in .env file')
  process.exit(1)
}

const app = express()
app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:5173'],
  credentials: true,
  exposedHeaders: ['Authorization']
}))
app.use(express.json({ limit: '2mb' }))
app.use(morgan('dev'))

// static for uploads
import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// db
mongoose.connect(MONGO_URI).then(() => {
  console.log('✅ MongoDB connected')
  const port = Number(PORT)
  app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`)
  })
}).catch(err => {
  console.error('❌ Mongo connection error:', err)
  process.exit(1)
})

// health
app.get('/', (req, res) => res.json({ ok:true, service:'Skinbloom API' }))

// Public routes first (so shop can load without login)
app.use('/api/products', productRoutes)     // GET public, POST protected (admin)
app.use('/api/auth', authRoutes)

// User protected routes (require authentication)
app.use('/api/profile', profileRoutes)
app.use('/api/routine', routineRoutes)
app.use('/api/feedback', feedbackRoutes)
app.use('/api/timeline', timelineRoutes)
app.use('/api/tickets', ticketRoutes)
app.use('/api/reminder', reminderRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/payment', paymentRoutes)
