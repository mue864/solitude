# React Native FlatList Comprehensive Guide - Part 6: Real-World Examples & Best Practices

## Table of Contents

1. [Real-World Examples](#real-world-examples)
2. [Best Practices](#best-practices)
3. [Common Patterns](#common-patterns)
4. [Performance Optimization](#performance-optimization)
5. [Debugging & Troubleshooting](#debugging--troubleshooting)
6. [Advanced Patterns](#advanced-patterns)

## Real-World Examples

### Social Media Feed

```javascript
import React, { useState, useCallback, useRef } from "react";
import {
  FlatList,
  View,
  Text,
  Image,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";

const SocialFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const flatListRef = useRef(null);

  const fetchPosts = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/posts?page=${pageNum}`);
      const data = await response.json();

      if (pageNum === 1) {
        setPosts(data.posts);
      } else {
        setPosts((prev) => [...prev, ...data.posts]);
      }

      setHasMore(data.hasMore);
      setPage(pageNum);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPosts(1);
    setRefreshing(false);
  }, [fetchPosts]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchPosts(page + 1);
    }
  }, [loading, hasMore, page, fetchPosts]);

  const renderPost = useCallback(
    ({ item }) => (
      <View style={styles.postContainer}>
        {/* Post Header */}
        <View style={styles.postHeader}>
          <Image source={{ uri: item.author.avatar }} style={styles.avatar} />
          <View style={styles.postInfo}>
            <Text style={styles.authorName}>{item.author.name}</Text>
            <Text style={styles.postTime}>{item.createdAt}</Text>
          </View>
          <TouchableOpacity style={styles.moreButton}>
            <Text>⋮</Text>
          </TouchableOpacity>
        </View>

        {/* Post Content */}
        <Text style={styles.postText}>{item.content}</Text>

        {item.image && (
          <Image source={{ uri: item.image }} style={styles.postImage} />
        )}

        {/* Post Actions */}
        <View style={styles.postActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Text>❤️ {item.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text>💬 {item.comments}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text>📤 Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    ),
    []
  );

  const renderFooter = useCallback(() => {
    if (!loading) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.loadingText}>Loading more posts...</Text>
      </View>
    );
  }, [loading]);

  const renderHeader = useCallback(
    () => (
      <View style={styles.feedHeader}>
        <Text style={styles.feedTitle}>Your Feed</Text>
        <Text style={styles.feedSubtitle}>
          Latest updates from your network
        </Text>
      </View>
    ),
    []
  );

  return (
    <FlatList
      ref={flatListRef}
      data={posts}
      renderItem={renderPost}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={renderFooter}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={5}
      getItemLayout={(data, index) => ({
        length: 300, // Approximate item height
        offset: 300 * index,
        index,
      })}
    />
  );
};

const styles = StyleSheet.create({
  postContainer: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  postInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  postTime: {
    fontSize: 12,
    color: "#666",
  },
  moreButton: {
    padding: 8,
  },
  postText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  feedHeader: {
    padding: 16,
    backgroundColor: "#f8f9fa",
  },
  feedTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  feedSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  loadingFooter: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    color: "#666",
  },
});
```

### E-commerce Product List

```javascript
const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;

    // Apply filter
    if (filter !== "all") {
      filtered = products.filter((product) => product.category === filter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price":
          return a.price - b.price;
        case "rating":
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, filter, sortBy]);

  const renderProduct = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={[
          styles.productContainer,
          viewMode === "grid" && styles.productGrid,
        ]}
        onPress={() => navigation.navigate("ProductDetail", { product: item })}
      >
        <Image source={{ uri: item.image }} style={styles.productImage} />
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.productPrice}>${item.price}</Text>
          <View style={styles.productRating}>
            <Text>⭐ {item.rating}</Text>
            <Text style={styles.productReviews}>
              ({item.reviewCount} reviews)
            </Text>
          </View>
          <TouchableOpacity style={styles.addToCartButton}>
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    ),
    [viewMode, navigation]
  );

  const renderHeader = useCallback(
    () => (
      <View style={styles.header}>
        <View style={styles.filters}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {["all", "electronics", "clothing", "books"].map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.filterButton,
                  filter === category && styles.activeFilter,
                ]}
                onPress={() => setFilter(category)}
              >
                <Text
                  style={[
                    styles.filterText,
                    filter === category && styles.activeFilterText,
                  ]}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.controls}>
          <Picker
            selectedValue={sortBy}
            onValueChange={setSortBy}
            style={styles.sortPicker}
          >
            <Picker.Item label="Sort by Name" value="name" />
            <Picker.Item label="Sort by Price" value="price" />
            <Picker.Item label="Sort by Rating" value="rating" />
          </Picker>

          <TouchableOpacity
            style={styles.viewModeButton}
            onPress={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
          >
            <Text>{viewMode === "grid" ? "📋" : "🔲"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    ),
    [filter, sortBy, viewMode]
  );

  return (
    <FlatList
      data={filteredAndSortedProducts}
      renderItem={renderProduct}
      keyExtractor={(item) => item.id}
      numColumns={viewMode === "grid" ? 2 : 1}
      ListHeaderComponent={renderHeader}
      columnWrapperStyle={viewMode === "grid" ? styles.gridRow : undefined}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
    />
  );
};
```

### Chat Interface

```javascript
const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef(null);

  const sendMessage = useCallback(() => {
    if (inputText.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        text: inputText,
        sender: "user",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, newMessage]);
      setInputText("");

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [inputText]);

  const renderMessage = useCallback(
    ({ item }) => (
      <View
        style={[
          styles.messageContainer,
          item.sender === "user" ? styles.userMessage : styles.otherMessage,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            item.sender === "user" ? styles.userBubble : styles.otherBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              item.sender === "user" ? styles.userText : styles.otherText,
            ]}
          >
            {item.text}
          </Text>
          <Text style={styles.messageTime}>
            {new Date(item.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </View>
    ),
    []
  );

  const renderHeader = useCallback(
    () => (
      <View style={styles.chatHeader}>
        <Text style={styles.chatTitle}>Chat with Support</Text>
        <Text style={styles.chatSubtitle}>
          We typically reply within 24 hours
        </Text>
      </View>
    ),
    []
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        inverted={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={20}
        windowSize={20}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          multiline
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={sendMessage}
          disabled={!inputText.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
```

## Best Practices

### 1. Performance Optimization

```javascript
// ✅ Good: Memoized components and callbacks
const OptimizedFlatList = () => {
  const renderItem = useCallback(
    ({ item }) => <MemoizedItemComponent item={item} />,
    []
  );

  const keyExtractor = useCallback((item) => item.id, []);

  const getItemLayout = useCallback(
    (data, index) => ({
      length: 80,
      offset: 80 * index,
      index,
    }),
    []
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={5}
    />
  );
};

// ✅ Good: Memoized item component
const MemoizedItemComponent = React.memo(({ item }) => (
  <View style={styles.item}>
    <Text>{item.title}</Text>
  </View>
));
```

### 2. Error Handling

```javascript
const RobustFlatList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/data");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const renderError = useCallback(
    () => (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load data</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    ),
    [fetchData]
  );

  const renderEmpty = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No items found</Text>
      </View>
    ),
    []
  );

  if (loading && data.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListEmptyComponent={error ? renderError : renderEmpty}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={fetchData} />
      }
    />
  );
};
```

### 3. Accessibility

```javascript
const AccessibleFlatList = () => {
  const renderItem = useCallback(
    ({ item, index }) => (
      <TouchableOpacity
        style={styles.item}
        onPress={() => handleItemPress(item)}
        accessible={true}
        accessibilityLabel={`${item.title}, ${item.description}`}
        accessibilityHint="Double tap to open details"
        accessibilityRole="button"
        accessibilityState={{ selected: item.selected }}
      >
        <View style={styles.itemContent}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemDescription}>{item.description}</Text>
        </View>
      </TouchableOpacity>
    ),
    [handleItemPress]
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      accessibilityLabel="List of items"
      accessibilityHint="Scroll to view more items"
    />
  );
};
```

## Common Patterns

### 1. Search and Filter

```javascript
const SearchableFlatList = () => {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filter === "all" || item.category === filter;
      return matchesSearch && matchesFilter;
    });
  }, [data, searchQuery, filter]);

  const renderHeader = useCallback(
    () => (
      <View style={styles.searchHeader}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search items..."
          clearButtonMode="while-editing"
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {["all", "category1", "category2", "category3"].map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.filterChip, filter === cat && styles.activeChip]}
              onPress={() => setFilter(cat)}
            >
              <Text
                style={[
                  styles.chipText,
                  filter === cat && styles.activeChipText,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    ),
    [searchQuery, filter]
  );

  return (
    <FlatList
      data={filteredData}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListHeaderComponent={renderHeader}
    />
  );
};
```

### 2. Multi-Select Pattern

```javascript
const MultiSelectFlatList = () => {
  const [data, setData] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());

  const toggleSelection = useCallback((itemId) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  const renderItem = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={[styles.item, selectedItems.has(item.id) && styles.selectedItem]}
        onPress={() => toggleSelection(item.id)}
        onLongPress={() => toggleSelection(item.id)}
      >
        <View style={styles.itemContent}>
          <View
            style={[
              styles.checkbox,
              selectedItems.has(item.id) && styles.checkedBox,
            ]}
          >
            {selectedItems.has(item.id) && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </View>
          <Text style={styles.itemTitle}>{item.title}</Text>
        </View>
      </TouchableOpacity>
    ),
    [selectedItems, toggleSelection]
  );

  const renderHeader = useCallback(
    () => (
      <View style={styles.selectionHeader}>
        <Text style={styles.selectionText}>
          {selectedItems.size} items selected
        </Text>
        {selectedItems.size > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSelectedItems(new Set())}
          >
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>
    ),
    [selectedItems]
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListHeaderComponent={renderHeader}
    />
  );
};
```

## Performance Optimization

### 1. Virtualization Best Practices

```javascript
const OptimizedFlatList = () => {
  // ✅ Use getItemLayout for fixed height items
  const getItemLayout = useCallback(
    (data, index) => ({
      length: 80, // Fixed item height
      offset: 80 * index,
      index,
    }),
    []
  );

  // ✅ Optimize render batch size
  const renderItem = useCallback(
    ({ item }) => <MemoizedItem item={item} />,
    []
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={5}
      updateCellsBatchingPeriod={50}
      disableVirtualization={false}
    />
  );
};
```

### 2. Memory Management

```javascript
const MemoryOptimizedFlatList = () => {
  const [data, setData] = useState([]);
  const animatedValues = useRef(new Map()).current;

  // Cleanup animated values when component unmounts
  useEffect(() => {
    return () => {
      animatedValues.clear();
    };
  }, [animatedValues]);

  // Use WeakMap for better memory management
  const itemRefs = useRef(new WeakMap()).current;

  const renderItem = useCallback(
    ({ item }) => {
      // Store refs in WeakMap for automatic cleanup
      if (!itemRefs.has(item)) {
        itemRefs.set(item, React.createRef());
      }

      return <MemoizedItem ref={itemRefs.get(item)} item={item} />;
    },
    [itemRefs]
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      removeClippedSubviews={true}
      maxToRenderPerBatch={5}
      windowSize={5}
    />
  );
};
```

## Debugging & Troubleshooting

### 1. Common Issues and Solutions

```javascript
// ❌ Problem: Items not re-rendering
const ProblematicFlatList = () => {
  const [data, setData] = useState([]);

  // ❌ Bad: Creating new function on every render
  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text>{item.title}</Text>
    </View>
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem} // This causes re-renders
      keyExtractor={(item) => item.id}
    />
  );
};

// ✅ Solution: Memoize renderItem
const FixedFlatList = () => {
  const [data, setData] = useState([]);

  // ✅ Good: Memoized function
  const renderItem = useCallback(
    ({ item }) => (
      <View style={styles.item}>
        <Text>{item.title}</Text>
      </View>
    ),
    []
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
    />
  );
};
```

### 2. Performance Monitoring

```javascript
const MonitoredFlatList = () => {
  const [renderCount, setRenderCount] = useState(0);
  const [scrollPerformance, setScrollPerformance] = useState([]);

  const onScroll = useCallback((event) => {
    const { contentOffset, velocity } = event.nativeEvent;

    // Monitor scroll performance
    setScrollPerformance((prev) => [
      ...prev.slice(-10), // Keep last 10 measurements
      { timestamp: Date.now(), velocity: velocity.y },
    ]);
  }, []);

  const renderItem = useCallback(
    ({ item, index }) => {
      // Count renders for debugging
      setRenderCount((prev) => prev + 1);

      return (
        <View style={styles.item}>
          <Text>{item.title}</Text>
          <Text style={styles.debugText}>Render #{renderCount}</Text>
        </View>
      );
    },
    [renderCount]
  );

  return (
    <View style={styles.container}>
      <View style={styles.debugPanel}>
        <Text>Total Renders: {renderCount}</Text>
        <Text>
          Scroll Velocity:{" "}
          {scrollPerformance[scrollPerformance.length - 1]?.velocity || 0}
        </Text>
      </View>

      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onScroll={onScroll}
        scrollEventThrottle={16}
      />
    </View>
  );
};
```

## Advanced Patterns

### 1. Infinite Scroll with Cursor Pagination

```javascript
const InfiniteScrollFlatList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState(null);

  const fetchData = useCallback(async (nextCursor = null) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/data?cursor=${nextCursor || ""}`);
      const result = await response.json();

      if (nextCursor) {
        setData((prev) => [...prev, ...result.items]);
      } else {
        setData(result.items);
      }

      setCursor(result.nextCursor);
      setHasMore(!!result.nextCursor);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (!loading && hasMore && cursor) {
      fetchData(cursor);
    }
  }, [loading, hasMore, cursor, fetchData]);

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        loading ? <ActivityIndicator size="small" color="#007AFF" /> : null
      }
    />
  );
};
```

### 2. Real-time Updates

```javascript
const RealTimeFlatList = () => {
  const [data, setData] = useState([]);
  const flatListRef = useRef(null);

  useEffect(() => {
    // WebSocket connection for real-time updates
    const ws = new WebSocket('ws://your-api.com/updates');

    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);

      setData(prev => {
        const newData = [...prev];
        const index = newData.findIndex(item => item.id === update.id);

        if (index !== -1) {
          newData[index] = { ...newData[index], ...update };
        } else {
          newData.unshift(update);
        }

        return newData;
      });
    });

    return () => ws.close();
  }, []);

  const renderItem = useCallback(({ item, index }) => (
    <Animated.View
      style={{
        transform: [
          {
            translateY: new Animated.Value(index === 0 ? -50 : 0),
          },
        ],
      }}
    >
      <View style={styles.item}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemTime}>
          {new Date(item.timestamp).toLocaleTimeString()}
        </Text>
      </View>
    </Animated.View>
  ), []);

  return (
    <FlatList
      ref={flatListRef}
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      inverted={true} // Show newest items at top
    />
  );
};
```

This completes the comprehensive FlatList guide! You now have a complete understanding of:

- **Basic to Advanced Usage** (Parts 1-3)
- **Layout Patterns** (Part 4)
- **Animations & Interactions** (Part 5)
- **Real-world Implementation** (Part 6)

The guide covers everything from basic rendering to complex real-time applications with performance optimization and best practices.
