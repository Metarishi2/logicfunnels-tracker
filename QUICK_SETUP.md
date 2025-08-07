# 🚀 Quick Setup Guide

## Step 1: Database Setup

1. **Run the multi-tenant schema** in your Supabase SQL Editor:
   ```sql
   -- Copy and paste the contents of multi_tenant_schema.sql
   ```

2. **Create the first admin user** in your Supabase SQL Editor:
   ```sql
   -- Copy and paste the contents of create_admin_user.sql
   ```

## Step 2: Environment Setup

1. **Copy environment file**:
   ```bash
   cp env.example .env
   ```

2. **Update your .env file** with your Supabase credentials:
   ```env
   REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   REACT_APP_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
   PORT=3003
   REACT_APP_ENV=development
   ```

## Step 3: Start the Application

```bash
npm install
npm start
```

## Step 4: Login

1. **Go to**: http://localhost:3003
2. **Click**: "Admin Login" in the navigation
3. **Login with**:
   - Email: `admin@example.com`
   - Password: `admin123`

## Step 5: Access Admin Dashboard

1. **After login**, you'll see "Admin Dashboard" in the navigation
2. **Click it** to access the full admin panel
3. **Create users and clients** as needed

## 🎯 What You Can Do Now

### As Admin:
- ✅ View all analytics
- ✅ Create new users
- ✅ Create client dashboards
- ✅ Assign users to clients
- ✅ Manage the entire system

### Create Your First User:
1. Go to Admin Dashboard → Users
2. Click "Create User"
3. Fill in user details
4. Assign them to a client

### Create Your First Client:
1. Go to Admin Dashboard → Clients
2. Click "Create Client"
3. Enter client name and description

## 🔧 Troubleshooting

### Issue: "Loading user profile..." stuck
**Solution**: Make sure you've run the `create_admin_user.sql` script in Supabase

### Issue: Can't login
**Solution**: Check your Supabase credentials in `.env` file

### Issue: Admin dashboard not showing
**Solution**: Make sure the admin user exists in the `users` table with role = 'admin'

## 📊 Test the System

1. **Submit an activity** at http://localhost:3003/submit
2. **View analytics** in the admin dashboard
3. **Create a user** and assign them to a client
4. **Login as that user** to see their dashboard

## 🎉 You're Ready!

Your multi-tenant form analytics system is now running! You can:
- Create multiple users
- Create multiple clients
- Assign users to clients
- Track activities per user and client
- View analytics at all levels

---

**Need help?** Check the full documentation in `SETUP_MULTI_TENANT.md` 