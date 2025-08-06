-- Test script to verify database setup and insert test data
-- Run this after the migration to test everything

-- 1. Check table structure
SELECT 'Table Structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'daily_activities'
ORDER BY ordinal_position;

-- 2. Insert test data
INSERT INTO daily_activities (
    dms_sent, 
    connection_requests_sent, 
    comments_made, 
    followups_made, 
    calls_booked, 
    replies_received
) VALUES 
(10, 5, 8, 3, 2, 4),
(15, 8, 12, 5, 3, 7),
(8, 3, 6, 2, 1, 3),
(20, 12, 15, 8, 5, 12),
(12, 6, 9, 4, 2, 6),
(25, 15, 20, 10, 8, 15),
(18, 10, 14, 6, 4, 9),
(30, 20, 25, 12, 10, 18);

-- 3. Verify data was inserted
SELECT 'Test Data Inserted:' as info;
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
SELECT 'Computed Columns Test:' as info;
SELECT 
    weekday,
    week_number,
    month_number,
    year_number,
    total_activities
FROM daily_activities 
LIMIT 3;

-- 5. Test basic queries
SELECT 'Basic Analytics:' as info;
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
SELECT 'Rate Calculations:' as info;
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

-- 7. Test daily breakdown
SELECT 'Daily Breakdown:' as info;
SELECT 
    DATE(submitted_at) as date,
    weekday,
    SUM(dms_sent) as dms_sent,
    SUM(connection_requests_sent) as connection_requests_sent,
    SUM(comments_made) as comments_made,
    SUM(followups_made) as followups_made,
    SUM(calls_booked) as calls_booked,
    SUM(replies_received) as replies_received,
    SUM(total_activities) as total_activities
FROM daily_activities 
GROUP BY DATE(submitted_at), weekday
ORDER BY date DESC;

SELECT 'Database test completed successfully!' as status; 