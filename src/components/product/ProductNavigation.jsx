// Componente para manejar la navegación hacia los detalles del producto

import React from 'react';
import { useRouter } from 'next/navigation';

/**
 * ProductNavigation: Hook personalizado para manejar navegación de productos
 * @returns {Object} - Objeto con funciones de navegación
 */
export const useProductNavigation = () => {
  const router = useRouter();

  /**
   * navigateToProduct: Navega hacia la página de detalles del producto
   * @param {Object} product - Objeto del producto
   */
  const navigateToProduct = (product) => {
    console.log('🔗 Navigating to product details:', product.title);
    
    // Validar que el producto tenga un ID válido
    if (!product || !product.id) {
      console.error('❌ Invalid product object or missing ID');
      return;
    }

    // Construir la URL de detalles del producto
    const productUrl = `/product/${product.id}`;
    
    // Navegar usando Next.js router
    router.push(productUrl);
  };

  /**
   * navigateToCategory: Navega hacia una categoría específica
   * @param {string} category - Nombre de la categoría
   */
  const navigateToCategory = (category) => {
    const categoryUrl = `/category/${encodeURIComponent(category)}`;
    router.push(categoryUrl);
  };

  /**
   * navigateToArtisan: Navega hacia el perfil del artesano
   * @param {string} artisanId - ID del artesano
   */
  const navigateToArtisan = (artisanId) => {
    const artisanUrl = `/artisan/${artisanId}`;
    router.push(artisanUrl);
  };

  /**
   * goBack: Regresa a la página anterior
   */
  const goBack = () => {
    router.back();
  };

  /**
   * goToHome: Navega al inicio
   */
  const goToHome = () => {
    router.push('/');
  };

  return {
    navigateToProduct,
    navigateToCategory,
    navigateToArtisan,
    goBack,
    goToHome
  };
};

/**
 * ProductGrid: Componente que muestra una grilla de productos
 * @param {Array} products - Array de productos
 * @param {string} viewMode - Modo de vista ('grid' o 'list')
 */
export const ProductGrid = ({ products, viewMode = 'grid' }) => {
  const { navigateToProduct } = useProductNavigation();

  /**
   * handleProductClick: Maneja el clic en un producto
   * @param {Object} product - Producto clickeado
   */
  const handleProductClick = (product) => {
    navigateToProduct(product);
  };

  return (
    <div className={`product-grid ${viewMode}`}>
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          viewMode={viewMode}
          onViewDetails={handleProductClick}
        />
      ))}

      <style jsx>{`
        .product-grid {
          display: grid;
          gap: var(--spacing-lg);
          width: 100%;
        }

        .product-grid.grid {
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        }

        .product-grid.list {
          grid-template-columns: 1fr;
        }

        @media (max-width: 768px) {
          .product-grid.grid {
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: var(--spacing-md);
          }
        }

        @media (max-width: 480px) {
          .product-grid.grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};