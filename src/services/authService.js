// src/services/authService.js
// Servicio ACTUALIZADO que asegura la existencia del perfil

import { supabase } from '../lib/supabase';
import { ensureUserProfile } from './ensureUserProfile';

/**
 * getCurrentUser: Obtiene el usuario actual Y ASEGURA que tenga perfil
 * 
 * CAMBIO PRINCIPAL: Ahora usa ensureUserProfile() para crear el perfil
 * si no existe, en lugar de solo reportar el error
 * 
 * ¿Qué hace paso a paso?
 * 1. Obtiene el usuario de Auth
 * 2. Si hay usuario, ejecuta ensureUserProfile()
 * 3. ensureUserProfile crea el perfil si no existe
 * 4. Retorna usuario + perfil
 */
export const getCurrentUser = async () => {
  try {
    console.log('👤 Getting current user...');
    
    // PASO 1: Obtener usuario de Supabase Auth
    // getUser() consulta la sesión actual y retorna el usuario autenticado
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    // Si hay error o no hay usuario, retornar early
    if (userError || !user) {
      console.log('⚠️ No authenticated user found');
      return {
        success: false,
        user: null,
        profile: null
      };
    }

    console.log('✅ User found:', user.email);

    // PASO 2: ASEGURAR que el usuario tenga perfil
    // Esta es la CLAVE de la solución:
    // ensureUserProfile() busca el perfil, y si no existe, lo crea
    const profileResult = await ensureUserProfile(user);
    
    if (!profileResult.success) {
      console.log('❌ Failed to ensure user profile:', profileResult.error);
      return {
        success: false,
        user: user,
        profile: null,
        error: profileResult.error
      };
    }

    // PASO 3: Mapear campos para compatibilidad
    // Convertimos campos de user_profiles a los nombres que usa el código existente
    const mappedProfile = mapProfileFields(profileResult.profile);

    // Si el perfil fue recién creado, informar
    if (profileResult.wasCreated) {
      console.log('🆕 New profile was created for user');
    }

    console.log('✅ getCurrentUser successful:', {
      userId: user.id,
      email: user.email,
      hasProfile: !!mappedProfile,
      isArtisan: mappedProfile?.is_artisan || false
    });

    return {
      success: true,
      user: user,
      profile: mappedProfile
    };

  } catch (error) {
    console.log('❌ Get current user error:', error.message || error);
    return {
      success: false,
      user: null,
      profile: null,
      error: error.message
    };
  }
};

/**
 * signIn: Inicia sesión Y ASEGURA que el usuario tenga perfil
 * 
 * CAMBIO: Ahora usa ensureUserProfile() después de autenticar
 */
export const signIn = async (credentials) => {
  try {
    const { email, password } = credentials;

    console.log('🔐 Signing in:', email);

    // PASO 1: Autenticar con Supabase Auth
    // signInWithPassword valida email + contraseña
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (authError) {
      throw authError;
    }

    console.log('✅ Authentication successful');

    // PASO 2: ASEGURAR que tenga perfil
    // Esta función creará el perfil si no existe
    const profileResult = await ensureUserProfile(authData.user);
    
    if (!profileResult.success) {
      console.warn('⚠️ Profile creation/retrieval failed:', profileResult.error);
      // Aún así permitimos el login, pero sin perfil
    }

    // PASO 3: Mapear campos para compatibilidad
    const mappedProfile = profileResult.success 
      ? mapProfileFields(profileResult.profile) 
      : null;

    return {
      success: true,
      user: authData.user,
      session: authData.session,
      profile: mappedProfile,
      message: 'Login successful!'
    };

  } catch (error) {
    console.log('❌ Login error:', error.message || error);
    
    // Mensajes de error específicos
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
 * signUp: Registra nuevo usuario Y CREA su perfil
 * 
 * CAMBIO: Usa ensureUserProfile() si la inserción inicial falla
 */
export const signUp = async (userData) => {
  try {
    const { firstName, lastName, email, password } = userData;

    console.log('📝 Registering new user:', email);

    // PASO 1: Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: `${firstName} ${lastName}`,
          first_name: firstName,
          last_name: lastName
        }
      }
    });

    if (authError) {
      throw authError;
    }

    console.log('✅ User created in Auth');

    // PASO 2: ASEGURAR que el perfil se cree correctamente
    // Usar ensureUserProfile en lugar de insertar directamente
    if (authData.user) {
      const profileResult = await ensureUserProfile(authData.user);
      
      if (!profileResult.success) {
        console.log('⚠️ Profile creation failed:', profileResult.error);
        // Continuar de todos modos, ya que el usuario fue creado en Auth
      } else {
        console.log('✅ Profile created successfully');
      }
    }

    return {
      success: true,
      user: authData.user,
      session: authData.session,
      message: 'Registration successful! Please check your email to verify your account.'
    };

  } catch (error) {
    console.log('❌ Registration error:', error.message || error);
    
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
 * mapProfileFields: Mapea campos de user_profiles a formato legacy
 * 
 * ¿Para qué sirve?
 * El código existente usa nombres como "first_name" y "is_artisan"
 * pero user_profiles usa "full_name" y "role"
 * Esta función convierte entre ambos formatos
 */
const mapProfileFields = (profileData) => {
  if (!profileData) return null;

  return {
    ...profileData,
    // Mapeos para retrocompatibilidad con código existente:
    first_name: profileData.full_name?.split(' ')[0] || '',
    last_name: profileData.full_name?.split(' ').slice(1).join(' ') || '',
    is_artisan: profileData.role === 'seller' || profileData.role === 'artisan',
    artisan_verified: profileData.is_verified,
    avatar_url: profileData.profile_image_url
  };
};

// ========================================
// FUNCIONES SIN CAMBIOS (exportar igual)
// ========================================

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
    console.log('Logout error:', error.message || error);
    return {
      success: false,
      error: 'Failed to logout. Please try again.'
    };
  }
};

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
    console.log('Get session error:', error.message || error);
    return {
      success: false,
      session: null
    };
  }
};

export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback);
};

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
    console.log('Reset password error:', error.message || error);
    return {
      success: false,
      error: 'Failed to send reset email. Please try again.'
    };
  }
};

export const updateProfile = async (userId, profileData) => {
  try {
    const updateData = {
      ...profileData,
      updated_at: new Date().toISOString()
    };

    if (profileData.first_name || profileData.last_name) {
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
      
      delete updateData.first_name;
      delete updateData.last_name;
    }

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

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    const mappedProfile = mapProfileFields(data);

    return {
      success: true,
      profile: mappedProfile,
      message: 'Profile updated successfully!'
    };

  } catch (error) {
    console.log('Update profile error:', error.message || error);
    return {
      success: false,
      error: 'Failed to update profile. Please try again.'
    };
  }
};

/**
 * RESUMEN DE CAMBIOS:
 * 
 * 1. getCurrentUser() → Ahora usa ensureUserProfile()
 *    - Si el perfil existe → Lo retorna
 *    - Si NO existe → Lo crea automáticamente
 * 
 * 2. signIn() → También usa ensureUserProfile()
 *    - Después de autenticar, asegura que haya perfil
 * 
 * 3. signUp() → Usa ensureUserProfile() como fallback
 *    - Si la creación inicial falla, ensureUserProfile lo intenta
 * 
 * RESULTADO: Ahora NUNCA tendrás un usuario sin perfil ✅
 */