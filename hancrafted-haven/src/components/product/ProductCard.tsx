import React from 'react';

const ProductCard = ({product, viewMode = 'grid' }) => {
  // handleAddToCart: Función para agregar producto al carrito
  const handleAddToCart = () => {
    console.log('Agregando al carrito:', product.title);
    // Aquí iría la lógica real de agregar al carrito
  };

  // formatPrice: Formatea el precio con símbolo de moneda
  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
  };

  // formatDate: Formatea la fecha de creación
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // renderRating: Renderiza las estrellas basado en el rating numérico
  const renderRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star full">★</span>);
    }

    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">☆</span>);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">☆</span>);
    }

    return stars;
  };

  // getStockStatus: Determina el estado del stock
  const getStockStatus = (stock) => {
    if (stock === 0) return { text: 'Out of Stock', className: 'out-of-stock' };
    if (stock <= 5) return { text: `Only ${stock} left`, className: 'low-stock' };
    return { text: 'In Stock', className: 'in-stock' };
  };

  const stockStatus = getStockStatus(product.stock);

  return (
    <div className={`productCard ${viewMode}`}>
      <div className="product-image">
        <img 
          src={product.image_url} 
          alt={product.title}
          onError={(e) => {
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNTAgMTEwQzEzOS4yIDExMCAxMzAuNSAxMTguNyAxMzAuNSAxMjkuNVMxMzkuMiAxNDkgMTUwIDE0OUMxNjAuOCAxNDkgMTY5LjUgMTQwLjMgMTY5LjUgMTI5LjVTMTYwLjggMTEwIDE1MCAxMTBaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0xODAuNSAxODBIODkuNUw5OS41IDE1MEwxNzAuNSAxNTBMMTgwLjUgMTgwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
          }}
        />
        
        {/* Badge de stock usando tus estilos */}
        <div className={`stock-badge ${stockStatus.className}`}>
          {stockStatus.text}
        </div>
      </div>
      
      <div className="product-info">
        {/* Título del producto usando campo real */}
        <h3 className="heading-section">{product.title}</h3>
        
        {/* Categoría */}
        <p className="text-small text-secondary">{product.category}</p>
        
        {/* Descripción (solo en vista lista) */}
        {viewMode === 'list' && (
          <p className="text-body mt-sm">{product.description}</p>
        )}
        
        {/* Rating usando campo real */}
        <div className="product-rating mt-sm">
          <div className="stars">
            {renderRating(product.rating)}
          </div>
          <span className="rating-number text-muted">({product.rating})</span>
        </div>
        
        {/* Fecha de creación */}
        <p className="text-small text-muted mt-xs">Added: {formatDate(product.created_at)}</p>
        
        {/* Footer con precio y botón */}
        <div className="product-footer mt-md">
          <span className="text-emphasis">{formatPrice(product.price)}</span>
          <button 
            onClick={handleAddToCart}
            className="btn btn-primary"
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? 'Sold Out' : 'Add to Cart'}
          </button>
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
        }
      `}</style>
    </div>
  );
};

export default ProductCard;