# 🚀 Quick Setup Guide (gigzs Activity Tracker)

## Step 1: Database Setup
1. Run the schema in your Supabase SQL Editor:
   - Copy and paste the contents of `simple_admin_setup.sql`
   - Click "Run"
   - This creates all tables and the default admin user

## Step 2: Environment Setup
1. Copy environment file:
   ```bash
   cp env.example .env
   ```
2. Update your `.env` file with your Supabase credentials:
   ```env
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   REACT_APP_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   PORT=3001
   REACT_APP_ENV=development
   ```

## Step 3: Start the Application
```bash
npm install
npm start
```

## Step 4: Login
1. Go to: [http://localhost:3000](http://localhost:3000)
2. Click: "Admin Login" in the navigation
3. Login with:
   - Email: `admin@example.com`
   - Password: `admin123`

## Step 5: Access Admin Dashboard
1. After login, you'll see "Admin Dashboard" in the navigation
2. Click it to access the full admin panel
3. Create users and clients as needed

## 🎯 What You Can Do Now
- As Admin: View all analytics, create/manage users and clients, assign users to clients
- As User: Submit activities, view own analytics, see assigned clients

## 🛠️ Troubleshooting
- "Loading user profile..." stuck: Make sure you've run the `simple_admin_setup.sql` script in Supabase
- Can't login: Check your Supabase credentials in `.env` file
- Admin dashboard not showing: Make sure the admin user exists in the `users` table with role = 'admin'

---
**Branding:** Powered by [gigzs](https://gigzs.com) | Designed by [Uimitra](https://uimitra.com) 