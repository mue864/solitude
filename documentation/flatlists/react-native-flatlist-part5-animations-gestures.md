# React Native FlatList Comprehensive Guide - Part 5: Animations, Gestures & Interactive Features

## Table of Contents

1. [Basic Animations](#basic-animations)
2. [Item Animations](#item-animations)
3. [Gesture Handling](#gesture-handling)
4. [Interactive Features](#interactive-features)
5. [Advanced Animations](#advanced-animations)
6. [Performance Optimized Animations](#performance-optimized-animations)

## Basic Animations

### Fade In Animation

```javascript
import React, { useRef, useEffect } from "react";
import { FlatList, Animated, View, Text } from "react-native";

const AnimatedFlatList = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const renderItem = ({ item, index }) => {
    const itemFadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(itemFadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 100, // Stagger animation
        useNativeDriver: true,
      }).start();
    }, [itemFadeAnim, index]);

    return (
      <Animated.View
        style={{
          opacity: itemFadeAnim,
          transform: [
            {
              translateY: itemFadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        }}
      >
        <View style={styles.item}>
          <Text style={styles.itemText}>{item.title}</Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </Animated.View>
  );
};
```

### Scale Animation on Press

```javascript
const ScaleAnimatedItem = React.memo(({ item, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
      }}
    >
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        activeOpacity={1}
      >
        <View style={styles.item}>
          <Text style={styles.itemText}>{item.title}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

const renderItem = useCallback(
  ({ item }) => (
    <ScaleAnimatedItem item={item} onPress={() => handleItemPress(item)} />
  ),
  [handleItemPress]
);
```

## Item Animations

### Slide In Animation

```javascript
const SlideInFlatList = () => {
  const renderItem = useCallback(({ item, index }) => {
    const slideAnim = useRef(new Animated.Value(-100)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          delay: index * 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 500,
          delay: index * 100,
          useNativeDriver: true,
        }),
      ]).start();
    }, [slideAnim, opacityAnim, index]);

    return (
      <Animated.View
        style={{
          transform: [{ translateX: slideAnim }],
          opacity: opacityAnim,
        }}
      >
        <View style={styles.item}>
          <Text style={styles.itemText}>{item.title}</Text>
        </View>
      </Animated.View>
    );
  }, []);

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
    />
  );
};
```

### Bounce Animation

```javascript
const BounceAnimatedItem = React.memo(({ item, onPress }) => {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    onPress?.(item);
  };

  return (
    <Animated.View
      style={{
        transform: [
          {
            scale: bounceAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.1],
            }),
          },
        ],
      }}
    >
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        <View style={styles.item}>
          <Text style={styles.itemText}>{item.title}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});
```

### Rotation Animation

```javascript
const RotateAnimatedItem = React.memo(({ item, onPress }) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      rotateAnim.setValue(0);
    });
    onPress?.(item);
  };

  return (
    <Animated.View
      style={{
        transform: [
          {
            rotate: rotateAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ["0deg", "360deg"],
            }),
          },
        ],
      }}
    >
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        <View style={styles.item}>
          <Text style={styles.itemText}>{item.title}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});
```

## Gesture Handling

### Swipe to Delete

```javascript
import { PanGestureHandler, State } from "react-native-gesture-handler";

const SwipeableItem = React.memo(({ item, onDelete }) => {
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
      onDelete?.(item);
    });
  };

  return (
    <View style={styles.swipeableContainer}>
      <Animated.View
        style={[
          styles.deleteButton,
          {
            opacity: deleteOpacity,
          },
        ]}
      >
        <TouchableOpacity onPress={handleDelete} style={styles.deleteTouchable}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </Animated.View>

      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
      >
        <Animated.View
          style={[
            styles.item,
            {
              transform: [{ translateX }],
            },
          ]}
        >
          <Text style={styles.itemText}>{item.title}</Text>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
});

const styles = StyleSheet.create({
  swipeableContainer: {
    position: "relative",
  },
  deleteButton: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
  },
  deleteTouchable: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteText: {
    color: "white",
    fontWeight: "bold",
  },
  item: {
    backgroundColor: "white",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  itemText: {
    fontSize: 16,
  },
});
```

### Long Press Gesture

```javascript
import { LongPressGestureHandler } from "react-native-gesture-handler";

const LongPressItem = React.memo(({ item, onLongPress, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const onLongPressEvent = Animated.event(
    [{ nativeEvent: { state: State.ACTIVE } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.state === State.BEGAN) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (event.nativeEvent.state === State.END) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      if (event.nativeEvent.duration > 500) {
        onLongPress?.(item);
      }
    }
  };

  return (
    <LongPressGestureHandler
      onGestureEvent={onLongPressEvent}
      onHandlerStateChange={onHandlerStateChange}
      minDurationMs={500}
    >
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        }}
      >
        <TouchableOpacity onPress={() => onPress?.(item)} activeOpacity={0.8}>
          <View style={styles.item}>
            <Text style={styles.itemText}>{item.title}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </LongPressGestureHandler>
  );
});
```

## Interactive Features

### Drag and Drop

```javascript
import { DragGestureHandler, State } from "react-native-gesture-handler";

const DraggableFlatList = () => {
  const [data, setData] = useState(initialData);
  const [draggedItem, setDraggedItem] = useState(null);

  const renderItem = useCallback(({ item, index, drag, isActive }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const shadowAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      if (isActive) {
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1.05,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(shadowAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(shadowAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, [isActive, scaleAnim, shadowAnim]);

    return (
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
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
      >
        <TouchableOpacity onLongPress={drag} style={styles.draggableItem}>
          <Text style={styles.itemText}>{item.title}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }, []);

  const onDragEnd = useCallback(({ data: newData }) => {
    setData(newData);
  }, []);

  return (
    <DraggableFlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      onDragEnd={onDragEnd}
    />
  );
};
```

### Expandable Items

```javascript
const ExpandableItem = React.memo(({ item }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const heightAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);

    Animated.parallel([
      Animated.timing(heightAnim, {
        toValue: isExpanded ? 0 : 1,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(rotateAnim, {
        toValue: isExpanded ? 0 : 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <View style={styles.expandableContainer}>
      <TouchableOpacity
        onPress={toggleExpanded}
        style={styles.expandableHeader}
      >
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Animated.View
          style={{
            transform: [
              {
                rotate: rotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", "180deg"],
                }),
              },
            ],
          }}
        >
          <Text style={styles.expandIcon}>▼</Text>
        </Animated.View>
      </TouchableOpacity>

      <Animated.View
        style={{
          height: heightAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 100],
          }),
          overflow: "hidden",
        }}
      >
        <View style={styles.expandableContent}>
          <Text style={styles.itemDescription}>{item.description}</Text>
          <View style={styles.expandableActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Text>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
});
```

## Advanced Animations

### Parallax Scrolling

```javascript
const ParallaxFlatList = () => {
  const scrollY = useRef(new Animated.Value(0)).current;

  const renderItem = useCallback(
    ({ item, index }) => {
      const inputRange = [(index - 1) * 200, index * 200, (index + 1) * 200];

      const imageTranslateY = scrollY.interpolate({
        inputRange,
        outputRange: [50, 0, -50],
        extrapolate: "clamp",
      });

      const imageOpacity = scrollY.interpolate({
        inputRange,
        outputRange: [0.5, 1, 0.5],
        extrapolate: "clamp",
      });

      return (
        <View style={styles.parallaxItem}>
          <Animated.Image
            source={{ uri: item.image }}
            style={[
              styles.parallaxImage,
              {
                transform: [{ translateY: imageTranslateY }],
                opacity: imageOpacity,
              },
            ]}
          />
          <View style={styles.parallaxContent}>
            <Text style={styles.parallaxTitle}>{item.title}</Text>
            <Text style={styles.parallaxSubtitle}>{item.subtitle}</Text>
          </View>
        </View>
      );
    },
    [scrollY]
  );

  return (
    <Animated.FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: true }
      )}
      scrollEventThrottle={16}
    />
  );
};
```

### Staggered Animations

```javascript
const StaggeredFlatList = () => {
  const renderItem = useCallback(({ item, index }) => {
    const slideAnim = useRef(new Animated.Value(100)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
      Animated.stagger(index * 50, [
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start();
    }, [slideAnim, fadeAnim, scaleAnim, index]);

    return (
      <Animated.View
        style={{
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          opacity: fadeAnim,
        }}
      >
        <View style={styles.item}>
          <Text style={styles.itemText}>{item.title}</Text>
        </View>
      </Animated.View>
    );
  }, []);

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
    />
  );
};
```

## Performance Optimized Animations

### Optimized Animation Component

```javascript
const OptimizedAnimatedItem = React.memo(({ item, index }) => {
  const animatedValues = useMemo(
    () => ({
      translateY: new Animated.Value(50),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0.9),
    }),
    []
  );

  useEffect(() => {
    const animations = [
      Animated.timing(animatedValues.translateY, {
        toValue: 0,
        duration: 300,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValues.opacity, {
        toValue: 1,
        duration: 300,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.spring(animatedValues.scale, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ];

    Animated.parallel(animations).start();
  }, [animatedValues, index]);

  const handlePress = useCallback(() => {
    Animated.sequence([
      Animated.timing(animatedValues.scale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValues.scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [animatedValues]);

  return (
    <Animated.View
      style={{
        transform: [
          { translateY: animatedValues.translateY },
          { scale: animatedValues.scale },
        ],
        opacity: animatedValues.opacity,
      }}
    >
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        <View style={styles.item}>
          <Text style={styles.itemText}>{item.title}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

// Usage with getItemLayout for better performance
const getItemLayout = (data, index) => ({
  length: 80, // Fixed item height
  offset: 80 * index,
  index,
});

<FlatList
  data={data}
  renderItem={({ item, index }) => (
    <OptimizedAnimatedItem item={item} index={index} />
  )}
  keyExtractor={(item) => item.id}
  getItemLayout={getItemLayout}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={10}
  initialNumToRender={5}
/>;
```

### Memory Efficient Animations

```javascript
const MemoryEfficientFlatList = () => {
  const animatedValues = useRef(new Map()).current;

  const getAnimatedValue = useCallback(
    (itemId) => {
      if (!animatedValues.has(itemId)) {
        animatedValues.set(itemId, {
          translateY: new Animated.Value(50),
          opacity: new Animated.Value(0),
        });
      }
      return animatedValues.get(itemId);
    },
    [animatedValues]
  );

  const renderItem = useCallback(
    ({ item, index }) => {
      const anims = getAnimatedValue(item.id);

      useEffect(() => {
        Animated.parallel([
          Animated.timing(anims.translateY, {
            toValue: 0,
            duration: 300,
            delay: index * 50,
            useNativeDriver: true,
          }),
          Animated.timing(anims.opacity, {
            toValue: 1,
            duration: 300,
            delay: index * 50,
            useNativeDriver: true,
          }),
        ]).start();
      }, [anims, index]);

      return (
        <Animated.View
          style={{
            transform: [{ translateY: anims.translateY }],
            opacity: anims.opacity,
          }}
        >
          <View style={styles.item}>
            <Text style={styles.itemText}>{item.title}</Text>
          </View>
        </Animated.View>
      );
    },
    [getAnimatedValue]
  );

  // Cleanup animated values when component unmounts
  useEffect(() => {
    return () => {
      animatedValues.clear();
    };
  }, [animatedValues]);

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
    />
  );
};
```

This Part 5 covers advanced animation techniques and interactive features for FlatList. The next part will cover:

- **Part 6**: Real-world examples, best practices, and common patterns

Would you like me to continue with Part 6?
