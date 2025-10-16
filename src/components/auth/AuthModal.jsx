// src/components/auth/AuthModal.jsx
// Modal con mejor manejo de errores para verificación de email

import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { signIn, signUp } from '../../services/authService';

const AuthModal = ({ isOpen, onClose, onAuthSuccess, initialMode = 'login' }) => {
  // Estados existentes...
  const [mode, setMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // handleLogin mejorado con mejor debug
  const handleLogin = async (loginData) => {
    try {
      setLoading(true);
      setAuthError('');
      setSuccessMessage('');

      console.log('🔐 Login attempt with:', loginData.email);
      
      const result = await signIn(loginData);
      console.log('🔐 Login result:', result);
      
      if (result.success) {
        console.log('✅ Login successful! User:', result.user);
        console.log('✅ Profile:', result.profile);
        
        // Crear objeto de usuario para el componente padre
        const userData = {
          id: result.user.id,
          email: result.user.email,
          firstName: result.profile?.first_name || result.user.user_metadata?.first_name || 'User',
          lastName: result.profile?.last_name || result.user.user_metadata?.last_name || '',
          profile: result.profile,
          session: result.session
        };
        
        console.log('✅ Calling onAuthSuccess with:', userData);
        
        setSuccessMessage('Login successful! Welcome back!');
        
        setTimeout(() => {
          onAuthSuccess(userData);
          onClose();
        }, 1000);
        
      } else {
        console.error('❌ Login failed:', result.error);
        
        // Mensajes de error más específicos
        let displayError = result.error;
        
        if (result.error.includes('Invalid login credentials')) {
          displayError = 'Invalid email or password. Please check your credentials.';
        } else if (result.error.includes('Email not confirmed')) {
          displayError = 'Please verify your email address before signing in. Check your inbox for a verification email.';
        } else if (result.error.includes('signup')) {
          displayError = 'This email is not registered. Please sign up first.';
        }
        
        setAuthError(displayError);
      }

    } catch (error) {
      console.error('❌ Login error:', error);
      setAuthError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // handleRegister mejorado
  const handleRegister = async (registerData) => {
    try {
      setLoading(true);
      setAuthError('');
      setSuccessMessage('');

      console.log('📝 Registration attempt with:', registerData.email);
      
      const result = await signUp(registerData);
      console.log('📝 Registration result:', result);
      
      if (result.success) {
        console.log('✅ Registration successful!');
        
        // Verificar si necesita confirmación de email
        if (result.message?.includes('verify') || result.message?.includes('email')) {
          setSuccessMessage(
            'Registration successful! Please check your email and click the verification link before signing in.'
          );
          
          // Mostrar mensaje por más tiempo y cambiar a login
          setTimeout(() => {
            setMode('login');
            setSuccessMessage('');
            setAuthError('Please verify your email before signing in.');
          }, 4000);
          
        } else {
          // Si no necesita verificación, autenticar inmediatamente
          const userData = {
            id: result.user.id,
            email: result.user.email,
            firstName: registerData.firstName,
            lastName: registerData.lastName,
            profile: null,
            session: result.session
          };
          
          setSuccessMessage('Registration and login successful!');
          
          setTimeout(() => {
            onAuthSuccess(userData);
            onClose();
          }, 1000);
        }
        
      } else {
        console.error('❌ Registration failed:', result.error);
        setAuthError(result.error);
      }

    } catch (error) {
      console.error('❌ Registration error:', error);
      setAuthError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resto de funciones...
  const switchToLogin = () => {
    setMode('login');
    setAuthError('');
    setSuccessMessage('');
  };

  const switchToRegister = () => {
    setMode('register');
    setAuthError('');
    setSuccessMessage('');
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && !loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="modal-container">
        <button 
          onClick={onClose}
          className="close-button"
          disabled={loading}
        >
          ✕
        </button>

        {/* Banner de error mejorado */}
        {authError && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            <div className="error-content">
              <span className="error-text">{authError}</span>
              {authError.includes('verify') && (
                <small className="error-hint">
                  Didn't receive the email? Check your spam folder or contact support.
                </small>
              )}
            </div>
            <button 
              onClick={() => setAuthError('')}
              className="error-dismiss"
              disabled={loading}
            >
              ✕
            </button>
          </div>
        )}

        {/* Banner de éxito */}
        {successMessage && (
          <div className="success-banner">
            <span className="success-icon">✅</span>
            <span className="success-text">{successMessage}</span>
          </div>
        )}

        {/* Formularios */}
        {mode === 'login' ? (
          <LoginForm
            onSubmit={handleLogin}
            onSwitchToRegister={switchToRegister}
            loading={loading}
          />
        ) : (
          <RegisterForm
            onSubmit={handleRegister}
            onSwitchToLogin={switchToLogin}
            loading={loading}
          />
        )}

        {/* Debug info (remover en producción) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="debug-info">
            <small>Debug: Mode={mode}, Loading={loading.toString()}</small>
          </div>
        )}
      </div>

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
          max-width: 100%;
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
          transform: none;
        }

        .error-banner {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          background: var(--color-error);
          color: var(--color-white);
          padding: var(--spacing-md);
          display: flex;
          align-items: flex-start;
          gap: var(--spacing-sm);
          border-radius: var(--radius-xl) var(--radius-xl) 0 0;
          z-index: 5;
          animation: slideDown 0.3s ease-out;
        }

        .error-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }

        .error-text {
          font-weight: var(--font-medium);
          font-size: var(--text-sm);
        }

        .error-hint {
          font-size: var(--text-xs);
          opacity: 0.9;
          font-style: italic;
        }

        .success-banner {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          background: var(--color-success);
          color: var(--color-white);
          padding: var(--spacing-md);
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          border-radius: var(--radius-xl) var(--radius-xl) 0 0;
          z-index: 5;
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .error-icon,
        .success-icon {
          font-size: var(--text-lg);
        }

        .success-text {
          flex: 1;
          font-weight: var(--font-medium);
          font-size: var(--text-sm);
        }

        .error-dismiss {
          background: none;
          border: none;
          color: var(--color-white);
          cursor: pointer;
          padding: var(--spacing-xs);
          border-radius: 4px;
          transition: background 0.3s ease;
          align-self: flex-start;
        }

        .error-dismiss:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.2);
        }

        .error-dismiss:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .debug-info {
          position: absolute;
          bottom: 10px;
          left: 10px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 10px;
          z-index: 1000;
        }

        /* Ajustes para pantallas móviles */
        @media (max-width: 768px) {
          .modal-overlay {
            padding: var(--spacing-sm);
            align-items: flex-start;
            padding-top: var(--spacing-xl);
          }

          .modal-container {
            width: 100%;
            max-height: 85vh;
          }

          .close-button {
            top: var(--spacing-md);
            right: var(--spacing-md);
          }
        }

        /* Mejoras de accesibilidad */
        .modal-overlay:focus {
          outline: none;
        }

        .close-button:focus-visible {
          outline: 2px solid var(--color-primary);
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
};

export default AuthModal;