# React Native Component Library Patterns with NativeWind - Comprehensive Guide

## Table of Contents

1. [Introduction to Component Libraries](#introduction-to-component-libraries)
2. [Design System Fundamentals](#design-system-fundamentals)
3. [Basic Component Patterns](#basic-component-patterns)
4. [Advanced Component Patterns](#advanced-component-patterns)
5. [Variant Systems](#variant-systems)
6. [Composition Patterns](#composition-patterns)
7. [Theme Integration](#theme-integration)
8. [Best Practices](#best-practices)

## Introduction to Component Libraries

### What is a Component Library?

A component library is a collection of reusable, consistent UI components that follow your app's design system. With NativeWind, you can create components that are:

- **Consistent**: Same styling patterns across your app
- **Flexible**: Easy to customize and extend
- **Maintainable**: Centralized styling logic
- **Performant**: Optimized for React Native

### Benefits of Building Your Own Library

```javascript
// ✅ Instead of repeating styles everywhere
<View style={{ backgroundColor: '#3B82F6', padding: 16, borderRadius: 8 }}>
  <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
    Button Text
  </Text>
</View>

// ✅ Use consistent, reusable components
<Button variant="primary" size="medium" onPress={handlePress}>
  Button Text
</Button>
```

## Design System Fundamentals

### 1. Design Tokens

Design tokens are the foundation of your design system - colors, spacing, typography, etc.

```javascript
// design-tokens.js
export const tokens = {
  colors: {
    primary: {
      50: "#EFF6FF",
      100: "#DBEAFE",
      500: "#3B82F6",
      600: "#2563EB",
      700: "#1D4ED8",
      900: "#1E3A8A",
    },
    gray: {
      50: "#F9FAFB",
      100: "#F3F4F6",
      500: "#6B7280",
      600: "#4B5563",
      700: "#374151",
      900: "#111827",
    },
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    "2xl": 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  typography: {
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      "2xl": 24,
      "3xl": 30,
    },
    weights: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
  },
};
```

### 2. Tailwind Configuration Integration

```javascript
// tailwind.config.js
module.exports = {
  presets: [require("nativewind/preset")],
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          900: "#1E3A8A",
        },
        gray: {
          50: "#F9FAFB",
          100: "#F3F4F6",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          900: "#111827",
        },
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        "2xl": "48px",
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
      fontSize: {
        xs: "12px",
        sm: "14px",
        md: "16px",
        lg: "18px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "30px",
      },
    },
  },
};
```

## Basic Component Patterns

### 1. Button Component

```typescript
// components/ui/Button.tsx
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { cn } from '@/lib/utils'; // Utility for combining class names

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  children: React.ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onPress,
  children,
  className,
}) => {
  // Define variant styles using NativeWind classes
  const variantStyles = {
    primary: 'bg-primary-500 active:bg-primary-600 disabled:bg-gray-300',
    secondary: 'bg-gray-100 active:bg-gray-200 disabled:bg-gray-50',
    outline: 'border border-gray-300 bg-transparent active:bg-gray-50',
    ghost: 'bg-transparent active:bg-gray-100',
    danger: 'bg-error active:bg-red-600 disabled:bg-gray-300',
  };

  // Define size styles
  const sizeStyles = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4',
  };

  // Define text styles based on variant
  const textStyles = {
    primary: 'text-white font-semibold',
    secondary: 'text-gray-700 font-medium',
    outline: 'text-gray-700 font-medium',
    ghost: 'text-gray-600 font-medium',
    danger: 'text-white font-semibold',
  };

  // Define text sizes
  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={cn(
        'rounded-lg flex-row items-center justify-center',
        variantStyles[variant],
        sizeStyles[size],
        disabled && 'opacity-50',
        className
      )}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'danger' ? 'white' : '#6B7280'}
          className="mr-2"
        />
      )}
      <Text
        className={cn(
          textStyles[variant],
          textSizes[size],
          disabled && 'text-gray-400'
        )}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
};

export default Button;
```

### 2. Card Component

```typescript
// components/ui/Card.tsx
import React from 'react';
import { View, ViewProps } from 'react-native';
import { cn } from '@/lib/utils';

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  children,
  className,
  ...props
}) => {
  const variantStyles = {
    default: 'bg-white dark:bg-gray-800',
    elevated: 'bg-white dark:bg-gray-800 shadow-lg',
    outlined: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
  };

  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <View
      className={cn(
        'rounded-lg',
        variantStyles[variant],
        paddingStyles[padding],
        className
      )}
      {...props}
    >
      {children}
    </View>
  );
};

export default Card;
```

### 3. Input Component

```typescript
// components/ui/Input.tsx
import React, { forwardRef } from 'react';
import { TextInput, TextInputProps, View, Text } from 'react-native';
import { cn } from '@/lib/utils';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helper?: string;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
}

const Input = forwardRef<TextInput, InputProps>(({
  label,
  error,
  helper,
  variant = 'default',
  size = 'md',
  className,
  ...props
}, ref) => {
  const variantStyles = {
    default: 'border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600',
    filled: 'bg-gray-100 border-0 dark:bg-gray-700',
    outlined: 'border-2 border-gray-300 bg-transparent dark:border-gray-600',
  };

  const sizeStyles = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-4 py-4 text-lg',
  };

  const errorStyles = error ? 'border-error dark:border-red-400' : '';

  return (
    <View className="space-y-1">
      {label && (
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </Text>
      )}

      <TextInput
        ref={ref}
        className={cn(
          'rounded-lg',
          variantStyles[variant],
          sizeStyles[size],
          errorStyles,
          'text-gray-900 dark:text-white',
          'placeholder:text-gray-500 dark:placeholder:text-gray-400',
          className
        )}
        placeholderTextColor="#9CA3AF"
        {...props}
      />

      {(error || helper) && (
        <Text
          className={cn(
            'text-sm',
            error ? 'text-error dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
          )}
        >
          {error || helper}
        </Text>
      )}
    </View>
  );
});

Input.displayName = 'Input';

export default Input;
```

## Advanced Component Patterns

### 1. Compound Components

```typescript
// components/ui/Modal.tsx
import React, { createContext, useContext, useState } from 'react';
import { Modal as RNModal, View, Text, TouchableOpacity } from 'react-native';
import { cn } from '@/lib/utils';

interface ModalContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

interface ModalProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const Modal: React.FC<ModalProps> & {
  Trigger: typeof ModalTrigger;
  Content: typeof ModalContent;
  Header: typeof ModalHeader;
  Body: typeof ModalBody;
  Footer: typeof ModalFooter;
} = ({ children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return (
    <ModalContext.Provider value={{ isOpen, open, close }}>
      {children}
    </ModalContext.Provider>
  );
};

// Modal Trigger Component
const ModalTrigger: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { open } = useModal();

  return (
    <TouchableOpacity onPress={open}>
      {children}
    </TouchableOpacity>
  );
};

// Modal Content Component
const ModalContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => {
  const { isOpen, close } = useModal();

  return (
    <RNModal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={close}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <View className={cn(
          'bg-white dark:bg-gray-800 rounded-lg w-full max-w-sm',
          className
        )}>
          {children}
        </View>
      </View>
    </RNModal>
  );
};

// Modal Header Component
const ModalHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { close } = useModal();

  return (
    <View className="flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
      <Text className="text-lg font-semibold text-gray-900 dark:text-white">
        {children}
      </Text>
      <TouchableOpacity onPress={close}>
        <Text className="text-gray-400 text-xl">×</Text>
      </TouchableOpacity>
    </View>
  );
};

// Modal Body Component
const ModalBody: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <View className="p-4">
      {children}
    </View>
  );
};

// Modal Footer Component
const ModalFooter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <View className="flex-row justify-end space-x-2 p-4 border-t border-gray-200 dark:border-gray-700">
      {children}
    </View>
  );
};

// Assign components to Modal
Modal.Trigger = ModalTrigger;
Modal.Content = ModalContent;
Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

export default Modal;
```

### 2. Render Props Pattern

```typescript
// components/ui/DataList.tsx
import React from 'react';
import { FlatList, FlatListProps, View, Text } from 'react-native';
import { cn } from '@/lib/utils';

interface DataListProps<T> extends Omit<FlatListProps<T>, 'renderItem'> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  emptyMessage?: string;
  loading?: boolean;
  error?: string;
  className?: string;
}

const DataList = <T extends any>({
  data,
  renderItem,
  emptyMessage = 'No items found',
  loading = false,
  error,
  className,
  ...props
}: DataListProps<T>) => {
  if (loading) {
    return (
      <View className={cn('flex-1 justify-center items-center', className)}>
        <Text className="text-gray-500 dark:text-gray-400">Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className={cn('flex-1 justify-center items-center', className)}>
        <Text className="text-error dark:text-red-400">{error}</Text>
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View className={cn('flex-1 justify-center items-center', className)}>
        <Text className="text-gray-500 dark:text-gray-400">{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      renderItem={({ item, index }) => renderItem(item, index)}
      keyExtractor={(item, index) => index.toString()}
      className={className}
      {...props}
    />
  );
};

export default DataList;
```

## Variant Systems

### 1. Advanced Button Variants

```typescript
// components/ui/ButtonV2.tsx
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { cn } from '@/lib/utils';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'success'
  | 'warning';

type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  onPress?: () => void;
  children: React.ReactNode;
  className?: string;
}

const ButtonV2: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  onPress,
  children,
  className,
}) => {
  // Comprehensive variant system
  const variants = {
    primary: {
      container: 'bg-primary-500 active:bg-primary-600 disabled:bg-gray-300',
      text: 'text-white font-semibold',
      loading: 'white',
    },
    secondary: {
      container: 'bg-gray-100 active:bg-gray-200 disabled:bg-gray-50',
      text: 'text-gray-700 font-medium',
      loading: '#374151',
    },
    outline: {
      container: 'border border-gray-300 bg-transparent active:bg-gray-50',
      text: 'text-gray-700 font-medium',
      loading: '#374151',
    },
    ghost: {
      container: 'bg-transparent active:bg-gray-100',
      text: 'text-gray-600 font-medium',
      loading: '#6B7280',
    },
    danger: {
      container: 'bg-error active:bg-red-600 disabled:bg-gray-300',
      text: 'text-white font-semibold',
      loading: 'white',
    },
    success: {
      container: 'bg-success active:bg-green-600 disabled:bg-gray-300',
      text: 'text-white font-semibold',
      loading: 'white',
    },
    warning: {
      container: 'bg-warning active:bg-yellow-600 disabled:bg-gray-300',
      text: 'text-white font-semibold',
      loading: 'white',
    },
  };

  // Size system
  const sizes = {
    xs: {
      container: 'px-2 py-1',
      text: 'text-xs',
    },
    sm: {
      container: 'px-3 py-2',
      text: 'text-sm',
    },
    md: {
      container: 'px-4 py-3',
      text: 'text-base',
    },
    lg: {
      container: 'px-6 py-4',
      text: 'text-lg',
    },
    xl: {
      container: 'px-8 py-5',
      text: 'text-xl',
    },
  };

  const selectedVariant = variants[variant];
  const selectedSize = sizes[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={cn(
        'rounded-lg flex-row items-center justify-center',
        selectedVariant.container,
        selectedSize.container,
        fullWidth && 'w-full',
        disabled && 'opacity-50',
        className
      )}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={selectedVariant.loading}
          className="mr-2"
        />
      )}
      <Text
        className={cn(
          selectedVariant.text,
          selectedSize.text,
          disabled && 'text-gray-400'
        )}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
};

export default ButtonV2;
```

### 2. Polymorphic Components

```typescript
// components/ui/Box.tsx
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { cn } from '@/lib/utils';

type BoxElement = 'view' | 'text' | 'touchable' | 'scroll';

interface BoxProps {
  as?: BoxElement;
  children: React.ReactNode;
  className?: string;
  [key: string]: any; // Allow any other props
}

const Box: React.FC<BoxProps> = ({ as = 'view', children, className, ...props }) => {
  const components = {
    view: View,
    text: Text,
    touchable: TouchableOpacity,
    scroll: ScrollView,
  };

  const Component = components[as];

  return (
    <Component className={className} {...props}>
      {children}
    </Component>
  );
};

export default Box;
```

## Composition Patterns

### 1. Slot Pattern

```typescript
// components/ui/CardV2.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

interface CardSlotProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> & {
  Header: React.FC<CardSlotProps>;
  Body: React.FC<CardSlotProps>;
  Footer: React.FC<CardSlotProps>;
} = ({ children, className }) => {
  return (
    <View className={cn('bg-white dark:bg-gray-800 rounded-lg shadow-sm', className)}>
      {children}
    </View>
  );
};

Card.Header = ({ children, className }) => (
  <View className={cn('p-4 border-b border-gray-200 dark:border-gray-700', className)}>
    {children}
  </View>
);

Card.Body = ({ children, className }) => (
  <View className={cn('p-4', className)}>
    {children}
  </View>
);

Card.Footer = ({ children, className }) => (
  <View className={cn('p-4 border-t border-gray-200 dark:border-gray-700', className)}>
    {children}
  </View>
);

export default Card;
```

### 2. Higher-Order Components

```typescript
// components/ui/withAnimation.tsx
import React from 'react';
import { Animated } from 'react-native';

interface WithAnimationProps {
  animationType?: 'fade' | 'scale' | 'slide';
  duration?: number;
  delay?: number;
}

const withAnimation = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  { animationType = 'fade', duration = 300, delay = 0 }: WithAnimationProps = {}
) => {
  return React.forwardRef<any, P>((props, ref) => {
    const animatedValue = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
      const animation = Animated.timing(animatedValue, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      });

      animation.start();
    }, [animatedValue, duration, delay]);

    const getAnimatedStyle = () => {
      switch (animationType) {
        case 'fade':
          return { opacity: animatedValue };
        case 'scale':
          return {
            opacity: animatedValue,
            transform: [
              {
                scale: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
            ],
          };
        case 'slide':
          return {
            opacity: animatedValue,
            transform: [
              {
                translateY: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          };
        default:
          return { opacity: animatedValue };
      }
    };

    return (
      <Animated.View style={getAnimatedStyle()}>
        <WrappedComponent ref={ref} {...props} />
      </Animated.View>
    );
  });
};

export default withAnimation;
```

## Theme Integration

### 1. Theme-Aware Components

```typescript
// components/ui/ThemeProvider.tsx
import React, { createContext, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'system',
}) => {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  const isDark = theme === 'system'
    ? systemColorScheme === 'dark'
    : theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

### 2. Theme-Aware Component Example

```typescript
// components/ui/ThemedCard.tsx
import React from 'react';
import { View, ViewProps } from 'react-native';
import { useTheme } from './ThemeProvider';
import { cn } from '@/lib/utils';

interface ThemedCardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'outlined';
  children: React.ReactNode;
}

const ThemedCard: React.FC<ThemedCardProps> = ({
  variant = 'default',
  children,
  className,
  ...props
}) => {
  const { isDark } = useTheme();

  const variantStyles = {
    default: isDark
      ? 'bg-gray-800 border-gray-700'
      : 'bg-white border-gray-200',
    elevated: isDark
      ? 'bg-gray-800 border-gray-700 shadow-lg'
      : 'bg-white border-gray-200 shadow-lg',
    outlined: isDark
      ? 'bg-transparent border-2 border-gray-600'
      : 'bg-transparent border-2 border-gray-300',
  };

  return (
    <View
      className={cn(
        'rounded-lg border',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </View>
  );
};

export default ThemedCard;
```

## Best Practices

### 1. Component Organization

```
components/
├── ui/                    # Base UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   └── index.ts          # Export all UI components
├── layout/               # Layout components
│   ├── Container.tsx
│   ├── Grid.tsx
│   └── Stack.tsx
├── feedback/             # Feedback components
│   ├── Toast.tsx
│   ├── Alert.tsx
│   └── Loading.tsx
└── index.ts              # Main export file
```

### 2. TypeScript Best Practices

```typescript
// types/components.ts
export interface BaseComponentProps {
  className?: string;
  testID?: string;
}

export interface VariantProps<T> {
  variant?: T;
}

export interface SizeProps<T> {
  size?: T;
}

// Usage in components
interface ButtonProps
  extends BaseComponentProps,
    VariantProps<ButtonVariant>,
    SizeProps<ButtonSize> {
  // ... other props
}
```

### 3. Performance Optimization

```typescript
// components/ui/OptimizedButton.tsx
import React, { memo, useCallback } from 'react';
import { TouchableOpacity, Text } from 'react-native';

interface OptimizedButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  className?: string;
}

const OptimizedButton = memo<OptimizedButtonProps>(({
  onPress,
  children,
  className,
}) => {
  const handlePress = useCallback(() => {
    onPress();
  }, [onPress]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      className={className}
    >
      <Text>{children}</Text>
    </TouchableOpacity>
  );
});

OptimizedButton.displayName = 'OptimizedButton';

export default OptimizedButton;
```

### 4. Testing Components

```typescript
// __tests__/Button.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../components/ui/Button';

describe('Button', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <Button onPress={() => {}}>Test Button</Button>
    );

    expect(getByText('Test Button')).toBeTruthy();
  });

  it('handles press events', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button onPress={onPress}>Test Button</Button>
    );

    fireEvent.press(getByText('Test Button'));
    expect(onPress).toHaveBeenCalled();
  });

  it('applies variant styles', () => {
    const { getByText } = render(
      <Button variant="danger" onPress={() => {}}>Danger Button</Button>
    );

    const button = getByText('Danger Button').parent;
    expect(button).toHaveStyle({ backgroundColor: '#EF4444' });
  });
});
```

## Usage Examples

### 1. Building a Form

```typescript
// Example: Contact Form
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Button, Input, Card } from '@/components/ui';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleSubmit = () => {
    // Handle form submission
  };

  return (
    <Card className="p-6">
      <Text className="text-2xl font-bold mb-6">Contact Us</Text>

      <View className="space-y-4">
        <Input
          label="Name"
          value={formData.name}
          onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
          placeholder="Enter your name"
        />

        <Input
          label="Email"
          value={formData.email}
          onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
          placeholder="Enter your email"
          keyboardType="email-address"
        />

        <Input
          label="Message"
          value={formData.message}
          onChangeText={(text) => setFormData(prev => ({ ...prev, message: text }))}
          placeholder="Enter your message"
          multiline
          numberOfLines={4}
        />

        <Button onPress={handleSubmit} fullWidth>
          Send Message
        </Button>
      </View>
    </Card>
  );
};
```

### 2. Building a Modal

```typescript
// Example: Confirmation Modal
import React from 'react';
import { Text } from 'react-native';
import { Modal, Button } from '@/components/ui';

const ConfirmationModal = ({ isVisible, onConfirm, onCancel }) => {
  return (
    <Modal defaultOpen={isVisible}>
      <Modal.Trigger>
        <Button variant="danger">Delete Item</Button>
      </Modal.Trigger>

      <Modal.Content>
        <Modal.Header>Confirm Delete</Modal.Header>
        <Modal.Body>
          <Text className="text-gray-600 dark:text-gray-300">
            Are you sure you want to delete this item? This action cannot be undone.
          </Text>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="ghost" onPress={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" onPress={onConfirm}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
};
```

This comprehensive guide covers the essential patterns for building a robust component library with NativeWind. The key is to start simple and gradually add complexity as your needs grow. Focus on consistency, reusability, and maintainability throughout your component design process.
