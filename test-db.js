// Simple test to check database connection and products table
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lztpxwvaeqmuyajnybpl.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6dHB4d3ZhZXFtdXlham55YnBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MDIxOTEsImV4cCI6MjA3NjA3ODE5MX0.jPyX7v2pftAgnAk42HAr70S9OeycfY13Vhhr2DuovIQ';

console.log('🔍 Testing database connection...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test 1: Basic connection
    console.log('\n1️⃣ Testing basic connection...');
    const { data, error } = await supabase.from('products').select('count').limit(1);
    
    if (error) {
      console.log('❌ Database connection error:', error.message);
      return;
    }
    
    console.log('✅ Database connection successful');
    
    // Test 2: Check if products table has data
    console.log('\n2️⃣ Checking products table...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, title, category')
      .limit(5);
    
    if (productsError) {
      console.log('❌ Error querying products:', productsError.message);
      console.log('💡 The products table might not exist or have no data');
      return;
    }
    
    console.log('✅ Products table exists');
    console.log('📦 Found', products.length, 'products');
    
    if (products.length === 0) {
      console.log('⚠️ Products table is empty!');
      console.log('💡 Run: node src/data/seed.js to populate with sample data');
    } else {
      console.log('📋 Sample products:');
      products.forEach(p => console.log(`  - ${p.title} (${p.category})`));
    }
    
  } catch (err) {
    console.log('❌ Fatal error:', err.message);
  }
}

testConnection();