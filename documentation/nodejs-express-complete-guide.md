# Node.js & Express Complete Beginner's Guide

## Table of Contents
1. [What is Node.js?](#what-is-nodejs)
2. [Setting Up Your Development Environment](#setting-up-your-development-environment)
3. [Node.js Core Concepts](#nodejs-core-concepts)
4. [Introduction to Express](#introduction-to-express)
5. [Building Your First Express Application](#building-your-first-express-application)
6. [Express Middleware](#express-middleware)
7. [Routing in Express](#routing-in-express)
8. [Working with Data](#working-with-data)
9. [Error Handling](#error-handling)
10. [Best Practices](#best-practices)
11. [Common Patterns](#common-patterns)
12. [Resources and Next Steps](#resources-and-next-steps)

---

## What is Node.js?

Node.js is a **JavaScript runtime environment** that allows you to run JavaScript code outside of a web browser. Think of it as a way to use JavaScript to build server-side applications, command-line tools, and more.

### Key Characteristics:
- **Server-side JavaScript**: Run JavaScript on servers, not just in browsers
- **Event-driven**: Uses an event loop to handle multiple operations efficiently
- **Non-blocking I/O**: Can handle many operations simultaneously without waiting
- **Single-threaded**: Uses one main thread with an event loop (but can spawn worker threads)
- **Cross-platform**: Works on Windows, macOS, and Linux

### Why Use Node.js?
1. **Same language everywhere**: Use JavaScript for both frontend and backend
2. **Fast development**: Rapid prototyping and development
3. **Large ecosystem**: Millions of packages available via npm
4. **Scalable**: Great for building scalable network applications
5. **Active community**: Large, supportive developer community

---

## Setting Up Your Development Environment

### Step 1: Install Node.js

1. **Download Node.js**:
   - Go to [nodejs.org](https://nodejs.org/)
   - Download the LTS (Long Term Support) version
   - Choose the installer for your operating system

2. **Verify Installation**:
   Open your terminal/command prompt and run:
   ```bash
   node --version
   npm --version
   ```
   You should see version numbers for both Node.js and npm (Node Package Manager).

### Step 2: Choose a Code Editor

Popular choices for Node.js development:
- **Visual Studio Code** (recommended for beginners)
- WebStorm
- Sublime Text
- Atom

### Step 3: Create Your First Project Directory

```bash
mkdir my-first-node-project
cd my-first-node-project
```

### Step 4: Initialize a Node.js Project

```bash
npm init -y
```

This creates a `package.json` file, which is like a blueprint for your project.

**What is package.json?**
```json
{
  "name": "my-first-node-project",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

---

## Node.js Core Concepts

### 1. Modules

Node.js uses a **module system** to organize code. Think of modules as reusable pieces of code.

#### Built-in Modules
Node.js comes with many built-in modules:

```javascript
// File system operations
const fs = require('fs');

// Path utilities
const path = require('path');

// HTTP server functionality
const http = require('http');

// Operating system utilities
const os = require('os');
```

#### Creating Your Own Modules

**math.js** (a custom module):
```javascript
// Export individual functions
exports.add = (a, b) => a + b;
exports.subtract = (a, b) => a - b;

// Or export an object
module.exports = {
  multiply: (a, b) => a * b,
  divide: (a, b) => a / b
};
```

**app.js** (using the custom module):
```javascript
const math = require('./math');

console.log(math.add(5, 3)); // 8
console.log(math.multiply(4, 2)); // 8
```

### 2. Asynchronous Programming

Node.js is **non-blocking**, meaning it doesn't wait for operations to complete before moving to the next line of code.

#### Callbacks (Traditional Way)
```javascript
const fs = require('fs');

// Asynchronous file reading
fs.readFile('data.txt', 'utf8', (error, data) => {
  if (error) {
    console.error('Error reading file:', error);
    return;
  }
  console.log('File content:', data);
});

console.log('This runs immediately, before file is read!');
```

#### Promises (Modern Way)
```javascript
const fs = require('fs').promises;

// Using Promises
fs.readFile('data.txt', 'utf8')
  .then(data => {
    console.log('File content:', data);
  })
  .catch(error => {
    console.error('Error reading file:', error);
  });
```

#### Async/Await (Most Modern Way)
```javascript
const fs = require('fs').promises;

async function readFileExample() {
  try {
    const data = await fs.readFile('data.txt', 'utf8');
    console.log('File content:', data);
  } catch (error) {
    console.error('Error reading file:', error);
  }
}

readFileExample();
```

### 3. Event-Driven Architecture

Node.js uses events extensively. Many objects emit events that you can listen to.

```javascript
const EventEmitter = require('events');

// Create an event emitter
const myEmitter = new EventEmitter();

// Listen for events
myEmitter.on('message', (data) => {
  console.log('Received message:', data);
});

// Emit an event
myEmitter.emit('message', 'Hello World!');
```

### 4. Basic HTTP Server

Here's how to create a simple web server with just Node.js:

```javascript
const http = require('http');

const server = http.createServer((request, response) => {
  // Set response headers
  response.writeHead(200, { 'Content-Type': 'text/html' });
  
  // Send response
  response.end('<h1>Hello from Node.js!</h1>');
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
```

---

## Introduction to Express

**Express.js** is a web framework for Node.js that makes building web applications much easier. Think of it as a set of tools that handles common web development tasks.

### Why Use Express?

1. **Simplifies routing**: Easy to handle different URLs
2. **Middleware support**: Add functionality to your app easily
3. **Template engines**: Render dynamic HTML
4. **Static file serving**: Serve CSS, images, JavaScript files
5. **Large ecosystem**: Many plugins and extensions

### Installing Express

```bash
npm install express
```

This adds Express to your `package.json` dependencies:

```json
{
  "dependencies": {
    "express": "^4.18.2"
  }
}
```

---

## Building Your First Express Application

### Step 1: Basic Express Server

Create `app.js`:

```javascript
// Import Express
const express = require('express');

// Create an Express application
const app = express();

// Define a route
app.get('/', (req, res) => {
  res.send('<h1>Hello from Express!</h1>');
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
```

**Run your app**:
```bash
node app.js
```

Visit `http://localhost:3000` in your browser!

### Step 2: Understanding the Code

```javascript
const express = require('express');
```
- Imports the Express framework

```javascript
const app = express();
```
- Creates an Express application instance

```javascript
app.get('/', (req, res) => {
  res.send('<h1>Hello from Express!</h1>');
});
```
- **`app.get()`**: Handles GET requests to the root path (`/`)
- **`req`**: Request object (contains info about the HTTP request)
- **`res`**: Response object (used to send data back to the client)
- **`res.send()`**: Sends a response to the client

### Step 3: Adding More Routes

```javascript
const express = require('express');
const app = express();

// Home page
app.get('/', (req, res) => {
  res.send('<h1>Welcome to My Website!</h1>');
});

// About page
app.get('/about', (req, res) => {
  res.send('<h1>About Us</h1><p>This is the about page.</p>');
});

// Contact page
app.get('/contact', (req, res) => {
  res.send('<h1>Contact Us</h1><p>Email: contact@example.com</p>');
});

// 404 handler (must be last)
app.use('*', (req, res) => {
  res.status(404).send('<h1>Page Not Found</h1>');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
```

### Step 4: Serving Static Files

Create a `public` folder and add CSS, images, or JavaScript files:

```javascript
const express = require('express');
const path = require('path');
const app = express();

// Serve static files from 'public' directory
app.use(express.static('public'));

// Your routes here...
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <link rel="stylesheet" href="/styles.css">
      </head>
      <body>
        <h1>Welcome!</h1>
        <img src="/logo.png" alt="Logo">
      </body>
    </html>
  `);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
```

Now files in your `public` folder are accessible:
- `public/styles.css` → `http://localhost:3000/styles.css`
- `public/logo.png` → `http://localhost:3000/logo.png`

---

## Express Middleware

**Middleware** are functions that run between the request and response. Think of them as a pipeline that processes requests.

### Built-in Middleware

```javascript
const express = require('express');
const app = express();

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies (form data)
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('public'));
```

### Custom Middleware

```javascript
// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next(); // Pass control to the next middleware
});

// Authentication middleware
const requireAuth = (req, res, next) => {
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  // Verify token logic here...
  next();
};

// Use middleware on specific routes
app.get('/protected', requireAuth, (req, res) => {
  res.json({ message: 'This is a protected route!' });
});
```

### Third-party Middleware

```bash
npm install cors morgan helmet
```

```javascript
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

// Security headers
app.use(helmet());

// Enable CORS
app.use(cors());

// HTTP request logging
app.use(morgan('combined'));
```

---

## Routing in Express

### Basic Routes

```javascript
// GET request
app.get('/users', (req, res) => {
  res.json({ message: 'Get all users' });
});

// POST request
app.post('/users', (req, res) => {
  res.json({ message: 'Create a new user' });
});

// PUT request
app.put('/users/:id', (req, res) => {
  res.json({ message: `Update user ${req.params.id}` });
});

// DELETE request
app.delete('/users/:id', (req, res) => {
  res.json({ message: `Delete user ${req.params.id}` });
});
```

### Route Parameters

```javascript
// Single parameter
app.get('/users/:id', (req, res) => {
  const userId = req.params.id;
  res.json({ userId: userId });
});

// Multiple parameters
app.get('/users/:userId/posts/:postId', (req, res) => {
  const { userId, postId } = req.params;
  res.json({ userId, postId });
});

// Optional parameters
app.get('/posts/:year/:month?', (req, res) => {
  const { year, month } = req.params;
  res.json({ year, month: month || 'all' });
});
```

### Query Parameters

```javascript
// URL: /search?q=javascript&limit=10
app.get('/search', (req, res) => {
  const { q, limit = 20 } = req.query;
  res.json({ 
    query: q, 
    limit: parseInt(limit),
    results: [] // Your search results here
  });
});
```

### Router Module

For better organization, use Express Router:

**routes/users.js**:
```javascript
const express = require('express');
const router = express.Router();

// All routes here are prefixed with /users
router.get('/', (req, res) => {
  res.json({ message: 'Get all users' });
});

router.get('/:id', (req, res) => {
  res.json({ message: `Get user ${req.params.id}` });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create user' });
});

module.exports = router;
```

**app.js**:
```javascript
const express = require('express');
const userRoutes = require('./routes/users');

const app = express();

app.use('/users', userRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
```

---

## Working with Data

### Handling Request Bodies

```javascript
const express = require('express');
const app = express();

// Enable JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle form data
app.post('/users', (req, res) => {
  const { name, email, age } = req.body;
  
  // Validation
  if (!name || !email) {
    return res.status(400).json({ 
      error: 'Name and email are required' 
    });
  }
  
  // Process the data (save to database, etc.)
  const newUser = {
    id: Date.now(), // Simple ID generation
    name,
    email,
    age: age || null
  };
  
  res.status(201).json({
    message: 'User created successfully',
    user: newUser
  });
});
```

### File Uploads

```bash
npm install multer
```

```javascript
const multer = require('multer');

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Single file upload
app.post('/upload', upload.single('avatar'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  res.json({
    message: 'File uploaded successfully',
    filename: req.file.filename
  });
});

// Multiple files upload
app.post('/upload-multiple', upload.array('photos', 5), (req, res) => {
  res.json({
    message: 'Files uploaded successfully',
    files: req.files.map(file => file.filename)
  });
});
```

### Working with Databases

#### Using JSON as a Simple Database

```javascript
const fs = require('fs').promises;
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data.json');

// Read data
async function readData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return []; // Return empty array if file doesn't exist
  }
}

// Write data
async function writeData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await readData();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read users' });
  }
});

// Create user
app.post('/api/users', async (req, res) => {
  try {
    const users = await readData();
    const newUser = {
      id: Date.now(),
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    await writeData(users);
    
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});
```

---

## Error Handling

### Basic Error Handling

```javascript
// Async route handler with error handling
app.get('/users/:id', async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    // Simulate database operation
    if (userId === '999') {
      throw new Error('User not found');
    }
    
    const user = { id: userId, name: 'John Doe' };
    res.json(user);
  } catch (error) {
    next(error); // Pass error to error handler
  }
});

// Global error handler (must be last middleware)
app.use((error, req, res, next) => {
  console.error('Error:', error.message);
  
  res.status(500).json({
    error: 'Something went wrong!',
    message: error.message
  });
});
```

### Custom Error Classes

```javascript
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

// Usage
app.get('/users/:id', async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    if (!userId || userId === '999') {
      throw new AppError('User not found', 404);
    }
    
    const user = { id: userId, name: 'John Doe' };
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Enhanced error handler
app.use((error, req, res, next) => {
  console.error('Error:', error.message);
  
  const statusCode = error.statusCode || 500;
  const message = error.isOperational ? error.message : 'Something went wrong!';
  
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});
```

---

## Best Practices

### 1. Project Structure

```
my-express-app/
├── app.js              # Main application file
├── package.json        # Dependencies and scripts
├── .env               # Environment variables
├── .gitignore         # Git ignore file
├── routes/            # Route handlers
│   ├── users.js
│   └── posts.js
├── middleware/        # Custom middleware
│   ├── auth.js
│   └── validation.js
├── models/           # Data models
│   └── User.js
├── controllers/      # Business logic
│   └── userController.js
├── utils/           # Utility functions
│   └── helpers.js
├── public/          # Static files
│   ├── css/
│   ├── js/
│   └── images/
└── views/           # Template files
    └── index.html
```

### 2. Environment Variables

Install dotenv:
```bash
npm install dotenv
```

Create `.env` file:
```
NODE_ENV=development
PORT=3000
DATABASE_URL=mongodb://localhost:27017/myapp
JWT_SECRET=your-secret-key
```

Use in your app:
```javascript
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const dbUrl = process.env.DATABASE_URL;
```

### 3. Input Validation

```bash
npm install joi
```

```javascript
const Joi = require('joi');

const userSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  age: Joi.number().integer().min(0).max(120)
});

app.post('/users', (req, res) => {
  const { error, value } = userSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      error: 'Validation failed',
      details: error.details[0].message
    });
  }
  
  // Process valid data
  res.json({ message: 'User created', user: value });
});
```

### 4. Security Headers

```bash
npm install helmet
```

```javascript
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));
```

### 5. Rate Limiting

```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);
```

---

## Common Patterns

### 1. RESTful API Pattern

```javascript
const express = require('express');
const router = express.Router();

// GET /api/users - Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users/:id - Get specific user
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/users - Create new user
router.post('/', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/users/:id - Update user
router.put('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

### 2. Controller Pattern

**controllers/userController.js**:
```javascript
const User = require('../models/User');

const userController = {
  // Get all users
  getAllUsers: async (req, res, next) => {
    try {
      const users = await User.findAll();
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      next(error);
    }
  },

  // Get user by ID
  getUserById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = await User.findById(id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  },

  // Create new user
  createUser: async (req, res, next) => {
    try {
      const userData = req.body;
      const user = await User.create(userData);
      
      res.status(201).json({
        success: true,
        data: user,
        message: 'User created successfully'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = userController;
```

**routes/users.js**:
```javascript
const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);

module.exports = router;
```

### 3. Middleware Chain Pattern

```javascript
const express = require('express');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateUser = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('age').optional().isInt({ min: 0 }).withMessage('Age must be a positive integer'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];

// Authentication middleware
const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }
  
  // Verify token logic here...
  req.user = { id: 1, name: 'John Doe' }; // Mock user
  next();
};

// Usage: Chain multiple middleware
app.post('/users', requireAuth, validateUser, userController.createUser);
```

---

## Resources and Next Steps

### Essential npm Packages for Express Apps

```bash
# Core packages
npm install express dotenv

# Security
npm install helmet cors express-rate-limit

# Validation
npm install joi express-validator

# File uploads
npm install multer

# Logging
npm install morgan winston

# Database (choose one)
npm install mongoose          # MongoDB
npm install pg sequelize     # PostgreSQL
npm install mysql2 sequelize # MySQL

# Authentication
npm install jsonwebtoken bcryptjs

# Testing
npm install --save-dev jest supertest nodemon
```

### Useful Development Scripts

Add to your `package.json`:

```json
{
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js",
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

### Learning Resources

1. **Official Documentation**:
   - [Node.js Docs](https://nodejs.org/docs/)
   - [Express.js Docs](https://expressjs.com/)

2. **Practice Projects**:
   - Build a simple blog API
   - Create a todo list application
   - Develop a user authentication system
   - Build a file upload service

3. **Next Steps**:
   - Learn about databases (MongoDB, PostgreSQL)
   - Explore authentication (JWT, OAuth)
   - Study testing (Jest, Mocha)
   - Learn about deployment (Heroku, AWS, DigitalOcean)
   - Understand Docker containerization

### Common Interview Questions

1. **What is Node.js and how does it work?**
2. **Explain the event loop in Node.js**
3. **What is middleware in Express?**
4. **How do you handle errors in Express?**
5. **What is the difference between req.params, req.query, and req.body?**
6. **How do you secure an Express application?**
7. **Explain RESTful API principles**

---

## Quick Reference Commands

```bash
# Initialize new project
npm init -y

# Install Express
npm install express

# Install development dependencies
npm install --save-dev nodemon

# Run in development
npm run dev

# Run in production
npm start

# Install common packages
npm install express dotenv helmet cors morgan
```

---

This guide covers the fundamentals you need to get started with Node.js and Express. Remember to practice by building small projects and gradually increasing complexity. Good luck with your take-home assignment!
