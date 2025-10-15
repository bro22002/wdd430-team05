// src/components/artisan/ArtisanDashboard.jsx
// Dashboard principal para que artesanos gestionen sus productos
// Muestra lista de productos, permite agregar, editar y eliminar

import React, { useState, useEffect } from 'react';
import { getArtisanProducts, deleteProduct } from '../../services/productService';
import ProductFormModal from './ProductFormModal';
import { LoadingSpinner, ErrorMessage } from '../UtilityComponents';
// Al inicio del archivo, con los otros imports
import DeleteAccountModal from '../profile/DeleteAccountModal'; 
/**
 * ArtisanDashboard: Componente principal del panel de artesano
 * 
 * Funcionalidades:
 * - Mostrar todos los productos del artesano
 * - Botón para agregar nuevo producto
 * - Editar producto existente
 * - Eliminar producto
 * - Estadísticas básicas
 * 
 * @param {Object} currentUser - Usuario actual autenticado
 * @param {Object} profile - Perfil del usuario
 */
const ArtisanDashboard = ({ currentUser, profile }) => {

  // useState: Array de productos del artesano
  const [products, setProducts] = useState([]);

  // useState: Estado de carga inicial
  const [loading, setLoading] = useState(true);

  // useState: Mensajes de error
  const [error, setError] = useState(null);

  // useState: Control del modal de producto (agregar/editar)
  const [isModalOpen, setIsModalOpen] = useState(false);

  // useState: Producto seleccionado para editar (null = nuevo producto)
  const [selectedProduct, setSelectedProduct] = useState(null);

  // useState: Estado de operaciones (eliminar, etc)
  const [operationLoading, setOperationLoading] = useState(false);
   
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);


  /**
   * useEffect: Cargar productos al montar el componente
   * Se ejecuta una vez cuando el componente se monta
   */
  useEffect(() => {
    if (currentUser?.id) {
      fetchProducts();
    }
  }, [currentUser]);

  /**
   * fetchProducts: Obtiene los productos del artesano desde Supabase
   * Usa el servicio getArtisanProducts que creamos anteriormente
   */
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Llamar al servicio
      const result = await getArtisanProducts(currentUser.id);

      if (result.success) {
        setProducts(result.products);
        console.log('✅ Products loaded:', result.products.length);
      } else {
        setError(result.error);
      }

    } catch (err) {
      console.error('Error loading products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * handleAddProduct: Abre el modal para agregar nuevo producto
   * Resetea selectedProduct a null para indicar que es un nuevo producto
   */
  const handleAddProduct = () => {
    setSelectedProduct(null);  // null = nuevo producto
    setIsModalOpen(true);
  };

  /**
   * handleEditProduct: Abre el modal para editar un producto existente
   * Establece el producto seleccionado que se pasará al modal
   * 
   * @param {Object} product - Producto a editar
   */
  const handleEditProduct = (product) => {
    setSelectedProduct(product);  // Pasar producto al modal
    setIsModalOpen(true);
  };

  /**
   * handleDeleteProduct: Elimina un producto después de confirmación
   * Muestra una alerta de confirmación antes de eliminar
   * 
   * @param {string} productId - ID del producto a eliminar
   */
  const handleDeleteProduct = async (productId) => {
    // Confirmación de seguridad
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      setOperationLoading(true);

      // Llamar al servicio de eliminación
      const result = await deleteProduct(productId, currentUser.id);

      if (result.success) {
        console.log('✅ Product deleted');
        
        // Actualizar lista local removiendo el producto eliminado
        setProducts(prevProducts => 
          prevProducts.filter(p => p.id !== productId)
        );

        // Opcional: mostrar mensaje de éxito
        alert('Product deleted successfully!');
      } else {
        alert(`Error: ${result.error}`);
      }

    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete product. Please try again.');
    } finally {
      setOperationLoading(false);
    }
  };

  /**
   * handleProductSaved: Callback cuando se guarda un producto (nuevo o editado)
   * Actualiza la lista de productos y cierra el modal
   * 
   * @param {Object} savedProduct - Producto guardado
   */
  const handleProductSaved = (savedProduct) => {
    if (selectedProduct) {
      // Actualizar producto existente en la lista
      setProducts(prevProducts =>
        prevProducts.map(p => p.id === savedProduct.id ? savedProduct : p)
      );
    } else {
      // Agregar nuevo producto al inicio de la lista
      setProducts(prevProducts => [savedProduct, ...prevProducts]);
    }

    // Cerrar modal
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  /**
   * closeModal: Cierra el modal y resetea el producto seleccionado
   */
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  /**
   * getStockStatus: Determina el estado del stock y su estilo
   * 
   * @param {number} stock - Cantidad en stock
   * @returns {Object} - {text, className}
   */
  const getStockStatus = (stock) => {
    if (stock === 0) return { text: 'Out of Stock', className: 'out-of-stock' };
    if (stock <= 5) return { text: `Low Stock (${stock})`, className: 'low-stock' };
    return { text: `In Stock (${stock})`, className: 'in-stock' };
  };

  


  // Calcular estadísticas
  const stats = {
    total: products.length,
    inStock: products.filter(p => p.stock > 0).length,
    outOfStock: products.filter(p => p.stock === 0).length,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0)
  };

  // Estado de carga inicial
  if (loading) {
    return <LoadingSpinner message="Loading your products..." />;
  }

  // Estado de error
  if (error) {
    return <ErrorMessage message={error} onRetry={fetchProducts} />;
  }

  return (
    <div className="artisan-dashboard">
      {/* Header del Dashboard */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="heading-primary">My Products</h1>
          <p className="text-body text-muted">
            Manage your product catalog and inventory
          </p>
        </div>
        
        <button 
          onClick={handleAddProduct}
          className="btn btn-primary"
          disabled={operationLoading}
        >
          ➕ Add New Product
        </button>
         <button 
          onClick={openDeleteAccountModal}
          className="btn-delete-account"
          disabled={operationLoading}
        >
          🗑️ Delete My Account
        </button>
      </div>
       <DirectUploadTest currentUser={currentUser} />
      {/* Tarjetas de Estadísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Products</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-value">{stats.inStock}</div>
            <div className="stat-label">In Stock</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">❌</div>
          <div className="stat-info">
            <div className="stat-value">{stats.outOfStock}</div>
            <div className="stat-label">Out of Stock</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <div className="stat-value">${stats.totalValue.toFixed(2)}</div>
            <div className="stat-label">Inventory Value</div>
          </div>
        </div>
      </div>

      {/* Lista de Productos */}
      {products.length === 0 ? (
        // Estado vacío - sin productos
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>No products yet</h3>
          <p>Start by adding your first product to your shop!</p>
          <button 
            onClick={handleAddProduct}
            className="btn btn-primary"
          >
            Add Your First Product
          </button>
        </div>
      ) : (
        // Lista de productos
        <div className="products-list">
          {products.map(product => {
            const stockStatus = getStockStatus(product.stock);
            
            return (
              <div key={product.id} className="product-item">
                {/* Imagen del producto */}
                <div className="product-image">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.title} />
                  ) : (
                    <div className="no-image">
                      <span>📷</span>
                      <span>No Image</span>
                    </div>
                  )}
                </div>

                {/* Información del producto */}
                <div className="product-info">
                  <h3 className="product-title">{product.title}</h3>
                  <p className="product-category">{product.category}</p>
                  <p className="product-description">{product.description}</p>
                  
                  <div className="product-meta">
                    <span className="product-price">${product.price.toFixed(2)}</span>
                    <span className={`stock-badge ${stockStatus.className}`}>
                      {stockStatus.text}
                    </span>
                    <span className="product-rating">⭐ {product.rating.toFixed(1)}</span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="product-actions">
                  <button
                    onClick={() => handleEditProduct(product)}
                    className="btn-action btn-edit"
                    disabled={operationLoading}
                    title="Edit product"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="btn-action btn-delete"
                    disabled={operationLoading}
                    title="Delete product"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para Agregar/Editar Producto */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        currentUser={currentUser}
        existingProduct={selectedProduct}
        onProductSaved={handleProductSaved}
      />
      <DeleteAccountModal
        isOpen={isDeleteAccountModalOpen}
        onClose={closeDeleteAccountModal}
        currentUser={currentUser}
        onAccountDeleted={handleAccountDeleted}
      />
      {/* Estilos CSS */}
      <style jsx>{`
        .artisan-dashboard {
          min-height: 100vh;
          background: var(--color-background);
          padding: var(--spacing-2xl);
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-2xl);
          padding-bottom: var(--spacing-xl);
          border-bottom: 2px solid var(--color-accent-light);
        }

        .header-content h1 {
          margin: 0 0 var(--spacing-sm) 0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-2xl);
        }

        .stat-card {
          background: var(--color-white);
          padding: var(--spacing-xl);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md);
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          transition: transform 0.2s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        .stat-icon {
          font-size: 2.5rem;
        }

        .stat-info {
          flex: 1;
        }

        .stat-value {
          font-size: var(--text-2xl);
          font-weight: var(--font-bold);
          color: var(--color-primary);
          margin-bottom: var(--spacing-xs);
        }

        .stat-label {
          font-size: var(--text-sm);
          color: var(--color-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .products-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }

        .product-item {
          background: var(--color-white);
          border-radius: var(--radius-lg);
          padding: var(--spacing-xl);
          box-shadow: var(--shadow-md);
          display: grid;
          grid-template-columns: 150px 1fr auto;
          gap: var(--spacing-xl);
          transition: all 0.2s ease;
        }

        .product-item:hover {
          box-shadow: var(--shadow-lg);
        }

        .product-image {
          width: 150px;
          height: 150px;
          border-radius: var(--radius-md);
          overflow: hidden;
          background: var(--color-background);
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .no-image {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: var(--color-accent-light);
          color: var(--color-muted);
          font-size: var(--text-sm);
        }

        .no-image span:first-child {
          font-size: 2rem;
          margin-bottom: var(--spacing-xs);
        }

        .product-info {
          flex: 1;
        }

        .product-title {
          font-family: var(--font-body);
          font-weight: var(--font-semibold);
          font-size: var(--text-xl);
          color: var(--color-dark);
          margin: 0 0 var(--spacing-xs) 0;
        }

        .product-category {
          font-size: var(--text-sm);
          color: var(--color-secondary);
          font-weight: var(--font-medium);
          margin: 0 0 var(--spacing-sm) 0;
        }

        .product-description {
          font-size: var(--text-base);
          color: var(--color-muted);
          line-height: 1.5;
          margin: 0 0 var(--spacing-md) 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-meta {
          display: flex;
          gap: var(--spacing-md);
          align-items: center;
        }

        .product-price {
          font-size: var(--text-xl);
          font-weight: var(--font-bold);
          color: var(--color-primary);
        }

        .stock-badge {
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--radius-sm);
          font-size: var(--text-xs);
          font-weight: var(--font-semibold);
          text-transform: uppercase;
        }

        .stock-badge.in-stock {
          background: rgba(34, 197, 94, 0.1);
          color: var(--color-success);
        }

        .stock-badge.low-stock {
          background: rgba(245, 158, 11, 0.1);
          color: var(--color-warning);
        }

        .stock-badge.out-of-stock {
          background: rgba(239, 68, 68, 0.1);
          color: var(--color-error);
        }

        .product-rating {
          font-size: var(--text-sm);
          color: var(--color-muted);
        }

        .product-actions {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
          justify-content: center;
        }

        .btn-action {
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--radius-md);
          border: 2px solid transparent;
          font-family: var(--font-body);
          font-weight: var(--font-medium);
          font-size: var(--text-sm);
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .btn-action:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-edit {
          background: var(--color-primary);
          color: var(--color-white);
          border-color: var(--color-primary);
        }

        .btn-edit:hover:not(:disabled) {
          background: var(--color-secondary);
          border-color: var(--color-secondary);
        }

        .btn-delete {
          background: transparent;
          color: var(--color-error);
          border-color: var(--color-error);
        }

        .btn-delete:hover:not(:disabled) {
          background: var(--color-error);
          color: var(--color-white);
        }

        .empty-state {
          background: var(--color-white);
          padding: var(--spacing-3xl);
          border-radius: var(--radius-xl);
          text-align: center;
          box-shadow: var(--shadow-md);
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: var(--spacing-lg);
        }

        .empty-state h3 {
          font-size: var(--text-2xl);
          font-weight: var(--font-semibold);
          color: var(--color-dark);
          margin: 0 0 var(--spacing-sm) 0;
        }

        .empty-state p {
          color: var(--color-muted);
          margin: 0 0 var(--spacing-xl) 0;
        }

        @media (max-width: 768px) {
          .artisan-dashboard {
            padding: var(--spacing-lg);
          }

          .dashboard-header {
            flex-direction: column;
            gap: var(--spacing-md);
            align-items: stretch;
          }

          .product-item {
            grid-template-columns: 1fr;
            gap: var(--spacing-md);
          }

          .product-image {
            width: 100%;
            height: 200px;
          }

          .product-actions {
            flex-direction: row;
          }
          .btn-delete-account {
          background: transparent;
          color: var(--color-error);
          border: 2px solid var(--color-error);
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--radius-md);
          font-family: var(--font-body);
          font-weight: var(--font-medium);
          font-size: var(--text-sm);
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .btn-delete-account:hover:not(:disabled) {
          background: var(--color-error);
          color: var(--color-white);
        }

        .btn-delete-account:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        }
      `}</style>
    </div>
  );
};

export default ArtisanDashboard;