import React, { useState, useEffect } from 'react';
import { Database, CheckCircle, XCircle, RefreshCw, Activity } from 'lucide-react';
import { supabase } from '../supabase';

function TestConnection() {
  const [status, setStatus] = useState('Testing connection...');
  const [tableExists, setTableExists] = useState(false);
  const [canInsert, setCanInsert] = useState(false);
  const [canRead, setCanRead] = useState(false);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setStatus('Testing Supabase connection...');
      
      // Test basic connection
      const { error } = await supabase
        .from('daily_activities_with_computed')
        .select('count')
        .limit(1);

      if (error) {
        console.error('Connection test error:', error);
        setStatus(`Connection failed: ${error.message}`);
        return;
      }

      setTableExists(true);
      setStatus('Connection successful! Table exists.');

      // Test insert permission
      const testData = {
        dms_sent: 1,
        connection_requests_sent: 1,
        comments_made: 1,
        replies_received: 1,
        followups_made: 1,
        calls_booked: null
      };

      const { data: insertData, error: insertError } = await supabase
        .from('daily_activities')
        .insert([testData])
        .select();

      if (insertError) {
        console.error('Insert test error:', insertError);
        setCanInsert(false);
        setStatus(`Insert failed: ${insertError.message}`);
      } else {
        setCanInsert(true);
        setStatus('Insert test successful!');
        
        // Clean up test data
        if (insertData && insertData[0]) {
          await supabase
            .from('daily_activities')
            .delete()
            .eq('id', insertData[0].id);
        }
      }

      // Test read permission
      const { error: readError } = await supabase
        .from('daily_activities_with_computed')
        .select('*')
        .limit(5);

      if (readError) {
        console.error('Read test error:', readError);
        setCanRead(false);
      } else {
        setCanRead(true);
      }

    } catch (error) {
      console.error('Test error:', error);
      setStatus(`Test failed: ${error.message}`);
    }
  };

  return (
    <div className="card">
      <div>
        <h2>
          <Database className="inline mr-3" />
          Database Connection Test
        </h2>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <p style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          marginBottom: '16px',
          fontWeight: '600',
          color: 'var(--neutral-700)'
        }}>
          <Activity size={16} />
          <strong>Status:</strong> {status}
        </p>
        
        <div style={{ display: 'grid', gap: '12px' }}>
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: tableExists ? 'var(--success-50)' : 'var(--error-50)',
              border: `1px solid ${tableExists ? 'var(--success-500)' : 'var(--error-500)'}`
            }}
          >
            {tableExists ? (
              <CheckCircle size={16} color="var(--success-600)" />
            ) : (
              <XCircle size={16} color="var(--error-600)" />
            )}
            <strong>Table exists:</strong> {tableExists ? '✅ Yes' : '❌ No'}
          </div>
          
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: canInsert ? 'var(--success-50)' : 'var(--error-50)',
              border: `1px solid ${canInsert ? 'var(--success-500)' : 'var(--error-500)'}`
            }}
          >
            {canInsert ? (
              <CheckCircle size={16} color="var(--success-600)" />
            ) : (
              <XCircle size={16} color="var(--error-600)" />
            )}
            <strong>Can insert:</strong> {canInsert ? '✅ Yes' : '❌ No'}
          </div>
          
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: canRead ? 'var(--success-50)' : 'var(--error-50)',
              border: `1px solid ${canRead ? 'var(--success-500)' : 'var(--error-500)'}`
            }}
          >
            {canRead ? (
              <CheckCircle size={16} color="var(--success-600)" />
            ) : (
              <XCircle size={16} color="var(--error-600)" />
            )}
            <strong>Can read:</strong> {canRead ? '✅ Yes' : '❌ No'}
          </div>
        </div>
      </div>
      
      <div>
        <button 
          onClick={testConnection} 
          className="btn"
        >
          <RefreshCw size={18} />
          Test Connection Again
        </button>
      </div>
    </div>
  );
}

export default TestConnection; 