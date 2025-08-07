const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase Connection...\n');

if (!supabaseUrl || supabaseUrl.includes('your-project-id')) {
  console.error('❌ ERROR: Supabase URL not configured properly');
  console.log('Please run: node setup_credentials.js');
  process.exit(1);
}

if (!supabaseKey || supabaseKey.includes('your_supabase_anon_key')) {
  console.error('❌ ERROR: Supabase anon key not configured properly');
  console.log('Please run: node setup_credentials.js');
  process.exit(1);
}

console.log('✅ Credentials found');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('\n🔍 Testing basic connection...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Connection failed:', error.message);
      
      if (error.message.includes('relation "users" does not exist')) {
        console.log('\n💡 SOLUTION: You need to run the setup script in Supabase SQL Editor');
        console.log('1. Go to your Supabase Dashboard → SQL Editor');
        console.log('2. Copy the simple_admin_setup.sql content');
        console.log('3. Paste and run it');
        console.log('4. Then run this test again');
      }
      
      return;
    }

    console.log('✅ Basic connection successful');
    
    // Test admin user
    console.log('\n🔍 Testing admin user...');
    const { data: admin, error: adminError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@example.com')
      .single();

    if (adminError) {
      console.error('❌ Admin user test failed:', adminError.message);
    } else if (!admin) {
      console.error('❌ Admin user not found');
    } else {
      console.log('✅ Admin user found:', admin.email, admin.role);
    }

    // Test login credentials
    console.log('\n🔍 Testing login credentials...');
    const { data: login, error: loginError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@example.com')
      .eq('password_hash', 'admin123')
      .eq('is_active', true)
      .single();

    if (loginError) {
      console.error('❌ Login test failed:', loginError.message);
    } else if (!login) {
      console.error('❌ Login credentials not found');
    } else {
      console.log('✅ Login credentials work');
    }

    console.log('\n🎉 All tests completed!');
    console.log('You can now try logging in at http://localhost:3000/login');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testConnection(); 