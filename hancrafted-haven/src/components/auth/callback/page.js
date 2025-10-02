// src/app/auth/callback/page.js
// Página para manejar la verificación de email con App Router

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Obtener parámetros de la URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        console.log('Auth callback params:', { type, accessToken: !!accessToken });

        if (type === 'signup' || type === 'email') {
          // Verificación de email
          if (accessToken && refreshToken) {
            // Establecer la sesión
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });

            if (sessionError) {
              throw sessionError;
            }

            console.log('Email verified successfully!', sessionData);
            setStatus('success');
            setMessage('Email verified successfully! Redirecting...');

            // Redirigir después de 2 segundos
            setTimeout(() => {
              router.push('/');
            }, 2000);
          } else {
            throw new Error('Invalid verification link');
          }
        } else {
          // Otros tipos de autenticación
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            throw error;
          }

          if (data?.session) {
            console.log('Session found, redirecting...');
            setStatus('success');
            setMessage('Authentication successful! Redirecting...');
            
            setTimeout(() => {
              router.push('/');
            }, 1000);
          } else {
            throw new Error('No session found');
          }
        }

      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage(`Verification failed: ${error.message}`);
        
        // Redirigir al home después de 3 segundos
        setTimeout(() => {
          router.push('/');
        }, 3000);
      }
    };

    // Ejecutar después de que el componente se monte
    const timer = setTimeout(handleAuthCallback, 100);
    
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="callback-container">
      <div className="callback-content">
        {status === 'verifying' && (
          <>
            <div className="spinner"></div>
            <h2>Verifying Email</h2>
            <p>{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="success-icon">✅</div>
            <h2>Verification Successful!</h2>
            <p>{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="error-icon">❌</div>
            <h2>Verification Failed</h2>
            <p>{message}</p>
            <button 
              onClick={() => router.push('/')}
              className="btn btn-primary"
            >
              Return to Home
            </button>
          </>
        )}
      </div>

      <style jsx>{`
        .callback-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }

        .callback-content {
          background: white;
          padding: 40px;
          border-radius: 16px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          text-align: center;
          max-width: 400px;
          width: 100%;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        .success-icon,
        .error-icon {
          font-size: 3rem;
          margin-bottom: 20px;
        }

        h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0 0 16px 0;
          color: #1f2937;
        }

        p {
          color: #6b7280;
          margin: 0 0 24px 0;
          line-height: 1.5;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .btn-primary {
          background: #667eea;
          color: white;
        }

        .btn-primary:hover {
          background: #5a6fd8;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .callback-content {
            padding: 30px 20px;
          }
        }
      `}</style>
    </div>
  );
}