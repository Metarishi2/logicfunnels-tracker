import React, { useState } from 'react';
import { Shield, UserPlus, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

function AdminSetup() {
  const { createAdminUser } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match');
      setMessageType('error');
      setIsSubmitting(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setMessage('Password must be at least 6 characters long');
      setMessageType('error');
      setIsSubmitting(false);
      return;
    }

    try {
      const userData = {
        email: formData.email,
        password_hash: formData.password, // In production, this should be properly hashed
        first_name: formData.first_name,
        last_name: formData.last_name
      };

      const result = await createAdminUser(userData);
      
      if (result.success) {
        setMessage('Admin user created successfully! You can now login with these credentials.');
        setMessageType('success');
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          first_name: '',
          last_name: ''
        });
      } else {
        setMessage('Failed to create admin user: ' + result.error);
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error creating admin user:', error);
      setMessage('Error creating admin user: ' + error.message);
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div className="setup-header">
          <Shield size={48} className="setup-icon" />
          <h1>Admin Setup</h1>
          <p>Create your first admin user to get started with the multi-tenant system.</p>
        </div>

        {message && (
          <div className={`message ${messageType}`}>
            {messageType === 'success' ? (
              <CheckCircle size={18} className="inline mr-2" />
            ) : (
              <AlertCircle size={18} className="inline mr-2" />
            )}
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first_name">
                <UserPlus size={16} className="inline mr-2" />
                First Name *
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                className="form-control"
                placeholder="Enter first name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="last_name">
                <UserPlus size={16} className="inline mr-2" />
                Last Name *
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                className="form-control"
                placeholder="Enter last name"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">
              <UserPlus size={16} className="inline mr-2" />
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-control"
              placeholder="Enter email address"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">
                <Shield size={16} className="inline mr-2" />
                Password *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="form-control"
                placeholder="Enter password (min 6 characters)"
                minLength={6}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">
                <Shield size={16} className="inline mr-2" />
                Confirm Password *
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="form-control"
                placeholder="Confirm password"
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="loading-spinner" style={{ width: '16px', height: '16px' }}></div>
                  Creating Admin...
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  Create Admin User
                </>
              )}
            </button>
          </div>
        </form>

       
      </div>
    </div>
  );
}

export default AdminSetup; 