import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function SimpleDashboard() {
  const navigate = useNavigate()

  const handleNavigation = (page) => {
    navigate(`/${page}`)
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header/Navigation */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderBottom: '1px solid #e5e7eb',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#059669',
            margin: 0
          }}>
            SkinBloom
          </h1>

          <div style={{
            display: 'flex',
            gap: '20px',
            alignItems: 'center'
          }}>
            <button 
              onClick={() => handleNavigation('products')}
              style={{
                background: 'none',
                border: 'none',
                color: '#374151',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Products
            </button>
            <button 
              onClick={() => handleNavigation('profile')}
              style={{
                background: 'none',
                border: 'none',
                color: '#374151',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Profile
            </button>
            <button 
              onClick={() => handleNavigation('routine')}
              style={{
                background: 'none',
                border: 'none',
                color: '#374151',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Routine
            </button>
            <button 
              onClick={() => handleNavigation('login')}
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              Login
            </button>
            <button 
              onClick={() => handleNavigation('register')}
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              Register
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        background: 'linear-gradient(135deg, #f8fffe 0%, #e6fffa 50%, #b2f5ea 100%)',
        padding: '80px 20px',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: 'bold',
          marginBottom: '24px',
          background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Transform Your Skincare Journey with SkinBloom
        </h1>
        
        <p style={{
          fontSize: '1.25rem',
          color: '#6b7280',
          marginBottom: '48px',
          maxWidth: '700px',
          margin: '0 auto 48px'
        }}>
          Personalized skincare routines, expert guidance, and comprehensive tracking tools for healthier, glowing skin
        </p>

        <div style={{
          display: 'flex',
          gap: '20px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '60px'
        }}>
          <button 
            onClick={() => handleNavigation('register')}
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: 'white',
              padding: '16px 32px',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)'
            }}
          >
            Get Started Free
          </button>
          <button 
            onClick={() => handleNavigation('products')}
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              color: '#374151',
              padding: '16px 32px',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: '600',
              border: '2px solid #e5e7eb',
              cursor: 'pointer'
            }}
          >
            Explore Products
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '30px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* Feature Cards */}
          <div 
            onClick={() => handleNavigation('profile')}
            style={{
              background: 'white',
              padding: '30px',
              borderRadius: '20px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'transform 0.3s ease',
              ':hover': { transform: 'translateY(-5px)' }
            }}
          >
            <div style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
              width: '60px',
              height: '60px',
              borderRadius: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '24px'
            }}>👤</div>
            <h3 style={{fontSize: '20px', fontWeight: '600', marginBottom: '12px'}}>
              Personal Profile
            </h3>
            <p style={{color: '#6b7280', fontSize: '14px'}}>
              Create your skin profile with photos, skin type, age, and concerns for personalized skincare recommendations
            </p>
          </div>

          <div 
            onClick={() => handleNavigation('routine')}
            style={{
              background: 'white',
              padding: '30px',
              borderRadius: '20px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              textAlign: 'center',
              cursor: 'pointer'
            }}
          >
            <div style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              width: '60px',
              height: '60px',
              borderRadius: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '24px'
            }}>📋</div>
            <h3 style={{fontSize: '20px', fontWeight: '600', marginBottom: '12px'}}>
              Routine Builder
            </h3>
            <p style={{color: '#6b7280', fontSize: '14px'}}>
              Build AM/PM skincare routines with step-by-step guides, reminders, and product tracking
            </p>
          </div>

          <div 
            onClick={() => handleNavigation('products')}
            style={{
              background: 'white',
              padding: '30px',
              borderRadius: '20px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              textAlign: 'center',
              cursor: 'pointer'
            }}
          >
            <div style={{
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              width: '60px',
              height: '60px',
              borderRadius: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '24px'
            }}>🛒</div>
            <h3 style={{fontSize: '20px', fontWeight: '600', marginBottom: '12px'}}>
              Product Search
            </h3>
            <p style={{color: '#6b7280', fontSize: '14px'}}>
              Search and discover skincare products with professional reviews and ingredient analysis
            </p>
          </div>

          <div 
            onClick={() => handleNavigation('timeline')}
            style={{
              background: 'white',
              padding: '30px',
              borderRadius: '20px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              textAlign: 'center',
              cursor: 'pointer'
            }}
          >
            <div style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              width: '60px',
              height: '60px',
              borderRadius: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '24px'
            }}>📈</div>
            <h3 style={{fontSize: '20px', fontWeight: '600', marginBottom: '12px'}}>
              Progress Timeline
            </h3>
            <p style={{color: '#6b7280', fontSize: '14px'}}>
              Track your skincare journey with photos, notes, and progress milestones over time
            </p>
          </div>

          <div 
            onClick={() => handleNavigation('tickets')}
            style={{
              background: 'white',
              padding: '30px',
              borderRadius: '20px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              textAlign: 'center',
              cursor: 'pointer'
            }}
          >
            <div style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              width: '60px',
              height: '60px',
              borderRadius: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '24px'
            }}>🩺</div>
            <h3 style={{fontSize: '20px', fontWeight: '600', marginBottom: '12px'}}>
              Professional Help
            </h3>
            <p style={{color: '#6b7280', fontSize: '14px'}}>
              Get consultation tickets for dermatologist advice and professional treatment recommendations
            </p>
          </div>

          <div 
            onClick={() => handleNavigation('feedback')}
            style={{
              background: 'white',
              padding: '30px',
              borderRadius: '20px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              textAlign: 'center',
              cursor: 'pointer'
            }}
          >
            <div style={{
              background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
              width: '60px',
              height: '60px',
              borderRadius: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '24px'
            }}>❤️</div>
            <h3 style={{fontSize: '20px', fontWeight: '600', marginBottom: '12px'}}>
              Favourites & Reviews
            </h3>
            <p style={{color: '#6b7280', fontSize: '14px'}}>
              Save and organize your favorite skincare products with detailed reviews and ratings
            </p>
          </div>
        </div>
      </div>

      {/* Featured Products Section */}
      <div style={{
        padding: '80px 20px',
        background: 'white'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '600',
            marginBottom: '20px',
            color: '#1f2937'
          }}>
            Featured Skincare Products
          </h2>
          <p style={{
            color: '#6b7280',
            fontSize: '18px',
            marginBottom: '50px'
          }}>
            Discover trending products loved by our skincare community
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '30px'
          }}>
            {[
              { name: 'Axis-Y Dark Spot Serum', price: '$25.99', category: 'Serum' },
              { name: 'The Ordinary Niacinamide', price: '$7.90', category: 'Serum' },
              { name: 'CeraVe Hydrating Cleanser', price: '$14.99', category: 'Cleanser' },
              { name: 'La Roche-Posay SPF60', price: '$35.99', category: 'Sunscreen' }
            ].map((product, index) => (
              <div 
                key={index}
                onClick={() => handleNavigation('products')}
                style={{
                  background: 'white',
                  padding: '25px',
                  borderRadius: '15px',
                  textAlign: 'center',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  border: '1px solid #f3f4f6'
                }}
              >
                <div style={{
                  background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                  height: '150px',
                  borderRadius: '12px',
                  marginBottom: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '40px'
                }}>🧴</div>
                
                <div style={{
                  background: '#f3f4f6',
                  padding: '4px 10px',
                  borderRadius: '15px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#6b7280',
                  display: 'inline-block',
                  marginBottom: '10px'
                }}>
                  {product.category}
                </div>

                <h4 style={{fontWeight: '600', marginBottom: '8px', fontSize: '16px'}}>
                  {product.name}
                </h4>
                <p style={{color: '#059669', fontSize: '18px', fontWeight: 'bold'}}>
                  {product.price}
                </p>
              </div>
            ))}
          </div>

          <button 
            onClick={() => handleNavigation('products')}
            style={{
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              color: 'white',
              padding: '16px 32px',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              marginTop: '40px',
              boxShadow: '0 10px 25px rgba(5, 150, 105, 0.3)'
            }}
          >
            View All Products
          </button>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        background: '#1f2937',
        color: 'white',
        padding: '40px 20px',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div>© 2025 SkinBloom • Skincare simplified</div>
            <div style={{
              display: 'flex',
              gap: '20px',
              flexWrap: 'wrap'
            }}>
              <button onClick={() => handleNavigation('products')} style={{background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer'}}>Shop</button>
              <button onClick={() => handleNavigation('profile')} style={{background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer'}}>Profile</button>
              <button onClick={() => handleNavigation('routine')} style={{background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer'}}>Routine</button>
              <a href="mailto:support@skinbloom.app" style={{color: '#9ca3af', textDecoration: 'none'}}>Contact</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
