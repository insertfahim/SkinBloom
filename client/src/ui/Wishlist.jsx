import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../auth';

export default function Wishlist() {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState({});

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      const response = await API.get('/wishlist');
      setWishlistItems(response.data.wishlist?.products || []);
      
      // Extract price alerts
      const alerts = {};
      response.data.wishlist?.products?.forEach(item => {
        if (item.priceAlert?.enabled) {
          alerts[item.productId || item.externalId] = item.priceAlert;
        }
      });
      setPriceAlerts(alerts);
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId, isExternal = false) => {
    try {
      await API.delete('/wishlist/remove', {
        data: { productId, isExternal }
      });
      
      // Update local state
      setWishlistItems(prev => 
        prev.filter(item => 
          isExternal 
            ? item.externalId !== productId 
            : item.productId !== productId
        )
      );
      
      // Remove price alert
      setPriceAlerts(prev => {
        const updated = { ...prev };
        delete updated[productId];
        return updated;
      });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      alert('Failed to remove item from wishlist');
    }
  };

  const updatePriceAlert = async (productId, isExternal, alertPrice) => {
    try {
      const response = await API.put('/wishlist/price-alert', {
        productId,
        isExternal,
        alertPrice: parseFloat(alertPrice)
      });
      
      setPriceAlerts(prev => ({
        ...prev,
        [productId]: {
          enabled: true,
          targetPrice: parseFloat(alertPrice)
        }
      }));
      
      alert('Price alert updated!');
    } catch (error) {
      console.error('Error updating price alert:', error);
      alert('Failed to update price alert');
    }
  };

  const togglePriceAlert = async (productId, isExternal) => {
    try {
      const currentAlert = priceAlerts[productId];
      const newEnabled = !currentAlert?.enabled;
      
      if (newEnabled && !currentAlert?.targetPrice) {
        const price = prompt('Enter target price for alert:');
        if (!price || isNaN(price)) {
          return;
        }
        
        await updatePriceAlert(productId, isExternal, price);
      } else {
        await API.put('/wishlist/price-alert', {
          productId,
          isExternal,
          alertPrice: currentAlert?.targetPrice || 0,
          enabled: newEnabled
        });
        
        setPriceAlerts(prev => ({
          ...prev,
          [productId]: {
            ...prev[productId],
            enabled: newEnabled
          }
        }));
      }
    } catch (error) {
      console.error('Error toggling price alert:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading your wishlist...</p>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>💖</div>
        <h2 style={{ color: 'var(--text-color)', marginBottom: '12px' }}>
          Your Wishlist is Empty
        </h2>
        <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>
          Start adding products you love to keep track of them!
        </p>
        <button
          onClick={() => window.location.href = '/products'}
          style={{
            padding: '12px 24px',
            background: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Browse Products
        </button>
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
          My Wishlist
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '16px' }}>
          {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} saved
        </p>
      </div>

      {/* Wishlist Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '24px'
      }}>
        {wishlistItems.map((item, index) => {
          const productId = item.productId || item.externalId;
          const isExternal = !item.productId;
          const alert = priceAlerts[productId];
          
          return (
            <div
              key={`${productId}-${index}`}
              className="card"
              style={{
                padding: '20px',
                position: 'relative',
                background: 'var(--card-background)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px'
              }}
            >
              {/* Remove Button */}
              <button
                onClick={() => removeFromWishlist(productId, isExternal)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(220, 53, 69, 0.1)',
                  color: '#dc3545',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px'
                }}
                title="Remove from wishlist"
              >
                ×
              </button>

              {/* Product Image */}
              {item.image_link && (
                <div style={{
                  width: '100%',
                  height: '200px',
                  marginBottom: '16px',
                  overflow: 'hidden',
                  borderRadius: '8px',
                  background: '#f5f5f5'
                }}>
                  <img
                    src={item.image_link}
                    alt={item.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Product Info */}
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{
                  color: 'var(--text-color)',
                  fontSize: '18px',
                  marginBottom: '8px',
                  lineHeight: '1.4'
                }}>
                  {item.name}
                </h3>
                
                {item.brand && (
                  <p style={{
                    color: 'var(--muted)',
                    fontSize: '14px',
                    marginBottom: '8px',
                    textTransform: 'capitalize'
                  }}>
                    {item.brand}
                  </p>
                )}

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px'
                }}>
                  <span style={{
                    color: 'var(--primary-color)',
                    fontSize: '20px',
                    fontWeight: '700'
                  }}>
                    {item.price ? `$${item.price}` : 'Price not available'}
                  </span>
                  
                  {item.rating && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ color: '#fbbf24' }}>★</span>
                      <span style={{ color: 'var(--text-color)', fontSize: '14px' }}>
                        {item.rating}
                      </span>
                    </div>
                  )}
                </div>

                {item.category && (
                  <span style={{
                    background: 'var(--primary-color)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {item.category}
                  </span>
                )}
              </div>

              {/* Price Alert Section */}
              {item.price && (
                <div style={{
                  padding: '12px',
                  background: alert?.enabled ? 'rgba(34, 197, 94, 0.1)' : 'rgba(156, 163, 175, 0.1)',
                  borderRadius: '8px',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px'
                  }}>
                    <span style={{
                      color: 'var(--text-color)',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      Price Alert
                    </span>
                    <button
                      onClick={() => togglePriceAlert(productId, isExternal)}
                      style={{
                        background: alert?.enabled ? '#22c55e' : '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '4px 12px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      {alert?.enabled ? 'ON' : 'OFF'}
                    </button>
                  </div>
                  
                  {alert?.enabled && (
                    <p style={{
                      color: 'var(--muted)',
                      fontSize: '12px',
                      margin: 0
                    }}>
                      Alert when price drops below ${alert.targetPrice}
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '8px'
              }}>
                {item.product_link && (
                  <a
                    href={item.product_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: 'var(--primary-color)',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '6px',
                      textAlign: 'center',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  >
                    View Product
                  </a>
                )}
                
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: item.name,
                        text: `Check out this product: ${item.name}`,
                        url: item.product_link || window.location.href
                      });
                    }
                  }}
                  style={{
                    padding: '10px',
                    background: 'transparent',
                    color: 'var(--text-color)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                  title="Share product"
                >
                  📤
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div style={{
        marginTop: '40px',
        padding: '24px',
        background: 'var(--card-background)',
        borderRadius: '12px',
        textAlign: 'center'
      }}>
        <h3 style={{ color: 'var(--text-color)', marginBottom: '16px' }}>
          Quick Actions
        </h3>
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => window.location.href = '/products'}
            style={{
              padding: '12px 24px',
              background: 'var(--primary-color)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Browse More Products
          </button>
          <button
            onClick={() => window.location.href = '/comparison'}
            style={{
              padding: '12px 24px',
              background: 'transparent',
              color: 'var(--primary-color)',
              border: '2px solid var(--primary-color)',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Compare Products
          </button>
        </div>
      </div>
    </div>
  );
}
