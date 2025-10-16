// src/components/artisan/ProductImageUpload.jsx
// Componente para subir y previsualizar imágenes de productos
// Similar a AvatarUpload pero optimizado para productos

import React, { useState, useRef } from 'react';
import { uploadProductImage } from '../../services/productService';

/**
 * ProductImageUpload: Componente para gestionar imagen del producto
 * 
 * Funcionalidades:
 * - Previsualizar imagen antes de subir
 * - Validar tipo y tamaño de archivo
 * - Subir imagen a Supabase Storage
 * - Mostrar imagen actual o placeholder
 * 
 * @param {string} currentImageUrl - URL de la imagen actual (null si no hay)
 * @param {Object} currentUser - Usuario actual
 * @param {function} onImageUploaded - Callback con la URL de la imagen subida
 * @param {boolean} disabled - Si el componente está deshabilitado
 */
const ProductImageUpload = ({ 
  currentImageUrl, 
  currentUser,
  onImageUploaded,
  disabled = false 
}) => {

  // useState: Archivo seleccionado (antes de subir)
  const [selectedFile, setSelectedFile] = useState(null);

  // useState: URL de preview temporal
  const [previewUrl, setPreviewUrl] = useState(null);

  // useState: Estado de carga durante upload
  const [uploading, setUploading] = useState(false);

  // useState: Mensajes de error o éxito
  const [message, setMessage] = useState({ type: '', text: '' });

  // useRef: Referencia al input de archivo
  const fileInputRef = useRef(null);

  /**
   * handleFileSelect: Maneja la selección de archivo
   * Valida y crea preview del archivo seleccionado
   * 
   * @param {Event} e - Evento del input file
   */
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;

    // Validación 1: Tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setMessage({
        type: 'error',
        text: 'Invalid file type. Please select JPG, PNG, or WebP image.'
      });
      return;
    }

    // Validación 2: Tamaño (máximo 5MB para productos)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setMessage({
        type: 'error',
        text: 'File is too large. Maximum size is 5MB.'
      });
      return;
    }

    // Limpiar mensajes anteriores
    setMessage({ type: '', text: '' });

    // Guardar archivo seleccionado
    setSelectedFile(file);

    // Crear preview temporal usando FileReader
    // FileReader es una API del navegador que lee archivos
    const reader = new FileReader();
    
    // Cuando termine de leer, guardar el resultado
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    
    // Leer archivo como Data URL (base64)
    reader.readAsDataURL(file);
  };

  /**
   * handleUpload: Sube la imagen seleccionada
   * Llama al servicio y notifica al componente padre
   */
  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setMessage({ type: '', text: '' });

      console.log('📤 Uploading product image...', selectedFile.name);

      // Llamar al servicio de upload
      const result = await uploadProductImage(currentUser.id, selectedFile);

      if (result.success) {
        setMessage({
          type: 'success',
          text: 'Image uploaded successfully!'
        });

        // Notificar al componente padre con la URL
        if (onImageUploaded) {
          onImageUploaded(result.imageUrl);
        }

        // Limpiar estado de selección
        setSelectedFile(null);
        setPreviewUrl(null);

        console.log('✅ Image uploaded:', result.imageUrl);

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
   * handleCancel: Cancela la selección actual
   * Limpia el archivo seleccionado y el preview
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
   * Hace click programático en el input file oculto
   */
  const triggerFileInput = () => {
    if (fileInputRef.current && !disabled && !uploading) {
      fileInputRef.current.click();
    }
  };

  /**
   * getDisplayImage: Determina qué imagen mostrar
   * Prioridad: Preview > Imagen actual > Placeholder
   * 
   * @returns {string|null} - URL de la imagen o null
   */
  const getDisplayImage = () => {
    if (previewUrl) {
      return previewUrl; // Preview de imagen seleccionada
    }
    if (currentImageUrl) {
      return currentImageUrl; // Imagen guardada actual
    }
    return null; // Sin imagen
  };

  const displayImage = getDisplayImage();

  return (
    <div className="image-upload-container">
      
      {/* Sección de visualización */}
      <div className="image-preview-section">
        <div className="image-preview">
          {displayImage ? (
            // Mostrar imagen
            <img 
              src={displayImage} 
              alt="Product preview" 
              className="preview-image"
            />
          ) : (
            // Placeholder cuando no hay imagen
            <div className="no-image-placeholder">
              <span className="placeholder-icon">📷</span>
              <span className="placeholder-text">No image</span>
            </div>
          )}
          
          {/* Overlay de carga */}
          {uploading && (
            <div className="upload-overlay">
              <div className="spinner"></div>
              <span className="upload-text">Uploading...</span>
            </div>
          )}
        </div>

        <div className="image-info">
          <h4 className="image-title">Product Image</h4>
          <p className="image-hint">
            JPG, PNG or WebP. Max 5MB. Recommended: 800x800px or higher.
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
        disabled={disabled || uploading}
      />

      {/* Mensaje de éxito/error */}
      {message.text && (
        <div className={`upload-message ${message.type}`}>
          <span className="message-icon">
            {message.type === 'success' ? '✅' : '⚠️'}
          </span>
          <span className="message-text">{message.text}</span>
        </div>
      )}

      {/* Botones de acción */}
      <div className="upload-actions">
        {!selectedFile ? (
          // Vista: Sin archivo seleccionado
          <button
            type="button"
            onClick={triggerFileInput}
            className="btn-upload btn-select"
            disabled={disabled || uploading}
          >
            📁 {currentImageUrl ? 'Change Image' : 'Select Image'}
          </button>
        ) : (
          // Vista: Archivo seleccionado (mostrando preview)
          <>
            <button
              type="button"
              onClick={handleUpload}
              className="btn-upload btn-confirm"
              disabled={disabled || uploading}
            >
              {uploading ? '⏳ Uploading...' : '✓ Upload Image'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="btn-upload btn-cancel"
              disabled={disabled || uploading}
            >
              ✕ Cancel
            </button>
          </>
        )}
      </div>

      {/* Estilos CSS */}
      <style jsx>{`
        .image-upload-container {
          padding: var(--spacing-lg);
          background: var(--color-background);
          border-radius: var(--radius-lg);
          border: 2px dashed var(--color-accent);
        }

        .image-preview-section {
          display: flex;
          align-items: center;
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-lg);
        }

        .image-preview {
          position: relative;
          width: 150px;
          height: 150px;
          flex-shrink: 0;
          border-radius: var(--radius-md);
          overflow: hidden;
          background: var(--color-white);
          border: 2px solid var(--color-accent-light);
        }

        .preview-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .no-image-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: var(--color-accent-light);
          color: var(--color-muted);
        }

        .placeholder-icon {
          font-size: 3rem;
          margin-bottom: var(--spacing-xs);
        }

        .placeholder-text {
          font-size: var(--text-sm);
          font-weight: var(--font-medium);
        }

        .upload-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm);
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

        .upload-text {
          color: var(--color-white);
          font-size: var(--text-sm);
          font-weight: var(--font-medium);
        }

        .image-info {
          flex: 1;
        }

        .image-title {
          font-family: var(--font-body);
          font-weight: var(--font-semibold);
          font-size: var(--text-base);
          color: var(--color-dark);
          margin: 0 0 var(--spacing-xs) 0;
        }

        .image-hint {
          font-size: var(--text-sm);
          color: var(--color-muted);
          margin: 0;
          line-height: 1.5;
        }

        .file-input-hidden {
          display: none;
        }

        .upload-message {
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-md);
          font-size: var(--text-sm);
        }

        .upload-message.success {
          background: rgba(34, 197, 94, 0.1);
          color: var(--color-success);
          border: 1px solid var(--color-success);
        }

        .upload-message.error {
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

        .upload-actions {
          display: flex;
          gap: var(--spacing-sm);
        }

        .btn-upload {
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--radius-md);
          font-family: var(--font-body);
          font-weight: var(--font-medium);
          font-size: var(--text-sm);
          cursor: pointer;
          transition: all 0.2s ease;
          border: 2px solid transparent;
          flex: 1;
        }

        .btn-upload:disabled {
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

        .btn-confirm {
          background: var(--color-success);
          color: var(--color-white);
          border-color: var(--color-success);
        }

        .btn-confirm:hover:not(:disabled) {
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
          .image-preview-section {
            flex-direction: column;
            text-align: center;
          }

          .upload-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductImageUpload;