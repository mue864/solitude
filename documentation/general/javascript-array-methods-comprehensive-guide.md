# JavaScript/TypeScript Array Methods Comprehensive Guide

## Table of Contents

1. [Introduction to Array Methods](#introduction-to-array-methods)
2. [Array.map() - The Transformation Method](#arraymap---the-transformation-method)
3. [Array.filter() - The Selection Method](#arrayfilter---the-selection-method)
4. [Array.reduce() - The Accumulation Method](#arrayreduce---the-accumulation-method)
5. [Array.forEach() - The Iteration Method](#arrayforeach---the-iteration-method)
6. [Array.find() and Array.findIndex()](#arrayfind-and-arrayfindindex)
7. [Array.some() and Array.every()](#arraysome-and-arrayevery)
8. [Array Methods with Objects](#array-methods-with-objects)
9. [Chaining Array Methods](#chaining-array-methods)
10. [Performance Considerations](#performance-considerations)
11. [Common Patterns and Best Practices](#common-patterns-and-best-practices)
12. [Real-World Examples](#real-world-examples)

## Introduction to Array Methods

Array methods are powerful functions that allow you to manipulate and transform arrays in a functional programming style. They provide a clean, readable way to work with collections of data.

### Why Use Array Methods?

- **Readability**: Clear intent and purpose
- **Immutability**: Don't modify original arrays
- **Composability**: Chain multiple operations
- **Type Safety**: Better TypeScript support
- **Performance**: Often more efficient than loops

### Basic Array Method Pattern

```javascript
// Traditional for loop
const numbers = [1, 2, 3, 4, 5];
const doubled = [];
for (let i = 0; i < numbers.length; i++) {
  doubled.push(numbers[i] * 2);
}

// Array method approach
const doubled = numbers.map((num) => num * 2);
```

## Array.map() - The Transformation Method

`map()` is the most commonly used array method. It transforms each element in an array and returns a new array with the same length.

### Basic Syntax

```javascript
array.map(callbackFunction);
```

### Simple Examples

```javascript
// Double each number
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map((num) => num * 2);
console.log(doubled); // [2, 4, 6, 8, 10]

// Convert strings to uppercase
const names = ["john", "jane", "bob"];
const upperNames = names.map((name) => name.toUpperCase());
console.log(upperNames); // ['JOHN', 'JANE', 'BOB']

// Add prefix to each string
const items = ["apple", "banana", "orange"];
const prefixedItems = items.map((item) => `fruit: ${item}`);
console.log(prefixedItems); // ['fruit: apple', 'fruit: banana', 'fruit: orange']
```

### Map with Index Parameter

```javascript
// Add index to each element
const letters = ["a", "b", "c"];
const indexedLetters = letters.map((letter, index) => `${index}: ${letter}`);
console.log(indexedLetters); // ['0: a', '1: b', '2: c']

// Create numbered list
const tasks = ["Learn JavaScript", "Build a project", "Deploy to production"];
const numberedTasks = tasks.map((task, index) => `${index + 1}. ${task}`);
console.log(numberedTasks);
// ['1. Learn JavaScript', '2. Build a project', '3. Deploy to production']
```

### Map with Objects

```javascript
// Transform object properties
const users = [
  { id: 1, name: "John", age: 25 },
  { id: 2, name: "Jane", age: 30 },
  { id: 3, name: "Bob", age: 28 },
];

// Extract specific properties
const names = users.map((user) => user.name);
console.log(names); // ['John', 'Jane', 'Bob']

// Transform object structure
const userSummaries = users.map((user) => ({
  id: user.id,
  displayName: `${user.name} (${user.age})`,
}));
console.log(userSummaries);
// [
//   { id: 1, displayName: 'John (25)' },
//   { id: 2, displayName: 'Jane (30)' },
//   { id: 3, displayName: 'Bob (28)' }
// ]

// Add computed properties
const usersWithStatus = users.map((user) => ({
  ...user,
  isAdult: user.age >= 18,
  ageGroup: user.age < 30 ? "young" : "adult",
}));
console.log(usersWithStatus);
// [
//   { id: 1, name: 'John', age: 25, isAdult: true, ageGroup: 'young' },
//   { id: 2, name: 'Jane', age: 30, isAdult: true, ageGroup: 'adult' },
//   { id: 3, name: 'Bob', age: 28, isAdult: true, ageGroup: 'young' }
// ]
```

### Map with Conditional Logic

```javascript
// Conditional transformation
const scores = [85, 92, 78, 96, 88];
const grades = scores.map((score) => {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  return "D";
});
console.log(grades); // ['B', 'A', 'C', 'A', 'B']

// Transform with fallback
const products = [
  { name: "Laptop", price: 999 },
  { name: "Mouse", price: null },
  { name: "Keyboard", price: 50 },
];

const pricesWithDefaults = products.map((product) => ({
  ...product,
  price: product.price ?? 0,
  priceDisplay: product.price ? `$${product.price}` : "Price not available",
}));
console.log(pricesWithDefaults);
// [
//   { name: 'Laptop', price: 999, priceDisplay: '$999' },
//   { name: 'Mouse', price: 0, priceDisplay: 'Price not available' },
//   { name: 'Keyboard', price: 50, priceDisplay: '$50' }
// ]
```

### Map with Nested Arrays

```javascript
// Flatten nested arrays
const nestedArrays = [
  [1, 2],
  [3, 4],
  [5, 6],
];
const flattened = nestedArrays.map((arr) => arr.join(", "));
console.log(flattened); // ['1, 2', '3, 4', '5, 6']

// Transform nested objects
const orders = [
  {
    id: 1,
    items: ["apple", "banana"],
    total: 5.5,
  },
  {
    id: 2,
    items: ["orange", "grape", "kiwi"],
    total: 8.75,
  },
];

const orderSummaries = orders.map((order) => ({
  orderId: order.id,
  itemCount: order.items.length,
  totalFormatted: `$${order.total.toFixed(2)}`,
  itemsList: order.items.join(", "),
}));
console.log(orderSummaries);
// [
//   { orderId: 1, itemCount: 2, totalFormatted: '$5.50', itemsList: 'apple, banana' },
//   { orderId: 2, itemCount: 3, totalFormatted: '$8.75', itemsList: 'orange, grape, kiwi' }
// ]
```

### Map with Async Operations

```javascript
// Map with async functions (returns array of promises)
const urls = ["https://api.example.com/users", "https://api.example.com/posts"];
const fetchPromises = urls.map((url) => fetch(url));

// Handle async operations
async function fetchAllData(urls) {
  const promises = urls.map((url) => fetch(url).then((res) => res.json()));
  return Promise.all(promises);
}

// Usage
const dataUrls = ["/api/users", "/api/posts", "/api/comments"];
fetchAllData(dataUrls).then((results) => {
  console.log("All data fetched:", results);
});
```

### TypeScript with Map

```typescript
// Type-safe map operations
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

interface UserDisplay {
  id: number;
  displayName: string;
  isAdult: boolean;
}

const users: User[] = [
  { id: 1, name: "John", email: "john@example.com", age: 25 },
  { id: 2, name: "Jane", email: "jane@example.com", age: 30 },
];

// Type-safe transformation
const userDisplays: UserDisplay[] = users.map((user) => ({
  id: user.id,
  displayName: `${user.name} (${user.email})`,
  isAdult: user.age >= 18,
}));

// Generic map function
function mapArray<T, U>(
  array: T[],
  transform: (item: T, index: number) => U
): U[] {
  return array.map(transform);
}

// Usage
const numbers: number[] = [1, 2, 3, 4, 5];
const strings: string[] = mapArray(numbers, (num) => num.toString());
```

## Array.filter() - The Selection Method

`filter()` creates a new array with elements that pass a test function.

### Basic Examples

```javascript
// Filter even numbers
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const evenNumbers = numbers.filter((num) => num % 2 === 0);
console.log(evenNumbers); // [2, 4, 6, 8, 10]

// Filter strings by length
const words = ["apple", "banana", "kiwi", "orange", "grape"];
const longWords = words.filter((word) => word.length > 5);
console.log(longWords); // ['banana', 'orange']

// Filter objects by property
const users = [
  { name: "John", age: 25, active: true },
  { name: "Jane", age: 30, active: false },
  { name: "Bob", age: 28, active: true },
];

const activeUsers = users.filter((user) => user.active);
console.log(activeUsers);
// [{ name: 'John', age: 25, active: true }, { name: 'Bob', age: 28, active: true }]

const adults = users.filter((user) => user.age >= 18);
console.log(adults); // All users (all are adults)
```

### Filter with Index

```javascript
// Filter every other element
const items = ["a", "b", "c", "d", "e", "f"];
const everyOther = items.filter((item, index) => index % 2 === 0);
console.log(everyOther); // ['a', 'c', 'e']

// Filter first 3 elements
const firstThree = items.filter((item, index) => index < 3);
console.log(firstThree); // ['a', 'b', 'c']
```

### Complex Filtering

```javascript
// Multiple conditions
const products = [
  { name: "Laptop", price: 999, category: "electronics", inStock: true },
  { name: "Book", price: 15, category: "books", inStock: false },
  { name: "Phone", price: 699, category: "electronics", inStock: true },
  { name: "Pen", price: 2, category: "office", inStock: true },
];

// Filter by multiple criteria
const availableElectronics = products.filter(
  (product) =>
    product.category === "electronics" &&
    product.inStock &&
    product.price < 1000
);
console.log(availableElectronics);
// [{ name: 'Laptop', price: 999, category: 'electronics', inStock: true }]

// Filter with search
const searchTerm = "phone";
const searchResults = products.filter((product) =>
  product.name.toLowerCase().includes(searchTerm.toLowerCase())
);
console.log(searchResults);
// [{ name: 'Phone', price: 699, category: 'electronics', inStock: true }]
```

## Array.reduce() - The Accumulation Method

`reduce()` transforms an array into a single value by applying a function to each element.

### Basic Examples

```javascript
// Sum all numbers
const numbers = [1, 2, 3, 4, 5];
const sum = numbers.reduce((total, num) => total + num, 0);
console.log(sum); // 15

// Find maximum number
const max = numbers.reduce((max, num) => Math.max(max, num), numbers[0]);
console.log(max); // 5

// Concatenate strings
const words = ["hello", "world", "javascript"];
const sentence = words.reduce((result, word) => result + " " + word, "");
console.log(sentence); // ' hello world javascript'
```

### Reduce with Objects

```javascript
// Count occurrences
const fruits = ["apple", "banana", "apple", "orange", "banana", "apple"];
const fruitCount = fruits.reduce((counts, fruit) => {
  counts[fruit] = (counts[fruit] || 0) + 1;
  return counts;
}, {});
console.log(fruitCount); // { apple: 3, banana: 2, orange: 1 }

// Group by property
const users = [
  { name: "John", age: 25, city: "NYC" },
  { name: "Jane", age: 30, city: "LA" },
  { name: "Bob", age: 28, city: "NYC" },
  { name: "Alice", age: 25, city: "LA" },
];

const usersByCity = users.reduce((groups, user) => {
  const city = user.city;
  if (!groups[city]) {
    groups[city] = [];
  }
  groups[city].push(user);
  return groups;
}, {});
console.log(usersByCity);
// {
//   NYC: [{ name: 'John', age: 25, city: 'NYC' }, { name: 'Bob', age: 28, city: 'NYC' }],
//   LA: [{ name: 'Jane', age: 30, city: 'LA' }, { name: 'Alice', age: 25, city: 'LA' }]
// }
```

### Reduce to Create Objects

```javascript
// Transform array to object
const keyValuePairs = [
  ["name", "John"],
  ["age", 25],
  ["city", "NYC"],
];

const person = keyValuePairs.reduce((obj, [key, value]) => {
  obj[key] = value;
  return obj;
}, {});
console.log(person); // { name: 'John', age: 25, city: 'NYC' }

// Flatten nested arrays
const nestedArrays = [
  [1, 2],
  [3, 4],
  [5, 6],
];
const flattened = nestedArrays.reduce((result, array) => {
  return result.concat(array);
}, []);
console.log(flattened); // [1, 2, 3, 4, 5, 6]
```

## Array.forEach() - The Iteration Method

`forEach()` executes a function for each element in an array. It doesn't return anything.

### Basic Examples

```javascript
// Log each element
const numbers = [1, 2, 3, 4, 5];
numbers.forEach((num) => console.log(num));
// 1, 2, 3, 4, 5

// Update DOM elements
const elements = document.querySelectorAll(".item");
elements.forEach((element, index) => {
  element.textContent = `Item ${index + 1}`;
});

// Side effects with objects
const users = [
  { name: "John", email: "john@example.com" },
  { name: "Jane", email: "jane@example.com" },
];

users.forEach((user) => {
  console.log(`Sending email to ${user.name} at ${user.email}`);
  // sendEmail(user.email, `Hello ${user.name}!`);
});
```

### forEach vs Map

```javascript
// ❌ Don't use forEach when you need a return value
const numbers = [1, 2, 3, 4, 5];
const doubled = [];
numbers.forEach((num) => {
  doubled.push(num * 2);
});

// ✅ Use map instead
const doubled = numbers.map((num) => num * 2);

// ✅ Use forEach for side effects
const users = ["john", "jane", "bob"];
users.forEach((user) => {
  console.log(`Processing user: ${user}`);
  // performSideEffect(user);
});
```

## Array.find() and Array.findIndex()

`find()` returns the first element that passes a test. `findIndex()` returns the index of the first element that passes a test.

### Basic Examples

```javascript
// Find first even number
const numbers = [1, 3, 5, 8, 9, 10];
const firstEven = numbers.find((num) => num % 2 === 0);
console.log(firstEven); // 8

// Find user by name
const users = [
  { id: 1, name: "John", age: 25 },
  { id: 2, name: "Jane", age: 30 },
  { id: 3, name: "Bob", age: 28 },
];

const jane = users.find((user) => user.name === "Jane");
console.log(jane); // { id: 2, name: 'Jane', age: 30 }

// Find index of element
const fruits = ["apple", "banana", "orange", "grape"];
const orangeIndex = fruits.findIndex((fruit) => fruit === "orange");
console.log(orangeIndex); // 2

// Find index with complex condition
const products = [
  { name: "Laptop", price: 999, inStock: true },
  { name: "Phone", price: 699, inStock: false },
  { name: "Tablet", price: 399, inStock: true },
];

const firstExpensiveInStock = products.findIndex(
  (product) => product.price > 500 && product.inStock
);
console.log(firstExpensiveInStock); // 0 (Laptop)
```

## Array.some() and Array.every()

`some()` returns true if at least one element passes the test. `every()` returns true if all elements pass the test.

### Basic Examples

```javascript
// Check if any number is even
const numbers = [1, 3, 5, 8, 9];
const hasEven = numbers.some((num) => num % 2 === 0);
console.log(hasEven); // true

// Check if all numbers are positive
const allPositive = numbers.every((num) => num > 0);
console.log(allPositive); // true

// Check if any user is admin
const users = [
  { name: "John", role: "user" },
  { name: "Jane", role: "admin" },
  { name: "Bob", role: "user" },
];

const hasAdmin = users.some((user) => user.role === "admin");
console.log(hasAdmin); // true

// Check if all users are adults
const allAdults = users.every((user) => user.age >= 18);
console.log(allAdults); // true (assuming all users have age >= 18)
```

## Array Methods with Objects

### Working with Object Properties

```javascript
// Extract specific properties
const users = [
  { id: 1, name: "John", email: "john@example.com", age: 25 },
  { id: 2, name: "Jane", email: "jane@example.com", age: 30 },
  { id: 3, name: "Bob", email: "bob@example.com", age: 28 },
];

// Get all names
const names = users.map((user) => user.name);
console.log(names); // ['John', 'Jane', 'Bob']

// Get users with age > 25
const olderUsers = users.filter((user) => user.age > 25);
console.log(olderUsers);
// [{ id: 2, name: 'Jane', age: 30 }, { id: 3, name: 'Bob', age: 28 }]

// Calculate average age
const averageAge =
  users.reduce((sum, user) => sum + user.age, 0) / users.length;
console.log(averageAge); // 27.67

// Check if any user is over 30
const hasOlderUser = users.some((user) => user.age > 30);
console.log(hasOlderUser); // true
```

### Complex Object Transformations

```javascript
// Transform nested objects
const orders = [
  {
    id: 1,
    customer: { name: "John", email: "john@example.com" },
    items: [
      { name: "Laptop", price: 999, quantity: 1 },
      { name: "Mouse", price: 25, quantity: 2 },
    ],
  },
  {
    id: 2,
    customer: { name: "Jane", email: "jane@example.com" },
    items: [{ name: "Phone", price: 699, quantity: 1 }],
  },
];

// Calculate total for each order
const ordersWithTotals = orders.map((order) => ({
  ...order,
  total: order.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
}));
console.log(ordersWithTotals);
// [
//   { id: 1, customer: {...}, items: [...], total: 1049 },
//   { id: 2, customer: {...}, items: [...], total: 699 }
// ]

// Get all unique item names
const allItems = orders.flatMap((order) => order.items);
const uniqueItemNames = [...new Set(allItems.map((item) => item.name))];
console.log(uniqueItemNames); // ['Laptop', 'Mouse', 'Phone']
```

## Chaining Array Methods

Chaining allows you to combine multiple array methods for complex operations.

### Basic Chaining

```javascript
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Filter even numbers, double them, then sum
const result = numbers
  .filter((num) => num % 2 === 0)
  .map((num) => num * 2)
  .reduce((sum, num) => sum + num, 0);

console.log(result); // 60 (2+4+6+8+10 = 30, then doubled = 60)
```

### Complex Chaining

```javascript
const users = [
  { name: "John", age: 25, city: "NYC", active: true },
  { name: "Jane", age: 30, city: "LA", active: false },
  { name: "Bob", age: 28, city: "NYC", active: true },
  { name: "Alice", age: 22, city: "LA", active: true },
  { name: "Charlie", age: 35, city: "NYC", active: false },
];

// Get active users from NYC, over 25, with formatted names
const result = users
  .filter((user) => user.active && user.city === "NYC" && user.age > 25)
  .map((user) => ({
    displayName: `${user.name} (${user.age})`,
    city: user.city,
  }))
  .sort((a, b) => a.displayName.localeCompare(b.displayName));

console.log(result);
// [{ displayName: 'Bob (28)', city: 'NYC' }]
```

### Performance Considerations in Chaining

```javascript
// ❌ Inefficient: Multiple iterations
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const result = numbers
  .filter((num) => num % 2 === 0)
  .map((num) => num * 2)
  .filter((num) => num > 10)
  .map((num) => num + 1);

// ✅ More efficient: Single iteration with reduce
const result = numbers.reduce((acc, num) => {
  if (num % 2 === 0) {
    const doubled = num * 2;
    if (doubled > 10) {
      acc.push(doubled + 1);
    }
  }
  return acc;
}, []);
```

## Performance Considerations

### When to Use Each Method

```javascript
// ✅ Use map when you need to transform every element
const doubled = numbers.map((num) => num * 2);

// ✅ Use filter when you need to select elements
const evens = numbers.filter((num) => num % 2 === 0);

// ✅ Use reduce when you need to accumulate/combine
const sum = numbers.reduce((total, num) => total + num, 0);

// ✅ Use forEach for side effects only
users.forEach((user) => sendEmail(user.email));

// ✅ Use find when you need the first match
const user = users.find((u) => u.id === 123);

// ✅ Use some/every for boolean checks
const hasAdmin = users.some((u) => u.role === "admin");
const allAdults = users.every((u) => u.age >= 18);
```

### Performance Tips

```javascript
// ❌ Avoid unnecessary array creation
const result = numbers
  .map((num) => num * 2)
  .filter((num) => num > 10)
  .map((num) => num + 1);

// ✅ Use reduce for multiple operations
const result = numbers.reduce((acc, num) => {
  const doubled = num * 2;
  if (doubled > 10) {
    acc.push(doubled + 1);
  }
  return acc;
}, []);

// ✅ Use for...of for simple iterations
for (const num of numbers) {
  console.log(num);
}

// ✅ Use forEach for side effects
numbers.forEach((num) => {
  console.log(num);
  // performSideEffect(num);
});
```

## Common Patterns and Best Practices

### 1. Transform and Filter

```javascript
// Common pattern: transform then filter
const users = [
  { name: "John", age: 25, role: "user" },
  { name: "Jane", age: 30, role: "admin" },
  { name: "Bob", age: 28, role: "user" },
];

// Get admin names
const adminNames = users
  .filter((user) => user.role === "admin")
  .map((user) => user.name);

console.log(adminNames); // ['Jane']
```

### 2. Group and Transform

```javascript
// Group by category, then transform
const products = [
  { name: "Laptop", category: "electronics", price: 999 },
  { name: "Book", category: "books", price: 15 },
  { name: "Phone", category: "electronics", price: 699 },
  { name: "Pen", category: "office", price: 2 },
];

const categoryTotals = products.reduce((totals, product) => {
  totals[product.category] = (totals[product.category] || 0) + product.price;
  return totals;
}, {});

console.log(categoryTotals);
// { electronics: 1698, books: 15, office: 2 }
```

### 3. Flatten and Transform

```javascript
// Flatten nested arrays and transform
const categories = [
  {
    name: "Electronics",
    products: [
      { name: "Laptop", price: 999 },
      { name: "Phone", price: 699 },
    ],
  },
  {
    name: "Books",
    products: [
      { name: "JavaScript Guide", price: 25 },
      { name: "React Cookbook", price: 30 },
    ],
  },
];

// Get all products with category
const allProducts = categories.flatMap((category) =>
  category.products.map((product) => ({
    ...product,
    category: category.name,
  }))
);

console.log(allProducts);
// [
//   { name: 'Laptop', price: 999, category: 'Electronics' },
//   { name: 'Phone', price: 699, category: 'Electronics' },
//   { name: 'JavaScript Guide', price: 25, category: 'Books' },
//   { name: 'React Cookbook', price: 30, category: 'Books' }
// ]
```

### 4. Error Handling

```javascript
// Safe array operations
const users = [
  { name: "John", age: 25 },
  { name: "Jane", age: 30 },
  null, // Invalid entry
  { name: "Bob", age: 28 },
];

// Filter out invalid entries, then transform
const validUserNames = users
  .filter((user) => user !== null && typeof user === "object")
  .map((user) => user.name);

console.log(validUserNames); // ['John', 'Jane', 'Bob']
```

## Real-World Examples

### 1. E-commerce Product Processing

```javascript
const products = [
  { id: 1, name: "Laptop", price: 999, category: "electronics", inStock: true },
  { id: 2, name: "Book", price: 15, category: "books", inStock: false },
  { id: 3, name: "Phone", price: 699, category: "electronics", inStock: true },
  { id: 4, name: "Pen", price: 2, category: "office", inStock: true },
];

// Get available electronics under $1000
const availableElectronics = products
  .filter(
    (product) =>
      product.category === "electronics" &&
      product.inStock &&
      product.price < 1000
  )
  .map((product) => ({
    ...product,
    priceFormatted: `$${product.price.toFixed(2)}`,
  }));

console.log(availableElectronics);
// [
//   { id: 1, name: 'Laptop', price: 999, category: 'electronics', inStock: true, priceFormatted: '$999.00' },
//   { id: 3, name: 'Phone', price: 699, category: 'electronics', inStock: true, priceFormatted: '$699.00' }
// ]
```

### 2. User Data Processing

```javascript
const users = [
  {
    id: 1,
    name: "John",
    email: "john@example.com",
    age: 25,
    role: "user",
    lastLogin: "2024-01-15",
  },
  {
    id: 2,
    name: "Jane",
    email: "jane@example.com",
    age: 30,
    role: "admin",
    lastLogin: "2024-01-20",
  },
  {
    id: 3,
    name: "Bob",
    email: "bob@example.com",
    age: 28,
    role: "user",
    lastLogin: "2024-01-10",
  },
  {
    id: 4,
    name: "Alice",
    email: "alice@example.com",
    age: 22,
    role: "user",
    lastLogin: "2024-01-18",
  },
];

// Get active users (logged in within last 7 days) with role info
const activeUsers = users
  .filter((user) => {
    const lastLoginDate = new Date(user.lastLogin);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return lastLoginDate > sevenDaysAgo;
  })
  .map((user) => ({
    id: user.id,
    displayName: `${user.name} (${user.role})`,
    email: user.email,
    isAdmin: user.role === "admin",
  }))
  .sort((a, b) => a.displayName.localeCompare(b.displayName));

console.log(activeUsers);
// [
//   { id: 4, displayName: 'Alice (user)', email: 'alice@example.com', isAdmin: false },
//   { id: 2, displayName: 'Jane (admin)', email: 'jane@example.com', isAdmin: true },
//   { id: 1, displayName: 'John (user)', email: 'john@example.com', isAdmin: false }
// ]
```

### 3. API Response Processing

```javascript
// Simulate API response
const apiResponse = {
  users: [
    {
      id: 1,
      name: "John",
      posts: [
        { id: 1, title: "Hello World", likes: 10 },
        { id: 2, title: "My Second Post", likes: 5 },
      ],
    },
    {
      id: 2,
      name: "Jane",
      posts: [
        { id: 3, title: "React Tips", likes: 25 },
        { id: 4, title: "TypeScript Guide", likes: 15 },
      ],
    },
  ],
};

// Get all posts with author information
const allPosts = apiResponse.users.flatMap((user) =>
  user.posts.map((post) => ({
    ...post,
    author: user.name,
    authorId: user.id,
  }))
);

// Get popular posts (likes > 10)
const popularPosts = allPosts
  .filter((post) => post.likes > 10)
  .sort((a, b) => b.likes - a.likes)
  .map((post) => ({
    title: post.title,
    author: post.author,
    likes: post.likes,
    popularity: post.likes > 20 ? "viral" : "popular",
  }));

console.log(popularPosts);
// [
//   { title: 'React Tips', author: 'Jane', likes: 25, popularity: 'viral' },
//   { title: 'TypeScript Guide', author: 'Jane', likes: 15, popularity: 'popular' }
// ]
```

This comprehensive guide covers all the essential array methods with practical examples, performance considerations, and real-world use cases. The focus on `map()` and other transformation methods will help you write cleaner, more maintainable code in your React Native focus app!
