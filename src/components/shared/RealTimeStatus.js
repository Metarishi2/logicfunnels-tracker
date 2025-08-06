import React from 'react';
import { format } from 'date-fns';

function RealTimeStatus({ realTimeEnabled, lastUpdate }) {
  if (!realTimeEnabled) return null;

  return (
    <div className="card" style={{ marginBottom: '20px', backgroundColor: 'var(--success-50)', border: '1px solid var(--success-500)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ 
          width: '8px', 
          height: '8px', 
          borderRadius: '50%', 
          backgroundColor: 'var(--success-500)',
          animation: 'pulse 2s infinite'
        }}></div>
        <span style={{ color: 'var(--success-700)', fontWeight: '600' }}>
          Live Updates Enabled
        </span>
        <span style={{ color: 'var(--success-600)', fontSize: '14px' }}>
          Last updated: {format(lastUpdate, 'HH:mm:ss')}
        </span>
      </div>
    </div>
  );
}

export default RealTimeStatus; 