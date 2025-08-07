import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart3, 
  Activity, 
  Target, 
  TrendingUp, 
  Send,
  Building
} from 'lucide-react';
import { supabase } from '../supabase';
import { useAuth } from '../hooks/useAuth';
import ActivityForm from './ActivityForm';

function UserDashboard() {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userAnalytics, setUserAnalytics] = useState({});
  const [userActivities, setUserActivities] = useState([]);
  const [userClients, setUserClients] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  const loadUserData = useCallback(async () => {
    try {
      console.log('🔍 Loading user data for user ID:', user?.id);
      console.log('🔍 User object:', user);
      setLoading(true);
      
      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.log('⚠️ Loading timeout - forcing completion');
        setLoading(false);
      }, 10000); // 10 second timeout
      
      // Load user's own activities
      const { data: activities, error: activitiesError } = await supabase
        .from('daily_activities')
        .select('*, clients(name)')
        .eq('user_id', user?.id)
        .order('submitted_at', { ascending: false })
        .limit(20);

      console.log('🔍 Activities query result:', { 
        activities, 
        activitiesError, 
        user_id_filter: user?.id,
        activities_count: activities?.length || 0
      });

      if (activitiesError) {
        console.error('❌ Activities error:', activitiesError);
      } else {
        setUserActivities(activities || []);
        console.log('✅ Activities loaded:', activities?.length || 0);
        
        // Log first few activities to verify they belong to this user
        if (activities && activities.length > 0) {
          console.log('🔍 First 3 activities user_id check:', activities.slice(0, 3).map(a => ({
            id: a.id,
            user_id: a.user_id,
            dms_sent: a.dms_sent,
            submitted_at: a.submitted_at
          })));
        }
      }

      // Load user's assigned clients
      const { data: clients, error: clientsError } = await supabase
        .from('user_client_assignments')
        .select('clients(*)')
        .eq('user_id', user?.id);

      console.log('🔍 Clients query result:', { 
        clients, 
        clientsError, 
        user_id_filter: user?.id,
        clients_count: clients?.length || 0
      });

      if (clientsError) {
        console.error('❌ Clients error:', clientsError);
      } else {
        setUserClients(clients?.map(c => c.clients) || []);
        console.log('✅ Clients loaded:', clients?.length || 0);
      }

      // Calculate user analytics
      if (activities) {
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

        // Calculate total activities as sum of all activity types
        const totalActivities = totalDms + totalConnections + totalComments + totalFollowups + totalCalls + totalReplies;

        const analytics = {
          totalActivities,
          totalDms,
          totalCalls,
          totalReplies,
          totalConnections,
          totalComments,
          totalFollowups,
          callBookingRate: totalDms > 0 ? Math.round((totalCalls / totalDms) * 100) : 0,
          responseRate: totalDms > 0 ? Math.round((totalReplies / totalDms) * 100) : 0
        };

        setUserAnalytics(analytics);
        console.log('✅ Analytics calculated:', analytics);
      }

      clearTimeout(timeoutId);

    } catch (error) {
      console.error('❌ Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    console.log('🔍 UserDashboard: Starting...');
    console.log('🔍 User:', user);
    
    if (!user) {
      console.log('❌ No user found');
      return;
    }
    
    loadUserData();
  }, [user, loadUserData]);

  if (!user) {
    return (
      <div className="container">
        <div className="error-message">
          <h2>Please Login</h2>
          <p>You need to login to access your dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        Loading your dashboard...
      </div>
    );
  }

  return (
    <div className="user-dashboard">
      <div className="dashboard-header">
        <h1>My Dashboard</h1>
        <p>Welcome back, {userProfile?.first_name || user?.email}!</p>
        <p className="data-notice">📊 Showing your personal analytics and activities only</p>
        
        <div className="dashboard-stats">
          <div className="stat-card">
            <Activity size={24} />
            <div>
              <h3>{userAnalytics.totalActivities || 0}</h3>
              <p>Total Activities</p>
            </div>
          </div>
          <div className="stat-card">
            <Send size={24} />
            <div>
              <h3>{userAnalytics.totalDms || 0}</h3>
              <p>DMs Sent</p>
            </div>
          </div>
          <div className="stat-card">
            <Target size={24} />
            <div>
              <h3>{userAnalytics.totalCalls || 0}</h3>
              <p>Calls Booked</p>
            </div>
          </div>
          <div className="stat-card">
            <TrendingUp size={24} />
            <div>
              <h3>{userAnalytics.callBookingRate || 0}%</h3>
              <p>Booking Rate</p>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <BarChart3 size={18} />
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'activities' ? 'active' : ''}`}
          onClick={() => setActiveTab('activities')}
        >
          <Activity size={18} />
          My Activities
        </button>
        <button 
          className={`tab ${activeTab === 'clients' ? 'active' : ''}`}
          onClick={() => setActiveTab('clients')}
        >
          <Building size={18} />
          My Clients
        </button>
        <button 
          className={`tab ${activeTab === 'submit' ? 'active' : ''}`}
          onClick={() => setActiveTab('submit')}
        >
          <Send size={18} />
          Submit Activity
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="analytics-grid">
              <div className="analytics-card">
                <h3>My Performance</h3>
                <div className="analytics-stats">
                  <div className="stat">
                    <span>Total DMs:</span>
                    <span>{userAnalytics.totalDms || 0}</span>
                  </div>
                  <div className="stat">
                    <span>Total Calls:</span>
                    <span>{userAnalytics.totalCalls || 0}</span>
                  </div>
                  <div className="stat">
                    <span>Total Replies:</span>
                    <span>{userAnalytics.totalReplies || 0}</span>
                  </div>
                  <div className="stat">
                    <span>Call Booking Rate:</span>
                    <span>{userAnalytics.callBookingRate || 0}%</span>
                  </div>
                  <div className="stat">
                    <span>Response Rate:</span>
                    <span>{userAnalytics.responseRate || 0}%</span>
                  </div>
                </div>
              </div>

              <div className="analytics-card">
                <h3>Recent Activities</h3>
                <div className="recent-activities">
                  {userActivities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="activity-item">
                      <div className="activity-client">
                        {activity.clients?.name || 'N/A'}
                      </div>
                      <div className="activity-stats">
                        <span>DMs: {activity.dms_sent}</span>
                        <span>Calls: {activity.calls_booked || 0}</span>
                      </div>
                      <div className="activity-date">
                        {new Date(activity.submitted_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activities' && (
          <div className="activities-section">
            <h2>My Activities</h2>
            <div className="activities-table">
              <table>
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>DMs</th>
                    <th>Connections</th>
                    <th>Comments</th>
                    <th>Followups</th>
                    <th>Calls</th>
                    <th>Replies</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {userActivities.map((activity) => (
                    <tr key={activity.id}>
                      <td>{activity.clients?.name || 'N/A'}</td>
                      <td>{activity.dms_sent}</td>
                      <td>{activity.connection_requests_sent}</td>
                      <td>{activity.comments_made}</td>
                      <td>{activity.followups_made}</td>
                      <td>{activity.calls_booked || 0}</td>
                      <td>{activity.replies_received}</td>
                      <td>{new Date(activity.submitted_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="clients-section">
            <h2>My Assigned Clients</h2>
            <div className="clients-grid">
              {userClients.map(client => (
                <div key={client.id} className="client-card">
                  <div className="client-info">
                    <h4>{client.name}</h4>
                    <p>{client.description}</p>
                  </div>
                  <div className="client-actions">
                    <button 
                      className="btn btn-primary"
                      onClick={() => setActiveTab('submit')}
                    >
                      Submit Activity
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'submit' && (
          <div className="submit-section">
            <h2>Submit Daily Activity</h2>
            <ActivityForm />
          </div>
        )}
      </div>
    </div>
  );
}

export default UserDashboard; 