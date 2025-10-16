// Formulario para que los usuarios agreguen calificaciones y comentarios

import React, { useState } from 'react';

/**
 * ReviewForm: Formulario interactivo para agregar reviews
 * 
 * Funcionalidades:
 * - Selector de estrellas (1-5) interactivo
 * - Textarea para comentarios con validación
 * - Validación de usuario logueado
 * - Estados de carga y mensajes de éxito/error
 * - Limpieza automática del formulario tras envío exitoso
 * 
 * @param {string} productId - ID del producto a calificar
 * @param {Object} currentUser - Usuario actual (null si no está logueado)
 * @param {Function} onReviewSubmitted - Callback ejecutado tras envío exitoso
 */
const ReviewForm = ({ 
  productId, 
  currentUser, 
  onReviewSubmitted 
}) => {

  // Estados para los datos del formulario
  const [reviewData, setReviewData] = useState({
    rating: 5,        // Rating inicial de 5 estrellas
    comment: ''       // Comentario vacío
  });

  // Estados para el manejo de la interfaz
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  /**
   * handleRatingChange: Actualiza el rating cuando el usuario selecciona estrellas
   * @param {number} newRating - Nuevo rating seleccionado (1-5)
   */
  const handleRatingChange = (newRating) => {
    setReviewData(prev => ({
      ...prev,
      rating: newRating
    }));
    // Limpiar mensajes cuando el usuario cambia el rating
    setMessage({ type: '', text: '' });
  };

  /**
   * handleCommentChange: Actualiza el comentario cuando el usuario escribe
   * @param {Event} e - Evento del textarea
   */
  const handleCommentChange = (e) => {
    setReviewData(prev => ({
      ...prev,
      comment: e.target.value
    }));
    // Limpiar mensajes cuando el usuario escribe
    setMessage({ type: '', text: '' });
  };

  /**
   * validateForm: Valida los datos del formulario antes de enviar
   * @returns {Object} - Objeto con isValid y message
   */
  const validateForm = () => {
    // Verificar que el usuario esté logueado
    if (!currentUser) {
      return {
        isValid: false,
        message: 'Debes iniciar sesión para dejar una reseña.'
      };
    }

    // Verificar que el rating esté en rango válido
    if (reviewData.rating < 1 || reviewData.rating > 5) {
      return {
        isValid: false,
        message: 'Por favor selecciona una calificación entre 1 y 5 estrellas.'
      };
    }

    // Verificar que el comentario no esté vacío
    if (!reviewData.comment.trim()) {
      return {
        isValid: false,
        message: 'Por favor escribe un comentario sobre el producto.'
      };
    }

    // Verificar longitud mínima del comentario
    if (reviewData.comment.trim().length < 10) {
      return {
        isValid: false,
        message: 'El comentario debe tener al menos 10 caracteres.'
      };
    }

    return { isValid: true, message: '' };
  };

  /**
   * submitReviewToAPI: Simula el envío de la review a la API/base de datos
   * En una implementación real, aquí se haría la llamada a Supabase
   * @param {Object} reviewData - Datos de la review a enviar
   * @returns {Promise} - Promise que resuelve o rechaza
   */
  const submitReviewToAPI = async (reviewData) => {
    // Simulación de llamada a API
    console.log('Enviando review a la API:', {
      product_id: productId,
      user_id: currentUser.id,
      user_name: getUserDisplayName(),
      rating: reviewData.rating,
      comment: reviewData.comment.trim(),
      created_at: new Date().toISOString(),
      verified_purchase: false // TODO: Verificar si es compra real
    });

    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simular éxito/error aleatoriamente para testing
    if (Math.random() > 0.1) { // 90% de éxito
      return { success: true, data: { id: Date.now() } };
    } else {
      throw new Error('Error del servidor. Inténtalo de nuevo.');
    }

    /* 
    TODO: Implementación real con Supabase:
    
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        product_id: productId,
        user_id: currentUser.id,
        user_name: getUserDisplayName(),
        rating: reviewData.rating,
        comment: reviewData.comment.trim(),
        created_at: new Date().toISOString(),
        verified_purchase: await checkIfVerifiedPurchase(currentUser.id, productId)
      });

    if (error) throw error;
    return { success: true, data };
    */
  };

  /**
   * handleSubmit: Maneja el envío del formulario
   * @param {Event} e - Evento del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar formulario antes de enviar
    const validation = validateForm();
    if (!validation.isValid) {
      setMessage({
        type: 'error',
        text: validation.message
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage({ type: '', text: '' });

      // Enviar review a la API
      await submitReviewToAPI(reviewData);

      // Mostrar mensaje de éxito
      setMessage({
        type: 'success',
        text: '¡Gracias por tu reseña! Se ha enviado correctamente.'
      });

      // Limpiar formulario
      setReviewData({ rating: 5, comment: '' });

      // Llamar callback para actualizar la lista de reviews
      if (onReviewSubmitted) {
        setTimeout(() => {
          onReviewSubmitted();
        }, 1000);
      }

    } catch (error) {
      console.error('Error al enviar review:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Error al enviar la reseña. Por favor intenta de nuevo.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * getUserDisplayName: Obtiene el nombre a mostrar del usuario actual
   * @returns {string} - Nombre para mostrar en la review
   */
  const getUserDisplayName = () => {
    if (!currentUser) return 'Usuario Anónimo';
    
    // Priorizar nombre completo, luego nombre de usuario, luego email
    return currentUser.full_name || 
           currentUser.firstName || 
           currentUser.username ||
           currentUser.email?.split('@')[0] || 
           'Usuario';
  };

  /**
   * renderStarSelector: Renderiza el selector interactivo de estrellas
   * @returns {JSX} - Elementos de estrellas clickeables
   */
  const renderStarSelector = () => {
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      const isSelected = i <= reviewData.rating;
      
      stars.push(
        <button
          key={i}
          type="button"
          className={`star-button ${isSelected ? 'selected' : 'unselected'}`}
          onClick={() => handleRatingChange(i)}
          onMouseEnter={() => {
            // Efecto hover - resaltar estrellas hasta la posición del mouse
            const allStars = document.querySelectorAll('.star-button');
            allStars.forEach((star, index) => {
              if (index < i) {
                star.classList.add('hover');
              } else {
                star.classList.remove('hover');
              }
            });
          }}
          onMouseLeave={() => {
            // Remover efecto hover
            const allStars = document.querySelectorAll('.star-button');
            allStars.forEach(star => star.classList.remove('hover'));
          }}
          title={`Calificar con ${i} estrella${i > 1 ? 's' : ''}`}
          aria-label={`Calificar con ${i} estrella${i > 1 ? 's' : ''}`}
          disabled={isSubmitting}
        >
          ★
        </button>
      );
    }
    
    return (
      <div className="star-selector">
        {stars}
      </div>
    );
  };

  return (
    <div className="review-form-container">
      <h3 className="form-title">Agregar tu Reseña</h3>
      
      {/* Mensaje de estado (éxito/error) */}
      {message.text && (
        <div className={`form-message ${message.type}`}>
          <span className="message-icon">
            {message.type === 'success' ? '✅' : '⚠️'}
          </span>
          <span className="message-text">{message.text}</span>
        </div>
      )}

      {/* Formulario de review */}
      <form onSubmit={handleSubmit} className="review-form">
        
        {/* Sección de calificación con estrellas */}
        <div className="rating-section">
          <label className="form-label">
            Tu Calificación:
          </label>
          {renderStarSelector()}
          <span className="rating-text">
            {reviewData.rating} de 5 estrellas
          </span>
        </div>

        {/* Sección de comentario */}
        <div className="comment-section">
          <label htmlFor="review-comment" className="form-label">
            Tu Comentario:
          </label>
          <textarea
            id="review-comment"
            value={reviewData.comment}
            onChange={handleCommentChange}
            className="comment-textarea"
            placeholder="Comparte tu experiencia con este producto... ¿Qué te gustó? ¿Cómo es la calidad? ¿Lo recomendarías?"
            rows="5"
            maxLength="500"
            disabled={isSubmitting}
            required
          />
          <div className="char-count">
            {reviewData.comment.length}/500 caracteres
          </div>
        </div>

        {/* Información del usuario */}
        <div className="user-info">
          <span className="user-label">Publicando como:</span>
          <span className="user-name">
            {currentUser ? getUserDisplayName() : 'Debes iniciar sesión'}
          </span>
        </div>

        {/* Botón de envío */}
        <button
          type="submit"
          className="submit-button"
          disabled={isSubmitting || !currentUser || !reviewData.comment.trim()}
        >
          {isSubmitting ? (
            <>
              <span className="loading-spinner"></span>
              Enviando...
            </>
          ) : (
            'Publicar Reseña'
          )}
        </button>
      </form>

      {/* Estilos CSS */}
      <style jsx>{`
        .review-form-container {
          background: var(--color-background);
          border-radius: var(--radius-lg);
          padding: var(--spacing-xl);
          border: 1px solid var(--color-accent-light);
        }

        .form-title {
          font-size: var(--text-xl);
          font-weight: var(--font-semibold);
          color: var(--color-primary);
          margin: 0 0 var(--spacing-lg) 0;
          text-align: center;
        }

        .form-message {
          padding: var(--spacing-md);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-lg);
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .form-message.success {
          background: rgba(34, 197, 94, 0.1);
          color: var(--color-success);
          border: 1px solid rgba(34, 197, 94, 0.3);
        }

        .form-message.error {
          background: rgba(239, 68, 68, 0.1);
          color: var(--color-error);
          border: 1px solid rgba(239, 68, 68, 0.3);
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
          align-items: center;
          padding: var(--spacing-lg);
          background: var(--color-white);
          border-radius: var(--radius-md);
        }

        .form-label {
          font-weight: var(--font-semibold);
          color: var(--color-dark);
          font-size: var(--text-base);
        }

        .star-selector {
          display: flex;
          gap: var(--spacing-xs);
          margin: var(--spacing-sm) 0;
        }

        .star-button {
          background: none;
          border: none;
          font-size: 2rem;
          cursor: pointer;
          transition: all 0.2s ease;
          color: var(--color-accent);
          padding: var(--spacing-xs);
          border-radius: var(--radius-sm);
        }

        .star-button:hover:not(:disabled),
        .star-button.hover {
          color: var(--color-warning);
          transform: scale(1.1);
        }

        .star-button.selected {
          color: var(--color-warning);
        }

        .star-button:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .rating-text {
          font-size: var(--text-sm);
          color: var(--color-muted);
          font-weight: var(--font-medium);
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
          line-height: 1.5;
          resize: vertical;
          min-height: 120px;
          transition: border-color 0.3s ease;
          width: 100%;
        }

        .comment-textarea:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .comment-textarea:disabled {
          background: var(--color-accent-light);
          cursor: not-allowed;
          opacity: 0.7;
        }

        .char-count {
          font-size: var(--text-xs);
          color: var(--color-muted);
          text-align: right;
          margin-top: var(--spacing-xs);
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-md);
          background: var(--color-white);
          border-radius: var(--radius-md);
          border: 1px solid var(--color-accent-light);
        }

        .user-label {
          font-size: var(--text-sm);
          color: var(--color-muted);
        }

        .user-name {
          font-weight: var(--font-semibold);
          color: var(--color-primary);
        }

        .submit-button {
          padding: var(--spacing-lg) var(--spacing-xl);
          background: var(--color-primary);
          color: var(--color-white);
          border: none;
          border-radius: var(--radius-md);
          font-size: var(--text-base);
          font-weight: var(--font-semibold);
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm);
          min-height: 50px;
        }

        .submit-button:hover:not(:disabled) {
          background: var(--color-secondary);
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        .submit-button:disabled {
          background: var(--color-muted);
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .review-form-container {
            padding: var(--spacing-lg);
          }

          .rating-section {
            padding: var(--spacing-md);
          }

          .star-button {
            font-size: 1.5rem;
          }

          .submit-button {
            padding: var(--spacing-md) var(--spacing-lg);
          }
        }
      `}</style>
    </div>
  );
};

export default ReviewForm;