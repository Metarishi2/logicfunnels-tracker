import React from 'react';
import { Shield, Users, MessageSquare } from 'lucide-react';

function AdminAccessMessage() {
  return (
    <div className="container">
      <div className="admin-access-message">
        <div className="message-icon">
          <Shield size={48} />
        </div>
        <h2>Admin Access Required</h2>
        <p>This feature is only available to administrators.</p>
        <div className="message-details">
          <div className="detail-item">
            <Users size={20} />
            <span>Contact your administrator to request access</span>
          </div>
          <div className="detail-item">
            <MessageSquare size={20} />
            <span>Only admins can view all analytics and manage users</span>
          </div>
        </div>
        <div className="message-actions">
          <p>As a regular user, you can:</p>
          <ul>
            <li>✅ Submit your daily activities</li>
            <li>✅ View your personal analytics</li>
            <li>✅ Access your assigned clients</li>
            <li>✅ See your live analytics</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AdminAccessMessage; 