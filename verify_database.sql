-- Verification script to check database setup
-- Run this after the main fix to verify everything works

-- 1. Check if table exists and has correct structure
SELECT 'Checking table structure...' as step;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'daily_activities'
ORDER BY ordinal_position;

-- 2. Check if we can insert data
SELECT 'Testing insert...' as step;
INSERT INTO daily_activities (
    dms_sent, 
    connection_requests_sent, 
    comments_made, 
    followups_made, 
    calls_booked, 
    replies_received
) VALUES (7, 4, 6, 3, 1, 5);

-- 3. Check if we can read data
SELECT 'Testing read...' as step;
SELECT 
    id,
    dms_sent,
    connection_requests_sent,
    comments_made,
    followups_made,
    calls_booked,
    replies_received,
    total_activities,
    weekday,
    submitted_at
FROM daily_activities 
ORDER BY submitted_at DESC 
LIMIT 5;

-- 4. Test computed columns
SELECT 'Testing computed columns...' as step;
SELECT 
    weekday,
    week_number,
    month_number,
    year_number,
    total_activities
FROM daily_activities 
LIMIT 3;

-- 5. Test basic analytics
SELECT 'Testing analytics...' as step;
SELECT 
    COUNT(*) as total_records,
    SUM(dms_sent) as total_dms,
    SUM(connection_requests_sent) as total_connections,
    SUM(comments_made) as total_comments,
    SUM(followups_made) as total_followups,
    SUM(calls_booked) as total_calls,
    SUM(replies_received) as total_replies,
    SUM(total_activities) as total_activities
FROM daily_activities;

-- 6. Test rate calculations
SELECT 'Testing rate calculations...' as step;
SELECT 
    CASE 
        WHEN SUM(dms_sent) > 0 THEN 
            ROUND((SUM(calls_booked)::DECIMAL / SUM(dms_sent)::DECIMAL) * 100, 2)
        ELSE 0 
    END as call_booking_rate,
    CASE 
        WHEN SUM(dms_sent) > 0 THEN 
            ROUND((SUM(replies_received)::DECIMAL / SUM(dms_sent)::DECIMAL) * 100, 2)
        ELSE 0 
    END as response_rate,
    CASE 
        WHEN SUM(followups_made) > 0 THEN 
            ROUND((SUM(calls_booked)::DECIMAL / SUM(followups_made)::DECIMAL) * 100, 2)
        ELSE 0 
    END as followup_to_booking_rate
FROM daily_activities;

SELECT 'Database verification completed successfully!' as status; 