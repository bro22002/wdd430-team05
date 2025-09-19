// types/product.ts
// Este archivo define la estructura de datos que tendrán nuestros productos

export interface Artist {
  id: string;
  name: string;
  location: string;
  avatar?: string;
}

export interface Product {
  id: string;
  title: string;
  description?: string;
  images: string[];
  artist: Artist;
  category: string;
  price: {
    current: number;
    original?: number; // Precio original si hay descuento
    currency: string;
  };
  rating: {
    average: number; // Promedio de calificaciones (0-5)
    count: number;   // Número total de reseñas
  };
  featured: boolean;   // Si es producto destacado
  inStock: boolean;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Tipo para el estado de favoritos
export interface FavoriteState {
  productId: string;
  isFavorite: boolean;
}

// Tipo para filtros de productos
export interface ProductFilters {
  category?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  featured?: boolean;
  inStock?: boolean;
}