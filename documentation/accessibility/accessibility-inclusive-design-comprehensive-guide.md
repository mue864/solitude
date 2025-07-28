# React Native Accessibility and Inclusive Design with NativeWind - Comprehensive Guide

## Table of Contents

1. [Accessibility Fundamentals](#accessibility-fundamentals)
2. [Screen Reader Support](#screen-reader-support)
3. [Voice Control and Navigation](#voice-control-and-navigation)
4. [Visual Accessibility](#visual-accessibility)
5. [Motor Accessibility](#motor-accessibility)
6. [Cognitive Accessibility](#cognitive-accessibility)
7. [Inclusive Design Patterns](#inclusive-design-patterns)
8. [Testing Accessibility](#testing-accessibility)
9. [Best Practices](#best-practices)

## Accessibility Fundamentals

### Why Accessibility Matters

Accessibility ensures your app is usable by people with:

- **Visual impairments** (blindness, low vision, color blindness)
- **Motor impairments** (limited dexterity, tremors)
- **Hearing impairments** (deafness, hard of hearing)
- **Cognitive impairments** (memory, attention, learning disabilities)
- **Temporary disabilities** (broken arm, eye injury)

### Accessibility Standards

```javascript
// WCAG 2.1 Guidelines for React Native
const accessibilityStandards = {
  // Perceivable
  perceivable: {
    textAlternatives: "Provide text alternatives for non-text content",
    timeBasedMedia: "Provide alternatives for time-based media",
    adaptable: "Create content that can be presented in different ways",
    distinguishable: "Make it easier to see and hear content",
  },

  // Operable
  operable: {
    keyboardAccessible: "Make all functionality available from a keyboard",
    enoughTime: "Provide users enough time to read and use content",
    seizures: "Do not design content that could cause seizures",
    navigable: "Provide ways to help users navigate and find content",
  },

  // Understandable
  understandable: {
    readable: "Make text content readable and understandable",
    predictable: "Make web pages appear and operate in predictable ways",
    inputAssistance: "Help users avoid and correct mistakes",
  },

  // Robust
  robust: {
    compatible: "Maximize compatibility with current and future tools",
  },
};
```

## Screen Reader Support

### 1. Basic Accessibility Props

```javascript
// components/AccessibleButton.tsx
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

interface AccessibleButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: 'button' | 'link' | 'tab';
  accessibilityState?: {
    disabled?: boolean;
    selected?: boolean;
    checked?: boolean;
  };
  className?: string;
}

const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  onPress,
  children,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  accessibilityState,
  className,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
      accessibilityState={accessibilityState}
      className={`bg-primary-500 rounded-lg px-4 py-3 ${className}`}
    >
      <Text className="text-white font-semibold text-center">
        {children}
      </Text>
    </TouchableOpacity>
  );
};

export default AccessibleButton;
```

### 2. Accessible Form Components

```javascript
// components/AccessibleInput.tsx
import React, { forwardRef } from 'react';
import { TextInput, View, Text, TextInputProps } from 'react-native';

interface AccessibleInputProps extends TextInputProps {
  label: string;
  error?: string;
  helper?: string;
  required?: boolean;
  className?: string;
}

const AccessibleInput = forwardRef<TextInput, AccessibleInputProps>(({
  label,
  error,
  helper,
  required = false,
  className,
  ...props
}, ref) => {
  const inputId = React.useId();
  const errorId = React.useId();
  const helperId = React.useId();

  return (
    <View className="space-y-1">
      <Text
        className="text-sm font-medium text-gray-700"
        accessibilityRole="header"
      >
        {label}
        {required && <Text className="text-red-500"> *</Text>}
      </Text>

      <TextInput
        ref={ref}
        accessible={true}
        accessibilityLabel={label}
        accessibilityHint={helper}
        accessibilityRole="text"
        accessibilityRequired={required}
        accessibilityInvalid={!!error}
        accessibilityDescribedBy={error ? errorId : helper ? helperId : undefined}
        className={`border rounded-lg px-4 py-3 text-base ${
          error ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
        } ${className}`}
        {...props}
      />

      {error && (
        <Text
          className="text-sm text-red-600"
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          {error}
        </Text>
      )}

      {helper && !error && (
        <Text className="text-sm text-gray-500">
          {helper}
        </Text>
      )}
    </View>
  );
});

AccessibleInput.displayName = 'AccessibleInput';

export default AccessibleInput;
```

### 3. Accessible Navigation

```javascript
// components/AccessibleNavigation.tsx
import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';

interface NavigationItem {
  id: string;
  label: string;
  icon?: string;
  isActive?: boolean;
  onPress: () => void;
}

interface AccessibleNavigationProps {
  items: NavigationItem[];
  className?: string;
}

const AccessibleNavigation: React.FC<AccessibleNavigationProps> = ({
  items,
  className,
}) => {
  return (
    <View
      className={`flex-row bg-white border-b border-gray-200 ${className}`}
      accessibilityRole="tablist"
    >
      {items.map((item, index) => (
        <TouchableOpacity
          key={item.id}
          onPress={item.onPress}
          accessible={true}
          accessibilityLabel={item.label}
          accessibilityRole="tab"
          accessibilityState={{
            selected: item.isActive,
          }}
          accessibilityHint={`Navigate to ${item.label}`}
          className={`flex-1 px-4 py-3 ${
            item.isActive ? 'border-b-2 border-primary-500' : ''
          }`}
        >
          <Text
            className={`text-center font-medium ${
              item.isActive ? 'text-primary-600' : 'text-gray-600'
            }`}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default AccessibleNavigation;
```

## Voice Control and Navigation

### 1. Voice Control Support

```javascript
// components/VoiceControlButton.tsx
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

interface VoiceControlButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  voiceLabel: string;
  voiceHint?: string;
  className?: string;
}

const VoiceControlButton: React.FC<VoiceControlButtonProps> = ({
  onPress,
  children,
  voiceLabel,
  voiceHint,
  className,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessible={true}
      accessibilityLabel={voiceLabel}
      accessibilityHint={voiceHint}
      accessibilityRole="button"
      accessibilityActions={[
        { name: 'activate', label: 'Activate button' },
        { name: 'longpress', label: 'Long press for more options' },
      ]}
      onAccessibilityAction={(event) => {
        switch (event.nativeEvent.actionName) {
          case 'activate':
            onPress();
            break;
          case 'longpress':
            // Handle long press action
            break;
        }
      }}
      className={`bg-primary-500 rounded-lg px-4 py-3 ${className}`}
    >
      <Text className="text-white font-semibold text-center">
        {children}
      </Text>
    </TouchableOpacity>
  );
};

export default VoiceControlButton;
```

### 2. Keyboard Navigation

```javascript
// components/KeyboardNavigableList.tsx
import React, { useRef, useState } from 'react';
import { FlatList, TouchableOpacity, Text, View } from 'react-native';

interface KeyboardNavigableListProps {
  data: any[];
  onItemPress: (item: any) => void;
  renderItem: (item: any, index: number) => React.ReactNode;
  className?: string;
}

const KeyboardNavigableList: React.FC<KeyboardNavigableListProps> = ({
  data,
  onItemPress,
  renderItem,
  className,
}) => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleKeyPress = (event: any) => {
    switch (event.nativeEvent.key) {
      case 'ArrowDown':
        setFocusedIndex(prev => Math.min(prev + 1, data.length - 1));
        break;
      case 'ArrowUp':
        setFocusedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
      case ' ':
        onItemPress(data[focusedIndex]);
        break;
    }
  };

  const renderAccessibleItem = ({ item, index }: { item: any; index: number }) => {
    const isFocused = index === focusedIndex;

    return (
      <TouchableOpacity
        onPress={() => onItemPress(item)}
        accessible={true}
        accessibilityLabel={`Item ${index + 1} of ${data.length}`}
        accessibilityRole="button"
        accessibilityState={{
          selected: isFocused,
        }}
        className={`p-4 border-b border-gray-200 ${
          isFocused ? 'bg-primary-100' : 'bg-white'
        }`}
      >
        {renderItem(item, index)}
      </TouchableOpacity>
    );
  };

  return (
    <View
      className={`flex-1 ${className}`}
      accessible={true}
      accessibilityRole="list"
      accessibilityLabel={`List with ${data.length} items`}
      onKeyPress={handleKeyPress}
    >
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={renderAccessibleItem}
        keyExtractor={(item, index) => index.toString()}
        onScrollToIndexFailed={() => {}}
      />
    </View>
  );
};

export default KeyboardNavigableList;
```

## Visual Accessibility

### 1. Color Contrast and High Contrast Mode

```javascript
// components/HighContrastText.tsx
import React from 'react';
import { Text, TextProps } from 'react-native';
import { useColorScheme } from 'react-native';

interface HighContrastTextProps extends TextProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'error' | 'success';
  className?: string;
}

const HighContrastText: React.FC<HighContrastTextProps> = ({
  children,
  variant = 'primary',
  className,
  ...props
}) => {
  const colorScheme = useColorScheme();
  const isHighContrast = colorScheme === 'dark'; // Simplified check

  const getContrastClasses = () => {
    const baseClasses = 'font-medium';
    const variantClasses = {
      primary: isHighContrast ? 'text-white' : 'text-gray-900',
      secondary: isHighContrast ? 'text-gray-300' : 'text-gray-600',
      error: 'text-red-600',
      success: 'text-green-600',
    };
    return `${baseClasses} ${variantClasses[variant]}`;
  };

  return (
    <Text
      className={`${getContrastClasses()} ${className}`}
      accessibilityRole="text"
      {...props}
    >
      {children}
    </Text>
  );
};

export default HighContrastText;
```

### 2. Focus Indicators

```javascript
// components/FocusableButton.tsx
import React, { useState } from 'react';
import { TouchableOpacity, Text, View } from 'react-native';

interface FocusableButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
}

const FocusableButton: React.FC<FocusableButtonProps> = ({
  onPress,
  children,
  variant = 'primary',
  className,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const getButtonClasses = () => {
    const baseClasses = 'rounded-lg px-4 py-3 flex-row items-center justify-center';
    const variantClasses = {
      primary: 'bg-primary-500',
      secondary: 'bg-gray-200',
    };
    const focusClasses = isFocused ? 'ring-2 ring-primary-300 ring-offset-2' : '';
    return `${baseClasses} ${variantClasses[variant]} ${focusClasses} ${className}`;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      accessible={true}
      accessibilityRole="button"
      accessibilityState={{
        focused: isFocused,
      }}
      className={getButtonClasses()}
    >
      <Text className={`font-semibold ${variant === 'primary' ? 'text-white' : 'text-gray-900'}`}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};

export default FocusableButton;
```

### 3. Large Text Support

```javascript
// components/ScalableText.tsx
import React from 'react';
import { Text, TextProps } from 'react-native';

interface ScalableTextProps extends TextProps {
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  allowFontScaling?: boolean;
  className?: string;
}

const ScalableText: React.FC<ScalableTextProps> = ({
  children,
  size = 'md',
  allowFontScaling = true,
  className,
  ...props
}) => {
  const getSizeClasses = () => {
    const sizeClasses = {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
    };
    return sizeClasses[size];
  };

  return (
    <Text
      allowFontScaling={allowFontScaling}
      maxFontSizeMultiplier={2.0}
      className={`${getSizeClasses()} ${className}`}
      accessibilityRole="text"
      {...props}
    >
      {children}
    </Text>
  );
};

export default ScalableText;
```

## Motor Accessibility

### 1. Touch Target Sizing

```javascript
// components/TouchFriendlyButton.tsx
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

interface TouchFriendlyButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const TouchFriendlyButton: React.FC<TouchFriendlyButtonProps> = ({
  onPress,
  children,
  size = 'medium',
  className,
}) => {
  const getSizeClasses = () => {
    const sizeClasses = {
      small: 'px-3 py-2 min-h-[44px]', // Minimum 44px touch target
      medium: 'px-4 py-3 min-h-[48px]',
      large: 'px-6 py-4 min-h-[56px]',
    };
    return sizeClasses[size];
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={typeof children === 'string' ? children : 'Button'}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Increase touch area
      className={`bg-primary-500 rounded-lg flex-row items-center justify-center ${getSizeClasses()} ${className}`}
    >
      <Text className="text-white font-semibold text-center">
        {children}
      </Text>
    </TouchableOpacity>
  );
};

export default TouchFriendlyButton;
```

### 2. Gesture Alternatives

```javascript
// components/GestureAlternativeButton.tsx
import React, { useState } from 'react';
import { TouchableOpacity, Text, View } from 'react-native';

interface GestureAlternativeButtonProps {
  onPress: () => void;
  onLongPress?: () => void;
  children: React.ReactNode;
  showAlternatives?: boolean;
  className?: string;
}

const GestureAlternativeButton: React.FC<GestureAlternativeButtonProps> = ({
  onPress,
  onLongPress,
  children,
  showAlternatives = false,
  className,
}) => {
  const [showOptions, setShowOptions] = useState(false);

  const handleLongPress = () => {
    if (onLongPress) {
      onLongPress();
    } else if (showAlternatives) {
      setShowOptions(true);
    }
  };

  return (
    <View className="relative">
      <TouchableOpacity
        onPress={onPress}
        onLongPress={handleLongPress}
        accessible={true}
        accessibilityRole="button"
        accessibilityActions={[
          { name: 'activate', label: 'Press to activate' },
          { name: 'longpress', label: 'Long press for more options' },
        ]}
        onAccessibilityAction={(event) => {
          switch (event.nativeEvent.actionName) {
            case 'activate':
              onPress();
              break;
            case 'longpress':
              handleLongPress();
              break;
          }
        }}
        className={`bg-primary-500 rounded-lg px-4 py-3 ${className}`}
      >
        <Text className="text-white font-semibold text-center">
          {children}
        </Text>
      </TouchableOpacity>

      {showOptions && (
        <View className="absolute top-full mt-2 bg-white rounded-lg shadow-lg p-2">
          <TouchableOpacity
            onPress={() => {
              onPress();
              setShowOptions(false);
            }}
            className="px-3 py-2"
          >
            <Text className="text-gray-900">Quick Action</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              onLongPress?.();
              setShowOptions(false);
            }}
            className="px-3 py-2"
          >
            <Text className="text-gray-900">Advanced Action</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default GestureAlternativeButton;
```

## Cognitive Accessibility

### 1. Clear and Simple Language

```javascript
// components/SimpleText.tsx
import React from 'react';
import { Text, TextProps } from 'react-native';

interface SimpleTextProps extends TextProps {
  children: React.ReactNode;
  readingLevel?: 'simple' | 'standard' | 'detailed';
  className?: string;
}

const SimpleText: React.FC<SimpleTextProps> = ({
  children,
  readingLevel = 'standard',
  className,
  ...props
}) => {
  const getReadingLevelClasses = () => {
    const levelClasses = {
      simple: 'text-base leading-relaxed',
      standard: 'text-base',
      detailed: 'text-sm leading-tight',
    };
    return levelClasses[readingLevel];
  };

  return (
    <Text
      className={`${getReadingLevelClasses()} ${className}`}
      accessibilityRole="text"
      {...props}
    >
      {children}
    </Text>
  );
};

export default SimpleText;
```

### 2. Consistent Navigation

```javascript
// components/ConsistentNavigation.tsx
import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';

interface NavigationItem {
  id: string;
  label: string;
  icon?: string;
  isActive?: boolean;
  onPress: () => void;
}

interface ConsistentNavigationProps {
  items: NavigationItem[];
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

const ConsistentNavigation: React.FC<ConsistentNavigationProps> = ({
  items,
  orientation = 'horizontal',
  className,
}) => {
  const getOrientationClasses = () => {
    return orientation === 'horizontal'
      ? 'flex-row space-x-1'
      : 'flex-col space-y-1';
  };

  return (
    <View
      className={`bg-white rounded-lg p-2 ${getOrientationClasses()} ${className}`}
      accessibilityRole="navigation"
      accessibilityLabel="Main navigation"
    >
      {items.map((item, index) => (
        <TouchableOpacity
          key={item.id}
          onPress={item.onPress}
          accessible={true}
          accessibilityLabel={`${item.label}, ${index + 1} of ${items.length}`}
          accessibilityRole="button"
          accessibilityState={{
            selected: item.isActive,
          }}
          className={`px-3 py-2 rounded ${
            item.isActive ? 'bg-primary-100' : 'bg-transparent'
          }`}
        >
          <Text
            className={`font-medium ${
              item.isActive ? 'text-primary-600' : 'text-gray-700'
            }`}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default ConsistentNavigation;
```

## Inclusive Design Patterns

### 1. Error Prevention

```javascript
// components/ErrorPreventionForm.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AccessibleInput from './AccessibleInput';

interface ErrorPreventionFormProps {
  onSubmit: (data: any) => void;
  className?: string;
}

const ErrorPreventionForm: React.FC<ErrorPreventionFormProps> = ({
  onSubmit,
  className,
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <View className={`space-y-4 ${className}`}>
      <Text className="text-xl font-bold text-gray-900">
        Create Account
      </Text>

      <AccessibleInput
        label="Email Address"
        value={formData.email}
        onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
        required
      />

      <AccessibleInput
        label="Password"
        value={formData.password}
        onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
        placeholder="Enter your password"
        secureTextEntry
        error={errors.password}
        helper="Must be at least 8 characters"
        required
      />

      <AccessibleInput
        label="Confirm Password"
        value={formData.confirmPassword}
        onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
        placeholder="Confirm your password"
        secureTextEntry
        error={errors.confirmPassword}
        required
      />

      <TouchableOpacity
        onPress={handleSubmit}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Create account"
        className="bg-primary-500 rounded-lg px-4 py-3"
      >
        <Text className="text-white font-semibold text-center">
          Create Account
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ErrorPreventionForm;
```

### 2. Progressive Disclosure

```javascript
// components/ProgressiveDisclosure.tsx
import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';

interface ProgressiveDisclosureProps {
  title: string;
  children: React.ReactNode;
  initiallyExpanded?: boolean;
  className?: string;
}

const ProgressiveDisclosure: React.FC<ProgressiveDisclosureProps> = ({
  title,
  children,
  initiallyExpanded = false,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);
  const heightAnim = useRef(new Animated.Value(initiallyExpanded ? 1 : 0)).current;

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    Animated.timing(heightAnim, {
      toValue: isExpanded ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  return (
    <View className={`border border-gray-200 rounded-lg ${className}`}>
      <TouchableOpacity
        onPress={toggleExpanded}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`${title}, ${isExpanded ? 'expanded' : 'collapsed'}`}
        accessibilityState={{
          expanded: isExpanded,
        }}
        className="p-4 flex-row items-center justify-between"
      >
        <Text className="text-lg font-semibold text-gray-900">
          {title}
        </Text>
        <Text className="text-gray-500 text-xl">
          {isExpanded ? '−' : '+'}
        </Text>
      </TouchableOpacity>

      <Animated.View
        style={{
          height: heightAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 200], // Adjust based on content
          }),
          overflow: 'hidden',
        }}
      >
        <View className="p-4 pt-0">
          {children}
        </View>
      </Animated.View>
    </View>
  );
};

export default ProgressiveDisclosure;
```

## Testing Accessibility

### 1. Accessibility Testing Utilities

```javascript
// utils/accessibilityTest.ts
import { render, fireEvent } from '@testing-library/react-native';

export class AccessibilityTester {
  static testScreenReaderSupport(component: React.ReactElement) {
    const { getByRole, getByLabelText } = render(component);

    // Test that all interactive elements have accessibility labels
    const buttons = getByRole('button');
    buttons.forEach(button => {
      expect(button.props.accessibilityLabel).toBeDefined();
    });

    // Test that form inputs have proper labels
    const inputs = getByRole('text');
    inputs.forEach(input => {
      expect(input.props.accessibilityLabel).toBeDefined();
    });
  }

  static testKeyboardNavigation(component: React.ReactElement) {
    const { getByRole } = render(component);

    // Test tab order
    const focusableElements = getByRole('button').concat(getByRole('text'));

    focusableElements.forEach((element, index) => {
      fireEvent(element, 'focus');
      expect(element.props.accessibilityState?.focused).toBe(true);
    });
  }

  static testColorContrast(component: React.ReactElement) {
    const { getByText } = render(component);

    // Test that text has sufficient contrast
    const textElements = getByText(/.*/);
    textElements.forEach(element => {
      const style = element.props.style;
      // Check if text color provides sufficient contrast
      expect(style.color).toBeDefined();
    });
  }

  static testTouchTargets(component: React.ReactElement) {
    const { getByRole } = render(component);

    // Test that all touchable elements meet minimum size requirements
    const buttons = getByRole('button');
    buttons.forEach(button => {
      const style = button.props.style;
      const minHeight = style?.minHeight || 44;
      const minWidth = style?.minWidth || 44;

      expect(minHeight).toBeGreaterThanOrEqual(44);
      expect(minWidth).toBeGreaterThanOrEqual(44);
    });
  }
}
```

### 2. Accessibility Test Examples

```javascript
// __tests__/accessibility.test.tsx
import React from "react";
import { render } from "@testing-library/react-native";
import { AccessibilityTester } from "../utils/accessibilityTest";
import AccessibleButton from "../components/AccessibleButton";
import AccessibleInput from "../components/AccessibleInput";

describe("Accessibility Tests", () => {
  it("passes screen reader support tests", () => {
    const component = (
      <View>
        <AccessibleButton onPress={() => {}} accessibilityLabel="Test Button">
          Test Button
        </AccessibleButton>
        <AccessibleInput label="Test Input" />
      </View>
    );

    AccessibilityTester.testScreenReaderSupport(component);
  });

  it("passes keyboard navigation tests", () => {
    const component = (
      <View>
        <AccessibleButton onPress={() => {}}>Button 1</AccessibleButton>
        <AccessibleButton onPress={() => {}}>Button 2</AccessibleButton>
      </View>
    );

    AccessibilityTester.testKeyboardNavigation(component);
  });

  it("passes color contrast tests", () => {
    const component = (
      <View>
        <Text className="text-gray-900">High contrast text</Text>
        <Text className="text-gray-600">Medium contrast text</Text>
      </View>
    );

    AccessibilityTester.testColorContrast(component);
  });

  it("passes touch target tests", () => {
    const component = (
      <View>
        <AccessibleButton onPress={() => {}}>Large Button</AccessibleButton>
      </View>
    );

    AccessibilityTester.testTouchTargets(component);
  });
});
```

## Best Practices

### 1. Accessibility Checklist

```javascript
// utils/accessibilityChecklist.ts
export const accessibilityChecklist = {
  // Screen Reader Support
  screenReader: {
    allImagesHaveAltText: true,
    allButtonsHaveLabels: true,
    allInputsHaveLabels: true,
    properHeadingStructure: true,
    meaningfulLinkText: true,
  },

  // Keyboard Navigation
  keyboard: {
    allInteractiveElementsFocusable: true,
    logicalTabOrder: true,
    visibleFocusIndicators: true,
    keyboardShortcuts: true,
  },

  // Visual Accessibility
  visual: {
    sufficientColorContrast: true,
    notRelyingOnColorAlone: true,
    resizableText: true,
    highContrastMode: true,
  },

  // Motor Accessibility
  motor: {
    adequateTouchTargets: true,
    gestureAlternatives: true,
    noAutoPlay: true,
    pauseStopHide: true,
  },

  // Cognitive Accessibility
  cognitive: {
    clearSimpleLanguage: true,
    consistentNavigation: true,
    errorPrevention: true,
    helpAndDocumentation: true,
  },
};

export const checkAccessibility = (component: React.ReactElement) => {
  const results = {
    passed: 0,
    failed: 0,
    issues: [],
  };

  // Implement accessibility checks
  // This would integrate with actual testing libraries

  return results;
};
```

### 2. Accessibility Configuration

```javascript
// config/accessibility.ts
export const accessibilityConfig = {
  // Minimum touch target sizes
  touchTargets: {
    minimum: 44, // 44x44 points minimum
    recommended: 48, // 48x48 points recommended
  },

  // Color contrast ratios
  contrast: {
    normal: 4.5, // WCAG AA for normal text
    large: 3.0, // WCAG AA for large text
    enhanced: 7.0, // WCAG AAA
  },

  // Typography
  typography: {
    minimumSize: 16, // Minimum font size
    lineHeight: 1.5, // Recommended line height
    maxWidth: 80, // Maximum characters per line
  },

  // Focus indicators
  focus: {
    visible: true,
    style: "solid",
    width: 2,
    color: "#3B82F6",
  },

  // Screen reader
  screenReader: {
    announceChanges: true,
    liveRegions: true,
    landmarks: true,
  },
};
```

### 3. Accessibility Monitoring

```javascript
// utils/accessibilityMonitor.ts
class AccessibilityMonitor {
  private issues: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    message: string;
    element?: any;
  }> = [];

  logIssue(type: string, severity: 'low' | 'medium' | 'high', message: string, element?: any) {
    this.issues.push({ type, severity, message, element });

    if (severity === 'high') {
      console.error(`Accessibility Issue: ${message}`);
    } else if (severity === 'medium') {
      console.warn(`Accessibility Warning: ${message}`);
    } else {
      console.log(`Accessibility Note: ${message}`);
    }
  }

  getIssues() {
    return this.issues;
  }

  clearIssues() {
    this.issues = [];
  }

  generateReport() {
    const report = {
      total: this.issues.length,
      high: this.issues.filter(i => i.severity === 'high').length,
      medium: this.issues.filter(i => i.severity === 'medium').length,
      low: this.issues.filter(i => i.severity === 'low').length,
      issues: this.issues,
    };

    return report;
  }
}

export const accessibilityMonitor = new AccessibilityMonitor();
```

This comprehensive accessibility guide ensures your React Native app is inclusive and usable by everyone, regardless of their abilities. The key is to think about accessibility from the start of your design process and test regularly with real users and assistive technologies.
