# Settings Page Documentation

## Overview

The Settings page is a comprehensive configuration interface that provides users with control over their app experience. It implements a tiered approach with free and pro features, ensuring users can access essential settings while encouraging upgrades for advanced functionality.

## Features

### Free Tier Features

#### Timer Settings

- **Default Session Duration**: Configure the default focus session length (15, 25, 30, 45, 60 minutes)
- **Break Duration**: Set break time between sessions (5, 10, 15 minutes)
- **Auto-start Next**: Automatically begin the next session after completion

#### Notifications

- **Session Start**: Notify when a focus session begins
- **Session End**: Alert when a session completes
- **Break Reminder**: Remind users to take breaks
- **Daily Summary**: Daily productivity summary (Pro feature)
- **Weekly Summary**: Weekly analytics report (Pro feature)
- **Streak Reminder**: Encourage maintaining streaks

#### Appearance & Behavior

- **Theme**: Light, Dark, or Auto (system preference)
- **Sound**: Enable/disable audio feedback
- **Vibration**: Enable/disable haptic feedback

### Pro Tier Features

#### Custom Timer Durations

- Add custom session durations beyond the standard options
- Remove custom durations
- Automatic sorting of duration options

#### Notification Schedules

- Create custom notification schedules
- Set specific times and days for notifications
- Multiple schedule types: session reminders, break reminders, general reminders
- Enable/disable individual schedules

#### Custom Themes

- Create personalized color themes
- Customize primary, secondary, and accent colors
- Preview themes before applying
- Save and manage multiple themes
- Delete custom themes

#### Advanced Analytics

- Enhanced productivity insights
- Detailed performance metrics
- Custom reporting options

#### Data Management

- **Data Backup**: Automatic cloud backup of settings and data
- **Export Options**: JSON (free) or CSV (pro) format
- **Import Settings**: Restore from exported files
- **Reset to Defaults**: Restore all settings to initial values

#### Accessibility

- **Haptic Feedback**: Enhanced tactile feedback for interactions
- **Reduced Motion**: Minimize animations for accessibility
- **Custom Font Size**: Adjust text size (small, medium, large)

## Technical Implementation

### Store Architecture

#### SettingsStore (`store/settingsStore.ts`)

**State Structure:**

```typescript
interface SettingsState {
  // Free tier settings
  defaultSessionDuration: number;
  breakDuration: number;
  autoStartNext: boolean;
  notifications: NotificationSettings;
  theme: "light" | "dark" | "auto";
  soundEnabled: boolean;
  vibrationEnabled: boolean;

  // Pro tier settings
  proFeatures: ProFeatures;
  isPro: boolean;
}
```

**Key Actions:**

- `updateSessionDuration(duration: number)`: Update default session length
- `updateBreakDuration(duration: number)`: Update break duration
- `toggleAutoStart()`: Toggle auto-start functionality
- `updateNotifications(settings)`: Update notification preferences
- `updateTheme(theme)`: Change app theme
- `toggleSound()`: Toggle audio feedback
- `toggleVibration()`: Toggle haptic feedback
- `upgradeToPro()`: Enable pro features
- `exportSettings(format?)`: Export settings as JSON/CSV
- `importSettings(settings)`: Import settings from file
- `resetToDefaults()`: Reset all settings

**Pro Feature Actions:**

- `addCustomDuration(duration)`: Add custom timer duration
- `removeCustomDuration(duration)`: Remove custom duration
- `addNotificationSchedule(schedule)`: Create notification schedule
- `updateNotificationSchedule(id, schedule)`: Modify existing schedule
- `removeNotificationSchedule(id)`: Delete schedule
- `addCustomTheme(theme)`: Create custom theme
- `updateCustomTheme(id, theme)`: Modify theme
- `removeCustomTheme(id)`: Delete theme
- `toggleAdvancedAnalytics()`: Enable/disable advanced analytics
- `toggleDataBackup()`: Enable/disable cloud backup
- `toggleHapticFeedback()`: Toggle enhanced haptics
- `toggleReducedMotion()`: Toggle motion reduction
- `updateFontSize(size)`: Change font size

**Persistence:**

- Uses Zustand's persist middleware
- Custom AsyncStorage wrapper for React Native
- Store name: "settings-store"
- Automatic state restoration on app launch

### Component Architecture

#### Main Settings Page (`app/(main)/settings.tsx`)

**Layout Structure:**

- Header with title and pro badge
- Scrollable content with sections
- Floating action button for pro upgrade

**Sections:**

1. **Timer Settings**: Session and break duration configuration
2. **Notifications**: Notification preferences with pro features
3. **Appearance**: Theme, sound, and vibration settings
4. **Pro Features**: Advanced settings (gated for pro users)
5. **Data & Export**: Import/export functionality

**Key Components:**

- `SettingsCard`: Reusable card component for settings groups
- `ProFeatureCard`: Specialized card for pro features with upgrade prompts
- `TimerSettingsCard`: Timer configuration interface
- `NotificationSettingsCard`: Notification preferences
- `ThemeSettingsCard`: Theme selection and customization
- `ExportSettingsCard`: Data export/import functionality

**State Management:**

- Uses `useSettingsStore` for all settings state
- Real-time updates with Zustand
- Automatic persistence to AsyncStorage

#### Connected Components

**SettingsCard Component:**

- Reusable card wrapper for settings sections
- Consistent styling with NativeWind
- Dark mode support
- Optional pro badge

**ProFeatureCard Component:**

- Specialized card for pro features
- Upgrade modal trigger for non-pro users
- Visual indicators for locked features
- Consistent with app's minimal design

**TimerSettingsCard Component:**

- Duration selection with preset options
- Custom duration management (pro)
- Auto-start toggle
- Real-time validation

**NotificationSettingsCard Component:**

- Toggle switches for each notification type
- Pro feature indicators
- Schedule management (pro)

**ThemeSettingsCard Component:**

- Theme selection (light/dark/auto)
- Custom theme management (pro)
- Color picker integration
- Theme preview

**ExportSettingsCard Component:**

- Export format selection
- Import functionality
- Reset to defaults option
- Pro feature gating

### Modal Components

#### UpgradeModal (`components/modals/UpgradeModal.tsx`)

- Pro feature upgrade prompt
- Feature highlights
- Upgrade call-to-action
- Consistent with app design

#### ThemeEditorModal (Future Implementation)

- Color picker interface
- Theme preview
- Name and description fields
- Save/cancel actions

### Helper Functions

#### `getAvailableDurations()`

- Returns available session durations
- Includes custom durations for pro users
- Automatic sorting and deduplication

#### `getCurrentTheme()`

- Returns current theme setting
- Handles auto theme detection
- Fallback to light theme

#### `isProFeature(feature)`

- Checks if a feature requires pro access
- Used for UI gating and validation

### Styling & Design

#### NativeWind Integration

- Consistent use of Tailwind classes
- Dark mode variants for all components
- Responsive design patterns
- Gap-based spacing (no space-y classes)

#### Typography

- Sora font family throughout
- Consistent text sizing and weights
- Proper contrast ratios for accessibility

#### Color System

- Semantic color tokens
- Dark mode support
- Custom theme integration
- Consistent with app's design system

#### Layout Patterns

- Card-based design
- Minimal spacing and padding
- Consistent border radius (rounded-2xl)
- Subtle shadows and borders

### Performance Optimizations

#### State Management

- Zustand for efficient state updates
- Selective re-rendering with proper selectors
- Memoized components where appropriate

#### AsyncStorage

- Efficient persistence with custom wrapper
- Proper error handling
- No double stringification

#### UI Performance

- Minimal re-renders
- Optimized animations
- Efficient list rendering
- Lazy loading for modals

### Error Handling

#### Store Errors

- AsyncStorage operation failures
- Invalid state updates
- Import/export errors
- Pro feature access violations

#### UI Error States

- Loading states for async operations
- Error messages for failed operations
- Fallback values for missing data
- Graceful degradation for pro features

### Accessibility

#### Screen Reader Support

- Proper labels and descriptions
- Semantic HTML structure
- ARIA attributes where needed

#### Visual Accessibility

- High contrast ratios
- Large touch targets
- Clear visual hierarchy
- Reduced motion support

#### Keyboard Navigation

- Logical tab order
- Focus indicators
- Keyboard shortcuts where appropriate

### Testing Considerations

#### Unit Tests

- Store actions and state updates
- Helper function behavior
- Component rendering
- Error handling

#### Integration Tests

- Settings persistence
- Pro feature gating
- Import/export functionality
- Theme application

#### E2E Tests

- Complete settings workflow
- Pro upgrade flow
- Data export/import
- Theme customization

### Future Enhancements

#### Planned Features

- Advanced theme customization
- Notification schedule templates
- Cloud sync for pro users
- Advanced analytics dashboard
- Custom sound themes
- Widget customization

#### Technical Improvements

- Performance optimizations
- Enhanced error handling
- Better accessibility
- More comprehensive testing
- Advanced data validation

## Usage Examples

### Basic Settings Update

```typescript
const { updateSessionDuration, updateTheme } = useSettingsStore();

// Update session duration
updateSessionDuration(45);

// Change theme
updateTheme("dark");
```

### Pro Feature Usage

```typescript
const { addCustomDuration, isPro } = useSettingsStore();

// Check pro status before using pro features
if (isPro) {
  addCustomDuration(90);
}
```

### Export Settings

```typescript
const { exportSettings } = useSettingsStore();

// Export as JSON (free users)
const jsonData = await exportSettings("json");

// Export as CSV (pro users only)
const csvData = await exportSettings("csv");
```

### Import Settings

```typescript
const { importSettings } = useSettingsStore();

const success = await importSettings(jsonData);
if (success) {
  // Settings imported successfully
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
app/(main)/settings.tsx          # Main settings page
store/settingsStore.ts           # Settings state management
components/modals/UpgradeModal.tsx # Pro upgrade modal
documentation/settings-page.md   # This documentation
```

## Related Documentation

- [Journal Feature Documentation](./journal-feature.md)
- [Insights Page Documentation](./insights-page.md)
- [Store Architecture Overview](../store/README.md)
- [Component Library Documentation](../components/README.md)
