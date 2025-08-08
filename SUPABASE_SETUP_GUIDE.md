# Supabase Setup Guide for Analytics Dashboard

## 🚀 Quick Start

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login and create a new project
3. Choose your region and database password
4. Wait for the project to be created

### 2. Get Your Project Credentials
1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy your **Project URL** and **anon public key**
3. Add these to your `.env` file:

```env
REACT_APP_SUPABASE_URL=your_project_url_here
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Set Up Database Schema

#### Option A: Complete Setup with Sample Data (Recommended for Testing)
1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste the contents of `supabase_setup.sql`
3. Click **Run** to execute the SQL

#### Option B: Basic Setup (Production)
1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste the contents of `supabase_basic_setup.sql`
3. Click **Run** to execute the SQL

### 4. Configure Authentication (Optional)
If you want to use Supabase Auth instead of custom authentication:

1. Go to **Authentication** → **Settings**
2. Configure your authentication providers
3. Update the `useAuth` hook to use Supabase Auth

## 📊 Database Schema Overview

### Tables Created:

#### `users`
- User accounts and profiles
- Fields: id, email, password_hash, first_name, last_name, role, is_active, timestamps

#### `clients`
- Client information
- Fields: id, name, description, timestamps

#### `user_client_assignments`
- Many-to-many relationship between users and clients
- Fields: id, user_id, client_id, timestamps

#### `daily_activities`
- Core analytics data
- Fields: id, user_id, client_id, dms_sent, connection_requests_sent, comments_made, replies_received, followups_made, calls_booked, submitted_at, timestamps

### Functions Created:

#### `get_user_analytics(p_user_id)`
Returns analytics for a specific user or all users:
- total_activities, total_dms, total_calls, total_replies
- call_booking_rate, response_rate

#### `get_client_analytics(p_client_id)`
Returns analytics for a specific client:
- total_activities, total_dms, total_calls, total_replies
- call_booking_rate, response_rate

#### `get_daily_analytics(start_date, end_date, p_user_id, p_client_id)`
Returns daily analytics for charts:
- date, total_dms, total_calls, total_replies, total_followups
- call_booking_rate, response_rate

## 🔐 Row Level Security (RLS)

The setup includes comprehensive RLS policies:

### Users Table
- Users can view their own profile
- Admins can view and manage all users

### Clients Table
- Users can view clients they're assigned to
- Admins can view and manage all clients

### Daily Activities Table
- Users can view and insert their own activities
- Admins can view and manage all activities

### User-Client Assignments Table
- Users can view their own assignments
- Admins can manage all assignments

## 📈 Sample Data (Complete Setup Only)

The complete setup includes:
- 1 admin user (`admin@example.com` / `admin123`)
- 6 sample users with realistic names
- 6 sample clients with descriptions
- 30 days of realistic activity data
- Varying performance patterns (weekdays vs weekends)
- High and low performing days for testing

## 🛠️ Testing Your Setup

### 1. Test Database Connection
Run the test connection script:
```bash
node test_connection.js
```

### 2. Test Analytics Dashboard
1. Start your React app: `npm start`
2. Login as admin: `admin@example.com` / `admin123`
3. Navigate to `/analytics` to see the dashboard
4. Test filtering by user, client, and time range

### 3. Test Real-time Features
1. Go to `/realtime` for admin real-time dashboard
2. Go to `/user-live-analytics` for user analytics
3. Submit new activities and watch real-time updates

## 🔧 Troubleshooting

### Common Issues:

#### "Could not find table" Error
- Make sure you ran the SQL setup script
- Check that table names match exactly
- Verify your Supabase credentials

#### Authentication Issues
- Check your `.env` file has correct credentials
- Verify RLS policies are set up correctly
- Test with admin credentials first

#### No Data Showing
- Run the complete setup with sample data
- Check that users are assigned to clients
- Verify activity data exists in the database

#### Performance Issues
- Ensure indexes are created (included in setup)
- Check query performance in Supabase dashboard
- Consider adding more specific indexes if needed

## 📝 Environment Variables

Make sure your `.env` file contains:

```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

## 🚀 Production Deployment

For production:

1. Use the basic setup (`supabase_basic_setup.sql`)
2. Set up proper authentication
3. Configure environment variables
4. Set up proper backup and monitoring
5. Consider using Supabase Edge Functions for complex analytics

## 📞 Support

If you encounter issues:

1. Check the Supabase dashboard logs
2. Verify your SQL setup completed successfully
3. Test with the provided sample credentials
4. Check the browser console for errors

The analytics dashboard should work immediately after running the setup SQL!
