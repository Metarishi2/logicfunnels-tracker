-- Step-by-step fix for database schema
-- Run each section separately to ensure it works

-- STEP 1: Check current state
SELECT 'STEP 1: Checking current state' as step;
SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_name = 'daily_activities';

-- STEP 2: Drop everything completely
SELECT 'STEP 2: Dropping everything' as step;
DROP VIEW IF EXISTS daily_activities_with_computed CASCADE;
DROP TABLE IF EXISTS daily_activities CASCADE;

-- STEP 3: Verify table is gone
SELECT 'STEP 3: Verifying table is dropped' as step;
SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_name = 'daily_activities';

-- STEP 4: Create table with correct schema
SELECT 'STEP 4: Creating new table' as step;
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

-- STEP 5: Verify table structure
SELECT 'STEP 5: Verifying table structure' as step;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'daily_activities'
ORDER BY ordinal_position;

-- STEP 6: Create indexes
SELECT 'STEP 6: Creating indexes' as step;
CREATE INDEX idx_daily_activities_submitted_at ON daily_activities(submitted_at);

-- STEP 7: Enable RLS
SELECT 'STEP 7: Setting up RLS' as step;
ALTER TABLE daily_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert" ON daily_activities FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated read" ON daily_activities FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow public read" ON daily_activities FOR SELECT USING (true);

-- STEP 8: Grant permissions
SELECT 'STEP 8: Granting permissions' as step;
GRANT ALL ON daily_activities TO anon, authenticated;

-- STEP 9: Create view
SELECT 'STEP 9: Creating view' as step;
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

GRANT ALL ON daily_activities_with_computed TO anon, authenticated;

-- STEP 10: Test insert
SELECT 'STEP 10: Testing insert' as step;
INSERT INTO daily_activities (
    dms_sent, 
    connection_requests_sent, 
    comments_made, 
    followups_made, 
    calls_booked, 
    replies_received
) VALUES (10, 5, 8, 3, 2, 4);

-- STEP 11: Test view
SELECT 'STEP 11: Testing view' as step;
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

SELECT 'All steps completed successfully!' as status; 