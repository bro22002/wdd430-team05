// data/mockProducts.ts
// Datos de prueba que simulan productos de la base de datos
// Estos datos replicarán los productos mostrados en la imagen

import { Product } from '../types/product';

export const mockProducts: Product[] = [
  {
    id: '1',
    title: 'Handcrafted Ceramic Bowl Set',
    description: 'Beautiful handmade ceramic bowls perfect for everyday dining',
    images: [
      '/images/Hand-woven Wool Scarf.png'

    ],
    artist: {
      id: 'artist-1',
      name: 'Maya Pottery Studio',
      location: 'Santa Fe, NM',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face'
    },
    category: 'Pottery & Ceramics',
    price: {
      current: 89,
      original: 120,
      currency: 'USD'
    },
    rating: {
      average: 4.8,
      count: 47
    },
    featured: true,
    inStock: true,
    tags: ['handmade', 'ceramic', 'dining', 'kitchen'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: '2',
    title: 'Artisan Silver Necklace',
    description: 'Unique handcrafted silver necklace with traditional patterns',
    images: [
      '/images/Blown Glass Vase.png'

    ],
    artist: {
      id: 'artist-2',
      name: 'Copper & Stone Co.',
      location: 'Asheville, NC',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face'
    },
    category: 'Jewelry & Accessories',
    price: {
      current: 165,
      currency: 'USD'
    },
    rating: {
      average: 4.9,
      count: 32
    },
    featured: true,
    inStock: true,
    tags: ['jewelry', 'silver', 'handcrafted', 'traditional'],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
  },
  {
    id: '3',
    title: 'Blown Glass Vase',
    description: 'Elegant hand-blown glass vase with unique color patterns',
    images: [
      '/images/Blown Glass Vase.png'
    ],
    artist: {
      id: 'artist-3',
      name: 'Glassworks Studio',
      location: 'Seattle, WA',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face'
    },
    category: 'Art & Paintings',
    price: {
      current: 98,
      original: 130,
      currency: 'USD'
    },
    rating: {
      average: 4.9,
      count: 12
    },
    featured: false,
    inStock: true,
    tags: ['glass', 'art', 'home decor', 'handblown'],
    createdAt: new Date('2024-01-28'),
    updatedAt: new Date('2024-01-28')
  },
  {
    id: '4',
    title: 'Hand-woven Wool Scarf',
    description: 'Soft merino wool scarf with traditional weaving patterns',
    images: [
      '/images/Hand-woven Wool Scarf.png'
    ],
    artist: {
      id: 'artist-4',
      name: 'Willow & Thread',
      location: 'Portland, OR',
      avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=50&h=50&fit=crop&crop=face'
    },
    category: 'Textiles & Clothing',
    price: {
      current: 78,
      original: 95,
      currency: 'USD'
    },
    rating: {
      average: 4.7,
      count: 23
    },
    featured: false,
    inStock: true,
    tags: ['wool', 'scarf', 'textiles', 'winter'],
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-12')
  }
];

/**
 * Simula una llamada a la API para obtener productos
 * @param filters - Filtros opcionales para los productos
 * @returns Promise con array de productos filtrados
 */
export async function getProducts(filters?: {
  category?: string;
  featured?: boolean;
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
  
  if (filters?.featured !== undefined) {
    filteredProducts = filteredProducts.filter(
      product => product.featured === filters.featured
    );
  }
  
  return filteredProducts;
}