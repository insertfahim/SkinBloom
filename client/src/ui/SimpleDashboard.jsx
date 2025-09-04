import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SimpleDashboard() {
  const { user } = useAuth();

  if (user) {
    // Redirect authenticated users to their appropriate dashboard
    return (
      <div className="welcome-container">
        <div className="welcome-header">
          <h1>Welcome back, {user.name}!</h1>
          <p>Continue your skincare journey</p>
        </div>
        
        <div className="dashboard-cards">
          {user.role === 'admin' && (
            <Link to="/admin/dashboard" className="dashboard-card admin">
              <h3>Admin Dashboard</h3>
              <p>Manage users and system settings</p>
              <span className="card-arrow">→</span>
            </Link>
          )}
          
          {user.role === 'dermatologist' && (
            <Link to="/dermatologist/dashboard" className="dashboard-card dermatologist">
              <h3>Dermatologist Dashboard</h3>
              <p>View consultations and help users</p>
              <span className="card-arrow">→</span>
            </Link>
          )}
          
          {user.role === 'user' && (
            <>
              <Link to="/dashboard" className="dashboard-card user">
                <h3>My Dashboard</h3>
                <p>View your skincare overview</p>
                <span className="card-arrow">→</span>
              </Link>
              
              <Link to="/products" className="dashboard-card">
                <h3>Shop Products</h3>
                <p>Explore curated skincare products</p>
                <span className="card-arrow">→</span>
              </Link>
              
              <Link to="/wishlist" className="dashboard-card">
                <h3>My Wishlist</h3>
                <p>Save your favorite products</p>
                <span className="card-arrow">→</span>
              </Link>
              
              <Link to="/routine" className="dashboard-card">
                <h3>My Routine</h3>
                <p>Manage your daily skincare routine</p>
                <span className="card-arrow">→</span>
              </Link>
              
              <Link to="/timeline" className="dashboard-card">
                <h3>Progress Timeline</h3>
                <p>Track your skincare journey</p>
                <span className="card-arrow">→</span>
              </Link>
              
              <Link to="/tickets" className="dashboard-card">
                <h3>Get Help</h3>
                <p>Ask our dermatologists</p>
                <span className="card-arrow">→</span>
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }

  // Landing page for non-authenticated users
  return (
    <div className="landing-page">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Your Journey to <span className="highlight">Healthy Skin</span> Starts Here
          </h1>
          <p className="hero-subtitle">
            Get personalized skincare routines, track your progress, and connect with dermatologists
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn primary large">
              Start Your Journey
            </Link>
            <Link to="/login" className="btn ghost large">
              Sign In
            </Link>
          </div>
        </div>
        
        <div className="hero-image">
          <div className="hero-placeholder">
            <div className="skin-icon">🌸</div>
            <p>Beautiful Skin Awaits</p>
          </div>
        </div>
      </div>

      <div className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose SkinBloom?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📋</div>
              <h3>Personalized Routines</h3>
              <p>Get custom skincare routines tailored to your skin type and concerns</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3>Progress Tracking</h3>
              <p>Monitor your skin improvement journey with detailed timeline and photos</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">👩‍⚕️</div>
              <h3>Expert Guidance</h3>
              <p>Connect with certified dermatologists for professional advice</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Smart Reminders</h3>
              <p>Never miss your skincare routine with intelligent notifications</p>
            </div>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Transform Your Skin?</h2>
            <p>Join thousands of users who have already started their skincare journey with SkinBloom</p>
            <Link to="/register" className="btn primary large">
              Get Started Free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
