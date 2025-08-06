import React from 'react';
import { ExternalLink } from 'lucide-react';

function LookerStudioIntegration({ onExport, showSetup = false }) {
  return (
    <div className="card" style={{ marginBottom: '20px' }}>
      <h3>
        <ExternalLink className="inline mr-3" />
        Looker Studio Integration
      </h3>
      <p style={{ marginBottom: '16px', color: 'var(--neutral-600)' }}>
        Export data for Looker Studio visualization and advanced analytics.
      </p>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button 
          onClick={onExport} 
          className="btn"
        >
          <ExternalLink size={18} />
          Export for Looker Studio
        </button>
        <a 
          href="https://lookerstudio.google.com/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn btn-secondary"
        >
          <ExternalLink size={18} />
          Open Looker Studio
        </a>
      </div>
      
      {showSetup && (
        <div style={{ 
          marginTop: '16px', 
          padding: '12px', 
          backgroundColor: 'var(--neutral-50)', 
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--neutral-200)'
        }}>
          <h4 style={{ marginBottom: '8px', color: 'var(--neutral-700)' }}>Looker Studio Setup:</h4>
          <ol style={{ 
            marginLeft: '20px', 
            color: 'var(--neutral-600)',
            lineHeight: '1.6'
          }}>
            <li>Click "Export for Looker Studio" to download CSV data</li>
            <li>Go to <a href="https://lookerstudio.google.com/" target="_blank" rel="noopener noreferrer">Looker Studio</a></li>
            <li>Create a new report</li>
            <li>Add data source → Upload the CSV file</li>
            <li>Create visualizations and dashboards</li>
          </ol>
        </div>
      )}
    </div>
  );
}

export default LookerStudioIntegration; 