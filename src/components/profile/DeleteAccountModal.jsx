// Modal con doble confirmación para eliminar cuenta de vendedor

import React, { useState } from 'react';
import { deleteSellerAccount } from '../../services/profileService';

/**
 * DeleteAccountModal: Modal para eliminar cuenta de vendedor
 * 
 * Seguridad:
 * - Requiere que el usuario escriba "DELETE MY ACCOUNT" exactamente
 * - Muestra advertencias claras sobre lo que se eliminará
 * - Requiere confirmación adicional con checkbox
 * 
 * @param {boolean} isOpen - Si el modal está visible
 * @param {function} onClose - Función para cerrar el modal
 * @param {Object} currentUser - Usuario actual
 * @param {function} onAccountDeleted - Callback cuando se elimina exitosamente
 */
const DeleteAccountModal = ({ 
  isOpen, 
  onClose, 
  currentUser,
  onAccountDeleted 
}) => {

  // ============================================
  // 1. ESTADOS
  // ============================================
  
  // useState: Texto de confirmación que el usuario debe escribir
  const [confirmationText, setConfirmationText] = useState('');

  // useState: Checkbox de confirmación adicional
  const [confirmationChecked, setConfirmationChecked] = useState(false);

  // useState: Estado de carga durante la eliminación
  const [loading, setLoading] = useState(false);

  // useState: Mensajes de error
  const [error, setError] = useState('');

  // El texto exacto que el usuario debe escribir
  const REQUIRED_TEXT = 'DELETE MY ACCOUNT';

  // ============================================
  // 2. FUNCIONES
  // ============================================
  
  /**
   * handleConfirmationChange: Maneja cambios en el campo de confirmación
   * 
   * @param {Event} e - Evento del input
   */
  const handleConfirmationChange = (e) => {
    setConfirmationText(e.target.value);
    // Limpiar error cuando el usuario empieza a escribir
    if (error) {
      setError('');
    }
  };

  /**
   * handleCheckboxChange: Maneja el checkbox de confirmación
   * 
   * @param {Event} e - Evento del checkbox
   */
  const handleCheckboxChange = (e) => {
    setConfirmationChecked(e.target.checked);
  };

  /**
   * validateForm: Valida que todas las confirmaciones estén completas
   * 
   * @returns {boolean} - true si es válido
   */
  const validateForm = () => {
    // Verificar que el texto coincida exactamente
    if (confirmationText !== REQUIRED_TEXT) {
      setError(`You must type "${REQUIRED_TEXT}" exactly to confirm.`);
      return false;
    }

    // Verificar que el checkbox esté marcado
    if (!confirmationChecked) {
      setError('You must confirm that you understand this action is permanent.');
      return false;
    }

    return true;
  };

  /**
   * handleDeleteAccount: Procesa la eliminación de cuenta
   * 
   * @param {Event} e - Evento del formulario
   */
  const handleDeleteAccount = async (e) => {
    e.preventDefault();

    // Validar formulario
    if (!validateForm()) {
      return;
    }

    // Confirmación final con alert nativo
    const finalConfirm = window.confirm(
      '⚠️ FINAL WARNING ⚠️\n\n' +
      'This will PERMANENTLY delete:\n' +
      '• Your seller account\n' +
      '• All your products\n' +
      '• All your product images\n' +
      '• All messages received\n\n' +
      'This action CANNOT be undone!\n\n' +
      'Are you absolutely sure?'
    );

    if (!finalConfirm) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      console.log('🗑️ Deleting seller account...');

      // Llamar al servicio de eliminación
      const result = await deleteSellerAccount(currentUser.id, confirmationText);

      if (result.success) {
        console.log('✅ Account deleted successfully');
        
        // Notificar al componente padre
        if (onAccountDeleted) {
          onAccountDeleted();
        }

        // El servicio ya cerró la sesión, redirigir será manejado por el padre

      } else {
        console.error('❌ Failed to delete account:', result.error);
        setError(result.error || 'Failed to delete account. Please try again.');
      }

    } catch (err) {
      console.error('❌ Delete account error:', err);
      setError('An unexpected error occurred. Please try again or contact support.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * handleClose: Cierra el modal y resetea el estado
   */
  const handleClose = () => {
    if (!loading) {
      setConfirmationText('');
      setConfirmationChecked(false);
      setError('');
      onClose();
    }
  };

  /**
   * handleOverlayClick: Cierra el modal al hacer clic fuera
   * 
   * @param {Event} e - Evento del click
   */
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      handleClose();
    }
  };

  // Si el modal no está abierto, no renderizar
  if (!isOpen) return null;

  // ============================================
  // 3. RENDERIZADO
  // ============================================

  return (
    <div 
      className="modal-overlay"
      onClick={handleOverlayClick}
    >
      <div className="modal-container">
        {/* Botón de cerrar */}
        <button 
          onClick={handleClose}
          className="close-button"
          disabled={loading}
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Encabezado de advertencia */}
        <div className="modal-header danger">
          <div className="header-icon">⚠️</div>
          <h2 className="heading-secondary">Delete Seller Account</h2>
          <p className="text-body warning-text">
            This action is <strong>PERMANENT</strong> and <strong>CANNOT BE UNDONE</strong>
          </p>
        </div>

        {/* Sección de advertencias */}
        <div className="warning-section">
          <h3 className="warning-title">⚠️ What will be deleted:</h3>
          <ul className="warning-list">
            <li>✗ Your seller/artisan profile</li>
            <li>✗ All your products ({currentUser?.productCount || 0} items)</li>
            <li>✗ All product images and photos</li>
            <li>✗ Your shop information</li>
            <li>✗ All messages received from buyers</li>
            <li>✗ Your profile picture</li>
          </ul>

          <div className="info-box">
            <strong>💡 Alternative:</strong> If you just want to take a break, 
            you can simply stop adding products or deactivate your shop temporarily 
            instead of deleting your account.
          </div>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            <span className="error-text">{error}</span>
          </div>
        )}

        {/* Formulario de confirmación */}
        <form onSubmit={handleDeleteAccount} className="delete-form">
          
          {/* Campo de confirmación por texto */}
          <div className="form-section">
            <label htmlFor="confirmation" className="form-label">
              Type <strong>"{REQUIRED_TEXT}"</strong> to confirm:
            </label>
            <input
              type="text"
              id="confirmation"
              value={confirmationText}
              onChange={handleConfirmationChange}
              className={`form-input ${error && confirmationText !== REQUIRED_TEXT ? 'error' : ''}`}
              disabled={loading}
              placeholder={REQUIRED_TEXT}
              autoComplete="off"
            />
            <p className="form-hint">
              Text is case-sensitive and must match exactly
            </p>
          </div>

          {/* Checkbox de confirmación adicional */}
          <div className="form-section">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={confirmationChecked}
                onChange={handleCheckboxChange}
                disabled={loading}
              />
              <span className="checkmark"></span>
              <span className="checkbox-text">
                I understand that this action is <strong>permanent and irreversible</strong>. 
                All my data will be deleted and cannot be recovered.
              </span>
            </label>
          </div>

          {/* Botones de acción */}
          <div className="form-actions">
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-danger"
              disabled={loading || confirmationText !== REQUIRED_TEXT || !confirmationChecked}
            >
              {loading ? 'Deleting Account...' : 'Delete My Account Permanently'}
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
          background: rgba(0, 0, 0, 0.7);
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
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
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
          text-align: center;
          background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
          border-bottom: 3px solid var(--color-error);
        }

        .header-icon {
          font-size: 3rem;
          margin-bottom: var(--spacing-md);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        .warning-text {
          color: var(--color-error);
          font-weight: var(--font-bold);
          margin: 0;
        }

        .warning-section {
          padding: var(--spacing-2xl);
          background: #fff7ed;
          border-left: 4px solid var(--color-warning);
        }

        .warning-title {
          font-size: var(--text-lg);
          font-weight: var(--font-bold);
          color: var(--color-error);
          margin: 0 0 var(--spacing-md) 0;
        }

        .warning-list {
          list-style: none;
          padding: 0;
          margin: 0 0 var(--spacing-lg) 0;
        }

        .warning-list li {
          padding: var(--spacing-sm) 0;
          font-size: var(--text-base);
          color: var(--color-dark);
          font-weight: var(--font-medium);
        }

        .info-box {
          padding: var(--spacing-md);
          background: var(--color-white);
          border-radius: var(--radius-md);
          border: 2px solid var(--color-primary);
          font-size: var(--text-sm);
          line-height: 1.6;
          color: var(--color-dark);
        }

        .error-banner {
          margin: 0 var(--spacing-2xl);
          margin-top: var(--spacing-lg);
          padding: var(--spacing-md);
          background: var(--color-error);
          color: var(--color-white);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .error-icon {
          font-size: var(--text-lg);
        }

        .error-text {
          flex: 1;
          font-weight: var(--font-medium);
          font-size: var(--text-sm);
        }

        .delete-form {
          padding: var(--spacing-2xl);
        }

        .form-section {
          margin-bottom: var(--spacing-xl);
        }

        .form-label {
          display: block;
          font-family: var(--font-body);
          font-weight: var(--font-medium);
          font-size: var(--text-base);
          color: var(--color-dark);
          margin-bottom: var(--spacing-sm);
        }

        .form-input {
          width: 100%;
          padding: var(--spacing-md);
          border: 2px solid var(--color-accent);
          border-radius: var(--radius-md);
          font-family: var(--font-body);
          font-size: var(--text-base);
          transition: border-color 0.3s ease;
          background: var(--color-background);
        }

        .form-input:focus {
          outline: none;
          border-color: var(--color-error);
          background: var(--color-white);
        }

        .form-input.error {
          border-color: var(--color-error);
          background: #fee2e2;
        }

        .form-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .form-hint {
          margin-top: var(--spacing-xs);
          font-size: var(--text-xs);
          color: var(--color-muted);
          font-style: italic;
        }

        .checkbox-container {
          display: flex;
          align-items: flex-start;
          gap: var(--spacing-sm);
          cursor: pointer;
          padding: var(--spacing-md);
          background: var(--color-background);
          border-radius: var(--radius-md);
          border: 2px solid var(--color-accent);
        }

        .checkbox-text {
          flex: 1;
          font-size: var(--text-sm);
          line-height: 1.6;
          color: var(--color-dark);
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: var(--spacing-md);
          margin-top: var(--spacing-xl);
          padding-top: var(--spacing-xl);
          border-top: 2px solid var(--color-accent-light);
        }

        .btn-danger {
          background: var(--color-error);
          color: var(--color-white);
          border: 2px solid var(--color-error);
          padding: var(--spacing-md) var(--spacing-lg);
          border-radius: var(--radius-md);
          font-family: var(--font-body);
          font-weight: var(--font-semibold);
          font-size: var(--text-base);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-danger:hover:not(:disabled) {
          background: #dc2626;
          border-color: #dc2626;
          transform: scale(1.02);
        }

        .btn-danger:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
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

export default DeleteAccountModal;