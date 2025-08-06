-- Complete fix for database schema
-- This will work regardless of current state

-- Step 1: Drop everything and start fresh
DROP VIEW IF EXISTS daily_activities_with_computed CASCADE;
DROP TABLE IF EXISTS daily_activities CASCADE;

-- Step 2: Create the table with ALL required fields
CREATE TABLE daily_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dms_sent INTEGER NOT NULL CHECK (dms_sent >= 0),
    connection_requests_sent INTEGER NOT NULL CHECK (connection_requests_sent >= 0),
    comments_made INTEGER NOT NULL CHECK (comments_made >= 0),
    followups_made INTEGER NOT NULL CHECK (followups_made >= 0),
    calls_booked INTEGER CHECK (calls_booked >= 0),
    replies_received INTEGER NOT NULL CHECK (replies_received >= 0),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create indexes
CREATE INDEX idx_daily_activities_submitted_at ON daily_activities(submitted_at);

-- Step 4: Enable RLS and create policies
ALTER TABLE daily_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert" ON daily_activities FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated read" ON daily_activities FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow public read" ON daily_activities FOR SELECT USING (true);

-- Step 5: Grant permissions
GRANT ALL ON daily_activities TO anon, authenticated;

-- Step 6: Create the view for computed columns
CREATE OR REPLACE VIEW daily_activities_with_computed AS
SELECT 
    *,
    CASE EXTRACT(DOW FROM submitted_at)
        WHEN 0 THEN 'Sunday'
        WHEN 1 THEN 'Monday'
        WHEN 2 THEN 'Tuesday'
        WHEN 3 THEN 'Wednesday'
        WHEN 4 THEN 'Thursday'
        WHEN 5 THEN 'Friday'
        WHEN 6 THEN 'Saturday'
    END as weekday,
    EXTRACT(WEEK FROM submitted_at) as week_number,
    EXTRACT(MONTH FROM submitted_at) as month_number,
    EXTRACT(YEAR FROM submitted_at) as year_number,
    dms_sent + connection_requests_sent + comments_made + followups_made + COALESCE(calls_booked, 0) + replies_received as total_activities
FROM daily_activities;

-- Step 7: Grant permissions on view
GRANT ALL ON daily_activities_with_computed TO anon, authenticated;

-- Step 8: Insert test data to verify everything works
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
(20, 12, 15, 8, 5, 12);

-- Step 9: Verify the structure
SELECT 'Table Structure:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'daily_activities'
ORDER BY ordinal_position;

-- Step 10: Test the view
SELECT 'View Test:' as info;
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

SELECT 'Complete fix applied successfully!' as status; 