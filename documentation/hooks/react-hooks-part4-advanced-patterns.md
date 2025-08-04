# React Hooks Part 4: Advanced Patterns

## Table of Contents

1. [useLayoutEffect - Synchronous Effects](#uselayouteffect---synchronous-effects)
2. [useImperativeHandle - Imperative Methods](#useimperativehandle---imperative-methods)
3. [useDebugValue - Debug Information](#usedebugvalue---debug-information)
4. [useId - Unique Identifiers](#useid---unique-identifiers)
5. [useTransition - Concurrent Features](#usetransition---concurrent-features)
6. [useDeferredValue - Deferred Updates](#usedeferredvalue---deferred-updates)
7. [Advanced Performance Patterns](#advanced-performance-patterns)
8. [Common Pitfalls](#common-pitfalls)

## useLayoutEffect - Synchronous Effects

`useLayoutEffect` is identical to `useEffect`, but it fires synchronously after all DOM mutations. This is useful for measurements and DOM manipulations that need to happen before the browser repaints.

### When to Use useLayoutEffect

- **DOM Measurements**: When you need to measure elements immediately after DOM changes
- **DOM Manipulations**: When you need to make DOM changes before the browser repaints
- **Preventing Flicker**: When you need to prevent visual flicker or layout shifts

### Basic Syntax

```typescript
useLayoutEffect(() => {
  // Synchronous effect code
  return () => {
    // Cleanup code
  };
}, [dependencies]);
```

### DOM Measurement Example

```typescript
import React, { useState, useLayoutEffect, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const MeasurableComponent = () => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const elementRef = useRef<View>(null);

  // This effect runs synchronously after DOM mutations
  useLayoutEffect(() => {
    if (elementRef.current) {
      // Measure the element immediately after it's rendered
      elementRef.current.measure((x, y, width, height, pageX, pageY) => {
        setDimensions({ width, height });
      });
    }
  }, []); // Empty dependency array = run only once after mount

  return (
    <View>
      <View
        ref={elementRef}
        style={{
          width: 200,
          height: 100,
          backgroundColor: 'lightblue',
          margin: 10,
        }}
      >
        <Text>Measurable Element</Text>
      </View>

      <Text>Width: {dimensions.width}</Text>
      <Text>Height: {dimensions.height}</Text>
    </View>
  );
};
```

### Preventing Flicker Example

```typescript
import React, { useState, useLayoutEffect, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const FlickerPrevention = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const elementRef = useRef<View>(null);

  // This prevents flicker by calculating position before render
  useLayoutEffect(() => {
    if (isVisible && elementRef.current) {
      // Calculate position synchronously to prevent flicker
      elementRef.current.measure((x, y, width, height, pageX, pageY) => {
        setPosition({ x: pageX, y: pageY });
      });
    }
  }, [isVisible]);

  return (
    <View>
      <TouchableOpacity onPress={() => setIsVisible(!isVisible)}>
        <Text>Toggle Element</Text>
      </TouchableOpacity>

      {isVisible && (
        <View
          ref={elementRef}
          style={{
            position: 'absolute',
            left: position.x,
            top: position.y,
            width: 100,
            height: 50,
            backgroundColor: 'red',
          }}
        >
          <Text>Positioned Element</Text>
        </View>
      )}
    </View>
  );
};
```

### Scroll Position Synchronization

```typescript
import React, { useState, useLayoutEffect, useRef } from 'react';
import { ScrollView, View, Text } from 'react-native';

const ScrollSync = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  // Synchronously update scroll position to prevent visual lag
  useLayoutEffect(() => {
    if (scrollViewRef.current) {
      // This runs before the browser repaints, preventing visual lag
      scrollViewRef.current.scrollTo({ y: scrollPosition, animated: false });
    }
  }, [scrollPosition]);

  return (
    <ScrollView
      ref={scrollViewRef}
      onScroll={(event) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        setScrollPosition(offsetY);
      }}
      scrollEventThrottle={16} // 60fps
    >
      {Array.from({ length: 50 }, (_, i) => (
        <View key={i} style={{ height: 100, backgroundColor: i % 2 ? '#f0f0f0' : '#ffffff' }}>
          <Text>Item {i + 1}</Text>
        </View>
      ))}
    </ScrollView>
  );
};
```

## useImperativeHandle - Imperative Methods

`useImperativeHandle` customizes the instance value that is exposed when using `React.forwardRef`. This is useful for exposing specific methods to parent components.

### Basic Syntax

```typescript
useImperativeHandle(
  ref,
  () => ({
    // Methods to expose
  }),
  [dependencies]
);
```

### Custom Input Component

```typescript
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { TextInput, View, Text, TouchableOpacity } from 'react-native';

// Define the interface for the ref
interface CustomInputRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  getValue: () => string;
  setValue: (value: string) => void;
}

// Define the props interface
interface CustomInputProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
}

const CustomInput = forwardRef<CustomInputRef, CustomInputProps>(
  ({ placeholder, value, onChangeText }, ref) => {
    const inputRef = useRef<TextInput>(null);
    const [internalValue, setInternalValue] = useState(value || '');

    // Expose specific methods to parent component
    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current?.focus();
      },
      blur: () => {
        inputRef.current?.blur();
      },
      clear: () => {
        setInternalValue('');
        onChangeText?.('');
      },
      getValue: () => internalValue,
      setValue: (newValue: string) => {
        setInternalValue(newValue);
        onChangeText?.(newValue);
      },
    }), [internalValue, onChangeText]);

    return (
      <TextInput
        ref={inputRef}
        value={internalValue}
        onChangeText={(text) => {
          setInternalValue(text);
          onChangeText?.(text);
        }}
        placeholder={placeholder}
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 10,
          margin: 5,
        }}
      />
    );
  }
);

// Usage in parent component
const ParentComponent = () => {
  const inputRef = useRef<CustomInputRef>(null);

  const handleFocus = () => {
    inputRef.current?.focus();
  };

  const handleClear = () => {
    inputRef.current?.clear();
  };

  const handleGetValue = () => {
    const value = inputRef.current?.getValue();
    console.log('Current value:', value);
  };

  const handleSetValue = () => {
    inputRef.current?.setValue('New Value');
  };

  return (
    <View>
      <CustomInput
        ref={inputRef}
        placeholder="Enter text..."
        onChangeText={(text) => console.log('Text changed:', text)}
      />

      <TouchableOpacity onPress={handleFocus}>
        <Text>Focus Input</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleClear}>
        <Text>Clear Input</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleGetValue}>
        <Text>Get Value</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleSetValue}>
        <Text>Set Value</Text>
      </TouchableOpacity>
    </View>
  );
};
```

### Modal with Imperative Handle

```typescript
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';

interface ModalRef {
  open: () => void;
  close: () => void;
  isOpen: () => boolean;
}

interface CustomModalProps {
  title: string;
  children: React.ReactNode;
}

const CustomModal = forwardRef<ModalRef, CustomModalProps>(
  ({ title, children }, ref) => {
    const [isVisible, setIsVisible] = useState(false);

    useImperativeHandle(ref, () => ({
      open: () => setIsVisible(true),
      close: () => setIsVisible(false),
      isOpen: () => isVisible,
    }), [isVisible]);

    return (
      <Modal
        visible={isVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsVisible(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}>
          <View style={{
            backgroundColor: 'white',
            padding: 20,
            borderRadius: 10,
            width: '80%',
          }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
              {title}
            </Text>

            {children}

            <TouchableOpacity
              onPress={() => setIsVisible(false)}
              style={{
                backgroundColor: '#007AFF',
                padding: 10,
                borderRadius: 5,
                marginTop: 10,
              }}
            >
              <Text style={{ color: 'white', textAlign: 'center' }}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }
);

// Usage
const App = () => {
  const modalRef = useRef<ModalRef>(null);

  const openModal = () => {
    modalRef.current?.open();
  };

  const closeModal = () => {
    modalRef.current?.close();
  };

  const checkModalStatus = () => {
    const isOpen = modalRef.current?.isOpen();
    console.log('Modal is open:', isOpen);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <TouchableOpacity onPress={openModal}>
        <Text>Open Modal</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={closeModal}>
        <Text>Close Modal</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={checkModalStatus}>
        <Text>Check Status</Text>
      </TouchableOpacity>

      <CustomModal ref={modalRef} title="Custom Modal">
        <Text>This is the modal content!</Text>
      </CustomModal>
    </View>
  );
};
```

## useDebugValue - Debug Information

`useDebugValue` can be used to display a label for custom hooks in React DevTools.

### Basic Syntax

```typescript
useDebugValue(value, formatFunction?);
```

### Custom Hook with Debug Value

```typescript
import { useState, useDebugValue } from 'react';

const useCounter = (initialValue = 0) => {
  const [count, setCount] = useState(initialValue);

  // This will show in React DevTools
  useDebugValue(count, (value) => `Counter: ${value}`);

  const increment = () => setCount(prev => prev + 1);
  const decrement = () => setCount(prev => prev - 1);
  const reset = () => setCount(initialValue);

  return { count, increment, decrement, reset };
};

// Usage
const CounterComponent = () => {
  const { count, increment, decrement, reset } = useCounter(5);

  return (
    <View>
      <Text>Count: {count}</Text>
      <TouchableOpacity onPress={increment}>
        <Text>Increment</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={decrement}>
        <Text>Decrement</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={reset}>
        <Text>Reset</Text>
      </TouchableOpacity>
    </View>
  );
};
```

### Complex Debug Value

```typescript
import { useState, useEffect, useDebugValue } from 'react';

const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Show status with emoji in DevTools
  useDebugValue(isOnline, (value) =>
    value ? '🟢 Online' : '🔴 Offline'
  );

  return isOnline;
};

// Usage
const NetworkStatus = () => {
  const isOnline = useOnlineStatus();

  return (
    <View>
      <Text>Status: {isOnline ? 'Online' : 'Offline'}</Text>
    </View>
  );
};
```

## useId - Unique Identifiers

`useId` generates a unique ID that is stable across the server and client, while avoiding hydration mismatches.

### Basic Syntax

```typescript
const id = useId();
```

### Form with Unique IDs

```typescript
import React, { useId } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

const FormWithIds = () => {
  const nameId = useId();
  const emailId = useId();
  const passwordId = useId();

  return (
    <View>
      <Text>Registration Form</Text>

      <View>
        <Text htmlFor={nameId}>Name:</Text>
        <TextInput
          id={nameId}
          placeholder="Enter your name"
          style={{ borderWidth: 1, padding: 10 }}
        />
      </View>

      <View>
        <Text htmlFor={emailId}>Email:</Text>
        <TextInput
          id={emailId}
          placeholder="Enter your email"
          keyboardType="email-address"
          style={{ borderWidth: 1, padding: 10 }}
        />
      </View>

      <View>
        <Text htmlFor={passwordId}>Password:</Text>
        <TextInput
          id={passwordId}
          placeholder="Enter your password"
          secureTextEntry
          style={{ borderWidth: 1, padding: 10 }}
        />
      </View>

      <TouchableOpacity>
        <Text>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};
```

### Custom Hook with useId

```typescript
import React, { useId, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const useUniqueCounter = (initialValue = 0) => {
  const id = useId();
  const [count, setCount] = useState(initialValue);

  const increment = () => setCount(prev => prev + 1);
  const decrement = () => setCount(prev => prev - 1);

  return {
    id,
    count,
    increment,
    decrement,
  };
};

const MultipleCounters = () => {
  const counter1 = useUniqueCounter(0);
  const counter2 = useUniqueCounter(10);
  const counter3 = useUniqueCounter(100);

  return (
    <View>
      <Text>Counter 1 (ID: {counter1.id}): {counter1.count}</Text>
      <TouchableOpacity onPress={counter1.increment}>
        <Text>Increment 1</Text>
      </TouchableOpacity>

      <Text>Counter 2 (ID: {counter2.id}): {counter2.count}</Text>
      <TouchableOpacity onPress={counter2.increment}>
        <Text>Increment 2</Text>
      </TouchableOpacity>

      <Text>Counter 3 (ID: {counter3.id}): {counter3.count}</Text>
      <TouchableOpacity onPress={counter3.increment}>
        <Text>Increment 3</Text>
      </TouchableOpacity>
    </View>
  );
};
```

## useTransition - Concurrent Features

`useTransition` lets you mark some state updates as non-urgent. Other state updates are considered urgent by default.

### Basic Syntax

```typescript
const [isPending, startTransition] = useTransition();
```

### Search with Transitions

```typescript
import React, { useState, useTransition } from 'react';
import { View, Text, TextInput, FlatList } from 'react-native';

const SearchWithTransition = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery); // This is urgent - update input immediately

    // This is non-urgent - can be interrupted
    startTransition(() => {
      // Simulate expensive search
      const searchResults = performExpensiveSearch(newQuery);
      setResults(searchResults);
    });
  };

  const performExpensiveSearch = (query: string): string[] => {
    // Simulate expensive operation
    const items = Array.from({ length: 10000 }, (_, i) => `Item ${i}`);
    return items.filter(item =>
      item.toLowerCase().includes(query.toLowerCase())
    );
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

      <FlatList
        data={results}
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
  const [isPending, startTransition] = useTransition();

  const handleTabChange = (tab: string) => {
    // Immediate UI update
    setActiveTab(tab);

    // Non-urgent content loading
    startTransition(() => {
      loadTabContent(tab);
    });
  };

  const loadTabContent = (tab: string) => {
    // Simulate loading content
    console.log(`Loading content for ${tab} tab`);
  };

  return (
    <View>
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity
          onPress={() => handleTabChange('home')}
          style={{
            padding: 10,
            backgroundColor: activeTab === 'home' ? '#007AFF' : '#f0f0f0',
          }}
        >
          <Text style={{ color: activeTab === 'home' ? 'white' : 'black' }}>
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleTabChange('profile')}
          style={{
            padding: 10,
            backgroundColor: activeTab === 'profile' ? '#007AFF' : '#f0f0f0',
          }}
        >
          <Text style={{ color: activeTab === 'profile' ? 'white' : 'black' }}>
            Profile
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleTabChange('settings')}
          style={{
            padding: 10,
            backgroundColor: activeTab === 'settings' ? '#007AFF' : '#f0f0f0',
          }}
        >
          <Text style={{ color: activeTab === 'settings' ? 'white' : 'black' }}>
            Settings
          </Text>
        </TouchableOpacity>
      </View>

      {isPending && <Text>Loading...</Text>}

      <View style={{ padding: 20 }}>
        <Text>Active Tab: {activeTab}</Text>
        <Text>Content for {activeTab} tab</Text>
      </View>
    </View>
  );
};
```

## useDeferredValue - Deferred Updates

`useDeferredValue` accepts a value and returns a new copy of it that will defer to more urgent updates.

### Basic Syntax

```typescript
const deferredValue = useDeferredValue(value);
```

### Search with Deferred Value

```typescript
import React, { useState, useDeferredValue, useMemo } from 'react';
import { View, Text, TextInput, FlatList } from 'react-native';

const SearchWithDeferredValue = () => {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  // Expensive computation based on deferred query
  const searchResults = useMemo(() => {
    return performExpensiveSearch(deferredQuery);
  }, [deferredQuery]);

  const performExpensiveSearch = (searchQuery: string): string[] => {
    // Simulate expensive search operation
    const items = Array.from({ length: 10000 }, (_, i) => `Item ${i}`);
    return items.filter(item =>
      item.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <View>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search..."
        style={{ borderWidth: 1, padding: 10 }}
      />

      <Text>Query: {query}</Text>
      <Text>Deferred Query: {deferredQuery}</Text>
      <Text>Results: {searchResults.length}</Text>

      <FlatList
        data={searchResults.slice(0, 100)} // Limit display
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <Text>{item}</Text>
        )}
      />
    </View>
  );
};
```

### List with Deferred Updates

```typescript
import React, { useState, useDeferredValue, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';

const ListWithDeferredUpdates = () => {
  const [filter, setFilter] = useState('all');
  const deferredFilter = useDeferredValue(filter);

  // Expensive filtering based on deferred filter
  const filteredItems = useMemo(() => {
    return performExpensiveFiltering(deferredFilter);
  }, [deferredFilter]);

  const performExpensiveFiltering = (filterType: string): string[] => {
    const items = Array.from({ length: 10000 }, (_, i) => `Item ${i}`);

    switch (filterType) {
      case 'even':
        return items.filter((_, i) => i % 2 === 0);
      case 'odd':
        return items.filter((_, i) => i % 2 === 1);
      case 'large':
        return items.filter((_, i) => i > 5000);
      default:
        return items;
    }
  };

  return (
    <View>
      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        <TouchableOpacity
          onPress={() => setFilter('all')}
          style={{
            padding: 10,
            backgroundColor: filter === 'all' ? '#007AFF' : '#f0f0f0',
            marginRight: 5,
          }}
        >
          <Text style={{ color: filter === 'all' ? 'white' : 'black' }}>
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setFilter('even')}
          style={{
            padding: 10,
            backgroundColor: filter === 'even' ? '#007AFF' : '#f0f0f0',
            marginRight: 5,
          }}
        >
          <Text style={{ color: filter === 'even' ? 'white' : 'black' }}>
            Even
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setFilter('odd')}
          style={{
            padding: 10,
            backgroundColor: filter === 'odd' ? '#007AFF' : '#f0f0f0',
            marginRight: 5,
          }}
        >
          <Text style={{ color: filter === 'odd' ? 'white' : 'black' }}>
            Odd
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setFilter('large')}
          style={{
            padding: 10,
            backgroundColor: filter === 'large' ? '#007AFF' : '#f0f0f0',
          }}
        >
          <Text style={{ color: filter === 'large' ? 'white' : 'black' }}>
            Large
          </Text>
        </TouchableOpacity>
      </View>

      <Text>Filter: {filter}</Text>
      <Text>Deferred Filter: {deferredFilter}</Text>
      <Text>Items: {filteredItems.length}</Text>

      <FlatList
        data={filteredItems.slice(0, 100)}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <Text>{item}</Text>
        )}
      />
    </View>
  );
};
```

## Advanced Performance Patterns

### Combining useTransition and useDeferredValue

```typescript
import React, { useState, useTransition, useDeferredValue, useMemo } from 'react';
import { View, Text, TextInput, FlatList } from 'react-native';

const AdvancedSearch = () => {
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();
  const deferredQuery = useDeferredValue(query);

  const searchResults = useMemo(() => {
    return performExpensiveSearch(deferredQuery);
  }, [deferredQuery]);

  const performExpensiveSearch = (searchQuery: string): string[] => {
    // Simulate very expensive search
    const items = Array.from({ length: 50000 }, (_, i) => `Item ${i}`);
    return items.filter(item =>
      item.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery); // Immediate update

    startTransition(() => {
      // Non-urgent processing
      console.log('Processing search results...');
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

      {isPending && <Text>Processing...</Text>}

      <Text>Results: {searchResults.length}</Text>

      <FlatList
        data={searchResults.slice(0, 50)}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <Text>{item}</Text>
        )}
      />
    </View>
  );
};
```

## Common Pitfalls

### 1. useLayoutEffect Pitfalls

```typescript
// ❌ Wrong: Using useLayoutEffect for non-DOM operations
useLayoutEffect(() => {
  // This should use useEffect instead
  console.log("Component mounted");
}, []);

// ✅ Correct: Use useLayoutEffect only for DOM measurements
useLayoutEffect(() => {
  if (elementRef.current) {
    elementRef.current.measure((x, y, width, height) => {
      setDimensions({ width, height });
    });
  }
}, []);
```

### 2. useImperativeHandle Pitfalls

```typescript
// ❌ Wrong: Exposing too much
useImperativeHandle(ref, () => ({
  // Don't expose internal state
  internalState: state,
  setInternalState: setState,
}));

// ✅ Correct: Expose only necessary methods
useImperativeHandle(ref, () => ({
  focus: () => inputRef.current?.focus(),
  blur: () => inputRef.current?.blur(),
  clear: () => setValue(""),
}));
```

### 3. useTransition Pitfalls

```typescript
// ❌ Wrong: Using startTransition for all updates
const handleClick = () => {
  startTransition(() => {
    setCount(count + 1); // This is unnecessary
  });
};

// ✅ Correct: Use for expensive operations only
const handleSearch = (query: string) => {
  setSearchQuery(query); // Immediate update

  startTransition(() => {
    performExpensiveSearch(query); // Expensive operation
  });
};
```

### 4. useDeferredValue Pitfalls

```typescript
// ❌ Wrong: Using for simple values
const deferredCount = useDeferredValue(count); // Unnecessary

// ✅ Correct: Use for expensive computations
const deferredQuery = useDeferredValue(query);
const expensiveResults = useMemo(() => {
  return performExpensiveSearch(deferredQuery);
}, [deferredQuery]);
```

This comprehensive guide covers the advanced React hooks with detailed explanations, practical examples, and best practices. Each concept is thoroughly commented to help you understand when and how to use these advanced patterns effectively.
