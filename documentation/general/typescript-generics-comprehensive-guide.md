# TypeScript Generics Comprehensive Guide

## Table of Contents

1. [Introduction to Generics](#introduction-to-generics)
2. [Basic Generic Syntax](#basic-generic-syntax)
3. [Generic Functions](#generic-functions)
4. [Generic Interfaces](#generic-interfaces)
5. [Generic Classes](#generic-classes)
6. [Generic Constraints](#generic-constraints)
7. [Advanced Generic Patterns](#advanced-generic-patterns)
8. [TypeScript Records](#typescript-records)
9. [Real-World Examples](#real-world-examples)
10. [Common Pitfalls](#common-pitfalls)
11. [Best Practices](#best-practices)

## Introduction to Generics

Generics are a way to write flexible, reusable code that can work with different types while maintaining type safety. They allow you to create functions, classes, and interfaces that can work with any type you specify.

### Why Use Generics?

- **Type Safety**: Catch type errors at compile time
- **Code Reusability**: Write once, use with many types
- **Flexibility**: Work with any type without losing type information
- **Performance**: No runtime type checking overhead

### Basic Concept

Think of generics as "type parameters" - they're like function parameters, but for types.

```typescript
// Without generics - limited to specific types
function returnString(value: string): string {
  return value;
}

function returnNumber(value: number): number {
  return value;
}

// With generics - works with any type
function returnValue<T>(value: T): T {
  return value;
}

// Usage
const stringResult = returnValue<string>("hello"); // Type: string
const numberResult = returnValue<number>(42); // Type: number
const booleanResult = returnValue<boolean>(true); // Type: boolean
```

## Basic Generic Syntax

### Generic Type Parameters

```typescript
// Single type parameter
function identity<T>(arg: T): T {
  return arg;
}

// Multiple type parameters
function pair<T, U>(first: T, second: U): [T, U] {
  return [first, second];
}

// Type parameter with default
function createArray<T = string>(length: number, value: T): T[] {
  return Array(length).fill(value);
}

// Usage examples
const result1 = identity<string>("hello"); // Explicit type
const result2 = identity("hello"); // Type inference
const result3 = pair<string, number>("age", 25); // Multiple types
const result4 = createArray(3, "default"); // Default type
const result5 = createArray<number>(3, 0); // Override default
```

### Type Inference

TypeScript can often infer the generic type from usage:

```typescript
// TypeScript infers the type automatically
const inferredString = identity("hello"); // Type: string
const inferredNumber = identity(42); // Type: number
const inferredBoolean = identity(true); // Type: boolean

// Sometimes you need to be explicit
const explicitString = identity<string>("hello"); // Explicit type
```

## Generic Functions

### Simple Generic Function

```typescript
// Generic function that returns the same type it receives
function echo<T>(value: T): T {
  return value;
}

// Usage
const stringEcho = echo("hello"); // Type: string
const numberEcho = echo(42); // Type: number
const arrayEcho = echo([1, 2, 3]); // Type: number[]
```

### Generic Function with Multiple Parameters

```typescript
// Function that combines two values of the same type
function combine<T>(a: T, b: T): T[] {
  return [a, b];
}

// Function that works with different types
function merge<T, U>(obj1: T, obj2: U): T & U {
  return { ...obj1, ...obj2 };
}

// Usage
const combined = combine("hello", "world"); // Type: string[]
const merged = merge({ name: "John" }, { age: 25 }); // Type: { name: string } & { age: number }
```

### Generic Array Functions

```typescript
// Generic function to get the first element of an array
function first<T>(array: T[]): T | undefined {
  return array[0];
}

// Generic function to get the last element of an array
function last<T>(array: T[]): T | undefined {
  return array[array.length - 1];
}

// Generic function to reverse an array
function reverse<T>(array: T[]): T[] {
  return [...array].reverse();
}

// Generic function to filter an array
function filter<T>(array: T[], predicate: (item: T) => boolean): T[] {
  return array.filter(predicate);
}

// Usage
const numbers = [1, 2, 3, 4, 5];
const strings = ["hello", "world", "typescript"];

const firstNumber = first(numbers); // Type: number | undefined
const lastString = last(strings); // Type: string | undefined
const reversedNumbers = reverse(numbers); // Type: number[]
const filteredNumbers = filter(numbers, (n) => n > 2); // Type: number[]
```

### Generic Utility Functions

```typescript
// Generic function to create a key-value pair
function makePair<K, V>(key: K, value: V): [K, V] {
  return [key, value];
}

// Generic function to swap two values
function swap<T, U>(a: T, b: U): [U, T] {
  return [b, a];
}

// Generic function to create an object from key-value pairs
function fromPairs<K extends string, V>(pairs: [K, V][]): Record<K, V> {
  return pairs.reduce(
    (obj, [key, value]) => {
      obj[key] = value;
      return obj;
    },
    {} as Record<K, V>
  );
}

// Usage
const pair = makePair("name", "John"); // Type: [string, string]
const swapped = swap("hello", 42); // Type: [number, string]
const obj = fromPairs([
  ["name", "John"],
  ["age", 25],
]); // Type: Record<string, string | number>
```

## Generic Interfaces

### Basic Generic Interface

```typescript
// Generic interface for a key-value store
interface KeyValueStore<K, V> {
  get(key: K): V | undefined;
  set(key: K, value: V): void;
  has(key: K): boolean;
  delete(key: K): boolean;
  clear(): void;
}

// Implementation
class SimpleKeyValueStore<K, V> implements KeyValueStore<K, V> {
  private store = new Map<K, V>();

  get(key: K): V | undefined {
    return this.store.get(key);
  }

  set(key: K, value: V): void {
    this.store.set(key, value);
  }

  has(key: K): boolean {
    return this.store.has(key);
  }

  delete(key: K): boolean {
    return this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

// Usage
const stringStore = new SimpleKeyValueStore<string, string>();
stringStore.set("name", "John");
stringStore.set("email", "john@example.com");

const numberStore = new SimpleKeyValueStore<string, number>();
numberStore.set("age", 25);
numberStore.set("score", 100);
```

### Generic Interface with Constraints

```typescript
// Interface for objects that can be compared
interface Comparable<T> {
  compareTo(other: T): number; // Returns -1, 0, or 1
}

// Generic interface for a sorted collection
interface SortedCollection<T extends Comparable<T>> {
  add(item: T): void;
  remove(item: T): boolean;
  contains(item: T): boolean;
  toArray(): T[];
}

// Example implementation
class NumberComparable implements Comparable<NumberComparable> {
  constructor(public value: number) {}

  compareTo(other: NumberComparable): number {
    return this.value - other.value;
  }
}

class SortedArray<T extends Comparable<T>> implements SortedCollection<T> {
  private items: T[] = [];

  add(item: T): void {
    this.items.push(item);
    this.items.sort((a, b) => a.compareTo(b));
  }

  remove(item: T): boolean {
    const index = this.items.findIndex((i) => i.compareTo(item) === 0);
    if (index !== -1) {
      this.items.splice(index, 1);
      return true;
    }
    return false;
  }

  contains(item: T): boolean {
    return this.items.some((i) => i.compareTo(item) === 0);
  }

  toArray(): T[] {
    return [...this.items];
  }
}

// Usage
const sortedNumbers = new SortedArray<NumberComparable>();
sortedNumbers.add(new NumberComparable(5));
sortedNumbers.add(new NumberComparable(2));
sortedNumbers.add(new NumberComparable(8));

console.log(sortedNumbers.toArray().map((n) => n.value)); // [2, 5, 8]
```

### Generic Interface for API Responses

```typescript
// Generic interface for API responses
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  success: boolean;
}

// Generic interface for paginated responses
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Usage
interface User {
  id: number;
  name: string;
  email: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  authorId: number;
}

// Type-safe API responses
const userResponse: ApiResponse<User> = {
  data: { id: 1, name: "John", email: "john@example.com" },
  status: 200,
  message: "User retrieved successfully",
  success: true,
};

const postsResponse: PaginatedResponse<Post> = {
  data: [
    { id: 1, title: "First Post", content: "Hello world", authorId: 1 },
    { id: 2, title: "Second Post", content: "Another post", authorId: 1 },
  ],
  total: 2,
  page: 1,
  limit: 10,
  hasNext: false,
  hasPrev: false,
};
```

## Generic Classes

### Basic Generic Class

```typescript
// Generic class for a simple container
class Container<T> {
  private value: T;

  constructor(value: T) {
    this.value = value;
  }

  getValue(): T {
    return this.value;
  }

  setValue(value: T): void {
    this.value = value;
  }

  // Method that returns a new container with transformed value
  map<U>(transform: (value: T) => U): Container<U> {
    return new Container(transform(this.value));
  }
}

// Usage
const stringContainer = new Container<string>("hello");
const numberContainer = new Container<number>(42);

const transformed = stringContainer.map((str) => str.length); // Container<number>
```

### Generic Stack Class

```typescript
// Generic stack implementation
class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }

  clear(): void {
    this.items = [];
  }

  toArray(): T[] {
    return [...this.items];
  }
}

// Usage
const numberStack = new Stack<number>();
numberStack.push(1);
numberStack.push(2);
numberStack.push(3);

console.log(numberStack.pop()); // 3
console.log(numberStack.peek()); // 2
console.log(numberStack.size()); // 2

const stringStack = new Stack<string>();
stringStack.push("hello");
stringStack.push("world");
```

### Generic Queue Class

```typescript
// Generic queue implementation
class Queue<T> {
  private items: T[] = [];

  enqueue(item: T): void {
    this.items.push(item);
  }

  dequeue(): T | undefined {
    return this.items.shift();
  }

  front(): T | undefined {
    return this.items[0];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }

  clear(): void {
    this.items = [];
  }

  toArray(): T[] {
    return [...this.items];
  }
}

// Usage
const taskQueue = new Queue<string>();
taskQueue.enqueue("Task 1");
taskQueue.enqueue("Task 2");
taskQueue.enqueue("Task 3");

console.log(taskQueue.dequeue()); // "Task 1"
console.log(taskQueue.front()); // "Task 2"
```

### Generic Binary Tree Class

```typescript
// Generic binary tree node
class TreeNode<T> {
  constructor(
    public value: T,
    public left: TreeNode<T> | null = null,
    public right: TreeNode<T> | null = null
  ) {}
}

// Generic binary tree
class BinaryTree<T> {
  private root: TreeNode<T> | null = null;

  insert(value: T): void {
    this.root = this.insertNode(this.root, value);
  }

  private insertNode(node: TreeNode<T> | null, value: T): TreeNode<T> {
    if (node === null) {
      return new TreeNode(value);
    }

    if (value < node.value) {
      node.left = this.insertNode(node.left, value);
    } else if (value > node.value) {
      node.right = this.insertNode(node.right, value);
    }

    return node;
  }

  search(value: T): boolean {
    return this.searchNode(this.root, value);
  }

  private searchNode(node: TreeNode<T> | null, value: T): boolean {
    if (node === null) {
      return false;
    }

    if (value === node.value) {
      return true;
    }

    if (value < node.value) {
      return this.searchNode(node.left, value);
    } else {
      return this.searchNode(node.right, value);
    }
  }

  inOrderTraversal(): T[] {
    const result: T[] = [];
    this.inOrder(this.root, result);
    return result;
  }

  private inOrder(node: TreeNode<T> | null, result: T[]): void {
    if (node !== null) {
      this.inOrder(node.left, result);
      result.push(node.value);
      this.inOrder(node.right, result);
    }
  }
}

// Usage
const numberTree = new BinaryTree<number>();
numberTree.insert(5);
numberTree.insert(3);
numberTree.insert(7);
numberTree.insert(1);
numberTree.insert(9);

console.log(numberTree.inOrderTraversal()); // [1, 3, 5, 7, 9]
console.log(numberTree.search(3)); // true
console.log(numberTree.search(10)); // false
```

## Generic Constraints

### Basic Constraints

```typescript
// Constraint: T must have a length property
function getLength<T extends { length: number }>(item: T): number {
  return item.length;
}

// Usage
console.log(getLength("hello")); // 5
console.log(getLength([1, 2, 3])); // 3
console.log(getLength({ length: 10 })); // 10
// console.log(getLength(42));       // Error: number doesn't have length property
```

### Multiple Constraints

```typescript
// Constraint: T must be both a string and have a length property
function processString<T extends string>(str: T): T {
  return str.toUpperCase() as T;
}

// Constraint: T must have both id and name properties
interface Identifiable {
  id: number;
}

interface Named {
  name: string;
}

function processItem<T extends Identifiable & Named>(item: T): string {
  return `${item.id}: ${item.name}`;
}

// Usage
interface User extends Identifiable, Named {
  email: string;
}

const user: User = { id: 1, name: "John", email: "john@example.com" };
console.log(processItem(user)); // "1: John"
```

### Constraint with Default Type

```typescript
// Generic with constraint and default type
function createArray<T extends string | number = string>(
  length: number,
  value: T
): T[] {
  return Array(length).fill(value);
}

// Usage
const stringArray = createArray(3, "hello"); // string[]
const numberArray = createArray<number>(3, 42); // number[]
```

### Constraint with Keyof

```typescript
// Function that gets a property from an object
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

// Usage
interface Person {
  name: string;
  age: number;
  email: string;
}

const person: Person = {
  name: "John",
  age: 25,
  email: "john@example.com",
};

const name = getProperty(person, "name"); // string
const age = getProperty(person, "age"); // number
const email = getProperty(person, "email"); // string
// const invalid = getProperty(person, "invalid"); // Error: "invalid" is not a key of Person
```

## Advanced Generic Patterns

### Conditional Types

```typescript
// Conditional type: if T is a string, return string, otherwise return never
type StringOnly<T> = T extends string ? string : never;

// Conditional type: extract the type of array elements
type ArrayElement<T> = T extends (infer U)[] ? U : never;

// Conditional type: extract the return type of a function
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

// Usage
type StringResult = StringOnly<string>; // string
type NeverResult = StringOnly<number>; // never
type NumberArray = ArrayElement<number[]>; // number
type StringArray = ArrayElement<string[]>; // string
type FunctionReturn = ReturnType<() => string>; // string
```

### Mapped Types

```typescript
// Make all properties optional
type Partial<T> = {
  [P in keyof T]?: T[P];
};

// Make all properties required
type Required<T> = {
  [P in keyof T]-?: T[P];
};

// Make all properties readonly
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

// Pick specific properties
type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// Omit specific properties
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// Usage
interface User {
  id: number;
  name: string;
  email: string;
}

type PartialUser = Partial<User>; // All properties optional
type RequiredUser = Required<User>; // All properties required
type ReadonlyUser = Readonly<User>; // All properties readonly
type UserName = Pick<User, "name">; // Only name property
type UserWithoutId = Omit<User, "id">; // All properties except id
```

### Utility Types

```typescript
// Record: create an object type with specific keys and values
type Record<K extends keyof any, T> = {
  [P in K]: T;
};

// Exclude: exclude types from a union
type Exclude<T, U> = T extends U ? never : T;

// Extract: extract types from a union
type Extract<T, U> = T extends U ? T : never;

// NonNullable: remove null and undefined
type NonNullable<T> = T extends null | undefined ? never : T;

// Usage
type StringRecord = Record<string, string>; // { [key: string]: string }
type NumberRecord = Record<"a" | "b" | "c", number>; // { a: number, b: number, c: number }

type StringOrNumber = string | number;
type OnlyString = Exclude<StringOrNumber, number>; // string
type OnlyNumber = Extract<StringOrNumber, number>; // number

type MaybeString = string | null | undefined;
type DefiniteString = NonNullable<MaybeString>; // string
```

## TypeScript Records

Records are a powerful TypeScript utility type that creates object types with specific key-value pairs. They're often used with generics to create type-safe object structures.

### Basic Record Syntax

```typescript
// Record<K, V> creates an object type where:
// K = the type of the keys
// V = the type of the values

// Basic string key record
type StringRecord = Record<string, string>;
const userNames: StringRecord = {
  user1: "John",
  user2: "Jane",
  user3: "Bob",
};

// Number key record
type NumberRecord = Record<number, string>;
const statusCodes: NumberRecord = {
  200: "OK",
  404: "Not Found",
  500: "Internal Server Error",
};

// Union type keys
type StatusRecord = Record<"success" | "error" | "loading", string>;
const statusMessages: StatusRecord = {
  success: "Operation completed successfully",
  error: "An error occurred",
  loading: "Please wait...",
};
```

### Record with Complex Values

```typescript
// Record with object values
interface User {
  id: number;
  name: string;
  email: string;
}

type UserRecord = Record<string, User>;
const users: UserRecord = {
  user1: { id: 1, name: "John", email: "john@example.com" },
  user2: { id: 2, name: "Jane", email: "jane@example.com" },
};

// Record with function values
type HandlerRecord = Record<string, (data: any) => void>;
const eventHandlers: HandlerRecord = {
  click: (data) => console.log("Clicked:", data),
  hover: (data) => console.log("Hovered:", data),
  submit: (data) => console.log("Submitted:", data),
};

// Record with union type values
type ConfigRecord = Record<string, string | number | boolean>;
const config: ConfigRecord = {
  apiUrl: "https://api.example.com",
  timeout: 5000,
  debug: true,
  maxRetries: 3,
};
```

### Record with Generics

```typescript
// Generic record type
type GenericRecord<K extends keyof any, V> = Record<K, V>;

// Usage with different types
type StringMap = GenericRecord<string, string>;
type NumberMap = GenericRecord<string, number>;
type BooleanMap = GenericRecord<string, boolean>;

// Generic function that works with records
function mergeRecords<K extends keyof any, V>(
  record1: Record<K, V>,
  record2: Record<K, V>
): Record<K, V> {
  return { ...record1, ...record2 };
}

// Usage
const map1: StringMap = { a: "apple", b: "banana" };
const map2: StringMap = { c: "cherry", d: "date" };
const merged = mergeRecords(map1, map2); // { a: "apple", b: "banana", c: "cherry", d: "date" }
```

### Record Constraints and Validation

```typescript
// Record with constrained keys
type ValidKeys = "name" | "email" | "age";
type UserData = Record<ValidKeys, string | number>;

const userData: UserData = {
  name: "John",
  email: "john@example.com",
  age: 25,
  // age: "25" // This would also be valid since age can be string | number
};

// Record with required and optional properties
type RequiredKeys = "id" | "name";
type OptionalKeys = "email" | "phone";

type UserRecord = Record<RequiredKeys, string> &
  Partial<Record<OptionalKeys, string>>;

const user: UserRecord = {
  id: "1",
  name: "John",
  email: "john@example.com", // Optional
  // phone is optional, so we can omit it
};
```

### Record with Nested Structures

```typescript
// Nested record structure
type NestedRecord = Record<string, Record<string, number>>;

const scores: NestedRecord = {
  math: {
    algebra: 85,
    geometry: 92,
    calculus: 78,
  },
  science: {
    physics: 88,
    chemistry: 91,
    biology: 87,
  },
};

// Record with array values
type ArrayRecord = Record<string, string[]>;

const categories: ArrayRecord = {
  fruits: ["apple", "banana", "orange"],
  vegetables: ["carrot", "broccoli", "spinach"],
  colors: ["red", "blue", "green"],
};

// Record with union type arrays
type MixedArrayRecord = Record<string, (string | number)[]>;

const mixedData: MixedArrayRecord = {
  user1: ["John", 25, "developer"],
  user2: ["Jane", 30, "designer"],
  user3: ["Bob", 28, "manager"],
};
```

### Record Utility Functions

```typescript
// Function to create a record from an array
function createRecord<T, K extends keyof any>(
  items: T[],
  keyExtractor: (item: T) => K,
  valueExtractor: (item: T) => any
): Record<K, any> {
  return items.reduce(
    (record, item) => {
      const key = keyExtractor(item);
      const value = valueExtractor(item);
      record[key] = value;
      return record;
    },
    {} as Record<K, any>
  );
}

// Function to transform record values
function mapRecord<K extends keyof any, V, U>(
  record: Record<K, V>,
  transform: (value: V, key: K) => U
): Record<K, U> {
  const result = {} as Record<K, U>;
  for (const key in record) {
    result[key] = transform(record[key], key);
  }
  return result;
}

// Function to filter record entries
function filterRecord<K extends keyof any, V>(
  record: Record<K, V>,
  predicate: (value: V, key: K) => boolean
): Partial<Record<K, V>> {
  const result = {} as Partial<Record<K, V>>;
  return result;
}

// Usage examples
const users = [
  { id: 1, name: "John", age: 25 },
  { id: 2, name: "Jane", age: 30 },
  { id: 3, name: "Bob", age: 28 },
];

// Create record with id as key and name as value
const nameRecord = createRecord(
  users,
  (user) => user.id,
  (user) => user.name
);
// Result: { 1: "John", 2: "Jane", 3: "Bob" }

// Transform record values
const ageRecord = createRecord(
  users,
  (user) => user.id,
  (user) => user.age
);

const doubledAges = mapRecord(ageRecord, (age) => age * 2);
// Result: { 1: 50, 2: 60, 3: 56 }

// Filter record entries
const adultsOnly = filterRecord(ageRecord, (age) => age >= 18);
// Result: { 1: 25, 2: 30, 3: 28 } (all are adults in this case)
```

### Record with Conditional Types

```typescript
// Conditional record based on a flag
type ConditionalRecord<T extends boolean> = T extends true
  ? Record<string, string>
  : Record<string, number>;

// Usage
type StringRecord = ConditionalRecord<true>; // Record<string, string>
type NumberRecord = ConditionalRecord<false>; // Record<string, number>

// Record with mapped types
type MappedRecord<T> = Record<keyof T, string>;

interface User {
  id: number;
  name: string;
  email: string;
}

type UserStringRecord = MappedRecord<User>;
// Result: { id: string, name: string, email: string }

// Record with transformed keys
type TransformedRecord<T> = Record<`${keyof T & string}_id`, string>;

type UserWithIds = TransformedRecord<User>;
// Result: { id_id: string, name_id: string, email_id: string }
```

### Record Best Practices

```typescript
// ✅ Good: Use specific key types when possible
type UserRoles = Record<"admin" | "user" | "guest", string[]>;

// ❌ Avoid: Too generic when you know the specific keys
type GenericRoles = Record<string, string[]>;

// ✅ Good: Use union types for flexible but controlled keys
type StatusRecord = Record<"success" | "error" | "loading", string>;

// ✅ Good: Combine with other utility types
type OptionalUserRecord = Partial<Record<"name" | "email" | "phone", string>>;

// ✅ Good: Use for configuration objects
type AppConfig = Record<string, string | number | boolean>;

// ✅ Good: Use for API response mappings
type ApiEndpoints = Record<
  string,
  {
    method: "GET" | "POST" | "PUT" | "DELETE";
    url: string;
    requiresAuth: boolean;
  }
>;
```

### Record vs Object Types

```typescript
// Record approach - flexible keys
type StringRecord = Record<string, string>;

// Interface approach - specific keys
interface StringObject {
  [key: string]: string;
}

// Both are equivalent, but Record is more explicit about the generic nature

// Record with specific keys
type SpecificRecord = Record<"name" | "email" | "phone", string>;

// Interface with specific keys
interface SpecificObject {
  name: string;
  email: string;
  phone: string;
}

// The interface approach is better for known, specific properties
// The Record approach is better for dynamic, computed properties
```

## Real-World Examples

### Generic API Client

```typescript
// Generic API client
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`);
    const data = await response.json();
    return {
      data,
      status: response.status,
      message: response.statusText,
    };
  }

  async post<T, U>(endpoint: string, body: T): Promise<ApiResponse<U>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return {
      data,
      status: response.status,
      message: response.statusText,
    };
  }
}

// Usage
interface User {
  id: number;
  name: string;
  email: string;
}

interface CreateUserRequest {
  name: string;
  email: string;
}

const apiClient = new ApiClient("https://api.example.com");

// Type-safe API calls
const getUser = async (id: number): Promise<ApiResponse<User>> => {
  return apiClient.get<User>(`/users/${id}`);
};

const createUser = async (
  userData: CreateUserRequest
): Promise<ApiResponse<User>> => {
  return apiClient.post<CreateUserRequest, User>("/users", userData);
};
```

### Generic State Management

```typescript
// Generic state manager
class StateManager<T> {
  private state: T;
  private listeners: ((state: T) => void)[] = [];

  constructor(initialState: T) {
    this.state = initialState;
  }

  getState(): T {
    return this.state;
  }

  setState(newState: T): void {
    this.state = newState;
    this.notifyListeners();
  }

  updateState(updater: (state: T) => T): void {
    this.state = updater(this.state);
    this.notifyListeners();
  }

  subscribe(listener: (state: T) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.state));
  }
}

// Usage
interface AppState {
  user: string | null;
  theme: "light" | "dark";
  count: number;
}

const initialState: AppState = {
  user: null,
  theme: "light",
  count: 0,
};

const stateManager = new StateManager<AppState>(initialState);

// Subscribe to state changes
const unsubscribe = stateManager.subscribe((state) => {
  console.log("State changed:", state);
});

// Update state
stateManager.setState({
  user: "John",
  theme: "dark",
  count: 1,
});

// Update specific part of state
stateManager.updateState((state) => ({
  ...state,
  count: state.count + 1,
}));

unsubscribe();
```

### Generic React Components

```typescript
import React, { useState, useEffect } from 'react';

// Generic interface for items with id
interface Identifiable {
  id: string | number;
}

// Generic list component
interface ListProps<T extends Identifiable> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  onItemClick?: (item: T) => void;
  loading?: boolean;
  error?: string;
}

function List<T extends Identifiable>({
  items,
  renderItem,
  onItemClick,
  loading = false,
  error,
}: ListProps<T>) {
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      {items.map((item, index) => (
        <div key={item.id} onClick={() => onItemClick?.(item)}>
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
}

// Generic data fetching hook
function useData<T>(
  fetchFn: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchFn();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, dependencies);

  return { data, loading, error };
}

// Usage
interface User {
  id: number;
  name: string;
  email: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
}

// User list component
const UserList: React.FC = () => {
  const { data: users, loading, error } = useData<User[]>(
    () => fetch('/api/users').then(res => res.json()),
    []
  );

  if (!users) return null;

  return (
    <List
      items={users}
      renderItem={(user) => (
        <div>
          <h3>{user.name}</h3>
          <p>{user.email}</p>
        </div>
      )}
      onItemClick={(user) => console.log('Clicked user:', user)}
      loading={loading}
      error={error}
    />
  );
};

// Post list component
const PostList: React.FC = () => {
  const { data: posts, loading, error } = useData<Post[]>(
    () => fetch('/api/posts').then(res => res.json()),
    []
  );

  if (!posts) return null;

  return (
    <List
      items={posts}
      renderItem={(post) => (
        <div>
          <h3>{post.title}</h3>
          <p>{post.content}</p>
        </div>
      )}
      onItemClick={(post) => console.log('Clicked post:', post)}
      loading={loading}
      error={error}
    />
  );
};
```

## Common Pitfalls

### 1. Over-constraining Generics

```typescript
// ❌ Bad: Too restrictive
function processArray<T extends string[]>(arr: T): T {
  return arr.map((item) => item.toUpperCase()) as T;
}

// ✅ Good: More flexible
function processArray<T extends string>(arr: T[]): T[] {
  return arr.map((item) => item.toUpperCase() as T);
}
```

### 2. Forgetting Type Inference

```typescript
// ❌ Bad: Unnecessary explicit typing
const result = identity<string>("hello");

// ✅ Good: Let TypeScript infer the type
const result = identity("hello");
```

### 3. Incorrect Constraint Usage

```typescript
// ❌ Bad: Constraint doesn't match usage
function getLength<T extends { length: number }>(item: T): number {
  return item.length;
}

// This works, but the constraint is too broad
const result = getLength({ length: 10, other: "property" });

// ✅ Good: More specific constraint
function getLength<T extends string | any[]>(item: T): number {
  return item.length;
}
```

### 4. Generic Type Parameter Naming

```typescript
// ❌ Bad: Unclear type parameter names
function process<T, U, V>(a: T, b: U): V {
  // ...
}

// ✅ Good: Descriptive type parameter names
function process<Input, Output, Config>(input: Input, config: Config): Output {
  // ...
}
```

## Best Practices

### 1. Use Descriptive Type Parameter Names

```typescript
// Good: Clear and descriptive
function map<T, U>(array: T[], transform: (item: T) => U): U[] {
  return array.map(transform);
}

// Better: Even more descriptive
function map<Input, Output>(
  array: Input[],
  transform: (item: Input) => Output
): Output[] {
  return array.map(transform);
}
```

### 2. Leverage Type Inference

```typescript
// Let TypeScript infer types when possible
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map((n) => n * 2); // TypeScript infers number[]

// Only use explicit types when necessary
const explicitNumbers: number[] = [1, 2, 3, 4, 5];
```

### 3. Use Constraints Appropriately

```typescript
// Use constraints to ensure type safety
function compare<T extends { id: number }>(a: T, b: T): number {
  return a.id - b.id;
}

// Use multiple constraints when needed
function processItem<T extends { id: number } & { name: string }>(
  item: T
): string {
  return `${item.id}: ${item.name}`;
}
```

### 4. Combine Generics with Other TypeScript Features

```typescript
// Combine with union types
function processValue<T extends string | number>(value: T): T {
  if (typeof value === "string") {
    return value.toUpperCase() as T;
  } else {
    return (value * 2) as T;
  }
}

// Combine with conditional types
type Result<T> = T extends string ? string : T extends number ? number : never;

// Combine with mapped types
type Optional<T> = {
  [K in keyof T]?: T[K];
};
```

This comprehensive guide covers TypeScript generics from basic concepts to advanced patterns, with practical examples and real-world use cases. Each section includes detailed explanations and best practices to help you master this fundamental TypeScript feature.
