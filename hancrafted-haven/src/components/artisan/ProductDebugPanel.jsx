// src/components/artisan/ProductDebugPanel.jsx
// Panel de debugging para verificar configuración de productos
// ⚠️ SOLO PARA DESARROLLO - Remover en producción

import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

/**
 * ProductDebugPanel: Panel de debugging para productos
 * 
 * Funciones:
 * - Verificar estructura de tabla products
 * - Verificar bucket de storage
 * - Verificar políticas RLS
 * - Probar conexión
 * - Ver datos de ejemplo
 */
const ProductDebugPanel = ({ currentUser }) => {
  
  // useState: Resultados de las verificaciones
  const [debugInfo, setDebugInfo] = useState({
    tableStructure: null,
    storageConfig: null,
    rlsPolicies: null,
    sampleData: null,
    connectionStatus: 'Not tested'
  });

  // useState: Estado de carga
  const [loading, setLoading] = useState(false);

  /**
   * testDatabaseConnection: Prueba la conexión a Supabase
   */
  const testDatabaseConnection = async () => {
    try {
      setLoading(true);
      
      // Intentar una consulta simple
      const { data, error } = await supabase
        .from('products')
        .select('count')
        .limit(1);

      if (error) {
        throw error;
      }

      setDebugInfo(prev => ({
        ...prev,
        connectionStatus: 'Connected ✅'
      }));

      console.log('✅ Database connection successful');

    } catch (error) {
      console.error('❌ Connection error:', error);
      setDebugInfo(prev => ({
        ...prev,
        connectionStatus: `Error: ${error.message} ❌`
      }));
    } finally {
      setLoading(false);
    }
  };

  /**
   * checkTableStructure: Verifica la estructura de la tabla products
   */
  const checkTableStructure = async () => {
    try {
      setLoading(true);

      // Obtener un registro para ver los campos
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(1);

      if (error && error.code !== 'PGRST116') { // PGRST116 = tabla vacía
        throw error;
      }

      // Si hay datos, mostrar las columnas
      if (data && data.length > 0) {
        const fields = Object.keys(data[0]);
        
        setDebugInfo(prev => ({
          ...prev,
          tableStructure: {
            status: 'Table exists ✅',
            fields: fields,
            hasArtisanId: fields.includes('artisan_id') ? '✅' : '❌',
            missingFields: []
          }
        }));

        // Verificar campos requeridos
        const requiredFields = ['id', 'artisan_id', 'title', 'description', 'price', 'category', 'stock', 'image_url', 'rating', 'created_at'];
        const missing = requiredFields.filter(field => !fields.includes(field));

        if (missing.length > 0) {
          console.warn('⚠️ Missing fields:', missing);
          setDebugInfo(prev => ({
            ...prev,
            tableStructure: {
              ...prev.tableStructure,
              missingFields: missing
            }
          }));
        }

      } else {
        // Tabla vacía, intentar insertar y eliminar un registro de prueba
        const testProduct = {
          title: 'Test Product (DELETE ME)',
          description: 'This is a test product for debugging',
          price: 1,
          category: 'Test',
          stock: 0,
          artisan_id: currentUser?.id || null,
          rating: 0
        };

        const { data: insertData, error: insertError } = await supabase
          .from('products')
          .insert(testProduct)
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        // Si se insertó correctamente, verificar campos
        const fields = Object.keys(insertData);

        setDebugInfo(prev => ({
          ...prev,
          tableStructure: {
            status: 'Table exists (was empty) ✅',
            fields: fields,
            hasArtisanId: fields.includes('artisan_id') ? '✅' : '❌',
            testInsertId: insertData.id
          }
        }));

        // Eliminar el producto de prueba
        await supabase
          .from('products')
          .delete()
          .eq('id', insertData.id);

        console.log('✅ Test product inserted and deleted successfully');
      }

    } catch (error) {
      console.error('❌ Table structure check error:', error);
      setDebugInfo(prev => ({
        ...prev,
        tableStructure: {
          status: `Error: ${error.message} ❌`,
          hint: error.hint || 'Check if table exists and has correct structure'
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  /**
   * checkStorageConfig: Verifica la configuración del storage
   */
  const checkStorageConfig = async () => {
    try {
      setLoading(true);

      // Intentar listar archivos en el bucket
      const { data: files, error: listError } = await supabase.storage
        .from('products')
        .list('products', {
          limit: 1
        });

      if (listError) {
        throw listError;
      }

      setDebugInfo(prev => ({
        ...prev,
        storageConfig: {
          status: 'Bucket exists ✅',
          filesCount: files.length,
          canList: '✅'
        }
      }));

      console.log('✅ Storage bucket accessible');

    } catch (error) {
      console.error('❌ Storage check error:', error);
      
      let hint = 'Check if bucket "products" exists in Storage';
      if (error.message?.includes('not found')) {
        hint = 'Bucket "products" does not exist. Create it in Supabase Dashboard → Storage';
      } else if (error.message?.includes('permission')) {
        hint = 'Permission denied. Check RLS policies for storage';
      }

      setDebugInfo(prev => ({
        ...prev,
        storageConfig: {
          status: `Error: ${error.message} ❌`,
          hint: hint
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  /**
   * getSampleData: Obtiene datos de ejemplo
   */
  const getSampleData = async () => {
    try {
      setLoading(true);

      // Obtener productos del usuario actual
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('artisan_id', currentUser?.id)
        .limit(3);

      if (error) {
        throw error;
      }

      setDebugInfo(prev => ({
        ...prev,
        sampleData: {
          count: data.length,
          products: data.map(p => ({
            id: p.id,
            title: p.title,
            price: p.price,
            stock: p.stock,
            hasImage: !!p.image_url
          }))
        }
      }));

      console.log('✅ Sample data retrieved:', data.length);

    } catch (error) {
      console.error('❌ Sample data error:', error);
      setDebugInfo(prev => ({
        ...prev,
        sampleData: {
          error: error.message
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  /**
   * runAllTests: Ejecuta todas las verificaciones
   */
  const runAllTests = async () => {
    console.log('🧪 Running all tests...');
    await testDatabaseConnection();
    await checkTableStructure();
    await checkStorageConfig();
    await getSampleData();
    console.log('🎉 All tests completed');
  };

  /**
   * createSampleProduct: Crea un producto de muestra
   */
  const createSampleProduct = async () => {
    if (!currentUser?.id) {
      alert('No user logged in');
      return;
    }

    try {
      setLoading(true);

      const sampleProduct = {
        artisan_id: currentUser.id,
        title: 'Sample Handcrafted Mug',
        description: 'This is a sample product created by the debug panel. Feel free to edit or delete it!',
        price: 29.99,
        category: 'Pottery & Ceramics',
        stock: 10,
        rating: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('products')
        .insert(sampleProduct)
        .select()
        .single();

      if (error) {
        throw error;
      }

      alert('✅ Sample product created! Check your dashboard.');
      console.log('✅ Sample product created:', data);

      // Refrescar datos de ejemplo
      await getSampleData();

    } catch (error) {
      console.error('❌ Create sample error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="debug-panel">
      <div className="debug-header">
        <h3>🔧 Product Debug Panel</h3>
        <p className="debug-subtitle">
          Verify configuration and test functionality
        </p>
      </div>

      {/* Botones de acción */}
      <div className="debug-actions">
        <button 
          onClick={runAllTests}
          disabled={loading}
          className="debug-btn primary"
        >
          {loading ? '⏳ Running...' : '🧪 Run All Tests'}
        </button>

        <button 
          onClick={createSampleProduct}
          disabled={loading || !currentUser}
          className="debug-btn secondary"
        >
          ➕ Create Sample Product
        </button>
      </div>

      {/* Resultados */}
      <div className="debug-results">
        
        {/* Conexión */}
        <div className="debug-section">
          <h4>🌐 Database Connection</h4>
          <div className="debug-item">
            <span className="label">Status:</span>
            <span className="value">{debugInfo.connectionStatus}</span>
          </div>
          <button 
            onClick={testDatabaseConnection}
            disabled={loading}
            className="debug-btn-small"
          >
            Test Connection
          </button>
        </div>

        {/* Estructura de tabla */}
        {debugInfo.tableStructure && (
          <div className="debug-section">
            <h4>📊 Table Structure</h4>
            <div className="debug-item">
              <span className="label">Status:</span>
              <span className="value">{debugInfo.tableStructure.status}</span>
            </div>
            {debugInfo.tableStructure.fields && (
              <>
                <div className="debug-item">
                  <span className="label">Has artisan_id:</span>
                  <span className="value">{debugInfo.tableStructure.hasArtisanId}</span>
                </div>
                <details className="debug-details">
                  <summary>Show all fields ({debugInfo.tableStructure.fields.length})</summary>
                  <ul className="field-list">
                    {debugInfo.tableStructure.fields.map(field => (
                      <li key={field}>{field}</li>
                    ))}
                  </ul>
                </details>
              </>
            )}
            {debugInfo.tableStructure.missingFields?.length > 0 && (
              <div className="debug-warning">
                ⚠️ Missing fields: {debugInfo.tableStructure.missingFields.join(', ')}
              </div>
            )}
            {debugInfo.tableStructure.hint && (
              <div className="debug-hint">
                💡 {debugInfo.tableStructure.hint}
              </div>
            )}
          </div>
        )}

        {/* Storage */}
        {debugInfo.storageConfig && (
          <div className="debug-section">
            <h4>🗄️ Storage Configuration</h4>
            <div className="debug-item">
              <span className="label">Status:</span>
              <span className="value">{debugInfo.storageConfig.status}</span>
            </div>
            {debugInfo.storageConfig.filesCount !== undefined && (
              <div className="debug-item">
                <span className="label">Files in bucket:</span>
                <span className="value">{debugInfo.storageConfig.filesCount}</span>
              </div>
            )}
            {debugInfo.storageConfig.hint && (
              <div className="debug-hint">
                💡 {debugInfo.storageConfig.hint}
              </div>
            )}
          </div>
        )}

        {/* Datos de ejemplo */}
        {debugInfo.sampleData && (
          <div className="debug-section">
            <h4>📦 Your Products</h4>
            {debugInfo.sampleData.error ? (
              <div className="debug-error">
                Error: {debugInfo.sampleData.error}
              </div>
            ) : (
              <>
                <div className="debug-item">
                  <span className="label">Product count:</span>
                  <span className="value">{debugInfo.sampleData.count}</span>
                </div>
                {debugInfo.sampleData.products?.length > 0 && (
                  <details className="debug-details">
                    <summary>Show products</summary>
                    <ul className="product-list">
                      {debugInfo.sampleData.products.map(p => (
                        <li key={p.id}>
                          <strong>{p.title}</strong>
                          <br />
                          Price: ${p.price} | Stock: {p.stock} | Image: {p.hasImage ? '✅' : '❌'}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Información del usuario */}
      <div className="debug-user-info">
        <h4>👤 Current User</h4>
        <div className="user-details">
          <div>ID: {currentUser?.id || 'Not logged in'}</div>
          <div>Email: {currentUser?.email || 'N/A'}</div>
        </div>
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
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #374151;
        }

        .debug-header h3 {
          margin: 0 0 8px 0;
          font-size: 16px;
          color: #60a5fa;
        }

        .debug-subtitle {
          margin: 0;
          font-size: 11px;
          color: #9ca3af;
        }

        .debug-actions {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .debug-btn {
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 6px;
          font-weight: bold;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s ease;
        }

        .debug-btn.primary {
          background: #3b82f6;
          color: white;
        }

        .debug-btn.primary:hover:not(:disabled) {
          background: #2563eb;
        }

        .debug-btn.secondary {
          background: #059669;
          color: white;
        }

        .debug-btn.secondary:hover:not(:disabled) {
          background: #047857;
        }

        .debug-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .debug-results {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .debug-section {
          background: #111827;
          padding: 15px;
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

        .debug-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          padding: 4px 0;
        }

        .label {
          color: #9ca3af;
        }

        .value {
          color: #d1d5db;
          font-weight: bold;
        }

        .debug-btn-small {
          margin-top: 8px;
          padding: 6px 12px;
          background: #374151;
          border: none;
          color: #f3f4f6;
          border-radius: 4px;
          cursor: pointer;
          font-size: 11px;
        }

        .debug-btn-small:hover {
          background: #4b5563;
        }

        .debug-details {
          margin-top: 10px;
          padding: 10px;
          background: #374151;
          border-radius: 4px;
        }

        .debug-details summary {
          cursor: pointer;
          font-weight: bold;
          color: #60a5fa;
          margin-bottom: 8px;
        }

        .field-list,
        .product-list {
          margin: 8px 0 0 0;
          padding-left: 20px;
          list-style: disc;
        }

        .field-list li {
          margin-bottom: 4px;
          color: #d1d5db;
        }

        .product-list li {
          margin-bottom: 10px;
          padding: 8px;
          background: #1f2937;
          border-radius: 4px;
          line-height: 1.6;
        }

        .debug-warning {
          margin-top: 10px;
          padding: 10px;
          background: #7f1d1d;
          border-radius: 4px;
          color: #fca5a5;
          font-size: 11px;
        }

        .debug-hint {
          margin-top: 10px;
          padding: 10px;
          background: #065f46;
          border-radius: 4px;
          color: #6ee7b7;
          font-size: 11px;
          line-height: 1.5;
        }

        .debug-error {
          padding: 10px;
          background: #7f1d1d;
          border-radius: 4px;
          color: #fca5a5;
        }

        .debug-user-info {
          margin-top: 20px;
          padding-top: 15px;
          border-top: 2px solid #374151;
        }

        .debug-user-info h4 {
          margin: 0 0 10px 0;
          font-size: 13px;
          color: #93c5fd;
        }

        .user-details {
          font-size: 11px;
          line-height: 1.6;
          color: #d1d5db;
        }

        @media (max-width: 768px) {
          .debug-panel {
            width: calc(100% - 40px);
            bottom: 10px;
            right: 10px;
            max-height: 70vh;
          }

          .debug-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductDebugPanel;