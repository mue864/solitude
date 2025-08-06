# MongoDB Shell (mongosh) Basics

## Introduction to MongoDB Shell

The MongoDB Shell (`mongosh`) is an interactive JavaScript interface to MongoDB. It allows you to query and update data, perform administrative operations, and interact with your MongoDB instances from the command line.

---

## Connecting to MongoDB

### Local Connection
```bash
# Connect to local MongoDB (default: localhost:27017)
mongosh

# Connect to specific local database
mongosh mongodb://localhost:27017/myapp

# Connect with authentication
mongosh mongodb://username:password@localhost:27017/myapp
```

### MongoDB Atlas Connection
```bash
# Connect to MongoDB Atlas
mongosh "mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/myapp"

# You can also connect without specifying database
mongosh "mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/"
```

### Connection Options
```bash
# Connect with specific options
mongosh --host localhost --port 27017 --username myuser --password

# Connect with SSL
mongosh --ssl --host cluster0.xxxxx.mongodb.net --username myuser
```

---

## Basic Shell Commands

### Getting Help
```javascript
// General help
help

// Database help
db.help()

// Collection help
db.users.help()

// Help for specific method
db.users.find.help()
```

### Database Operations

#### Working with Databases
```javascript
// Show all databases
show dbs
show databases  // Alternative

// Switch to database (creates if doesn't exist)
use myapp

// Show current database
db
db.getName()

// Get database statistics
db.stats()

// Drop current database
db.dropDatabase()
```

#### Database Information
```javascript
// Get database version
db.version()

// Get server status
db.serverStatus()

// Get database users
db.getUsers()

// Get database roles
db.getRoles()
```

### Collection Operations

#### Basic Collection Commands
```javascript
// Show all collections
show collections
show tables  // Alternative

// Create collection explicitly
db.createCollection("users")

// Create collection with options
db.createCollection("logs", {
  capped: true,        // Fixed size collection
  size: 100000,        // Size in bytes
  max: 1000           // Maximum documents
})

// Drop collection
db.users.drop()

// Rename collection
db.users.renameCollection("customers")
```

#### Collection Information
```javascript
// Get collection statistics
db.users.stats()

// Count documents in collection
db.users.countDocuments()
db.users.estimatedDocumentCount()  // Faster but less accurate

// Get collection size
db.users.dataSize()

// Check if collection exists
db.getCollectionNames().includes("users")
```

---

## Working with Documents

### Inserting Documents

#### Insert Single Document
```javascript
// Insert one document
db.users.insertOne({
  name: "John Doe",
  email: "john@example.com",
  age: 30,
  createdAt: new Date()
})

// Result shows:
{
  acknowledged: true,
  insertedId: ObjectId("64a1b2c3d4e5f6789012345")
}
```

#### Insert Multiple Documents
```javascript
// Insert multiple documents
db.users.insertMany([
  {
    name: "Alice Smith",
    email: "alice@example.com",
    age: 25,
    department: "Engineering"
  },
  {
    name: "Bob Johnson",
    email: "bob@example.com",
    age: 35,
    department: "Marketing"
  },
  {
    name: "Carol Williams",
    email: "carol@example.com",
    age: 28,
    department: "Design"
  }
])

// Result shows:
{
  acknowledged: true,
  insertedIds: {
    '0': ObjectId("64a1b2c3d4e5f6789012346"),
    '1': ObjectId("64a1b2c3d4e5f6789012347"),
    '2': ObjectId("64a1b2c3d4e5f6789012348")
  }
}
```

### Finding Documents

#### Basic Find Operations
```javascript
// Find all documents
db.users.find()

// Find with pretty formatting
db.users.find().pretty()

// Find one document
db.users.findOne()

// Find with condition
db.users.find({ name: "John Doe" })

// Find with multiple conditions
db.users.find({ age: 30, department: "Engineering" })
```

#### Query with Operators
```javascript
// Comparison operators
db.users.find({ age: { $gt: 25 } })        // Greater than
db.users.find({ age: { $gte: 25 } })       // Greater than or equal
db.users.find({ age: { $lt: 35 } })        // Less than
db.users.find({ age: { $lte: 35 } })       // Less than or equal
db.users.find({ age: { $ne: 30 } })        // Not equal
db.users.find({ age: { $in: [25, 30, 35] } })  // In array
db.users.find({ age: { $nin: [25, 30] } })     // Not in array

// Logical operators
db.users.find({
  $and: [
    { age: { $gte: 25 } },
    { department: "Engineering" }
  ]
})

db.users.find({
  $or: [
    { age: { $lt: 25 } },
    { age: { $gt: 35 } }
  ]
})

db.users.find({
  $nor: [
    { age: { $lt: 25 } },
    { department: "Engineering" }
  ]
})

db.users.find({
  age: { $not: { $lt: 30 } }
})
```

#### String Queries
```javascript
// Exact match
db.users.find({ name: "John Doe" })

// Regular expressions
db.users.find({ name: { $regex: "^John" } })           // Starts with "John"
db.users.find({ name: { $regex: "Doe$" } })            // Ends with "Doe"
db.users.find({ name: { $regex: "john", $options: "i" } })  // Case insensitive

// Text search (requires text index)
db.users.find({ $text: { $search: "john engineer" } })
```

#### Array Queries
```javascript
// Array contains value
db.users.find({ hobbies: "reading" })

// Array contains all values
db.users.find({ hobbies: { $all: ["reading", "coding"] } })

// Array size
db.users.find({ hobbies: { $size: 3 } })

// Element match
db.users.find({
  "scores": {
    $elemMatch: {
      $gte: 80,
      $lt: 85
    }
  }
})
```

#### Field Existence and Type
```javascript
// Field exists
db.users.find({ email: { $exists: true } })

// Field doesn't exist
db.users.find({ middleName: { $exists: false } })

// Field is not null
db.users.find({ email: { $ne: null } })

// Field type
db.users.find({ age: { $type: "number" } })
db.users.find({ age: { $type: 16 } })  // 16 = 32-bit integer
```

### Projection (Selecting Fields)

```javascript
// Include only specific fields
db.users.find({}, { name: 1, email: 1 })

// Exclude specific fields
db.users.find({}, { password: 0, _id: 0 })

// Include with condition
db.users.find(
  { age: { $gte: 25 } },
  { name: 1, age: 1, department: 1 }
)

// Array projection
db.users.find(
  {},
  { name: 1, "hobbies": { $slice: 2 } }  // First 2 hobbies
)
```

### Sorting, Limiting, and Skipping

```javascript
// Sort ascending (1) and descending (-1)
db.users.find().sort({ name: 1 })
db.users.find().sort({ age: -1 })
db.users.find().sort({ age: -1, name: 1 })

// Limit results
db.users.find().limit(5)

// Skip results (useful for pagination)
db.users.find().skip(10).limit(5)

// Combine operations
db.users.find({ age: { $gte: 25 } })
        .sort({ age: -1 })
        .limit(10)
        .pretty()
```

---

## Shell Variables and Functions

### Using Variables
```javascript
// Store query results in variables
var youngUsers = db.users.find({ age: { $lt: 30 } })

// Iterate through results
youngUsers.forEach(function(user) {
  print("Name: " + user.name + ", Age: " + user.age)
})

// Store single document
var user = db.users.findOne({ name: "John Doe" })
print(user.email)
```

### JavaScript in the Shell
```javascript
// Use JavaScript functions
function findUsersByAge(minAge, maxAge) {
  return db.users.find({
    age: { $gte: minAge, $lte: maxAge }
  }).toArray()
}

// Call the function
var adults = findUsersByAge(18, 65)
print("Found " + adults.length + " adult users")

// Use loops
for (var i = 0; i < 5; i++) {
  db.test.insertOne({ number: i, created: new Date() })
}
```

### Useful Shell Methods
```javascript
// Convert cursor to array
var users = db.users.find().toArray()

// Get execution statistics
db.users.find({ age: { $gte: 25 } }).explain("executionStats")

// Pretty print JSON
printjson(db.users.findOne())

// Print with custom formatting
db.users.find().forEach(function(doc) {
  print(doc.name + " (" + doc.age + ")")
})
```

---

## Administrative Operations

### Index Management
```javascript
// Create index
db.users.createIndex({ email: 1 })
db.users.createIndex({ age: 1, name: 1 })  // Compound index

// List indexes
db.users.getIndexes()

// Drop index
db.users.dropIndex({ email: 1 })
db.users.dropIndex("email_1")  // By name

// Index statistics
db.users.stats().indexSizes
```

### User Management
```javascript
// Create user
db.createUser({
  user: "appUser",
  pwd: "password123",
  roles: [
    { role: "readWrite", db: "myapp" }
  ]
})

// List users
db.getUsers()

// Drop user
db.dropUser("appUser")
```

### Performance and Monitoring
```javascript
// Current operations
db.currentOp()

// Kill operation
db.killOp(operationId)

// Server status
db.serverStatus()

// Database profiling
db.setProfilingLevel(2)  // Profile all operations
db.getProfilingStatus()
db.system.profile.find().pretty()
```

---

## Shell Configuration

### Customize the Prompt
```javascript
// Custom prompt showing database and time
prompt = function() {
  return db + " [" + new Date().toLocaleTimeString() + "] > "
}
```

### Load External Scripts
```javascript
// Load JavaScript file
load("myScript.js")

// Example myScript.js content:
function bulkInsertUsers(count) {
  var users = []
  for (var i = 0; i < count; i++) {
    users.push({
      name: "User " + i,
      email: "user" + i + "@example.com",
      age: Math.floor(Math.random() * 50) + 18
    })
  }
  return db.users.insertMany(users)
}
```

### Shell Startup Script
Create a `.mongoshrc.js` file in your home directory:

```javascript
// ~/.mongoshrc.js
print("Welcome to MongoDB Shell!")

// Custom helper functions
function showCollections() {
  return db.getCollectionNames()
}

function countAll() {
  var collections = db.getCollectionNames()
  collections.forEach(function(collection) {
    var count = db[collection].countDocuments()
    print(collection + ": " + count + " documents")
  })
}

// Custom prompt
prompt = function() {
  return db + " > "
}
```

---

## Common Shell Patterns

### Bulk Operations
```javascript
// Bulk insert with error handling
try {
  var result = db.users.insertMany([
    { name: "User 1", email: "user1@example.com" },
    { name: "User 2", email: "user2@example.com" },
    { name: "User 3", email: "user3@example.com" }
  ])
  print("Inserted " + result.insertedIds.length + " documents")
} catch (error) {
  print("Error: " + error.message)
}
```

### Data Migration
```javascript
// Migrate data between collections
db.oldUsers.find().forEach(function(doc) {
  // Transform document
  doc.fullName = doc.firstName + " " + doc.lastName
  delete doc.firstName
  delete doc.lastName
  
  // Insert into new collection
  db.newUsers.insertOne(doc)
})
```

### Data Validation
```javascript
// Find documents with missing required fields
db.users.find({
  $or: [
    { name: { $exists: false } },
    { email: { $exists: false } },
    { name: "" },
    { email: "" }
  ]
})

// Find invalid email formats
db.users.find({
  email: { $not: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
})
```

---

## Tips and Best Practices

### Performance Tips
1. **Use indexes** for frequently queried fields
2. **Limit results** when you don't need all documents
3. **Use projection** to return only needed fields
4. **Explain queries** to understand performance

### Safety Tips
1. **Always backup** before bulk operations
2. **Test queries** on small datasets first
3. **Use transactions** for multi-document operations
4. **Validate data** before insertion

### Productivity Tips
1. **Use shell history** (up/down arrows)
2. **Tab completion** for collection names
3. **Save common queries** as functions
4. **Use variables** for complex queries

---

## Next Steps

Now that you're comfortable with the MongoDB shell, you can explore:

1. **[CRUD Operations](03-crud-operations.md)** - Detailed Create, Read, Update, Delete operations
2. **[Data Modeling](04-data-modeling.md)** - Design effective document structures
3. **[Indexing and Performance](06-indexing-performance.md)** - Optimize your queries
4. **[Aggregation Framework](07-aggregation-framework.md)** - Advanced data processing

The MongoDB shell is a powerful tool for development, testing, and administration. Practice these commands and patterns to become proficient with MongoDB!
