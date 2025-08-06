-- Create the daily_activities table with all required fields
CREATE TABLE IF NOT EXISTS daily_activities (
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

-- Create computed columns for breakdowns
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

ALTER TABLE daily_activities ADD COLUMN IF NOT EXISTS total_activities INTEGER GENERATED ALWAYS AS (
    dms_sent + connection_requests_sent + comments_made + followups_made + COALESCE(calls_booked, 0) + replies_received
) STORED;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_daily_activities_submitted_at ON daily_activities(submitted_at);
CREATE INDEX IF NOT EXISTS idx_daily_activities_weekday ON daily_activities(weekday);
CREATE INDEX IF NOT EXISTS idx_daily_activities_week_number ON daily_activities(week_number);
CREATE INDEX IF NOT EXISTS idx_daily_activities_month_number ON daily_activities(month_number);
CREATE INDEX IF NOT EXISTS idx_daily_activities_year_number ON daily_activities(year_number);

-- Enable Row Level Security (RLS)
ALTER TABLE daily_activities ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public insert" ON daily_activities FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated read" ON daily_activities FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow public read" ON daily_activities FOR SELECT USING (true);

-- Grant permissions
GRANT ALL ON daily_activities TO anon, authenticated;

-- Create a function to calculate rates
CREATE OR REPLACE FUNCTION calculate_rates()
RETURNS TABLE (
    call_booking_rate DECIMAL,
    response_rate DECIMAL,
    followup_to_booking_rate DECIMAL
) AS $$
BEGIN
    RETURN QUERY
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
END;
$$ LANGUAGE plpgsql;

-- Create a function to get weekly comparison
CREATE OR REPLACE FUNCTION get_weekly_comparison()
RETURNS TABLE (
    current_week_total INTEGER,
    last_week_total INTEGER,
    week_over_week_change DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    WITH current_week AS (
        SELECT SUM(total_activities) as total
        FROM daily_activities 
        WHERE submitted_at >= date_trunc('week', CURRENT_DATE)
    ),
    last_week AS (
        SELECT SUM(total_activities) as total
        FROM daily_activities 
        WHERE submitted_at >= date_trunc('week', CURRENT_DATE - INTERVAL '1 week')
        AND submitted_at < date_trunc('week', CURRENT_DATE)
    )
    SELECT 
        COALESCE(cw.total, 0) as current_week_total,
        COALESCE(lw.total, 0) as last_week_total,
        CASE 
            WHEN COALESCE(lw.total, 0) > 0 THEN 
                ROUND(((COALESCE(cw.total, 0) - lw.total)::DECIMAL / lw.total::DECIMAL) * 100, 2)
            ELSE 0 
        END as week_over_week_change
    FROM current_week cw, last_week lw;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get top performing days
CREATE OR REPLACE FUNCTION get_top_performing_days(limit_count INTEGER DEFAULT 5)
RETURNS TABLE (
    weekday TEXT,
    total_activities INTEGER,
    avg_activities DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        weekday,
        SUM(total_activities) as total_activities,
        ROUND(AVG(total_activities)::DECIMAL, 2) as avg_activities
    FROM daily_activities 
    GROUP BY weekday 
    ORDER BY total_activities DESC 
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql; 