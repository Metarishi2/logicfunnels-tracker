# Environment Setup (Webxela Activity Tracker)

## Quick Setup

1. Create a file named `.env` in your project root with these values:
   ```env
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   REACT_APP_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   PORT=3001
   REACT_APP_ENV=development
   ```

2. Restart the development server:
   ```bash
   npm start
   ```

3. Test the application: Visit [http://localhost:3000](http://localhost:3000)

## Environment Variables
- `REACT_APP_SUPABASE_URL`: Your Supabase project URL
- `REACT_APP_SUPABASE_ANON_KEY`: Supabase anonymous key (safe for browser)
- `REACT_APP_SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (admin operations)
- `PORT`: Development server port (default: 3001)
- `REACT_APP_ENV`: Set to `development` for local dev

## Security Note
- **Never share your service role key or .env file publicly.**
- The service role key is required for admin operations but should be kept secure.

---
**Branding:** Powered by [Webxela](https://webxela.com) | Designed by [Uimitra](https://uimitra.com) 