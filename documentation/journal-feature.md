# Journal Feature Documentation

## Overview

The Journal feature is a comprehensive note-taking and reflection system that allows users to create rich, multi-format journal entries. It supports various content types including text, checklists, lists, images, and audio recordings.

## Core Components

### 1. Journal Store (`store/journalStore.ts`)

**Purpose**: Central state management for journal entries using Zustand with AsyncStorage persistence.

**Key Features**:

- **Block-based Architecture**: Entries are composed of multiple content blocks
- **Persistent Storage**: Uses AsyncStorage with custom storage wrapper
- **Legacy Migration**: Automatically migrates old entries to new block format
- **CRUD Operations**: Add, edit, delete, and retrieve journal entries

**Types**:

```typescript
type JournalBlock =
  | { type: "text"; content: string }
  | {
      type: "checkbox";
      items: { text: string; checked: boolean }[];
      title?: string;
    }
  | { type: "list"; items: string[] }
  | { type: "image"; uri: string }
  | { type: "audio"; uri: string; duration: number; title?: string };

type JournalEntry = {
  id: string;
  title: string;
  blocks: JournalBlock[];
  date: string;
  time: string;
  createdAt?: number;
  updatedAt?: number;
};
```

### 2. Journal Editor (`app/(screens)/journalEditor.tsx`)

**Purpose**: Main interface for creating and editing journal entries with rich content support.

**Key Features**:

#### Content Block Types

- **Text Blocks**: Multi-line text input with auto-expanding height
- **Checklist Blocks**: Customizable titled checklists with checkboxes
- **List Blocks**: Simple bullet-point lists
- **Image Blocks**: Photo integration with aspect ratio preservation
- **Audio Blocks**: Voice recording with playback controls

#### User Experience Features

- **Smart Keyboard Handling**: Auto-scroll to focused inputs, proper keyboard avoidance
- **Unsaved Changes Detection**: Visual indicators and confirmation dialogs
- **Floating Action Menu**: Quick access to add new content blocks
- **Real-time Preview**: Live updates as users type
- **Drag-to-Delete**: Remove blocks with confirmation
- **Drag & Drop Reordering**: Intuitive block reordering with visual feedback

#### Technical Features

- **Performance Optimized**: Memoized components, efficient re-renders
- **Platform Adaptive**: iOS/Android specific keyboard behavior
- **Accessibility**: Proper focus management and screen reader support
- **Gesture Handling**: Smooth drag animations with Reanimated

### 3. Journal Page (`app/(main)/journal.tsx`)

**Purpose**: Main journal listing and navigation interface.

**Features**:

- **Entry List**: Chronological display of journal entries
- **Search & Filter**: Find entries by date or content
- **Quick Actions**: Edit, delete, and share entries
- **Empty State**: Guided onboarding for new users

### 4. Journal Note Card (`components/JournalNoteCard.tsx`)

**Purpose**: Reusable component for displaying journal entry previews.

**Features**:

- **Content Preview**: Shows first few lines of text content
- **Block Type Indicators**: Visual cues for different content types
- **Date Display**: Formatted date and time information
- **Touch Interactions**: Tap to edit, long press for options

## Block Types Detailed

### Text Block

- **Purpose**: Free-form text writing
- **Features**: Multi-line support, auto-expanding, placeholder text
- **Use Cases**: Reflections, notes, thoughts, descriptions

### Checklist Block

- **Purpose**: Task management and progress tracking
- **Features**:
  - Customizable title (optional)
  - Add/remove items dynamically
  - Check/uncheck functionality
  - Visual strikethrough for completed items
- **Use Cases**: Daily tasks, project milestones, shopping lists

### List Block

- **Purpose**: Simple bullet-point lists
- **Features**: Add/remove items, clean bullet styling
- **Use Cases**: Ideas, notes, simple lists

### Image Block

- **Purpose**: Visual content integration
- **Features**:
  - Image picker integration
  - 16:9 aspect ratio preservation
  - Quality optimization (80%)
  - Fallback placeholder
- **Use Cases**: Screenshots, photos, visual references

### Audio Block

- **Purpose**: Voice recording and playback
- **Features**:
  - High-quality audio recording
  - Customizable recording titles
  - Playback controls with progress bar
  - Duration display
  - Waveform visualization during recording
  - Delete functionality
- **Use Cases**: Voice notes, interviews, thoughts, reminders

## Drag & Drop Implementation

### Overview

The journal editor features intuitive drag and drop functionality for reordering content blocks, built with React Native Reanimated and Gesture Handler for smooth, native performance.

### Components

#### DraggableBlock (`components/DraggableBlock.tsx`)

**Purpose**: Wrapper component that adds drag functionality to any journal block.

**Key Features**:

- **Long Press Activation**: Drag handles appear only when long pressing (500ms)
- **Gesture Recognition**: Combined long press and pan gesture handling
- **Visual Feedback**: Scale, opacity, and shadow animations during drag
- **Drag Handle**: Blue circular handle with menu icon (⋮⋮) in top-right corner
- **Smooth Animations**: 60fps animations using Reanimated worklets
- **Drop Zone Calculation**: Automatic position calculation for reordering
- **User Guidance**: Brief hint tooltip for first-time users

**Technical Implementation**:

```typescript
// Combined gesture handling
const longPressGesture = Gesture.LongPress()
  .minDuration(500)
  .onStart(() => {
    "worklet";
    runOnJS(setShowDragHandle)(true);
    dragHandleOpacity.value = withTiming(1, { duration: 200 });
  });

const panGesture = Gesture.Pan()
  .onStart(() => {
    "worklet";
    runOnJS(onDragStart)(index);
    zIndex.value = 1000;
    scale.value = withSpring(1.05);
    opacity.value = withSpring(0.8);
  })
  .onUpdate((event) => {
    "worklet";
    translateY.value = event.translationY;
  })
  .onEnd((event) => {
    "worklet";
    const targetIndex = Math.round(event.translationY / blockHeight) + index;
    // Handle reordering logic
  });

const composedGesture = Gesture.Race(longPressGesture, panGesture);
```

### User Experience

#### Visual Feedback

- **During Drag**:
  - Block scales to 1.05x with spring animation
  - Opacity reduces to 0.8 for depth effect
  - Dynamic shadow with interpolated values
  - Z-index elevation to appear above other content
- **Drag Handle**:
  - Visible menu icon (⋮⋮) in top-left corner
  - Subtle background for better visibility
  - Consistent positioning across all block types

#### Interaction Patterns

- **Activation**: Long press (500ms) on any block to reveal drag handle
- **Visual Hint**: Brief tooltip appears on first block to guide new users
- **Drag Handle**: Blue circular button appears in top-right corner
- **Movement**: Smooth vertical dragging with real-time feedback
- **Completion**: Automatic snap to nearest position
- **Cleanup**: Drag handle disappears after drop or cancellation
- **No Layout Shift**: Content remains in original position until drag starts

### Technical Architecture

#### State Management

```typescript
const [isDragging, setIsDragging] = useState(false);
const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

const handleReorder = useCallback(
  (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;

    const newBlocks = [...blocks];
    const [movedBlock] = newBlocks.splice(fromIndex, 1);
    newBlocks.splice(toIndex, 0, movedBlock);

    setBlocks(newBlocks);
  },
  [blocks]
);
```

#### Performance Optimizations

- **Worklet Functions**: All animations run on UI thread
- **Memoized Handlers**: Callback optimization for re-render prevention
- **Efficient Reordering**: Array manipulation with minimal state updates
- **Gesture Optimization**: Proper gesture configuration for smooth interaction

#### Integration Points

- **Journal Editor**: Main integration point with block rendering
- **State Persistence**: Automatic saving of reordered blocks
- **Keyboard Handling**: Proper interaction with text inputs
- **Accessibility**: Screen reader support for drag operations

### Future Enhancements

#### Planned Features

- **Multi-Select Drag**: Select and move multiple blocks simultaneously
- **Cross-Entry Drag**: Move blocks between different journal entries
- **Drag Preview**: Custom preview during drag operation
- **Haptic Feedback**: Tactile feedback for drag interactions
- **Undo/Redo**: Support for drag operation history

#### Technical Improvements

- **Dynamic Heights**: Better handling of variable block heights
- **Drop Zone Indicators**: Visual guides for valid drop areas
- **Magnetic Snapping**: Enhanced positioning with magnetic guides
- **Performance**: Further optimization for large numbers of blocks

## User Workflows

### Creating a New Entry

1. Navigate to Journal tab
2. Tap "New Entry" or floating action button
3. Add title (optional)
4. Add content blocks using the floating menu
5. Edit content in real-time
6. Save entry (auto-saves with visual indicator)

### Editing an Existing Entry

1. Tap on entry from journal list
2. Modify title or any content block
3. Add new blocks as needed
4. Remove blocks with confirmation
5. Save changes

### Recording Audio

1. Add audio block from floating menu
2. Tap microphone icon to start recording
3. Watch real-time waveform and timer
4. Tap "Stop Recording" when done
5. Optionally edit recording title
6. Play back recording with controls

### Managing Checklists

1. Add checklist block
2. Optionally add custom title
3. Add items using "+" button
4. Check/uncheck items as needed
5. Remove items with "×" button

## Technical Implementation

### State Management

- **Zustand Store**: Centralized state with persistence
- **AsyncStorage**: Local data persistence
- **Optimistic Updates**: Immediate UI feedback
- **Error Handling**: Graceful fallbacks and user notifications

### Performance Optimizations

- **Memoized Components**: React.memo for expensive renders
- **Efficient Re-renders**: Minimal state updates
- **Lazy Loading**: Images and audio loaded on demand
- **Keyboard Optimization**: Platform-specific handling

### Data Persistence

- **Custom Storage Wrapper**: AsyncStorage with error handling
- **Migration Support**: Automatic legacy data conversion
- **Backup Strategy**: Local storage with potential cloud sync

### Accessibility

- **Screen Reader Support**: Proper labels and descriptions
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Logical tab order and focus indicators
- **Color Contrast**: Dark mode support with proper contrast

## Integration Points

### Flow Completion Modal

- **Quick Journal Entry**: Post-session reflection prompts
- **Auto-populated Content**: Session details and insights
- **Seamless Navigation**: Direct link to journal editor

### Navigation

- **Expo Router**: Deep linking and navigation
- **Tab Integration**: Journal tab in main navigation
- **Back Navigation**: Proper handling of unsaved changes

## Future Enhancements

### Planned Features

- **Rich Text Formatting**: Bold, italic, headers
- **Tags & Categories**: Organize entries by topic
- **Search Functionality**: Full-text search across entries
- **Export Options**: PDF, text, or backup formats
- **Cloud Sync**: Cross-device synchronization
- **Templates**: Pre-defined entry templates
- **Collaboration**: Share entries with others

### Technical Improvements

- **Offline Support**: Enhanced offline capabilities
- **Performance**: Further optimization for large entries
- **Security**: Optional encryption for sensitive entries
- **Analytics**: Usage insights and patterns

## File Structure

```
app/
├── (main)/
│   └── journal.tsx              # Main journal listing page
├── (screens)/
│   └── journalEditor.tsx        # Journal editor interface
components/
├── JournalNoteCard.tsx          # Entry preview component
└── modals/
    └── AddJournalModal.tsx      # Quick journal entry modal
store/
└── journalStore.ts              # State management
```

## Dependencies

- **Zustand**: State management
- **AsyncStorage**: Data persistence
- **Expo Router**: Navigation
- **Expo Image Picker**: Image selection
- **Expo AV**: Audio recording and playback
- **React Native**: Core framework
- **NativeWind**: Styling

## Testing Considerations

- **Unit Tests**: Store functions and utilities
- **Integration Tests**: Block interactions and persistence
- **E2E Tests**: Complete user workflows
- **Performance Tests**: Large entry handling
- **Accessibility Tests**: Screen reader and keyboard navigation
