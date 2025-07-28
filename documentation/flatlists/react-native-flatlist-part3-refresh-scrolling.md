# React Native FlatList Comprehensive Guide - Part 3: Pull-to-Refresh & Infinite Scrolling

## Table of Contents

1. [Pull-to-Refresh](#pull-to-refresh)
2. [Infinite Scrolling](#infinite-scrolling)
3. [Loading States](#loading-states)
4. [Data Management](#data-management)
5. [Error Handling](#error-handling)
6. [Advanced Scrolling Patterns](#advanced-scrolling-patterns)

## Pull-to-Refresh

### Basic Pull-to-Refresh

```javascript
import React, { useState, useCallback } from "react";
import { FlatList, RefreshControl, Text, View } from "react-native";

const PullToRefreshFlatList = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState([]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      // Simulate API call
      const newData = await fetchData();
      setData(newData);
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const renderItem = useCallback(
    ({ item }) => (
      <View style={styles.item}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>
    ),
    []
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#007AFF"]} // Android
          tintColor="#007AFF" // iOS
        />
      }
    />
  );
};
```

### Custom Refresh Control

```javascript
// Custom refresh indicator
const CustomRefreshControl = ({ refreshing, onRefresh }) => (
  <RefreshControl
    refreshing={refreshing}
    onRefresh={onRefresh}
    colors={["#007AFF", "#34C759", "#FF9500"]} // Multiple colors
    tintColor="#007AFF"
    title="Pull to refresh" // iOS only
    titleColor="#007AFF"
    progressBackgroundColor="#ffffff"
    size="large" // Android: 'default' | 'large'
  />
);

// Usage with custom refresh control
<FlatList
  data={data}
  renderItem={renderItem}
  keyExtractor={keyExtractor}
  refreshControl={
    <CustomRefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  }
/>;
```

### Advanced Pull-to-Refresh

```javascript
const AdvancedRefreshFlatList = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setRefreshCount((prev) => prev + 1);

    try {
      // Show refresh timestamp
      const now = new Date();
      setLastRefreshTime(now);

      // Simulate API call with delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const newData = await fetchData();
      setData(newData);

      // Show success message
      Alert.alert("Success", "Data refreshed successfully!");
    } catch (error) {
      // Show error message
      Alert.alert("Error", "Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  }, []);

  const renderHeader = useCallback(
    () => (
      <View style={styles.header}>
        <Text style={styles.headerText}>
          Last refreshed:{" "}
          {lastRefreshTime ? lastRefreshTime.toLocaleTimeString() : "Never"}
        </Text>
        <Text style={styles.headerText}>Refresh count: {refreshCount}</Text>
      </View>
    ),
    [lastRefreshTime, refreshCount]
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListHeaderComponent={renderHeader}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#007AFF"]}
          tintColor="#007AFF"
        />
      }
    />
  );
};
```

## Infinite Scrolling

### Basic Infinite Scrolling

```javascript
const InfiniteScrollFlatList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const loadMoreData = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    try {
      const newData = await fetchData(page);

      if (newData.length === 0) {
        setHasMore(false);
      } else {
        setData((prev) => [...prev, ...newData]);
        setPage((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Failed to load more data:", error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page]);

  const renderItem = useCallback(
    ({ item }) => (
      <View style={styles.item}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>
    ),
    []
  );

  const renderFooter = useCallback(() => {
    if (!loading) return null;

    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.footerText}>Loading more...</Text>
      </View>
    );
  }, [loading]);

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListFooterComponent={renderFooter}
      onEndReached={loadMoreData}
      onEndReachedThreshold={0.5}
    />
  );
};
```

### Optimized Infinite Scrolling

```javascript
const OptimizedInfiniteScroll = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Debounced load more function
  const loadMoreData = useCallback(
    debounce(async () => {
      if (isLoadingMore || !hasMore) return;

      setIsLoadingMore(true);

      try {
        const newData = await fetchData(page);

        if (newData.length === 0) {
          setHasMore(false);
        } else {
          setData((prev) => [...prev, ...newData]);
          setPage((prev) => prev + 1);
        }
      } catch (error) {
        console.error("Failed to load more data:", error);
      } finally {
        setIsLoadingMore(false);
      }
    }, 300),
    [isLoadingMore, hasMore, page]
  );

  // Initial data loading
  const loadInitialData = useCallback(async () => {
    setLoading(true);

    try {
      const initialData = await fetchData(1);
      setData(initialData);
      setPage(2);
      setHasMore(initialData.length > 0);
    } catch (error) {
      console.error("Failed to load initial data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load initial data on mount
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;

    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.footerText}>Loading more...</Text>
      </View>
    );
  }, [isLoadingMore]);

  if (loading) {
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
      ListFooterComponent={renderFooter}
      onEndReached={loadMoreData}
      onEndReachedThreshold={0.3}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
    />
  );
};
```

### Pagination with Cursor

```javascript
const CursorBasedPagination = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState(null);

  const loadMoreData = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    try {
      const response = await fetchData(cursor);

      if (response.data.length === 0) {
        setHasMore(false);
      } else {
        setData((prev) => [...prev, ...response.data]);
        setCursor(response.nextCursor);
      }
    } catch (error) {
      console.error("Failed to load more data:", error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, cursor]);

  const renderItem = useCallback(
    ({ item }) => (
      <View style={styles.item}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>
    ),
    []
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListFooterComponent={loading ? <LoadingFooter /> : null}
      onEndReached={loadMoreData}
      onEndReachedThreshold={0.5}
    />
  );
};
```

## Loading States

### Loading Components

```javascript
// Loading footer component
const LoadingFooter = () => (
  <View style={styles.footer}>
    <ActivityIndicator size="small" color="#007AFF" />
    <Text style={styles.footerText}>Loading more...</Text>
  </View>
);

// Loading header component
const LoadingHeader = () => (
  <View style={styles.header}>
    <ActivityIndicator size="small" color="#007AFF" />
    <Text style={styles.headerText}>Refreshing...</Text>
  </View>
);

// Empty state component
const EmptyState = ({ message, onRetry }) => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyText}>{message}</Text>
    {onRetry && (
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    )}
  </View>
);

// Error state component
const ErrorState = ({ error, onRetry }) => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorText}>Something went wrong</Text>
    <Text style={styles.errorSubtext}>{error}</Text>
    <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
      <Text style={styles.retryText}>Try Again</Text>
    </TouchableOpacity>
  </View>
);
```

### State Management

```javascript
const StatefulFlatList = () => {
  const [state, setState] = useState({
    data: [],
    loading: false,
    refreshing: false,
    loadingMore: false,
    error: null,
    hasMore: true,
    page: 1,
  });

  const updateState = useCallback((updates) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const loadData = useCallback(
    async (page = 1, isRefresh = false) => {
      if (isRefresh) {
        updateState({ refreshing: true, error: null });
      } else {
        updateState({ loading: true, error: null });
      }

      try {
        const newData = await fetchData(page);

        if (isRefresh) {
          updateState({
            data: newData,
            page: 2,
            hasMore: newData.length > 0,
            refreshing: false,
          });
        } else {
          updateState({
            data: newData,
            page: 2,
            hasMore: newData.length > 0,
            loading: false,
          });
        }
      } catch (error) {
        updateState({
          error: error.message,
          loading: false,
          refreshing: false,
        });
      }
    },
    [updateState]
  );

  const loadMore = useCallback(async () => {
    if (state.loadingMore || !state.hasMore) return;

    updateState({ loadingMore: true });

    try {
      const newData = await fetchData(state.page);

      if (newData.length === 0) {
        updateState({ hasMore: false, loadingMore: false });
      } else {
        updateState({
          data: [...state.data, ...newData],
          page: state.page + 1,
          loadingMore: false,
        });
      }
    } catch (error) {
      updateState({
        error: error.message,
        loadingMore: false,
      });
    }
  }, [state.loadingMore, state.hasMore, state.page, state.data, updateState]);

  const onRefresh = useCallback(() => {
    loadData(1, true);
  }, [loadData]);

  const onRetry = useCallback(() => {
    loadData(1, false);
  }, [loadData]);

  // Render based on state
  if (state.loading) {
    return <LoadingHeader />;
  }

  if (state.error) {
    return <ErrorState error={state.error} onRetry={onRetry} />;
  }

  return (
    <FlatList
      data={state.data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      refreshControl={
        <RefreshControl refreshing={state.refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={
        <EmptyState message="No data available" onRetry={onRetry} />
      }
      ListFooterComponent={state.loadingMore ? <LoadingFooter /> : null}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
    />
  );
};
```

## Data Management

### Data Fetching Patterns

```javascript
// Custom hook for data fetching
const useDataFetching = (initialPage = 1) => {
  const [state, setState] = useState({
    data: [],
    loading: false,
    refreshing: false,
    loadingMore: false,
    error: null,
    hasMore: true,
    page: initialPage,
  });

  const fetchData = useCallback(async (page, isRefresh = false) => {
    const loadingKey = isRefresh ? "refreshing" : "loading";
    const dataKey = isRefresh ? "data" : "data";

    setState((prev) => ({ ...prev, [loadingKey]: true, error: null }));

    try {
      const response = await api.fetchData(page);

      setState((prev) => ({
        ...prev,
        [dataKey]: isRefresh ? response.data : [...prev.data, ...response.data],
        page: page + 1,
        hasMore: response.data.length > 0,
        [loadingKey]: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error.message,
        [loadingKey]: false,
      }));
    }
  }, []);

  const refresh = useCallback(() => {
    fetchData(1, true);
  }, [fetchData]);

  const loadMore = useCallback(() => {
    if (!state.loadingMore && state.hasMore) {
      fetchData(state.page, false);
    }
  }, [fetchData, state.loadingMore, state.hasMore, state.page]);

  return {
    ...state,
    refresh,
    loadMore,
  };
};

// Usage in component
const DataFetchingFlatList = () => {
  const {
    data,
    loading,
    refreshing,
    loadingMore,
    error,
    hasMore,
    refresh,
    loadMore,
  } = useDataFetching();

  const renderItem = useCallback(
    ({ item }) => (
      <View style={styles.item}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>
    ),
    []
  );

  if (loading) {
    return <LoadingHeader />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={refresh} />;
  }

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} />
      }
      ListEmptyComponent={
        <EmptyState message="No data available" onRetry={refresh} />
      }
      ListFooterComponent={loadingMore ? <LoadingFooter /> : null}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
    />
  );
};
```

### Optimistic Updates

```javascript
const OptimisticFlatList = () => {
  const [data, setData] = useState([]);
  const [pendingUpdates, setPendingUpdates] = useState(new Map());

  const updateItem = useCallback(async (id, updates) => {
    // Optimistic update
    setData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );

    // Track pending update
    setPendingUpdates((prev) => new Map(prev.set(id, updates)));

    try {
      // API call
      await api.updateItem(id, updates);

      // Remove from pending updates
      setPendingUpdates((prev) => {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      });
    } catch (error) {
      // Revert on error
      setData((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
      );

      setPendingUpdates((prev) => {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      });

      Alert.alert("Error", "Failed to update item");
    }
  }, []);

  const renderItem = useCallback(
    ({ item }) => (
      <View
        style={[styles.item, pendingUpdates.has(item.id) && styles.pendingItem]}
      >
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
        {pendingUpdates.has(item.id) && (
          <ActivityIndicator size="small" color="#007AFF" />
        )}
      </View>
    ),
    [pendingUpdates]
  );

  return (
    <FlatList data={data} renderItem={renderItem} keyExtractor={keyExtractor} />
  );
};
```

## Error Handling

### Comprehensive Error Handling

```javascript
const ErrorHandlingFlatList = () => {
  const [state, setState] = useState({
    data: [],
    loading: false,
    error: null,
    retryCount: 0,
  });

  const loadData = useCallback(async (isRetry = false) => {
    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
      retryCount: isRetry ? prev.retryCount + 1 : prev.retryCount,
    }));

    try {
      const data = await api.fetchData();
      setState((prev) => ({
        ...prev,
        data,
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error.message,
        loading: false,
      }));
    }
  }, []);

  const handleRetry = useCallback(() => {
    loadData(true);
  }, [loadData]);

  const handleError = useCallback((error) => {
    console.error("FlatList error:", error);
    // Log to analytics, show user-friendly message, etc.
  }, []);

  const renderError = useCallback(
    ({ error }) => (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    ),
    [handleRetry]
  );

  return (
    <FlatList
      data={state.data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListEmptyComponent={
        state.error ? (
          <ErrorState error={state.error} onRetry={handleRetry} />
        ) : (
          <EmptyState message="No data available" />
        )
      }
      onError={handleError}
    />
  );
};
```

## Advanced Scrolling Patterns

### Scroll to Top

```javascript
const ScrollToTopFlatList = () => {
  const flatListRef = useRef(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  const handleScroll = useCallback((event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowScrollToTop(offsetY > 1000);
  }, []);

  const scrollToTop = useCallback(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />

      {showScrollToTop && (
        <TouchableOpacity
          style={styles.scrollToTopButton}
          onPress={scrollToTop}
        >
          <Text style={styles.scrollToTopText}>↑</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
```

### Scroll to Item

```javascript
const ScrollToItemFlatList = () => {
  const flatListRef = useRef(null);

  const scrollToItem = useCallback((index) => {
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
      viewPosition: 0.5, // Center the item
    });
  }, []);

  const scrollToItemWithOffset = useCallback((index, offset = 0) => {
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
      viewOffset: offset,
    });
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.controls}>
        <TouchableOpacity onPress={() => scrollToItem(10)}>
          <Text>Scroll to Item 10</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => scrollToItemWithOffset(20, 50)}>
          <Text>Scroll to Item 20 with offset</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onScrollToIndexFailed={(info) => {
          console.warn("Scroll to index failed:", info);
        }}
      />
    </View>
  );
};
```

This Part 3 covers advanced data management and user interaction patterns for FlatList. In the next parts, we'll cover:

- **Part 4**: Section lists, headers, footers, and complex layouts
- **Part 5**: Animations, gestures, and interactive features
- **Part 6**: Real-world examples and best practices

Would you like me to continue with Part 4?
