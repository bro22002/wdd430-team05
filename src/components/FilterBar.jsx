// components/FilterBar.jsx
// Barra de filtros para productos con diferentes opciones de filtrado

import React from 'react';

const FilterBar = ({
  categories,
  filters,
  onFilterChange,
  onClearFilters,
  productCount,
  viewMode,
  onViewModeChange
}) => {
  // handleCategoryChange: Maneja cambios en el selector de categoría
  const handleCategoryChange = (e) => {
    onFilterChange('category', e.target.value);
  };

  // handlePriceRangeChange: Maneja cambios en el selector de precio
  const handlePriceRangeChange = (e) => {
    onFilterChange('priceRange', e.target.value);
  };

  // handleSearchChange: Maneja cambios en el campo de búsqueda
  const handleSearchChange = (e) => {
    onFilterChange('searchTerm', e.target.value);
  };

  // hasActiveFilters: Verifica si hay filtros activos
  const hasActiveFilters = filters.category !== 'All Categories' || 
                          filters.priceRange !== 'all' || 
                          filters.searchTerm !== '';

  return (
    <div className="filter-bar">
      <div className="filter-row">
        {/* Sección de búsqueda */}
        <div className="search-section">
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Search products..."
              value={filters.searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>

        {/* Sección de filtros */}
        <div className="filters-section">
          {/* Filtro por categoría */}
          <div className="filter-group">
            <label htmlFor="category-select" className="filter-label">
              Category:
            </label>
            <select
              id="category-select"
              value={filters.category}
              onChange={handleCategoryChange}
              className="filter-select"
            >
              <option value="All Categories">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por precio */}
          <div className="filter-group">
            <label htmlFor="price-select" className="filter-label">
              Price Range:
            </label>
            <select
              id="price-select"
              value={filters.priceRange}
              onChange={handlePriceRangeChange}
              className="filter-select"
            >
              <option value="all">All Prices</option>
              <option value="under-25">Under $25</option>
              <option value="25-50">$25 - $50</option>
              <option value="50-100">$50 - $100</option>
              <option value="over-100">Over $100</option>
            </select>
          </div>

          {/* Botón para limpiar filtros */}
          {hasActiveFilters && (
            <button onClick={onClearFilters} className="clear-filters-btn">
              Clear Filters
            </button>
          )}
        </div>

        {/* Sección de vista y resultados */}
        <div className="view-section">
          {/* Contador de productos */}
          <div className="product-count">
            <span className="count-text">
              {productCount} {productCount === 1 ? 'product' : 'products'} found
            </span>
          </div>

          {/* Selector de vista */}
          <div className="view-toggle">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              title="Grid view"
            >
              ⊞
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              title="List view"
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* Filtros activos (chips) */}
      {hasActiveFilters && (
        <div className="active-filters">
          <span className="active-filters-label">Active filters:</span>
          <div className="filter-chips">
            {filters.category !== 'All Categories' && (
              <FilterChip
                label={`Category: ${filters.category}`}
                onRemove={() => onFilterChange('category', 'All Categories')}
              />
            )}
            {filters.priceRange !== 'all' && (
              <FilterChip
                label={`Price: ${getPriceRangeLabel(filters.priceRange)}`}
                onRemove={() => onFilterChange('priceRange', 'all')}
              />
            )}
            {filters.searchTerm && (
              <FilterChip
                label={`Search: "${filters.searchTerm}"`}
                onRemove={() => onFilterChange('searchTerm', '')}
              />
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .filter-bar {
          background: white;
          border-radius: 12px;
          padding: 25px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          margin-bottom: 30px;
        }

        .filter-row {
          display: grid;
          grid-template-columns: 1fr auto auto;
          gap: 30px;
          align-items: center;
        }

        .search-section {
          display: flex;
          align-items: center;
        }

        .search-input-container {
          position: relative;
          width: 100%;
          max-width: 300px;
        }

        .search-input {
          width: 100%;
          padding: 12px 40px 12px 16px;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #667eea;
        }

        .search-icon {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #666;
          pointer-events: none;
        }

        .filters-section {
          display: flex;
          gap: 20px;
          align-items: center;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .filter-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
        }

        .filter-select {
          padding: 10px 12px;
          border: 2px solid #e1e5e9;
          border-radius: 6px;
          font-size: 0.875rem;
          background: white;
          cursor: pointer;
          transition: border-color 0.3s ease;
          min-width: 140px;
        }

        .filter-select:focus {
          outline: none;
          border-color: #667eea;
        }

        .clear-filters-btn {
          background: #ef4444;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 6px;
          font-size: 0.875rem;
          cursor: pointer;
          transition: background 0.3s ease;
          white-space: nowrap;
        }

        .clear-filters-btn:hover {
          background: #dc2626;
        }

        .view-section {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .product-count {
          font-size: 0.875rem;
          color: #666;
          white-space: nowrap;
        }

        .count-text {
          font-weight: 500;
        }

        .view-toggle {
          display: flex;
          gap: 4px;
        }

        .view-btn {
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          padding: 8px 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1.1rem;
        }

        .view-btn:first-child {
          border-radius: 6px 0 0 6px;
        }

        .view-btn:last-child {
          border-radius: 0 6px 6px 0;
        }

        .view-btn.active {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }

        .view-btn:hover:not(.active) {
          background: #e5e7eb;
        }

        .active-filters {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e1e5e9;
          display: flex;
          align-items: center;
          gap: 15px;
          flex-wrap: wrap;
        }

        .active-filters-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
        }

        .filter-chips {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        @media (max-width: 768px) {
          .filter-row {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .filters-section {
            flex-wrap: wrap;
            justify-content: space-between;
          }

          .view-section {
            justify-content: space-between;
            width: 100%;
          }

          .search-input-container {
            max-width: none;
          }
        }
      `}</style>
    </div>
  );
};

// Componente para chips de filtros activos
const FilterChip = ({ label, onRemove }) => (
  <div className="filter-chip">
    <span className="chip-label">{label}</span>
    <button onClick={onRemove} className="chip-remove" title="Remove filter">
      ×
    </button>

    <style jsx>{`
      .filter-chip {
        display: flex;
        align-items: center;
        background: #667eea;
        color: white;
        border-radius: 20px;
        padding: 6px 12px;
        font-size: 0.875rem;
        gap: 8px;
      }

      .chip-label {
        font-weight: 500;
      }

      .chip-remove {
        background: rgba(255, 255, 255, 0.3);
        border: none;
        color: white;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 1.2rem;
        line-height: 1;
        transition: background 0.3s ease;
      }

      .chip-remove:hover {
        background: rgba(255, 255, 255, 0.5);
      }
    `}</style>
  </div>
);

// Helper function para obtener etiquetas de rango de precios
const getPriceRangeLabel = (range) => {
  switch (range) {
    case 'under-25': return 'Under $25';
    case '25-50': return '$25 - $50';
    case '50-100': return '$50 - $100';
    case 'over-100': return 'Over $100';
    default: return 'All Prices';
  }
};

export default FilterBar;