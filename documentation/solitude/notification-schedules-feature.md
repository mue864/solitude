# Notification Schedules Feature Documentation

## Overview

The Notification Schedules feature allows Pro users to create, edit, and manage custom notification schedules with specific times, days, and notification types. This feature provides advanced scheduling capabilities beyond the basic notification toggles, enabling users to set up personalized productivity reminders.

## Features

### Core Functionality

- **Schedule Creation**: Create custom notification schedules with personalized settings
- **Schedule Editing**: Modify existing schedules (name, time, days, type, enabled status)
- **Schedule Management**: Delete schedules, enable/disable individual schedules
- **Time Selection**: Precise time picker with hour and minute selection
- **Day Selection**: Flexible day selection with quick presets (All Days, Weekdays, Weekends)
- **Schedule Types**: Three types of notifications (Session, Break, General)
- **Pro Feature Gating**: Exclusive to Pro users with upgrade prompts

### Schedule Components

- **Schedule Name**: Custom name for easy identification
- **Time**: 24-hour format time selection (HH:MM)
- **Days**: Multiple day selection (Sunday-Saturday)
- **Type**: Session reminder, break reminder, or general reminder
- **Enabled Status**: Toggle to activate/deactivate schedule

## Technical Implementation

### Store Integration

#### SettingsStore (`store/settingsStore.ts`)

**Schedule Types:**

```typescript
export interface ProNotificationSchedule {
  id: string;
  name: string;
  time: string; // HH:mm format
  days: number[]; // 0-6 (Sunday-Saturday)
  enabled: boolean;
  type: "session" | "break" | "reminder";
}

export interface ProFeatures {
  // ... other features
  notificationSchedules: ProNotificationSchedule[];
}
```

**Schedule Actions:**

```typescript
// Add new notification schedule
addNotificationSchedule: (schedule: ProNotificationSchedule) => void;

// Update existing schedule
updateNotificationSchedule: (id: string, schedule: Partial<ProNotificationSchedule>) => void;

// Remove schedule
removeNotificationSchedule: (id: string) => void;
```

### Component Architecture

#### Settings Page Integration (`app/(main)/settings.tsx`)

**Notification Schedules Section:**

- Schedule summary with active count
- List of existing schedules (up to 3 shown)
- Create and manage schedule buttons
- Pro feature gating for non-pro users

**State Management:**

```typescript
const [showNotificationSchedule, setShowNotificationSchedule] = useState(false);
const [editingSchedule, setEditingSchedule] =
  useState<ProNotificationSchedule | null>(null);
```

**Schedule Display:**

- Shows schedule name, time, and day summary
- Visual indicators for enabled/disabled status
- Type-specific icons (timer, cafe, notifications)
- Truncated display with "more schedules" indicator

#### NotificationScheduleModal (`components/modals/NotificationScheduleModal.tsx`)

**Modal Features:**

- Full-screen modal with slide animation
- Header with close and save actions
- Form validation and error handling
- Real-time schedule preview

**Time Picker Component:**

```typescript
const TimePicker = () => {
  // Hour selection (00-23)
  // Minute selection (00-59)
  // 12-hour format display
  // Smooth scrolling selection
};
```

**Day Selector Component:**

```typescript
const DaySelector = () => {
  // Quick selection buttons (All Days, Weekdays, Weekends)
  // Individual day toggles
  // Day count summary
  // Visual feedback for selected days
};
```

**Schedule Type Selector:**

```typescript
const ScheduleTypeSelector = () => {
  // Three schedule types with icons and descriptions
  // Visual selection feedback
  // Type-specific styling
};
```

**Schedule Preview Component:**

```typescript
const SchedulePreview = () => {
  // Schedule name and enabled status
  // Time display with AM/PM format
  // Day summary (Every day, Weekdays, Weekends, or custom)
  // Schedule type with icon
};
```

## User Interface

### Settings Page Layout

#### Pro Users

1. **Schedule Summary Card**
   - Active schedule count badge
   - Empty state with helpful messaging
   - Schedule list with key information

2. **Schedule List Display**
   - Up to 3 schedules shown
   - Schedule name and time
   - Day summary (Every day, Weekdays, etc.)
   - Enabled/disabled status indicator
   - Type-specific icons

3. **Schedule Management Actions**
   - Create Schedule button (blue)
   - Manage button (gray) with schedule selection

#### Non-Pro Users

- Locked schedule section with upgrade prompt
- Pro badge and lock icon
- Upgrade modal trigger

### NotificationScheduleModal

#### Header

- Close button (X)
- Title: "Create Schedule" or "Edit Schedule"
- Save button (blue text)

#### Content Sections

1. **Schedule Name Input**
   - Text input with validation
   - Required field with error handling

2. **Schedule Preview**
   - Real-time preview of schedule settings
   - Enabled status indicator
   - Time, days, and type summary

3. **Schedule Type Selection**
   - Three type options with icons and descriptions
   - Visual selection feedback
   - Type-specific styling

4. **Time Picker**
   - Hour selection (00-23)
   - Minute selection (00-59)
   - 12-hour format display
   - Smooth scrolling interface

5. **Day Selector**
   - Quick selection buttons
   - Individual day toggles
   - Day count summary
   - Visual feedback

6. **Enable/Disable Toggle**
   - Switch with descriptive text
   - Status indicator

7. **Delete Button** (Edit mode only)
   - Red button with trash icon
   - Confirmation dialog

## User Experience

### Schedule Creation Flow

1. User taps "Create Schedule" button
2. NotificationScheduleModal opens with default settings
3. User enters schedule name
4. User selects schedule type
5. User sets time using picker
6. User selects days (with quick presets available)
7. User toggles enabled status
8. Real-time preview updates
9. User taps "Save" to create schedule
10. Success message and modal closes

### Schedule Editing Flow

1. User taps "Manage" button
2. Schedule selection dialog appears
3. User selects schedule to edit
4. NotificationScheduleModal opens with pre-filled data
5. User modifies settings
6. Real-time preview updates
7. User taps "Save" to update schedule
8. Success message and modal closes

### Schedule Management Flow

1. User taps "Manage" button
2. If no schedules exist, shows "Create your first schedule!"
3. If schedules exist, shows selection dialog
4. User can select schedule to edit
5. Opens modal with schedule data

### Pro Feature Gating

1. Non-pro users see locked section
2. Tap triggers upgrade modal
3. Modal shows feature benefits
4. Upgrade button enables pro features

## Schedule Types

### Session Reminder

- **Icon**: Timer
- **Description**: "Remind to start focus sessions"
- **Use Case**: Daily productivity reminders
- **Color**: Blue theme

### Break Reminder

- **Icon**: Cafe
- **Description**: "Remind to take breaks"
- **Use Case**: Work-life balance reminders
- **Color**: Green theme

### General Reminder

- **Icon**: Notifications
- **Description**: "General productivity reminders"
- **Use Case**: Custom productivity notifications
- **Color**: Purple theme

## Day Selection Options

### Quick Presets

- **All Days**: Selects Sunday through Saturday
- **Weekdays**: Selects Monday through Friday
- **Weekends**: Selects Sunday and Saturday

### Individual Days

- **Sunday**: Day 0
- **Monday**: Day 1
- **Tuesday**: Day 2
- **Wednesday**: Day 3
- **Thursday**: Day 4
- **Friday**: Day 5
- **Saturday**: Day 6

### Day Summary Display

- **Every day**: 7 days selected
- **Weekdays only**: Monday-Friday selected
- **Weekends only**: Sunday-Saturday selected
- **Custom**: Shows count of selected days

## Styling & Design

### NativeWind Integration

- Consistent use of Tailwind classes
- Dark mode support throughout
- Responsive design patterns
- Gap-based spacing (no space-y classes)

### Color System

- Semantic color tokens
- Dark mode variants
- Type-specific color themes
- Consistent with app's design system

### Typography

- Sora font family throughout
- Consistent text sizing and weights
- Proper contrast ratios
- Monospace font for time display

### Layout Patterns

- Card-based design
- Minimal spacing and padding
- Consistent border radius (rounded-2xl)
- Subtle shadows and borders

## Performance Optimizations

### State Management

- Efficient Zustand updates
- Selective re-rendering
- Memoized components where appropriate

### Modal Performance

- Lazy loading of time picker
- Efficient day selection rendering
- Smooth animations and transitions

### Memory Management

- Proper cleanup of modal state
- Efficient schedule data structure
- Optimized list rendering

## Error Handling

### Form Validation

- Required schedule name validation
- Minimum day selection validation
- Time format validation
- Duplicate schedule name prevention

### Store Errors

- AsyncStorage operation failures
- Invalid schedule data handling
- Pro feature access violations

### UI Error States

- Loading states for async operations
- Error messages for failed operations
- Graceful degradation for pro features

## Accessibility

### Screen Reader Support

- Proper labels for time picker
- Descriptive text for day selection
- Semantic button and input labels
- Schedule type descriptions

### Visual Accessibility

- High contrast color combinations
- Large touch targets for time selection
- Clear visual hierarchy
- Color-blind friendly design

### Keyboard Navigation

- Logical tab order in modal
- Focus indicators for interactive elements
- Keyboard shortcuts where appropriate

## Testing Considerations

### Unit Tests

- Schedule creation and editing logic
- Time and day validation functions
- Store actions and state updates
- Component rendering

### Integration Tests

- Schedule persistence
- Pro feature gating
- Modal interactions
- Form validation

### E2E Tests

- Complete schedule creation workflow
- Schedule editing and management
- Pro upgrade flow
- Cross-device schedule consistency

## Future Enhancements

### Planned Features

- **Schedule Templates**: Pre-built schedule templates
- **Recurring Patterns**: Custom recurring patterns
- **Advanced Time Options**: Multiple times per day
- **Schedule Categories**: Organize schedules by purpose
- **Smart Scheduling**: AI-powered schedule suggestions
- **Schedule Import/Export**: Backup and restore schedules

### Technical Improvements

- **Performance**: Optimize schedule checking
- **Storage**: Compress schedule data
- **Validation**: Enhanced time validation
- **Preview**: More detailed schedule previews
- **Analytics**: Schedule usage tracking

## Usage Examples

### Creating a New Schedule

```typescript
const { addNotificationSchedule } = useSettingsStore();

const newSchedule: ProNotificationSchedule = {
  id: `schedule-${Date.now()}`,
  name: "Morning Focus",
  time: "09:00",
  days: [1, 2, 3, 4, 5], // Monday to Friday
  enabled: true,
  type: "session",
};

addNotificationSchedule(newSchedule);
```

### Updating an Existing Schedule

```typescript
const { updateNotificationSchedule } = useSettingsStore();

updateNotificationSchedule(scheduleId, {
  name: "Updated Schedule Name",
  time: "10:30",
  enabled: false,
});
```

### Deleting a Schedule

```typescript
const { removeNotificationSchedule } = useSettingsStore();

removeNotificationSchedule(scheduleId);
```

### Checking Pro Status

```typescript
const { isPro } = useSettingsStore();

if (isPro) {
  // Enable schedule features
} else {
  // Show upgrade prompt
}
```

## Dependencies

### Core Dependencies

- `zustand`: State management
- `@react-native-async-storage/async-storage`: Schedule persistence
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
app/(main)/settings.tsx                           # Settings page with schedule section
components/modals/NotificationScheduleModal.tsx   # Schedule editor modal
store/settingsStore.ts                            # Schedule state management
documentation/notification-schedules-feature.md   # This documentation
```

## Related Documentation

- [Settings Page Documentation](./settings-page.md)
- [Custom Themes Feature Documentation](./custom-themes-feature.md)
- [Store Architecture Overview](../store/README.md)
- [Component Library Documentation](../components/README.md)
- [Pro Features Implementation](./pro-features.md)
