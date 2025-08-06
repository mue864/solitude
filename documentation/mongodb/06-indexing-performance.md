# MongoDB Indexing and Performance

## Introduction

Indexes are crucial for MongoDB performance. They provide efficient access paths to data, dramatically improving query speed. This guide covers index types, creation strategies, and performance optimization techniques.

---

## Understanding Indexes

### What are Indexes?

Indexes are data structures that improve query performance by creating shortcuts to your data. Without indexes, MongoDB must scan every document in a collection to find matches.

### How Indexes Work

```javascript
// Without index: Collection scan (slow)
db.users.find({ email: "john@example.com" })
// MongoDB scans all documents

// With index on email: Index scan (fast)
db.users.createIndex({ email: 1 })
db.users.find({ email: "john@example.com" })
// MongoDB uses index to find document quickly
```

### Index Structure

MongoDB uses B-tree indexes that store:
- **Index keys**: The field values being indexed
- **Pointers**: References to the actual documents

---

## Index Types

### 1. Single Field Indexes

```javascript
// Create ascending index
db.users.createIndex({ name: 1 })

// Create descending index
db.users.createIndex({ age: -1 })

// Index on nested field
db.users.createIndex({ "address.city": 1 })

// Index on array field
db.users.createIndex({ hobbies: 1 })
```

### 2. Compound Indexes

Indexes on multiple fields, order matters:

```javascript
// Compound index
db.users.createIndex({ age: 1, name: 1 })

// This index supports queries on:
// - { age: 25 }
// - { age: 25, name: "John" }
// But NOT efficiently on:
// - { name: "John" } (only)
```

#### Index Prefix Rule

```javascript
// Index: { a: 1, b: 1, c: 1 }
// Supports queries on:
db.collection.find({ a: 1 })           // ✓ Uses index
db.collection.find({ a: 1, b: 1 })     // ✓ Uses index
db.collection.find({ a: 1, b: 1, c: 1 }) // ✓ Uses index
db.collection.find({ b: 1 })           // ✗ Cannot use index
db.collection.find({ a: 1, c: 1 })     // ✓ Partial use (only 'a')
```

### 3. Multikey Indexes

Automatically created when indexing array fields:

```javascript
// Document with array
{
  _id: 1,
  name: "John",
  hobbies: ["reading", "coding", "gaming"]
}

// Create index on array field
db.users.createIndex({ hobbies: 1 })

// Queries that use the index
db.users.find({ hobbies: "reading" })
db.users.find({ hobbies: { $in: ["reading", "coding"] } })
```

### 4. Text Indexes

For text search functionality:

```javascript
// Create text index
db.posts.createIndex({ 
  title: "text", 
  content: "text" 
})

// Text search
db.posts.find({ $text: { $search: "mongodb tutorial" } })

// Text search with score
db.posts.find(
  { $text: { $search: "mongodb tutorial" } },
  { score: { $meta: "textScore" } }
).sort({ score: { $meta: "textScore" } })

// Text index with weights
db.posts.createIndex(
  { title: "text", content: "text" },
  { 
    weights: { 
      title: 10,    // Title is 10x more important
      content: 1 
    }
  }
)
```

### 5. Geospatial Indexes

For location-based queries:

```javascript
// 2dsphere index for GeoJSON data
db.places.createIndex({ location: "2dsphere" })

// Document with GeoJSON
{
  name: "Central Park",
  location: {
    type: "Point",
    coordinates: [-73.968285, 40.785091]  // [longitude, latitude]
  }
}

// Find places near a point
db.places.find({
  location: {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [-73.9857, 40.7484]
      },
      $maxDistance: 1000  // 1000 meters
    }
  }
})

// Find places within a polygon
db.places.find({
  location: {
    $geoWithin: {
      $geometry: {
        type: "Polygon",
        coordinates: [[
          [-74.0, 40.7], [-74.0, 40.8],
          [-73.9, 40.8], [-73.9, 40.7],
          [-74.0, 40.7]
        ]]
      }
    }
  }
})
```

### 6. Hashed Indexes

For sharding and even distribution:

```javascript
// Create hashed index
db.users.createIndex({ userId: "hashed" })

// Good for equality queries
db.users.find({ userId: "user123" })

// Not good for range queries
db.users.find({ userId: { $gt: "user100" } })  // Won't use hashed index
```

### 7. Partial Indexes

Index only documents that meet specific criteria:

```javascript
// Index only active users
db.users.createIndex(
  { email: 1 },
  { partialFilterExpression: { isActive: true } }
)

// Index only documents with age field
db.users.createIndex(
  { age: 1 },
  { partialFilterExpression: { age: { $exists: true } } }
)

// Index only high-value orders
db.orders.createIndex(
  { customerId: 1, createdAt: -1 },
  { partialFilterExpression: { total: { $gte: 100 } } }
)
```

### 8. Sparse Indexes

Skip documents that don't have the indexed field:

```javascript
// Sparse index (skips documents without phone field)
db.users.createIndex({ phone: 1 }, { sparse: true })

// Regular index would include null values
db.users.createIndex({ phone: 1 })  // Includes documents without phone
```

### 9. Unique Indexes

Enforce uniqueness:

```javascript
// Unique index
db.users.createIndex({ email: 1 }, { unique: true })

// Compound unique index
db.users.createIndex(
  { email: 1, accountType: 1 }, 
  { unique: true }
)

// Partial unique index (unique only for active users)
db.users.createIndex(
  { email: 1 },
  { 
    unique: true,
    partialFilterExpression: { isActive: true }
  }
)
```

### 10. TTL Indexes

Automatically delete documents after a time period:

```javascript
// Delete documents 30 days after createdAt
db.sessions.createIndex(
  { createdAt: 1 },
  { expireAfterSeconds: 2592000 }  // 30 days in seconds
)

// Delete documents at specific date
db.logs.createIndex(
  { expireAt: 1 },
  { expireAfterSeconds: 0 }
)

// Document with expireAt field
{
  message: "Debug log",
  expireAt: new Date("2023-12-31T23:59:59Z")
}
```

---

## Index Management

### Creating Indexes

```javascript
// Basic index creation
db.users.createIndex({ name: 1 })

// Index with options
db.users.createIndex(
  { email: 1 },
  {
    unique: true,
    background: true,  // Build in background (deprecated in 4.2+)
    name: "email_unique_idx"
  }
)

// Create multiple indexes
db.users.createIndexes([
  { name: 1 },
  { email: 1 },
  { age: -1, createdAt: -1 }
])
```

### Listing Indexes

```javascript
// List all indexes in collection
db.users.getIndexes()

// List index names only
db.users.getIndexes().forEach(
  function(index) { print(index.name) }
)

// Get index statistics
db.users.stats().indexSizes
```

### Dropping Indexes

```javascript
// Drop specific index by field
db.users.dropIndex({ name: 1 })

// Drop index by name
db.users.dropIndex("name_1")

// Drop all indexes except _id
db.users.dropIndexes()

// Drop multiple specific indexes
db.users.dropIndexes([
  { name: 1 },
  { email: 1 }
])
```

### Rebuilding Indexes

```javascript
// Rebuild all indexes
db.users.reIndex()

// Note: reIndex() locks the collection, use with caution in production
```

---

## Query Performance Analysis

### Using explain()

```javascript
// Basic explain
db.users.find({ name: "John" }).explain()

// Detailed execution stats
db.users.find({ name: "John" }).explain("executionStats")

// All plans considered
db.users.find({ name: "John" }).explain("allPlansExecution")
```

### Understanding Explain Output

```javascript
// Example explain output
{
  "executionStats": {
    "executionSuccess": true,
    "nReturned": 1,           // Documents returned
    "executionTimeMillis": 0, // Query execution time
    "totalKeysExamined": 1,   // Index keys examined
    "totalDocsExamined": 1,   // Documents examined
    "executionStages": {
      "stage": "IXSCAN",      // Index scan (good)
      "indexName": "name_1"
    }
  }
}

// Performance indicators:
// - stage: "COLLSCAN" = bad (collection scan)
// - stage: "IXSCAN" = good (index scan)
// - totalDocsExamined should be close to nReturned
```

### Query Stages

Common execution stages:

```javascript
// Good stages (efficient)
"IXSCAN"     // Index scan
"IDHACK"     // Query by _id
"COUNT_SCAN" // Count using index

// Bad stages (inefficient)
"COLLSCAN"   // Full collection scan
"SORT"       // In-memory sort (no index)

// Neutral stages
"FETCH"      // Fetch documents after index scan
"LIMIT"      // Apply limit
"SKIP"       // Apply skip
```

### Performance Metrics

```javascript
// Key metrics to monitor:
{
  "nReturned": 10,           // Documents returned
  "totalKeysExamined": 10,   // Index entries examined
  "totalDocsExamined": 10,   // Documents examined
  "executionTimeMillis": 5   // Time taken
}

// Ideal ratios:
// totalKeysExamined ≈ nReturned (selective index)
// totalDocsExamined ≈ nReturned (covered query)
// executionTimeMillis < 100ms (fast query)
```

---

## Index Strategy and Design

### ESR Rule (Equality, Sort, Range)

Design compound indexes following ESR order:

```javascript
// Query: Find active users aged 25-35, sorted by name
db.users.find({ 
  isActive: true,    // Equality
  age: { $gte: 25, $lte: 35 }  // Range
}).sort({ name: 1 })  // Sort

// Optimal index (ESR order):
db.users.createIndex({ 
  isActive: 1,  // Equality first
  name: 1,      // Sort second
  age: 1        // Range last
})
```

### Index Selectivity

Create indexes on fields with high selectivity (many unique values):

```javascript
// High selectivity (good for indexing)
db.users.createIndex({ email: 1 })     // Unique emails
db.users.createIndex({ userId: 1 })    // Unique user IDs

// Low selectivity (poor for indexing)
db.users.createIndex({ gender: 1 })    // Only M/F values
db.users.createIndex({ isActive: 1 })  // Only true/false
```

### Covered Queries

Queries that can be satisfied entirely by the index:

```javascript
// Create compound index
db.users.createIndex({ name: 1, email: 1, age: 1 })

// Covered query (all fields in index)
db.users.find(
  { name: "John" },
  { name: 1, email: 1, age: 1, _id: 0 }  // Exclude _id
)

// explain() shows: "stage": "PROJECTION_COVERED"
```

### Index Intersection

MongoDB can use multiple indexes for a single query:

```javascript
// Two separate indexes
db.users.createIndex({ name: 1 })
db.users.createIndex({ age: 1 })

// Query can use both indexes
db.users.find({ name: "John", age: 25 })

// But compound index is usually better:
db.users.createIndex({ name: 1, age: 1 })
```

---

## Performance Optimization Techniques

### 1. Query Optimization

```javascript
// Use projection to limit returned fields
db.users.find(
  { isActive: true },
  { name: 1, email: 1, _id: 0 }  // Only return needed fields
)

// Use limit to reduce results
db.users.find({ age: { $gte: 18 } }).limit(100)

// Use hint to force index usage
db.users.find({ name: "John" }).hint({ name: 1 })

// Avoid negation operators when possible
db.users.find({ age: { $ne: 25 } })        // Slow
db.users.find({ age: { $in: [18,19,20] } }) // Better with specific values
```

### 2. Aggregation Optimization

```javascript
// Put $match early in pipeline
db.orders.aggregate([
  { $match: { status: "completed" } },  // Filter early
  { $lookup: { ... } },                 // Join after filtering
  { $group: { ... } }
])

// Use $project to reduce document size
db.orders.aggregate([
  { $match: { status: "completed" } },
  { $project: { customerId: 1, total: 1, date: 1 } },  // Only needed fields
  { $group: { _id: "$customerId", totalSpent: { $sum: "$total" } } }
])

// Use indexes in aggregation
db.orders.aggregate([
  { $match: { customerId: ObjectId("...") } },  // Uses index
  { $sort: { date: -1 } }                       // Uses index if available
])
```

### 3. Write Optimization

```javascript
// Use bulk operations
const bulk = db.users.initializeUnorderedBulkOp()
bulk.insert({ name: "User1", email: "user1@example.com" })
bulk.insert({ name: "User2", email: "user2@example.com" })
bulk.execute()

// Use appropriate write concern
db.users.insertOne(
  { name: "John", email: "john@example.com" },
  { writeConcern: { w: 1, j: false } }  // Faster, less durable
)

// Batch inserts
db.users.insertMany([
  { name: "User1", email: "user1@example.com" },
  { name: "User2", email: "user2@example.com" }
], { ordered: false })  // Parallel inserts
```

---

## Monitoring and Profiling

### Database Profiler

```javascript
// Enable profiling for slow operations (>100ms)
db.setProfilingLevel(1, { slowms: 100 })

// Enable profiling for all operations
db.setProfilingLevel(2)

// View profiling data
db.system.profile.find().limit(5).sort({ ts: -1 }).pretty()

// Disable profiling
db.setProfilingLevel(0)

// Get profiling status
db.getProfilingStatus()
```

### Current Operations

```javascript
// View current operations
db.currentOp()

// View only active operations
db.currentOp({ "active": true })

// Kill long-running operation
db.killOp(operationId)
```

### Index Usage Statistics

```javascript
// Get index usage stats
db.users.aggregate([{ $indexStats: {} }])

// Reset index stats
db.runCommand({ planCacheClear: "users" })
```

---

## Common Performance Anti-Patterns

### 1. Missing Indexes

```javascript
// Bad: No index on frequently queried field
db.users.find({ email: "john@example.com" })  // Collection scan

// Good: Create index
db.users.createIndex({ email: 1 })
```

### 2. Inefficient Regex

```javascript
// Bad: Case-insensitive regex without index
db.users.find({ name: /john/i })

// Better: Use text index
db.users.createIndex({ name: "text" })
db.users.find({ $text: { $search: "john" } })

// Or: Normalize data
db.users.find({ nameLower: "john" })  // With index on nameLower
```

### 3. Large Skip Values

```javascript
// Bad: Large skip values are slow
db.users.find().skip(10000).limit(10)

// Better: Use range queries for pagination
db.users.find({ _id: { $gt: lastId } }).limit(10)
```

### 4. Unnecessary Sorting

```javascript
// Bad: Sort without index
db.users.find().sort({ createdAt: -1 })  // In-memory sort

// Good: Create index for sort
db.users.createIndex({ createdAt: -1 })
```

---

## Best Practices

### 1. Index Design Guidelines

- **Create indexes for your queries**: Analyze query patterns first
- **Use compound indexes wisely**: Follow ESR rule
- **Monitor index usage**: Remove unused indexes
- **Consider index size**: Indexes consume memory and storage
- **Test with realistic data**: Performance varies with data size

### 2. Index Maintenance

```javascript
// Regular index maintenance script
function analyzeIndexUsage() {
  const collections = db.getCollectionNames()
  
  collections.forEach(collName => {
    print(`\n=== ${collName} ===`)
    
    const stats = db[collName].aggregate([{ $indexStats: {} }]).toArray()
    
    stats.forEach(stat => {
      print(`Index: ${stat.name}`)
      print(`Usage: ${stat.accesses.ops} operations`)
      print(`Since: ${stat.accesses.since}`)
    })
  })
}

// Run analysis
analyzeIndexUsage()
```

### 3. Performance Testing

```javascript
// Performance testing function
function testQueryPerformance(query, iterations = 100) {
  const start = new Date()
  
  for (let i = 0; i < iterations; i++) {
    db.users.find(query).toArray()
  }
  
  const end = new Date()
  const avgTime = (end - start) / iterations
  
  print(`Average query time: ${avgTime}ms`)
  
  // Also run explain
  const explain = db.users.find(query).explain("executionStats")
  print(`Execution time: ${explain.executionStats.executionTimeMillis}ms`)
  print(`Documents examined: ${explain.executionStats.totalDocsExamined}`)
  print(`Keys examined: ${explain.executionStats.totalKeysExamined}`)
}

// Test query performance
testQueryPerformance({ email: "john@example.com" })
```

---

## Next Steps

Now that you understand indexing and performance:

1. **[Aggregation Framework](07-aggregation-framework.md)** - Advanced data processing
2. **[Best Practices](08-best-practices.md)** - Production-ready applications

Remember: Good indexing strategy is crucial for MongoDB performance. Always test your indexes with realistic data and query patterns!
