import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// handleSupabaseError: Maneja errores de Supabase de forma consistente
export const handleSupabaseError = (error) => {
  console.error('Supabase Error:', error);
  return {
    success: false,
    error: error.message || 'Database error occurred',
    data: null
  };
};

// handleSupabaseSuccess: Maneja respuestas exitosas de Supabase
export const handleSupabaseSuccess = (data) => {
  return {
    success: true,
    error: null,
    data: data
  };
};