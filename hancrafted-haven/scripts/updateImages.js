// scripts/renameToMatchDB.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imagesDir = path.join(__dirname, '../public/images');

// ✅ Mapeo basado en tu tabla de Supabase
const renameMap = {
  // Nombre actual en public/images → Nombre que necesitas (según BD)
  "Abstract Acrylic Painting.png": "abstract-painting.png",
  "Knitted Alpaca Wool Sweater.png": "alpaca-sweater.png",
  "Handmade Ceramic Coffee Mug.png": "ceramic-mug.png",
  "Artisan Clay Dinner Plates Set.png": "clay-plates.png",
  "Copper Wire Sculpture.png": "copper-sculpture.png",
  "Reclaimed Wood Cutting Board.png": "cutting-board.png",
  "Embroidered Cotton Cushion Cover.png": "embroidered-cushion.png",
  "Hand-blown Glass Ornaments Set.png": "glass-ornaments.png",
  "Blown Glass Vase.png": "glass-vase.png",
  "Forged Iron Candle Holders.png": "iron-candles.png",
  "Artisan Leather Journal.png": "leather-journal.png",
  "Handstitched Leather Wallet.png": "leather-wallet.png",
  "Sterling Silver Wire Wrapped Pendant.png": "silver-pendant.png",
  "Stained Glass Window Panel.png": "stained-glass.png",
  "Watercolor Landscape Print.png": "watercolor-print.png",
  "Hand-carved Wooden Bowl.png": "wooden-bowl.png",
  "Handcrafted Wooden Earrings.png": "wooden-earrings.png",
  "Hand-woven Wool Scarf.png": "wool-scarf.png"
};

console.log('🔄 Renombrando archivos para coincidir con Supabase...\n');
console.log('═══════════════════════════════════════════════════\n');

let renamed = 0;
let notFound = 0;
let errors = 0;

Object.entries(renameMap).forEach(([oldName, newName]) => {
  const oldPath = path.join(imagesDir, oldName);
  const newPath = path.join(imagesDir, newName);

  try {
    if (fs.existsSync(oldPath)) {
      // Verificar si ya existe un archivo con el nuevo nombre
      if (fs.existsSync(newPath)) {
        console.log(`⚠️  Ya existe: ${newName} (saltando)\n`);
        return;
      }

      fs.renameSync(oldPath, newPath);
      console.log(`✅ ${oldName}`);
      console.log(`   → ${newName}\n`);
      renamed++;
    } else {
      console.log(`⚠️  No encontrado: ${oldName}\n`);
      notFound++;
    }
  } catch (error) {
    console.error(`❌ Error renombrando ${oldName}:`, error.message);
    errors++;
  }
});

console.log('═══════════════════════════════════════════════════');
console.log('📊 RESUMEN:');
console.log(`   Total archivos a renombrar: ${Object.keys(renameMap).length}`);
console.log(`   ✅ Renombrados: ${renamed}`);
console.log(`   ⚠️  No encontrados: ${notFound}`);
console.log(`   ❌ Errores: ${errors}`);
console.log('═══════════════════════════════════════════════════\n');

if (renamed > 0) {
  console.log('🎉 ¡Archivos renombrados exitosamente!');
  console.log('💡 Ahora ejecuta: npm run dev\n');
}

if (notFound > 0) {
  console.log('⚠️  ATENCIÓN: Algunos archivos no se encontraron.');
  console.log('   Verifica que todos los PNG estén en public/images/\n');
}