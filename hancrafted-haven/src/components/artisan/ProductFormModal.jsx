// src/components/artisan/ProductFormModal.jsx
// Modal para agregar o editar un producto
// Incluye formulario completo con validación y subida de imagen

import React, { useState, useEffect } from 'react';
import { createProduct, updateProduct, getProductCategories } from '../../services/productService';
import ProductImageUpload from './ProductImageUpload';

/**
 * ProductFormModal: Modal para crear o editar productos
 * 
 * Si existingProduct es null → Modo "Crear nuevo producto"
 * Si existingProduct tiene datos → Modo "Editar producto"
 * 
 * @param {boolean} isOpen - Si el modal está visible
 * @param {function} onClose - Función para cerrar el modal
 * @param {Object} currentUser - Usuario actual
 * @param {Object} existingProduct - Producto a editar (null si es nuevo)
 * @param {function} onProductSaved - Callback cuando se guarda exitosamente
 */
const ProductFormModal = ({ 
  isOpen, 
  onClose, 
  currentUser,
  existingProduct,
  onProductSaved 
}) => {

  // Determinar si estamos editando o creando
  const isEditing = existingProduct !== null;

  // useState: Datos del formulario
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image_url: ''
  });

  // useState: Errores de validación
  const [errors, setErrors] = useState({});

  // useState: Estado de carga (guardando)
  const [loading, setLoading] = useState(false);

  // useState: Mensaje de éxito/error
  const [message, setMessage] = useState({ type: '', text: '' });

  // useState: Categorías disponibles
  const [categories, setCategories] = useState([]);

  /**
   * useEffect: Cargar categorías al montar el componente
   */
  useEffect(() => {
    loadCategories();
  }, []);

  /**
   * useEffect: Cargar datos del producto cuando se abre en modo edición
   * Si existingProduct cambia, actualizar el formulario
   */
  useEffect(() => {
    if (isOpen && existingProduct) {
      // Modo edición: cargar datos del producto
      setFormData({
        title: existingProduct.title || '',
        description: existingProduct.description || '',
        price: existingProduct.price?.toString() || '',
        category: existingProduct.category || '',
        stock: existingProduct.stock?.toString() || '',
        image_url: existingProduct.image_url || ''
      });
    } else if (isOpen && !existingProduct) {
      // Modo nuevo: limpiar formulario
      setFormData({
        title: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        image_url: ''
      });
    }
    
    // Limpiar mensajes y errores al abrir
    setMessage({ type: '', text: '' });
    setErrors({});
  }, [isOpen, existingProduct]);

  /**
   * loadCategories: Carga las categorías desde el servicio
   */
  const loadCategories = async () => {
    const cats = await getProductCategories();
    setCategories(cats);
  };

  /**
   * handleChange: Maneja cambios en los campos del formulario
   * Actualiza formData y limpia errores del campo modificado
   * 
   * @param {Event} e - Evento del input
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  /**
   * handleImageUploaded: Callback cuando se sube una imagen exitosamente
   * Actualiza el campo image_url en formData
   * 
   * @param {string} imageUrl - URL de la imagen subida
   */
  const handleImageUploaded = (imageUrl) => {
    setFormData(prev => ({
      ...prev,
      image_url: imageUrl
    }));
    
    console.log('✅ Image URL updated:', imageUrl);
  };

  /**
   * validateForm: Valida todos los campos del formulario
   * Retorna true si todos los campos son válidos
   * 
   * @returns {boolean} - true si el formulario es válido
   */
  const validateForm = () => {
    const newErrors = {};

    // Validar título
    if (!formData.title.trim()) {
      newErrors.title = 'Product title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    // Validar descripción
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (formData.description.trim().length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    // Validar precio
    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else {
      const priceNum = parseFloat(formData.price);
      if (isNaN(priceNum) || priceNum <= 0) {
        newErrors.price = 'Price must be a positive number';
      } else if (priceNum > 999999) {
        newErrors.price = 'Price is too high';
      }
    }

    // Validar categoría
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    // Validar stock
    if (formData.stock === '') {
      newErrors.stock = 'Stock quantity is required';
    } else {
      const stockNum = parseInt(formData.stock);
      if (isNaN(stockNum) || stockNum < 0) {
        newErrors.stock = 'Stock must be 0 or greater';
      } else if (stockNum > 999999) {
        newErrors.stock = 'Stock quantity is too high';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * handleSubmit: Maneja el envío del formulario
   * Crea o actualiza el producto según el modo
   * 
   * @param {Event} e - Evento del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar antes de enviar
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      let result;

      if (isEditing) {
        // Modo edición: actualizar producto existente
        console.log('✏️ Updating product:', existingProduct.id);
        
        result = await updateProduct(
          existingProduct.id,
          currentUser.id,
          formData
        );
      } else {
        // Modo nuevo: crear producto
        console.log('➕ Creating new product');
        
        result = await createProduct(
          currentUser.id,
          formData
        );
      }

      // Verificar resultado
      if (result.success) {
        setMessage({
          type: 'success',
          text: result.message
        });

        console.log('✅ Product saved:', result.product);

        // Notificar al componente padre
        if (onProductSaved) {
          onProductSaved(result.product);
        }

        // Cerrar modal después de 1.5 segundos
        setTimeout(() => {
          onClose();
        }, 1500);

      } else {
        setMessage({
          type: 'error',
          text: result.error
        });
      }

    } catch (error) {
      console.error('❌ Submit error:', error);
      setMessage({
        type: 'error',
        text: 'An unexpected error occurred. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * handleOverlayClick: Cierra el modal al hacer clic fuera
   * Solo si no está cargando
   * 
   * @param {Event} e - Evento del click
   */
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  // Si el modal no está abierto, no renderizar nada
  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay"
      onClick={handleOverlayClick}
    >
      <div className="modal-container">
        {/* Botón de cerrar */}
        <button 
          onClick={onClose}
          className="close-button"
          disabled={loading}
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Encabezado */}
        <div className="modal-header">
          <h2 className="heading-secondary">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h2>
          <p className="text-body text-muted">
            {isEditing 
              ? 'Update your product information' 
              : 'Fill in the details for your new product'
            }
          </p>
        </div>

        {/* Mensaje de éxito/error */}
        {message.text && (
          <div className={`message-banner ${message.type}`}>
            <span className="message-icon">
              {message.type === 'success' ? '✅' : '⚠️'}
            </span>
            <span className="message-text">{message.text}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="product-form">
          
          {/* Sección: Imagen del Producto */}
          <div className="form-section">
            <h3 className="section-title">Product Image</h3>
            <ProductImageUpload
              currentImageUrl={formData.image_url}
              currentUser={currentUser}
              onImageUploaded={handleImageUploaded}
              disabled={loading}
            />
          </div>

          {/* Sección: Información Básica */}
          <div className="form-section">
            <h3 className="section-title">Basic Information</h3>

            {/* Campo: Título */}
            <div className="form-group">
              <label htmlFor="title" className="form-label">
                Product Title *
                <span className="char-count">
                  {formData.title.length}/100
                </span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`form-input ${errors.title ? 'error' : ''}`}
                disabled={loading}
                placeholder="e.g., Handmade Ceramic Mug"
                maxLength="100"
              />
              {errors.title && (
                <span className="error-message">{errors.title}</span>
              )}
            </div>

            {/* Campo: Categoría */}
            <div className="form-group">
              <label htmlFor="category" className="form-label">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`form-select ${errors.category ? 'error' : ''}`}
                disabled={loading}
              >
                <option value="">Select a category...</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && (
                <span className="error-message">{errors.category}</span>
              )}
            </div>

            {/* Campo: Descripción */}
            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Description *
                <span className="char-count">
                  {formData.description.length}/1000
                </span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={`form-textarea ${errors.description ? 'error' : ''}`}
                disabled={loading}
                placeholder="Describe your product in detail..."
                rows="5"
                maxLength="1000"
              />
              {errors.description && (
                <span className="error-message">{errors.description}</span>
              )}
            </div>
          </div>

          {/* Sección: Precio e Inventario */}
          <div className="form-section">
            <h3 className="section-title">Pricing & Inventory</h3>

            <div className="form-row">
              {/* Campo: Precio */}
              <div className="form-group">
                <label htmlFor="price" className="form-label">
                  Price (USD) *
                </label>
                <div className="input-with-prefix">
                  <span className="input-prefix">$</span>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className={`form-input with-prefix ${errors.price ? 'error' : ''}`}
                    disabled={loading}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
                {errors.price && (
                  <span className="error-message">{errors.price}</span>
                )}
              </div>

              {/* Campo: Stock */}
              <div className="form-group">
                <label htmlFor="stock" className="form-label">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  className={`form-input ${errors.stock ? 'error' : ''}`}
                  disabled={loading}
                  placeholder="0"
                  min="0"
                />
                {errors.stock && (
                  <span className="error-message">{errors.stock}</span>
                )}
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading 
                ? 'Saving...' 
                : isEditing 
                  ? 'Update Product' 
                  : 'Create Product'
              }
            </button>
          </div>
        </form>
      </div>

      {/* Estilos CSS */}
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: var(--spacing-lg);
          backdrop-filter: blur(4px);
        }

        .modal-container {
          position: relative;
          width: 100%;
          max-width: 700px;
          max-height: 90vh;
          overflow-y: auto;
          background: var(--color-white);
          border-radius: var(--radius-xl);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          animation: modalEnter 0.3s ease-out;
        }

        @keyframes modalEnter {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .close-button {
          position: absolute;
          top: var(--spacing-lg);
          right: var(--spacing-lg);
          width: 32px;
          height: 32px;
          border: none;
          background: var(--color-accent-light);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          color: var(--color-muted);
          font-size: var(--text-lg);
          z-index: 10;
        }

        .close-button:hover:not(:disabled) {
          background: var(--color-error);
          color: var(--color-white);
          transform: scale(1.1);
        }

        .close-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .modal-header {
          padding: var(--spacing-2xl);
          padding-bottom: var(--spacing-lg);
          border-bottom: 1px solid var(--color-accent-light);
        }

        .message-banner {
          margin: 0 var(--spacing-2xl);
          margin-top: var(--spacing-lg);
          padding: var(--spacing-md);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .message-banner.success {
          background: var(--color-success);
          color: var(--color-white);
        }

        .message-banner.error {
          background: var(--color-error);
          color: var(--color-white);
        }

        .message-icon {
          font-size: var(--text-lg);
        }

        .message-text {
          flex: 1;
          font-weight: var(--font-medium);
          font-size: var(--text-sm);
        }

        .product-form {
          padding: var(--spacing-2xl);
        }

        .form-section {
          margin-bottom: var(--spacing-2xl);
          padding-bottom: var(--spacing-xl);
          border-bottom: 1px solid var(--color-accent-light);
        }

        .form-section:last-of-type {
          border-bottom: none;
        }

        .section-title {
          font-family: var(--font-body);
          font-weight: var(--font-semibold);
          font-size: var(--text-lg);
          color: var(--color-dark);
          margin-bottom: var(--spacing-lg);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-md);
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-md);
        }

        .form-label {
          font-family: var(--font-body);
          font-weight: var(--font-medium);
          font-size: var(--text-sm);
          color: var(--color-dark);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .char-count {
          font-size: var(--text-xs);
          color: var(--color-muted);
          font-weight: var(--font-normal);
        }

        .form-input,
        .form-select,
        .form-textarea {
          padding: var(--spacing-md);
          border: 2px solid var(--color-accent);
          border-radius: var(--radius-md);
          font-family: var(--font-body);
          font-size: var(--text-base);
          transition: border-color 0.3s ease;
          background: var(--color-background);
        }

        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
          outline: none;
          border-color: var(--color-primary);
          background: var(--color-white);
        }

        .form-input.error,
        .form-select.error,
        .form-textarea.error {
          border-color: var(--color-error);
        }

        .form-input:disabled,
        .form-select:disabled,
        .form-textarea:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .form-textarea {
          resize: vertical;
          min-height: 100px;
        }

        .input-with-prefix {
          position: relative;
        }

        .input-prefix {
          position: absolute;
          left: var(--spacing-md);
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-muted);
          font-weight: var(--font-medium);
        }

        .form-input.with-prefix {
          padding-left: calc(var(--spacing-md) + 20px);
        }

        .error-message {
          color: var(--color-error);
          font-size: var(--text-sm);
          font-weight: var(--font-medium);
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: var(--spacing-md);
          margin-top: var(--spacing-xl);
          padding-top: var(--spacing-xl);
          border-top: 1px solid var(--color-accent-light);
        }

        @media (max-width: 768px) {
          .modal-overlay {
            padding: 0;
            align-items: stretch;
          }

          .modal-container {
            max-width: 100%;
            max-height: 100%;
            border-radius: 0;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .form-actions {
            flex-direction: column-reverse;
          }

          .form-actions button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductFormModal;