// src/components/product/ProductCard.jsx
// Componente de tarjeta de producto - Versión Corregida

import React from 'react';
import { useRouter } from 'next/navigation'; // Importamos useRouter para la navegación

/**
 * ProductCard: Componente para mostrar información de un producto
 * 
 * @param product - Objeto del producto con toda su información
 * @param viewMode - Modo de visualización ('grid' o 'list')
 * @param onViewDetails - Función callback opcional para abrir detalles del producto
 */
const ProductCard = ({ 
  product, 
  viewMode = 'grid', 
  onViewDetails 
}) => {
  
  // useRouter: Hook de Next.js para navegación programática
  const router = useRouter();
  
  /**
   * handleAddToCart: Función para agregar producto al carrito
   * Maneja la lógica de añadir un producto al carrito del usuario
   */
  const handleAddToCart = (e) => {
    // e.stopPropagation(): Evita que el evento se propague al contenedor padre
    e.stopPropagation();
    
    console.log('Agregando al carrito:', product.title);
    // Aquí iría la lógica real de agregar al carrito
    // Por ejemplo: addToCart(product.id, quantity)
    alert(`Product "${product.title}" added to cart`);
  };

  /**
   * handleViewDetails: Función para abrir detalles del producto
   * Navega a la página de detalles del producto usando Next.js router
   */
  const handleViewDetails = (e) => {
    // e.stopPropagation(): Evita que el evento se propague al contenedor padre
    e.stopPropagation();
    
    console.log('Navegando a detalles de:', product.title);
    
    // Validación: Verificar que el producto tenga un ID válido
    if (!product || !product.id) {
      console.error('Error: Producto inválido o sin ID', product);
      alert('Error: No se puede acceder a los detalles del producto');
      return;
    }

    // Si se proporciona una función onViewDetails como prop, la usamos
    if (onViewDetails && typeof onViewDetails === 'function') {
      onViewDetails(product);
      return;
    }

    // Navegación por defecto usando Next.js router
    // Construir la URL de detalles del producto: /product/[id]
    const productUrl = `/product/${product.id}`;
    
    try {
      // router.push(): Navega a la nueva página sin recargar
      router.push(productUrl);
    } catch (error) {
      console.error('Error al navegar:', error);
      alert('Error al abrir los detalles del producto');
    }
  };

  /**
   * handleCardClick: Maneja el clic en toda la tarjeta
   * Permite navegar haciendo clic en cualquier parte de la tarjeta
   */
  const handleCardClick = () => {
    handleViewDetails({ stopPropagation: () => {} });
  };

  /**
   * formatPrice: Formatea el precio con símbolo de moneda
   * Convierte un número a formato de precio con símbolo de dólar
   */
  const formatPrice = (price) => {
    if (typeof price !== 'number') {
      return '$0.00';
    }
    return `$${price.toFixed(2)}`;
  };

  /**
   * formatDate: Formatea la fecha de creación del producto
   * Convierte una fecha ISO a formato legible
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  /**
   * renderRating: Renderiza las estrellas basado en el rating numérico
   * Crea elementos visuales de estrellas llenas, medias y vacías
   */
  const renderRating = (rating) => {
    const stars = [];
    const numRating = Number(rating) || 0;
    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 !== 0;

    // Estrellas llenas
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="star full">★</span>
      );
    }

    // Estrella media si corresponde
    if (hasHalfStar) {
      stars.push(
        <span key="half" className="star half">☆</span>
      );
    }

    // Estrellas vacías para completar 5
    const emptyStars = 5 - Math.ceil(numRating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="star empty">☆</span>
      );
    }

    return stars;
  };

  /**
   * getStockStatus: Determina el estado del stock y su estilo
   * Analiza la cantidad en stock y retorna texto y clase CSS apropiados
   */
  const getStockStatus = (stock) => {
    const stockNum = Number(stock) || 0;
    
    if (stockNum === 0) return { text: 'Agotado', className: 'out-of-stock' };
    if (stockNum <= 5) return { text: `Solo ${stockNum} disponibles`, className: 'low-stock' };
    return { text: 'Disponible', className: 'in-stock' };
  };

  // Validación: Verificar que el producto existe
  if (!product) {
    return (
      <div className="productCard error">
        <div className="error-message">
          <p>Error: Producto no válido</p>
        </div>
      </div>
    );
  }

  const stockStatus = getStockStatus(product.stock);

  return (
    <div 
      className={`productCard ${viewMode}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      {/* Sección de imagen del producto */}
      <div className="product-image">
        <img 
          src={product.image_url || '/images/placeholder-product.jpg'} 
          alt={product.title || 'Producto sin título'}
          onError={(e) => {
            // Imagen de fallback si no se puede cargar la imagen principal
            e.target.src = '/images/placeholder-product.jpg';
          }}
        />
        
        {/* Badge de estado del stock */}
        <div className={`stock-badge ${stockStatus.className}`}>
          {stockStatus.text}
        </div>
      </div>
      
      {/* Sección de información del producto */}
      <div className="product-info">
        {/* Título del producto */}
        <h3 className="heading-section">{product.title || 'Sin título'}</h3>
        
        {/* Categoría del producto */}
        <p className="text-small text-secondary">{product.category || 'Sin categoría'}</p>
        
        {/* Descripción (solo visible en vista de lista) */}
        {viewMode === 'list' && product.description && (
          <p className="text-body mt-sm">{product.description}</p>
        )}
        
        {/* Sistema de rating con estrellas */}
        <div className="product-rating mt-sm">
          <div className="stars">
            {renderRating(product.rating)}
          </div>
          <span className="rating-number text-muted">
            ({Number(product.rating || 0).toFixed(1)})
          </span>
        </div>
        
        {/* Fecha de creación del producto */}
        <p className="text-small text-muted mt-xs">
          Added: {formatDate(product.created_at)}
        </p>
        
        {/* Footer con precio y botones de acción */}
        <div className="product-footer mt-md">
          <span className="text-emphasis">{formatPrice(product.price)}</span>
          
          {/* Contenedor de botones de acción */}
          <div className="action-buttons">
            {/* Botón para ver detalles del producto */}
            <button 
              onClick={handleViewDetails}
              className="btn btn-secondary btn-small"
              title="Ver detalles del producto"
              type="button"
              aria-label={`Ver detalles de ${product.title}`}
            >
              View Details
            </button>
            
            {/* Botón para agregar al carrito */}
            <button 
              onClick={handleAddToCart}
              className="btn btn-primary btn-small"
              disabled={product.stock === 0}
              title={product.stock === 0 ? 'Producto agotado' : 'Add to Cart'}
              type="button"
              aria-label={product.stock === 0 ? 'Producto agotado' : `Added ${product.title} to cart`}
            >
              {product.stock === 0 ? 'Agotado' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .productCard {
          background: var(--color-white);
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-md);
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
          border: 1px solid var(--color-accent-light);
        }

        .productCard:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-xl);
        }

        .productCard:focus {
          outline: 2px solid var(--color-primary);
          outline-offset: 2px;
        }

        .productCard.list {
          display: flex;
          flex-direction: row;
        }

        .productCard.list .product-image {
          width: 200px;
          flex-shrink: 0;
        }

        .productCard.error {
          background: var(--color-error-light);
          border-color: var(--color-error);
          cursor: default;
        }

        .error-message {
          padding: var(--spacing-lg);
          text-align: center;
          color: var(--color-error);
        }

        .product-image {
          width: 100%;
          height: 250px;
          overflow: hidden;
          position: relative;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .productCard:hover .product-image img {
          transform: scale(1.05);
        }

        .stock-badge {
          position: absolute;
          top: var(--spacing-sm);
          right: var(--spacing-sm);
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--radius-lg);
          font-size: var(--text-xs);
          font-weight: var(--font-semibold);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stock-badge.in-stock {
          background: var(--color-success);
          color: var(--color-white);
        }

        .stock-badge.low-stock {
          background: var(--color-warning);
          color: var(--color-white);
        }

        .stock-badge.out-of-stock {
          background: var(--color-error);
          color: var(--color-white);
        }

        .product-info {
          padding: var(--spacing-lg);
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }

        .heading-section {
          font-size: var(--text-lg);
          font-weight: var(--font-semibold);
          color: var(--color-dark);
          margin: 0 0 var(--spacing-sm) 0;
          line-height: 1.4;
        }

        .text-small {
          font-size: var(--text-sm);
        }

        .text-secondary {
          color: var(--color-secondary);
        }

        .text-body {
          font-size: var(--text-base);
          line-height: 1.5;
          color: var(--color-dark);
        }

        .text-muted {
          color: var(--color-muted);
        }

        .text-emphasis {
          font-size: var(--text-xl);
          font-weight: var(--font-bold);
          color: var(--color-primary);
        }

        .mt-sm {
          margin-top: var(--spacing-sm);
        }

        .mt-xs {
          margin-top: var(--spacing-xs);
        }

        .mt-md {
          margin-top: var(--spacing-md);
        }

        .product-rating {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .stars {
          display: flex;
          gap: 2px;
        }

        .star {
          font-size: var(--text-lg);
        }

        .star.full {
          color: var(--color-warning);
        }

        .star.half {
          color: var(--color-warning);
        }

        .star.empty {
          color: var(--color-accent);
        }

        .rating-number {
          font-weight: var(--font-medium);
        }

        .product-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
          gap: var(--spacing-md);
        }

        .action-buttons {
          display: flex;
          gap: var(--spacing-sm);
          flex-wrap: wrap;
        }

        .btn {
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: var(--font-medium);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .btn:hover {
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }

        .btn:active {
          transform: translateY(0);
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .btn-small {
          padding: var(--spacing-xs) var(--spacing-sm);
          font-size: var(--text-sm);
          white-space: nowrap;
        }

        .btn-primary {
          background: var(--color-primary);
          color: var(--color-white);
        }

        .btn-primary:hover:not(:disabled) {
          background: var(--color-secondary);
        }

        .btn-secondary {
          background: var(--color-secondary);
          color: var(--color-white);
        }

        .btn-secondary:hover:not(:disabled) {
          background: var(--color-primary);
        }

        @media (max-width: 768px) {
          .productCard.list {
            flex-direction: column;
          }

          .productCard.list .product-image {
            width: 100%;
          }

          .product-footer {
            flex-direction: column;
            gap: var(--spacing-sm);
            align-items: stretch;
          }

          .action-buttons {
            width: 100%;
          }

          .btn-small {
            flex: 1;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductCard;