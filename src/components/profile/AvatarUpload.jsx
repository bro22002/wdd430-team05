// src/components/profile/AvatarUpload.jsx
// Componente para subir y gestionar la foto de perfil del usuario
// Permite: subir nueva imagen, previsualizar, y eliminar imagen actual

import React, { useState, useRef } from 'react';
import { uploadProfileImage, deleteProfileImage } from '../../services/profileService';

/**
 * AvatarUpload: Componente para manejar la foto de perfil
 * 
 * @param {Object} currentProfile - Perfil actual del usuario
 * @param {function} onAvatarUpdated - Callback cuando se actualiza el avatar
 */
const AvatarUpload = ({ currentProfile, onAvatarUpdated }) => {
  
  // useState: Estado para la imagen seleccionada (antes de subir)
  const [selectedFile, setSelectedFile] = useState(null);

  // useState: Preview de la imagen seleccionada (URL temporal)
  const [previewUrl, setPreviewUrl] = useState(null);

  // useState: Estado de carga durante upload/delete
  const [uploading, setUploading] = useState(false);

  // useState: Mensajes de error o éxito
  const [message, setMessage] = useState({ type: '', text: '' });

  // useRef: Referencia al input de archivo (para trigger programático)
  const fileInputRef = useRef(null);

  /**
   * handleFileSelect: Maneja la selección de archivo
   * Se ejecuta cuando el usuario elige una imagen
   * 
   * @param {Event} e - Evento del input file
   */
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;

    // Validación 1: Verificar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setMessage({
        type: 'error',
        text: 'Invalid file type. Please select a JPEG, PNG, or WebP image.'
      });
      return;
    }

    // Validación 2: Verificar tamaño (máximo 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB en bytes
    if (file.size > maxSize) {
      setMessage({
        type: 'error',
        text: 'File is too large. Maximum size is 2MB.'
      });
      return;
    }

    // Limpiar mensajes anteriores
    setMessage({ type: '', text: '' });

    // Guardar archivo seleccionado
    setSelectedFile(file);

    // Crear URL temporal para preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  /**
   * handleUpload: Sube la imagen seleccionada al servidor
   * Llama al servicio uploadProfileImage y actualiza el estado
   */
  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setMessage({ type: '', text: '' });

      console.log('📤 Uploading avatar...', selectedFile.name);

      // Llamar al servicio de upload
      const result = await uploadProfileImage(currentProfile.id, selectedFile);

      if (result.success) {
        setMessage({
          type: 'success',
          text: 'Profile image uploaded successfully!'
        });

        // Limpiar estado de selección
        setSelectedFile(null);
        setPreviewUrl(null);

        // Notificar al componente padre del cambio
        if (onAvatarUpdated && result.profile) {
          onAvatarUpdated(result.profile);
        }

        console.log('✅ Avatar uploaded:', result.imageUrl);

      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Failed to upload image'
        });
      }

    } catch (error) {
      console.error('❌ Upload error:', error);
      setMessage({
        type: 'error',
        text: 'An unexpected error occurred. Please try again.'
      });
    } finally {
      setUploading(false);
    }
  };

  /**
   * handleDelete: Elimina la imagen de perfil actual
   * Solo disponible si el usuario ya tiene una imagen
   */
  const handleDelete = async () => {
    // Confirmación antes de eliminar
    if (!window.confirm('Are you sure you want to delete your profile image?')) {
      return;
    }

    try {
      setUploading(true);
      setMessage({ type: '', text: '' });

      console.log('🗑️ Deleting avatar...');

      // Llamar al servicio de eliminación
      const result = await deleteProfileImage(currentProfile.id);

      if (result.success) {
        setMessage({
          type: 'success',
          text: 'Profile image deleted successfully'
        });

        // Notificar al componente padre (con avatar_url = null)
        if (onAvatarUpdated) {
          onAvatarUpdated({
            ...currentProfile,
            avatar_url: null,
            profile_image_url: null
          });
        }

        console.log('✅ Avatar deleted');

      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Failed to delete image'
        });
      }

    } catch (error) {
      console.error('❌ Delete error:', error);
      setMessage({
        type: 'error',
        text: 'An unexpected error occurred. Please try again.'
      });
    } finally {
      setUploading(false);
    }
  };

  /**
   * handleCancel: Cancela la selección actual y limpia el preview
   */
  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setMessage({ type: '', text: '' });
    
    // Limpiar input file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * triggerFileInput: Abre el diálogo de selección de archivo
   * Se usa para hacer el input file "invisible" y usar un botón custom
   */
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  /**
   * getDisplayImage: Determina qué imagen mostrar
   * Prioridad: 1) Preview (imagen seleccionada)
   *            2) Avatar actual del usuario
   *            3) Placeholder por defecto
   * 
   * @returns {string} - URL de la imagen a mostrar
   */
  const getDisplayImage = () => {
    if (previewUrl) {
      return previewUrl; // Mostrar preview de la imagen seleccionada
    }
    if (currentProfile?.avatar_url) {
      return currentProfile.avatar_url; // Mostrar avatar actual
    }
    // Placeholder: iniciales del usuario
    return null;
  };

  /**
   * getInitials: Obtiene las iniciales del nombre del usuario
   * Se usa como fallback cuando no hay imagen
   * 
   * @returns {string} - Iniciales (ej: "JP" para Juan Pérez)
   */
  const getInitials = () => {
    if (!currentProfile) return '?';
    
    const firstName = currentProfile.first_name || '';
    const lastName = currentProfile.last_name || '';
    
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const displayImage = getDisplayImage();
  const hasCurrentAvatar = currentProfile?.avatar_url;

  return (
    <div className="avatar-upload-container">
      
      {/* Sección de visualización del avatar */}
      <div className="avatar-section">
        <div className="avatar-display">
          {displayImage ? (
            // Mostrar imagen
            <img 
              src={displayImage} 
              alt="Profile" 
              className="avatar-image"
            />
          ) : (
            // Mostrar iniciales como placeholder
            <div className="avatar-placeholder">
              <span className="avatar-initials">{getInitials()}</span>
            </div>
          )}
          
          {/* Indicador de carga */}
          {uploading && (
            <div className="avatar-loading">
              <div className="spinner"></div>
            </div>
          )}
        </div>

        <div className="avatar-info">
          <h4 className="avatar-title">Profile Photo</h4>
          <p className="avatar-hint">
            JPG, PNG or WebP. Max 2MB.
          </p>
        </div>
      </div>

      {/* Input de archivo (oculto) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="file-input-hidden"
        disabled={uploading}
      />

      {/* Mensaje de éxito o error */}
      {message.text && (
        <div className={`avatar-message ${message.type}`}>
          <span className="message-icon">
            {message.type === 'success' ? '✅' : '⚠️'}
          </span>
          <span className="message-text">{message.text}</span>
        </div>
      )}

      {/* Botones de acción */}
      <div className="avatar-actions">
        {!selectedFile ? (
          // Vista: Sin archivo seleccionado
          <>
            <button
              type="button"
              onClick={triggerFileInput}
              className="btn-avatar btn-select"
              disabled={uploading}
            >
              📷 {hasCurrentAvatar ? 'Change Photo' : 'Upload Photo'}
            </button>
            
            {hasCurrentAvatar && (
              <button
                type="button"
                onClick={handleDelete}
                className="btn-avatar btn-delete"
                disabled={uploading}
              >
                🗑️ Delete
              </button>
            )}
          </>
        ) : (
          // Vista: Archivo seleccionado (mostrando preview)
          <>
            <button
              type="button"
              onClick={handleUpload}
              className="btn-avatar btn-upload"
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : '✓ Upload'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="btn-avatar btn-cancel"
              disabled={uploading}
            >
              ✕ Cancel
            </button>
          </>
        )}
      </div>

      {/* Estilos CSS con styled-jsx */}
      <style jsx>{`
        .avatar-upload-container {
          padding: var(--spacing-xl);
          background: var(--color-background);
          border-radius: var(--radius-lg);
          margin-bottom: var(--spacing-xl);
        }

        .avatar-section {
          display: flex;
          align-items: center;
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-lg);
        }

        .avatar-display {
          position: relative;
          width: 100px;
          height: 100px;
          flex-shrink: 0;
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
          font-family: var(--font-heading);
        }

        .avatar-loading {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .spinner {
          width: 30px;
          height: 30px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top: 3px solid var(--color-white);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .avatar-info {
          flex: 1;
        }

        .avatar-title {
          font-family: var(--font-body);
          font-weight: var(--font-semibold);
          font-size: var(--text-base);
          color: var(--color-dark);
          margin: 0 0 var(--spacing-xs) 0;
        }

        .avatar-hint {
          font-size: var(--text-sm);
          color: var(--color-muted);
          margin: 0;
        }

        .file-input-hidden {
          display: none;
        }

        .avatar-message {
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-md);
          font-size: var(--text-sm);
        }

        .avatar-message.success {
          background: rgba(34, 197, 94, 0.1);
          color: var(--color-success);
          border: 1px solid var(--color-success);
        }

        .avatar-message.error {
          background: rgba(239, 68, 68, 0.1);
          color: var(--color-error);
          border: 1px solid var(--color-error);
        }

        .message-icon {
          font-size: var(--text-base);
        }

        .message-text {
          flex: 1;
          font-weight: var(--font-medium);
        }

        .avatar-actions {
          display: flex;
          gap: var(--spacing-sm);
        }

        .btn-avatar {
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--radius-md);
          font-family: var(--font-body);
          font-weight: var(--font-medium);
          font-size: var(--text-sm);
          cursor: pointer;
          transition: all 0.2s ease;
          border: 2px solid transparent;
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
        }

        .btn-avatar:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-select {
          background: var(--color-primary);
          color: var(--color-white);
          border-color: var(--color-primary);
        }

        .btn-select:hover:not(:disabled) {
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

        .btn-upload {
          background: var(--color-success);
          color: var(--color-white);
          border-color: var(--color-success);
          flex: 1;
        }

        .btn-upload:hover:not(:disabled) {
          background: #16a34a;
          border-color: #16a34a;
        }

        .btn-cancel {
          background: transparent;
          color: var(--color-muted);
          border-color: var(--color-accent);
        }

        .btn-cancel:hover:not(:disabled) {
          background: var(--color-accent-light);
          border-color: var(--color-primary);
          color: var(--color-primary);
        }

        @media (max-width: 768px) {
          .avatar-section {
            flex-direction: column;
            text-align: center;
          }

          .avatar-actions {
            flex-direction: column;
          }

          .btn-avatar {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default AvatarUpload;