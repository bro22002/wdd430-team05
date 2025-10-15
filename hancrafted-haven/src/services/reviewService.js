// src/services/reviewService.js
// Servicio para gestionar reviews y valoraciones de productos

import { supabase } from '../lib/supabase';

/**
 * createProductReview: Crea una nueva review para un producto
 * 
 * Esta función valida los datos y crea un registro en la tabla product_reviews
 * También actualiza el rating promedio del producto automáticamente
 * 
 * @param {Object} reviewData - Datos de la review
 * @param {string} reviewData.product_id - ID del producto
 * @param {string} reviewData.reviewer_name - Nombre del revisor
 * @param {number} reviewData.rating - Valoración del 1 al 5
 * @param {string} reviewData.comment - Comentario de la review
 * @param {string} [reviewData.user_id] - ID del usuario (opcional, si está logueado)
 * @returns {Object} - {success, review, error}
 */
export const createProductReview = async (reviewData) => {
  try {
    console.log('📝 Creating product review:', reviewData);

    // Validación 1: Verificar campos requeridos
    if (!reviewData.product_id) {
      return {
        success: false,
        error: 'Product ID is required'
      };
    }

    if (!reviewData.reviewer_name || reviewData.reviewer_name.trim() === '') {
      return {
        success: false,
        error: 'Reviewer name is required'
      };
    }

    if (!reviewData.comment || reviewData.comment.trim() === '') {
      return {
        success: false,
        error: 'Comment is required'
      };
    }

    // Validación 2: Verificar que el rating esté en rango válido
    const rating = parseInt(reviewData.rating);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      return {
        success: false,
        error: 'Rating must be between 1 and 5'
      };
    }

    // Preparar datos para insertar
    const insertData = {
      product_id: reviewData.product_id,
      reviewer_name: reviewData.reviewer_name.trim(),
      rating: rating,
      comment: reviewData.comment.trim(),
      user_id: reviewData.user_id || null, // Opcional
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Insertar la review en la base de datos
    const { data, error } = await supabase
      .from('product_reviews')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log('✅ Review created:', data.id);

    // Después de crear la review, actualizar el rating promedio del producto
    await updateProductAverageRating(reviewData.product_id);

    return {
      success: true,
      review: data,
      message: 'Review submitted successfully!'
    };

  } catch (error) {
    console.error('❌ Create review error:', error);
    
    // Manejar errores específicos
    let errorMessage = 'Failed to submit review. Please try again.';
    
    if (error.message?.includes('duplicate')) {
      errorMessage = 'You have already reviewed this product.';
    } else if (error.message?.includes('foreign key')) {
      errorMessage = 'Product not found.';
    }

    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * getProductReviews: Obtiene todas las reviews de un producto específico
 * 
 * Consulta la tabla product_reviews y ordena por fecha de creación
 * 
 * @param {string} productId - ID del producto
 * @param {Object} options - Opciones de consulta
 * @param {number} [options.limit] - Límite de reviews a obtener
 * @param {number} [options.offset] - Offset para paginación
 * @param {string} [options.orderBy] - Campo para ordenar ('created_at', 'rating')
 * @param {boolean} [options.ascending] - Orden ascendente o descendente
 * @returns {Object} - {success, reviews, totalCount, error}
 */
export const getProductReviews = async (productId, options = {}) => {
  try {
    console.log('📖 Getting reviews for product:', productId);

    // Configurar opciones por defecto
    const {
      limit = 50,           // Máximo 50 reviews por defecto
      offset = 0,           // Comenzar desde el inicio
      orderBy = 'created_at', // Ordenar por fecha de creación
      ascending = false     // Más recientes primero
    } = options;

    // Construcción de la consulta
    let query = supabase
      .from('product_reviews')
      .select('*', { count: 'exact' }) // count: 'exact' nos da el total
      .eq('product_id', productId);

    // Aplicar orden
    query = query.order(orderBy, { ascending });

    // Aplicar límite y offset
    if (limit) {
      query = query.range(offset, offset + limit - 1);
    }

    // Ejecutar consulta
    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    console.log('✅ Reviews retrieved:', data?.length || 0);

    return {
      success: true,
      reviews: data || [],
      totalCount: count || 0,
      hasMore: count > (offset + (data?.length || 0))
    };

  } catch (error) {
    console.error('❌ Get reviews error:', error);
    return {
      success: false,
      reviews: [],
      totalCount: 0,
      error: error.message || 'Failed to load reviews'
    };
  }
};

/**
 * updateProductAverageRating: Recalcula y actualiza el rating promedio del producto
 * 
 * Esta función se ejecuta automáticamente después de cada nueva review
 * Calcula el promedio de todas las reviews y actualiza la tabla products
 * 
 * @param {string} productId - ID del producto
 * @returns {Object} - {success, newRating, error}
 */
export const updateProductAverageRating = async (productId) => {
  try {
    console.log('🔄 Updating average rating for product:', productId);

    // Paso 1: Obtener todas las reviews del producto para calcular promedio
    const { data: reviews, error: reviewsError } = await supabase
      .from('product_reviews')
      .select('rating')
      .eq('product_id', productId);

    if (reviewsError) {
      throw reviewsError;
    }

    // Paso 2: Calcular el promedio
    let newRating = 0;
    if (reviews && reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      newRating = Math.round((totalRating / reviews.length) * 10) / 10; // Redondear a 1 decimal
    }

    // Paso 3: Actualizar el producto con el nuevo rating
    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update({ 
        rating: newRating,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId)
      .select('rating')
      .single();

    if (updateError) {
      throw updateError;
    }

    console.log('✅ Product rating updated to:', newRating);

    return {
      success: true,
      newRating: newRating,
      reviewCount: reviews.length
    };

  } catch (error) {
    console.error('❌ Update rating error:', error);
    return {
      success: false,
      error: error.message || 'Failed to update product rating'
    };
  }
};

/**
 * deleteReview: Elimina una review (solo el autor o admin puede hacerlo)
 * 
 * Verifica permisos antes de eliminar y actualiza el rating del producto
 * 
 * @param {string} reviewId - ID de la review a eliminar
 * @param {string} userId - ID del usuario que intenta eliminar (verificación)
 * @returns {Object} - {success, message/error}
 */
export const deleteReview = async (reviewId, userId) => {
  try {
    console.log('🗑️ Deleting review:', reviewId);

    // Paso 1: Verificar que la review existe y obtener info
    const { data: review, error: fetchError } = await supabase
      .from('product_reviews')
      .select('user_id, product_id')
      .eq('id', reviewId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    if (!review) {
      return {
        success: false,
        error: 'Review not found'
      };
    }

    // Paso 2: Verificar permisos (solo el autor puede eliminar)
    if (review.user_id && review.user_id !== userId) {
      return {
        success: false,
        error: 'You do not have permission to delete this review'
      };
    }

    // Paso 3: Eliminar la review
    const { error: deleteError } = await supabase
      .from('product_reviews')
      .delete()
      .eq('id', reviewId);

    if (deleteError) {
      throw deleteError;
    }

    // Paso 4: Actualizar el rating promedio del producto
    await updateProductAverageRating(review.product_id);

    console.log('✅ Review deleted');

    return {
      success: true,
      message: 'Review deleted successfully'
    };

  } catch (error) {
    console.error('❌ Delete review error:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete review'
    };
  }
};

/**
 * getUserReviewForProduct: Verifica si un usuario ya revieweó un producto
 * 
 * Útil para prevenir reviews duplicadas del mismo usuario
 * 
 * @param {string} userId - ID del usuario
 * @param {string} productId - ID del producto
 * @returns {Object} - {success, hasReviewed, review, error}
 */
export const getUserReviewForProduct = async (userId, productId) => {
  try {
    console.log('🔍 Checking user review:', { userId, productId });

    if (!userId) {
      return {
        success: true,
        hasReviewed: false,
        review: null
      };
    }

    const { data: review, error } = await supabase
      .from('product_reviews')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      throw error;
    }

    return {
      success: true,
      hasReviewed: !!review,
      review: review || null
    };

  } catch (error) {
    console.error('❌ Get user review error:', error);
    return {
      success: false,
      hasReviewed: false,
      review: null,
      error: error.message
    };
  }
};

/**
 * getReviewStats: Obtiene estadísticas de reviews para un producto
 * 
 * Calcula distribución de ratings, promedio, total, etc.
 * 
 * @param {string} productId - ID del producto
 * @returns {Object} - {success, stats, error}
 */
export const getReviewStats = async (productId) => {
  try {
    console.log('📊 Getting review stats for product:', productId);

    const { data: reviews, error } = await supabase
      .from('product_reviews')
      .select('rating')
      .eq('product_id', productId);

    if (error) {
      throw error;
    }

    if (!reviews || reviews.length === 0) {
      return {
        success: true,
        stats: {
          totalReviews: 0,
          averageRating: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        }
      };
    }

    // Calcular estadísticas
    const totalReviews = reviews.length;
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = Math.round((totalRating / totalReviews) * 10) / 10;

    // Distribución de ratings
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(review => {
      ratingDistribution[review.rating]++;
    });

    // Convertir a porcentajes
    const ratingPercentages = {};
    Object.keys(ratingDistribution).forEach(rating => {
      ratingPercentages[rating] = Math.round((ratingDistribution[rating] / totalReviews) * 100);
    });

    const stats = {
      totalReviews,
      averageRating,
      ratingDistribution,
      ratingPercentages
    };

    console.log('✅ Review stats calculated:', stats);

    return {
      success: true,
      stats
    };

  } catch (error) {
    console.error('❌ Get review stats error:', error);
    return {
      success: false,
      stats: null,
      error: error.message || 'Failed to calculate review statistics'
    };
  }
};