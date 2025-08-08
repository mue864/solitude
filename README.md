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

