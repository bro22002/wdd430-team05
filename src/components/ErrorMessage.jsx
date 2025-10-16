import React from 'react';

const ErrorMessage = ({ 
  message = 'Something went wrong', 
  onRetry = null, 
  type = 'error' 
}) => {
  const getErrorIcon = () => {
    switch (type) {
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      case 'network': return '🌐';
      default: return '❌';
    }
  };

  const getErrorTitle = () => {
    switch (type) {
      case 'warning': return 'Warning';
      case 'info': return 'Information';
      case 'network': return 'Connection Error';
      default: return 'Error';
    }
  };

  return (
    <div className="error-container">
      <div className="error-content">
        <div className="error-icon">
          {getErrorIcon()}
        </div>
        
        <h3 className="heading-section">
          {getErrorTitle()}
        </h3>
        
        <p className="text-body text-muted mb-lg">
          {message}
        </p>
        
        {onRetry && (
          <button onClick={onRetry} className="btn btn-primary">
            Try Again
          </button>
        )}
      </div>

      <style jsx>{`
        .error-container {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--spacing-3xl) var(--spacing-lg);
          text-align: center;
          min-height: 300px;
        }

        .error-content {
          max-width: 400px;
          padding: var(--spacing-2xl);
          background: var(--color-white);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-lg);
          border-left: 4px solid var(--color-error);
        }

        .error-icon {
          font-size: var(--text-4xl);
          margin-bottom: var(--spacing-lg);
        }
      `}</style>
    </div>
  );
};

export default ErrorMessage;