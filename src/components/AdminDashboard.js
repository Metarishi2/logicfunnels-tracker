import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users,
  Building, 
  Edit, 
  Trash2, 
  UserPlus,
  Building2,
  Activity,
  Target
} from 'lucide-react';
import { supabase } from '../supabase';
import { useAuth } from '../hooks/useAuth';

function AdminDashboard() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showCreateClient, setShowCreateClient] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showDeleteUser, setShowDeleteUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [analytics, setAnalytics] = useState({
    totalActivities: 0,
    totalDms: 0,
    totalCalls: 0,
    totalReplies: 0,
    callBookingRate: 0,
    responseRate: 0
  });
  const [selectedClientFilter, setSelectedClientFilter] = useState('');

  // Form states
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'user',
    client_id: null
  });

  const [editUser, setEditUser] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: 'user',
    is_active: true
  });

  const [newClient, setNewClient] = useState({
    name: '',
    description: ''
  });

  const [showAssignUsers, setShowAssignUsers] = useState(false);
  const [assignClient, setAssignClient] = useState(null);
  const [assignUserIds, setAssignUserIds] = useState([]);
  const [assignLoading, setAssignLoading] = useState(false);

  useEffect(() => {
    console.log('🔍 AdminDashboard: Starting...');
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('🔍 Loading data...');
      setLoading(true);
      
      // Load users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (usersData) {
        setUsers(usersData);
        console.log('✅ Users loaded:', usersData.length);
      }

      // Load clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (clientsData) {
        setClients(clientsData);
        console.log('✅ Clients loaded:', clientsData.length);
      }

      // Load activities with user and client info
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('daily_activities')
        .select('*, users:users(id, first_name, last_name, email), clients:clients(id, name)')
        .order('submitted_at', { ascending: false })
        .limit(50);
      if (activitiesData) {
        setActivities(activitiesData);
        console.log('✅ Activities loaded:', activitiesData.length);
      }

      // Calculate analytics
      if (activitiesData) {
        const totalDms = activitiesData.reduce((sum, activity) => 
          sum + (activity.dms_sent || 0), 0);
        const totalCalls = activitiesData.reduce((sum, activity) => 
          sum + (activity.calls_booked || 0), 0);
        const totalReplies = activitiesData.reduce((sum, activity) => 
          sum + (activity.replies_received || 0), 0);
        const totalConnections = activitiesData.reduce((sum, activity) => 
          sum + (activity.connection_requests_sent || 0), 0);
        const totalComments = activitiesData.reduce((sum, activity) => 
          sum + (activity.comments_made || 0), 0);
        const totalFollowups = activitiesData.reduce((sum, activity) => 
          sum + (activity.followups_made || 0), 0);

        // Calculate total activities as sum of all activity types
        const totalActivities = totalDms + totalConnections + totalComments + totalFollowups + totalCalls + totalReplies;

        setAnalytics({
          totalActivities,
          totalDms,
          totalCalls,
          totalReplies,
          totalConnections,
          totalComments,
          totalFollowups,
          callBookingRate: totalActivities > 0 ? Math.round((totalCalls / totalActivities) * 100) : 0,
          responseRate: totalDms > 0 ? Math.round((totalReplies / totalDms) * 100) : 0
        });
      }

      console.log('✅ Data loading completed');
    } catch (error) {
      console.error('❌ Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          email: newUser.email,
          password_hash: newUser.password,
          first_name: newUser.first_name,
          last_name: newUser.last_name,
          role: newUser.role,
          is_active: true
        }])
        .select();

      if (error) throw error;
      
      setNewUser({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role: 'user',
        client_id: null
      });
      setShowCreateUser(false);
      loadData();
    } catch (error) {
      alert('Error creating user: ' + error.message);
    }
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('clients')
        .insert([newClient])
        .select();

      if (error) throw error;
      
      setNewClient({ name: '', description: '' });
      setShowCreateClient(false);
      loadData();
    } catch (error) {
      console.error('Error creating client:', error);
      alert('Error creating client');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      
      console.log('✅ User deleted successfully');
      loadData(); // Refresh data
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      alert('Failed to delete user: ' + error.message);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditUser({
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      is_active: user.is_active
    });
    setShowEditUser(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('users')
        .update({
          email: editUser.email,
          first_name: editUser.first_name,
          last_name: editUser.last_name,
          role: editUser.role,
          is_active: editUser.is_active
        })
        .eq('id', selectedUser.id);

      if (error) throw error;
      
      console.log('✅ User updated successfully');
      setShowEditUser(false);
      setSelectedUser(null);
      loadData(); // Refresh data
    } catch (error) {
      console.error('❌ Error updating user:', error);
      alert('Failed to update user: ' + error.message);
    }
  };

  const handleDeleteUserConfirm = async () => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', selectedUser.id);

      if (error) throw error;
      
      console.log('✅ User deleted successfully');
      setShowDeleteUser(false);
      setSelectedUser(null);
      loadData(); // Refresh data
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      alert('Failed to delete user: ' + error.message);
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;
    
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Error deleting client');
    }
  };

  // Open assign modal for a client
  const handleOpenAssignUsers = async (client) => {
    setAssignClient(client);
    setShowAssignUsers(true);
    // Load current assignments for this client
    const { data: assignments } = await supabase
      .from('user_client_assignments')
      .select('user_id')
      .eq('client_id', client.id);
    setAssignUserIds(assignments ? assignments.map(a => a.user_id) : []);
  };

  // Toggle user selection
  const handleToggleAssignUser = (userId) => {
    setAssignUserIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Save assignments
  const handleSaveAssignments = async () => {
    setAssignLoading(true);
    try {
      // Get current assignments from DB
      const { data: currentAssignments } = await supabase
        .from('user_client_assignments')
        .select('user_id')
        .eq('client_id', assignClient.id);
      const currentUserIds = currentAssignments ? currentAssignments.map(a => a.user_id) : [];
      // Find users to add and remove
      const toAdd = assignUserIds.filter(id => !currentUserIds.includes(id));
      const toRemove = currentUserIds.filter(id => !assignUserIds.includes(id));
      // Insert new assignments
      if (toAdd.length > 0) {
        await supabase.from('user_client_assignments').insert(
          toAdd.map(user_id => ({ user_id, client_id: assignClient.id }))
        );
      }
      // Remove unassigned
      if (toRemove.length > 0) {
        for (const user_id of toRemove) {
          await supabase.from('user_client_assignments')
            .delete()
            .eq('user_id', user_id)
            .eq('client_id', assignClient.id);
        }
      }
      setShowAssignUsers(false);
      setAssignClient(null);
      setAssignUserIds([]);
      loadData();
    } catch (error) {
      alert('Error saving assignments: ' + error.message);
    } finally {
      setAssignLoading(false);
    }
  };

  if (!isAdmin()) {
    return (
      <div className="container">
        <div className="error-message">
          <h2>Access Denied</h2>
          <p>This dashboard is only available to administrators.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        Loading admin dashboard...
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back, Administrator!</p>
        <p className="data-notice">📊 Showing all users' analytics and activities</p>
        
        <div className="dashboard-stats">
          <div className="stat-card">
            <Activity size={24} />
    <div>
              <h3>{analytics.totalActivities || 0}</h3>
              <p>Total Activities</p>
            </div>
          </div>
          <div className="stat-card">
            <BarChart3 size={24} />
            <div>
              <h3>{analytics.totalDms || 0}</h3>
              <p>Total DMs</p>
            </div>
          </div>
          <div className="stat-card">
            <Target size={24} />
            <div>
              <h3>{analytics.totalCalls || 0}</h3>
              <p>Total Calls</p>
            </div>
          </div>
          <div className="stat-card">
            <Users size={24} />
    <div>
              <h3>{users.length || 0}</h3>
              <p>Total Users</p>
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
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
          >
          <Users size={18} />
          Users
          </button>
          <button 
          className={`tab ${activeTab === 'clients' ? 'active' : ''}`}
          onClick={() => setActiveTab('clients')}
          >
          <Building size={18} />
          Clients
          </button>
          <button 
          className={`tab ${activeTab === 'activities' ? 'active' : ''}`}
          onClick={() => setActiveTab('activities')}
        >
          <Activity size={18} />
          Activities
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="analytics-grid">
              <div className="analytics-card">
                <h3>System Analytics</h3>
                <div className="analytics-stats">
                  <div className="stat">
                    <span>Total DMs:</span>
                    <span>{analytics.totalDms || 0}</span>
                  </div>
                  <div className="stat">
                    <span>Total Calls:</span>
                    <span>{analytics.totalCalls || 0}</span>
                  </div>
                  <div className="stat">
                    <span>Total Replies:</span>
                    <span>{analytics.totalReplies || 0}</span>
                  </div>
                  <div className="stat">
                    <span>Call Booking Rate:</span>
                    <span>{analytics.callBookingRate || 0}%</span>
                  </div>
                  <div className="stat">
                    <span>Response Rate:</span>
                    <span>{analytics.responseRate || 0}%</span>
                  </div>
                </div>
              </div>

              <div className="analytics-card">
                <h3>Recent Activities</h3>
                <div className="recent-activities">
                  {activities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="activity-item">
                      <div className="activity-client">
                        User Activity
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

        {activeTab === 'users' && (
          <div className="users-section">
            <div className="section-header">
              <h2>Manage Users</h2>
              <button 
                className="btn btn-primary" 
                onClick={() => setShowCreateUser(true)}
          >
            <UserPlus size={18} />
                Create User
          </button>
            </div>

            <div className="users-grid">
              {users.map(user => (
                <div key={user.id} className="user-card">
                  <div className="user-info">
                    <h4>{user.first_name} {user.last_name}</h4>
                    <p>{user.email}</p>
                    <span className={`role-badge ${user.role}`}>
                      {user.role}
                    </span>
                    <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="user-actions">
          <button 
                      className="btn btn-small btn-primary"
                      onClick={() => handleEditUser(user)}
                      title="Edit User"
          >
                      <Edit size={16} />
          </button>
          <button 
                      className="btn btn-small btn-danger"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowDeleteUser(true);
                      }}
                      title="Delete User"
                    >
                      <Trash2 size={16} />
          </button>
        </div>
      </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="clients-section">
            <div className="section-header">
              <h2>Manage Clients</h2>
              <button 
                className="btn btn-primary" 
                onClick={() => setShowCreateClient(true)}
              >
                <Building2 size={18} />
                Create Client
              </button>
            </div>

            <div className="clients-grid">
              {clients.map(client => (
                <div className="client-card" key={client.id}>
                  <div className="client-info">
                    <h4>{client.name}</h4>
                    <p>{client.description}</p>
                  </div>
                  <div className="client-actions">
                    <button className="btn btn-primary" onClick={() => handleOpenAssignUsers(client)}>
                      <Users size={16} /> Assign Users
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'activities' && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="client-filter" style={{ marginRight: 8 }}>Filter by Client:</label>
              <select id="client-filter" value={selectedClientFilter} onChange={e => setSelectedClientFilter(e.target.value)}>
                <option value="">All Clients</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>
            <table>
              <thead>
                <tr>
                  <th>User</th>
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
                {activities.filter(a => !selectedClientFilter || a.client_id === selectedClientFilter).map((activity) => (
                  <tr key={activity.id}>
                    <td>{activity.users ? `${activity.users.first_name} ${activity.users.last_name}` : activity.user_id}</td>
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
          )}
      </div>

      {/* Create User Modal */}
      {showCreateUser && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Create New User</h3>
            <form onSubmit={handleCreateUser}>
            <div className="form-group">
                <label>First Name</label>
              <input
                  type="text"
                  value={newUser.first_name}
                  onChange={(e) => setNewUser({...newUser, first_name: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
                <label>Last Name</label>
              <input
                  type="text"
                  value={newUser.last_name}
                  onChange={(e) => setNewUser({...newUser, last_name: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
                <label>Email</label>
              <input
                type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
                <label>Password</label>
              <input
                type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                required
              />
            </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">Create User</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateUser(false)}>
                Cancel
              </button>
            </div>
          </form>
          </div>
        </div>
      )}

      {/* Create Client Modal */}
      {showCreateClient && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Create New Client</h3>
            <form onSubmit={handleCreateClient}>
              <div className="form-group">
                <label>Client Name</label>
            <input
                  type="text"
                  value={newClient.name}
                  onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                  required
            />
          </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newClient.description}
                  onChange={(e) => setNewClient({...newClient, description: e.target.value})}
                required
            />
          </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">Create Client</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateClient(false)}>
                  Cancel
            </button>
          </div>
            </form>
        </div>
      </div>
      )}

      {/* Edit User Modal */}
      {showEditUser && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit User</h3>
            <form onSubmit={handleUpdateUser}>
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  value={editUser.first_name}
                  onChange={(e) => setEditUser({...editUser, first_name: e.target.value})}
                  required
                />
      </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  value={editUser.last_name}
                  onChange={(e) => setEditUser({...editUser, last_name: e.target.value})}
                  required
                />
      </div>
            <div className="form-group">
                <label>Email</label>
              <input
                  type="email"
                  value={editUser.email}
                  onChange={(e) => setEditUser({...editUser, email: e.target.value})}
                required
              />
      </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={editUser.role}
                  onChange={(e) => setEditUser({...editUser, role: e.target.value})}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={editUser.is_active}
                  onChange={(e) => setEditUser({...editUser, is_active: e.target.value === 'true'})}
                >
                  <option value={true}>Active</option>
                  <option value={false}>Inactive</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">Update User</button>
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setShowEditUser(false);
                  setSelectedUser(null);
                }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {showDeleteUser && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Delete User</h3>
            <div className="delete-confirmation">
              <p>Are you sure you want to delete this user?</p>
              <div className="user-details">
                <strong>Name:</strong> {selectedUser?.first_name} {selectedUser?.last_name}<br />
                <strong>Email:</strong> {selectedUser?.email}<br />
                <strong>Role:</strong> {selectedUser?.role}
              </div>
              <p className="warning-text">⚠️ This action cannot be undone. All user data will be permanently deleted.</p>
            </div>
            <div className="modal-actions">
              <button 
                type="button" 
                className="btn btn-danger"
                onClick={handleDeleteUserConfirm}
              >
                Delete User
              </button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => {
                  setShowDeleteUser(false);
                  setSelectedUser(null);
                }}
              >
                Cancel
              </button>
      </div>
          </div>
        </div>
      )}

      {/* Assign Users Modal */}
      {showAssignUsers && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Assign Users to {assignClient?.name}</h3>
            <p style={{ color: 'var(--neutral-600)', marginBottom: 10 }}>
              Uncheck a user to remove them from this client.
            </p>
            <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 20 }}>
              {users.map(user => (
                <div key={user.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                  <input
                    type="checkbox"
                    checked={assignUserIds.includes(user.id)}
                    onChange={() => handleToggleAssignUser(user.id)}
                    id={`assign-user-${user.id}`}
                  />
                  <label htmlFor={`assign-user-${user.id}`} style={{ marginLeft: 8 }}>
                    {user.first_name} {user.last_name} ({user.email})
                  </label>
                </div>
              ))}
        </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={handleSaveAssignments} disabled={assignLoading}>
                {assignLoading ? 'Saving...' : 'Save Assignments'}
              </button>
              <button className="btn btn-secondary" onClick={() => setShowAssignUsers(false)} disabled={assignLoading}>
                Cancel
              </button>
      </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard; 