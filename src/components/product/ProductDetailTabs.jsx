// src/components/product/ProductDetailTabs.jsx
// Componente de pestañas para organizar información detallada del producto
// Incluye: Descripción, Materiales, Reviews, Información del Vendedor

import React, { useState } from 'react';
import ProductRating from './ProductRating';
import ReviewForm from './ReviewForm';

// Nota: Esta línea necesita la importación faltante:
// import ProductCard from './ProductCard';  // Si lo usas en ProductGrid

/**
 * ProductDetailTabs: Sistema de pestañas para detalles del producto
 * 
 * Pestañas disponibles:
 * 1. Descripción - Información detallada del producto
 * 2. Materiales - Información sobre materiales y fabricación
 * 3. Reviews - Calificaciones y comentarios de usuarios
 * 4. Vendedor - Información sobre el artesano
 * 
 * @param {Object} product - Datos del producto
 * @param {Array} materials - Lista de materiales
 * @param {Array} reviews - Reviews del producto
 * @param {Object} reviewStats - Estadísticas de reviews
 * @param {Object} currentUser - Usuario actual (para reviews)
 * @param {Function} onReviewAdded - Callback cuando se agrega review
 */
const ProductDetailTabs = ({ 
  product, 
  materials, 
  reviews, 
  reviewStats, 
  currentUser,
  onReviewAdded 
}) => {

  // useState: Pestaña activa
  const [activeTab, setActiveTab] = useState('description');

  // Configuración de las pestañas
  const tabs = [
    {
      id: 'description',
      label: 'Description',
      icon: '📄'
    },
    {
      id: 'materials',
      label: 'Materials',
      icon: '🔧'
    },
    {
      id: 'reviews',
      label: `Reviews (${reviewStats?.total || 0})`,
      icon: '⭐'
    },
    {
      id: 'seller',
      label: 'Artisan',
      icon: '👤'
    }
  ];

  /**
   * handleTabClick: Cambia la pestaña activa
   */
  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  /**
   * formatDate: Formatea fecha para mostrar en reviews
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  /**
   * renderStars: Renderiza estrellas para calificaciones
   */
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span 
          key={i} 
          className={`star ${i <= rating ? 'filled' : 'empty'}`}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  /**
   * renderTabContent: Renderiza el contenido de la pestaña activa
   */
  const renderTabContent = () => {
    switch (activeTab) {
      case 'description':
        return (
          <div className="tab-content">
            <div className="description-section">
             <strong><h3 className="section-title">Product Description</h3></strong>
              <div className="description-text">
                <p>{product.description}</p>
                
                {/* Descripción extendida */}
                <div className="extended-description">
                <p>
                    This handcrafted piece represents hours of dedicated work and attention to detail.
                    Each item is unique and may have slight variations that add charm and authenticity.
                    Perfect for those who appreciate the beauty of handmade crafts.
                </p>
                
                <strong><h4>Special Features:</h4></strong>
                <ul className="features-list">
                    <li>100% original and unique design</li>
                    <li>Made with traditional techniques</li>
                    <li>Entirely handcrafted production process</li>
                    <li>Durable and long-lasting piece</li>
                    <li>Perfect for daily use or decoration</li>
                </ul>

                <h4>Care and Maintenance:</h4>
                <ul className="care-list">
                    <li>Clean with a soft damp cloth</li>
                    <li>Avoid abrasive chemical products</li>
                    <li>Store in a dry place</li>
                    <li>Handle with care to preserve the craftsmanship</li>
                </ul>
                </div>

              </div>
            </div>
          </div>
        );

      case 'materials':
        return (
          <div className="tab-content">
            <div className="materials-section">
              <h3 className="section-title">Materials and Manufacturing</h3>
              
              <div className="materials-grid">
                <div className="materials-list">
                  <h4>Materials Used:</h4>
                  <ul>
                    {materials.map((material, index) => (
                      <li key={index} className="material-item">
                        <span className="material-bullet">•</span>
                        <span className="material-text">{material}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="process-info">
                  <strong><h4>Manufacturing Process:</h4></strong>
                  <div className="process-steps">
                    <div className="step">
                      {/* <div className="step-number">1</div> */}
                      <div className="step-content">
                       <h5>✅ Material Selection</h5>
                        <p>Careful selection of the highest quality materials</p>
                      </div>
                    </div>
                    
                    <div className="step">
                      <br />
                      {/* <div className="step-number">2</div> */}
                      <div className="step-content">
                        <h5>✅ Design and Planning</h5>
                        <p>Each piece is individually designed by the artisan</p>                      </div>
                    </div>
                    
                    <div className="step">
                       <br />
                      {/* <div className="step-number">3</div> */}
                      <div className="step-content">
                        <h5>✅ Handcrafted</h5>
                        <p>A manual process that can take days or weeks.</p>                      </div>
                    </div>
                    
                    <div className="step">
                       <br />
                      {/* <div className="step-number">4</div> */}
                      <div className="step-content">
                        <h5>✅ Finishing and Control</h5>
                        <p>Final inspection and finishing to ensure quality</p>                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="certifications">
                <h4>Certifications and Standards:</h4>
                <div className="cert-badges">
                  <div className="cert-badge">
                    <span className="cert-icon">🌱</span>
                    <span className="cert-text">Sustainable Materials</span>
                  </div>
                  <div className="cert-badge">
                    <span className="cert-icon">✋</span>
                    <span className="cert-text">Handmade</span>
                  </div>
                  <div className="cert-badge">
                    <span className="cert-icon">🏆</span>
                    <span className="cert-text">High Quality</span>
                  </div>
                  <div className="cert-badge">
                    <span className="cert-icon">♻️</span>
                    <span className="cert-text">Eco-Friendly</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'reviews':
        return (
          <div className="tab-content">
            <div className="reviews-section">
              <h3 className="section-title">Calificaciones y Reviews</h3>
              
              {/* Formulario para nueva review */}
              <div className="add-review-section">
                <ReviewForm
                  productId={product.id}
                  currentUser={currentUser}
                  onReviewSubmitted={onReviewAdded}
                />
              </div>

              {/* Lista de reviews */}
              <div className="reviews-list">
                <h4>All Reviews</h4>
                
                {reviews && reviews.length > 0 ? (
                  reviews.map(review => (
                    <div key={review.id} className="review-item">
                      <div className="review-header">
                        <div className="reviewer-info">
                          <span className="reviewer-name">{review.user_name}</span>
                          {review.verified_purchase && (
                            <span className="verified-purchase">✓ Verified Purchase</span>
                          )}
                        </div>
                        <div className="review-meta">
                          <div className="review-rating">
                            {renderStars(review.rating)}
                          </div>
                          <span className="review-date">{formatDate(review.created_at)}</span>
                        </div>
                      </div>
                      
                      <div className="review-content">
                        <p className="review-comment">{review.comment}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-reviews">
                    <div className="no-reviews-icon">💬</div>
                    <h4>No reviews yet</h4>
                    <p>Be the first to leave a review for this product.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'seller':
        return (
          <div className="tab-content">
            <div className="seller-section">
              <h3 className="section-title">About Artisan</h3>
              
              <div className="seller-profile">
                <div className="seller-avatar-large">
                  {product.artisan?.profile_image_url ? (
                    <img 
                      src={product.artisan.profile_image_url} 
                      alt={product.artisan.full_name} 
                    />
                  ) : (
                    <div className="avatar-placeholder-large">
                      {product.artisan?.full_name?.charAt(0) || '?'}
                    </div>
                  )}
                </div>
                
                <div className="seller-info-detailed">
                  <h4 className="seller-name-large">
                    {product.artisan?.shop_name || product.artisan?.full_name}
                  </h4>
                  
                  {product.artisan?.location && (
                    <p className="seller-location-large">
                      📍 {product.artisan.location}
                    </p>
                  )}
                  
                  {product.artisan?.is_verified && (
                    <div className="verified-badge-large">
                      ✓ Artisan Verified
                    </div>
                  )}
                  
                  {product.artisan?.bio && (
                    <div className="seller-bio">
                      <h5>Sobre mí:</h5>
                      <p>{product.artisan.bio}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="seller-stats">
                <div className="stat-card">
                  <span className="stat-number">15+</span>
                  <span className="stat-label">Products</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number">98%</span>
                  <span className="stat-label">Satisfacción</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number">2 years</span>
                  <span className="stat-label">On the platafform</span>
                </div>
              </div>

              <div className="seller-actions">
                <button className="btn btn-primary">See all their products</button>
                <button className="btn btn-secondary">Contact Artisan</button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="product-detail-tabs">
      
      {/* Navegación de pestañas */}
      <div className="tabs-nav">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Contenido de las pestañas */}
      <div className="tabs-content">
        {renderTabContent()}
      </div>

      {/* Estilos CSS */}
      <style jsx>{`
        .product-detail-tabs {
          margin-top: var(--spacing-3xl);
          background: var(--color-white);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-lg);
          overflow: hidden;
        }

        .tabs-nav {
          display: flex;
          background: var(--color-background);
          border-bottom: 1px solid var(--color-accent-light);
        }

        .tab-button {
          flex: 1;
          padding: var(--spacing-lg) var(--spacing-md);
          background: none;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          border-bottom: 3px solid transparent;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-xs);
        }

        .tab-button:hover {
          background: var(--color-accent-light);
        }

        .tab-button.active {
          background: var(--color-white);
          border-bottom-color: var(--color-primary);
        }

        .tab-icon {
          font-size: var(--text-xl);
        }

        .tab-label {
          font-size: var(--text-sm);
          font-weight: var(--font-medium);
          color: var(--color-dark);
        }

        .tabs-content {
          padding: var(--spacing-2xl);
        }

        .tab-content {
          animation: fadeIn 0.3s ease-in;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .section-title {
          font-size: var(--text-2xl);
          font-weight: var(--font-bold);
          color: var(--color-dark);
          margin: 0 0 var(--spacing-xl) 0;
          border-bottom: 2px solid var(--color-accent-light);
          padding-bottom: var(--spacing-md);
        }

        /* Resto de estilos CSS aquí... */
        .description-text {
          line-height: 1.8;
          color: var(--color-dark);
        }

        .extended-description {
          margin-top: var(--spacing-xl);
        }

        .extended-description h4 {
          font-size: var(--text-lg);
          font-weight: var(--font-semibold);
          color: var(--color-primary);
          margin: var(--spacing-xl) 0 var(--spacing-md) 0;
        }

        .features-list,
        .care-list {
          list-style: none;
          padding: 0;
          margin: 0 0 var(--spacing-lg) 0;
        }

        .features-list li,
        .care-list li {
          padding: var(--spacing-sm) 0;
          position: relative;
          padding-left: var(--spacing-lg);
        }

        .features-list li::before {
          content: '✓';
          position: absolute;
          left: 0;
          color: var(--color-success);
          font-weight: bold;
        }

        .care-list li::before {
          content: '•';
          position: absolute;
          left: 0;
          color: var(--color-primary);
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default ProductDetailTabs;