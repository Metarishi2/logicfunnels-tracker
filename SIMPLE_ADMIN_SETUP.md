# 🚀 Simple Admin Setup (Webxela Activity Tracker)

## The Problem
If you want a simple, clean setup with just one admin user and no RLS issues, follow these steps.

## ✅ Quick Fix (3 Steps)

### Step 1: Run the Simple Setup
1. Go to your Supabase Dashboard
2. Click on "SQL Editor"
3. Copy and paste the contents of `simple_admin_setup.sql`
4. Click "Run"
   - This will drop any old tables, create the new schema, and add one admin user

### Step 2: Login
1. Go to your app: [http://localhost:3000](http://localhost:3000)
2. Click "Admin Login"
3. Use these credentials:
   - Email: `admin@example.com`
   - Password: `admin123`
4. Click "Sign In"

### Step 3: Access Admin Dashboard
1. After login, you'll see "Admin Dashboard" in navigation
2. Click it to access the admin panel
3. Create more users and clients as needed

## 🎯 What This Creates
- One admin user: `admin@example.com` / `admin123` (role: admin)
- No other users or clients by default
- All other users and clients are created via the admin dashboard

## 🛠️ Next Steps
1. Login as admin
2. Go to Admin Dashboard
3. Create additional users and clients as needed
4. Assign users to clients for multi-tenant access

---
**Branding:** Powered by [Webxela](https://webxela.com) | Designed by [Uimitra](https://uimitra.com) 