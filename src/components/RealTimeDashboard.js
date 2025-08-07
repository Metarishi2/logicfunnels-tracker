import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  RefreshCw,
  Zap,
  ExternalLink
} from 'lucide-react';
import RealTimeStatus from './shared/RealTimeStatus';
import LookerStudioIntegration from './shared/LookerStudioIntegration';
import StatsGrid from './shared/StatsGrid';
import AdminAccessMessage from './AdminAccessMessage';
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

function RealTimeDashboard() {
  const { isAdmin } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters] = useState({
    dateFrom: '',
    dateTo: '',
    week: ''
  });
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
    }, 30000);

    return () => clearInterval(interval);
  }, [realTimeEnabled, fetchActivities]);

  // Admin-only access check (after all hooks)
  if (!isAdmin()) {
    return <AdminAccessMessage />;
  }

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
    followups_made: 0,
    calls_booked: 0
  });

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
             (activity.replies_received || 0) + (activity.followups_made || 0),
      dms_sent: activity.dms_sent || 0,
      comments_made: activity.comments_made || 0,
      replies_received: activity.replies_received || 0,
      followups_made: activity.followups_made || 0,
      calls_booked: activity.calls_booked || 0
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const generateLookerStudioData = () => {
    // Create a CSV file optimized for Looker Studio
    const csvData = activities.map(activity => ({
      date: format(new Date(activity.submitted_at), 'yyyy-MM-dd'),
      day_of_week: format(new Date(activity.submitted_at), 'EEEE'),
      month: format(new Date(activity.submitted_at), 'MMMM'),
      year: format(new Date(activity.submitted_at), 'yyyy'),
      dms_sent: activity.dms_sent,
      comments_made: activity.comments_made,
      replies_received: activity.replies_received,
      followups_made: activity.followups_made,
      calls_booked: activity.calls_booked || 0,
      total_activities: (activity.dms_sent || 0) + (activity.comments_made || 0) + 
                       (activity.replies_received || 0) + (activity.followups_made || 0)
    }));

    const csvContent = [
      'date,day_of_week,month,year,dms_sent,comments_made,replies_received,followups_made,calls_booked,total_activities',
      ...csvData.map(row => 
        `${row.date},${row.day_of_week},${row.month},${row.year},${row.dms_sent},${row.comments_made},${row.replies_received},${row.followups_made},${row.calls_booked},${row.total_activities}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `looker-studio-data-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        Loading real-time dashboard...
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
            onClick={generateLookerStudioData} 
            className="btn"
          >
            <ExternalLink size={18} />
            Export for Looker Studio
          </button>
        </div>
      </div>

      {/* Real-time Status */}
      <RealTimeStatus realTimeEnabled={realTimeEnabled} lastUpdate={lastUpdate} />

      {/* Looker Studio Integration */}
      <LookerStudioIntegration onExport={generateLookerStudioData} showSetup={true} />

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
    </div>
  );
}

export default RealTimeDashboard; 