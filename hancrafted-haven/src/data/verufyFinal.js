// scripts/verifyFinal.js
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const imagesDir = path.join(__dirname, '../public/images');

async function verifyFinal() {
  console.log('🔍 VERIFICACIÓN FINAL: BD vs Archivos\n');
  console.log('═══════════════════════════════════════════════════\n');

  // 1. Obtener todos los productos con sus image_url
  const { data: products, error } = await supabase
    .from('products')
    .select('title, image_url')
    .order('title');

  if (error) {
    console.error('❌ Error obteniendo productos:', error);
    return;
  }

  console.log(`📦 Productos en Supabase: ${products.length}\n`);

  // 2. Verificar cada producto
  let foundCount = 0;
  let missingCount = 0;
  const missingFiles = [];

  products.forEach(product => {
    if (!product.image_url) {
      console.log(`⚠️  ${product.title}`);
      console.log(`   → Sin image_url en BD\n`);
      missingCount++;
      return;
    }

    // Extraer nombre del archivo
    const fileName = product.image_url.replace('/images/', '');
    const filePath = path.join(imagesDir, fileName);
    const exists = fs.existsSync(filePath);

    if (exists) {
      console.log(`✅ ${product.title}`);
      console.log(`   → ${product.image_url} (archivo existe)`);
      foundCount++;
    } else {
      console.log(`❌ ${product.title}`);
      console.log(`   → ${product.image_url} (archivo NO EXISTE)`);
      missingFiles.push(fileName);
      missingCount++;
    }
    console.log('');
  });

  // 3. Listar archivos físicos
  console.log('═══════════════════════════════════════════════════');
  console.log('📁 Archivos en public/images:\n');
  
  const physicalFiles = fs.readdirSync(imagesDir).filter(f => f.endsWith('.png'));
  physicalFiles.forEach(file => {
    const isUsed = products.some(p => p.image_url === `/images/${file}`);
    console.log(`${isUsed ? '✅' : '⚠️ '} ${file} ${isUsed ? '' : '(no usado en BD)'}`);
  });

  // 4. Resumen
  console.log('\n═══════════════════════════════════════════════════');
  console.log('📊 RESUMEN FINAL:\n');
  console.log(`Productos en BD: ${products.length}`);
  console.log(`  ✅ Con imagen encontrada: ${foundCount}`);
  console.log(`  ❌ Con imagen faltante: ${missingCount}`);
  console.log('');
  console.log(`Archivos físicos en public/images: ${physicalFiles.length}`);
  console.log('═══════════════════════════════════════════════════\n');

  // 5. Archivos faltantes
  if (missingFiles.length > 0) {
    console.log('⚠️  ARCHIVOS FALTANTES:\n');
    missingFiles.forEach(file => {
      console.log(`   - ${file}`);
    });
    console.log('\n💡 Ejecuta: node scripts/renameToMatchDB.js\n');
  } else {
    console.log('🎉 ¡TODO PERFECTO! Todas las imágenes coinciden.\n');
    console.log('💡 Si aún no se ven las imágenes, reinicia el servidor:\n');
    console.log('   npm run dev\n');
  }
}

verifyFinal();