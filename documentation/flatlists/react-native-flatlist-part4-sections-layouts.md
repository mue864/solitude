# React Native FlatList Comprehensive Guide - Part 4: Sections, Headers & Complex Layouts

## Table of Contents

1. [Section Lists](#section-lists)
2. [Headers and Footers](#headers-and-footers)
3. [Complex Layouts](#complex-layouts)
4. [Multi-Column Layouts](#multi-column-layouts)
5. [Sticky Headers](#sticky-headers)
6. [Advanced Rendering Patterns](#advanced-rendering-patterns)

## Section Lists

### Basic Section List

```javascript
import React from "react";
import { FlatList, Text, View, StyleSheet } from "react-native";

const SectionFlatList = () => {
  const sections = [
    {
      title: "Fruits",
      data: [
        { id: "1", name: "Apple", category: "fruits" },
        { id: "2", name: "Banana", category: "fruits" },
        { id: "3", name: "Orange", category: "fruits" },
      ],
    },
    {
      title: "Vegetables",
      data: [
        { id: "4", name: "Carrot", category: "vegetables" },
        { id: "5", name: "Broccoli", category: "vegetables" },
        { id: "6", name: "Spinach", category: "vegetables" },
      ],
    },
    {
      title: "Grains",
      data: [
        { id: "7", name: "Rice", category: "grains" },
        { id: "8", name: "Wheat", category: "grains" },
        { id: "9", name: "Oats", category: "grains" },
      ],
    },
  ];

  const renderSectionHeader = ({ section }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.itemText}>{item.name}</Text>
    </View>
  );

  return (
    <FlatList
      data={sections}
      renderItem={({ item: section }) => (
        <View>
          {renderSectionHeader({ section })}
          {section.data.map((item) => (
            <View key={item.id}>{renderItem({ item })}</View>
          ))}
        </View>
      )}
      keyExtractor={(item, index) => `section-${index}`}
    />
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    backgroundColor: "#f0f0f0",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  itemText: {
    fontSize: 16,
    color: "#333",
  },
});
```

### SectionList Component

```javascript
import { SectionList } from "react-native";

const SectionListExample = () => {
  const sections = [
    {
      title: "Today",
      data: [
        { id: "1", title: "Morning Task", time: "9:00 AM" },
        { id: "2", title: "Afternoon Task", time: "2:00 PM" },
      ],
    },
    {
      title: "Tomorrow",
      data: [
        { id: "3", title: "Future Task 1", time: "10:00 AM" },
        { id: "4", title: "Future Task 2", time: "3:00 PM" },
      ],
    },
    {
      title: "This Week",
      data: [
        { id: "5", title: "Weekly Task 1", time: "Friday" },
        { id: "6", title: "Weekly Task 2", time: "Saturday" },
      ],
    },
  ];

  const renderSectionHeader = ({ section: { title } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.itemTitle}>{item.title}</Text>
      <Text style={styles.itemTime}>{item.time}</Text>
    </View>
  );

  return (
    <SectionList
      sections={sections}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      keyExtractor={(item) => item.id}
      stickySectionHeadersEnabled={true}
    />
  );
};
```

### Dynamic Section List

```javascript
const DynamicSectionList = () => {
  const [sections, setSections] = useState([]);

  const groupDataByCategory = useCallback((data) => {
    const grouped = data.reduce((acc, item) => {
      const category = item.category || "Other";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {});

    return Object.keys(grouped).map((category) => ({
      title: category,
      data: grouped[category],
    }));
  }, []);

  const loadData = useCallback(async () => {
    try {
      const data = await fetchData();
      const groupedSections = groupDataByCategory(data);
      setSections(groupedSections);
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  }, [groupDataByCategory]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const renderSectionHeader = useCallback(
    ({ section }) => (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <Text style={styles.sectionCount}>{section.data.length} items</Text>
      </View>
    ),
    []
  );

  const renderItem = useCallback(
    ({ item }) => (
      <View style={styles.item}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemSubtitle}>{item.description}</Text>
      </View>
    ),
    []
  );

  return (
    <SectionList
      sections={sections}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      keyExtractor={(item) => item.id}
      stickySectionHeadersEnabled={true}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={loadData} />
      }
    />
  );
};
```

## Headers and Footers

### List Header Component

```javascript
const ListHeaderComponent = ({ title, subtitle, onAction }) => (
  <View style={styles.header}>
    <View style={styles.headerContent}>
      <Text style={styles.headerTitle}>{title}</Text>
      <Text style={styles.headerSubtitle}>{subtitle}</Text>
    </View>
    {onAction && (
      <TouchableOpacity style={styles.headerAction} onPress={onAction}>
        <Text style={styles.headerActionText}>View All</Text>
      </TouchableOpacity>
    )}
  </View>
);

// Usage
<FlatList
  data={data}
  renderItem={renderItem}
  keyExtractor={keyExtractor}
  ListHeaderComponent={
    <ListHeaderComponent
      title="Recent Tasks"
      subtitle="Your latest activities"
      onAction={() => navigation.navigate("AllTasks")}
    />
  }
/>;
```

### List Footer Component

```javascript
const ListFooterComponent = ({ loading, hasMore, onLoadMore }) => (
  <View style={styles.footer}>
    {loading ? (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.loadingText}>Loading more...</Text>
      </View>
    ) : hasMore ? (
      <TouchableOpacity style={styles.loadMoreButton} onPress={onLoadMore}>
        <Text style={styles.loadMoreText}>Load More</Text>
      </TouchableOpacity>
    ) : (
      <Text style={styles.endText}>No more items</Text>
    )}
  </View>
);

// Usage
<FlatList
  data={data}
  renderItem={renderItem}
  keyExtractor={keyExtractor}
  ListFooterComponent={
    <ListFooterComponent
      loading={loading}
      hasMore={hasMore}
      onLoadMore={loadMoreData}
    />
  }
  onEndReached={loadMoreData}
  onEndReachedThreshold={0.5}
/>;
```

### Complex Header with Search

```javascript
const SearchableHeader = ({ searchQuery, onSearchChange, onFilter }) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <View style={styles.searchHeader}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search tasks..."
          value={searchQuery}
          onChangeText={onSearchChange}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => onSearchChange("")}
          >
            <Text style={styles.clearButtonText}>×</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => onFilter("all")}
        >
          <Text style={styles.filterText}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => onFilter("completed")}
        >
          <Text style={styles.filterText}>Completed</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => onFilter("pending")}
        >
          <Text style={styles.filterText}>Pending</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Usage
<FlatList
  data={filteredData}
  renderItem={renderItem}
  keyExtractor={keyExtractor}
  ListHeaderComponent={
    <SearchableHeader
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onFilter={setFilter}
    />
  }
/>;
```

## Complex Layouts

### Grid Layout

```javascript
const GridFlatList = () => {
  const numColumns = 2;

  const renderItem = useCallback(
    ({ item, index }) => (
      <View
        style={[
          styles.gridItem,
          index % numColumns === 0 && styles.gridItemLeft,
          index % numColumns === 1 && styles.gridItemRight,
        ]}
      >
        <Image source={{ uri: item.image }} style={styles.gridImage} />
        <Text style={styles.gridTitle}>{item.title}</Text>
        <Text style={styles.gridSubtitle}>{item.subtitle}</Text>
      </View>
    ),
    []
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={numColumns}
      columnWrapperStyle={styles.gridRow}
    />
  );
};

const styles = StyleSheet.create({
  gridRow: {
    justifyContent: "space-between",
  },
  gridItem: {
    flex: 1,
    margin: 8,
    padding: 16,
    backgroundColor: "white",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  gridItemLeft: {
    marginRight: 4,
  },
  gridItemRight: {
    marginLeft: 4,
  },
  gridImage: {
    width: "100%",
    height: 120,
    borderRadius: 4,
  },
  gridTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 8,
  },
  gridSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
});
```

### Masonry Layout

```javascript
const MasonryFlatList = () => {
  const [leftColumn, setLeftColumn] = useState([]);
  const [rightColumn, setRightColumn] = useState([]);

  useEffect(() => {
    const left = [];
    const right = [];

    data.forEach((item, index) => {
      if (index % 2 === 0) {
        left.push(item);
      } else {
        right.push(item);
      }
    });

    setLeftColumn(left);
    setRightColumn(right);
  }, [data]);

  const renderLeftItem = useCallback(
    ({ item }) => (
      <View style={styles.masonryItem}>
        <Image source={{ uri: item.image }} style={styles.masonryImage} />
        <Text style={styles.masonryTitle}>{item.title}</Text>
      </View>
    ),
    []
  );

  const renderRightItem = useCallback(
    ({ item }) => (
      <View style={styles.masonryItem}>
        <Image source={{ uri: item.image }} style={styles.masonryImage} />
        <Text style={styles.masonryTitle}>{item.title}</Text>
      </View>
    ),
    []
  );

  return (
    <View style={styles.masonryContainer}>
      <FlatList
        data={leftColumn}
        renderItem={renderLeftItem}
        keyExtractor={keyExtractor}
        style={styles.masonryColumn}
        showsVerticalScrollIndicator={false}
      />
      <FlatList
        data={rightColumn}
        renderItem={renderRightItem}
        keyExtractor={keyExtractor}
        style={styles.masonryColumn}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  masonryContainer: {
    flexDirection: "row",
    flex: 1,
  },
  masonryColumn: {
    flex: 1,
    paddingHorizontal: 8,
  },
  masonryItem: {
    marginVertical: 4,
    backgroundColor: "white",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  masonryImage: {
    width: "100%",
    height: 150,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  masonryTitle: {
    padding: 12,
    fontSize: 16,
    fontWeight: "bold",
  },
});
```

## Multi-Column Layouts

### Responsive Grid

```javascript
import { Dimensions } from "react-native";

const ResponsiveGridFlatList = () => {
  const { width } = Dimensions.get("window");
  const numColumns = width > 768 ? 3 : width > 480 ? 2 : 1;

  const renderItem = useCallback(
    ({ item, index }) => (
      <View style={[styles.responsiveItem, { width: `${100 / numColumns}%` }]}>
        <Image source={{ uri: item.image }} style={styles.responsiveImage} />
        <View style={styles.responsiveContent}>
          <Text style={styles.responsiveTitle}>{item.title}</Text>
          <Text style={styles.responsiveSubtitle}>{item.subtitle}</Text>
        </View>
      </View>
    ),
    [numColumns]
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={numColumns}
      columnWrapperStyle={styles.responsiveRow}
    />
  );
};
```

### Dynamic Column Layout

```javascript
const DynamicColumnFlatList = () => {
  const [layoutMode, setLayoutMode] = useState("list"); // 'list' | 'grid' | 'masonry'

  const getNumColumns = () => {
    switch (layoutMode) {
      case "grid":
        return 2;
      case "masonry":
        return 3;
      default:
        return 1;
    }
  };

  const renderItem = useCallback(
    ({ item, index }) => {
      const numColumns = getNumColumns();

      if (layoutMode === "masonry") {
        return (
          <View style={styles.masonryItem}>
            <Image source={{ uri: item.image }} style={styles.masonryImage} />
            <Text style={styles.masonryTitle}>{item.title}</Text>
          </View>
        );
      }

      return (
        <View
          style={[styles.dynamicItem, layoutMode === "grid" && styles.gridItem]}
        >
          <Image source={{ uri: item.image }} style={styles.dynamicImage} />
          <Text style={styles.dynamicTitle}>{item.title}</Text>
        </View>
      );
    },
    [layoutMode]
  );

  return (
    <View style={styles.container}>
      <View style={styles.layoutControls}>
        <TouchableOpacity
          style={[
            styles.layoutButton,
            layoutMode === "list" && styles.activeButton,
          ]}
          onPress={() => setLayoutMode("list")}
        >
          <Text style={styles.layoutButtonText}>List</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.layoutButton,
            layoutMode === "grid" && styles.activeButton,
          ]}
          onPress={() => setLayoutMode("grid")}
        >
          <Text style={styles.layoutButtonText}>Grid</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.layoutButton,
            layoutMode === "masonry" && styles.activeButton,
          ]}
          onPress={() => setLayoutMode("masonry")}
        >
          <Text style={styles.layoutButtonText}>Masonry</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={getNumColumns()}
        key={layoutMode} // Force re-render when layout changes
      />
    </View>
  );
};
```

## Sticky Headers

### Basic Sticky Headers

```javascript
const StickyHeaderFlatList = () => {
  const sections = [
    {
      title: "Section 1",
      data: ["Item 1", "Item 2", "Item 3"],
    },
    {
      title: "Section 2",
      data: ["Item 4", "Item 5", "Item 6"],
    },
  ];

  const renderSectionHeader = useCallback(
    ({ section }) => (
      <View style={styles.stickyHeader}>
        <Text style={styles.stickyHeaderText}>{section.title}</Text>
      </View>
    ),
    []
  );

  const renderItem = useCallback(
    ({ item }) => (
      <View style={styles.item}>
        <Text style={styles.itemText}>{item}</Text>
      </View>
    ),
    []
  );

  return (
    <SectionList
      sections={sections}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      stickySectionHeadersEnabled={true}
      keyExtractor={(item, index) => index.toString()}
    />
  );
};

const styles = StyleSheet.create({
  stickyHeader: {
    backgroundColor: "#007AFF",
    padding: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  stickyHeaderText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  itemText: {
    fontSize: 16,
  },
});
```

### Custom Sticky Headers

```javascript
const CustomStickyHeader = () => {
  const [activeSection, setActiveSection] = useState(null);

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const firstVisible = viewableItems[0];
      if (firstVisible.section) {
        setActiveSection(firstVisible.section.title);
      }
    }
  }, []);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  const renderSectionHeader = useCallback(
    ({ section }) => (
      <View
        style={[
          styles.customStickyHeader,
          activeSection === section.title && styles.activeStickyHeader,
        ]}
      >
        <Text style={styles.customStickyHeaderText}>{section.title}</Text>
        <Text style={styles.customStickyHeaderCount}>
          {section.data.length} items
        </Text>
      </View>
    ),
    [activeSection]
  );

  return (
    <SectionList
      sections={sections}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      stickySectionHeadersEnabled={true}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      keyExtractor={(item, index) => index.toString()}
    />
  );
};
```

## Advanced Rendering Patterns

### Conditional Rendering

```javascript
const ConditionalFlatList = () => {
  const [viewMode, setViewMode] = useState("list"); // 'list' | 'grid' | 'compact'

  const renderItem = useCallback(
    ({ item, index }) => {
      switch (viewMode) {
        case "grid":
          return (
            <View style={styles.gridItem}>
              <Image source={{ uri: item.image }} style={styles.gridImage} />
              <Text style={styles.gridTitle}>{item.title}</Text>
            </View>
          );

        case "compact":
          return (
            <View style={styles.compactItem}>
              <Text style={styles.compactTitle}>{item.title}</Text>
            </View>
          );

        default: // list
          return (
            <View style={styles.listItem}>
              <Image source={{ uri: item.image }} style={styles.listImage} />
              <View style={styles.listContent}>
                <Text style={styles.listTitle}>{item.title}</Text>
                <Text style={styles.listSubtitle}>{item.subtitle}</Text>
              </View>
            </View>
          );
      }
    },
    [viewMode]
  );

  return (
    <View style={styles.container}>
      <View style={styles.viewModeControls}>
        <TouchableOpacity
          style={[
            styles.viewModeButton,
            viewMode === "list" && styles.activeViewMode,
          ]}
          onPress={() => setViewMode("list")}
        >
          <Text>List</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.viewModeButton,
            viewMode === "grid" && styles.activeViewMode,
          ]}
          onPress={() => setViewMode("grid")}
        >
          <Text>Grid</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.viewModeButton,
            viewMode === "compact" && styles.activeViewMode,
          ]}
          onPress={() => setViewMode("compact")}
        >
          <Text>Compact</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={viewMode === "grid" ? 2 : 1}
        key={viewMode} // Force re-render when view mode changes
      />
    </View>
  );
};
```

### Complex Item Components

```javascript
const ComplexItemComponent = React.memo(({ item, onPress, onLongPress }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSelected, setIsSelected] = useState(false);

  const handlePress = useCallback(() => {
    setIsExpanded(!isExpanded);
    onPress?.(item);
  }, [isExpanded, onPress, item]);

  const handleLongPress = useCallback(() => {
    setIsSelected(!isSelected);
    onLongPress?.(item);
  }, [isSelected, onLongPress, item]);

  return (
    <TouchableOpacity
      style={[
        styles.complexItem,
        isSelected && styles.selectedItem,
        isExpanded && styles.expandedItem,
      ]}
      onPress={handlePress}
      onLongPress={handleLongPress}
    >
      <View style={styles.itemHeader}>
        <Image source={{ uri: item.image }} style={styles.itemImage} />
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
        </View>
        <View style={styles.itemActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Text>⋮</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isExpanded && (
        <View style={styles.expandedContent}>
          <Text style={styles.expandedText}>{item.description}</Text>
          <View style={styles.expandedActions}>
            <TouchableOpacity style={styles.expandedButton}>
              <Text>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.expandedButton}>
              <Text>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
});

const renderItem = useCallback(
  ({ item }) => (
    <ComplexItemComponent
      item={item}
      onPress={handleItemPress}
      onLongPress={handleItemLongPress}
    />
  ),
  [handleItemPress, handleItemLongPress]
);
```

This Part 4 covers advanced layout patterns and complex rendering scenarios for FlatList. In the next parts, we'll cover:

- **Part 5**: Animations, gestures, and interactive features
- **Part 6**: Real-world examples and best practices

Would you like me to continue with Part 5?
