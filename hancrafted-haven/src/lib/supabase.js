import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Only create client if we have valid credentials
let supabase = null;
if (supabaseUrl !== 'https://placeholder.supabase.co' && supabaseAnonKey !== 'placeholder-key') {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn('⚠️  Using placeholder Supabase credentials. Please update .env.local with your actual credentials.');
}

export { supabase };

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