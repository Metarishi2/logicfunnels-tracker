-- Add sample data for analytics testing
-- This script adds realistic sample data to test the analytics functionality

-- First, let's add some sample clients if they don't exist
INSERT INTO clients (name, description) VALUES
('TechCorp Solutions', 'Technology consulting services'),
('MarketingPro Agency', 'Digital marketing agency'),
('SalesForce Inc', 'Sales training and consulting'),
('Growth Partners', 'Business growth consulting')
ON CONFLICT (name) DO NOTHING;

-- Add some sample users if they don't exist
INSERT INTO users (email, password_hash, first_name, last_name, role, is_active) VALUES
('john.doe@example.com', 'password123', 'John', 'Doe', 'user', true),
('jane.smith@example.com', 'password123', 'Jane', 'Smith', 'user', true),
('mike.johnson@example.com', 'password123', 'Mike', 'Johnson', 'user', true),
('sarah.wilson@example.com', 'password123', 'Sarah', 'Wilson', 'user', true)
ON CONFLICT (email) DO NOTHING;

-- Assign users to clients
INSERT INTO user_client_assignments (user_id, client_id) 
SELECT u.id, c.id 
FROM users u, clients c 
WHERE u.email IN ('john.doe@example.com', 'jane.smith@example.com', 'mike.johnson@example.com', 'sarah.wilson@example.com')
AND c.name IN ('TechCorp Solutions', 'MarketingPro Agency', 'SalesForce Inc', 'Growth Partners')
ON CONFLICT (user_id, client_id) DO NOTHING;

-- Add sample daily activities for the last 30 days
-- This creates realistic data with varying performance metrics

DO $$
DECLARE
    user_record RECORD;
    client_record RECORD;
    current_date DATE;
    dms_count INTEGER;
    calls_count INTEGER;
    replies_count INTEGER;
    followups_count INTEGER;
    connections_count INTEGER;
    comments_count INTEGER;
BEGIN
    -- Loop through each user
    FOR user_record IN SELECT id FROM users WHERE role = 'user' AND is_active = true
    LOOP
        -- Loop through each client
        FOR client_record IN SELECT id FROM clients
        LOOP
            -- Generate data for the last 30 days
            FOR i IN 0..29 LOOP
                current_date := CURRENT_DATE - i;
                
                -- Generate realistic activity numbers
                -- Weekdays have more activity than weekends
                IF EXTRACT(DOW FROM current_date) BETWEEN 1 AND 5 THEN
                    -- Weekday activity
                    dms_count := floor(random() * 20) + 10; -- 10-30 DMs
                    calls_count := floor(random() * 5) + 1; -- 1-6 calls
                    replies_count := floor(random() * 8) + 2; -- 2-10 replies
                    followups_count := floor(random() * 8) + 3; -- 3-11 followups
                    connections_count := floor(random() * 15) + 5; -- 5-20 connections
                    comments_count := floor(random() * 12) + 3; -- 3-15 comments
                ELSE
                    -- Weekend activity (lower)
                    dms_count := floor(random() * 8) + 2; -- 2-10 DMs
                    calls_count := floor(random() * 3); -- 0-3 calls
                    replies_count := floor(random() * 4) + 1; -- 1-5 replies
                    followups_count := floor(random() * 4) + 1; -- 1-5 followups
                    connections_count := floor(random() * 6) + 1; -- 1-7 connections
                    comments_count := floor(random() * 5) + 1; -- 1-6 comments
                END IF;
                
                -- Insert the activity record
                INSERT INTO daily_activities (
                    user_id,
                    client_id,
                    dms_sent,
                    connection_requests_sent,
                    comments_made,
                    replies_received,
                    followups_made,
                    calls_booked,
                    submitted_at
                ) VALUES (
                    user_record.id,
                    client_record.id,
                    dms_count,
                    connections_count,
                    comments_count,
                    replies_count,
                    followups_count,
                    calls_count,
                    current_date + interval '9 hours' + (random() * interval '8 hours') -- Random time during business hours
                );
            END LOOP;
        END LOOP;
    END LOOP;
END $$;

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

-- Display summary of added data
SELECT 
    'Sample data added successfully!' as message,
    COUNT(*) as total_activities,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT client_id) as unique_clients,
    MIN(submitted_at::date) as earliest_date,
    MAX(submitted_at::date) as latest_date
FROM daily_activities;
