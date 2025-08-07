# 🚀 Setup Guide (Webxela Activity Tracker)

## Step 1: Add Your Supabase Credentials
1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy your project URL and anon key
4. Edit the `.env` file in your project root:
   ```env
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   REACT_APP_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   PORT=3001
   REACT_APP_ENV=development
   ```

## Step 2: Run the Database Setup
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the entire content of `simple_admin_setup.sql`
4. Click "Run"
   - This will create all tables and the default admin user

## Step 3: Start the App
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm start
   ```
3. Go to [http://localhost:3000](http://localhost:3000)

## Step 4: Login as Admin
1. Go to "Admin Login"
2. Use credentials:
   - Email: `admin@example.com`
   - Password: `admin123`
3. You should see the admin dashboard!

## Step 5: Create Users and Clients
- From the admin dashboard, create users and clients, and assign users to clients.
- Users can log in from the "User Login" page and will only see their own analytics and assigned clients.

## Troubleshooting
- **Database tables not found**: Make sure you ran `simple_admin_setup.sql` and your Supabase credentials are correct in `.env`.
- **Login doesn't work**: Check browser console for errors. Verify the admin user exists in Supabase.
- **App won't start**: Ensure `.env` is correct and all dependencies are installed.

---
**Branding:** Powered by [Webxela](https://webxela.com) | Designed by [Uimitra](https://uimitra.com) 