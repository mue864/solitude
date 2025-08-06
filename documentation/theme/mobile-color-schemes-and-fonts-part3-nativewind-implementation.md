# Mobile App Color Schemes and Fonts - Part 3: NativeWind Implementation & Dark Mode

## Table of Contents

1. [NativeWind Color System Setup](#nativewind-color-system-setup)
2. [Dark Mode Implementation](#dark-mode-implementation)
3. [Dynamic Color Schemes](#dynamic-color-schemes)
4. [Typography with NativeWind](#typography-with-nativewind)
5. [Component Examples](#component-examples)

## NativeWind Color System Setup

### Tailwind Config for Mobile Color Schemes

```javascript
// tailwind.config.js
module.exports = {
  presets: [require("nativewind/preset")],
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand colors
        primary: {
          50: '#E3F2FD',
          100: '#BBDEFB',
          200: '#90CAF9',
          300: '#64B5F6',
          400: '#42A5F5',
          500: '#2196F3',
          600: '#1E88E5',
          700: '#1976D2',
          800: '#1565C0',
          900: '#0D47A1',
          DEFAULT: '#2196F3'
        },
        
        // Secondary colors
        secondary: {
          50: '#E0F2F1',
          500: '#009688',
          600: '#00897B',
          DEFAULT: '#009688'
        },
        
        // Semantic colors
        success: {
          50: '#E8F5E8',
          500: '#4CAF50',
          600: '#43A047',
          DEFAULT: '#4CAF50'
        },
        
        warning: {
          50: '#FFF3E0',
          500: '#FF9800',
          600: '#FB8C00',
          DEFAULT: '#FF9800'
        },
        
        error: {
          50: '#FFEBEE',
          500: '#F44336',
          600: '#E53935',
          DEFAULT: '#F44336'
        },
        
        // Neutral colors with dark mode variants
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#EEEEEE',
          300: '#E0E0E0',
          400: '#BDBDBD',
          500: '#9E9E9E',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121',
          950: '#0A0A0A'
        },
        
        // Dark mode specific colors
        dark: {
          background: '#000000',
          surface: '#121212',
          'surface-variant': '#1E1E1E',
          primary: '#BB86FC',
          secondary: '#03DAC6',
          text: '#FFFFFF',
          'text-secondary': '#B3B3B3',
          border: '#333333'
        }
      },
      
      // Custom font families
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Poppins', 'system-ui', 'sans-serif'],
        'system': ['-apple-system', 'BlinkMacSystemFont', 'Roboto', 'sans-serif']
      }
    }
  }
};
```

## Dark Mode Implementation

### Context-Based Dark Mode
```javascript
// contexts/ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('system');
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    loadThemePreference();
  }, []);

  useEffect(() => {
    const newIsDark = themeMode === 'system' 
      ? systemColorScheme === 'dark' 
      : themeMode === 'dark';
    
    setIsDark(newIsDark);
  }, [themeMode, systemColorScheme]);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme_preference');
      if (savedTheme) {
        setThemeMode(savedTheme);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const saveThemePreference = async (mode) => {
    try {
      await AsyncStorage.setItem('theme_preference', mode);
      setThemeMode(mode);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const toggleTheme = () => {
    const newMode = isDark ? 'light' : 'dark';
    saveThemePreference(newMode);
  };

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        themeMode,
        toggleTheme,
        setTheme: saveThemePreference
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
```

### Dark Mode Root Component
```javascript
// App.js
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MainNavigator from './navigation/MainNavigator';

const AppContent = () => {
  const { isDark } = useTheme();
  
  return (
    <SafeAreaProvider className={isDark ? 'dark' : ''}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <MainNavigator />
    </SafeAreaProvider>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
```

## Dynamic Color Schemes

### Theme Switching Component
```javascript
// components/ThemeSelector.js
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeSelector = () => {
  const { themeMode, setTheme } = useTheme();
  
  const themes = [
    { key: 'light', label: 'Light', icon: '☀️' },
    { key: 'dark', label: 'Dark', icon: '🌙' },
    { key: 'system', label: 'System', icon: '⚙️' }
  ];
  
  return (
    <View className="bg-white dark:bg-dark-surface p-4 rounded-xl">
      <Text className="text-xl font-semibold text-neutral-900 dark:text-dark-text mb-4">
        Choose Theme
      </Text>
      
      <View className="flex-row space-x-3">
        {themes.map((theme) => (
          <TouchableOpacity
            key={theme.key}
            onPress={() => setTheme(theme.key)}
            className={`
              flex-1 p-4 rounded-xl border-2 items-center
              ${themeMode === theme.key 
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                : 'border-neutral-200 dark:border-dark-border bg-neutral-50 dark:bg-dark-surface'
              }
            `}
          >
            <Text className="text-2xl mb-2">{theme.icon}</Text>
            <Text className={`
              text-sm font-medium
              ${themeMode === theme.key 
                ? 'text-primary-600 dark:text-primary-400' 
                : 'text-neutral-600 dark:text-neutral-400'
              }
            `}>
              {theme.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
```

### Adaptive Button Component
```javascript
// components/AdaptiveButton.js
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

export const AdaptiveButton = ({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  onPress,
  disabled = false,
  className = '',
  ...props 
}) => {
  const variantClasses = {
    primary: `
      bg-primary-500 active:bg-primary-600 
      dark:bg-dark-primary dark:active:bg-primary-400
    `,
    secondary: `
      bg-secondary-500 active:bg-secondary-600
      dark:bg-dark-secondary dark:active:bg-secondary-400
    `,
    outline: `
      border-2 border-primary-500 bg-transparent active:bg-primary-50
      dark:border-dark-primary dark:active:bg-primary-900/20
    `,
    ghost: `
      bg-transparent active:bg-neutral-100
      dark:active:bg-neutral-800
    `
  };
  
  const sizeClasses = {
    small: 'px-3 py-2 rounded-lg',
    medium: 'px-4 py-3 rounded-xl',
    large: 'px-6 py-4 rounded-xl'
  };
  
  const textVariants = {
    primary: 'text-white font-medium',
    secondary: 'text-white font-medium',
    outline: 'text-primary-500 dark:text-dark-primary font-medium',
    ghost: 'text-neutral-700 dark:text-dark-text font-medium'
  };
  
  const disabledClasses = disabled 
    ? 'opacity-50 bg-neutral-300 dark:bg-neutral-700' 
    : '';
  
  return (
    <TouchableOpacity
      onPress={disabled ? undefined : onPress}
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabledClasses}
        ${className}
        items-center justify-center
      `}
      disabled={disabled}
      {...props}
    >
      <Text className={textVariants[variant]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};
```

## Typography with NativeWind

### Typography Components
```javascript
// components/Typography.js
import React from 'react';
import { Text } from 'react-native';

export const Display = ({ children, className = '', ...props }) => (
  <Text 
    className={`text-5xl font-bold leading-tight text-neutral-900 dark:text-dark-text ${className}`}
    {...props}
  >
    {children}
  </Text>
);

export const Headline1 = ({ children, className = '', ...props }) => (
  <Text 
    className={`text-4xl font-bold leading-tight text-neutral-900 dark:text-dark-text ${className}`}
    {...props}
  >
    {children}
  </Text>
);

export const Headline2 = ({ children, className = '', ...props }) => (
  <Text 
    className={`text-3xl font-semibold leading-tight text-neutral-900 dark:text-dark-text ${className}`}
    {...props}
  >
    {children}
  </Text>
);

export const Title1 = ({ children, className = '', ...props }) => (
  <Text 
    className={`text-xl font-medium leading-relaxed text-neutral-900 dark:text-dark-text ${className}`}
    {...props}
  >
    {children}
  </Text>
);

export const Body1 = ({ children, className = '', ...props }) => (
  <Text 
    className={`text-base leading-relaxed text-neutral-700 dark:text-dark-text-secondary ${className}`}
    {...props}
  >
    {children}
  </Text>
);

export const Body2 = ({ children, className = '', ...props }) => (
  <Text 
    className={`text-sm leading-relaxed text-neutral-600 dark:text-neutral-400 ${className}`}
    {...props}
  >
    {children}
  </Text>
);

export const Caption = ({ children, className = '', ...props }) => (
  <Text 
    className={`text-xs leading-normal text-neutral-500 dark:text-neutral-400 ${className}`}
    {...props}
  >
    {children}
  </Text>
);
```

## Component Examples

### Complete Card Component
```javascript
// components/Card.js
import React from 'react';
import { View, TouchableOpacity, Image, Text } from 'react-native';
import { AdaptiveButton } from './AdaptiveButton';

export const Card = ({ 
  title, 
  description, 
  imageUri, 
  onPress, 
  actions = [],
  variant = 'default',
  className = '' 
}) => {
  const variantClasses = {
    default: 'bg-white dark:bg-dark-surface border border-neutral-200 dark:border-dark-border',
    elevated: 'bg-white dark:bg-dark-surface-variant shadow-lg',
    outlined: 'bg-transparent border-2 border-primary-500 dark:border-dark-primary'
  };
  
  const CardWrapper = onPress ? TouchableOpacity : View;
  
  return (
    <CardWrapper
      onPress={onPress}
      className={`
        ${variantClasses[variant]}
        rounded-xl p-4 mb-4
        ${className}
      `}
    >
      {imageUri && (
        <Image 
          source={{ uri: imageUri }}
          className="w-full h-48 rounded-lg mb-4"
          resizeMode="cover"
        />
      )}
      
      <View className="space-y-2">
        {title && (
          <Text className="text-xl font-semibold text-neutral-900 dark:text-dark-text">
            {title}
          </Text>
        )}
        
        {description && (
          <Text className="text-base leading-relaxed text-neutral-700 dark:text-dark-text-secondary">
            {description}
          </Text>
        )}
        
        {actions.length > 0 && (
          <View className="flex-row space-x-2 mt-4">
            {actions.map((action, index) => (
              <AdaptiveButton
                key={index}
                variant={action.variant || 'outline'}
                size="small"
                onPress={action.onPress}
                className="flex-1"
              >
                {action.label}
              </AdaptiveButton>
            ))}
          </View>
        )}
      </View>
    </CardWrapper>
  );
};
```

### Status Badge Component
```javascript
// components/StatusBadge.js
import React from 'react';
import { View, Text } from 'react-native';

export const StatusBadge = ({ 
  status, 
  label, 
  size = 'medium',
  className = '' 
}) => {
  const statusClasses = {
    success: 'bg-success-100 dark:bg-success-900/30 border-success-200 dark:border-success-800',
    warning: 'bg-warning-100 dark:bg-warning-900/30 border-warning-200 dark:border-warning-800',
    error: 'bg-error-100 dark:bg-error-900/30 border-error-200 dark:border-error-800',
    info: 'bg-primary-100 dark:bg-primary-900/30 border-primary-200 dark:border-primary-800',
    neutral: 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700'
  };
  
  const textClasses = {
    success: 'text-success-700 dark:text-success-300',
    warning: 'text-warning-700 dark:text-warning-300',
    error: 'text-error-700 dark:text-error-300',
    info: 'text-primary-700 dark:text-primary-300',
    neutral: 'text-neutral-700 dark:text-neutral-300'
  };
  
  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    medium: 'px-3 py-1.5 text-sm',
    large: 'px-4 py-2 text-base'
  };
  
  return (
    <View className={`
      ${statusClasses[status]}
      ${sizeClasses[size]}
      border rounded-full items-center justify-center
      ${className}
    `}>
      <Text className={`${textClasses[status]} font-medium`}>
        {label}
      </Text>
    </View>
  );
};
```

### Usage Examples
```javascript
// screens/ExampleScreen.js
import React from 'react';
import { ScrollView, View } from 'react-native';
import { Card } from '../components/Card';
import { AdaptiveButton } from '../components/AdaptiveButton';
import { StatusBadge } from '../components/StatusBadge';
import { ThemeSelector } from '../components/ThemeSelector';
import { Display, Headline1, Body1 } from '../components/Typography';

export const ExampleScreen = () => {
  return (
    <ScrollView className="flex-1 bg-neutral-50 dark:bg-dark-background">
      <View className="p-4 space-y-6">
        
        {/* Typography Examples */}
        <View className="space-y-4">
          <Display>Welcome</Display>
          <Headline1>Color Schemes & Fonts</Headline1>
          <Body1>
            This demonstrates the implementation of color schemes and typography 
            using NativeWind with full dark mode support.
          </Body1>
        </View>
        
        {/* Theme Selector */}
        <ThemeSelector />
        
        {/* Button Examples */}
        <View className="space-y-3">
          <AdaptiveButton variant="primary">
            Primary Button
          </AdaptiveButton>
          <AdaptiveButton variant="secondary">
            Secondary Button
          </AdaptiveButton>
          <AdaptiveButton variant="outline">
            Outline Button
          </AdaptiveButton>
          <AdaptiveButton variant="ghost">
            Ghost Button
          </AdaptiveButton>
        </View>
        
        {/* Status Badges */}
        <View className="flex-row flex-wrap gap-2">
          <StatusBadge status="success" label="Success" />
          <StatusBadge status="warning" label="Warning" />
          <StatusBadge status="error" label="Error" />
          <StatusBadge status="info" label="Info" />
          <StatusBadge status="neutral" label="Neutral" />
        </View>
        
        {/* Card Examples */}
        <Card
          title="Example Card"
          description="This card demonstrates the adaptive color scheme with proper contrast ratios for accessibility."
          actions={[
            { label: 'Action 1', variant: 'primary', onPress: () => {} },
            { label: 'Action 2', variant: 'outline', onPress: () => {} }
          ]}
        />
        
      </View>
    </ScrollView>
  );
};
```

This Part 3 covers practical NativeWind implementation with complete dark mode support, adaptive components, and real-world examples. In Part 4, we'll cover:

- **Part 4**: Advanced animations, transitions, and micro-interactions
- **Part 5**: Testing color schemes and accessibility validation
- **Part 6**: Performance optimization and best practices

Would you like me to continue with Part 4?
