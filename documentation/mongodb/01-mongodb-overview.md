# MongoDB Overview & Setup

## What is MongoDB?

MongoDB is a **NoSQL document database** that stores data in flexible, JSON-like documents instead of traditional rows and columns. It's designed to be scalable, flexible, and developer-friendly.

### Key Characteristics:
- **Document-oriented**: Stores data as documents (similar to JSON objects)
- **Schema-flexible**: No rigid table structure required
- **Horizontally scalable**: Can distribute data across multiple servers
- **Rich query language**: Supports complex queries and indexing
- **High performance**: Optimized for read and write operations

### Why Use MongoDB?

1. **Flexible schema**: Easy to evolve your data structure
2. **Natural data representation**: Documents map well to objects in code
3. **Scalability**: Built for modern, distributed applications
4. **Rich ecosystem**: Great tools and community support
5. **Developer productivity**: Faster development cycles

### MongoDB vs SQL Databases

| SQL Database | MongoDB |
|--------------|---------|
| Tables | Collections |
| Rows | Documents |
| Columns | Fields |
| Primary Key | _id field |
| JOIN | Embedded documents or references |
| Schema | Flexible schema |
| ACID | ACID with multi-document transactions |

---

## Setting Up Your MongoDB Environment

### Option 1: MongoDB Atlas (Cloud - Recommended for Beginners)

MongoDB Atlas is a fully managed cloud database service that's perfect for getting started quickly.

#### Step 1: Create Account
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Verify your email address

#### Step 2: Create a Cluster
1. Click "Create a New Cluster"
2. Choose the **M0 Sandbox** (Free tier)
3. Select a cloud provider and region (choose one close to you)
4. Give your cluster a name
5. Click "Create Cluster" (takes 1-3 minutes)

#### Step 3: Configure Database Access
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a username and strong password
5. Set user privileges to "Read and write to any database"
6. Click "Add User"

#### Step 4: Configure Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development only)
4. Click "Confirm"

#### Step 5: Get Connection String
1. Go to "Clusters" and click "Connect"
2. Choose "Connect your application"
3. Select "Node.js" and your version
4. Copy the connection string

**Connection String Example**:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/myapp?retryWrites=true&w=majority
```

### Option 2: Local Installation

#### Windows Installation
1. **Download MongoDB Community Server**:
   - Go to [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
   - Select "Windows" and "msi" package
   - Download the installer

2. **Install MongoDB**:
   - Run the downloaded `.msi` file
   - Choose "Complete" installation
   - Install "MongoDB Compass" (GUI tool)
   - MongoDB will start as a Windows service automatically

3. **Verify Installation**:
   - Open Command Prompt
   - Run: `mongod --version`
   - You should see version information

#### macOS Installation (using Homebrew)
```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Add MongoDB tap
brew tap mongodb/brew

# Install MongoDB Community Edition
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Verify installation
mongod --version
```

#### Ubuntu/Linux Installation
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod

# Enable MongoDB to start on boot
sudo systemctl enable mongod

# Verify installation
mongod --version
```

### Install MongoDB Shell (mongosh)

The MongoDB Shell is a command-line interface for interacting with MongoDB.

```bash
# Install globally using npm
npm install -g mongosh

# Verify installation
mongosh --version
```

### Verify Your Setup

#### For Local Installation:
```bash
# Connect to local MongoDB
mongosh

# You should see something like:
# Current Mongosh Log ID: 64a1b2c3d4e5f6789012345
# Connecting to: mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000
# Using MongoDB: 6.0.0
# Using Mongosh: 1.10.1
```

#### For MongoDB Atlas:
```bash
# Connect using your connection string
mongosh "mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/myapp"

# You should see a successful connection message
```

### MongoDB Compass (GUI Tool)

MongoDB Compass is a graphical user interface for MongoDB that makes it easy to explore and manipulate your data.

#### Installation:
- **Included with MongoDB Community Server** on Windows
- **Download separately** from [mongodb.com/products/compass](https://www.mongodb.com/products/compass)

#### Features:
- Visual query builder
- Real-time performance metrics
- Schema visualization
- Index management
- Document editing

#### Connecting to Your Database:
1. Open MongoDB Compass
2. For local: Use `mongodb://localhost:27017`
3. For Atlas: Use your Atlas connection string
4. Click "Connect"

---

## MongoDB Core Concepts

### 1. Documents

Documents are the basic unit of data in MongoDB, similar to JSON objects but stored in a format called BSON (Binary JSON).

#### Example Document:
```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  name: "John Doe",
  email: "john@example.com",
  age: 30,
  address: {
    street: "123 Main St",
    city: "New York",
    zipCode: "10001",
    country: "USA"
  },
  hobbies: ["reading", "swimming", "coding"],
  isActive: true,
  createdAt: ISODate("2023-01-15T10:30:00Z"),
  metadata: {
    source: "web",
    campaign: "signup_bonus"
  }
}
```

#### Key Points About Documents:
- **Unique ID**: Every document has a unique `_id` field (auto-generated if not provided)
- **Flexible structure**: Documents can have different fields and structures
- **Nested objects**: Support for embedded documents and arrays
- **Size limit**: Maximum document size is 16MB
- **Field names**: Case-sensitive and cannot start with `$` or contain `.`

### 2. Collections

Collections are groups of documents, similar to tables in relational databases, but without a fixed schema.

#### Example Collections:
```javascript
// Users collection
{
  _id: ObjectId("..."),
  name: "Alice Smith",
  email: "alice@example.com",
  role: "user"
}

// Posts collection
{
  _id: ObjectId("..."),
  title: "My First Blog Post",
  content: "Hello World!",
  authorId: ObjectId("..."),
  tags: ["mongodb", "tutorial"]
}

// Orders collection
{
  _id: ObjectId("..."),
  customerId: ObjectId("..."),
  items: [
    { product: "Laptop", price: 999.99, quantity: 1 }
  ],
  total: 999.99,
  status: "pending"
}
```

#### Key Points About Collections:
- **Auto-created**: Collections are created automatically when you insert documents
- **No schema**: Documents in the same collection can have different structures
- **Naming**: Collection names are case-sensitive and have some restrictions
- **Indexes**: Each collection can have multiple indexes for performance

### 3. Databases

Databases contain collections and provide a namespace for your data.

#### Database Operations:
```javascript
// Switch to or create a database
use myapp

// List all databases
show dbs

// Show current database
db

// List collections in current database
show collections

// Get database stats
db.stats()
```

#### Key Points About Databases:
- **Auto-created**: Databases are created when you first store data in them
- **Case-sensitive**: Database names are case-sensitive
- **Naming restrictions**: Cannot contain certain characters like spaces or `/`
- **Default databases**: `admin`, `local`, and `config` are system databases

### 4. Data Types

MongoDB supports rich data types that map well to programming language types:

```javascript
{
  // String
  name: "John Doe",
  
  // Number (32-bit integer)
  age: NumberInt(30),
  
  // Number (64-bit integer)
  views: NumberLong(1000000),
  
  // Number (64-bit floating point)
  price: 29.99,
  
  // Boolean
  isActive: true,
  
  // Date
  createdAt: new Date(),
  createdAt: ISODate("2023-01-15T10:30:00Z"),
  
  // Array
  tags: ["mongodb", "database", "nosql"],
  
  // Object/Embedded Document
  address: {
    street: "123 Main St",
    city: "New York",
    coordinates: [40.7128, -74.0060]
  },
  
  // ObjectId (12-byte identifier)
  _id: ObjectId("507f1f77bcf86cd799439011"),
  userId: ObjectId("507f1f77bcf86cd799439012"),
  
  // Null
  middleName: null,
  
  // Regular Expression
  pattern: /^[a-zA-Z0-9]+$/,
  
  // Binary Data
  profilePicture: BinData(0, "base64encodeddata=="),
  
  // Decimal128 (high precision decimal)
  precisePrice: NumberDecimal("99.99"),
  
  // MinKey and MaxKey (special comparison values)
  minValue: MinKey(),
  maxValue: MaxKey()
}
```

### 5. ObjectId

ObjectId is MongoDB's default primary key type, consisting of:
- **4 bytes**: Unix timestamp (creation time)
- **5 bytes**: Random unique value
- **3 bytes**: Incrementing counter

```javascript
// ObjectId structure
ObjectId("507f1f77bcf86cd799439011")
//        |-------||----|---|
//        timestamp|rand|inc
//                 |    |
//                 |    3-byte incrementing counter
//                 5-byte random value

// Extract timestamp from ObjectId
ObjectId("507f1f77bcf86cd799439011").getTimestamp()
// Returns: ISODate("2012-10-17T20:46:47.000Z")
```

---

## Next Steps

Now that you understand MongoDB's core concepts and have it set up, you can move on to:

1. **[MongoDB Shell Basics](02-mongodb-shell-basics.md)** - Learn to use the MongoDB command line
2. **[CRUD Operations](03-crud-operations.md)** - Create, Read, Update, Delete operations
3. **[Data Modeling](04-data-modeling.md)** - Design effective document structures
4. **[Using MongoDB with Node.js](05-mongodb-nodejs.md)** - Integrate with your applications

---

## Quick Reference

### Connection Strings
```bash
# Local MongoDB
mongodb://localhost:27017

# Local with authentication
mongodb://username:password@localhost:27017

# MongoDB Atlas
mongodb+srv://username:password@cluster.mongodb.net/database

# Local with specific database
mongodb://localhost:27017/myapp
```

### Basic Commands
```javascript
// Database operations
use myapp              // Switch to database
show dbs              // List databases
db                    // Show current database
db.dropDatabase()     // Delete current database

// Collection operations
show collections      // List collections
db.createCollection("users")  // Create collection
db.users.drop()       // Delete collection
```

This overview provides the foundation you need to understand MongoDB. The concepts here will be referenced throughout the other sections of this guide.
