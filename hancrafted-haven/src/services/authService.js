// src/services/authService.js
// Servicio para manejar todas las operaciones de autenticación con Supabase

import { supabase } from '../lib/supabase';

// signUp: Registra un nuevo usuario en Supabase Auth
export const signUp = async (userData) => {
  try {
    const { firstName, lastName, email, password } = userData;

    // Paso 1: Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`
        }
      }
    });

    if (authError) {
      throw authError;
    }

    // Paso 2: Si el registro es exitoso, crear perfil en tabla profiles
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          first_name: firstName,
          last_name: lastName,
          email: email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      // Si hay error creando el perfil, lo logueamos pero no falseamos el registro
      if (profileError) {
        console.warn('Profile creation error:', profileError);
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

// signIn: Inicia sesión con email y contraseña
export const signIn = async (credentials) => {
  try {
    const { email, password } = credentials;

    // Autenticar con Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (authError) {
      throw authError;
    }

    // Obtener información del perfil del usuario
    let userProfile = null;
    if (authData.user) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (!profileError && profileData) {
        userProfile = profileData;
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

// signOut: Cierra la sesión del usuario
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

// getCurrentUser: Obtiene el usuario actual de la sesión
export const getCurrentUser = async () => {
  try {
    // Obtener usuario de la sesión actual
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return {
        success: false,
        user: null,
        profile: null
      };
    }

    // Obtener perfil del usuario
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return {
      success: true,
      user: user,
      profile: profileError ? null : profileData
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

// getSession: Obtiene la sesión actual
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

// onAuthStateChange: Listener para cambios en el estado de autenticación
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback);
};

// resetPassword: Envía email para resetear contraseña
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

// updateProfile: Actualiza el perfil del usuario
export const updateProfile = async (userId, profileData) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
      profile: data,
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