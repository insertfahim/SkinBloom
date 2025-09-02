import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../auth';

export default function DermatologistDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activePatients: 0,
    pendingConsultations: 0,
    completedConsultations: 0,
    totalRevenue: 0
  });
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // You would need to create these API endpoints
      // const [ticketsRes, statsRes] = await Promise.all([
      //   API.get('/dermatologist/tickets'),
      //   API.get('/dermatologist/stats')
      // ]);
      
      // For now, showing mock data
      setStats({
        activePatients: 25,
        pendingConsultations: 8,
        completedConsultations: 120,
        totalRevenue: 5400
      });
      
      setRecentTickets([
        { id: 1, patientName: 'Sarah Johnson', issue: 'Acne treatment follow-up', priority: 'high', createdAt: '2024-01-15' },
        { id: 2, patientName: 'Mike Chen', issue: 'Skincare routine consultation', priority: 'medium', createdAt: '2024-01-15' },
        { id: 3, patientName: 'Emily Davis', issue: 'Product recommendation', priority: 'low', createdAt: '2024-01-14' }
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' };
      case 'medium': return { bg: '#fffbeb', color: '#d97706', border: '#fed7aa' };
      case 'low': return { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' };
      default: return { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' };
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading dermatologist dashboard...</p>
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
          Dermatologist Dashboard
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '16px' }}>
          Welcome back, Dr. {user?.name}! Ready to help your patients today?
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
            {stats.activePatients}
          </h3>
          <p style={{ color: 'var(--muted)', margin: '4px 0 0 0' }}>Active Patients</p>
        </div>

        <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>⏰</div>
          <h3 style={{ color: '#d97706', fontSize: '24px', margin: 0 }}>
            {stats.pendingConsultations}
          </h3>
          <p style={{ color: 'var(--muted)', margin: '4px 0 0 0' }}>Pending Consultations</p>
        </div>

        <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
          <h3 style={{ color: '#16a34a', fontSize: '24px', margin: 0 }}>
            {stats.completedConsultations}
          </h3>
          <p style={{ color: 'var(--muted)', margin: '4px 0 0 0' }}>Completed This Month</p>
        </div>

        <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>💰</div>
          <h3 style={{ color: 'var(--primary-color)', fontSize: '24px', margin: 0 }}>
            ${stats.totalRevenue}
          </h3>
          <p style={{ color: 'var(--muted)', margin: '4px 0 0 0' }}>Monthly Revenue</p>
        </div>
      </div>

      {/* Recent Consultations */}
      <div className="card" style={{ padding: '24px', marginBottom: '32px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ color: 'var(--text-color)', margin: 0 }}>
            Recent Consultation Requests
          </h2>
          <button style={{
            padding: '8px 16px',
            background: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            View All
          </button>
        </div>
        
        <div style={{ display: 'grid', gap: '16px' }}>
          {recentTickets.map(ticket => {
            const priorityStyle = getPriorityColor(ticket.priority);
            return (
              <div key={ticket.id} style={{
                padding: '16px',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 4px 0', color: 'var(--text-color)' }}>
                    {ticket.patientName}
                  </h4>
                  <p style={{ margin: '0 0 8px 0', color: 'var(--muted)' }}>
                    {ticket.issue}
                  </p>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600',
                    background: priorityStyle.bg,
                    color: priorityStyle.color,
                    border: `1px solid ${priorityStyle.border}`
                  }}>
                    {ticket.priority} priority
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: '0 0 8px 0', color: 'var(--muted)', fontSize: '14px' }}>
                    {ticket.createdAt}
                  </p>
                  <button style={{
                    padding: '6px 12px',
                    background: 'var(--primary-color)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}>
                    Respond
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
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
          View All Patients
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
          Schedule Consultation
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
          Medical Resources
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
          Generate Report
        </button>
      </div>
    </div>
  );
}
