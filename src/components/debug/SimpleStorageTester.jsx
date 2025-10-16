// src/components/debug/SimpleStorageTester.jsx
// Probador simple de Storage - Pégalo temporalmente en tu app

import { useState } from 'react';
import { supabase } from '../../lib/supabase';

const SimpleStorageTester = () => {
  const [testResults, setTestResults] = useState([]);
  const [testing, setTesting] = useState(false);

  const addResult = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [...prev, { message, type, timestamp }]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  /**
   * TEST COMPLETO
   */
  const runCompleteTest = async () => {
    setTesting(true);
    clearResults();
    
    addResult('🚀 Iniciando tests de Storage...', 'info');
    
    // Test 1: Verificar bucket
    addResult('📦 Test 1: Verificando bucket...', 'info');
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const productsBucket = buckets?.find(b => b.name === 'products');
      
      if (productsBucket) {
        addResult(`✅ Bucket 'products' existe`, 'success');
        addResult(`   ${productsBucket.public ? '✅ Es PÚBLICO' : '⚠️ NO es público'}`, 
          productsBucket.public ? 'success' : 'warning');
      } else {
        addResult('❌ Bucket "products" NO existe', 'error');
        addResult('💡 Crea el bucket en Storage → New bucket → Name: products', 'warning');
        setTesting(false);
        return;
      }
    } catch (error) {
      addResult(`❌ Error verificando bucket: ${error.message}`, 'error');
      setTesting(false);
      return;
    }

    // Test 2: Intentar listar archivos (policy SELECT)
    addResult('📋 Test 2: Verificando policy SELECT...', 'info');
    try {
      const { data, error } = await supabase.storage
        .from('products')
        .list('products', { limit: 1 });
      
      if (error) throw error;
      
      addResult('✅ Puedes listar archivos (policy SELECT funciona)', 'success');
      addResult(`   Archivos encontrados: ${data?.length || 0}`, 'info');
    } catch (error) {
      addResult(`❌ No puedes listar archivos: ${error.message}`, 'error');
      addResult('💡 Falta policy SELECT para rol public/anon', 'warning');
    }

    // Test 3: Verificar si estamos autenticados
    addResult('👤 Test 3: Verificando autenticación...', 'info');
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      addResult(`✅ Usuario autenticado: ${user.email}`, 'success');
      
      // Test 4: Intentar subir imagen (policy INSERT)
      addResult('📤 Test 4: Probando subida de imagen...', 'info');
      try {
        // Crear imagen de prueba (1x1 pixel transparente PNG)
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        
        const fileName = `test-${Date.now()}.png`;
        const filePath = `products/${fileName}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, blob);
        
        if (uploadError) throw uploadError;
        
        addResult('✅ Imagen subida correctamente', 'success');
        
        // Test 5: Verificar acceso público a la URL
        addResult('🔗 Test 5: Verificando acceso público...', 'info');
        const { data: urlData } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);
        
        const publicUrl = urlData.publicUrl;
        addResult(`   URL generada: ${publicUrl.substring(0, 60)}...`, 'info');
        
        try {
          const response = await fetch(publicUrl, { method: 'HEAD' });
          
          if (response.ok) {
            addResult('✅ La imagen ES accesible públicamente', 'success');
            addResult('🎉 ¡TODO FUNCIONA CORRECTAMENTE!', 'success');
          } else {
            addResult(`❌ Imagen NO accesible (Status: ${response.status})`, 'error');
            addResult('💡 Verifica que el bucket sea público O tenga policy SELECT', 'warning');
          }
        } catch (fetchError) {
          addResult(`⚠️ No se pudo verificar acceso: ${fetchError.message}`, 'warning');
        }
        
        // Limpiar imagen de prueba
        await supabase.storage.from('products').remove([filePath]);
        addResult('🧹 Imagen de prueba eliminada', 'info');
        
      } catch (error) {
        addResult(`❌ Error subiendo imagen: ${error.message}`, 'error');
        addResult('💡 Falta policy INSERT para rol authenticated', 'warning');
      }
      
    } else {
      addResult('⚠️ No hay usuario autenticado', 'warning');
      addResult('💡 Inicia sesión para probar la subida de imágenes', 'warning');
    }
    
    addResult('✨ Tests completados', 'info');
    setTesting(false);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return '💬';
    }
  };

  return (
    <div className="storage-tester">
      <div className="tester-header">
        <h3>🧪 Storage Tester</h3>
        <button 
          onClick={runCompleteTest}
          disabled={testing}
          className="test-button"
        >
          {testing ? '⏳ Probando...' : '▶️ Ejecutar Tests'}
        </button>
      </div>

      {testResults.length > 0 && (
        <div className="results-panel">
          <div className="results-header">
            <span>Resultados ({testResults.length})</span>
            <button onClick={clearResults} className="clear-button">
              🗑️ Limpiar
            </button>
          </div>
          
          <div className="results-list">
            {testResults.map((result, index) => (
              <div key={index} className={`result-item ${result.type}`}>
                <span className="result-icon">{getIcon(result.type)}</span>
                <span className="result-message">{result.message}</span>
                <span className="result-time">{result.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="instructions">
        <h4>📋 Checklist de Configuración:</h4>
        <ul>
          <li>✅ Bucket "products" existe</li>
          <li>✅ Bucket marcado como "Public"</li>
          <li>✅ Policy SELECT para rol public/anon</li>
          <li>✅ Policy INSERT para rol authenticated</li>
        </ul>
      </div>

      <style jsx>{`
        .storage-tester {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 500px;
          max-height: 600px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
          color: white;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          z-index: 10000;
        }

        .tester-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .tester-header h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
        }

        .test-button {
          padding: 10px 20px;
          background: white;
          color: #667eea;
          border: none;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
        }

        .test-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .test-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .results-panel {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 20px;
          max-height: 350px;
          overflow-y: auto;
        }

        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          font-weight: 600;
          font-size: 14px;
        }

        .clear-button {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          color: white;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s ease;
        }

        .clear-button:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .results-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .result-item {
          display: grid;
          grid-template-columns: 24px 1fr auto;
          gap: 8px;
          align-items: start;
          padding: 10px;
          border-radius: 8px;
          font-size: 13px;
          line-height: 1.5;
        }

        .result-item.success {
          background: rgba(72, 187, 120, 0.2);
          border-left: 3px solid #48bb78;
        }

        .result-item.error {
          background: rgba(245, 101, 101, 0.2);
          border-left: 3px solid #f56565;
        }

        .result-item.warning {
          background: rgba(237, 137, 54, 0.2);
          border-left: 3px solid #ed8936;
        }

        .result-item.info {
          background: rgba(99, 179, 237, 0.2);
          border-left: 3px solid #63b3ed;
        }

        .result-icon {
          font-size: 16px;
        }

        .result-message {
          flex: 1;
          word-break: break-word;
        }

        .result-time {
          font-size: 11px;
          opacity: 0.7;
          white-space: nowrap;
        }

        .instructions {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 16px;
        }

        .instructions h4 {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 600;
        }

        .instructions ul {
          margin: 0;
          padding-left: 20px;
          font-size: 13px;
          line-height: 1.8;
        }

        .instructions li {
          margin-bottom: 4px;
        }

        @media (max-width: 768px) {
          .storage-tester {
            width: calc(100% - 40px);
            right: 20px;
            left: 20px;
            bottom: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default SimpleStorageTester;