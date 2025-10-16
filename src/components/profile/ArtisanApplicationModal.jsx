// src/components/profile/ArtisanApplicationModal.jsx
// Modal para que usuarios se conviertan en artesanos/vendedores
// Requiere: shop_name, bio, y opcionalmente location/specialization

import React, { useState } from 'react';
import { becomeArtisan } from '../../services/profileService';

/**
 * ArtisanApplicationModal: Modal para aplicación de artesano
 * 
 * @param {boolean} isOpen - Si el modal está abierto
 * @param {function} onClose - Función para cerrar el modal
 * @param {Object} currentUser - Usuario actual
 * @param {function} onSuccess - Callback cuando la aplicación es exitosa
 */
const ArtisanApplicationModal = ({ 
  isOpen, 
  onClose, 
  currentUser,
  onSuccess 
}) => {
  
  // useState: Datos del formulario de aplicación
  const [formData, setFormData] = useState({
    shop_name: '',           // Nombre de la tienda (requerido)
    shop_description: '',    // Descripción de la tienda
    bio: '',                 // Biografía del artesano
    location: '',            // Ubicación del taller
    instagram_handle: '',    // Usuario de Instagram (opcional)
    facebook_url: ''         // URL de Facebook (opcional)
  });

  // useState: Errores de validación
  const [errors, setErrors] = useState({});

  // useState: Estado de carga
  const [loading, setLoading] = useState(false);

  // useState: Mensajes de éxito o error
  const [message, setMessage] = useState({ type: '', text: '' });

  // useState: Términos aceptados
  const [acceptTerms, setAcceptTerms] = useState(false);

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

    // Limpiar error del campo al escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  /**
   * validateForm: Valida todos los campos del formulario
   * Verifica campos requeridos y formatos
   * 
   * @returns {boolean} - true si el formulario es válido
   */
  const validateForm = () => {
    const newErrors = {};

    // Validación: shop_name es obligatorio
    if (!formData.shop_name.trim()) {
      newErrors.shop_name = 'Shop name is required';
    } else if (formData.shop_name.trim().length < 3) {
      newErrors.shop_name = 'Shop name must be at least 3 characters';
    } else if (formData.shop_name.trim().length > 50) {
      newErrors.shop_name = 'Shop name must be less than 50 characters';
    }

    // Validación: shop_description (opcional pero si existe, validar longitud)
    if (formData.shop_description && formData.shop_description.length > 500) {
      newErrors.shop_description = 'Description must be less than 500 characters';
    }

    // Validación: bio (opcional pero si existe, validar longitud)
    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters';
    }

    // Validación: Instagram handle (opcional, formato si existe)
    if (formData.instagram_handle) {
      // Debe ser un username válido (sin @, sin espacios)
      if (!/^[a-zA-Z0-9._]+$/.test(formData.instagram_handle)) {
        newErrors.instagram_handle = 'Invalid Instagram username (no @ symbol, no spaces)';
      }
    }

    // Validación: Facebook URL (opcional, formato si existe)
    if (formData.facebook_url) {
      try {
        const url = new URL(formData.facebook_url);
        if (!url.hostname.includes('facebook.com')) {
          newErrors.facebook_url = 'Please enter a valid Facebook URL';
        }
      } catch {
        newErrors.facebook_url = 'Please enter a valid URL';
      }
    }

    // Validación: Aceptar términos
    if (!acceptTerms) {
      newErrors.acceptTerms = 'You must accept the artisan terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * handleSubmit: Maneja el envío de la aplicación
   * Valida datos y llama al servicio becomeArtisan
   * 
   * @param {Event} e - Evento del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar antes de enviar
    if (!validateForm()) {
      return;
    }

    // Verificar que hay usuario
    if (!currentUser || !currentUser.id) {
      setMessage({
        type: 'error',
        text: 'User not found. Please log in again.'
      });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      console.log('📝 Submitting artisan application...', formData);

      // Llamar al servicio becomeArtisan
      const result = await becomeArtisan(currentUser.id, formData);

      if (result.success) {
        console.log('✅ Artisan application successful:', result);
        
        setMessage({
          type: 'success',
          text: 'Application submitted successfully! Your profile is pending verification.'
        });

        // Notificar al componente padre
        if (onSuccess && result.profile) {
          onSuccess(result.profile);
        }

        // Cerrar modal después de 2 segundos
        setTimeout(() => {
          onClose();
          // Limpiar formulario
          setFormData({
            shop_name: '',
            shop_description: '',
            bio: '',
            location: '',
            instagram_handle: '',
            facebook_url: ''
          });
          setAcceptTerms(false);
          setMessage({ type: '', text: '' });
        }, 2000);

      } else {
        console.error('❌ Artisan application failed:', result.error);
        setMessage({
          type: 'error',
          text: result.error || 'Application failed. Please try again.'
        });
      }

    } catch (error) {
      console.error('❌ Unexpected error:', error);
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

  // Si el modal no está abierto, no renderizar
  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay"
      onClick={handleOverlayClick}
    >
      <div className="modal-container">
        {/* Botón cerrar */}
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
          <div className="header-icon">🎨</div>
          <h2 className="heading-secondary">Become an Artisan</h2>
          <p className="text-body text-muted">
            Join our community of talented creators and start selling your handcrafted items
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
        <form onSubmit={handleSubmit} className="artisan-form">
          
          {/* Sección: Información de Tienda */}
          <div className="form-section">
            <h3 className="section-title">Shop Information</h3>

            {/* Campo: Shop Name */}
            <div className="form-group">
              <label htmlFor="shop_name" className="form-label">
                Shop Name *
              </label>
              <input
                type="text"
                id="shop_name"
                name="shop_name"
                value={formData.shop_name}
                onChange={handleChange}
                className={`form-input ${errors.shop_name ? 'error' : ''}`}
                disabled={loading}
                placeholder="Your shop or studio name"
                maxLength="50"
              />
              <div className="field-info">
                <span className="char-count">
                  {formData.shop_name.length}/50
                </span>
              </div>
              {errors.shop_name && (
                <span className="error-message">{errors.shop_name}</span>
              )}
            </div>

            {/* Campo: Shop Description */}
            <div className="form-group">
              <label htmlFor="shop_description" className="form-label">
                Shop Description
                <span className="char-count">
                  {formData.shop_description.length}/500
                </span>
              </label>
              <textarea
                id="shop_description"
                name="shop_description"
                value={formData.shop_description}
                onChange={handleChange}
                className={`form-textarea ${errors.shop_description ? 'error' : ''}`}
                disabled={loading}
                placeholder="Tell customers about your shop and what makes it special..."
                rows="4"
                maxLength="500"
              />
              {errors.shop_description && (
                <span className="error-message">{errors.shop_description}</span>
              )}
            </div>
          </div>

          {/* Sección: Información Personal */}
          <div className="form-section">
            <h3 className="section-title">About You</h3>

            {/* Campo: Bio */}
            <div className="form-group">
              <label htmlFor="bio" className="form-label">
                Artisan Bio
                <span className="char-count">
                  {formData.bio.length}/500
                </span>
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className={`form-textarea ${errors.bio ? 'error' : ''}`}
                disabled={loading}
                placeholder="Share your story, inspiration, and craftsmanship journey..."
                rows="4"
                maxLength="500"
              />
              {errors.bio && (
                <span className="error-message">{errors.bio}</span>
              )}
            </div>

            {/* Campo: Location */}
            <div className="form-group">
              <label htmlFor="location" className="form-label">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="form-input"
                disabled={loading}
                placeholder="City, Country"
              />
              <p className="field-hint">
                Help customers know where your items are crafted
              </p>
            </div>
          </div>

          {/* Sección: Redes Sociales */}
          <div className="form-section">
            <h3 className="section-title">Social Media (Optional)</h3>

            {/* Campo: Instagram */}
            <div className="form-group">
              <label htmlFor="instagram_handle" className="form-label">
                Instagram Username
              </label>
              <div className="input-with-prefix">
                <span className="input-prefix">@</span>
                <input
                  type="text"
                  id="instagram_handle"
                  name="instagram_handle"
                  value={formData.instagram_handle}
                  onChange={handleChange}
                  className={`form-input with-prefix ${errors.instagram_handle ? 'error' : ''}`}
                  disabled={loading}
                  placeholder="yourusername"
                />
              </div>
              {errors.instagram_handle && (
                <span className="error-message">{errors.instagram_handle}</span>
              )}
            </div>

            {/* Campo: Facebook */}
            <div className="form-group">
              <label htmlFor="facebook_url" className="form-label">
                Facebook Page URL
              </label>
              <input
                type="url"
                id="facebook_url"
                name="facebook_url"
                value={formData.facebook_url}
                onChange={handleChange}
                className={`form-input ${errors.facebook_url ? 'error' : ''}`}
                disabled={loading}
                placeholder="https://facebook.com/yourpage"
              />
              {errors.facebook_url && (
                <span className="error-message">{errors.facebook_url}</span>
              )}
            </div>
          </div>

          {/* Términos y Condiciones */}
          <div className="form-section terms-section">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                disabled={loading}
              />
              <span className="checkmark"></span>
              <span className="checkbox-text">
                I agree to the{' '}
                <a href="#" className="terms-link">Artisan Terms & Conditions</a>
                {' '}and understand that my profile will be reviewed before verification
              </span>
            </label>
            {errors.acceptTerms && (
              <span className="error-message">{errors.acceptTerms}</span>
            )}
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
              {loading ? 'Submitting...' : 'Submit Application'}
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
          text-align: center;
        }

        .header-icon {
          font-size: 3rem;
          margin-bottom: var(--spacing-md);
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

        .artisan-form {
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
        .form-textarea:focus {
          outline: none;
          border-color: var(--color-primary);
          background: var(--color-white);
        }

        .form-input.error,
        .form-textarea.error {
          border-color: var(--color-error);
        }

        .form-input:disabled,
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

        .field-info {
          display: flex;
          justify-content: flex-end;
        }

        .field-hint {
          font-size: var(--text-xs);
          color: var(--color-muted);
          font-style: italic;
          margin: 0;
        }

        .error-message {
          color: var(--color-error);
          font-size: var(--text-sm);
          font-weight: var(--font-medium);
        }

        .terms-section {
          background: var(--color-background);
          padding: var(--spacing-lg);
          border-radius: var(--radius-md);
        }

        .checkbox-container {
          display: flex;
          align-items: flex-start;
          gap: var(--spacing-sm);
          cursor: pointer;
          line-height: 1.5;
        }

        .checkbox-text {
          font-size: var(--text-sm);
          color: var(--color-dark);
        }

        .terms-link {
          color: var(--color-primary);
          text-decoration: none;
          font-weight: var(--font-medium);
        }

        .terms-link:hover {
          color: var(--color-secondary);
          text-decoration: underline;
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

export default ArtisanApplicationModal;