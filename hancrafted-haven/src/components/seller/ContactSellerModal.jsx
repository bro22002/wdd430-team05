// src/components/seller/ContactSellerModal.jsx
// Modal con formulario para contactar a un vendedor
// Incluye validación y mensaje de confirmación

import React, { useState, useEffect } from 'react';
import { sendContactMessage } from '../../services/contactService';

/**
 * ContactSellerModal: Modal para enviar mensajes a vendedores
 * 
 * Funcionalidades:
 * - Formulario con campos: nombre, email, asunto, mensaje
 * - Validación de campos
 * - Auto-llenar datos si el usuario está autenticado
 * - Mensaje de confirmación al enviar
 * 
 * @param {boolean} isOpen - Si el modal está visible
 * @param {function} onClose - Función para cerrar el modal
 * @param {Object} seller - Información del vendedor
 * @param {string} seller.id - ID del vendedor
 * @param {string} seller.shop_name - Nombre de la tienda
 * @param {Object} currentUser - Usuario actual (opcional)
 */
const ContactSellerModal = ({ 
  isOpen, 
  onClose, 
  seller,
  currentUser 
}) => {

  // ============================================
  // 1. ESTADOS DEL COMPONENTE
  // ============================================
  
  // useState: Datos del formulario
  const [formData, setFormData] = useState({
    sender_name: '',
    sender_email: '',
    subject: '',
    message: ''
  });

  // useState: Errores de validación por campo
  const [errors, setErrors] = useState({});

  // useState: Estado de carga (mientras se envía)
  const [loading, setLoading] = useState(false);

  // useState: Mensajes de éxito o error
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });

  // ============================================
  // 2. EFFECTS
  // ============================================
  
  /**
   * useEffect: Prellenar datos si el usuario está autenticado
   * Se ejecuta cuando cambia currentUser o cuando se abre el modal
   */
  useEffect(() => {
    if (isOpen && currentUser) {
      // Si el usuario está autenticado, prellenar nombre y email
      setFormData(prev => ({
        ...prev,
        sender_name: `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim(),
        sender_email: currentUser.email || ''
      }));
    }
  }, [currentUser, isOpen]);

  /**
   * useEffect: Limpiar formulario al cerrar
   * Resetea el formulario cuando el modal se cierra
   */
  useEffect(() => {
    if (!isOpen) {
      // Timeout para que la animación de cierre termine antes de limpiar
      const timer = setTimeout(() => {
        setFormData({
          sender_name: '',
          sender_email: '',
          subject: '',
          message: ''
        });
        setErrors({});
        setSubmitMessage({ type: '', text: '' });
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // ============================================
  // 3. FUNCIONES DE MANEJO DE FORMULARIO
  // ============================================
  
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

    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  /**
   * validateForm: Valida todos los campos del formulario
   * Retorna true si todo es válido, false si hay errores
   * 
   * @returns {boolean} - true si el formulario es válido
   */
  const validateForm = () => {
    const newErrors = {};

    // Validar nombre
    if (!formData.sender_name.trim()) {
      newErrors.sender_name = 'Your name is required';
    } else if (formData.sender_name.trim().length < 2) {
      newErrors.sender_name = 'Name must be at least 2 characters';
    }

    // Validar email
    if (!formData.sender_email.trim()) {
      newErrors.sender_email = 'Your email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.sender_email)) {
      newErrors.sender_email = 'Please enter a valid email';
    }

    // Validar asunto
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.trim().length < 3) {
      newErrors.subject = 'Subject must be at least 3 characters';
    }

    // Validar mensaje
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    } else if (formData.message.length > 2000) {
      newErrors.message = 'Message is too long (maximum 2000 characters)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * handleSubmit: Maneja el envío del formulario
   * Valida datos y llama al servicio para enviar el mensaje
   * 
   * @param {Event} e - Evento del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar antes de enviar
    if (!validateForm()) {
      return;
    }

    // Verificar que tenemos el seller
    if (!seller || !seller.id) {
      setSubmitMessage({
        type: 'error',
        text: 'Seller information not available. Please try again.'
      });
      return;
    }

    try {
      setLoading(true);
      setSubmitMessage({ type: '', text: '' });

      console.log('📧 Submitting contact form...');

      // Preparar datos para enviar
      const messageData = {
        seller_id: seller.id,
        sender_name: formData.sender_name.trim(),
        sender_email: formData.sender_email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        sender_id: currentUser?.id || null  // Opcional si está autenticado
      };

      // Llamar al servicio de contacto
      const result = await sendContactMessage(messageData);

      if (result.success) {
        console.log('✅ Message sent successfully');
        
        setSubmitMessage({
          type: 'success',
          text: result.message || 'Thank you for reaching out! Your message has been sent successfully.'
        });

        // Cerrar modal después de 3 segundos
        setTimeout(() => {
          onClose();
        }, 3000);

      } else {
        console.error('❌ Failed to send message:', result.error);
        setSubmitMessage({
          type: 'error',
          text: result.error || 'Failed to send message. Please try again.'
        });
      }

    } catch (error) {
      console.error('❌ Submit error:', error);
      setSubmitMessage({
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

  // ============================================
  // 4. RENDERIZADO
  // ============================================

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
          <div className="header-icon">✉️</div>
          <h2 className="heading-secondary">Contact {seller?.shop_name || 'Seller'}</h2>
          <p className="text-body text-muted">
            Send a message to this seller about their products
          </p>
        </div>

        {/* Mensaje de éxito/error */}
        {submitMessage.text && (
          <div className={`message-banner ${submitMessage.type}`}>
            <span className="message-icon">
              {submitMessage.type === 'success' ? '✅' : '⚠️'}
            </span>
            <span className="message-text">{submitMessage.text}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="contact-form">
          
          {/* Sección: Información de Contacto */}
          <div className="form-section">
            <h3 className="section-title">Your Information</h3>

            <div className="form-row">
              {/* Campo: Nombre */}
              <div className="form-group">
                <label htmlFor="sender_name" className="form-label">
                  Your Name *
                </label>
                <input
                  type="text"
                  id="sender_name"
                  name="sender_name"
                  value={formData.sender_name}
                  onChange={handleChange}
                  className={`form-input ${errors.sender_name ? 'error' : ''}`}
                  disabled={loading}
                  placeholder="John Doe"
                />
                {errors.sender_name && (
                  <span className="error-message">{errors.sender_name}</span>
                )}
              </div>

              {/* Campo: Email */}
              <div className="form-group">
                <label htmlFor="sender_email" className="form-label">
                  Your Email *
                </label>
                <input
                  type="email"
                  id="sender_email"
                  name="sender_email"
                  value={formData.sender_email}
                  onChange={handleChange}
                  className={`form-input ${errors.sender_email ? 'error' : ''}`}
                  disabled={loading}
                  placeholder="john@example.com"
                />
                {errors.sender_email && (
                  <span className="error-message">{errors.sender_email}</span>
                )}
              </div>
            </div>
          </div>

          {/* Sección: Mensaje */}
          <div className="form-section">
            <h3 className="section-title">Your Message</h3>

            {/* Campo: Asunto */}
            <div className="form-group">
              <label htmlFor="subject" className="form-label">
                Subject *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className={`form-input ${errors.subject ? 'error' : ''}`}
                disabled={loading}
                placeholder="Inquiry about your products"
              />
              {errors.subject && (
                <span className="error-message">{errors.subject}</span>
              )}
            </div>

            {/* Campo: Mensaje */}
            <div className="form-group">
              <label htmlFor="message" className="form-label">
                Message *
                <span className="char-count">
                  {formData.message.length}/2000
                </span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                className={`form-textarea ${errors.message ? 'error' : ''}`}
                disabled={loading}
                placeholder="Hi! I'm interested in your products..."
                rows="6"
                maxLength="2000"
              />
              {errors.message && (
                <span className="error-message">{errors.message}</span>
              )}
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
              disabled={loading || submitMessage.type === 'success'}
            >
              {loading ? 'Sending...' : 'Send Message'}
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
          max-width: 600px;
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
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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

        .contact-form {
          padding: var(--spacing-2xl);
        }

        .form-section {
          margin-bottom: var(--spacing-xl);
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
          min-height: 120px;
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

export default ContactSellerModal;