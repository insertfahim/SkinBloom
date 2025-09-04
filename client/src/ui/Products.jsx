import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import API from '../auth'

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    skinType: '',
    priceMin: '',
    priceMax: '',
    sortBy: 'popular'
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  })
  const [wishlist, setWishlist] = useState([])
  const [cart, setCart] = useState({ items: [] })

  useEffect(() => {
    fetchProducts()
    fetchWishlist()
    fetchCart()
  }, [filters, pagination.page])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      })
      
      const { data } = await API.get(`/products?${params}`)
      setProducts(data.products)
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total,
        pages: data.pagination.pages
      }))
    } catch (err) {
      setError('Failed to load products')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchWishlist = async () => {
    try {
      const { data } = await API.get('/wishlist')
      setWishlist(data.products?.map(item => item.productId._id) || [])
    } catch (err) {
      // Ignore errors for wishlist (user might not be logged in)
    }
  }

  const fetchCart = async () => {
    try {
      const { data } = await API.get('/cart')
      setCart(data)
    } catch (err) {
      // Ignore errors for cart (user might not be logged in)
    }
  }

  const toggleWishlist = async (productId) => {
    try {
      const isInWishlist = wishlist.includes(productId)
      
      if (isInWishlist) {
        await API.delete(`/wishlist/remove/${productId}`)
        setWishlist(prev => prev.filter(id => id !== productId))
      } else {
        await API.post('/wishlist/add', { productId })
        setWishlist(prev => [...prev, productId])
      }
    } catch (err) {
      console.error('Wishlist error:', err)
    }
  }

  const addToCart = async (productId) => {
    try {
      const { data } = await API.post('/cart/add', { productId, quantity: 1 })
      setCart(data)
      alert('Product added to cart!')
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add to cart')
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const resetFilters = () => {
    setFilters({
      search: '',
      category: '',
      skinType: '',
      priceMin: '',
      priceMax: '',
      sortBy: 'popular'
    })
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  if (loading && products.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: '18px', color: 'var(--muted)' }}>
          Loading products...
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff' }}>
      {/* Header */}
      <div style={{
        background: '#f8f9fa',
        borderBottom: '1px solid #e9ecef',
        padding: '20px 0'
      }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '24px', margin: '0', color: '#2d3748' }}>
                Skincare Products
              </h1>
              <p style={{ fontSize: '14px', color: '#718096', margin: '4px 0 0 0' }}>
                Showing {products.length} of {pagination.total} products
              </p>
            </div>
            
            {/* Cart Info */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <Link
                to="/cart"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  color: '#2d3748',
                  fontSize: '14px'
                }}
              >
                🛒 Cart ({cart.totalItems || 0})
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' }}>
        {/* Filters */}
        <div style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '30px'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <input
              className="input"
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              style={{
                padding: '10px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
            
            <select
              className="input"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              style={{
                padding: '10px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="">All Categories</option>
              <option value="Cleanser">Cleanser</option>
              <option value="Toner">Toner</option>
              <option value="Serum">Serum</option>
              <option value="Treatment">Treatment</option>
              <option value="Moisturizer">Moisturizer</option>
              <option value="Sunscreen">Sunscreen</option>
            </select>

            <select
              className="input"
              value={filters.skinType}
              onChange={(e) => handleFilterChange('skinType', e.target.value)}
              style={{
                padding: '10px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="">All Skin Types</option>
              <option value="All">All Skin Types</option>
              <option value="Dry">Dry</option>
              <option value="Oily">Oily</option>
              <option value="Combination">Combination</option>
              <option value="Sensitive">Sensitive</option>
              <option value="Normal">Normal</option>
            </select>

            <select
              className="input"
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              style={{
                padding: '10px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name A-Z</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              className="input"
              type="number"
              placeholder="Min price"
              value={filters.priceMin}
              onChange={(e) => handleFilterChange('priceMin', e.target.value)}
              style={{
                width: '120px',
                padding: '8px 10px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
            <span style={{ color: '#718096' }}>-</span>
            <input
              className="input"
              type="number"
              placeholder="Max price"
              value={filters.priceMax}
              onChange={(e) => handleFilterChange('priceMax', e.target.value)}
              style={{
                width: '120px',
                padding: '8px 10px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
            <button
              onClick={resetFilters}
              style={{
                padding: '8px 16px',
                background: '#f7fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                color: '#4a5568',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            background: '#fed7d7',
            border: '1px solid #fc8181',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '20px',
            color: '#9b2c2c',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {/* Products Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          {products.map(product => (
            <ProductCard
              key={product._id}
              product={product}
              isInWishlist={wishlist.includes(product._id)}
              onToggleWishlist={() => toggleWishlist(product._id)}
              onAddToCart={() => addToCart(product._id)}
            />
          ))}
        </div>

        {products.length === 0 && !loading && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'white',
            borderRadius: '12px',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <h3 style={{ marginBottom: '8px' }}>No products found</h3>
            <p style={{ color: 'var(--muted)', marginBottom: '20px' }}>
              Try adjusting your filters or search terms
            </p>
            <button className="btn" onClick={resetFilters}>
              Clear All Filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '40px'
          }}>
            <button
              className="btn secondary"
              disabled={pagination.page === 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              Previous
            </button>
            
            {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
              const page = i + 1
              return (
                <button
                  key={page}
                  className={`btn ${page === pagination.page ? '' : 'secondary'}`}
                  onClick={() => setPagination(prev => ({ ...prev, page }))}
                >
                  {page}
                </button>
              )
            })}
            
            <button
              className="btn secondary"
              disabled={pagination.page === pagination.pages}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function ProductCard({ product, isInWishlist, onToggleWishlist, onAddToCart }) {
  const discountedPrice = product.discount > 0 
    ? product.price * (1 - product.discount / 100)
    : product.price

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      overflow: 'hidden',
      transition: 'all 0.2s ease',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)'
      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)'
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)'
      e.currentTarget.style.boxShadow = 'none'
    }}>
      
      {/* Product Image */}
      <Link to={`/products/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{
          height: '240px',
          background: `url(${product.image}) center/cover`,
          backgroundColor: '#f7fafc',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Badges */}
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            {product.featured && (
              <span style={{
                background: '#3182ce',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '600',
                textTransform: 'uppercase'
              }}>
                Featured
              </span>
            )}
            {product.discount > 0 && (
              <span style={{
                background: '#e53e3e',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '600'
              }}>
                -{product.discount}% OFF
              </span>
            )}
          </div>
          
          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onToggleWishlist()
            }}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '16px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'white'
              e.currentTarget.style.transform = 'scale(1.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            {isInWishlist ? '❤️' : '🤍'}
          </button>

          {/* Quick Add Overlay */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
            padding: '20px 16px 16px',
            transform: 'translateY(100%)',
            transition: 'transform 0.3s ease',
            opacity: 0
          }}
          className="quick-add-overlay">
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onAddToCart()
              }}
              style={{
                width: '100%',
                padding: '10px',
                background: 'white',
                border: 'none',
                borderRadius: '6px',
                color: '#2d3748',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Quick Add to Cart
            </button>
          </div>
        </div>
      </Link>

      <div style={{ padding: '16px' }}>
        <Link to={`/products/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          {/* Brand */}
          <div style={{
            fontSize: '12px',
            color: '#718096',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '4px'
          }}>
            {product.brand}
          </div>

          {/* Product Name */}
          <h3 style={{
            fontSize: '14px',
            fontWeight: '600',
            lineHeight: '1.3',
            margin: '0 0 8px 0',
            color: '#2d3748',
            height: '36px',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            {product.name}
          </h3>

          {/* Category */}
          <div style={{ marginBottom: '8px' }}>
            <span style={{
              background: '#edf2f7',
              color: '#4a5568',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: '500'
            }}>
              {product.category}
            </span>
          </div>

          {/* Rating */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            marginBottom: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <span
                  key={star}
                  style={{
                    color: star <= Math.floor(product.rating) ? '#fbbf24' : '#e5e7eb',
                    fontSize: '12px'
                  }}
                >
                  ⭐
                </span>
              ))}
            </div>
            <span style={{ fontSize: '12px', color: '#718096' }}>
              ({product.reviewCount || 0})
            </span>
          </div>

          {/* Price */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontSize: '16px',
                fontWeight: '700',
                color: '#2d3748'
              }}>
                ${discountedPrice.toFixed(2)}
              </span>
              {product.discount > 0 && (
                <span style={{
                  fontSize: '14px',
                  color: '#a0aec0',
                  textDecoration: 'line-through'
                }}>
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>
            {product.discount > 0 && (
              <div style={{
                fontSize: '11px',
                color: '#38a169',
                fontWeight: '600'
              }}>
                Save ${(product.price - discountedPrice).toFixed(2)}
              </div>
            )}
          </div>
        </Link>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onAddToCart}
            disabled={!product.inStock}
            style={{
              flex: 1,
              padding: '10px',
              background: product.inStock ? '#3182ce' : '#a0aec0',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: product.inStock ? 'pointer' : 'not-allowed',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => {
              if (product.inStock) {
                e.currentTarget.style.background = '#2c5aa0'
              }
            }}
            onMouseLeave={(e) => {
              if (product.inStock) {
                e.currentTarget.style.background = '#3182ce'
              }
            }}
          >
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
          
          <Link
            to={`/products/${product._id}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              background: '#f7fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              color: '#4a5568',
              textDecoration: 'none',
              fontSize: '16px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#edf2f7'
              e.currentTarget.style.borderColor = '#cbd5e0'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f7fafc'
              e.currentTarget.style.borderColor = '#e2e8f0'
            }}
          >
            👁️
          </Link>
        </div>

        {/* Stock Status */}
        {product.inStock && product.stockQuantity <= 10 && (
          <div style={{
            marginTop: '8px',
            fontSize: '11px',
            color: '#d69e2e',
            fontWeight: '600'
          }}>
            Only {product.stockQuantity} left!
          </div>
        )}
      </div>

      <style jsx>{`
        .quick-add-overlay {
          transform: translateY(100%);
          opacity: 0;
        }
        
        div:hover .quick-add-overlay {
          transform: translateY(0);
          opacity: 1;
        }
      `}</style>
    </div>
  )
}
