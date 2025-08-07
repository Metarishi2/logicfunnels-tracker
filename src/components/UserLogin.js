import React, { useState } from 'react';
import { User, Mail, Lock, AlertCircle, Users, Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

function UserLogin() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🔍 User login attempt:', { email, password });
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn(email, password);

      if (!result.success) {
        setError(result.error);
      } else {
        console.log('✅ User login successful!');
        // Redirect to user dashboard
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('❌ User login error:', error);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const quickAccess = () => {
    console.log('🔍 Quick access clicked for user');
    setEmail('user@example.com');
    setPassword('user123');
  };

  return (
    <div className="card">
      <div>
        <h2>
          <User className="inline mr-3" />
          User Login
        </h2>
        <p style={{ marginBottom: '20px', color: 'var(--neutral-600)' }}>
          Login to access your personal dashboard and submit activities.
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
                <User size={18} />
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
          <Users size={16} />
          Quick Access (Test User):
        </h4>
        <div style={{ 
          marginLeft: '20px', 
          marginTop: '10px',
          color: 'var(--success-600)',
          lineHeight: '1.8'
        }}>
          <p><strong>Email:</strong> user@example.com</p>
          <p><strong>Password:</strong> user123</p>
        </div>
      </div>

      <div 
        style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: 'var(--info-50)', 
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--info-500)'
        }}
      >
        <h4 style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          marginBottom: '10px',
          color: 'var(--info-700)'
        }}>
          <User size={16} />
          What Users Can Do:
        </h4>
        <ul style={{ 
          marginLeft: '20px', 
          marginTop: '10px',
          color: 'var(--info-600)',
          lineHeight: '1.8'
        }}>
          <li>Submit daily activities</li>
          <li>View personal analytics</li>
          <li>Access assigned client dashboards</li>
          <li>Track performance over time</li>
        </ul>
      </div>
    </div>
  );
}

export default UserLogin; 