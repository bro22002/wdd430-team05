// src/app/page.tsx
// Página principal que muestra los productos artesanales

import ProductGrid from '../components/product/ProductGrid';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">
                Handcrafted Haven
              </h1>
            </div>
            
            <nav className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-gray-900 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button className="text-gray-600 hover:text-gray-900 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              <button className="text-gray-600 hover:text-gray-900 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Discover Handcrafted Items
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore unique, handmade products from talented artisans around the world. 
            Each piece tells a story of craftsmanship and creativity.
          </p>
        </section>

        {/* Filter Section */}
        <section className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-xl font-semibold text-gray-900">
              Featured Products
            </h3>
            
            <div className="flex items-center gap-4">
              <select className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">All Categories</option>
                <option value="pottery">Pottery & Ceramics</option>
                <option value="jewelry">Jewelry & Accessories</option>
                <option value="art">Art & Paintings</option>
                <option value="textiles">Textiles & Clothing</option>
              </select>
              
              <select className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Sort by</option>
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section>
          <ProductGrid 
            filters={{ featured: false }} // Mostrar todos los productos por ahora
            className="mb-12"
          />
        </section>

        {/* Load More Section */}
        <section className="text-center">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium">
            Load More Products
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Handcrafted Haven</h4>
              <p className="text-gray-600 text-sm">
                Supporting artisans and bringing unique handmade products to your home.
              </p>
            </div>
            
            <div>
              <h5 className="font-medium text-gray-900 mb-3">Shop</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900 transition-colors">All Products</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Featured</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">New Arrivals</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Sale</a></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-medium text-gray-900 mb-3">Support</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Shipping</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Returns</a></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-medium text-gray-900 mb-3">Connect</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900 transition-colors">Newsletter</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Instagram</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Facebook</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Twitter</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-sm text-gray-600">
            <p>&copy; 2024 Handcrafted Haven. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}