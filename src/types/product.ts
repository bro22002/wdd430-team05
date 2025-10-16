// types/product.ts
// Este archivo define la estructura de datos que tendrán nuestros productos

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  rating: number;
  stock: number;
  created_at: string;
}
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