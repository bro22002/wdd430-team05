// generateProducts.js
// Este script genera productos de muestra para la base de datos de Handcrafted Haven
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
// Estas variables deben coincidir con las de tu archivo .env
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Array de productos de muestra con diferentes categorías artesanales
const sampleProducts = [
  // Cerámica y Alfarería
  {
    title: "Handmade Ceramic Coffee Mug",
    description: "Beautiful glazed ceramic mug perfect for your morning coffee. Each piece is unique with slight variations in color and texture.",
    price: 24.99,
    category: "Pottery & Ceramics",
    image_url: "/images/ceramic-mug.png",
    rating: 4.7,
    stock: 15
  },
  {
    title: "Artisan Clay Dinner Plates Set",
    description: "Set of 4 handcrafted dinner plates with rustic charm. Made from natural clay and fired to perfection.",
    price: 89.99,
    category: "Pottery & Ceramics",
    image_url: "/images/clay-plates.png",
    rating: 4.8,
    stock: 8
  },
  
  // Joyería artesanal
  {
    title: "Sterling Silver Wire Wrapped Pendant",
    description: "Elegant pendant featuring a natural gemstone wrapped in sterling silver wire. Comes with adjustable cord.",
    price: 45.00,
    category: "Jewelry & Accessories",
    image_url: "/images/silver-pendant.png",
    rating: 4.9,
    stock: 12
  },
  {
    title: "Handcrafted Wooden Earrings",
    description: "Lightweight earrings carved from sustainable bamboo with intricate geometric patterns.",
    price: 18.50,
    category: "Jewelry & Accessories",
    image_url: "/images/wooden-earrings.png",
    rating: 4.6,
    stock: 25
  },
  
  // Arte y pinturas
  {
    title: "Abstract Acrylic Painting",
    description: "Original abstract artwork painted on canvas. Features vibrant colors and dynamic brushstrokes.",
    price: 150.00,
    category: "Art & Paintings",
    image_url: "/images/abstract-painting.png",
    rating: 4.8,
    stock: 3
  },
  {
    title: "Watercolor Landscape Print",
    description: "High-quality print of an original watercolor landscape. Printed on archival paper.",
    price: 35.00,
    category: "Art & Paintings",
    image_url: "/images/watercolor-print.png",
    rating: 4.5,
    stock: 20
  },
  
  // Textiles adicionales
  {
    title: "Knitted Alpaca Wool Sweater",
    description: "Cozy sweater hand-knitted from premium alpaca wool. Available in natural earth tones.",
    price: 125.00,
    category: "Textiles & Clothing",
    image_url: "/images/alpaca-sweater.png",
    rating: 4.9,
    stock: 6
  },
  {
    title: "Embroidered Cotton Cushion Cover",
    description: "Decorative cushion cover with traditional embroidery patterns. Made from organic cotton.",
    price: 28.00,
    category: "Textiles & Clothing",
    image_url: "/images/embroidered-cushion.png",
    rating: 4.4,
    stock: 18
  },
  
  // Trabajos en madera
  {
    title: "Reclaimed Wood Cutting Board",
    description: "Sustainable cutting board made from reclaimed hardwood. Each piece has unique grain patterns.",
    price: 42.00,
    category: "Woodwork",
    image_url: "/images/cutting-board.png",
    rating: 4.7,
    stock: 10
  },
  {
    title: "Hand-carved Wooden Bowl",
    description: "Beautiful bowl carved from a single piece of olive wood. Perfect for serving salads or fruit.",
    price: 55.00,
    category: "Woodwork",
    image_url: "/images/wooden-bowl.png",
    rating: 4.8,
    stock: 7
  },
  
  // Más productos de vidrio
  {
    title: "Stained Glass Window Panel",
    description: "Colorful stained glass panel perfect for hanging in windows. Features geometric patterns.",
    price: 95.00,
    category: "Glass",
    image_url: "/images/stained-glass.png",
    rating: 4.6,
    stock: 5
  },
  {
    title: "Hand-blown Glass Ornaments Set",
    description: "Set of 6 delicate glass ornaments, each with unique swirl patterns and colors.",
    price: 32.00,
    category: "Glass",
    image_url: "/images/glass-ornaments.png",
    rating: 4.5,
    stock: 15
  },
  
  // Productos de cuero
  {
    title: "Handstitched Leather Wallet",
    description: "Premium leather wallet with hand-stitched edges. Features multiple card slots and bill compartment.",
    price: 68.00,
    category: "Leather Goods",
    image_url: "/images/leather-wallet.png",
    rating: 4.9,
    stock: 12
  },
  {
    title: "Artisan Leather Journal",
    description: "Beautiful leather-bound journal with handmade paper. Perfect for writing or sketching.",
    price: 45.00,
    category: "Leather Goods",
    image_url: "/images/leather-journal.png",
    rating: 4.7,
    stock: 9
  },
  
  // Productos de metal
  {
    title: "Forged Iron Candle Holders",
    description: "Set of 3 candle holders hand-forged from iron. Rustic design perfect for any home decor.",
    price: 38.00,
    category: "Metalwork",
    image_url: "/images/iron-candles.png",
    rating: 4.4,
    stock: 8
  },
  {
    title: "Copper Wire Sculpture",
    description: "Artistic sculpture crafted from copper wire. Modern design that catches light beautifully.",
    price: 75.00,
    category: "Metalwork",
    image_url: "/images/copper-sculpture.png",
    rating: 4.6,
    stock: 4
  }
];

// Función principal para insertar productos en la base de datos
async function generateProducts() {
  try {
    console.log('🚀 Iniciando inserción de productos...');
    
    // Función insertData: Inserta los productos en la tabla 'products' de Supabase
    // Parámetros: 
    // - tabla: nombre de la tabla donde insertar ('products')
    // - datos: array de objetos con los productos a insertar
    const { error } = await supabase
      .from('products')
      .insert(sampleProducts);

    // Verificamos si hubo algún error durante la inserción
    if (error) {
      console.error('❌ Error al insertar productos:', error);
      return;
    }

    console.log('✅ Productos insertados exitosamente!');
    console.log(`📦 Total de productos añadidos: ${sampleProducts.length}`);
    
    // Mostramos las categorías que se han añadido
    const categories = [...new Set(sampleProducts.map(product => product.category))];
    console.log('🏷️ Categorías añadidas:', categories.join(', '));
    
  } catch (error) {
    console.error('💥 Error general:', error);
  }
}

// Función para verificar la conexión a Supabase
async function testConnection() {
  try {
    const { error } = await supabase
      .from('products')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Error de conexión:', error);
      return false;
    }
    
    console.log('✅ Conexión a Supabase exitosa');
    return true;
  } catch (error) {
    console.error('💥 Error de conexión:', error);
    return false;
  }
}

// Ejecutar el script
async function main() {
  console.log('🎨 Generador de productos para Handcrafted Haven');
  console.log('================================================');
  
  // Verificar conexión antes de proceder
  const isConnected = await testConnection();
  if (!isConnected) {
    console.log('💔 No se pudo conectar a Supabase. Verifica tu configuración.');
    return;
  }
  
  // Generar productos
  await generateProducts();
  
  console.log('🎉 Proceso completado!');
}

// Ejecutar solo si este archivo se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateProducts, sampleProducts };
