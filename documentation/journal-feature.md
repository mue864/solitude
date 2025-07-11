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

#### Technical Features

- **Performance Optimized**: Memoized components, efficient re-renders
- **Platform Adaptive**: iOS/Android specific keyboard behavior
- **Accessibility**: Proper focus management and screen reader support

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
