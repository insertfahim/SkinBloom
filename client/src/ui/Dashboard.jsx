import React, { useEffect, useState } from 'react'
import API from '../auth'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const CATS = ['Cleanser','Serum','Moisturizer','Sunscreen','Toner','Mask']

export default function Dashboard(){
  const nav = useNavigate()
  const { user } = useAuth()
  const [featured,setFeatured] = useState([])

  useEffect(()=>{ 
    // Load featured products
    (async()=>{
      try{
        const { data } = await API.get('/products')
        setFeatured((data?.products||[]).slice(0,8))
      }catch(e){ 
        // Use fallback data if API fails
        setFeatured([
          { _id: '1', name: 'Axis-Y Dark Spot Correcting Glow Serum', brand: 'Axis-Y', price: 25.99, category: 'Serum' },
          { _id: '2', name: 'The Ordinary Niacinamide 10% + Zinc 1%', brand: 'The Ordinary', price: 7.90, category: 'Serum' },
          { _id: '3', name: 'CeraVe Hydrating Cleanser', brand: 'CeraVe', price: 14.99, category: 'Cleanser' },
          { _id: '4', name: 'La Roche-Posay Anthelios Ultra-Light Fluid SPF60', brand: 'La Roche-Posay', price: 35.99, category: 'Sunscreen' }
        ])
      }
    })() 
  },[])

  return (
    <div style={{display:'grid',gap:0, minHeight: '100vh'}}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #f8fffe 0%, #e6fffa 50%, #b2f5ea 100%)',
        padding: '80px 20px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-10%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
          borderRadius: '50%'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-30%',
          left: '-5%',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
          borderRadius: '50%'
        }}></div>

        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1
        }}>
          <h1 style={{
            fontSize: '4rem',
            fontWeight: '700',
            marginBottom: '24px',
            background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: '1.1'
          }}>
            Transform Your Skincare Journey with SkinBloom
          </h1>
          
          <p style={{
            fontSize: '1.5rem',
            color: '#4b5563',
            marginBottom: '48px',
            maxWidth: '800px',
            margin: '0 auto 48px',
            lineHeight: '1.6'
          }}>
            Personalized skincare routines, expert guidance, and comprehensive tracking tools for healthier, glowing skin
          </p>

          <div style={{
            display: 'flex',
            gap: '20px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            {!user ? (
              <>
                <Link to="/register" style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: 'white',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  textDecoration: 'none',
                  boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)',
                  transition: 'transform 0.3s ease'
                }}>
                  Get Started Free
                </Link>
                <Link to="/products" style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  color: '#374151',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  textDecoration: 'none',
                  border: '2px solid #e5e7eb',
                  transition: 'transform 0.3s ease'
                }}>
                  Explore Products
                </Link>
              </>
            ) : (
              <>
                <Link to="/profile" style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: 'white',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  textDecoration: 'none',
                  boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)'
                }}>
                  Complete Your Profile
                </Link>
                <Link to="/routine" style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  color: '#374151',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  textDecoration: 'none',
                  border: '2px solid #e5e7eb'
                }}>
                  Build Routine
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        padding: '100px 20px',
        background: '#ffffff'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '80px'
          }}>
            <h2 style={{
              fontSize: '3rem',
              fontWeight: '700',
              marginBottom: '24px',
              color: '#1f2937'
            }}>
              Everything You Need for Perfect Skin
            </h2>
            <p style={{
              fontSize: '1.25rem',
              color: '#6b7280',
              maxWidth: '700px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              From personal skin profiling to professional dermatologist consultations - everything you need for healthy skin
            </p>
          </div>

          <div style={{
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
            gap: 40
          }}>
            <Link to="/profile" style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'linear-gradient(135deg, #fef7ff 0%, #f3e8ff 100%)',
                padding: '40px 30px',
                borderRadius: '20px',
                textAlign: 'center',
                border: '1px solid #e5e7eb',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'pointer',
                height: '100%'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                  width: '80px',
                  height: '80px',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  fontSize: '32px'
                }}>👤</div>
                <h3 style={{fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#1f2937'}}>
                  Personal Skin Profile
                </h3>
                <p style={{color: '#6b7280', lineHeight: '1.6'}}>
                  Upload photos, select skin type (oily, dry, combination, sensitive), include age, gender, allergies, and concerns for personalized care
                </p>
              </div>
            </Link>
            
            <Link to="/routine" style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
                padding: '40px 30px',
                borderRadius: '20px',
                textAlign: 'center',
                border: '1px solid #e5e7eb',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'pointer',
                height: '100%'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  width: '80px',
                  height: '80px',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  fontSize: '32px'
                }}>📋</div>
                <h3 style={{fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#1f2937'}}>
                  Routine Builder
                </h3>
                <p style={{color: '#6b7280', lineHeight: '1.6'}}>
                  Create AM/PM skincare routines with step-by-step product usage guides, set reminders, and track daily activities
                </p>
              </div>
            </Link>
            
            <Link to="/products" style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
                padding: '40px 30px',
                borderRadius: '20px',
                textAlign: 'center',
                border: '1px solid #e5e7eb',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'pointer',
                height: '100%'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  width: '80px',
                  height: '80px',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  fontSize: '32px'
                }}>🛒</div>
                <h3 style={{fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#1f2937'}}>
                  Product Tracking
                </h3>
                <p style={{color: '#6b7280', lineHeight: '1.6'}}>
                  Add skincare products with ingredients, get suggestions based on skin type, rate products, and track reactions
                </p>
              </div>
            </Link>

            <Link to="/timeline" style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'linear-gradient(135deg, #fef3f2 0%, #fecaca 100%)',
                padding: '40px 30px',
                borderRadius: '20px',
                textAlign: 'center',
                border: '1px solid #e5e7eb',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'pointer',
                height: '100%'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  width: '80px',
                  height: '80px',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  fontSize: '32px'
                }}>📈</div>
                <h3 style={{fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#1f2937'}}>
                  Progress Timeline
                </h3>
                <p style={{color: '#6b7280', lineHeight: '1.6'}}>
                  Track your skincare journey with before/after photos, daily logs, and progress milestones over time
                </p>
              </div>
            </Link>

            <Link to="/tickets" style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'linear-gradient(135deg, #f0f9ff 0%, #bae6fd 100%)',
                padding: '40px 30px',
                borderRadius: '20px',
                textAlign: 'center',
                border: '1px solid #e5e7eb',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'pointer',
                height: '100%'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  width: '80px',
                  height: '80px',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  fontSize: '32px'
                }}>🩺</div>
                <h3 style={{fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#1f2937'}}>
                  Professional Help
                </h3>
                <p style={{color: '#6b7280', lineHeight: '1.6'}}>
                  Submit consultation tickets to dermatologists, get expert advice, and receive personalized treatment recommendations
                </p>
              </div>
            </Link>

            <Link to="/feedback" style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
                padding: '40px 30px',
                borderRadius: '20px',
                textAlign: 'center',
                border: '1px solid #e5e7eb',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'pointer',
                height: '100%'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                  width: '80px',
                  height: '80px',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  fontSize: '32px'
                }}>❤️</div>
                <h3 style={{fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#1f2937'}}>
                  Favourites & Reviews
                </h3>
                <p style={{color: '#6b7280', lineHeight: '1.6'}}>
                  Save favorite products, write detailed reviews, rate effectiveness, and share experiences with the community
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section style={{
        padding: '100px 20px',
        background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '60px'
          }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              marginBottom: '20px',
              color: '#1f2937'
            }}>
              Featured Skincare Products
            </h2>
            <p style={{
              fontSize: '1.1rem',
              color: '#6b7280',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Discover trending products loved by our skincare community
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '30px'
          }}>
            {featured.map(prod => (
              <div key={prod._id} style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #e5e7eb',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'pointer'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                  height: '200px',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px'
                }}>🧴</div>
                
                <div style={{
                  background: '#f3f4f6',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#6b7280',
                  display: 'inline-block',
                  marginBottom: '12px'
                }}>
                  {prod.category}
                </div>

                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#1f2937',
                  lineHeight: '1.4'
                }}>
                  {prod.name}
                </h3>

                <p style={{
                  color: '#6b7280',
                  fontSize: '14px',
                  marginBottom: '16px'
                }}>
                  {prod.brand}
                </p>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#059669'
                  }}>
                    ${prod.price}
                  </span>
                  
                  <button style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}>
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            textAlign: 'center',
            marginTop: '50px'
          }}>
            <Link to="/products" style={{
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              color: 'white',
              padding: '16px 32px',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: '600',
              textDecoration: 'none',
              boxShadow: '0 10px 25px rgba(5, 150, 105, 0.3)'
            }}>
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section style={{padding: '80px 20px', background: '#f9fafb'}}>
        <div style={{maxWidth: '1200px', margin: '0 auto'}}>
          <div style={{textAlign: 'center', marginBottom: '50px'}}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              marginBottom: '16px',
              color: '#1f2937'
            }}>
              Shop by Category
            </h2>
            <p style={{fontSize: '18px', color: '#6b7280'}}>
              Find the perfect products for every step of your routine
            </p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 20
          }}>
            {CATS.map((c, index)=>{
              const colors = [
                'linear-gradient(135deg, #fef7ff 0%, #f3e8ff 100%)',
                'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
                'linear-gradient(135deg, #fef3f2 0%, #fecaca 100%)',
                'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
                'linear-gradient(135deg, #f0f9ff 0%, #dbeafe 100%)',
                'linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)'
              ]
              return (
                <div 
                  key={c} 
                  onClick={()=>nav(`/products?category=${encodeURIComponent(c)}`)}
                  style={{
                    background: colors[index % colors.length],
                    padding: '30px 20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    borderRadius: '16px',
                    border: '1px solid rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{fontSize: '24px', fontWeight: '600', color: '#1f2937'}}>
                    {c}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section style={{
          padding: '80px 20px',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{maxWidth: '800px', margin: '0 auto'}}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              marginBottom: '24px'
            }}>
              Take Control of Your Skin Health
            </h2>
            <p style={{
              fontSize: '20px',
              opacity: '0.9',
              marginBottom: '40px',
              lineHeight: '1.6'
            }}>
              From personal skin profiling to professional dermatologist consultations - build routines, track progress, and get expert advice all in one place.
            </p>
            <div style={{display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap'}}>
              <button 
                onClick={()=>nav('/register')}
                style={{
                  background: 'white',
                  color: '#10b981',
                  padding: '16px 32px',
                  fontSize: '18px',
                  fontWeight: '600',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 20px rgba(255,255,255,0.2)'
                }}
              >
                👤 Create Your Profile
              </button>
              <button 
                onClick={()=>nav('/products')}
                style={{
                  background: 'transparent',
                  color: 'white',
                  padding: '16px 32px',
                  fontSize: '18px',
                  fontWeight: '600',
                  borderRadius: '12px',
                  border: '2px solid white',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                🛍️ Browse Products
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
