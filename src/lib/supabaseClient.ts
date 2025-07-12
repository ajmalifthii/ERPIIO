import { createClient } from '@supabase/supabase-js'

// Get Supabase URL and Anon Key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Supabase URL or Anon Key is missing. Make sure to set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  );
  // You might want to throw an error here or handle this case more gracefully
  // depending on how you want your application to behave if credentials are missing.
}

// Initialize Supabase client
// The assertion ! is used because we've checked above, but for robustness,
// you might handle the case where they are still undefined more directly.
export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
