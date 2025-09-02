import React, { useEffect, useState } from 'react'
import axios from 'axios'

// Simple standalone products page for testing search functionality
export default function ProductsTest() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')
  const [skin, setSkin] = useState('')
  const [sortBy, setSortBy] = useState('name')

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        const response = await axios.get('http://localhost:5000/api/products')
        setItems(response.data.products || [])
      } catch (error) {
        console.error('Error loading products:', error)
        setItems([])
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [])

  const filtered = items.filter(p => {
    const t = (q || '').toLowerCase()
    const catOk = !category || p.category?.toLowerCase() === category.toLowerCase()
    const skinOk = !skin || (p.skinTypeSuitability || []).map(s => s.toLowerCase()).includes(skin.toLowerCase())
    const textOk = !t || [p.name, p.brand, (p.ingredients || []).join(' ')].join(' ').toLowerCase().includes(t)
    return catOk && skinOk && textOk
  })

  const highlightSearchTerm = (text, searchTerm) => {
    if (!searchTerm || !text) return text
    const regex = new RegExp(`(${searchTerm})`, 'gi')
    const parts = text.split(regex)
    return parts.map((part, index) => 
      regex.test(part) ? 
        <span key={index} style={{background: '#fef3c7', fontWeight: 'bold'}}>{part}</span> : 
        part
    )
  }

  return (
    <div style={{maxWidth: '1200px', margin: '0 auto', padding: '20px'}}>
      {/* Header */}
      <div style={{marginBottom: '30px', textAlign: 'center'}}>
        <h1 style={{fontSize: '32px', fontWeight: '700', marginBottom: '8px', color: '#1f2937'}}>
          🌸 SkinBloom Products
        </h1>
        <p style={{color: '#6b7280', fontSize: '16px'}}>
          Test the professional search functionality - try searching "axis y serum"
        </p>
      </div>

      {/* Search */}
      <div style={{
        background: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        marginBottom: '30px',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{marginBottom: '20px'}}>
          <input 
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '16px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px'
            }}
            placeholder="Search for products, brands, or ingredients (e.g., 'axis y serum', 'niacinamide')"
            value={q} 
            onChange={e => setQ(e.target.value)}
          />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          <select 
            value={category} 
            onChange={e => setCategory(e.target.value)}
            style={{padding: '12px', border: '1px solid #e5e7eb', borderRadius: '6px'}}
          >
            <option value="">All Categories</option>
            {['Cleanser','Serum','Moisturizer','Sunscreen','Toner','Mask'].map(c => 
              <option key={c} value={c}>{c}</option>
            )}
          </select>
          
          <select 
            value={skin} 
            onChange={e => setSkin(e.target.value)}
            style={{padding: '12px', border: '1px solid #e5e7eb', borderRadius: '6px'}}
          >
            <option value="">All Skin Types</option>
            {['oily','dry','combination','sensitive','normal'].map(s => 
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            )}
          </select>

          <button 
            onClick={() => {setQ(''); setCategory(''); setSkin('')}}
            style={{
              background: '#f3f4f6',
              color: '#374151',
              border: '1px solid #d1d5db',
              padding: '12px 16px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Products */}
      {loading ? (
        <div style={{textAlign: 'center', padding: '60px'}}>
          <p>Loading products...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{textAlign: 'center', padding: '60px'}}>
          <h3>No products found</h3>
          <p>{q ? `No results for "${q}"` : 'No products available'}</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {filtered.map(p => (
            <div key={p._id} style={{
              background: 'white',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              border: '1px solid #e5e7eb'
            }}>
              <img 
                src={p.image || `https://picsum.photos/seed/${p._id}/400/300`} 
                alt={p.name}
                style={{width: '100%', height: '200px', objectFit: 'cover'}}
              />
              
              <div style={{padding: '20px'}}>
                <div style={{
                  color: '#10b981',
                  fontSize: '12px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  marginBottom: '8px'
                }}>
                  {highlightSearchTerm(p.brand || 'Brand', q)}
                </div>
                
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#1f2937'
                }}>
                  {highlightSearchTerm(p.name, q)}
                </h4>

                {p.ingredients && p.ingredients.length > 0 && (
                  <p style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    marginBottom: '12px'
                  }}>
                    Key: {p.ingredients.slice(0, 3).map(ing => highlightSearchTerm(ing, q)).reduce((prev, curr, index) => [prev, index > 0 ? ', ' : '', curr])}
                  </p>
                )}

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#10b981'
                  }}>
                    ₹{p.price || '999'}
                  </div>
                  <button style={{
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}>
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{marginTop: '40px', textAlign: 'center', color: '#6b7280'}}>
        <p>Found {filtered.length} product{filtered.length !== 1 ? 's' : ''}</p>
        <p style={{marginTop: '10px'}}>
          <a href="/" style={{color: '#10b981'}}>← Back to Home</a>
        </p>
      </div>
    </div>
  )
}
