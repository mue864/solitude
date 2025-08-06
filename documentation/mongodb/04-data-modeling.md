# MongoDB Data Modeling

## Introduction

Data modeling in MongoDB is fundamentally different from relational databases. Instead of normalizing data across multiple tables, MongoDB allows you to embed related data within documents or reference it across collections. This guide covers effective data modeling strategies for MongoDB.

---

## Key Principles

### 1. Model for Your Application
Design your schema based on how your application will access and use the data, not just how to store it efficiently.

### 2. Embed vs Reference Decision
The most important decision in MongoDB data modeling is whether to embed related data or reference it.

### 3. Consider Read/Write Patterns
Optimize for your most common operations. If you read data together frequently, consider embedding it.

### 4. Document Size Matters
Keep documents under 16MB limit and consider performance implications of large documents.

---

## Embedding vs Referencing

### When to Embed

**Use embedding when:**
- Data is accessed together frequently
- Related data doesn't change often
- You have one-to-few relationships
- Document size remains reasonable
- You need atomic updates across related data

#### Example: User Profile with Address
```javascript
// Embedded approach - Good for user profiles
{
  _id: ObjectId("..."),
  name: "John Doe",
  email: "john@example.com",
  address: {
    street: "123 Main St",
    city: "New York",
    zipCode: "10001",
    country: "USA"
  },
  preferences: {
    theme: "dark",
    notifications: true,
    language: "en"
  },
  socialMedia: [
    { platform: "twitter", handle: "@johndoe" },
    { platform: "linkedin", url: "linkedin.com/in/johndoe" }
  ]
}
```

#### Example: Blog Post with Comments
```javascript
// Embedded comments - Good for limited comments
{
  _id: ObjectId("..."),
  title: "Introduction to MongoDB",
  content: "MongoDB is a document database...",
  author: {
    name: "Jane Smith",
    email: "jane@example.com"
  },
  tags: ["mongodb", "database", "nosql"],
  comments: [
    {
      _id: ObjectId("..."),
      author: "Bob Wilson",
      text: "Great article!",
      createdAt: ISODate("2023-01-15T10:30:00Z"),
      likes: 5
    },
    {
      _id: ObjectId("..."),
      author: "Alice Johnson",
      text: "Very helpful, thanks!",
      createdAt: ISODate("2023-01-15T11:15:00Z"),
      likes: 3
    }
  ],
  createdAt: ISODate("2023-01-15T09:00:00Z"),
  updatedAt: ISODate("2023-01-15T11:15:00Z")
}
```

### When to Reference

**Use referencing when:**
- Data is accessed independently
- You have one-to-many or many-to-many relationships
- Related data changes frequently
- Documents would become too large
- You need to query related data separately

#### Example: E-commerce with Orders
```javascript
// Users collection
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  name: "John Doe",
  email: "john@example.com",
  createdAt: ISODate("2023-01-01T00:00:00Z")
}

// Orders collection - References user
{
  _id: ObjectId("507f1f77bcf86cd799439012"),
  userId: ObjectId("507f1f77bcf86cd799439011"),
  orderNumber: "ORD-2023-001",
  items: [
    {
      productId: ObjectId("507f1f77bcf86cd799439013"),
      name: "Laptop",
      price: 999.99,
      quantity: 1
    }
  ],
  total: 999.99,
  status: "shipped",
  createdAt: ISODate("2023-01-15T10:00:00Z")
}

// Products collection
{
  _id: ObjectId("507f1f77bcf86cd799439013"),
  name: "Gaming Laptop",
  description: "High-performance laptop for gaming",
  price: 999.99,
  category: "Electronics",
  stock: 50,
  specifications: {
    cpu: "Intel i7",
    ram: "16GB",
    storage: "512GB SSD"
  }
}
```

---

## Common Data Modeling Patterns

### 1. One-to-One Relationships

#### Embedded Approach (Preferred)
```javascript
// User with embedded profile
{
  _id: ObjectId("..."),
  username: "johndoe",
  email: "john@example.com",
  profile: {
    firstName: "John",
    lastName: "Doe",
    bio: "Software developer passionate about databases",
    avatar: "avatar.jpg",
    birthDate: ISODate("1990-05-15T00:00:00Z"),
    location: "New York, USA"
  },
  settings: {
    theme: "dark",
    notifications: {
      email: true,
      push: false,
      sms: true
    },
    privacy: {
      profileVisible: true,
      showEmail: false
    }
  }
}
```

#### Referenced Approach (When Profile is Large)
```javascript
// User document
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  username: "johndoe",
  email: "john@example.com",
  profileId: ObjectId("507f1f77bcf86cd799439012")
}

// Profile document
{
  _id: ObjectId("507f1f77bcf86cd799439012"),
  userId: ObjectId("507f1f77bcf86cd799439011"),
  firstName: "John",
  lastName: "Doe",
  bio: "Very long biography...",
  portfolio: [/* large array of projects */],
  experience: [/* large array of work history */]
}
```

### 2. One-to-Few Relationships

#### Embedded Approach
```javascript
// Person with addresses (limited number)
{
  _id: ObjectId("..."),
  name: "John Doe",
  addresses: [
    {
      type: "home",
      street: "123 Main St",
      city: "New York",
      zipCode: "10001",
      primary: true
    },
    {
      type: "work",
      street: "456 Business Ave",
      city: "New York",
      zipCode: "10002",
      primary: false
    }
  ]
}
```

### 3. One-to-Many Relationships

#### Child Referencing (Preferred for Many)
```javascript
// Blog post
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  title: "MongoDB Data Modeling",
  content: "In this post, we'll explore...",
  author: "Jane Smith",
  createdAt: ISODate("2023-01-15T09:00:00Z")
}

// Comments (separate collection)
{
  _id: ObjectId("507f1f77bcf86cd799439012"),
  postId: ObjectId("507f1f77bcf86cd799439011"),
  author: "Bob Wilson",
  text: "Great explanation!",
  createdAt: ISODate("2023-01-15T10:30:00Z")
}
```

#### Parent Referencing (When You Need Parent Info Often)
```javascript
// Category
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  name: "Electronics",
  description: "Electronic devices and accessories"
}

// Products with category reference
{
  _id: ObjectId("507f1f77bcf86cd799439012"),
  name: "Smartphone",
  price: 699.99,
  categoryId: ObjectId("507f1f77bcf86cd799439011"),
  categoryName: "Electronics"  // Denormalized for performance
}
```

### 4. Many-to-Many Relationships

#### Array of References
```javascript
// Students
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  name: "John Doe",
  email: "john@example.com",
  courseIds: [
    ObjectId("507f1f77bcf86cd799439013"),
    ObjectId("507f1f77bcf86cd799439014"),
    ObjectId("507f1f77bcf86cd799439015")
  ]
}

// Courses
{
  _id: ObjectId("507f1f77bcf86cd799439013"),
  name: "Database Design",
  instructor: "Dr. Smith",
  studentIds: [
    ObjectId("507f1f77bcf86cd799439011"),
    ObjectId("507f1f77bcf86cd799439012")
  ]
}
```

#### Junction Collection (For Complex Relationships)
```javascript
// Users
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  name: "John Doe",
  email: "john@example.com"
}

// Projects
{
  _id: ObjectId("507f1f77bcf86cd799439012"),
  name: "E-commerce Platform",
  description: "Building an online store"
}

// User-Project relationships (with additional data)
{
  _id: ObjectId("507f1f77bcf86cd799439013"),
  userId: ObjectId("507f1f77bcf86cd799439011"),
  projectId: ObjectId("507f1f77bcf86cd799439012"),
  role: "Lead Developer",
  startDate: ISODate("2023-01-01T00:00:00Z"),
  endDate: ISODate("2023-06-30T00:00:00Z"),
  hoursWorked: 240,
  responsibilities: [
    "Backend development",
    "Database design",
    "API development"
  ]
}
```

---

## Advanced Patterns

### 1. Polymorphic Pattern

Store different types of related documents in the same collection:

```javascript
// Products collection with different product types
{
  _id: ObjectId("..."),
  type: "book",
  name: "MongoDB Guide",
  price: 29.99,
  // Book-specific fields
  author: "John Smith",
  isbn: "978-1234567890",
  pages: 350,
  publisher: "Tech Books"
}

{
  _id: ObjectId("..."),
  type: "electronics",
  name: "Smartphone",
  price: 699.99,
  // Electronics-specific fields
  brand: "TechCorp",
  model: "X1000",
  warranty: "2 years",
  specifications: {
    screen: "6.1 inch",
    storage: "128GB",
    camera: "12MP"
  }
}

{
  _id: ObjectId("..."),
  type: "clothing",
  name: "T-Shirt",
  price: 19.99,
  // Clothing-specific fields
  size: "M",
  color: "Blue",
  material: "Cotton",
  brand: "FashionCorp"
}
```

### 2. Bucket Pattern

Group related documents to reduce index overhead:

```javascript
// Time-series data bucketed by hour
{
  _id: ObjectId("..."),
  sensorId: "sensor_001",
  timestamp: ISODate("2023-01-15T10:00:00Z"),
  measurements: [
    {
      time: ISODate("2023-01-15T10:00:00Z"),
      temperature: 23.5,
      humidity: 45.2
    },
    {
      time: ISODate("2023-01-15T10:01:00Z"),
      temperature: 23.7,
      humidity: 45.1
    },
    // ... more measurements for this hour
  ],
  measurementCount: 60,
  avgTemperature: 23.6,
  avgHumidity: 45.0
}
```

### 3. Outlier Pattern

Handle documents that don't fit the normal pattern:

```javascript
// Normal product document
{
  _id: ObjectId("..."),
  name: "Standard Product",
  price: 29.99,
  tags: ["electronics", "gadget"],
  reviews: [
    { rating: 5, comment: "Great!" },
    { rating: 4, comment: "Good value" }
  ]
}

// Product with too many reviews (outlier)
{
  _id: ObjectId("..."),
  name: "Popular Product",
  price: 49.99,
  tags: ["electronics", "bestseller"],
  reviewCount: 10000,
  avgRating: 4.5,
  hasExternalReviews: true  // Reviews stored separately
}

// External reviews collection for outliers
{
  _id: ObjectId("..."),
  productId: ObjectId("..."),
  reviews: [
    { rating: 5, comment: "Excellent!" },
    { rating: 4, comment: "Worth buying" },
    // ... many more reviews
  ]
}
```

### 4. Computed Pattern

Pre-calculate values to improve read performance:

```javascript
// Order with computed totals
{
  _id: ObjectId("..."),
  customerId: ObjectId("..."),
  items: [
    {
      productId: ObjectId("..."),
      name: "Laptop",
      price: 999.99,
      quantity: 1,
      subtotal: 999.99  // Computed
    },
    {
      productId: ObjectId("..."),
      name: "Mouse",
      price: 29.99,
      quantity: 2,
      subtotal: 59.98   // Computed
    }
  ],
  // Computed fields
  itemCount: 3,
  subtotal: 1059.97,
  tax: 84.80,
  shipping: 15.00,
  total: 1159.77,
  createdAt: ISODate("2023-01-15T10:00:00Z")
}
```

### 5. Extended Reference Pattern

Include frequently accessed fields from referenced documents:

```javascript
// Order with extended customer reference
{
  _id: ObjectId("..."),
  // Full customer reference
  customer: {
    _id: ObjectId("507f1f77bcf86cd799439011"),
    name: "John Doe",
    email: "john@example.com",
    tier: "premium"  // Frequently accessed field
  },
  items: [
    {
      // Extended product reference
      product: {
        _id: ObjectId("507f1f77bcf86cd799439012"),
        name: "Laptop",
        price: 999.99,
        category: "Electronics"  // Frequently accessed
      },
      quantity: 1
    }
  ],
  total: 999.99,
  status: "pending"
}
```

---

## Schema Design Best Practices

### 1. Start with Your Queries

Design your schema based on your application's query patterns:

```javascript
// If you frequently query: "Get user with their recent orders"
// Consider this structure:

{
  _id: ObjectId("..."),
  name: "John Doe",
  email: "john@example.com",
  recentOrders: [  // Embed recent orders for quick access
    {
      _id: ObjectId("..."),
      date: ISODate("2023-01-15T10:00:00Z"),
      total: 99.99,
      status: "delivered"
    }
  ],
  orderCount: 25,
  totalSpent: 2499.75
}
```

### 2. Consider Document Growth

Plan for how documents will grow over time:

```javascript
// Bad: Unbounded array growth
{
  _id: ObjectId("..."),
  name: "Popular Blog Post",
  comments: [
    // This array could grow to thousands of comments
    // causing performance issues
  ]
}

// Good: Reference pattern for unbounded growth
{
  _id: ObjectId("..."),
  name: "Popular Blog Post",
  commentCount: 1500,
  recentComments: [  // Only keep recent ones embedded
    { author: "Alice", text: "Great post!", date: "..." },
    { author: "Bob", text: "Very helpful!", date: "..." }
  ]
}
```

### 3. Use Appropriate Data Types

```javascript
{
  _id: ObjectId("..."),
  
  // Use proper numeric types
  age: NumberInt(30),           // 32-bit integer
  salary: NumberLong(75000),    // 64-bit integer
  price: NumberDecimal("29.99"), // High precision decimal
  
  // Use dates for temporal data
  createdAt: ISODate("2023-01-15T10:00:00Z"),
  
  // Use boolean for true/false values
  isActive: true,
  
  // Use arrays for lists
  tags: ["mongodb", "database", "nosql"],
  
  // Use objects for structured data
  address: {
    street: "123 Main St",
    city: "New York",
    coordinates: [40.7128, -74.0060]  // [longitude, latitude]
  }
}
```

### 4. Plan for Indexing

Design your schema with indexing in mind:

```javascript
// Good: Fields you'll query are at the top level
{
  _id: ObjectId("..."),
  userId: ObjectId("..."),      // Will be indexed
  status: "active",             // Will be indexed
  createdAt: ISODate("..."),    // Will be indexed
  
  // Detailed data nested
  details: {
    description: "...",
    metadata: { ... }
  }
}

// Avoid: Deeply nested fields you need to query
{
  _id: ObjectId("..."),
  data: {
    user: {
      info: {
        status: "active"  // Hard to index efficiently
      }
    }
  }
}
```

---

## Anti-Patterns to Avoid

### 1. Massive Arrays

```javascript
// Bad: Unbounded array growth
{
  _id: ObjectId("..."),
  name: "User",
  activityLog: [
    // Could grow to millions of entries
    { action: "login", timestamp: "..." },
    { action: "view_page", timestamp: "..." },
    // ... thousands more
  ]
}

// Good: Use separate collection or capped arrays
{
  _id: ObjectId("..."),
  name: "User",
  recentActivity: [  // Keep only recent items
    { action: "login", timestamp: "..." },
    { action: "view_page", timestamp: "..." }
  ],
  totalActivities: 15000
}
```

### 2. Unnecessary Nesting

```javascript
// Bad: Over-nesting
{
  _id: ObjectId("..."),
  user: {
    personal: {
      name: {
        first: "John",
        last: "Doe"
      }
    }
  }
}

// Good: Flatten when possible
{
  _id: ObjectId("..."),
  firstName: "John",
  lastName: "Doe"
}
```

### 3. Large Documents

```javascript
// Bad: Storing large binary data in documents
{
  _id: ObjectId("..."),
  name: "User Profile",
  profileImage: "base64-encoded-image-data..."  // Could be MBs
}

// Good: Store file references
{
  _id: ObjectId("..."),
  name: "User Profile",
  profileImageUrl: "https://cdn.example.com/images/user123.jpg",
  profileImageId: "file_id_in_gridfs"
}
```

---

## Schema Validation

MongoDB supports JSON Schema validation:

```javascript
// Create collection with validation
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "email", "age"],
      properties: {
        name: {
          bsonType: "string",
          description: "must be a string and is required"
        },
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          description: "must be a valid email address"
        },
        age: {
          bsonType: "int",
          minimum: 0,
          maximum: 150,
          description: "must be an integer between 0 and 150"
        },
        status: {
          enum: ["active", "inactive", "pending"],
          description: "must be one of the enum values"
        }
      }
    }
  }
})

// Add validation to existing collection
db.runCommand({
  collMod: "products",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "price"],
      properties: {
        name: { bsonType: "string" },
        price: { bsonType: "number", minimum: 0 },
        category: { 
          enum: ["Electronics", "Clothing", "Books", "Home"] 
        }
      }
    }
  }
})
```

---

## Migration Strategies

### 1. Schema Evolution

```javascript
// Version 1: Simple user document
{
  _id: ObjectId("..."),
  name: "John Doe",
  email: "john@example.com"
}

// Version 2: Add new fields with defaults
db.users.updateMany(
  { version: { $exists: false } },
  {
    $set: {
      version: 2,
      preferences: {
        theme: "light",
        notifications: true
      },
      createdAt: new Date()
    }
  }
)

// Version 3: Restructure existing data
db.users.find({ version: 2 }).forEach(function(doc) {
  if (doc.name) {
    var nameParts = doc.name.split(" ")
    db.users.updateOne(
      { _id: doc._id },
      {
        $set: {
          firstName: nameParts[0],
          lastName: nameParts.slice(1).join(" "),
          version: 3
        },
        $unset: { name: "" }
      }
    )
  }
})
```

### 2. Data Transformation

```javascript
// Transform embedded data to references
db.posts.find({}).forEach(function(post) {
  if (post.comments && post.comments.length > 10) {
    // Move comments to separate collection
    post.comments.forEach(function(comment) {
      db.comments.insertOne({
        postId: post._id,
        author: comment.author,
        text: comment.text,
        createdAt: comment.createdAt
      })
    })
    
    // Update post to remove embedded comments
    db.posts.updateOne(
      { _id: post._id },
      {
        $unset: { comments: "" },
        $set: { 
          commentCount: post.comments.length,
          hasExternalComments: true
        }
      }
    )
  }
})
```

---

## Next Steps

Now that you understand data modeling principles:

1. **[Using MongoDB with Node.js](05-mongodb-nodejs.md)** - Implement these patterns in applications
2. **[Indexing and Performance](06-indexing-performance.md)** - Optimize your data models
3. **[Aggregation Framework](07-aggregation-framework.md)** - Query your modeled data effectively

Remember: There's no one-size-fits-all approach to data modeling in MongoDB. Always consider your specific use case, query patterns, and performance requirements when designing your schema.
