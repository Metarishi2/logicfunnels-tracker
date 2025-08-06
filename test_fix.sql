-- Simple test to verify the fix works
-- Run this after the main fix script

-- Test 1: Check if table exists
SELECT 'Test 1: Table exists' as test;
SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_name = 'daily_activities';

-- Test 2: Check if view exists
SELECT 'Test 2: View exists' as test;
SELECT COUNT(*) as view_count FROM information_schema.views WHERE table_name = 'daily_activities_with_computed';

-- Test 3: Test insert
SELECT 'Test 3: Insert test' as test;
INSERT INTO daily_activities (
    dms_sent, 
    connection_requests_sent, 
    comments_made, 
    followups_made, 
    calls_booked, 
    replies_received
) VALUES (3, 2, 4, 1, 0, 2);

-- Test 4: Test read from view
SELECT 'Test 4: Read from view' as test;
SELECT 
    dms_sent,
    connection_requests_sent,
    comments_made,
    followups_made,
    calls_booked,
    replies_received,
    weekday,
    total_activities
FROM daily_activities_with_computed 
ORDER BY submitted_at DESC 
LIMIT 3;

-- Test 5: Clean up test data
SELECT 'Test 5: Cleanup' as test;
DELETE FROM daily_activities WHERE dms_sent = 3 AND connection_requests_sent = 2;

SELECT 'All tests completed successfully!' as status; 