import React, { useState, useEffect } from 'react'
import API from '../auth'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Products() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [category, setCategory] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [source, setSource] = useState('all') // all, local, external
  const [sourceStats, setSourceStats] = useState({})
  const [wishlist, setWishlist] = useState([])
  const location = useLocation()
  const navigate = useNavigate()

  const categories = ['All', 'Cleanser', 'Serum', 'Moisturizer', 'Sunscreen', 'Toner', 'Mask', 'Foundation', 'Lipstick', 'Eyeshadow']

  useEffect(() => {
    // Get search from URL params
    const params = new URLSearchParams(location.search)
    const searchParam = params.get('search')
    if (searchParam) {
      setSearch(searchParam)
      performSearch(searchParam)
    } else {
      loadProducts()
    }
    
    // Load wishlist if user is logged in
    if (user) {
      loadWishlist()
    }
  }, [location.search, user])

  const loadWishlist = async () => {
    try {
      const response = await API.get('/wishlist')
      const wishlistProducts = response.data.wishlist?.products || []
      setWishlist(wishlistProducts)
    } catch (error) {
      console.error('Error loading wishlist:', error)
    }
  }

  const loadProducts = async (searchTerm = '', cat = '', sort = 'name', src = 'all') => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (cat && cat !== 'All') params.append('category', cat)
      if (sort && sort !== 'name') params.append('sortBy', sort)
      if (src !== 'all') params.append('source', src)
      
      const { data } = await API.get(`/products?${params.toString()}`)
      setProducts(data.products || [])
      setSourceStats(data.sources || {})
    } catch (error) {
      console.error('Error loading products:', error)
      setProducts([])
      setSourceStats({})
    } finally {
      setLoading(false)
    }
  }

  const loadExternalProducts = async (sourceType = 'all') => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (sourceType !== 'all') params.append('source', sourceType)
      
      const { data } = await API.get(`/products/external?${params.toString()}`)
      setProducts(data.products || [])
      setSourceStats(data.sources || {})
    } catch (error) {
      console.error('Error loading external products:', error)
      setProducts([])
      setSourceStats({})
    } finally {
      setLoading(false)
    }
  }

  const performSearch = (searchTerm) => {
    loadProducts(searchTerm, category, sortBy, source)
    // Update URL
    if (searchTerm) {
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`)
    }
  }

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearch(value)
    
    if (value.length > 1) {
      // Generate suggestions based on common skincare terms
      const commonTerms = [
        'cleanser', 'moisturizer', 'serum', 'sunscreen', 'toner', 'mask',
        'niacinamide', 'vitamin c', 'retinol', 'hyaluronic acid', 
        'salicylic acid', 'glycolic acid', 'foundation', 'lipstick',
        'maybelline', 'colourpop', 'revlon', 'loreal', 'neutrogena'
      ]
      
      const filtered = commonTerms
        .filter(term => term.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 5)
      
      setSuggestions(filtered)
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (suggestion) => {
    setSearch(suggestion)
    setShowSuggestions(false)
    performSearch(suggestion)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setShowSuggestions(false)
    performSearch(search)
  }

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory)
    loadProducts(search, newCategory, sortBy, source)
  }

  const handleSortChange = (newSort) => {
    setSortBy(newSort)
    loadProducts(search, category, newSort, source)
  }

  const handleSourceChange = (newSource) => {
    setSource(newSource)
    if (newSource === 'external') {
      loadExternalProducts('all')
    } else {
      loadProducts(search, category, sortBy, newSource)
    }
  }

  const highlightText = (text, searchTerm) => {
    if (!searchTerm || !text) return text
    
    const regex = new RegExp(`(${searchTerm})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? 
        <span key={index} style={{backgroundColor: '#fef3c7', fontWeight: 'bold'}}>{part}</span> : 
        part
    )
  }

  const getProductImage = (product) => {
    if (product.image) {
      return product.image
    }
    // Default images based on category
    const categoryImages = {
      'Cleanser': '🧼',
      'Moisturizer': '🧴',
      'Serum': '💧',
      'Sunscreen': '☀️',
      'Toner': '💧',
      'Mask': '🎭',
      'Foundation': '💄',
      'Lipstick': '💋',
      'Eyeshadow': '👁️',
      'Mascara': '👁️',
      'Concealer': '💄',
      'Powder': '💄',
      'Blush': '🌸',
      'Bronzer': '🌟'
    }
    return categoryImages[product.category] || '🧴'
  }

  const getSourceBadge = (source) => {
    const badges = {
      'makeup-api': { text: 'Makeup API', color: '#ec4899', bg: '#fce7f3' },
      'skincare-api': { text: 'SkinCare', color: '#059669', bg: '#ecfdf5' },
      'sephora': { text: 'Sephora', color: '#7c3aed', bg: '#f3e8ff' },
      'dummy-api': { text: 'Featured', color: '#dc2626', bg: '#fef2f2' },
      'local': { text: 'Local', color: '#1f2937', bg: '#f9fafb' }
    }
    return badges[source] || { text: source, color: '#6b7280', bg: '#f3f4f6' }
  }

  const isInWishlist = (product) => {
    if (!user || !wishlist.length) return false
    
    // Check if product is in wishlist (support both local and external products)
    return wishlist.some(item => 
      (product._id && item.productId === product._id) || // Local product
      (product.id && item.externalId === product.id) // External product
    )
  }

  const toggleWishlist = async (product) => {
    if (!user) {
      alert('Please login to add products to wishlist')
      return
    }

    try {
      const isExternal = !product._id // External product if no MongoDB _id
      const productId = product._id || product.id

      if (isInWishlist(product)) {
        // Remove from wishlist
        await API.delete('/wishlist/remove', {
          data: { productId, isExternal }
        })
        
        setWishlist(prev => prev.filter(item => 
          isExternal 
            ? item.externalId !== productId 
            : item.productId !== productId
        ))
      } else {
        // Add to wishlist
        await API.post('/wishlist/add', {
          productId,
          isExternal,
          productData: {
            name: product.name,
            brand: product.brand,
            price: product.price,
            image_link: product.image_link || product.image,
            product_link: product.product_link,
            category: product.category,
            rating: product.rating,
            description: product.description
          }
        })
        
        // Update local wishlist state
        const newItem = {
          productId: isExternal ? null : productId,
          externalId: isExternal ? productId : null,
          name: product.name,
          brand: product.brand,
          price: product.price,
          image_link: product.image_link || product.image,
          product_link: product.product_link,
          category: product.category,
          rating: product.rating
        }
        
        setWishlist(prev => [...prev, newItem])
      }
    } catch (error) {
      console.error('Error updating wishlist:', error)
      alert('Failed to update wishlist')
    }
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          marginBottom: '16px',
          color: '#1f2937'
        }}>
          Beauty & Skincare Products
        </h1>
        <p style={{
          fontSize: '1.1rem',
          color: '#6b7280',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          Discover thousands of beauty and skincare products from trusted APIs and local database
        </p>
      </div>

      {/* Search and Filters */}
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '16px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
        marginBottom: '30px',
        border: '1px solid #f3f4f6'
      }}>
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} style={{ position: 'relative', marginBottom: '20px' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search products, brands, ingredients... (try 'maybelline' or 'moisturizer')"
              style={{
                width: '100%',
                padding: '16px 50px 16px 20px',
                fontSize: '16px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                outline: 'none',
                transition: 'border-color 0.2s ease',
                background: '#fafafa'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb'
                setTimeout(() => setShowSuggestions(false), 200)
              }}
            />
            <button
              type="submit"
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              🔍
            </button>
          </div>
          
          {/* Search Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              zIndex: 1000,
              marginTop: '4px'
            }}>
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    borderBottom: index < suggestions.length - 1 ? '1px solid #f3f4f6' : 'none',
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                >
                  <span style={{ fontSize: '14px' }}>🔍</span> {suggestion}
                </div>
              ))}
            </div>
          )}
        </form>

        {/* Filters */}
        <div style={{
          display: 'flex',
          gap: '20px',
          flexWrap: 'wrap',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          {/* Data Source Filter */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginRight: '8px' }}>
              Source:
            </label>
            {['all', 'local', 'external'].map(src => (
              <button
                key={src}
                onClick={() => handleSourceChange(src)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '20px',
                  background: source === src ? '#3b82f6' : 'white',
                  color: source === src ? 'white' : '#374151',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  textTransform: 'capitalize'
                }}
              >
                {src}
              </button>
            ))}
          </div>

          {/* Categories */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat === 'All' ? '' : cat)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '20px',
                  background: (cat === 'All' && !category) || category === cat ? '#10b981' : 'white',
                  color: (cat === 'All' && !category) || category === cat ? 'white' : '#374151',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              background: 'white',
              cursor: 'pointer'
            }}
          >
            <option value="name">Sort by Name</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="brand">Brand A-Z</option>
          </select>
        </div>

        {/* Source Statistics */}
        {Object.keys(sourceStats).length > 0 && (
          <div style={{
            background: '#f8fafc',
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <p style={{ fontSize: '14px', color: '#475569', margin: 0 }}>
              Data sources: {Object.entries(sourceStats).map(([key, value]) => `${key}: ${value}`).join(' | ')}
            </p>
          </div>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔄</div>
          <p style={{ color: '#6b7280' }}>Loading products...</p>
        </div>
      ) : (
        <>
          {/* Results Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            padding: '0 4px'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#1f2937',
              margin: 0
            }}>
              {search ? `Search Results for "${search}"` : 'All Products'}
            </h2>
            <span style={{
              color: '#6b7280',
              fontSize: '14px'
            }}>
              {products.length} products found
            </span>
          </div>

          {/* Products Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {products.map((product, index) => {
              const badge = getSourceBadge(product.source || 'local')
              
              return (
                <div
                  key={product._id || product.externalId || index}
                  onClick={() => navigate(`/products/${product._id || product.id}`)}
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid #f3f4f6',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  {/* Source Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: badge.bg,
                    color: badge.color,
                    padding: '4px 8px',
                    borderRadius: '8px',
                    fontSize: '10px',
                    fontWeight: '600'
                  }}>
                    {badge.text}
                  </div>

                  {/* Product Image */}
                  <div style={{
                    background: product.image ? 'transparent' : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    height: '200px',
                    borderRadius: '12px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '48px',
                    overflow: 'hidden'
                  }}>
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: '12px'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.parentNode.innerHTML = getProductImage(product)
                        }}
                      />
                    ) : (
                      getProductImage(product)
                    )}
                  </div>

                  {/* Category Badge */}
                  <div style={{
                    background: '#f0f9ff',
                    color: '#0369a1',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    display: 'inline-block',
                    marginBottom: '12px'
                  }}>
                    {product.category}
                  </div>

                  {/* Product Name */}
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#1f2937',
                    lineHeight: '1.4'
                  }}>
                    {highlightText(product.name, search)}
                  </h3>

                  {/* Brand */}
                  <p style={{
                    color: '#6b7280',
                    fontSize: '14px',
                    marginBottom: '12px',
                    fontWeight: '500',
                    textTransform: 'capitalize'
                  }}>
                    {highlightText(product.brand || 'Unknown Brand', search)}
                  </p>

                  {/* Description */}
                  {product.description && (
                    <p style={{
                      color: '#6b7280',
                      fontSize: '14px',
                      marginBottom: '16px',
                      lineHeight: '1.5',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {highlightText(product.description, search)}
                    </p>
                  )}

                  {/* Ingredients */}
                  {product.ingredients && product.ingredients.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <p style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '4px'
                      }}>
                        Key Ingredients:
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {product.ingredients.slice(0, 3).map((ingredient, index) => (
                          <span
                            key={index}
                            style={{
                              background: '#f0fdf4',
                              color: '#166534',
                              padding: '2px 8px',
                              borderRadius: '8px',
                              fontSize: '11px',
                              fontWeight: '500'
                            }}
                          >
                            {highlightText(ingredient, search)}
                          </span>
                        ))}
                        {product.ingredients.length > 3 && (
                          <span style={{
                            color: '#6b7280',
                            fontSize: '11px'
                          }}>
                            +{product.ingredients.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Rating */}
                  {product.rating > 0 && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginBottom: '12px'
                    }}>
                      <span style={{ color: '#fbbf24' }}>⭐</span>
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>{product.rating}</span>
                      {product.reviewCount > 0 && (
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>
                          ({product.reviewCount} reviews)
                        </span>
                      )}
                    </div>
                  )}

                  {/* Price and Actions */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '16px',
                    borderTop: '1px solid #f3f4f6'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <span style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: product.price > 0 ? '#059669' : '#6b7280'
                      }}>
                        {product.price > 0 ? `৳${product.price?.toLocaleString('bn-BD')}` : 'Price varies'}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                          <span style={{
                            fontSize: '14px',
                            color: '#6b7280',
                            textDecoration: 'line-through'
                          }}>
                            ৳{product.originalPrice?.toLocaleString('bn-BD')}
                          </span>
                          <span style={{
                            background: '#dc2626',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: '600'
                          }}>
                            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {user && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleWishlist(product)
                          }}
                          style={{
                            background: isInWishlist(product) ? '#dc2626' : '#f3f4f6',
                            color: isInWishlist(product) ? 'white' : '#374151',
                            border: 'none',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title={isInWishlist(product) ? 'Remove from wishlist' : 'Add to wishlist'}
                        >
                          {isInWishlist(product) ? '❤️' : '🤍'} 
                          {isInWishlist(product) ? 'Saved' : 'Save'}
                        </button>
                      )}
                      {product.externalUrl && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(product.externalUrl, '_blank')
                          }}
                          style={{
                            background: '#f3f4f6',
                            color: '#374151',
                            border: 'none',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            fontWeight: '500'
                          }}
                        >
                          🔗 View Original
                        </button>
                      )}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/products/${product._id || product.id}`)
                        }}
                        style={{
                          background: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          fontWeight: '500'
                        }}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* No Results */}
          {products.length === 0 && !loading && (
            <div style={{
              textAlign: 'center',
              padding: '80px 20px',
              background: 'white',
              borderRadius: '16px',
              border: '1px solid #f3f4f6'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#1f2937'
              }}>
                No products found
              </h3>
              <p style={{
                color: '#6b7280',
                marginBottom: '24px'
              }}>
                Try adjusting your search terms or browse our categories
              </p>
              <button
                onClick={() => {
                  setSearch('')
                  setCategory('')
                  setSource('all')
                  loadProducts()
                }}
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                View All Products
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
