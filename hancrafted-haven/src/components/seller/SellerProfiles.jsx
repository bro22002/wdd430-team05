// src/components/seller/SellerProfiles.jsx
// Componente para mostrar la lista de perfiles de vendedores/artesanos
// Incluye búsqueda, filtros, y acceso al formulario de contacto

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import ContactSellerModal from './ContactSellerModal';
import { LoadingSpinner, ErrorMessage } from '../UtilityComponents';

/**
 * SellerProfiles: Muestra grid de perfiles de vendedores
 * 
 * Funcionalidades:
 * - Obtiene todos los vendedores verificados
 * - Búsqueda por nombre o tienda
 * - Modal de contacto para cada vendedor
 * - Vista de estadísticas de cada vendedor
 * 
 * @param {Object} currentUser - Usuario actual (opcional)
 */
const SellerProfiles = ({ currentUser }) => {

  // ============================================
  // 1. ESTADOS
  // ============================================
  
  // useState: Array de vendedores
  const [sellers, setSellers] = useState([]);

  // useState: Vendedores filtrados (búsqueda)
  const [filteredSellers, setFilteredSellers] = useState([]);

  // useState: Estado de carga
  const [loading, setLoading] = useState(true);

  // useState: Errores
  const [error, setError] = useState(null);

  // useState: Término de búsqueda
  const [searchTerm, setSearchTerm] = useState('');

  // useState: Modal de contacto
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);

  // ============================================
  // 2. EFFECTS
  // ============================================
  
  /**
   * useEffect: Cargar vendedores al montar el componente
   */
  useEffect(() => {
    fetchSellers();
  }, []);

  /**
   * useEffect: Aplicar filtro de búsqueda
   * Se ejecuta cada vez que cambia searchTerm o sellers
   */
  useEffect(() => {
    applySearchFilter();
  }, [searchTerm, sellers]);

  // ============================================
  // 3. FUNCIONES DE DATOS
  // ============================================
  
  /**
   * fetchSellers: Obtiene todos los vendedores de Supabase
   * 
   * Consulta:
   * - Filtra por role = 'seller' o 'artisan'
   * - Solo usuarios activos (is_active = true)
   * - Ordena por verificados primero, luego por nombre
   */
  const fetchSellers = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('👥 Fetching sellers...');

      // Consulta a Supabase
      // in('role', ['seller', 'artisan']): obtiene ambos roles
      // eq('is_active', true): solo usuarios activos
      const { data, error: fetchError } = await supabase
        .from('user_profiles')
        .select(`
          id,
          full_name,
          username,
          bio,
          location,
          profile_image_url,
          role,
          shop_name,
          shop_description,
          instagram_handle,
          facebook_url,
          is_verified,
          created_at
        `)
        .in('role', ['seller', 'artisan'])
        .eq('is_active', true)
        .order('is_verified', { ascending: false })
        .order('full_name', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      // Obtener estadísticas de cada vendedor (conteo de productos)
      const sellersWithStats = await Promise.all(
        (data || []).map(async (seller) => {
          const { count } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('artisan_id', seller.id);

          return {
            ...seller,
            productCount: count || 0
          };
        })
      );

      setSellers(sellersWithStats);
      console.log('✅ Sellers loaded:', sellersWithStats.length);

    } catch (err) {
      console.error('❌ Error fetching sellers:', err);
      setError('Failed to load seller profiles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * applySearchFilter: Filtra vendedores según el término de búsqueda
   * 
   * Busca en:
   * - full_name: nombre completo
   * - shop_name: nombre de la tienda
   * - location: ubicación
   */
  const applySearchFilter = () => {
    if (!searchTerm.trim()) {
      // Si no hay búsqueda, mostrar todos
      setFilteredSellers(sellers);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    
    const filtered = sellers.filter(seller => {
      const nameMatch = seller.full_name?.toLowerCase().includes(searchLower);
      const shopMatch = seller.shop_name?.toLowerCase().includes(searchLower);
      const locationMatch = seller.location?.toLowerCase().includes(searchLower);
      
      return nameMatch || shopMatch || locationMatch;
    });

    setFilteredSellers(filtered);
  };

  // ============================================
  // 4. FUNCIONES DE UI
  // ============================================
  
  /**
   * handleContactSeller: Abre modal de contacto para un vendedor
   * 
   * @param {Object} seller - Vendedor a contactar
   */
  const handleContactSeller = (seller) => {
    setSelectedSeller(seller);
    setIsContactModalOpen(true);
  };

  /**
   * closeContactModal: Cierra el modal de contacto
   */
  const closeContactModal = () => {
    setIsContactModalOpen(false);
    setSelectedSeller(null);
  };

  /**
   * handleSearchChange: Maneja cambios en el campo de búsqueda
   * 
   * @param {Event} e - Evento del input
   */
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  /**
   * getInitials: Obtiene iniciales del nombre para avatar placeholder
   * 
   * @param {string} name - Nombre completo
   * @returns {string} - Iniciales (ej: "JD")
   */
  const getInitials = (name) => {
    if (!name) return '?';
    const names = name.split(' ');
    return names.map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase();
  };

  // ============================================
  // 5. RENDERIZADO CONDICIONAL
  // ============================================
  
  // Estado de carga
  if (loading) {
    return <LoadingSpinner message="Loading seller profiles..." />;
  }

  // Estado de error
  if (error) {
    return <ErrorMessage message={error} onRetry={fetchSellers} />;
  }

  // Sin vendedores
  if (sellers.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🏪</div>
        <h3>No Seller Profiles Yet</h3>
        <p>There are no artisan profiles available at the moment.</p>
      </div>
    );
  }

  // ============================================
  // 6. RENDERIZADO PRINCIPAL
  // ============================================

  return (
    <div className="seller-profiles-container">
      
      {/* Header con búsqueda */}
      <div className="profiles-header">
        <div className="header-content">
          <h2 className="heading-primary">Meet Our Artisans</h2>
          <p className="text-body text-muted">
            Connect with talented creators and discover their unique handcrafted items
          </p>
        </div>

        {/* Barra de búsqueda */}
        <div className="search-section">
          <div className="search-container">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by name, shop, or location..."
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          
          <div className="results-count">
            Showing {filteredSellers.length} of {sellers.length} artisans
          </div>
        </div>
      </div>

      {/* Grid de vendedores */}
      {filteredSellers.length === 0 ? (
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <h3>No Results Found</h3>
          <p>Try adjusting your search terms</p>
        </div>
      ) : (
        <div className="sellers-grid">
          {filteredSellers.map(seller => (
            <div key={seller.id} className="seller-card">
              
              {/* Avatar */}
              <div className="seller-avatar">
                {seller.profile_image_url ? (
                  <img 
                    src={seller.profile_image_url} 
                    alt={seller.full_name}
                    className="avatar-image"
                  />
                ) : (
                  <div className="avatar-placeholder">
                    <span className="avatar-initials">
                      {getInitials(seller.full_name)}
                    </span>
                  </div>
                )}
                
                {/* Badge de verificado */}
                {seller.is_verified && (
                  <div className="verified-badge" title="Verified Artisan">
                    ✓
                  </div>
                )}
              </div>

              {/* Información del vendedor */}
              <div className="seller-info">
                <h3 className="seller-name">{seller.full_name}</h3>
                
                {seller.shop_name && (
                  <p className="shop-name">{seller.shop_name}</p>
                )}

                {seller.location && (
                  <p className="seller-location">
                    📍 {seller.location}
                  </p>
                )}

                {seller.shop_description && (
                  <p className="seller-bio">
                    {seller.shop_description.length > 100 
                      ? `${seller.shop_description.substring(0, 100)}...` 
                      : seller.shop_description
                    }
                  </p>
                )}

                {/* Estadísticas */}
                <div className="seller-stats">
                  <div className="stat-item">
                    <span className="stat-icon">📦</span>
                    <span className="stat-value">{seller.productCount}</span>
                    <span className="stat-label">Products</span>
                  </div>
                </div>

                {/* Redes sociales (si existen) */}
                {(seller.instagram_handle || seller.facebook_url) && (
                  <div className="social-links">
                    {seller.instagram_handle && (
                      <a 
                        href={`https://instagram.com/${seller.instagram_handle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-link"
                        title="Instagram"
                      >
                        📷
                      </a>
                    )}
                    {seller.facebook_url && (
                      <a 
                        href={seller.facebook_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-link"
                        title="Facebook"
                      >
                        👥
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Botón de contacto */}
              <button
                onClick={() => handleContactSeller(seller)}
                className="btn-contact"
              >
                ✉️ Contact Seller
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal de contacto */}
      <ContactSellerModal
        isOpen={isContactModalOpen}
        onClose={closeContactModal}
        seller={selectedSeller}
        currentUser={currentUser}
      />

      {/* Estilos CSS */}
      <style jsx>{`
        .seller-profiles-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: var(--spacing-2xl) var(--spacing-lg);
        }

        .profiles-header {
          margin-bottom: var(--spacing-2xl);
        }

        .header-content {
          text-align: center;
          margin-bottom: var(--spacing-xl);
        }

        .search-section {
          max-width: 600px;
          margin: 0 auto;
        }

        .search-container {
          position: relative;
          margin-bottom: var(--spacing-sm);
        }

        .search-input {
          width: 100%;
          padding: var(--spacing-md) var(--spacing-xl);
          padding-right: 50px;
          border: 2px solid var(--color-accent);
          border-radius: var(--radius-lg);
          font-size: var(--text-base);
          transition: border-color 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--color-primary);
        }

        .search-icon {
          position: absolute;
          right: var(--spacing-md);
          top: 50%;
          transform: translateY(-50%);
          font-size: var(--text-xl);
          pointer-events: none;
        }

        .results-count {
          text-align: center;
          font-size: var(--text-sm);
          color: var(--color-muted);
          font-weight: var(--font-medium);
        }

        .sellers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: var(--spacing-xl);
          margin-top: var(--spacing-2xl);
        }

        .seller-card {
          background: var(--color-white);
          border-radius: var(--radius-xl);
          padding: var(--spacing-xl);
          box-shadow: var(--shadow-md);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          transition: all 0.3s ease;
        }

        .seller-card:hover {
          box-shadow: var(--shadow-xl);
          transform: translateY(-4px);
        }

        .seller-avatar {
          position: relative;
          width: 100px;
          height: 100px;
          margin-bottom: var(--spacing-lg);
        }

        .avatar-image {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid var(--color-accent);
        }

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid var(--color-accent);
        }

        .avatar-initials {
          font-size: var(--text-2xl);
          font-weight: var(--font-bold);
          color: var(--color-white);
        }

        .verified-badge {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 28px;
          height: 28px;
          background: var(--color-success);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-white);
          font-weight: var(--font-bold);
          border: 2px solid var(--color-white);
          font-size: var(--text-sm);
        }

        .seller-info {
          flex: 1;
          width: 100%;
          margin-bottom: var(--spacing-lg);
        }

        .seller-name {
          font-family: var(--font-body);
          font-weight: var(--font-bold);
          font-size: var(--text-xl);
          color: var(--color-dark);
          margin: 0 0 var(--spacing-xs) 0;
        }

        .shop-name {
          font-size: var(--text-base);
          color: var(--color-primary);
          font-weight: var(--font-semibold);
          margin: 0 0 var(--spacing-sm) 0;
        }

        .seller-location {
          font-size: var(--text-sm);
          color: var(--color-muted);
          margin: 0 0 var(--spacing-md) 0;
        }

        .seller-bio {
          font-size: var(--text-sm);
          color: var(--color-dark);
          line-height: 1.6;
          margin: 0 0 var(--spacing-md) 0;
        }

        .seller-stats {
          display: flex;
          justify-content: center;
          gap: var(--spacing-lg);
          padding: var(--spacing-md) 0;
          border-top: 1px solid var(--color-accent-light);
          border-bottom: 1px solid var(--color-accent-light);
          margin-bottom: var(--spacing-md);
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-xs);
        }

        .stat-icon {
          font-size: var(--text-lg);
        }

        .stat-value {
          font-size: var(--text-xl);
          font-weight: var(--font-bold);
          color: var(--color-primary);
        }

        .stat-label {
          font-size: var(--text-xs);
          color: var(--color-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .social-links {
          display: flex;
          justify-content: center;
          gap: var(--spacing-sm);
          margin-top: var(--spacing-md);
        }

        .social-link {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-accent-light);
          border-radius: 50%;
          font-size: var(--text-lg);
          transition: all 0.3s ease;
          text-decoration: none;
        }

        .social-link:hover {
          background: var(--color-primary);
          transform: scale(1.1);
        }

        .btn-contact {
          width: 100%;
          padding: var(--spacing-md);
          background: var(--color-primary);
          color: var(--color-white);
          border: none;
          border-radius: var(--radius-md);
          font-family: var(--font-body);
          font-weight: var(--font-semibold);
          font-size: var(--text-base);
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm);
        }

        .btn-contact:hover {
          background: var(--color-secondary);
          transform: scale(1.02);
        }

        .empty-state,
        .no-results {
          text-align: center;
          padding: var(--spacing-3xl);
        }

        .empty-icon,
        .no-results-icon {
          font-size: 4rem;
          margin-bottom: var(--spacing-lg);
        }

        .empty-state h3,
        .no-results h3 {
          font-size: var(--text-2xl);
          color: var(--color-dark);
          margin: 0 0 var(--spacing-sm) 0;
        }

        .empty-state p,
        .no-results p {
          color: var(--color-muted);
          margin: 0;
        }

        @media (max-width: 768px) {
          .seller-profiles-container {
            padding: var(--spacing-lg) var(--spacing-md);
          }

          .sellers-grid {
            grid-template-columns: 1fr;
            gap: var(--spacing-lg);
          }
        }
      `}</style>
    </div>
  );
};

export default SellerProfiles;