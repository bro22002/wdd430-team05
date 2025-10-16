// src/components/profile/ProfileEditModal.jsx
// Modal para editar el perfil del usuario
// Permite editar: nombre, bio, ubicación, teléfono, sitio web

import React, { useState, useEffect } from 'react';
import { updateUserProfile } from '../../services/profileService';
import AvatarUpload from './AvatarUpload';

/**
 * ProfileEditModal: Modal para editar información del perfil
 * 
 * @param {boolean} isOpen - Si el modal está abierto
 * @param {function} onClose - Función para cerrar el modal
 * @param {Object} currentProfile - Perfil actual del usuario
 * @param {function} onProfileUpdated - Callback cuando se actualiza el perfil
 */
const ProfileEditModal = ({ 
  isOpen, 
  onClose, 
  currentProfile,
  onProfileUpdated 
}) => {
  
  // useState: Estado para los datos del formulario
  // Inicializa con los valores actuales del perfil
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    location: '',
    phone: '',
    website_url: ''
  });

  // useState: Estado para manejar errores de validación
  const [errors, setErrors] = useState({});

  // useState: Estado de loading durante la actualización
  const [loading, setLoading] = useState(false);

  // useState: Mensajes de éxito o error
  const [message, setMessage] = useState({ type: '', text: '' });

  /**
   * useEffect: Cargar datos del perfil actual cuando se abre el modal
   * Se ejecuta cada vez que cambia currentProfile o isOpen
   */
  useEffect(() => {
    if (isOpen && currentProfile) {
      setFormData({
        firstName: currentProfile.first_name || '',
        lastName: currentProfile.last_name || '',
        bio: currentProfile.bio || '',
        location: currentProfile.location || '',
        phone: currentProfile.phone || '',
        website_url: currentProfile.website_url || ''
      });
      
      // Limpiar mensajes al abrir
      setMessage({ type: '', text: '' });
      setErrors({});
    }
  }, [currentProfile, isOpen]);

  /**
   * handleChange: Maneja cambios en los campos del formulario
   * Actualiza el estado formData cuando el usuario escribe
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
   * validateForm: Valida los datos del formulario
   * Verifica que los campos cumplan con los requisitos
   * 
   * @returns {boolean} - true si el formulario es válido
   */
  const validateForm = () => {
    const newErrors = {};

    // Validación del nombre
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    // Validación del apellido
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    // Validación del teléfono (opcional pero si existe debe ser válido)
    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Validación del sitio web (opcional pero si existe debe ser válido)
    if (formData.website_url) {
      try {
        new URL(formData.website_url);
      } catch {
        newErrors.website_url = 'Please enter a valid URL (e.g., https://example.com)';
      }
    }

    // Validación de la bio (máximo 500 caracteres)
    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * handleSubmit: Maneja el envío del formulario
   * Valida datos y llama al servicio para actualizar el perfil
   * 
   * @param {Event} e - Evento del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar formulario antes de enviar
    if  (!currentProfile || !currentProfile.id) {
      setMessage({ 
        type: 'error', 
        text: 'Profile not loaded. Please try again.' 
      });
      return
    }

    if (!validateForm()) {
      return;
    }
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      // Llamar al servicio de actualización
      const result = await updateUserProfile(currentProfile.id, formData);

      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: result.message || 'Profile updated successfully!' 
        });

        // Notificar al componente padre que se actualizó el perfil
        if (onProfileUpdated) {
          onProfileUpdated(result.profile);
        }

        // Cerrar modal después de 1.5 segundos
        setTimeout(() => {
          onClose();
        }, 1500);

      } else {
        setMessage({ 
          type: 'error', 
          text: result.error || 'Failed to update profile' 
        });
      }

    } catch (error) {
      console.error('Error updating profile:', error);
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
   * Solo cierra si se hace clic en el overlay, no en el contenido
   * 
   * @param {Event} e - Evento del click
   */
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  /**
   * handleAvatarUpdated: Callback cuando se actualiza el avatar
   * Notifica al componente padre del cambio
   * 
   * @param {Object} updatedProfile - Perfil actualizado con nuevo avatar
   */
  const handleAvatarUpdated = (updatedProfile) => {
    if (onProfileUpdated) {
      onProfileUpdated(updatedProfile);
    }
  };

  // Si el modal no está abierto, no renderizar nada
  if (!isOpen) return null;
//   if (!currentProfile) {
//     return (
//         <div className="modal-overlay">
//         <div className="modal-container">
//             <div style={{ padding: '40px', textAlign: 'center' }}>
//             <div className="spinner"></div>
//             <p style={{ marginTop: '20px' }}>Loading profile...</p>
//             </div>
//         </div>
//         </div>
//     );
//  }

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

        {/* Encabezado del modal */}
        <div className="modal-header">
          <h2 className="heading-secondary">Edit Profile</h2>
          <p className="text-body text-muted">
            Update your personal information
          </p>
        </div>

        {/* Mensaje de éxito o error */}
        {message.text && (
          <div className={`message-banner ${message.type}`}>
            <span className="message-icon">
              {message.type === 'success' ? '✅' : '⚠️'}
            </span>
            <span className="message-text">{message.text}</span>
          </div>
        )}

        {/* Componente de upload de avatar */}
        <AvatarUpload
          currentProfile={currentProfile}
          onAvatarUpdated={handleAvatarUpdated}
        />

        {/* Formulario de edición */}
        <form onSubmit={handleSubmit} className="profile-form">
          
          {/* Sección: Nombre */}
          <div className="form-section">
            <h3 className="section-title">Personal Information</h3>
            
            <div className="form-row">
              {/* Campo: First Name */}
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`form-input ${errors.firstName ? 'error' : ''}`}
                  disabled={loading}
                  placeholder="Enter your first name"
                />
                {errors.firstName && (
                  <span className="error-message">{errors.firstName}</span>
                )}
              </div>

              {/* Campo: Last Name */}
              <div className="form-group">
                <label htmlFor="lastName" className="form-label">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`form-input ${errors.lastName ? 'error' : ''}`}
                  disabled={loading}
                  placeholder="Enter your last name"
                />
                {errors.lastName && (
                  <span className="error-message">{errors.lastName}</span>
                )}
              </div>
            </div>
          </div>

          {/* Sección: Información Adicional */}
          <div className="form-section">
            <h3 className="section-title">Additional Information</h3>

            {/* Campo: Bio */}
            <div className="form-group">
              <label htmlFor="bio" className="form-label">
                Bio
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
                placeholder="Tell us about yourself..."
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
            </div>

            {/* Campo: Phone */}
            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`form-input ${errors.phone ? 'error' : ''}`}
                disabled={loading}
                placeholder="+1 (555) 000-0000"
              />
              {errors.phone && (
                <span className="error-message">{errors.phone}</span>
              )}
            </div>

            {/* Campo: Website */}
            <div className="form-group">
              <label htmlFor="website_url" className="form-label">
                Website
              </label>
              <input
                type="url"
                id="website_url"
                name="website_url"
                value={formData.website_url}
                onChange={handleChange}
                className={`form-input ${errors.website_url ? 'error' : ''}`}
                disabled={loading}
                placeholder="https://yourwebsite.com"
              />
              {errors.website_url && (
                <span className="error-message">{errors.website_url}</span>
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
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Estilos CSS con styled-jsx */}
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

        .profile-form {
          padding: var(--spacing-2xl);
        }

        .form-section {
          margin-bottom: var(--spacing-2xl);
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
          min-height: 100px;
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

export default ProfileEditModal;