// Función para asegurar que el usuario tenga un perfil en user_profiles
// Se ejecuta automáticamente al hacer login

import { supabase } from '../lib/supabase';

/**
 * ensureUserProfile: Crea el perfil del usuario si no existe
 * 
 * Esta función se ejecuta después de que un usuario se autentica.
 * Si el perfil no existe en user_profiles, lo crea automáticamente.
 * 
 * ¿Qué hace paso a paso?
 * 1. Intenta obtener el perfil existente
 * 2. Si no existe, crea uno nuevo con datos básicos
 * 3. Retorna el perfil (existente o recién creado)
 * 
 * @param {Object} user - Usuario de Supabase Auth
 * @returns {Object} - {success, profile, error}
 */
export const ensureUserProfile = async (user) => {
  try {
    console.log('🔍 Verificando perfil para usuario:', user.id);

    // PASO 1: Intentar obtener el perfil existente
    // Esta consulta busca en user_profiles un registro con el id del usuario
    const { data: existingProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // PASO 2: Si encontró el perfil, retornarlo
    if (existingProfile) {
      console.log('✅ Perfil encontrado:', existingProfile);
      return {
        success: true,
        profile: existingProfile,
        wasCreated: false
      };
    }

    // PASO 3: Si no existe (error PGRST116), crear uno nuevo
    if (fetchError && fetchError.code === 'PGRST116') {
      console.log('⚠️ Perfil no existe, creando uno nuevo...');

      // Extraer información del usuario de Auth
      // user.user_metadata contiene datos del registro (nombre, etc.)
      const metadata = user.user_metadata || {};
      const email = user.email;
      
      // Construir full_name desde metadata o usar email como fallback
      let fullName = metadata.full_name || '';
      if (!fullName && metadata.first_name) {
        fullName = `${metadata.first_name} ${metadata.last_name || ''}`.trim();
      }
      if (!fullName) {
        // Si no hay nombre, usar la parte antes del @ del email
        fullName = email.split('@')[0];
      }

      // Datos del nuevo perfil
      const newProfileData = {
        id: user.id,                    // Mismo ID que en Auth
        email: email,                   // Email del usuario
        full_name: fullName,            // Nombre completo
        role: 'buyer',                  // Rol por defecto
        is_active: true,                // Usuario activo
        is_verified: false,             // No verificado inicialmente
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('📝 Creando perfil con datos:', newProfileData);

      // PASO 4: Insertar el nuevo perfil en la base de datos
      const { data: newProfile, error: insertError } = await supabase
        .from('user_profiles')
        .insert(newProfileData)
        .select()
        .single();

      // Si hay error al insertar, lanzar excepción
      if (insertError) {
        throw insertError;
      }

      console.log('✅ Perfil creado exitosamente:', newProfile);

      return {
        success: true,
        profile: newProfile,
        wasCreated: true,
        message: 'Profile created successfully'
      };
    }

    // Si hubo otro tipo de error (no el de "no encontrado"), lanzarlo
    if (fetchError) {
      throw fetchError;
    }

    // Caso inesperado: no hay perfil pero tampoco error
    throw new Error('Unexpected state: no profile and no error');

  } catch (error) {
    console.error('❌ Error en ensureUserProfile:', error);
    
    // Mensajes de error específicos según el tipo
    let errorMessage = 'Failed to ensure user profile';
    
    if (error.message?.includes('permission denied')) {
      errorMessage = 'Permission denied. Please check RLS policies for user_profiles table.';
    } else if (error.message?.includes('duplicate')) {
      errorMessage = 'Profile already exists but query failed. Please try again.';
    } else if (error.code === '42P01') {
      errorMessage = 'Table user_profiles does not exist. Please create it first.';
    }

    return {
      success: false,
      profile: null,
      error: errorMessage,
      technicalError: error.message
    };
  }
};

/**
 * EXPLICACIÓN DE CADA PASO:
 * 
 * PASO 1 - Buscar perfil existente:
 * --------------------------------
 * .from('user_profiles')  → Selecciona la tabla
 * .select('*')            → Obtiene todos los campos
 * .eq('id', user.id)      → Filtra por el ID del usuario
 * .single()               → Espera exactamente 1 resultado
 * 
 * Si existe → Retorna el perfil ✅
 * Si no existe → Error PGRST116 ⚠️
 * 
 * 
 * PASO 2 - Verificar si se encontró:
 * ----------------------------------
 * if (existingProfile) → Si hay datos, retornarlos
 * 
 * 
 * PASO 3 - Detectar que no existe:
 * --------------------------------
 * if (fetchError && fetchError.code === 'PGRST116')
 * 
 * PGRST116 significa "0 rows returned" (no se encontró)
 * Es el error que estás viendo en tu consola
 * 
 * 
 * PASO 4 - Crear el perfil:
 * -------------------------
 * .insert(newProfileData)  → Inserta nuevo registro
 * .select()                → Retorna el registro creado
 * .single()                → Espera 1 resultado
 * 
 * Si se crea exitosamente → Retorna el nuevo perfil ✅
 * Si falla → Lanza excepción ❌
 */