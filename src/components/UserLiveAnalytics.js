import React, { useState, useEffect, useCallback } from 'react';
import { 
  TrendingUp, 
  RefreshCw,
  Zap,
  ExternalLink,
  Activity,
  Send,
  Target
} from 'lucide-react';
import { supabase } from '../supabase';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

function UserLiveAnalytics() {
  const { user, userProfile } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const fetchUserActivities = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch only user's own activities
      const { data, error } = await supabase
        .from('daily_activities')
        .select('*, clients(name)')
        .eq('user_id', user?.id)
        .order('submitted_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setActivities(data || []);
      setLastUpdate(new Date());
      console.log('Fetched user activities:', data?.length || 0);
    } catch (error) {
      console.error('Error fetching user activities:', error);
      setError('Failed to fetch activities: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Real-time subscription for user's activities only
  useEffect(() => {
    if (!realTimeEnabled || !user?.id) return;

    const subscription = supabase
      .channel('user_activities_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'daily_activities',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          console.log('User real-time update:', payload);
          fetchUserActivities(); // Refresh data on any change
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [realTimeEnabled, user?.id, fetchUserActivities]);

  // Initial data fetch
  useEffect(() => {
    if (!user?.id) return;
    fetchUserActivities();
  }, [fetchUserActivities, user?.id]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!realTimeEnabled || !user?.id) return;

    const interval = setInterval(() => {
      fetchUserActivities();
    }, 30000);

    return () => clearInterval(interval);
  }, [realTimeEnabled, user?.id, fetchUserActivities]);

  // Calculate user analytics
  const calculateAnalytics = () => {
    if (!activities || activities.length === 0) {
      return {
        totalDms: 0,
        totalCalls: 0,
        totalReplies: 0,
        totalConnections: 0,
        totalComments: 0,
        totalFollowups: 0,
        totalActivities: 0,
        callBookingRate: 0,
        responseRate: 0
      };
    }

    const totalDms = activities.reduce((sum, activity) => 
      sum + (activity.dms_sent || 0), 0);
    const totalCalls = activities.reduce((sum, activity) => 
      sum + (activity.calls_booked || 0), 0);
    const totalReplies = activities.reduce((sum, activity) => 
      sum + (activity.replies_received || 0), 0);
    const totalConnections = activities.reduce((sum, activity) => 
      sum + (activity.connection_requests_sent || 0), 0);
    const totalComments = activities.reduce((sum, activity) => 
      sum + (activity.comments_made || 0), 0);
    const totalFollowups = activities.reduce((sum, activity) => 
      sum + (activity.followups_made || 0), 0);

    const totalActivities = totalDms + totalConnections + totalComments + totalFollowups + totalCalls + totalReplies;

    return {
      totalDms,
      totalCalls,
      totalReplies,
      totalConnections,
      totalComments,
      totalFollowups,
      totalActivities,
      callBookingRate: totalDms > 0 ? Math.round((totalCalls / totalDms) * 100) : 0,
      responseRate: totalDms > 0 ? Math.round((totalReplies / totalDms) * 100) : 0
    };
  };

  const analytics = calculateAnalytics();

  // Prepare chart data
  const chartData = activities.slice(0, 7).reverse().map(activity => ({
    date: format(new Date(activity.submitted_at), 'MMM dd'),
    dms: activity.dms_sent || 0,
    calls: activity.calls_booked || 0,
    replies: activity.replies_received || 0
  }));

  // Generate Looker Studio data for user
  const generateLookerStudioData = () => {
    if (!activities || activities.length === 0) {
      alert('No data available to export');
      return;
    }

    const csvData = activities.map(activity => ({
      Date: format(new Date(activity.submitted_at), 'yyyy-MM-dd'),
      Client: activity.clients?.name || 'N/A',
      'DMs Sent': activity.dms_sent || 0,
      'Connection Requests': activity.connection_requests_sent || 0,
      'Comments Made': activity.comments_made || 0,
      'Replies Received': activity.replies_received || 0,
      'Follow-ups Made': activity.followups_made || 0,
      'Calls Booked': activity.calls_booked || 0,
      'Total Activities': (activity.dms_sent || 0) + (activity.connection_requests_sent || 0) + 
                        (activity.comments_made || 0) + (activity.followups_made || 0) + 
                        (activity.calls_booked || 0) + (activity.replies_received || 0)
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my_activity_data_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (!user) {
    return (
      <div className="container">
        <div className="error-message">
          <h2>Please Login</h2>
          <p>You need to login to view your live analytics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="realtime-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>
            <Zap size={24} />
            My Live Analytics
          </h1>
          <p>Real-time analytics for {userProfile?.first_name || user.email}</p>
          <p className="data-notice">📊 Showing your personal data only - not all users' data</p>
        </div>
        
        <div className="header-controls">
          <div className="real-time-status">
            <div className={`status-indicator ${realTimeEnabled ? 'active' : 'inactive'}`}>
              <div className="status-dot"></div>
              {realTimeEnabled ? 'Live' : 'Paused'}
            </div>
            <button 
              onClick={() => setRealTimeEnabled(!realTimeEnabled)}
              className="btn btn-secondary"
            >
              <RefreshCw size={16} />
              {realTimeEnabled ? 'Pause' : 'Resume'}
            </button>
          </div>
          
          <div className="last-update">
            Last updated: {format(lastUpdate, 'HH:mm:ss')}
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="loading">
          <div className="loading-spinner"></div>
          Loading your analytics...
        </div>
      ) : (
        <div className="dashboard-content">
          {/* Analytics Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <Send size={24} />
              </div>
              <div className="stat-content">
                <h3>{analytics.totalDms.toLocaleString()}</h3>
                <p>Total DMs Sent</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <Target size={24} />
              </div>
              <div className="stat-content">
                <h3>{analytics.totalCalls.toLocaleString()}</h3>
                <p>Total Calls Booked</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <Activity size={24} />
              </div>
              <div className="stat-content">
                <h3>{analytics.totalActivities.toLocaleString()}</h3>
                <p>Total Activities</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <TrendingUp size={24} />
              </div>
              <div className="stat-content">
                <h3>{analytics.callBookingRate}%</h3>
                <p>Booking Rate</p>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="charts-section">
            <div className="chart-container">
              <h3>Your Activity Trends (Last 7 Days)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="dms" stroke="#8884d8" name="DMs" />
                  <Line type="monotone" dataKey="calls" stroke="#82ca9d" name="Calls" />
                  <Line type="monotone" dataKey="replies" stroke="#ffc658" name="Replies" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Looker Studio Integration */}
          <div className="looker-studio-section">
            <div className="looker-studio-card">
              <h3>
                <ExternalLink size={20} />
                Looker Studio Integration
              </h3>
              <p>Export your personal data for Looker Studio visualization and advanced analytics.</p>
              
              <div className="looker-actions">
                <button 
                  onClick={generateLookerStudioData}
                  className="btn btn-primary"
                  disabled={!activities || activities.length === 0}
                >
                  <ExternalLink size={16} />
                  Export for Looker Studio
                </button>
                
                <a 
                  href="https://lookerstudio.google.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                >
                  Open Looker Studio
                </a>
              </div>
              
              <div className="looker-setup">
                <h4>Looker Studio Setup:</h4>
                <ol>
                  <li>Click "Export for Looker Studio" to download your CSV data</li>
                  <li>Go to <a href="https://lookerstudio.google.com/" target="_blank" rel="noopener noreferrer">Looker Studio</a></li>
                  <li>Create a new report</li>
                  <li>Add data source → Upload the CSV file</li>
                  <li>Create visualizations and dashboards with your personal data</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="recent-activities">
            <h3>Recent Activities</h3>
            <div className="activities-list">
              {activities.slice(0, 10).map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-client">
                    {activity.clients?.name || 'N/A'}
                  </div>
                  <div className="activity-stats">
                    <span>DMs: {activity.dms_sent}</span>
                    <span>Calls: {activity.calls_booked || 0}</span>
                    <span>Replies: {activity.replies_received}</span>
                  </div>
                  <div className="activity-date">
                    {format(new Date(activity.submitted_at), 'MMM dd, HH:mm')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserLiveAnalytics; 