// src/services/productService.js
// Servicio para gestionar productos de artesanos
// Incluye: crear, leer, actualizar, eliminar productos y subir imágenes

import { supabase } from '../lib/supabase';

/**
 * getArtisanProducts: Obtiene todos los productos de un artesano específico
 * 
 * Esta función consulta la tabla 'products' filtrando por el ID del artesano
 * y ordena los resultados por fecha de creación (más recientes primero)
 * 
 * @param {string} artisanId - ID del artesano (user_profiles.id)
 * @returns {Object} - {success, products[], error}
 */
export const getArtisanProducts = async (artisanId) => {
  try {
    console.log('📦 Getting products for artisan:', artisanId);

    // Consulta a Supabase:
    // - from('products'): selecciona la tabla products
    // - select('*'): obtiene todos los campos
    // - eq('artisan_id', artisanId): filtra por artesano
    // - order(): ordena por fecha de creación descendente
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('artisan_id', artisanId)
      .order('created_at', { ascending: false });

    // Si hay error en la consulta, lanzar excepción
    if (error) {
      throw error;
    }

    console.log('✅ Products retrieved:', data?.length || 0);

    return {
      success: true,
      products: data || [],
      message: `Found ${data?.length || 0} products`
    };

  } catch (error) {
    console.error('❌ Get artisan products error:', error);
    return {
      success: false,
      products: [],
      error: error.message || 'Failed to load products'
    };
  }
};

/**
 * createProduct: Crea un nuevo producto para el artesano
 * 
 * Valida los datos requeridos y crea un registro en la tabla products
 * 
 * @param {string} artisanId - ID del artesano
 * @param {Object} productData - Datos del producto
 * @param {string} productData.title - Título del producto (requerido)
 * @param {string} productData.description - Descripción (requerido)
 * @param {number} productData.price - Precio (requerido)
 * @param {string} productData.category - Categoría (requerido)
 * @param {number} productData.stock - Cantidad en stock (requerido)
 * @param {string} [productData.image_url] - URL de la imagen (opcional)
 * @returns {Object} - {success, product, error}
 */
export const createProduct = async (artisanId, productData) => {
  try {
    console.log('➕ Creating new product:', productData.title);

    // Validaciones: verificar que los campos requeridos estén presentes
    if (!productData.title || productData.title.trim() === '') {
      return {
        success: false,
        error: 'Product title is required'
      };
    }

    if (!productData.description || productData.description.trim() === '') {
      return {
        success: false,
        error: 'Product description is required'
      };
    }

    if (!productData.price || productData.price <= 0) {
      return {
        success: false,
        error: 'Valid product price is required'
      };
    }

    if (!productData.category || productData.category.trim() === '') {
      return {
        success: false,
        error: 'Product category is required'
      };
    }

    if (productData.stock === undefined || productData.stock < 0) {
      return {
        success: false,
        error: 'Valid stock quantity is required'
      };
    }

    // Preparar datos para insertar en la base de datos
    const insertData = {
      artisan_id: artisanId,  // Relacionar con el artesano
      title: productData.title.trim(),
      description: productData.description.trim(),
      price: parseFloat(productData.price),  // Asegurar que sea número
      category: productData.category.trim(),
      stock: parseInt(productData.stock),  // Asegurar que sea entero
      image_url: productData.image_url || null,  // Opcional
      rating: 0,  // Rating inicial en 0
      created_at: new Date().toISOString(),  // Timestamp actual
      updated_at: new Date().toISOString()
    };

    // Insertar en la base de datos
    // - insert(): crea nuevo registro
    // - select(): retorna el registro creado
    // - single(): espera un solo resultado
    const { data, error } = await supabase
      .from('products')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log('✅ Product created:', data.id);

    return {
      success: true,
      product: data,
      message: 'Product created successfully!'
    };

  } catch (error) {
    console.error('❌ Create product error:', error);
    return {
      success: false,
      error: error.message || 'Failed to create product'
    };
  }
};

/**
 * updateProduct: Actualiza un producto existente
 * 
 * Verifica que el producto pertenezca al artesano antes de actualizar
 * 
 * @param {string} productId - ID del producto a actualizar
 * @param {string} artisanId - ID del artesano (para verificación)
 * @param {Object} productData - Datos a actualizar (parcial)
 * @returns {Object} - {success, product, error}
 */
export const updateProduct = async (productId, artisanId, productData) => {
  try {
    console.log('✏️ Updating product:', productId);

    // Verificar que el producto pertenece al artesano
    const { data: existingProduct, error: fetchError } = await supabase
      .from('products')
      .select('artisan_id')
      .eq('id', productId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    // Verificación de seguridad: solo el dueño puede actualizar
    if (existingProduct.artisan_id !== artisanId) {
      return {
        success: false,
        error: 'You do not have permission to update this product'
      };
    }

    // Preparar datos de actualización
    const updateData = {
      updated_at: new Date().toISOString()
    };

    // Agregar solo los campos que se proporcionaron
    if (productData.title !== undefined) {
      updateData.title = productData.title.trim();
    }

    if (productData.description !== undefined) {
      updateData.description = productData.description.trim();
    }

    if (productData.price !== undefined) {
      updateData.price = parseFloat(productData.price);
    }

    if (productData.category !== undefined) {
      updateData.category = productData.category.trim();
    }

    if (productData.stock !== undefined) {
      updateData.stock = parseInt(productData.stock);
    }

    if (productData.image_url !== undefined) {
      updateData.image_url = productData.image_url;
    }

    // Actualizar en la base de datos
    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', productId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log('✅ Product updated:', data.id);

    return {
      success: true,
      product: data,
      message: 'Product updated successfully!'
    };

  } catch (error) {
    console.error('❌ Update product error:', error);
    return {
      success: false,
      error: error.message || 'Failed to update product'
    };
  }
};

/**
 * deleteProduct: Elimina un producto
 * 
 * Verifica permisos y elimina tanto el producto como su imagen
 * 
 * @param {string} productId - ID del producto
 * @param {string} artisanId - ID del artesano (para verificación)
 * @returns {Object} - {success, message/error}
 */
export const deleteProduct = async (productId, artisanId) => {
  try {
    console.log('🗑️ Deleting product:', productId);

    // Obtener producto para verificación y para eliminar su imagen
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('artisan_id, image_url')
      .eq('id', productId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    // Verificar permisos
    if (product.artisan_id !== artisanId) {
      return {
        success: false,
        error: 'You do not have permission to delete this product'
      };
    }

    // Si tiene imagen, eliminarla del storage
    if (product.image_url) {
      // Extraer nombre del archivo de la URL
      const fileName = product.image_url.split('/').pop();
      const filePath = `products/${fileName}`;

      const { error: storageError } = await supabase.storage
        .from('products')
        .remove([filePath]);

      if (storageError) {
        console.warn('⚠️ Error deleting image:', storageError);
        // Continuar de todos modos para eliminar el producto
      }
    }

    // Eliminar producto de la base de datos
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (deleteError) {
      throw deleteError;
    }

    console.log('✅ Product deleted');

    return {
      success: true,
      message: 'Product deleted successfully'
    };

  } catch (error) {
    console.error('❌ Delete product error:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete product'
    };
  }
};

/**
 * uploadProductImage: Sube una imagen para un producto
 * 
 * Valida el archivo, lo sube a Supabase Storage y retorna la URL pública
 * 
 * @param {string} artisanId - ID del artesano
 * @param {File} imageFile - Archivo de imagen
 * @returns {Object} - {success, imageUrl, error}
 */
export const uploadProductImage = async (artisanId, imageFile) => {
  try {
    console.log('📸 Uploading product image:', imageFile.name);

    // Validación 1: Verificar que es un archivo válido
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

    // Validación 3: Tamaño máximo (5MB para productos)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (imageFile.size > maxSize) {
      return {
        success: false,
        error: 'File is too large. Maximum size is 5MB.'
      };
    }

    // Generar nombre único para el archivo
    // Formato: artisanId-timestamp-random.extension
    const fileExtension = imageFile.name.split('.').pop();
    const randomString = Math.random().toString(36).substring(7);
    const fileName = `${artisanId}-${Date.now()}-${randomString}.${fileExtension}`;
    const filePath = `products/${fileName}`;

    // Subir archivo a Supabase Storage
    // - from('products'): bucket de productos
    // - upload(): sube el archivo
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('products')
      .upload(filePath, imageFile, {
        cacheControl: '3600',  // Cache por 1 hora
        upsert: false  // No sobrescribir si existe
      });

    if (uploadError) {
      throw uploadError;
    }

    // Obtener URL pública del archivo subido
    const { data: urlData } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

    console.log('✅ Product image uploaded:', publicUrl);

    return {
      success: true,
      imageUrl: publicUrl,
      message: 'Image uploaded successfully!'
    };

  } catch (error) {
    console.error('❌ Upload product image error:', error);

    let errorMessage = 'Failed to upload image. Please try again.';

    // Mensajes de error específicos
    if (error.message?.includes('Bucket not found')) {
      errorMessage = 'Storage not configured. Please contact support.';
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
 * getProductCategories: Obtiene todas las categorías disponibles
 * 
 * Útil para mostrar en un selector de categorías
 * 
 * @returns {Array<string>} - Array de categorías únicas
 */
export const getProductCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('category');

    if (error) {
      throw error;
    }

    // Extraer categorías únicas
    const categories = [...new Set(data.map(item => item.category))];
    
    return categories.sort(); // Ordenar alfabéticamente

  } catch (error) {
    console.error('❌ Get categories error:', error);
    // Retornar categorías por defecto en caso de error
    return [
      'Pottery & Ceramics',
      'Jewelry & Accessories',
      'Textiles & Clothing',
      'Woodwork',
      'Glass',
      'Metalwork',
      'Art & Paintings',
      'Leather Goods'
    ];
  }
};