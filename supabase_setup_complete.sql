-- Complete Supabase Setup for Daily Activity Dashboard
-- Run this in your Supabase SQL Editor

-- Drop existing table if it exists (be careful in production!)
-- DROP TABLE IF EXISTS daily_activities CASCADE;

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

-- Create a function to get daily breakdown
CREATE OR REPLACE FUNCTION get_daily_breakdown()
RETURNS TABLE (
    date DATE,
    weekday TEXT,
    dms_sent INTEGER,
    connection_requests_sent INTEGER,
    comments_made INTEGER,
    followups_made INTEGER,
    calls_booked INTEGER,
    replies_received INTEGER,
    total_activities INTEGER
) AS $$
BEGIN
    RETURN QUERY
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
END;
$$ LANGUAGE plpgsql;

-- Create a function to get weekly breakdown
CREATE OR REPLACE FUNCTION get_weekly_breakdown()
RETURNS TABLE (
    week_start DATE,
    week_number INTEGER,
    dms_sent INTEGER,
    connection_requests_sent INTEGER,
    comments_made INTEGER,
    followups_made INTEGER,
    calls_booked INTEGER,
    replies_received INTEGER,
    total_activities INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        date_trunc('week', submitted_at)::DATE as week_start,
        week_number,
        SUM(dms_sent) as dms_sent,
        SUM(connection_requests_sent) as connection_requests_sent,
        SUM(comments_made) as comments_made,
        SUM(followups_made) as followups_made,
        SUM(calls_booked) as calls_booked,
        SUM(replies_received) as replies_received,
        SUM(total_activities) as total_activities
    FROM daily_activities 
    GROUP BY date_trunc('week', submitted_at), week_number
    ORDER BY week_start DESC;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get monthly breakdown
CREATE OR REPLACE FUNCTION get_monthly_breakdown()
RETURNS TABLE (
    month_start DATE,
    month_number INTEGER,
    year_number INTEGER,
    dms_sent INTEGER,
    connection_requests_sent INTEGER,
    comments_made INTEGER,
    followups_made INTEGER,
    calls_booked INTEGER,
    replies_received INTEGER,
    total_activities INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        date_trunc('month', submitted_at)::DATE as month_start,
        month_number,
        year_number,
        SUM(dms_sent) as dms_sent,
        SUM(connection_requests_sent) as connection_requests_sent,
        SUM(comments_made) as comments_made,
        SUM(followups_made) as followups_made,
        SUM(calls_booked) as calls_booked,
        SUM(replies_received) as replies_received,
        SUM(total_activities) as total_activities
    FROM daily_activities 
    GROUP BY date_trunc('month', submitted_at), month_number, year_number
    ORDER BY month_start DESC;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get total breakdown
CREATE OR REPLACE FUNCTION get_total_breakdown()
RETURNS TABLE (
    dms_sent INTEGER,
    connection_requests_sent INTEGER,
    comments_made INTEGER,
    followups_made INTEGER,
    calls_booked INTEGER,
    replies_received INTEGER,
    total_activities INTEGER,
    total_submissions INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        SUM(dms_sent) as dms_sent,
        SUM(connection_requests_sent) as connection_requests_sent,
        SUM(comments_made) as comments_made,
        SUM(followups_made) as followups_made,
        SUM(calls_booked) as calls_booked,
        SUM(replies_received) as replies_received,
        SUM(total_activities) as total_activities,
        COUNT(*) as total_submissions
    FROM daily_activities;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get this week vs last week comparison
CREATE OR REPLACE FUNCTION get_week_comparison()
RETURNS TABLE (
    metric TEXT,
    this_week INTEGER,
    last_week INTEGER,
    change_percentage DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    WITH this_week_data AS (
        SELECT 
            SUM(dms_sent) as dms_sent,
            SUM(connection_requests_sent) as connection_requests_sent,
            SUM(comments_made) as comments_made,
            SUM(followups_made) as followups_made,
            SUM(calls_booked) as calls_booked,
            SUM(replies_received) as replies_received,
            SUM(total_activities) as total_activities
        FROM daily_activities 
        WHERE submitted_at >= date_trunc('week', CURRENT_DATE)
    ),
    last_week_data AS (
        SELECT 
            SUM(dms_sent) as dms_sent,
            SUM(connection_requests_sent) as connection_requests_sent,
            SUM(comments_made) as comments_made,
            SUM(followups_made) as followups_made,
            SUM(calls_booked) as calls_booked,
            SUM(replies_received) as replies_received,
            SUM(total_activities) as total_activities
        FROM daily_activities 
        WHERE submitted_at >= date_trunc('week', CURRENT_DATE - INTERVAL '1 week')
        AND submitted_at < date_trunc('week', CURRENT_DATE)
    )
    SELECT 
        'DMs Sent' as metric,
        COALESCE(tw.dms_sent, 0) as this_week,
        COALESCE(lw.dms_sent, 0) as last_week,
        CASE 
            WHEN COALESCE(lw.dms_sent, 0) > 0 THEN 
                ROUND(((COALESCE(tw.dms_sent, 0) - lw.dms_sent)::DECIMAL / lw.dms_sent::DECIMAL) * 100, 2)
            ELSE 0 
        END as change_percentage
    FROM this_week_data tw, last_week_data lw
    UNION ALL
    SELECT 
        'Connection Requests' as metric,
        COALESCE(tw.connection_requests_sent, 0) as this_week,
        COALESCE(lw.connection_requests_sent, 0) as last_week,
        CASE 
            WHEN COALESCE(lw.connection_requests_sent, 0) > 0 THEN 
                ROUND(((COALESCE(tw.connection_requests_sent, 0) - lw.connection_requests_sent)::DECIMAL / lw.connection_requests_sent::DECIMAL) * 100, 2)
            ELSE 0 
        END as change_percentage
    FROM this_week_data tw, last_week_data lw
    UNION ALL
    SELECT 
        'Comments Made' as metric,
        COALESCE(tw.comments_made, 0) as this_week,
        COALESCE(lw.comments_made, 0) as last_week,
        CASE 
            WHEN COALESCE(lw.comments_made, 0) > 0 THEN 
                ROUND(((COALESCE(tw.comments_made, 0) - lw.comments_made)::DECIMAL / lw.comments_made::DECIMAL) * 100, 2)
            ELSE 0 
        END as change_percentage
    FROM this_week_data tw, last_week_data lw
    UNION ALL
    SELECT 
        'Follow-ups Made' as metric,
        COALESCE(tw.followups_made, 0) as this_week,
        COALESCE(lw.followups_made, 0) as last_week,
        CASE 
            WHEN COALESCE(lw.followups_made, 0) > 0 THEN 
                ROUND(((COALESCE(tw.followups_made, 0) - lw.followups_made)::DECIMAL / lw.followups_made::DECIMAL) * 100, 2)
            ELSE 0 
        END as change_percentage
    FROM this_week_data tw, last_week_data lw
    UNION ALL
    SELECT 
        'Calls Booked' as metric,
        COALESCE(tw.calls_booked, 0) as this_week,
        COALESCE(lw.calls_booked, 0) as last_week,
        CASE 
            WHEN COALESCE(lw.calls_booked, 0) > 0 THEN 
                ROUND(((COALESCE(tw.calls_booked, 0) - lw.calls_booked)::DECIMAL / lw.calls_booked::DECIMAL) * 100, 2)
            ELSE 0 
        END as change_percentage
    FROM this_week_data tw, last_week_data lw
    UNION ALL
    SELECT 
        'Replies Received' as metric,
        COALESCE(tw.replies_received, 0) as this_week,
        COALESCE(lw.replies_received, 0) as last_week,
        CASE 
            WHEN COALESCE(lw.replies_received, 0) > 0 THEN 
                ROUND(((COALESCE(tw.replies_received, 0) - lw.replies_received)::DECIMAL / lw.replies_received::DECIMAL) * 100, 2)
            ELSE 0 
        END as change_percentage
    FROM this_week_data tw, last_week_data lw
    UNION ALL
    SELECT 
        'Total Activities' as metric,
        COALESCE(tw.total_activities, 0) as this_week,
        COALESCE(lw.total_activities, 0) as last_week,
        CASE 
            WHEN COALESCE(lw.total_activities, 0) > 0 THEN 
                ROUND(((COALESCE(tw.total_activities, 0) - lw.total_activities)::DECIMAL / lw.total_activities::DECIMAL) * 100, 2)
            ELSE 0 
        END as change_percentage
    FROM this_week_data tw, last_week_data lw;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get top days based on activity and response
CREATE OR REPLACE FUNCTION get_top_days_by_activity(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    date DATE,
    weekday TEXT,
    total_activities INTEGER,
    replies_received INTEGER,
    response_rate DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(submitted_at) as date,
        weekday,
        SUM(total_activities) as total_activities,
        SUM(replies_received) as replies_received,
        CASE 
            WHEN SUM(dms_sent) > 0 THEN 
                ROUND((SUM(replies_received)::DECIMAL / SUM(dms_sent)::DECIMAL) * 100, 2)
            ELSE 0 
        END as response_rate
    FROM daily_activities 
    GROUP BY DATE(submitted_at), weekday
    ORDER BY total_activities DESC, response_rate DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Insert some sample data for testing (optional)
-- INSERT INTO daily_activities (dms_sent, connection_requests_sent, comments_made, followups_made, calls_booked, replies_received) VALUES
-- (10, 5, 8, 3, 2, 4),
-- (15, 8, 12, 5, 3, 7),
-- (8, 3, 6, 2, 1, 3),
-- (20, 12, 15, 8, 5, 12),
-- (12, 6, 9, 4, 2, 6);

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION calculate_rates() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_weekly_comparison() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_top_performing_days(INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_daily_breakdown() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_weekly_breakdown() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_monthly_breakdown() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_total_breakdown() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_week_comparison() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_top_days_by_activity(INTEGER) TO anon, authenticated;

-- Verify the setup
SELECT 'Setup completed successfully!' as status; 