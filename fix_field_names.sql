-- Fix field names in database
-- Run this to ensure the database has the correct field names

-- Check current table structure
SELECT 'Current table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'daily_activities'
ORDER BY ordinal_position;

-- Rename followups_scheduled to followups_made if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'daily_activities' 
        AND column_name = 'followups_scheduled'
    ) THEN
        ALTER TABLE daily_activities RENAME COLUMN followups_scheduled TO followups_made;
        RAISE NOTICE 'Renamed followups_scheduled to followups_made';
    ELSE
        RAISE NOTICE 'Column followups_scheduled does not exist, skipping rename';
    END IF;
END $$;

-- Add connection_requests_sent if it doesn't exist
ALTER TABLE daily_activities 
ADD COLUMN IF NOT EXISTS connection_requests_sent INTEGER NOT NULL DEFAULT 0 CHECK (connection_requests_sent >= 0);

-- Update any existing records to have the new field
UPDATE daily_activities 
SET connection_requests_sent = 0 
WHERE connection_requests_sent IS NULL;

-- Recreate the total_activities computed column
ALTER TABLE daily_activities DROP COLUMN IF EXISTS total_activities;
ALTER TABLE daily_activities ADD COLUMN total_activities INTEGER GENERATED ALWAYS AS (
    dms_sent + connection_requests_sent + comments_made + followups_made + COALESCE(calls_booked, 0) + replies_received
) STORED;

-- Show final table structure
SELECT 'Final table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'daily_activities'
ORDER BY ordinal_position;

-- Test insert to verify everything works
INSERT INTO daily_activities (
    dms_sent, 
    connection_requests_sent, 
    comments_made, 
    followups_made, 
    calls_booked, 
    replies_received
) VALUES (5, 3, 4, 2, 1, 2)
ON CONFLICT DO NOTHING;

-- Verify the test insert
SELECT 'Test insert verification:' as info;
SELECT 
    dms_sent,
    connection_requests_sent,
    comments_made,
    followups_made,
    calls_booked,
    replies_received,
    total_activities
FROM daily_activities 
ORDER BY submitted_at DESC 
LIMIT 1;

SELECT 'Database field names fixed successfully!' as status; 