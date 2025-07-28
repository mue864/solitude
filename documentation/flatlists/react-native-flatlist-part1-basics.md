# React Native FlatList Comprehensive Guide - Part 1: Basics

## Table of Contents

1. [Introduction to FlatList](#introduction-to-flatlist)
2. [Basic FlatList Implementation](#basic-flatlist-implementation)
3. [Essential Props](#essential-props)
4. [Data and Key Extraction](#data-and-key-extraction)
5. [Rendering Items](#rendering-items)
6. [Basic Styling](#basic-styling)

## Introduction to FlatList

FlatList is React Native's optimized list component for displaying scrollable lists. It's designed for performance and memory efficiency, especially with large datasets.

### Why Use FlatList?

- **Performance**: Only renders visible items
- **Memory Efficient**: Recycles components
- **Built-in Features**: Pull-to-refresh, loading states, separators
- **Customizable**: Highly configurable for different use cases
- **TypeScript Support**: Full type safety

### FlatList vs ScrollView

```javascript
// ❌ ScrollView - renders all items at once
<ScrollView>
  {items.map(item => <Item key={item.id} data={item} />)}
</ScrollView>

// ✅ FlatList - renders only visible items
<FlatList
  data={items}
  renderItem={({ item }) => <Item data={item} />}
  keyExtractor={item => item.id}
/>
```

## Basic FlatList Implementation

### Simple Example

```javascript
import React from "react";
import { FlatList, Text, View } from "react-native";

const BasicFlatList = () => {
  // Sample data
  const data = [
    { id: "1", name: "John", age: 25 },
    { id: "2", name: "Jane", age: 30 },
    { id: "3", name: "Bob", age: 28 },
    { id: "4", name: "Alice", age: 22 },
    { id: "5", name: "Charlie", age: 35 },
  ];

  // Render individual item
  const renderItem = ({ item }) => (
    <View
      style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: "#eee" }}
    >
      <Text style={{ fontSize: 16, fontWeight: "bold" }}>{item.name}</Text>
      <Text style={{ fontSize: 14, color: "#666" }}>Age: {item.age}</Text>
    </View>
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
    />
  );
};

export default BasicFlatList;
```

### TypeScript Version

```typescript
import React from 'react';
import { FlatList, Text, View } from 'react-native';

interface User {
  id: string;
  name: string;
  age: number;
}

interface RenderItemProps {
  item: User;
  index: number;
}

const BasicFlatList: React.FC = () => {
  const data: User[] = [
    { id: '1', name: 'John', age: 25 },
    { id: '2', name: 'Jane', age: 30 },
    { id: '3', name: 'Bob', age: 28 },
    { id: '4', name: 'Alice', age: 22 },
    { id: '5', name: 'Charlie', age: 35 },
  ];

  const renderItem: React.FC<RenderItemProps> = ({ item }) => (
    <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.name}</Text>
      <Text style={{ fontSize: 14, color: '#666' }}>Age: {item.age}</Text>
    </View>
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item: User) => item.id}
    />
  );
};

export default BasicFlatList;
```

## Essential Props

### Required Props

```javascript
// data: Array of items to render
const data = [
  { id: "1", title: "Item 1" },
  { id: "2", title: "Item 2" },
  // ...
];

// renderItem: Function that renders each item
const renderItem = ({ item, index, separators }) => (
  <View>
    <Text>{item.title}</Text>
  </View>
);

// keyExtractor: Function to extract unique key for each item
const keyExtractor = (item, index) => item.id || index.toString();

<FlatList data={data} renderItem={renderItem} keyExtractor={keyExtractor} />;
```

### Common Props

```javascript
<FlatList
  data={data}
  renderItem={renderItem}
  keyExtractor={keyExtractor}
  // Styling
  style={{ flex: 1 }}
  contentContainerStyle={{ padding: 16 }}
  // Performance
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={10}
  // Scrolling
  showsVerticalScrollIndicator={false}
  showsHorizontalScrollIndicator={false}
  // Interaction
  onEndReached={loadMoreData}
  onRefresh={refreshData}
  refreshing={isRefreshing}
  // Layout
  numColumns={1}
  horizontal={false}
/>
```

## Data and Key Extraction

### Data Structure

```javascript
// Simple array of strings
const simpleData = ["Item 1", "Item 2", "Item 3"];

// Array of objects with unique IDs
const objectData = [
  { id: "1", name: "John", email: "john@example.com" },
  { id: "2", name: "Jane", email: "jane@example.com" },
  { id: "3", name: "Bob", email: "bob@example.com" },
];

// Array of objects without unique IDs
const dataWithoutIds = [
  { name: "John", age: 25 },
  { name: "Jane", age: 30 },
  { name: "Bob", age: 28 },
];
```

### Key Extraction Strategies

```javascript
// 1. Using unique ID field
const keyExtractorById = (item) => item.id;

// 2. Using index (not recommended for dynamic lists)
const keyExtractorByIndex = (item, index) => index.toString();

// 3. Using multiple fields
const keyExtractorByFields = (item) => `${item.name}-${item.age}`;

// 4. Using timestamp or UUID
const keyExtractorByTimestamp = (item) =>
  item.timestamp || Date.now().toString();

// 5. Fallback strategy
const keyExtractorWithFallback = (item, index) => {
  if (item.id) return item.id;
  if (item.key) return item.key;
  return index.toString();
};
```

### TypeScript Key Extraction

```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

interface Task {
  title: string;
  description: string;
  timestamp: number;
}

// Type-safe key extractors
const userKeyExtractor = (item: User): string => item.id;

const taskKeyExtractor = (item: Task): string => item.timestamp.toString();

// Generic key extractor
const genericKeyExtractor = <T extends { id?: string; key?: string }>(
  item: T,
  index: number
): string => {
  if (item.id) return item.id;
  if (item.key) return item.key;
  return index.toString();
};
```

## Rendering Items

### Basic Item Rendering

```javascript
const renderItem = ({ item, index, separators }) => (
  <View style={styles.item}>
    <Text style={styles.title}>{item.title}</Text>
    <Text style={styles.subtitle}>{item.subtitle}</Text>
  </View>
);

// Using destructuring for cleaner code
const renderItem = ({ item }) => (
  <View style={styles.item}>
    <Text style={styles.title}>{item.title}</Text>
    <Text style={styles.subtitle}>{item.subtitle}</Text>
  </View>
);
```

### Conditional Rendering

```javascript
const renderItem = ({ item }) => {
  // Conditional rendering based on item type
  if (item.type === "header") {
    return (
      <View style={styles.headerItem}>
        <Text style={styles.headerText}>{item.title}</Text>
      </View>
    );
  }

  if (item.type === "separator") {
    return <View style={styles.separator} />;
  }

  // Default item rendering
  return (
    <View style={styles.regularItem}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.subtitle}>{item.subtitle}</Text>
    </View>
  );
};
```

### Interactive Items

```javascript
import { TouchableOpacity } from "react-native";

const renderItem = ({ item }) => (
  <TouchableOpacity
    style={styles.item}
    onPress={() => handleItemPress(item)}
    onLongPress={() => handleItemLongPress(item)}
  >
    <Text style={styles.title}>{item.title}</Text>
    <Text style={styles.subtitle}>{item.subtitle}</Text>
  </TouchableOpacity>
);

const handleItemPress = (item) => {
  console.log("Item pressed:", item);
  // Navigate to detail screen, show modal, etc.
};

const handleItemLongPress = (item) => {
  console.log("Item long pressed:", item);
  // Show context menu, delete confirmation, etc.
};
```

### Complex Item Components

```javascript
const TaskItem = ({ item, onToggle, onDelete }) => (
  <View style={styles.taskItem}>
    <TouchableOpacity style={styles.checkbox} onPress={() => onToggle(item.id)}>
      <Text style={styles.checkboxText}>{item.completed ? "✓" : "○"}</Text>
    </TouchableOpacity>

    <View style={styles.taskContent}>
      <Text style={[styles.taskTitle, item.completed && styles.completedText]}>
        {item.title}
      </Text>
      <Text style={styles.taskDescription}>{item.description}</Text>
    </View>

    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() => onDelete(item.id)}
    >
      <Text style={styles.deleteText}>×</Text>
    </TouchableOpacity>
  </View>
);

const renderItem = ({ item }) => (
  <TaskItem
    item={item}
    onToggle={handleToggleTask}
    onDelete={handleDeleteTask}
  />
);
```

## Basic Styling

### Container Styling

```javascript
<FlatList
  data={data}
  renderItem={renderItem}
  keyExtractor={keyExtractor}
  // Main container style
  style={{
    flex: 1,
    backgroundColor: "#f5f5f5",
  }}
  // Content container style
  contentContainerStyle={{
    padding: 16,
    paddingBottom: 100, // Extra space for bottom content
  }}
  // Item separator
  ItemSeparatorComponent={() => (
    <View style={{ height: 1, backgroundColor: "#e0e0e0" }} />
  )}
/>
```

### Item Styling

```javascript
const styles = StyleSheet.create({
  item: {
    backgroundColor: "white",
    padding: 16,
    marginVertical: 4,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  completedText: {
    textDecorationLine: "line-through",
    color: "#999",
  },
});

const renderItem = ({ item }) => (
  <View style={styles.item}>
    <Text style={styles.title}>{item.title}</Text>
    <Text style={styles.subtitle}>{item.subtitle}</Text>
  </View>
);
```

### Responsive Styling

```javascript
import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  contentContainer: {
    padding: width > 768 ? 24 : 16, // Responsive padding
  },
  item: {
    backgroundColor: "white",
    padding: width > 768 ? 20 : 16,
    marginHorizontal: width > 768 ? 24 : 16,
    marginVertical: 4,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
```

This Part 1 covers the essential basics of FlatList. In the next parts, we'll cover:

- **Part 2**: Performance optimization, virtualization, and advanced rendering
- **Part 3**: Pull-to-refresh, infinite scrolling, and loading states
- **Part 4**: Section lists, headers, footers, and complex layouts
- **Part 5**: Animations, gestures, and interactive features
- **Part 6**: Real-world examples and best practices

Would you like me to continue with Part 2?
