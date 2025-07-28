# React Native Reanimated - Part 2: Advanced Patterns & Complex Animations

## Table of Contents

1. [Advanced Animation Patterns](#advanced-animation-patterns)
2. [Complex Gesture Interactions](#complex-gesture-interactions)
3. [Layout Animations](#layout-animations)
4. [Shared Element Transitions](#shared-element-transitions)
5. [Performance Optimization](#performance-optimization)
6. [Real-World Complex Examples](#real-world-complex-examples)

## Advanced Animation Patterns

### 1. Chained Animations with Callbacks

```javascript
import React, { useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  runOnJS,
} from "react-native-reanimated";

const ChainedAnimationExample = () => {
  // Shared values for different properties
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);

  // Function to trigger chained animations
  const handleAnimation = () => {
    // Chain scale animations: up, down, then spring to 1
    scale.value = withSequence(
      withTiming(1.2, { duration: 200 }),
      withTiming(0.8, { duration: 200 }),
      withSpring(1, { damping: 15, stiffness: 300 })
    );

    // Delay rotation, then rotate 360 degrees
    rotation.value = withDelay(400, withTiming(360, { duration: 600 }));

    // Chain opacity: fade out, then fade in
    opacity.value = withSequence(
      withTiming(0.5, { duration: 300 }),
      withTiming(1, { duration: 300 })
    );

    // Move up with a spring
    translateY.value = withSpring(-20, {
      damping: 15,
      stiffness: 100,
    });
  };

  // Animated style for all properties
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
      { translateY: translateY.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <View className="flex-1 justify-center items-center bg-gray-50">
      <TouchableOpacity onPress={handleAnimation}>
        <Animated.View
          style={animatedStyle}
          className="bg-gradient-to-r from-purple-500 to-pink-500 p-8 rounded-xl shadow-lg"
        >
          <Text className="text-white text-xl font-bold text-center">
            Chain Animation
          </Text>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

export default ChainedAnimationExample;
```

### 2. Interpolated Animations

```javascript
import { interpolate, Extrapolate } from "react-native-reanimated";

const InterpolatedAnimation = () => {
  // Shared value for animation progress
  const progress = useSharedValue(0);

  useEffect(() => {
    // Animate progress from 0 to 1 over 2 seconds
    progress.value = withTiming(1, { duration: 2000 });
  }, []);

  // Animated style using interpolation for multiple properties
  const animatedStyle = useAnimatedStyle(() => {
    // Interpolate scale: 1 -> 1.2 -> 1
    const scale = interpolate(
      progress.value,
      [0, 0.5, 1],
      [1, 1.2, 1],
      Extrapolate.CLAMP
    );

    // Interpolate opacity: 0 -> 1 -> 1 -> 0.8
    const opacity = interpolate(
      progress.value,
      [0, 0.3, 0.7, 1],
      [0, 1, 1, 0.8],
      Extrapolate.CLAMP
    );

    // Interpolate translateY: 0 -> -50
    const translateY = interpolate(
      progress.value,
      [0, 1],
      [0, -50],
      Extrapolate.CLAMP
    );

    // Interpolate rotation: 0 -> 180 degrees
    const rotation = interpolate(
      progress.value,
      [0, 1],
      [0, 180],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }, { translateY }, { rotate: `${rotation}deg` }],
      opacity,
    };
  });

  return (
    <View className="flex-1 justify-center items-center bg-gray-50">
      <Animated.View
        style={animatedStyle}
        className="bg-blue-500 p-6 rounded-lg shadow-lg"
      >
        <Text className="text-white font-bold text-center">Interpolated</Text>
      </Animated.View>
    </View>
  );
};
```

### 3. Physics-Based Animations

```javascript
const PhysicsAnimation = () => {
  // Shared values for vertical position and velocity
  const translateY = useSharedValue(0);
  const velocity = useSharedValue(0);

  // Function to trigger the physics animation (gravity and bounce)
  const handlePress = () => {
    // Give an initial upward velocity
    velocity.value = -15;

    const gravity = 0.8; // Gravity constant
    const bounce = 0.7; // Bounce damping

    // Animation loop using requestAnimationFrame
    const animate = () => {
      "worklet"; // Required for UI thread

      velocity.value += gravity; // Apply gravity
      translateY.value += velocity.value; // Update position

      // Bounce off the bottom (translateY > 0)
      if (translateY.value > 0) {
        translateY.value = 0;
        velocity.value = -velocity.value * bounce; // Reverse and dampen velocity
      }

      // Continue animation if still moving
      if (Math.abs(velocity.value) > 0.1 || translateY.value < 0) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };

  // Animated style for vertical movement
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View className="flex-1 justify-center items-center bg-gray-50">
      <TouchableOpacity onPress={handlePress}>
        <Animated.View
          style={animatedStyle}
          className="bg-red-500 p-6 rounded-full shadow-lg"
        >
          <Text className="text-white font-bold">Bounce</Text>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};
```

### 3. Conditional Animation Rendering

```javascript
const ConditionalAnimation = ({ shouldAnimate, children }) => {
  // Shared value for scale
  const scale = useSharedValue(1);

  useEffect(() => {
    // Animate scale up if shouldAnimate is true, else reset
    if (shouldAnimate) {
      scale.value = withSpring(1.1);
    } else {
      scale.value = withSpring(1);
    }
  }, [shouldAnimate]);

  // Animated style for scaling
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // If not animating, just render children
  if (!shouldAnimate) {
    return children;
  }

  // Otherwise, wrap children in Animated.View
  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};
```

## Complex Gesture Interactions

### 1. Multi-Touch Gesture

```javascript
import { Gesture, GestureDetector } from "react-native-gesture-handler";

const MultiTouchGesture = () => {
  // Shared values for scale, rotation, and translation
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // Save the last values for each gesture
  const savedScale = useSharedValue(1);
  const savedRotation = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // Pan gesture for moving
  const panGesture = Gesture.Pan()
    .onStart(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((event) => {
      translateX.value = savedTranslateX.value + event.translationX;
      translateY.value = savedTranslateY.value + event.translationY;
    });

  // Pinch gesture for scaling and rotating
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value;
      savedRotation.value = rotation.value;
    })
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
      rotation.value = savedRotation.value + event.rotation;
    })
    .onEnd(() => {
      // Clamp scale between 0.5 and 3
      scale.value = Math.max(0.5, Math.min(3, scale.value));
    });

  // Combine gestures so they can be used simultaneously
  const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  // Animated style for all transforms
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}rad` },
    ],
  }));

  return (
    <View className="flex-1 justify-center items-center bg-gray-50">
      <GestureDetector gesture={composedGesture}>
        <Animated.View
          style={animatedStyle}
          className="bg-gradient-to-br from-green-400 to-blue-500 p-8 rounded-xl shadow-lg"
        >
          <Text className="text-white text-lg font-bold text-center">
            Multi-Touch
          </Text>
          <Text className="text-white text-sm text-center mt-2">
            Pinch & Pan
          </Text>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};
```

### 2. Swipe to Delete with Haptic Feedback

```javascript
import * as Haptics from "expo-haptics";

const SwipeToDelete = ({ item, onDelete }) => {
  // Shared values for translation, opacity, and scale
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  // Define the pan gesture for swipe
  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      // Only allow swiping left
      translateX.value = Math.min(0, event.translationX);
    })
    .onEnd((event) => {
      if (event.translationX < -100) {
        // If swiped far enough, animate out and trigger delete
        translateX.value = withTiming(-300);
        opacity.value = withTiming(0);
        scale.value = withTiming(0.8);

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        setTimeout(() => {
          onDelete(item);
        }, 300);
      } else {
        // Snap back if not swiped far enough
        translateX.value = withSpring(0);
      }
    });

  // Animated style for translation, scale, and opacity
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View className="relative">
      {/* Delete button background */}
      <View className="absolute right-0 top-0 bottom-0 bg-red-500 justify-center items-center w-20 rounded-r-lg">
        <Text className="text-white font-bold">Delete</Text>
      </View>

      <GestureDetector gesture={gesture}>
        <Animated.View
          style={animatedStyle}
          className="bg-white p-4 rounded-lg border border-gray-200"
        >
          <Text className="text-gray-800 font-medium">{item.title}</Text>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};
```

### 3. Drag and Drop with Snap Points

```javascript
const DragAndDropSnap = () => {
  // Shared values for translation, scale, and dragging state
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const isDragging = useSharedValue(false);

  // Define snap points for the draggable item
  const snapPoints = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 200, y: 0 },
    { x: 0, y: 100 },
    { x: 100, y: 100 },
    { x: 200, y: 100 },
  ];

  // Define the pan gesture for drag
  const gesture = Gesture.Pan()
    .onStart(() => {
      isDragging.value = true;
      scale.value = withSpring(1.1);
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      isDragging.value = false;
      scale.value = withSpring(1);

      // Find the closest snap point
      let closestPoint = snapPoints[0];
      let minDistance = Infinity;

      snapPoints.forEach((point) => {
        const distance = Math.sqrt(
          Math.pow(event.translationX - point.x, 2) +
            Math.pow(event.translationY - point.y, 2)
        );

        if (distance < minDistance) {
          minDistance = distance;
          closestPoint = point;
        }
      });

      // Snap to the closest point
      translateX.value = withSpring(closestPoint.x);
      translateY.value = withSpring(closestPoint.y);
    });

  // Animated style for translation and scale
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    zIndex: isDragging.value ? 1000 : 1,
  }));

  return (
    <View className="flex-1 bg-gray-50 p-4">
      {/* Snap point indicators */}
      {snapPoints.map((point, index) => (
        <View
          key={index}
          className="absolute w-4 h-4 bg-blue-200 rounded-full"
          style={{ left: point.x, top: point.y }}
        />
      ))}

      <GestureDetector gesture={gesture}>
        <Animated.View
          style={animatedStyle}
          className="bg-purple-500 p-6 rounded-lg shadow-lg"
        >
          <Text className="text-white font-bold text-center">Drag Me</Text>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};
```

## Layout Animations

### 1. Animated List with Layout

```javascript
import { Layout } from "react-native-reanimated";

const AnimatedList = () => {
  // State for the list of items
  const [items, setItems] = useState([
    { id: 1, title: "Item 1", height: 60 },
    { id: 2, title: "Item 2", height: 60 },
    { id: 3, title: "Item 3", height: 60 },
  ]);

  // Add a new item to the list
  const addItem = () => {
    const newId = Math.max(...items.map((item) => item.id)) + 1;
    setItems((prev) => [
      ...prev,
      {
        id: newId,
        title: `Item ${newId}`,
        height: 60,
      },
    ]);
  };

  // Remove an item from the list
  const removeItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <View className="flex-1 bg-gray-50 p-4">
      {/* Button to add a new item */}
      <TouchableOpacity
        onPress={addItem}
        className="bg-blue-500 p-4 rounded-lg mb-4"
      >
        <Text className="text-white font-bold text-center">Add Item</Text>
      </TouchableOpacity>

      {/* Render each item with layout animation */}
      {items.map((item) => (
        <Animated.View
          key={item.id}
          layout={Layout.springify()}
          className="bg-white p-4 rounded-lg mb-2 shadow-sm"
        >
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-800 font-medium">{item.title}</Text>
            <TouchableOpacity
              onPress={() => removeItem(item.id)}
              className="bg-red-500 px-3 py-1 rounded"
            >
              <Text className="text-white text-sm">Remove</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      ))}
    </View>
  );
};
```

### 2. Animated Grid Layout

```javascript
const AnimatedGrid = () => {
  // State to control which card is expanded
  const [expanded, setExpanded] = useState(null);

  // Example grid items
  const gridItems = [
    { id: 1, title: "Card 1", color: "bg-blue-500" },
    { id: 2, title: "Card 2", color: "bg-green-500" },
    { id: 3, title: "Card 3", color: "bg-purple-500" },
    { id: 4, title: "Card 4", color: "bg-red-500" },
  ];

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <View className="flex-row flex-wrap justify-between">
        {gridItems.map((item) => (
          <Animated.View
            key={item.id}
            layout={Layout.springify()}
            className={`${item.color} p-4 rounded-lg shadow-lg mb-4 ${
              expanded === item.id ? "w-full" : "w-[48%]"
            }`}
          >
            <TouchableOpacity
              onPress={() => setExpanded(expanded === item.id ? null : item.id)}
              className="flex-1"
            >
              <Text className="text-white font-bold text-center">
                {item.title}
              </Text>
              {/* Expanded content animates in/out with layout changes */}
              {expanded === item.id && (
                <Animated.View layout={Layout.springify()} className="mt-4">
                  <Text className="text-white text-center">
                    This is the expanded content for {item.title}. It can
                    contain much more information and details.
                  </Text>
                </Animated.View>
              )}
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </View>
  );
};
```

## Shared Element Transitions

### 1. Shared Element Between Screens

```javascript
import { SharedElement } from "react-navigation-shared-element";

const SharedElementTransition = () => {
  // State to control which item is selected
  const [selectedItem, setSelectedItem] = useState(null);

  // Example items for the list
  const items = [
    { id: 1, title: "Item 1", color: "bg-blue-500" },
    { id: 2, title: "Item 2", color: "bg-green-500" },
    { id: 3, title: "Item 3", color: "bg-purple-500" },
  ];

  return (
    <View className="flex-1 bg-gray-50 p-4">
      {/* Render each item as a shared element */}
      {items.map((item) => (
        <SharedElement key={item.id} id={`item.${item.id}`}>
          <TouchableOpacity
            onPress={() => setSelectedItem(item)}
            className={`${item.color} p-6 rounded-lg shadow-lg mb-4`}
          >
            <Text className="text-white font-bold text-center text-lg">
              {item.title}
            </Text>
          </TouchableOpacity>
        </SharedElement>
      ))}

      {/* Modal for the selected item with shared element transition */}
      {selectedItem && (
        <Modal
          visible={!!selectedItem}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedItem(null)}
        >
          <View className="flex-1 bg-black/50 justify-center items-center">
            <TouchableOpacity
              onPress={() => setSelectedItem(null)}
              className="absolute inset-0"
            />

            <SharedElement id={`item.${selectedItem.id}`}>
              <View
                className={`${selectedItem.color} p-8 rounded-xl shadow-xl`}
              >
                <Text className="text-white font-bold text-center text-2xl">
                  {selectedItem.title}
                </Text>
                <Text className="text-white text-center mt-4">
                  This is the detailed view of {selectedItem.title}
                </Text>
              </View>
            </SharedElement>
          </View>
        </Modal>
      )}
    </View>
  );
};
```

### 2. Animated Progress Circle

```javascript
const AnimatedProgressCircle = ({ progress }) => {
  // Shared values for stroke dasharray and rotation
  const strokeDasharray = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Animate the progress arc and rotation
    strokeDasharray.value = withTiming(progress * 283, { duration: 1000 });
    rotation.value = withTiming(progress * 360, { duration: 1000 });
  }, [progress]);

  // Animated style for the SVG circle
  const animatedStyle = useAnimatedStyle(() => ({
    strokeDasharray: strokeDasharray.value,
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View className="items-center justify-center">
      <Svg width="120" height="120">
        {/* Background circle */}
        <Circle
          cx="60"
          cy="60"
          r="45"
          stroke="#e5e7eb"
          strokeWidth="8"
          fill="none"
        />

        {/* Progress circle (animated) */}
        <AnimatedCircle
          cx="60"
          cy="60"
          r="45"
          stroke="#3b82f6"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          style={animatedStyle}
        />
      </Svg>

      {/* Centered progress text */}
      <View className="absolute">
        <Text className="text-2xl font-bold text-gray-800">
          {Math.round(progress * 100)}%
        </Text>
      </View>
    </View>
  );
};
```

## Performance Optimization

### 1. Optimized Animation Components

```javascript
const OptimizedAnimatedComponent = React.memo(({ item, index }) => {
  // Shared values for opacity and vertical movement
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);

  useEffect(() => {
    // Animate opacity in with a staggered delay
    opacity.value = withTiming(1, {
      duration: 500,
      delay: index * 100,
    });
    // Animate translateY to 0 with a spring and stagger
    translateY.value = withSpring(0, {
      damping: 15,
      stiffness: 100,
      delay: index * 100,
    });
  }, []);

  // Animated style for each item
  const animatedStyle = useAnimatedStyle(
    () => ({
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    }),
    []
  ); // Empty dependency array for optimization

  return (
    <Animated.View
      style={animatedStyle}
      className="bg-white p-4 m-2 rounded-lg shadow-sm"
    >
      <Text className="text-gray-800">{item.title}</Text>
    </Animated.View>
  );
});
```

### 2. Animation Value Pooling

```javascript
class AnimationValuePool {
  constructor() {
    this.pool = new Map();
    this.maxSize = 50;
  }

  // Get or create a shared value for a given key
  get(key) {
    if (!this.pool.has(key)) {
      if (this.pool.size >= this.maxSize) {
        // Remove oldest entry if pool is full
        const firstKey = this.pool.keys().next().value;
        this.pool.delete(firstKey);
      }
      this.pool.set(key, useSharedValue(0));
    }
    return this.pool.get(key);
  }

  // Clear the pool
  clear() {
    this.pool.clear();
  }
}

export const animationValuePool = new AnimationValuePool();
```

## Real-World Complex Examples

### 1. Animated Tab Bar with Indicators

```javascript
const AnimatedTabBar = () => {
  // State for the active tab
  const [activeTab, setActiveTab] = useState(0);
  // Shared values for indicator position and scale
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);

  // Example tab data
  const tabs = [
    { id: 0, title: "Home", icon: "🏠" },
    { id: 1, title: "Journal", icon: "📝" },
    { id: 2, title: "Focus", icon: "🎯" },
    { id: 3, title: "Settings", icon: "⚙️" },
  ];

  // Handle tab press: animate indicator and scale
  const handleTabPress = (tabIndex) => {
    setActiveTab(tabIndex);
    translateX.value = withSpring(tabIndex * 80);
    scale.value = withSequence(
      withTiming(0.8, { duration: 100 }),
      withSpring(1, { damping: 15, stiffness: 300 })
    );
  };

  // Animated style for the indicator
  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // Animated style for scaling the tab
  const tabStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View className="bg-white p-4 rounded-t-xl shadow-lg">
      <View className="relative">
        {/* Animated indicator under the active tab */}
        <Animated.View
          style={indicatorStyle}
          className="absolute w-20 h-1 bg-blue-500 rounded-full"
        />

        <View className="flex-row justify-around">
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => handleTabPress(tab.id)}
              className="items-center py-2"
            >
              <Animated.View style={tabStyle}>
                <Text className="text-2xl mb-1">{tab.icon}</Text>
                <Text
                  className={`text-sm ${
                    activeTab === tab.id
                      ? "text-blue-500 font-semibold"
                      : "text-gray-500"
                  }`}
                >
                  {tab.title}
                </Text>
              </Animated.View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};
```

### 3. Animated Floating Action Button

```javascript
const AnimatedFAB = () => {
  // Shared values for scale, rotation, and vertical movement
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const translateY = useSharedValue(0);
  // State to control expansion
  const [isExpanded, setIsExpanded] = useState(false);

  // Handle FAB press: animate expansion and rotation
  const handlePress = () => {
    setIsExpanded(!isExpanded);

    if (!isExpanded) {
      scale.value = withSpring(1.1);
      rotation.value = withTiming(45, { duration: 300 });
      translateY.value = withSpring(-20);
    } else {
      scale.value = withSpring(1);
      rotation.value = withTiming(0, { duration: 300 });
      translateY.value = withSpring(0);
    }
  };

  // Animated style for the main FAB
  const fabStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
      { translateY: translateY.value },
    ],
  }));

  return (
    <View className="absolute bottom-6 right-6">
      {/* Action buttons (expand/collapse) */}
      {isExpanded && (
        <Animated.View
          layout={Layout.springify()}
          className="absolute bottom-16 right-0"
        >
          <TouchableOpacity className="bg-green-500 w-12 h-12 rounded-full justify-center items-center mb-2 shadow-lg">
            <Text className="text-white text-xl">📝</Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-purple-500 w-12 h-12 rounded-full justify-center items-center mb-2 shadow-lg">
            <Text className="text-white text-xl">🎯</Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-blue-500 w-12 h-12 rounded-full justify-center items-center shadow-lg">
            <Text className="text-white text-xl">⚙️</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Main FAB */}
      <TouchableOpacity onPress={handlePress}>
        <Animated.View
          style={fabStyle}
          className="bg-red-500 w-14 h-14 rounded-full justify-center items-center shadow-lg"
        >
          <Text className="text-white text-2xl">+</Text>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};
```
