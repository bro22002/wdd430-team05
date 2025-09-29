// src/components/auth/RegisterForm.jsx
// Formulario de registro con validación completa y campos adicionales

import React, { useState } from 'react';

const RegisterForm = ({ onSubmit, onSwitchToLogin, loading = false }) => {
  // useState: Estado para manejar todos los datos del formulario de registro
  const [formData, setFormData] = useState({
    firstName: '',      // Nombre del usuario
    lastName: '',       // Apellido del usuario
    email: '',          // Email único del usuario
    password: '',       // Contraseña del usuario
    confirmPassword: '', // Confirmación de contraseña
    acceptTerms: false  // Aceptación de términos y condiciones
  });

  // useState: Estado para manejar errores de validación específicos
  const [errors, setErrors] = useState({});

  // useState: Estados para mostrar/ocultar contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // handleChange: Maneja cambios en campos de texto
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Para checkboxes usamos 'checked', para otros inputs usamos 'value'
    const fieldValue = type === 'checkbox' ? checked : value;
    
    // Actualizar formData con el nuevo valor
    setFormData(prevData => ({
      ...prevData,
      [name]: fieldValue
    }));

    // Limpiar error específico cuando el usuario empiece a corregir
    if (errors[name]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: ''
      }));
    }
  };

  // validateForm: Función completa de validación del formulario
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

    // Validación del email
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validación de la contraseña
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    // Validación de confirmación de contraseña
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Validación de términos y condiciones
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // handleSubmit: Maneja el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevenir comportamiento por defecto

    // Validar antes de enviar
    if (validateForm()) {
      // Crear objeto con datos limpios para enviar
      const cleanData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password
      };
      
      onSubmit(cleanData); // Llamar función proporcionada por el componente padre
    }
  };

  // getPasswordStrength: Calcula la fortaleza de la contraseña
  const getPasswordStrength = () => {
    const password = formData.password;
    let strength = 0;

    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    return strength;
  };

  // getStrengthColor: Retorna color basado en fortaleza de contraseña
  const getStrengthColor = () => {
    const strength = getPasswordStrength();
    if (strength <= 2) return '#ef4444'; // Rojo - Débil
    if (strength <= 3) return '#f59e0b'; // Amarillo - Medio
    return '#22c55e'; // Verde - Fuerte
  };

  // getStrengthText: Retorna texto descriptivo de fortaleza
  const getStrengthText = () => {
    const strength = getPasswordStrength();
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Medium';
    return 'Strong';
  };

  return (
    <div className="register-form-container">
      <div className="form-header">
        <h2 className="heading-secondary">Create Account</h2>
        <p className="text-body text-muted">Join our artisan community</p>
      </div>

      <form onSubmit={handleSubmit} className="register-form">
        {/* Campos de Nombre */}
        <div className="form-row">
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
              placeholder="Enter your first name"
              disabled={loading}
            />
            {errors.firstName && (
              <span className="error-message">{errors.firstName}</span>
            )}
          </div>

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
              placeholder="Enter your last name"
              disabled={loading}
            />
            {errors.lastName && (
              <span className="error-message">{errors.lastName}</span>
            )}
          </div>
        </div>

        {/* Campo Email */}
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`form-input ${errors.email ? 'error' : ''}`}
            placeholder="Enter your email address"
            disabled={loading}
          />
          {errors.email && (
            <span className="error-message">{errors.email}</span>
          )}
        </div>

        {/* Campo Contraseña */}
        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Password *
          </label>
          <div className="password-input-container">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="Create a secure password"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle"
              disabled={loading}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          
          {/* Indicador de fortaleza de contraseña */}
          {formData.password && (
            <div className="password-strength">
              <div className="strength-bar">
                <div 
                  className="strength-fill"
                  style={{
                    width: `${(getPasswordStrength() / 5) * 100}%`,
                    backgroundColor: getStrengthColor()
                  }}
                ></div>
              </div>
              <span 
                className="strength-text"
                style={{ color: getStrengthColor() }}
              >
                {getStrengthText()}
              </span>
            </div>
          )}
          
          {errors.password && (
            <span className="error-message">{errors.password}</span>
          )}
        </div>

        {/* Campo Confirmar Contraseña */}
        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label">
            Confirm Password *
          </label>
          <div className="password-input-container">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
              placeholder="Confirm your password"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="password-toggle"
              disabled={loading}
            >
              {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {errors.confirmPassword && (
            <span className="error-message">{errors.confirmPassword}</span>
          )}
        </div>

        {/* Checkbox Términos y Condiciones */}
        <div className="form-group">
          <label className="checkbox-container">
            <input
              type="checkbox"
              name="acceptTerms"
              checked={formData.acceptTerms}
              onChange={handleChange}
              disabled={loading}
            />
            <span className="checkmark"></span>
            <span className="checkbox-text">
              I accept the{' '}
              <a href="#" className="terms-link">Terms & Conditions</a>
              {' '}and{' '}
              <a href="#" className="terms-link">Privacy Policy</a>
            </span>
          </label>
          {errors.acceptTerms && (
            <span className="error-message">{errors.acceptTerms}</span>
          )}
        </div>

        {/* Botón Submit */}
        <button
          type="submit"
          className={`btn btn-primary form-submit ${loading ? 'loading' : ''}`}
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>

        {/* Link para cambiar a login */}
        <div className="form-footer">
          <p className="text-body text-muted">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="link-button"
              disabled={loading}
            >
              Sign in here
            </button>
          </p>
        </div>
      </form>

      <style jsx>{`
        .register-form-container {
          max-width: 500px;
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

        .register-form {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
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

        .password-strength {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          margin-top: var(--spacing-xs);
        }

        .strength-bar {
          flex: 1;
          height: 4px;
          background: var(--color-accent);
          border-radius: 2px;
          overflow: hidden;
        }

        .strength-fill {
          height: 100%;
          transition: all 0.3s ease;
        }

        .strength-text {
          font-size: var(--text-xs);
          font-weight: var(--font-medium);
        }

        .error-message {
          color: var(--color-error);
          font-size: var(--text-sm);
          font-weight: var(--font-medium);
        }

        .checkbox-container {
          display: flex;
          align-items: flex-start;
          gap: var(--spacing-sm);
          cursor: pointer;
          line-height: 1.4;
        }

        .checkbox-text {
          font-size: var(--text-sm);
          color: var(--color-dark);
        }

        .terms-link {
          color: var(--color-primary);
          text-decoration: none;
          font-weight: var(--font-medium);
        }

        .terms-link:hover {
          color: var(--color-secondary);
          text-decoration: underline;
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
          .register-form-container {
            margin: var(--spacing-md);
            padding: var(--spacing-lg);
          }

          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default RegisterForm;