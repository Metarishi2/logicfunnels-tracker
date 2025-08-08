import { createClient } from '@supabase/supabase-js'

// Environment variables only - no hardcoded values
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY

// Log configuration status
console.log('Supabase Configuration:');
console.log('- URL:', supabaseUrl ? 'Configured' : 'Missing');
console.log('- Anon Key configured:', !!supabaseAnonKey);
console.log('- Service Role Key configured:', !!supabaseServiceKey);

// Validate required configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing required Supabase configuration!');
  console.error('Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in your .env file');
  throw new Error('Missing Supabase configuration. Check your .env file.');
} else {
  console.log('✅ Supabase client configured successfully');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for admin operations (only use when needed)
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null 