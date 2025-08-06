# MongoDB CRUD Operations

## Introduction

CRUD stands for **Create, Read, Update, Delete** - the four basic operations you can perform on data. This guide covers all MongoDB CRUD operations with practical examples and best practices.

---

## Create Operations

### insertOne() - Insert Single Document

```javascript
// Basic insert
db.users.insertOne({
  name: "John Doe",
  email: "john@example.com",
  age: 30,
  createdAt: new Date()
})

// Result:
{
  acknowledged: true,
  insertedId: ObjectId("64a1b2c3d4e5f6789012345")
}
```

#### Insert with Custom _id
```javascript
// Using custom _id
db.products.insertOne({
  _id: "PROD-001",
  name: "Laptop",
  price: 999.99,
  category: "Electronics"
})

// Using ObjectId
db.users.insertOne({
  _id: new ObjectId(),
  name: "Jane Smith",
  email: "jane@example.com"
})
```

#### Insert with Validation
```javascript
// Insert with error handling
try {
  const result = db.users.insertOne({
    name: "Alice Johnson",
    email: "alice@example.com",
    age: 25,
    department: "Engineering"
  })
  print("User created with ID: " + result.insertedId)
} catch (error) {
  print("Error creating user: " + error.message)
}
```

### insertMany() - Insert Multiple Documents

```javascript
// Insert multiple documents
db.users.insertMany([
  {
    name: "Bob Wilson",
    email: "bob@example.com",
    age: 35,
    department: "Marketing"
  },
  {
    name: "Carol Brown",
    email: "carol@example.com",
    age: 28,
    department: "Design"
  },
  {
    name: "David Lee",
    email: "david@example.com",
    age: 32,
    department: "Engineering"
  }
])

// Result:
{
  acknowledged: true,
  insertedIds: {
    '0': ObjectId("64a1b2c3d4e5f6789012346"),
    '1': ObjectId("64a1b2c3d4e5f6789012347"),
    '2': ObjectId("64a1b2c3d4e5f6789012348")
  }
}
```

#### Insert with Options
```javascript
// Insert with ordered: false (continue on error)
db.users.insertMany([
  { name: "User 1", email: "user1@example.com" },
  { name: "User 2", email: "invalid-email" },  // This might fail validation
  { name: "User 3", email: "user3@example.com" }
], { ordered: false })

// Insert with write concern
db.users.insertMany([
  { name: "User A", email: "usera@example.com" },
  { name: "User B", email: "userb@example.com" }
], { 
  writeConcern: { w: "majority", j: true, wtimeout: 5000 }
})
```

---

## Read Operations

### find() - Query Documents

#### Basic Find Operations
```javascript
// Find all documents
db.users.find()

// Find with condition
db.users.find({ department: "Engineering" })

// Find one document
db.users.findOne({ email: "john@example.com" })

// Find by ObjectId
db.users.findOne({ _id: ObjectId("64a1b2c3d4e5f6789012345") })
```

#### Comparison Operators
```javascript
// Equal ($eq)
db.users.find({ age: { $eq: 30 } })
db.users.find({ age: 30 })  // Shorthand

// Not equal ($ne)
db.users.find({ department: { $ne: "Engineering" } })

// Greater than ($gt)
db.users.find({ age: { $gt: 25 } })

// Greater than or equal ($gte)
db.users.find({ age: { $gte: 30 } })

// Less than ($lt)
db.users.find({ age: { $lt: 35 } })

// Less than or equal ($lte)
db.users.find({ age: { $lte: 30 } })

// In array ($in)
db.users.find({ department: { $in: ["Engineering", "Design"] } })

// Not in array ($nin)
db.users.find({ department: { $nin: ["Marketing", "Sales"] } })
```

#### Logical Operators
```javascript
// AND (implicit)
db.users.find({ 
  age: { $gte: 25 }, 
  department: "Engineering" 
})

// AND (explicit)
db.users.find({
  $and: [
    { age: { $gte: 25 } },
    { department: "Engineering" }
  ]
})

// OR
db.users.find({
  $or: [
    { age: { $lt: 25 } },
    { age: { $gt: 35 } }
  ]
})

// NOR (not or)
db.users.find({
  $nor: [
    { age: { $lt: 25 } },
    { department: "Engineering" }
  ]
})

// NOT
db.users.find({
  age: { $not: { $lt: 30 } }
})
```

#### Element Operators
```javascript
// Field exists
db.users.find({ phone: { $exists: true } })

// Field doesn't exist
db.users.find({ phone: { $exists: false } })

// Field type
db.users.find({ age: { $type: "number" } })
db.users.find({ age: { $type: 16 } })  // 16 = 32-bit integer

// Multiple types
db.users.find({ age: { $type: ["number", "string"] } })
```

#### Array Operators
```javascript
// Array contains value
db.users.find({ hobbies: "reading" })

// Array contains all values
db.users.find({ hobbies: { $all: ["reading", "coding"] } })

// Array size
db.users.find({ hobbies: { $size: 3 } })

// Element match
db.users.find({
  scores: {
    $elemMatch: {
      subject: "math",
      score: { $gte: 80 }
    }
  }
})
```

#### String Operators
```javascript
// Regular expressions
db.users.find({ name: { $regex: /^John/ } })
db.users.find({ name: { $regex: "^John" } })

// Case insensitive
db.users.find({ name: { $regex: "john", $options: "i" } })

// Text search (requires text index)
db.users.find({ $text: { $search: "john engineer" } })

// Text search with score
db.users.find(
  { $text: { $search: "john engineer" } },
  { score: { $meta: "textScore" } }
).sort({ score: { $meta: "textScore" } })
```

### Projection - Selecting Fields

```javascript
// Include specific fields
db.users.find({}, { name: 1, email: 1 })

// Exclude specific fields
db.users.find({}, { password: 0, _id: 0 })

// Mixed inclusion (with _id)
db.users.find({}, { name: 1, email: 1, _id: 0 })

// Array projection
db.users.find({}, { 
  name: 1, 
  hobbies: { $slice: 2 }  // First 2 hobbies
})

// Array projection with skip
db.users.find({}, { 
  name: 1, 
  hobbies: { $slice: [1, 2] }  // Skip 1, take 2
})

// Conditional projection
db.users.find({}, {
  name: 1,
  email: 1,
  status: {
    $cond: {
      if: { $gte: ["$age", 18] },
      then: "adult",
      else: "minor"
    }
  }
})
```

### Sorting, Limiting, and Pagination

```javascript
// Sort ascending (1) and descending (-1)
db.users.find().sort({ name: 1 })
db.users.find().sort({ age: -1 })

// Multiple sort criteria
db.users.find().sort({ department: 1, age: -1 })

// Limit results
db.users.find().limit(5)

// Skip results
db.users.find().skip(10)

// Pagination pattern
const page = 2
const limit = 10
const skip = (page - 1) * limit

db.users.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)

// Count total documents
const total = db.users.countDocuments()
const totalPages = Math.ceil(total / limit)
```

### Advanced Query Patterns

#### Nested Document Queries
```javascript
// Query nested fields
db.users.find({ "address.city": "New York" })

// Query nested arrays
db.users.find({ "scores.0": { $gte: 80 } })  // First score >= 80

// Element match on nested documents
db.users.find({
  "orders": {
    $elemMatch: {
      "status": "completed",
      "total": { $gte: 100 }
    }
  }
})
```

#### Date Queries
```javascript
// Find documents created today
const today = new Date()
today.setHours(0, 0, 0, 0)
const tomorrow = new Date(today)
tomorrow.setDate(tomorrow.getDate() + 1)

db.users.find({
  createdAt: {
    $gte: today,
    $lt: tomorrow
  }
})

// Find documents from last 30 days
const thirtyDaysAgo = new Date()
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

db.users.find({
  createdAt: { $gte: thirtyDaysAgo }
})

// Date range query
db.users.find({
  createdAt: {
    $gte: ISODate("2023-01-01"),
    $lt: ISODate("2023-12-31")
  }
})
```

---

## Update Operations

### updateOne() - Update Single Document

```javascript
// Basic update
db.users.updateOne(
  { name: "John Doe" },           // Filter
  { $set: { age: 31 } }          // Update
)

// Result:
{
  acknowledged: true,
  insertedId: null,
  matchedCount: 1,
  modifiedCount: 1,
  upsertedCount: 0
}
```

#### Update Operators

##### $set - Set Field Values
```javascript
// Set single field
db.users.updateOne(
  { _id: ObjectId("64a1b2c3d4e5f6789012345") },
  { $set: { age: 32 } }
)

// Set multiple fields
db.users.updateOne(
  { email: "john@example.com" },
  { 
    $set: { 
      age: 32,
      department: "Senior Engineering",
      lastModified: new Date()
    }
  }
)

// Set nested fields
db.users.updateOne(
  { _id: ObjectId("64a1b2c3d4e5f6789012345") },
  { 
    $set: { 
      "address.city": "San Francisco",
      "address.zipCode": "94105"
    }
  }
)
```

##### $unset - Remove Fields
```javascript
// Remove single field
db.users.updateOne(
  { name: "John Doe" },
  { $unset: { age: "" } }
)

// Remove multiple fields
db.users.updateOne(
  { name: "John Doe" },
  { $unset: { age: "", department: "" } }
)
```

##### $inc - Increment Numeric Values
```javascript
// Increment by positive value
db.users.updateOne(
  { name: "John Doe" },
  { $inc: { age: 1 } }
)

// Increment by negative value (decrement)
db.users.updateOne(
  { name: "John Doe" },
  { $inc: { age: -1 } }
)

// Increment multiple fields
db.products.updateOne(
  { _id: "PROD-001" },
  { 
    $inc: { 
      views: 1,
      stock: -1
    }
  }
)
```

##### $mul - Multiply Values
```javascript
// Multiply field value
db.products.updateOne(
  { _id: "PROD-001" },
  { $mul: { price: 1.1 } }  // Increase price by 10%
)
```

##### $min and $max - Update if Smaller/Larger
```javascript
// Update only if new value is smaller
db.products.updateOne(
  { _id: "PROD-001" },
  { $min: { price: 899.99 } }
)

// Update only if new value is larger
db.users.updateOne(
  { name: "John Doe" },
  { $max: { highScore: 1500 } }
)
```

##### $currentDate - Set Current Date
```javascript
// Set current date
db.users.updateOne(
  { name: "John Doe" },
  { $currentDate: { lastModified: true } }
)

// Set current timestamp
db.users.updateOne(
  { name: "John Doe" },
  { $currentDate: { lastModified: { $type: "timestamp" } } }
)
```

#### Array Update Operators

##### $push - Add to Array
```javascript
// Add single item
db.users.updateOne(
  { name: "John Doe" },
  { $push: { hobbies: "gaming" } }
)

// Add multiple items
db.users.updateOne(
  { name: "John Doe" },
  { $push: { hobbies: { $each: ["gaming", "cooking"] } } }
)

// Add with position
db.users.updateOne(
  { name: "John Doe" },
  { 
    $push: { 
      hobbies: { 
        $each: ["swimming"], 
        $position: 0  // Add at beginning
      } 
    } 
  }
)

// Add with sort and slice
db.users.updateOne(
  { name: "John Doe" },
  { 
    $push: { 
      scores: { 
        $each: [85, 92, 78],
        $sort: -1,    // Sort descending
        $slice: 5     // Keep only top 5
      } 
    } 
  }
)
```

##### $pull - Remove from Array
```javascript
// Remove specific value
db.users.updateOne(
  { name: "John Doe" },
  { $pull: { hobbies: "gaming" } }
)

// Remove with condition
db.users.updateOne(
  { name: "John Doe" },
  { $pull: { scores: { $lt: 70 } } }
)

// Remove multiple values
db.users.updateOne(
  { name: "John Doe" },
  { $pull: { hobbies: { $in: ["gaming", "cooking"] } } }
)
```

##### $addToSet - Add Unique to Array
```javascript
// Add if not exists
db.users.updateOne(
  { name: "John Doe" },
  { $addToSet: { hobbies: "reading" } }
)

// Add multiple unique items
db.users.updateOne(
  { name: "John Doe" },
  { $addToSet: { hobbies: { $each: ["reading", "coding"] } } }
)
```

##### $pop - Remove First/Last Array Element
```javascript
// Remove last element
db.users.updateOne(
  { name: "John Doe" },
  { $pop: { hobbies: 1 } }
)

// Remove first element
db.users.updateOne(
  { name: "John Doe" },
  { $pop: { hobbies: -1 } }
)
```

##### Positional Operators
```javascript
// Update first matching array element ($)
db.users.updateOne(
  { "scores.subject": "math" },
  { $set: { "scores.$.score": 95 } }
)

// Update all matching array elements ($[])
db.users.updateOne(
  { name: "John Doe" },
  { $inc: { "scores.$[].score": 5 } }
)

// Update with array filters ($[identifier])
db.users.updateOne(
  { name: "John Doe" },
  { $set: { "scores.$[elem].grade": "A" } },
  { arrayFilters: [{ "elem.score": { $gte: 90 } }] }
)
```

### updateMany() - Update Multiple Documents

```javascript
// Update all matching documents
db.users.updateMany(
  { department: "Engineering" },
  { $set: { bonus: 1000 } }
)

// Update with complex conditions
db.users.updateMany(
  { 
    age: { $gte: 30 },
    department: { $in: ["Engineering", "Design"] }
  },
  { 
    $set: { 
      seniorLevel: true,
      lastPromoted: new Date()
    }
  }
)

// Increment for all documents
db.products.updateMany(
  { category: "Electronics" },
  { $inc: { views: 1 } }
)
```

### replaceOne() - Replace Entire Document

```javascript
// Replace entire document (except _id)
db.users.replaceOne(
  { name: "John Doe" },
  {
    name: "John Doe",
    email: "john.doe@newcompany.com",
    age: 31,
    department: "Senior Engineering",
    skills: ["JavaScript", "MongoDB", "Node.js"],
    updatedAt: new Date()
  }
)
```

### Upsert Operations

```javascript
// Update or insert if not exists
db.users.updateOne(
  { email: "newuser@example.com" },
  { 
    $set: { 
      name: "New User",
      age: 25,
      department: "Engineering",
      createdAt: new Date()
    }
  },
  { upsert: true }
)

// Upsert with $setOnInsert
db.users.updateOne(
  { email: "newuser@example.com" },
  { 
    $set: { lastLogin: new Date() },
    $setOnInsert: { 
      name: "New User",
      createdAt: new Date()
    }
  },
  { upsert: true }
)
```

---

## Delete Operations

### deleteOne() - Delete Single Document

```javascript
// Delete by field
db.users.deleteOne({ name: "John Doe" })

// Delete by ObjectId
db.users.deleteOne({ _id: ObjectId("64a1b2c3d4e5f6789012345") })

// Delete with condition
db.users.deleteOne({ 
  age: { $lt: 18 },
  isActive: false 
})

// Result:
{
  acknowledged: true,
  deletedCount: 1
}
```

### deleteMany() - Delete Multiple Documents

```javascript
// Delete all matching documents
db.users.deleteMany({ department: "Marketing" })

// Delete with complex conditions
db.users.deleteMany({
  $and: [
    { age: { $lt: 18 } },
    { isActive: false },
    { createdAt: { $lt: new Date("2023-01-01") } }
  ]
})

// Delete all documents (be careful!)
db.users.deleteMany({})

// Result:
{
  acknowledged: true,
  deletedCount: 5
}
```

### findOneAndDelete() - Find and Delete

```javascript
// Find and delete, return deleted document
const deletedUser = db.users.findOneAndDelete(
  { email: "john@example.com" }
)

// With projection
const deletedUser = db.users.findOneAndDelete(
  { email: "john@example.com" },
  { projection: { name: 1, email: 1 } }
)

// With sort (delete the oldest)
const deletedUser = db.users.findOneAndDelete(
  { department: "Marketing" },
  { sort: { createdAt: 1 } }
)
```

---

## Advanced CRUD Patterns

### Bulk Operations

```javascript
// Bulk write operations
db.users.bulkWrite([
  {
    insertOne: {
      document: {
        name: "User 1",
        email: "user1@example.com"
      }
    }
  },
  {
    updateOne: {
      filter: { name: "John Doe" },
      update: { $set: { age: 31 } }
    }
  },
  {
    deleteOne: {
      filter: { name: "Old User" }
    }
  }
])

// Bulk write with options
db.users.bulkWrite([
  // operations here
], { 
  ordered: false,  // Continue on error
  writeConcern: { w: "majority" }
})
```

### Transactions (Multi-Document ACID)

```javascript
// Start a session
const session = db.getMongo().startSession()

try {
  session.startTransaction()
  
  // Operations within transaction
  db.accounts.updateOne(
    { _id: "account1" },
    { $inc: { balance: -100 } },
    { session: session }
  )
  
  db.accounts.updateOne(
    { _id: "account2" },
    { $inc: { balance: 100 } },
    { session: session }
  )
  
  // Commit transaction
  session.commitTransaction()
  print("Transaction committed successfully")
  
} catch (error) {
  // Abort transaction on error
  session.abortTransaction()
  print("Transaction aborted: " + error.message)
} finally {
  session.endSession()
}
```

### Atomic Operations

```javascript
// Atomic increment with findOneAndUpdate
const updatedDoc = db.counters.findOneAndUpdate(
  { _id: "pageViews" },
  { $inc: { count: 1 } },
  { 
    returnDocument: "after",  // Return updated document
    upsert: true             // Create if doesn't exist
  }
)

// Atomic array operations
db.posts.updateOne(
  { _id: ObjectId("...") },
  {
    $push: { comments: newComment },
    $inc: { commentCount: 1 }
  }
)
```

---

## Error Handling and Validation

### Write Concerns
```javascript
// Ensure write is acknowledged by majority
db.users.insertOne(
  { name: "Important User", email: "important@example.com" },
  { writeConcern: { w: "majority", j: true, wtimeout: 5000 } }
)

// Fire and forget (no acknowledgment)
db.logs.insertOne(
  { message: "Debug info", timestamp: new Date() },
  { writeConcern: { w: 0 } }
)
```

### Error Handling Patterns
```javascript
// Try-catch for operations
try {
  const result = db.users.insertOne({
    name: "John Doe",
    email: "john@example.com"
  })
  
  if (result.acknowledged) {
    print("User created successfully: " + result.insertedId)
  }
} catch (error) {
  if (error.code === 11000) {
    print("Duplicate key error: " + error.message)
  } else {
    print("Unexpected error: " + error.message)
  }
}

// Check operation results
const updateResult = db.users.updateOne(
  { email: "john@example.com" },
  { $set: { age: 31 } }
)

if (updateResult.matchedCount === 0) {
  print("No user found with that email")
} else if (updateResult.modifiedCount === 0) {
  print("User found but no changes made")
} else {
  print("User updated successfully")
}
```

---

## Performance Tips

### Efficient Queries
1. **Use indexes** for frequently queried fields
2. **Limit results** when you don't need all documents
3. **Use projection** to return only needed fields
4. **Avoid regex** on large collections without indexes

### Bulk Operations
1. **Use insertMany()** instead of multiple insertOne() calls
2. **Use updateMany()** for bulk updates
3. **Use bulkWrite()** for mixed operations

### Update Efficiency
1. **Use $inc** instead of read-modify-write patterns
2. **Use $addToSet** instead of checking existence first
3. **Use positional operators** for array updates

---

## Next Steps

Now that you understand CRUD operations, explore:

1. **[Data Modeling](04-data-modeling.md)** - Design effective document structures
2. **[Indexing and Performance](06-indexing-performance.md)** - Optimize your queries
3. **[Using MongoDB with Node.js](05-mongodb-nodejs.md)** - Integrate with applications
4. **[Aggregation Framework](07-aggregation-framework.md)** - Advanced data processing

Master these CRUD operations and you'll be able to handle most MongoDB data manipulation tasks efficiently!
