import React from 'react';

const LoadingSpinner = ({ size = 'medium', message = 'Loading products...' }) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small': return 'spinner-small';
      case 'large': return 'spinner-large';
      default: return 'spinner-medium';
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
        <p className="text-body text-muted mt-md">{message}</p>
      )}

      <style jsx>{`
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--spacing-3xl) var(--spacing-lg);
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
          border-top: 4px solid var(--color-primary);
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

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;