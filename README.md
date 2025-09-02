# Skinbloom (MERN)

Minimal MERN app covering 7+ features from your spec.

## Stack
- MongoDB + Mongoose
- Express.js REST API with JWT Auth
- React (Vite) client with Axios + React Router

## Quickstart

### 1) Backend
```
cd server
cp .env.example .env
# fill MONGO_URI and JWT_SECRET
npm install
npm run dev
```

### 2) Frontend
```
cd client
cp .env.example .env
npm install
npm run dev
```

### Accounts
- Register via the UI. To create a dermatologist, POST to `/api/auth/register` with `role:"dermatologist"` (or manually update in DB).
```

### Implemented Features
1. User Authentication (register/login/logout, roles)
2. Create Personal Skin Profile (photo, skin type, age, gender, allergies, concerns)
3. Track Daily Skincare Routine (create routine, log daily usage)
4. Product tracking (add products with ingredients)
5. Product reaction feedback (rating + reaction per product)
6. Progress Timeline view (computed score over time)
7. Routine Builder (AM/PM steps, reminders flag)
8. Get Professional Help (create ticket; derm answers)

```
Routes overview
- /api/auth: POST /register, POST /login
- /api/profile: GET /me, POST /me
- /api/products: GET / (returns suggested), POST /
- /api/routine: GET /, POST /, POST /log, GET /log
- /api/feedback: GET /, POST /
- /api/timeline: GET /
- /api/tickets: GET /, POST /, POST /:id/answer
```