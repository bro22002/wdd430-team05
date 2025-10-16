import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export const useProducts = () => {
  // Estados para manejar los productos y la interfaz
  const [products, setProducts] = useState([]); // Array de productos
  const [allProducts, setAllProducts] = useState([]); // Todos los productos sin filtrar
  const [loading, setLoading] = useState(true); // Estado de carga
  const [error, setError] = useState(null); // Errores
  const [categories, setCategories] = useState([]); // Categorías disponibles
  
  // Estados para filtros
  const [filters, setFilters] = useState({
    category: 'All Categories',
    priceRange: 'all',
    searchTerm: ''
  });

  // fetchProducts: Obtiene todos los productos de la base de datos
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Consulta a Supabase usando los campos reales de tu BD
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          title,
          description,
          price,
          category,
          rating,
          stock,
          image_url,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        setError('Error loading products from database');
        return;
      }

      // Si la consulta es exitosa, actualizamos los estados
      setAllProducts(data || []);
      
      // Extraemos categorías únicas de los productos
      const uniqueCategories = [...new Set((data || []).map(product => product.category))];
      setCategories(uniqueCategories);

    } catch (error) {
      setError('Error connecting to database');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // applyFilters: Aplica los filtros seleccionados a los productos
  const applyFilters = useCallback(() => {
    let filtered = [...allProducts];

    // Filtro por categoría
    if (filters.category !== 'All Categories') {
      filtered = filtered.filter(product => 
        product.category === filters.category
      );
    }

    // Filtro por rango de precio
    if (filters.priceRange !== 'all') {
      switch (filters.priceRange) {
        case 'under-25':
          filtered = filtered.filter(product => product.price < 25);
          break;
        case '25-50':
          filtered = filtered.filter(product => product.price >= 25 && product.price <= 50);
          break;
        case '50-100':
          filtered = filtered.filter(product => product.price > 50 && product.price <= 100);
          break;
        case 'over-100':
          filtered = filtered.filter(product => product.price > 100);
          break;
        default:
          break;
      }
    }

    // Filtro por término de búsqueda (usando campos reales)
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.category.toLowerCase().includes(searchLower)
      );
    }

    setProducts(filtered);
  }, [allProducts, filters]);

  // updateFilter: Actualiza un filtro específico
  const updateFilter = useCallback((filterType, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterType]: value
    }));
  }, []);

  // clearFilters: Limpia todos los filtros
  const clearFilters = useCallback(() => {
    setFilters({
      category: 'All Categories',
      priceRange: 'all',
      searchTerm: ''
    });
  }, []);

  // Efectos para cargar datos y aplicar filtros
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Estadísticas útiles
  const stats = {
    totalProducts: allProducts.length,
    filteredCount: products.length,
    categoriesCount: categories.length,
    averagePrice: allProducts.length > 0 
      ? Math.round(allProducts.reduce((sum, product) => sum + product.price, 0) / allProducts.length)
      : 0
  };

  // Retornamos todo lo que necesitan los componentes
  return {
    // Datos
    products,
    allProducts,
    categories,
    
    // Estados
    loading,
    error,
    filters,
    stats,
    
    // Funciones
    updateFilter,
    clearFilters,
    refetch: fetchProducts
  };
};