# Analytics Dashboard Documentation

## Overview

The Analytics Dashboard provides comprehensive insights into your team's performance with detailed metrics, charts, and comparisons. It includes all the requested analytics features:

- **Daily, Weekly, Monthly Breakdowns**
- **Key Performance Metrics**
- **This Week vs Last Week Comparisons**
- **Top Performing Days**
- **Interactive Charts and Visualizations**

## Features

### 1. Key Metrics Dashboard

The analytics dashboard displays six key performance indicators:

- **Total DMs Sent**: Total direct messages sent across all users/clients
- **Total Calls Booked**: Total calls successfully booked
- **Call Booking Rate**: Calls booked ÷ DMs sent (percentage)
- **Response Rate**: Replies ÷ DMs sent (percentage)
- **Follow-up to Booking Rate**: Calls booked per follow-up (percentage)
- **Total Follow-ups**: Total follow-up messages sent

Each metric card shows:
- Current value
- Percentage change from previous period
- Visual indicator (up/down arrow)
- Color-coded change indicators (green for positive, red for negative)

### 2. Time-based Breakdowns

#### Daily Breakdown
- Shows activity for each day in the selected time range
- Displays DMs sent, calls booked, and replies received
- Interactive bar chart with hover tooltips

#### Weekly Breakdown
- Aggregates data by week
- Area chart showing stacked DMs and calls
- Helps identify weekly patterns and trends

#### Monthly Breakdown
- Monthly aggregation of all metrics
- Bar chart comparing DMs, calls, and replies by month
- Useful for long-term trend analysis

### 3. Performance Trends

#### Response Rate Trend
- Line chart showing response rate over time
- Includes call booking rate for comparison
- Helps identify patterns in engagement

#### Weekly Performance
- Area chart showing weekly activity levels
- Stacked visualization of DMs and calls
- Easy to spot high and low performing weeks

### 4. Top Performers

#### Top Days by Activity
- Ranks days by total activity (DMs + calls)
- Shows top 5 performing days
- Displays DMs, calls, and response rate for each day

#### Top Days by Response Rate
- Ranks days by response rate percentage
- Shows top 5 days with highest engagement
- Includes DMs sent for context

### 5. This Week vs Last Week Comparison

Detailed side-by-side comparison including:
- DMs sent comparison
- Calls booked comparison
- Response rate comparison
- Call booking rate comparison
- Percentage change indicators

### 6. Filtering and Controls

#### Time Range Selection
- Last 7 days
- Last 30 days (default)
- Last 90 days

#### User Filtering
- View analytics for all users
- Filter by specific user
- Compare individual performance

#### Client Filtering
- View analytics for all clients
- Filter by specific client
- Analyze client-specific performance

## How to Access Analytics

### For Administrators

1. **Main Analytics Page**: Navigate to `/analytics` for the full analytics dashboard
2. **Admin Dashboard Tab**: Use the "Analytics" tab in the Admin Dashboard for quick overview
3. **Navigation**: Click "Analytics" in the main navigation menu

### For Users

- Users can view their own analytics through the User Dashboard
- Analytics are filtered to show only their own data
- Access via "My Dashboard" in the navigation

## Data Requirements

The analytics system works with the existing `daily_activities` table and requires:

- **DMs sent**: Number of direct messages sent
- **Calls booked**: Number of calls successfully booked
- **Replies received**: Number of replies received
- **Follow-ups made**: Number of follow-up messages sent
- **Connection requests**: Number of connection requests sent
- **Comments made**: Number of comments made

## Sample Data

To test the analytics with realistic data, run the `add_sample_data.sql` script:

```sql
-- Connect to your database and run:
\i add_sample_data.sql
```

This will create:
- 4 sample users
- 4 sample clients
- 30 days of realistic activity data
- Varying performance patterns (weekdays vs weekends)
- High and low performing days for testing

## Technical Implementation

### Components

- **Analytics.js**: Main analytics component with charts and metrics
- **Recharts**: Chart library for data visualization
- **date-fns**: Date manipulation and formatting
- **Supabase**: Database queries and real-time updates

### Key Functions

- `processAnalyticsData()`: Processes raw data into chart-ready format
- `aggregateDayStats()`: Calculates metrics for a given time period
- `calculateChange()`: Computes percentage changes between periods
- `loadAnalytics()`: Fetches and processes analytics data

### Performance Considerations

- Data is cached and processed efficiently
- Charts are responsive and optimized for mobile
- Queries are optimized with proper indexing
- Real-time updates are supported

## Customization

### Adding New Metrics

To add new metrics, modify the `aggregateDayStats()` function in `Analytics.js`:

```javascript
const aggregateDayStats = (activities) => {
  // Add your new metric calculation here
  const newMetric = activities.reduce((sum, activity) => 
    sum + (activity.new_field || 0), 0);
  
  return {
    // ... existing metrics
    newMetric: newMetric
  };
};
```

### Custom Charts

Add new charts by importing additional components from Recharts:

```javascript
import { PieChart, Pie, Cell } from 'recharts';

// Add your custom chart component
```

### Styling

Analytics styles are in `src/index.css` under the `.analytics-*` classes. Customize colors, spacing, and layout as needed.

## Troubleshooting

### Common Issues

1. **No data showing**: Ensure you have activity data in the database
2. **Charts not loading**: Check browser console for JavaScript errors
3. **Slow performance**: Verify database indexes are properly set
4. **Filtering not working**: Check user permissions and data access

### Debug Mode

Enable debug logging by adding to browser console:

```javascript
localStorage.setItem('debug', 'analytics');
```

## Future Enhancements

Potential improvements for the analytics system:

- **Export functionality**: PDF/Excel reports
- **Email notifications**: Weekly/monthly reports
- **Goal setting**: Set and track performance targets
- **Predictive analytics**: Forecast future performance
- **Team comparisons**: Compare user performance
- **Custom date ranges**: Flexible time period selection
- **Advanced filtering**: More granular data filtering options

## Support

For issues or questions about the analytics system:

1. Check the browser console for error messages
2. Verify database connectivity
3. Ensure all required data fields are populated
4. Review the sample data script for reference

The analytics dashboard provides comprehensive insights to help optimize your team's performance and identify areas for improvement.
