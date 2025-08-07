import React, { useState, useEffect } from 'react';
import { Send, Activity, CheckCircle } from 'lucide-react';
import { supabase } from '../supabase';
import { useAuth } from '../hooks/useAuth';

function ActivityForm() {
  const { user, userProfile } = useAuth();
  const [formData, setFormData] = useState({
    dms_sent: '',
    connection_requests_sent: '',
    comments_made: '',
    replies_received: '',
    followups_made: '',
    calls_booked: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [userClients, setUserClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');

  useEffect(() => {
    loadUserClients();
  }, [user]);

  useEffect(() => {
    if (userClients.length > 0) {
      setSelectedClient(userClients[0].id);
    }
  }, [userClients]);

  const loadUserClients = async () => {
    try {
      const { data: assignments, error } = await supabase
        .from('user_client_assignments')
        .select('clients(*)')
        .eq('user_id', user?.id);

      if (assignments) {
        // Filter out nulls and deduplicate by client id
        const uniqueClients = [];
        const seen = new Set();
        for (const a of assignments) {
          const client = a.clients;
          if (client && client.id && !seen.has(client.id)) {
            uniqueClients.push(client);
            seen.add(client.id);
          }
        }
        setUserClients(uniqueClients);
      }
    } catch (error) {
      console.error('Error loading user clients:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsSuccess(false);

    try {
      const activityData = {
        dms_sent: parseInt(formData.dms_sent) || 0,
        connection_requests_sent: parseInt(formData.connection_requests_sent) || 0,
        comments_made: parseInt(formData.comments_made) || 0,
        replies_received: parseInt(formData.replies_received) || 0,
        followups_made: parseInt(formData.followups_made) || 0,
        calls_booked: parseInt(formData.calls_booked) || 0,
        user_id: user?.id,
        client_id: selectedClient || null,
        submitted_at: new Date().toISOString()
      };

      console.log('🔍 Submitting activity:', activityData);

      const { error } = await supabase
        .from('daily_activities')
        .insert([activityData]);

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }

      console.log('✅ Activity submitted successfully');

      setFormData({
        dms_sent: '',
        connection_requests_sent: '',
        comments_made: '',
        replies_received: '',
        followups_made: '',
        calls_booked: ''
      });
      setSelectedClient('');
      setIsSuccess(true);

      // Reset success message after 3 seconds
      setTimeout(() => setIsSuccess(false), 3000);

    } catch (error) {
      console.error('❌ Error submitting activity:', error);
      alert('Error submitting activity: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="activity-form">
      <div>
        <h2>
          <Activity className="inline mr-3" />
          Submit Daily Activity
        </h2>
        <p style={{ marginBottom: '20px', color: 'var(--neutral-600)' }}>
          Log your daily activities and track your performance.
        </p>
      </div>

      {isSuccess && (
        <div className="success-message">
          <CheckCircle size={16} className="inline mr-2" />
          Activity submitted successfully!
        </div>
      )}

      {userClients.length === 0 && (
        <div className="error" style={{ marginBottom: 16 }}>
          No client assigned. Please contact your admin to be assigned to a client.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="client">Client (Optional):</label>
          <select
            id="client"
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="form-control"
            disabled={userClients.length === 0}
          >
            <option value="">Select a client</option>
            {userClients.length === 0 ? (
              <option value="" disabled>No clients assigned</option>
            ) : (
              userClients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))
            )}
          </select>
          {/* Analytics will be filtered by selected client if chosen */}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="dms_sent">DMs Sent:</label>
            <input
              type="number"
              id="dms_sent"
              name="dms_sent"
              className="form-control"
              value={formData.dms_sent}
              onChange={handleInputChange}
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="connection_requests_sent">Connection Requests:</label>
            <input
              type="number"
              id="connection_requests_sent"
              name="connection_requests_sent"
              className="form-control"
              value={formData.connection_requests_sent}
              onChange={handleInputChange}
              min="0"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="comments_made">Comments Made:</label>
            <input
              type="number"
              id="comments_made"
              name="comments_made"
              className="form-control"
              value={formData.comments_made}
              onChange={handleInputChange}
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="replies_received">Replies Received:</label>
            <input
              type="number"
              id="replies_received"
              name="replies_received"
              className="form-control"
              value={formData.replies_received}
              onChange={handleInputChange}
              min="0"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="followups_made">Follow-ups Made:</label>
            <input
              type="number"
              id="followups_made"
              name="followups_made"
              className="form-control"
              value={formData.followups_made}
              onChange={handleInputChange}
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="calls_booked">Calls Booked:</label>
            <input
              type="number"
              id="calls_booked"
              name="calls_booked"
              className="form-control"
              value={formData.calls_booked}
              onChange={handleInputChange}
              min="0"
              required
            />
          </div>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={isSubmitting || userClients.length === 0}
          style={{ background: 'var(--primary-600)', color: 'var(--neutral-900)' }}
        >
          {isSubmitting ? (
            <>
              <div className="loading-spinner" style={{ width: '16px', height: '16px' }}></div>
              Submitting...
            </>
          ) : (
            <>
              <Send size={18} />
              Submit Activity
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default ActivityForm; 