import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Send, 
  Shield, 
  LogOut, 
  Activity,
  Database,
  Zap,
  Users,
  User,
  Settings
} from 'lucide-react';
import ActivityForm from './components/ActivityForm';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import UserLiveAnalytics from './components/UserLiveAnalytics';
import AdminSetup from './components/AdminSetup';
import RealTimeDashboard from './components/RealTimeDashboard';
import AdminLogin from './components/AdminLogin';
import UserLogin from './components/UserLogin';
import TestConnection from './components/TestConnection';
import SEO from './components/SEO';
import { useAuth } from './hooks/useAuth';

function App() {
  const location = useLocation();
  const { user, userProfile, isAdmin, isUser, signOut } = useAuth();

  // Show loading state while auth is being determined
  if (user && !userProfile) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        Loading user profile...
      </div>
    );
  }

  return (
    <div className="App" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh' 
    }}>
      <SEO />
      <header className="header">
        <div className="container">
          <div className="header-content">
            <h1>
              <Activity className="inline mr-2" />
              Dashboard
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
                {isAdmin() && (
                  <Link 
                    to="/test" 
                    className={location.pathname === '/test' ? 'active' : ''}
                  >
                    <Database size={18} />
                    Test Connection
                  </Link>
                )}
                {isAdmin() && (
                  <Link 
                    to="/admin" 
                    className={location.pathname === '/admin' ? 'active' : ''}
                  >
                    <BarChart3 size={18} />
                    Admin Dashboard
                  </Link>
                )}
                {isUser() && (
                  <Link 
                    to="/dashboard" 
                    className={location.pathname === '/dashboard' ? 'active' : ''}
                  >
                    <Users size={18} />
                    My Dashboard
                  </Link>
                )}
                {isUser() && (
                  <Link 
                    to="/user-live-analytics" 
                    className={location.pathname === '/user-live-analytics' ? 'active' : ''}
                  >
                    <Zap size={18} />
                    My Live Analytics
                  </Link>
                )}
                {isAdmin() && (
                  <Link 
                    to="/realtime" 
                    className={location.pathname === '/realtime' ? 'active' : ''}
                  >
                    <BarChart3 size={18} />
                    Admin Live Analytics
                  </Link>
                )}
                {user ? (
                  <>
                    {isAdmin() && (
                      <Link 
                        to="/setup" 
                        className={`btn btn-secondary${location.pathname === '/setup' ? ' active' : ''}`}
                        style={{ marginRight: 8 }}
                      >
                        <Settings size={18} />
                        Setup
                      </Link>
                    )}
                    <button 
                      onClick={signOut}
                      className="btn btn-primary"
                      style={{ marginLeft: isAdmin() ? 0 : 8 }}
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/user-login" 
                      className={location.pathname === '/user-login' ? 'active' : ''}
                    >
                      <User size={18} />
                      User Login
                    </Link>
                    <Link 
                      to="/login" 
                      className={location.pathname === '/login' ? 'active' : ''}
                    >
                      <Shield size={18} />
                      Admin Login
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        </div>
      </header>

      <main className="container" style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<ActivityForm />} />
          <Route path="/submit" element={<ActivityForm />} />
          {isAdmin() && <Route path="/test" element={<TestConnection />} />}
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/user-login" element={<UserLogin />} />
          <Route path="/setup" element={<AdminSetup />} />
          <Route 
            path="/admin" 
            element={<AdminDashboard />} 
          />
          <Route 
            path="/dashboard" 
            element={<UserDashboard />} 
          />
          <Route 
            path="/realtime" 
            element={<RealTimeDashboard />} 
          />
          <Route 
            path="/user-live-analytics" 
            element={<UserLiveAnalytics />} 
          />
        </Routes>
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <p>
              © 2025 Copyright{'  '}
              <a 
                href="https://gigzs.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="footer-link"
              >
                gigzs
              </a>
              {' '}and Designed by{' '}
              <a 
                href="https://gigzs.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="footer-link"
              >
                Uimitra
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App; 