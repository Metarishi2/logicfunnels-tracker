# Daily Activity Tracker & Dashboard

A comprehensive React-based daily activity tracking system with real-time analytics, built with Supabase backend and modern UI components.

## 🚀 Features

### 📊 **Activity Tracking**
- Daily activity submission form
- Track DMs sent, comments made, replies received
- Monitor follow-ups made and calls booked
- Connection requests tracking

### 📈 **Real-time Analytics**
- Live dashboard with real-time updates
- Interactive charts and visualizations
- Weekly, monthly, and total breakdowns
- Trend analysis and performance metrics

### 🔐 **Admin Management**
- Secure admin authentication
- Add new admin users from dashboard
- Role-based access control
- Admin-only analytics dashboard

### 📤 **Data Export**
- CSV export functionality
- Excel file generation
- Looker Studio integration
- Real-time data synchronization

### 🎨 **Modern UI/UX**
- Professional design system
- Responsive layout
- Mobile-friendly interface
- Smooth animations and transitions

## 🛠️ Tech Stack

- **Frontend**: React 18, React Router DOM
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Excel Export**: XLSX
- **Styling**: CSS3 with custom design system

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/WEBXELA/c-web-daily-activity-tracker.git
   cd c-web-daily-activity-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Update `.env` with your Supabase credentials:
   ```env
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   REACT_APP_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   PORT=3001
   REACT_APP_ENV=development
   ```

4. **Database Setup**
   - Run the SQL scripts in `supabase_setup.sql` in your Supabase SQL Editor
   - Set up Row Level Security (RLS) policies
   - Configure authentication settings

5. **Start Development Server**
   ```bash
   npm start
   ```

## 🗄️ Database Schema

### `daily_activities` Table
```sql
- id (uuid, primary key)
- dms_sent (integer)
- comments_made (integer)
- replies_received (integer)
- followups_made (integer)
- calls_booked (integer, nullable)
- connection_requests_sent (integer)
- submitted_at (timestamp)
```

### Computed Columns
- `weekday` - Day of week
- `week_number` - Week number of year
- `total_activities` - Sum of all activities

## 📱 Usage

### Public Routes
- **`/submit`** - Daily activity submission form
- **`/test`** - Database connection testing

### Admin Routes
- **`/admin`** - Main analytics dashboard
- **`/realtime`** - Real-time analytics
- **`/login`** - Admin authentication

### Default Admin Credentials
- **Email**: `admin@example.com`
- **Password**: `admin123`

## 🔧 Configuration

### Environment Variables
| Variable | Description | Required |
|----------|-------------|----------|
| `REACT_APP_SUPABASE_URL` | Supabase project URL | Yes |
| `REACT_APP_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `REACT_APP_SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `PORT` | Development server port | No (default: 3001) |
| `REACT_APP_ENV` | Environment mode | No |

### Supabase Setup
1. Create a new Supabase project
2. Run the SQL setup scripts
3. Configure authentication providers
4. Set up RLS policies
5. Add environment variables

## 📊 Analytics Features

### Dashboard Metrics
- **Cumulative Totals**: All-time activity summaries
- **Trend Analysis**: Weekly and daily comparisons
- **Rate Calculations**: 
  - Call booking rate (Calls ÷ DMs)
  - Response rate (Replies ÷ DMs)
  - Follow-up efficiency (Calls ÷ Follow-ups)
- **Performance Insights**: Top performing days/weeks

### Real-time Features
- Live data updates
- Auto-refresh functionality
- Real-time status indicators
- Live trend charts

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Netlify Deployment
1. Connect repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Add environment variables

### Manual Deployment
```bash
npm run build
# Upload build/ folder to your hosting provider
```

## 🔒 Security

### Authentication
- Supabase Auth integration
- Role-based access control
- Secure admin management

### Data Protection
- Row Level Security (RLS)
- Environment variable protection
- Input validation and sanitization

## 📈 Monitoring

### Analytics
- Real-time activity tracking
- Performance metrics
- User engagement analytics

### Error Handling
- Comprehensive error logging
- User-friendly error messages
- Graceful degradation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Check the [ADMIN_SETUP.md](ADMIN_SETUP.md) for detailed setup instructions
- Review the troubleshooting section in the setup guide

## 🔄 Updates

### Recent Changes
- ✅ Removed duplicate sections from dashboard components
- ✅ Created shared components for better maintainability
- ✅ Added comprehensive .gitignore file
- ✅ Improved code organization and structure

### Roadmap
- [ ] Enhanced mobile responsiveness
- [ ] Additional chart types
- [ ] Advanced filtering options
- [ ] API rate limiting
- [ ] Performance optimizations

---

**Built with ❤️ using React and Supabase** 