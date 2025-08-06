-- Check current database schema
-- Run this first to see what we're working with

-- 1. Check if table exists
SELECT 'Table exists:' as info;
SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_name = 'daily_activities';

-- 2. Check current table structure
SELECT 'Current table structure:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'daily_activities'
ORDER BY ordinal_position;

-- 3. Check if view exists
SELECT 'View exists:' as info;
SELECT COUNT(*) as view_count FROM information_schema.views WHERE table_name = 'daily_activities_with_computed';

-- 4. Check for any existing data
SELECT 'Existing data count:' as info;
SELECT COUNT(*) as data_count FROM daily_activities;

-- 5. Show sample data if exists
SELECT 'Sample data:' as info;
SELECT * FROM daily_activities LIMIT 3; 