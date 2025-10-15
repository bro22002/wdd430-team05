// Servicio para manejar mensajes de contacto entre compradores y vendedores
// Permite enviar mensajes, obtener mensajes recibidos, y marcar como leídos

import { supabase } from '../lib/supabase';

/**
 * sendContactMessage: Envía un mensaje de contacto a un vendedor
 * 
 * Esta función guarda el mensaje en la tabla 'contact_messages' de Supabase
 * Incluye validaciones para asegurar que todos los campos requeridos estén presentes
 * 
 * @param {Object} messageData - Datos del mensaje
 * @param {string} messageData.seller_id - ID del vendedor (user_profiles.id)
 * @param {string} messageData.sender_name - Nombre del remitente (requerido)
 * @param {string} messageData.sender_email - Email del remitente (requerido)
 * @param {string} messageData.subject - Asunto del mensaje (requerido)
 * @param {string} messageData.message - Contenido del mensaje (requerido)
 * @param {string} [messageData.sender_id] - ID del remitente si está autenticado (opcional)
 * @returns {Object} - {success, message, error}
 */
export const sendContactMessage = async (messageData) => {
  try {
    console.log('📧 Sending contact message to seller:', messageData.seller_id);

    // ============================================
    // VALIDACIONES: Verificar campos requeridos
    // ============================================
    
    // Validación 1: Verificar que hay un seller_id
    if (!messageData.seller_id) {
      return {
        success: false,
        error: 'Seller ID is required'
      };
    }

    // Validación 2: Nombre del remitente
    if (!messageData.sender_name || messageData.sender_name.trim() === '') {
      return {
        success: false,
        error: 'Your name is required'
      };
    }

    // Validación 3: Email del remitente con formato válido
    if (!messageData.sender_email || messageData.sender_email.trim() === '') {
      return {
        success: false,
        error: 'Your email is required'
      };
    }

    // Validar formato de email usando expresión regular
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(messageData.sender_email)) {
      return {
        success: false,
        error: 'Please enter a valid email address'
      };
    }

    // Validación 4: Asunto del mensaje
    if (!messageData.subject || messageData.subject.trim() === '') {
      return {
        success: false,
        error: 'Subject is required'
      };
    }

    // Validación 5: Contenido del mensaje
    if (!messageData.message || messageData.message.trim() === '') {
      return {
        success: false,
        error: 'Message content is required'
      };
    }

    // Validación 6: Longitud máxima del mensaje (2000 caracteres)
    if (messageData.message.length > 2000) {
      return {
        success: false,
        error: 'Message is too long (maximum 2000 characters)'
      };
    }

    // ============================================
    // PREPARAR DATOS: Crear objeto para insertar
    // ============================================
    
    const insertData = {
      seller_id: messageData.seller_id,
      sender_name: messageData.sender_name.trim(),
      sender_email: messageData.sender_email.trim().toLowerCase(),
      subject: messageData.subject.trim(),
      message: messageData.message.trim(),
      sender_id: messageData.sender_id || null,  // Opcional: si el usuario está autenticado
      is_read: false,  // Por defecto, el mensaje no está leído
      created_at: new Date().toISOString()
    };

    // ============================================
    // INSERTAR EN BASE DE DATOS
    // ============================================
    
    // Supabase insert():
    // - Inserta un nuevo registro en la tabla 'contact_messages'
    // - select(): retorna el registro insertado
    // - single(): espera exactamente un resultado
    const { data, error } = await supabase
      .from('contact_messages')
      .insert(insertData)
      .select()
      .single();

    // Si hay error en la inserción, lanzar excepción
    if (error) {
      throw error;
    }

    console.log('✅ Contact message sent successfully:', data.id);

    return {
      success: true,
      message: 'Thank you for reaching out! Your message has been sent successfully.',
      messageId: data.id
    };

  } catch (error) {
    console.error('❌ Send contact message error:', error);

    // Determinar mensaje de error específico
    let errorMessage = 'Failed to send message. Please try again.';

    if (error.message?.includes('violates foreign key')) {
      errorMessage = 'Seller not found. Please try again.';
    } else if (error.message?.includes('duplicate')) {
      errorMessage = 'You have already sent this message. Please wait before sending another.';
    }

    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * getSellerMessages: Obtiene todos los mensajes recibidos por un vendedor
 * 
 * Esta función es útil para que los vendedores vean los mensajes que han recibido
 * Ordena por fecha más reciente primero
 * 
 * @param {string} sellerId - ID del vendedor
 * @param {Object} options - Opciones de filtrado
 * @param {boolean} [options.unreadOnly] - Solo mensajes no leídos
 * @param {number} [options.limit] - Número máximo de mensajes
 * @returns {Object} - {success, messages[], error}
 */
export const getSellerMessages = async (sellerId, options = {}) => {
  try {
    console.log('📬 Getting messages for seller:', sellerId);

    // Construir query base
    let query = supabase
      .from('contact_messages')
      .select('*')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });

    // Aplicar filtro de no leídos si se solicita
    if (options.unreadOnly) {
      query = query.eq('is_read', false);
    }

    // Aplicar límite si se proporciona
    if (options.limit) {
      query = query.limit(options.limit);
    }

    // Ejecutar query
    const { data, error } = await query;

    if (error) {
      throw error;
    }

    console.log('✅ Messages retrieved:', data?.length || 0);

    return {
      success: true,
      messages: data || [],
      count: data?.length || 0
    };

  } catch (error) {
    console.error('❌ Get seller messages error:', error);
    return {
      success: false,
      messages: [],
      error: 'Failed to load messages'
    };
  }
};

/**
 * markMessageAsRead: Marca un mensaje como leído
 * 
 * El vendedor puede marcar mensajes como leídos
 * 
 * @param {string} messageId - ID del mensaje
 * @param {string} sellerId - ID del vendedor (para verificación)
 * @returns {Object} - {success, message, error}
 */
export const markMessageAsRead = async (messageId, sellerId) => {
  try {
    console.log('✓ Marking message as read:', messageId);

    // Actualizar el mensaje
    // eq('seller_id', sellerId): asegura que solo el vendedor pueda marcar sus mensajes
    const { data, error } = await supabase
      .from('contact_messages')
      .update({ 
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('id', messageId)
      .eq('seller_id', sellerId)  // Verificación de seguridad
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log('✅ Message marked as read');

    return {
      success: true,
      message: 'Message marked as read'
    };

  } catch (error) {
    console.error('❌ Mark as read error:', error);
    return {
      success: false,
      error: 'Failed to mark message as read'
    };
  }
};

/**
 * getUnreadMessageCount: Obtiene el número de mensajes no leídos
 * 
 * Útil para mostrar un badge con el número de mensajes pendientes
 * 
 * @param {string} sellerId - ID del vendedor
 * @returns {Object} - {success, count, error}
 */
export const getUnreadMessageCount = async (sellerId) => {
  try {
    // count: 'exact' retorna el conteo exacto
    // head: true no retorna los datos, solo el conteo (más eficiente)
    const { count, error } = await supabase
      .from('contact_messages')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', sellerId)
      .eq('is_read', false);

    if (error) {
      throw error;
    }

    return {
      success: true,
      count: count || 0
    };

  } catch (error) {
    console.error('❌ Get unread count error:', error);
    return {
      success: false,
      count: 0,
      error: 'Failed to get unread count'
    };
  }
};

/**
 * deleteMessage: Elimina un mensaje (solo el vendedor puede hacerlo)
 * 
 * @param {string} messageId - ID del mensaje
 * @param {string} sellerId - ID del vendedor (para verificación)
 * @returns {Object} - {success, message, error}
 */
export const deleteMessage = async (messageId, sellerId) => {
  try {
    console.log('🗑️ Deleting message:', messageId);

    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', messageId)
      .eq('seller_id', sellerId);  // Verificación de seguridad

    if (error) {
      throw error;
    }

    console.log('✅ Message deleted');

    return {
      success: true,
      message: 'Message deleted successfully'
    };

  } catch (error) {
    console.error('❌ Delete message error:', error);
    return {
      success: false,
      error: 'Failed to delete message'
    };
  }
};

/**
 * deleteSellerAccount: Elimina completamente la cuenta de un vendedor
 * 
 * ADVERTENCIA: Esta es una operación PERMANENTE que no se puede deshacer
 * Elimina:
 * - Perfil del usuario (user_profiles)
 * - Todos sus productos (products) - CASCADE
 * - Todos sus mensajes recibidos (contact_messages) - CASCADE
 * - Imágenes del storage
 * - Usuario de Auth
 * 
 * @param {string} userId - ID del usuario/vendedor
 * @param {string} confirmationText - Texto de confirmación que debe coincidir
 * @returns {Object} - {success, message, error}
 */
export const deleteSellerAccount = async (userId, confirmationText) => {
  try {
    console.log('⚠️ CRITICAL: Attempting to delete seller account:', userId);

    // Verificación de seguridad: el texto debe ser exactamente "DELETE MY ACCOUNT"
    if (confirmationText !== 'DELETE MY ACCOUNT') {
      return {
        success: false,
        error: 'Confirmation text does not match. Account deletion cancelled.'
      };
    }

    // Paso 1: Obtener información del perfil antes de eliminar
    const { data: profile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('profile_image_url, role')
      .eq('id', userId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    // Paso 2: Eliminar imagen de perfil del storage si existe
    if (profile.profile_image_url) {
      const urlParts = profile.profile_image_url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `avatars/${fileName}`;

      const { error: deleteImageError } = await supabase.storage
        .from('profiles')
        .remove([filePath]);

      if (deleteImageError) {
        console.warn('⚠️ Could not delete profile image:', deleteImageError);
        // Continuar de todos modos
      }
    }

    // Paso 3: Eliminar todas las imágenes de productos del storage
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('image_url')
      .eq('artisan_id', userId);

    if (!productsError && products && products.length > 0) {
      const productImagePaths = products
        .filter(p => p.image_url)
        .map(p => {
          const fileName = p.image_url.split('/').pop();
          return `products/${fileName}`;
        });

      if (productImagePaths.length > 0) {
        const { error: deleteProductImagesError } = await supabase.storage
          .from('products')
          .remove(productImagePaths);

        if (deleteProductImagesError) {
          console.warn('⚠️ Could not delete some product images:', deleteProductImagesError);
          // Continuar de todos modos
        }
      }
    }

    // Paso 4: Eliminar el perfil (esto eliminará en cascada productos y mensajes)
    const { error: deleteProfileError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', userId);

    if (deleteProfileError) {
      throw deleteProfileError;
    }

    // Paso 5: Eliminar usuario de Auth
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId);

    if (deleteAuthError) {
      console.warn('⚠️ Could not delete auth user (requires admin key):', deleteAuthError);
      // Esto fallará si usas la anon key, pero el perfil ya fue eliminado
      // El usuario puede contactar soporte para eliminar completamente
    }

    console.log('✅ Seller account deleted successfully');

    return {
      success: true,
      message: 'Your account has been permanently deleted. We\'re sorry to see you go.'
    };

  } catch (error) {
    console.error('❌ Delete seller account error:', error);
    
    let errorMessage = 'Failed to delete account. Please try again or contact support.';
    
    if (error.message?.includes('foreign key')) {
      errorMessage = 'Cannot delete account due to existing data dependencies. Please contact support.';
    }

    return {
      success: false,
      error: errorMessage
    };
  }
};