-- Basic Supabase Database Setup for Analytics Dashboard
-- Run this SQL in your Supabase SQL Editor for production setup

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_client_assignments table
CREATE TABLE IF NOT EXISTS user_client_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, client_id)
);

-- Create daily_activities table
CREATE TABLE IF NOT EXISTS daily_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    dms_sent INTEGER DEFAULT 0,
    connection_requests_sent INTEGER DEFAULT 0,
    comments_made INTEGER DEFAULT 0,
    replies_received INTEGER DEFAULT 0,
    followups_made INTEGER DEFAULT 0,
    calls_booked INTEGER DEFAULT 0,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);
CREATE INDEX IF NOT EXISTS idx_daily_activities_user_id ON daily_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_activities_client_id ON daily_activities(client_id);
CREATE INDEX IF NOT EXISTS idx_daily_activities_submitted_at ON daily_activities(submitted_at);
CREATE INDEX IF NOT EXISTS idx_user_client_assignments_user_id ON user_client_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_client_assignments_client_id ON user_client_assignments(client_id);

-- Create PostgreSQL functions for analytics
CREATE OR REPLACE FUNCTION get_user_clients(p_user_id UUID DEFAULT NULL)
RETURNS TABLE (
    client_id UUID,
    client_name VARCHAR(255),
    client_description TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT c.id, c.name, c.description
    FROM clients c
    LEFT JOIN user_client_assignments uca ON c.id = uca.client_id
    WHERE uca.user_id = p_user_id OR p_user_id IS NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_user_analytics(p_user_id UUID DEFAULT NULL)
RETURNS TABLE (
    total_activities BIGINT,
    total_dms BIGINT,
    total_calls BIGINT,
    total_replies BIGINT,
    call_booking_rate NUMERIC,
    response_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(COUNT(da.id), 0) as total_activities,
        COALESCE(SUM(da.dms_sent), 0) as total_dms,
        COALESCE(SUM(da.calls_booked), 0) as total_calls,
        COALESCE(SUM(da.replies_received), 0) as total_replies,
        CASE 
            WHEN SUM(da.dms_sent) > 0 
            THEN ROUND((SUM(da.calls_booked)::NUMERIC / SUM(da.dms_sent)::NUMERIC) * 100, 2)
            ELSE 0 
        END as call_booking_rate,
        CASE 
            WHEN SUM(da.dms_sent) > 0 
            THEN ROUND((SUM(da.replies_received)::NUMERIC / SUM(da.dms_sent)::NUMERIC) * 100, 2)
            ELSE 0 
        END as response_rate
    FROM daily_activities da
    WHERE (p_user_id IS NULL OR da.user_id = p_user_id);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_client_analytics(p_client_id UUID)
RETURNS TABLE (
    total_activities BIGINT,
    total_dms BIGINT,
    total_calls BIGINT,
    total_replies BIGINT,
    call_booking_rate NUMERIC,
    response_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(COUNT(da.id), 0) as total_activities,
        COALESCE(SUM(da.dms_sent), 0) as total_dms,
        COALESCE(SUM(da.calls_booked), 0) as total_calls,
        COALESCE(SUM(da.replies_received), 0) as total_replies,
        CASE 
            WHEN SUM(da.dms_sent) > 0 
            THEN ROUND((SUM(da.calls_booked)::NUMERIC / SUM(da.dms_sent)::NUMERIC) * 100, 2)
            ELSE 0 
        END as call_booking_rate,
        CASE 
            WHEN SUM(da.dms_sent) > 0 
            THEN ROUND((SUM(da.replies_received)::NUMERIC / SUM(da.dms_sent)::NUMERIC) * 100, 2)
            ELSE 0 
        END as response_rate
    FROM daily_activities da
    WHERE da.client_id = p_client_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get daily analytics for charts
CREATE OR REPLACE FUNCTION get_daily_analytics(start_date DATE, end_date DATE, p_user_id UUID DEFAULT NULL, p_client_id UUID DEFAULT NULL)
RETURNS TABLE (
    date DATE,
    total_dms BIGINT,
    total_calls BIGINT,
    total_replies BIGINT,
    total_followups BIGINT,
    call_booking_rate NUMERIC,
    response_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        da.submitted_at::DATE as date,
        COALESCE(SUM(da.dms_sent), 0) as total_dms,
        COALESCE(SUM(da.calls_booked), 0) as total_calls,
        COALESCE(SUM(da.replies_received), 0) as total_replies,
        COALESCE(SUM(da.followups_made), 0) as total_followups,
        CASE 
            WHEN SUM(da.dms_sent) > 0 
            THEN ROUND((SUM(da.calls_booked)::NUMERIC / SUM(da.dms_sent)::NUMERIC) * 100, 2)
            ELSE 0 
        END as call_booking_rate,
        CASE 
            WHEN SUM(da.dms_sent) > 0 
            THEN ROUND((SUM(da.replies_received)::NUMERIC / SUM(da.dms_sent)::NUMERIC) * 100, 2)
            ELSE 0 
        END as response_rate
    FROM daily_activities da
    WHERE da.submitted_at::DATE BETWEEN start_date AND end_date
    AND (p_user_id IS NULL OR da.user_id = p_user_id)
    AND (p_client_id IS NULL OR da.client_id = p_client_id)
    GROUP BY da.submitted_at::DATE
    ORDER BY da.submitted_at::DATE;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_client_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all users" ON users;
CREATE POLICY "Admins can view all users" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create RLS policies for clients table
DROP POLICY IF EXISTS "Users can view assigned clients" ON clients;
CREATE POLICY "Users can view assigned clients" ON clients
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_client_assignments uca
            WHERE uca.client_id = clients.id AND uca.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Admins can view all clients" ON clients;
CREATE POLICY "Admins can view all clients" ON clients
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create RLS policies for daily_activities table
DROP POLICY IF EXISTS "Users can view their own activities" ON daily_activities;
CREATE POLICY "Users can view their own activities" ON daily_activities
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own activities" ON daily_activities;
CREATE POLICY "Users can insert their own activities" ON daily_activities
    FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all activities" ON daily_activities;
CREATE POLICY "Admins can view all activities" ON daily_activities
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create RLS policies for user_client_assignments table
DROP POLICY IF EXISTS "Users can view their own assignments" ON user_client_assignments;
CREATE POLICY "Users can view their own assignments" ON user_client_assignments
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all assignments" ON user_client_assignments;
CREATE POLICY "Admins can manage all assignments" ON user_client_assignments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Display summary of setup
SELECT 
    'Basic database setup completed successfully!' as message,
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM clients) as total_clients,
    (SELECT COUNT(*) FROM daily_activities) as total_activities,
    (SELECT COUNT(*) FROM user_client_assignments) as total_assignments;
