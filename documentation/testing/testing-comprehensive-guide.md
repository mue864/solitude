# React Native Testing Comprehensive Guide

## Table of Contents

1. [Introduction & Setup](#introduction--setup)
2. [Unit Testing](#unit-testing)
3. [Component Testing](#component-testing)
4. [Integration Testing](#integration-testing)
5. [E2E Testing](#e2e-testing)
6. [Testing Best Practices](#testing-best-practices)
7. [Testing Patterns](#testing-patterns)
8. [Real-World Examples](#real-world-examples)

## Introduction & Setup

### Testing Stack Installation

```bash
# Install testing dependencies
npm install --save-dev @testing-library/react-native @testing-library/jest-native
npm install --save-dev jest @types/jest
npm install --save-dev @testing-library/react-hooks
npm install --save-dev react-native-testing-library
npm install --save-dev @testing-library/user-event

# For E2E testing
npm install --save-dev detox

# For visual regression testing
npm install --save-dev @storybook/react-native
```

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: "react-native",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  transformIgnorePatterns: [
    "node_modules/(?!(react-native|@react-native|@react-navigation)/)",
  ],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  testMatch: ["**/__tests__/**/*.(ts|tsx|js)", "**/*.(test|spec).(ts|tsx|js)"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx,js,jsx}",
    "!src/**/*.d.ts",
    "!src/**/index.{ts,tsx,js,jsx}",
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testEnvironment: "node",
  setupFiles: ["<rootDir>/jest.setup.js"],
};
```

### Jest Setup

```javascript
// jest.setup.js
import "@testing-library/jest-native/extend-expect";
import "react-native-gesture-handler/jestSetup";

// Mock react-native-reanimated
jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock react-native-vector-icons
jest.mock("react-native-vector-icons/MaterialIcons", () => "Icon");

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

// Mock react-native-gesture-handler
jest.mock("react-native-gesture-handler", () => {
  const View = require("react-native/Libraries/Components/View/View");
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    PanGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    PanGestureHandlerGestureEvent: View,
    TapGestureHandlerGestureEvent: View,
    NativeViewGestureHandler: View,
    createNativeWrapper: jest.fn(),
  };
});

// Mock notifee
jest.mock("@notifee/react-native", () => ({
  requestPermission: jest.fn(),
  createChannel: jest.fn(),
  displayNotification: jest.fn(),
}));

// Global test utilities
global.fetch = jest.fn();
```

## Unit Testing

### 1. Utility Functions Testing

```javascript
// __tests__/utils/formatTime.test.js
import { formatTime } from "../../utils/formatTime";

describe("formatTime", () => {
  test("formats seconds correctly", () => {
    expect(formatTime(0)).toBe("00:00");
    expect(formatTime(30)).toBe("00:30");
    expect(formatTime(60)).toBe("01:00");
    expect(formatTime(90)).toBe("01:30");
    expect(formatTime(3600)).toBe("60:00");
  });

  test("handles edge cases", () => {
    expect(formatTime(-1)).toBe("00:00");
    expect(formatTime(null)).toBe("00:00");
    expect(formatTime(undefined)).toBe("00:00");
  });

  test("handles large numbers", () => {
    expect(formatTime(3661)).toBe("61:01");
    expect(formatTime(7200)).toBe("120:00");
  });
});
```

### 2. Store Testing (Zustand)

```javascript
// __tests__/store/taskStore.test.js
import { renderHook, act } from "@testing-library/react-hooks";
import { useTaskStore } from "../../store/taskStore";

describe("TaskStore", () => {
  beforeEach(() => {
    // Reset store before each test
    act(() => {
      useTaskStore.getState().reset();
    });
  });

  test("initial state is correct", () => {
    const { result } = renderHook(() => useTaskStore());

    expect(result.current.tasks).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test("adds task correctly", () => {
    const { result } = renderHook(() => useTaskStore());
    const newTask = { id: "1", title: "Test Task", completed: false };

    act(() => {
      result.current.addTask(newTask);
    });

    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0]).toEqual(newTask);
  });

  test("updates task correctly", () => {
    const { result } = renderHook(() => useTaskStore());
    const task = { id: "1", title: "Test Task", completed: false };

    act(() => {
      result.current.addTask(task);
      result.current.updateTask("1", { completed: true });
    });

    expect(result.current.tasks[0].completed).toBe(true);
  });

  test("deletes task correctly", () => {
    const { result } = renderHook(() => useTaskStore());
    const task = { id: "1", title: "Test Task", completed: false };

    act(() => {
      result.current.addTask(task);
      result.current.deleteTask("1");
    });

    expect(result.current.tasks).toHaveLength(0);
  });
});
```

### 3. API Service Testing

```javascript
// __tests__/api/taskService.test.js
import { TaskService } from "../../api/services/taskService";
import { apiClient } from "../../api/client";

// Mock the API client
jest.mock("../../api/client");

describe("TaskService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getTasks returns tasks successfully", async () => {
    const mockTasks = [
      { id: "1", title: "Task 1" },
      { id: "2", title: "Task 2" },
    ];

    apiClient.get.mockResolvedValue({ data: mockTasks });

    const result = await TaskService.getTasks();

    expect(apiClient.get).toHaveBeenCalledWith("/tasks");
    expect(result.data).toEqual(mockTasks);
  });

  test("createTask creates task successfully", async () => {
    const newTask = { title: "New Task", description: "Test description" };
    const createdTask = { id: "1", ...newTask };

    apiClient.post.mockResolvedValue({ data: createdTask });

    const result = await TaskService.createTask(newTask);

    expect(apiClient.post).toHaveBeenCalledWith("/tasks", newTask);
    expect(result.data).toEqual(createdTask);
  });

  test("handles API errors correctly", async () => {
    const error = new Error("Network error");
    apiClient.get.mockRejectedValue(error);

    await expect(TaskService.getTasks()).rejects.toThrow("Network error");
  });
});
```

## Component Testing

### 1. Basic Component Testing

```javascript
// __tests__/components/TaskItem.test.js
import React from "react";
import { render, fireEvent, screen } from "@testing-library/react-native";
import { TaskItem } from "../../components/TaskItem";

describe("TaskItem", () => {
  const mockTask = {
    id: "1",
    title: "Test Task",
    description: "Test Description",
    completed: false,
  };

  const mockOnPress = jest.fn();
  const mockOnLongPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders task information correctly", () => {
    render(
      <TaskItem
        task={mockTask}
        onPress={mockOnPress}
        onLongPress={mockOnLongPress}
      />
    );

    expect(screen.getByText("Test Task")).toBeTruthy();
    expect(screen.getByText("Test Description")).toBeTruthy();
  });

  test("calls onPress when pressed", () => {
    render(
      <TaskItem
        task={mockTask}
        onPress={mockOnPress}
        onLongPress={mockOnLongPress}
      />
    );

    fireEvent.press(screen.getByText("Test Task"));
    expect(mockOnPress).toHaveBeenCalledWith("1");
  });

  test("calls onLongPress when long pressed", () => {
    render(
      <TaskItem
        task={mockTask}
        onPress={mockOnPress}
        onLongPress={mockOnLongPress}
      />
    );

    fireEvent(screen.getByText("Test Task"), "onLongPress");
    expect(mockOnLongPress).toHaveBeenCalledWith("1");
  });

  test("shows completed state correctly", () => {
    const completedTask = { ...mockTask, completed: true };

    render(
      <TaskItem
        task={completedTask}
        onPress={mockOnPress}
        onLongPress={mockOnLongPress}
      />
    );

    expect(screen.getByText("Test Task")).toHaveStyle({
      textDecorationLine: "line-through",
    });
  });
});
```

### 2. Custom Hook Testing

```javascript
// __tests__/hooks/useTasks.test.js
import { renderHook, act, waitFor } from "@testing-library/react-hooks";
import { useTasks } from "../../hooks/useTasks";
import { TaskService } from "../../api/services/taskService";

jest.mock("../../api/services/taskService");

describe("useTasks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("fetches tasks successfully", async () => {
    const mockTasks = [
      { id: "1", title: "Task 1" },
      { id: "2", title: "Task 2" },
    ];

    TaskService.getTasks.mockResolvedValue({ data: mockTasks });

    const { result } = renderHook(() => useTasks());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockTasks);
    expect(result.current.error).toBeNull();
  });

  test("handles fetch error correctly", async () => {
    const error = new Error("Failed to fetch");
    TaskService.getTasks.mockRejectedValue(error);

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toEqual(error);
    expect(result.current.data).toBeNull();
  });

  test("refetches data when execute is called", async () => {
    const mockTasks = [{ id: "1", title: "Task 1" }];
    TaskService.getTasks.mockResolvedValue({ data: mockTasks });

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.execute();
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(TaskService.getTasks).toHaveBeenCalledTimes(2);
  });
});
```

### 3. Navigation Testing

```javascript
// __tests__/navigation/Navigation.test.js
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { HomeScreen } from "../../screens/HomeScreen";
import { DetailsScreen } from "../../screens/DetailsScreen";

const Stack = createStackNavigator();

const TestNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Details" component={DetailsScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

describe("Navigation", () => {
  test("navigates to details screen", () => {
    const { getByText } = render(<TestNavigator />);

    fireEvent.press(getByText("Go to Details"));

    expect(getByText("Details Screen")).toBeTruthy();
  });

  test("passes parameters correctly", () => {
    const { getByText } = render(<TestNavigator />);

    fireEvent.press(getByText("Go to Details"));

    expect(getByText("Item ID: 123")).toBeTruthy();
  });
});
```

## Integration Testing

### 1. Screen Integration Testing

```javascript
// __tests__/integration/FocusScreen.test.js
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import { FocusScreen } from "../../screens/FocusScreen";
import { useTaskStore } from "../../store/taskStore";

// Mock the store
jest.mock("../../store/taskStore");

describe("FocusScreen Integration", () => {
  const mockTasks = [
    { id: "1", title: "Task 1", completed: false },
    { id: "2", title: "Task 2", completed: true },
  ];

  beforeEach(() => {
    useTaskStore.mockImplementation(() => ({
      tasks: mockTasks,
      loading: false,
      error: null,
      addTask: jest.fn(),
      updateTask: jest.fn(),
      deleteTask: jest.fn(),
    }));
  });

  test("renders task list correctly", () => {
    const { getByText } = render(
      <NavigationContainer>
        <FocusScreen />
      </NavigationContainer>
    );

    expect(getByText("Task 1")).toBeTruthy();
    expect(getByText("Task 2")).toBeTruthy();
  });

  test("handles task completion", async () => {
    const mockUpdateTask = jest.fn();
    useTaskStore.mockImplementation(() => ({
      tasks: mockTasks,
      loading: false,
      error: null,
      updateTask: mockUpdateTask,
    }));

    const { getByTestId } = render(
      <NavigationContainer>
        <FocusScreen />
      </NavigationContainer>
    );

    const completeButton = getByTestId("complete-task-1");
    fireEvent.press(completeButton);

    expect(mockUpdateTask).toHaveBeenCalledWith("1", { completed: true });
  });

  test("handles session start", async () => {
    const { getByText } = render(
      <NavigationContainer>
        <FocusScreen />
      </NavigationContainer>
    );

    const startButton = getByText("Start Session");
    fireEvent.press(startButton);

    await waitFor(() => {
      expect(getByText("Session Running")).toBeTruthy();
    });
  });
});
```

### 2. API Integration Testing

```javascript
// __tests__/integration/api.test.js
import { TaskService } from "../../api/services/taskService";
import { useTaskStore } from "../../store/taskStore";

describe("API Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("creates task and updates store", async () => {
    const mockAddTask = jest.fn();
    useTaskStore.mockImplementation(() => ({
      addTask: mockAddTask,
    }));

    const newTask = { title: "New Task", description: "Test" };
    const createdTask = { id: "1", ...newTask };

    // Mock API response
    TaskService.createTask.mockResolvedValue({ data: createdTask });

    // Simulate API call
    const result = await TaskService.createTask(newTask);

    // Verify API call
    expect(TaskService.createTask).toHaveBeenCalledWith(newTask);
    expect(result.data).toEqual(createdTask);

    // Verify store update
    expect(mockAddTask).toHaveBeenCalledWith(createdTask);
  });

  test("handles API errors gracefully", async () => {
    const error = new Error("Network error");
    TaskService.getTasks.mockRejectedValue(error);

    const { result } = renderHook(() => useTaskStore());

    await waitFor(() => {
      expect(result.current.error).toEqual(error);
    });
  });
});
```

## E2E Testing

### 1. Detox Setup

```javascript
// .detoxrc.js
module.exports = {
  testRunner: "jest",
  runnerConfig: "e2e/config.json",
  configurations: {
    "ios.sim.debug": {
      type: "ios.simulator",
      binaryPath: "ios/build/Build/Products/Debug-iphonesimulator/Solitude.app",
      build:
        "xcodebuild -workspace ios/Solitude.xcworkspace -scheme Solitude -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build",
      device: {
        type: "iPhone 14",
      },
    },
    "android.emu.debug": {
      type: "android.emulator",
      binaryPath: "android/app/build/outputs/apk/debug/app-debug.apk",
      build:
        "cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug",
      device: {
        avdName: "Pixel_4_API_30",
      },
    },
  },
};
```

### 2. E2E Test Examples

```javascript
// e2e/focus.test.js
import { device, element, by, expect } from "detox";

describe("Focus Screen E2E", () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  test("should start a focus session", async () => {
    // Navigate to focus screen
    await element(by.id("focus-tab")).tap();

    // Add a task
    await element(by.id("add-task-button")).tap();
    await element(by.id("task-title-input")).typeText("Test Task");
    await element(by.id("save-task-button")).tap();

    // Start session
    await element(by.id("start-session-button")).tap();

    // Verify session is running
    await expect(element(by.id("session-timer"))).toBeVisible();
    await expect(element(by.id("session-status"))).toHaveText("Running");
  });

  test("should complete a session", async () => {
    // Start session
    await element(by.id("start-session-button")).tap();

    // Wait for session to complete (or simulate completion)
    await element(by.id("complete-session-button")).tap();

    // Verify completion modal
    await expect(element(by.id("session-complete-modal"))).toBeVisible();
    await expect(element(by.id("session-stats"))).toBeVisible();
  });

  test("should handle session interruption", async () => {
    // Start session
    await element(by.id("start-session-button")).tap();

    // Simulate app going to background
    await device.sendToHome();

    // Return to app
    await device.launchApp();

    // Verify session is paused
    await expect(element(by.id("session-status"))).toHaveText("Paused");
  });
});
```

### 3. Navigation E2E Testing

```javascript
// e2e/navigation.test.js
import { device, element, by, expect } from "detox";

describe("Navigation E2E", () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  test("should navigate between tabs", async () => {
    // Check initial tab
    await expect(element(by.id("focus-tab"))).toBeVisible();

    // Navigate to journal
    await element(by.id("journal-tab")).tap();
    await expect(element(by.id("journal-screen"))).toBeVisible();

    // Navigate to insights
    await element(by.id("insights-tab")).tap();
    await expect(element(by.id("insights-screen"))).toBeVisible();

    // Navigate to settings
    await element(by.id("settings-tab")).tap();
    await expect(element(by.id("settings-screen"))).toBeVisible();
  });

  test("should handle deep linking", async () => {
    // Simulate deep link
    await device.openURL("solitude://focus");

    // Verify focus screen is shown
    await expect(element(by.id("focus-screen"))).toBeVisible();
  });
});
```

## Testing Best Practices

### 1. Test Organization

```javascript
// __tests__/components/__snapshots__/TaskItem.test.js.snap
// Jest Snapshot v1, https://goo.gl/fbAQLP

exports[`TaskItem renders correctly 1`] = `
<View>
  <TouchableOpacity>
    <View>
      <Text>Test Task</Text>
      <Text>Test Description</Text>
    </View>
  </TouchableOpacity>
</View>
`;

// Test file structure
// __tests__/
//   ├── components/
//   │   ├── TaskItem.test.js
//   │   └── __snapshots__/
//   ├── hooks/
//   │   └── useTasks.test.js
//   ├── store/
//   │   └── taskStore.test.js
//   ├── utils/
//   │   └── formatTime.test.js
//   └── integration/
//       └── FocusScreen.test.js
```

### 2. Test Utilities

```javascript
// __tests__/utils/testUtils.js
import React from "react";
import { render } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";

// Custom render function with providers
export const renderWithProviders = (component, options = {}) => {
  const AllTheProviders = ({ children }) => {
    return <NavigationContainer>{children}</NavigationContainer>;
  };

  return render(component, { wrapper: AllTheProviders, ...options });
};

// Mock data factories
export const createMockTask = (overrides = {}) => ({
  id: "1",
  title: "Test Task",
  description: "Test Description",
  completed: false,
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const createMockSession = (overrides = {}) => ({
  id: "1",
  taskId: "1",
  duration: 1500,
  startTime: new Date().toISOString(),
  endTime: null,
  status: "running",
  ...overrides,
});

// Async utilities
export const waitForElement = async (getter, timeout = 5000) => {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    try {
      return getter();
    } catch (error) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  throw new Error("Element not found within timeout");
};
```

### 3. Mock Strategies

```javascript
// __tests__/mocks/index.js
// API mocks
export const mockApiClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

// Navigation mocks
export const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  push: jest.fn(),
  pop: jest.fn(),
  setOptions: jest.fn(),
};

// Store mocks
export const mockTaskStore = {
  tasks: [],
  loading: false,
  error: null,
  addTask: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
  fetchTasks: jest.fn(),
};

// AsyncStorage mocks
export const mockAsyncStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
```

## Testing Patterns

### 1. Component Testing Patterns

```javascript
// __tests__/patterns/ComponentTestPattern.test.js
import React from "react";
import { render, fireEvent, screen } from "@testing-library/react-native";

describe("Component Testing Pattern", () => {
  // Arrange
  const defaultProps = {
    title: "Test Title",
    onPress: jest.fn(),
  };

  const renderComponent = (props = {}) => {
    return render(<TestComponent {...defaultProps} {...props} />);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders with default props", () => {
    // Act
    const { getByText } = renderComponent();

    // Assert
    expect(getByText("Test Title")).toBeTruthy();
  });

  test("handles user interaction", () => {
    // Arrange
    const onPress = jest.fn();
    const { getByText } = renderComponent({ onPress });

    // Act
    fireEvent.press(getByText("Test Title"));

    // Assert
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test("displays loading state", () => {
    // Act
    const { getByTestId } = renderComponent({ loading: true });

    // Assert
    expect(getByTestId("loading-spinner")).toBeTruthy();
  });
});
```

### 2. Hook Testing Patterns

```javascript
// __tests__/patterns/HookTestPattern.test.js
import { renderHook, act, waitFor } from "@testing-library/react-hooks";

describe("Hook Testing Pattern", () => {
  test("returns initial state", () => {
    // Act
    const { result } = renderHook(() => useCustomHook());

    // Assert
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test("updates state on action", async () => {
    // Arrange
    const { result } = renderHook(() => useCustomHook());

    // Act
    act(() => {
      result.current.fetchData();
    });

    // Assert
    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeDefined();
  });

  test("handles errors gracefully", async () => {
    // Arrange
    const error = new Error("Test error");
    jest.spyOn(api, "fetchData").mockRejectedValue(error);

    // Act
    const { result } = renderHook(() => useCustomHook());

    act(() => {
      result.current.fetchData();
    });

    // Assert
    await waitFor(() => {
      expect(result.current.error).toEqual(error);
    });
  });
});
```

## Real-World Examples

### 1. Focus App Testing

```javascript
// __tests__/integration/FocusApp.test.js
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import { FocusApp } from "../../App";

describe("Focus App Integration", () => {
  test("complete user journey", async () => {
    const { getByText, getByTestId } = render(
      <NavigationContainer>
        <FocusApp />
      </NavigationContainer>
    );

    // Navigate to focus screen
    await fireEvent.press(getByText("Focus"));

    // Add a task
    await fireEvent.press(getByTestId("add-task-button"));
    await fireEvent.changeText(getByTestId("task-title-input"), "Test Task");
    await fireEvent.press(getByTestId("save-task-button"));

    // Start session
    await fireEvent.press(getByTestId("start-session-button"));

    // Verify session is running
    await waitFor(() => {
      expect(getByTestId("session-timer")).toBeTruthy();
    });

    // Complete session
    await fireEvent.press(getByTestId("complete-session-button"));

    // Verify completion
    await waitFor(() => {
      expect(getByTestId("session-complete-modal")).toBeTruthy();
    });
  });
});
```

### 2. Store Testing

```javascript
// __tests__/store/completeStore.test.js
import { renderHook, act } from "@testing-library/react-hooks";
import { useTaskStore, useSessionStore } from "../../store";

describe("Store Integration", () => {
  test("task and session integration", () => {
    const { result: taskResult } = renderHook(() => useTaskStore());
    const { result: sessionResult } = renderHook(() => useSessionStore());

    // Add task
    act(() => {
      taskResult.current.addTask({
        id: "1",
        title: "Test Task",
        completed: false,
      });
    });

    // Start session with task
    act(() => {
      sessionResult.current.startSession("1");
    });

    expect(sessionResult.current.currentTaskId).toBe("1");
    expect(sessionResult.current.isRunning).toBe(true);
  });
});
```

### 3. API Testing

```javascript
// __tests__/api/completeApi.test.js
import { TaskService, SessionService } from "../../api/services";

describe("API Integration", () => {
  test("complete CRUD operations", async () => {
    // Create task
    const newTask = await TaskService.createTask({
      title: "Test Task",
      description: "Test Description",
    });

    expect(newTask.data.id).toBeDefined();

    // Read task
    const task = await TaskService.getTaskById(newTask.data.id);
    expect(task.data.title).toBe("Test Task");

    // Update task
    const updatedTask = await TaskService.updateTask(newTask.data.id, {
      completed: true,
    });
    expect(updatedTask.data.completed).toBe(true);

    // Delete task
    await TaskService.deleteTask(newTask.data.id);

    // Verify deletion
    await expect(TaskService.getTaskById(newTask.data.id)).rejects.toThrow();
  });
});
```

This comprehensive testing guide covers all essential aspects of testing React Native applications, from unit tests to E2E testing. The examples are specifically tailored for your focus app and include best practices for maintainable, reliable test suites.

The guide provides everything you need to build robust test coverage for your React Native application, ensuring code quality and reliability throughout development.
