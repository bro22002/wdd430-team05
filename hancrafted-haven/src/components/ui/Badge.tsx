// components/ui/Badge.tsx
// Componente para mostrar etiquetas/badges como categorías, descuentos, etc.

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'discount';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

/**
 * Componente Badge - Muestra etiquetas con diferentes estilos
 * @param children - Contenido del badge
 * @param variant - Variante de color/estilo
 * @param size - Tamaño del badge
 * @param className - Clases CSS adicionales
 */
export default function Badge({
  children,
  variant = 'default',
  size = 'medium',
  className = ''
}: BadgeProps) {
  
  /**
   * Obtiene las clases de estilo basadas en la variante
   * @param variant - Tipo de badge
   * @returns String con las clases CSS
   */
  const getVariantClasses = (variant: BadgeProps['variant']) => {
    const variants = {
      default: 'bg-gray-100 text-gray-800 border-gray-200',
      success: 'bg-green-100 text-green-800 border-green-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      error: 'bg-red-100 text-red-800 border-red-200',
      info: 'bg-blue-100 text-blue-800 border-blue-200',
      discount: 'bg-red-500 text-white border-red-600'
    };
    
    return variants[variant || 'default'];
  };
  
  /**
   * Obtiene las clases de tamaño
   * @param size - Tamaño del badge
   * @returns String con las clases CSS de tamaño
   */
  const getSizeClasses = (size: BadgeProps['size']) => {
    const sizes = {
      small: 'px-2 py-0.5 text-xs',
      medium: 'px-3 py-1 text-sm',
      large: 'px-4 py-1.5 text-base'
    };
    
    return sizes[size || 'medium'];
  };
  
  // Combinar todas las clases
  const badgeClasses = [
    'inline-flex items-center rounded-full border font-medium',
    'transition-colors duration-200',
    getVariantClasses(variant),
    getSizeClasses(size),
    className
  ].join(' ');
  
  return (
    <span className={badgeClasses}>
      {children}
    </span>
  );
}

/**
 * Componente especializado para mostrar descuentos
 */
export function DiscountBadge({ 
  percentage, 
  className = '' 
}: { 
  percentage: number; 
  className?: string; 
}) {
  return (
    <Badge 
      variant="discount" 
      size="small" 
      className={`font-bold ${className}`}
    >
      -{percentage}%
    </Badge>
  );
}

/**
 * Componente especializado para mostrar categorías
 */
export function CategoryBadge({ 
  category, 
  className = '' 
}: { 
  category: string; 
  className?: string; 
}) {
  return (
    <Badge 
      variant="info" 
      size="small" 
      className={className}
    >
      {category}
    </Badge>
  );
}