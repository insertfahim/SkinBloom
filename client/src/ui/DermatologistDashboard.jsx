import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../auth';

export default function DermatologistDashboard() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [consultation, setConsultation] = useState({
    diagnosis: '',
    treatmentPlan: '',
    recommendedProducts: []
  });
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('pending'); // pending, assigned, completed

  useEffect(() => {
    loadTickets();
    loadProducts();
  }, []);

  const loadTickets = async () => {
    try {
      const { data } = await API.get('/tickets/dermatologist/tickets');
      setTickets(data || []);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const { data } = await API.get('/products');
      setAvailableProducts(data.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const assignTicket = async (ticketId) => {
    try {
      await API.post(`/tickets/${ticketId}/assign`);
      await loadTickets();
      alert('Ticket assigned successfully!');
    } catch (error) {
      console.error('Error assigning ticket:', error);
      alert('Failed to assign ticket');
    }
  };

  const submitConsultation = async () => {
    if (!selectedTicket || !consultation.diagnosis.trim()) {
      alert('Please provide a diagnosis');
      return;
    }

    setSubmitting(true);
    try {
      await API.post(`/tickets/${selectedTicket._id}/consultation`, consultation);
      setSelectedTicket(null);
      setConsultation({
        diagnosis: '',
        treatmentPlan: '',
        recommendedProducts: []
      });
      await loadTickets();
      alert('Consultation provided successfully!');
    } catch (error) {
      console.error('Error submitting consultation:', error);
      alert('Failed to submit consultation');
    } finally {
      setSubmitting(false);
    }
  };

  const markAsResolved = async (ticketId) => {
    try {
      await API.patch(`/tickets/${ticketId}/resolve`);
      await loadTickets();
      alert('Ticket marked as resolved!');
    } catch (error) {
      console.error('Error resolving ticket:', error);
      alert('Failed to resolve ticket');
    }
  };

  const addRecommendedProduct = (product) => {
    if (!consultation.recommendedProducts.find(p => p._id === product._id)) {
      setConsultation(prev => ({
        ...prev,
        recommendedProducts: [...prev.recommendedProducts, product]
      }));
    }
  };

  const removeRecommendedProduct = (productId) => {
    setConsultation(prev => ({
      ...prev,
      recommendedProducts: prev.recommendedProducts.filter(p => p._id !== productId)
    }));
  };

  const getFilteredTickets = () => {
    switch (activeTab) {
      case 'pending':
        return tickets.filter(t => t.status === 'pending');
      case 'assigned':
        return tickets.filter(t => ['assigned', 'in-consultation'].includes(t.status));
      case 'completed':
        return tickets.filter(t => ['consultation-provided', 'resolved'].includes(t.status));
      default:
        return tickets;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return '#f59e0b';
      case 'assigned': return '#3b82f6';
      case 'in-consultation': return '#8b5cf6';
      case 'consultation-provided': return '#10b981';
      case 'resolved': return '#059669';
      default: return '#6b7280';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
        <p>Loading dermatologist dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          marginBottom: '8px',
          color: '#1f2937'
        }}>
          Dermatologist Dashboard
        </h1>
        <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>
          Welcome back, Dr. {user?.name}! Manage your patient consultations.
        </p>
      </div>

      {/* Stats Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid #f3f4f6',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>⏰</div>
          <h3 style={{ color: '#f59e0b', fontSize: '24px', margin: 0 }}>
            {tickets.filter(t => t.status === 'pending').length}
          </h3>
          <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>Pending</p>
        </div>

        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid #f3f4f6',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>👨‍⚕️</div>
          <h3 style={{ color: '#3b82f6', fontSize: '24px', margin: 0 }}>
            {tickets.filter(t => ['assigned', 'in-consultation'].includes(t.status)).length}
          </h3>
          <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>In Progress</p>
        </div>

        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid #f3f4f6',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
          <h3 style={{ color: '#10b981', fontSize: '24px', margin: 0 }}>
            {tickets.filter(t => ['consultation-provided', 'resolved'].includes(t.status)).length}
          </h3>
          <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>Completed</p>
        </div>

        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid #f3f4f6',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📊</div>
          <h3 style={{ color: '#1f2937', fontSize: '24px', margin: 0 }}>
            {tickets.length}
          </h3>
          <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>Total Cases</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        borderBottom: '1px solid #f3f4f6'
      }}>
        {[
          { key: 'pending', label: 'Pending Cases', count: tickets.filter(t => t.status === 'pending').length },
          { key: 'assigned', label: 'My Cases', count: tickets.filter(t => ['assigned', 'in-consultation'].includes(t.status)).length },
          { key: 'completed', label: 'Completed', count: tickets.filter(t => ['consultation-provided', 'resolved'].includes(t.status)).length }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '12px 20px',
              background: activeTab === tab.key ? '#3b82f6' : 'transparent',
              color: activeTab === tab.key ? 'white' : '#6b7280',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedTicket ? '1fr 1fr' : '1fr', gap: '24px' }}>
        {/* Tickets List */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid #f3f4f6'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            marginBottom: '20px',
            color: '#1f2937'
          }}>
            {activeTab === 'pending' ? 'Pending Cases' : 
             activeTab === 'assigned' ? 'My Cases' : 'Completed Cases'}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {getFilteredTickets().map(ticket => (
              <div
                key={ticket._id}
                style={{
                  border: '1px solid #f3f4f6',
                  borderRadius: '8px',
                  padding: '16px',
                  background: selectedTicket?._id === ticket._id ? '#f0f9ff' : '#fafafa'
                }}
              >
                {/* Ticket Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      background: '#f3f4f6',
                      color: '#374151',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontFamily: 'monospace'
                    }}>
                      #{ticket._id?.slice(-6).toUpperCase()}
                    </span>
                    <span style={{
                      background: getStatusColor(ticket.status),
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '600'
                    }}>
                      {ticket.status}
                    </span>
                    <span style={{
                      background: `${getUrgencyColor(ticket.urgency)}20`,
                      color: getUrgencyColor(ticket.urgency),
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '600'
                    }}>
                      {ticket.urgency}
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Patient Info */}
                <div style={{ marginBottom: '12px' }}>
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '4px'
                  }}>
                    Patient: {ticket.user?.name || 'Anonymous'}
                  </h4>
                  {ticket.skinType && (
                    <span style={{
                      background: '#f0f9ff',
                      color: '#0369a1',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '11px'
                    }}>
                      {ticket.skinType} Skin
                    </span>
                  )}
                </div>

                {/* Concern Preview */}
                <p style={{
                  fontSize: '13px',
                  color: '#6b7280',
                  lineHeight: '1.4',
                  marginBottom: '12px'
                }}>
                  {ticket.concern?.substring(0, 120)}...
                </p>

                {/* Photos indicator */}
                {ticket.photos && ticket.photos.length > 0 && (
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{
                      fontSize: '12px',
                      color: '#6b7280'
                    }}>
                      📸 {ticket.photos.length} photo(s)
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {ticket.status === 'pending' && (
                    <button
                      onClick={() => assignTicket(ticket._id)}
                      style={{
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      Take Case
                    </button>
                  )}
                  
                  {['assigned', 'in-consultation'].includes(ticket.status) && (
                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      style={{
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      Provide Consultation
                    </button>
                  )}

                  {ticket.status === 'consultation-provided' && ticket.paymentStatus === 'completed' && (
                    <button
                      onClick={() => markAsResolved(ticket._id)}
                      style={{
                        background: '#059669',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      Mark Resolved
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedTicket(ticket)}
                    style={{
                      background: '#6b7280',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}

            {getFilteredTickets().length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                <p>No cases in this category</p>
              </div>
            )}
          </div>
        </div>

        {/* Consultation Panel */}
        {selectedTicket && (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #f3f4f6',
            height: 'fit-content'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0
              }}>
                Case Details
              </h2>
              <button
                onClick={() => setSelectedTicket(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ✕
              </button>
            </div>

            {/* Patient Information */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '8px'
              }}>
                Patient Information
              </h3>
              <div style={{
                background: '#f9fafb',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #f3f4f6'
              }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '14px' }}>
                  <strong>Name:</strong> {selectedTicket.user?.name || 'Anonymous'}
                </p>
                <p style={{ margin: '0 0 4px 0', fontSize: '14px' }}>
                  <strong>Skin Type:</strong> {selectedTicket.skinType || 'Not specified'}
                </p>
                <p style={{ margin: '0', fontSize: '14px' }}>
                  <strong>Urgency:</strong> {selectedTicket.urgency}
                </p>
              </div>
            </div>

            {/* Concern Details */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '8px'
              }}>
                Skin Concern
              </h3>
              <div style={{
                background: '#f9fafb',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #f3f4f6',
                fontSize: '14px',
                lineHeight: '1.5'
              }}>
                {selectedTicket.concern}
              </div>
            </div>

            {/* Symptoms */}
            {selectedTicket.symptoms && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '8px'
                }}>
                  Symptoms
                </h3>
                <div style={{
                  background: '#f9fafb',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #f3f4f6',
                  fontSize: '14px'
                }}>
                  {selectedTicket.symptoms}
                </div>
              </div>
            )}

            {/* Photos */}
            {selectedTicket.photos && selectedTicket.photos.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '8px'
                }}>
                  Patient Photos
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                  gap: '8px'
                }}>
                  {selectedTicket.photos.map((photo, index) => (
                    <img
                      key={index}
                      src={`http://localhost:5000${photo}`}
                      alt={`Patient photo ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '1px solid #f3f4f6'
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Consultation Form */}
            {['assigned', 'in-consultation'].includes(selectedTicket.status) && (
              <div>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '16px'
                }}>
                  Provide Consultation
                </h3>

                {/* Diagnosis */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    Diagnosis *
                  </label>
                  <textarea
                    value={consultation.diagnosis}
                    onChange={(e) => setConsultation(prev => ({ ...prev, diagnosis: e.target.value }))}
                    placeholder="Provide your professional diagnosis..."
                    rows="4"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                  />
                </div>

                {/* Treatment Plan */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    Treatment Plan
                  </label>
                  <textarea
                    value={consultation.treatmentPlan}
                    onChange={(e) => setConsultation(prev => ({ ...prev, treatmentPlan: e.target.value }))}
                    placeholder="Recommended treatment steps..."
                    rows="3"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                  />
                </div>

                {/* Product Recommendations */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    Recommended Products
                  </label>
                  
                  <select
                    onChange={(e) => {
                      const product = availableProducts.find(p => p._id === e.target.value);
                      if (product) addRecommendedProduct(product);
                      e.target.value = '';
                    }}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '14px',
                      marginBottom: '8px'
                    }}
                  >
                    <option value="">Select a product to recommend</option>
                    {availableProducts.map(product => (
                      <option key={product._id} value={product._id}>
                        {product.name} - ${product.price}
                      </option>
                    ))}
                  </select>

                  {consultation.recommendedProducts.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {consultation.recommendedProducts.map(product => (
                        <div
                          key={product._id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: '#f0f9ff',
                            padding: '8px',
                            borderRadius: '6px',
                            fontSize: '13px'
                          }}
                        >
                          <span>{product.name}</span>
                          <button
                            onClick={() => removeRecommendedProduct(product._id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#ef4444',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={submitConsultation}
                  disabled={submitting || !consultation.diagnosis.trim()}
                  style={{
                    width: '100%',
                    background: submitting || !consultation.diagnosis.trim() ? '#d1d5db' : '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: submitting || !consultation.diagnosis.trim() ? 'not-allowed' : 'pointer'
                  }}
                >
                  {submitting ? 'Submitting...' : 'Submit Consultation'}
                </button>
              </div>
            )}

            {/* Existing Consultation Display */}
            {selectedTicket.consultation && (
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #d1fae5',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#166534',
                  marginBottom: '12px'
                }}>
                  Previous Consultation
                </h3>
                <div style={{ fontSize: '14px', color: '#166534', lineHeight: '1.5' }}>
                  <p><strong>Diagnosis:</strong> {selectedTicket.consultation.diagnosis}</p>
                  {selectedTicket.consultation.treatmentPlan && (
                    <p><strong>Treatment:</strong> {selectedTicket.consultation.treatmentPlan}</p>
                  )}
                  {selectedTicket.consultation.recommendedProducts?.length > 0 && (
                    <div>
                      <strong>Recommended Products:</strong>
                      <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                        {selectedTicket.consultation.recommendedProducts.map((product, index) => (
                          <li key={index}>{product.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
