// Componente reutilizable para mostrar calificaciones con estrellas

import React from 'react';

/**
 * ProductRating: Componente para mostrar calificaciones con estrellas
 * 
 * Funcionalidades:
 * - Renderiza estrellas basado en un rating numérico
 * - Soporte para medias estrellas
 * - Opción de mostrar número de reviews
 * - Diferentes tamaños (small, medium, large)
 * - Modo de solo lectura o interactivo
 * 
 * @param {number} rating - Calificación numérica (0-5)
 * @param {number} reviewCount - Número total de reviews (opcional)
 * @param {boolean} showCount - Si mostrar el conteo de reviews
 * @param {string} size - Tamaño de las estrellas ('small', 'medium', 'large')
 * @param {boolean} interactive - Si las estrellas son clickeables
 * @param {Function} onRatingChange - Callback cuando cambia el rating (modo interactivo)
 * @param {boolean} showAverage - Si mostrar el promedio numérico
 */
const ProductRating = ({ 
  rating = 0,
  reviewCount = 0,
  showCount = false,
  size = 'medium',
  interactive = false,
  onRatingChange = null,
  showAverage = false
}) => {

  /**
   * handleStarClick: Maneja el click en una estrella (modo interactivo)
   * @param {number} starIndex - Índice de la estrella clickeada (1-5)
   */
  const handleStarClick = (starIndex) => {
    if (interactive && onRatingChange) {
      onRatingChange(starIndex);
    }
  };

  /**
   * handleStarHover: Maneja el hover sobre las estrellas (modo interactivo)
   * @param {number} starIndex - Índice de la estrella sobre la que se hace hover
   */
  const handleStarHover = (starIndex) => {
    if (!interactive) return;

    // Resaltar estrellas hasta la posición del hover
    const stars = document.querySelectorAll('.star-rating .star');
    stars.forEach((star, index) => {
      if (index < starIndex) {
        star.classList.add('hover');
      } else {
        star.classList.remove('hover');
      }
    });
  };

  /**
   * handleMouseLeave: Remueve el efecto hover cuando el mouse sale del área
   */
  const handleMouseLeave = () => {
    if (!interactive) return;

    const stars = document.querySelectorAll('.star-rating .star');
    stars.forEach(star => {
      star.classList.remove('hover');
    });
  };

  /**
   * renderStars: Genera los elementos de estrellas
   * @returns {Array} - Array de elementos JSX de estrellas
   */
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - Math.ceil(rating);

    // Generar estrellas llenas
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span
          key={`full-${i}`}
          className={`star filled ${interactive ? 'interactive' : ''}`}
          onClick={() => handleStarClick(i + 1)}
          onMouseEnter={() => handleStarHover(i + 1)}
          title={interactive ? `Calificar con ${i + 1} estrella${i > 0 ? 's' : ''}` : ''}
          role={interactive ? 'button' : undefined}
          tabIndex={interactive ? 0 : undefined}
        >
          ★
        </span>
      );
    }

    // Agregar media estrella si corresponde
    if (hasHalfStar) {
      stars.push(
        <span
          key="half"
          className={`star half ${interactive ? 'interactive' : ''}`}
          onClick={() => handleStarClick(fullStars + 1)}
          onMouseEnter={() => handleStarHover(fullStars + 1)}
          title={interactive ? `Calificar con ${fullStars + 1} estrella${fullStars > 0 ? 's' : ''}` : ''}
          role={interactive ? 'button' : undefined}
          tabIndex={interactive ? 0 : undefined}
        >
          ★
        </span>
      );
    }

    // Agregar estrellas vacías
    for (let i = 0; i < emptyStars; i++) {
      const starIndex = fullStars + (hasHalfStar ? 1 : 0) + i;
      stars.push(
        <span
          key={`empty-${i}`}
          className={`star empty ${interactive ? 'interactive' : ''}`}
          onClick={() => handleStarClick(starIndex + 1)}
          onMouseEnter={() => handleStarHover(starIndex + 1)}
          title={interactive ? `Calificar con ${starIndex + 1} estrella${starIndex > 0 ? 's' : ''}` : ''}
          role={interactive ? 'button' : undefined}
          tabIndex={interactive ? 0 : undefined}
        >
          ☆
        </span>
      );
    }

    return stars;
  };

  /**
   * formatReviewCount: Formatea el número de reviews para mostrar
   * @param {number} count - Número de reviews
   * @returns {string} - Texto formateado
   */
  const formatReviewCount = (count) => {
    if (count === 0) return 'Sin reseñas';
    if (count === 1) return '1 reseña';
    if (count < 1000) return `${count} reseñas`;
    if (count < 1000000) return `${(count / 1000).toFixed(1)}k reseñas`;
    return `${(count / 1000000).toFixed(1)}M reseñas`;
  };

  /**
   * getSizeClass: Obtiene la clase CSS para el tamaño
   * @param {string} size - Tamaño solicitado
   * @returns {string} - Clase CSS
   */
  const getSizeClass = (size) => {
    const sizeMap = {
      small: 'rating-small',
      medium: 'rating-medium',
      large: 'rating-large'
    };
    return sizeMap[size] || sizeMap.medium;
  };

  return (
    <div 
      className={`product-rating ${getSizeClass(size)} ${interactive ? 'interactive-rating' : ''}`}
      onMouseLeave={handleMouseLeave}
    >
      {/* Contenedor de estrellas */}
      <div className="star-rating" role={interactive ? 'radiogroup' : undefined}>
        {renderStars()}
      </div>

      {/* Información adicional */}
      <div className="rating-info">
        {/* Promedio numérico */}
        {showAverage && (
          <span className="rating-average">
            {rating.toFixed(1)}
          </span>
        )}

        {/* Contador de reviews */}
        {showCount && (
          <span className="review-count">
            ({formatReviewCount(reviewCount)})
          </span>
        )}
      </div>

      {/* Estilos CSS */}
      <style jsx>{`
        .product-rating {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .star-rating {
          display: flex;
          gap: 2px;
        }

        .star {
          transition: all 0.2s ease;
          user-select: none;
        }

        .star.filled {
          color: var(--color-warning);
        }

        .star.half {
          color: var(--color-warning);
          position: relative;
        }

        .star.half::after {
          content: '☆';
          position: absolute;
          left: 50%;
          top: 0;
          color: var(--color-accent);
          clip-path: inset(0 0 0 50%);
        }

        .star.empty {
          color: var(--color-accent);
        }

        .star.interactive {
          cursor: pointer;
          border-radius: var(--radius-sm);
          padding: 2px;
        }

        .star.interactive:hover,
        .star.hover {
          color: var(--color-warning) !important;
          transform: scale(1.1);
          background: rgba(255, 193, 7, 0.1);
        }

        .star.interactive:focus {
          outline: 2px solid var(--color-primary);
          outline-offset: 2px;
        }

        .rating-info {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
        }

        .rating-average {
          font-weight: var(--font-semibold);
          color: var(--color-dark);
        }

        .review-count {
          color: var(--color-muted);
          font-size: 0.9em;
        }

        /* Tamaños de estrellas */
        .rating-small .star {
          font-size: 1rem;
        }

        .rating-small .rating-average {
          font-size: var(--text-sm);
        }

        .rating-small .review-count {
          font-size: var(--text-xs);
        }

        .rating-medium .star {
          font-size: 1.25rem;
        }

        .rating-medium .rating-average {
          font-size: var(--text-base);
        }

        .rating-medium .review-count {
          font-size: var(--text-sm);
        }

        .rating-large .star {
          font-size: 1.5rem;
        }

        .rating-large .rating-average {
          font-size: var(--text-lg);
        }

        .rating-large .review-count {
          font-size: var(--text-base);
        }

        /* Estados especiales */
        .interactive-rating {
          user-select: none;
        }

        @media (max-width: 768px) {
          .rating-large .star {
            font-size: 1.25rem;
          }
          
          .rating-medium .star {
            font-size: 1.1rem;
          }
        }

        /* Animación de entrada */
        .star {
          animation: starFadeIn 0.3s ease-out forwards;
          opacity: 0;
        }

        .star:nth-child(1) { animation-delay: 0ms; }
        .star:nth-child(2) { animation-delay: 50ms; }
        .star:nth-child(3) { animation-delay: 100ms; }
        .star:nth-child(4) { animation-delay: 150ms; }
        .star:nth-child(5) { animation-delay: 200ms; }

        @keyframes starFadeIn {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default ProductRating;