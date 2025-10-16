// components/UtilityComponents.jsx
// Componentes de utilidad para estados de carga y error

import React from 'react';

// LoadingSpinner: Componente para mostrar estado de carga
export const LoadingSpinner = ({ size = 'medium', message = 'Loading products...' }) => {
  // getSizeClasses: Determina las clases CSS según el tamaño
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'spinner-small';
      case 'large':
        return 'spinner-large';
      default:
        return 'spinner-medium';
    }
  };

  return (
    <div className="loading-container">
      <div className={`spinner ${getSizeClasses()}`}>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      
      {message && (
        <p className="loading-message">{message}</p>
      )}

      <style jsx>{`
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
        }

        .spinner {
          position: relative;
          display: inline-block;
        }

        .spinner-small {
          width: 40px;
          height: 40px;
        }

        .spinner-medium {
          width: 60px;
          height: 60px;
        }

        .spinner-large {
          width: 80px;
          height: 80px;
        }

        .spinner-ring {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: 4px solid transparent;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
        }

        .spinner-ring:nth-child(1) {
          animation-delay: -0.45s;
        }

        .spinner-ring:nth-child(2) {
          animation-delay: -0.3s;
        }

        .spinner-ring:nth-child(3) {
          animation-delay: -0.15s;
        }

        .loading-message {
          margin-top: 20px;
          color: #6b7280;
          font-size: 1rem;
          font-weight: 500;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

// ErrorMessage: Componente para mostrar mensajes de error
export const ErrorMessage = ({ 
  message = 'Something went wrong', 
  onRetry = null, 
  type = 'error' 
}) => {
  // getErrorIcon: Retorna el icono apropiado según el tipo de error
  const getErrorIcon = () => {
    switch (type) {
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'network':
        return '🌐';
      default:
        return '❌';
    }
  };

  // getErrorTitle: Retorna el título apropiado según el tipo de error
  const getErrorTitle = () => {
    switch (type) {
      case 'warning':
        return 'Warning';
      case 'info':
        return 'Information';
      case 'network':
        return 'Connection Error';
      default:
        return 'Error';
    }
  };

  return (
    <div className={`error-container ${type}`}>
      <div className="error-content">
        <div className="error-icon">
          {getErrorIcon()}
        </div>
        
        <h3 className="error-title">
          {getErrorTitle()}
        </h3>
        
        <p className="error-message">
          {message}
        </p>
        
        {onRetry && (
          <button onClick={onRetry} className="retry-btn">
            Try Again
          </button>
        )}
      </div>

      <style jsx>{`
        .error-container {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
          min-height: 300px;
        }

        .error-content {
          max-width: 400px;
          padding: 40px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .error-container.error .error-content {
          border-left: 4px solid #ef4444;
        }

        .error-container.warning .error-content {
          border-left: 4px solid #f59e0b;
        }

        .error-container.info .error-content {
          border-left: 4px solid #3b82f6;
        }

        .error-container.network .error-content {
          border-left: 4px solid #8b5cf6;
        }

        .error-icon {
          font-size: 3rem;
          margin-bottom: 16px;
        }

        .error-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 12px 0;
          color: #1f2937;
        }

        .error-message {
          color: #6b7280;
          line-height: 1.6;
          margin: 0 0 24px 0;
        }

        .retry-btn {
          background: #667eea;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        .retry-btn:hover {
          background: #5a6fd8;
        }
      `}</style>
    </div>
  );
};

// SkeletonLoader: Componente para mostrar placeholder mientras carga
export const SkeletonLoader = ({ count = 6 }) => {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard key={index} />
      ))}

      <style jsx>{`
        .skeleton-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 30px;
          padding: 20px 0;
        }

        @media (max-width: 768px) {
          .skeleton-grid {
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 20px;
          }
        }
      `}</style>
    </div>
  );
};

// SkeletonCard: Tarjeta de placeholder individual
const SkeletonCard = () => {
  return (
    <div className="skeleton-card">
      <div className="skeleton-image"></div>
      <div className="skeleton-content">
        <div className="skeleton-title"></div>
        <div className="skeleton-description">
          <div className="skeleton-line"></div>
          <div className="skeleton-line short"></div>
        </div>
        <div className="skeleton-footer">
          <div className="skeleton-price"></div>
          <div className="skeleton-rating"></div>
        </div>
        <div className="skeleton-button"></div>
      </div>

      <style jsx>{`
        .skeleton-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
        }

        .skeleton-image {
          width: 100%;
          height: 250px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }

        .skeleton-content {
          padding: 20px;
        }

        .skeleton-title {
          height: 24px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 4px;
          margin-bottom: 12px;
        }

        .skeleton-description {
          margin-bottom: 16px;
        }

        .skeleton-line {
          height: 16px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 4px;
          margin-bottom: 8px;
        }

        .skeleton-line.short {
          width: 70%;
        }

        .skeleton-footer {
          display: flex;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .skeleton-price {
          width: 80px;
          height: 20px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 4px;
        }

        .skeleton-rating {
          width: 100px;
          height: 20px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 4px;
        }

        .skeleton-button {
          width: 100%;
          height: 40px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 8px;
        }

        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
};

// EmptyState: Componente para cuando no hay datos
export const EmptyState = ({ 
  icon = '📦', 
  title = 'No items found', 
  description = 'There are no items to display.',
  actionText = null,
  onAction = null 
}) => {
  return (
    <div className="empty-state">
      <div className="empty-content">
        <div className="empty-icon">{icon}</div>
        <h3 className="empty-title">{title}</h3>
        <p className="empty-description">{description}</p>
        
        {actionText && onAction && (
          <button onClick={onAction} className="empty-action">
            {actionText}
          </button>
        )}
      </div>

      <style jsx>{`
        .empty-state {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
          text-align: center;
        }

        .empty-content {
          max-width: 400px;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 20px;
        }

        .empty-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #374151;
          margin: 0 0 12px 0;
        }

        .empty-description {
          color: #6b7280;
          line-height: 1.6;
          margin: 0 0 24px 0;
        }

        .empty-action {
          background: #667eea;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        .empty-action:hover {
          background: #5a6fd8;
        }
      `}</style>
    </div>
  );
};

export default {
  LoadingSpinner,
  ErrorMessage,
  SkeletonLoader,
  EmptyState
};