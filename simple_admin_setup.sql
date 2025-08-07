-- Drop existing tables if they exist
DROP TABLE IF EXISTS daily_activities CASCADE;
DROP TABLE IF EXISTS user_client_assignments CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
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
CREATE TABLE clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_client_assignments table
CREATE TABLE user_client_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, client_id)
);

-- Create daily_activities table
CREATE TABLE daily_activities (
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
CREATE INDEX IF NOT EXISTS idx_user_client_assignments_user_id ON user_client_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_client_assignments_client_id ON user_client_assignments(client_id);

-- Insert admin user only
INSERT INTO users (email, password_hash, first_name, last_name, role, is_active) 
VALUES (
    'admin@example.com',
    'admin123',
    'Admin',
    'User',
    'admin',
    true
);

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