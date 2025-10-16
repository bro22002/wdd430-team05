// src/components/ui/Footer.jsx
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-amber-50 text-amber-900 py-8 px-4 border-t border-amber-200">
      <div className="max-w-6xl mx-auto">
        {/* Sección superior */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {/* Logo y descripción */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Handcrafted Haven</h2>
            <p className="text-amber-700">
              Connecting Artisans with Buyers
            </p>
          </div>

          {/* Enlaces rápidos */}
          <div className="space-y-2">
            <h3 className="font-semibold">About</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/who-we-are" className="hover:text-amber-600 transition-colors">
                  Who We Are
                </Link>
              </li>
            </ul>
          </div>

          {/* Soporte y legal */}
          <div className="space-y-2">
            <h3 className="font-semibold">Support</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/privacy" className="hover:text-amber-600 transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-amber-600 transition-colors">
                  Terms And Conditions
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-amber-600 transition-colors">
                  Support Team
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Línea separadora */}
        <hr className="border-amber-200 mb-6" />

        {/* Sección inferior */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-amber-600">
            © 2025 Handcrafted Haven. All rights reserved.
          </p>
          
          {/* Iconos de redes sociales */}
          <div className="flex space-x-4 text-xl">
            <button className="hover:text-amber-600 transition-colors">
              💬 {/* WhatsApp/Chat */}
            </button>
            <button className="hover:text-amber-600 transition-colors">
              💮 {/* Instagram/Floral */}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;