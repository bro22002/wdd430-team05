// components/ui/Card.tsx
// Componente base de tarjeta reutilizable

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;         // Si debe tener efecto hover
  clickable?: boolean;     // Si es clickeable
  onClick?: () => void;    // Función al hacer click
}

/**
 * Componente Card - Contenedor base para tarjetas
 * @param children - Contenido de la tarjeta
 * @param className - Clases CSS adicionales
 * @param hover - Si debe tener animación hover
 * @param clickable - Si la tarjeta es clickeable
 * @param onClick - Función a ejecutar al hacer click
 */
export function Card({
  children,
  className = '',
  hover = false,
  clickable = false,
  onClick
}: CardProps) {
  
  // Clases base de la tarjeta
  const baseClasses = [
    'bg-white rounded-lg border border-gray-200 shadow-sm',
    'transition-all duration-200'
  ];
  
  // Clases condicionales para hover
  const hoverClasses = hover || clickable ? [
    'hover:shadow-md hover:-translate-y-0.5',
    'hover:border-gray-300'
  ] : [];
  
  // Clases para tarjetas clickeables
  const clickableClasses = clickable ? [
    'cursor-pointer',
    'active:transform active:scale-[0.98]'
  ] : [];
  
  // Combinar todas las clases
  const cardClasses = [
    ...baseClasses,
    ...hoverClasses,
    ...clickableClasses,
    className
  ].join(' ');
  
  // Manejar el click
  const handleClick = () => {
    if (clickable && onClick) {
      onClick();
    }
  };
  
  return (
    <div 
      className={cardClasses}
      onClick={handleClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      } : undefined}
    >
      {children}
    </div>
  );
}

/**
 * Componente CardHeader - Encabezado de la tarjeta
 */
export function CardHeader({
  children,
  className = ''
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`p-4 pb-2 ${className}`}>
      {children}
    </div>
  );
}

/**
 * Componente CardContent - Contenido principal de la tarjeta
 */
export function CardContent({
  children,
  className = ''
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`px-4 py-2 ${className}`}>
      {children}
    </div>
  );
}

/**
 * Componente CardFooter - Pie de la tarjeta
 */
export function CardFooter({
  children,
  className = ''
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`p-4 pt-2 ${className}`}>
      {children}
    </div>
  );
}