// src/hooks/useAuth.js
// Hook personalizado para manejar autenticación con Supabase

import { useState, useEffect, createContext, useContext } from 'react';
import {
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  getSession,
  onAuthStateChange
} from '../services/authService';

// Crear contexto de autenticación
const AuthContext = createContext({});

// Hook para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Proveedor de contexto de autenticación
export const AuthProvider = ({ children }) => {
  // Estados del hook de autenticación
  const [user, setUser] = useState(null);          // Usuario autenticado
  const [profile, setProfile] = useState(null);   // Perfil del usuario
  const [session, setSession] = useState(null);   // Sesión activa
  const [loading, setLoading] = useState(true);   // Estado de carga inicial
  const [authLoading, setAuthLoading] = useState(false); // Carga de operaciones auth

  // useEffect: Configurar listener de cambios de autenticación
  useEffect(() => {
    // Obtener sesión inicial
    getInitialSession();

    // Configurar listener para cambios de estado
    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session);
      
      if (session?.user) {
        await handleUserSession(session);
      } else {
        // Usuario desconectado
        setUser(null);
        setProfile(null);
        setSession(null);
      }
      
      setLoading(false);
    });

    // Cleanup: remover listener al desmontar
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // getInitialSession: Obtiene la sesión inicial al cargar la app
  const getInitialSession = async () => {
    try {
      const sessionResult = await getSession();
      if (sessionResult.success && sessionResult.session) {
        await handleUserSession(sessionResult.session);
      }
    } catch (error) {
      console.error('Error getting initial session:', error);
    } finally {
      setLoading(false);
    }
  };

  // handleUserSession: Maneja cuando hay una sesión activa
  const handleUserSession = async (session) => {
    try {
      setSession(session);
      setUser(session.user);

      // Obtener perfil del usuario
      const userResult = await getCurrentUser();
      if (userResult.success && userResult.profile) {
        setProfile(userResult.profile);
      }
    } catch (error) {
      console.error('Error handling user session:', error);
    }
  };

  // register: Función para registrar nuevo usuario
  const register = async (userData) => {
    try {
      setAuthLoading(true);
      const result = await signUp(userData);
      
      if (result.success) {
        // El usuario será establecido automáticamente por el listener
        return { success: true, message: result.message };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed. Please try again.' };
    } finally {
      setAuthLoading(false);
    }
  };

  // login: Función para iniciar sesión
  const login = async (credentials) => {
    try {
      setAuthLoading(true);
      const result = await signIn(credentials);
      
      if (result.success) {
        // El usuario será establecido automáticamente por el listener
        return { success: true, message: result.message };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    } finally {
      setAuthLoading(false);
    }
  };

  // logout: Función para cerrar sesión
  const logout = async () => {
    try {
      setAuthLoading(true);
      const result = await signOut();
      
      if (result.success) {
        // El estado será limpiado automáticamente por el listener
        return { success: true, message: result.message };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: 'Logout failed. Please try again.' };
    } finally {
      setAuthLoading(false);
    }
  };

  // updateUserProfile: Función para actualizar perfil
  const updateUserProfile = async (profileData) => {
    try {
      setAuthLoading(true);
      // Esta función la implementaremos más adelante
      console.log('Updating profile:', profileData);
      return { success: true, message: 'Profile updated successfully!' };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: 'Failed to update profile.' };
    } finally {
      setAuthLoading(false);
    }
  };

  // Valores y funciones que el hook expondrá
  const value = {
    // Estados
    user,
    profile, 
    session,
    loading,
    authLoading,
    
    // Funciones
    register,
    login,
    logout,
    updateUserProfile,
    
    // Computed values
    isAuthenticated: !!user,
    isArtisan: profile?.is_artisan || false,
    isVerifiedArtisan: profile?.artisan_verified || false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook simplificado para uso directo (alternativa al contexto)
export const useAuthState = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Función para obtener usuario actual
    const fetchUser = async () => {
      try {
        const result = await getCurrentUser();
        if (result.success) {
          setUser(result.user);
          setProfile(result.profile);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Listener para cambios de autenticación
    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        const result = await getCurrentUser();
        if (result.success) {
          setProfile(result.profile);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, []);

  return {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    isArtisan: profile?.is_artisan || false
  };
};