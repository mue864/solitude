# React Native + MongoDB Integration Guide

## Overview

This guide covers how to integrate MongoDB with React Native applications. Unlike web applications, React Native apps cannot connect directly to MongoDB - they need to communicate through a backend API.

---

## Architecture Pattern

```
┌─────────────────┐    HTTP/REST API    ┌──────────────────┐    ┌─────────────┐
│  React Native   │ ◄─────────────────► │   Backend API    │ ◄──► │   MongoDB   │
│      App        │                     │ (Node.js/Express)│    │  Database   │
└─────────────────┘                     └──────────────────┘    └─────────────┘
```

**Key Points:**
- React Native apps run on mobile devices
- Mobile apps cannot directly connect to MongoDB
- You need a backend API server to handle database operations
- The backend API exposes HTTP endpoints that your React Native app calls

---

## Backend API Setup (Node.js + Express + MongoDB)

### 1. Basic Express Server with MongoDB

```javascript
// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number, min: 0 }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// API Routes
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 2. Environment Configuration

```bash
# .env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/myapp
PORT=3000
JWT_SECRET=your-secret-key
```

---

## React Native Client Implementation

### 1. API Service Layer

```javascript
// services/api.js
const API_BASE_URL = 'http://localhost:3000/api'; // Change for production

class ApiService {
  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // User operations
  static async getUsers() {
    return this.request('/users');
  }

  static async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  static async getUserById(id) {
    return this.request(`/users/${id}`);
  }

  static async updateUser(id, userData) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  static async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }
}

export default ApiService;
```

### 2. React Native Components

```javascript
// components/UserList.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import ApiService from '../services/api';

const UserList = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await ApiService.getUsers();
      setUsers(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch users: ' + error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId) => {
    Alert.alert(
      'Delete User',
      'Are you sure you want to delete this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.deleteUser(userId);
              setUsers(users.filter(user => user._id !== userId));
              Alert.alert('Success', 'User deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete user: ' + error.message);
            }
          },
        },
      ]
    );
  };

  const renderUser = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <Text style={styles.userAge}>Age: {item.age}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditUser', { user: item })}
        >
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteUser(item._id)}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Loading users...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={renderUser}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchUsers} />
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text>No users found</Text>
          </View>
        }
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddUser')}
      >
        <Text style={styles.addButtonText}>Add User</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userCard: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  userAge: {
    fontSize: 14,
    color: '#888',
  },
  actions: {
    flexDirection: 'row',
  },
  editButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#34C759',
    margin: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UserList;
```

### 3. Form Component for Adding/Editing Users

```javascript
// components/UserForm.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import ApiService from '../services/api';

const UserForm = ({ route, navigation }) => {
  const { user } = route.params || {};
  const isEditing = !!user;

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    age: user?.age?.toString() || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Email is required');
      return;
    }
    if (!formData.age.trim() || isNaN(parseInt(formData.age))) {
      Alert.alert('Error', 'Valid age is required');
      return;
    }

    setLoading(true);

    try {
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        age: parseInt(formData.age),
      };

      if (isEditing) {
        await ApiService.updateUser(user._id, userData);
        Alert.alert('Success', 'User updated successfully');
      } else {
        await ApiService.createUser(userData);
        Alert.alert('Success', 'User created successfully');
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>
          {isEditing ? 'Edit User' : 'Add New User'}
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="Enter name"
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            placeholder="Enter email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.input}
            value={formData.age}
            onChangeText={(text) => setFormData({ ...formData, age: text })}
            placeholder="Enter age"
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Saving...' : (isEditing ? 'Update User' : 'Create User')}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  form: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UserForm;
```

---

## Error Handling and Loading States

### 1. Custom Hook for API Calls

```javascript
// hooks/useApi.js
import { useState, useEffect } from 'react';

export const useApi = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const execute = async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(...args);
      setData(result.data);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    execute();
  }, dependencies);

  return { data, loading, error, execute };
};
```

### 2. Global Error Handler

```javascript
// utils/errorHandler.js
import { Alert } from 'react-native';

export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  let message = 'Something went wrong. Please try again.';
  
  if (error.message) {
    message = error.message;
  } else if (error.response?.data?.error) {
    message = error.response.data.error;
  }
  
  Alert.alert('Error', message);
};
```

---

## Authentication Integration

### 1. JWT Token Management

```javascript
// services/authService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

class AuthService {
  static TOKEN_KEY = 'auth_token';

  static async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      await AsyncStorage.setItem(this.TOKEN_KEY, data.token);
      return data;
    } catch (error) {
      throw error;
    }
  }

  static async logout() {
    await AsyncStorage.removeItem(this.TOKEN_KEY);
  }

  static async getToken() {
    return await AsyncStorage.getItem(this.TOKEN_KEY);
  }

  static async isAuthenticated() {
    const token = await this.getToken();
    return !!token;
  }
}

export default AuthService;
```

### 2. Authenticated API Requests

```javascript
// services/api.js (updated)
import AuthService from './authService';

class ApiService {
  static async request(endpoint, options = {}) {
    const token = await AuthService.getToken();
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (response.status === 401) {
        // Token expired, redirect to login
        await AuthService.logout();
        // Navigate to login screen
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
}
```

---

## Best Practices for React Native + MongoDB

### 1. Data Caching
```javascript
// Use React Query or SWR for caching
import { useQuery } from 'react-query';

const useUsers = () => {
  return useQuery('users', ApiService.getUsers, {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};
```

### 2. Offline Support
```javascript
// Check network status
import NetInfo from '@react-native-netinfo/netinfo';

const [isConnected, setIsConnected] = useState(true);

useEffect(() => {
  const unsubscribe = NetInfo.addEventListener(state => {
    setIsConnected(state.isConnected);
  });

  return () => unsubscribe();
}, []);
```

### 3. Environment Configuration
```javascript
// config/environment.js
const config = {
  development: {
    API_URL: 'http://localhost:3000/api',
  },
  production: {
    API_URL: 'https://your-api.herokuapp.com/api',
  },
};

export default config[__DEV__ ? 'development' : 'production'];
```

---

## Deployment Considerations

### Backend Deployment
- Deploy your Node.js/Express API to services like:
  - Heroku
  - Vercel
  - Railway
  - DigitalOcean App Platform

### MongoDB Hosting
- Use MongoDB Atlas (cloud)
- Ensure proper security (IP whitelist, strong passwords)
- Set up monitoring and backups

### React Native App
- Update API URLs for production
- Handle network errors gracefully
- Implement proper loading states
- Add offline capabilities where needed

---

## Summary

For React Native + MongoDB development:

1. **Backend API**: Use Node.js/Express (your existing documentation applies here)
2. **Database**: MongoDB concepts and operations remain the same
3. **React Native**: Focus on HTTP client implementation, state management, and UI
4. **Architecture**: Always use the three-tier pattern (App → API → Database)

The MongoDB documentation you have is fully applicable - you'll use all those concepts in your backend API. The Node.js/Express parts apply to your backend server, not your React Native app directly.

Your React Native app will primarily focus on:
- Making HTTP requests to your API
- Managing application state
- Handling user interactions
- Displaying data in mobile-friendly UI components
