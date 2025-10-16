// Fix image URLs in database to use .png extensions
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lztpxwvaeqmuyajnybpl.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6dHB4d3ZhZXFtdXlham55YnBsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDUwMjE5MSwiZXhwIjoyMDc2MDc4MTkxfQ.Fe9XHBqhgXwQUqXzmGtCMHVQ8Dk6Q2y5rxqyx1uPqfo';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixImageUrls() {
  try {
    console.log('🔧 Fixing image URLs in database...');
    
    // First, get all products with .jpg extensions
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, title, image_url')
      .like('image_url', '%.jpg');
    
    if (fetchError) {
      console.log('❌ Error fetching products:', fetchError.message);
      return;
    }
    
    console.log(`📦 Found ${products.length} products with .jpg images`);
    
    if (products.length === 0) {
      console.log('✅ No products found with .jpg extensions');
      return;
    }
    
    // Update each product's image_url
    for (const product of products) {
      const newImageUrl = product.image_url.replace('.jpg', '.png');
      
      const { error: updateError } = await supabase
        .from('products')
        .update({ image_url: newImageUrl })
        .eq('id', product.id);
      
      if (updateError) {
        console.log('❌ Error updating', product.title, ':', updateError.message);
      } else {
        console.log('✅ Updated:', product.title);
        console.log('   Old:', product.image_url);
        console.log('   New:', newImageUrl);
      }
    }
    
    console.log('\n🎉 Image URL fixes complete!');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

fixImageUrls();