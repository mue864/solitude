# React Native Setup Guide with NativeWind

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Development Environment Setup](#development-environment-setup)
3. [Creating a New React Native Project](#creating-a-new-react-native-project)
4. [Setting Up NativeWind](#setting-up-nativewind)
5. [Project Structure](#project-structure)
6. [Essential Dependencies](#essential-dependencies)
7. [Development Workflow](#development-workflow)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** (comes with Node.js)
- **Git** - [Download here](https://git-scm.com/)
- **Code Editor** - VS Code recommended

### Platform-Specific Requirements

#### For Android Development
- **Android Studio** - [Download here](https://developer.android.com/studio)
- **Java Development Kit (JDK)** - OpenJDK 11 or higher
- **Android SDK** (installed via Android Studio)

#### For iOS Development (macOS only)
- **Xcode** - Available on Mac App Store
- **Xcode Command Line Tools**
- **CocoaPods** - `sudo gem install cocoapods`

### Check Your Setup
```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check if React Native CLI is installed
npx react-native --version
```

---

## Development Environment Setup

### 1. Install React Native CLI
```bash
# Install globally (optional, can use npx)
npm install -g @react-native-community/cli

# Or use npx for each command (recommended)
npx @react-native-community/cli --version
```

### 2. Android Setup (Windows/macOS/Linux)

#### Install Android Studio
1. Download and install Android Studio
2. During installation, make sure to install:
   - Android SDK
   - Android SDK Platform
   - Android Virtual Device

#### Configure Environment Variables
Add to your system environment variables:

**Windows:**
```bash
# Add to System Environment Variables
ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
ANDROID_SDK_ROOT=C:\Users\%USERNAME%\AppData\Local\Android\Sdk

# Add to PATH
%ANDROID_HOME%\emulator
%ANDROID_HOME%\platform-tools
```

**macOS/Linux:**
```bash
# Add to ~/.bash_profile or ~/.zshrc
export ANDROID_HOME=$HOME/Library/Android/sdk
export ANDROID_SDK_ROOT=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

#### Create Android Virtual Device (AVD)
1. Open Android Studio
2. Go to Tools → AVD Manager
3. Create Virtual Device
4. Choose a device (Pixel 4 recommended)
5. Download and select a system image (API 30+ recommended)
6. Finish setup

### 3. iOS Setup (macOS only)

#### Install Xcode
```bash
# Install Xcode from App Store
# Then install command line tools
xcode-select --install
```

#### Install CocoaPods
```bash
sudo gem install cocoapods
```

---

## Creating a New React Native Project

### 1. Create Project
```bash
# Create new React Native project
npx @react-native-community/cli@latest init MyAwesomeApp

# Navigate to project directory
cd MyAwesomeApp

# Install dependencies
npm install
```

### 2. Test Installation
```bash
# Start Metro bundler
npx react-native start

# In a new terminal, run on Android
npx react-native run-android

# Or run on iOS (macOS only)
npx react-native run-ios
```

---

## Setting Up NativeWind

NativeWind brings Tailwind CSS to React Native, allowing you to style components using utility classes.

### 1. Install NativeWind
```bash
# Install NativeWind and its dependencies
npm install nativewind
npm install --save-dev tailwindcss

# Initialize Tailwind CSS
npx tailwindcss init
```

### 2. Configure Tailwind CSS
Update `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### 3. Configure Babel
Update `babel.config.js`:

```javascript
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: ['nativewind/babel'],
};
```

### 4. Configure Metro
Create or update `metro.config.js`:

```javascript
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    assetExts: ['bin', 'txt', 'jpg', 'png', 'json', 'gif', 'webp', 'svg'],
    sourceExts: ['js', 'json', 'ts', 'tsx', 'jsx'],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
```

### 5. Add TypeScript Support (Optional but Recommended)
```bash
# Install TypeScript dependencies
npm install --save-dev typescript @types/react @types/react-native

# Create tsconfig.json
npx tsc --init
```

Update `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "esnext",
    "lib": ["es2017"],
    "allowJs": true,
    "skipLibCheck": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": [
    "src",
    "App.tsx"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

### 6. Create NativeWind Types (TypeScript)
Create `nativewind-env.d.ts` in your project root:

```typescript
/// <reference types="nativewind/types" />
```

### 7. Test NativeWind Setup
Update `App.tsx` (or `App.js`):

```tsx
import React from 'react';
import {SafeAreaView, Text, View, StatusBar} from 'react-native';

function App(): JSX.Element {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View className="flex-1 justify-center items-center px-4">
        <Text className="text-3xl font-bold text-blue-600 mb-4">
          Welcome to React Native!
        </Text>
        <Text className="text-lg text-gray-700 text-center">
          This app is styled with NativeWind (Tailwind CSS)
        </Text>
        <View className="mt-8 p-4 bg-blue-100 rounded-lg">
          <Text className="text-blue-800 font-semibold">
            NativeWind is working! 🎉
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default App;
```

---

## Project Structure

### Recommended Folder Structure
```
MyAwesomeApp/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/         # Common components (Button, Input, etc.)
│   │   └── specific/       # Feature-specific components
│   ├── screens/            # Screen components
│   │   ├── auth/          # Authentication screens
│   │   ├── home/          # Home screens
│   │   └── profile/       # Profile screens
│   ├── navigation/         # Navigation configuration
│   ├── services/          # API services and utilities
│   │   ├── api.js         # API client
│   │   └── auth.js        # Authentication service
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   ├── constants/         # App constants
│   └── types/             # TypeScript type definitions
├── assets/                # Images, fonts, etc.
├── android/               # Android-specific code
├── ios/                   # iOS-specific code
├── App.tsx                # Root component
├── index.js               # Entry point
├── package.json
├── tailwind.config.js
├── babel.config.js
├── metro.config.js
└── tsconfig.json
```

### Create Basic Structure
```bash
# Create folder structure
mkdir -p src/{components/{common,specific},screens/{auth,home,profile},navigation,services,hooks,utils,constants,types}
mkdir assets/{images,fonts}

# Create index files
touch src/components/index.ts
touch src/screens/index.ts
touch src/services/index.ts
```

---

## Essential Dependencies

### Navigation
```bash
# React Navigation v6
npm install @react-navigation/native
npm install react-native-screens react-native-safe-area-context

# Stack Navigator
npm install @react-navigation/stack
npm install react-native-gesture-handler

# Bottom Tabs (optional)
npm install @react-navigation/bottom-tabs

# For iOS, install CocoaPods dependencies
cd ios && pod install && cd ..
```

### State Management
```bash
# Redux Toolkit (recommended)
npm install @reduxjs/toolkit react-redux

# Or Zustand (lightweight alternative)
npm install zustand

# Or React Query for server state
npm install @tanstack/react-query
```

### HTTP Client
```bash
# Axios for API calls
npm install axios

# Or use built-in fetch (no installation needed)
```

### Form Handling
```bash
# React Hook Form
npm install react-hook-form

# Validation
npm install yup
npm install @hookform/resolvers
```

### Storage
```bash
# AsyncStorage for local storage
npm install @react-native-async-storage/async-storage
```

### UI Components (Optional)
```bash
# React Native Elements
npm install react-native-elements react-native-vector-icons

# Or NativeBase
npm install native-base react-native-svg react-native-safe-area-context
```

---

## Development Workflow

### 1. Basic Navigation Setup
Create `src/navigation/AppNavigator.tsx`:

```tsx
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type RootStackParamList = {
  Home: undefined;
  Profile: {userId: string};
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{title: 'Welcome'}}
        />
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{title: 'Profile'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
```

### 2. Create Sample Screens
Create `src/screens/HomeScreen.tsx`:

```tsx
import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../navigation/AppNavigator';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({navigation}) => {
  return (
    <View className="flex-1 justify-center items-center bg-gray-50 px-4">
      <Text className="text-2xl font-bold text-gray-800 mb-8">
        Home Screen
      </Text>
      
      <TouchableOpacity
        className="bg-blue-500 px-6 py-3 rounded-lg"
        onPress={() => navigation.navigate('Profile', {userId: '123'})}
      >
        <Text className="text-white font-semibold">Go to Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;
```

Create `src/screens/ProfileScreen.tsx`:

```tsx
import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../navigation/AppNavigator';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;
type ProfileScreenRouteProp = RouteProp<RootStackParamList, 'Profile'>;

interface Props {
  navigation: ProfileScreenNavigationProp;
  route: ProfileScreenRouteProp;
}

const ProfileScreen: React.FC<Props> = ({navigation, route}) => {
  const {userId} = route.params;

  return (
    <View className="flex-1 justify-center items-center bg-gray-50 px-4">
      <Text className="text-2xl font-bold text-gray-800 mb-4">
        Profile Screen
      </Text>
      
      <Text className="text-lg text-gray-600 mb-8">
        User ID: {userId}
      </Text>
      
      <TouchableOpacity
        className="bg-green-500 px-6 py-3 rounded-lg"
        onPress={() => navigation.goBack()}
      >
        <Text className="text-white font-semibold">Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProfileScreen;
```

### 3. Update App.tsx
```tsx
import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';

const App = () => {
  return <AppNavigator />;
};

export default App;
```

### 4. Common Components with NativeWind
Create `src/components/common/Button.tsx`:

```tsx
import React from 'react';
import {TouchableOpacity, Text, TouchableOpacityProps} from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
}

const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  className,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-500 active:bg-blue-600';
      case 'secondary':
        return 'bg-gray-500 active:bg-gray-600';
      case 'danger':
        return 'bg-red-500 active:bg-red-600';
      default:
        return 'bg-blue-500 active:bg-blue-600';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return 'px-3 py-2';
      case 'medium':
        return 'px-4 py-3';
      case 'large':
        return 'px-6 py-4';
      default:
        return 'px-4 py-3';
    }
  };

  const getTextSizeStyles = () => {
    switch (size) {
      case 'small':
        return 'text-sm';
      case 'medium':
        return 'text-base';
      case 'large':
        return 'text-lg';
      default:
        return 'text-base';
    }
  };

  return (
    <TouchableOpacity
      className={`${getVariantStyles()} ${getSizeStyles()} rounded-lg items-center justify-center ${className}`}
      {...props}
    >
      <Text className={`text-white font-semibold ${getTextSizeStyles()}`}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default Button;
```

### 5. API Service Setup
Create `src/services/api.ts`:

```typescript
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api' 
  : 'https://your-production-api.com/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // GET request
  static async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST request
  static async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  static async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  static async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export default ApiService;
```

---

## Development Commands

### Running the App
```bash
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on specific device
npx react-native run-android --deviceId=DEVICE_ID
npx react-native run-ios --simulator="iPhone 14"
```

### Debugging
```bash
# Open developer menu
# Android: Ctrl + M (Windows/Linux) or Cmd + M (macOS)
# iOS: Cmd + D

# Enable remote debugging
# Shake device or use developer menu → Debug

# View logs
npx react-native log-android
npx react-native log-ios
```

### Building for Production
```bash
# Android
cd android
./gradlew assembleRelease

# iOS
npx react-native run-ios --configuration Release
```

---

## Troubleshooting

### Common Issues and Solutions

#### Metro bundler issues
```bash
# Clear Metro cache
npx react-native start --reset-cache

# Clear npm cache
npm start -- --reset-cache
```

#### Android build issues
```bash
# Clean and rebuild
cd android
./gradlew clean
cd ..
npx react-native run-android
```

#### iOS build issues
```bash
# Clean iOS build
cd ios
xcodebuild clean
pod install
cd ..
npx react-native run-ios
```

#### NativeWind not working
1. Ensure `babel.config.js` includes the NativeWind plugin
2. Restart Metro bundler after configuration changes
3. Check `tailwind.config.js` content paths
4. Clear Metro cache: `npx react-native start --reset-cache`

#### TypeScript errors
```bash
# Check TypeScript configuration
npx tsc --noEmit

# Install missing type definitions
npm install --save-dev @types/react-native
```

### Environment Variables
Create `.env` file:
```bash
API_BASE_URL=http://localhost:3000/api
APP_NAME=MyAwesomeApp
```

Install react-native-config:
```bash
npm install react-native-config
```

---

## Next Steps

### Recommended Learning Path
1. **Master the basics**: Components, props, state, navigation
2. **Learn NativeWind**: Practice with different utility classes
3. **API Integration**: Connect to your Node.js/Express backend
4. **State Management**: Implement Redux or Zustand
5. **Forms and Validation**: Handle user input effectively
6. **Testing**: Write unit and integration tests
7. **Performance**: Optimize your app for production

### Useful Resources
- [React Native Documentation](https://reactnative.dev/)
- [NativeWind Documentation](https://www.nativewind.dev/)
- [React Navigation Documentation](https://reactnavigation.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

### VS Code Extensions
- React Native Tools
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- TypeScript Importer

---

## Summary

You now have a complete React Native development environment with:

✅ **React Native CLI** setup  
✅ **NativeWind** for Tailwind CSS styling  
✅ **TypeScript** support  
✅ **Navigation** configured  
✅ **Project structure** organized  
✅ **API service** ready for backend integration  
✅ **Development workflow** established  

Your React Native app is ready to consume your Node.js/Express + MongoDB backend! 🚀

Start building your take-home assignment with confidence using this modern, scalable setup.
