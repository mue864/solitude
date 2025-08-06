# MongoDB Best Practices

## Introduction

This guide covers essential best practices for MongoDB development, deployment, and maintenance. Following these practices will help you build robust, scalable, and maintainable MongoDB applications.

---

## Schema Design Best Practices

### 1. Design for Your Application

```javascript
// Bad: Normalized like SQL
// Users collection
{ _id: 1, name: "John Doe" }

// Addresses collection  
{ _id: 1, userId: 1, street: "123 Main St", city: "NYC" }

// Orders collection
{ _id: 1, userId: 1, total: 100 }

// Good: Embedded for frequently accessed together data
{
  _id: 1,
  name: "John Doe",
  address: {
    street: "123 Main St",
    city: "NYC",
    zipCode: "10001"
  },
  recentOrders: [
    { orderId: 1, total: 100, date: "2023-01-15" }
  ]
}
```

### 2. Consider Document Growth

```javascript
// Bad: Unbounded arrays
{
  _id: 1,
  name: "Popular Blog Post",
  comments: [
    // This could grow to thousands...
  ]
}

// Good: Reference pattern for large collections
{
  _id: 1,
  name: "Popular Blog Post",
  commentCount: 1500,
  recentComments: [
    // Only recent comments embedded
  ]
}
```

### 3. Use Appropriate Data Types

```javascript
// Good: Proper data types
{
  _id: ObjectId("..."),
  name: "Product Name",
  price: NumberDecimal("29.99"),    // Use Decimal128 for money
  quantity: NumberInt(100),         // Use Int32 for small integers
  views: NumberLong(1000000),       // Use Int64 for large integers
  isActive: true,                   // Boolean for true/false
  createdAt: ISODate("2023-01-15"), // Date for timestamps
  tags: ["electronics", "gadget"],  // Array for lists
  metadata: {                       // Object for structured data
    source: "web",
    campaign: "holiday"
  }
}
```

---

## Query Optimization

### 1. Use Indexes Effectively

```javascript
// Create indexes for your query patterns
db.users.createIndex({ email: 1 })                    // Single field
db.orders.createIndex({ customerId: 1, date: -1 })    // Compound
db.products.createIndex({ name: "text" })              // Text search

// Follow ESR rule for compound indexes (Equality, Sort, Range)
db.orders.find({ status: "active", amount: { $gte: 100 } }).sort({ date: -1 })
// Index: { status: 1, date: -1, amount: 1 }
```

### 2. Write Efficient Queries

```javascript
// Good: Use projection to limit returned fields
db.users.find(
  { isActive: true },
  { name: 1, email: 1, _id: 0 }
)

// Good: Use limit to reduce results
db.products.find({ category: "electronics" }).limit(20)

// Good: Use specific queries instead of regex when possible
db.users.find({ email: "john@example.com" })  // Better than regex

// Avoid: Expensive operations without indexes
db.users.find({ name: /john/i })  // Slow without text index
```

### 3. Optimize Aggregation Pipelines

```javascript
// Good: Filter early, project late
db.orders.aggregate([
  { $match: { status: "completed", date: { $gte: new Date("2023-01-01") } } },
  { $sort: { date: -1 } },
  { $limit: 1000 },
  { $lookup: { from: "customers", localField: "customerId", foreignField: "_id", as: "customer" } },
  { $project: { amount: 1, date: 1, "customer.name": 1 } }
])
```

---

## Connection Management

### 1. Connection Pooling

```javascript
// Good: Configure connection pooling
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/myapp', {
  maxPoolSize: 10,          // Maximum connections
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferCommands: false,
  bufferMaxEntries: 0
});

// Monitor connection events
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});
```

### 2. Graceful Shutdown

```javascript
// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  await mongoose.connection.close();
  process.exit(0);
});
```

---

## Error Handling

### 1. Comprehensive Error Handling

```javascript
// Centralized error handling middleware
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

  // MongoDB connection errors
  if (err.name === 'MongoNetworkError') {
    const message = 'Database connection failed';
    error = { message, statusCode: 503 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
};
```

### 2. Async Error Handling

```javascript
// Async wrapper to catch errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Usage in routes
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find();
  res.json({ success: true, data: users });
});
```

---

## Security Best Practices

### 1. Authentication and Authorization

```javascript
// Use environment variables for sensitive data
require('dotenv').config();

const mongoURI = process.env.MONGO_URI;
const jwtSecret = process.env.JWT_SECRET;

// Create database users with specific roles
// In MongoDB shell:
db.createUser({
  user: "appUser",
  pwd: "strongPassword123!",
  roles: [
    { role: "readWrite", db: "myapp" }
  ]
});
```

### 2. Input Validation

```javascript
const Joi = require('joi');

// Schema validation
const userSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  age: Joi.number().integer().min(0).max(120),
  role: Joi.string().valid('user', 'admin', 'moderator')
});

// Validation middleware
const validateUser = (req, res, next) => {
  const { error } = userSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.details[0].message
    });
  }
  
  next();
};

// Sanitize input to prevent injection
const mongoSanitize = require('express-mongo-sanitize');
app.use(mongoSanitize());
```

### 3. Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

// General rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

// Strict rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts'
});

app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);
```

---

## Performance Monitoring

### 1. Database Profiling

```javascript
// Enable profiling for slow operations
db.setProfilingLevel(1, { slowms: 100 });

// Analyze slow operations
db.system.profile.find().limit(5).sort({ ts: -1 }).pretty();

// Create monitoring function
function analyzeSlowQueries() {
  const slowQueries = db.system.profile.find({
    "command.find": { $exists: true },
    "millis": { $gt: 100 }
  }).sort({ ts: -1 }).limit(10);
  
  slowQueries.forEach(query => {
    print(`Collection: ${query.ns}`);
    print(`Duration: ${query.millis}ms`);
    print(`Query: ${JSON.stringify(query.command.filter)}`);
    print('---');
  });
}
```

### 2. Application Monitoring

```javascript
// Monitor database operations in Node.js
const mongoose = require('mongoose');

// Log slow queries
mongoose.set('debug', (collectionName, method, query, doc) => {
  const start = Date.now();
  
  // Log after operation completes
  process.nextTick(() => {
    const duration = Date.now() - start;
    if (duration > 100) {
      console.log(`Slow query detected: ${collectionName}.${method}`, {
        query,
        duration: `${duration}ms`
      });
    }
  });
});

// Custom monitoring middleware
const monitoringMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};
```

---

## Backup and Recovery

### 1. Regular Backups

```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mongodb"
DB_NAME="myapp"

# Create backup
mongodump --db $DB_NAME --out $BACKUP_DIR/$DATE

# Compress backup
tar -czf $BACKUP_DIR/$DATE.tar.gz $BACKUP_DIR/$DATE
rm -rf $BACKUP_DIR/$DATE

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/$DATE.tar.gz"
```

### 2. Point-in-Time Recovery

```javascript
// Enable oplog for replica sets (automatic)
// For single instances, consider replica set with one member

// Backup with oplog
mongodump --db myapp --oplog --out /backup/$(date +%Y%m%d)

// Restore to specific point in time
mongorestore --oplogReplay --oplogLimit 1640995200:1 /backup/20231231
```

---

## Development Best Practices

### 1. Environment Configuration

```javascript
// config/database.js
const config = {
  development: {
    MONGO_URI: 'mongodb://localhost:27017/myapp-dev',
    options: {
      maxPoolSize: 5
    }
  },
  test: {
    MONGO_URI: 'mongodb://localhost:27017/myapp-test',
    options: {
      maxPoolSize: 2
    }
  },
  production: {
    MONGO_URI: process.env.MONGO_URI,
    options: {
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority'
    }
  }
};

module.exports = config[process.env.NODE_ENV || 'development'];
```

### 2. Testing Strategies

```javascript
// Test setup with separate database
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clean database before each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Example test
describe('User Model', () => {
  test('should create a user', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      age: 30
    };
    
    const user = new User(userData);
    const savedUser = await user.save();
    
    expect(savedUser._id).toBeDefined();
    expect(savedUser.name).toBe(userData.name);
    expect(savedUser.email).toBe(userData.email);
  });
});
```

### 3. Code Organization

```javascript
// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Schema definition
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);

// services/UserService.js
const User = require('../models/User');

class UserService {
  static async createUser(userData) {
    try {
      const user = new User(userData);
      return await user.save();
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }
  
  static async getUserById(id) {
    try {
      const user = await User.findById(id);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UserService;

// controllers/UserController.js
const UserService = require('../services/UserService');

class UserController {
  static async createUser(req, res, next) {
    try {
      const user = await UserService.createUser(req.body);
      res.status(201).json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
```

---

## Production Deployment

### 1. Replica Set Configuration

```javascript
// Initialize replica set
rs.initiate({
  _id: "myReplicaSet",
  members: [
    { _id: 0, host: "mongodb1:27017" },
    { _id: 1, host: "mongodb2:27017" },
    { _id: 2, host: "mongodb3:27017" }
  ]
});

// Connection string for replica set
const uri = "mongodb://mongodb1:27017,mongodb2:27017,mongodb3:27017/myapp?replicaSet=myReplicaSet";
```

### 2. Production Monitoring

```javascript
// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await mongoose.connection.db.admin().ping();
    
    // Check replica set status (if applicable)
    const status = await mongoose.connection.db.admin().replSetGetStatus();
    
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Metrics collection
const collectMetrics = () => {
  return {
    connections: mongoose.connection.readyState,
    collections: Object.keys(mongoose.connection.collections).length,
    memory: process.memoryUsage(),
    uptime: process.uptime()
  };
};
```

---

## Common Anti-Patterns to Avoid

### 1. Schema Anti-Patterns

```javascript
// Bad: Massive documents
{
  _id: 1,
  user: "john",
  activities: [
    // Thousands of activity records...
  ]
}

// Bad: Unnecessary nesting
{
  _id: 1,
  user: {
    personal: {
      name: {
        first: "John",
        last: "Doe"
      }
    }
  }
}

// Bad: Storing large binary data
{
  _id: 1,
  name: "Profile",
  image: "base64-encoded-large-image..."  // Use GridFS instead
}
```

### 2. Query Anti-Patterns

```javascript
// Bad: N+1 queries
const users = await User.find();
for (const user of users) {
  const orders = await Order.find({ userId: user._id });
  // Process orders...
}

// Good: Use aggregation or populate
const users = await User.aggregate([
  {
    $lookup: {
      from: 'orders',
      localField: '_id',
      foreignField: 'userId',
      as: 'orders'
    }
  }
]);

// Bad: Large skip values
db.users.find().skip(10000).limit(10);

// Good: Use range queries
db.users.find({ _id: { $gt: lastId } }).limit(10);
```

---

## Conclusion

Following these best practices will help you:

- Build scalable and maintainable MongoDB applications
- Optimize performance and reduce costs
- Ensure data security and reliability
- Handle errors gracefully
- Monitor and troubleshoot effectively

Remember: MongoDB best practices evolve with your application's needs. Regularly review and adjust your approach based on your specific requirements and usage patterns.

---

## Quick Reference Checklist

### Schema Design
- [ ] Design for your query patterns
- [ ] Consider document growth
- [ ] Use appropriate data types
- [ ] Avoid massive arrays and deep nesting

### Performance
- [ ] Create indexes for your queries
- [ ] Use projection to limit returned fields
- [ ] Optimize aggregation pipelines
- [ ] Monitor slow queries

### Security
- [ ] Use authentication and authorization
- [ ] Validate and sanitize input
- [ ] Implement rate limiting
- [ ] Use environment variables for secrets

### Operations
- [ ] Configure connection pooling
- [ ] Implement graceful shutdown
- [ ] Set up monitoring and alerting
- [ ] Plan backup and recovery strategy

### Development
- [ ] Use proper error handling
- [ ] Write tests for your models and services
- [ ] Organize code into layers
- [ ] Use environment-specific configurations

This completes your comprehensive MongoDB guide. You now have all the knowledge needed to build production-ready MongoDB applications!
