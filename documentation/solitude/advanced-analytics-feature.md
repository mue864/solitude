# Advanced Analytics Feature Documentation

## Overview

The Advanced Analytics feature provides Pro users with comprehensive productivity insights, detailed performance metrics, and intelligent recommendations. This feature goes beyond basic analytics to offer deep insights into productivity patterns, performance trends, and actionable recommendations for improvement.

## Features

### Core Functionality

- **Performance Insights**: Advanced productivity scoring and trend analysis
- **Detailed Metrics**: Comprehensive session and flow analytics
- **Productivity Patterns**: Peak performance hour analysis and streak tracking
- **Smart Recommendations**: AI-powered productivity suggestions
- **Timeframe Analysis**: Week, month, and year-based analytics
- **Pro Feature Gating**: Exclusive to Pro users with upgrade prompts

### Analytics Components

- **Productivity Score**: Weighted performance metric (0-100)
- **Focus Consistency**: Session consistency analysis
- **Flow Efficiency**: Flow completion efficiency metrics
- **Peak Performance Hours**: Optimal productivity time identification
- **Streak Analysis**: Current and best streak tracking
- **Trend Indicators**: Performance trend visualization

## Technical Implementation

### Store Integration

#### SettingsStore (`store/settingsStore.ts`)

**Analytics Types:**

```typescript
export interface ProFeatures {
  // ... other features
  advancedAnalytics: boolean;
}

// Analytics toggle action
toggleAdvancedAnalytics: () => void;
```

#### SessionIntelligence Store (`store/sessionIntelligence.ts`)

**Data Sources:**

```typescript
interface SessionIntelligenceState {
  sessions: Session[];
  flows: Flow[];
  insights: Insight[];
  // ... other state
}
```

### Component Architecture

#### Settings Page Integration (`app/(main)/settings.tsx`)

**Advanced Analytics Section:**

- Analytics status display with active/inactive indicator
- Feature preview with key metrics
- View Analytics and Enable/Disable buttons
- Pro feature gating for non-pro users

**State Management:**

```typescript
const [showAdvancedAnalytics, setShowAdvancedAnalytics] = useState(false);
```

#### AdvancedAnalyticsModal (`components/modals/AdvancedAnalyticsModal.tsx`)

**Modal Features:**

- Full-screen modal with slide animation
- Timeframe selector (Week, Month, Year)
- Real-time metric calculations
- Interactive analytics dashboard

**Key Components:**

- TimeframeSelector: Week/Month/Year selection
- PerformanceInsights: Main performance metrics
- DetailedMetrics: Comprehensive analytics
- ProductivityPatterns: Pattern analysis
- Recommendations: Smart suggestions

## Analytics Calculations

### Productivity Score

```typescript
const productivityScore = Math.round(
  avgFocusTime * 0.4 + completionRate * 100 * 0.4 + avgQuality * 0.2
);
```

- **Weighting**: 40% focus time, 40% completion rate, 20% quality
- **Range**: 0-100
- **Formula**: Weighted average of key performance indicators

### Focus Consistency

```typescript
const variance =
  focusTimes.reduce((sum, time) => sum + Math.pow(time - avgFocus, 2), 0) /
  focusTimes.length;
const focusConsistency = Math.round(
  100 - (Math.sqrt(variance) / avgFocus) * 100
);
```

- **Calculation**: Standard deviation of focus times
- **Range**: 0-100 (higher = more consistent)
- **Purpose**: Measures session consistency

### Flow Efficiency

```typescript
const flowEfficiency = Math.round(
  flowCompletionRate * 100 * (avgFlowDuration > 0 ? 60 / avgFlowDuration : 1)
);
```

- **Formula**: Completion rate × efficiency factor
- **Range**: 0-100
- **Purpose**: Measures flow completion efficiency

### Peak Performance Hours

```typescript
const avgHourProductivity = hourProductivity.map((total, hour) =>
  hourCount[hour] > 0 ? total / hourCount[hour] : 0
);
const peakHour = avgHourProductivity.indexOf(Math.max(...avgHourProductivity));
```

- **Calculation**: Average productivity by hour
- **Output**: Hour (0-23) of peak performance
- **Purpose**: Identifies optimal work times

### Streak Analysis

```typescript
// Calculate consecutive days with sessions
for (let i = 0; i < uniqueDates.length; i++) {
  if (
    i === 0 ||
    new Date(uniqueDates[i]).getTime() -
      new Date(uniqueDates[i - 1]).getTime() ===
      86400000
  ) {
    tempStreak++;
    maxStreak = Math.max(maxStreak, tempStreak);
  } else {
    tempStreak = 1;
  }
}
```

- **Current Streak**: Consecutive days with sessions
- **Best Streak**: Longest consecutive streak
- **Purpose**: Motivation and consistency tracking

## User Interface

### Settings Page Layout

#### Pro Users

1. **Analytics Status Card**
   - Active/Inactive status indicator
   - Feature list with checkmarks
   - Visual status feedback

2. **Key Features Preview**
   - Productivity Score preview
   - Focus Consistency preview
   - Flow Efficiency preview

3. **Analytics Management Actions**
   - View Analytics button (blue)
   - Enable/Disable toggle (gray)

#### Non-Pro Users

- Locked analytics section with upgrade prompt
- Pro badge and lock icon
- Upgrade modal trigger

### AdvancedAnalyticsModal

#### Header

- Close button (X)
- Title: "Advanced Analytics"
- Clean, minimal design

#### Content Sections

1. **Timeframe Selector**
   - Week, Month, Year options
   - Visual selection feedback
   - Real-time data filtering

2. **Performance Insights**
   - Productivity Score with trend
   - Focus Consistency with trend
   - Flow Efficiency with trend

3. **Detailed Metrics**
   - Total Sessions and Flows
   - Average Focus Time
   - Completion Rate
   - Grid layout for easy scanning

4. **Productivity Patterns**
   - Peak Performance Hour
   - Current and Best Streaks
   - Pattern analysis insights

5. **Smart Recommendations**
   - Personalized suggestions
   - Actionable advice
   - Color-coded categories

6. **Analytics Toggle**
   - Enable/Disable switch
   - Status indicator
   - Real-time updates

## Analytics Metrics

### Performance Insights

#### Productivity Score

- **Description**: Weighted performance metric
- **Range**: 0-100
- **Factors**: Focus time, completion rate, quality
- **Trend**: Up/down indicators

#### Focus Consistency

- **Description**: Session consistency analysis
- **Range**: 0-100
- **Calculation**: Standard deviation analysis
- **Purpose**: Consistency measurement

#### Flow Efficiency

- **Description**: Flow completion efficiency
- **Range**: 0-100
- **Formula**: Completion rate × efficiency factor
- **Purpose**: Flow performance analysis

### Detailed Metrics

#### Session Analytics

- **Total Sessions**: Count of completed sessions
- **Average Focus Time**: Mean session duration
- **Completion Rate**: Percentage of completed sessions
- **Average Quality**: Mean session quality score

#### Flow Analytics

- **Total Flows**: Count of completed flows
- **Flow Efficiency**: Completion efficiency metric
- **Flow Duration**: Average flow completion time
- **Flow Success Rate**: Percentage of successful flows

### Productivity Patterns

#### Peak Performance Analysis

- **Peak Hour**: Most productive time of day
- **Hourly Productivity**: Productivity by hour
- **Pattern Recognition**: Daily productivity patterns

#### Streak Analysis

- **Current Streak**: Consecutive days with sessions
- **Best Streak**: Longest consecutive streak
- **Streak Motivation**: Encouragement based on streaks

## Smart Recommendations

### Recommendation Types

#### Performance Optimization

- **Peak Hours**: Schedule important tasks during peak hours
- **Consistency**: Maintain daily focus sessions
- **Efficiency**: Optimize flow completion rates

#### Productivity Enhancement

- **Streak Maintenance**: Keep current streaks going
- **Quality Improvement**: Focus on session quality
- **Time Management**: Optimize session durations

#### Pattern-Based Suggestions

- **Daily Patterns**: Recommendations based on daily habits
- **Weekly Trends**: Suggestions for weekly improvements
- **Long-term Goals**: Long-term productivity strategies

## Timeframe Analysis

### Week Analysis

- **Duration**: Last 7 days
- **Focus**: Recent performance trends
- **Use Case**: Short-term optimization

### Month Analysis

- **Duration**: Last 30 days
- **Focus**: Monthly patterns and trends
- **Use Case**: Medium-term planning

### Year Analysis

- **Duration**: Last 365 days
- **Focus**: Long-term trends and patterns
- **Use Case**: Annual review and planning

## Styling & Design

### NativeWind Integration

- Consistent use of Tailwind classes
- Dark mode support throughout
- Responsive design patterns
- Gap-based spacing (no space-y classes)

### Color System

- Semantic color tokens
- Dark mode variants
- Metric-specific color themes
- Consistent with app's design system

### Typography

- Sora font family throughout
- Consistent text sizing and weights
- Proper contrast ratios
- Monospace font for numbers

### Layout Patterns

- Card-based design
- Minimal spacing and padding
- Consistent border radius (rounded-2xl)
- Subtle shadows and borders

## Performance Optimizations

### State Management

- Efficient Zustand updates
- Selective re-rendering
- Memoized calculations
- Optimized data filtering

### Modal Performance

- Lazy loading of analytics
- Efficient metric calculations
- Smooth animations and transitions
- Optimized list rendering

### Memory Management

- Proper cleanup of modal state
- Efficient data structure usage
- Optimized calculation caching
- Minimal re-renders

## Error Handling

### Data Validation

- Session data validation
- Flow data validation
- Metric calculation fallbacks
- Empty state handling

### Store Errors

- AsyncStorage operation failures
- Invalid analytics data handling
- Pro feature access violations
- Calculation error recovery

### UI Error States

- Loading states for calculations
- Error messages for failed operations
- Graceful degradation for missing data
- Fallback values for calculations

## Accessibility

### Screen Reader Support

- Proper labels for metrics
- Descriptive text for trends
- Semantic button and input labels
- Analytics value descriptions

### Visual Accessibility

- High contrast color combinations
- Large touch targets for interactions
- Clear visual hierarchy
- Color-blind friendly design

### Keyboard Navigation

- Logical tab order in modal
- Focus indicators for interactive elements
- Keyboard shortcuts where appropriate
- Accessible navigation patterns

## Testing Considerations

### Unit Tests

- Metric calculation accuracy
- Data filtering logic
- Trend calculation functions
- Component rendering

### Integration Tests

- Analytics data persistence
- Pro feature gating
- Modal interactions
- Data validation

### E2E Tests

- Complete analytics workflow
- Timeframe switching
- Metric accuracy verification
- Cross-device consistency

## Future Enhancements

### Planned Features

- **Predictive Analytics**: AI-powered productivity predictions
- **Custom Metrics**: User-defined performance indicators
- **Advanced Visualizations**: Charts and graphs
- **Export Analytics**: PDF/CSV export of analytics
- **Goal Setting**: Analytics-based goal tracking
- **Team Analytics**: Collaborative productivity insights

### Technical Improvements

- **Performance**: Optimize calculation algorithms
- **Storage**: Compress analytics data
- **Real-time**: Live analytics updates
- **Offline**: Offline analytics processing
- **Machine Learning**: ML-powered insights

## Usage Examples

### Enabling Advanced Analytics

```typescript
const { toggleAdvancedAnalytics, proFeatures } = useSettingsStore();

// Enable advanced analytics
if (!proFeatures.advancedAnalytics) {
  toggleAdvancedAnalytics();
}
```

### Accessing Analytics Data

```typescript
const { sessions, flows, insights } = useSessionIntelligence();

// Calculate custom metrics
const totalSessions = sessions.length;
const avgDuration =
  sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length;
```

### Checking Pro Status

```typescript
const { isPro } = useSettingsStore();

if (isPro) {
  // Enable analytics features
} else {
  // Show upgrade prompt
}
```

## Dependencies

### Core Dependencies

- `zustand`: State management
- `@react-native-async-storage/async-storage`: Data persistence
- `expo-router`: Navigation
- `react-native-safe-area-context`: Safe area handling

### UI Dependencies

- `nativewind`: Styling
- `@expo/vector-icons`: Icons
- `react-native`: Core React Native components

### Development Dependencies

- `typescript`: Type safety
- `eslint`: Code linting
- `prettier`: Code formatting

## File Structure

```
app/(main)/settings.tsx                           # Settings page with analytics section
components/modals/AdvancedAnalyticsModal.tsx      # Analytics dashboard modal
store/settingsStore.ts                            # Analytics state management
store/sessionIntelligence.ts                      # Analytics data source
documentation/advanced-analytics-feature.md       # This documentation
```

## Related Documentation

- [Settings Page Documentation](./settings-page.md)
- [Custom Themes Feature Documentation](./custom-themes-feature.md)
- [Notification Schedules Feature Documentation](./notification-schedules-feature.md)
- [Store Architecture Overview](../store/README.md)
- [Component Library Documentation](../components/README.md)
- [Pro Features Implementation](./pro-features.md)
