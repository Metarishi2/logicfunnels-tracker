import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    // Check for existing session from localStorage
    const checkExistingSession = async () => {
      try {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          setUserProfile(userData);
        }
      } catch (error) {
        console.error('Error checking existing session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkExistingSession();
  }, []);

  const signIn = async (email, password) => {
    console.log('🔍 useAuth.signIn called with:', { email, password });
    
    try {
      // Check against our custom users table
      console.log('🔍 Querying users table...');
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password_hash', password)
        .eq('is_active', true)
        .single();

      console.log('🔍 Supabase query result:', { users, error });

      if (error || !users) {
        console.log('❌ No user found or error:', error);
        return { success: false, error: 'Invalid login credentials' };
      }

      console.log('✅ User found:', users);

      // Create user session
      const userData = {
        id: users.id,
        email: users.email,
        first_name: users.first_name,
        last_name: users.last_name,
        role: users.role,
        is_active: users.is_active
      };

      console.log('🔍 Creating user session:', userData);

      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      setUserProfile(userData);

      console.log('✅ Login successful, user set:', userData);
      console.log('🔍 After setUser - user state:', userData);
      console.log('🔍 After setUserProfile - userProfile state:', userData);

      return { success: true, data: { user: userData } };
    } catch (error) {
      console.error('❌ Error in signIn:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const signOut = async () => {
    try {
      // Clear localStorage
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Error signing out:', error);
    }
    setUser(null);
    setUserProfile(null);
  };

  const createUser = async (userData) => {
    try {
      // Only admins can create users
      if (!userProfile || userProfile.role !== 'admin') {
        throw new Error('Only admins can create users');
      }

      const { data, error } = await supabase
        .from('users')
        .insert([{
          email: userData.email,
          password_hash: userData.password_hash,
          first_name: userData.first_name,
          last_name: userData.last_name,
          role: userData.role || 'user',
          client_id: userData.client_id,
          is_active: true
        }])
        .select();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const createAdminUser = async (userData) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          email: userData.email,
          password_hash: userData.password_hash,
          first_name: userData.first_name,
          last_name: userData.last_name,
          role: 'admin',
          is_active: true
        }])
        .select();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const getUserClients = async (userId = null) => {
    try {
      const { data, error } = await supabase.rpc('get_user_clients', {
        p_user_id: userId
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const getUserAnalytics = async (userId = null) => {
    try {
      const { data, error } = await supabase.rpc('get_user_analytics', {
        p_user_id: userId
      });

      if (error) throw error;
      return { success: true, data: data[0] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const getClientAnalytics = async (clientId) => {
    try {
      const { data, error } = await supabase.rpc('get_client_analytics', {
        p_client_id: clientId
      });

      if (error) throw error;
      return { success: true, data: data[0] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const isAdmin = () => {
    console.log('🔍 isAdmin() called');
    console.log('🔍 userProfile:', userProfile);
    console.log('🔍 userProfile?.role:', userProfile?.role);
    const result = userProfile?.role === 'admin';
    console.log('🔍 isAdmin result:', result);
    return result;
  };

  const isUser = () => {
    console.log('🔍 isUser() called');
    console.log('🔍 userProfile?.role:', userProfile?.role);
    const result = userProfile?.role === 'user' || (userProfile && !userProfile.role);
    console.log('🔍 isUser result:', result);
    return result;
  };

  const canAccessClient = (clientId) => {
    if (isAdmin()) return true;
    // For now, we'll check this in the backend via RLS policies
    return true;
  };

  return {
    user,
    userProfile,
    loading,
    signIn,
    signOut,
    createUser,
    createAdminUser,
    getUserClients,
    getUserAnalytics,
    getClientAnalytics,
    isAdmin,
    isUser,
    canAccessClient,
  };
} 