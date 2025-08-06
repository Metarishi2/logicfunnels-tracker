# Complete Environment Setup Guide

## Environment Variables Configuration

All Supabase configuration is now moved to environment variables for better security and flexibility.

### Step 1: Create Environment File

Copy the example file and create your `.env`:

```bash
cp env.example .env
```

### Step 2: Get Your Supabase Keys

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the following keys:
   - **Project URL** (from the top of the page)
   - **anon/public** key
   - **service_role** key (for admin operations)

### Step 3: Configure Environment Variables

Edit your `.env` file and add your actual values:

```bash
# Required: Your Supabase project URL
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co

# Required: Your Supabase anon/public key
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Optional: Service role key for admin operations
REACT_APP_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Optional: Development server port
PORT=3003
```

### Step 4: Restart Development Server

```bash
npm start
```

### Step 5: Verify Configuration

Check the browser console for configuration status:
- ✅ Green checkmark = Configuration successful
- ❌ Red X = Missing required configuration

## Admin User Management Setup

### Enable Admin Creation

To enable admin user creation functionality:

1. **Add service role key** to your `.env` file
2. **Restart the server**
3. **Login as admin** to the dashboard
4. **Click "Add Admin"** button
5. **Fill in new admin details** and submit

### Admin User Permissions

New admin users will have:
- ✅ Full access to dashboard and analytics
- ✅ Can view all activity data
- ✅ Can export data (CSV/Excel)
- ✅ Can add more admin users
- ✅ Email auto-confirmed

## Security Best Practices

⚠️ **Important Security Notes**:

- **Never commit `.env` files** to version control
- **Use different keys** for development and production
- **Service role key** has full admin access - keep it secure
- **Anon key** is safe for client-side use
- **Environment variables** must start with `REACT_APP_` for React apps

## Troubleshooting

### Configuration Issues

If you see "Missing required Supabase configuration":
1. Check that `.env` file exists in project root
2. Verify `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` are set
3. Restart the development server
4. Check browser console for detailed error messages

### Admin Functionality Issues

If "Add Admin" doesn't work:
1. Verify `REACT_APP_SUPABASE_SERVICE_ROLE_KEY` is set
2. Check that the service role key is correct
3. Ensure you're logged in as an admin
4. Check browser console for specific error messages

### Database Connection Issues

If dashboard shows no data:
1. Verify your Supabase project is active
2. Check that the `daily_activities` table exists
3. Run the SQL setup script in Supabase SQL editor
4. Test connection via `/test` route

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `REACT_APP_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `REACT_APP_SUPABASE_ANON_KEY` | ✅ | Public anon key for client operations |
| `REACT_APP_SUPABASE_SERVICE_ROLE_KEY` | ❌ | Service role key for admin operations |
| `PORT` | ❌ | Development server port (default: 3000) |
| `REACT_APP_ENV` | ❌ | Environment indicator |

## Production Deployment

For production deployment:

1. **Set environment variables** in your hosting platform
2. **Use production Supabase project** (not development)
3. **Enable Row Level Security** in Supabase
4. **Configure proper authentication** settings
5. **Set up proper CORS** settings in Supabase 