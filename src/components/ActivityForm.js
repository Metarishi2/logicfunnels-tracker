import React, { useState } from 'react';
import { Send, CheckCircle, AlertCircle, Activity, MessageSquare, Calendar, Phone, Reply, UserPlus } from 'lucide-react';
import { supabase } from '../supabase';

function ActivityForm() {
  const [formData, setFormData] = useState({
    dms_sent: '',
    connection_requests_sent: '',
    comments_made: '',
    followups_made: '',
    calls_booked: '',
    replies_received: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Only allow positive integers or empty string
    if (value === '' || (/^\d+$/.test(value) && parseInt(value) >= 0)) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    // Validate required fields
    const requiredFields = ['dms_sent', 'connection_requests_sent', 'comments_made', 'followups_made', 'replies_received'];
    const missingFields = requiredFields.filter(field => !formData[field] || formData[field] === '');
    
    if (missingFields.length > 0) {
      setMessage(`Please fill in all required fields: ${missingFields.join(', ')}`);
      setMessageType('error');
      setIsSubmitting(false);
      return;
    }

    try {
      const submissionData = {
        dms_sent: parseInt(formData.dms_sent),
        connection_requests_sent: parseInt(formData.connection_requests_sent),
        comments_made: parseInt(formData.comments_made),
        followups_made: parseInt(formData.followups_made),
        calls_booked: formData.calls_booked ? parseInt(formData.calls_booked) : null,
        replies_received: parseInt(formData.replies_received)
      };

      const { error } = await supabase
        .from('daily_activities')
        .insert([submissionData]);

      if (error) throw error;

      setMessage('Activity submitted successfully!');
      setMessageType('success');
      
      // Reset form
      setFormData({
        dms_sent: '',
        connection_requests_sent: '',
        comments_made: '',
        followups_made: '',
        calls_booked: '',
        replies_received: ''
      });

      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);

    } catch (error) {
      console.error('Error submitting activity:', error);
      setMessage('Failed to submit activity: ' + error.message);
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card">
      <div>
        <h2>
          <Activity className="inline mr-3" />
          Daily Activity Submission
        </h2>
        <p style={{ marginBottom: '20px', color: 'var(--neutral-600)' }}>
          Track your daily networking and outreach activities. All fields marked with * are required.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="dms_sent">
              
              Number of DMs Sent *
            </label>
            <input
              type="number"
              id="dms_sent"
              name="dms_sent"
              className="form-control"
              value={formData.dms_sent}
              onChange={handleInputChange}
              placeholder="0"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="connection_requests_sent">
              
              Number of Connection Requests Sent *
            </label>
            <input
              type="number"
              id="connection_requests_sent"
              name="connection_requests_sent"
              className="form-control"
              value={formData.connection_requests_sent}
              onChange={handleInputChange}
              placeholder="0"
              min="0"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="comments_made">
              
              Number of Comments Made *
            </label>
            <input
              type="number"
              id="comments_made"
              name="comments_made"
              className="form-control"
              value={formData.comments_made}
              onChange={handleInputChange}
              placeholder="0"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="followups_made">
              
              Number of Follow-ups Made *
            </label>
            <input
              type="number"
              id="followups_made"
              name="followups_made"
              className="form-control"
              value={formData.followups_made}
              onChange={handleInputChange}
              placeholder="0"
              min="0"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="calls_booked">
          
              Number of Calls Booked
            </label>
            <input
              type="number"
              id="calls_booked"
              name="calls_booked"
              className="form-control"
              value={formData.calls_booked}
              onChange={handleInputChange}
              placeholder="0 (optional)"
              min="0"
            />
            <small style={{ color: 'var(--neutral-500)', fontSize: '12px' }}>
              Optional - Leave blank if no calls were booked
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="replies_received">
       
              Number of Replies Received *
            </label>
            <input
              type="number"
              id="replies_received"
              name="replies_received"
              className="form-control"
              value={formData.replies_received}
              onChange={handleInputChange}
              placeholder="0"
              min="0"
              required
            />
          </div>
        </div>

        {message && (
          <div className={`${messageType === 'success' ? 'success' : 'error'}`}>
            {messageType === 'success' ? (
              <CheckCircle size={16} className="inline mr-2" />
            ) : (
              <AlertCircle size={16} className="inline mr-2" />
            )}
            {message}
          </div>
        )}

        <button 
          type="submit" 
          className="btn" 
          disabled={isSubmitting}
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
          <Activity size={16} />
          Activity Tracking Guide:
        </h4>
        <ul style={{ 
          marginLeft: '20px', 
          marginTop: '10px',
          color: 'var(--neutral-600)',
          lineHeight: '1.8'
        }}>
          <li><strong>DMs Sent:</strong> Direct messages sent to prospects</li>
          <li><strong>Connection Requests:</strong> LinkedIn/Facebook connection requests</li>
          <li><strong>Comments Made:</strong> Comments on posts and content</li>
          <li><strong>Follow-ups Made:</strong> Follow-up messages or calls</li>
          <li><strong>Calls Booked:</strong> Actual calls scheduled (optional)</li>
          <li><strong>Replies Received:</strong> Responses from prospects</li>
        </ul>
      </div>
    </div>
  );
}

export default ActivityForm; 