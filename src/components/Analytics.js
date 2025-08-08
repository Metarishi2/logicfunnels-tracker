import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { 
  Users, 
  MessageSquare, 
  Phone, 
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Activity,
  Clock,
  Star
} from 'lucide-react';
import { supabase } from '../supabase';
import { format, subDays, startOfWeek, endOfWeek, endOfMonth, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns';

function Analytics() {
  const [analytics, setAnalytics] = useState({
    daily: [],
    weekly: [],
    monthly: [],
    totals: {},
    comparisons: {},
    topDays: [],
    topDates: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30'); // days
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedClient, setSelectedClient] = useState('all');
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);

  // Helper functions - defined first
  const aggregateDayStats = (activities) => {
    const stats = activities.reduce((acc, activity) => {
      acc.totalDms += activity.dms_sent || 0;
      acc.totalCalls += activity.calls_booked || 0;
      acc.totalReplies += activity.replies_received || 0;
      acc.totalFollowups += activity.followups_made || 0;
      acc.totalConnections += activity.connection_requests_sent || 0;
      acc.totalComments += activity.comments_made || 0;
      return acc;
    }, {
      totalDms: 0,
      totalCalls: 0,
      totalReplies: 0,
      totalFollowups: 0,
      totalConnections: 0,
      totalComments: 0
    });

    return {
      ...stats,
      callBookingRate: stats.totalDms > 0 ? Math.round((stats.totalCalls / stats.totalDms) * 100) : 0,
      responseRate: stats.totalDms > 0 ? Math.round((stats.totalReplies / stats.totalDms) * 100) : 0,
      followUpToBookingRate: stats.totalFollowups > 0 ? Math.round((stats.totalCalls / stats.totalFollowups) * 100) : 0
    };
  };

  const calculateChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const processAnalyticsData = (activities, days) => {
    const startDate = subDays(new Date(), days);
    const endDate = new Date();

    // Daily breakdown
    const dailyData = eachDayOfInterval({ start: startDate, end: endDate }).map(date => {
      const dayActivities = activities.filter(activity => 
        format(new Date(activity.submitted_at), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );

      const dayStats = aggregateDayStats(dayActivities);
      return {
        date: format(date, 'MMM dd'),
        fullDate: format(date, 'yyyy-MM-dd'),
        ...dayStats
      };
    });

    // Weekly breakdown
    const weeklyData = eachWeekOfInterval({ start: startDate, end: endDate }).map(weekStart => {
      const weekEnd = endOfWeek(weekStart);
      const weekActivities = activities.filter(activity => {
        const activityDate = new Date(activity.submitted_at);
        return activityDate >= weekStart && activityDate <= weekEnd;
      });

      const weekStats = aggregateDayStats(weekActivities);
      return {
        week: `Week ${format(weekStart, 'MMM dd')}`,
        startDate: format(weekStart, 'yyyy-MM-dd'),
        ...weekStats
      };
    });

    // Monthly breakdown
    const monthlyData = eachMonthOfInterval({ start: startDate, end: endDate }).map(monthStart => {
      const monthEnd = endOfMonth(monthStart);
      const monthActivities = activities.filter(activity => {
        const activityDate = new Date(activity.submitted_at);
        return activityDate >= monthStart && activityDate <= monthEnd;
      });

      const monthStats = aggregateDayStats(monthActivities);
      return {
        month: format(monthStart, 'MMM yyyy'),
        startDate: format(monthStart, 'yyyy-MM'),
        ...monthStats
      };
    });

    // Total breakdown
    const totalStats = aggregateDayStats(activities);

    // This week vs last week comparison
    const thisWeekStart = startOfWeek(new Date());
    const lastWeekStart = startOfWeek(subDays(thisWeekStart, 7));
    const lastWeekEnd = endOfWeek(lastWeekStart);

    const thisWeekActivities = activities.filter(activity => 
      new Date(activity.submitted_at) >= thisWeekStart
    );
    const lastWeekActivities = activities.filter(activity => {
      const activityDate = new Date(activity.submitted_at);
      return activityDate >= lastWeekStart && activityDate <= lastWeekEnd;
    });

    const thisWeekStats = aggregateDayStats(thisWeekActivities);
    const lastWeekStats = aggregateDayStats(lastWeekActivities);

    // Top days based on activity
    const topDays = dailyData
      .filter(day => day.totalDms > 0 || day.totalCalls > 0)
      .sort((a, b) => (b.totalDms + b.totalCalls) - (a.totalDms + a.totalCalls))
      .slice(0, 5);

    // Top dates based on response rate
    const topDates = dailyData
      .filter(day => day.responseRate > 0)
      .sort((a, b) => b.responseRate - a.responseRate)
      .slice(0, 5);

    return {
      daily: dailyData,
      weekly: weeklyData,
      monthly: monthlyData,
      totals: totalStats,
      comparisons: {
        thisWeek: thisWeekStats,
        lastWeek: lastWeekStats,
        change: {
          dms: calculateChange(thisWeekStats.totalDms, lastWeekStats.totalDms),
          calls: calculateChange(thisWeekStats.totalCalls, lastWeekStats.totalCalls),
          responseRate: calculateChange(thisWeekStats.responseRate, lastWeekStats.responseRate),
          callBookingRate: calculateChange(thisWeekStats.callBookingRate, lastWeekStats.callBookingRate)
        }
      },
      topDays,
      topDates
    };
  };

  // Data loading functions
  const loadUsersAndClients = async () => {
    try {
      const [usersResponse, clientsResponse] = await Promise.all([
        supabase.from('users').select('id, first_name, last_name, email').eq('is_active', true),
        supabase.from('clients').select('id, name')
      ]);

      if (usersResponse.data) setUsers(usersResponse.data);
      if (clientsResponse.data) setClients(clientsResponse.data);
    } catch (error) {
      console.error('Error loading users and clients:', error);
    }
  };

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const days = parseInt(timeRange);
      const startDate = subDays(new Date(), days);

      // Build query filters
      let query = supabase
        .from('daily_activities')
        .select('*, users:users(first_name, last_name), clients:clients(name)')
        .gte('submitted_at', startDate.toISOString())
        .order('submitted_at', { ascending: true });

      if (selectedUser !== 'all') {
        query = query.eq('user_id', selectedUser);
      }
      if (selectedClient !== 'all') {
        query = query.eq('client_id', selectedClient);
      }

      const { data: activities, error } = await query;

      if (error) throw error;

      if (activities) {
        const processedData = processAnalyticsData(activities, days);
        setAnalytics(processedData);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [timeRange, selectedUser, selectedClient]);

  // Effects
  useEffect(() => {
    loadUsersAndClients();
  }, []);

  useEffect(() => {
    if (users.length > 0 || clients.length > 0) {
      loadAnalytics();
    }
  }, [loadAnalytics, users, clients]);

  // Render helper
  const renderMetricCard = (title, value, subtitle, icon, change = null) => (
    <div className="metric-card">
      <div className="metric-header">
        <div className="metric-icon" style={{ background: 'var(--primary-gradient, linear-gradient(135deg, #3b82f6, #1d4ed8))' }}>
          {icon}
        </div>
        <div className="metric-info">
          <h3>{title}</h3>
          <p className="metric-value">{value}</p>
          {subtitle && <p className="metric-subtitle">{subtitle}</p>}
        </div>
      </div>
      {change !== null && (
        <div className={`metric-change ${change >= 0 ? 'positive' : 'negative'}`}>
          {change >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          <span>{Math.abs(change)}%</span>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="analytics-container">
        <div className="loading">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1>Analytics Dashboard</h1>
        <div className="analytics-controls">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="select-control"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <select 
            value={selectedUser} 
            onChange={(e) => setSelectedUser(e.target.value)}
            className="select-control"
          >
            <option value="all">All Users</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.first_name} {user.last_name}
              </option>
            ))}
          </select>
          <select 
            value={selectedClient} 
            onChange={(e) => setSelectedClient(e.target.value)}
            className="select-control"
          >
            <option value="all">All Clients</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        {renderMetricCard(
          'Total DMs Sent',
          analytics.totals.totalDms,
          'Direct messages sent',
          <MessageSquare size={24} />,
          analytics.comparisons.change?.dms
        )}
        {renderMetricCard(
          'Total Calls Booked',
          analytics.totals.totalCalls,
          'Calls successfully booked',
          <Phone size={24} />,
          analytics.comparisons.change?.calls
        )}
        {renderMetricCard(
          'Call Booking Rate',
          `${analytics.totals.callBookingRate}%`,
          'Calls booked ÷ DMs sent',
          <Target size={24} />,
          analytics.comparisons.change?.callBookingRate
        )}
        {renderMetricCard(
          'Response Rate',
          `${analytics.totals.responseRate}%`,
          'Replies ÷ DMs sent',
          <Users size={24} />,
          analytics.comparisons.change?.responseRate
        )}
        {renderMetricCard(
          'Follow-up to Booking Rate',
          `${analytics.totals.followUpToBookingRate}%`,
          'Calls booked per follow-up',
          <Activity size={24} />
        )}
        {renderMetricCard(
          'Total Follow-ups',
          analytics.totals.totalFollowups,
          'Follow-up messages sent',
          <Clock size={24} />
        )}
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-container">
          <h3>Daily Activity Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.daily}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalDms" fill="#3b82f6" name="DMs Sent" />
              <Bar dataKey="totalCalls" fill="#10b981" name="Calls Booked" />
              <Bar dataKey="totalReplies" fill="#f59e0b" name="Replies" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Response Rate Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.daily}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="responseRate" stroke="#3b82f6" name="Response Rate %" />
              <Line type="monotone" dataKey="callBookingRate" stroke="#10b981" name="Call Booking Rate %" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Weekly Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics.weekly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="totalDms" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="DMs" />
              <Area type="monotone" dataKey="totalCalls" stackId="1" stroke="#10b981" fill="#10b981" name="Calls" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Monthly Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.monthly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalDms" fill="#3b82f6" name="DMs" />
              <Bar dataKey="totalCalls" fill="#10b981" name="Calls" />
              <Bar dataKey="totalReplies" fill="#f59e0b" name="Replies" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Performers */}
      <div className="top-performers-section">
        <div className="top-performers-grid">
          <div className="top-performers-card">
            <h3><Star size={20} /> Top Days by Activity</h3>
            <div className="top-list">
              {analytics.topDays.map((day, index) => (
                <div key={day.fullDate} className="top-item">
                  <div className="rank">{index + 1}</div>
                  <div className="info">
                    <div className="date">{day.date}</div>
                    <div className="stats">
                      {day.totalDms} DMs • {day.totalCalls} Calls • {day.responseRate}% Response
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="top-performers-card">
            <h3><Star size={20} /> Top Days by Response Rate</h3>
            <div className="top-list">
              {analytics.topDates.map((day, index) => (
                <div key={day.fullDate} className="top-item">
                  <div className="rank">{index + 1}</div>
                  <div className="info">
                    <div className="date">{day.date}</div>
                    <div className="stats">
                      {day.responseRate}% Response Rate • {day.totalDms} DMs
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* This Week vs Last Week */}
      <div className="comparison-section">
        <h3>This Week vs Last Week</h3>
        <div className="comparison-grid">
          <div className="comparison-card">
            <h4>This Week</h4>
            <div className="comparison-stats">
              <div className="stat">
                <span>DMs Sent:</span>
                <span>{analytics.comparisons.thisWeek.totalDms}</span>
              </div>
              <div className="stat">
                <span>Calls Booked:</span>
                <span>{analytics.comparisons.thisWeek.totalCalls}</span>
              </div>
              <div className="stat">
                <span>Response Rate:</span>
                <span>{analytics.comparisons.thisWeek.responseRate}%</span>
              </div>
              <div className="stat">
                <span>Call Booking Rate:</span>
                <span>{analytics.comparisons.thisWeek.callBookingRate}%</span>
              </div>
            </div>
          </div>

          <div className="comparison-card">
            <h4>Last Week</h4>
            <div className="comparison-stats">
              <div className="stat">
                <span>DMs Sent:</span>
                <span>{analytics.comparisons.lastWeek.totalDms}</span>
              </div>
              <div className="stat">
                <span>Calls Booked:</span>
                <span>{analytics.comparisons.lastWeek.totalCalls}</span>
              </div>
              <div className="stat">
                <span>Response Rate:</span>
                <span>{analytics.comparisons.lastWeek.responseRate}%</span>
              </div>
              <div className="stat">
                <span>Call Booking Rate:</span>
                <span>{analytics.comparisons.lastWeek.callBookingRate}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
