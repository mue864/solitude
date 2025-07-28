# React Native FlatList Comprehensive Guide - Part 2: Performance & Advanced Rendering

## Table of Contents

1. [Performance Optimization](#performance-optimization)
2. [Virtualization and Memory Management](#virtualization-and-memory-management)
3. [Advanced Rendering Techniques](#advanced-rendering-techniques)
4. [Optimization Props](#optimization-props)
5. [Memoization and Pure Components](#memoization-and-pure-components)
6. [Debugging Performance Issues](#debugging-performance-issues)

## Performance Optimization

### Why Performance Matters

FlatList is designed for performance, but poor implementation can still cause issues:

- **Memory leaks** from unmounted components
- **Re-renders** causing janky scrolling
- **Large datasets** overwhelming the device
- **Complex item components** slowing down rendering

### Performance Best Practices

```javascript
// ❌ Bad: Inline functions cause re-renders
<FlatList
  data={data}
  renderItem={({ item }) => (
    <View>
      <Text>{item.title}</Text>
    </View>
  )}
  keyExtractor={(item, index) => item.id}
/>;

// ✅ Good: Memoized functions
const renderItem = useCallback(
  ({ item }) => (
    <View>
      <Text>{item.title}</Text>
    </View>
  ),
  []
);

const keyExtractor = useCallback((item) => item.id, []);

<FlatList data={data} renderItem={renderItem} keyExtractor={keyExtractor} />;
```

## Virtualization and Memory Management

### How Virtualization Works

FlatList only renders items that are currently visible on screen, plus a small buffer above and below.

```javascript
// Understanding the render window
<FlatList
  data={data}
  renderItem={renderItem}
  keyExtractor={keyExtractor}
  // Performance props
  removeClippedSubviews={true} // Remove off-screen items
  maxToRenderPerBatch={10} // Items to render per batch
  windowSize={10} // Render window size
  updateCellsBatchingPeriod={50} // Batch update period
  initialNumToRender={10} // Initial items to render
  onEndReachedThreshold={0.5} // When to trigger onEndReached
/>
```

### Memory Management Strategies

```javascript
// 1. Remove clipped subviews
<FlatList
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={10}
/>;

// 2. Optimize item height
const getItemLayout = (data, index) => ({
  length: 80, // Fixed height for each item
  offset: 80 * index,
  index,
});

<FlatList
  getItemLayout={getItemLayout}
  // ... other props
/>;

// 3. Use PureComponent or React.memo
const ItemComponent = React.memo(({ item, onPress }) => (
  <TouchableOpacity onPress={() => onPress(item)}>
    <Text>{item.title}</Text>
  </TouchableOpacity>
));
```

### Advanced Virtualization

```javascript
// Custom virtualization for complex layouts
const VirtualizedFlatList = () => {
  const [visibleItems, setVisibleItems] = useState([]);

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    setVisibleItems(viewableItems.map((item) => item.key));
  }, []);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 100,
  };

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      removeClippedSubviews={true}
      maxToRenderPerBatch={5}
      windowSize={5}
    />
  );
};
```

## Advanced Rendering Techniques

### Conditional Rendering Optimization

```javascript
// Optimized conditional rendering
const renderItem = useCallback(
  ({ item, index }) => {
    // Early return for special items
    if (item.type === "separator") {
      return <SeparatorComponent />;
    }

    if (item.type === "header") {
      return <HeaderComponent title={item.title} />;
    }

    // Main item rendering
    return (
      <ItemComponent
        item={item}
        index={index}
        onPress={handleItemPress}
        onLongPress={handleItemLongPress}
      />
    );
  },
  [handleItemPress, handleItemLongPress]
);

// Memoized item component
const ItemComponent = React.memo(({ item, index, onPress, onLongPress }) => {
  const isSelected = useMemo(
    () => selectedItems.includes(item.id),
    [selectedItems, item.id]
  );

  return (
    <TouchableOpacity
      style={[styles.item, isSelected && styles.selectedItem]}
      onPress={() => onPress(item)}
      onLongPress={() => onLongPress(item)}
    >
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.subtitle}>{item.subtitle}</Text>
    </TouchableOpacity>
  );
});
```

### Dynamic Item Heights

```javascript
// For items with variable heights
const VariableHeightFlatList = () => {
  const [itemHeights, setItemHeights] = useState({});

  const onLayout = useCallback((event, index) => {
    const { height } = event.nativeEvent.layout;
    setItemHeights((prev) => ({
      ...prev,
      [index]: height,
    }));
  }, []);

  const renderItem = useCallback(
    ({ item, index }) => (
      <View onLayout={(event) => onLayout(event, index)}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    ),
    [onLayout]
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      removeClippedSubviews={true}
      maxToRenderPerBatch={5}
      windowSize={5}
    />
  );
};
```

### Optimized Image Loading

```javascript
// Optimized image list
const ImageFlatList = () => {
  const renderItem = useCallback(
    ({ item, index }) => (
      <ImageItem
        uri={item.imageUrl}
        title={item.title}
        index={index}
        onLoad={() => console.log(`Image ${index} loaded`)}
        onError={() => console.log(`Image ${index} failed to load`)}
      />
    ),
    []
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      removeClippedSubviews={true}
      maxToRenderPerBatch={3}
      windowSize={5}
      initialNumToRender={5}
    />
  );
};

const ImageItem = React.memo(({ uri, title, index, onLoad, onError }) => (
  <View style={styles.imageItem}>
    <Image
      source={{ uri }}
      style={styles.image}
      onLoad={onLoad}
      onError={onError}
      resizeMode="cover"
    />
    <Text style={styles.title}>{title}</Text>
  </View>
));
```

## Optimization Props

### Performance Props Explained

```javascript
<FlatList
  data={data}
  renderItem={renderItem}
  keyExtractor={keyExtractor}
  // Rendering control
  initialNumToRender={10} // Initial items to render
  maxToRenderPerBatch={10} // Items per render batch
  windowSize={10} // Render window (5 = 2.5 screens)
  updateCellsBatchingPeriod={50} // Batch update period (ms)
  // Memory management
  removeClippedSubviews={true} // Remove off-screen items
  disableVirtualization={false} // Disable virtualization (not recommended)
  // Scrolling optimization
  scrollEventThrottle={16} // Scroll event frequency (ms)
  onEndReachedThreshold={0.5} // Trigger onEndReached at 50% from end
  // Layout optimization
  getItemLayout={getItemLayout} // Pre-calculate item layout
  maintainVisibleContentPosition={{
    // Maintain scroll position
    minIndexForVisible: 0,
    autoscrollToTopThreshold: 10,
  }}
/>
```

### Advanced Performance Props

```javascript
// Custom item layout for fixed heights
const getItemLayout = (data, index) => ({
  length: 80, // Fixed height
  offset: 80 * index,
  index,
});

// Maintain scroll position during updates
const maintainScrollPosition = {
  minIndexForVisible: 0,
  autoscrollToTopThreshold: 10,
};

// Custom scroll event handling
const onScroll = useCallback((event) => {
  const offsetY = event.nativeEvent.contentOffset.y;
  // Handle scroll events efficiently
}, []);

<FlatList
  data={data}
  renderItem={renderItem}
  keyExtractor={keyExtractor}
  getItemLayout={getItemLayout}
  maintainVisibleContentPosition={maintainScrollPosition}
  onScroll={onScroll}
  scrollEventThrottle={16}
/>;
```

## Memoization and Pure Components

### React.memo for Item Components

```javascript
// Memoized item component
const TaskItem = React.memo(
  ({ item, onToggle, onDelete, isSelected }) => {
    const handleToggle = useCallback(() => {
      onToggle(item.id);
    }, [onToggle, item.id]);

    const handleDelete = useCallback(() => {
      onDelete(item.id);
    }, [onDelete, item.id]);

    return (
      <View style={[styles.taskItem, isSelected && styles.selectedTask]}>
        <TouchableOpacity onPress={handleToggle}>
          <Text>{item.completed ? "✓" : "○"}</Text>
        </TouchableOpacity>
        <Text style={[styles.title, item.completed && styles.completedText]}>
          {item.title}
        </Text>
        <TouchableOpacity onPress={handleDelete}>
          <Text>×</Text>
        </TouchableOpacity>
      </View>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function
    return (
      prevProps.item.id === nextProps.item.id &&
      prevProps.item.completed === nextProps.item.completed &&
      prevProps.isSelected === nextProps.isSelected
    );
  }
);
```

### useCallback for Event Handlers

```javascript
const OptimizedFlatList = () => {
  const [selectedItems, setSelectedItems] = useState([]);

  // Memoized event handlers
  const handleItemPress = useCallback((itemId) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  }, []);

  const handleItemToggle = useCallback((itemId) => {
    // Toggle item completion
  }, []);

  const handleItemDelete = useCallback((itemId) => {
    // Delete item
  }, []);

  const renderItem = useCallback(
    ({ item }) => (
      <TaskItem
        item={item}
        onPress={handleItemPress}
        onToggle={handleItemToggle}
        onDelete={handleItemDelete}
        isSelected={selectedItems.includes(item.id)}
      />
    ),
    [handleItemPress, handleItemToggle, handleItemDelete, selectedItems]
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
    />
  );
};
```

### useMemo for Computed Values

```javascript
const ComplexFlatList = () => {
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  // Memoized filtered and sorted data
  const processedData = useMemo(() => {
    let filtered = data;

    // Apply filter
    if (filter !== "all") {
      filtered = data.filter((item) => item.category === filter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "date") {
        return new Date(b.date) - new Date(a.date);
      }
      return 0;
    });

    return filtered;
  }, [data, filter, sortBy]);

  const renderItem = useCallback(
    ({ item }) => <ItemComponent item={item} />,
    []
  );

  return (
    <FlatList
      data={processedData}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
    />
  );
};
```

## Debugging Performance Issues

### Performance Monitoring

```javascript
// Performance monitoring component
const PerformanceFlatList = () => {
  const [renderCount, setRenderCount] = useState(0);
  const [scrollPerformance, setScrollPerformance] = useState([]);

  const onScroll = useCallback((event) => {
    const startTime = performance.now();

    // Your scroll logic here

    const endTime = performance.now();
    setScrollPerformance((prev) => [...prev.slice(-10), endTime - startTime]);
  }, []);

  const renderItem = useCallback(
    ({ item, index }) => {
      setRenderCount((prev) => prev + 1);

      return (
        <View style={styles.item}>
          <Text>{item.title}</Text>
          <Text style={styles.debug}>Render #{renderCount}</Text>
        </View>
      );
    },
    [renderCount]
  );

  return (
    <View style={styles.container}>
      <View style={styles.debugPanel}>
        <Text>Total Renders: {renderCount}</Text>
        <Text>
          Avg Scroll Time:{" "}
          {scrollPerformance.length > 0
            ? (
                scrollPerformance.reduce((a, b) => a + b, 0) /
                scrollPerformance.length
              ).toFixed(2)
            : 0}
          ms
        </Text>
      </View>

      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onScroll={onScroll}
        scrollEventThrottle={16}
      />
    </View>
  );
};
```

### Common Performance Issues

```javascript
// ❌ Issue 1: Inline functions causing re-renders
<FlatList
  renderItem={({ item }) => <Item data={item} />} // Recreated every render
/>

// ✅ Solution 1: Memoized render function
const renderItem = useCallback(({ item }) => <Item data={item} />, []);

// ❌ Issue 2: Complex calculations in render
const renderItem = ({ item }) => {
  const expensiveValue = expensiveCalculation(item); // Runs every render
  return <Item value={expensiveValue} />;
};

// ✅ Solution 2: Memoized calculations
const renderItem = useCallback(({ item }) => {
  const expensiveValue = useMemo(() => expensiveCalculation(item), [item.id]);
  return <Item value={expensiveValue} />;
}, []);

// ❌ Issue 3: Large datasets without virtualization
<FlatList data={largeDataset} /> // Renders all items

// ✅ Solution 3: Proper virtualization
<FlatList
  data={largeDataset}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={10}
  initialNumToRender={10}
/>
```

### Performance Testing

```javascript
// Performance testing utility
const PerformanceTest = () => {
  const [testResults, setTestResults] = useState({});

  const runPerformanceTest = useCallback(() => {
    const startTime = performance.now();

    // Simulate heavy operation
    const heavyData = Array.from({ length: 1000 }, (_, i) => ({
      id: i.toString(),
      title: `Item ${i}`,
      description: `Description for item ${i}`,
    }));

    const endTime = performance.now();

    setTestResults({
      dataSize: heavyData.length,
      renderTime: endTime - startTime,
      memoryUsage: performance.memory?.usedJSHeapSize || "N/A",
    });
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={runPerformanceTest}>
        <Text>Run Performance Test</Text>
      </TouchableOpacity>

      <Text>Data Size: {testResults.dataSize || 0}</Text>
      <Text>Render Time: {testResults.renderTime?.toFixed(2) || 0}ms</Text>
      <Text>Memory Usage: {testResults.memoryUsage || "N/A"}</Text>
    </View>
  );
};
```

This Part 2 covers advanced performance optimization techniques for FlatList. In the next parts, we'll cover:

- **Part 3**: Pull-to-refresh, infinite scrolling, and loading states
- **Part 4**: Section lists, headers, footers, and complex layouts
- **Part 5**: Animations, gestures, and interactive features
- **Part 6**: Real-world examples and best practices

Would you like me to continue with Part 3?
