# Solitude - Focus & Productivity App

<div align="center">

![Solitude App](https://img.shields.io/badge/Solitude-Productivity%20App-blue?style=for-the-badge&logo=react)

**Built to help you stay sharp, take real breaks, and work smarter.**

[![React Native](https://img.shields.io/badge/React%20Native-0.72+-blue?style=flat-square&logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2049+-blue?style=flat-square&logo=expo)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![NativeWind](https://img.shields.io/badge/NativeWind-3.0+-blue?style=flat-square&logo=tailwindcss)](https://www.nativewind.dev/)
[![Zustand](https://img.shields.io/badge/Zustand-4.0+-blue?style=flat-square)](https://zustand-demo.pmnd.rs/)

</div>

## 📱 Overview

Solitude is a comprehensive productivity app designed to help users achieve deep focus and maintain healthy work habits. Built with React Native and Expo, it combines the Pomodoro Technique with modern productivity insights, customizable flows, and intelligent session management.

## ✨ Key Features

### 🎯 Core Session Management

- **Multiple Session Types**: Classic (25min), Deep Focus (50min), Quick Task (15min), Creative Time (30min), Review Mode (20min), Course Time (45min), Short Break (5min), Long Break (15min), Reset Session (1min), Mindful Moment (10min)
- **Session Intelligence**: AI-powered recommendations based on user patterns and success rates
- **Smart Session Selector**: Categorized session types with analytics and recommendations
- **Session State Management**: Running, paused, completed states with proper transitions
- **Session Indicators**: Visual cards showing active sessions with animations
- **Session Details Modal**: Detailed view of current session information

### 🔄 Flow Management System

- **Pre-built Flows**: Classic Focus, Solo Study, Creative Rhythm, Debug Flow, Morning Routine, Meeting Prep, Coding Session, Writing Flow, Exercise Breaks, Power Hour, Study Session, Quick Sprints
- **Custom Flow Creation**: Users can create unlimited custom flows
- **Flow Categories**: Focus & Productivity, Work & Study, Creative & Writing, Wellness & Balance, Specialized
- **Flow Steps**: Each flow contains multiple session steps with custom durations
- **Flow Progress Tracking**: Visual progress indicators and step counters
- **Flow Completion Modal**: Celebration modal with auto-continue functionality
- **Flow Details Modal**: Detailed view of flow structure and current step
- **Flow Indicators**: Visual cards showing active flows with progress bars

### 📊 Analytics & Intelligence

- **Session Intelligence Store**: Comprehensive data collection and analysis
- **Productivity Insights**: AI-powered productivity scoring and trend analysis
- **Weekly Analytics**: Sessions completed, focus time, average quality, daily breakdown
- **Monthly Analytics**: Completion rates, most productive times, weekly trends
- **Session Quality Metrics**: Focus quality, energy levels, interruption rates, consistency scores
- **Pattern Recognition**: Time-of-day success rates, day-of-week patterns
- **Success Rate Tracking**: Per-session type completion statistics
- **Streak Management**: Current and longest focus streaks
- **Today's Progress**: Visual progress tracking for daily goals

### 📝 Journal & Reflection System

- **Rich Journal Entries**: Multi-format content blocks (text, checklists, lists, images, audio)
- **Block-based Architecture**: Flexible content organization with drag-and-drop reordering
- **Audio Recording**: Built-in voice recording with playback controls
- **Image Integration**: Photo capture and management within entries
- **Checklist Management**: Task tracking with completion status
- **Auto-save**: Real-time saving with unsaved changes detection
- **Search & Filter**: Find entries by date or content
- **Reflection Prompts**: Post-session reflection integration

### 📋 Task Management

- **Quick Task Modal**: Add tasks during sessions
- **Task Store**: Persistent task management with completion tracking
- **Task Tags**: Urgent, important, quickwin, deepwork categorization
- **Current Task Tracking**: Active task selection and management
- **Task Completion**: Mark tasks as completed during sessions
- **Task Editing**: Modify task details and priorities

### 🎨 User Interface & Experience

- **Minimalist Design**: Clean, distraction-free interface following app theme
- **Dark/Light Theme Support**: Consistent theming with custom color palette
- **Smooth Animations**: Height animations, fade transitions, progress bars
- **Modal System**: Consistent modal design for all interactions
- **Responsive Layout**: Adapts to different screen sizes
- **Custom Fonts**: Sora font family integration
- **Icon System**: Custom SVG icons and emoji integration
- **Shadow System**: Consistent elevation and depth

### 🎵 Audio & Feedback

- **Sound Integration**: Chime sounds for session completion
- **Haptic Feedback**: Vibration feedback for interactions
- **Audio Session Management**: Background audio session handling

### 🎁 Motivational Features

- **Quote System**: Motivational quotes with fatigue prevention
- **Quote Cards**: Beautiful modal presentation of quotes
- **Contextual Quotes**: Quotes appear at meaningful moments (flow start, session completion)
- **Auto-dismiss**: Quotes automatically close after 3 seconds

### ⚙️ Settings & Customization

- **Session Duration Editing**: Change session durations via modal
- **Onboarding System**: Welcome flow, personalization, notification setup
- **Notification Management**: Permission handling and setup
- **Pomodoro Settings**: Customizable timer configurations
- **Widget Configuration**: Home screen widget setup

### 🔧 Technical Features

- **State Management**: Zustand stores for session, flow, task, and intelligence data
- **Data Persistence**: AsyncStorage integration for all user data
- **Navigation**: Expo Router with tab-based navigation
- **Performance Optimization**: Efficient re-renders and animation handling
- **Error Handling**: Graceful error states and fallbacks
- **TypeScript**: Full type safety throughout the application

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (optional)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/solitude.git
   cd solitude
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**

   ```bash
   npx expo start
   ```

4. **Run on device or simulator**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app on your device

## 📱 App Structure

### Main Tabs

- **Focus**: Session management and timer interface
- **Plan**: Task management and planning
- **Insights**: Analytics and productivity insights
- **Journal**: Reflection and note-taking
- **Settings**: App configuration and preferences

### Key Components

#### Session Management

- `SessionIndicator`: Visual session status display
- `StartSessionBtn`: Session initiation with type selection
- `CancelSessionBtn`: Session cancellation with confirmation
- `SessionCompletionModal`: Post-session reflection and insights

#### Flow Management

- `FlowsModal`: Flow selection and management
- `FlowIndicator`: Visual flow progress display
- `FlowCompletionModal`: Flow completion celebration
- `DraggableBlock`: Reorderable flow steps

#### Analytics

- `TodayProgress`: Daily progress visualization
- `AdvancedAnalyticsModal`: Pro analytics dashboard
- `SessionIntelligenceModal`: Session insights and recommendations

#### Task Management

- `TaskCard`: Individual task display
- `TaskGroup`: Grouped task organization
- `AddTaskModal`: Task creation interface
- `QuickTaskModal`: Rapid task addition

#### Journal System

- `JournalNoteCard`: Journal entry preview
- `JournalEditor`: Rich content editing interface
- `AddJournalModal`: Quick journal entry creation

## 🛠️ Technology Stack

### Core Framework

- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and tooling
- **TypeScript**: Type-safe JavaScript development

### State Management

- **Zustand**: Lightweight state management
- **AsyncStorage**: Local data persistence
- **Persist Middleware**: Automatic state persistence

### UI & Styling

- **NativeWind**: Tailwind CSS for React Native
- **React Native Reanimated**: Smooth animations
- **React Native Gesture Handler**: Touch interactions

### Navigation

- **Expo Router**: File-based routing
- **React Navigation**: Tab and stack navigation

### Charts & Visualizations

- **React Native Chart Kit**: Data visualization
- **Lottie**: Animated illustrations

### Audio & Media

- **Expo AV**: Audio recording and playback
- **Expo Image Picker**: Image selection and capture

## 📊 Data Architecture

### Stores

- `sessionState.ts`: Active session management
- `flowStore.ts`: Flow creation and management
- `taskStore.ts`: Task tracking and organization
- `journalStore.ts`: Journal entries and content
- `sessionIntelligence.ts`: Analytics and insights
- `settingsStore.ts`: App configuration
- `streakStore.ts`: Streak tracking
- `onboardingStore.ts`: Onboarding flow state

### Data Persistence

- All stores use Zustand's persist middleware
- Custom AsyncStorage wrapper for React Native
- Automatic data migration and backup
- Offline-first architecture

## 🎨 Design System

### Colors

- **Primary**: Customizable brand colors
- **Secondary**: Supporting UI elements
- **Accent**: Highlight and interactive elements
- **Semantic**: Success, warning, error states

### Typography

- **Sora Font Family**: Clean, modern typeface
- **Hierarchy**: Bold, SemiBold, Medium, Regular weights
- **Responsive**: Adaptive sizing for different screens

### Components

- **Cards**: Consistent elevation and spacing
- **Buttons**: Interactive states and feedback
- **Modals**: Overlay patterns and animations
- **Forms**: Input styling and validation

## 🔧 Configuration

### Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Configure your environment variables
EXPO_PUBLIC_API_URL=your_api_url
EXPO_PUBLIC_APP_NAME=Solitude
```

### Build Configuration

```json
{
  "expo": {
    "name": "Solitude",
    "slug": "solitude-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    }
  }
}
```

## 📈 Performance Optimizations

### React Native Optimizations

- **Memoization**: React.memo for expensive components
- **useMemo/useCallback**: Prevent unnecessary re-renders
- **Lazy Loading**: On-demand component loading
- **Image Optimization**: Efficient image handling

### Animation Performance

- **Reanimated 2**: Native thread animations
- **Gesture Handler**: Optimized touch interactions
- **Layout Animations**: Smooth transitions

### Data Performance

- **Efficient Queries**: Optimized data fetching
- **Caching**: Smart data caching strategies
- **Pagination**: Large dataset handling

## 🧪 Testing

### Unit Testing

```bash
npm run test
```

### E2E Testing

```bash
npm run test:e2e
```

### Performance Testing

```bash
npm run test:performance
```

## 📦 Deployment

### Expo Build

```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android
```

### App Store Deployment

```bash
# Submit to App Store
expo submit:ios

# Submit to Google Play
expo submit:android
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use conventional commit messages
- Write comprehensive tests
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Expo Team**: For the amazing development platform
- **React Native Community**: For the robust ecosystem
- **Zustand**: For lightweight state management
- **NativeWind**: For Tailwind CSS in React Native

## 📞 Support

- **Documentation**: [docs.solitude.app](https://docs.solitude.app)
- **Issues**: [GitHub Issues](https://github.com/yourusername/solitude/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/solitude/discussions)
- **Email**: support@solitude.app

---

<div align="center">

**Built with ❤️ by the Solitude Team**

[![GitHub stars](https://img.shields.io/github/stars/yourusername/solitude?style=social)](https://github.com/yourusername/solitude)
[![GitHub forks](https://img.shields.io/github/forks/yourusername/solitude?style=social)](https://github.com/yourusername/solitude)
[![GitHub issues](https://img.shields.io/github/issues/yourusername/solitude)](https://github.com/yourusername/solitude/issues)

</div>
