// components/product/ProductCard.tsx
// Componente principal para mostrar productos artesanales

'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '../ui/Card';
import Rating from '../ui/Rating';
import { DiscountBadge, CategoryBadge } from '../ui/Badge';
import { Product } from '../../types/product';
import { formatPrice, calculateDiscountPercentage } from '../../utils/formatPrice';

interface ProductCardProps {
  product: Product;
  onFavoriteToggle?: (productId: string, isFavorite: boolean) => void;
  onProductClick?: (product: Product) => void;
  className?: string;
}

/**
 * Componente ProductCard - Muestra información de un producto artesanal
 * @param product - Datos del producto
 * @param onFavoriteToggle - Función para manejar favoritos
 * @param onProductClick - Función al hacer click en el producto
 * @param className - Clases CSS adicionales
 */
export default function ProductCard({
  product,
  onFavoriteToggle,
  onProductClick,
  className = ''
}: ProductCardProps) {
  
  // Estado local para manejar favoritos
  const [isFavorite, setIsFavorite] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  
  // Calcular descuento si existe precio original
  const discountPercentage = product.price.original 
    ? calculateDiscountPercentage(product.price.original, product.price.current)
    : 0;
  
  /**
   * Maneja el toggle de favoritos
   */
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que se active el click del producto
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);
    
    // Ejecutar callback si existe
    onFavoriteToggle?.(product.id, newFavoriteState);
  };
  
  /**
   * Maneja el click en el producto
   */
  const handleProductClick = () => {
    onProductClick?.(product);
  };
  
  return (
    <Card
      className={`max-w-sm mx-auto overflow-hidden ${className}`}
      hover={true}
      clickable={!!onProductClick}
      onClick={handleProductClick}
    >
      {/* Contenedor de imagen */}
      <div className="relative">
        {/* Imagen principal del producto */}
        <div className="relative h-64 w-full bg-gray-100">
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            priority
            className={`object-cover transition-opacity duration-300 ${
              isImageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={() => setIsImageLoading(false)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            quality={85}
          />
          
          {/* Skeleton loader mientras carga la imagen */}
          {isImageLoading && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
        </div>
        
        {/* Badge de descuento (esquina superior izquierda) */}
        {discountPercentage > 0 && (
          <div className="absolute top-3 left-3">
            <DiscountBadge percentage={discountPercentage} />
          </div>
        )}
        
        {/* Badge de destacado */}
        {product.featured && (
          <div className="absolute top-3 right-12">
            <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-medium">
              Featured
            </span>
          </div>
        )}
        
        {/* Botón de favoritos (esquina superior derecha) */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm 
                     hover:bg-white transition-all duration-200 group"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <svg
            className={`w-4 h-4 transition-colors duration-200 ${
              isFavorite 
                ? 'text-red-500 fill-current' 
                : 'text-gray-600 group-hover:text-red-500'
            }`}
            fill={isFavorite ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </div>
      
      {/* Contenido del producto */}
      <CardContent className="p-4">
        {/* Información del artista */}
        <div className="flex items-center gap-2 mb-3">
          <div className="relative w-6 h-6">
            <Image
              src={product.artist.avatar || '/placeholder-avatar.png'}
              alt={product.artist.name}
              fill
              className="rounded-full object-cover"
              sizes="24px"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {product.artist.name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {product.artist.location}
            </p>
          </div>
        </div>
        
        {/* Título del producto */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {product.title}
        </h3>
        
        {/* Rating */}
        <div className="mb-3">
          <Rating
            rating={product.rating.average}
            reviewCount={product.rating.count}
            size="small"
          />
        </div>
        
        {/* Precios */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(product.price.current, { currency: product.price.currency })}
          </span>
          
          {/* Precio original si hay descuento */}
          {product.price.original && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(product.price.original, { currency: product.price.currency })}
            </span>
          )}
        </div>
        
        {/* Categoría */}
        <CategoryBadge 
          category={product.category}
          className="mb-2"
        />
        
        {/* Estado de stock */}
        <div className="flex items-center justify-between mt-3">
          <span className={`text-sm font-medium ${
            product.inStock 
              ? 'text-green-600' 
              : 'text-red-600'
          }`}>
            {product.inStock ? 'In Stock' : 'Out of Stock'}
          </span>
          
          {/* Botón de acción rápida */}
          <button 
            className="px-3 py-1 text-sm font-medium text-blue-600 
                       hover:text-blue-700 hover:bg-blue-50 
                       rounded-md transition-colors duration-200"
            onClick={(e) => {
              e.stopPropagation();
              // Aquí iría la lógica para agregar al carrito o ver detalles
              console.log('Quick action for product:', product.id);
            }}
          >
            Quick View
          </button>
        </div>
      </CardContent>
    </Card>
  );
}