import { createClient } from '@supabase/supabase-js'

// Environment variables with your provided values as defaults
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://ayeqoelpmaflmswivnaw.supabase.co'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5ZXFvZWxwbWFmbG1zd2l2bmF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2NDM3MDAsImV4cCI6MjA3MDIxOTcwMH0.sPWmzH32DjZ45d-bjfrkc1YUmzrVUzrB5ygOhMQp1qw'
const supabaseServiceKey = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5ZXFvZWxwbWFmbG1zd2l2bmF3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDY0MzcwMCwiZXhwIjoyMDcwMjE5NzAwfQ.P0C0TWGxOl5_bci-LTi_Zi2ojW7pdbfYT1rG1_MePgc'

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