// src/components/auth/LoginForm.jsx
// Formulario de inicio de sesión con validación y estilos consistentes

import React, { useState } from 'react';

const LoginForm = ({ onSubmit, onSwitchToRegister, loading = false }) => {
  // useState: Estado para manejar los datos del formulario
  const [formData, setFormData] = useState({
    email: '',      // Campo email del usuario
    password: ''    // Campo contraseña del usuario
  });

  // useState: Estado para manejar errores de validación
  const [errors, setErrors] = useState({});

  // useState: Estado para mostrar/ocultar contraseña
  const [showPassword, setShowPassword] = useState(false);

  // handleChange: Actualiza los datos del formulario cuando el usuario escribe
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Actualizar el valor en formData
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));

    // Limpiar error específico cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: ''
      }));
    }
  };

  // validateForm: Valida los campos del formulario antes de enviar
  const validateForm = () => {
    const newErrors = {};

    // Validación del email
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Validación de la contraseña
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // handleSubmit: Maneja el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevenir comportamiento por defecto del form
    
    // Validar formulario antes de enviar
    if (validateForm()) {
      onSubmit(formData); // Llamar función onSubmit pasada como prop
    }
  };

  // togglePasswordVisibility: Alterna mostrar/ocultar contraseña
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-form-container">
      <div className="form-header">
        <h2 className="heading-secondary">Welcome Back</h2>
        <p className="text-body text-muted">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="login-form">
        {/* Campo Email */}
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`form-input ${errors.email ? 'error' : ''}`}
            placeholder="Enter your email"
            disabled={loading}
          />
          {errors.email && (
            <span className="error-message">{errors.email}</span>
          )}
        </div>

        {/* Campo Contraseña */}
        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <div className="password-input-container">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="Enter your password"
              disabled={loading}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="password-toggle"
              disabled={loading}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {errors.password && (
            <span className="error-message">{errors.password}</span>
          )}
        </div>

        {/* Opciones adicionales */}
        <div className="form-options">
          <label className="checkbox-container">
            <input type="checkbox" />
            <span className="checkmark"></span>
            Remember me
          </label>
          <a href="#" className="forgot-password">
            Forgot password?
          </a>
        </div>

        {/* Botón Submit */}
        <button
          type="submit"
          className={`btn btn-primary form-submit ${loading ? 'loading' : ''}`}
          disabled={loading}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>

        {/* Link para cambiar a registro */}
        <div className="form-footer">
          <p className="text-body text-muted">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="link-button"
              disabled={loading}
            >
              Sign up here
            </button>
          </p>
        </div>
      </form>

      <style jsx>{`
        .login-form-container {
          max-width: 400px;
          margin: 0 auto;
          padding: var(--spacing-2xl);
          background: var(--color-white);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-lg);
        }

        .form-header {
          text-align: center;
          margin-bottom: var(--spacing-2xl);
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .form-label {
          font-family: var(--font-body);
          font-weight: var(--font-medium);
          font-size: var(--text-sm);
          color: var(--color-dark);
        }

        .form-input {
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
          border-color: var(--color-primary);
          background: var(--color-white);
        }

        .form-input.error {
          border-color: var(--color-error);
        }

        .form-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .password-input-container {
          position: relative;
        }

        .password-toggle {
          position: absolute;
          right: var(--spacing-md);
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          font-size: var(--text-lg);
          opacity: 0.7;
          transition: opacity 0.3s ease;
        }

        .password-toggle:hover {
          opacity: 1;
        }

        .password-toggle:disabled {
          cursor: not-allowed;
          opacity: 0.4;
        }

        .error-message {
          color: var(--color-error);
          font-size: var(--text-sm);
          font-weight: var(--font-medium);
        }

        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: var(--spacing-sm) 0;
        }

        .checkbox-container {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          font-size: var(--text-sm);
          cursor: pointer;
        }

        .forgot-password {
          font-size: var(--text-sm);
          color: var(--color-primary);
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .forgot-password:hover {
          color: var(--color-secondary);
        }

        .form-submit {
          width: 100%;
          padding: var(--spacing-md);
          font-weight: var(--font-semibold);
          transition: all 0.3s ease;
        }

        .form-submit.loading {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .form-footer {
          text-align: center;
          margin-top: var(--spacing-lg);
        }

        .link-button {
          background: none;
          border: none;
          color: var(--color-primary);
          font-weight: var(--font-medium);
          cursor: pointer;
          text-decoration: underline;
          transition: color 0.3s ease;
        }

        .link-button:hover {
          color: var(--color-secondary);
        }

        .link-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .login-form-container {
            margin: var(--spacing-md);
            padding: var(--spacing-lg);
          }

          .form-options {
            flex-direction: column;
            gap: var(--spacing-sm);
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginForm;