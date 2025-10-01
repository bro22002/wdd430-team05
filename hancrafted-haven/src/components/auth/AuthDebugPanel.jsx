// src/components/auth/AuthDebugPanel.jsx
// Panel de debugging para verificar configuración de autenticación
// ⚠️ SOLO PARA DESARROLLO - Remover en producción

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const AuthDebugPanel = () => {
  // Estados para almacenar información de debugging
  const [debugInfo, setDebugInfo] = useState({
    supabaseUrl: '',
    hasAnonKey: false,
    sessionExists: false,
    currentUser: null,
    users: [],
    connectionStatus: 'checking'
  });

  const [testCredentials, setTestCredentials] = useState({
    email: 'test@handcrafted.com',
    password: 'Test123456!'
  });

  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // useEffect: Verificar configuración al montar el componente
  useEffect(() => {
    checkConfiguration();
  }, []);

  /**
   * checkConfiguration: Verifica toda la configuración de Supabase
   */
  const checkConfiguration = async () => {
    const info = {};

    // 1. Verificar variables de entorno
    info.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET';
    info.hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // 2. Verificar sesión actual
    try {
      const { data: { session } } = await supabase.auth.getSession();
      info.sessionExists = !!session;
      info.currentUser = session?.user?.email || null;
    } catch (error) {
      console.error('Error getting session:', error);
      info.connectionStatus = 'error';
    }

    // 3. Verificar conexión a Supabase
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (error) {
        info.connectionStatus = 'error';
        info.connectionError = error.message;
      } else {
        info.connectionStatus = 'connected';
      }
    } catch (error) {
      info.connectionStatus = 'error';
      info.connectionError = error.message;
    }

    // 4. Intentar listar usuarios (solo funciona con admin key)
    try {
      const { data: { users }, error } = await supabase.auth.admin.listUsers();
      if (!error) {
        info.users = users.map(u => ({
          email: u.email,
          confirmed: u.email_confirmed_at ? true : false,
          created: u.created_at
        }));
      }
    } catch (error) {
      // Normal que falle con anon key
      info.users = 'Cannot list users with anon key';
    }

    setDebugInfo(info);
  };

  /**
   * testLogin: Prueba hacer login con las credenciales de test
   */
  const testLogin = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      console.log('🧪 Testing login with:', testCredentials.email);

      // Intentar login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testCredentials.email,
        password: testCredentials.password
      });

      if (error) {
        console.error('❌ Login test failed:', error);
        setTestResult({
          success: false,
          error: error.message,
          code: error.code || error.status
        });
      } else {
        console.log('✅ Login test successful!', data);
        setTestResult({
          success: true,
          user: data.user.email,
          hasSession: !!data.session
        });
        
        // Actualizar info
        await checkConfiguration();
      }
    } catch (error) {
      console.error('💥 Login test error:', error);
      setTestResult({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * testSignOut: Prueba cerrar sesión
   */
  const testSignOut = async () => {
    try {
      await supabase.auth.signOut();
      console.log('✅ Sign out successful');
      await checkConfiguration();
      setTestResult(null);
    } catch (error) {
      console.error('❌ Sign out failed:', error);
    }
  };

  /**
   * getStatusColor: Retorna color según el estado
   */
  const getStatusColor = () => {
    switch (debugInfo.connectionStatus) {
      case 'connected':
        return '#22c55e';
      case 'error':
        return '#ef4444';
      default:
        return '#f59e0b';
    }
  };

  /**
   * getStatusIcon: Retorna icono según el estado
   */
  const getStatusIcon = () => {
    switch (debugInfo.connectionStatus) {
      case 'connected':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '⏳';
    }
  };

  return (
    <div className="debug-panel">
      <div className="debug-header">
        <h3>🔧 Auth Debug Panel</h3>
        <button onClick={checkConfiguration} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      {/* Sección: Estado de Conexión */}
      <div className="debug-section">
        <h4>Connection Status</h4>
        <div className="status-row">
          <span className="status-icon">{getStatusIcon()}</span>
          <span className="status-text" style={{ color: getStatusColor() }}>
            {debugInfo.connectionStatus.toUpperCase()}
          </span>
        </div>
        {debugInfo.connectionError && (
          <div className="error-detail">
            Error: {debugInfo.connectionError}
          </div>
        )}
      </div>

      {/* Sección: Configuración */}
      <div className="debug-section">
        <h4>Environment Variables</h4>
        <div className="config-item">
          <span className="config-label">SUPABASE_URL:</span>
          <span className="config-value">
            {debugInfo.supabaseUrl.substring(0, 30)}...
          </span>
          <span className="config-status">
            {debugInfo.supabaseUrl !== 'NOT SET' ? '✅' : '❌'}
          </span>
        </div>
        <div className="config-item">
          <span className="config-label">ANON_KEY:</span>
          <span className="config-value">
            {debugInfo.hasAnonKey ? '••••••••••' : 'NOT SET'}
          </span>
          <span className="config-status">
            {debugInfo.hasAnonKey ? '✅' : '❌'}
          </span>
        </div>
      </div>

      {/* Sección: Sesión Actual */}
      <div className="debug-section">
        <h4>Current Session</h4>
        <div className="config-item">
          <span className="config-label">Session:</span>
          <span className="config-value">
            {debugInfo.sessionExists ? 'Active' : 'None'}
          </span>
          <span className="config-status">
            {debugInfo.sessionExists ? '✅' : '⚪'}
          </span>
        </div>
        {debugInfo.currentUser && (
          <div className="config-item">
            <span className="config-label">User:</span>
            <span className="config-value">{debugInfo.currentUser}</span>
            <button onClick={testSignOut} className="small-btn">
              Sign Out
            </button>
          </div>
        )}
      </div>

      {/* Sección: Test Login */}
      <div className="debug-section test-section">
        <h4>Test Login</h4>
        <div className="test-form">
          <input
            type="email"
            placeholder="Email"
            value={testCredentials.email}
            onChange={(e) => setTestCredentials({
              ...testCredentials,
              email: e.target.value
            })}
            className="test-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={testCredentials.password}
            onChange={(e) => setTestCredentials({
              ...testCredentials,
              password: e.target.value
            })}
            className="test-input"
          />
          <button
            onClick={testLogin}
            disabled={loading}
            className="test-btn"
          >
            {loading ? 'Testing...' : 'Test Login'}
          </button>
        </div>

        {/* Resultado del test */}
        {testResult && (
          <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
            <div className="result-header">
              {testResult.success ? '✅ Success' : '❌ Failed'}
            </div>
            {testResult.success ? (
              <div>
                <div>User: {testResult.user}</div>
                <div>Session: {testResult.hasSession ? 'Created' : 'None'}</div>
              </div>
            ) : (
              <div>
                <div><strong>Error:</strong> {testResult.error}</div>
                {testResult.code && <div>Code: {testResult.code}</div>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sección: Instrucciones */}
      <div className="debug-section instructions">
        <h4>🆘 Quick Fixes</h4>
        <ul>
          <li>
            <strong>No .env.local?</strong> Create it in root with:
            <code>
              NEXT_PUBLIC_SUPABASE_URL=...
              <br />
              NEXT_PUBLIC_SUPABASE_ANON_KEY=...
            </code>
          </li>
          <li>
            <strong>Connection Error?</strong> Check your Supabase URL and keys
          </li>
          <li>
            <strong>Login Failed?</strong> Create a test user in Supabase Dashboard
          </li>
          <li>
            <strong>Changed .env?</strong> Restart the dev server
          </li>
        </ul>
      </div>

      {/* Estilos */}
      <style jsx>{`
        .debug-panel {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 400px;
          max-height: 80vh;
          overflow-y: auto;
          background: #1f2937;
          color: #f3f4f6;
          border-radius: 12px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
          padding: 20px;
          font-family: 'Monaco', 'Courier New', monospace;
          font-size: 12px;
          z-index: 9999;
        }

        .debug-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid #374151;
        }

        .debug-header h3 {
          margin: 0;
          font-size: 16px;
          color: #60a5fa;
        }

        .refresh-btn {
          background: #374151;
          border: none;
          color: #f3f4f6;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
        }

        .refresh-btn:hover {
          background: #4b5563;
        }

        .debug-section {
          margin-bottom: 20px;
          padding: 15px;
          background: #111827;
          border-radius: 8px;
          border-left: 3px solid #3b82f6;
        }

        .debug-section h4 {
          margin: 0 0 12px 0;
          font-size: 13px;
          color: #93c5fd;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-row {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          font-weight: bold;
        }

        .status-icon {
          font-size: 18px;
        }

        .error-detail {
          margin-top: 8px;
          padding: 8px;
          background: #7f1d1d;
          border-radius: 4px;
          font-size: 11px;
          color: #fca5a5;
        }

        .config-item {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .config-label {
          color: #9ca3af;
          min-width: 100px;
        }

        .config-value {
          flex: 1;
          color: #d1d5db;
          font-family: monospace;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .config-status {
          font-size: 14px;
        }

        .small-btn {
          background: #991b1b;
          border: none;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 10px;
        }

        .small-btn:hover {
          background: #b91c1c;
        }

        .test-section {
          border-left-color: #8b5cf6;
        }

        .test-form {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .test-input {
          padding: 8px;
          background: #374151;
          border: 1px solid #4b5563;
          border-radius: 4px;
          color: #f3f4f6;
          font-size: 12px;
        }

        .test-input:focus {
          outline: none;
          border-color: #8b5cf6;
        }

        .test-btn {
          padding: 10px;
          background: #8b5cf6;
          border: none;
          color: white;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
          font-size: 12px;
        }

        .test-btn:hover:not(:disabled) {
          background: #7c3aed;
        }

        .test-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .test-result {
          margin-top: 12px;
          padding: 12px;
          border-radius: 6px;
          font-size: 11px;
        }

        .test-result.success {
          background: #064e3b;
          border: 1px solid #059669;
          color: #6ee7b7;
        }

        .test-result.error {
          background: #7f1d1d;
          border: 1px solid #dc2626;
          color: #fca5a5;
        }

        .result-header {
          font-weight: bold;
          margin-bottom: 8px;
          font-size: 12px;
        }

        .instructions {
          border-left-color: #f59e0b;
        }

        .instructions ul {
          margin: 0;
          padding-left: 20px;
        }

        .instructions li {
          margin-bottom: 12px;
          line-height: 1.5;
        }

        .instructions code {
          display: block;
          margin-top: 6px;
          padding: 8px;
          background: #374151;
          border-radius: 4px;
          font-size: 10px;
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .debug-panel {
            width: calc(100% - 40px);
            bottom: 10px;
            right: 10px;
            max-height: 70vh;
          }
        }
      `}</style>
    </div>
  );
};

export default AuthDebugPanel;