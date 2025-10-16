// src/app/product/[id]/page.jsx
// Página de detalles del producto con pestañas, calificaciones y comentarios

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { LoadingSpinner, ErrorMessage } from '../../../components/UtilityComponents';
import ProductDetailTabs from '../../../components/product/ProductDetailTabs';
import ProductRating from '../../../components/product/ProductRating';
import { useAuthState } from '../../../hooks/useAuth';

/**
 * ProductDetailPage: Página completa de detalles del producto
 * 
 * Funcionalidades:
 * - Muestra información detallada del producto
 * - Sistema de pestañas para organizar el contenido
 * - Sistema de calificaciones con estrellas
 * - Sección de comentarios y reviews
 * - Información del vendedor
 * - Galería de imágenes (si hay múltiples)
 */
const ProductDetailPage = () => {
  
  // ============================================
  // 1. HOOKS Y ESTADOS
  // ============================================
  
  const params = useParams();
  const router = useRouter();
  const { user, profile } = useAuthState();
  const productId = params.id;

  // useState: Datos del producto
  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  
  // useState: Estados de carga y error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // useState: Reviews del producto
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  
  // useState: Pestaña activa
  const [activeTab, setActiveTab] = useState('description');

  // ============================================
  // 2. EFECTOS
  // ============================================
  
  /**
   * useEffect: Cargar datos del producto al montar
   */
  useEffect(() => {
    if (productId) {
      fetchProductData();
    }
  }, [productId]);

  // ============================================
  // 3. FUNCIONES DE DATOS
  // ============================================
  
  /**
   * fetchProductData: Obtiene toda la información del producto
   * Incluye: producto, vendedor, reviews y estadísticas
   */
  const fetchProductData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Fetching product data:', productId);

      // PASO 1: Obtener datos del producto
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select(`
          *,
          artisan:user_profiles!artisan_id (
            id,
            full_name,
            shop_name,
            profile_image_url,
            bio,
            location,
            is_verified
          )
        `)
        .eq('id', productId)
        .single();

      if (productError) {
        throw productError;
      }

      if (!productData) {
        throw new Error('Product not found');
      }

      setProduct(productData);
      setSeller(productData.artisan);

      // PASO 2: Obtener reviews del producto (simuladas por ahora)
      // TODO: Implementar tabla de reviews real
      const mockReviews = generateMockReviews(productId);
      setReviews(mockReviews);
      
      // PASO 3: Calcular estadísticas de reviews
      const stats = calculateReviewStats(mockReviews);
      setReviewStats(stats);

      console.log('✅ Product data loaded:', productData);

    } catch (err) {
      console.error('❌ Error loading product:', err);
      setError(err.message || 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  /**
   * generateMockReviews: Genera reviews simuladas
   * TODO: Reemplazar con datos reales de la base de datos
   */
  const generateMockReviews = (productId) => {
    return [
    {
      id: 1,
      user_name: 'Maria Gonzalez',
      rating: 5,
      comment: 'Excellent product, very good quality. The craftsmanship shows in every detail.',
      created_at: '2024-12-10T10:00:00Z',
      verified_purchase: true
    },
    {
      id: 2,
      user_name: 'Carlos Rivera',
      rating: 4,
      comment: 'Very good product, it arrived in perfect condition. Recommended.',
      created_at: '2024-12-08T15:30:00Z',
      verified_purchase: true
    },
    {
      id: 3,
      user_name: 'Ana Lopez',
      rating: 5,
      comment: 'It exceeded my expectations. The handcrafted work is impressive.',
      created_at: '2024-12-05T09:45:00Z',
      verified_purchase: false
    }

    ];
  };

  /**
   * calculateReviewStats: Calcula estadísticas de las reviews
   */
  const calculateReviewStats = (reviews) => {
    if (!reviews || reviews.length === 0) {
      return {
        average: 0,
        total: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }

    const total = reviews.length;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const average = (sum / total).toFixed(1);

    // Distribución de calificaciones
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(review => {
      distribution[review.rating]++;
    });

    return { average: parseFloat(average), total, distribution };
  };

  /**
   * handleAddToCart: Agrega producto al carrito
   * TODO: Implementar funcionalidad real del carrito
   */
  const handleAddToCart = () => {
    console.log('🛒 Adding to cart:', product.title);
    // Aquí iría la lógica real del carrito
    alert('Producto agregado al carrito (funcionalidad pendiente)');
  };

  /**
   * handleContactSeller: Contacta al vendedor
   */
  const handleContactSeller = () => {
    console.log('📞 Contacting seller:', seller.shop_name);
    // TODO: Abrir modal de contacto o redirigir
    alert('Funcionalidad de contacto pendiente');
  };

  /**
   * generateMaterialsInfo: Generates detailed materials information in English
   * Based on the product category, returns specific materials and techniques
   * @param {string} category - Product category
   * @returns {Array} - Array of material descriptions
   */
  const generateMaterialsInfo = (category) => {
    const materialsByCategory = {
      'Pottery & Ceramics': [
        'High-grade natural clay sourced from local quarries',
        'Lead-free food-safe glazes with FDA certification',
        'Fired at 2192°F (1200°C) for maximum durability and strength',
        'Hand-finished with organic wax coating for protection',
        'Natural iron oxide pigments for authentic coloring',
        'Traditional wheel-throwing and hand-building techniques'
      ],
      'Jewelry & Accessories': [
        'Sterling silver (925) with anti-tarnish treatment',
        'Ethically sourced natural gemstones and pearls',
        'Hypoallergenic materials suitable for sensitive skin',
        'Hand-forged clasps and findings for durability',
        'Recycled precious metals when possible',
        'Traditional metalsmithing and wire-wrapping techniques'
      ],
      'Textiles & Clothing': [
        'Organic cotton or premium merino wool fibers',
        'Natural plant-based dyes from local botanicals',
        'Hand-spun threads for unique texture and character',
        'Pre-shrunk and colorfast treatment for longevity',
        'Sustainable fiber sourcing with eco-certifications',
        'Traditional weaving and embroidery methods'
      ],
      'Woodwork': [
        'Sustainably harvested hardwood from certified forests',
        'Food-grade mineral oil finish safe for kitchen use',
        'Hand-sanded to 400-grit smoothness for perfect feel',
        'Traditional joinery techniques without metal fasteners',
        'Locally sourced timber to reduce environmental impact',
        'Hand-carved details using century-old woodworking tools'
      ],
      'Leather Goods': [
        'Full-grain vegetable-tanned leather from ethical sources',
        'Natural waxes and oils for conditioning and protection',
        'Hand-stitched with waxed linen thread for durability',
        'Brass or stainless steel hardware with antique finishing',
        'Traditional tanning methods avoiding harmful chemicals',
        'Hand-tooled patterns using vintage leather stamps'
      ],
      'Glass Art': [
        'Lead-free borosilicate glass for heat resistance',
        'Recycled glass content for environmental sustainability',
        'Hand-blown using traditional furnace techniques',
        'Annealed in controlled cooling process for strength',
        'Natural metal oxides for vibrant color development',
        'Flame-working and kiln-forming artistic methods'
      ]
    };

    return materialsByCategory[category] || [
      'Premium quality materials sourced from ethical suppliers',
      'Handcrafted using time-honored traditional techniques',
      'Durable construction designed for long-lasting use',
      'Environmentally conscious and sustainable practices',
      'Quality control tested for safety and durability',
      'Artisan-grade finishing with attention to detail'
    ];
  };

  /**
   * generateCareInstructions: Generates care instructions in English
   * @param {string} category - Product category
   * @returns {Array} - Array of care instruction strings
   */
  const generateCareInstructions = (category) => {
    const careByCategory = {
      'Pottery & Ceramics': [
        'Hand wash with mild soap and warm water for best results',
        'Avoid sudden temperature changes to prevent cracking',
        'Microwave and dishwasher safe unless otherwise noted',
        'Store in dry location to prevent moisture damage'
      ],
      'Jewelry & Accessories': [
        'Clean gently with soft cloth and mild jewelry cleaner',
        'Store in dry place away from direct sunlight',
        'Remove before swimming, exercising, or showering',
        'Polish regularly to maintain shine and prevent tarnishing'
      ],
      'Textiles & Clothing': [
        'Machine wash cold on gentle cycle with like colors',
        'Air dry flat to maintain shape and prevent shrinking',
        'Iron on low heat setting if needed, avoid direct heat on prints',
        'Store folded or hung in cool, dry place'
      ],
      'Woodwork': [
        'Clean with damp cloth and mild soap when necessary',
        'Apply food-grade oil monthly to maintain finish',
        'Avoid soaking in water or placing in dishwasher',
        'Store in dry environment away from extreme temperatures'
      ]
    };

    return careByCategory[category] || [
      'Clean gently with appropriate materials for the item type',
      'Store in cool, dry place away from direct sunlight',
      'Handle with care to preserve handcrafted details',
      'Follow specific care instructions included with purchase'
    ];
  };

  // ============================================
  // 4. RENDERIZADO CONDICIONAL
  // ============================================
  
  if (loading) {
    return (
      <div className="min-h-screen">
        <LoadingSpinner message="Cargando detalles del producto..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <ErrorMessage 
          message={error} 
          onRetry={() => router.push('/')}
        />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Producto no encontrado
          </h2>
          <button 
            onClick={() => router.push('/')}
            className="btn btn-primary"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const materials = generateMaterialsInfo(product.category);

  // ============================================
  // 5. RENDERIZADO PRINCIPAL
  // ============================================

  return (
    <div className="product-detail-page">
      
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="container">
          <nav className="breadcrumb-nav">
            <button onClick={() => router.push('/')} className="breadcrumb-link">
              Inicio
            </button>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-category">{product.category}</span>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current">{product.title}</span>
          </nav>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container">
        <div className="product-layout">
          
          {/* Sección izquierda: Imagen */}
          <div className="product-image-section">
            <div className="main-image">
              <img 
                src={product.image_url} 
                alt={product.title}
                className="product-image"
                onError={(e) => {
                  e.target.src = '/images/placeholder-product.jpg';
                }}
              />
            </div>
          </div>

          {/* Sección derecha: Información */}
          <div className="product-info-section">
            
            {/* Header del producto */}
            <div className="product-header">
              <h1 className="product-title">{product.title}</h1>
              <p className="product-category">{product.category}</p>
              
              {/* Rating y reviews */}
              <div className="product-rating">
                <ProductRating 
                  rating={reviewStats?.average || 0}
                  reviewCount={reviewStats?.total || 0}
                  showCount={true}
                />
              </div>
            </div>

            {/* Precio y stock */}
            <div className="product-pricing">
              <div className="price-section">
                <span className="current-price">${product.price.toFixed(2)}</span>
              </div>
              
              <div className="stock-section">
                <span className={`stock-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                  {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
                </span>
              </div>
            </div>

            {/* Información del vendedor */}
            {seller && (
              <div className="seller-info">
                <div className="seller-avatar">
                  {seller.profile_image_url ? (
                    <img src={seller.profile_image_url} alt={seller.full_name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {seller.full_name?.charAt(0) || '?'}
                    </div>
                  )}
                </div>
                <div className="seller-details">
                  <h3 className="seller-name">{seller.shop_name || seller.full_name}</h3>
                  <p className="seller-location">{seller.location}</p>
                  {seller.is_verified && (
                    <span className="verified-badge">✓ Verificado</span>
                  )}
                </div>
                <button 
                  onClick={handleContactSeller}
                  className="btn-contact-seller"
                >
                  Contact to Seller
                </button>
              </div>
            )}

            {/* Botones de acción */}
            <div className="action-buttons">
              <button 
                onClick={handleAddToCart}
                className="btn btn-primary btn-large"
                disabled={product.stock === 0}
              >
                {product.stock === 0 ? 'Agotado' : 'Agregar al Carrito'}
              </button>
              
              <button className="btn btn-secondary btn-large">
                ♡ Add to Favorites
              </button>
            </div>
          </div>
        </div>

        {/* Pestañas de información detallada */}
        <ProductDetailTabs
          product={product}
          materials={materials}
          reviews={reviews}
          reviewStats={reviewStats}
          currentUser={user}
          onReviewAdded={fetchProductData}
        />
      </div>

      {/* Estilos CSS */}
      <style jsx>{`
        .product-detail-page {
          min-height: 100vh;
          background: var(--color-background);
          padding-bottom: var(--spacing-3xl);
        }

        .breadcrumb {
          background: var(--color-white);
          border-bottom: 1px solid var(--color-accent-light);
          padding: var(--spacing-md) 0;
        }

        .breadcrumb-nav {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          font-size: var(--text-sm);
        }

        .breadcrumb-link {
          background: none;
          border: none;
          color: var(--color-primary);
          cursor: pointer;
          text-decoration: underline;
        }

        .breadcrumb-separator {
          color: var(--color-muted);
        }

        .breadcrumb-category {
          color: var(--color-muted);
        }

        .breadcrumb-current {
          color: var(--color-dark);
          font-weight: var(--font-medium);
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 var(--spacing-lg);
        }

        .product-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-3xl);
          margin: var(--spacing-2xl) 0;
        }

        .product-image-section {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }

        .main-image {
          width: 100%;
          aspect-ratio: 1;
          border-radius: var(--radius-xl);
          overflow: hidden;
          box-shadow: var(--shadow-lg);
        }

        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .product-info-section {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xl);
        }

        .product-header {
          border-bottom: 1px solid var(--color-accent-light);
          padding-bottom: var(--spacing-lg);
        }

        .product-title {
          font-family: var(--font-heading);
          font-size: var(--text-4xl);
          font-weight: var(--font-bold);
          color: var(--color-dark);
          margin: 0 0 var(--spacing-sm) 0;
        }

        .product-category {
          font-size: var(--text-base);
          color: var(--color-secondary);
          font-weight: var(--font-medium);
          margin: 0 0 var(--spacing-md) 0;
        }

        .product-pricing {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
          padding: var(--spacing-lg);
          background: var(--color-white);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
        }

        .current-price {
          font-size: var(--text-4xl);
          font-weight: var(--font-bold);
          color: var(--color-primary);
        }

        .stock-badge {
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--radius-sm);
          font-size: var(--text-sm);
          font-weight: var(--font-medium);
        }

        .stock-badge.in-stock {
          background: rgba(34, 197, 94, 0.1);
          color: var(--color-success);
        }

        .stock-badge.out-of-stock {
          background: rgba(239, 68, 68, 0.1);
          color: var(--color-error);
        }

        .seller-info {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-lg);
          background: var(--color-white);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
        }

        .seller-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
        }

        .seller-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          background: var(--color-primary);
          color: var(--color-white);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--text-xl);
          font-weight: var(--font-bold);
        }

        .seller-details {
          flex: 1;
        }

        .seller-name {
          font-size: var(--text-lg);
          font-weight: var(--font-semibold);
          color: var(--color-dark);
          margin: 0 0 var(--spacing-xs) 0;
        }

        .seller-location {
          font-size: var(--text-sm);
          color: var(--color-muted);
          margin: 0;
        }

        .verified-badge {
          font-size: var(--text-xs);
          color: var(--color-success);
          font-weight: var(--font-medium);
        }

        .btn-contact-seller {
          padding: var(--spacing-sm) var(--spacing-md);
          background: var(--color-secondary);
          color: var(--color-white);
          border: none;
          border-radius: var(--radius-md);
          font-weight: var(--font-medium);
          cursor: pointer;
          transition: background 0.3s ease;
        }

        .btn-contact-seller:hover {
          background: var(--color-primary);
        }

        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
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

        .btn-large {
          padding: var(--spacing-lg) var(--spacing-xl);
          font-size: var(--text-lg);
          font-weight: var(--font-semibold);
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
          .product-layout {
            grid-template-columns: 1fr;
            gap: var(--spacing-xl);
          }

          .product-title {
            font-size: var(--text-3xl);
          }

          .current-price {
            font-size: var(--text-3xl);
          }

          .action-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductDetailPage;