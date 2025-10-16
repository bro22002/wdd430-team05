// Setup database with products table and sample data
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lztpxwvaeqmuyajnybpl.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6dHB4d3ZhZXFtdXlham55YnBsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDUwMjE5MSwiZXhwIjoyMDc2MDc4MTkxfQ.Fe9XHBqhgXwQUqXzmGtCMHVQ8Dk6Q2y5rxqyx1uPqfo';

// Use service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const sampleProducts = [
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
    title: "Reclaimed Wood Cutting Board",
    description: "Sustainable cutting board made from reclaimed hardwood. Each piece has unique grain patterns.",
    price: 42.00,
    category: "Woodwork",
    image_url: "/images/cutting-board.png",
    rating: 4.7,
    stock: 10
  }
];

async function setupDatabase() {
  try {
    console.log('🚀 Setting up database...');
    
    // Step 1: Create products table using raw SQL
    console.log('\n1️⃣ Creating products table...');
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS products (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            price DECIMAL(10,2) NOT NULL,
            image_url TEXT,
            category TEXT NOT NULL,
            rating DECIMAL(3,2) DEFAULT 0,
            stock INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
        );
        
        ALTER TABLE products ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Public can view products" ON products;
        CREATE POLICY "Public can view products" ON products FOR SELECT USING (true);
      `
    });

    if (createError) {
      console.log('⚠️ Table might already exist, trying alternative method...');
      
      // Alternative: Try to insert data directly (table might already exist)
      const { data: testData, error: testError } = await supabase
        .from('products')
        .select('count')
        .limit(1);
        
      if (testError && testError.message.includes('does not exist')) {
        console.log('❌ Products table does not exist and could not be created.');
        console.log('💡 Please create the table manually in Supabase Dashboard:');
        console.log('   Go to your Supabase project → Table Editor → New Table');
        console.log('   Use the SQL from create-products-table.sql file');
        return;
      }
    }

    console.log('✅ Products table ready');

    // Step 2: Insert sample products
    console.log('\n2️⃣ Inserting sample products...');
    const { data, error } = await supabase
      .from('products')
      .insert(sampleProducts)
      .select();

    if (error) {
      console.log('❌ Error inserting products:', error.message);
      return;
    }

    console.log('✅ Successfully inserted', data?.length || sampleProducts.length, 'products');
    
    // Step 3: Verify data
    console.log('\n3️⃣ Verifying data...');
    const { data: products, error: verifyError } = await supabase
      .from('products')
      .select('id, title, category')
      .limit(10);

    if (verifyError) {
      console.log('❌ Error verifying data:', verifyError.message);
      return;
    }

    console.log('✅ Database setup complete!');
    console.log('📦 Products in database:');
    products.forEach(p => console.log(`  - ${p.title} (${p.category})`));
    
    console.log('\n🎉 You can now restart your app and it should load products successfully!');
    
  } catch (error) {
    console.log('❌ Setup failed:', error.message);
    console.log('\n💡 Manual setup required:');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Open SQL Editor');
    console.log('3. Run the SQL from create-products-table.sql');
    console.log('4. Then run: node src/data/seed.js');
  }
}

setupDatabase();