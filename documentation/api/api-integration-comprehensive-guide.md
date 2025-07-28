# React Native API Integration & Data Fetching Comprehensive Guide

## Table of Contents

1. [Introduction & Setup](#introduction--setup)
2. [REST API Integration](#rest-api-integration)
3. [GraphQL Integration](#graphql-integration)
4. [State Management with APIs](#state-management-with-apis)
5. [Error Handling & Retry Logic](#error-handling--retry-logic)
6. [Caching Strategies](#caching-strategies)
7. [Offline Support](#offline-support)
8. [Performance Optimization](#performance-optimization)
9. [Security & Authentication](#security--authentication)
10. [Real-World Examples](#real-world-examples)

## Introduction & Setup

### Basic Fetch Setup

```javascript
// api/config.js
const API_BASE_URL = "https://api.yourbackend.com";
const API_TIMEOUT = 10000;

export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};
```

### Custom Fetch Client

```javascript
// api/client.js
class ApiClient {
  constructor(config) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout;
    this.defaultHeaders = config.headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      ...this.defaultHeaders,
      ...options.headers,
    };

    const config = {
      method: options.method || "GET",
      headers,
      timeout: this.timeout,
      ...options,
    };

    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data, status: response.status };
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("Request timeout");
      }
      throw error;
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "GET" });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: "POST", body });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: "PUT", body });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "DELETE" });
  }

  patch(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: "PATCH", body });
  }
}

export const apiClient = new ApiClient(apiConfig);
```

## REST API Integration

### 1. Basic API Service

```javascript
// api/services/taskService.js
import { apiClient } from "../client";

export class TaskService {
  static async getTasks(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/tasks${queryString ? `?${queryString}` : ""}`;

    return apiClient.get(endpoint);
  }

  static async getTaskById(id) {
    return apiClient.get(`/tasks/${id}`);
  }

  static async createTask(taskData) {
    return apiClient.post("/tasks", taskData);
  }

  static async updateTask(id, taskData) {
    return apiClient.put(`/tasks/${id}`, taskData);
  }

  static async deleteTask(id) {
    return apiClient.delete(`/tasks/${id}`);
  }

  static async completeTask(id) {
    return apiClient.patch(`/tasks/${id}/complete`);
  }
}
```

### 2. Custom Hooks for API Calls

```javascript
// hooks/useApi.js
import { useState, useEffect, useCallback } from "react";

export const useApi = (apiCall, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiCall(...args);
        setData(result.data);
        return result;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiCall]
  );

  return { data, loading, error, execute };
};

// Usage
const useTasks = () => {
  return useApi(TaskService.getTasks);
};

const useTask = (id) => {
  return useApi(() => TaskService.getTaskById(id), [id]);
};
```

### 3. Optimistic Updates

```javascript
// hooks/useOptimisticUpdate.js
import { useState, useCallback } from "react";

export const useOptimisticUpdate = (apiCall) => {
  const [optimisticData, setOptimisticData] = useState(null);

  const executeWithOptimisticUpdate = useCallback(
    async (data, optimisticData) => {
      // Set optimistic data immediately
      setOptimisticData(optimisticData);

      try {
        const result = await apiCall(data);
        setOptimisticData(null);
        return result;
      } catch (error) {
        // Revert optimistic update on error
        setOptimisticData(null);
        throw error;
      }
    },
    [apiCall]
  );

  return { optimisticData, executeWithOptimisticUpdate };
};

// Usage in component
const TaskList = () => {
  const { data: tasks, loading, execute: fetchTasks } = useTasks();
  const { optimisticData, executeWithOptimisticUpdate } = useOptimisticUpdate(
    TaskService.createTask
  );

  const handleCreateTask = async (taskData) => {
    const optimisticTask = {
      id: `temp-${Date.now()}`,
      ...taskData,
      status: "pending",
    };

    await executeWithOptimisticUpdate(taskData, optimisticTask);
    fetchTasks(); // Refresh the list
  };

  const displayTasks = optimisticData ? [optimisticData, ...tasks] : tasks;

  return (
    <FlatList
      data={displayTasks}
      renderItem={({ item }) => (
        <TaskItem task={item} isOptimistic={item.id.startsWith("temp-")} />
      )}
    />
  );
};
```

## GraphQL Integration

### 1. Apollo Client Setup

```javascript
// api/apollo.js
import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const httpLink = createHttpLink({
  uri: "https://api.yourbackend.com/graphql",
});

const authLink = setContext((_, { headers }) => {
  const token = AsyncStorage.getItem("authToken");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: "all",
    },
    query: {
      errorPolicy: "all",
    },
  },
});
```

### 2. GraphQL Queries and Mutations

```javascript
// api/graphql/tasks.js
import { gql } from "@apollo/client";

export const GET_TASKS = gql`
  query GetTasks($filter: TaskFilter) {
    tasks(filter: $filter) {
      id
      title
      description
      status
      priority
      createdAt
      updatedAt
    }
  }
`;

export const GET_TASK = gql`
  query GetTask($id: ID!) {
    task(id: $id) {
      id
      title
      description
      status
      priority
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_TASK = gql`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      id
      title
      description
      status
      priority
      createdAt
    }
  }
`;

export const UPDATE_TASK = gql`
  mutation UpdateTask($id: ID!, $input: UpdateTaskInput!) {
    updateTask(id: $id, input: $input) {
      id
      title
      description
      status
      priority
      updatedAt
    }
  }
`;
```

### 3. Custom Hooks for GraphQL

```javascript
// hooks/useGraphQL.js
import { useQuery, useMutation, useApolloClient } from "@apollo/client";

export const useTasks = (filter = {}) => {
  return useQuery(GET_TASKS, {
    variables: { filter },
    fetchPolicy: "cache-and-network",
  });
};

export const useTask = (id) => {
  return useQuery(GET_TASK, {
    variables: { id },
    skip: !id,
  });
};

export const useCreateTask = () => {
  const [createTask, { loading, error }] = useMutation(CREATE_TASK);
  const client = useApolloClient();

  const execute = async (taskData) => {
    try {
      const result = await createTask({
        variables: { input: taskData },
        update: (cache, { data }) => {
          // Update cache after mutation
          const existingTasks = cache.readQuery({
            query: GET_TASKS,
          });

          if (existingTasks) {
            cache.writeQuery({
              query: GET_TASKS,
              data: {
                tasks: [data.createTask, ...existingTasks.tasks],
              },
            });
          }
        },
      });
      return result;
    } catch (error) {
      console.error("Create task error:", error);
      throw error;
    }
  };

  return { createTask: execute, loading, error };
};
```

## State Management with APIs

### 1. Zustand with API Integration

```javascript
// store/taskStore.js
import { create } from "zustand";
import { TaskService } from "../api/services/taskService";

export const useTaskStore = create((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  // Actions
  fetchTasks: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const { data } = await TaskService.getTasks(params);
      set({ tasks: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  createTask: async (taskData) => {
    set({ loading: true, error: null });
    try {
      const { data } = await TaskService.createTask(taskData);
      set((state) => ({
        tasks: [data, ...state.tasks],
        loading: false,
      }));
      return data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateTask: async (id, taskData) => {
    set({ loading: true, error: null });
    try {
      const { data } = await TaskService.updateTask(id, taskData);
      set((state) => ({
        tasks: state.tasks.map((task) => (task.id === id ? data : task)),
        loading: false,
      }));
      return data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteTask: async (id) => {
    set({ loading: true, error: null });
    try {
      await TaskService.deleteTask(id);
      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Optimistic updates
  optimisticCreateTask: (taskData) => {
    const optimisticTask = {
      id: `temp-${Date.now()}`,
      ...taskData,
      status: "pending",
    };
    set((state) => ({
      tasks: [optimisticTask, ...state.tasks],
    }));
    return optimisticTask;
  },

  removeOptimisticTask: (tempId) => {
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== tempId),
    }));
  },
}));
```

### 2. React Query Integration

```javascript
// hooks/useReactQuery.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TaskService } from "../api/services/taskService";

export const useTasks = (params = {}) => {
  return useQuery({
    queryKey: ["tasks", params],
    queryFn: () => TaskService.getTasks(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useTask = (id) => {
  return useQuery({
    queryKey: ["task", id],
    queryFn: () => TaskService.getTaskById(id),
    enabled: !!id,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: TaskService.createTask,
    onSuccess: (data) => {
      // Invalidate and refetch tasks
      queryClient.invalidateQueries({ queryKey: ["tasks"] });

      // Update cache optimistically
      queryClient.setQueryData(["tasks"], (oldData) => {
        if (oldData) {
          return {
            ...oldData,
            data: [data.data, ...oldData.data],
          };
        }
        return oldData;
      });
    },
    onError: (error) => {
      console.error("Create task error:", error);
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => TaskService.updateTask(id, data),
    onSuccess: (data, variables) => {
      // Update specific task cache
      queryClient.setQueryData(["task", variables.id], data);

      // Update tasks list cache
      queryClient.setQueryData(["tasks"], (oldData) => {
        if (oldData) {
          return {
            ...oldData,
            data: oldData.data.map((task) =>
              task.id === variables.id ? data.data : task
            ),
          };
        }
        return oldData;
      });
    },
  });
};
```

## Error Handling & Retry Logic

### 1. Advanced Error Handling

```javascript
// utils/errorHandler.js
export class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export const handleApiError = (error) => {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 401:
        // Handle unauthorized
        return { type: "UNAUTHORIZED", message: "Please login again" };
      case 403:
        // Handle forbidden
        return { type: "FORBIDDEN", message: "You don't have permission" };
      case 404:
        // Handle not found
        return { type: "NOT_FOUND", message: "Resource not found" };
      case 500:
        // Handle server error
        return {
          type: "SERVER_ERROR",
          message: "Server error, try again later",
        };
      default:
        return { type: "UNKNOWN", message: error.message };
    }
  }

  if (error.name === "NetworkError") {
    return { type: "NETWORK_ERROR", message: "Check your internet connection" };
  }

  return { type: "UNKNOWN", message: "An unexpected error occurred" };
};
```

### 2. Retry Logic

```javascript
// utils/retry.js
export const retry = async (fn, maxAttempts = 3, delay = 1000) => {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxAttempts) {
        throw error;
      }

      // Exponential backoff
      const waitTime = delay * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
};

// Enhanced API client with retry
class ApiClientWithRetry extends ApiClient {
  async request(endpoint, options = {}) {
    const retryConfig = options.retry || { maxAttempts: 3, delay: 1000 };

    return retry(
      () => super.request(endpoint, options),
      retryConfig.maxAttempts,
      retryConfig.delay
    );
  }
}
```

### 3. Error Boundary for API Errors

```javascript
// components/ApiErrorBoundary.js
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

class ApiErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("API Error Boundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>
            {this.state.error?.message || "An unexpected error occurred"}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={this.handleRetry}
          >
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
```

## Caching Strategies

### 1. In-Memory Caching

```javascript
// utils/cache.js
class Cache {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  set(key, value, ttl = 5 * 60 * 1000) {
    // 5 minutes default
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    const isExpired = Date.now() - item.timestamp > item.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  clear() {
    this.cache.clear();
  }
}

export const apiCache = new Cache();
```

### 2. Persistent Caching with AsyncStorage

```javascript
// utils/persistentCache.js
import AsyncStorage from "@react-native-async-storage/async-storage";

class PersistentCache {
  async set(key, value, ttl = 24 * 60 * 60 * 1000) {
    // 24 hours default
    const item = {
      value,
      timestamp: Date.now(),
      ttl,
    };

    await AsyncStorage.setItem(key, JSON.stringify(item));
  }

  async get(key) {
    try {
      const item = await AsyncStorage.getItem(key);
      if (!item) return null;

      const parsedItem = JSON.parse(item);
      const isExpired = Date.now() - parsedItem.timestamp > parsedItem.ttl;

      if (isExpired) {
        await AsyncStorage.removeItem(key);
        return null;
      }

      return parsedItem.value;
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  }

  async clear() {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter((key) => key.startsWith("cache_"));
    await AsyncStorage.multiRemove(cacheKeys);
  }
}

export const persistentCache = new PersistentCache();
```

### 3. Enhanced API Client with Caching

```javascript
// api/cachedClient.js
import { apiClient } from "./client";
import { apiCache, persistentCache } from "../utils/cache";

class CachedApiClient extends ApiClient {
  async request(endpoint, options = {}) {
    const cacheKey = `${endpoint}_${JSON.stringify(options)}`;

    // Check memory cache first
    const memoryCache = apiCache.get(cacheKey);
    if (memoryCache && options.method === "GET") {
      return memoryCache;
    }

    // Check persistent cache
    const persistentCache = await persistentCache.get(cacheKey);
    if (persistentCache && options.method === "GET") {
      // Store in memory cache for faster access
      apiCache.set(cacheKey, persistentCache);
      return persistentCache;
    }

    // Make API request
    const result = await super.request(endpoint, options);

    // Cache successful GET requests
    if (options.method === "GET" || !options.method) {
      apiCache.set(cacheKey, result);
      await persistentCache.set(cacheKey, result);
    }

    return result;
  }
}
```

## Offline Support

### 1. Offline Queue

```javascript
// utils/offlineQueue.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

class OfflineQueue {
  constructor() {
    this.queue = [];
    this.isOnline = true;
    this.isProcessing = false;
  }

  async addToQueue(action) {
    const queueItem = {
      id: Date.now().toString(),
      action,
      timestamp: Date.now(),
    };

    this.queue.push(queueItem);
    await this.saveQueue();
  }

  async processQueue() {
    if (this.isProcessing || !this.isOnline) return;

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift();

      try {
        await this.executeAction(item.action);
        await this.saveQueue();
      } catch (error) {
        console.error("Queue processing error:", error);
        // Put item back at the beginning of queue
        this.queue.unshift(item);
        await this.saveQueue();
        break;
      }
    }

    this.isProcessing = false;
  }

  async executeAction(action) {
    const { method, endpoint, body } = action;
    return apiClient.request(endpoint, { method, body });
  }

  async saveQueue() {
    await AsyncStorage.setItem("offline_queue", JSON.stringify(this.queue));
  }

  async loadQueue() {
    try {
      const queue = await AsyncStorage.getItem("offline_queue");
      this.queue = queue ? JSON.parse(queue) : [];
    } catch (error) {
      console.error("Load queue error:", error);
      this.queue = [];
    }
  }

  startNetworkListener() {
    NetInfo.addEventListener((state) => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected;

      if (wasOffline && this.isOnline) {
        this.processQueue();
      }
    });
  }
}

export const offlineQueue = new OfflineQueue();
```

### 2. Offline-First API Client

```javascript
// api/offlineClient.js
import { offlineQueue } from "../utils/offlineQueue";
import NetInfo from "@react-native-community/netinfo";

class OfflineApiClient extends ApiClient {
  async request(endpoint, options = {}) {
    const isOnline = (await NetInfo.fetch()).isConnected;

    if (!isOnline && options.method !== "GET") {
      // Queue the request for later
      await offlineQueue.addToQueue({
        method: options.method,
        endpoint,
        body: options.body,
      });

      // Return optimistic response
      return this.createOptimisticResponse(options);
    }

    return super.request(endpoint, options);
  }

  createOptimisticResponse(options) {
    // Create optimistic response based on action type
    switch (options.method) {
      case "POST":
        return {
          data: { id: `temp-${Date.now()}`, status: "pending" },
          status: 202,
        };
      case "PUT":
      case "PATCH":
        return {
          data: { status: "pending" },
          status: 202,
        };
      case "DELETE":
        return {
          data: { deleted: true },
          status: 202,
        };
      default:
        return { data: null, status: 202 };
    }
  }
}
```

## Performance Optimization

### 1. Request Debouncing

```javascript
// utils/debounce.js
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Usage in search
const useDebouncedSearch = (searchFunction, delay = 300) => {
  const debouncedSearch = useMemo(
    () => debounce(searchFunction, delay),
    [searchFunction, delay]
  );

  return debouncedSearch;
};
```

### 2. Request Cancellation

```javascript
// api/cancellableClient.js
class CancellableApiClient extends ApiClient {
  constructor() {
    super();
    this.controllers = new Map();
  }

  async request(endpoint, options = {}) {
    const requestId = `${endpoint}_${Date.now()}`;

    // Cancel previous request if it exists
    if (this.controllers.has(endpoint)) {
      this.controllers.get(endpoint).abort();
    }

    const controller = new AbortController();
    this.controllers.set(endpoint, controller);

    try {
      const result = await super.request(endpoint, {
        ...options,
        signal: controller.signal,
      });

      this.controllers.delete(endpoint);
      return result;
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("Request cancelled");
      }
      throw error;
    }
  }

  cancelRequest(endpoint) {
    if (this.controllers.has(endpoint)) {
      this.controllers.get(endpoint).abort();
      this.controllers.delete(endpoint);
    }
  }

  cancelAllRequests() {
    this.controllers.forEach((controller) => controller.abort());
    this.controllers.clear();
  }
}
```

## Security & Authentication

### 1. Token Management

```javascript
// utils/auth.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwt_decode from "jwt-decode";

class AuthManager {
  async setToken(token) {
    await AsyncStorage.setItem("auth_token", token);

    // Decode and store token info
    try {
      const decoded = jwt_decode(token);
      await AsyncStorage.setItem("token_info", JSON.stringify(decoded));
    } catch (error) {
      console.error("Token decode error:", error);
    }
  }

  async getToken() {
    return await AsyncStorage.getItem("auth_token");
  }

  async removeToken() {
    await AsyncStorage.removeItem("auth_token");
    await AsyncStorage.removeItem("token_info");
  }

  async isTokenValid() {
    const token = await this.getToken();
    if (!token) return false;

    try {
      const decoded = jwt_decode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  }

  async refreshToken() {
    try {
      const response = await apiClient.post("/auth/refresh");
      await this.setToken(response.data.token);
      return response.data.token;
    } catch (error) {
      await this.removeToken();
      throw error;
    }
  }
}

export const authManager = new AuthManager();
```

### 2. Secure API Client

```javascript
// api/secureClient.js
import { authManager } from "../utils/auth";

class SecureApiClient extends ApiClient {
  async request(endpoint, options = {}) {
    // Add auth token to headers
    const token = await authManager.getToken();
    if (token) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      return await super.request(endpoint, options);
    } catch (error) {
      if (error.status === 401) {
        // Try to refresh token
        try {
          const newToken = await authManager.refreshToken();
          options.headers = {
            ...options.headers,
            Authorization: `Bearer ${newToken}`,
          };
          return await super.request(endpoint, options);
        } catch (refreshError) {
          // Redirect to login
          await authManager.removeToken();
          throw new Error("Authentication failed");
        }
      }
      throw error;
    }
  }
}
```

## Real-World Examples

### 1. Focus App API Integration

```javascript
// api/services/focusService.js
import { apiClient } from "../client";

export class FocusService {
  static async getSessions(params = {}) {
    return apiClient.get("/sessions", { params });
  }

  static async createSession(sessionData) {
    return apiClient.post("/sessions", sessionData);
  }

  static async updateSession(id, sessionData) {
    return apiClient.put(`/sessions/${id}`, sessionData);
  }

  static async completeSession(id, completionData) {
    return apiClient.patch(`/sessions/${id}/complete`, completionData);
  }

  static async getSessionStats(timeRange = "week") {
    return apiClient.get(`/sessions/stats?range=${timeRange}`);
  }

  static async getFlows() {
    return apiClient.get("/flows");
  }

  static async createFlow(flowData) {
    return apiClient.post("/flows", flowData);
  }

  static async updateFlow(id, flowData) {
    return apiClient.put(`/flows/${id}`, flowData);
  }
}

// hooks/useFocusApi.js
export const useSessions = (params = {}) => {
  return useApi(() => FocusService.getSessions(params), [params]);
};

export const useSessionStats = (timeRange = "week") => {
  return useApi(() => FocusService.getSessionStats(timeRange), [timeRange]);
};

export const useCreateSession = () => {
  return useApi(FocusService.createSession);
};

export const useCompleteSession = () => {
  return useApi(FocusService.completeSession);
};
```

### 2. Journal API Integration

```javascript
// api/services/journalService.js
export class JournalService {
  static async getEntries(params = {}) {
    return apiClient.get("/journal/entries", { params });
  }

  static async createEntry(entryData) {
    return apiClient.post("/journal/entries", entryData);
  }

  static async updateEntry(id, entryData) {
    return apiClient.put(`/journal/entries/${id}`, entryData);
  }

  static async deleteEntry(id) {
    return apiClient.delete(`/journal/entries/${id}`);
  }

  static async getEntryById(id) {
    return apiClient.get(`/journal/entries/${id}`);
  }

  static async searchEntries(query) {
    return apiClient.get(
      `/journal/entries/search?q=${encodeURIComponent(query)}`
    );
  }
}

// hooks/useJournalApi.js
export const useJournalEntries = (params = {}) => {
  return useApi(() => JournalService.getEntries(params), [params]);
};

export const useJournalEntry = (id) => {
  return useApi(() => JournalService.getEntryById(id), [id]);
};

export const useCreateJournalEntry = () => {
  return useApi(JournalService.createEntry);
};

export const useUpdateJournalEntry = () => {
  return useApi(JournalService.updateEntry);
};
```

### 3. Complete API Integration Example

```javascript
// App.js
import { NavigationContainer } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { apolloClient, ApolloProvider } from "./api/apollo";
import { offlineQueue } from "./utils/offlineQueue";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

const App = () => {
  useEffect(() => {
    // Initialize offline queue
    offlineQueue.loadQueue();
    offlineQueue.startNetworkListener();
  }, []);

  return (
    <ApolloProvider client={apolloClient}>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <FocusAppNavigator />
        </NavigationContainer>
      </QueryClientProvider>
    </ApolloProvider>
  );
};
```

This comprehensive guide covers all essential aspects of API integration in React Native, from basic setup to advanced patterns like offline support, caching, and security. The examples are specifically tailored for your focus app and include best practices for performance, error handling, and state management.
