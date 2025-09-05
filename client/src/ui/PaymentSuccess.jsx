import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      verifyPayment();
    }
  }, [sessionId]);

  const verifyPayment = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/payments/verify/${sessionId}`);
      
      if (response.data.success) {
        setOrderDetails(response.data);
        // Clear cart after successful payment
        clearCart();
      } else {
        setError('Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setError('Failed to verify payment');
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await axios.delete('http://localhost:5000/api/cart/clear', {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '3px solid #e2e8f0',
          borderTop: '3px solid #3182ce',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ fontSize: '16px', color: '#4a5568' }}>Verifying your payment...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        padding: '40px 20px',
        textAlign: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '40px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          border: '1px solid #fed7d7'
        }}>
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>❌</div>
          <h1 style={{ fontSize: '24px', marginBottom: '12px', color: '#e53e3e' }}>
            Payment Verification Failed
          </h1>
          <p style={{ fontSize: '16px', color: '#718096', marginBottom: '30px' }}>
            {error}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link
              to="/cart"
              style={{
                padding: '12px 24px',
                background: '#3182ce',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '600'
              }}
            >
              Back to Cart
            </Link>
            <Link
              to="/products"
              style={{
                padding: '12px 24px',
                background: 'transparent',
                color: '#3182ce',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                border: '1px solid #3182ce'
              }}
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '40px 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '40px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
        border: '1px solid #c6f6d5',
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        <div style={{ fontSize: '80px', marginBottom: '20px' }}>✅</div>
        <h1 style={{ fontSize: '28px', marginBottom: '12px', color: '#2d3748' }}>
          Payment Successful!
        </h1>
        <p style={{ fontSize: '16px', color: '#718096', marginBottom: '20px' }}>
          Thank you for your purchase. Your order has been confirmed.
        </p>
        
        {orderDetails?.order && (
          <div style={{
            background: '#f7fafc',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'left'
          }}>
            <h3 style={{ fontSize: '18px', marginBottom: '12px', color: '#2d3748' }}>
              Order Details
            </h3>
            <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Order ID:</span>
                <span style={{ fontWeight: '600' }}>{orderDetails.order.sessionId?.slice(-8)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Amount:</span>
                <span style={{ fontWeight: '600' }}>${orderDetails.order.amount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Payment Type:</span>
                <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>
                  {orderDetails.order.paymentType?.replace('_', ' ')}
                </span>
              </div>
              {orderDetails.order.customerEmail && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Email:</span>
                  <span style={{ fontWeight: '600' }}>{orderDetails.order.customerEmail}</span>
                </div>
              )}
              {orderDetails.order.shippingAddress && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>Shipping Address:</div>
                  <div style={{ fontSize: '13px', color: '#4a5568' }}>
                    {orderDetails.order.shippingAddress.line1}<br />
                    {orderDetails.order.shippingAddress.line2 && (
                      <>{orderDetails.order.shippingAddress.line2}<br /></>
                    )}
                    {orderDetails.order.shippingAddress.city}, {orderDetails.order.shippingAddress.state} {orderDetails.order.shippingAddress.postal_code}<br />
                    {orderDetails.order.shippingAddress.country}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* What's Next Section */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '30px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
        marginBottom: '30px'
      }}>
        <h2 style={{ fontSize: '20px', marginBottom: '20px', color: '#2d3748' }}>
          What's Next?
        </h2>
        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '24px' }}>📧</div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '14px' }}>Confirmation Email</div>
              <div style={{ fontSize: '13px', color: '#718096' }}>
                You'll receive an order confirmation email shortly
              </div>
            </div>
          </div>
          
          {orderDetails?.order?.type === 'product_purchase' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '24px' }}>📦</div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>Processing</div>
                  <div style={{ fontSize: '13px', color: '#718096' }}>
                    Your order will be processed within 1-2 business days
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '24px' }}>🚚</div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>Shipping</div>
                  <div style={{ fontSize: '13px', color: '#718096' }}>
                    Estimated delivery: 3-7 business days
                  </div>
                </div>
              </div>
            </>
          )}
          
          {orderDetails?.order?.type === 'consultation' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '24px' }}>👨‍⚕️</div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '14px' }}>Consultation Scheduling</div>
                <div style={{ fontSize: '13px', color: '#718096' }}>
                  Our team will contact you within 24 hours to schedule your consultation
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '12px',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <Link
          to="/products"
          style={{
            padding: '12px 24px',
            background: '#3182ce',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.background = '#2c5aa0'}
          onMouseLeave={(e) => e.target.style.background = '#3182ce'}
        >
          Continue Shopping
        </Link>
        
        <Link
          to="/profile"
          style={{
            padding: '12px 24px',
            background: 'transparent',
            color: '#3182ce',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            border: '1px solid #3182ce',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#3182ce';
            e.target.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.color = '#3182ce';
          }}
        >
          View Profile
        </Link>
        
        <button
          onClick={() => window.print()}
          style={{
            padding: '12px 24px',
            background: 'transparent',
            color: '#718096',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#f7fafc';
            e.target.style.color = '#4a5568';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.color = '#718096';
          }}
        >
          Print Receipt
        </button>
      </div>
    </div>
  );
}

export default PaymentSuccess;
