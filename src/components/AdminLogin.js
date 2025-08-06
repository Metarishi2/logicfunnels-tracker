import React, { useState } from 'react';
import { Shield, Mail, Lock, AlertCircle, Database, Key, Zap } from 'lucide-react';
import { supabase } from '../supabase';

function AdminLogin({ onSignIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (result.error) throw result.error;

      // Call the onSignIn callback if provided
      if (onSignIn) {
        onSignIn(result.data.user);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const quickAccess = () => {
    setEmail('admin@example.com');
    setPassword('admin123');
  };

  return (
    <div className="card">
      <div>
        <h2>
          <Shield className="inline mr-3" />
          Admin Login
        </h2>
        <p style={{ marginBottom: '20px', color: 'var(--neutral-600)' }}>
          Enter your admin credentials to access the dashboard.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">
            <Mail size={16} className="inline mr-2" />
            Email
          </label>
          <input
            type="email"
            id="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">
            <Lock size={16} className="inline mr-2" />
            Password
          </label>
          <input
            type="password"
            id="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>

        {error && (
          <div className="error">
            <AlertCircle size={16} className="inline mr-2" />
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button 
            type="submit" 
            className="btn" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="loading-spinner" style={{ width: '16px', height: '16px' }}></div>
                Signing in...
              </>
            ) : (
              <>
                <Shield size={18} />
                Sign In
              </>
            )}
          </button>
          
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={quickAccess}
          >
            <Zap size={18} />
            Quick Access
          </button>
        </div>
      </form>

      <div 
        style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: 'var(--success-50)', 
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--success-500)'
        }}
      >
        <h4 style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          marginBottom: '10px',
          color: 'var(--success-700)'
        }}>
          <Key size={16} />
          Quick Access (Default Admin):
        </h4>
        <div style={{ 
          marginLeft: '20px', 
          marginTop: '10px',
          color: 'var(--success-600)',
          lineHeight: '1.8'
        }}>
          <p><strong>Email:</strong> admin@example.com</p>
          <p><strong>Password:</strong> admin123</p>
        </div>
      </div>

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
          <Database size={16} />
          Supabase Admin Setup Instructions:
        </h4>
        <ol style={{ 
          marginLeft: '20px', 
          marginTop: '10px',
          color: 'var(--neutral-600)',
          lineHeight: '1.8'
        }}>
          <li>Go to your Supabase dashboard</li>
          <li>Navigate to Authentication → Users</li>
          <li>Click "Add User" and create an admin account</li>
          <li>Use those credentials to log in here</li>
        </ol>
      </div>
    </div>
  );
}

export default AdminLogin; 