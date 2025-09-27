// components/HomePage.jsx
// Página principal con productos dinámicos y filtros funcionales

import React, { useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/product/ProductCard';
import FilterBar from './FilterBar';
// IMPORTACIÓN CORREGIDA: Usar UtilityComponents.jsx
import { LoadingSpinner, ErrorMessage } from './UtilityComponents';

const HomePage = () => {
  // useProducts: Hook personalizado para manejar productos
  const {
    products,      // Array de productos filtrados
    categories,    // Lista de categorías disponibles  
    loading,       // Estado booleano de carga
    error,         // Mensaje de error si existe
    filters,       // Objeto con filtros activos
    stats,         // Estadísticas calculadas
    updateFilter,  // Función para actualizar filtros
    clearFilters   // Función para limpiar filtros
  } = useProducts();

  // useState: Estado local para el modo de vista (grid/list)
  const [viewMode, setViewMode] = useState('grid');

  // handleError: Si hay error, mostrar componente de error
  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="homepage">
      {/* Header de la página */}
      <header className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Discover Handcrafted Items</h1>
          <p className="hero-subtitle">
            Explore unique, handmade products from talented artisans around the world.
            Each piece tells a story of craftsmanship and creativity.
          </p>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">{stats.totalProducts}</span>
              <span className="stat-label">Unique Products</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.categoriesCount}</span>
              <span className="stat-label">Categories</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">${stats.averagePrice}</span>
              <span className="stat-label">Avg Price</span>
            </div>
          </div>
        </div>
      </header>

      {/* Sección principal de productos */}
      <main className="main-content">
        <div className="container">
          {/* FilterBar: Componente para filtrar productos */}
          <FilterBar
            categories={categories}
            filters={filters}
            onFilterChange={updateFilter}
            onClearFilters={clearFilters}
            productCount={stats.filteredCount}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {/* Contenido de productos - Renderizado condicional */}
          <section className="products-section">
            {loading ? (
              // LoadingSpinner: Se muestra cuando loading es true
              <LoadingSpinner />
            ) : products.length === 0 ? (
              // NoProductsMessage: Se muestra cuando no hay productos
              <NoProductsMessage filters={filters} onClearFilters={clearFilters} />
            ) : (
              // ProductGrid: Se muestra cuando hay productos
              <ProductGrid products={products} viewMode={viewMode} />
            )}
          </section>
        </div>
      </main>

      {/* Estilos CSS con styled-jsx */}
      <style jsx>{`
        .homepage {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }

        .hero-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 80px 20px;
          text-align: center;
        }

        .hero-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 700;
          margin-bottom: 20px;
          line-height: 1.2;
        }

        .hero-subtitle {
          font-size: 1.3rem;
          margin-bottom: 40px;
          opacity: 0.9;
          line-height: 1.6;
        }

        .hero-stats {
          display: flex;
          justify-content: center;
          gap: 40px;
          margin-top: 40px;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .stat-number {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 5px;
        }

        .stat-label {
          font-size: 1rem;
          opacity: 0.8;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .main-content {
          padding: 40px 0;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .products-section {
          margin-top: 30px;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }

          .hero-subtitle {
            font-size: 1.1rem;
          }

          .hero-stats {
            flex-direction: column;
            gap: 20px;
          }

          .stat-number {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
};

// NoProductsMessage: Componente para mostrar cuando no hay productos
const NoProductsMessage = ({ filters, onClearFilters }) => (
  <div className="no-products">
    <div className="no-products-content">
      <div className="no-products-icon">🔍</div>
      <h3>No products found</h3>
      <p>
        No products match your current filters. Try adjusting your search criteria or clear all filters.
      </p>
      <button onClick={onClearFilters} className="clear-filters-btn">
        Clear All Filters
      </button>
    </div>

    <style jsx>{`
      .no-products {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 400px;
        text-align: center;
      }

      .no-products-content {
        max-width: 400px;
      }

      .no-products-icon {
        font-size: 4rem;
        margin-bottom: 20px;
      }

      .no-products h3 {
        font-size: 1.5rem;
        margin-bottom: 15px;
        color: #333;
      }

      .no-products p {
        color: #666;
        margin-bottom: 25px;
        line-height: 1.6;
      }

      .clear-filters-btn {
        background: #667eea;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 6px;
        font-size: 1rem;
        cursor: pointer;
        transition: background 0.3s ease;
      }

      .clear-filters-btn:hover {
        background: #5a6fd8;
      }
    `}</style>
  </div>
);

// ProductGrid: Componente para la cuadrícula de productos
const ProductGrid = ({ products, viewMode }) => (
  <div className={`product-grid ${viewMode}`}>
    {products.map(product => (
      <ProductCard key={product.id} product={product} viewMode={viewMode} />
    ))}

    <style jsx>{`
      .product-grid.grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 30px;
        padding: 20px 0;
      }

      .product-grid.list {
        display: flex;
        flex-direction: column;
        gap: 20px;
        padding: 20px 0;
      }

      @media (max-width: 768px) {
        .product-grid.grid {
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }
      }
    `}</style>
  </div>
);

// LÍNEA CRÍTICA: Export default es OBLIGATORIO
export default HomePage;