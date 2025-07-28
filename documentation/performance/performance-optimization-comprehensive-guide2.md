# React Native Performance Optimization with NativeWind - Comprehensive Guide

## Table of Contents

1. [Performance Fundamentals](#performance-fundamentals)
2. [NativeWind Performance Optimization](#nativewind-performance-optimization)
3. [React Native Performance Profiling](#react-native-performance-profiling)
4. [Component Optimization](#component-optimization)
5. [List Performance](#list-performance)
6. [Memory Management](#memory-management)
7. [Bundle Size Optimization](#bundle-size-optimization)
8. [Real-World Performance Patterns](#real-world-performance-patterns)

## Performance Fundamentals

### Why Performance Matters in React Native

Performance issues in React Native apps can manifest as:

- **Janky animations** (dropped frames)
- **Slow navigation** between screens
- **Unresponsive UI** during interactions
- **High memory usage** leading to crashes
- **Slow app startup** times

### Performance Metrics to Monitor

```javascript
// Key metrics to track
const performanceMetrics = {
  // Time to Interactive (TTI)
  tti: "Time from app start to first interactive element",

  // Frame Rate
  fps: "Target: 60 FPS, acceptable: 50+ FPS",

  // Memory Usage
  memory: "Monitor heap size and memory leaks",

  // Bundle Size
  bundleSize: "Keep under 50MB for production",

  // Re-render Frequency
  reRenders: "Minimize unnecessary re-renders",
};
```

## NativeWind Performance Optimization

### 1. Optimizing Class Name Resolution

```javascript
// ❌ Bad: Dynamic class names in render
const BadComponent = ({ isActive, variant }) => {
  return (
    <View
      className={`bg-${variant}-500 ${isActive ? "opacity-100" : "opacity-50"}`}
    >
      <Text>Content</Text>
    </View>
  );
};

// ✅ Good: Pre-computed class names
const GoodComponent = ({ isActive, variant }) => {
  // Pre-compute class names outside render
  const getClassName = useCallback(() => {
    const baseClass = "rounded-lg p-4";
    const variantClass =
      {
        primary: "bg-primary-500",
        secondary: "bg-secondary-500",
        danger: "bg-red-500",
      }[variant] || "bg-gray-500";
    const activeClass = isActive ? "opacity-100" : "opacity-50";

    return `${baseClass} ${variantClass} ${activeClass}`;
  }, [variant, isActive]);

  return (
    <View className={getClassName()}>
      <Text>Content</Text>
    </View>
  );
};
```

### 2. Class Name Caching

```javascript
// utils/classNameCache.js
class ClassNameCache {
  constructor() {
    this.cache = new Map();
  }

  getClassName(baseClasses, dynamicClasses) {
    const key = JSON.stringify({ baseClasses, dynamicClasses });

    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    const className = `${baseClasses} ${dynamicClasses}`.trim();
    this.cache.set(key, className);
    return className;
  }

  clear() {
    this.cache.clear();
  }
}

export const classNameCache = new ClassNameCache();

// Usage in components
const OptimizedComponent = ({ variant, size, disabled }) => {
  const className = useMemo(() => {
    return classNameCache.getClassName(
      "rounded-lg flex-row items-center",
      `${variant === "primary" ? "bg-primary-500" : "bg-gray-500"} ${
        size === "lg" ? "px-6 py-4" : "px-4 py-2"
      } ${disabled ? "opacity-50" : ""}`
    );
  }, [variant, size, disabled]);

  return (
    <View className={className}>
      <Text>Optimized Content</Text>
    </View>
  );
};
```

### 3. Conditional Styling Optimization

```javascript
// ❌ Bad: Multiple conditional classes
const BadConditionalComponent = ({ isActive, isDisabled, variant }) => {
  return (
    <View
      className={`
      bg-white 
      ${isActive ? "bg-blue-500" : ""} 
      ${isDisabled ? "opacity-50" : ""} 
      ${variant === "primary" ? "border-primary-500" : "border-gray-300"}
    `}
    >
      <Text>Content</Text>
    </View>
  );
};

// ✅ Good: Computed style objects
const GoodConditionalComponent = ({ isActive, isDisabled, variant }) => {
  const styleClasses = useMemo(() => {
    const classes = ["bg-white", "rounded-lg", "p-4"];

    if (isActive) {
      classes.push("bg-blue-500");
    }

    if (isDisabled) {
      classes.push("opacity-50");
    }

    if (variant === "primary") {
      classes.push("border-primary-500");
    } else {
      classes.push("border-gray-300");
    }

    return classes.join(" ");
  }, [isActive, isDisabled, variant]);

  return (
    <View className={styleClasses}>
      <Text>Content</Text>
    </View>
  );
};
```

### 4. Tailwind Configuration Optimization

```javascript
// tailwind.config.js - Optimized for performance
module.exports = {
  presets: [require("nativewind/preset")],
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  // Purge unused styles in production
  purge: {
    enabled: process.env.NODE_ENV === "production",
    content: [
      "./app/**/*.{js,jsx,ts,tsx}",
      "./components/**/*.{js,jsx,ts,tsx}",
    ],
  },
  theme: {
    extend: {
      // Use CSS custom properties for dynamic values
      colors: {
        primary: {
          50: "var(--primary-50)",
          100: "var(--primary-100)",
          500: "var(--primary-500)",
          600: "var(--primary-600)",
          700: "var(--primary-700)",
          900: "var(--primary-900)",
        },
      },
      // Optimize spacing scale
      spacing: {
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
      },
    },
  },
  // Disable unused features for better performance
  corePlugins: {
    preflight: false, // Disable base styles
    container: false, // Disable container plugin
  },
  plugins: [
    // Custom plugin for performance-critical utilities
    function ({ addUtilities }) {
      const newUtilities = {
        ".performance-critical": {
          "will-change": "transform",
          transform: "translateZ(0)",
        },
      };
      addUtilities(newUtilities);
    },
  ],
};
```

## React Native Performance Profiling

### 1. Using React DevTools Profiler

```javascript
// components/PerformanceMonitor.tsx
import React, { Profiler } from 'react';
import { View, Text } from 'react-native';

interface PerformanceMonitorProps {
  children: React.ReactNode;
  id: string;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ children, id }) => {
  const handleProfilerRender = (
    id: string,
    phase: string,
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number
  ) => {
    console.log(`Profiler [${id}]:`, {
      phase,
      actualDuration,
      baseDuration,
      startTime,
      commitTime,
    });

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      // analytics.track('component_render', { id, duration: actualDuration });
    }
  };

  return (
    <Profiler id={id} onRender={handleProfilerRender}>
      {children}
    </Profiler>
  );
};

export default PerformanceMonitor;
```

### 2. Flipper Integration for Performance Monitoring

```javascript
// utils/performanceMonitor.js
import { PerformanceObserver } from "react-native";

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observer = null;
  }

  startMonitoring() {
    if (__DEV__) {
      this.observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.metrics.set(entry.name, {
            duration: entry.duration,
            startTime: entry.startTime,
            timestamp: Date.now(),
          });
        });
      });

      this.observer.observe({ entryTypes: ["measure"] });
    }
  }

  measure(name, callback) {
    if (__DEV__) {
      performance.mark(`${name}-start`);
      const result = callback();
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
      return result;
    }
    return callback();
  }

  getMetrics() {
    return Object.fromEntries(this.metrics);
  }

  clearMetrics() {
    this.metrics.clear();
  }
}

export const performanceMonitor = new PerformanceMonitor();
```

### 3. Frame Rate Monitoring

```javascript
// hooks/useFrameRate.ts
import { useEffect, useState } from "react";
import { InteractionManager } from "react-native";

export const useFrameRate = () => {
  const [frameRate, setFrameRate] = useState(60);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    if (!isMonitoring) return;

    let frameCount = 0;
    let lastTime = Date.now();

    const measureFrameRate = () => {
      frameCount++;
      const currentTime = Date.now();

      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        setFrameRate(fps);
        frameCount = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(measureFrameRate);
    };

    const animationId = requestAnimationFrame(measureFrameRate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isMonitoring]);

  const startMonitoring = () => setIsMonitoring(true);
  const stopMonitoring = () => setIsMonitoring(false);

  return {
    frameRate,
    startMonitoring,
    stopMonitoring,
    isMonitoring,
  };
};
```

## Component Optimization

### 1. React.memo Optimization

```javascript
// components/OptimizedList.tsx
import React, { memo, useCallback, useMemo } from 'react';
import { View, Text, FlatList } from 'react-native';

interface ListItemProps {
  id: string;
  title: string;
  description: string;
  isSelected: boolean;
  onPress: (id: string) => void;
}

// Memoized list item component
const ListItem = memo<ListItemProps>(({ id, title, description, isSelected, onPress }) => {
  const handlePress = useCallback(() => {
    onPress(id);
  }, [id, onPress]);

  const containerStyle = useMemo(() => {
    return `p-4 rounded-lg ${isSelected ? 'bg-primary-100 border-primary-500' : 'bg-white border-gray-200'}`;
  }, [isSelected]);

  return (
    <View className={`border ${containerStyle}`} onTouchEnd={handlePress}>
      <Text className="text-lg font-semibold text-gray-900">{title}</Text>
      <Text className="text-sm text-gray-600 mt-1">{description}</Text>
    </View>
  );
});

ListItem.displayName = 'ListItem';

// Optimized list component
const OptimizedList = memo<{ data: ListItemProps[]; onItemPress: (id: string) => void }>(({
  data,
  onItemPress
}) => {
  const renderItem = useCallback(({ item }) => (
    <ListItem
      id={item.id}
      title={item.title}
      description={item.description}
      isSelected={item.isSelected}
      onPress={onItemPress}
    />
  ), [onItemPress]);

  const keyExtractor = useCallback((item) => item.id, []);

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={5}
      getItemLayout={(data, index) => ({
        length: 80,
        offset: 80 * index,
        index,
      })}
    />
  );
});

OptimizedList.displayName = 'OptimizedList';
```

### 2. useCallback and useMemo Optimization

```javascript
// hooks/useOptimizedCallback.ts
import { useCallback, useRef } from 'react';

export const useOptimizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T => {
  const depsRef = useRef(deps);
  const callbackRef = useRef(callback);

  // Update refs
  callbackRef.current = callback;
  depsRef.current = deps;

  return useCallback((...args: Parameters<T>) => {
    return callbackRef.current(...args);
  }, []) as T;
};

// Usage example
const OptimizedComponent = ({ data, onItemPress }) => {
  const handleItemPress = useOptimizedCallback((id: string) => {
    onItemPress(id);
  }, [onItemPress]);

  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      processed: true,
    }));
  }, [data]);

  return (
    <View>
      {processedData.map(item => (
        <TouchableOpacity key={item.id} onPress={() => handleItemPress(item.id)}>
          <Text>{item.title}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
```

### 3. Virtualization for Large Lists

```javascript
// components/VirtualizedList.tsx
import React, { memo, useCallback, useMemo } from 'react';
import { FlatList, View, Text } from 'react-native';

interface VirtualizedItemProps {
  item: any;
  index: number;
  style: any;
}

const VirtualizedItem = memo<VirtualizedItemProps>(({ item, index, style }) => {
  const itemStyle = useMemo(() => [
    style,
    'p-4 border-b border-gray-200',
  ], [style]);

  return (
    <View className="bg-white" style={itemStyle}>
      <Text className="text-lg font-semibold">{item.title}</Text>
      <Text className="text-sm text-gray-600 mt-1">{item.description}</Text>
    </View>
  );
});

VirtualizedItem.displayName = 'VirtualizedItem';

const VirtualizedList = memo<{ data: any[] }>(({ data }) => {
  const renderItem = useCallback(({ item, index }) => (
    <VirtualizedItem
      item={item}
      index={index}
      style={{ height: 80 }} // Fixed height for better performance
    />
  ), []);

  const keyExtractor = useCallback((item) => item.id.toString(), []);

  const getItemLayout = useCallback((data, index) => ({
    length: 80,
    offset: 80 * index,
    index,
  }), []);

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={10}
      updateCellsBatchingPeriod={50}
      disableVirtualization={false}
    />
  );
});

VirtualizedList.displayName = 'VirtualizedList';
```

## List Performance

### 1. FlatList Optimization Techniques

```javascript
// components/OptimizedFlatList.tsx
import React, { memo, useCallback, useMemo, useRef } from 'react';
import { FlatList, View, Text, TouchableOpacity } from 'react-native';

interface OptimizedFlatListProps {
  data: any[];
  onItemPress: (item: any) => void;
  onLoadMore?: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

const OptimizedFlatList = memo<OptimizedFlatListProps>(({
  data,
  onItemPress,
  onLoadMore,
  refreshing = false,
  onRefresh,
}) => {
  const flatListRef = useRef<FlatList>(null);

  // Memoized render item
  const renderItem = useCallback(({ item, index }) => {
    const handlePress = () => onItemPress(item);

    return (
      <TouchableOpacity
        onPress={handlePress}
        className="bg-white p-4 border-b border-gray-200 active:bg-gray-50"
      >
        <Text className="text-lg font-semibold text-gray-900">{item.title}</Text>
        <Text className="text-sm text-gray-600 mt-1">{item.description}</Text>
        {item.meta && (
          <View className="flex-row mt-2 space-x-2">
            {item.meta.map((meta, idx) => (
              <Text key={idx} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {meta}
              </Text>
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  }, [onItemPress]);

  // Memoized key extractor
  const keyExtractor = useCallback((item) => item.id.toString(), []);

  // Memoized get item layout for fixed height items
  const getItemLayout = useCallback((data, index) => ({
    length: 100, // Fixed height
    offset: 100 * index,
    index,
  }), []);

  // Memoized on end reached
  const handleEndReached = useCallback(() => {
    if (onLoadMore) {
      onLoadMore();
    }
  }, [onLoadMore]);

  // Memoized on refresh
  const handleRefresh = useCallback(() => {
    if (onRefresh) {
      onRefresh();
    }
  }, [onRefresh]);

  // Memoized list footer
  const ListFooterComponent = useMemo(() => {
    if (!onLoadMore) return null;

    return (
      <View className="p-4 items-center">
        <Text className="text-gray-500">Loading more...</Text>
      </View>
    );
  }, [onLoadMore]);

  // Memoized list empty component
  const ListEmptyComponent = useMemo(() => (
    <View className="flex-1 justify-center items-center p-8">
      <Text className="text-gray-500 text-center">No items found</Text>
    </View>
  ), []);

  return (
    <FlatList
      ref={flatListRef}
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      ListFooterComponent={ListFooterComponent}
      ListEmptyComponent={ListEmptyComponent}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.1}
      refreshing={refreshing}
      onRefresh={handleRefresh}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={10}
      updateCellsBatchingPeriod={50}
      disableVirtualization={false}
      showsVerticalScrollIndicator={false}
      className="flex-1"
    />
  );
});

OptimizedFlatList.displayName = 'OptimizedFlatList';
```

### 2. SectionList Optimization

```javascript
// components/OptimizedSectionList.tsx
import React, { memo, useCallback, useMemo } from 'react';
import { SectionList, View, Text, TouchableOpacity } from 'react-native';

interface Section {
  title: string;
  data: any[];
}

interface OptimizedSectionListProps {
  sections: Section[];
  onItemPress: (item: any) => void;
  onSectionPress?: (section: Section) => void;
}

const OptimizedSectionList = memo<OptimizedSectionListProps>(({
  sections,
  onItemPress,
  onSectionPress,
}) => {
  // Memoized render item
  const renderItem = useCallback(({ item, section, index }) => {
    const handlePress = () => onItemPress(item);

    return (
      <TouchableOpacity
        onPress={handlePress}
        className="bg-white px-4 py-3 border-b border-gray-100 active:bg-gray-50"
      >
        <Text className="text-base font-medium text-gray-900">{item.title}</Text>
        {item.subtitle && (
          <Text className="text-sm text-gray-600 mt-1">{item.subtitle}</Text>
        )}
      </TouchableOpacity>
    );
  }, [onItemPress]);

  // Memoized render section header
  const renderSectionHeader = useCallback(({ section }) => {
    const handleSectionPress = () => {
      if (onSectionPress) {
        onSectionPress(section);
      }
    };

    return (
      <TouchableOpacity
        onPress={handleSectionPress}
        className="bg-gray-50 px-4 py-3 border-b border-gray-200"
      >
        <Text className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          {section.title}
        </Text>
      </TouchableOpacity>
    );
  }, [onSectionPress]);

  // Memoized key extractor
  const keyExtractor = useCallback((item, index) =>
    item.id ? item.id.toString() : index.toString(),
  []);

  // Memoized section key extractor
  const sectionKeyExtractor = useCallback((item, index) =>
    `section-${index}`,
  []);

  return (
    <SectionList
      sections={sections}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      keyExtractor={keyExtractor}
      sectionKeyExtractor={sectionKeyExtractor}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={10}
      updateCellsBatchingPeriod={50}
      showsVerticalScrollIndicator={false}
      className="flex-1"
    />
  );
});

OptimizedSectionList.displayName = 'OptimizedSectionList';
```

## Memory Management

### 1. Image Optimization

```javascript
// components/OptimizedImage.tsx
import React, { memo, useState, useCallback } from 'react';
import { Image, View, ActivityIndicator } from 'react-native';

interface OptimizedImageProps {
  uri: string;
  width: number;
  height: number;
  className?: string;
  placeholder?: string;
}

const OptimizedImage = memo<OptimizedImageProps>(({
  uri,
  width,
  height,
  className,
  placeholder,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoadStart = useCallback(() => {
    setLoading(true);
    setError(false);
  }, []);

  const handleLoadEnd = useCallback(() => {
    setLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setLoading(false);
    setError(true);
  }, []);

  return (
    <View className={`relative ${className}`}>
      <Image
        source={{
          uri,
          width,
          height,
          cache: 'force-cache', // Use cached images
        }}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        className="w-full h-full"
        resizeMode="cover"
      />

      {loading && (
        <View className="absolute inset-0 justify-center items-center bg-gray-100">
          <ActivityIndicator size="small" color="#6B7280" />
        </View>
      )}

      {error && placeholder && (
        <Image
          source={{ uri: placeholder }}
          className="absolute inset-0"
          resizeMode="cover"
        />
      )}
    </View>
  );
});

OptimizedImage.displayName = 'OptimizedImage';
```

### 2. Event Listener Cleanup

```javascript
// hooks/useEventCleanup.ts
import { useEffect, useRef } from 'react';

export const useEventCleanup = () => {
  const cleanupRef = useRef<(() => void)[]>([]);

  const addCleanup = (cleanup: () => void) => {
    cleanupRef.current.push(cleanup);
  };

  useEffect(() => {
    return () => {
      cleanupRef.current.forEach(cleanup => cleanup());
      cleanupRef.current = [];
    };
  }, []);

  return { addCleanup };
};

// Usage example
const ComponentWithEventListeners = () => {
  const { addCleanup } = useEventCleanup();

  useEffect(() => {
    const handleResize = () => {
      // Handle resize
    };

    window.addEventListener('resize', handleResize);
    addCleanup(() => window.removeEventListener('resize', handleResize));

    return () => {
      // Additional cleanup if needed
    };
  }, [addCleanup]);

  return <View>Component with cleanup</View>;
};
```

### 3. Memory Leak Prevention

```javascript
// utils/memoryLeakDetector.ts
class MemoryLeakDetector {
  private components = new Set<string>();
  private timers = new Map<string, NodeJS.Timeout>();

  trackComponent(name: string) {
    if (__DEV__) {
      this.components.add(name);
      console.log(`Component mounted: ${name}. Total: ${this.components.size}`);
    }
  }

  untrackComponent(name: string) {
    if (__DEV__) {
      this.components.delete(name);
      console.log(`Component unmounted: ${name}. Total: ${this.components.size}`);
    }
  }

  trackTimer(name: string, timer: NodeJS.Timeout) {
    if (__DEV__) {
      this.timers.set(name, timer);
    }
  }

  clearTimer(name: string) {
    if (__DEV__) {
      const timer = this.timers.get(name);
      if (timer) {
        clearTimeout(timer);
        this.timers.delete(name);
      }
    }
  }

  getStats() {
    return {
      activeComponents: this.components.size,
      activeTimers: this.timers.size,
    };
  }
}

export const memoryLeakDetector = new MemoryLeakDetector();

// Usage in components
const ComponentWithMemoryTracking = () => {
  useEffect(() => {
    memoryLeakDetector.trackComponent('ComponentWithMemoryTracking');

    return () => {
      memoryLeakDetector.untrackComponent('ComponentWithMemoryTracking');
    };
  }, []);

  return <View>Component with memory tracking</View>;
};
```

## Bundle Size Optimization

### 1. Tree Shaking Configuration

```javascript
// metro.config.js - Optimized for bundle size
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Enable tree shaking
config.resolver.platforms = ["native", "ios", "android"];

// Optimize bundle size
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

// Exclude unnecessary files
config.resolver.blockList = [
  /.*\.test\.(js|jsx|ts|tsx)$/,
  /.*\.spec\.(js|jsx|ts|tsx)$/,
  /.*\.stories\.(js|jsx|ts|tsx)$/,
];

module.exports = config;
```

### 2. Dynamic Imports

```javascript
// utils/dynamicImports.ts
import { lazy } from "react";

// Lazy load heavy components
export const HeavyComponent = lazy(() => import("./HeavyComponent"));

// Lazy load screens
export const HomeScreen = lazy(() => import("../screens/HomeScreen"));
export const ProfileScreen = lazy(() => import("../screens/ProfileScreen"));
export const SettingsScreen = lazy(() => import("../screens/SettingsScreen"));

// Usage with Suspense
import React, { Suspense } from "react";
import { View, ActivityIndicator } from "react-native";
import { HeavyComponent } from "./utils/dynamicImports";

const AppWithLazyLoading = () => {
  return (
    <Suspense
      fallback={
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      }
    >
      <HeavyComponent />
    </Suspense>
  );
};
```

### 3. Bundle Analyzer

```javascript
// scripts/analyze-bundle.js
const { execSync } = require("child_process");
const fs = require("fs");

const analyzeBundle = () => {
  try {
    // Generate bundle analysis
    execSync(
      "npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android-release.bundle --assets-dest android-release-assets"
    );

    // Analyze bundle size
    const bundleStats = fs.statSync("android-release.bundle");
    const bundleSizeInMB = bundleStats.size / (1024 * 1024);

    console.log(`Bundle size: ${bundleSizeInMB.toFixed(2)} MB`);

    if (bundleSizeInMB > 50) {
      console.warn("⚠️  Bundle size is larger than recommended 50MB");
    }

    // Clean up
    fs.unlinkSync("android-release.bundle");
    fs.rmSync("android-release-assets", { recursive: true, force: true });
  } catch (error) {
    console.error("Bundle analysis failed:", error);
  }
};

analyzeBundle();
```

## Real-World Performance Patterns

### 1. Performance Monitoring Hook

```javascript
// hooks/usePerformanceMonitor.ts
import { useEffect, useRef, useState } from 'react';
import { InteractionManager } from 'react-native';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  frameRate: number;
}

export const usePerformanceMonitor = (componentName: string) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    frameRate: 60,
  });

  const renderStartTime = useRef<number>(0);
  const frameCount = useRef<number>(0);
  const lastFrameTime = useRef<number>(Date.now());

  useEffect(() => {
    renderStartTime.current = performance.now();

    const measureRenderTime = () => {
      const renderTime = performance.now() - renderStartTime.current;

      setMetrics(prev => ({
        ...prev,
        renderTime,
      }));

      // Log slow renders in development
      if (__DEV__ && renderTime > 16) {
        console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
    };

    // Measure render time after interaction
    InteractionManager.runAfterInteractions(measureRenderTime);

    return () => {
      // Cleanup
    };
  }, [componentName]);

  // Monitor frame rate
  useEffect(() => {
    const measureFrameRate = () => {
      frameCount.current++;
      const currentTime = Date.now();

      if (currentTime - lastFrameTime.current >= 1000) {
        const fps = Math.round((frameCount.current * 1000) / (currentTime - lastFrameTime.current));

        setMetrics(prev => ({
          ...prev,
          frameRate: fps,
        }));

        frameCount.current = 0;
        lastFrameTime.current = currentTime;
      }

      requestAnimationFrame(measureFrameRate);
    };

    const animationId = requestAnimationFrame(measureFrameRate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return metrics;
};
```

### 2. Optimized Navigation Pattern

```javascript
// navigation/OptimizedNavigator.tsx
import React, { memo, useCallback } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";

const Stack = createStackNavigator();

// Memoized screen components
const HomeScreen = memo(() => (
  <View className="flex-1 justify-center items-center">
    <Text className="text-xl">Home Screen</Text>
  </View>
));

const ProfileScreen = memo(() => (
  <View className="flex-1 justify-center items-center">
    <Text className="text-xl">Profile Screen</Text>
  </View>
));

const OptimizedNavigator = () => {
  const screenOptions = useCallback(
    () => ({
      headerShown: true,
      headerStyle: {
        backgroundColor: "#ffffff",
      },
      headerTintColor: "#000000",
      headerTitleStyle: {
        fontWeight: "bold",
      },
    }),
    []
  );

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "Home" }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ title: "Profile" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default OptimizedNavigator;
```

### 3. Performance Testing Utilities

```javascript
// utils/performanceTest.ts
export class PerformanceTest {
  private tests: Map<string, () => void> = new Map();
  private results: Map<string, number> = new Map();

  addTest(name: string, testFn: () => void) {
    this.tests.set(name, testFn);
  }

  runTest(name: string): number {
    const test = this.tests.get(name);
    if (!test) {
      throw new Error(`Test "${name}" not found`);
    }

    const startTime = performance.now();
    test();
    const endTime = performance.now();

    const duration = endTime - startTime;
    this.results.set(name, duration);

    return duration;
  }

  runAllTests(): Record<string, number> {
    const results: Record<string, number> = {};

    for (const [name] of this.tests) {
      results[name] = this.runTest(name);
    }

    return results;
  }

  getResults(): Record<string, number> {
    return Object.fromEntries(this.results);
  }

  clearResults() {
    this.results.clear();
  }
}

// Usage example
const performanceTest = new PerformanceTest();

performanceTest.addTest('Button Render', () => {
  // Test button rendering performance
  const button = <Button onPress={() => {}}>Test Button</Button>;
  // Simulate render
});

performanceTest.addTest('List Render', () => {
  // Test list rendering performance
  const list = <FlatList data={Array.from({ length: 100 }, (_, i) => ({ id: i, title: `Item ${i}` }))} />;
  // Simulate render
});

const results = performanceTest.runAllTests();
console.log('Performance test results:', results);
```

This comprehensive performance optimization guide covers all the essential techniques for optimizing React Native apps with NativeWind. The key is to profile first, optimize bottlenecks, and maintain good performance practices throughout development.
