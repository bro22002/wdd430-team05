// src/services/authService.js
// Servicio CORREGIDO para manejar autenticación con user_profiles

import { supabase } from '../lib/supabase';

/**
 * signUp: Registra un nuevo usuario en Supabase Auth
 * CAMBIOS: Ahora usa user_profiles en lugar de profiles
 * 
 * @param {Object} userData - Datos del usuario
 * @param {string} userData.firstName - Nombre del usuario
 * @param {string} userData.lastName - Apellido del usuario
 * @param {string} userData.email - Email del usuario
 * @param {string} userData.password - Contraseña del usuario
 * @returns {Object} - Resultado de la operación {success, user, session, message/error}
 */
export const signUp = async (userData) => {
  try {
    const { firstName, lastName, email, password } = userData;

    // Paso 1: Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: `${firstName} ${lastName}`,  // ✅ Guardamos nombre completo
          first_name: firstName,  // Lo guardamos en metadata por si acaso
          last_name: lastName
        }
      }
    });

    if (authError) {
      throw authError;
    }

    // Paso 2: Si el registro es exitoso, crear perfil en user_profiles
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('user_profiles')  // ✅ CAMBIADO: era 'profiles'
        .insert({
          id: authData.user.id,
          email: email,
          full_name: `${firstName} ${lastName}`,  // ✅ CAMBIADO: era first_name + last_name
          role: 'buyer',  // ✅ NUEVO: rol por defecto es comprador
          is_active: true,  // ✅ NUEVO: usuario activo por defecto
          is_verified: false,  // ✅ NUEVO: no verificado inicialmente
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      // Si hay error creando el perfil, lo logueamos pero no falseamos el registro
      if (profileError) {
        console.warn('Profile creation error:', profileError);
        // NOTA: El usuario ya fue creado en Auth, solo falló el perfil extendido
      }
    }

    return {
      success: true,
      user: authData.user,
      session: authData.session,
      message: 'Registration successful! Please check your email to verify your account.'
    };

  } catch (error) {
    console.error('Registration error:', error);
    
    // Manejar errores específicos de Supabase
    let errorMessage = 'Registration failed. Please try again.';
    
    if (error.message?.includes('already registered')) {
      errorMessage = 'This email is already registered. Please use a different email or try signing in.';
    } else if (error.message?.includes('Password')) {
      errorMessage = 'Password must be at least 6 characters long.';
    } else if (error.message?.includes('Email')) {
      errorMessage = 'Please enter a valid email address.';
    }

    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * signIn: Inicia sesión con email y contraseña
 * CAMBIOS: Obtiene perfil de user_profiles y mapea campos correctamente
 * 
 * @param {Object} credentials - Credenciales del usuario
 * @param {string} credentials.email - Email del usuario
 * @param {string} credentials.password - Contraseña del usuario
 * @returns {Object} - Resultado de la operación {success, user, session, profile, message/error}
 */
export const signIn = async (credentials) => {
  try {
    const { email, password } = credentials;

    // Paso 1: Autenticar con Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (authError) {
      throw authError;
    }

    // Paso 2: Obtener información del perfil del usuario
    let userProfile = null;
    if (authData.user) {
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')  // ✅ CAMBIADO: era 'profiles'
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (!profileError && profileData) {
        userProfile = profileData;
        
        // ✅ NUEVO: Mapear campos para compatibilidad con código existente
        // Esto permite que tu código actual siga funcionando sin cambios masivos
        userProfile.first_name = profileData.full_name?.split(' ')[0] || '';
        userProfile.last_name = profileData.full_name?.split(' ').slice(1).join(' ') || '';
        userProfile.is_artisan = profileData.role === 'seller' || profileData.role === 'artisan';
        userProfile.artisan_verified = profileData.is_verified;
        userProfile.avatar_url = profileData.profile_image_url;
      }
    }

    return {
      success: true,
      user: authData.user,
      session: authData.session,
      profile: userProfile,
      message: 'Login successful!'
    };

  } catch (error) {
    console.error('Login error:', error);
    
    // Manejar errores específicos de Supabase
    let errorMessage = 'Login failed. Please try again.';
    
    if (error.message?.includes('Invalid login credentials')) {
      errorMessage = 'Invalid email or password. Please check your credentials and try again.';
    } else if (error.message?.includes('Email not confirmed')) {
      errorMessage = 'Please check your email and click the verification link before signing in.';
    } else if (error.message?.includes('Too many requests')) {
      errorMessage = 'Too many login attempts. Please wait a moment before trying again.';
    }

    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * signOut: Cierra la sesión del usuario
 * SIN CAMBIOS: Esta función no interactúa con tablas de perfil
 * 
 * @returns {Object} - Resultado de la operación {success, message/error}
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }

    return {
      success: true,
      message: 'Logout successful!'
    };

  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      error: 'Failed to logout. Please try again.'
    };
  }
};

/**
 * getCurrentUser: Obtiene el usuario actual de la sesión
 * CAMBIOS: Lee de user_profiles y mapea campos para compatibilidad
 * 
 * @returns {Object} - {success, user, profile}
 */
export const getCurrentUser = async () => {
  try {
    // Paso 1: Obtener usuario de la sesión actual
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return {
        success: false,
        user: null,
        profile: null
      };
    }

    // Paso 2: Obtener perfil del usuario de user_profiles
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')  // ✅ CAMBIADO: era 'profiles'
      .select('*')
      .eq('id', user.id)
      .single();

    // Paso 3: Mapear campos para compatibilidad con código existente
    let mappedProfile = null;
    if (!profileError && profileData) {
      mappedProfile = {
        ...profileData,
        // Campos mapeados para retrocompatibilidad
        first_name: profileData.full_name?.split(' ')[0] || '',
        last_name: profileData.full_name?.split(' ').slice(1).join(' ') || '',
        is_artisan: profileData.role === 'seller' || profileData.role === 'artisan',
        artisan_verified: profileData.is_verified,
        avatar_url: profileData.profile_image_url
      };
    }

    return {
      success: true,
      user: user,
      profile: mappedProfile
    };

  } catch (error) {
    console.error('Get current user error:', error);
    return {
      success: false,
      user: null,
      profile: null
    };
  }
};

/**
 * getSession: Obtiene la sesión actual
 * SIN CAMBIOS: No interactúa con tablas de perfil
 * 
 * @returns {Object} - {success, session}
 */
export const getSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      throw error;
    }

    return {
      success: true,
      session: session
    };

  } catch (error) {
    console.error('Get session error:', error);
    return {
      success: false,
      session: null
    };
  }
};

/**
 * onAuthStateChange: Listener para cambios en el estado de autenticación
 * SIN CAMBIOS: Función de utilidad, no interactúa con tablas
 * 
 * @param {Function} callback - Función a ejecutar cuando cambia el estado
 * @returns {Object} - Subscription object para cleanup
 */
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback);
};

/**
 * resetPassword: Envía email para resetear contraseña
 * SIN CAMBIOS: Solo funcionalidad de Auth
 * 
 * @param {string} email - Email del usuario
 * @returns {Object} - {success, message/error}
 */
export const resetPassword = async (email) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) {
      throw error;
    }

    return {
      success: true,
      message: 'Password reset email sent! Please check your inbox.'
    };

  } catch (error) {
    console.error('Reset password error:', error);
    return {
      success: false,
      error: 'Failed to send reset email. Please try again.'
    };
  }
};

/**
 * updateProfile: Actualiza el perfil del usuario
 * REESCRITO COMPLETAMENTE: Ahora funcional con user_profiles
 * 
 * @param {string} userId - ID del usuario
 * @param {Object} profileData - Datos a actualizar
 * @returns {Object} - {success, profile, message/error}
 */
export const updateProfile = async (userId, profileData) => {
  try {
    // Preparar datos para actualizar
    const updateData = {
      ...profileData,
      updated_at: new Date().toISOString()
    };

    // Si se están actualizando first_name y last_name, crear full_name
    if (profileData.first_name || profileData.last_name) {
      // Obtener perfil actual para tener los valores existentes
      const { data: currentProfile } = await supabase
        .from('user_profiles')
        .select('full_name')
        .eq('id', userId)
        .single();

      const currentFirstName = currentProfile?.full_name?.split(' ')[0] || '';
      const currentLastName = currentProfile?.full_name?.split(' ').slice(1).join(' ') || '';

      const newFirstName = profileData.first_name || currentFirstName;
      const newLastName = profileData.last_name || currentLastName;

      updateData.full_name = `${newFirstName} ${newLastName}`.trim();
      
      // Remover first_name y last_name ya que no existen en user_profiles
      delete updateData.first_name;
      delete updateData.last_name;
    }

    // Mapear campos que tienen nombres diferentes
    if (profileData.avatar_url) {
      updateData.profile_image_url = profileData.avatar_url;
      delete updateData.avatar_url;
    }

    if (profileData.is_artisan !== undefined) {
      updateData.role = profileData.is_artisan ? 'seller' : 'buyer';
      delete updateData.is_artisan;
    }

    if (profileData.artisan_verified !== undefined) {
      updateData.is_verified = profileData.artisan_verified;
      delete updateData.artisan_verified;
    }

    // Actualizar en la base de datos
    const { data, error } = await supabase
      .from('user_profiles')  // ✅ CAMBIADO: era 'profiles'
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Mapear respuesta para compatibilidad
    const mappedProfile = {
      ...data,
      first_name: data.full_name?.split(' ')[0] || '',
      last_name: data.full_name?.split(' ').slice(1).join(' ') || '',
      is_artisan: data.role === 'seller' || data.role === 'artisan',
      artisan_verified: data.is_verified,
      avatar_url: data.profile_image_url
    };

    return {
      success: true,
      profile: mappedProfile,
      message: 'Profile updated successfully!'
    };

  } catch (error) {
    console.error('Update profile error:', error);
    return {
      success: false,
      error: 'Failed to update profile. Please try again.'
    };
  }
};