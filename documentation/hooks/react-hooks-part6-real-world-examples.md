# React Hooks Part 6: Real-World Examples

## Table of Contents

1. [Form Handling with Hooks](#form-handling-with-hooks)
2. [API Integration Patterns](#api-integration-patterns)
3. [Animation and Transitions](#animation-and-transitions)
4. [Device-Specific Hooks](#device-specific-hooks)
5. [Authentication Patterns](#authentication-patterns)
6. [Data Management](#data-management)
7. [Navigation and Routing](#navigation-and-routing)
8. [Error Handling](#error-handling)
9. [Testing Patterns](#testing-patterns)
10. [Production Patterns](#production-patterns)

## Form Handling with Hooks

### Custom Form Hook

```typescript
import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';

interface FormField {
  value: string;
  error: string;
  touched: boolean;
}

interface FormState {
  [key: string]: FormField;
}

interface ValidationRules {
  [key: string]: (value: string) => string;
}

const useForm = (initialValues: Record<string, string>, validationRules?: ValidationRules) => {
  const [formState, setFormState] = useState<FormState>(() => {
    // Initialize form state
    const state: FormState = {};
    Object.keys(initialValues).forEach(key => {
      state[key] = {
        value: initialValues[key],
        error: '',
        touched: false,
      };
    });
    return state;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update field value
  const setFieldValue = useCallback((field: string, value: string) => {
    setFormState(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        value,
        error: '', // Clear error when user types
      },
    }));
  }, []);

  // Mark field as touched
  const setFieldTouched = useCallback((field: string, touched: boolean = true) => {
    setFormState(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        touched,
      },
    }));
  }, []);

  // Validate single field
  const validateField = useCallback((field: string) => {
    if (!validationRules || !validationRules[field]) return '';

    const value = formState[field].value;
    const error = validationRules[field](value);

    setFormState(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        error,
      },
    }));

    return error;
  }, [formState, validationRules]);

  // Validate all fields
  const validateForm = useCallback(() => {
    if (!validationRules) return true;

    const errors: Record<string, string> = {};
    let isValid = true;

    Object.keys(validationRules).forEach(field => {
      const error = validateField(field);
      if (error) {
        errors[field] = error;
        isValid = false;
      }
    });

    return isValid;
  }, [validateField, validationRules]);

  // Get form values
  const getFormValues = useMemo(() => {
    const values: Record<string, string> = {};
    Object.keys(formState).forEach(key => {
      values[key] = formState[key].value;
    });
    return values;
  }, [formState]);

  // Check if form is valid
  const isValid = useMemo(() => {
    return Object.values(formState).every(field => !field.error);
  }, [formState]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormState(() => {
      const state: FormState = {};
      Object.keys(initialValues).forEach(key => {
        state[key] = {
          value: initialValues[key],
          error: '',
          touched: false,
        };
      });
      return state;
    });
  }, [initialValues]);

  return {
    formState,
    setFieldValue,
    setFieldTouched,
    validateField,
    validateForm,
    getFormValues,
    isValid,
    isSubmitting,
    setIsSubmitting,
    resetForm,
  };
};

// Usage example
const RegistrationForm = () => {
  const validationRules: ValidationRules = {
    name: (value) => {
      if (!value.trim()) return 'Name is required';
      if (value.length < 2) return 'Name must be at least 2 characters';
      return '';
    },
    email: (value) => {
      if (!value.trim()) return 'Email is required';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return 'Email is invalid';
      return '';
    },
    password: (value) => {
      if (!value) return 'Password is required';
      if (value.length < 6) return 'Password must be at least 6 characters';
      return '';
    },
    confirmPassword: (value) => {
      const password = form.getFormValues().password;
      if (!value) return 'Please confirm your password';
      if (value !== password) return 'Passwords do not match';
      return '';
    },
  };

  const form = useForm({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  }, validationRules);

  const handleSubmit = async () => {
    // Mark all fields as touched
    Object.keys(form.formState).forEach(field => {
      form.setFieldTouched(field);
    });

    // Validate form
    if (!form.validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }

    form.setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      Alert.alert('Success', 'Registration successful!');
      form.resetForm();
    } catch (error) {
      Alert.alert('Error', 'Registration failed. Please try again.');
    } finally {
      form.setIsSubmitting(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        Registration Form
      </Text>

      {/* Name Field */}
      <View style={{ marginBottom: 15 }}>
        <Text>Name:</Text>
        <TextInput
          value={form.formState.name.value}
          onChangeText={(value) => form.setFieldValue('name', value)}
          onBlur={() => {
            form.setFieldTouched('name');
            form.validateField('name');
          }}
          placeholder="Enter your name"
          style={{
            borderWidth: 1,
            borderColor: form.formState.name.touched && form.formState.name.error ? 'red' : '#ccc',
            padding: 10,
            marginTop: 5,
          }}
        />
        {form.formState.name.touched && form.formState.name.error && (
          <Text style={{ color: 'red', fontSize: 12, marginTop: 5 }}>
            {form.formState.name.error}
          </Text>
        )}
      </View>

      {/* Email Field */}
      <View style={{ marginBottom: 15 }}>
        <Text>Email:</Text>
        <TextInput
          value={form.formState.email.value}
          onChangeText={(value) => form.setFieldValue('email', value)}
          onBlur={() => {
            form.setFieldTouched('email');
            form.validateField('email');
          }}
          placeholder="Enter your email"
          keyboardType="email-address"
          style={{
            borderWidth: 1,
            borderColor: form.formState.email.touched && form.formState.email.error ? 'red' : '#ccc',
            padding: 10,
            marginTop: 5,
          }}
        />
        {form.formState.email.touched && form.formState.email.error && (
          <Text style={{ color: 'red', fontSize: 12, marginTop: 5 }}>
            {form.formState.email.error}
          </Text>
        )}
      </View>

      {/* Password Field */}
      <View style={{ marginBottom: 15 }}>
        <Text>Password:</Text>
        <TextInput
          value={form.formState.password.value}
          onChangeText={(value) => form.setFieldValue('password', value)}
          onBlur={() => {
            form.setFieldTouched('password');
            form.validateField('password');
          }}
          placeholder="Enter your password"
          secureTextEntry
          style={{
            borderWidth: 1,
            borderColor: form.formState.password.touched && form.formState.password.error ? 'red' : '#ccc',
            padding: 10,
            marginTop: 5,
          }}
        />
        {form.formState.password.touched && form.formState.password.error && (
          <Text style={{ color: 'red', fontSize: 12, marginTop: 5 }}>
            {form.formState.password.error}
          </Text>
        )}
      </View>

      {/* Confirm Password Field */}
      <View style={{ marginBottom: 20 }}>
        <Text>Confirm Password:</Text>
        <TextInput
          value={form.formState.confirmPassword.value}
          onChangeText={(value) => form.setFieldValue('confirmPassword', value)}
          onBlur={() => {
            form.setFieldTouched('confirmPassword');
            form.validateField('confirmPassword');
          }}
          placeholder="Confirm your password"
          secureTextEntry
          style={{
            borderWidth: 1,
            borderColor: form.formState.confirmPassword.touched && form.formState.confirmPassword.error ? 'red' : '#ccc',
            padding: 10,
            marginTop: 5,
          }}
        />
        {form.formState.confirmPassword.touched && form.formState.confirmPassword.error && (
          <Text style={{ color: 'red', fontSize: 12, marginTop: 5 }}>
            {form.formState.confirmPassword.error}
          </Text>
        )}
      </View>

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={form.isSubmitting || !form.isValid}
        style={{
          backgroundColor: form.isSubmitting || !form.isValid ? '#ccc' : '#007AFF',
          padding: 15,
          borderRadius: 5,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>
          {form.isSubmitting ? 'Submitting...' : 'Register'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
```

## API Integration Patterns

### Custom API Hook

```typescript
import { useState, useEffect, useCallback, useRef } from 'react';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface ApiOptions {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  retryCount?: number;
  retryDelay?: number;
}

const useApi = <T>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: ApiOptions = {}
) => {
  const {
    immediate = true,
    onSuccess,
    onError,
    retryCount = 3,
    retryDelay = 1000,
  } = options;

  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const abortControllerRef = useRef<AbortController>();
  const retryCountRef = useRef(0);

  const execute = useCallback(async (...args: any[]) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    retryCountRef.current = 0;

    setState({
      data: null,
      loading: true,
      error: null,
    });

    const attemptRequest = async (): Promise<T> => {
      try {
        const data = await apiFunction(...args);
        return data;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw error;
        }

        if (retryCountRef.current < retryCount) {
          retryCountRef.current++;
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          return attemptRequest();
        }

        throw error;
      }
    };

    try {
      const data = await attemptRequest();

      setState({
        data,
        loading: false,
        error: null,
      });

      onSuccess?.(data);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }

      setState({
        data: null,
        loading: false,
        error: error as Error,
      });

      onError?.(error as Error);
    }
  }, [apiFunction, retryCount, retryDelay, onSuccess, onError]);

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
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [execute, immediate]);

  return {
    ...state,
    execute,
    cancel,
  };
};

// Usage example
const UserProfile = ({ userId }: { userId: string }) => {
  const fetchUser = async (signal?: AbortSignal) => {
    const response = await fetch(`https://api.example.com/users/${userId}`, {
      signal,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }

    return response.json();
  };

  const { data: user, loading, error, execute: refetch, cancel } = useApi(fetchUser, {
    immediate: true,
    retryCount: 2,
    onSuccess: (data) => console.log('User loaded:', data),
    onError: (error) => console.error('Failed to load user:', error),
  });

  if (loading) {
    return (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <Text>Loading user...</Text>
        <TouchableOpacity onPress={cancel}>
          <Text>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <Text style={{ color: 'red' }}>Error: {error.message}</Text>
        <TouchableOpacity onPress={() => refetch()}>
          <Text>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!user) {
    return <Text>No user found</Text>;
  }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{user.name}</Text>
      <Text>Email: {user.email}</Text>
      <TouchableOpacity onPress={() => refetch()}>
        <Text>Refresh</Text>
      </TouchableOpacity>
    </View>
  );
};
```

## Animation and Transitions

### Custom Animation Hook

```typescript
import { useRef, useEffect, useCallback } from 'react';
import { Animated, Easing } from 'react-native';

interface AnimationConfig {
  duration?: number;
  easing?: any;
  useNativeDriver?: boolean;
}

const useAnimation = (initialValue: number = 0, config: AnimationConfig = {}) => {
  const {
    duration = 300,
    easing = Easing.out(Easing.cubic),
    useNativeDriver = true,
  } = config;

  const animatedValue = useRef(new Animated.Value(initialValue)).current;

  const animateTo = useCallback((toValue: number, customDuration?: number) => {
    return new Promise<void>((resolve) => {
      Animated.timing(animatedValue, {
        toValue,
        duration: customDuration || duration,
        easing,
        useNativeDriver,
      }).start(resolve);
    });
  }, [animatedValue, duration, easing, useNativeDriver]);

  const animateSequence = useCallback((sequence: Array<{ toValue: number; duration?: number }>) => {
    const animations = sequence.map(({ toValue, duration: seqDuration }) =>
      Animated.timing(animatedValue, {
        toValue,
        duration: seqDuration || duration,
        easing,
        useNativeDriver,
      })
    );

    return new Promise<void>((resolve) => {
      Animated.sequence(animations).start(resolve);
    });
  }, [animatedValue, duration, easing, useNativeDriver]);

  const animateParallel = useCallback((animations: Array<{ toValue: number; duration?: number }>) => {
    const anims = animations.map(({ toValue, duration: animDuration }) =>
      Animated.timing(animatedValue, {
        toValue,
        duration: animDuration || duration,
        easing,
        useNativeDriver,
      })
    );

    return new Promise<void>((resolve) => {
      Animated.parallel(anims).start(resolve);
    });
  }, [animatedValue, duration, easing, useNativeDriver]);

  const springTo = useCallback((toValue: number, config?: any) => {
    return new Promise<void>((resolve) => {
      Animated.spring(animatedValue, {
        toValue,
        useNativeDriver,
        ...config,
      }).start(resolve);
    });
  }, [animatedValue, useNativeDriver]);

  return {
    animatedValue,
    animateTo,
    animateSequence,
    animateParallel,
    springTo,
  };
};

// Usage example
const AnimatedCard = () => {
  const [isVisible, setIsVisible] = useState(false);
  const scale = useAnimation(0);
  const opacity = useAnimation(0);
  const translateY = useAnimation(100);

  const showCard = async () => {
    setIsVisible(true);

    // Animate all properties in parallel
    await Promise.all([
      scale.animateTo(1),
      opacity.animateTo(1),
      translateY.animateTo(0),
    ]);
  };

  const hideCard = async () => {
    // Animate all properties in parallel
    await Promise.all([
      scale.animateTo(0),
      opacity.animateTo(0),
      translateY.animateTo(100),
    ]);

    setIsVisible(false);
  };

  const bounceCard = async () => {
    await scale.animateSequence([
      { toValue: 1.2, duration: 150 },
      { toValue: 0.9, duration: 150 },
      { toValue: 1, duration: 150 },
    ]);
  };

  return (
    <View style={{ padding: 20 }}>
      <TouchableOpacity onPress={showCard}>
        <Text>Show Card</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={hideCard}>
        <Text>Hide Card</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={bounceCard}>
        <Text>Bounce Card</Text>
      </TouchableOpacity>

      {isVisible && (
        <Animated.View
          style={{
            width: 200,
            height: 150,
            backgroundColor: '#007AFF',
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
            transform: [
              { scale: scale.animatedValue },
              { translateY: translateY.animatedValue },
            ],
            opacity: opacity.animatedValue,
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>
            Animated Card
          </Text>
        </Animated.View>
      )}
    </View>
  );
};
```

## Device-Specific Hooks

### Device Information Hook

```typescript
import { useState, useEffect } from 'react';
import { Dimensions, Platform, StatusBar } from 'react-native';

interface DeviceInfo {
  platform: 'ios' | 'android' | 'web';
  screenWidth: number;
  screenHeight: number;
  statusBarHeight: number;
  isTablet: boolean;
  isLandscape: boolean;
  orientation: 'portrait' | 'landscape';
}

const useDeviceInfo = () => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    const { width, height } = Dimensions.get('screen');
    const isLandscape = width > height;

    return {
      platform: Platform.OS as 'ios' | 'android' | 'web',
      screenWidth: width,
      screenHeight: height,
      statusBarHeight: StatusBar.currentHeight || 0,
      isTablet: width >= 768,
      isLandscape,
      orientation: isLandscape ? 'landscape' : 'portrait',
    };
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ screen }) => {
      const { width, height } = screen;
      const isLandscape = width > height;

      setDeviceInfo(prev => ({
        ...prev,
        screenWidth: width,
        screenHeight: height,
        isTablet: width >= 768,
        isLandscape,
        orientation: isLandscape ? 'landscape' : 'portrait',
      }));
    });

    return () => subscription?.remove();
  }, []);

  return deviceInfo;
};

// Usage
const ResponsiveComponent = () => {
  const device = useDeviceInfo();

  return (
    <View style={{
      padding: device.isTablet ? 40 : 20,
      backgroundColor: device.platform === 'ios' ? '#f0f0f0' : '#ffffff',
    }}>
      <Text>Platform: {device.platform}</Text>
      <Text>Screen: {device.screenWidth} x {device.screenHeight}</Text>
      <Text>Device: {device.isTablet ? 'Tablet' : 'Phone'}</Text>
      <Text>Orientation: {device.orientation}</Text>
    </View>
  );
};
```

### Network Status Hook

```typescript
import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string | null;
  isWifi: boolean;
  isCellular: boolean;
}

const useNetworkStatus = () => {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: true,
    isInternetReachable: true,
    type: null,
    isWifi: false,
    isCellular: false,
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setNetworkState({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        isWifi: state.type === 'wifi',
        isCellular: state.type === 'cellular',
      });
    });

    return () => unsubscribe();
  }, []);

  return networkState;
};

// Usage
const NetworkAwareComponent = () => {
  const network = useNetworkStatus();

  if (!network.isConnected) {
    return (
      <View style={{ padding: 20, backgroundColor: '#ffebee' }}>
        <Text style={{ color: '#c62828' }}>No internet connection</Text>
      </View>
    );
  }

  return (
    <View style={{ padding: 20 }}>
      <Text>Connection Type: {network.type}</Text>
      <Text>WiFi: {network.isWifi ? 'Yes' : 'No'}</Text>
      <Text>Cellular: {network.isCellular ? 'Yes' : 'No'}</Text>
    </View>
  );
};
```

## Authentication Patterns

### Authentication Hook

```typescript
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  name: string;
  token: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Check for existing token on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userData = await AsyncStorage.getItem('userData');

      if (token && userData) {
        const user = JSON.parse(userData);
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      // Simulate API call
      const response = await fetch('https://api.example.com/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const { user, token } = await response.json();

      // Store auth data
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));

      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
      });

      return { success: true };
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: error.message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Clear stored data
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');

      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      // Simulate API call
      const response = await fetch('https://api.example.com/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const { user, token } = await response.json();

      // Store auth data
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));

      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
      });

      return { success: true };
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: error.message };
    }
  }, []);

  return {
    ...authState,
    login,
    logout,
    register,
    checkAuthStatus,
  };
};

// Usage
const AuthComponent = () => {
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={login} />;
  }

  return (
    <View>
      <Text>Welcome, {user?.name}!</Text>
      <TouchableOpacity onPress={logout}>
        <Text>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};
```

## Data Management

### Custom Data Store Hook

```typescript
import { useState, useCallback, useMemo } from 'react';

interface DataStore<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
  addItem: (item: T) => void;
  updateItem: (id: string, updates: Partial<T>) => void;
  removeItem: (id: string) => void;
  clearAll: () => void;
  getItem: (id: string) => T | undefined;
  filter: (predicate: (item: T) => boolean) => T[];
  sort: (key: keyof T, direction: 'asc' | 'desc') => void;
}

const useDataStore = <T extends { id: string }>(initialData: T[] = []): DataStore<T> => {
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const addItem = useCallback((item: T) => {
    setData(prev => [...prev, item]);
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<T>) => {
    setData(prev =>
      prev.map(item =>
        item.id === id ? { ...item, ...updates } : item
      )
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setData(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setData([]);
  }, []);

  const getItem = useCallback((id: string) => {
    return data.find(item => item.id === id);
  }, [data]);

  const filter = useCallback((predicate: (item: T) => boolean) => {
    return data.filter(predicate);
  }, [data]);

  const sort = useCallback((key: keyof T, direction: 'asc' | 'desc' = 'asc') => {
    setData(prev =>
      [...prev].sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];

        if (aVal < bVal) return direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return direction === 'asc' ? 1 : -1;
        return 0;
      })
    );
  }, []);

  const store = useMemo(() => ({
    data,
    loading,
    error,
    addItem,
    updateItem,
    removeItem,
    clearAll,
    getItem,
    filter,
    sort,
  }), [data, loading, error, addItem, updateItem, removeItem, clearAll, getItem, filter, sort]);

  return store;
};

// Usage
const TodoList = () => {
  const todoStore = useDataStore([
    { id: '1', title: 'Learn React Hooks', completed: false, priority: 'high' },
    { id: '2', title: 'Build an app', completed: false, priority: 'medium' },
    { id: '3', title: 'Write documentation', completed: true, priority: 'low' },
  ]);

  const highPriorityTodos = todoStore.filter(todo => todo.priority === 'high');
  const completedTodos = todoStore.filter(todo => todo.completed);

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Todo List</Text>

      <Text>Total: {todoStore.data.length}</Text>
      <Text>High Priority: {highPriorityTodos.length}</Text>
      <Text>Completed: {completedTodos.length}</Text>

      {todoStore.data.map(todo => (
        <View key={todo.id} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
          <Text style={{ flex: 1 }}>{todo.title}</Text>
          <Text style={{ marginHorizontal: 10 }}>{todo.priority}</Text>
          <TouchableOpacity
            onPress={() => todoStore.updateItem(todo.id, { completed: !todo.completed })}
            style={{
              backgroundColor: todo.completed ? 'green' : 'gray',
              padding: 5,
              borderRadius: 3,
            }}
          >
            <Text style={{ color: 'white' }}>{todo.completed ? '✓' : '○'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => todoStore.removeItem(todo.id)}
            style={{ marginLeft: 10 }}
          >
            <Text style={{ color: 'red' }}>×</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity
        onPress={() => todoStore.sort('priority', 'asc')}
        style={{ marginTop: 20 }}
      >
        <Text>Sort by Priority</Text>
      </TouchableOpacity>
    </View>
  );
};
```

This comprehensive guide covers real-world React hooks examples with detailed explanations, practical patterns, and production-ready code. Each section includes thorough comments to help you understand the implementation and apply these patterns to your own projects.
