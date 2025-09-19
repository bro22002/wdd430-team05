// utils/formatPrice.ts
// Esta función formatea los precios según la moneda y región

interface FormatPriceOptions {
  currency?: string;
  locale?: string;
  showDecimals?: boolean;
}

/**
 * Formatea un precio numérico a una cadena con formato de moneda
 * @param price - El precio numérico a formatear
 * @param options - Opciones de formateo
 * @returns Precio formateado como string (ej: "$89.00", "€75.50")
 */
export function formatPrice(
  price: number, 
  options: FormatPriceOptions = {}
): string {
  const {
    currency = 'USD',
    locale = 'en-US',
    showDecimals = true
  } = options;

  // Usar la API nativa de JavaScript para formatear monedas
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(price);
}

/**
 * Calcula el porcentaje de descuento entre precio original y actual
 * @param originalPrice - Precio original
 * @param currentPrice - Precio con descuento
 * @returns Porcentaje de descuento redondeado
 */
export function calculateDiscountPercentage(
  originalPrice: number,
  currentPrice: number
): number {
  if (originalPrice <= currentPrice) return 0;
  
  const discount = ((originalPrice - currentPrice) / originalPrice) * 100;
  return Math.round(discount);
}