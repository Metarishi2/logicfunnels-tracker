import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Send, 
  Shield, 
  LogOut, 
  Activity,
  Database,
  Zap
} from 'lucide-react';
import ActivityForm from './components/ActivityForm';
import AdminDashboard from './components/AdminDashboard';
import RealTimeDashboard from './components/RealTimeDashboard';
import AdminLogin from './components/AdminLogin';
import TestConnection from './components/TestConnection';
import { useAuth } from './hooks/useAuth';

function App() {
  const location = useLocation();
  const { user, loading, signIn, signOut } = useAuth();

  // Show loading state while auth is being determined
  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        Loading...
      </div>
    );
  }

  return (
    <div className="App">
      <header className="header">
        <div className="container">
          <div className="header-content">
            <h1>
              <Activity className="inline mr-2" />
              Daily Activity Dashboard
            </h1>
            <nav className="nav">
              <div className="nav">
                <Link 
                  to="/submit" 
                  className={location.pathname === '/submit' ? 'active' : ''}
                >
                  <Send size={18} />
                  Submit Activity
                </Link>
                <Link 
                  to="/test" 
                  className={location.pathname === '/test' ? 'active' : ''}
                >
                  <Database size={18} />
                  Test Connection
                </Link>
                <Link 
                  to="/admin" 
                  className={location.pathname === '/admin' ? 'active' : ''}
                >
                  <BarChart3 size={18} />
                  Dashboard
                </Link>
                <Link 
                  to="/realtime" 
                  className={location.pathname === '/realtime' ? 'active' : ''}
                >
                  <Zap size={18} />
                  Live Analytics
                </Link>
                {user ? (
                  <button 
                    onClick={signOut}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: '#ffffff',
                      cursor: 'pointer',
                      padding: '8px 16px',
                      fontSize: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                ) : (
                  <Link 
                    to="/login" 
                    className={location.pathname === '/login' ? 'active' : ''}
                  >
                    <Shield size={18} />
                    Admin Login
                  </Link>
                )}
              </div>
            </nav>
          </div>
        </div>
      </header>

      <main className="container">
        <Routes>
          <Route path="/" element={<ActivityForm />} />
          <Route path="/submit" element={<ActivityForm />} />
          <Route path="/test" element={<TestConnection />} />
          <Route path="/login" element={<AdminLogin onSignIn={signIn} />} />
          <Route 
            path="/admin" 
            element={<AdminDashboard />} 
          />
          <Route 
            path="/realtime" 
            element={<RealTimeDashboard />} 
          />
        </Routes>
      </main>
    </div>
  );
}

export default App; 