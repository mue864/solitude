# React Native Animations: Real-World Patterns with NativeWind - Comprehensive Guide

## Table of Contents

1. [Animation Fundamentals](#animation-fundamentals)
2. [Common UI Animation Patterns](#common-ui-animation-patterns)
3. [Gesture-Based Animations](#gesture-based-animations)
4. [List and Scroll Animations](#list-and-scroll-animations)
5. [Modal and Navigation Animations](#modal-and-navigation-animations)
6. [Loading and Feedback Animations](#loading-and-feedback-animations)
7. [Advanced Animation Patterns](#advanced-animation-patterns)
8. [Performance Optimization](#performance-optimization)
9. [Best Practices](#best-practices)

## Animation Fundamentals

### Why Animations Matter

Animations in React Native apps provide:

- **Visual feedback** for user interactions
- **Smooth transitions** between states
- **Enhanced user experience** and engagement
- **Clear visual hierarchy** and flow
- **Professional polish** and attention to detail

### Animation Libraries Comparison

```javascript
// React Native Animated API (Built-in)
import { Animated } from "react-native";

const BasicAnimated = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true, // ✅ Runs on native thread
    }).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <Text>Fade In Animation</Text>
    </Animated.View>
  );
};

// React Native Reanimated (Recommended for complex animations)
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

const ReanimatedComponent = () => {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 1000 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Text>Reanimated Fade In</Text>
    </Animated.View>
  );
};
```

## Common UI Animation Patterns

### 1. Button Press Animations

```javascript
// components/AnimatedButton.tsx
import React, { useRef } from 'react';
import { TouchableOpacity, Text, Animated } from 'react-native';

interface AnimatedButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  onPress,
  children,
  variant = 'primary',
  className,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getVariantClasses = () => {
    const baseClasses = 'rounded-lg px-4 py-3 flex-row items-center justify-center';
    const variantClasses = {
      primary: 'bg-primary-500 active:bg-primary-600',
      secondary: 'bg-gray-200 active:bg-gray-300',
      danger: 'bg-red-500 active:bg-red-600',
    };
    return `${baseClasses} ${variantClasses[variant]}`;
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        opacity: opacityAnim,
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        className={`${getVariantClasses()} ${className}`}
      >
        <Text className="text-white font-semibold">{children}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default AnimatedButton;
```

### 2. Card Hover and Selection Animations

```javascript
// components/AnimatedCard.tsx
import React, { useRef, useState } from 'react';
import { Animated, TouchableOpacity, View } from 'react-native';

interface AnimatedCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  selected?: boolean;
  className?: string;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  onPress,
  selected = false,
  className,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shadowAnim = useRef(new Animated.Value(0)).current;
  const borderAnim = useRef(new Animated.Value(0)).current;
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
      }),
      Animated.timing(shadowAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(shadowAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Animate selection state
  React.useEffect(() => {
    Animated.timing(borderAnim, {
      toValue: selected ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [selected]);

  const getCardClasses = () => {
    const baseClasses = 'bg-white rounded-lg p-4';
    const stateClasses = isPressed ? 'shadow-lg' : 'shadow-sm';
    const selectionClasses = selected ? 'border-2 border-primary-500' : 'border border-gray-200';
    return `${baseClasses} ${stateClasses} ${selectionClasses} ${className}`;
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        shadowOpacity: shadowAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.1, 0.3],
        }),
        shadowRadius: shadowAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [2, 8],
        }),
        borderWidth: borderAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 2],
        }),
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        className={getCardClasses()}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default AnimatedCard;
```

### 3. Loading and Progress Animations

```javascript
// components/AnimatedLoader.tsx
import React, { useRef, useEffect } from 'react';
import { View, Animated, Easing } from 'react-native';

interface AnimatedLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

const AnimatedLoader: React.FC<AnimatedLoaderProps> = ({
  size = 'md',
  color = '#3B82F6',
  className,
}) => {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Continuous spinning animation
    const spinAnimation = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // Pulsing scale animation
    const scaleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );

    spinAnimation.start();
    scaleAnimation.start();

    return () => {
      spinAnimation.stop();
      scaleAnimation.stop();
    };
  }, []);

  const getSizeClasses = () => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-8 h-8',
      lg: 'w-12 h-12',
    };
    return sizeClasses[size];
  };

  return (
    <View className={`justify-center items-center ${className}`}>
      <Animated.View
        style={{
          transform: [
            {
              rotate: spinAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              }),
            },
            { scale: scaleAnim },
          ],
        }}
        className={`${getSizeClasses()} border-2 border-gray-300 border-t-blue-500 rounded-full`}
      />
    </View>
  );
};

export default AnimatedLoader;
```

## Gesture-Based Animations

### 1. Swipe to Delete Animation

```javascript
// components/SwipeableItem.tsx
import React, { useRef } from 'react';
import { Animated, PanGestureHandler, State } from 'react-native-gesture-handler';
import { View, Text, TouchableOpacity } from 'react-native';

interface SwipeableItemProps {
  children: React.ReactNode;
  onDelete: () => void;
  className?: string;
}

const SwipeableItem: React.FC<SwipeableItemProps> = ({
  children,
  onDelete,
  className,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const deleteOpacity = useRef(new Animated.Value(0)).current;

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX } = event.nativeEvent;

      if (translationX < -100) {
        // Swipe left - show delete
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: -80,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(deleteOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        // Reset position
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(deleteOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  };

  const handleDelete = () => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: -300,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(deleteOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDelete();
    });
  };

  return (
    <View className="relative">
      {/* Delete Button Background */}
      <Animated.View
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          backgroundColor: '#EF4444',
          justifyContent: 'center',
          alignItems: 'center',
          width: 80,
          opacity: deleteOpacity,
        }}
      >
        <TouchableOpacity onPress={handleDelete} className="flex-1 justify-center items-center">
          <Text className="text-white font-bold">Delete</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Main Content */}
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
      >
        <Animated.View
          style={{
            transform: [{ translateX }],
          }}
          className={`bg-white ${className}`}
        >
          {children}
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

export default SwipeableItem;
```

### 2. Drag and Drop Animation

```javascript
// components/DraggableItem.tsx
import React, { useRef, useState } from 'react';
import { Animated, PanGestureHandler, State } from 'react-native-gesture-handler';
import { View, Text } from 'react-native';

interface DraggableItemProps {
  children: React.ReactNode;
  onDragEnd?: (position: { x: number; y: number }) => void;
  className?: string;
}

const DraggableItem: React.FC<DraggableItemProps> = ({
  children,
  onDragEnd,
  className,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shadowAnim = useRef(new Animated.Value(0)).current;
  const [isDragging, setIsDragging] = useState(false);

  const onGestureEvent = Animated.event(
    [
      {
        nativeEvent: {
          translationX: translateX,
          translationY: translateY,
        },
      },
    ],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.state === State.BEGAN) {
      setIsDragging(true);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.1,
          useNativeDriver: true,
        }),
        Animated.timing(shadowAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (event.nativeEvent.state === State.END) {
      setIsDragging(false);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(shadowAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      if (onDragEnd) {
        onDragEnd({
          x: event.nativeEvent.translationX,
          y: event.nativeEvent.translationY,
        });
      }
    }
  };

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View
        style={{
          transform: [
            { translateX },
            { translateY },
            { scale: scaleAnim },
          ],
          shadowOpacity: shadowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.3],
          }),
          shadowRadius: shadowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 10],
          }),
          elevation: shadowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 10],
          }),
        }}
        className={`bg-white rounded-lg ${className}`}
      >
        {children}
      </Animated.View>
    </PanGestureHandler>
  );
};

export default DraggableItem;
```

## List and Scroll Animations

### 1. Staggered List Animations

```javascript
// components/AnimatedList.tsx
import React, { useRef, useEffect } from 'react';
import { FlatList, Animated } from 'react-native';

interface AnimatedListProps {
  data: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  className?: string;
}

const AnimatedList: React.FC<AnimatedListProps> = ({
  data,
  renderItem,
  className,
}) => {
  const animatedValues = useRef<Animated.Value[]>([]).current;

  useEffect(() => {
    // Initialize animated values for each item
    data.forEach((_, index) => {
      animatedValues[index] = new Animated.Value(0);
    });

    // Staggered animation
    const animations = data.map((_, index) =>
      Animated.timing(animatedValues[index], {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      })
    );

    Animated.stagger(100, animations).start();
  }, [data]);

  const renderAnimatedItem = ({ item, index }) => {
    const animatedValue = animatedValues[index] || new Animated.Value(0);

    return (
      <Animated.View
        style={{
          opacity: animatedValue,
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
            {
              scale: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
        }}
      >
        {renderItem(item, index)}
      </Animated.View>
    );
  };

  return (
    <FlatList
      data={data}
      renderItem={renderAnimatedItem}
      keyExtractor={(item, index) => index.toString()}
      className={className}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
    />
  );
};

export default AnimatedList;
```

### 2. Parallax Scroll Animation

```javascript
// components/ParallaxScroll.tsx
import React, { useRef } from 'react';
import { Animated, ScrollView, View, Text, Image } from 'react-native';

interface ParallaxScrollProps {
  headerImage: string;
  headerTitle: string;
  children: React.ReactNode;
  className?: string;
}

const ParallaxScroll: React.FC<ParallaxScrollProps> = ({
  headerImage,
  headerTitle,
  children,
  className,
}) => {
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerHeight = 200;
  const imageHeight = 250;

  const imageTranslateY = scrollY.interpolate({
    inputRange: [0, headerHeight],
    outputRange: [0, -headerHeight / 2],
    extrapolate: 'clamp',
  });

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, headerHeight / 2, headerHeight],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  const titleTranslateY = scrollY.interpolate({
    inputRange: [0, headerHeight],
    outputRange: [0, -50],
    extrapolate: 'clamp',
  });

  const titleOpacity = scrollY.interpolate({
    inputRange: [0, headerHeight / 2],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View className={`flex-1 ${className}`}>
      {/* Parallax Header */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: imageHeight,
          zIndex: 1,
          transform: [{ translateY: imageTranslateY }],
          opacity: imageOpacity,
        }}
      >
        <Image
          source={{ uri: headerImage }}
          className="w-full h-full"
          resizeMode="cover"
        />
        <View className="absolute inset-0 bg-black/30" />

        <Animated.View
          style={{
            position: 'absolute',
            bottom: 20,
            left: 20,
            transform: [{ translateY: titleTranslateY }],
            opacity: titleOpacity,
          }}
        >
          <Text className="text-white text-2xl font-bold">{headerTitle}</Text>
        </Animated.View>
      </Animated.View>

      {/* Scrollable Content */}
      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        className="flex-1"
        contentContainerStyle={{ paddingTop: imageHeight }}
      >
        <View className="bg-white rounded-t-3xl flex-1 p-6">
          {children}
        </View>
      </Animated.ScrollView>
    </View>
  );
};

export default ParallaxScroll;
```

## Modal and Navigation Animations

### 1. Animated Modal

```javascript
// components/AnimatedModal.tsx
import React, { useRef, useEffect } from 'react';
import { Modal, Animated, View, TouchableOpacity, Text } from 'react-native';

interface AnimatedModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

const AnimatedModal: React.FC<AnimatedModalProps> = ({
  visible,
  onClose,
  children,
  className,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: fadeAnim,
        }}
      >
        <TouchableOpacity
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          onPress={onClose}
        />

        <Animated.View
          style={{
            transform: [
              { scale: scaleAnim },
              { translateY: slideAnim },
            ],
          }}
          className={`bg-white rounded-lg w-11/12 max-w-sm ${className}`}
        >
          <View className="p-6">
            {children}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default AnimatedModal;
```

### 2. Screen Transition Animations

```javascript
// components/ScreenTransition.tsx
import React, { useRef, useEffect } from 'react';
import { Animated, View } from 'react-native';

interface ScreenTransitionProps {
  children: React.ReactNode;
  isVisible: boolean;
  direction?: 'left' | 'right' | 'up' | 'down';
  className?: string;
}

const ScreenTransition: React.FC<ScreenTransitionProps> = ({
  children,
  isVisible,
  direction = 'right',
  className,
}) => {
  const translateAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const getTransformValue = () => {
    const screenWidth = 400; // Approximate screen width
    const screenHeight = 800; // Approximate screen height

    switch (direction) {
      case 'left':
        return { translateX: screenWidth };
      case 'right':
        return { translateX: -screenWidth };
      case 'up':
        return { translateY: screenHeight };
      case 'down':
        return { translateY: -screenHeight };
      default:
        return { translateX: screenWidth };
    }
  };

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(translateAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  const transformValue = getTransformValue();
  const transformKey = Object.keys(transformValue)[0];

  return (
    <Animated.View
      style={{
        flex: 1,
        opacity: opacityAnim,
        transform: [
          {
            [transformKey]: translateAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, transformValue[transformKey]],
            }),
          },
        ],
      }}
      className={className}
    >
      {children}
    </Animated.View>
  );
};

export default ScreenTransition;
```

## Loading and Feedback Animations

### 1. Skeleton Loading Animation

```javascript
// components/SkeletonLoader.tsx
import React, { useRef, useEffect } from 'react';
import { View, Animated } from 'react-native';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  className?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  className,
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    );

    shimmerAnimation.start();

    return () => {
      shimmerAnimation.stop();
    };
  }, []);

  const shimmerTranslateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View
      style={{ width, height }}
      className={`bg-gray-200 rounded overflow-hidden ${className}`}
    >
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.6)',
          transform: [{ translateX: shimmerTranslateX }],
        }}
      />
    </View>
  );
};

export default SkeletonLoader;
```

### 2. Success/Error Feedback Animation

```javascript
// components/FeedbackAnimation.tsx
import React, { useRef, useEffect } from 'react';
import { View, Text, Animated } from 'react-native';

interface FeedbackAnimationProps {
  type: 'success' | 'error' | 'warning';
  message: string;
  onComplete?: () => void;
  className?: string;
}

const FeedbackAnimation: React.FC<FeedbackAnimationProps> = ({
  type,
  message,
  onComplete,
  className,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const checkmarkAnim = useRef(new Animated.Value(0)).current;

  const getTypeStyles = () => {
    const styles = {
      success: {
        container: 'bg-green-500',
        icon: '✓',
        text: 'text-white',
      },
      error: {
        container: 'bg-red-500',
        icon: '✕',
        text: 'text-white',
      },
      warning: {
        container: 'bg-yellow-500',
        icon: '⚠',
        text: 'text-white',
      },
    };
    return styles[type];
  };

  useEffect(() => {
    const typeStyles = getTypeStyles();

    // Entrance animation
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(checkmarkAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Exit animation after delay
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onComplete?.();
        });
      }, 2000);
    });
  }, []);

  const typeStyles = getTypeStyles();

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        opacity: opacityAnim,
      }}
      className={`rounded-lg p-4 flex-row items-center ${typeStyles.container} ${className}`}
    >
      <Animated.View
        style={{
          transform: [
            {
              scale: checkmarkAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              }),
            },
          ],
        }}
        className="mr-3"
      >
        <Text className="text-white text-xl font-bold">{typeStyles.icon}</Text>
      </Animated.View>

      <Text className={`flex-1 ${typeStyles.text}`}>{message}</Text>
    </Animated.View>
  );
};

export default FeedbackAnimation;
```

## Advanced Animation Patterns

### 1. Morphing Animation

```javascript
// components/MorphingAnimation.tsx
import React, { useRef, useState } from 'react';
import { Animated, TouchableOpacity, View } from 'react-native';

interface MorphingAnimationProps {
  children: React.ReactNode;
  className?: string;
}

const MorphingAnimation: React.FC<MorphingAnimationProps> = ({
  children,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const borderRadiusAnim = useRef(new Animated.Value(8)).current;
  const backgroundColorAnim = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    setIsExpanded(!isExpanded);

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isExpanded ? 1 : 1.2,
        useNativeDriver: true,
      }),
      Animated.timing(borderRadiusAnim, {
        toValue: isExpanded ? 8 : 20,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(backgroundColorAnim, {
        toValue: isExpanded ? 0 : 1,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const backgroundColor = backgroundColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(59, 130, 246, 0.1)', 'rgba(59, 130, 246, 0.3)'],
  });

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          borderRadius: borderRadiusAnim,
          backgroundColor,
        }}
        className={`p-4 ${className}`}
      >
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

export default MorphingAnimation;
```

### 2. Particle Animation

```javascript
// components/ParticleAnimation.tsx
import React, { useRef, useEffect } from 'react';
import { View, Animated } from 'react-native';

interface ParticleAnimationProps {
  particleCount?: number;
  className?: string;
}

const ParticleAnimation: React.FC<ParticleAnimationProps> = ({
  particleCount = 20,
  className,
}) => {
  const particles = useRef<Animated.Value[]>([]).current;

  useEffect(() => {
    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles[i] = new Animated.Value(0);
    }

    // Animate particles with different delays
    const animations = particles.map((particle, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(particle, {
            toValue: 1,
            duration: 2000 + Math.random() * 1000,
            delay: index * 100,
            useNativeDriver: true,
          }),
          Animated.timing(particle, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      )
    );

    animations.forEach(animation => animation.start());

    return () => {
      animations.forEach(animation => animation.stop());
    };
  }, [particleCount]);

  return (
    <View className={`absolute inset-0 ${className}`}>
      {particles.map((particle, index) => (
        <Animated.View
          key={index}
          style={{
            position: 'absolute',
            width: 4,
            height: 4,
            backgroundColor: '#3B82F6',
            borderRadius: 2,
            opacity: particle,
            transform: [
              {
                translateX: particle.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, Math.random() * 200 - 100],
                }),
              },
              {
                translateY: particle.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, Math.random() * 200 - 100],
                }),
              },
              {
                scale: particle.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
              },
            ],
          }}
        />
      ))}
    </View>
  );
};

export default ParticleAnimation;
```

## Performance Optimization

### 1. Animation Performance Monitoring

```javascript
// utils/animationPerformance.ts
class AnimationPerformanceMonitor {
  private metrics: Map<string, number> = new Map();
  private frameCount = 0;
  private lastFrameTime = Date.now();

  startMonitoring() {
    this.monitorFrameRate();
  }

  private monitorFrameRate() {
    this.frameCount++;
    const currentTime = Date.now();

    if (currentTime - this.lastFrameTime >= 1000) {
      const fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastFrameTime));
      this.metrics.set('fps', fps);

      if (fps < 50) {
        console.warn(`Low frame rate detected: ${fps} FPS`);
      }

      this.frameCount = 0;
      this.lastFrameTime = currentTime;
    }

    requestAnimationFrame(() => this.monitorFrameRate());
  }

  measureAnimation(name: string, animation: Animated.CompositeAnimation) {
    const startTime = performance.now();

    animation.start(() => {
      const duration = performance.now() - startTime;
      this.metrics.set(name, duration);

      if (duration > 16) {
        console.warn(`Slow animation detected: ${name} took ${duration.toFixed(2)}ms`);
      }
    });
  }

  getMetrics() {
    return Object.fromEntries(this.metrics);
  }
}

export const animationPerformanceMonitor = new AnimationPerformanceMonitor();
```

### 2. Optimized Animation Components

```javascript
// components/OptimizedAnimatedView.tsx
import React, { memo, useCallback } from 'react';
import { Animated, View } from 'react-native';

interface OptimizedAnimatedViewProps {
  children: React.ReactNode;
  className?: string;
  onAnimationStart?: () => void;
  onAnimationEnd?: () => void;
}

const OptimizedAnimatedView = memo<OptimizedAnimatedViewProps>(({
  children,
  className,
  onAnimationStart,
  onAnimationEnd,
}) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  const startAnimation = useCallback(() => {
    onAnimationStart?.();

    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onAnimationEnd?.();
    });
  }, [animatedValue, onAnimationStart, onAnimationEnd]);

  React.useEffect(() => {
    startAnimation();
  }, [startAnimation]);

  return (
    <Animated.View
      style={{
        opacity: animatedValue,
        transform: [
          {
            scale: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0.8, 1],
            }),
          },
        ],
      }}
      className={className}
    >
      {children}
    </Animated.View>
  );
});

OptimizedAnimatedView.displayName = 'OptimizedAnimatedView';

export default OptimizedAnimatedView;
```

## Best Practices

### 1. Animation Guidelines

```javascript
// Animation best practices checklist
const animationBestPractices = {
  // Performance
  useNativeDriver: true, // ✅ Always use native driver when possible
  avoidLayoutAnimations: true, // ✅ Avoid layout animations for performance
  limitConcurrentAnimations: true, // ✅ Limit concurrent animations

  // User Experience
  respectUserPreferences: true, // ✅ Respect reduced motion preferences
  provideAlternatives: true, // ✅ Provide alternatives for accessibility
  maintainConsistency: true, // ✅ Keep animation styles consistent

  // Code Organization
  separateAnimationLogic: true, // ✅ Separate animation logic from components
  useCustomHooks: true, // ✅ Use custom hooks for reusable animations
  documentComplexAnimations: true, // ✅ Document complex animation logic
};
```

### 2. Animation Configuration

```javascript
// config/animations.ts
export const animationConfig = {
  // Standard durations
  durations: {
    fast: 150,
    normal: 300,
    slow: 500,
    verySlow: 1000,
  },

  // Easing functions
  easing: {
    ease: "ease",
    easeIn: "ease-in",
    easeOut: "ease-out",
    easeInOut: "ease-in-out",
  },

  // Spring configurations
  spring: {
    light: {
      damping: 15,
      stiffness: 150,
    },
    medium: {
      damping: 20,
      stiffness: 100,
    },
    heavy: {
      damping: 25,
      stiffness: 50,
    },
  },

  // Common animation values
  values: {
    scale: {
      pressed: 0.95,
      hover: 1.05,
      normal: 1,
    },
    opacity: {
      disabled: 0.5,
      normal: 1,
    },
  },
};
```

### 3. Animation Testing

```javascript
// __tests__/animations.test.tsx
import React from "react";
import { render, act } from "@testing-library/react-native";
import { Animated } from "react-native";
import AnimatedButton from "../components/AnimatedButton";

describe("Animation Components", () => {
  it("animates button press correctly", () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <AnimatedButton onPress={onPress}>Test Button</AnimatedButton>
    );

    const button = getByText("Test Button");

    // Test press in animation
    act(() => {
      button.props.onPressIn();
    });

    // Test press out animation
    act(() => {
      button.props.onPressOut();
    });

    expect(onPress).not.toHaveBeenCalled(); // Should not call onPress during animation
  });

  it("completes animation within reasonable time", () => {
    const startTime = Date.now();

    render(<AnimatedButton onPress={() => {}}>Test</AnimatedButton>);

    const renderTime = Date.now() - startTime;
    expect(renderTime).toBeLessThan(100); // Should render quickly
  });
});
```

This comprehensive guide covers real-world animation patterns that you'll encounter in React Native development. The key is to balance performance with user experience, using the right animation library for the job and following best practices for maintainable code.
