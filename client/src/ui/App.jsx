import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function App() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [q, setQ] = useState('');
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartCount(stored.length);
  }, []);

  function getNavItems() {
    if (!user) return [];
    
    const commonItems = [
      { to: "/profile", label: "Profile" }
    ];
    
    switch (user.role) {
      case 'admin':
        return [
          { to: "/admin/dashboard", label: "Admin Dashboard" },
          ...commonItems
        ];
      case 'dermatologist':
        return [
          { to: "/dermatologist/dashboard", label: "Dashboard" },
          { to: "/products", label: "Products" },
          { to: "/tickets", label: "Consultations" },
          ...commonItems
        ];
      case 'user':
      default:
        return [
          { to: "/dashboard", label: "Dashboard" },
          { to: "/products", label: "Shop" },
          { to: "/routine", label: "Routine" },
          { to: "/timeline", label: "Progress" },
          { to: "/tickets", label: "Help" },
          ...commonItems
        ];
    }
  }

  const navItems = getNavItems();

  function onSearch(e) {
    e.preventDefault();
    navigate(`/products?search=${encodeURIComponent(q)}`);
  }

  return (
    <>
      {/* Header */}
      <div className="header">
        <div className="container navbar">
          <Link to="/" className="logo">SkinBloom</Link>

          <form onSubmit={onSearch} className="search">
            <input className="input" placeholder="Search products, ingredients…" value={q} onChange={e => setQ(e.target.value)} />
            <button className="btn">Search</button>
          </form>

          <div className="nav-link-group">
            {user ? (
              <>
                <NavLink to="/profile" className="nav-link">
                  Hi {user?.name || 'User'} 
                  <span style={{ 
                    fontSize: '11px', 
                    background: user.role === 'admin' ? '#dc2626' : user.role === 'dermatologist' ? '#0369a1' : '#16a34a',
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    marginLeft: '6px',
                    textTransform: 'capitalize'
                  }}>
                    {user.role}
                  </span>
                </NavLink>
                {navItems.map(item => (
                  <NavLink key={item.to} to={item.to} className="nav-link">
                    {item.label}
                  </NavLink>
                ))}
                <button className="btn ghost" onClick={logout}>Logout</button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="nav-link">Login</NavLink>
                <NavLink to="/register" className="btn blue">Sign up</NavLink>
                <NavLink to="/products" className="nav-link">Shop</NavLink>
              </>
            )}
            {user && user.role === 'user' && (
              <span className="nav-link">Cart {cartCount}</span>
            )}
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container" style={{ padding: '24px 0' }}>
        <Outlet />
      </div>

      {/* Footer */}
      <div className="footer">
        <div className="container footer-content">
          <div>© {new Date().getFullYear()} SkinBloom • Skincare simplified</div>
          <div className="footer-links">
            <Link to="/products">Shop</Link>
            <Link to="/profile">Profile</Link>
            <Link to="/routine">Routine</Link>
            <a href="mailto:support@skinbloom.app">Contact</a>
          </div>
        </div>
      </div>
    </>
  );
}