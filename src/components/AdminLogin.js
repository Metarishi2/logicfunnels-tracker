import React, { useState } from 'react';
import { Shield, Mail, Lock, AlertCircle, Database, Key, Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

function AdminLogin() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🔍 Login attempt:', { email, password });
    setIsLoading(true);
    setError('');

    try {
      console.log('🔍 Calling signIn function...');
      const result = await signIn(email, password);
      console.log('🔍 SignIn result:', result);

      if (!result.success) {
        console.log('❌ Login failed:', result.error);
        setError(result.error);
      } else {
        console.log('✅ Login successful!');
        // Redirect or show success message
        window.location.href = '/admin';
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const quickAccess = () => {
    console.log('🔍 Quick access clicked');
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
            onClick={() => console.log('🔍 Sign In button clicked')}
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
    </div>
  );
}

export default AdminLogin; 