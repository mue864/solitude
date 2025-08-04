# React Navigation Comprehensive Guide

## Table of Contents

1. [Introduction & Setup](#introduction--setup)
2. [Navigation Types](#navigation-types)
3. [Navigation Patterns](#navigation-patterns)
4. [Advanced Navigation](#advanced-navigation)
5. [Deep Linking](#deep-linking)
6. [Navigation Lifecycle](#navigation-lifecycle)
7. [Best Practices](#best-practices)
8. [Real-World Examples](#real-world-examples)

## Introduction & Setup

### Installation

```bash
# Install React Navigation
npm install @react-navigation/native

# Install required dependencies
npm install react-native-screens react-native-safe-area-context

# Install navigation types
npm install @react-navigation/stack @react-navigation/bottom-tabs @react-navigation/drawer

# For Expo projects
npx expo install @react-navigation/native react-native-screens react-native-safe-area-context
```

### Basic Setup

```javascript
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

### TypeScript Setup

```typescript
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Define the parameter list for each screen
export type RootStackParamList = {
  Home: undefined;
  Details: { itemId: string; title?: string };
  Profile: { userId: string };
  Settings: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

## Navigation Types

### 1. Stack Navigator

```javascript
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {
          backgroundColor: "#f4511e",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "My Home",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="Details"
        component={DetailsScreen}
        options={({ route }) => ({
          title: route.params?.title || "Details",
        })}
      />
    </Stack.Navigator>
  );
};
```

### 2. Tab Navigator

```javascript
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Settings") {
            iconName = focused ? "settings" : "settings-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};
```

### 3. Drawer Navigator

```javascript
import { createDrawerNavigator } from "@react-navigation/drawer";

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: true,
        drawerActiveTintColor: "#007AFF",
        drawerInactiveTintColor: "gray",
      }}
    >
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};
```

### 4. Material Top Tabs

```javascript
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

const Tab = createMaterialTopTabNavigator();

const MaterialTopTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "gray",
        tabBarIndicatorStyle: {
          backgroundColor: "#007AFF",
        },
      }}
    >
      <Tab.Screen name="Tab1" component={Tab1Screen} />
      <Tab.Screen name="Tab2" component={Tab2Screen} />
      <Tab.Screen name="Tab3" component={Tab3Screen} />
    </Tab.Navigator>
  );
};
```

## Navigation Patterns

### 1. Nested Navigators

```javascript
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Main"
          component={MainTabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Modal" component={ModalScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const MainTabNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
};

const HomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="Details" component={DetailsScreen} />
    </Stack.Navigator>
  );
};
```

### 2. Modal Navigation

```javascript
const RootNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Main" component={MainNavigator} />
      <Stack.Screen
        name="Modal"
        component={ModalScreen}
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};
```

### 3. Authentication Flow

```javascript
const AuthNavigator = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          // Authenticated stack
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          // Auth stack
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

## Advanced Navigation

### 1. Navigation Hooks

```javascript
import { useNavigation, useRoute } from "@react-navigation/native";

const ScreenComponent = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const handleNavigate = () => {
    navigation.navigate("Details", { itemId: "123", title: "My Item" });
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handlePush = () => {
    navigation.push("Details", { itemId: "456" });
  };

  const handleReplace = () => {
    navigation.replace("Home");
  };

  const handlePopToTop = () => {
    navigation.popToTop();
  };

  return (
    <View>
      <Button title="Navigate" onPress={handleNavigate} />
      <Button title="Go Back" onPress={handleGoBack} />
      <Button title="Push" onPress={handlePush} />
      <Button title="Replace" onPress={handleReplace} />
      <Button title="Pop to Top" onPress={handlePopToTop} />
    </View>
  );
};
```

### 2. Navigation Options

```javascript
const ScreenWithOptions = () => {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      title: "Custom Title",
      headerRight: () => (
        <TouchableOpacity onPress={() => console.log("Right button")}>
          <Text>Right</Text>
        </TouchableOpacity>
      ),
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text>Back</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return <View />;
};
```

### 3. Custom Navigation Components

```javascript
const CustomHeader = ({ navigation, route, options }) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#007AFF" />
      </TouchableOpacity>
      <Text style={styles.title}>{route.name}</Text>
      <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
        <Ionicons name="settings-outline" size={24} color="#007AFF" />
      </TouchableOpacity>
    </View>
  );
};

const StackWithCustomHeader = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        header: (props) => <CustomHeader {...props} />,
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Details" component={DetailsScreen} />
    </Stack.Navigator>
  );
};
```

## Deep Linking

### 1. Basic Deep Linking

```javascript
const linking = {
  prefixes: ["myapp://", "https://myapp.com"],
  config: {
    screens: {
      Home: "home",
      Details: "details/:id",
      Profile: "profile/:userId",
      Settings: "settings",
    },
  },
};

const App = () => {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

### 2. Advanced Deep Linking

```javascript
const linking = {
  prefixes: ["myapp://", "https://myapp.com"],
  config: {
    screens: {
      Main: {
        screens: {
          Home: "home",
          Profile: "profile",
        },
      },
      Modal: "modal",
      Settings: "settings",
    },
  },
  getInitialURL() {
    // Custom logic to get initial URL
    return null;
  },
  subscribe(listener) {
    // Custom subscription logic
    return () => {
      // Cleanup
    };
  },
};
```

### 3. Handling Deep Links

```javascript
const ScreenWithDeepLink = () => {
  const navigation = useNavigation();
  const route = useRoute();

  useEffect(() => {
    // Handle deep link parameters
    if (route.params?.fromDeepLink) {
      // Handle deep link specific logic
      console.log("Opened from deep link");
    }
  }, [route.params]);

  return <View />;
};
```

## Navigation Lifecycle

### 1. Focus Events

```javascript
import { useFocusEffect } from "@react-navigation/native";

const ScreenWithFocusEffect = () => {
  useFocusEffect(
    useCallback(() => {
      // Screen is focused
      console.log("Screen focused");

      return () => {
        // Screen is unfocused
        console.log("Screen unfocused");
      };
    }, [])
  );

  return <View />;
};
```

### 2. Navigation State Changes

```javascript
const NavigationStateListener = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener("state", (e) => {
      console.log("Navigation state changed:", e.data);
    });

    return unsubscribe;
  }, [navigation]);

  return <View />;
};
```

### 3. Screen Lifecycle

```javascript
const ScreenWithLifecycle = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribeFocus = navigation.addListener("focus", () => {
      console.log("Screen focused");
    });

    const unsubscribeBlur = navigation.addListener("blur", () => {
      console.log("Screen blurred");
    });

    const unsubscribeBeforeRemove = navigation.addListener(
      "beforeRemove",
      (e) => {
        // Prevent default behavior
        e.preventDefault();

        // Show confirmation dialog
        Alert.alert(
          "Discard changes?",
          "You have unsaved changes. Are you sure to discard them?",
          [
            { text: "Don't leave", style: "cancel", onPress: () => {} },
            {
              text: "Discard",
              style: "destructive",
              onPress: () => navigation.dispatch(e.data.action),
            },
          ]
        );
      }
    );

    return () => {
      unsubscribeFocus();
      unsubscribeBlur();
      unsubscribeBeforeRemove();
    };
  }, [navigation]);

  return <View />;
};
```

## Best Practices

### 1. Type Safety

```typescript
import { NavigationProp, RouteProp } from '@react-navigation/native';

type RootStackParamList = {
  Home: undefined;
  Details: { itemId: string; title?: string };
  Profile: { userId: string };
};

type HomeScreenNavigationProp = NavigationProp<RootStackParamList, 'Home'>;
type DetailsScreenRouteProp = RouteProp<RootStackParamList, 'Details'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

interface DetailsScreenProps {
  route: DetailsScreenRouteProp;
  navigation: NavigationProp<RootStackParamList, 'Details'>;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const handleNavigate = () => {
    navigation.navigate('Details', { itemId: '123', title: 'My Item' });
  };

  return (
    <View>
      <Button title="Navigate" onPress={handleNavigate} />
    </View>
  );
};
```

### 2. Performance Optimization

```javascript
// ✅ Good: Memoize navigation options
const ScreenWithMemoizedOptions = () => {
  const navigation = useNavigation();

  const headerRight = useCallback(
    () => (
      <TouchableOpacity onPress={() => console.log("Right button")}>
        <Text>Right</Text>
      </TouchableOpacity>
    ),
    []
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight,
    });
  }, [navigation, headerRight]);

  return <View />;
};

// ✅ Good: Use React.memo for screen components
const MemoizedScreen = React.memo(() => {
  return <View />;
});
```

### 3. Error Boundaries

```javascript
class NavigationErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.log("Navigation error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text>Something went wrong with navigation.</Text>
          <Button
            title="Try Again"
            onPress={() => this.setState({ hasError: false })}
          />
        </View>
      );
    }

    return this.props.children;
  }
}

const AppWithErrorBoundary = () => {
  return (
    <NavigationErrorBoundary>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </NavigationErrorBoundary>
  );
};
```

## Real-World Examples

### 1. Focus App Navigation Structure

```javascript
const FocusAppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
        <Stack.Screen name="Main" component={MainNavigator} />
        <Stack.Screen name="Modal" component={ModalNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          switch (route.name) {
            case "Focus":
              iconName = focused ? "timer" : "timer-outline";
              break;
            case "Journal":
              iconName = focused ? "book" : "book-outline";
              break;
            case "Insights":
              iconName = focused ? "analytics" : "analytics-outline";
              break;
            case "Settings":
              iconName = focused ? "settings" : "settings-outline";
              break;
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Focus" component={FocusStack} />
      <Tab.Screen name="Journal" component={JournalStack} />
      <Tab.Screen name="Insights" component={InsightsStack} />
      <Tab.Screen name="Settings" component={SettingsStack} />
    </Tab.Navigator>
  );
};

const FocusStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="FocusMain" component={FocusScreen} />
      <Stack.Screen name="SessionComplete" component={SessionCompleteScreen} />
      <Stack.Screen name="FlowDetails" component={FlowDetailsScreen} />
    </Stack.Navigator>
  );
};
```

### 2. Authentication Flow

```javascript
const AuthNavigator = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication status
    checkAuthStatus().then((authenticated) => {
      setIsAuthenticated(authenticated);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

### 3. Modal Navigation

```javascript
const ModalNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        presentation: "modal",
        headerShown: false,
      }}
    >
      <Stack.Screen name="AddTask" component={AddTaskModal} />
      <Stack.Screen name="SessionComplete" component={SessionCompleteModal} />
      <Stack.Screen name="Settings" component={SettingsModal} />
    </Stack.Navigator>
  );
};

const AddTaskModal = ({ navigation }) => {
  const handleClose = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalHeader}>
        <TouchableOpacity onPress={handleClose}>
          <Text>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.modalTitle}>Add Task</Text>
        <TouchableOpacity onPress={handleClose}>
          <Text>Done</Text>
        </TouchableOpacity>
      </View>
      <AddTaskForm />
    </View>
  );
};
```

### 4. Deep Linking for Focus App

```javascript
const linking = {
  prefixes: ["solitude://", "https://solitude.app"],
  config: {
    screens: {
      Main: {
        screens: {
          Focus: {
            screens: {
              FocusMain: "focus",
              SessionComplete: "session-complete",
            },
          },
          Journal: {
            screens: {
              JournalMain: "journal",
              JournalEditor: "journal/:id",
            },
          },
          Insights: "insights",
          Settings: "settings",
        },
      },
      Modal: {
        screens: {
          AddTask: "add-task",
          SessionComplete: "modal/session-complete",
        },
      },
    },
  },
};

// Usage in app
const App = () => {
  return (
    <NavigationContainer linking={linking}>
      <FocusAppNavigator />
    </NavigationContainer>
  );
};
```

This comprehensive guide covers all essential aspects of React Navigation, from basic setup to advanced patterns and real-world implementations. The examples are specifically tailored for your focus app structure and include best practices for performance, type safety, and error handling.
