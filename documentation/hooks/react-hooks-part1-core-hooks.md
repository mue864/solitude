# React Hooks Part 1: Core Hooks

## Table of Contents

1. [Introduction to React Hooks](#introduction-to-react-hooks)
2. [useState - State Management](#usestate---state-management)
3. [useEffect - Side Effects](#useeffect---side-effects)
4. [useContext - Context Consumption](#usecontext---context-consumption)
5. [Best Practices](#best-practices)
6. [Common Pitfalls](#common-pitfalls)

## Introduction to React Hooks

React Hooks are functions that allow you to "hook into" React state and lifecycle features from function components. They were introduced in React 16.8 to solve several problems:

- **Stateful Logic Reuse**: Share stateful logic between components
- **Complex Components**: Simplify complex components by extracting logic
- **Classes Confusion**: Avoid the complexity of `this` binding and lifecycle methods

### Key Rules of Hooks

1. **Only call hooks at the top level** - Don't call hooks inside loops, conditions, or nested functions
2. **Only call hooks from React functions** - Call hooks from React function components or custom hooks
3. **Hook names must start with "use"** - This is how React identifies hooks

```typescript
// ✅ Correct: Hooks at the top level
function MyComponent() {
  const [count, setCount] = useState(0); // Hook at top level
  const [name, setName] = useState(""); // Another hook at top level

  // Component logic here
}

// ❌ Wrong: Hook inside a condition
function MyComponent() {
  if (someCondition) {
    const [count, setCount] = useState(0); // This will cause errors!
  }
}
```

## useState - State Management

`useState` is the most fundamental hook that allows function components to have state.

### Basic Syntax

```typescript
const [state, setState] = useState(initialValue);
```

### Simple Counter Example

```typescript
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const Counter = () => {
  // useState returns an array with two elements:
  // 1. The current state value (count)
  // 2. A function to update the state (setCount)
  const [count, setCount] = useState(0); // Initialize with 0

  return (
    <View>
      {/* Display the current state value */}
      <Text>Count: {count}</Text>

      {/* Update state using the setter function */}
      <TouchableOpacity onPress={() => setCount(count + 1)}>
        <Text>Increment</Text>
      </TouchableOpacity>

      {/* You can also pass a function to setState for complex updates */}
      <TouchableOpacity onPress={() => setCount(prevCount => prevCount - 1)}>
        <Text>Decrement</Text>
      </TouchableOpacity>

      {/* Reset to initial value */}
      <TouchableOpacity onPress={() => setCount(0)}>
        <Text>Reset</Text>
      </TouchableOpacity>
    </View>
  );
};
```

### Multiple State Variables

```typescript
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

const UserForm = () => {
  // You can have multiple useState calls for different pieces of state
  const [name, setName] = useState('');           // String state
  const [age, setAge] = useState(0);              // Number state
  const [isActive, setIsActive] = useState(false); // Boolean state
  const [user, setUser] = useState(null);         // Object state

  const handleSubmit = () => {
    // Create a user object with all the form data
    const newUser = {
      name,
      age,
      isActive,
    };

    setUser(newUser); // Update the user state
    console.log('User created:', newUser);
  };

  return (
    <View>
      {/* Text input for name */}
      <TextInput
        value={name}
        onChangeText={setName} // Directly pass the setter function
        placeholder="Enter your name"
      />

      {/* Number input for age */}
      <TextInput
        value={age.toString()}
        onChangeText={(text) => setAge(parseInt(text) || 0)} // Convert string to number
        placeholder="Enter your age"
        keyboardType="numeric"
      />

      {/* Toggle button for active status */}
      <TouchableOpacity onPress={() => setIsActive(!isActive)}>
        <Text>{isActive ? 'Active' : 'Inactive'}</Text>
      </TouchableOpacity>

      {/* Submit button */}
      <TouchableOpacity onPress={handleSubmit}>
        <Text>Submit</Text>
      </TouchableOpacity>

      {/* Display current user if exists */}
      {user && (
        <View>
          <Text>Current User:</Text>
          <Text>Name: {user.name}</Text>
          <Text>Age: {user.age}</Text>
          <Text>Active: {user.isActive ? 'Yes' : 'No'}</Text>
        </View>
      )}
    </View>
  );
};
```

### Object State Management

```typescript
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const UserProfile = () => {
  // Managing complex state with objects
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    age: 25,
    preferences: {
      theme: 'dark',
      notifications: true,
    },
  });

  // ❌ Wrong way: This will overwrite the entire object
  const updateNameWrong = (newName: string) => {
    setUser({ name: newName }); // This removes email, age, and preferences!
  };

  // ✅ Correct way: Spread the existing object and update only what you need
  const updateName = (newName: string) => {
    setUser(prevUser => ({
      ...prevUser,        // Keep all existing properties
      name: newName,      // Update only the name
    }));
  };

  // ✅ Correct way: Update nested object properties
  const updateTheme = (newTheme: string) => {
    setUser(prevUser => ({
      ...prevUser,
      preferences: {
        ...prevUser.preferences, // Keep existing preferences
        theme: newTheme,         // Update only the theme
      },
    }));
  };

  // ✅ Correct way: Toggle boolean property
  const toggleNotifications = () => {
    setUser(prevUser => ({
      ...prevUser,
      preferences: {
        ...prevUser.preferences,
        notifications: !prevUser.preferences.notifications,
      },
    }));
  };

  return (
    <View>
      <Text>Name: {user.name}</Text>
      <Text>Email: {user.email}</Text>
      <Text>Age: {user.age}</Text>
      <Text>Theme: {user.preferences.theme}</Text>
      <Text>Notifications: {user.preferences.notifications ? 'On' : 'Off'}</Text>

      <TouchableOpacity onPress={() => updateName('Jane Doe')}>
        <Text>Change Name</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => updateTheme('light')}>
        <Text>Change Theme</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={toggleNotifications}>
        <Text>Toggle Notifications</Text>
      </TouchableOpacity>
    </View>
  );
};
```

### Array State Management

```typescript
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';

const TodoList = () => {
  // Managing array state
  const [todos, setTodos] = useState([
    { id: 1, text: 'Learn React Hooks', completed: false },
    { id: 2, text: 'Build an app', completed: false },
    { id: 3, text: 'Write documentation', completed: false },
  ]);

  // ✅ Add item to array
  const addTodo = (text: string) => {
    const newTodo = {
      id: Date.now(), // Simple ID generation
      text,
      completed: false,
    };

    setTodos(prevTodos => [...prevTodos, newTodo]); // Spread existing items, add new one
  };

  // ✅ Remove item from array
  const removeTodo = (id: number) => {
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
  };

  // ✅ Update item in array
  const toggleTodo = (id: number) => {
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id
          ? { ...todo, completed: !todo.completed } // Update only this todo
          : todo // Keep other todos unchanged
      )
    );
  };

  // ✅ Clear all completed todos
  const clearCompleted = () => {
    setTodos(prevTodos => prevTodos.filter(todo => !todo.completed));
  };

  return (
    <View>
      <Text>Todo List ({todos.length} items)</Text>

      {/* Display todos */}
      <FlatList
        data={todos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => toggleTodo(item.id)}>
              <Text>{item.completed ? '✅' : '⭕'} {item.text}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => removeTodo(item.id)}>
              <Text style={{ color: 'red' }}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity onPress={() => addTodo('New Todo')}>
        <Text>Add Todo</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={clearCompleted}>
        <Text>Clear Completed</Text>
      </TouchableOpacity>
    </View>
  );
};
```

## useEffect - Side Effects

`useEffect` is used to perform side effects in function components. Side effects are operations that happen outside of the normal render cycle, such as:

- API calls
- Subscriptions
- Manual DOM manipulations
- Timers
- Event listeners

### Basic Syntax

```typescript
useEffect(() => {
  // Side effect code here
  return () => {
    // Cleanup code here (optional)
  };
}, [dependencies]); // Dependencies array (optional)
```

### Simple Example - Document Title

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const DocumentTitleExample = () => {
  const [count, setCount] = useState(0);

  // This effect runs after every render
  useEffect(() => {
    // Update the document title (this is a side effect)
    document.title = `Count: ${count}`;

    // This function is called before the component unmounts
    // or before the effect runs again
    return () => {
      console.log('Cleaning up effect for count:', count);
    };
  }); // No dependency array = runs after every render

  return (
    <View>
      <Text>Count: {count}</Text>
      <TouchableOpacity onPress={() => setCount(count + 1)}>
        <Text>Increment</Text>
      </TouchableOpacity>
    </View>
  );
};
```

### Controlled Effect - Only Run When Dependencies Change

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const ControlledEffectExample = () => {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('John');

  // This effect only runs when 'count' changes
  useEffect(() => {
    console.log('Count changed to:', count);
    document.title = `Count: ${count}`;
  }, [count]); // Dependency array with 'count'

  // This effect only runs when 'name' changes
  useEffect(() => {
    console.log('Name changed to:', name);
    // You could make an API call here based on the name
  }, [name]); // Dependency array with 'name'

  // This effect runs only once (on mount)
  useEffect(() => {
    console.log('Component mounted');

    // Cleanup function runs on unmount
    return () => {
      console.log('Component unmounting');
    };
  }, []); // Empty dependency array = run only once

  return (
    <View>
      <Text>Count: {count}</Text>
      <Text>Name: {name}</Text>

      <TouchableOpacity onPress={() => setCount(count + 1)}>
        <Text>Increment Count</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setName('Jane')}>
        <Text>Change Name</Text>
      </TouchableOpacity>
    </View>
  );
};
```

### API Calls with useEffect

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

interface User {
  id: number;
  name: string;
  email: string;
}

const UserProfile = ({ userId }: { userId: number }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user data when component mounts or userId changes
  useEffect(() => {
    // Reset state when userId changes
    setLoading(true);
    setError(null);
    setUser(null);

    // Define the async function inside useEffect
    const fetchUser = async () => {
      try {
        const response = await fetch(`https://api.example.com/users/${userId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }

        const userData = await response.json();
        setUser(userData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    // Call the async function
    fetchUser();

    // Cleanup function (optional for API calls, but good practice)
    return () => {
      // Cancel any pending requests if component unmounts
      console.log('Cleaning up user fetch for userId:', userId);
    };
  }, [userId]); // Re-run when userId changes

  if (loading) {
    return (
      <View>
        <ActivityIndicator size="large" />
        <Text>Loading user...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View>
        <Text style={{ color: 'red' }}>Error: {error}</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View>
        <Text>No user found</Text>
      </View>
    );
  }

  return (
    <View>
      <Text>Name: {user.name}</Text>
      <Text>Email: {user.email}</Text>
    </View>
  );
};
```

### Event Listeners and Cleanup

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';

const WindowSizeTracker = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    // Define the event handler
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup function - remove event listener when component unmounts
    // or when effect runs again
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Empty dependency array = only run on mount

  return (
    <View>
      <Text>Window Width: {windowSize.width}</Text>
      <Text>Window Height: {windowSize.height}</Text>
    </View>
  );
};
```

### Timer with Cleanup

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const Timer = () => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isRunning) {
      // Set up timer
      intervalId = setInterval(() => {
        setSeconds(prevSeconds => prevSeconds + 1);
      }, 1000);
    }

    // Cleanup function - clear interval when component unmounts
    // or when isRunning changes
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning]); // Re-run when isRunning changes

  const startTimer = () => setIsRunning(true);
  const stopTimer = () => setIsRunning(false);
  const resetTimer = () => {
    setSeconds(0);
    setIsRunning(false);
  };

  return (
    <View>
      <Text>Timer: {seconds} seconds</Text>

      <TouchableOpacity onPress={isRunning ? stopTimer : startTimer}>
        <Text>{isRunning ? 'Stop' : 'Start'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={resetTimer}>
        <Text>Reset</Text>
      </TouchableOpacity>
    </View>
  );
};
```

### Multiple Effects for Different Concerns

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const MultiEffectComponent = () => {
  const [count, setCount] = useState(0);
  const [theme, setTheme] = useState('light');

  // Effect 1: Handle count changes
  useEffect(() => {
    console.log('Count changed to:', count);

    // Save count to localStorage
    localStorage.setItem('count', count.toString());
  }, [count]);

  // Effect 2: Handle theme changes
  useEffect(() => {
    console.log('Theme changed to:', theme);

    // Apply theme to document
    document.body.className = theme;

    // Save theme preference
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Effect 3: Load saved data on mount
  useEffect(() => {
    console.log('Component mounted, loading saved data');

    // Load count from localStorage
    const savedCount = localStorage.getItem('count');
    if (savedCount) {
      setCount(parseInt(savedCount));
    }

    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []); // Empty dependency array = run only on mount

  return (
    <View>
      <Text>Count: {count}</Text>
      <Text>Theme: {theme}</Text>

      <TouchableOpacity onPress={() => setCount(count + 1)}>
        <Text>Increment Count</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        <Text>Toggle Theme</Text>
      </TouchableOpacity>
    </View>
  );
};
```

## useContext - Context Consumption

`useContext` is used to consume React Context. Context provides a way to pass data through the component tree without having to pass props down manually at every level.

### Basic Context Usage

```typescript
import React, { createContext, useContext, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

// 1. Create a context
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 2. Create a provider component
const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 3. Create a custom hook to use the context
const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// 4. Use the context in components
const ThemedButton = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      style={{
        backgroundColor: theme === 'light' ? '#fff' : '#333',
        padding: 10
      }}
    >
      <Text style={{ color: theme === 'light' ? '#333' : '#fff' }}>
        Current Theme: {theme}
      </Text>
    </TouchableOpacity>
  );
};

const ThemedText = () => {
  const { theme } = useTheme();

  return (
    <Text style={{ color: theme === 'light' ? '#333' : '#fff' }}>
      This text adapts to the theme
    </Text>
  );
};

// 5. Wrap your app with the provider
const App = () => {
  return (
    <ThemeProvider>
      <View>
        <ThemedText />
        <ThemedButton />
      </View>
    </ThemeProvider>
  );
};
```

### User Authentication Context

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

// Define the user type
interface User {
  id: string;
  name: string;
  email: string;
}

// Define the auth context type
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the provider
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Check for stored auth token
        const token = localStorage.getItem('authToken');
        if (token) {
          // Verify token with server
          const response = await fetch('/api/auth/verify', {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            // Token is invalid, remove it
            localStorage.removeItem('authToken');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const { user: userData, token } = await response.json();

      // Store token
      localStorage.setItem('authToken', token);

      // Update user state
      setUser(userData);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Remove token
    localStorage.removeItem('authToken');

    // Clear user state
    setUser(null);
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const { user: userData, token } = await response.json();

      // Store token
      localStorage.setItem('authToken', token);

      // Update user state
      setUser(userData);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Components that use the auth context
const LoginForm = () => {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async () => {
    try {
      await login(email, password);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <View>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
      />
      <TouchableOpacity onPress={handleSubmit} disabled={loading}>
        <Text>{loading ? 'Logging in...' : 'Login'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const UserProfile = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return <Text>Please log in</Text>;
  }

  return (
    <View>
      <Text>Welcome, {user.name}!</Text>
      <Text>Email: {user.email}</Text>
      <TouchableOpacity onPress={logout}>
        <Text>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const App = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View>
      {user ? <UserProfile /> : <LoginForm />}
    </View>
  );
};

// Wrap your app with the provider
const AppWithProvider = () => {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
};
```

## Best Practices

### 1. useState Best Practices

```typescript
// ✅ Good: Use functional updates for state that depends on previous state
const [count, setCount] = useState(0);

// Instead of this:
setCount(count + 1);

// Use this (especially in loops or rapid updates):
setCount((prevCount) => prevCount + 1);

// ✅ Good: Initialize state with a function for expensive computations
const [expensiveValue, setExpensiveValue] = useState(() => {
  // This function only runs once during initialization
  return computeExpensiveValue();
});

// ✅ Good: Use multiple useState calls for unrelated state
const [name, setName] = useState("");
const [age, setAge] = useState(0);
const [isActive, setIsActive] = useState(false);

// Instead of one large object:
const [user, setUser] = useState({
  name: "",
  age: 0,
  isActive: false,
});
```

### 2. useEffect Best Practices

```typescript
// ✅ Good: Always include dependencies in the dependency array
useEffect(() => {
  // Effect code
}, [dependency1, dependency2]); // Include all dependencies

// ✅ Good: Use cleanup functions to prevent memory leaks
useEffect(() => {
  const subscription = someAPI.subscribe();

  return () => {
    subscription.unsubscribe(); // Cleanup
  };
}, []);

// ✅ Good: Separate concerns into multiple effects
useEffect(() => {
  // Handle count changes
}, [count]);

useEffect(() => {
  // Handle name changes
}, [name]);

// Instead of one large effect that handles everything
```

### 3. useContext Best Practices

```typescript
// ✅ Good: Create custom hooks for context
const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// ✅ Good: Provide default values for context
const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
});

// ✅ Good: Use TypeScript for type safety
interface ThemeContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
}
```

## Common Pitfalls

### 1. useState Pitfalls

```typescript
// ❌ Wrong: Mutating state directly
const [todos, setTodos] = useState([]);
todos.push(newTodo); // This won't trigger a re-render!

// ✅ Correct: Use setter function
setTodos((prevTodos) => [...prevTodos, newTodo]);

// ❌ Wrong: Using stale state in closures
const [count, setCount] = useState(0);

useEffect(() => {
  const timer = setInterval(() => {
    setCount(count + 1); // This will always use the initial value of count!
  }, 1000);

  return () => clearInterval(timer);
}, []);

// ✅ Correct: Use functional update
useEffect(() => {
  const timer = setInterval(() => {
    setCount((prevCount) => prevCount + 1); // This uses the latest value
  }, 1000);

  return () => clearInterval(timer);
}, []);
```

### 2. useEffect Pitfalls

```typescript
// ❌ Wrong: Missing dependencies
const [count, setCount] = useState(0);
const [name, setName] = useState("");

useEffect(() => {
  console.log(`Count: ${count}, Name: ${name}`);
}, [count]); // Missing 'name' dependency!

// ✅ Correct: Include all dependencies
useEffect(() => {
  console.log(`Count: ${count}, Name: ${name}`);
}, [count, name]);

// ❌ Wrong: Infinite loops
const [data, setData] = useState([]);

useEffect(() => {
  fetchData().then(setData);
}, [data]); // This will cause infinite loops!

// ✅ Correct: Remove unnecessary dependencies
useEffect(() => {
  fetchData().then(setData);
}, []); // Empty dependency array = run only once
```

### 3. useContext Pitfalls

```typescript
// ❌ Wrong: Not providing a value
const ThemeContext = createContext();

// ✅ Correct: Provide a default value
const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
});

// ❌ Wrong: Not checking for undefined context
const useTheme = () => {
  return useContext(ThemeContext); // Could be undefined!
};

// ✅ Correct: Check for undefined
const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
```

This comprehensive guide covers the three core React hooks with detailed explanations, practical examples, and best practices. Each concept is thoroughly commented to help you understand the reasoning behind the patterns and avoid common mistakes.
