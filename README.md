# SkinBloom - Personalized Skincare Management Platform

SkinBloom is a full-stack MERN (MongoDB, Express.js, React, Node.js) application designed to revolutionize personal skincare management. It provides users with a comprehensive digital platform to track, analyze, and optimize their skincare journey through personalized recommendations, professional consultations, and data-driven insights.

## Features Overview

🌟 **Comprehensive Skincare Solution** covering 8+ core features:

1. **User Authentication** (register/login/logout, role-based access)
2. **Personal Skin Profile** (photo upload, skin type, age, gender, allergies, concerns)
3. **Daily Skincare Routine Tracking** (create routines, log daily usage)
4. **Product Management** (add products with ingredients, suggestions based on skin type)
5. **Product Reaction Feedback** (rating + reaction tracking per product)
6. **Progress Timeline** (visual timeline showing skin improvement over time)
7. **Routine Builder** (AM/PM steps with reminders)
8. **Professional Help** (dermatologist consultation tickets)

## Tech Stack

- **Frontend**: React 18 + Vite, React Router, Axios, Modern CSS
- **Backend**: Node.js + Express.js REST API with JWT Authentication
- **Database**: MongoDB + Mongoose ODM
- **File Upload**: Multer for image handling
- **Payment Processing**: Stripe integration
- **Styling**: Custom CSS with CSS Variables and Gradients

## Quick Start

### 1) Backend Setup
```bash
cd server
cp .env.example .env
# Configure MONGO_URI and JWT_SECRET in .env
npm install
npm run dev
```

### 2) Frontend Setup
```bash
cd client
cp .env.example .env
npm install
npm run dev
```

### Creating Admin/Dermatologist Accounts
- **Regular users**: Register via the UI
- **Dermatologists**: POST to `/api/auth/register` with `role:"dermatologist"` or manually update in database

## API Routes Overview

```
Authentication:
- POST /api/auth/register - User registration
- POST /api/auth/login - User login

Profile Management:
- GET /api/profile/me - Get user profile
- POST /api/profile/me - Create/update profile

Product Management:
- GET /api/products - Get suggested products
- POST /api/products - Add new product

Routine Management:
- GET /api/routine - Get user routines
- POST /api/routine - Create routine
- POST /api/routine/log - Log daily usage
- GET /api/routine/log - Get routine logs

Feedback & Reviews:
- GET /api/feedback - Get user feedback
- POST /api/feedback - Submit product feedback

Progress Tracking:
- GET /api/timeline - Get progress timeline

Professional Help:
- GET /api/tickets - Get consultation tickets
- POST /api/tickets - Create consultation ticket
- POST /api/tickets/:id/answer - Dermatologist response
```

## Project Structure

```
skinbloom-mern/
├── client/                 # React frontend
│   ├── src/
│   │   ├── ui/            # React components
│   │   ├── context/       # React context (Auth)
│   │   └── styles.css     # Global styles
│   └── package.json
├── server/                 # Express backend
│   ├── controllers/       # Route handlers
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API routes
│   ├── middleware/       # Auth & upload middleware
│   └── package.json
└── README.md
```

## Key Features Detail

### 🔐 Authentication & User Management
- JWT-based authentication
- Role-based access (user/dermatologist)
- Secure password hashing with bcrypt

### 👤 Personal Skin Profile
- Photo upload for skin analysis
- Comprehensive skin type assessment
- Allergy and concern tracking
- Skin goals and current product inventory

### 📅 Routine Management
- AM/PM routine creation
- Step-by-step skincare guides
- Daily usage logging and tracking
- Reminder system for consistent skincare

### 🧴 Product Database
- Extensive skincare product catalog
- Ingredient analysis and tracking
- Personalized product suggestions
- User reviews and ratings

### 📊 Progress Tracking
- Visual timeline of skin improvement
- Before/after photo comparisons
- Progress scoring system
- Data-driven insights

### 🩺 Professional Consultations
- Direct communication with dermatologists
- Ticket-based consultation system
- Photo sharing for professional analysis
- Expert treatment recommendations

### 💰 E-commerce Integration
- Stripe payment processing
- Shopping cart functionality
- Product purchasing workflow
- Order management

## Development

The application uses modern development practices:

- **Frontend**: Vite for fast development and building
- **Backend**: Nodemon for auto-restart during development
- **Database**: MongoDB with Mongoose for schema validation
- **File Storage**: Local file storage with Multer
- **API Design**: RESTful API principles

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**SkinBloom** - Transform your skincare journey with personalized, data-driven beauty solutions. 🌸✨
