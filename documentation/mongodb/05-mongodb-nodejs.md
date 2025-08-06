# Using MongoDB with Node.js

## Introduction

This guide covers integrating MongoDB with Node.js applications using both the native MongoDB driver and Mongoose ODM. You'll learn connection management, CRUD operations, error handling, and best practices.

---

## MongoDB Native Driver

### Installation

```bash
npm install mongodb
```

### Basic Connection

```javascript
const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

async function connectToDatabase() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('myapp');
    const collection = db.collection('users');
    
    // Your database operations here
    
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  } finally {
    await client.close();
  }
}

connectToDatabase();
```

### Database Service Class

```javascript
const { MongoClient, ObjectId } = require('mongodb');

class DatabaseService {
  constructor(uri, dbName) {
    this.client = new MongoClient(uri);
    this.dbName = dbName;
    this.db = null;
  }

  async connect() {
    try {
      await client.connect();
      this.db = this.client.db(this.dbName);
      console.log(`Connected to database: ${this.dbName}`);
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      await this.client.close();
      console.log('Disconnected from database');
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  }

  getCollection(name) {
    if (!this.db) {
      throw new Error('Database not connected');
    }
    return this.db.collection(name);
  }
}

module.exports = DatabaseService;
```

### CRUD Operations with Native Driver

```javascript
const { MongoClient, ObjectId } = require('mongodb');

class UserService {
  constructor(client, dbName) {
    this.client = client;
    this.db = client.db(dbName);
    this.collection = this.db.collection('users');
  }

  async createUser(userData) {
    try {
      const user = {
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await this.collection.insertOne(user);
      
      return {
        success: true,
        data: { _id: result.insertedId, ...user }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getUserById(id) {
    try {
      const user = await this.collection.findOne({ 
        _id: new ObjectId(id) 
      });
      
      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }
      
      return {
        success: true,
        data: user
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getAllUsers(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = -1,
        filter = {}
      } = options;

      const skip = (page - 1) * limit;

      const users = await this.collection
        .find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .toArray();

      const total = await this.collection.countDocuments(filter);
      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: users,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async updateUser(id, updateData) {
    try {
      const result = await this.collection.updateOne(
        { _id: new ObjectId(id) },
        { 
          $set: {
            ...updateData,
            updatedAt: new Date()
          }
        }
      );

      if (result.matchedCount === 0) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      return {
        success: true,
        data: {
          matchedCount: result.matchedCount,
          modifiedCount: result.modifiedCount
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async deleteUser(id) {
    try {
      const result = await this.collection.deleteOne({ 
        _id: new ObjectId(id) 
      });

      if (result.deletedCount === 0) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      return {
        success: true,
        data: { deletedCount: result.deletedCount }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = UserService;
```

### Express Integration

```javascript
const express = require('express');
const { MongoClient } = require('mongodb');
const UserService = require('./services/UserService');

const app = express();
app.use(express.json());

const client = new MongoClient('mongodb://localhost:27017');
let userService;

async function initializeDatabase() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    userService = new UserService(client, 'myapp');
    
  } catch (error) {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  }
}

// Routes
app.get('/api/users', async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    
    let options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10
    };

    if (search) {
      options.filter = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const result = await userService.getAllUsers(options);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const result = await userService.getUserById(req.params.id);
    
    if (result.success) {
      res.json(result);
    } else {
      const statusCode = result.error === 'User not found' ? 404 : 500;
      res.status(statusCode).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Name and email are required'
      });
    }

    const result = await userService.createUser(req.body);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await client.close();
  process.exit(0);
});

async function startServer() {
  await initializeDatabase();
  
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch(console.error);
```

---

## Mongoose ODM

### Installation

```bash
npm install mongoose
```

### Basic Setup

```javascript
const mongoose = require('mongoose');

async function connectDB() {
  try {
    const conn = await mongoose.connect('mongodb://localhost:27017/myapp');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

// Connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

connectDB();
```

### Defining Schemas

```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  age: {
    type: Number,
    min: [0, 'Age cannot be negative'],
    max: [120, 'Age cannot exceed 120']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  hobbies: [{
    type: String,
    trim: true
  }],
  address: {
    street: String,
    city: String,
    zipCode: String,
    country: {
      type: String,
      default: 'USA'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Instance methods
userSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    isActive: this.isActive
  };
};

// Static methods
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

// Pre-save middleware
userSchema.pre('save', function(next) {
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase();
  }
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
```

### Mongoose CRUD Operations

```javascript
const User = require('./models/User');

class UserController {
  static async createUser(req, res) {
    try {
      const user = new User(req.body);
      const savedUser = await user.save();
      
      res.status(201).json({
        success: true,
        data: savedUser.getPublicProfile()
      });
    } catch (error) {
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(e => e.message);
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors
        });
      }
      
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          error: 'Email already exists'
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async getAllUsers(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        search,
        isActive
      } = req.query;

      const filter = {};
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }
      if (isActive !== undefined) {
        filter.isActive = isActive === 'true';
      }

      const users = await User.find(filter)
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .select('-__v')
        .exec();

      const total = await User.countDocuments(filter);

      res.json({
        success: true,
        data: users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  static async getUserById(req, res) {
    try {
      const user = await User.findById(req.params.id).select('-__v');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          error: 'Invalid user ID'
        });
      }
      
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  static async updateUser(req, res) {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true
        }
      ).select('-__v');

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(e => e.message);
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors
        });
      }
      
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  static async deleteUser(req, res) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = UserController;
```

---

## Error Handling

### Custom Error Handler Middleware

```javascript
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
};

module.exports = errorHandler;
```

### Async Handler Wrapper

```javascript
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Usage
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find();
  res.json({
    success: true,
    data: users
  });
});
```

---

## Best Practices

### 1. Connection Management

```javascript
// Use environment variables
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed.');
  process.exit(0);
});
```

### 2. Input Validation

```bash
npm install joi
```

```javascript
const Joi = require('joi');

const userValidationSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  age: Joi.number().integer().min(0).max(120),
  role: Joi.string().valid('user', 'admin', 'moderator')
});

const validateUser = (req, res, next) => {
  const { error } = userValidationSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.details[0].message
    });
  }
  
  next();
};
```

### 3. Environment Configuration

```javascript
// .env file
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb://localhost:27017/myapp
JWT_SECRET=your-secret-key

// config/database.js
require('dotenv').config();

const config = {
  development: {
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/myapp-dev'
  },
  production: {
    MONGO_URI: process.env.MONGO_URI
  }
};

module.exports = config[process.env.NODE_ENV || 'development'];
```

---

## Complete Example Application

```javascript
// app.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const userRoutes = require('./routes/users');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/users', userRoutes);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## Next Steps

Now that you understand MongoDB with Node.js:

1. **[Indexing and Performance](06-indexing-performance.md)** - Optimize your queries
2. **[Aggregation Framework](07-aggregation-framework.md)** - Advanced data processing
3. **[Best Practices](08-best-practices.md)** - Production-ready applications

This guide provides the foundation for building robust MongoDB applications with Node.js!
