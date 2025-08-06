import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Download, 
  Filter,
  RefreshCw,
  Activity,
  MessageSquare,
  Reply,
  Phone,
  Users,
  FileSpreadsheet,
  UserPlus,
  Shield,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle,
  Zap,
  ExternalLink
} from 'lucide-react';
import RealTimeStatus from './shared/RealTimeStatus';
import LookerStudioIntegration from './shared/LookerStudioIntegration';
import StatsGrid from './shared/StatsGrid';
import { supabase, supabaseAdmin } from '../supabase';
import { format, getWeek, getDay } from 'date-fns';
import * as XLSX from 'xlsx';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line
} from 'recharts';

function AdminDashboard() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    week: ''
  });
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [adminForm, setAdminForm] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [adminMessage, setAdminMessage] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());


  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('daily_activities_with_computed')
        .select('*')
        .order('submitted_at', { ascending: false });

      // Apply filters
      if (filters.dateFrom) {
        query = query.gte('submitted_at', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('submitted_at', filters.dateTo);
      }

      const { data, error } = await query;

      if (error) throw error;

      setActivities(data || []);
      setLastUpdate(new Date());
      console.log('Fetched activities:', data);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setError('Failed to fetch activities: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Real-time subscription
  useEffect(() => {
    if (!realTimeEnabled) return;

    const subscription = supabase
      .channel('daily_activities_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'daily_activities' 
        }, 
        (payload) => {
          console.log('Real-time update:', payload);
          fetchActivities(); // Refresh data on any change
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [realTimeEnabled, fetchActivities]);

  // Initial data fetch
  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!realTimeEnabled) return;

    const interval = setInterval(() => {
      fetchActivities();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [realTimeEnabled, fetchActivities]);

  // Calculate totals
  const totals = activities.reduce((acc, activity) => {
    acc.dms_sent += activity.dms_sent || 0;
    acc.comments_made += activity.comments_made || 0;
    acc.replies_received += activity.replies_received || 0;
            acc.followups_made += activity.followups_made || 0;
    acc.calls_booked += activity.calls_booked || 0;
    return acc;
  }, {
    dms_sent: 0,
    comments_made: 0,
    replies_received: 0,
    followups_scheduled: 0,
    calls_booked: 0
  });

  // Prepare data for charts
  const weeklyData = activities.reduce((acc, activity) => {
    const week = getWeek(new Date(activity.submitted_at));
    if (!acc[week]) {
      acc[week] = {
        week: `Week ${week}`,
        dms_sent: 0,
        comments_made: 0,
        replies_received: 0,
        followups_scheduled: 0,
        calls_booked: 0
      };
    }
    acc[week].dms_sent += activity.dms_sent || 0;
    acc[week].comments_made += activity.comments_made || 0;
    acc[week].replies_received += activity.replies_received || 0;
    acc[week].followups_scheduled += activity.followups_scheduled || 0;
    acc[week].calls_booked += activity.calls_booked || 0;
    return acc;
  }, {});

  const weeklyChartData = Object.values(weeklyData).slice(-8); // Last 8 weeks

  const dailyData = activities.reduce((acc, activity) => {
    const day = getDay(new Date(activity.submitted_at));
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[day];
    
    if (!acc[dayName]) {
      acc[dayName] = {
        day: dayName,
        total: 0
      };
    }
    acc[dayName].total += (activity.dms_sent || 0) + (activity.comments_made || 0) + 
                          (activity.replies_received || 0) + (activity.followups_scheduled || 0);
    return acc;
  }, {});

  const dailyChartData = Object.values(dailyData);

  // Real-time trend data (last 7 days)
  const trendData = activities
    .filter(activity => {
      const activityDate = new Date(activity.submitted_at);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return activityDate >= sevenDaysAgo;
    })
    .map(activity => ({
      date: format(new Date(activity.submitted_at), 'MMM dd'),
      total: (activity.dms_sent || 0) + (activity.comments_made || 0) + 
             (activity.replies_received || 0) + (activity.followups_scheduled || 0),
      dms_sent: activity.dms_sent || 0,
      comments_made: activity.comments_made || 0,
      replies_received: activity.replies_received || 0,
      followups_scheduled: activity.followups_scheduled || 0,
      calls_booked: activity.calls_booked || 0
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const pieData = [
    { name: 'DMs Sent', value: totals.dms_sent, color: '#0ea5e9' },
    { name: 'Comments Made', value: totals.comments_made, color: '#3b82f6' },
    { name: 'Replies Received', value: totals.replies_received, color: '#8b5cf6' },
    { name: 'Follow-ups Scheduled', value: totals.followups_scheduled, color: '#06b6d4' },
    { name: 'Calls Booked', value: totals.calls_booked, color: '#10b981' }
  ];

  const exportCSV = () => {
    const headers = ['Date', 'DMs Sent', 'Comments Made', 'Replies Received', 'Follow-ups Scheduled', 'Calls Booked'];
    const csvContent = [
      headers.join(','),
      ...activities.map(activity => [
        format(new Date(activity.submitted_at), 'yyyy-MM-dd'),
        activity.dms_sent,
        activity.comments_made,
        activity.replies_received,
        activity.followups_scheduled,
        activity.calls_booked || 0
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-activities-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportExcel = () => {
    // Prepare data for Excel
    const excelData = activities.map(activity => ({
      'Date': format(new Date(activity.submitted_at), 'yyyy-MM-dd'),
      'Day of Week': format(new Date(activity.submitted_at), 'EEEE'),
      'DMs Sent': activity.dms_sent,
      'Comments Made': activity.comments_made,
      'Replies Received': activity.replies_received,
      'Follow-ups Scheduled': activity.followups_scheduled,
      'Calls Booked': activity.calls_booked || 0,
      'Total Activities': (activity.dms_sent || 0) + (activity.comments_made || 0) + 
                         (activity.replies_received || 0) + (activity.followups_scheduled || 0)
    }));

    // Add summary sheet
    const summaryData = [
      {
        'Metric': 'Total DMs Sent',
        'Value': totals.dms_sent
      },
      {
        'Metric': 'Total Comments Made',
        'Value': totals.comments_made
      },
      {
        'Metric': 'Total Replies Received',
        'Value': totals.replies_received
      },
      {
        'Metric': 'Total Follow-ups Scheduled',
        'Value': totals.followups_scheduled
      },
      {
        'Metric': 'Total Calls Booked',
        'Value': totals.calls_booked
      },
      {
        'Metric': 'Total Submissions',
        'Value': activities.length
      }
    ];

    // Create workbook with multiple sheets
    const wb = XLSX.utils.book_new();
    
    // Main data sheet
    const ws1 = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Daily Activities');
    
    // Summary sheet
    const ws2 = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, ws2, 'Summary');
    
    // Weekly trends sheet
    const ws3 = XLSX.utils.json_to_sheet(weeklyChartData);
    XLSX.utils.book_append_sheet(wb, ws3, 'Weekly Trends');
    
    // Daily distribution sheet
    const ws4 = XLSX.utils.json_to_sheet(dailyChartData);
    XLSX.utils.book_append_sheet(wb, ws4, 'Daily Distribution');

    // Save the file
    XLSX.writeFile(wb, `daily-activities-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const generateLookerStudioUrl = () => {
    // Create a Google Sheets URL that Looker Studio can connect to
    // For now, we'll create a CSV download that can be imported
    const csvData = activities.map(activity => ({
      date: format(new Date(activity.submitted_at), 'yyyy-MM-dd'),
      day_of_week: format(new Date(activity.submitted_at), 'EEEE'),
      dms_sent: activity.dms_sent,
      comments_made: activity.comments_made,
      replies_received: activity.replies_received,
      followups_scheduled: activity.followups_scheduled,
      calls_booked: activity.calls_booked || 0,
      total_activities: (activity.dms_sent || 0) + (activity.comments_made || 0) + 
                       (activity.replies_received || 0) + (activity.followups_scheduled || 0)
    }));

    const csvContent = [
      'date,day_of_week,dms_sent,comments_made,replies_received,followups_scheduled,calls_booked,total_activities',
      ...csvData.map(row => 
        `${row.date},${row.day_of_week},${row.dms_sent},${row.comments_made},${row.replies_received},${row.followups_scheduled},${row.calls_booked},${row.total_activities}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    
    // Create download link for Looker Studio import
    const a = document.createElement('a');
    a.href = url;
    a.download = `looker-studio-data-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    return 'https://lookerstudio.google.com/';
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setAdminLoading(true);
    setAdminMessage('');

    // Validate passwords match
    if (adminForm.password !== adminForm.confirmPassword) {
      setAdminMessage('Passwords do not match');
      setAdminLoading(false);
      return;
    }

    // Validate password length
    if (adminForm.password.length < 6) {
      setAdminMessage('Password must be at least 6 characters long');
      setAdminLoading(false);
      return;
    }

    // Check if admin client is available
    if (!supabaseAdmin) {
      setAdminMessage('Admin functionality not available. Please set REACT_APP_SUPABASE_SERVICE_ROLE_KEY in your environment variables.');
      setAdminLoading(false);
      return;
    }

    try {
      // Create new user in Supabase
      const { error } = await supabaseAdmin.auth.admin.createUser({
        email: adminForm.email,
        password: adminForm.password,
        email_confirm: true // Auto-confirm email
      });

      if (error) throw error;

      setAdminMessage('Admin user created successfully!');
      setAdminForm({ email: '', password: '', confirmPassword: '' });
      setShowAdminForm(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setAdminMessage(''), 3000);
    } catch (error) {
      console.error('Error creating admin:', error);
      setAdminMessage('Failed to create admin: ' + error.message);
    } finally {
      setAdminLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="card error">
        <h3>Error Loading Dashboard</h3>
        <p>{error}</p>
        <button onClick={fetchActivities} className="btn">
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <h2>
          <BarChart3 className="inline mr-3" />
          Real-Time Activity Dashboard
        </h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setRealTimeEnabled(!realTimeEnabled)} 
            className={`btn ${realTimeEnabled ? 'btn-secondary' : ''}`}
          >
            <Zap size={18} />
            {realTimeEnabled ? 'Live' : 'Manual'}
          </button>
          <button 
            onClick={fetchActivities} 
            className="btn btn-secondary"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
          <button 
            onClick={() => setShowAdminForm(!showAdminForm)} 
            className="btn btn-secondary"
          >
            <UserPlus size={18} />
            {showAdminForm ? 'Cancel' : 'Add Admin'}
          </button>
          <button 
            onClick={exportCSV} 
            className="btn btn-secondary"
          >
            <Download size={18} />
            Export CSV
          </button>
          <button 
            onClick={exportExcel} 
            className="btn"
          >
            <FileSpreadsheet size={18} />
            Export Excel
          </button>
        </div>
      </div>

      {/* Real-time Status */}
      <RealTimeStatus realTimeEnabled={realTimeEnabled} lastUpdate={lastUpdate} />

      {/* Looker Studio Integration */}
      <LookerStudioIntegration onExport={generateLookerStudioUrl} />

      {/* Admin Management Section */}
      {showAdminForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>
            <Shield className="inline mr-3" />
            Add New Admin User
          </h3>
          
          {adminMessage && (
            <div 
              className={adminMessage.includes('successfully') ? 'success' : 'error'}
              style={{ marginBottom: '16px' }}
            >
              {adminMessage.includes('successfully') ? (
                <CheckCircle size={16} className="inline mr-2" />
              ) : (
                <AlertCircle size={16} className="inline mr-2" />
              )}
              {adminMessage}
            </div>
          )}

          <form onSubmit={handleAddAdmin}>
            <div className="form-group">
              <label htmlFor="admin-email">
                <Mail size={16} className="inline mr-2" />
                Admin Email
              </label>
              <input
                type="email"
                id="admin-email"
                className="form-control"
                value={adminForm.email}
                onChange={(e) => setAdminForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter admin email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="admin-password">
                <Lock size={16} className="inline mr-2" />
                Password
              </label>
              <input
                type="password"
                id="admin-password"
                className="form-control"
                value={adminForm.password}
                onChange={(e) => setAdminForm(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter password (min 6 characters)"
                required
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label htmlFor="admin-confirm-password">
                <Lock size={16} className="inline mr-2" />
                Confirm Password
              </label>
              <input
                type="password"
                id="admin-confirm-password"
                className="form-control"
                value={adminForm.confirmPassword}
                onChange={(e) => setAdminForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm password"
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button 
                type="submit" 
                className="btn" 
                disabled={adminLoading}
              >
                {adminLoading ? (
                  <>
                    <div className="loading-spinner" style={{ width: '16px', height: '16px' }}></div>
                    Creating Admin...
                  </>
                ) : (
                  <>
                    <UserPlus size={18} />
                    Create Admin User
                  </>
                )}
              </button>
              
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => {
                  setShowAdminForm(false);
                  setAdminForm({ email: '', password: '', confirmPassword: '' });
                  setAdminMessage('');
                }}
              >
                Cancel
              </button>
            </div>
          </form>

          <div 
            style={{ 
              marginTop: '20px', 
              padding: '15px', 
              backgroundColor: 'var(--neutral-50)', 
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--neutral-200)'
            }}
          >
            <h4 style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              marginBottom: '10px',
              color: 'var(--neutral-700)'
            }}>
              <Shield size={16} />
              Admin User Permissions:
            </h4>
            <ul style={{ 
              marginLeft: '20px', 
              marginTop: '10px',
              color: 'var(--neutral-600)',
              lineHeight: '1.8'
            }}>
              <li>Full access to dashboard and analytics</li>
              <li>Can view all activity data</li>
              <li>Can export data (CSV/Excel)</li>
              <li>Can add more admin users</li>
              <li>Email will be auto-confirmed</li>
            </ul>
          </div>

          {!supabaseAdmin && (
            <div 
              style={{ 
                marginTop: '20px', 
                padding: '15px', 
                backgroundColor: 'var(--warning-50)', 
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--warning-500)'
              }}
            >
              <h4 style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                marginBottom: '10px',
                color: 'var(--warning-700)'
              }}>
                <AlertCircle size={16} />
                Setup Required:
              </h4>
              <p style={{ 
                color: 'var(--warning-600)',
                lineHeight: '1.6'
              }}>
                To enable admin user creation, add your Supabase service role key to your environment variables as <code>REACT_APP_SUPABASE_SERVICE_ROLE_KEY</code>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <h3>
          <Filter className="inline mr-3" />
          Filters
        </h3>
        <div className="filters">
          <div className="filter-group">
            <label>From Date:</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              className="form-control"
            />
          </div>
          <div className="filter-group">
            <label>To Date:</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              className="form-control"
            />
          </div>
          <div className="filter-group">
            <label>Clear Filters:</label>
            <button 
              onClick={() => setFilters({ dateFrom: '', dateTo: '', week: '' })}
              className="btn btn-secondary"
              style={{ marginTop: '8px' }}
            >
              <RefreshCw size={16} />
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <StatsGrid activities={activities} totals={totals} />

      {/* Real-time Trend Chart */}
      <div className="chart-container">
        <h3>
          <TrendingUp className="inline mr-3" />
          Real-time Activity Trends (Last 7 Days)
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--neutral-200)" />
            <XAxis 
              dataKey="date" 
              stroke="var(--neutral-600)"
              fontSize={12}
            />
            <YAxis 
              stroke="var(--neutral-600)"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid var(--neutral-200)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="total" 
              stroke="#0ea5e9" 
              strokeWidth={3}
              dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="dms_sent" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
            />
            <Line 
              type="monotone" 
              dataKey="comments_made" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Charts */}
      <div className="chart-container">
        <h3>
          <TrendingUp className="inline mr-3" />
          Weekly Activity Trends
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={weeklyChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--neutral-200)" />
            <XAxis 
              dataKey="week" 
              stroke="var(--neutral-600)"
              fontSize={12}
            />
            <YAxis 
              stroke="var(--neutral-600)"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid var(--neutral-200)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)'
              }}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="dms_sent" 
              stackId="1" 
              stroke="#0ea5e9" 
              fill="#0ea5e9" 
              fillOpacity={0.8}
            />
            <Area 
              type="monotone" 
              dataKey="comments_made" 
              stackId="1" 
              stroke="#3b82f6" 
              fill="#3b82f6" 
              fillOpacity={0.8}
            />
            <Area 
              type="monotone" 
              dataKey="replies_received" 
              stackId="1" 
              stroke="#8b5cf6" 
              fill="#8b5cf6" 
              fillOpacity={0.8}
            />
            <Area 
              type="monotone" 
              dataKey="followups_scheduled" 
              stackId="1" 
              stroke="#06b6d4" 
              fill="#06b6d4" 
              fillOpacity={0.8}
            />
            <Area 
              type="monotone" 
              dataKey="calls_booked" 
              stackId="1" 
              stroke="#10b981" 
              fill="#10b981" 
              fillOpacity={0.8}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container">
        <h3>
          <Calendar className="inline mr-3" />
          Activity by Day of Week
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={dailyChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--neutral-200)" />
            <XAxis 
              dataKey="day" 
              stroke="var(--neutral-600)"
              fontSize={12}
            />
            <YAxis 
              stroke="var(--neutral-600)"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid var(--neutral-200)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)'
              }}
            />
            <Bar 
              dataKey="total" 
              fill="url(#gradient)"
              radius={[4, 4, 0, 0]}
            />
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0ea5e9" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container">
        <h3>
          <PieChart className="inline mr-3" />
          Activity Distribution
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid var(--neutral-200)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Activity Table */}
      <div className="card">
        <h3>
          <Activity className="inline mr-3" />
          Recent Activity
        </h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>DMs Sent</th>
                <th>Comments Made</th>
                <th>Replies Received</th>
                <th>Follow-ups Scheduled</th>
                <th>Calls Booked</th>
              </tr>
            </thead>
            <tbody>
              {activities.slice(0, 10).map((activity, index) => (
                <tr key={activity.id}>
                  <td>{format(new Date(activity.submitted_at), 'MMM dd, yyyy')}</td>
                  <td>{activity.dms_sent}</td>
                  <td>{activity.comments_made}</td>
                  <td>{activity.replies_received}</td>
                  <td>{activity.followups_scheduled}</td>
                  <td>{activity.calls_booked || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard; 