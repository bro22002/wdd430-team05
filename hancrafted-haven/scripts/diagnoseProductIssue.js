// scripts/diagnoseProductIssue.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 DIAGNÓSTICO DE PRODUCTOS\n');

async function diagnose() {
  // 1. Verificar conexión
  console.log('1️⃣ Verificando conexión...');
  try {
    const { data, error } = await supabase
      .from('products')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Error de conexión:', error.message);
      return;
    }
    console.log('✅ Conexión exitosa\n');
  } catch (err) {
    console.error('❌ Error fatal:', err.message);
    return;
  }

  // 2. Verificar tabla products
  console.log('2️⃣ Verificando tabla products...');
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error:', error.message);
    } else {
      if (data && data.length > 0) {
        console.log('✅ Tabla existe');
        console.log('📋 Campos:', Object.keys(data[0]).join(', '));
      } else {
        console.log('⚠️ Tabla vacía');
      }
    }
    console.log('');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }

  // 3. Verificar bucket
  console.log('3️⃣ Verificando bucket "products"...');
  try {
    const { data, error } = await supabase.storage
      .from('products')
      .list('', { limit: 1 });
    
    if (error) {
      console.error('❌ Error:', error.message);
      console.log('💡 Crea el bucket en: Storage → New Bucket → products\n');
    } else {
      console.log('✅ Bucket existe\n');
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  }

  // 4. Probar insert
  console.log('4️⃣ Probando crear producto...');
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.log('⚠️ No hay usuario logueado');
    console.log('💡 Inicia sesión en tu app primero\n');
  } else {
    console.log('👤 Usuario:', user.email);
    
    const testProduct = {
      artisan_id: user.id,
      title: 'TEST - BORRAR',
      description: 'Producto de prueba',
      price: 1,
      category: 'Test',
      stock: 0,
      rating: 0
    };

    const { data, error } = await supabase
      .from('products')
      .insert(testProduct)
      .select()
      .single();

    if (error) {
      console.error('❌ Error al insertar:', error.message);
      console.log('\n💡 SOLUCIÓN:');
      
      if (error.message.includes('policy')) {
        console.log('   Faltan políticas RLS');
        console.log('   Ejecuta el SQL que te compartí\n');
      }
    } else {
      console.log('✅ Producto creado!');
      
      // Eliminar
      await supabase.from('products').delete().eq('id', data.id);
      console.log('✅ Producto de prueba eliminado\n');
    }
  }

  console.log('═══════════════════════════════════════════════');
}

diagnose().catch(console.error);