# MongoDB Aggregation Framework

## Introduction

The MongoDB Aggregation Framework is a powerful tool for data processing and analysis. It allows you to perform complex data transformations, calculations, and analytics using a pipeline of operations. Think of it as MongoDB's equivalent to SQL's GROUP BY, JOIN, and advanced functions.

---

## Aggregation Pipeline Concept

### How It Works

The aggregation pipeline processes documents through a sequence of stages, where each stage transforms the documents and passes them to the next stage.

```javascript
db.collection.aggregate([
  { $stage1: { ... } },  // Stage 1: Transform documents
  { $stage2: { ... } },  // Stage 2: Further transform
  { $stage3: { ... } }   // Stage 3: Final transformation
])
```

### Basic Example

```javascript
// Sample data
db.orders.insertMany([
  { customerId: 1, product: "Laptop", amount: 1000, date: new Date("2023-01-15") },
  { customerId: 1, product: "Mouse", amount: 25, date: new Date("2023-01-16") },
  { customerId: 2, product: "Keyboard", amount: 75, date: new Date("2023-01-17") },
  { customerId: 2, product: "Monitor", amount: 300, date: new Date("2023-01-18") }
])

// Aggregation: Total spent per customer
db.orders.aggregate([
  {
    $group: {
      _id: "$customerId",
      totalSpent: { $sum: "$amount" },
      orderCount: { $sum: 1 }
    }
  },
  {
    $sort: { totalSpent: -1 }
  }
])

// Result:
[
  { _id: 1, totalSpent: 1025, orderCount: 2 },
  { _id: 2, totalSpent: 375, orderCount: 2 }
]
```

---

## Core Aggregation Stages

### $match - Filter Documents

Filters documents like `find()`:

```javascript
// Filter orders from 2023
db.orders.aggregate([
  {
    $match: {
      date: {
        $gte: new Date("2023-01-01"),
        $lt: new Date("2024-01-01")
      }
    }
  }
])

// Filter with multiple conditions
db.orders.aggregate([
  {
    $match: {
      $and: [
        { amount: { $gte: 100 } },
        { product: { $regex: "Laptop", $options: "i" } }
      ]
    }
  }
])
```

### $group - Group and Aggregate

Groups documents and performs calculations:

```javascript
// Basic grouping
db.orders.aggregate([
  {
    $group: {
      _id: "$customerId",
      total: { $sum: "$amount" }
    }
  }
])

// Group by multiple fields
db.orders.aggregate([
  {
    $group: {
      _id: {
        customerId: "$customerId",
        product: "$product"
      },
      totalQuantity: { $sum: "$quantity" },
      avgAmount: { $avg: "$amount" }
    }
  }
])

// Group all documents (no grouping field)
db.orders.aggregate([
  {
    $group: {
      _id: null,
      totalRevenue: { $sum: "$amount" },
      orderCount: { $sum: 1 },
      avgOrderValue: { $avg: "$amount" },
      maxOrder: { $max: "$amount" },
      minOrder: { $min: "$amount" }
    }
  }
])
```

### $project - Select and Transform Fields

Selects, excludes, or transforms fields:

```javascript
// Select specific fields
db.orders.aggregate([
  {
    $project: {
      customerId: 1,
      product: 1,
      amount: 1,
      _id: 0  // Exclude _id
    }
  }
])

// Create computed fields
db.orders.aggregate([
  {
    $project: {
      customerId: 1,
      product: 1,
      amount: 1,
      discountedAmount: { $multiply: ["$amount", 0.9] },
      orderYear: { $year: "$date" },
      isHighValue: { $gte: ["$amount", 500] }
    }
  }
])

// String operations
db.users.aggregate([
  {
    $project: {
      fullName: { $concat: ["$firstName", " ", "$lastName"] },
      emailDomain: {
        $arrayElemAt: [
          { $split: ["$email", "@"] },
          1
        ]
      },
      nameLength: { $strLenCP: "$firstName" }
    }
  }
])
```

### $sort - Sort Documents

Sorts documents by specified fields:

```javascript
// Sort by single field
db.orders.aggregate([
  { $sort: { amount: -1 } }  // Descending order
])

// Sort by multiple fields
db.orders.aggregate([
  {
    $sort: {
      customerId: 1,    // Ascending
      amount: -1        // Descending
    }
  }
])

// Sort after grouping
db.orders.aggregate([
  {
    $group: {
      _id: "$customerId",
      totalSpent: { $sum: "$amount" }
    }
  },
  {
    $sort: { totalSpent: -1 }
  }
])
```

### $limit and $skip - Pagination

Controls the number of documents:

```javascript
// Limit results
db.orders.aggregate([
  { $sort: { amount: -1 } },
  { $limit: 5 }
])

// Skip and limit (pagination)
db.orders.aggregate([
  { $sort: { date: -1 } },
  { $skip: 10 },
  { $limit: 5 }
])

// Top N pattern
db.orders.aggregate([
  {
    $group: {
      _id: "$customerId",
      totalSpent: { $sum: "$amount" }
    }
  },
  { $sort: { totalSpent: -1 } },
  { $limit: 10 }  // Top 10 customers
])
```

### $unwind - Deconstruct Arrays

Separates array elements into individual documents:

```javascript
// Sample document with array
{
  _id: 1,
  customer: "John",
  items: ["Laptop", "Mouse", "Keyboard"]
}

// Unwind the array
db.orders.aggregate([
  { $unwind: "$items" }
])

// Result:
[
  { _id: 1, customer: "John", items: "Laptop" },
  { _id: 1, customer: "John", items: "Mouse" },
  { _id: 1, customer: "John", items: "Keyboard" }
]

// Unwind with options
db.orders.aggregate([
  {
    $unwind: {
      path: "$items",
      includeArrayIndex: "itemIndex",  // Add index field
      preserveNullAndEmptyArrays: true // Keep docs with empty arrays
    }
  }
])
```

### $lookup - Join Collections

Performs left outer joins with other collections:

```javascript
// Basic lookup
db.orders.aggregate([
  {
    $lookup: {
      from: "customers",        // Collection to join
      localField: "customerId", // Field from orders
      foreignField: "_id",      // Field from customers
      as: "customerInfo"        // Output array field
    }
  }
])

// Lookup with pipeline (more control)
db.orders.aggregate([
  {
    $lookup: {
      from: "customers",
      let: { customerId: "$customerId" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$_id", "$$customerId"] },
                { $eq: ["$isActive", true] }
              ]
            }
          }
        },
        {
          $project: { name: 1, email: 1 }
        }
      ],
      as: "customerInfo"
    }
  }
])

// Multiple lookups
db.orders.aggregate([
  {
    $lookup: {
      from: "customers",
      localField: "customerId",
      foreignField: "_id",
      as: "customer"
    }
  },
  {
    $lookup: {
      from: "products",
      localField: "productId",
      foreignField: "_id",
      as: "product"
    }
  }
])
```

---

## Advanced Aggregation Stages

### $addFields - Add New Fields

Adds new fields to documents:

```javascript
db.orders.aggregate([
  {
    $addFields: {
      discountedAmount: { $multiply: ["$amount", 0.9] },
      orderYear: { $year: "$date" },
      isHighValue: { $gte: ["$amount", 500] }
    }
  }
])

// Add fields based on conditions
db.users.aggregate([
  {
    $addFields: {
      ageGroup: {
        $switch: {
          branches: [
            { case: { $lt: ["$age", 18] }, then: "Minor" },
            { case: { $lt: ["$age", 65] }, then: "Adult" },
            { case: { $gte: ["$age", 65] }, then: "Senior" }
          ],
          default: "Unknown"
        }
      }
    }
  }
])
```

### $replaceRoot - Replace Document Root

Replaces the root document:

```javascript
// Sample document
{
  _id: 1,
  name: "John",
  address: {
    street: "123 Main St",
    city: "New York",
    zipCode: "10001"
  }
}

// Replace root with address subdocument
db.users.aggregate([
  {
    $replaceRoot: {
      newRoot: "$address"
    }
  }
])

// Result:
{
  street: "123 Main St",
  city: "New York",
  zipCode: "10001"
}
```

### $facet - Multiple Pipelines

Runs multiple aggregation pipelines in parallel:

```javascript
db.orders.aggregate([
  {
    $facet: {
      // Pipeline 1: Revenue by month
      revenueByMonth: [
        {
          $group: {
            _id: { $month: "$date" },
            revenue: { $sum: "$amount" }
          }
        },
        { $sort: { _id: 1 } }
      ],
      
      // Pipeline 2: Top customers
      topCustomers: [
        {
          $group: {
            _id: "$customerId",
            totalSpent: { $sum: "$amount" }
          }
        },
        { $sort: { totalSpent: -1 } },
        { $limit: 5 }
      ],
      
      // Pipeline 3: Order statistics
      orderStats: [
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            avgOrderValue: { $avg: "$amount" },
            totalRevenue: { $sum: "$amount" }
          }
        }
      ]
    }
  }
])
```

### $bucket - Categorize Documents

Groups documents into buckets:

```javascript
// Group orders by amount ranges
db.orders.aggregate([
  {
    $bucket: {
      groupBy: "$amount",
      boundaries: [0, 100, 500, 1000, Infinity],
      default: "Other",
      output: {
        count: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
        avgAmount: { $avg: "$amount" }
      }
    }
  }
])

// Result:
[
  { _id: 0, count: 5, totalAmount: 250, avgAmount: 50 },      // $0-$99
  { _id: 100, count: 3, totalAmount: 900, avgAmount: 300 },  // $100-$499
  { _id: 500, count: 2, totalAmount: 1500, avgAmount: 750 }, // $500-$999
  { _id: 1000, count: 1, totalAmount: 1200, avgAmount: 1200 } // $1000+
]
```

---

## Aggregation Operators

### Arithmetic Operators

```javascript
db.orders.aggregate([
  {
    $project: {
      amount: 1,
      tax: { $multiply: ["$amount", 0.08] },
      total: { $add: ["$amount", { $multiply: ["$amount", 0.08] }] },
      discount: { $subtract: ["$amount", 50] },
      divided: { $divide: ["$amount", 2] },
      remainder: { $mod: ["$amount", 10] },
      power: { $pow: ["$amount", 2] },
      squareRoot: { $sqrt: "$amount" },
      absolute: { $abs: { $subtract: ["$amount", 1000] } }
    }
  }
])
```

### Comparison Operators

```javascript
db.orders.aggregate([
  {
    $project: {
      amount: 1,
      isHighValue: { $gte: ["$amount", 500] },
      isLowValue: { $lt: ["$amount", 100] },
      isEqual: { $eq: ["$status", "completed"] },
      isNotEqual: { $ne: ["$status", "cancelled"] },
      comparison: { $cmp: ["$amount", 500] }  // -1, 0, or 1
    }
  }
])
```

### Logical Operators

```javascript
db.orders.aggregate([
  {
    $project: {
      amount: 1,
      status: 1,
      isValidOrder: {
        $and: [
          { $gte: ["$amount", 0] },
          { $ne: ["$status", "cancelled"] }
        ]
      },
      needsReview: {
        $or: [
          { $gte: ["$amount", 1000] },
          { $eq: ["$status", "pending"] }
        ]
      },
      isNotCancelled: {
        $not: { $eq: ["$status", "cancelled"] }
      }
    }
  }
])
```

### String Operators

```javascript
db.users.aggregate([
  {
    $project: {
      name: 1,
      email: 1,
      // String manipulation
      upperName: { $toUpper: "$name" },
      lowerEmail: { $toLower: "$email" },
      nameLength: { $strLenCP: "$name" },
      
      // Substring operations
      firstName: {
        $substr: ["$name", 0, { $indexOfCP: ["$name", " "] }]
      },
      
      // Split and join
      emailParts: { $split: ["$email", "@"] },
      fullName: { $concat: ["$firstName", " ", "$lastName"] },
      
      // Pattern matching
      hasGmail: {
        $regexMatch: {
          input: "$email",
          regex: "@gmail\\.com$",
          options: "i"
        }
      }
    }
  }
])
```

### Date Operators

```javascript
db.orders.aggregate([
  {
    $project: {
      date: 1,
      amount: 1,
      
      // Extract date parts
      year: { $year: "$date" },
      month: { $month: "$date" },
      day: { $dayOfMonth: "$date" },
      dayOfWeek: { $dayOfWeek: "$date" },
      dayOfYear: { $dayOfYear: "$date" },
      
      // Date formatting
      dateString: {
        $dateToString: {
          format: "%Y-%m-%d",
          date: "$date"
        }
      },
      
      // Date arithmetic
      daysAgo: {
        $divide: [
          { $subtract: [new Date(), "$date"] },
          1000 * 60 * 60 * 24
        ]
      }
    }
  }
])
```

### Array Operators

```javascript
// Sample document with arrays
{
  _id: 1,
  name: "John",
  scores: [85, 92, 78, 96, 88],
  hobbies: ["reading", "coding", "gaming"]
}

db.students.aggregate([
  {
    $project: {
      name: 1,
      scores: 1,
      hobbies: 1,
      
      // Array operations
      scoreCount: { $size: "$scores" },
      avgScore: { $avg: "$scores" },
      maxScore: { $max: "$scores" },
      minScore: { $min: "$scores" },
      
      // Array element access
      firstScore: { $arrayElemAt: ["$scores", 0] },
      lastScore: { $arrayElemAt: ["$scores", -1] },
      
      // Array filtering
      highScores: {
        $filter: {
          input: "$scores",
          cond: { $gte: ["$$this", 90] }
        }
      },
      
      // Array transformation
      adjustedScores: {
        $map: {
          input: "$scores",
          as: "score",
          in: { $add: ["$$score", 5] }
        }
      },
      
      // Check array membership
      hasReading: { $in: ["reading", "$hobbies"] }
    }
  }
])
```

---

## Real-World Examples

### E-commerce Analytics

```javascript
// Monthly sales report
db.orders.aggregate([
  {
    $match: {
      date: {
        $gte: new Date("2023-01-01"),
        $lt: new Date("2024-01-01")
      },
      status: "completed"
    }
  },
  {
    $group: {
      _id: {
        year: { $year: "$date" },
        month: { $month: "$date" }
      },
      totalRevenue: { $sum: "$amount" },
      orderCount: { $sum: 1 },
      avgOrderValue: { $avg: "$amount" },
      uniqueCustomers: { $addToSet: "$customerId" }
    }
  },
  {
    $addFields: {
      uniqueCustomerCount: { $size: "$uniqueCustomers" }
    }
  },
  {
    $project: {
      uniqueCustomers: 0  // Remove the array, keep only count
    }
  },
  {
    $sort: { "_id.year": 1, "_id.month": 1 }
  }
])
```

### Customer Segmentation

```javascript
// Segment customers by purchase behavior
db.orders.aggregate([
  {
    $match: { status: "completed" }
  },
  {
    $group: {
      _id: "$customerId",
      totalSpent: { $sum: "$amount" },
      orderCount: { $sum: 1 },
      avgOrderValue: { $avg: "$amount" },
      firstOrder: { $min: "$date" },
      lastOrder: { $max: "$date" }
    }
  },
  {
    $addFields: {
      daysSinceFirstOrder: {
        $divide: [
          { $subtract: [new Date(), "$firstOrder"] },
          1000 * 60 * 60 * 24
        ]
      },
      daysSinceLastOrder: {
        $divide: [
          { $subtract: [new Date(), "$lastOrder"] },
          1000 * 60 * 60 * 24
        ]
      }
    }
  },
  {
    $addFields: {
      segment: {
        $switch: {
          branches: [
            {
              case: {
                $and: [
                  { $gte: ["$totalSpent", 1000] },
                  { $lte: ["$daysSinceLastOrder", 30] }
                ]
              },
              then: "VIP"
            },
            {
              case: {
                $and: [
                  { $gte: ["$totalSpent", 500] },
                  { $lte: ["$daysSinceLastOrder", 90] }
                ]
              },
              then: "Regular"
            },
            {
              case: { $gte: ["$daysSinceLastOrder", 180] },
              then: "At Risk"
            }
          ],
          default: "New"
        }
      }
    }
  },
  {
    $group: {
      _id: "$segment",
      customerCount: { $sum: 1 },
      avgTotalSpent: { $avg: "$totalSpent" },
      avgOrderCount: { $avg: "$orderCount" }
    }
  }
])
```

### Product Performance Analysis

```javascript
// Analyze product performance with customer data
db.orders.aggregate([
  // Unwind order items
  { $unwind: "$items" },
  
  // Lookup product details
  {
    $lookup: {
      from: "products",
      localField: "items.productId",
      foreignField: "_id",
      as: "product"
    }
  },
  
  // Unwind product (should be single item)
  { $unwind: "$product" },
  
  // Group by product
  {
    $group: {
      _id: "$items.productId",
      productName: { $first: "$product.name" },
      category: { $first: "$product.category" },
      totalQuantitySold: { $sum: "$items.quantity" },
      totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
      orderCount: { $sum: 1 },
      uniqueCustomers: { $addToSet: "$customerId" },
      avgPrice: { $avg: "$items.price" }
    }
  },
  
  // Add calculated fields
  {
    $addFields: {
      uniqueCustomerCount: { $size: "$uniqueCustomers" },
      avgQuantityPerOrder: { $divide: ["$totalQuantitySold", "$orderCount"] }
    }
  },
  
  // Sort by revenue
  { $sort: { totalRevenue: -1 } },
  
  // Limit to top 20 products
  { $limit: 20 }
])
```

---

## Performance Optimization

### Pipeline Optimization Tips

1. **Filter Early**: Use `$match` as early as possible
2. **Project Late**: Use `$project` to reduce document size after filtering
3. **Index Usage**: Ensure `$match` and `$sort` can use indexes
4. **Limit Results**: Use `$limit` to reduce processing

```javascript
// Optimized pipeline
db.orders.aggregate([
  // 1. Filter first (uses index)
  {
    $match: {
      date: { $gte: new Date("2023-01-01") },
      status: "completed"
    }
  },
  
  // 2. Sort early (uses index if available)
  { $sort: { date: -1 } },
  
  // 3. Limit early to reduce processing
  { $limit: 1000 },
  
  // 4. Lookup after filtering
  {
    $lookup: {
      from: "customers",
      localField: "customerId",
      foreignField: "_id",
      as: "customer"
    }
  },
  
  // 5. Project to reduce document size
  {
    $project: {
      amount: 1,
      date: 1,
      "customer.name": 1,
      "customer.email": 1
    }
  }
])
```

### Memory Usage

```javascript
// Use allowDiskUse for large datasets
db.orders.aggregate([
  // ... pipeline stages
], { allowDiskUse: true })

// Monitor aggregation performance
db.orders.aggregate([
  // ... pipeline stages
]).explain("executionStats")
```

---

## Next Steps

Now that you understand the Aggregation Framework:

1. **[Best Practices](08-best-practices.md)** - Production-ready applications
2. Practice with your own data to master these concepts
3. Explore MongoDB's aggregation pipeline builder tools

The Aggregation Framework is incredibly powerful for data analysis and reporting. Master these concepts and you'll be able to perform complex data operations efficiently in MongoDB!
