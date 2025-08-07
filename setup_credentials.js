const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 Supabase Credentials Setup');
console.log('=============================\n');

console.log('Please get your Supabase credentials from:');
console.log('1. Go to https://supabase.com/dashboard');
console.log('2. Select your project');
console.log('3. Go to Settings → API');
console.log('4. Copy the Project URL and anon public key\n');

rl.question('Enter your Supabase Project URL (e.g., https://abc123.supabase.co): ', (url) => {
  rl.question('Enter your Supabase anon public key (starts with eyJ...): ', (key) => {
    
    // Create the .env content
    const envContent = `# Supabase Configuration
# Copy this file to .env and fill in your actual values

# Required: Your Supabase project URL
REACT_APP_SUPABASE_URL=${url}

# Required: Your Supabase anon/public key
REACT_APP_SUPABASE_ANON_KEY=${key}

# Optional: Service role key for admin operations (creating users, etc.)
# Get this from Supabase Dashboard → Settings → API → service_role
REACT_APP_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Optional: Development server port
PORT=3003

# Optional: Environment indicator
REACT_APP_ENV=development`;

    // Write to .env file
    fs.writeFileSync('.env', envContent);
    
    console.log('\n✅ .env file updated successfully!');
    console.log('\nNext steps:');
    console.log('1. Go to your Supabase SQL Editor');
    console.log('2. Copy and paste the simple_admin_setup.sql script');
    console.log('3. Click "Run"');
    console.log('4. Restart your React app: npm start');
    console.log('5. Test the connection at http://localhost:3000/test');
    
    rl.close();
  });
}); 