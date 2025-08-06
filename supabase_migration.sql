-- Migration script to update existing daily_activities table
-- Run this in your Supabase SQL Editor to add the new fields

-- First, let's check what columns currently exist
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'daily_activities';

-- Add the new required columns
ALTER TABLE daily_activities 
ADD COLUMN IF NOT EXISTS connection_requests_sent INTEGER NOT NULL DEFAULT 0 CHECK (connection_requests_sent >= 0);

-- Update the existing column name from followups_scheduled to followups_made
ALTER TABLE daily_activities 
RENAME COLUMN followups_scheduled TO followups_made;

-- Add the new computed columns if they don't exist
ALTER TABLE daily_activities ADD COLUMN IF NOT EXISTS weekday TEXT GENERATED ALWAYS AS (
    CASE EXTRACT(DOW FROM submitted_at)
        WHEN 0 THEN 'Sunday'
        WHEN 1 THEN 'Monday'
        WHEN 2 THEN 'Tuesday'
        WHEN 3 THEN 'Wednesday'
        WHEN 4 THEN 'Thursday'
        WHEN 5 THEN 'Friday'
        WHEN 6 THEN 'Saturday'
    END
) STORED;

ALTER TABLE daily_activities ADD COLUMN IF NOT EXISTS week_number INTEGER GENERATED ALWAYS AS (
    EXTRACT(WEEK FROM submitted_at)
) STORED;

ALTER TABLE daily_activities ADD COLUMN IF NOT EXISTS month_number INTEGER GENERATED ALWAYS AS (
    EXTRACT(MONTH FROM submitted_at)
) STORED;

ALTER TABLE daily_activities ADD COLUMN IF NOT EXISTS year_number INTEGER GENERATED ALWAYS AS (
    EXTRACT(YEAR FROM submitted_at)
) STORED;

-- Update the total_activities computed column
ALTER TABLE daily_activities DROP COLUMN IF EXISTS total_activities;
ALTER TABLE daily_activities ADD COLUMN total_activities INTEGER GENERATED ALWAYS AS (
    dms_sent + connection_requests_sent + comments_made + followups_made + COALESCE(calls_booked, 0) + replies_received
) STORED;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_daily_activities_submitted_at ON daily_activities(submitted_at);
CREATE INDEX IF NOT EXISTS idx_daily_activities_weekday ON daily_activities(weekday);
CREATE INDEX IF NOT EXISTS idx_daily_activities_week_number ON daily_activities(week_number);
CREATE INDEX IF NOT EXISTS idx_daily_activities_month_number ON daily_activities(month_number);
CREATE INDEX IF NOT EXISTS idx_daily_activities_year_number ON daily_activities(year_number);

-- Update any existing records to have the new field
UPDATE daily_activities 
SET connection_requests_sent = 0 
WHERE connection_requests_sent IS NULL;

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'daily_activities'
ORDER BY ordinal_position;

-- Test the table structure
SELECT * FROM daily_activities LIMIT 1; 