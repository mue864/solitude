# React Hooks Part 5: Performance Hooks

## Table of Contents

1. [React.memo - Memoized Components](#reactmemo---memoized-components)
2. [useTransition - Non-Urgent Updates](#usetransition---non-urgent-updates)
3. [useDeferredValue - Deferred Values](#usedeferredvalue---deferred-values)
4. [useMemo - Expensive Calculations](#usememo---expensive-calculations)
5. [useCallback - Memoized Functions](#usecallback---memoized-functions)
6. [Performance Monitoring Hooks](#performance-monitoring-hooks)
7. [Virtualization Patterns](#virtualization-patterns)
8. [Bundle Size Optimization](#bundle-size-optimization)
9. [Common Performance Pitfalls](#common-performance-pitfalls)

## React.memo - Memoized Components

`React.memo` is a higher-order component that memoizes your component, preventing unnecessary re-renders when props haven't changed.

### Basic Syntax

```typescript
const MemoizedComponent = React.memo(Component, arePropsEqual?);
```

### Simple Memoized Component

```typescript
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

// Regular component that re-renders on every parent update
const RegularChild = ({ count, onIncrement }: { count: number; onIncrement: () => void }) => {
  console.log('RegularChild rendered'); // This logs on every parent update

  return (
    <View>
      <Text>Count: {count}</Text>
      <TouchableOpacity onPress={onIncrement}>
        <Text>Increment</Text>
      </TouchableOpacity>
    </View>
  );
};

// Memoized component that only re-renders when props change
const MemoizedChild = React.memo(({ count, onIncrement }: { count: number; onIncrement: () => void }) => {
  console.log('MemoizedChild rendered'); // This only logs when count or onIncrement changes

  return (
    <View>
      <Text>Count: {count}</Text>
      <TouchableOpacity onPress={onIncrement}>
        <Text>Increment</Text>
      </TouchableOpacity>
    </View>
  );
});

// Parent component
const ParentComponent = () => {
  const [count, setCount] = useState(0);
  const [otherState, setOtherState] = useState('');

  const handleIncrement = useCallback(() => {
    setCount(prev => prev + 1);
  }, []);

  return (
    <View>
      <Text>Parent State: {otherState}</Text>

      {/* This will re-render when otherState changes */}
      <RegularChild count={count} onIncrement={handleIncrement} />

      {/* This will NOT re-render when otherState changes */}
      <MemoizedChild count={count} onIncrement={handleIncrement} />

      <TouchableOpacity onPress={() => setOtherState('Updated')}>
        <Text>Update Other State</Text>
      </TouchableOpacity>
    </View>
  );
};
```

### Custom Comparison Function

```typescript
import React from 'react';
import { View, Text } from 'react-native';

interface UserProps {
  user: {
    id: number;
    name: string;
    email: string;
  };
  onUserClick: (userId: number) => void;
}

const UserCard = React.memo<UserProps>(
  ({ user, onUserClick }) => {
    console.log(`UserCard ${user.id} rendered`);

    return (
      <View style={{ padding: 10, borderWidth: 1, margin: 5 }}>
        <Text>Name: {user.name}</Text>
        <Text>Email: {user.email}</Text>
        <TouchableOpacity onPress={() => onUserClick(user.id)}>
          <Text>View Details</Text>
        </TouchableOpacity>
      </View>
    );
  },
  // Custom comparison function
  (prevProps, nextProps) => {
    // Only re-render if user ID or name changed
    return (
      prevProps.user.id === nextProps.user.id &&
      prevProps.user.name === nextProps.user.name
    );
  }
);

// Usage
const UserList = () => {
  const [users, setUsers] = useState([
    { id: 1, name: 'John', email: 'john@example.com' },
    { id: 2, name: 'Jane', email: 'jane@example.com' },
    { id: 3, name: 'Bob', email: 'bob@example.com' },
  ]);

  const handleUserClick = useCallback((userId: number) => {
    console.log(`User ${userId} clicked`);
  }, []);

  const updateUserEmail = (userId: number, newEmail: string) => {
    setUsers(prev =>
      prev.map(user =>
        user.id === userId ? { ...user, email: newEmail } : user
      )
    );
  };

  return (
    <View>
      {users.map(user => (
        <UserCard
          key={user.id}
          user={user}
          onUserClick={handleUserClick}
        />
      ))}

      <TouchableOpacity onPress={() => updateUserEmail(1, 'john.updated@example.com')}>
        <Text>Update John's Email</Text>
      </TouchableOpacity>
    </View>
  );
};
```

### Complex Object Props

```typescript
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface ComplexProps {
  config: {
    theme: 'light' | 'dark';
    fontSize: number;
    language: string;
  };
  data: {
    items: string[];
    total: number;
  };
  callbacks: {
    onThemeChange: (theme: 'light' | 'dark') => void;
    onFontSizeChange: (size: number) => void;
  };
}

const ComplexComponent = React.memo<ComplexProps>(
  ({ config, data, callbacks }) => {
    console.log('ComplexComponent rendered');

    return (
      <View>
        <Text>Theme: {config.theme}</Text>
        <Text>Font Size: {config.fontSize}</Text>
        <Text>Language: {config.language}</Text>
        <Text>Items: {data.items.length}</Text>
        <Text>Total: {data.total}</Text>

        <TouchableOpacity onPress={() => callbacks.onThemeChange('dark')}>
          <Text>Toggle Theme</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => callbacks.onFontSizeChange(config.fontSize + 2)}>
          <Text>Increase Font Size</Text>
        </TouchableOpacity>
      </View>
    );
  },
  (prevProps, nextProps) => {
    // Deep comparison for complex objects
    const configEqual =
      prevProps.config.theme === nextProps.config.theme &&
      prevProps.config.fontSize === nextProps.config.fontSize &&
      prevProps.config.language === nextProps.config.language;

    const dataEqual =
      prevProps.data.items.length === nextProps.data.items.length &&
      prevProps.data.total === nextProps.data.total;

    return configEqual && dataEqual;
  }
);
```

## useTransition - Non-Urgent Updates

`useTransition` lets you mark some state updates as non-urgent, allowing other updates to interrupt them.

### Basic Syntax

```typescript
const [isPending, startTransition] = useTransition();
```

### Search with Transitions

```typescript
import React, { useState, useTransition, useMemo } from 'react';
import { View, Text, TextInput, FlatList } from 'react-native';

const SearchWithTransition = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  // Expensive search function
  const performSearch = (searchQuery: string): string[] => {
    // Simulate expensive operation
    const items = Array.from({ length: 100000 }, (_, i) => `Item ${i}`);
    return items.filter(item =>
      item.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleSearch = (newQuery: string) => {
    // Immediate update for UI responsiveness
    setQuery(newQuery);

    // Non-urgent search operation
    startTransition(() => {
      const searchResults = performSearch(newQuery);
      setResults(searchResults);
    });
  };

  return (
    <View>
      <TextInput
        value={query}
        onChangeText={handleSearch}
        placeholder="Search..."
        style={{ borderWidth: 1, padding: 10 }}
      />

      {isPending && <Text>Searching...</Text>}

      <Text>Query: {query}</Text>
      <Text>Results: {results.length}</Text>

      <FlatList
        data={results.slice(0, 100)}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <Text>{item}</Text>
        )}
      />
    </View>
  );
};
```

### Tab Navigation with Transitions

```typescript
import React, { useState, useTransition } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const TabNavigation = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [tabContent, setTabContent] = useState<any>(null);
  const [isPending, startTransition] = useTransition();

  const loadTabContent = (tab: string) => {
    // Simulate loading content
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(`Content for ${tab} tab`);
      }, 1000);
    });
  };

  const handleTabChange = (tab: string) => {
    // Immediate UI update
    setActiveTab(tab);

    // Non-urgent content loading
    startTransition(async () => {
      const content = await loadTabContent(tab);
      setTabContent(content);
    });
  };

  return (
    <View>
      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        {['home', 'profile', 'settings'].map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => handleTabChange(tab)}
            style={{
              padding: 10,
              backgroundColor: activeTab === tab ? '#007AFF' : '#f0f0f0',
              marginRight: 5,
            }}
          >
            <Text style={{ color: activeTab === tab ? 'white' : 'black' }}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isPending && <Text>Loading content...</Text>}

      <View style={{ padding: 20 }}>
        <Text>Active Tab: {activeTab}</Text>
        <Text>Content: {tabContent}</Text>
      </View>
    </View>
  );
};
```

## useDeferredValue - Deferred Values

`useDeferredValue` accepts a value and returns a new copy that will defer to more urgent updates.

### Basic Syntax

```typescript
const deferredValue = useDeferredValue(value);
```

### Expensive List Rendering

```typescript
import React, { useState, useDeferredValue, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';

const ExpensiveList = () => {
  const [filter, setFilter] = useState('all');
  const deferredFilter = useDeferredValue(filter);

  // Expensive filtering operation
  const filteredItems = useMemo(() => {
    console.log('Filtering with:', deferredFilter);

    const items = Array.from({ length: 50000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      category: i % 3 === 0 ? 'A' : i % 3 === 1 ? 'B' : 'C',
    }));

    switch (deferredFilter) {
      case 'A':
        return items.filter(item => item.category === 'A');
      case 'B':
        return items.filter(item => item.category === 'B');
      case 'C':
        return items.filter(item => item.category === 'C');
      default:
        return items;
    }
  }, [deferredFilter]);

  return (
    <View>
      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        {['all', 'A', 'B', 'C'].map(category => (
          <TouchableOpacity
            key={category}
            onPress={() => setFilter(category)}
            style={{
              padding: 10,
              backgroundColor: filter === category ? '#007AFF' : '#f0f0f0',
              marginRight: 5,
            }}
          >
            <Text style={{ color: filter === category ? 'white' : 'black' }}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text>Filter: {filter}</Text>
      <Text>Deferred Filter: {deferredFilter}</Text>
      <Text>Items: {filteredItems.length}</Text>

      <FlatList
        data={filteredItems.slice(0, 100)}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Text>{item.name} ({item.category})</Text>
        )}
      />
    </View>
  );
};
```

### Search with Deferred Value

```typescript
import React, { useState, useDeferredValue, useMemo } from 'react';
import { View, Text, TextInput, FlatList } from 'react-native';

const SearchWithDeferredValue = () => {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  // Expensive search operation
  const searchResults = useMemo(() => {
    console.log('Searching for:', deferredQuery);

    const items = Array.from({ length: 100000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      description: `Description for item ${i}`,
    }));

    if (!deferredQuery.trim()) return items;

    return items.filter(item =>
      item.name.toLowerCase().includes(deferredQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(deferredQuery.toLowerCase())
    );
  }, [deferredQuery]);

  return (
    <View>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search items..."
        style={{ borderWidth: 1, padding: 10 }}
      />

      <Text>Query: {query}</Text>
      <Text>Deferred Query: {deferredQuery}</Text>
      <Text>Results: {searchResults.length}</Text>

      <FlatList
        data={searchResults.slice(0, 50)}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ padding: 10, borderBottomWidth: 1 }}>
            <Text>{item.name}</Text>
            <Text style={{ color: 'gray' }}>{item.description}</Text>
          </View>
        )}
      />
    </View>
  );
};
```

## useMemo - Expensive Calculations

`useMemo` memoizes the result of expensive calculations, only recomputing when dependencies change.

### Basic Syntax

```typescript
const memoizedValue = useMemo(() => {
  // Expensive calculation
  return computedValue;
}, [dependencies]);
```

### Complex Data Processing

```typescript
import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const DataProcessor = () => {
  const [data, setData] = useState<number[]>([]);
  const [filter, setFilter] = useState<'all' | 'even' | 'odd' | 'prime'>('all');

  // Generate large dataset
  const generateData = () => {
    const newData = Array.from({ length: 10000 }, (_, i) => i);
    setData(newData);
  };

  // Expensive data processing
  const processedData = useMemo(() => {
    console.log('Processing data with filter:', filter);

    let filteredData = data;

    switch (filter) {
      case 'even':
        filteredData = data.filter(num => num % 2 === 0);
        break;
      case 'odd':
        filteredData = data.filter(num => num % 2 === 1);
        break;
      case 'prime':
        filteredData = data.filter(num => {
          if (num < 2) return false;
          for (let i = 2; i <= Math.sqrt(num); i++) {
            if (num % i === 0) return false;
          }
          return true;
        });
        break;
    }

    // Additional expensive processing
    const sortedData = filteredData.sort((a, b) => a - b);
    const statistics = {
      count: sortedData.length,
      sum: sortedData.reduce((sum, num) => sum + num, 0),
      average: sortedData.length > 0 ? sortedData.reduce((sum, num) => sum + num, 0) / sortedData.length : 0,
      min: sortedData.length > 0 ? sortedData[0] : 0,
      max: sortedData.length > 0 ? sortedData[sortedData.length - 1] : 0,
    };

    return {
      data: sortedData,
      statistics,
    };
  }, [data, filter]);

  return (
    <View>
      <TouchableOpacity onPress={generateData}>
        <Text>Generate Data</Text>
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', marginVertical: 10 }}>
        {(['all', 'even', 'odd', 'prime'] as const).map(f => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={{
              padding: 10,
              backgroundColor: filter === f ? '#007AFF' : '#f0f0f0',
              marginRight: 5,
            }}
          >
            <Text style={{ color: filter === f ? 'white' : 'black' }}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text>Filter: {filter}</Text>
      <Text>Count: {processedData.statistics.count}</Text>
      <Text>Sum: {processedData.statistics.sum}</Text>
      <Text>Average: {processedData.statistics.average.toFixed(2)}</Text>
      <Text>Min: {processedData.statistics.min}</Text>
      <Text>Max: {processedData.statistics.max}</Text>
    </View>
  );
};
```

## useCallback - Memoized Functions

`useCallback` returns a memoized version of the callback that only changes if one of the dependencies has changed.

### Basic Syntax

```typescript
const memoizedCallback = useCallback(() => {
  // Function logic
}, [dependencies]);
```

### Optimized Child Components

```typescript
import React, { useState, useCallback, memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

// Memoized child component
const ExpensiveChild = memo(({
  data,
  onUpdate,
  onDelete
}: {
  data: { id: number; name: string; value: number };
  onUpdate: (id: number, value: number) => void;
  onDelete: (id: number) => void;
}) => {
  console.log(`ExpensiveChild ${data.id} rendered`);

  return (
    <View style={{ padding: 10, borderWidth: 1, margin: 5 }}>
      <Text>ID: {data.id}</Text>
      <Text>Name: {data.name}</Text>
      <Text>Value: {data.value}</Text>

      <TouchableOpacity onPress={() => onUpdate(data.id, data.value + 1)}>
        <Text>Increment</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => onDelete(data.id)}>
        <Text style={{ color: 'red' }}>Delete</Text>
      </TouchableOpacity>
    </View>
  );
});

const ParentWithOptimizedChildren = () => {
  const [items, setItems] = useState([
    { id: 1, name: 'Item 1', value: 0 },
    { id: 2, name: 'Item 2', value: 0 },
    { id: 3, name: 'Item 3', value: 0 },
  ]);
  const [otherState, setOtherState] = useState('');

  // Memoized callbacks
  const handleUpdate = useCallback((id: number, value: number) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, value } : item
      )
    );
  }, []);

  const handleDelete = useCallback((id: number) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  return (
    <View>
      <Text>Other State: {otherState}</Text>

      {items.map(item => (
        <ExpensiveChild
          key={item.id}
          data={item}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      ))}

      <TouchableOpacity onPress={() => setOtherState('Updated')}>
        <Text>Update Other State</Text>
      </TouchableOpacity>
    </View>
  );
};
```

## Performance Monitoring Hooks

### Custom Performance Hook

```typescript
import { useEffect, useRef } from 'react';

const usePerformanceMonitor = (componentName: string) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    lastRenderTime.current = now;

    console.log(`${componentName}: Render #${renderCount.current} (${timeSinceLastRender}ms)`);
  });
};

// Usage
const MonitoredComponent = () => {
  usePerformanceMonitor('MonitoredComponent');

  return <Text>This component is being monitored</Text>;
};
```

### Render Time Measurement

```typescript
import { useEffect, useRef } from 'react';

const useRenderTime = (componentName: string) => {
  const startTime = useRef(performance.now());

  useEffect(() => {
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;

    console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms`);

    startTime.current = performance.now();
  });
};

// Usage
const TimedComponent = () => {
  useRenderTime('TimedComponent');

  return <Text>This component's render time is being measured</Text>;
};
```

## Virtualization Patterns

### Custom Virtualization Hook

```typescript
import { useState, useMemo } from 'react';

interface VirtualizationConfig {
  itemHeight: number;
  containerHeight: number;
  totalItems: number;
  scrollTop: number;
}

const useVirtualization = (config: VirtualizationConfig) => {
  const { itemHeight, containerHeight, totalItems, scrollTop } = config;

  const virtualizedItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      totalItems
    );

    return {
      startIndex,
      endIndex,
      items: Array.from({ length: endIndex - startIndex }, (_, i) => ({
        index: startIndex + i,
        offsetTop: (startIndex + i) * itemHeight,
      })),
    };
  }, [itemHeight, containerHeight, totalItems, scrollTop]);

  return virtualizedItems;
};

// Usage
const VirtualizedList = () => {
  const [scrollTop, setScrollTop] = useState(0);
  const items = Array.from({ length: 10000 }, (_, i) => `Item ${i}`);

  const virtualized = useVirtualization({
    itemHeight: 50,
    containerHeight: 400,
    totalItems: items.length,
    scrollTop,
  });

  return (
    <ScrollView
      onScroll={(event) => setScrollTop(event.nativeEvent.contentOffset.y)}
      scrollEventThrottle={16}
    >
      <View style={{ height: items.length * 50 }}>
        {virtualized.items.map(({ index, offsetTop }) => (
          <View
            key={index}
            style={{
              position: 'absolute',
              top: offsetTop,
              height: 50,
              width: '100%',
              borderBottomWidth: 1,
              justifyContent: 'center',
              paddingHorizontal: 10,
            }}
          >
            <Text>{items[index]}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};
```

## Bundle Size Optimization

### Lazy Loading Hook

```typescript
import { useState, useEffect } from 'react';

const useLazyLoad = <T>(
  loader: () => Promise<T>,
  dependencies: any[] = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    loader()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, dependencies);

  return { data, loading, error };
};

// Usage
const LazyLoadedComponent = () => {
  const { data: heavyData, loading, error } = useLazyLoad(
    () => import('./HeavyComponent'),
    []
  );

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;
  if (!data) return <Text>No data</Text>;

  return <data.default />;
};
```

## Common Performance Pitfalls

### 1. Unnecessary Re-renders

```typescript
// ❌ Bad: Creating new object on every render
const Component = () => {
  const [count, setCount] = useState(0);

  const config = { theme: 'dark', fontSize: 14 }; // New object every render

  return <ChildComponent config={config} />;
};

// ✅ Good: Memoized object
const Component = () => {
  const [count, setCount] = useState(0);

  const config = useMemo(() => ({ theme: 'dark', fontSize: 14 }), []);

  return <ChildComponent config={config} />;
};
```

### 2. Missing Dependencies

```typescript
// ❌ Bad: Missing dependencies
const Component = () => {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {
    console.log(count); // Uses count but not in dependencies
  }, []); // Missing count dependency

  return <button onClick={handleClick}>Click</button>;
};

// ✅ Good: Include all dependencies
const Component = () => {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {
    console.log(count);
  }, [count]); // Include count in dependencies

  return <button onClick={handleClick}>Click</button>;
};
```

### 3. Over-optimization

```typescript
// ❌ Bad: Unnecessary memoization
const Component = () => {
  const [count, setCount] = useState(0);

  const simpleValue = useMemo(() => count * 2, [count]); // Unnecessary

  return <div>{simpleValue}</div>;
};

// ✅ Good: Simple calculations don't need memoization
const Component = () => {
  const [count, setCount] = useState(0);

  const simpleValue = count * 2; // Direct calculation

  return <div>{simpleValue}</div>;
};
```

### 4. Memory Leaks

```typescript
// ❌ Bad: Not cleaning up subscriptions
const Component = () => {
  useEffect(() => {
    const subscription = someAPI.subscribe();
    // Missing cleanup
  }, []);

  return <div>Component</div>;
};

// ✅ Good: Proper cleanup
const Component = () => {
  useEffect(() => {
    const subscription = someAPI.subscribe();

    return () => {
      subscription.unsubscribe(); // Cleanup
    };
  }, []);

  return <div>Component</div>;
};
```

This comprehensive guide covers React performance optimization patterns with detailed explanations, practical examples, and best practices. Each concept is thoroughly commented to help you understand when and how to use these performance hooks effectively.
