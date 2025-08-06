-- Manual verification script
-- Run this after each step to verify

-- 1. Check if table exists
SELECT '1. Table exists:' as check;
SELECT COUNT(*) as count FROM information_schema.tables WHERE table_name = 'daily_activities';

-- 2. Check table columns
SELECT '2. Table columns:' as check;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'daily_activities' 
ORDER BY ordinal_position;

-- 3. Check if connection_requests_sent exists
SELECT '3. connection_requests_sent column:' as check;
SELECT COUNT(*) as exists 
FROM information_schema.columns 
WHERE table_name = 'daily_activities' 
AND column_name = 'connection_requests_sent';

-- 4. Test insert
SELECT '4. Test insert:' as check;
INSERT INTO daily_activities (
    dms_sent, 
    connection_requests_sent, 
    comments_made, 
    followups_made, 
    calls_booked, 
    replies_received
) VALUES (1, 1, 1, 1, 1, 1);

-- 5. Test select
SELECT '5. Test select:' as check;
SELECT * FROM daily_activities ORDER BY submitted_at DESC LIMIT 1;

-- 6. Clean up test
DELETE FROM daily_activities WHERE dms_sent = 1 AND connection_requests_sent = 1;

SELECT 'Verification completed!' as status; 