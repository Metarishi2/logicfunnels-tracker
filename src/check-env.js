// Environment Variables Checker
// This script helps verify environment variables are loaded correctly

console.log('🔍 Environment Variables Check');
console.log('=============================');

// Check Supabase URL
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
console.log('REACT_APP_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
if (supabaseUrl) {
  console.log('  URL:', supabaseUrl);
}

// Check Anon Key
const anonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
console.log('REACT_APP_SUPABASE_ANON_KEY:', anonKey ? '✅ Set' : '❌ Missing');
if (anonKey) {
  console.log('  Key length:', anonKey.length, 'characters');
}

// Check Service Role Key
const serviceKey = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY;
console.log('REACT_APP_SUPABASE_SERVICE_ROLE_KEY:', serviceKey ? '✅ Set' : '❌ Missing');
if (serviceKey) {
  console.log('  Key length:', serviceKey.length, 'characters');
}

// Check Environment
console.log('REACT_APP_ENV:', process.env.REACT_APP_ENV || 'Not set');
console.log('PORT:', process.env.PORT || 'Not set');

console.log('=============================');

if (!supabaseUrl || !anonKey) {
  console.error('❌ Missing required environment variables!');
  console.error('Please check your .env file or Vercel environment variables.');
  process.exit(1);
} else {
  console.log('✅ All required environment variables are set!');
}

export default {
  supabaseUrl,
  anonKey,
  serviceKey
};
