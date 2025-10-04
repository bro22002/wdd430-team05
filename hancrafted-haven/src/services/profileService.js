// src/services/profileService.js
// Servicio para gestionar perfiles de usuario y artesanos
// Funciones avanzadas para edición, conversión a artesano, y más

import { supabase } from '../lib/supabase';

/**
 * updateUserProfile: Actualiza información básica del perfil
 * 
 * Permite actualizar campos como: nombre, bio, ubicación, teléfono, etc.
 * Los campos se mapean automáticamente entre nombres antiguos y nuevos
 * 
 * @param {string} userId - ID del usuario a actualizar
 * @param {Object} profileData - Datos a actualizar (parcial)
 * @param {string} [profileData.firstName] - Nombre
 * @param {string} [profileData.lastName] - Apellido
 * @param {string} [profileData.bio] - Biografía
 * @param {string} [profileData.location] - Ubicación/ciudad
 * @param {string} [profileData.phone] - Teléfono
 * @param {string} [profileData.website_url] - Sitio web
 * @returns {Object} - {success, profile, message/error}
 */
export const updateUserProfile = async (userId, profileData) => {
  try {
    console.log('🔄 Updating profile for user:', userId, profileData);

    // Preparar datos para actualización
    const updateData = {
      updated_at: new Date().toISOString()
    };

    // Mapear firstName + lastName → full_name
    if (profileData.firstName !== undefined || profileData.lastName !== undefined) {
      // Obtener perfil actual para combinar con valores existentes
      const { data: currentProfile } = await supabase
        .from('user_profiles')
        .select('full_name')
        .eq('id', userId)
        .single();

      const currentNames = currentProfile?.full_name?.split(' ') || ['', ''];
      const currentFirstName = currentNames[0] || '';
      const currentLastName = currentNames.slice(1).join(' ') || '';

      const newFirstName = profileData.firstName !== undefined 
        ? profileData.firstName 
        : currentFirstName;
      const newLastName = profileData.lastName !== undefined 
        ? profileData.lastName 
        : currentLastName;

      updateData.full_name = `${newFirstName} ${newLastName}`.trim();
    }

    // Campos que se pueden actualizar directamente (nombres coinciden)
    const directFields = ['bio', 'location', 'phone', 'website_url', 'username'];
    directFields.forEach(field => {
      if (profileData[field] !== undefined) {
        updateData[field] = profileData[field];
      }
    });

    // Mapear avatar_url → profile_image_url
    if (profileData.avatar_url !== undefined) {
      updateData.profile_image_url = profileData.avatar_url;
    }

    // Validación básica
    if (Object.keys(updateData).length === 1) {
      // Solo tiene updated_at, no hay datos para actualizar
      return {
        success: false,
        error: 'No data provided to update'
      };
    }

    // Actualizar en la base de datos
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Mapear respuesta para compatibilidad
    const mappedProfile = mapProfileFields(data);

    console.log('✅ Profile updated successfully:', mappedProfile);

    return {
      success: true,
      profile: mappedProfile,
      message: 'Profile updated successfully!'
    };

  } catch (error) {
    console.error('❌ Update profile error:', error);
    console.error('❌ Error details:', {
      message: error.message,
      hint: error.hint,
      details: error.details,
      code: error.code,
      full: error
    });
    return {
      success: false,
      error: error.message || 'Failed to update profile. Please try again.'
    };
  }
};

/**
 * becomeArtisan: Convierte un usuario regular en artesano/vendedor
 * 
 * Cambia el role a 'seller' y opcionalmente establece información
 * inicial de la tienda. El artesano inicia como NO verificado.
 * 
 * @param {string} userId - ID del usuario
 * @param {Object} artisanData - Datos del artesano
 * @param {string} artisanData.shop_name - Nombre de la tienda (requerido)
 * @param {string} [artisanData.shop_description] - Descripción de la tienda
 * @param {string} [artisanData.bio] - Biografía del artesano
 * @param {string} [artisanData.location] - Ubicación del taller
 * @returns {Object} - {success, profile, message/error}
 */
export const becomeArtisan = async (userId, artisanData) => {
  try {
    console.log('🎨 Converting user to artisan:', userId, artisanData);

    // Validación: shop_name es obligatorio
    if (!artisanData.shop_name || artisanData.shop_name.trim() === '') {
      return {
        success: false,
        error: 'Shop name is required to become an artisan'
      };
    }

    // Preparar datos de actualización
    const updateData = {
      role: 'seller',                    // Cambiar a vendedor
      is_verified: false,                // Inicialmente no verificado
      shop_name: artisanData.shop_name.trim(),
      updated_at: new Date().toISOString()
    };

    // Campos opcionales
    if (artisanData.shop_description) {
      updateData.shop_description = artisanData.shop_description;
    }

    if (artisanData.bio) {
      updateData.bio = artisanData.bio;
    }

    if (artisanData.location) {
      updateData.location = artisanData.location;
    }

    // Actualizar perfil
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Mapear respuesta
    const mappedProfile = mapProfileFields(data);

    console.log('✅ User converted to artisan:', mappedProfile);

    return {
      success: true,
      profile: mappedProfile,
      message: 'Congratulations! You are now an artisan. Your profile is pending verification.'
    };

  } catch (error) {
    console.error('❌ Become artisan error:', error);
    return {
      success: false,
      error: error.message || 'Failed to convert to artisan. Please try again.'
    };
  }
};

/**
 * updateShopInfo: Actualiza información específica de la tienda del artesano
 * 
 * Solo puede ser usado por usuarios con role='seller'
 * 
 * @param {string} userId - ID del usuario (debe ser artesano)
 * @param {Object} shopData - Datos de la tienda
 * @param {string} [shopData.shop_name] - Nombre de la tienda
 * @param {string} [shopData.shop_description] - Descripción de la tienda
 * @param {string} [shopData.instagram_handle] - Usuario de Instagram
 * @param {string} [shopData.facebook_url] - URL de Facebook
 * @returns {Object} - {success, profile, message/error}
 */
export const updateShopInfo = async (userId, shopData) => {
  try {
    console.log('🏪 Updating shop info:', userId, shopData);

    // Verificar que el usuario es artesano
    const { data: currentProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    if (currentProfile.role !== 'seller' && currentProfile.role !== 'artisan') {
      return {
        success: false,
        error: 'Only artisans can update shop information'
      };
    }

    // Preparar datos de actualización
    const updateData = {
      updated_at: new Date().toISOString()
    };

    // Campos permitidos para actualizar
    const allowedFields = [
      'shop_name', 
      'shop_description', 
      'instagram_handle', 
      'facebook_url'
    ];

    allowedFields.forEach(field => {
      if (shopData[field] !== undefined) {
        updateData[field] = shopData[field];
      }
    });

    // Validar que hay algo para actualizar
    if (Object.keys(updateData).length === 1) {
      return {
        success: false,
        error: 'No shop data provided to update'
      };
    }

    // Actualizar
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

    console.log('✅ Shop info updated:', mappedProfile);

    return {
      success: true,
      profile: mappedProfile,
      message: 'Shop information updated successfully!'
    };

  } catch (error) {
    console.error('❌ Update shop info error:', error);
    return {
      success: false,
      error: error.message || 'Failed to update shop information. Please try again.'
    };
  }
};

/**
 * uploadProfileImage: Sube una imagen de perfil a Supabase Storage
 * 
 * Valida tipo y tamaño de archivo, sube a storage, y actualiza
 * el campo profile_image_url en el perfil.
 * 
 * @param {string} userId - ID del usuario
 * @param {File} imageFile - Archivo de imagen (File object)
 * @returns {Object} - {success, imageUrl, message/error}
 */
export const uploadProfileImage = async (userId, imageFile) => {
  try {
    console.log('📸 Uploading profile image:', userId, imageFile.name);

    // Validación 1: Verificar que es un archivo
    if (!imageFile || !(imageFile instanceof File)) {
      return {
        success: false,
        error: 'Invalid file provided'
      };
    }

    // Validación 2: Tipo de archivo (solo imágenes)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(imageFile.type)) {
      return {
        success: false,
        error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.'
      };
    }

    // Validación 3: Tamaño máximo (2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB en bytes
    if (imageFile.size > maxSize) {
      return {
        success: false,
        error: 'File is too large. Maximum size is 2MB.'
      };
    }

    // Generar nombre único para el archivo
    const fileExtension = imageFile.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExtension}`;
    const filePath = `avatars/${fileName}`;

    // Subir archivo a Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profiles')  // Nombre del bucket (debes crearlo en Supabase)
      .upload(filePath, imageFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw uploadError;
    }

    // Obtener URL pública de la imagen
    const { data: urlData } = supabase.storage
      .from('profiles')
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

    // Actualizar perfil con la nueva URL
    const { data: profileData, error: updateError } = await supabase
      .from('user_profiles')
      .update({
        profile_image_url: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    console.log('✅ Profile image uploaded:', publicUrl);

    return {
      success: true,
      imageUrl: publicUrl,
      profile: mapProfileFields(profileData),
      message: 'Profile image uploaded successfully!'
    };

  } catch (error) {
    console.error('❌ Upload profile image error:', error);
    
    let errorMessage = 'Failed to upload image. Please try again.';
    
    if (error.message?.includes('Bucket not found')) {
      errorMessage = 'Storage bucket not configured. Please contact support.';
    } else if (error.message?.includes('exceeded')) {
      errorMessage = 'Storage quota exceeded. Please contact support.';
    }

    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * getPublicProfile: Obtiene el perfil público de un artesano
 * 
 * Retorna información visible públicamente, sin datos sensibles.
 * Útil para mostrar perfiles de artesanos a otros usuarios.
 * 
 * @param {string} userId - ID del usuario/artesano
 * @returns {Object} - {success, profile, error}
 */
export const getPublicProfile = async (userId) => {
  try {
    console.log('👁️ Getting public profile:', userId);

    // Obtener perfil (solo campos públicos)
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        id,
        full_name,
        username,
        bio,
        location,
        profile_image_url,
        role,
        shop_name,
        shop_description,
        website_url,
        instagram_handle,
        facebook_url,
        is_verified,
        created_at
      `)
      .eq('id', userId)
      .eq('is_active', true)  // Solo perfiles activos
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return {
        success: false,
        error: 'Profile not found or inactive'
      };
    }

    // Mapear campos
    const mappedProfile = mapProfileFields(data);

    // Si es artesano, agregar estadísticas adicionales
    if (data.role === 'seller' || data.role === 'artisan') {
      // Obtener conteo de productos (asumiendo que tienes tabla products)
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('artisan_id', userId);  // Ajusta según tu estructura

      mappedProfile.stats = {
        totalProducts: productCount || 0
      };
    }

    console.log('✅ Public profile retrieved:', mappedProfile);

    return {
      success: true,
      profile: mappedProfile
    };

  } catch (error) {
    console.error('❌ Get public profile error:', error);
    return {
      success: false,
      error: error.message || 'Failed to load profile'
    };
  }
};

/**
 * deleteProfileImage: Elimina la imagen de perfil actual
 * 
 * Remueve la imagen de Storage y actualiza el perfil
 * 
 * @param {string} userId - ID del usuario
 * @returns {Object} - {success, message/error}
 */
export const deleteProfileImage = async (userId) => {
  try {
    console.log('🗑️ Deleting profile image:', userId);

    // Obtener URL actual de la imagen
    const { data: profile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('profile_image_url')
      .eq('id', userId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    // Si hay imagen, eliminarla de Storage
    if (profile.profile_image_url) {
      // Extraer path de la URL
      const urlParts = profile.profile_image_url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `avatars/${fileName}`;

      // Eliminar archivo
      const { error: deleteError } = await supabase.storage
        .from('profiles')
        .remove([filePath]);

      if (deleteError) {
        console.warn('⚠️ Error deleting file from storage:', deleteError);
        // Continuar de todos modos para limpiar el campo en la BD
      }
    }

    // Actualizar perfil (quitar URL)
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        profile_image_url: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      throw updateError;
    }

    console.log('✅ Profile image deleted');

    return {
      success: true,
      message: 'Profile image deleted successfully'
    };

  } catch (error) {
    console.error('❌ Delete profile image error:', error);
    return {
      success: false,
      error: 'Failed to delete profile image. Please try again.'
    };
  }
};

/**
 * mapProfileFields: Función helper para mapear campos
 * Convierte campos de user_profiles a formato compatible con código existente
 * 
 * @param {Object} profileData - Datos del perfil de la BD
 * @returns {Object} - Perfil con campos mapeados
 */
const mapProfileFields = (profileData) => {
  if (!profileData) return null;

  return {
    ...profileData,
    // Mapeos para retrocompatibilidad
    first_name: profileData.full_name?.split(' ')[0] || '',
    last_name: profileData.full_name?.split(' ').slice(1).join(' ') || '',
    is_artisan: profileData.role === 'seller' || profileData.role === 'artisan',
    artisan_verified: profileData.is_verified,
    avatar_url: profileData.profile_image_url
  };
};

/**
 * verifyArtisan: Marca un artesano como verificado (ADMIN ONLY)
 * 
 * Esta función debería estar protegida por permisos de admin
 * 
 * @param {string} userId - ID del artesano a verificar
 * @returns {Object} - {success, message/error}
 */
export const verifyArtisan = async (userId) => {
  try {
    console.log('✓ Verifying artisan:', userId);

    // TODO: Agregar validación de permisos de admin aquí
    
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        is_verified: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .eq('role', 'seller')  // Solo puede verificar sellers
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log('✅ Artisan verified:', data);

    return {
      success: true,
      message: 'Artisan verified successfully!',
      profile: mapProfileFields(data)
    };

  } catch (error) {
    console.error('❌ Verify artisan error:', error);
    return {
      success: false,
      error: 'Failed to verify artisan. Please try again.'
    };
  }
};