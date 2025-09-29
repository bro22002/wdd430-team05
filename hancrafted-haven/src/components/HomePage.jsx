// src/components/HomePage.jsx
// HomePage actualizada con autenticación real de Supabase

import React, { useState, useEffect } from 'react';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/product/ProductCard';
import FilterBar from './FilterBar';
import AuthModal from './auth/AuthModal';
import { LoadingSpinner, ErrorMessage } from './UtilityComponents';
import { getCurrentUser, signOut } from '../services/authService';

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

  // useState: Estados para manejar el modal de autenticación
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' o 'register'

  // useState: Estado de usuario autenticado con Supabase
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // useEffect: Verificar usuario autenticado al cargar la aplicación
  useEffect(() => {
    checkAuthenticatedUser();
  }, []);

  // checkAuthenticatedUser: Verifica si hay un usuario autenticado
  const checkAuthenticatedUser = async () => {
    try {
      setAuthLoading(true);
      const result = await getCurrentUser();
      
      if (result.success && result.user) {
        setUser(result.user);
        setProfile(result.profile);
        console.log('User authenticated on load:', result.user);
      } else {
        console.log('No authenticated user found');
      }
    } catch (error) {
      console.error('Error checking authenticated user:', error);
    } finally {
      setAuthLoading(false);
    }
  };

  // openLoginModal: Abre el modal en modo login
  const openLoginModal = () => {
    setAuthMode('login');
    setIsAuthModalOpen(true);
  };

  // openRegisterModal: Abre el modal en modo registro
  const openRegisterModal = () => {
    setAuthMode('register');
    setIsAuthModalOpen(true);
  };

  // closeAuthModal: Cierra el modal de autenticación
  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // handleAuthSuccess: Maneja cuando login/registro es exitoso
  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setProfile(userData.profile);
    console.log('Authentication successful:', userData);
    
    // Opcional: mostrar notificación de bienvenida
    // showWelcomeNotification(userData.firstName);
  };

  // handleLogout: Maneja el cierre de sesión real
  const handleLogout = async () => {
    try {
      setAuthLoading(true);
      const result = await signOut();
      
      if (result.success) {
        setUser(null);
        setProfile(null);
        console.log('Logout successful');
        
        // Opcional: mostrar notificación de despedida
        // showLogoutNotification();
      } else {
        console.error('Logout failed:', result.error);
        // Opcional: mostrar error al usuario
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAuthLoading(false);
    }
  };

  // getUserDisplayName: Obtiene el nombre a mostrar del usuario
  const getUserDisplayName = () => {
    if (profile?.first_name) {
      return profile.first_name;
    }
    if (user?.user_metadata?.first_name) {
      return user.user_metadata.first_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  // handleError: Si hay error, mostrar componente de error
  if (error) {
    return <ErrorMessage message={error} />;
  }

  // Mostrar loading inicial mientras verifica autenticación
  if (authLoading) {
    return <LoadingSpinner message="Loading application..." />;
  }

  return (
    <div className="homepage">
      {/* Header de la página con navegación */}
      <header className="hero-section">
        <div className="hero-nav">
          <div className="nav-brand">
            <h1 className="brand-title">Handcrafted Haven</h1>
          </div>
          
          {/* Navegación de autenticación */}
          <div className="nav-auth">
            {user ? (
              // Usuario autenticado
              <div className="user-menu">
                <div className="user-info">
                  <span className="welcome-text">
                    Welcome, {getUserDisplayName()}!
                  </span>
                  {profile?.is_artisan && (
                    <span className="artisan-badge">
                      {profile.artisan_verified ? '✓ Verified Artisan' : 'Artisan'}
                    </span>
                  )}
                </div>
                <button 
                  onClick={handleLogout}
                  className="btn btn-secondary btn-small"
                  disabled={authLoading}
                >
                  {authLoading ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            ) : (
              // Usuario no autenticado
              <div className="auth-buttons">
                <button 
                  onClick={openLoginModal}
                  className="btn btn-secondary btn-small"
                >
                  Sign In
                </button>
                <button 
                  onClick={openRegisterModal}
                  className="btn btn-primary btn-small"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="hero-content">
          <h2 className="hero-title">Discover Handcrafted Items</h2>
          <p className="hero-subtitle">
            Explore unique, handmade products from talented artisans around the world.
            Each piece tells a story of craftsmanship and creativity.
          </p>
          
          {!user && (
            <div className="hero-cta">
              <button 
                onClick={openRegisterModal}
                className="btn btn-primary btn-large"
              >
                Join Our Community
              </button>
            </div>
          )}

          {user && profile?.is_artisan && (
            <div className="hero-cta">
              <button 
                className="btn btn-primary btn-large"
                onClick={() => console.log('Navigate to artisan dashboard')}
              >
                Manage Your Products
              </button>
            </div>
          )}

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

      {/* Modal de Autenticación */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        onAuthSuccess={handleAuthSuccess}
        initialMode={authMode}
      />

      {/* Estilos CSS con styled-jsx */}
      <style jsx>{`
        .homepage {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }

        .hero-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px 20px 80px 20px;
        }

        .hero-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
          margin-bottom: 40px;
        }

        .brand-title {
          font-family: var(--font-heading);
          font-size: var(--text-2xl);
          margin: 0;
          color: white;
        }

        .nav-auth {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }

        .auth-buttons {
          display: flex;
          gap: var(--spacing-sm);
        }

        .user-menu {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }

        .user-info {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }

        .welcome-text {
          font-weight: var(--font-medium);
          font-size: var(--text-base);
        }

        .artisan-badge {
          font-size: var(--text-xs);
          background: rgba(255, 255, 255, 0.2);
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--radius-sm);
          color: white;
          font-weight: var(--font-medium);
        }

        .btn-small {
          padding: var(--spacing-sm) var(--spacing-md);
          font-size: var(--text-sm);
          white-space: nowrap;
        }

        .btn-large {
          padding: var(--spacing-md) var(--spacing-xl);
          font-size: var(--text-lg);
          font-weight: var(--font-semibold);
        }

        .hero-content {
          max-width: 800px;
          margin: 0 auto;
          text-align: center;
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

        .hero-cta {
          margin-bottom: 40px;
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
          .hero-nav {
            flex-direction: column;
            gap: var(--spacing-lg);
            align-items: center;
          }

          .brand-title {
            font-size: var(--text-xl);
          }

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

          .auth-buttons {
            flex-direction: column;
            width: 100%;
          }

          .user-menu {
            flex-direction: column;
            gap: var(--spacing-sm);
            align-items: center;
          }

          .user-info {
            align-items: center;
            text-align: center;
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

export default HomePage;