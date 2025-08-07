# 🚀 Quick Setup Guide

## Step 1: Add Your Supabase Credentials

1. **Go to your Supabase project dashboard**
2. **Navigate to Settings → API**
3. **Copy your project URL and anon key**
4. **Edit the `.env` file** in your project root:

```bash
nano .env
```

5. **Replace the placeholder values:**

```env
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

## Step 2: Run the Database Setup

1. **Go to your Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Copy and paste the entire content of `simple_admin_setup.sql`**
4. **Click "Run"**

## Step 3: Test the Setup

1. **Restart your React app:**
   ```bash
   # Stop the current app (Ctrl+C)
   npm start
   ```

2. **Go to http://localhost:3000**
3. **Click "Test Connection" in the navigation**
4. **Click "Run Database Tests"**
5. **All tests should show "PASSED"**

## Step 4: Login as Admin

1. **Go to "Admin Login"**
2. **Click "Quick Access" to auto-fill credentials**
3. **Click "Sign In"**
4. **You should see the admin dashboard!**

## Admin Credentials

- **Email:** admin@example.com
- **Password:** admin123

## Test User Credentials

- **Email:** user@example.com
- **Password:** user123

## What's Included

✅ **Admin Dashboard** - Manage users, clients, and view analytics  
✅ **User Dashboard** - Users can see their own analytics  
✅ **Client Management** - Create and assign clients to users  
✅ **Activity Tracking** - Submit and track daily activities  
✅ **Analytics** - View performance metrics and trends  

## Troubleshooting

**If you see "Database tables not found":**
- Make sure you ran the `simple_admin_setup.sql` script
- Check that your Supabase credentials are correct in `.env`

**If login doesn't work:**
- Check the browser console (F12) for error messages
- Verify the admin user was created in Supabase

**If the app won't start:**
- Make sure your `.env` file has the correct Supabase credentials
- Check that all dependencies are installed: `npm install` 