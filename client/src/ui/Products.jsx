import React, { useState, useEffect } from 'react'
import API from '../auth'
import { useLocation, useNavigate } from 'react-router-dom'

export default function Products() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [category, setCategory] = useState('')
  const [sortBy, setSortBy] = useState('relevance')
  const location = useLocation()
  const navigate = useNavigate()

  const categories = ['All', 'Cleanser', 'Serum', 'Moisturizer', 'Sunscreen', 'Toner', 'Mask']

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
  }, [location.search])

  const loadProducts = async (searchTerm = '', cat = '', sort = 'relevance') => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (cat && cat !== 'All') params.append('category', cat)
      if (sort && sort !== 'relevance') params.append('sort', sort)
      
      const { data } = await API.get(`/products?${params.toString()}`)
      setProducts(data.products || [])
    } catch (error) {
      console.error('Error loading products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const performSearch = (searchTerm) => {
    loadProducts(searchTerm, category, sortBy)
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
        'axis y serum', 'axis y dark spot', 'niacinamide', 'vitamin c', 'retinol',
        'hyaluronic acid', 'salicylic acid', 'glycolic acid', 'moisturizer',
        'cleanser', 'sunscreen', 'toner', 'serum', 'the ordinary', 'cerave',
        'la roche posay', 'cetaphil', 'neutrogena'
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
    loadProducts(search, newCategory, sortBy)
  }

  const handleSortChange = (newSort) => {
    setSortBy(newSort)
    loadProducts(search, category, newSort)
  }

  const highlightText = (text, searchTerm) => {
    if (!searchTerm) return text
    
    const regex = new RegExp(`(${searchTerm})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? 
        <span key={index} style={{backgroundColor: '#fef3c7', fontWeight: 'bold'}}>{part}</span> : 
        part
    )
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
          Skincare Products
        </h1>
        <p style={{
          fontSize: '1.1rem',
          color: '#6b7280',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          Discover professional skincare products with expert reviews and ingredient analysis
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
              placeholder="Search products, brands, ingredients... (try 'axis y serum')"
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
                    ':hover': { backgroundColor: '#f9fafb' }
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
          alignItems: 'center'
        }}>
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
                  background: (cat === 'All' && !category) || category === cat ? '#3b82f6' : 'white',
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
            <option value="relevance">Sort by Relevance</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Name A-Z</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔄</div>
          <p style={{ color: '#6b7280' }}>Searching products...</p>
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
            {products.map(product => (
              <div
                key={product._id}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid #f3f4f6',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-4px)'
                  e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)'
                }}
              >
                {/* Product Image */}
                <div style={{
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                  height: '200px',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px'
                }}>
                  🧴
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
                  fontWeight: '500'
                }}>
                  {highlightText(product.brand, search)}
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

                {/* Key Ingredients */}
                {product.keyIngredients && product.keyIngredients.length > 0 && (
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
                      {product.keyIngredients.slice(0, 3).map((ingredient, index) => (
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
                      {product.keyIngredients.length > 3 && (
                        <span style={{
                          color: '#6b7280',
                          fontSize: '11px'
                        }}>
                          +{product.keyIngredients.length - 3} more
                        </span>
                      )}
                    </div>
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
                  <span style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#059669'
                  }}>
                    ${product.price}
                  </span>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{
                      background: '#f3f4f6',
                      color: '#374151',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}>
                      ❤️ Save
                    </button>
                    <button style={{
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}>
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
