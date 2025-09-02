import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../auth';

export default function PriceTracking() {
  const { user } = useAuth();
  const [trackedProducts, setTrackedProducts] = useState([]);
  const [priceHistory, setPriceHistory] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPriceTracking();
  }, []);

  const loadPriceTracking = async () => {
    try {
      const [alertsRes, historyRes] = await Promise.all([
        API.get('/price-tracking/alerts'),
        API.get('/price-tracking/history')
      ]);
      
      setAlerts(alertsRes.data.alerts || []);
      
      // Group price history by product
      const historyByProduct = {};
      (historyRes.data.history || []).forEach(item => {
        const key = item.productId || item.externalId;
        if (!historyByProduct[key]) {
          historyByProduct[key] = [];
        }
        historyByProduct[key].push(item);
      });
      setPriceHistory(historyByProduct);
      
      // Extract tracked products from alerts
      setTrackedProducts(alertsRes.data.alerts || []);
    } catch (error) {
      console.error('Error loading price tracking:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshPrices = async () => {
    setRefreshing(true);
    try {
      await API.post('/price-tracking/refresh');
      await loadPriceTracking();
      alert('Prices updated successfully!');
    } catch (error) {
      console.error('Error refreshing prices:', error);
      alert('Failed to refresh prices');
    } finally {
      setRefreshing(false);
    }
  };

  const removeAlert = async (alertId) => {
    try {
      await API.delete(`/price-tracking/alerts/${alertId}`);
      setAlerts(prev => prev.filter(alert => alert._id !== alertId));
      setTrackedProducts(prev => prev.filter(product => product._id !== alertId));
    } catch (error) {
      console.error('Error removing alert:', error);
      alert('Failed to remove price alert');
    }
  };

  const updateAlertPrice = async (alertId, newPrice) => {
    try {
      await API.put(`/price-tracking/alerts/${alertId}`, {
        targetPrice: parseFloat(newPrice)
      });
      
      setAlerts(prev => prev.map(alert => 
        alert._id === alertId 
          ? { ...alert, targetPrice: parseFloat(newPrice) }
          : alert
      ));
      
      setTrackedProducts(prev => prev.map(product => 
        product._id === alertId 
          ? { ...product, targetPrice: parseFloat(newPrice) }
          : product
      ));
      
      alert('Target price updated!');
    } catch (error) {
      console.error('Error updating alert price:', error);
      alert('Failed to update target price');
    }
  };

  const getPriceChange = (product) => {
    const history = priceHistory[product.productId || product.externalId] || [];
    if (history.length < 2) {
      return null;
    }
    
    const latest = history[0];
    const previous = history[1];
    
    const change = latest.price - previous.price;
    const percentage = ((change / previous.price) * 100).toFixed(1);
    
    return { change, percentage };
  };

  const formatPriceChange = (change) => {
    if (!change) {
      return null;
    }
    
    const color = change.change > 0 ? '#dc3545' : '#22c55e';
    const symbol = change.change > 0 ? '↗' : '↘';
    
    return (
      <span style={{ color, fontSize: '14px', fontWeight: '600' }}>
        {symbol} ${Math.abs(change.change).toFixed(2)} ({Math.abs(change.percentage)}%)
      </span>
    );
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading price tracking...</p>
      </div>
    );
  }

  if (trackedProducts.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>📈</div>
        <h2 style={{ color: 'var(--text-color)', marginBottom: '12px' }}>
          No Price Alerts Set
        </h2>
        <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>
          Add products to your wishlist and enable price alerts to track price changes!
        </p>
        <button
          onClick={() => window.location.href = '/wishlist'}
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
          Go to Wishlist
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <div>
          <h1 style={{
            color: 'var(--text-color)',
            fontSize: '32px',
            marginBottom: '8px'
          }}>
            Price Tracking
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '16px' }}>
            Monitor price changes for {trackedProducts.length} product{trackedProducts.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <button
          onClick={refreshPrices}
          disabled={refreshing}
          style={{
            padding: '12px 24px',
            background: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: refreshing ? 'not-allowed' : 'pointer',
            opacity: refreshing ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>{refreshing ? '🔄' : '↻'}</span>
          {refreshing ? 'Refreshing...' : 'Refresh Prices'}
        </button>
      </div>

      {/* Active Alerts Summary */}
      <div className="card" style={{ padding: '24px', marginBottom: '32px' }}>
        <h2 style={{ color: 'var(--text-color)', marginBottom: '16px' }}>
          Alert Summary
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          <div style={{
            padding: '16px',
            background: 'rgba(34, 197, 94, 0.1)',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ color: '#22c55e', fontSize: '24px', fontWeight: '700' }}>
              {alerts.filter(a => a.isActive).length}
            </div>
            <p style={{ color: 'var(--text-color)', margin: '4px 0 0 0', fontSize: '14px' }}>
              Active Alerts
            </p>
          </div>
          
          <div style={{
            padding: '16px',
            background: 'rgba(245, 158, 11, 0.1)',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ color: '#f59e0b', fontSize: '24px', fontWeight: '700' }}>
              {alerts.filter(a => a.triggered).length}
            </div>
            <p style={{ color: 'var(--text-color)', margin: '4px 0 0 0', fontSize: '14px' }}>
              Triggered Alerts
            </p>
          </div>
          
          <div style={{
            padding: '16px',
            background: 'rgba(79, 70, 229, 0.1)',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ color: 'var(--primary-color)', fontSize: '24px', fontWeight: '700' }}>
              {Object.keys(priceHistory).length}
            </div>
            <p style={{ color: 'var(--text-color)', margin: '4px 0 0 0', fontSize: '14px' }}>
              Tracked Products
            </p>
          </div>
        </div>
      </div>

      {/* Tracked Products */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '24px'
      }}>
        {trackedProducts.map((product) => {
          const priceChange = getPriceChange(product);
          const history = priceHistory[product.productId || product.externalId] || [];
          const latestPrice = history.length > 0 ? history[0].price : product.currentPrice;
          
          return (
            <div
              key={product._id}
              className="card"
              style={{
                padding: '20px',
                background: 'var(--card-background)',
                border: product.triggered ? '2px solid #f59e0b' : '1px solid var(--border-color)',
                borderRadius: '12px',
                position: 'relative'
              }}
            >
              {/* Alert Status */}
              {product.triggered && (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: '#f59e0b',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  🔔 ALERT
                </div>
              )}

              {/* Product Info */}
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{
                  color: 'var(--text-color)',
                  fontSize: '18px',
                  marginBottom: '8px',
                  lineHeight: '1.4',
                  paddingRight: '60px'
                }}>
                  {product.productDetails?.name || 'Product Name'}
                </h3>
                
                {product.productDetails?.brand && (
                  <p style={{
                    color: 'var(--muted)',
                    fontSize: '14px',
                    marginBottom: '8px'
                  }}>
                    {product.productDetails.brand}
                  </p>
                )}
              </div>

              {/* Price Information */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                padding: '12px',
                background: 'rgba(156, 163, 175, 0.1)',
                borderRadius: '8px'
              }}>
                <div>
                  <p style={{ color: 'var(--muted)', fontSize: '12px', margin: 0 }}>
                    Current Price
                  </p>
                  <span style={{
                    color: 'var(--text-color)',
                    fontSize: '20px',
                    fontWeight: '700'
                  }}>
                    ${latestPrice?.toFixed(2) || 'N/A'}
                  </span>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: 'var(--muted)', fontSize: '12px', margin: 0 }}>
                    Target Price
                  </p>
                  <span style={{
                    color: 'var(--primary-color)',
                    fontSize: '18px',
                    fontWeight: '600'
                  }}>
                    ${product.targetPrice?.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Price Change */}
              {priceChange && (
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ color: 'var(--muted)', fontSize: '12px', margin: '0 0 4px 0' }}>
                    Recent Change
                  </p>
                  {formatPriceChange(priceChange)}
                </div>
              )}

              {/* Price History Chart (Simple) */}
              {history.length > 1 && (
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ color: 'var(--muted)', fontSize: '12px', margin: '0 0 8px 0' }}>
                    Price History ({history.length} points)
                  </p>
                  <div style={{
                    display: 'flex',
                    alignItems: 'end',
                    height: '60px',
                    gap: '2px',
                    padding: '8px',
                    background: 'rgba(156, 163, 175, 0.05)',
                    borderRadius: '4px'
                  }}>
                    {history.slice(0, 20).reverse().map((point, index) => {
                      const maxPrice = Math.max(...history.map(h => h.price));
                      const minPrice = Math.min(...history.map(h => h.price));
                      const height = ((point.price - minPrice) / (maxPrice - minPrice)) * 44 + 4;
                      
                      return (
                        <div
                          key={index}
                          style={{
                            flex: 1,
                            height: `${height}px`,
                            background: 'var(--primary-color)',
                            borderRadius: '2px',
                            opacity: 0.7 + (index / history.length) * 0.3
                          }}
                          title={`$${point.price} on ${new Date(point.checkedAt).toLocaleDateString()}`}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Alert Actions */}
              <div style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center'
              }}>
                <input
                  type="number"
                  step="0.01"
                  placeholder="New target"
                  style={{
                    flex: 1,
                    padding: '8px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value) {
                      updateAlertPrice(product._id, e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
                
                <button
                  onClick={() => removeAlert(product._id)}
                  style={{
                    padding: '8px 12px',
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                  title="Remove alert"
                >
                  🗑️
                </button>
              </div>

              {/* Last Checked */}
              <p style={{
                color: 'var(--muted)',
                fontSize: '12px',
                marginTop: '12px',
                margin: '12px 0 0 0'
              }}>
                Last checked: {new Date(product.lastChecked || product.createdAt).toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>

      {/* Help Section */}
      <div className="card" style={{
        padding: '24px',
        marginTop: '32px',
        background: 'rgba(79, 70, 229, 0.05)',
        border: '1px solid rgba(79, 70, 229, 0.2)'
      }}>
        <h3 style={{ color: 'var(--text-color)', marginBottom: '16px' }}>
          💡 How Price Tracking Works
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px'
        }}>
          <div>
            <h4 style={{ color: 'var(--text-color)', fontSize: '16px', margin: '0 0 8px 0' }}>
              Automatic Monitoring
            </h4>
            <p style={{ color: 'var(--muted)', fontSize: '14px', margin: 0 }}>
              We check prices regularly and track changes over time
            </p>
          </div>
          <div>
            <h4 style={{ color: 'var(--text-color)', fontSize: '16px', margin: '0 0 8px 0' }}>
              Price Alerts
            </h4>
            <p style={{ color: 'var(--muted)', fontSize: '14px', margin: 0 }}>
              Get notified when products drop below your target price
            </p>
          </div>
          <div>
            <h4 style={{ color: 'var(--text-color)', fontSize: '16px', margin: '0 0 8px 0' }}>
              Manual Refresh
            </h4>
            <p style={{ color: 'var(--muted)', fontSize: '14px', margin: 0 }}>
              Click "Refresh Prices" to update all tracked products instantly
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
