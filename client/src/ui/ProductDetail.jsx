import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../auth';

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    loadProduct();
    if (user) {
      loadWishlistStatus();
      loadUserRating();
    }
    loadCart();
  }, [id, user]);

  const loadProduct = async () => {
    try {
      const response = await API.get(`/products/${id}`);
      setProduct(response.data);
      setSelectedImage(0);
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWishlistStatus = async () => {
    try {
      const response = await API.get('/wishlist');
      const wishlistItems = response.data.wishlist?.products || [];
      const inWishlist = wishlistItems.some(item => item.productId === id);
      setIsInWishlist(inWishlist);
    } catch (error) {
      console.error('Error checking wishlist:', error);
    }
  };

  const loadUserRating = async () => {
    try {
      // This would need a new API endpoint to get user's rating for this product
      // For now, we'll use a placeholder
      setUserRating(0);
    } catch (error) {
      console.error('Error loading user rating:', error);
    }
  };

  const loadCart = () => {
    const stored = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(stored);
  };

  const toggleWishlist = async () => {
    if (!user) {
      alert('Please login to add products to wishlist');
      return;
    }

    try {
      if (isInWishlist) {
        await API.delete('/wishlist/remove', {
          data: { productId: id, isExternal: false }
        });
        setIsInWishlist(false);
      } else {
        await API.post('/wishlist/add', {
          productId: id,
          isExternal: false,
          productData: {
            name: product.name,
            brand: product.brand,
            price: product.price,
            image_link: product.image,
            category: product.category,
            rating: product.rating,
            description: product.description
          }
        });
        setIsInWishlist(true);
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      alert('Failed to update wishlist');
    }
  };

  const addToCart = () => {
    const cartItem = {
      id: product._id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      image: product.image,
      quantity: quantity,
      addedAt: new Date().toISOString()
    };

    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItemIndex = existingCart.findIndex(item => item.id === product._id);

    if (existingItemIndex > -1) {
      existingCart[existingItemIndex].quantity += quantity;
    } else {
      existingCart.push(cartItem);
    }

    localStorage.setItem('cart', JSON.stringify(existingCart));
    setCart(existingCart);
    alert(`${product.name} added to cart!`);
  };

  const submitRating = async (newRating) => {
    if (!user) {
      alert('Please login to rate products');
      return;
    }

    try {
      // This would need a new API endpoint for product ratings
      // For now, we'll update the local state
      setUserRating(newRating);
      setRating(newRating);
      alert('Thank you for your rating!');
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating');
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '60px 20px' 
      }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>❌</div>
        <h2>Product Not Found</h2>
        <p>The product you're looking for doesn't exist.</p>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [product.image];
  const discountPercentage = product.originalPrice && product.originalPrice > product.price 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '40px',
        marginBottom: '40px'
      }}>
        {/* Product Images */}
        <div>
          {/* Main Image */}
          <div style={{
            width: '100%',
            height: '500px',
            marginBottom: '16px',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            overflow: 'hidden',
            background: '#f9fafb'
          }}>
            <img
              src={images[selectedImage]}
              alt={product.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDUwMCA1MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MDAiIGhlaWdodD0iNTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNTAgMTUwQzIxNC4xMDEgMTUwIDE4NS4wMDEgMTc5LjEgMTg1LjAwMSAyMTVWMjg1QzE4NS4wMDEgMzIwLjkgMjE0LjEwMSAzNTAgMjUwIDM1MEMyODUuOSAzNTAgMzE1IDMyMC45IDMxNSAyODVWMjE1QzMxNSAxNzkuMSAyODUuOSAxNTAgMjUwIDE1MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
              }}
            />
          </div>

          {/* Thumbnail Images */}
          {images.length > 1 && (
            <div style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto'
            }}>
              {images.map((img, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  style={{
                    width: '80px',
                    height: '80px',
                    border: selectedImage === index ? '2px solid var(--primary-color)' : '1px solid #e5e7eb',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          {/* Brand & Name */}
          <div style={{ marginBottom: '16px' }}>
            <p style={{
              color: 'var(--muted)',
              fontSize: '16px',
              marginBottom: '8px',
              textTransform: 'capitalize'
            }}>
              {product.brand}
            </p>
            <h1 style={{
              color: 'var(--text-color)',
              fontSize: '28px',
              fontWeight: '700',
              lineHeight: '1.3',
              margin: 0
            }}>
              {product.name}
            </h1>
          </div>

          {/* Rating */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <span
                  key={star}
                  style={{
                    color: star <= (product.rating || 0) ? '#fbbf24' : '#e5e7eb',
                    fontSize: '20px',
                    cursor: user ? 'pointer' : 'default'
                  }}
                  onClick={() => user && submitRating(star)}
                >
                  ★
                </span>
              ))}
            </div>
            <span style={{ color: 'var(--text-color)', fontWeight: '600' }}>
              {product.rating || 0}
            </span>
            <span style={{ color: 'var(--muted)', fontSize: '14px' }}>
              ({product.reviewCount || 0} reviews)
            </span>
          </div>

          {/* Size */}
          {product.size && (
            <div style={{ marginBottom: '16px' }}>
              <span style={{
                background: '#f0f9ff',
                color: '#0369a1',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                Size: {product.size}
              </span>
            </div>
          )}

          {/* Price */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <span style={{
              color: 'var(--primary-color)',
              fontSize: '32px',
              fontWeight: '700'
            }}>
              ৳{product.price?.toLocaleString('bn-BD')}
            </span>
            
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <span style={{
                  color: 'var(--muted)',
                  fontSize: '20px',
                  textDecoration: 'line-through'
                }}>
                  ৳{product.originalPrice?.toLocaleString('bn-BD')}
                </span>
                <span style={{
                  background: '#dc2626',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  {discountPercentage}% OFF
                </span>
              </>
            )}
          </div>

          {/* Brief Description */}
          {product.briefDescription && (
            <p style={{
              color: 'var(--text-color)',
              fontSize: '16px',
              lineHeight: '1.6',
              marginBottom: '24px'
            }}>
              {product.briefDescription}
            </p>
          )}

          {/* Quantity & Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '32px'
          }}>
            {/* Quantity Selector */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid var(--border-color)',
              borderRadius: '8px'
            }}>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{
                  padding: '8px 12px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: '18px'
                }}
              >
                -
              </button>
              <span style={{
                padding: '8px 16px',
                borderLeft: '1px solid var(--border-color)',
                borderRight: '1px solid var(--border-color)',
                minWidth: '60px',
                textAlign: 'center'
              }}>
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                style={{
                  padding: '8px 12px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: '18px'
                }}
              >
                +
              </button>
            </div>

            {/* Add to Cart */}
            <button
              onClick={addToCart}
              style={{
                flex: 1,
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
              ADD TO CART
            </button>

            {/* Wishlist Button */}
            <button
              onClick={toggleWishlist}
              style={{
                padding: '12px',
                background: isInWishlist ? '#dc2626' : 'transparent',
                color: isInWishlist ? 'white' : 'var(--text-color)',
                border: '2px solid ' + (isInWishlist ? '#dc2626' : 'var(--border-color)'),
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '20px'
              }}
              title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              {isInWishlist ? '❤️' : '🤍'}
            </button>
          </div>

          {/* Product Details */}
          <div style={{
            background: 'var(--card-background)',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)'
          }}>
            {/* Category */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '12px'
            }}>
              <span style={{ color: 'var(--muted)' }}>Category:</span>
              <span style={{ fontWeight: '600' }}>{product.category}</span>
            </div>

            {/* Stock Status */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '12px'
            }}>
              <span style={{ color: 'var(--muted)' }}>Stock:</span>
              <span style={{
                color: product.stockQuantity > 0 ? '#16a34a' : '#dc2626',
                fontWeight: '600'
              }}>
                {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
              </span>
            </div>

            {/* Skin Type */}
            {product.skinType && product.skinType.length > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <span style={{ color: 'var(--muted)' }}>Skin Type:</span>
                <span style={{ fontWeight: '600' }}>{product.skinType.join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        overflow: 'hidden'
      }}>
        {/* Tab Headers */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-color)'
        }}>
          {['Description', 'Ingredients', 'How to Use', 'Benefits'].map(tab => (
            <button
              key={tab}
              style={{
                flex: 1,
                padding: '16px',
                background: 'none',
                border: 'none',
                borderBottom: '3px solid var(--primary-color)',
                cursor: 'pointer',
                fontWeight: '600',
                color: 'var(--text-color)'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ padding: '24px' }}>
          {/* Description */}
          <div>
            <h3 style={{ marginBottom: '16px', color: 'var(--text-color)' }}>Description</h3>
            <p style={{
              color: 'var(--text-color)',
              lineHeight: '1.6',
              marginBottom: '24px'
            }}>
              {product.description}
            </p>
          </div>

          {/* Ingredients */}
          {product.ingredients && product.ingredients.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '16px', color: 'var(--text-color)' }}>Ingredients</h3>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                {product.ingredients.map((ingredient, index) => (
                  <span
                    key={index}
                    style={{
                      background: '#f0fdf4',
                      color: '#166534',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* How to Use */}
          {product.howToUse && product.howToUse.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '16px', color: 'var(--text-color)' }}>How to Use</h3>
              <ul style={{
                color: 'var(--text-color)',
                lineHeight: '1.6',
                paddingLeft: '20px'
              }}>
                {product.howToUse.map((step, index) => (
                  <li key={index} style={{ marginBottom: '8px' }}>{step}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Key Benefits */}
          {product.keyBenefits && product.keyBenefits.length > 0 && (
            <div>
              <h3 style={{ marginBottom: '16px', color: 'var(--text-color)' }}>Key Benefits</h3>
              <ul style={{
                color: 'var(--text-color)',
                lineHeight: '1.6',
                paddingLeft: '20px'
              }}>
                {product.keyBenefits.map((benefit, index) => (
                  <li key={index} style={{ marginBottom: '8px' }}>{benefit}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
