import React, { useState } from 'react';
import { Database, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../supabase';

function TestConnection() {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const runTests = async () => {
    setIsLoading(true);
    setTestResults([]);

    const results = [];

    try {
      // Test 1: Check if users table exists
      console.log('🔍 Testing users table...');
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .limit(1);

      if (usersError) {
        results.push({ test: 'Users Table', status: 'FAILED', error: usersError.message });
      } else {
        results.push({ test: 'Users Table', status: 'PASSED', data: `Found ${users?.length || 0} users` });
      }

      // Test 2: Check if admin user exists
      console.log('🔍 Testing admin user...');
      const { data: adminUser, error: adminError } = await supabase
        .from('users')
        .select('*')
        .eq('email', 'admin@example.com')
        .single();

      if (adminError) {
        results.push({ test: 'Admin User', status: 'FAILED', error: adminError.message });
      } else if (!adminUser) {
        results.push({ test: 'Admin User', status: 'FAILED', error: 'Admin user not found' });
      } else {
        results.push({ 
          test: 'Admin User', 
          status: 'PASSED', 
          data: `Found admin: ${adminUser.email} (${adminUser.role})` 
        });
      }

      // Test 3: Test login credentials
      console.log('🔍 Testing login credentials...');
      const { data: loginTest, error: loginError } = await supabase
        .from('users')
        .select('*')
        .eq('email', 'admin@example.com')
        .eq('password_hash', 'admin123')
        .eq('is_active', true)
        .single();

      if (loginError) {
        results.push({ test: 'Login Credentials', status: 'FAILED', error: loginError.message });
      } else if (!loginTest) {
        results.push({ test: 'Login Credentials', status: 'FAILED', error: 'Login credentials not found' });
      } else {
        results.push({ 
          test: 'Login Credentials', 
          status: 'PASSED', 
          data: `Login works for: ${loginTest.email}` 
        });
      }

      // Test 4: Check clients table
      console.log('🔍 Testing clients table...');
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .limit(1);

      if (clientsError) {
        results.push({ test: 'Clients Table', status: 'FAILED', error: clientsError.message });
      } else {
        results.push({ test: 'Clients Table', status: 'PASSED', data: `Found ${clients?.length || 0} clients` });
      }

      // Test 5: Check daily_activities table
      console.log('🔍 Testing daily_activities table...');
      const { data: activities, error: activitiesError } = await supabase
        .from('daily_activities')
        .select('*')
        .limit(1);

      if (activitiesError) {
        results.push({ test: 'Daily Activities Table', status: 'FAILED', error: activitiesError.message });
      } else {
        results.push({ test: 'Daily Activities Table', status: 'PASSED', data: `Found ${activities?.length || 0} activities` });
      }

    } catch (error) {
      results.push({ test: 'General', status: 'FAILED', error: error.message });
    }

    setTestResults(results);
    setIsLoading(false);
  };

  return (
    <div className="card">
      <div>
        <h2>
          <Database className="inline mr-3" />
          Database Connection Test
        </h2>
        <p style={{ marginBottom: '20px', color: 'var(--neutral-600)' }}>
          Test your database connection and verify the admin user exists.
        </p>
      </div>

      <button 
        onClick={runTests} 
        className="btn btn-primary" 
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <div className="loading-spinner" style={{ width: '16px', height: '16px' }}></div>
            Running Tests...
          </>
        ) : (
          <>
            <Database size={18} />
            Run Database Tests
          </>
        )}
      </button>

      {testResults.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>Test Results:</h3>
          {testResults.map((result, index) => (
            <div 
              key={index} 
              style={{ 
                padding: '10px', 
                margin: '10px 0', 
                borderRadius: 'var(--radius-md)',
                border: '1px solid',
                backgroundColor: result.status === 'PASSED' ? 'var(--success-50)' : 'var(--error-50)',
                borderColor: result.status === 'PASSED' ? 'var(--success-200)' : 'var(--error-200)',
                color: result.status === 'PASSED' ? 'var(--success-700)' : 'var(--error-700)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                {result.status === 'PASSED' ? (
                  <CheckCircle size={16} />
                ) : (
                  <AlertCircle size={16} />
                )}
                <strong>{result.test}</strong>: {result.status}
              </div>
              {result.data && <div style={{ marginLeft: '24px' }}>{result.data}</div>}
              {result.error && <div style={{ marginLeft: '24px', color: 'var(--error-600)' }}>{result.error}</div>}
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: 'var(--neutral-50)', borderRadius: 'var(--radius-md)' }}>
        <h4>What to do if tests fail:</h4>
        <ol style={{ marginLeft: '20px', lineHeight: '1.6' }}>
          <li>Run the <code>simple_admin_setup.sql</code> script in your Supabase SQL Editor</li>
          <li>Check your Supabase credentials in the <code>.env</code> file</li>
          <li>Make sure your app is connected to the right Supabase project</li>
          <li>After running the SQL script, try logging in with: <strong>admin@example.com</strong> / <strong>admin123</strong></li>
        </ol>
      </div>
    </div>
  );
}

export default TestConnection; 