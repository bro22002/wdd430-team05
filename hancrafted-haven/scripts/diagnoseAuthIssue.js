// scripts/diagnoseAuthIssue.js
// Script para diagnosticar problemas de autenticación y conexión con Supabase

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

console.log('🔍 DIAGNÓSTICO DE AUTENTICACIÓN Y CONEXIÓN\n');
console.log('═══════════════════════════════════════════════════\n');

// Función para verificar si una URL es válida
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

async function diagnoseAuth() {
  // ===== 1. VERIFICAR VARIABLES DE ENTORNO =====
  console.log('1️⃣ Verificando variables de entorno...\n');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    console.error('❌ ERROR: NEXT_PUBLIC_SUPABASE_URL no está definida');
    console.log('💡 SOLUCIÓN: Crea un archivo .env.local con:');
    console.log('   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co');
    console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon\n');
    return;
  }

  if (!supabaseKey) {
    console.error('❌ ERROR: NEXT_PUBLIC_SUPABASE_ANON_KEY no está definida');
    console.log('💡 SOLUCIÓN: Agrega la clave en .env.local\n');
    return;
  }

  console.log('✅ Variables de entorno encontradas');
  console.log(`   URL: ${supabaseUrl}`);
  console.log(`   Key: ${supabaseKey.substring(0, 20)}...${supabaseKey.slice(-10)}\n`);

  // Verificar formato de URL
  if (!isValidUrl(supabaseUrl)) {
    console.error('❌ ERROR: La URL de Supabase no es válida');
    console.log('💡 SOLUCIÓN: La URL debe tener el formato:');
    console.log('   https://tunombre.supabase.co\n');
    return;
  }

  console.log('✅ Formato de URL válido\n');

  // ===== 2. CREAR CLIENTE DE SUPABASE =====
  console.log('2️⃣ Creando cliente de Supabase...\n');
  
  let supabase;
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    });
    console.log('✅ Cliente creado exitosamente\n');
  } catch (error) {
    console.error('❌ ERROR al crear cliente:', error.message);
    return;
  }

  // ===== 3. VERIFICAR CONEXIÓN A LA BASE DE DATOS =====
  console.log('3️⃣ Verificando conexión a la base de datos...\n');
  
  try {
    const { data, error } = await supabase
      .from('products')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ ERROR de conexión a la BD:', error.message);
      console.log('\n💡 POSIBLES SOLUCIONES:');
      console.log('   1. Verifica que la URL de Supabase sea correcta');
      console.log('   2. Verifica que la clave ANON sea correcta');
      console.log('   3. Verifica que la tabla "products" exista\n');
      return;
    }
    
    console.log('✅ Conexión a la base de datos exitosa\n');
  } catch (err) {
    console.error('❌ ERROR fatal de conexión:', err.message);
    console.log('\n💡 POSIBLES CAUSAS:');
    console.log('   - Problemas de red o firewall');
    console.log('   - URL de Supabase incorrecta');
    console.log('   - Proyecto de Supabase pausado o eliminado\n');
    return;
  }

  // ===== 4. VERIFICAR SESIÓN ACTUAL =====
  console.log('4️⃣ Verificando sesión de usuario...\n');
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ ERROR al obtener sesión:', error.message);
      console.log('\n💡 SOLUCIÓN:');
      console.log('   Este error indica un problema con la autenticación');
      console.log('   Intenta cerrar sesión y volver a iniciar\n');
      return;
    }

    if (!session) {
      console.log('⚠️  No hay sesión activa (usuario no logueado)');
      console.log('💡 Esto es normal si no has iniciado sesión en la app\n');
    } else {
      console.log('✅ Sesión activa encontrada');
      console.log(`   Usuario: ${session.user.email}`);
      console.log(`   ID: ${session.user.id}\n`);
    }
  } catch (err) {
    console.error('❌ ERROR al verificar sesión:', err.message);
    console.log('\n💡 ESTE ES PROBABLEMENTE TU PROBLEMA:');
    console.log('   El error "Failed to fetch" indica que:');
    console.log('   1. La URL de Supabase no es accesible');
    console.log('   2. Hay un problema de CORS');
    console.log('   3. La clave ANON es incorrecta\n');
    return;
  }

  // ===== 5. VERIFICAR USUARIO ACTUAL =====
  console.log('5️⃣ Verificando usuario actual (método getUser)...\n');
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('❌ ERROR:', error.message);
      console.log('\n💡 SOLUCIÓN:');
      
      if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
        console.log('   🔴 PROBLEMA ENCONTRADO: Error de conexión al servidor auth');
        console.log('   ');
        console.log('   CAUSAS POSIBLES:');
        console.log('   1. La URL de Supabase está mal escrita en .env.local');
        console.log('   2. Tu proyecto de Supabase está pausado');
        console.log('   3. Problemas de red o firewall');
        console.log('   ');
        console.log('   VERIFICA:');
        console.log('   - Ve a https://supabase.com/dashboard');
        console.log('   - Asegúrate que tu proyecto esté activo');
        console.log('   - Copia nuevamente la URL y la clave ANON');
        console.log('   - Pégalas en .env.local');
        console.log('   - Reinicia el servidor (npm run dev)\n');
      }
      return;
    }

    if (!user) {
      console.log('⚠️  No hay usuario logueado');
      console.log('💡 Inicia sesión en tu aplicación para probar completamente\n');
    } else {
      console.log('✅ Usuario verificado exitosamente');
      console.log(`   Email: ${user.email}`);
      console.log(`   ID: ${user.id}\n`);
    }
  } catch (err) {
    console.error('❌ ERROR CRÍTICO:', err.message);
    console.log('\n🔴 ESTE ES EL MISMO ERROR QUE VES EN EL NAVEGADOR');
    console.log('');
    console.log('SOLUCIONES:');
    console.log('');
    console.log('1️⃣ Verifica tu archivo .env.local:');
    console.log('   - Debe estar en la raíz del proyecto');
    console.log('   - Debe tener las variables NEXT_PUBLIC_SUPABASE_URL y KEY');
    console.log('   - NO debe tener espacios ni comillas extras');
    console.log('');
    console.log('2️⃣ Ve a tu dashboard de Supabase:');
    console.log('   https://supabase.com/dashboard/project/TU-PROYECTO/settings/api');
    console.log('   - Copia la "Project URL"');
    console.log('   - Copia la "anon public" key');
    console.log('');
    console.log('3️⃣ Verifica configuración de CORS:');
    console.log('   En Supabase Dashboard → Authentication → URL Configuration');
    console.log('   Asegúrate que http://localhost:3000 esté en Site URL\n');
    return;
  }

  // ===== 6. VERIFICAR TABLA PRODUCTS =====
  console.log('6️⃣ Verificando acceso a tabla products...\n');
  
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ ERROR:', error.message);
      
      if (error.message.includes('policy')) {
        console.log('\n💡 SOLUCIÓN: Faltan políticas RLS (Row Level Security)');
        console.log('   Necesitas ejecutar el SQL para crear las políticas\n');
      }
    } else {
      console.log('✅ Acceso a tabla products OK');
      if (data && data.length > 0) {
        console.log(`   Productos encontrados: ${data.length}`);
      } else {
        console.log('   (La tabla está vacía pero es accesible)');
      }
    }
  } catch (err) {
    console.error('❌ ERROR:', err.message);
  }

  console.log('\n═══════════════════════════════════════════════════');
  console.log('✅ DIAGNÓSTICO COMPLETADO');
  console.log('═══════════════════════════════════════════════════\n');
}

// Ejecutar diagnóstico
diagnoseAuth()
  .then(() => {
    console.log('💡 Si el diagnóstico mostró errores, sigue las soluciones sugeridas.');
    console.log('💡 Después de hacer cambios, reinicia el servidor: npm run dev\n');
  })
  .catch((error) => {
    console.error('\n❌ ERROR FATAL:', error);
  });