import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jnustvbeuqxfrtxodkwi.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpudXN0dmJldXF4ZnJ0eG9ka3dpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMzMyNjYsImV4cCI6MjA2NzYwOTI2Nn0.uGWW38cj1gdeiHx6sfdKpVP-z5zcR4oiI3WX23m45IQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
