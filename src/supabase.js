import { createClient } from '@supabase/supabase-js'

// Environment variables with your provided values as defaults
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://vplmzedfoakizvnwqsmu.supabase.co'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbG16ZWRmb2FraXp2bndxc211Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MDcxNjQsImV4cCI6MjA2OTk4MzE2NH0.Cb6k50jNh1-8Vwap6JpOfJ469kUqkRSYYb3IzRVck3A'
const supabaseServiceKey = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbG16ZWRmb2FraXp2bndxc211Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQwNzE2NCwiZXhwIjoyMDY5OTgzMTY0fQ.lwRTVf-knAHuSIbDddAyjc7-1BnfggFw_rjBcpMWwEU'

// Log configuration status
console.log('Supabase Configuration:');
console.log('- URL:', supabaseUrl);
console.log('- Anon Key configured:', !!supabaseAnonKey);
console.log('- Service Role Key configured:', !!supabaseServiceKey);

// Validate required configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing required Supabase configuration!');
  console.error('Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in your .env file');
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