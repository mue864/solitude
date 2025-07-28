# React Hooks Part 3: Custom Hooks

## Table of Contents

1. [Introduction to Custom Hooks](#introduction-to-custom-hooks)
2. [useLocalStorage - Persistent State](#uselocalstorage---persistent-state)
3. [useDebounce - Debounced Values](#usedebounce---debounced-values)
4. [useAsync - Async Operations](#useasync---async-operations)
5. [useToggle - Boolean State](#usetoggle---boolean-state)
6. [usePrevious - Previous Values](#useprevious---previous-values)
7. [useClickOutside - Outside Click Detection](#useclickoutside---outside-click-detection)
8. [useWindowSize - Window Dimensions](#usewindowsize---window-dimensions)
9. [useOnlineStatus - Network Status](#useonlinestatus---network-status)
10. [Best Practices for Custom Hooks](#best-practices-for-custom-hooks)
11. [Testing Custom Hooks](#testing-custom-hooks)

## Introduction to Custom Hooks

Custom hooks are JavaScript functions that start with "use" and may call other hooks. They allow you to extract component logic into reusable functions.

### Why Custom Hooks?

- **Reusability**: Share logic between components
- **Separation of Concerns**: Keep components focused on rendering
- **Testing**: Test logic independently from components
- **Composability**: Combine multiple hooks into complex logic

### Basic Custom Hook Structure

```typescript
import { useState, useEffect } from 'react';

// Custom hook function - must start with "use"
const useCustomHook = (initialValue: any) => {
  // Use built-in hooks
  const [value, setValue] = useState(initialValue);

  // Side effects
  useEffect(() => {
    // Hook logic here
  }, [value]);

  // Return values and functions
  return {
    value,
    setValue,
    // ... other returned values
  };
};

// Usage in component
const MyComponent = () => {
  const { value, setValue } = useCustomHook('initial');

  return (
    <div>
      <p>Value: {value}</p>
      <button onClick={() => setValue('new value')}>
        Update Value
      </button>
    </div>
  );
};
```

## useLocalStorage - Persistent State

A custom hook that synchronizes state with localStorage, allowing data to persist across browser sessions.

### Basic Implementation

```typescript
import { useState, useEffect } from 'react';

// Generic type for the stored value
const useLocalStorage = <T>(key: string, initialValue: T) => {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);

      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      // Save state
      setStoredValue(valueToStore);

      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
};

// Usage example
const UserPreferences = () => {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  const [username, setUsername] = useLocalStorage('username', '');

  return (
    <div>
      <h2>User Preferences</h2>
      <p>Current theme: {theme}</p>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>

      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter username"
      />
    </div>
  );
};
```

### Advanced Implementation with TypeScript

```typescript
import { useState, useEffect, useCallback } from 'react';

interface LocalStorageOptions {
  serialize?: (value: any) => string;
  deserialize?: (value: string) => any;
  onError?: (error: Error) => void;
}

const useLocalStorage = <T>(
  key: string,
  initialValue: T,
  options: LocalStorageOptions = {}
) => {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    onError = (error: Error) => console.error('useLocalStorage error:', error),
  } = options;

  // Get initial value from localStorage or use provided initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? deserialize(item) : initialValue;
    } catch (error) {
      onError(error as Error);
      return initialValue;
    }
  });

  // Update localStorage when storedValue changes
  useEffect(() => {
    try {
      window.localStorage.setItem(key, serialize(storedValue));
    } catch (error) {
      onError(error as Error);
    }
  }, [key, storedValue, serialize]);

  // Return a wrapped version of useState's setter function
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
    } catch (error) {
      onError(error as Error);
    }
  }, [storedValue]);

  // Remove item from localStorage
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      onError(error as Error);
    }
  }, [key, initialValue]);

  return {
    value: storedValue,
    setValue,
    removeValue,
  };
};

// Usage with complex data
interface UserSettings {
  theme: 'light' | 'dark';
  fontSize: number;
  notifications: boolean;
  preferences: {
    language: string;
    timezone: string;
  };
}

const SettingsComponent = () => {
  const { value: settings, setValue: setSettings, removeValue: clearSettings } = useLocalStorage<UserSettings>('user-settings', {
    theme: 'light',
    fontSize: 14,
    notifications: true,
    preferences: {
      language: 'en',
      timezone: 'UTC',
    },
  });

  const updateTheme = (theme: 'light' | 'dark') => {
    setSettings(prev => ({ ...prev, theme }));
  };

  const updateFontSize = (fontSize: number) => {
    setSettings(prev => ({ ...prev, fontSize }));
  };

  return (
    <div>
      <h2>Settings</h2>
      <p>Theme: {settings.theme}</p>
      <p>Font Size: {settings.fontSize}</p>
      <p>Notifications: {settings.notifications ? 'On' : 'Off'}</p>

      <button onClick={() => updateTheme(settings.theme === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>

      <button onClick={() => updateFontSize(settings.fontSize + 2)}>
        Increase Font Size
      </button>

      <button onClick={clearSettings}>
        Clear Settings
      </button>
    </div>
  );
};
```

## useDebounce - Debounced Values

A custom hook that delays updating a value until after a specified delay, useful for search inputs and API calls.

### Basic Implementation

```typescript
import { useState, useEffect } from 'react';

const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up the timeout
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timeout if value changes (also on delay change or unmount)
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Only re-run effect if value or delay changes

  return debouncedValue;
};

// Usage example
const SearchComponent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // 500ms delay

  // Effect for API call
  useEffect(() => {
    if (debouncedSearchTerm) {
      // Make API call with debounced search term
      searchAPI(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search..."
      />
      <p>Search term: {searchTerm}</p>
      <p>Debounced search term: {debouncedSearchTerm}</p>
    </div>
  );
};
```

### Advanced Implementation with Callback

```typescript
import { useState, useEffect, useCallback, useRef } from 'react';

interface DebounceOptions {
  delay: number;
  immediate?: boolean; // Whether to call the function immediately on first call
}

const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  options: DebounceOptions
) => {
  const { delay, immediate = false } = options;
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isFirstCallRef = useRef(true);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // If this is the first call and immediate is true, call immediately
      if (isFirstCallRef.current && immediate) {
        isFirstCallRef.current = false;
        callback(...args);
        return;
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay, immediate]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

// Usage example
const SearchWithDebounce = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const performSearch = async (query: string) => {
    setIsSearching(true);
    try {
      const results = await fetch(`/api/search?q=${query}`);
      const data = await results.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const debouncedSearch = useDebounce(performSearch, {
    delay: 300,
    immediate: false,
  });

  const handleSearchChange = (query: string) => {
    if (query.trim()) {
      debouncedSearch(query);
    } else {
      setSearchResults([]);
    }
  };

  return (
    <div>
      <input
        type="text"
        onChange={(e) => handleSearchChange(e.target.value)}
        placeholder="Search..."
      />

      {isSearching && <p>Searching...</p>}

      <ul>
        {searchResults.map((result: any) => (
          <li key={result.id}>{result.title}</li>
        ))}
      </ul>
    </div>
  );
};
```

## useAsync - Async Operations

A custom hook for handling async operations with loading, error, and success states.

### Basic Implementation

```typescript
import { useState, useEffect, useCallback } from 'react';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

const useAsync = <T>(
  asyncFunction: () => Promise<T>,
  immediate = true
) => {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async () => {
    setState({
      data: null,
      loading: true,
      error: null,
    });

    try {
      const data = await asyncFunction();
      setState({
        data,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error as Error,
      });
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { ...state, execute };
};

// Usage example
const UserProfile = ({ userId }: { userId: string }) => {
  const fetchUser = async () => {
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }
    return response.json();
  };

  const { data: user, loading, error, execute: refetch } = useAsync(fetchUser);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return <div>No user found</div>;

  return (
    <div>
      <h2>{user.name}</h2>
      <p>Email: {user.email}</p>
      <button onClick={refetch}>Refresh</button>
    </div>
  );
};
```

### Advanced Implementation with Abort Controller

```typescript
import { useState, useEffect, useCallback, useRef } from 'react';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseAsyncOptions {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

const useAsync = <T>(
  asyncFunction: (signal?: AbortSignal) => Promise<T>,
  options: UseAsyncOptions = {}
) => {
  const { immediate = true, onSuccess, onError } = options;
  const abortControllerRef = useRef<AbortController>();
  const isMountedRef = useRef(true);

  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async () => {
    // Cancel previous request if it's still running
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setState({
      data: null,
      loading: true,
      error: null,
    });

    try {
      const data = await asyncFunction(abortControllerRef.current.signal);

      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setState({
          data,
          loading: false,
          error: null,
        });
        onSuccess?.(data);
      }
    } catch (error) {
      // Don't update state if request was aborted
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }

      if (isMountedRef.current) {
        setState({
          data: null,
          loading: false,
          error: error as Error,
        });
        onError?.(error as Error);
      }
    }
  }, [asyncFunction, onSuccess, onError]);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [execute, immediate]);

  return { ...state, execute, cancel };
};

// Usage example
const SearchWithAbort = () => {
  const [query, setQuery] = useState('');

  const searchAPI = async (signal?: AbortSignal) => {
    const response = await fetch(`/api/search?q=${query}`, { signal });
    if (!response.ok) {
      throw new Error('Search failed');
    }
    return response.json();
  };

  const { data: results, loading, error, execute: search, cancel } = useAsync(searchAPI, {
    immediate: false,
    onSuccess: (data) => console.log('Search successful:', data),
    onError: (error) => console.error('Search failed:', error),
  });

  const handleSearch = () => {
    if (query.trim()) {
      search();
    }
  };

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />

      <button onClick={handleSearch} disabled={loading}>
        {loading ? 'Searching...' : 'Search'}
      </button>

      <button onClick={cancel} disabled={!loading}>
        Cancel
      </button>

      {error && <p>Error: {error.message}</p>}

      {results && (
        <ul>
          {results.map((result: any) => (
            <li key={result.id}>{result.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
};
```

## useToggle - Boolean State

A simple custom hook for managing boolean state with toggle functionality.

### Implementation

```typescript
import { useState, useCallback } from 'react';

const useToggle = (initialValue = false) => {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue(prev => !prev);
  }, []);

  const setTrue = useCallback(() => {
    setValue(true);
  }, []);

  const setFalse = useCallback(() => {
    setValue(false);
  }, []);

  return {
    value,
    toggle,
    setTrue,
    setFalse,
    setValue,
  };
};

// Usage example
const ToggleComponent = () => {
  const { value: isVisible, toggle, setTrue, setFalse } = useToggle(false);

  return (
    <div>
      <p>Visibility: {isVisible ? 'Visible' : 'Hidden'}</p>

      <button onClick={toggle}>
        Toggle
      </button>

      <button onClick={setTrue}>
        Show
      </button>

      <button onClick={setFalse}>
        Hide
      </button>

      {isVisible && (
        <div>
          <h3>Hidden Content</h3>
          <p>This content is now visible!</p>
        </div>
      )}
    </div>
  );
};
```

## usePrevious - Previous Values

A custom hook that returns the previous value of a state or prop.

### Implementation

```typescript
import { useRef, useEffect } from 'react';

const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
};

// Usage example
const CounterWithPrevious = () => {
  const [count, setCount] = useState(0);
  const previousCount = usePrevious(count);

  return (
    <div>
      <p>Current: {count}</p>
      <p>Previous: {previousCount}</p>
      <p>Difference: {count - (previousCount || 0)}</p>

      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>

      <button onClick={() => setCount(count - 1)}>
        Decrement
      </button>
    </div>
  );
};
```

## useClickOutside - Outside Click Detection

A custom hook that detects clicks outside of a specified element.

### Implementation

```typescript
import { useEffect, useRef } from 'react';

const useClickOutside = (handler: () => void) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }

      handler();
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [handler]);

  return ref;
};

// Usage example
const Modal = ({ isOpen, onClose, children }: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  const ref = useClickOutside(onClose);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div ref={ref} className="modal-content">
        {children}
      </div>
    </div>
  );
};

const App = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsModalOpen(true)}>
        Open Modal
      </button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2>Modal Content</h2>
        <p>Click outside to close</p>
      </Modal>
    </div>
  );
};
```

## useWindowSize - Window Dimensions

A custom hook that tracks window dimensions and updates when the window is resized.

### Implementation

```typescript
import { useState, useEffect } from 'react';

interface WindowSize {
  width: number;
  height: number;
}

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

// Usage example
const ResponsiveComponent = () => {
  const { width, height } = useWindowSize();

  return (
    <div>
      <h2>Window Size</h2>
      <p>Width: {width}px</p>
      <p>Height: {height}px</p>

      {width < 768 && <p>Mobile view</p>}
      {width >= 768 && width < 1024 && <p>Tablet view</p>}
      {width >= 1024 && <p>Desktop view</p>}
    </div>
  );
};
```

## useOnlineStatus - Network Status

A custom hook that tracks the online/offline status of the browser.

### Implementation

```typescript
import { useState, useEffect } from 'react';

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

  return isOnline;
};

// Usage example
const NetworkStatus = () => {
  const isOnline = useOnlineStatus();

  return (
    <div>
      <h2>Network Status</h2>
      <p>Status: {isOnline ? 'Online' : 'Offline'}</p>

      {!isOnline && (
        <div style={{ color: 'red' }}>
          You are currently offline. Some features may not work.
        </div>
      )}
    </div>
  );
};
```

## Best Practices for Custom Hooks

### 1. Naming Conventions

```typescript
// ✅ Good: Start with "use"
const useLocalStorage = () => {};
const useDebounce = () => {};
const useAsync = () => {};

// ❌ Bad: Don't start with "use"
const localStorage = () => {};
const debounce = () => {};
```

### 2. Return Values

```typescript
// ✅ Good: Return an object for multiple values
const useCounter = () => {
  const [count, setCount] = useState(0);

  return {
    count,
    increment: () => setCount((prev) => prev + 1),
    decrement: () => setCount((prev) => prev - 1),
    reset: () => setCount(0),
  };
};

// ✅ Good: Return an array for simple cases
const useToggle = () => {
  const [value, setValue] = useState(false);
  return [value, () => setValue((prev) => !prev)];
};
```

### 3. Dependencies

```typescript
// ✅ Good: Include all dependencies in useEffect
const useAsync = (asyncFunction: () => Promise<any>) => {
  useEffect(() => {
    // Effect logic
  }, [asyncFunction]); // Include asyncFunction in dependencies
};

// ❌ Bad: Missing dependencies
const useAsync = (asyncFunction: () => Promise<any>) => {
  useEffect(() => {
    // Effect logic
  }, []); // Missing asyncFunction dependency
};
```

### 4. Cleanup

```typescript
// ✅ Good: Always clean up subscriptions and timers
const useInterval = (callback: () => void, delay: number) => {
  useEffect(() => {
    const interval = setInterval(callback, delay);

    return () => clearInterval(interval); // Cleanup
  }, [callback, delay]);
};
```

## Testing Custom Hooks

### Using React Testing Library

```typescript
import { renderHook, act } from "@testing-library/react";
import { useCounter } from "./useCounter";

describe("useCounter", () => {
  it("should increment counter", () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });

  it("should reset counter", () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.increment();
      result.current.increment();
      result.current.reset();
    });

    expect(result.current.count).toBe(0);
  });
});
```

### Testing Async Hooks

```typescript
import { renderHook, waitFor } from "@testing-library/react";
import { useAsync } from "./useAsync";

describe("useAsync", () => {
  it("should handle async operations", async () => {
    const mockAsyncFunction = jest.fn().mockResolvedValue("test data");

    const { result } = renderHook(() => useAsync(mockAsyncFunction));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBe(null);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBe("test data");
    expect(result.current.error).toBe(null);
  });

  it("should handle errors", async () => {
    const mockAsyncFunction = jest
      .fn()
      .mockRejectedValue(new Error("Test error"));

    const { result } = renderHook(() => useAsync(mockAsyncFunction));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe("Test error");
  });
});
```

This comprehensive guide covers building custom hooks with detailed explanations, practical examples, and best practices. Each hook is thoroughly commented to help you understand the patterns and create your own reusable logic.
