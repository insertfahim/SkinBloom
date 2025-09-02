import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../auth';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDermatologists: 0,
    totalTickets: 0,
    totalProducts: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // You would need to create these API endpoints
      // const [usersRes, ticketsRes, productsRes] = await Promise.all([
      //   API.get('/admin/users/stats'),
      //   API.get('/admin/tickets/stats'),
      //   API.get('/admin/products/stats')
      // ]);
      
      // For now, showing mock data
      setStats({
        totalUsers: 150,
        totalDermatologists: 12,
        totalTickets: 45,
        totalProducts: 89
      });
      
      setRecentUsers([
        { id: 1, name: 'John Doe', role: 'user', joinedAt: '2024-01-15' },
        { id: 2, name: 'Dr. Smith', role: 'dermatologist', joinedAt: '2024-01-14' },
        { id: 3, name: 'Jane Wilson', role: 'user', joinedAt: '2024-01-13' }
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          color: 'var(--text-color)',
          fontSize: '32px',
          marginBottom: '8px'
        }}>
          Admin Dashboard
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '16px' }}>
          Welcome back, {user?.name}! Here's what's happening on SkinBloom.
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>👥</div>
          <h3 style={{ color: 'var(--primary-color)', fontSize: '24px', margin: 0 }}>
            {stats.totalUsers}
          </h3>
          <p style={{ color: 'var(--muted)', margin: '4px 0 0 0' }}>Total Users</p>
        </div>

        <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>👨‍⚕️</div>
          <h3 style={{ color: 'var(--primary-color)', fontSize: '24px', margin: 0 }}>
            {stats.totalDermatologists}
          </h3>
          <p style={{ color: 'var(--muted)', margin: '4px 0 0 0' }}>Dermatologists</p>
        </div>

        <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎫</div>
          <h3 style={{ color: 'var(--primary-color)', fontSize: '24px', margin: 0 }}>
            {stats.totalTickets}
          </h3>
          <p style={{ color: 'var(--muted)', margin: '4px 0 0 0' }}>Support Tickets</p>
        </div>

        <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🧴</div>
          <h3 style={{ color: 'var(--primary-color)', fontSize: '24px', margin: 0 }}>
            {stats.totalProducts}
          </h3>
          <p style={{ color: 'var(--muted)', margin: '4px 0 0 0' }}>Products</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card" style={{ padding: '24px' }}>
        <h2 style={{ color: 'var(--text-color)', marginBottom: '20px' }}>
          Recent Users
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                <th style={{ textAlign: 'left', padding: '12px 0', color: 'var(--text-color)' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '12px 0', color: 'var(--text-color)' }}>Role</th>
                <th style={{ textAlign: 'left', padding: '12px 0', color: 'var(--text-color)' }}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 0', color: 'var(--text-color)' }}>{user.name}</td>
                  <td style={{ padding: '12px 0' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: user.role === 'dermatologist' ? '#e0f2fe' : '#f3e8ff',
                      color: user.role === 'dermatologist' ? '#0369a1' : '#7c3aed'
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px 0', color: 'var(--muted)' }}>{user.joinedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginTop: '32px'
      }}>
        <button className="btn" style={{
          padding: '16px',
          background: 'var(--primary-color)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontWeight: '600',
          cursor: 'pointer'
        }}>
          Manage Users
        </button>
        <button className="btn" style={{
          padding: '16px',
          background: 'var(--primary-color)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontWeight: '600',
          cursor: 'pointer'
        }}>
          View Reports
        </button>
        <button className="btn" style={{
          padding: '16px',
          background: 'var(--primary-color)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontWeight: '600',
          cursor: 'pointer'
        }}>
          System Settings
        </button>
      </div>
    </div>
  );
}
