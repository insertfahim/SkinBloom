import './styles.css'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute, RoleBasedRedirect } from './components/ProtectedRoute'
import App from './ui/App.jsx'
import SimpleDashboard from './ui/SimpleDashboard.jsx'
import Dashboard from './ui/Dashboard.jsx'
import AdminDashboard from './ui/AdminDashboard.jsx'
import DermatologistDashboard from './ui/DermatologistDashboard.jsx'
import Login from './ui/Login.jsx'
import Register from './ui/Register.jsx'
import Profile from './ui/Profile.jsx'
import Products from './ui/Products.jsx'
import ProductDetail from './ui/ProductDetail.jsx'
import Wishlist from './ui/Wishlist.jsx'
import Cart from './ui/Cart.jsx'
import Routine from './ui/Routine.jsx'
import Feedback from './ui/Feedback.jsx'
import Timeline from './ui/Timeline.jsx'
import Tickets from './ui/Tickets.jsx'
import Unauthorized from './ui/Unauthorized.jsx'
const root = createRoot(document.getElementById('root'))
root.render(
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path='/' element={<App />}>
          <Route index element={<SimpleDashboard />} />
          
          {/* Public routes */}
          <Route path='login' element={<Login />} />
          <Route path='register' element={<Register />} />
          <Route path='unauthorized' element={<Unauthorized />} />
          
          {/* Semi-public routes - accessible to logged in users */}
          <Route path='products' element={
            <ProtectedRoute allowedRoles={['user', 'dermatologist', 'admin']}>
              <Products />
            </ProtectedRoute>
          } />
          <Route path='products/:id' element={
            <ProtectedRoute allowedRoles={['user', 'dermatologist', 'admin']}>
              <ProductDetail />
            </ProtectedRoute>
          } />
          
          {/* Protected routes - Auto redirect based on role */}
          <Route path='auto-redirect' element={<RoleBasedRedirect />} />
          
          {/* User routes */}
          <Route path='dashboard' element={
            <ProtectedRoute allowedRoles={['user']}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path='wishlist' element={
            <ProtectedRoute allowedRoles={['user']}>
              <Wishlist />
            </ProtectedRoute>
          } />
          <Route path='cart' element={
            <ProtectedRoute allowedRoles={['user']}>
              <Cart />
            </ProtectedRoute>
          } />
          <Route path='profile' element={
            <ProtectedRoute allowedRoles={['user', 'dermatologist', 'admin']}>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path='routine' element={
            <ProtectedRoute allowedRoles={['user']}>
              <Routine />
            </ProtectedRoute>
          } />
          <Route path='feedback' element={
            <ProtectedRoute allowedRoles={['user']}>
              <Feedback />
            </ProtectedRoute>
          } />
          <Route path='timeline' element={
            <ProtectedRoute allowedRoles={['user']}>
              <Timeline />
            </ProtectedRoute>
          } />
          <Route path='tickets' element={
            <ProtectedRoute allowedRoles={['user', 'dermatologist']}>
              <Tickets />
            </ProtectedRoute>
          } />
          
          {/* Admin routes */}
          <Route path='admin/dashboard' element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          {/* Dermatologist routes */}
          <Route path='dermatologist/dashboard' element={
            <ProtectedRoute allowedRoles={['dermatologist']}>
              <DermatologistDashboard />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </AuthProvider>
  </BrowserRouter>
)