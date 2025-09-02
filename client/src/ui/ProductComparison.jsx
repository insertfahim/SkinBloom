import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../auth';

export default function ProductComparison() {
  const { user } = useAuth();
  const [comparisons, setComparisons] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('create');

  useEffect(() => {
    loadProducts();
    loadComparisons();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await API.get('/products');
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadComparisons = async () => {
    try {
      const response = await API.get('/comparison');
      setComparisons(response.data.comparisons || []);
    } catch (error) {
      console.error('Error loading comparisons:', error);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleProductSelection = (product) => {
    setSelectedProducts(prev => {
      const isSelected = prev.some(p => p._id === product._id);
      if (isSelected) {
        return prev.filter(p => p._id !== product._id);
      } else if (prev.length < 4) {
        return [...prev, product];
      } else {
        alert('You can compare up to 4 products at once');
        return prev;
      }
    });
  };

  const createComparison = async () => {
    if (selectedProducts.length < 2) {
      alert('Please select at least 2 products to compare');
      return;
    }

    setLoading(true);
    try {
      const response = await API.post('/comparison/create', {
        productIds: selectedProducts.map(p => p._id),
        title: `Comparison of ${selectedProducts.length} products`,
        compareFields: ['name', 'brand', 'price', 'category', 'rating', 'description']
      });

      setComparisons(prev => [response.data.comparison, ...prev]);
      setSelectedProducts([]);
      setActiveTab('view');
      alert('Comparison created successfully!');
    } catch (error) {
      console.error('Error creating comparison:', error);
      alert('Failed to create comparison');
    } finally {
      setLoading(false);
    }
  };

  const deleteComparison = async (comparisonId) => {
    if (!confirm('Are you sure you want to delete this comparison?')) {
      return;
    }

    try {
      await API.delete(`/comparison/${comparisonId}`);
      setComparisons(prev => prev.filter(c => c._id !== comparisonId));
    } catch (error) {
      console.error('Error deleting comparison:', error);
      alert('Failed to delete comparison');
    }
  };

  const shareComparison = async (comparisonId) => {
    try {
      const response = await API.post(`/comparison/${comparisonId}/share`);
      const shareUrl = `${window.location.origin}/comparison/shared/${response.data.shareToken}`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'Product Comparison',
          text: 'Check out this product comparison',
          url: shareUrl
        });
      } else {
        navigator.clipboard.writeText(shareUrl);
        alert('Share link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing comparison:', error);
      alert('Failed to create share link');
    }
  };

  const renderCreateTab = () => (
    <div>
      {/* Selected Products */}
      {selectedProducts.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ color: 'var(--text-color)', marginBottom: '16px' }}>
            Selected Products ({selectedProducts.length}/4)
          </h3>
          <div style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            padding: '16px',
            background: 'var(--card-background)',
            borderRadius: '8px',
            border: '2px dashed var(--primary-color)'
          }}>
            {selectedProducts.map(product => (
              <div
                key={product._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  background: 'var(--primary-color)',
                  color: 'white',
                  borderRadius: '20px',
                  fontSize: '14px'
                }}
              >
                <span>{product.name}</span>
                <button
                  onClick={() => toggleProductSelection(product)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '16px',
                    lineHeight: 1
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          
          {selectedProducts.length >= 2 && (
            <button
              onClick={createComparison}
              disabled={loading}
              style={{
                marginTop: '16px',
                padding: '12px 24px',
                background: 'var(--primary-color)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Creating Comparison...' : 'Create Comparison'}
            </button>
          )}
        </div>
      )}

      {/* Product Search */}
      <div style={{ marginBottom: '24px' }}>
        <input
          type="text"
          placeholder="Search products to compare..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            fontSize: '16px'
          }}
        />
      </div>

      {/* Product Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '16px'
      }}>
        {filteredProducts.slice(0, 20).map(product => {
          const isSelected = selectedProducts.some(p => p._id === product._id);
          
          return (
            <div
              key={product._id}
              onClick={() => toggleProductSelection(product)}
              style={{
                padding: '16px',
                background: isSelected ? 'rgba(79, 70, 229, 0.1)' : 'var(--card-background)',
                border: isSelected ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {product.image_link && (
                <div style={{
                  width: '100%',
                  height: '120px',
                  marginBottom: '12px',
                  overflow: 'hidden',
                  borderRadius: '6px',
                  background: '#f5f5f5'
                }}>
                  <img
                    src={product.image_link}
                    alt={product.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
              )}
              
              <h4 style={{
                color: 'var(--text-color)',
                fontSize: '14px',
                marginBottom: '8px',
                lineHeight: '1.3'
              }}>
                {product.name}
              </h4>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{
                  color: 'var(--primary-color)',
                  fontWeight: '600'
                }}>
                  ${product.price}
                </span>
                
                {isSelected && (
                  <span style={{
                    color: 'var(--primary-color)',
                    fontSize: '18px'
                  }}>
                    ✓
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderViewTab = () => (
    <div>
      {comparisons.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
          <h3 style={{ color: 'var(--text-color)', marginBottom: '8px' }}>
            No Comparisons Yet
          </h3>
          <p style={{ color: 'var(--muted)' }}>
            Create your first comparison to see it here
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {comparisons.map(comparison => (
            <div
              key={comparison._id}
              className="card"
              style={{
                padding: '24px',
                background: 'var(--card-background)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h3 style={{ color: 'var(--text-color)', margin: 0 }}>
                  {comparison.title}
                </h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => shareComparison(comparison._id)}
                    style={{
                      padding: '8px 16px',
                      background: 'transparent',
                      color: 'var(--primary-color)',
                      border: '1px solid var(--primary-color)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Share
                  </button>
                  <button
                    onClick={() => deleteComparison(comparison._id)}
                    style={{
                      padding: '8px 16px',
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Comparison Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                      <th style={{
                        textAlign: 'left',
                        padding: '12px 8px',
                        color: 'var(--text-color)',
                        fontWeight: '600'
                      }}>
                        Property
                      </th>
                      {comparison.products.map((product, index) => (
                        <th
                          key={index}
                          style={{
                            textAlign: 'left',
                            padding: '12px 8px',
                            color: 'var(--text-color)',
                            fontWeight: '600',
                            minWidth: '150px'
                          }}
                        >
                          {product.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.compareFields.map(field => (
                      <tr key={field} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{
                          padding: '12px 8px',
                          color: 'var(--text-color)',
                          fontWeight: '600',
                          textTransform: 'capitalize'
                        }}>
                          {field}
                        </td>
                        {comparison.products.map((product, index) => (
                          <td
                            key={index}
                            style={{
                              padding: '12px 8px',
                              color: 'var(--text-color)'
                            }}
                          >
                            {field === 'price' && product[field] 
                              ? `$${product[field]}`
                              : product[field] || 'N/A'
                            }
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{
                marginTop: '16px',
                padding: '12px',
                background: 'rgba(156, 163, 175, 0.1)',
                borderRadius: '6px'
              }}>
                <p style={{
                  color: 'var(--muted)',
                  fontSize: '14px',
                  margin: 0
                }}>
                  Created on {new Date(comparison.createdAt).toLocaleDateString()}
                  {comparison.isPublic && ' • Public comparison'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          color: 'var(--text-color)',
          fontSize: '32px',
          marginBottom: '8px'
        }}>
          Product Comparison
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '16px' }}>
          Compare products side by side to make informed decisions
        </p>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '2px solid var(--border-color)',
          paddingBottom: '16px'
        }}>
          {[
            { id: 'create', label: 'Create Comparison', icon: '➕' },
            { id: 'view', label: 'My Comparisons', icon: '📊' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 20px',
                background: activeTab === tab.id ? 'var(--primary-color)' : 'transparent',
                color: activeTab === tab.id ? 'white' : 'var(--text-color)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'create' && renderCreateTab()}
      {activeTab === 'view' && renderViewTab()}
    </div>
  );
}
