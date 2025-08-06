import React from 'react';
import { 
  MessageSquare, 
  Reply, 
  Activity, 
  Phone, 
  Users, 
  TrendingUp 
} from 'lucide-react';

function StatsGrid({ activities, totals }) {
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <h3>
          <MessageSquare size={20} className="inline mr-2" />
          Total DMs Sent
        </h3>
        <div className="value">{totals.dms_sent.toLocaleString()}</div>
        <div className="trend">
          <TrendingUp size={14} />
          +12% from last week
        </div>
      </div>
      
      <div className="stat-card">
        <h3>
          <MessageSquare size={20} className="inline mr-2" />
          Total Comments Made
        </h3>
        <div className="value">{totals.comments_made.toLocaleString()}</div>
        <div className="trend">
          <TrendingUp size={14} />
          +8% from last week
        </div>
      </div>
      
      <div className="stat-card">
        <h3>
          <Reply size={20} className="inline mr-2" />
          Total Replies Received
        </h3>
        <div className="value">{totals.replies_received.toLocaleString()}</div>
        <div className="trend">
          <TrendingUp size={14} />
          +15% from last week
        </div>
      </div>
      
              <div className="stat-card">
          <h3>
            <Activity size={20} className="inline mr-2" />
            Total Follow-ups Made
          </h3>
          <div className="value">{(totals.followups_made || totals.followups_scheduled || 0).toLocaleString()}</div>
          <div className="trend">
            <TrendingUp size={14} />
            +5% from last week
          </div>
        </div>
      
      <div className="stat-card">
        <h3>
          <Phone size={20} className="inline mr-2" />
          Total Calls Booked
        </h3>
        <div className="value">{totals.calls_booked.toLocaleString()}</div>
        <div className="trend">
          <TrendingUp size={14} />
          +20% from last week
        </div>
      </div>
      
      <div className="stat-card">
        <h3>
          <Users size={20} className="inline mr-2" />
          Total Submissions
        </h3>
        <div className="value">{activities.length.toLocaleString()}</div>
        <div className="trend">
          <Activity size={14} />
          {activities.length} entries
        </div>
      </div>
    </div>
  );
}

export default StatsGrid; 