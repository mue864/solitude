# JavaScript/TypeScript Object Methods Comprehensive Guide

## Table of Contents

1. [Introduction to Object Methods](#introduction-to-object-methods)
2. [Object.keys() - Getting Object Keys](#objectkeys---getting-object-keys)
3. [Object.values() - Getting Object Values](#objectvalues---getting-object-values)
4. [Object.entries() - Getting Key-Value Pairs](#objectentries---getting-key-value-pairs)
5. [Object.fromEntries() - Creating Objects from Entries](#objectfromentries---creating-objects-from-entries)
6. [Object.assign() - Merging Objects](#objectassign---merging-objects)
7. [Object.freeze(), Object.seal(), Object.preventExtensions()](#object-freeze-objectseal-objectpreventextensions)
8. [Object.hasOwn() - Property Checking](#objecthasown---property-checking)
9. [Object Methods with Arrays](#object-methods-with-arrays)
10. [Object Methods with TypeScript](#object-methods-with-typescript)
11. [Performance Considerations](#performance-considerations)
12. [Common Patterns and Best Practices](#common-patterns-and-best-practices)
13. [Real-World Examples](#real-world-examples)

## Introduction to Object Methods

Object methods are utility functions that help you work with JavaScript objects in a more functional and efficient way. They provide standardized ways to access, transform, and manipulate object properties.

### Why Use Object Methods?

- **Consistency**: Standardized way to work with objects
- **Immutability**: Create new objects without modifying originals
- **Type Safety**: Better TypeScript support
- **Performance**: Optimized for object operations
- **Readability**: Clear intent and purpose

### Basic Object Method Pattern

```javascript
// Traditional approach
const user = { name: "John", age: 25, city: "NYC" };
const keys = [];
for (const key in user) {
  if (user.hasOwnProperty(key)) {
    keys.push(key);
  }
}

// Object method approach
const keys = Object.keys(user);
```

## Object.keys() - Getting Object Keys

`Object.keys()` returns an array of a given object's own enumerable property names.

### Basic Syntax

```javascript
Object.keys(object);
```

### Simple Examples

```javascript
// Basic object keys
const user = { name: "John", age: 25, city: "NYC" };
const keys = Object.keys(user);
console.log(keys); // ['name', 'age', 'city']

// Empty object
const emptyObj = {};
const emptyKeys = Object.keys(emptyObj);
console.log(emptyKeys); // []

// Object with different value types
const mixedObj = {
  string: "hello",
  number: 42,
  boolean: true,
  null: null,
  undefined: undefined,
  function: () => {},
  array: [1, 2, 3],
  object: { nested: true },
};
const mixedKeys = Object.keys(mixedObj);
console.log(mixedKeys);
// ['string', 'number', 'boolean', 'null', 'undefined', 'function', 'array', 'object']
```

### Object.keys() with Nested Objects

```javascript
// Nested object structure
const company = {
  name: "TechCorp",
  departments: {
    engineering: {
      manager: "Alice",
      employees: 25,
    },
    marketing: {
      manager: "Bob",
      employees: 15,
    },
    sales: {
      manager: "Charlie",
      employees: 30,
    },
  },
  location: "San Francisco",
};

// Get top-level keys
const topLevelKeys = Object.keys(company);
console.log(topLevelKeys); // ['name', 'departments', 'location']

// Get department keys
const departmentKeys = Object.keys(company.departments);
console.log(departmentKeys); // ['engineering', 'marketing', 'sales']

// Get keys from nested department
const engineeringKeys = Object.keys(company.departments.engineering);
console.log(engineeringKeys); // ['manager', 'employees']
```

### Object.keys() with Arrays

```javascript
// Array-like objects
const arrayLike = { 0: "first", 1: "second", 2: "third", length: 3 };
const arrayKeys = Object.keys(arrayLike);
console.log(arrayKeys); // ['0', '1', '2', 'length']

// Regular arrays
const array = ["apple", "banana", "orange"];
const arrayObjectKeys = Object.keys(array);
console.log(arrayObjectKeys); // ['0', '1', '2']

// Array with gaps
const sparseArray = ["apple", , "orange"]; // Note the gap
const sparseKeys = Object.keys(sparseArray);
console.log(sparseKeys); // ['0', '2'] (skips index 1)
```

### Object.keys() with Inheritance

```javascript
// Parent object
const parent = { inherited: "from parent" };

// Child object with own properties
const child = Object.create(parent);
child.own = "from child";

// Object.keys() only returns own enumerable properties
const childKeys = Object.keys(child);
console.log(childKeys); // ['own'] (doesn't include 'inherited')

// To get all properties including inherited ones
const allKeys = [];
for (const key in child) {
  allKeys.push(key);
}
console.log(allKeys); // ['own', 'inherited']
```

### Object.keys() with Non-enumerable Properties

```javascript
// Object with non-enumerable property
const obj = { visible: "enumerable" };
Object.defineProperty(obj, "hidden", {
  value: "non-enumerable",
  enumerable: false,
});

const keys = Object.keys(obj);
console.log(keys); // ['visible'] (doesn't include 'hidden')

// To get all properties including non-enumerable ones
const allProps = Object.getOwnPropertyNames(obj);
console.log(allProps); // ['visible', 'hidden']
```

## Object.values() - Getting Object Values

`Object.values()` returns an array of a given object's own enumerable property values.

### Basic Syntax

```javascript
Object.values(object);
```

### Simple Examples

```javascript
// Basic object values
const user = { name: "John", age: 25, city: "NYC" };
const values = Object.values(user);
console.log(values); // ['John', 25, 'NYC']

// Empty object
const emptyObj = {};
const emptyValues = Object.values(emptyObj);
console.log(emptyValues); // []

// Object with different value types
const mixedObj = {
  string: "hello",
  number: 42,
  boolean: true,
  null: null,
  undefined: undefined,
  function: () => {},
  array: [1, 2, 3],
  object: { nested: true },
};
const mixedValues = Object.values(mixedObj);
console.log(mixedValues);
// ['hello', 42, true, null, undefined, [Function], [1, 2, 3], { nested: true }]
```

### Object.values() with Nested Objects

```javascript
// Nested object structure
const company = {
  name: "TechCorp",
  departments: {
    engineering: { manager: "Alice", employees: 25 },
    marketing: { manager: "Bob", employees: 15 },
    sales: { manager: "Charlie", employees: 30 },
  },
  location: "San Francisco",
};

// Get top-level values
const topLevelValues = Object.values(company);
console.log(topLevelValues);
// ['TechCorp', { engineering: {...}, marketing: {...}, sales: {...} }, 'San Francisco']

// Get department values
const departmentValues = Object.values(company.departments);
console.log(departmentValues);
// [
//   { manager: 'Alice', employees: 25 },
//   { manager: 'Bob', employees: 15 },
//   { manager: 'Charlie', employees: 30 }
// ]

// Get values from specific department
const engineeringValues = Object.values(company.departments.engineering);
console.log(engineeringValues); // ['Alice', 25]
```

### Object.values() with Arrays

```javascript
// Regular arrays
const array = ["apple", "banana", "orange"];
const arrayValues = Object.values(array);
console.log(arrayValues); // ['apple', 'banana', 'orange']

// Array with gaps
const sparseArray = ["apple", , "orange"];
const sparseValues = Object.values(sparseArray);
console.log(sparseValues); // ['apple', 'orange'] (skips undefined)
```

### Object.values() for Data Processing

```javascript
// Calculate sum of numeric values
const scores = { math: 85, science: 92, english: 78, history: 88 };
const scoreValues = Object.values(scores);
const totalScore = scoreValues.reduce((sum, score) => sum + score, 0);
console.log(totalScore); // 343

// Find maximum value
const maxScore = Math.max(...Object.values(scores));
console.log(maxScore); // 92

// Check if all values are truthy
const settings = { darkMode: true, notifications: true, autoSave: false };
const allTruthy = Object.values(settings).every((value) => value === true);
console.log(allTruthy); // false

// Count unique values
const colors = { shirt: "blue", pants: "black", shoes: "blue", hat: "red" };
const uniqueColors = [...new Set(Object.values(colors))];
console.log(uniqueColors); // ['blue', 'black', 'red']
```

## Object.entries() - Getting Key-Value Pairs

`Object.entries()` returns an array of a given object's own enumerable string-keyed property [key, value] pairs.

### Basic Syntax

```javascript
Object.entries(object);
```

### Simple Examples

```javascript
// Basic object entries
const user = { name: "John", age: 25, city: "NYC" };
const entries = Object.entries(user);
console.log(entries);
// [['name', 'John'], ['age', 25], ['city', 'NYC']]

// Empty object
const emptyObj = {};
const emptyEntries = Object.entries(emptyObj);
console.log(emptyEntries); // []

// Object with different value types
const mixedObj = {
  string: "hello",
  number: 42,
  boolean: true,
  array: [1, 2, 3],
};
const mixedEntries = Object.entries(mixedObj);
console.log(mixedEntries);
// [['string', 'hello'], ['number', 42], ['boolean', true], ['array', [1, 2, 3]]]
```

### Object.entries() with Arrays

```javascript
// Regular arrays
const array = ["apple", "banana", "orange"];
const arrayEntries = Object.entries(array);
console.log(arrayEntries);
// [['0', 'apple'], ['1', 'banana'], ['2', 'orange']]

// Array with gaps
const sparseArray = ["apple", , "orange"];
const sparseEntries = Object.entries(sparseArray);
console.log(sparseEntries);
// [['0', 'apple'], ['2', 'orange']] (skips index 1)
```

### Object.entries() for Iteration

```javascript
// Iterate over entries
const user = { name: "John", age: 25, city: "NYC" };

// Using for...of
for (const [key, value] of Object.entries(user)) {
  console.log(`${key}: ${value}`);
}
// name: John
// age: 25
// city: NYC

// Using forEach
Object.entries(user).forEach(([key, value]) => {
  console.log(`${key}: ${value}`);
});

// Using map
const formattedEntries = Object.entries(user).map(
  ([key, value]) => `${key.toUpperCase()}: ${value}`
);
console.log(formattedEntries);
// ['NAME: John', 'AGE: 25', 'CITY: NYC']
```

### Object.entries() for Data Transformation

```javascript
// Transform object structure
const user = { firstName: "John", lastName: "Doe", age: 25 };

// Create new object with transformed keys
const transformedUser = Object.entries(user).reduce((acc, [key, value]) => {
  const newKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
  acc[newKey] = value;
  return acc;
}, {});

console.log(transformedUser);
// { first_name: 'John', last_name: 'Doe', age: 25 }

// Filter entries based on value
const scores = { math: 85, science: 92, english: 78, history: 88 };
const highScores = Object.entries(scores)
  .filter(([key, value]) => value >= 85)
  .reduce((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {});

console.log(highScores); // { math: 85, science: 92, history: 88 }
```

## Object.fromEntries() - Creating Objects from Entries

`Object.fromEntries()` transforms a list of key-value pairs into an object.

### Basic Syntax

```javascript
Object.fromEntries(iterable);
```

### Simple Examples

```javascript
// Create object from array of entries
const entries = [
  ["name", "John"],
  ["age", 25],
  ["city", "NYC"],
];
const user = Object.fromEntries(entries);
console.log(user); // { name: 'John', age: 25, city: 'NYC' }

// Create object from Map
const map = new Map([
  ["name", "John"],
  ["age", 25],
]);
const userFromMap = Object.fromEntries(map);
console.log(userFromMap); // { name: 'John', age: 25 }

// Create object from URLSearchParams
const params = new URLSearchParams("name=John&age=25&city=NYC");
const userFromParams = Object.fromEntries(params);
console.log(userFromParams); // { name: 'John', age: 25, city: 'NYC' }
```

### Object.fromEntries() for Data Transformation

```javascript
// Transform array of objects
const users = [
  { id: 1, name: "John", role: "admin" },
  { id: 2, name: "Jane", role: "user" },
  { id: 3, name: "Bob", role: "user" },
];

// Create lookup object by ID
const usersById = Object.fromEntries(users.map((user) => [user.id, user]));
console.log(usersById);
// {
//   1: { id: 1, name: 'John', role: 'admin' },
//   2: { id: 2, name: 'Jane', role: 'user' },
//   3: { id: 3, name: 'Bob', role: 'user' }
// }

// Create lookup object by name
const usersByName = Object.fromEntries(users.map((user) => [user.name, user]));
console.log(usersByName);
// {
//   'John': { id: 1, name: 'John', role: 'admin' },
//   'Jane': { id: 2, name: 'Jane', role: 'user' },
//   'Bob': { id: 3, name: 'Bob', role: 'user' }
// }
```

### Object.fromEntries() with Filtering and Transformation

```javascript
// Transform and filter data
const products = [
  { id: 1, name: "Laptop", price: 999, category: "electronics" },
  { id: 2, name: "Book", price: 15, category: "books" },
  { id: 3, name: "Phone", price: 699, category: "electronics" },
  { id: 4, name: "Pen", price: 2, category: "office" },
];

// Create price lookup for electronics only
const electronicsPrices = Object.fromEntries(
  products
    .filter((product) => product.category === "electronics")
    .map((product) => [product.name, product.price])
);
console.log(electronicsPrices); // { Laptop: 999, Phone: 699 }

// Create category groups
const productsByCategory = Object.fromEntries(
  products.reduce((groups, product) => {
    const category = product.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(product);
    return groups;
  }, {})
);
console.log(productsByCategory);
// {
//   electronics: [
//     { id: 1, name: 'Laptop', price: 999, category: 'electronics' },
//     { id: 3, name: 'Phone', price: 699, category: 'electronics' }
//   ],
//   books: [{ id: 2, name: 'Book', price: 15, category: 'books' }],
//   office: [{ id: 4, name: 'Pen', price: 2, category: 'office' }]
// }
```

## Object.assign() - Merging Objects

`Object.assign()` copies all enumerable own properties from one or more source objects to a target object.

### Basic Syntax

```javascript
Object.assign(target, ...sources);
```

### Simple Examples

```javascript
// Basic object merging
const target = { a: 1, b: 2 };
const source = { b: 3, c: 4 };
const result = Object.assign(target, source);
console.log(result); // { a: 1, b: 3, c: 4 }
console.log(target); // { a: 1, b: 3, c: 4 } (target is modified)

// Create new object without modifying original
const original = { a: 1, b: 2 };
const merged = Object.assign({}, original, { b: 3, c: 4 });
console.log(merged); // { a: 1, b: 3, c: 4 }
console.log(original); // { a: 1, b: 2 } (original unchanged)

// Multiple sources
const obj1 = { a: 1 };
const obj2 = { b: 2 };
const obj3 = { c: 3 };
const combined = Object.assign({}, obj1, obj2, obj3);
console.log(combined); // { a: 1, b: 2, c: 3 }
```

### Object.assign() with Nested Objects

```javascript
// Shallow copy (nested objects are referenced, not copied)
const user = {
  name: "John",
  address: { city: "NYC", country: "USA" },
};

const userCopy = Object.assign({}, user);
userCopy.address.city = "LA";
console.log(user.address.city); // 'LA' (original is affected)

// Deep copy using JSON (for simple objects)
const deepCopy = JSON.parse(JSON.stringify(user));
deepCopy.address.city = "LA";
console.log(user.address.city); // 'NYC' (original unchanged)
```

### Object.assign() for Default Values

```javascript
// Set default values
const defaults = { theme: "light", language: "en", notifications: true };
const userSettings = { theme: "dark" };
const settings = Object.assign({}, defaults, userSettings);
console.log(settings); // { theme: 'dark', language: 'en', notifications: true }

// Multiple levels of defaults
const globalDefaults = { theme: "light", language: "en" };
const userDefaults = { theme: "dark", notifications: true };
const userSettings = { language: "es" };
const finalSettings = Object.assign(
  {},
  globalDefaults,
  userDefaults,
  userSettings
);
console.log(finalSettings); // { theme: 'dark', language: 'es', notifications: true }
```

## Object.freeze(), Object.seal(), Object.preventExtensions()

These methods control the mutability of objects.

### Object.freeze()

```javascript
// Freeze object (cannot add, delete, or modify properties)
const user = { name: "John", age: 25 };
Object.freeze(user);

// These operations will fail silently in non-strict mode
user.age = 30; // No effect
user.city = "NYC"; // No effect
delete user.name; // No effect

console.log(user); // { name: 'John', age: 25 } (unchanged)

// Check if object is frozen
console.log(Object.isFrozen(user)); // true
```

### Object.seal()

```javascript
// Seal object (can modify existing properties, but cannot add or delete)
const user = { name: "John", age: 25 };
Object.seal(user);

user.age = 30; // Works
user.city = "NYC"; // No effect (cannot add)
delete user.name; // No effect (cannot delete)

console.log(user); // { name: 'John', age: 30 }

// Check if object is sealed
console.log(Object.isSealed(user)); // true
```

### Object.preventExtensions()

```javascript
// Prevent extensions (can modify and delete, but cannot add)
const user = { name: "John", age: 25 };
Object.preventExtensions(user);

user.age = 30; // Works
delete user.name; // Works
user.city = "NYC"; // No effect (cannot add)

console.log(user); // { age: 30 }

// Check if object is extensible
console.log(Object.isExtensible(user)); // false
```

## Object.hasOwn() - Property Checking

`Object.hasOwn()` returns a boolean indicating whether the object has the specified property as its own property.

### Basic Syntax

```javascript
Object.hasOwn(object, property);
```

### Simple Examples

```javascript
const user = { name: "John", age: 25 };

// Check own properties
console.log(Object.hasOwn(user, "name")); // true
console.log(Object.hasOwn(user, "age")); // true
console.log(Object.hasOwn(user, "city")); // false

// Check inherited properties
const parent = { inherited: "from parent" };
const child = Object.create(parent);
child.own = "from child";

console.log(Object.hasOwn(child, "own")); // true
console.log(Object.hasOwn(child, "inherited")); // false

// Check array properties
const array = ["apple", "banana"];
console.log(Object.hasOwn(array, "0")); // true
console.log(Object.hasOwn(array, "length")); // true
console.log(Object.hasOwn(array, "2")); // false
```

### Object.hasOwn() vs in Operator

```javascript
const user = { name: "John", age: 25 };
const parent = { inherited: "from parent" };
const child = Object.create(parent);
child.own = "from child";

// Object.hasOwn() - only own properties
console.log(Object.hasOwn(child, "own")); // true
console.log(Object.hasOwn(child, "inherited")); // false

// in operator - own and inherited properties
console.log("own" in child); // true
console.log("inherited" in child); // true
```

## Object Methods with Arrays

### Converting Between Arrays and Objects

```javascript
// Array to object
const array = ["apple", "banana", "orange"];
const arrayObject = Object.fromEntries(
  array.map((item, index) => [index, item])
);
console.log(arrayObject); // { 0: 'apple', 1: 'banana', 2: 'orange' }

// Object to array
const object = { 0: "apple", 1: "banana", 2: "orange" };
const objectArray = Object.values(object);
console.log(objectArray); // ['apple', 'banana', 'orange']

// Object keys to array
const keysArray = Object.keys(object);
console.log(keysArray); // ['0', '1', '2']
```

### Array-like Objects

```javascript
// String as array-like object
const str = "hello";
const strEntries = Object.entries(str);
console.log(strEntries);
// [['0', 'h'], ['1', 'e'], ['2', 'l'], ['3', 'l'], ['4', 'o']]

// Arguments object
function processArgs() {
  const argsEntries = Object.entries(arguments);
  console.log(argsEntries);
}
processArgs("a", "b", "c");
// [['0', 'a'], ['1', 'b'], ['2', 'c']]
```

## Object Methods with TypeScript

### Type-Safe Object Operations

```typescript
// Define interfaces
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

const user: User = {
  id: 1,
  name: "John",
  email: "john@example.com",
  age: 25,
};

// Type-safe keys
const userKeys: (keyof User)[] = Object.keys(user) as (keyof User)[];
console.log(userKeys); // ['id', 'name', 'email', 'age']

// Type-safe values
const userValues: User[keyof User][] = Object.values(user);
console.log(userValues); // [1, 'John', 'john@example.com', 25]

// Type-safe entries
const userEntries: [keyof User, User[keyof User]][] = Object.entries(user) as [
  keyof User,
  User[keyof User],
][];
console.log(userEntries);
// [['id', 1], ['name', 'John'], ['email', 'john@example.com'], ['age', 25]]

// Transform with type safety
const userDisplay: UserDisplay = Object.fromEntries(
  Object.entries(user).map(([key, value]) => {
    if (key === "name") {
      return [key, `${value} (${user.email})`];
    }
    if (key === "age") {
      return ["isAdult", value >= 18];
    }
    return [key, value];
  })
) as UserDisplay;
```

### Generic Object Functions

```typescript
// Generic function to get object keys
function getKeys<T extends object>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[];
}

// Generic function to get object values
function getValues<T extends object>(obj: T): T[keyof T][] {
  return Object.values(obj);
}

// Generic function to get object entries
function getEntries<T extends object>(obj: T): [keyof T, T[keyof T]][] {
  return Object.entries(obj) as [keyof T, T[keyof T]][];
}

// Usage
const user = { id: 1, name: "John", age: 25 };
const keys = getKeys(user); // (keyof typeof user)[]
const values = getValues(user); // (typeof user[keyof typeof user])[]
const entries = getEntries(user); // [keyof typeof user, typeof user[keyof typeof user]][]
```

## Performance Considerations

### When to Use Each Method

```javascript
// ✅ Use Object.keys() when you need property names
const keys = Object.keys(user);

// ✅ Use Object.values() when you need property values
const values = Object.values(user);

// ✅ Use Object.entries() when you need both keys and values
const entries = Object.entries(user);

// ✅ Use Object.fromEntries() when creating objects from pairs
const obj = Object.fromEntries([["key", "value"]]);

// ✅ Use Object.assign() for merging objects
const merged = Object.assign({}, obj1, obj2);

// ✅ Use Object.hasOwn() for property checking
const hasProperty = Object.hasOwn(obj, "key");
```

### Performance Tips

```javascript
// ❌ Avoid repeated Object.keys() calls
const user = { name: "John", age: 25 };
for (let i = 0; i < 1000; i++) {
  const keys = Object.keys(user); // Called 1000 times
}

// ✅ Cache Object.keys() result
const user = { name: "John", age: 25 };
const keys = Object.keys(user); // Called once
for (let i = 0; i < 1000; i++) {
  // Use cached keys
}

// ❌ Avoid Object.entries() when you only need keys or values
const entries = Object.entries(user);
const keys = entries.map(([key]) => key); // Inefficient

// ✅ Use Object.keys() directly
const keys = Object.keys(user); // More efficient
```

## Common Patterns and Best Practices

### 1. Object Transformation

```javascript
// Transform object properties
const user = { firstName: "John", lastName: "Doe", age: 25 };

// Transform keys
const transformedKeys = Object.fromEntries(
  Object.entries(user).map(([key, value]) => [
    key.replace(/([A-Z])/g, "_$1").toLowerCase(),
    value,
  ])
);
console.log(transformedKeys);
// { first_name: 'John', last_name: 'Doe', age: 25 }

// Transform values
const transformedValues = Object.fromEntries(
  Object.entries(user).map(([key, value]) => [
    key,
    typeof value === "string" ? value.toUpperCase() : value,
  ])
);
console.log(transformedValues);
// { firstName: 'JOHN', lastName: 'DOE', age: 25 }
```

### 2. Object Filtering

```javascript
// Filter object properties
const user = { name: "John", age: 25, email: "john@example.com", city: "NYC" };

// Filter by key
const nameAndAge = Object.fromEntries(
  Object.entries(user).filter(([key]) => ["name", "age"].includes(key))
);
console.log(nameAndAge); // { name: 'John', age: 25 }

// Filter by value
const stringValues = Object.fromEntries(
  Object.entries(user).filter(([key, value]) => typeof value === "string")
);
console.log(stringValues);
// { name: 'John', email: 'john@example.com', city: 'NYC' }
```

### 3. Object Merging Patterns

```javascript
// Deep merge function
function deepMerge(target, source) {
  const result = { ...target };

  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      result[key] = deepMerge(result[key] || {}, value);
    } else {
      result[key] = value;
    }
  }

  return result;
}

// Usage
const defaultConfig = {
  theme: { mode: "light", colors: { primary: "blue" } },
  settings: { notifications: true },
};

const userConfig = {
  theme: { mode: "dark" },
  settings: { autoSave: true },
};

const mergedConfig = deepMerge(defaultConfig, userConfig);
console.log(mergedConfig);
// {
//   theme: { mode: 'dark', colors: { primary: 'blue' } },
//   settings: { notifications: true, autoSave: true }
// }
```

### 4. Object Validation

```javascript
// Validate object structure
function validateUser(user) {
  const requiredKeys = ["name", "email", "age"];
  const missingKeys = requiredKeys.filter((key) => !Object.hasOwn(user, key));

  if (missingKeys.length > 0) {
    throw new Error(`Missing required properties: ${missingKeys.join(", ")}`);
  }

  return true;
}

// Usage
const validUser = { name: "John", email: "john@example.com", age: 25 };
const invalidUser = { name: "John", age: 25 }; // Missing email

console.log(validateUser(validUser)); // true
// console.log(validateUser(invalidUser)); // Error: Missing required properties: email
```

## Real-World Examples

### 1. API Response Processing

```javascript
// Process API response
const apiResponse = {
  users: [
    { id: 1, name: "John", email: "john@example.com" },
    { id: 2, name: "Jane", email: "jane@example.com" },
  ],
  metadata: {
    total: 2,
    page: 1,
    limit: 10,
  },
};

// Extract user IDs
const userIds = Object.values(apiResponse.users).map((user) => user.id);
console.log(userIds); // [1, 2]

// Create user lookup by ID
const usersById = Object.fromEntries(
  Object.values(apiResponse.users).map((user) => [user.id, user])
);
console.log(usersById);
// {
//   1: { id: 1, name: 'John', email: 'john@example.com' },
//   2: { id: 2, name: 'Jane', email: 'jane@example.com' }
// }

// Get metadata keys
const metadataKeys = Object.keys(apiResponse.metadata);
console.log(metadataKeys); // ['total', 'page', 'limit']
```

### 2. Configuration Management

```javascript
// Application configuration
const defaultConfig = {
  theme: "light",
  language: "en",
  notifications: true,
  autoSave: false,
};

const userConfig = {
  theme: "dark",
  autoSave: true,
};

// Merge configurations
const finalConfig = Object.assign({}, defaultConfig, userConfig);
console.log(finalConfig);
// { theme: 'dark', language: 'en', notifications: true, autoSave: true }

// Validate configuration
const requiredConfigKeys = ["theme", "language"];
const missingKeys = requiredConfigKeys.filter(
  (key) => !Object.hasOwn(finalConfig, key)
);

if (missingKeys.length > 0) {
  console.error(`Missing required configuration: ${missingKeys.join(", ")}`);
}
```

### 3. Form Data Processing

```javascript
// Form data processing
const formData = new FormData();
formData.append("name", "John");
formData.append("email", "john@example.com");
formData.append("age", "25");

// Convert FormData to object
const formObject = Object.fromEntries(formData);
console.log(formObject);
// { name: 'John', email: 'john@example.com', age: '25' }

// Process form data with validation
const processedData = Object.fromEntries(
  Object.entries(formObject).map(([key, value]) => {
    if (key === "age") {
      const age = parseInt(value);
      if (isNaN(age) || age < 0) {
        throw new Error("Invalid age");
      }
      return [key, age];
    }
    if (key === "email" && !value.includes("@")) {
      throw new Error("Invalid email");
    }
    return [key, value];
  })
);

console.log(processedData);
// { name: 'John', email: 'john@example.com', age: 25 }
```

### 4. State Management

```javascript
// React-like state management
class StateManager {
  constructor(initialState = {}) {
    this.state = { ...initialState };
    this.listeners = [];
  }

  setState(updates) {
    const newState = Object.assign({}, this.state, updates);
    this.state = newState;
    this.notifyListeners();
  }

  getState() {
    return { ...this.state };
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  notifyListeners() {
    this.listeners.forEach((listener) => listener(this.state));
  }

  // Get state keys
  getStateKeys() {
    return Object.keys(this.state);
  }

  // Get state values
  getStateValues() {
    return Object.values(this.state);
  }

  // Get state entries
  getStateEntries() {
    return Object.entries(this.state);
  }
}

// Usage
const stateManager = new StateManager({
  user: { name: "John", age: 25 },
  theme: "light",
  notifications: true,
});

console.log(stateManager.getStateKeys()); // ['user', 'theme', 'notifications']
console.log(stateManager.getStateValues()); // [{ name: 'John', age: 25 }, 'light', true]
```

This comprehensive guide covers all essential Object methods with practical examples, performance considerations, and real-world use cases. The focus on `Object.keys()`, `Object.values()`, and `Object.entries()` will help you work with objects more effectively in your React Native focus app!
