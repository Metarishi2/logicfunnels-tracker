# gigzs Daily Activity Tracker & Dashboard

A modern, multi-tenant React-based daily activity tracking system with real-time analytics, professional UI, and Supabase backend.

## 🚀 Features

### 📊 Activity Tracking
- Daily activity submission form (DMs, comments, replies, follow-ups, calls, connections)
- Track activities per user and per client
- Users can only see their own analytics
- Admin can see all analytics and manage users/clients

### 🔒 Multi-Tenant & Role-Based Access
- **Admin**: Create/manage users, clients, assignments, and view all analytics
- **User**: Submit activities, view own analytics, see assigned clients
- **Client Dashboards**: Multiple users can be assigned to the same client dashboard
- **Admin Panel**: Centralized management for admin

### 📈 Real-time Analytics
- Live dashboards for both admin and users
- Interactive charts and visualizations
- Looker Studio integration (user and admin views)
- CSV export for analytics

### 🎨 Professional UI/UX
- New color theme: Primary `#d5dd3f`, Secondary `#fcfdee`
- Consistent, modern design system across all dashboards
- Responsive, mobile-friendly layouts
- All icons, buttons, and UI elements match the new theme
- Footer: "© 2025 Copyright gigzs and Designed by gigzs | Uimitra" (with links)

## 🛠️ Tech Stack
- **Frontend**: React 18, React Router DOM
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Styling**: CSS3 with custom design system

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### Setup Steps
1. **Clone the repository**
   ```bash
   git clone https://github.com/gigzs/c-web-daily-activity-tracker.git
   cd c-web-daily-activity-tracker
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Environment Configuration**
   ```bash
   cp env.example .env
   # Update .env with your Supabase credentials
   ```
4. **Database Setup**
   - Run `simple_admin_setup.sql` in your Supabase SQL Editor
   - This creates all tables and the default admin user
   - Admin credentials: `admin@example.com` / `admin123`
5. **Start Development Server**
   ```bash
   npm start
   ```

## 🗄️ Database Schema
- See `simple_admin_setup.sql` for full schema
- Tables: `users`, `clients`, `user_client_assignments`, `daily_activities`
- No RLS for simplicity; all access control is handled in the app

## 🔑 Authentication & Roles
- **Admin**: `admin@example.com` / `admin123` (can create users/clients, assign users, view all analytics)
- **User**: Created by admin, can only see their own data and assigned clients

## 📊 Analytics Features
- **Admin Dashboard**: View/manage all users, clients, assignments, and analytics
- **User Dashboard**: View personal analytics, activities, assigned clients, and submit activities
- **Live Analytics**: Real-time updates for both admin and users
- **Looker Studio Integration**: Export analytics as CSV for Looker Studio

## 🏗️ Project Structure
```
src/
├── components/
│   ├── ActivityForm.js
│   ├── AdminDashboard.js
│   ├── UserDashboard.js
│   ├── UserLiveAnalytics.js
│   ├── RealTimeDashboard.js
│   ├── AdminLogin.js
│   ├── UserLogin.js
│   ├── AdminSetup.js
│   ├── AdminAccessMessage.js
│   └── TestConnection.js (admin only)
├── hooks/
│   └── useAuth.js
├── App.js
└── index.css
```

## 🧑‍💻 Development
- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests

## 📝 License
MIT License - see [LICENSE](LICENSE)

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support
For support and questions, open an issue on GitHub.

---
**Branding:** Powered by [gigzs](https://gigzs.com) | Designed by [Uimitra](https://uimitra.com) 