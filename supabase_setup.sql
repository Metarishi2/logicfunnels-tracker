-- Supabase Database Setup for Analytics Dashboard
-- Run this SQL in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (be careful in production!)
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
CREATE INDEX IF NOT EXISTS idx_daily_activities_submitted_at ON daily_activities(submitted_at);
CREATE INDEX IF NOT EXISTS idx_user_client_assignments_user_id ON user_client_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_client_assignments_client_id ON user_client_assignments(client_id);

-- Insert admin user
INSERT INTO users (email, password_hash, first_name, last_name, role, is_active) 
VALUES (
    'admin@example.com',
    'admin123',
    'Admin',
    'User',
    'admin',
    true
);

-- Insert sample clients
INSERT INTO clients (name, description) VALUES
('TechCorp Solutions', 'Technology consulting services'),
('MarketingPro Agency', 'Digital marketing agency'),
('SalesForce Inc', 'Sales training and consulting'),
('Growth Partners', 'Business growth consulting'),
('Innovation Labs', 'Product development and innovation'),
('Global Consulting', 'International business consulting');

-- Insert sample users
INSERT INTO users (email, password_hash, first_name, last_name, role, is_active) VALUES
('john.doe@example.com', 'password123', 'John', 'Doe', 'user', true),
('jane.smith@example.com', 'password123', 'Jane', 'Smith', 'user', true),
('mike.johnson@example.com', 'password123', 'Mike', 'Johnson', 'user', true),
('sarah.wilson@example.com', 'password123', 'Sarah', 'Wilson', 'user', true),
('alex.brown@example.com', 'password123', 'Alex', 'Brown', 'user', true),
('emma.davis@example.com', 'password123', 'Emma', 'Davis', 'user', true);

-- Assign users to clients
INSERT INTO user_client_assignments (user_id, client_id) 
SELECT u.id, c.id 
FROM users u, clients c 
WHERE u.email IN ('john.doe@example.com', 'jane.smith@example.com', 'mike.johnson@example.com', 'sarah.wilson@example.com', 'alex.brown@example.com', 'emma.davis@example.com')
AND c.name IN ('TechCorp Solutions', 'MarketingPro Agency', 'SalesForce Inc', 'Growth Partners', 'Innovation Labs', 'Global Consulting')
ON CONFLICT (user_id, client_id) DO NOTHING;

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

-- Add sample daily activities for the last 30 days (simplified version)
INSERT INTO daily_activities (user_id, client_id, dms_sent, connection_requests_sent, comments_made, replies_received, followups_made, calls_booked, submitted_at)
SELECT 
    u.id as user_id,
    c.id as client_id,
    CASE 
        WHEN EXTRACT(DOW FROM (CURRENT_DATE - (i || ' days')::INTERVAL)::DATE) BETWEEN 1 AND 5 
        THEN floor(random() * 20) + 10  -- Weekday: 10-30 DMs
        ELSE floor(random() * 8) + 2    -- Weekend: 2-10 DMs
    END as dms_sent,
    CASE 
        WHEN EXTRACT(DOW FROM (CURRENT_DATE - (i || ' days')::INTERVAL)::DATE) BETWEEN 1 AND 5 
        THEN floor(random() * 15) + 5   -- Weekday: 5-20 connections
        ELSE floor(random() * 6) + 1    -- Weekend: 1-7 connections
    END as connection_requests_sent,
    CASE 
        WHEN EXTRACT(DOW FROM (CURRENT_DATE - (i || ' days')::INTERVAL)::DATE) BETWEEN 1 AND 5 
        THEN floor(random() * 12) + 3   -- Weekday: 3-15 comments
        ELSE floor(random() * 5) + 1    -- Weekend: 1-6 comments
    END as comments_made,
    CASE 
        WHEN EXTRACT(DOW FROM (CURRENT_DATE - (i || ' days')::INTERVAL)::DATE) BETWEEN 1 AND 5 
        THEN floor(random() * 8) + 2    -- Weekday: 2-10 replies
        ELSE floor(random() * 4) + 1    -- Weekend: 1-5 replies
    END as replies_received,
    CASE 
        WHEN EXTRACT(DOW FROM (CURRENT_DATE - (i || ' days')::INTERVAL)::DATE) BETWEEN 1 AND 5 
        THEN floor(random() * 8) + 3    -- Weekday: 3-11 followups
        ELSE floor(random() * 4) + 1    -- Weekend: 1-5 followups
    END as followups_made,
    CASE 
        WHEN EXTRACT(DOW FROM (CURRENT_DATE - (i || ' days')::INTERVAL)::DATE) BETWEEN 1 AND 5 
        THEN floor(random() * 5) + 1    -- Weekday: 1-6 calls
        ELSE floor(random() * 3)        -- Weekend: 0-3 calls
    END as calls_booked,
    (CURRENT_DATE - (i || ' days')::INTERVAL) + interval '9 hours' + (random() * interval '8 hours') as submitted_at
FROM 
    users u,
    clients c,
    generate_series(0, 29) as i
WHERE 
    u.role = 'user' AND u.is_active = true;

-- Add some high-performing days to make analytics interesting
UPDATE daily_activities 
SET 
    dms_sent = dms_sent + 15,
    calls_booked = calls_booked + 3,
    replies_received = replies_received + 8
WHERE submitted_at::date IN (
    CURRENT_DATE - 5,
    CURRENT_DATE - 12,
    CURRENT_DATE - 19
);

-- Add some low-performing days for contrast
UPDATE daily_activities 
SET 
    dms_sent = GREATEST(dms_sent - 10, 1),
    calls_booked = GREATEST(calls_booked - 2, 0),
    replies_received = GREATEST(replies_received - 5, 0)
WHERE submitted_at::date IN (
    CURRENT_DATE - 2,
    CURRENT_DATE - 9,
    CURRENT_DATE - 16
);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_client_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create RLS policies for clients table
CREATE POLICY "Users can view assigned clients" ON clients
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_client_assignments uca
            WHERE uca.client_id = clients.id AND uca.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all clients" ON clients
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create RLS policies for daily_activities table
CREATE POLICY "Users can view their own activities" ON daily_activities
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own activities" ON daily_activities
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all activities" ON daily_activities
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create RLS policies for user_client_assignments table
CREATE POLICY "Users can view their own assignments" ON user_client_assignments
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all assignments" ON user_client_assignments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Display summary of setup
SELECT 
    'Database setup completed successfully!' as message,
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM clients) as total_clients,
    (SELECT COUNT(*) FROM daily_activities) as total_activities,
    (SELECT COUNT(*) FROM user_client_assignments) as total_assignments;
