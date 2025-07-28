# React Hooks Part 2: Additional Hooks

## Table of Contents

1. [useReducer - Complex State Logic](#usereducer---complex-state-logic)
2. [useCallback - Memoized Callbacks](#usecallback---memoized-callbacks)
3. [useMemo - Memoized Values](#usememo---memoized-values)
4. [useRef - Mutable References](#useref---mutable-references)
5. [Performance Optimization Patterns](#performance-optimization-patterns)
6. [Common Pitfalls](#common-pitfalls)

## useReducer - Complex State Logic

`useReducer` is an alternative to `useState` for managing complex state logic. It's particularly useful when you have state that involves multiple sub-values or when the next state depends on the previous one.

### Basic Syntax

```typescript
const [state, dispatch] = useReducer(reducer, initialState);
```

### Simple Counter with useReducer

```typescript
import React, { useReducer } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

// Define the state type
interface CounterState {
  count: number;
  lastAction: string;
}

// Define the action types
type CounterAction =
  | { type: 'INCREMENT' }
  | { type: 'DECREMENT' }
  | { type: 'RESET' }
  | { type: 'SET_COUNT'; payload: number };

// Define the initial state
const initialState: CounterState = {
  count: 0,
  lastAction: 'none',
};

// Define the reducer function
// This function takes the current state and an action, then returns the new state
const counterReducer = (state: CounterState, action: CounterAction): CounterState => {
  switch (action.type) {
    case 'INCREMENT':
      return {
        ...state, // Spread the existing state
        count: state.count + 1,
        lastAction: 'increment',
      };

    case 'DECREMENT':
      return {
        ...state,
        count: state.count - 1,
        lastAction: 'decrement',
      };

    case 'RESET':
      return {
        ...state,
        count: 0,
        lastAction: 'reset',
      };

    case 'SET_COUNT':
      return {
        ...state,
        count: action.payload, // Use the payload from the action
        lastAction: 'set_count',
      };

    default:
      // Always return the current state for unknown actions
      return state;
  }
};

const CounterWithReducer = () => {
  // useReducer returns the current state and a dispatch function
  const [state, dispatch] = useReducer(counterReducer, initialState);

  return (
    <View>
      <Text>Count: {state.count}</Text>
      <Text>Last Action: {state.lastAction}</Text>

      {/* Dispatch actions to update state */}
      <TouchableOpacity onPress={() => dispatch({ type: 'INCREMENT' })}>
        <Text>Increment</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => dispatch({ type: 'DECREMENT' })}>
        <Text>Decrement</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => dispatch({ type: 'RESET' })}>
        <Text>Reset</Text>
      </TouchableOpacity>

      {/* Pass payload with the action */}
      <TouchableOpacity onPress={() => dispatch({ type: 'SET_COUNT', payload: 10 })}>
        <Text>Set to 10</Text>
      </TouchableOpacity>
    </View>
  );
};
```

### Shopping Cart with useReducer

```typescript
import React, { useReducer } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';

// Define the item type
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

// Define the state type
interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

// Define action types
type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'REMOVE_ITEMS'; payload: string[] };

// Initial state
const initialCartState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
};

// Helper function to calculate totals
const calculateTotals = (items: CartItem[]) => {
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  return { total, itemCount };
};

// Cart reducer
const cartReducer = (state: CartState, action: CartAction): CartState => {
  let newItems: CartItem[];

  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id);

      if (existingItem) {
        // If item exists, increase quantity
        newItems = state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // If item doesn't exist, add it with quantity 1
        newItems = [...state.items, { ...action.payload, quantity: 1 }];
      }

      const { total, itemCount } = calculateTotals(newItems);
      return { items: newItems, total, itemCount };
    }

    case 'REMOVE_ITEM': {
      newItems = state.items.filter(item => item.id !== action.payload);
      const { total, itemCount } = calculateTotals(newItems);
      return { items: newItems, total, itemCount };
    }

    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;

      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        newItems = state.items.filter(item => item.id !== id);
      } else {
        // Update quantity
        newItems = state.items.map(item =>
          item.id === id ? { ...item, quantity } : item
        );
      }

      const { total, itemCount } = calculateTotals(newItems);
      return { items: newItems, total, itemCount };
    }

    case 'CLEAR_CART':
      return initialCartState;

    case 'REMOVE_ITEMS': {
      newItems = state.items.filter(item => !action.payload.includes(item.id));
      const { total, itemCount } = calculateTotals(newItems);
      return { items: newItems, total, itemCount };
    }

    default:
      return state;
  }
};

const ShoppingCart = () => {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);

  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  return (
    <View>
      <Text>Shopping Cart</Text>
      <Text>Total Items: {state.itemCount}</Text>
      <Text>Total Price: ${state.total.toFixed(2)}</Text>

      {/* Display cart items */}
      <FlatList
        data={state.items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text>{item.name} - ${item.price}</Text>
            <Text>Qty: {item.quantity}</Text>

            <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity - 1)}>
              <Text>-</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity + 1)}>
              <Text>+</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => removeItem(item.id)}>
              <Text style={{ color: 'red' }}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Add sample items */}
      <TouchableOpacity onPress={() => addItem({ id: '1', name: 'Apple', price: 1.99 })}>
        <Text>Add Apple</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => addItem({ id: '2', name: 'Banana', price: 0.99 })}>
        <Text>Add Banana</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={clearCart}>
        <Text>Clear Cart</Text>
      </TouchableOpacity>
    </View>
  );
};
```

### Form Validation with useReducer

```typescript
import React, { useReducer } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

// Define field types
interface FormField {
  value: string;
  error: string;
  touched: boolean;
}

// Define form state
interface FormState {
  fields: {
    name: FormField;
    email: FormField;
    password: FormField;
  };
  isValid: boolean;
  isSubmitting: boolean;
}

// Define form actions
type FormAction =
  | { type: 'SET_FIELD_VALUE'; payload: { field: keyof FormState['fields']; value: string } }
  | { type: 'SET_FIELD_ERROR'; payload: { field: keyof FormState['fields']; error: string } }
  | { type: 'SET_FIELD_TOUCHED'; payload: { field: keyof FormState['fields']; touched: boolean } }
  | { type: 'VALIDATE_FIELD'; payload: keyof FormState['fields'] }
  | { type: 'VALIDATE_ALL' }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'RESET_FORM' };

// Initial form state
const initialFormState: FormState = {
  fields: {
    name: { value: '', error: '', touched: false },
    email: { value: '', error: '', touched: false },
    password: { value: '', error: '', touched: false },
  },
  isValid: false,
  isSubmitting: false,
};

// Validation functions
const validateName = (name: string): string => {
  if (!name.trim()) return 'Name is required';
  if (name.length < 2) return 'Name must be at least 2 characters';
  return '';
};

const validateEmail = (email: string): string => {
  if (!email.trim()) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Email is invalid';
  return '';
};

const validatePassword = (password: string): string => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return '';
};

// Form reducer
const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case 'SET_FIELD_VALUE': {
      const { field, value } = action.payload;
      const newFields = {
        ...state.fields,
        [field]: {
          ...state.fields[field],
          value,
          error: '', // Clear error when user types
        },
      };

      return {
        ...state,
        fields: newFields,
      };
    }

    case 'SET_FIELD_ERROR': {
      const { field, error } = action.payload;
      const newFields = {
        ...state.fields,
        [field]: {
          ...state.fields[field],
          error,
        },
      };

      return {
        ...state,
        fields: newFields,
      };
    }

    case 'SET_FIELD_TOUCHED': {
      const { field, touched } = action.payload;
      const newFields = {
        ...state.fields,
        [field]: {
          ...state.fields[field],
          touched,
        },
      };

      return {
        ...state,
        fields: newFields,
      };
    }

    case 'VALIDATE_FIELD': {
      const field = action.payload;
      const fieldValue = state.fields[field].value;

      let error = '';
      switch (field) {
        case 'name':
          error = validateName(fieldValue);
          break;
        case 'email':
          error = validateEmail(fieldValue);
          break;
        case 'password':
          error = validatePassword(fieldValue);
          break;
      }

      const newFields = {
        ...state.fields,
        [field]: {
          ...state.fields[field],
          error,
        },
      };

      return {
        ...state,
        fields: newFields,
      };
    }

    case 'VALIDATE_ALL': {
      const newFields = {
        name: {
          ...state.fields.name,
          error: validateName(state.fields.name.value),
          touched: true,
        },
        email: {
          ...state.fields.email,
          error: validateEmail(state.fields.email.value),
          touched: true,
        },
        password: {
          ...state.fields.password,
          error: validatePassword(state.fields.password.value),
          touched: true,
        },
      };

      const isValid = Object.values(newFields).every(field => !field.error);

      return {
        ...state,
        fields: newFields,
        isValid,
      };
    }

    case 'SET_SUBMITTING': {
      return {
        ...state,
        isSubmitting: action.payload,
      };
    }

    case 'RESET_FORM': {
      return initialFormState;
    }

    default:
      return state;
  }
};

const FormWithReducer = () => {
  const [state, dispatch] = useReducer(formReducer, initialFormState);

  const handleFieldChange = (field: keyof FormState['fields'], value: string) => {
    dispatch({ type: 'SET_FIELD_VALUE', payload: { field, value } });
  };

  const handleFieldBlur = (field: keyof FormState['fields']) => {
    dispatch({ type: 'SET_FIELD_TOUCHED', payload: { field, touched: true } });
    dispatch({ type: 'VALIDATE_FIELD', payload: field });
  };

  const handleSubmit = async () => {
    dispatch({ type: 'VALIDATE_ALL' });

    if (state.isValid) {
      dispatch({ type: 'SET_SUBMITTING', payload: true });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('Form submitted:', {
        name: state.fields.name.value,
        email: state.fields.email.value,
        password: state.fields.password.value,
      });

      dispatch({ type: 'RESET_FORM' });
    }
  };

  return (
    <View>
      <Text>Registration Form</Text>

      {/* Name field */}
      <TextInput
        value={state.fields.name.value}
        onChangeText={(value) => handleFieldChange('name', value)}
        onBlur={() => handleFieldBlur('name')}
        placeholder="Enter your name"
      />
      {state.fields.name.touched && state.fields.name.error && (
        <Text style={{ color: 'red' }}>{state.fields.name.error}</Text>
      )}

      {/* Email field */}
      <TextInput
        value={state.fields.email.value}
        onChangeText={(value) => handleFieldChange('email', value)}
        onBlur={() => handleFieldBlur('email')}
        placeholder="Enter your email"
        keyboardType="email-address"
      />
      {state.fields.email.touched && state.fields.email.error && (
        <Text style={{ color: 'red' }}>{state.fields.email.error}</Text>
      )}

      {/* Password field */}
      <TextInput
        value={state.fields.password.value}
        onChangeText={(value) => handleFieldChange('password', value)}
        onBlur={() => handleFieldBlur('password')}
        placeholder="Enter your password"
        secureTextEntry
      />
      {state.fields.password.touched && state.fields.password.error && (
        <Text style={{ color: 'red' }}>{state.fields.password.error}</Text>
      )}

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={state.isSubmitting}
      >
        <Text>{state.isSubmitting ? 'Submitting...' : 'Submit'}</Text>
      </TouchableOpacity>

      <Text>Form Valid: {state.isValid ? 'Yes' : 'No'}</Text>
    </View>
  );
};
```

## useCallback - Memoized Callbacks

`useCallback` returns a memoized version of the callback that only changes if one of the dependencies has changed. This is useful for passing callbacks to optimized child components that rely on reference equality to prevent unnecessary renders.

### Basic Syntax

```typescript
const memoizedCallback = useCallback(
  () => {
    // Your callback logic here
  },
  [dependencies] // Array of dependencies
);
```

### Simple Example

```typescript
import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const ParentComponent = () => {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('John');

  // ❌ Bad: This function is recreated on every render
  const handleClickBad = () => {
    console.log('Button clicked!');
  };

  // ✅ Good: This function is memoized and only recreated when dependencies change
  const handleClickGood = useCallback(() => {
    console.log('Button clicked!');
  }, []); // Empty dependency array = never changes

  // ✅ Good: Function that depends on count
  const handleIncrement = useCallback(() => {
    setCount(prevCount => prevCount + 1);
  }, []); // No dependencies needed since we use functional update

  // ✅ Good: Function that depends on name
  const handleGreet = useCallback(() => {
    alert(`Hello, ${name}!`);
  }, [name]); // Recreated when name changes

  return (
    <View>
      <Text>Count: {count}</Text>
      <Text>Name: {name}</Text>

      <TouchableOpacity onPress={handleClickGood}>
        <Text>Click Me (Memoized)</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleIncrement}>
        <Text>Increment Count</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleGreet}>
        <Text>Greet</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setName('Jane')}>
        <Text>Change Name</Text>
      </TouchableOpacity>
    </View>
  );
};
```

### Optimized Child Components

```typescript
import React, { useState, useCallback, memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

// Memoized child component that only re-renders when props change
const ExpensiveChild = memo(({ onIncrement, onDecrement, count }: {
  onIncrement: () => void;
  onDecrement: () => void;
  count: number;
}) => {
  console.log('ExpensiveChild rendered'); // This will only log when props actually change

  return (
    <View>
      <Text>Count: {count}</Text>
      <TouchableOpacity onPress={onIncrement}>
        <Text>Increment</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onDecrement}>
        <Text>Decrement</Text>
      </TouchableOpacity>
    </View>
  );
});

const ParentWithOptimizedChild = () => {
  const [count, setCount] = useState(0);
  const [otherState, setOtherState] = useState('');

  // ✅ Good: Memoized callbacks that don't change on every render
  const handleIncrement = useCallback(() => {
    setCount(prevCount => prevCount + 1);
  }, []); // Empty dependency array = stable reference

  const handleDecrement = useCallback(() => {
    setCount(prevCount => prevCount - 1);
  }, []); // Empty dependency array = stable reference

  return (
    <View>
      <Text>Other State: {otherState}</Text>

      {/* This child will only re-render when count changes, not when otherState changes */}
      <ExpensiveChild
        count={count}
        onIncrement={handleIncrement}
        onDecrement={handleDecrement}
      />

      <TouchableOpacity onPress={() => setOtherState('Updated')}>
        <Text>Update Other State (won't cause child re-render)</Text>
      </TouchableOpacity>
    </View>
  );
};
```

### API Call with useCallback

```typescript
import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';

const SearchComponent = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Good: Memoized search function that depends on query
  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      // Simulate API call
      const response = await fetch(`https://api.example.com/search?q=${query}`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query]); // Recreated when query changes

  // ✅ Good: Memoized clear function that never changes
  const handleClear = useCallback(() => {
    setQuery('');
    setResults([]);
  }, []); // Empty dependency array = stable reference

  return (
    <View>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Enter search query"
      />

      <TouchableOpacity onPress={handleSearch} disabled={loading}>
        <Text>{loading ? 'Searching...' : 'Search'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleClear}>
        <Text>Clear</Text>
      </TouchableOpacity>

      {/* Display results */}
      {results.map((result: any, index: number) => (
        <Text key={index}>{result.title}</Text>
      ))}
    </View>
  );
};
```

## useMemo - Memoized Values

`useMemo` returns a memoized value that only recalculates when one of the dependencies has changed. This is useful for expensive calculations that you want to avoid repeating on every render.

### Basic Syntax

```typescript
const memoizedValue = useMemo(
  () => {
    // Expensive calculation here
    return computedValue;
  },
  [dependencies] // Array of dependencies
);
```

### Expensive Calculation Example

```typescript
import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const ExpensiveCalculation = () => {
  const [numbers, setNumbers] = useState([1, 2, 3, 4, 5]);
  const [otherState, setOtherState] = useState(0);

  // ❌ Bad: This calculation runs on every render
  const sumBad = numbers.reduce((acc, num) => acc + num, 0);

  // ✅ Good: This calculation only runs when numbers change
  const sumGood = useMemo(() => {
    console.log('Calculating sum...'); // This will only log when numbers change
    return numbers.reduce((acc, num) => acc + num, 0);
  }, [numbers]); // Only recalculate when numbers array changes

  // ✅ Good: Complex calculation that depends on multiple values
  const expensiveValue = useMemo(() => {
    console.log('Running expensive calculation...');
    return numbers.reduce((acc, num) => {
      // Simulate expensive operation
      let result = 0;
      for (let i = 0; i < 1000000; i++) {
        result += num * Math.random();
      }
      return acc + result;
    }, 0);
  }, [numbers]); // Only recalculate when numbers change

  const addNumber = () => {
    setNumbers(prev => [...prev, Math.floor(Math.random() * 100)]);
  };

  const updateOtherState = () => {
    setOtherState(prev => prev + 1);
  };

  return (
    <View>
      <Text>Numbers: {numbers.join(', ')}</Text>
      <Text>Sum (Bad): {sumBad}</Text>
      <Text>Sum (Good): {sumGood}</Text>
      <Text>Expensive Value: {expensiveValue.toFixed(2)}</Text>
      <Text>Other State: {otherState}</Text>

      <TouchableOpacity onPress={addNumber}>
        <Text>Add Random Number</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={updateOtherState}>
        <Text>Update Other State (won't trigger expensive calculation)</Text>
      </TouchableOpacity>
    </View>
  );
};
```

### Filtered and Sorted Data

```typescript
import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, FlatList } from 'react-native';

interface User {
  id: number;
  name: string;
  age: number;
  email: string;
}

const UserList = () => {
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: 'John Doe', age: 25, email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', age: 30, email: 'jane@example.com' },
    { id: 3, name: 'Bob Johnson', age: 35, email: 'bob@example.com' },
    { id: 4, name: 'Alice Brown', age: 28, email: 'alice@example.com' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'age'>('name');
  const [filterAge, setFilterAge] = useState(0);

  // ✅ Good: Memoized filtered and sorted users
  const filteredAndSortedUsers = useMemo(() => {
    console.log('Filtering and sorting users...'); // Only logs when dependencies change

    let result = users;

    // Filter by search term
    if (searchTerm) {
      result = result.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by minimum age
    if (filterAge > 0) {
      result = result.filter(user => user.age >= filterAge);
    }

    // Sort by selected field
    result = [...result].sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else {
        return a.age - b.age;
      }
    });

    return result;
  }, [users, searchTerm, sortBy, filterAge]); // Recalculate when any of these change

  return (
    <View>
      <TextInput
        value={searchTerm}
        onChangeText={setSearchTerm}
        placeholder="Search users..."
      />

      <TouchableOpacity onPress={() => setSortBy(sortBy === 'name' ? 'age' : 'name')}>
        <Text>Sort by: {sortBy}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setFilterAge(filterAge === 0 ? 30 : 0)}>
        <Text>Filter age: {filterAge === 0 ? 'None' : `${filterAge}+`}</Text>
      </TouchableOpacity>

      <Text>Found {filteredAndSortedUsers.length} users</Text>

      <FlatList
        data={filteredAndSortedUsers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View>
            <Text>{item.name} ({item.age})</Text>
            <Text>{item.email}</Text>
          </View>
        )}
      />
    </View>
  );
};
```

### Object and Array Memoization

```typescript
import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const ObjectMemoization = () => {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('John');

  // ❌ Bad: This object is recreated on every render
  const userBad = {
    name,
    count,
    timestamp: Date.now(),
  };

  // ✅ Good: This object is only recreated when name or count changes
  const userGood = useMemo(() => ({
    name,
    count,
    timestamp: Date.now(),
  }), [name, count]);

  // ✅ Good: Memoized array
  const userArray = useMemo(() => [
    { id: 1, name: 'Alice', age: 25 },
    { id: 2, name: 'Bob', age: 30 },
    { id: 3, name: 'Charlie', age: 35 },
  ], []); // Empty dependency array = never changes

  // ✅ Good: Memoized object with computed properties
  const userStats = useMemo(() => ({
    totalUsers: userArray.length,
    averageAge: userArray.reduce((sum, user) => sum + user.age, 0) / userArray.length,
    oldestUser: userArray.reduce((oldest, user) => user.age > oldest.age ? user : oldest),
  }), [userArray]); // Recalculate when userArray changes

  return (
    <View>
      <Text>Count: {count}</Text>
      <Text>Name: {name}</Text>

      <TouchableOpacity onPress={() => setCount(count + 1)}>
        <Text>Increment Count</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setName(name === 'John' ? 'Jane' : 'John')}>
        <Text>Toggle Name</Text>
      </TouchableOpacity>

      <Text>User Object: {JSON.stringify(userGood)}</Text>
      <Text>Total Users: {userStats.totalUsers}</Text>
      <Text>Average Age: {userStats.averageAge.toFixed(1)}</Text>
      <Text>Oldest User: {userStats.oldestUser.name}</Text>
    </View>
  );
};
```

## useRef - Mutable References

`useRef` returns a mutable ref object whose `.current` property is initialized to the passed argument. The returned object will persist for the full lifetime of the component.

### Basic Syntax

```typescript
const ref = useRef(initialValue);
```

### DOM Element Reference

```typescript
import React, { useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

const InputFocus = () => {
  // Create a ref to hold the input element
  const inputRef = useRef<TextInput>(null);

  // Focus the input when component mounts
  useEffect(() => {
    // Access the DOM element through .current
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const focusInput = () => {
    // Programmatically focus the input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const blurInput = () => {
    // Programmatically blur the input
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  return (
    <View>
      <TextInput
        ref={inputRef} // Attach the ref to the input
        placeholder="This input will be focused automatically"
        style={{ borderWidth: 1, padding: 10 }}
      />

      <TouchableOpacity onPress={focusInput}>
        <Text>Focus Input</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={blurInput}>
        <Text>Blur Input</Text>
      </TouchableOpacity>
    </View>
  );
};
```

### Previous Value Tracking

```typescript
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const PreviousValueTracker = () => {
  const [count, setCount] = useState(0);

  // Ref to store the previous value
  const prevCountRef = useRef<number>();

  // Update the ref after render
  useEffect(() => {
    prevCountRef.current = count;
  });

  const prevCount = prevCountRef.current;

  return (
    <View>
      <Text>Current Count: {count}</Text>
      <Text>Previous Count: {prevCount !== undefined ? prevCount : 'None'}</Text>

      <TouchableOpacity onPress={() => setCount(count + 1)}>
        <Text>Increment</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setCount(count - 1)}>
        <Text>Decrement</Text>
      </TouchableOpacity>
    </View>
  );
};
```

### Timer with useRef

```typescript
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const TimerWithRef = () => {
  const [count, setCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // Ref to store the interval ID
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      // Start the timer
      intervalRef.current = setInterval(() => {
        setCount(prevCount => prevCount + 1);
      }, 1000);
    } else {
      // Clear the timer
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const startTimer = () => setIsRunning(true);
  const stopTimer = () => setIsRunning(false);
  const resetTimer = () => {
    setCount(0);
    setIsRunning(false);
  };

  return (
    <View>
      <Text>Timer: {count} seconds</Text>
      <Text>Status: {isRunning ? 'Running' : 'Stopped'}</Text>

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

### Form Validation with useRef

```typescript
import React, { useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

const FormWithRefs = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Refs for form inputs
  const nameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate name
    if (!nameRef.current?.value?.trim()) {
      newErrors.name = 'Name is required';
    }

    // Validate email
    const email = emailRef.current?.value;
    if (!email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    // Validate password
    const password = passwordRef.current?.value;
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);

    // Focus on first field with error
    if (newErrors.name) {
      nameRef.current?.focus();
    } else if (newErrors.email) {
      emailRef.current?.focus();
    } else if (newErrors.password) {
      passwordRef.current?.focus();
    }

    return Object.keys(newErrors).length === 0;
  };

  const clearForm = () => {
    // Clear all inputs
    if (nameRef.current) nameRef.current.clear();
    if (emailRef.current) emailRef.current.clear();
    if (passwordRef.current) passwordRef.current.clear();

    // Clear errors
    setErrors({});

    // Focus on name input
    nameRef.current?.focus();
  };

  return (
    <View>
      <TextInput
        ref={nameRef}
        placeholder="Enter your name"
        style={{ borderWidth: 1, padding: 10, margin: 5 }}
      />
      {errors.name && <Text style={{ color: 'red' }}>{errors.name}</Text>}

      <TextInput
        ref={emailRef}
        placeholder="Enter your email"
        keyboardType="email-address"
        style={{ borderWidth: 1, padding: 10, margin: 5 }}
      />
      {errors.email && <Text style={{ color: 'red' }}>{errors.email}</Text>}

      <TextInput
        ref={passwordRef}
        placeholder="Enter your password"
        secureTextEntry
        style={{ borderWidth: 1, padding: 10, margin: 5 }}
      />
      {errors.password && <Text style={{ color: 'red' }}>{errors.password}</Text>}

      <TouchableOpacity onPress={validateForm}>
        <Text>Validate Form</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={clearForm}>
        <Text>Clear Form</Text>
      </TouchableOpacity>
    </View>
  );
};
```

## Performance Optimization Patterns

### Combining useCallback and useMemo

```typescript
import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const OptimizedComponent = () => {
  const [count, setCount] = useState(0);
  const [items, setItems] = useState([1, 2, 3, 4, 5]);

  // ✅ Good: Memoized expensive calculation
  const expensiveValue = useMemo(() => {
    console.log('Calculating expensive value...');
    return items.reduce((sum, item) => sum + item * count, 0);
  }, [items, count]);

  // ✅ Good: Memoized callback that depends on expensiveValue
  const handleClick = useCallback(() => {
    console.log('Button clicked with value:', expensiveValue);
    alert(`Current value: ${expensiveValue}`);
  }, [expensiveValue]); // Recreated when expensiveValue changes

  // ✅ Good: Memoized callback that never changes
  const handleReset = useCallback(() => {
    setCount(0);
    setItems([1, 2, 3, 4, 5]);
  }, []); // Empty dependency array = stable reference

  return (
    <View>
      <Text>Count: {count}</Text>
      <Text>Items: {items.join(', ')}</Text>
      <Text>Expensive Value: {expensiveValue}</Text>

      <TouchableOpacity onPress={handleClick}>
        <Text>Show Value</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleReset}>
        <Text>Reset</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setCount(count + 1)}>
        <Text>Increment Count</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setItems([...items, items.length + 1])}>
        <Text>Add Item</Text>
      </TouchableOpacity>
    </View>
  );
};
```

## Common Pitfalls

### 1. useCallback Pitfalls

```typescript
// ❌ Wrong: Missing dependencies
const [count, setCount] = useState(0);
const [name, setName] = useState("");

const handleClick = useCallback(() => {
  console.log(`Count: ${count}, Name: ${name}`);
}, [count]); // Missing 'name' dependency!

// ✅ Correct: Include all dependencies
const handleClick = useCallback(() => {
  console.log(`Count: ${count}, Name: ${name}`);
}, [count, name]);

// ❌ Wrong: Unnecessary useCallback
const simpleHandler = useCallback(() => {
  console.log("Hello");
}, []); // This is overkill for a simple function

// ✅ Correct: Just use a regular function
const simpleHandler = () => {
  console.log("Hello");
};
```

### 2. useMemo Pitfalls

```typescript
// ❌ Wrong: Memoizing simple calculations
const [count, setCount] = useState(0);
const doubled = useMemo(() => count * 2, [count]); // Unnecessary

// ✅ Correct: Just calculate directly
const doubled = count * 2;

// ❌ Wrong: Missing dependencies
const [items, setItems] = useState([]);
const [filter, setFilter] = useState("");

const filteredItems = useMemo(() => {
  return items.filter((item) => item.includes(filter));
}, [items]); // Missing 'filter' dependency!

// ✅ Correct: Include all dependencies
const filteredItems = useMemo(() => {
  return items.filter((item) => item.includes(filter));
}, [items, filter]);
```

### 3. useRef Pitfalls

```typescript
// ❌ Wrong: Mutating ref during render
const Component = () => {
  const ref = useRef(0);
  ref.current = ref.current + 1; // This can cause issues

  return <div>{ref.current}</div>;
};

// ✅ Correct: Use ref for values that don't affect rendering
const Component = () => {
  const ref = useRef(0);

  useEffect(() => {
    ref.current = ref.current + 1; // Safe to mutate in effects
  });

  return <div>{ref.current}</div>;
};

// ❌ Wrong: Using ref instead of state for values that should trigger re-renders
const Component = () => {
  const countRef = useRef(0);

  const increment = () => {
    countRef.current += 1; // This won't trigger a re-render!
  };

  return <div>{countRef.current}</div>;
};

// ✅ Correct: Use state for values that should trigger re-renders
const Component = () => {
  const [count, setCount] = useState(0);

  const increment = () => {
    setCount(count + 1); // This will trigger a re-render
  };

  return <div>{count}</div>;
};
```

This comprehensive guide covers the four additional React hooks with detailed explanations, practical examples, and best practices. Each concept is thoroughly commented to help you understand when and how to use these hooks effectively.
