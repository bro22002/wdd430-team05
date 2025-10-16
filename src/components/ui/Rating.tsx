// components/ui/Rating.tsx
// Componente para mostrar calificaciones con estrellas

import React from 'react';

interface RatingProps {
  rating: number;        // Calificación promedio (0-5)
  maxRating?: number;    // Máxima calificación (por defecto 5)
  reviewCount?: number;  // Número de reseñas
  showCount?: boolean;   // Mostrar contador de reseñas
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

/**
 * Componente Rating - Muestra estrellas de calificación
 * @param rating - Número de estrellas (puede tener decimales)
 * @param maxRating - Máximo número de estrellas
 * @param reviewCount - Cantidad de reseñas
 * @param showCount - Si mostrar el contador
 * @param size - Tamaño de las estrellas
 */
export default function Rating({
  rating,
  maxRating = 5,
  reviewCount,
  showCount = true,
  size = 'medium',
  className = ''
}: RatingProps) {
  
  // Determinar el tamaño de las estrellas basado en la prop size
  const sizeClasses = {
    small: 'w-3 h-3',
    medium: 'w-4 h-4',
    large: 'w-5 h-5'
  };
  
  const starSize = sizeClasses[size];
  
  /**
   * Renderiza una estrella individual
   * @param index - Posición de la estrella (0-based)
   * @returns JSX de la estrella
   */
  const renderStar = (index: number) => {
    const starValue = index + 1;
    
    // Determinar si la estrella está llena, media o vacía
    const isFilled = rating >= starValue;
    const isHalfFilled = rating >= starValue - 0.5 && rating < starValue;
    
    return (
      <div key={index} className="relative">
        {/* Estrella de fondo (vacía) */}
        <svg
          className={`${starSize} text-gray-300`}
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        
        {/* Estrella llena o media llena */}
        {(isFilled || isHalfFilled) && (
          <svg
            className={`${starSize} text-yellow-400 absolute top-0 left-0`}
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              clipPath: isHalfFilled ? 'inset(0 50% 0 0)' : 'none'
            }}
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        )}
      </div>
    );
  };
  
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* Renderizar todas las estrellas */}
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }, (_, index) => renderStar(index))}
      </div>
      
      {/* Mostrar el número de rating */}
      <span className="text-sm text-gray-600 ml-1">
        {rating.toFixed(1)}
      </span>
      
      {/* Mostrar contador de reseñas si está habilitado */}
      {showCount && reviewCount && (
        <span className="text-sm text-gray-500">
          ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  );
}