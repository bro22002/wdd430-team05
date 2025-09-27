// components/product/ProductGrid.tsx
// Componente para mostrar una grilla de productos

'use client';
import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { Product } from '../../types/product';
import { getAllProducts, getProductsByCategory } from '../../utils/database';

interface ProductGridProps {
  filters?: {
    category?: string;
    featured?: boolean;
  };
  className?: string;
}

/**
 * Componente ProductGrid - Muestra productos en una grilla responsiva
 * @param filters - Filtros para los productos
 * @param className - Clases CSS adicionales
 */
export default function ProductGrid({ 
  filters,
  className = '' 
}: ProductGridProps) {
  
  // Estados para manejar productos y carga
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Carga los productos cuando cambian los filtros
   */
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let data;
        if (filters?.category) {
          data = await getProductsByCategory(filters.category);
        } else {
          data = await getAllProducts();
        }
        setProducts(data);
        
      } catch (err) {
        setError('Error loading products. Please try again.');
        console.error('Error loading products:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadProducts();
  }, [filters]);
  
  /**
   * Maneja el toggle de favoritos
   * @param productId - ID del producto
   * @param isFavorite - Nuevo estado de favorito
   */
  const handleFavoriteToggle = (productId: string, isFavorite: boolean) => {
    console.log(`Product ${productId} favorite status: ${isFavorite}`);
    
    // Aquí iría la lógica para:
    // 1. Actualizar en la base de datos
    // 2. Actualizar estado global (Context/Redux)
    // 3. Mostrar notificación al usuario
    
    // Por ahora solo lo logueamos
  };
  
  /**
   * Maneja el click en un producto
   * @param product - Producto clickeado
   */
  const handleProductClick = (product: Product) => {
    console.log('Product clicked:', product.title);
    
    // Aquí iría la lógica para:
    // 1. Navegar a la página de detalles del producto
    // 2. Abrir un modal con detalles
    // 3. Etc.
    
    // Por ejemplo, con Next.js router:
    // router.push(`/products/${product.id}`);
  };
  
  // Componente de skeleton loader
  const SkeletonCard = () => (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden animate-pulse">
      <div className="h-64 bg-gray-200" />
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 bg-gray-200 rounded-full" />
          <div className="flex-1">
            <div className="h-3 bg-gray-200 rounded mb-1" />
            <div className="h-2 bg-gray-200 rounded w-2/3" />
          </div>
        </div>
        <div className="h-4 bg-gray-200 rounded mb-2" />
        <div className="h-3 bg-gray-200 rounded w-1/2 mb-3" />
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
        <div className="h-6 bg-gray-200 rounded w-1/4" />
      </div>
    </div>
  );
  
  // Estado de carga
  if (loading) {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
        {/* Mostrar 8 skeleton cards mientras carga */}
        {Array.from({ length: 8 }, (_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }
  
  // Estado de error
  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="max-w-md mx-auto">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Oops! Something went wrong
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  // Estado vacío
  if (products.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="max-w-md mx-auto">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No products found
          </h3>
          <p className="text-gray-600">
            Try adjusting your filters or check back later for new products.
          </p>
        </div>
      </div>
    );
  }
  
  // Renderizar grilla de productos
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onFavoriteToggle={handleFavoriteToggle}
          onProductClick={handleProductClick}
        />
      ))}
    </div>
  );
}