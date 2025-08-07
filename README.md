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

### 🔐 **Multi-tenant System**
- Admin and User roles with role-based access control
- Admin can create and manage users and clients
- Users can only see their own analytics
- Client assignment and management

### 📤 **Data Export**
- CSV export functionality
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
   - Run the SQL script in `simple_admin_setup.sql` in your Supabase SQL Editor
   - This will create all necessary tables and the admin user
   - Admin credentials: `admin@example.com` / `admin123`

5. **Start Development Server**
   ```bash
   npm start
   ```

## 🗄️ Database Schema

### `users` Table
```sql
- id (uuid, primary key)
- email (varchar, unique)
- password_hash (varchar)
- first_name (varchar)
- last_name (varchar)
- role (varchar, default 'user')
- is_active (boolean, default true)
- created_at (timestamp)
- updated_at (timestamp)
```

### `clients` Table
```sql
- id (uuid, primary key)
- name (varchar)
- description (text)
- created_at (timestamp)
- updated_at (timestamp)
```

### `daily_activities` Table
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key)
- client_id (uuid, foreign key)
- dms_sent (integer)
- connection_requests_sent (integer)
- comments_made (integer)
- replies_received (integer)
- followups_made (integer)
- calls_booked (integer)
- submitted_at (timestamp)
- created_at (timestamp)
- updated_at (timestamp)
```

### `user_client_assignments` Table
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key)
- client_id (uuid, foreign key)
- created_at (timestamp)
```

## 🔐 Authentication

### Admin Access
- **Email**: `admin@example.com`
- **Password**: `admin123`
- **Capabilities**: Create users, manage clients, view all analytics

### User Access
- Users can be created by admin from the admin dashboard
- Users can only see their own analytics and assigned clients
- Users can submit daily activities

## 📊 Analytics Features

### Admin Dashboard
- View all users and their analytics
- Create and manage clients
- Assign users to clients
- View overall system analytics
- User management (edit, delete)

### User Dashboard
- Personal analytics overview
- My activities tracking
- Assigned clients view
- Activity submission form

### Live Analytics
- Real-time data updates
- Interactive charts
- Performance metrics
- Looker Studio integration

## 🚀 Quick Start

1. **Setup Supabase**
   - Create a new Supabase project
   - Copy your project URL and API keys
   - Update the `.env` file

2. **Run Database Setup**
   - Execute `simple_admin_setup.sql` in Supabase SQL Editor
   - This creates all tables and admin user

3. **Start the Application**
   ```bash
   npm start
   ```

4. **Login as Admin**
   - Go to `/login`
   - Use: `admin@example.com` / `admin123`
   - Create users and clients from admin dashboard

## 📁 Project Structure

```
src/
├── components/
│   ├── ActivityForm.js          # Activity submission form
│   ├── AdminDashboard.js        # Admin management dashboard
│   ├── UserDashboard.js         # User analytics dashboard
│   ├── UserLiveAnalytics.js     # User real-time analytics
│   ├── RealTimeDashboard.js     # Admin real-time analytics
│   ├── AdminLogin.js           # Admin login form
│   ├── UserLogin.js            # User login form
│   ├── AdminSetup.js           # Admin setup component
│   └── TestConnection.js       # Database connection test
├── hooks/
│   └── useAuth.js              # Authentication logic
├── App.js                      # Main application component
└── index.css                   # Global styles
```

## 🔧 Development

### Available Scripts
- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

### Environment Variables
- `REACT_APP_SUPABASE_URL` - Supabase project URL
- `REACT_APP_SUPABASE_ANON_KEY` - Supabase anonymous key
- `REACT_APP_SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `PORT` - Development server port (default: 3000)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For support and questions, please open an issue on GitHub. 