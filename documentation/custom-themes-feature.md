# Custom Themes Feature Documentation

## Overview

The Custom Themes feature allows Pro users to create, edit, and manage personalized color schemes for the app. This feature provides a comprehensive theme management system with visual previews, color pickers, and seamless integration with the app's design system.

## Features

### Core Functionality

- **Theme Creation**: Create new custom themes with personalized color schemes
- **Theme Editing**: Modify existing themes (name, colors, preview)
- **Theme Management**: Delete themes, set default themes
- **Visual Preview**: Real-time preview of theme appearance
- **Color Picker**: Intuitive color selection with predefined options
- **Pro Feature Gating**: Exclusive to Pro users with upgrade prompts

### Theme Components

- **Primary Color**: Main brand color for buttons, headers, and primary elements
- **Secondary Color**: Supporting color for borders, secondary buttons
- **Accent Color**: Highlight color for special elements and interactions

## Technical Implementation

### Store Integration

#### SettingsStore (`store/settingsStore.ts`)

**Theme Types:**

```typescript
export interface CustomTheme {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  isDefault?: boolean;
}

export interface ProFeatures {
  // ... other features
  customThemes: CustomTheme[];
}
```

**Theme Actions:**

```typescript
// Add new custom theme
addCustomTheme: (theme: CustomTheme) => void;

// Update existing theme
updateCustomTheme: (id: string, theme: Partial<CustomTheme>) => void;

// Remove theme
removeCustomTheme: (id: string) => void;
```

**Default Themes:**
The store includes four pre-built themes:

- Ocean Blue (default)
- Forest Green
- Sunset Orange
- Royal Purple

### Component Architecture

#### Settings Page Integration (`app/(main)/settings.tsx`)

**Custom Themes Section:**

- Current theme display with active indicator
- Horizontal scrollable theme gallery
- Create and manage theme buttons
- Pro feature gating for non-pro users

**State Management:**

```typescript
const [showThemeEditor, setShowThemeEditor] = useState(false);
const [editingTheme, setEditingTheme] = useState<CustomTheme | null>(null);
```

**Theme Selection:**

- Tap any theme to edit it
- Visual indicators for default theme
- Smooth transitions and animations

#### ThemeEditorModal (`components/modals/ThemeEditorModal.tsx`)

**Modal Features:**

- Full-screen modal with slide animation
- Header with close and save actions
- Form validation and error handling
- Real-time theme preview

**Color Picker Component:**

```typescript
const ColorPicker = ({
  label,
  value,
  onColorChange,
}: {
  label: string;
  value: string;
  onColorChange: (color: string) => void;
}) => {
  // Color preview
  // Hex input field
  // Predefined color options
};
```

**Predefined Colors:**

- Blue variants: #3B82F6, #1E40AF, #60A5FA
- Green variants: #10B981, #059669, #34D399
- Orange variants: #F59E0B, #D97706, #FBBF24
- Purple variants: #8B5CF6, #7C3AED, #A78BFA
- Red variants: #EF4444, #DC2626, #F87171
- Gray variants: #6B7280, #374151, #9CA3AF
- Basic colors: #000000, #FFFFFF, #F3F4F6

**Theme Preview Component:**

```typescript
const ThemePreview = () => {
  // Header with primary color background
  // Color swatches for each theme component
  // Button previews with theme colors
};
```

## User Interface

### Settings Page Layout

#### Pro Users

1. **Current Theme Display**
   - Active theme indicator
   - Theme name and description
   - Color preview swatch

2. **Available Themes Gallery**
   - Horizontal scrollable list
   - Theme thumbnails with primary color
   - Default theme indicator (✓)
   - Tap to edit functionality

3. **Theme Management Actions**
   - Create Theme button (blue)
   - Manage button (gray) with options menu

#### Non-Pro Users

- Locked theme section with upgrade prompt
- Pro badge and lock icon
- Upgrade modal trigger

### Theme Editor Modal

#### Header

- Close button (X)
- Title: "Create Theme" or "Edit Theme"
- Save button (blue text)

#### Content Sections

1. **Theme Name Input**
   - Text input with validation
   - Required field with error handling

2. **Theme Preview**
   - Real-time preview of theme appearance
   - Header with primary color background
   - Color swatches for each component
   - Button previews

3. **Color Pickers**
   - Three color pickers (Primary, Secondary, Accent)
   - Color preview swatch
   - Hex input field
   - Predefined color options grid

4. **Delete Button** (Edit mode only)
   - Red button with trash icon
   - Confirmation dialog
   - Only available for non-default themes

## User Experience

### Theme Creation Flow

1. User taps "Create Theme" button
2. ThemeEditorModal opens with empty form
3. User enters theme name
4. User selects colors using picker or predefined options
5. Real-time preview updates
6. User taps "Save" to create theme
7. Success message and modal closes

### Theme Editing Flow

1. User taps existing theme in gallery
2. ThemeEditorModal opens with pre-filled data
3. User modifies name or colors
4. Real-time preview updates
5. User taps "Save" to update theme
6. Success message and modal closes

### Theme Management Flow

1. User taps "Manage" button
2. Alert dialog shows options:
   - Create New Theme
   - Edit Existing Theme
3. If editing, shows theme selection dialog
4. Opens appropriate modal based on selection

### Pro Feature Gating

1. Non-pro users see locked section
2. Tap triggers upgrade modal
3. Modal shows feature benefits
4. Upgrade button enables pro features

## Styling & Design

### NativeWind Integration

- Consistent use of Tailwind classes
- Dark mode support throughout
- Responsive design patterns
- Gap-based spacing (no space-y classes)

### Color System

- Semantic color tokens
- Dark mode variants
- Custom theme integration
- Consistent with app's design system

### Typography

- Sora font family throughout
- Consistent text sizing and weights
- Proper contrast ratios

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

- Lazy loading of color picker
- Efficient theme preview rendering
- Smooth animations and transitions

### Memory Management

- Proper cleanup of modal state
- Efficient color option rendering
- Optimized theme data structure

## Error Handling

### Form Validation

- Required theme name validation
- Color format validation
- Duplicate theme name prevention

### Store Errors

- AsyncStorage operation failures
- Invalid theme data handling
- Pro feature access violations

### UI Error States

- Loading states for async operations
- Error messages for failed operations
- Graceful degradation for pro features

## Accessibility

### Screen Reader Support

- Proper labels for color pickers
- Descriptive text for theme previews
- Semantic button and input labels

### Visual Accessibility

- High contrast color combinations
- Large touch targets for color selection
- Clear visual hierarchy
- Color-blind friendly design

### Keyboard Navigation

- Logical tab order in modal
- Focus indicators for interactive elements
- Keyboard shortcuts where appropriate

## Testing Considerations

### Unit Tests

- Theme creation and editing logic
- Color validation functions
- Store actions and state updates
- Component rendering

### Integration Tests

- Theme persistence
- Pro feature gating
- Modal interactions
- Form validation

### E2E Tests

- Complete theme creation workflow
- Theme editing and management
- Pro upgrade flow
- Cross-device theme consistency

## Future Enhancements

### Planned Features

- **Theme Templates**: Pre-built theme templates
- **Theme Sharing**: Share themes with other users
- **Advanced Color Tools**: HSL picker, color harmony
- **Theme Categories**: Organize themes by style
- **Auto-Generated Themes**: AI-powered theme suggestions
- **Theme Import/Export**: Backup and restore themes

### Technical Improvements

- **Performance**: Optimize theme switching
- **Storage**: Compress theme data
- **Validation**: Enhanced color validation
- **Preview**: More detailed theme previews
- **Analytics**: Theme usage tracking

## Usage Examples

### Creating a New Theme

```typescript
const { addCustomTheme } = useSettingsStore();

const newTheme: CustomTheme = {
  id: `theme-${Date.now()}`,
  name: "Sunset Vibes",
  primaryColor: "#F59E0B",
  secondaryColor: "#D97706",
  accentColor: "#FBBF24",
};

addCustomTheme(newTheme);
```

### Updating an Existing Theme

```typescript
const { updateCustomTheme } = useSettingsStore();

updateCustomTheme(themeId, {
  name: "Updated Theme Name",
  primaryColor: "#8B5CF6",
});
```

### Deleting a Theme

```typescript
const { removeCustomTheme } = useSettingsStore();

removeCustomTheme(themeId);
```

### Checking Pro Status

```typescript
const { isPro } = useSettingsStore();

if (isPro) {
  // Enable theme features
} else {
  // Show upgrade prompt
}
```

## Dependencies

### Core Dependencies

- `zustand`: State management
- `@react-native-async-storage/async-storage`: Theme persistence
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
app/(main)/settings.tsx                    # Settings page with theme section
components/modals/ThemeEditorModal.tsx     # Theme editor modal
store/settingsStore.ts                     # Theme state management
documentation/custom-themes-feature.md     # This documentation
```

## Related Documentation

- [Settings Page Documentation](./settings-page.md)
- [Store Architecture Overview](../store/README.md)
- [Component Library Documentation](../components/README.md)
- [Pro Features Implementation](./pro-features.md)
