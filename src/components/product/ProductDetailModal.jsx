// src/components/product/ProductDetailModal.jsx
// Modal para mostrar detalles completos del producto y sistema de reviews

import React, { useState, useEffect } from 'react';

/**
 * ProductDetailModal: Modal que muestra información detallada del producto
 * 
 * Funcionalidades:
 * - Mostrar descripción ampliada del producto
 * - Mostrar materiales y especificaciones
 * - Formulario para agregar review con rating 1-5
 * - Mostrar reviews existentes de otros usuarios
 * - Manejo de estado para el formulario de review
 * 
 * @param {boolean} isOpen - Si el modal está visible
 * @param {function} onClose - Función para cerrar el modal
 * @param {Object} product - Producto a mostrar detalles
 * @param {Object} currentUser - Usuario actual (para reviews)
 */
const ProductDetailModal = ({ 
  isOpen, 
  onClose, 
  product,
  currentUser 
}) => {

  // Estados para el formulario de review
  const [reviewData, setReviewData] = useState({
    rating: 5,          // Rating del 1 al 5
    comment: ''         // Comentario del usuario
  });

  // Estados para manejo de la interfaz
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState({ type: '', text: '' });
  const [reviews, setReviews] = useState([]); // Reviews existentes
  const [loadingReviews, setLoadingReviews] = useState(false);

  /**
   * useEffect: Cargar reviews cuando se abre el modal
   * Se ejecuta cada vez que cambia el producto o se abre el modal
   */
  useEffect(() => {
    if (isOpen && product) {
      loadProductReviews();
      // Limpiar formulario al abrir modal
      setReviewData({ rating: 5, comment: '' });
      setReviewMessage({ type: '', text: '' });
    }
  }, [isOpen, product]);

  /**
   * loadProductReviews: Carga las reviews existentes del producto
   * En una implementación real, esto haría una consulta a la base de datos
   */
  const loadProductReviews = async () => {
    setLoadingReviews(true);
    try {
      // TODO: Aquí iría la llamada real a la API/Supabase
      // const { data } = await supabase.from('reviews').select('*').eq('product_id', product.id)
      
      // Por ahora, usamos datos simulados
      const mockReviews = [
        {
          id: 1,
          user_name: 'Sarah M.',
          rating: 5,
          comment: 'Beautiful craftsmanship! The quality exceeded my expectations.',
          created_at: '2024-02-10T10:00:00Z'
        },
        {
          id: 2,
          user_name: 'Mike R.',
          rating: 4,
          comment: 'Great product, fast shipping. Very satisfied with my purchase.',
          created_at: '2024-02-08T15:30:00Z'
        },
        {
          id: 3,
          user_name: 'Emma L.',
          rating: 5,
          comment: 'Absolutely love it! The attention to detail is remarkable.',
          created_at: '2024-02-05T09:45:00Z'
        }
      ];
      
      setReviews(mockReviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  /**
   * handleRatingChange: Maneja cambios en el rating seleccionado
   * Actualiza el estado del rating cuando el usuario selecciona estrellas
   * 
   * @param {number} newRating - Nuevo rating seleccionado (1-5)
   */
  const handleRatingChange = (newRating) => {
    setReviewData(prev => ({
      ...prev,
      rating: newRating
    }));
  };

  /**
   * handleCommentChange: Maneja cambios en el comentario
   * Actualiza el estado del comentario cuando el usuario escribe
   * 
   * @param {Event} e - Evento del textarea
   */
  const handleCommentChange = (e) => {
    setReviewData(prev => ({
      ...prev,
      comment: e.target.value
    }));
  };

  /**
   * handleSubmitReview: Envía la review del usuario
   * Valida los datos y envía la review a la base de datos
   * 
   * @param {Event} e - Evento del formulario
   */
  const handleSubmitReview = async (e) => {
    e.preventDefault();

    // Validación: usuario debe estar logueado
    if (!currentUser) {
      setReviewMessage({
        type: 'error',
        text: 'Please log in to leave a review.'
      });
      return;
    }

    // Validación: comentario no puede estar vacío
    if (!reviewData.comment.trim()) {
      setReviewMessage({
        type: 'error',
        text: 'Please write a comment for your review.'
      });
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewMessage({ type: '', text: '' });

      // TODO: Aquí iría la llamada real para guardar la review
      /*
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          product_id: product.id,
          user_id: currentUser.id,
          user_name: getUserDisplayName(),
          rating: reviewData.rating,
          comment: reviewData.comment.trim(),
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      */

      // Simulación de envío exitoso
      await new Promise(resolve => setTimeout(resolve, 1000));

      setReviewMessage({
        type: 'success',
        text: 'Thank you for your review! It has been submitted successfully.'
      });

      // Limpiar formulario
      setReviewData({ rating: 5, comment: '' });

      // Recargar reviews
      setTimeout(() => {
        loadProductReviews();
      }, 1500);

    } catch (error) {
      console.error('Error submitting review:', error);
      setReviewMessage({
        type: 'error',
        text: 'Failed to submit review. Please try again.'
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  /**
   * renderStarRating: Renderiza estrellas interactivas para rating
   * Crea estrellas clickeables para seleccionar rating
   * 
   * @param {number} currentRating - Rating actual seleccionado
   * @param {function} onRatingChange - Función para cambiar rating
   * @param {boolean} interactive - Si las estrellas son clickeables
   * @returns {JSX} - Elementos de estrellas
   */
  const renderStarRating = (currentRating, onRatingChange = null, interactive = false) => {
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= currentRating;
      
      stars.push(
        <span
          key={i}
          className={`star ${isFilled ? 'filled' : 'empty'} ${interactive ? 'interactive' : ''}`}
          onClick={interactive ? () => onRatingChange(i) : undefined}
          title={interactive ? `Rate ${i} star${i > 1 ? 's' : ''}` : ''}
        >
          ★
        </span>
      );
    }
    
    return <div className="star-rating">{stars}</div>;
  };

  /**
   * formatDate: Formatea fecha para mostrar en reviews
   * Convierte fecha ISO a formato legible
   * 
   * @param {string} dateString - Fecha en formato ISO
   * @returns {string} - Fecha formateada
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  /**
   * getUserDisplayName: Obtiene nombre para mostrar del usuario actual
   * Retorna el nombre o email del usuario logueado
   * 
   * @returns {string} - Nombre a mostrar
   */
  const getUserDisplayName = () => {
    if (!currentUser) return 'Anonymous';
    return currentUser.firstName || currentUser.email?.split('@')[0] || 'User';
  };

  /**
   * generateMaterialsInfo: Genera información de materiales basada en la categoría
   * Crea descripción de materiales según el tipo de producto
   * 
   * @param {string} category - Categoría del producto
   * @returns {Array} - Lista de materiales
   */
  const generateMaterialsInfo = (category) => {
    const materialsByCategory = {
      'Pottery & Ceramics': [
        'Natural clay sourced from local quarries',
        'Lead-free glazes with food-safe certification',
        'Fired at 1200°C for durability',
        'Hand-finished with organic wax coating'
      ],
      'Jewelry & Accessories': [
        'Sterling silver (925) with anti-tarnish treatment',
        'Natural gemstones ethically sourced',
        'Hypoallergenic materials suitable for sensitive skin',
        'Handcrafted findings and clasps'
      ],
      'Textiles & Clothing': [
        'Organic cotton or merino wool',
        'Natural dyes from plant-based sources',
        'Hand-spun fibers for unique texture',
        'Pre-shrunk and colorfast treatment'
      ],
      'Art & Paintings': [
        'Professional grade acrylic or oil paints',
        'Stretched canvas on wooden frame',
        'Archival quality materials for longevity',
        'UV-resistant varnish protection'
      ],
      'Woodwork': [
        'Sustainably harvested hardwood',
        'Food-safe mineral oil finish',
        'Hand-sanded to 400-grit smoothness',
        'Traditional joinery techniques'
      ]
    };

    return materialsByCategory[category] || [
      'High-quality, ethically sourced materials',
      'Handcrafted with traditional techniques',
      'Durable construction for long-lasting use',
      'Eco-friendly and sustainable practices'
    ];
  };

  /**
   * handleOverlayClick: Cierra modal al hacer clic fuera
   * Solo cierra si se hace clic en el overlay, no en el contenido
   * 
   * @param {Event} e - Evento de click
   */
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Si el modal no está abierto o no hay producto, no renderizar
  if (!isOpen || !product) return null;

  const materials = generateMaterialsInfo(product.category);
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : product.rating;

  return (
    <div 
      className="modal-overlay"
      onClick={handleOverlayClick}
    >
      <div className="modal-container">
        {/* Botón de cerrar */}
        <button 
          onClick={onClose}
          className="close-button"
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Contenido del modal */}
        <div className="modal-content">
          
          {/* Sección principal del producto */}
          <div className="product-main">
            
            {/* Imagen del producto */}
            <div className="product-image-section">
              <img 
                src={product.image_url} 
                alt={product.title}
                className="product-image"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTQwQzE4NS42IDE0MCAyMDAgMTU0LjQgMjAwIDE2OEMyMDAgMTgxLjYgMjE0LjQgMTk2IDIyOCAxOTZDMjQxLjYgMTk2IDI1NiAxODEuNiAyNTYgMTY4QzI1NiAxNTQuNCAyNDEuNiAxNDAgMjI4IDE0MEMyMTQuNCAxNDAgMjAwIDE1NC40IDIwMCAxNDBaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0yODAgMjQwSDE0MEwxNjAgMjAwTDI2MCAyMDBMMjgwIDI0MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+Cg==';
                }}
              />
            </div>

            {/* Información del producto */}
            <div className="product-info-section">
              <h1 className="product-title">{product.title}</h1>
              <p className="product-category">{product.category}</p>
              
              {/* Rating del producto */}
              <div className="product-rating">
                {renderStarRating(parseFloat(averageRating))}
                <span className="rating-text">
                  {averageRating} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                </span>
              </div>

              {/* Precio */}
              <div className="product-price">
                <span className="price">${product.price.toFixed(2)}</span>
                <span className="stock-info">
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>

              {/* Descripción ampliada */}
              <div className="product-description">
                <h3>Description</h3>
                <p>{product.description}</p>
                <p>
                  This handcrafted piece represents hours of skilled artisanship and attention to detail. 
                  Each item is unique and may have slight variations that add to its charm and authenticity. 
                  Perfect for those who appreciate the beauty of handmade crafts.
                </p>
              </div>

              {/* Información de materiales */}
              <div className="materials-section">
                <h3>Materials & Construction</h3>
                <ul className="materials-list">
                  {materials.map((material, index) => (
                    <li key={index}>{material}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Sección de Reviews */}
          <div className="reviews-section">
            
            {/* Formulario para nueva review */}
            <div className="review-form-section">
              <h2>Share Your Opinion</h2>
              
              {/* Mensaje de éxito/error */}
              {reviewMessage.text && (
                <div className={`review-message ${reviewMessage.type}`}>
                  <span className="message-icon">
                    {reviewMessage.type === 'success' ? '✅' : '⚠️'}
                  </span>
                  <span className="message-text">{reviewMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleSubmitReview} className="review-form">
                
                {/* Selector de rating */}
                <div className="rating-section">
                  <label className="form-label">Your Rating:</label>
                  {renderStarRating(reviewData.rating, handleRatingChange, true)}
                  <span className="rating-label">
                    {reviewData.rating} out of 5 stars
                  </span>
                </div>

                {/* Textarea para comentario */}
                <div className="comment-section">
                  <label htmlFor="review-comment" className="form-label">
                    Your Comment:
                  </label>
                  <textarea
                    id="review-comment"
                    value={reviewData.comment}
                    onChange={handleCommentChange}
                    className="comment-textarea"
                    placeholder="Share your experience with this product..."
                    rows="4"
                    maxLength="500"
                    disabled={submittingReview}
                  />
                  <div className="char-count">
                    {reviewData.comment.length}/500 characters
                  </div>
                </div>

                {/* Botón de envío */}
                <button
                  type="submit"
                  className="submit-review-btn"
                  disabled={submittingReview || !reviewData.comment.trim()}
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>

            {/* Lista de reviews existentes */}
            <div className="existing-reviews">
              <h3>Customer Reviews</h3>
              
              {loadingReviews ? (
                <div className="loading-reviews">Loading reviews...</div>
              ) : reviews.length > 0 ? (
                <div className="reviews-list">
                  {reviews.map(review => (
                    <div key={review.id} className="review-item">
                      <div className="review-header">
                        <span className="reviewer-name">{review.user_name}</span>
                        <div className="review-rating">
                          {renderStarRating(review.rating)}
                        </div>
                        <span className="review-date">{formatDate(review.created_at)}</span>
                      </div>
                      <p className="review-comment">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-reviews">No reviews yet. Be the first to review this product!</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Estilos CSS */}
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: var(--spacing-lg);
          backdrop-filter: blur(4px);
        }

        .modal-container {
          position: relative;
          width: 100%;
          max-width: 1000px;
          max-height: 90vh;
          overflow-y: auto;
          background: var(--color-white);
          border-radius: var(--radius-xl);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          animation: modalEnter 0.3s ease-out;
        }

        @keyframes modalEnter {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .close-button {
          position: absolute;
          top: var(--spacing-lg);
          right: var(--spacing-lg);
          width: 40px;
          height: 40px;
          border: none;
          background: var(--color-accent-light);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          color: var(--color-muted);
          font-size: var(--text-xl);
          z-index: 10;
        }

        .close-button:hover {
          background: var(--color-error);
          color: var(--color-white);
          transform: scale(1.1);
        }

        .modal-content {
          padding: var(--spacing-2xl);
        }

        .product-main {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-2xl);
          margin-bottom: var(--spacing-2xl);
          padding-bottom: var(--spacing-2xl);
          border-bottom: 1px solid var(--color-accent-light);
        }

        .product-image-section {
          display: flex;
          justify-content: center;
          align-items: flex-start;
        }

        .product-image {
          width: 100%;
          max-width: 400px;
          height: auto;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md);
        }

        .product-info-section {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }

        .product-title {
          font-family: var(--font-heading);
          font-size: var(--text-3xl);
          font-weight: var(--font-bold);
          color: var(--color-primary);
          margin: 0;
        }

        .product-category {
          font-size: var(--text-base);
          color: var(--color-secondary);
          font-weight: var(--font-medium);
          margin: 0;
        }

        .product-rating {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .rating-text {
          font-size: var(--text-sm);
          color: var(--color-muted);
        }

        .product-price {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }

        .price {
          font-size: var(--text-3xl);
          font-weight: var(--font-bold);
          color: var(--color-primary);
        }

        .stock-info {
          font-size: var(--text-sm);
          color: var(--color-muted);
        }

        .product-description h3,
        .materials-section h3 {
          font-size: var(--text-lg);
          font-weight: var(--font-semibold);
          color: var(--color-dark);
          margin: 0 0 var(--spacing-sm) 0;
        }

        .product-description p {
          line-height: 1.6;
          color: var(--color-dark);
          margin: 0 0 var(--spacing-sm) 0;
        }

        .materials-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .materials-list li {
          padding: var(--spacing-xs) 0;
          color: var(--color-dark);
          position: relative;
          padding-left: var(--spacing-lg);
        }

        .materials-list li::before {
          content: '•';
          color: var(--color-primary);
          font-weight: bold;
          position: absolute;
          left: 0;
        }

        .reviews-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-2xl);
        }

        .review-form-section h2 {
          font-size: var(--text-2xl);
          font-weight: var(--font-semibold);
          color: var(--color-primary);
          margin: 0 0 var(--spacing-lg) 0;
        }

        .review-message {
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-md);
        }

        .review-message.success {
          background: rgba(34, 197, 94, 0.1);
          color: var(--color-success);
          border: 1px solid var(--color-success);
        }

        .review-message.error {
          background: rgba(239, 68, 68, 0.1);
          color: var(--color-error);
          border: 1px solid var(--color-error);
        }

        .review-form {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }

        .rating-section {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .form-label {
          font-weight: var(--font-medium);
          color: var(--color-dark);
        }

        .star-rating {
          display: flex;
          gap: var(--spacing-xs);
        }

        .star {
          font-size: 1.5rem;
          color: var(--color-accent);
          transition: color 0.2s ease;
        }

        .star.filled {
          color: var(--color-warning);
        }

        .star.interactive {
          cursor: pointer;
        }

        .star.interactive:hover {
          color: var(--color-warning);
          transform: scale(1.1);
        }

        .rating-label {
          font-size: var(--text-sm);
          color: var(--color-muted);
        }

        .comment-section {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .comment-textarea {
          padding: var(--spacing-md);
          border: 2px solid var(--color-accent);
          border-radius: var(--radius-md);
          font-family: var(--font-body);
          font-size: var(--text-base);
          resize: vertical;
          transition: border-color 0.3s ease;
        }

        .comment-textarea:focus {
          outline: none;
          border-color: var(--color-primary);
        }

        .char-count {
          font-size: var(--text-xs);
          color: var(--color-muted);
          text-align: right;
        }

        .submit-review-btn {
          padding: var(--spacing-md) var(--spacing-xl);
          background: var(--color-primary);
          color: var(--color-white);
          border: none;
          border-radius: var(--radius-md);
          font-weight: var(--font-semibold);
          cursor: pointer;
          transition: background 0.3s ease;
        }

        .submit-review-btn:hover:not(:disabled) {
          background: var(--color-secondary);
        }

        .submit-review-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .existing-reviews h3 {
          font-size: var(--text-xl);
          font-weight: var(--font-semibold);
          color: var(--color-dark);
          margin: 0 0 var(--spacing-lg) 0;
        }

        .reviews-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }

        .review-item {
          padding: var(--spacing-lg);
          background: var(--color-background);
          border-radius: var(--radius-md);
        }

        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-sm);
        }

        .reviewer-name {
          font-weight: var(--font-semibold);
          color: var(--color-dark);
        }

        .review-date {
          font-size: var(--text-xs);
          color: var(--color-muted);
        }

        .review-comment {
          line-height: 1.6;
          color: var(--color-dark);
          margin: 0;
        }

        .loading-reviews,
        .no-reviews {
          padding: var(--spacing-xl);
          text-align: center;
          color: var(--color-muted);
          font-style: italic;
        }

        @media (max-width: 768px) {
          .modal-container {
            max-width: 95%;
            max-height: 95vh;
          }

          .modal-content {
            padding: var(--spacing-lg);
          }

          .product-main {
            grid-template-columns: 1fr;
            gap: var(--spacing-lg);
          }

          .reviews-section {
            grid-template-columns: 1fr;
          }

          .review-header {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--spacing-xs);
          }
        }
      `}</style>
    </div>
  );
};

export default ProductDetailModal;