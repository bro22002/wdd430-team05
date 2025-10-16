import { supabase } from './supabase';
import { Product } from '@/types/product';
import { mockProducts } from '../data/mockProducts';

export async function getAllProducts(): Promise<Product[]> {
  // If no Supabase client, use mock data
  if (!supabase) {
    console.log('Using mock data for products');
    return mockProducts;
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*');
    
    if (error) {
      console.error('Error fetching products, falling back to mock data:', error);
      return mockProducts;
    }
    
    return data || mockProducts;
  } catch (error) {
    console.error('Database connection failed, using mock data:', error);
    return mockProducts;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
  
  return data;
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category);
  
  if (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }
  
  return data || [];
}