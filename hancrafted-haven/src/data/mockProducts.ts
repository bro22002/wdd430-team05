// data/mockProducts.ts
// Datos de prueba que simulan productos de la base de datos
// Estos datos replicarán los productos mostrados en la imagen

import { Product } from '../types/product';

export const mockProducts: Product[] = [
  {
    id: '1',
    title: 'Handcrafted Ceramic Bowl Set',
    description: 'Beautiful handmade ceramic bowls perfect for everyday dining',
    image_url: '/images/Hand-woven Wool Scarf.png',
    category: 'Pottery & Ceramics',
    price: 89,
    rating: 4.8,
    stock: 12,
    created_at: '2024-01-15T00:00:00.000Z'
  },
  {
    id: '2',
    title: 'Artisan Silver Necklace',
    description: 'Unique handcrafted silver necklace with traditional patterns',
    image_url: '/images/Blown Glass Vase.png',
    category: 'Jewelry & Accessories',
    price: 165,
    rating: 4.9,
    stock: 8,
    created_at: '2024-02-01T00:00:00.000Z'
  },
  {
    id: '3',
    title: 'Blown Glass Vase',
    description: 'Elegant hand-blown glass vase with unique color patterns',
    image_url: '/images/Blown Glass Vase.png',
    category: 'Art & Paintings',
    price: 98,
    rating: 4.9,
    stock: 5,
    created_at: '2024-01-28T00:00:00.000Z'
  },
  {
    id: '4',
    title: 'Hand-woven Wool Scarf',
    description: 'Soft merino wool scarf with traditional weaving patterns',
    image_url: '/images/Hand-woven Wool Scarf.png',
    category: 'Textiles & Clothing',
    price: 78,
    rating: 4.7,
    stock: 15,
    created_at: '2024-02-10T00:00:00.000Z'
  }
];

/**
 * Simula una llamada a la API para obtener productos
 * @param filters - Filtros opcionales para los productos
 * @returns Promise con array de productos filtrados
 */
export async function getProducts(filters?: {
  category?: string;
}): Promise<Product[]> {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let filteredProducts = [...mockProducts];
  
  // Aplicar filtros si se proporcionan
  if (filters?.category) {
    filteredProducts = filteredProducts.filter(
      product => product.category === filters.category
    );
  }
  
  return filteredProducts;
}
