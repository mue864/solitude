# Insights Page Documentation

## Overview

The Insights page provides users with comprehensive analytics and productivity insights based on their session and flow data. It features a modern, minimal design with interactive charts, personal bests tracking, and actionable recommendations.

## Features

### 1. Productivity Score Card

- **Purpose**: Displays overall productivity score (0-100) with animated progress bar
- **Components**:
  - Animated progress bar with color coding (green ≥80, yellow ≥60, red <60)
  - Lottie animations for milestones (trophy for ≥90 score)
  - Key metrics: Total sessions, current streak, best streak
- **Data Source**: `userStats` from session intelligence store
- **Animations**: Progress bar animates on load with cubic easing

### 2. Personal Bests Section

- **Purpose**: Shows user's achievements and records
- **Layout**: Two-column design (This Week vs All Time)
- **This Week Metrics**:
  - Best day (highest focus time)
  - Most sessions (highest minutes in a day)
  - Average focus quality
- **All Time Metrics**:
  - Best streak (longest consecutive days)
  - Total sessions count
  - Success rate percentage
- **Motivational Elements**: Next milestone indicator and encouraging message

### 3. Weekly Focus Time Chart

- **Type**: Bar chart using react-native-chart-kit
- **Data**: Last 7 days of focus time in minutes
- **Features**:
  - Responsive design with custom width calculations
  - Color-coded bars (blue theme)
  - Summary showing best day and total minutes
- **Chart Config**: Custom styling with rounded corners and proper spacing

### 4. Focus Quality Trend Chart

- **Type**: Line chart with bezier curves
- **Data**: Average focus quality over last 7 days
- **Features**:
  - Smooth bezier curves for visual appeal
  - Green color theme
  - Trend analysis and average quality display
- **Interactivity**: Dots on data points for better UX

### 5. Focus by Session Type Pie Chart

- **Type**: Pie chart showing time distribution by session type
- **Data**: Aggregated focus time by session type (Classic, Deep Focus, Quick Task, etc.)
- **Features**:
  - Color-coded segments with 6-color palette
  - Detailed legend showing minutes and session count
  - Most used session type indicator
- **Data Processing**: Filters completed sessions only, converts seconds to minutes

### 6. Flow Distribution Pie Chart

- **Type**: Pie chart showing flow completion distribution
- **Data**: Most completed flows with completion counts
- **Features**:
  - Limited to top 4 flows for readability
  - Color-coded segments
  - Simple legend with flow names and counts

### 7. Success Rates Section

- **Purpose**: Shows completion rates for different flows
- **Components**:
  - Progress bars for each flow
  - Color-coded based on success rate (green ≥80%, yellow ≥60%, red <60%)
  - Percentage display
- **Data**: Top 3 flows by success rate

### 8. Flow Analytics Section

- **Layout**: Two-column design
- **Most Completed**: Shows top 3 flows by completion count
- **Best Streaks**: Shows top 3 flows by streak length
- **Visual Elements**: Color-coded badges (blue for counts, green for streaks)

### 9. Recommendations Section

- **Purpose**: Provides actionable insights and suggestions
- **Components**:
  - Gradient background for visual distinction
  - Bulb icon for idea representation
  - Actionable recommendation with reason
  - Interactive button to try recommended session
- **Data Source**: AI-generated recommendations based on user patterns

## Technical Implementation

### State Management

- **Store**: `useSessionIntelligence` from `store/sessionIntelligence.ts`
- **Data Flow**: Real-time updates from session records and flow completions
- **Persistence**: AsyncStorage via Zustand persist middleware

### Chart Library

- **Primary**: `react-native-chart-kit`
- **Components Used**: `BarChart`, `LineChart`, `PieChart`
- **Customization**: Extensive chart configuration for consistent styling

### Animations

- **Progress Bar**: Animated.Value with cubic easing
- **Lottie**: Trophy and confetti animations for milestones
- **Performance**: Optimized with useRef and proper cleanup

### Responsive Design

- **Screen Width**: Dynamic calculations for chart widths
- **Dark Mode**: Full support with semantic color tokens
- **Typography**: Consistent Sora font family usage

## Data Processing

### Session Type Analytics

```typescript
const sessionTypeData = React.useMemo(() => {
  const typeStats: Record<string, { totalTime: number; count: number }> = {};

  sessionRecords.forEach((record) => {
    if (record.completed) {
      if (!typeStats[record.sessionType]) {
        typeStats[record.sessionType] = { totalTime: 0, count: 0 };
      }
      typeStats[record.sessionType].totalTime += record.duration || 0;
      typeStats[record.sessionType].count += 1;
    }
  });

  return Object.entries(typeStats)
    .sort(([, a], [, b]) => b.totalTime - a.totalTime)
    .slice(0, 6)
    .map(([type, stats], index) => ({
      name: type.length > 12 ? type.substring(0, 12) + "..." : type,
      totalTime: Math.round(stats.totalTime / 60),
      count: stats.count,
      color: colors[index] || "#6B7280",
    }));
}, [sessionRecords]);
```

### Weekly Data Processing

```typescript
const weekData = Array(7)
  .fill(0)
  .map((_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - i));
    const dayStr = d.toLocaleDateString("en-US", { weekday: "short" });
    const total = sessionRecords
      .filter(
        (r) =>
          new Date(r.timestamp).toDateString() === d.toDateString() &&
          r.completed
      )
      .reduce((sum, r) => sum + (r.duration || 0), 0);
    return {
      day: dayStr,
      total: Math.round(total / 60),
    };
  });
```

## Performance Optimizations

### Memoization

- **useMemo**: For expensive data calculations (session type data, weekly data)
- **React.memo**: For chart components to prevent unnecessary re-renders

### Chart Rendering

- **Conditional Rendering**: Charts only render when data is available
- **Width Calculations**: Optimized chart widths to prevent clipping
- **Background**: Transparent backgrounds for seamless integration

### Animation Performance

- **useNativeDriver**: Used where possible for smooth animations
- **Proper Cleanup**: Animation cleanup in useEffect to prevent memory leaks

## Accessibility

### Text Scaling

- **Font Sizes**: Appropriate sizes for readability
- **Contrast**: High contrast ratios for text visibility
- **Dark Mode**: Full support with semantic color tokens

### Touch Targets

- **Button Sizes**: Minimum 44px touch targets
- **Spacing**: Adequate spacing between interactive elements

## Future Enhancements

### Potential Features

1. **Export Functionality**: Allow users to export insights as PDF/CSV
2. **Goal Setting**: Let users set weekly/monthly targets
3. **Comparative Analytics**: Week-over-week or month-over-month comparisons
4. **Time-of-Day Analysis**: Show when users are most productive
5. **Badge System**: Achievement badges for milestones

### Performance Improvements

1. **Virtual Scrolling**: For large datasets
2. **Chart Caching**: Cache chart data for faster rendering
3. **Lazy Loading**: Load charts on demand

## File Structure

```
app/(main)/insights.tsx          # Main Insights page component
store/sessionIntelligence.ts     # Data store and analytics logic
assets/lottie/                   # Animation files
  ├── trophy.json
  └── confetti.json
```

## Dependencies

- `react-native-chart-kit`: Chart rendering
- `lottie-react-native`: Animations
- `@expo/vector-icons`: Icons
- `zustand`: State management
- `@react-native-async-storage/async-storage`: Data persistence

## Usage Notes

- The page automatically updates when new sessions are recorded
- All charts are responsive and work on different screen sizes
- Dark mode support is built-in and follows system preferences
- Data is persisted locally and survives app restarts
