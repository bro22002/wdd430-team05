// src/components/product/ProductCard.jsx
// Componente de tarjeta de producto - Versión JSX

import React from 'react';

/**
 * ProductCard: Componente para mostrar información de un producto
 * 
 * @param product - Objeto del producto con toda su información
 * @param viewMode - Modo de visualización ('grid' o 'list')
 * @param onViewDetails - Función callback para abrir detalles del producto
 */
const ProductCard = ({ 
  product, 
  viewMode = 'grid', 
  onViewDetails 
}) => {
  
  /**
   * handleAddToCart: Función para agregar producto al carrito
   * Maneja la lógica de añadir un producto al carrito del usuario
   */
  const handleAddToCart = () => {
    console.log('Agregando al carrito:', product.title);
    // Aquí iría la lógica real de agregar al carrito
    // Por ejemplo: addToCart(product.id, quantity)
  };

  /**
   * handleViewDetails: Función para abrir detalles del producto
   * Llama a la función onViewDetails pasada como prop para abrir el modal/página de detalles
   */
  const handleViewDetails = () => {
    console.log('Viendo detalles de:', product.title);
    if (onViewDetails) {
      onViewDetails(product);
    }
  };

  /**
   * formatPrice: Formatea el precio con símbolo de moneda
   * Convierte un número a formato de precio con símbolo de dólar
   */
  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
  };

  /**
   * formatDate: Formatea la fecha de creación del producto
   * Convierte una fecha ISO a formato legible
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  /**
   * renderRating: Renderiza las estrellas basado en el rating numérico
   * Crea elementos visuales de estrellas llenas, medias y vacías
   */
  const renderRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

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
    const emptyStars = 5 - Math.ceil(rating);
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
    if (stock === 0) return { text: 'Out of Stock', className: 'out-of-stock' };
    if (stock <= 5) return { text: `Only ${stock} left`, className: 'low-stock' };
    return { text: 'In Stock', className: 'in-stock' };
  };

  const stockStatus = getStockStatus(product.stock);

  return (
    <div className={`productCard ${viewMode}`}>
      {/* Sección de imagen del producto */}
      <div className="product-image">
        <img 
          src={product.image_url} 
          alt={product.title}
          onError={(e) => {
            // Imagen de fallback si no se puede cargar la imagen principal
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNTAgMTEwQzEzOS4yIDExMCAxMzAuNSAxMTguNyAxMzAuNSAxMjkuNVMxMzkuMiAxNDkgMTUwIDE0OUMxNjAuOCAxNDkgMTY5LjUgMTQwLjMgMTY5LjUgMTI5LjVTMTYwLjggMTEwIDE1MCAxMTBaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0xODAuNSAxODBIODkuNUw5OS41IDE1MEwxNzAuNSAxNTBMMTgwLjUgMTgwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
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
        <h3 className="heading-section">{product.title}</h3>
        
        {/* Categoría del producto */}
        <p className="text-small text-secondary">{product.category}</p>
        
        {/* Descripción (solo visible en vista de lista) */}
        {viewMode === 'list' && (
          <p className="text-body mt-sm">{product.description}</p>
        )}
        
        {/* Sistema de rating con estrellas */}
        <div className="product-rating mt-sm">
          <div className="stars">
            {renderRating(product.rating)}
          </div>
          <span className="rating-number text-muted">({product.rating})</span>
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
              title="View product details"
              type="button"
            >
              View Details
            </button>
            
            {/* Botón para agregar al carrito */}
            <button 
              onClick={handleAddToCart}
              className="btn btn-primary btn-small"
              disabled={product.stock === 0}
              title={product.stock === 0 ? 'Product out of stock' : 'Add to cart'}
              type="button"
            >
              {product.stock === 0 ? 'Sold Out' : 'Add to Cart'}
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

        .productCard.list {
          display: flex;
          flex-direction: row;
        }

        .productCard.list .product-image {
          width: 200px;
          flex-shrink: 0;
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

        .btn-small {
          padding: var(--spacing-xs) var(--spacing-sm);
          font-size: var(--text-sm);
          white-space: nowrap;
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