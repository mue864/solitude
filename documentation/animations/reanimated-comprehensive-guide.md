# React Native Reanimated Comprehensive Guide

## Table of Contents

1. [What is React Native Reanimated?](#what-is-react-native-reanimated)
2. [Why Reanimated Over Animated API?](#why-reanimated-over-animated-api)
3. [Core Concepts](#core-concepts)
4. [Setting Up Reanimated](#setting-up-reanimated)
5. [Basic Animations](#basic-animations)
6. [Advanced Animations](#advanced-animations)
7. [Gesture Handling](#gesture-handling)
8. [Performance Optimization](#performance-optimization)
9. [Real-World Examples](#real-world-examples)

## What is React Native Reanimated?

**React Native Reanimated** is a library that provides a more powerful and performant way to create animations in React Native. Unlike the standard Animated API, Reanimated runs animations on the native thread, resulting in smoother performance and more complex animation capabilities.

### Key Differences from Animated API:

1. **Native Thread Execution**: Animations run on the UI thread, not the JavaScript thread
2. **Shared Values**: More efficient than Animated.Value
3. **Worklets**: Functions that run on the UI thread
4. **Gesture Integration**: Better integration with react-native-gesture-handler
5. **Layout Animations**: Automatic animations for layout changes

## Why Reanimated Over Animated API?

### Performance Comparison

```javascript
// ❌ Animated API - Runs on JS thread (can cause jank)
import { Animated } from "react-native";

const AnimatedComponent = () => {
  // Create an animated value for opacity
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate opacity from 0 to 1 over 1 second
    Animated.timing(opacity, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true, // Still has limitations
    }).start();
  }, []);

  return (
    <Animated.View style={{ opacity }}>
      <Text>This might cause jank</Text>
    </Animated.View>
  );
};

// ✅ Reanimated - Runs on native thread (smooth)
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

const ReanimatedComponent = () => {
  // Create a shared value for opacity (runs on UI thread)
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Animate opacity from 0 to 1 over 1 second using withTiming
    opacity.value = withTiming(1, { duration: 1000 });
  }, []);

  // Create an animated style that binds opacity to the shared value
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Text>This runs smoothly on native thread</Text>
    </Animated.View>
  );
};
```

### Memory Efficiency

```javascript
// ❌ Animated API - Creates new instances for each item
const AnimatedList = () => {
  const renderItem = ({ item, index }) => {
    // Each item gets its own Animated.Value
    const itemAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      // Animate opacity in with a staggered delay
      Animated.timing(itemAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    }, []);

    return (
      <Animated.View style={{ opacity: itemAnim }}>
        <Text>{item.title}</Text>
      </Animated.View>
    );
  };

  return <FlatList data={data} renderItem={renderItem} />;
};

// ✅ Reanimated - Shared values are more efficient
const ReanimatedList = () => {
  // Use a Map to store shared values for each item
  const animatedValues = useRef(new Map()).current;

  // Helper to get or create a shared value for an item
  const getAnimatedValue = useCallback((itemId) => {
    if (!animatedValues.has(itemId)) {
      animatedValues.set(itemId, useSharedValue(0));
    }
    return animatedValues.get(itemId);
  }, []);

  const renderItem = ({ item, index }) => {
    const anim = getAnimatedValue(item.id);

    useEffect(() => {
      // Animate opacity in with a staggered delay
      anim.value = withTiming(1, {
        duration: 500,
        delay: index * 100,
      });
    }, []);

    // Bind opacity to the shared value
    const animatedStyle = useAnimatedStyle(() => ({
      opacity: anim.value,
    }));

    return (
      <Animated.View style={animatedStyle}>
        <Text>{item.title}</Text>
      </Animated.View>
    );
  };

  return <FlatList data={data} renderItem={renderItem} />;
};
```

## Core Concepts

### 1. Shared Values

```javascript
import { useSharedValue } from "react-native-reanimated";

const BasicSharedValue = () => {
  // Shared values are like state, but run on the UI thread for performance
  const opacity = useSharedValue(0); // For fade
  const scale = useSharedValue(1); // For scaling
  const translateY = useSharedValue(0); // For vertical movement

  // Function to update shared values (e.g., on press)
  const handlePress = () => {
    opacity.value = 1; // Instantly set opacity to 1
    scale.value = withSpring(1.2); // Animate scale with a spring
    translateY.value = withTiming(-50, { duration: 300 }); // Animate Y position
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <Text>Press me</Text>
    </TouchableOpacity>
  );
};
```

### 2. Animated Styles

```javascript
import { useAnimatedStyle } from "react-native-reanimated";

const AnimatedStyleExample = () => {
  // Create shared values for different properties
  const opacity = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  // Animated style: binds view style to shared values
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
    };
  });

  // Trigger animation on press
  const handleAnimation = () => {
    opacity.value = withTiming(1, { duration: 500 }); // Fade in
    scale.value = withSpring(1.1); // Scale up
    rotation.value = withTiming(360, { duration: 1000 }); // Rotate
  };

  return (
    <Animated.View
      style={[styles.container, animatedStyle]}
      className="bg-blue-500 p-4 rounded-lg"
    >
      <TouchableOpacity onPress={handleAnimation}>
        <Text className="text-white font-bold">Animate Me</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};
```

### 3. Worklets

```javascript
import { runOnUI } from "react-native-reanimated";

const WorkletExample = () => {
  const progress = useSharedValue(0);

  // Worklet: a function that runs on the UI thread
  const updateProgress = (value) => {
    "worklet"; // Required for worklet
    progress.value = value;
  };

  // Run the worklet from JS
  const handlePress = () => {
    runOnUI(updateProgress)(0.5); // Set progress to 0.5 on UI thread
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + progress.value * 0.2 }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity onPress={handlePress}>
        <Text>Run Worklet</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};
```

## Setting Up Reanimated

### 1. Installation

```bash
# Install Reanimated
npm install react-native-reanimated

# For Expo projects
npx expo install react-native-reanimated
```

### 2. Babel Configuration

```javascript
// babel.config.js
module.exports = {
  presets: ["babel-preset-expo"],
  plugins: [
    "react-native-reanimated/plugin", // Must be last for Reanimated to work
  ],
};
```

### 3. Metro Configuration

```javascript
// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Add Reanimated to resolver (optional for most Expo projects)
config.resolver.platforms = ["native", "ios", "android"];

module.exports = config;
```

### 4. App Entry Point

```javascript
// App.js or index.js
import "react-native-reanimated/lib/reanimated2/js-reanimated"; // Import Reanimated at the top
import React from "react";
import { App } from "./App";

export default App;
```

## Basic Animations

### 1. Fade In Animation

```javascript
import React, { useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from "react-native-reanimated";

const FadeInAnimation = () => {
  // Shared values for opacity and vertical movement
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);

  useEffect(() => {
    // Animate opacity from 0 to 1 over 1 second
    opacity.value = withTiming(1, { duration: 1000 });
    // Animate translateY from 50 to 0 with a spring effect
    translateY.value = withSpring(0, {
      damping: 15,
      stiffness: 100,
    });
  }, []);

  // Animated style binds opacity and translateY to the view
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Animated.View
        style={animatedStyle}
        className="bg-blue-500 p-6 rounded-lg shadow-lg"
      >
        <Text className="text-white text-xl font-bold text-center">
          Welcome to Solitude
        </Text>
        <Text className="text-blue-100 text-center mt-2">
          Your mindfulness companion
        </Text>
      </Animated.View>
    </View>
  );
};

export default FadeInAnimation;
```

### 2. Scale Animation on Press

```javascript
const ScaleAnimation = () => {
  // Shared value for scale
  const scale = useSharedValue(1);

  // Animate scale down on press in
  const handlePressIn = () => {
    scale.value = withSpring(0.95, {
      damping: 15,
      stiffness: 300,
    });
  };

  // Animate scale back up on press out
  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 300,
    });
  };

  // Animated style for scaling
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View
        style={animatedStyle}
        className="bg-purple-500 p-6 rounded-lg shadow-lg"
      >
        <Text className="text-white text-lg font-semibold text-center">
          Press Me
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};
```

### 3. Rotation Animation

```javascript
const RotationAnimation = () => {
  // Shared value for rotation
  const rotation = useSharedValue(0);

  // Animate rotation by 360 degrees on press
  const handlePress = () => {
    rotation.value = withTiming(rotation.value + 360, {
      duration: 1000,
    });
  };

  // Animated style for rotation
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <TouchableOpacity onPress={handlePress}>
      <Animated.View
        style={animatedStyle}
        className="bg-green-500 p-6 rounded-full w-20 h-20 justify-center items-center"
      >
        <Text className="text-white font-bold">↻</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};
```

### 4. Staggered List Animation

```javascript
const StaggeredListAnimation = () => {
  // Example data for the list
  const data = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    title: `Item ${i + 1}`,
  }));

  // Render each item with its own animation
  const renderItem = ({ item, index }) => {
    // Shared values for opacity and vertical movement
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(50);

    useEffect(() => {
      // Animate opacity in with a staggered delay
      opacity.value = withTiming(1, {
        duration: 500,
        delay: index * 100, // Stagger by index
      });
      // Animate translateY to 0 with a spring and stagger
      translateY.value = withSpring(0, {
        damping: 15,
        stiffness: 100,
        delay: index * 100,
      });
    }, []);

    // Animated style for each item
    const animatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    }));

    return (
      <Animated.View
        style={animatedStyle}
        className="bg-white p-4 m-2 rounded-lg shadow-sm border border-gray-200"
      >
        <Text className="text-gray-800 font-medium">{item.title}</Text>
      </Animated.View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
};
```

## Advanced Animations

### 1. Parallax Scrolling

```javascript
import { useAnimatedScrollHandler } from "react-native-reanimated";

const ParallaxScrollView = () => {
  // Shared value for scroll position
  const scrollY = useSharedValue(0);

  // Animated scroll handler updates scrollY on scroll
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Render each item with parallax effect
  const renderItem = ({ item, index }) => {
    // Animated style for parallax
    const animatedStyle = useAnimatedStyle(() => {
      // Calculate input range for this item
      const inputRange = [(index - 1) * 200, index * 200, (index + 1) * 200];

      // Interpolate translateY for parallax
      const translateY = interpolate(
        scrollY.value,
        inputRange,
        [50, 0, -50],
        Extrapolate.CLAMP
      );

      // Interpolate opacity for fade effect
      const opacity = interpolate(
        scrollY.value,
        inputRange,
        [0.5, 1, 0.5],
        Extrapolate.CLAMP
      );

      return {
        transform: [{ translateY }],
        opacity,
      };
    });

    return (
      <Animated.View
        style={animatedStyle}
        className="h-48 m-2 rounded-lg overflow-hidden"
      >
        <View className="flex-1 bg-gradient-to-br from-blue-400 to-purple-500 justify-center items-center">
          <Text className="text-white text-xl font-bold">{item.title}</Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <Animated.ScrollView
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      className="flex-1 bg-gray-50"
    >
      {Array.from({ length: 10 }, (_, i) => ({
        id: i,
        title: `Card ${i + 1}`,
      })).map((item, index) => (
        <View key={item.id}>{renderItem({ item, index })}</View>
      ))}
    </Animated.ScrollView>
  );
};
```

### 2. Complex Transform Animations

```javascript
const ComplexTransformAnimation = () => {
  // Shared values for multiple transforms
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // Animate all transforms on press
  const handlePress = () => {
    // Scale up
    scale.value = withSpring(1.2);
    // Rotate 180 degrees
    rotation.value = withTiming(180, { duration: 500 });
    // Move right and up
    translateX.value = withSpring(50);
    translateY.value = withSpring(-30);

    // Reset after animation
    setTimeout(() => {
      scale.value = withSpring(1);
      rotation.value = withTiming(0, { duration: 500 });
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    }, 1000);
  };

  // Animated style for all transforms
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <TouchableOpacity onPress={handlePress}>
      <Animated.View
        style={animatedStyle}
        className="bg-gradient-to-r from-pink-500 to-yellow-500 p-8 rounded-xl shadow-lg"
      >
        <Text className="text-white text-lg font-bold text-center">
          Complex Animation
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};
```

### 3. Layout Animations

```javascript
import { Layout } from "react-native-reanimated";

const LayoutAnimationExample = () => {
  // State to control expansion
  const [expanded, setExpanded] = useState(false);

  return (
    <View className="flex-1 justify-center items-center bg-gray-50">
      {/* Animated.View with layout prop for automatic layout animation */}
      <Animated.View
        layout={Layout.springify()}
        className={`bg-white rounded-lg shadow-lg ${
          expanded ? "p-8 w-80" : "p-4 w-60"
        }`}
      >
        <TouchableOpacity onPress={() => setExpanded(!expanded)}>
          <Text className="text-lg font-semibold text-gray-800">
            {expanded ? "Collapse" : "Expand"}
          </Text>
        </TouchableOpacity>

        {/* Content that animates in/out with layout changes */}
        {expanded && (
          <Animated.View layout={Layout.springify()} className="mt-4">
            <Text className="text-gray-600">
              This content animates in and out smoothly when the layout changes.
            </Text>
          </Animated.View>
        )}
      </Animated.View>
    </View>
  );
};
```

## Gesture Handling

### 1. Pan Gesture

```javascript
import { Gesture, GestureDetector } from "react-native-gesture-handler";

const PanGestureExample = () => {
  // Shared values for translation
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  // Store the initial position when gesture starts
  const context = useSharedValue({ x: 0, y: 0 });

  // Define the pan gesture
  const gesture = Gesture.Pan()
    .onStart(() => {
      // Save the current position
      context.value = { x: translateX.value, y: translateY.value };
    })
    .onUpdate((event) => {
      // Update translation based on gesture
      translateX.value = context.value.x + event.translationX;
      translateY.value = context.value.y + event.translationY;
    })
    .onEnd((event) => {
      // Snap back to center if dragged too far
      if (Math.abs(event.translationX) > 100) {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  // Animated style for translation
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={animatedStyle}
        className="bg-blue-500 p-6 rounded-lg shadow-lg"
      >
        <Text className="text-white font-bold text-center">Drag Me</Text>
      </Animated.View>
    </GestureDetector>
  );
};
```

### 2. Pinch Gesture

```javascript
const PinchGestureExample = () => {
  // Shared values for scale and saved scale
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  // Define the pinch gesture
  const gesture = Gesture.Pinch()
    .onUpdate((event) => {
      // Update scale based on gesture
      scale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      // Save the new scale and clamp it between 0.5 and 3
      savedScale.value = scale.value;
      if (scale.value < 0.5) {
        scale.value = withSpring(0.5);
        savedScale.value = 0.5;
      } else if (scale.value > 3) {
        scale.value = withSpring(3);
        savedScale.value = 3;
      }
    });

  // Animated style for scaling
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={animatedStyle}
        className="bg-green-500 p-8 rounded-lg shadow-lg"
      >
        <Text className="text-white font-bold text-center">Pinch to Scale</Text>
      </Animated.View>
    </GestureDetector>
  );
};
```

### 3. Long Press Gesture

```javascript
const LongPressGestureExample = () => {
  // Shared values for scale and opacity
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // Define the long press gesture
  const gesture = Gesture.LongPress()
    .minDuration(500) // Minimum duration for long press
    .onStart(() => {
      // Animate scale down and fade out on long press start
      scale.value = withSpring(0.9);
      opacity.value = withTiming(0.7);
    })
    .onEnd(() => {
      // Animate scale and opacity back to normal on release
      scale.value = withSpring(1);
      opacity.value = withTiming(1);
    });

  // Animated style for scale and opacity
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={animatedStyle}
        className="bg-purple-500 p-6 rounded-lg shadow-lg"
      >
        <Text className="text-white font-bold text-center">Long Press Me</Text>
      </Animated.View>
    </GestureDetector>
  );
};
```
