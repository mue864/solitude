# Notifee Comprehensive Guide for React Native

## Table of Contents

1. [Introduction](#introduction)
2. [Installation & Setup](#installation--setup)
3. [Basic Usage](#basic-usage)
4. [Advanced Features](#advanced-features)
5. [Best Practices](#best-practices)
6. [Platform-Specific Considerations](#platform-specific-considerations)
7. [Troubleshooting](#troubleshooting)
8. [Real-World Examples](#real-world-examples)
9. [Performance Optimization](#performance-optimization)
10. [Security Considerations](#security-considerations)

## Introduction

Notifee is a powerful React Native library for handling local notifications, background tasks, and push notifications. It provides a unified API across iOS and Android with advanced features like notification channels, categories, actions, and background processing.

### Key Features

- **Local Notifications**: Schedule and display notifications
- **Push Notifications**: Handle remote notifications
- **Background Tasks**: Process data in the background
- **Notification Channels**: Organize notifications (Android)
- **Notification Categories**: Group notifications with actions (iOS)
- **Foreground Service**: Keep app running in background (Android)
- **Deep Linking**: Navigate to specific screens from notifications

## Installation & Setup

### 1. Install Notifee

```bash
npm install @notifee/react-native
# or
yarn add @notifee/react-native
```

### 2. Expo Configuration

For Expo projects, add the plugin to your `app.json`:

```json
{
  "expo": {
    "plugins": ["@notifee/react-native"]
  }
}
```

### 3. Android Configuration

#### Add to `android/app/build.gradle`:

```gradle
dependencies {
    implementation project(':@notifee_react-native')
}
```

#### Add to `android/settings.gradle`:

```gradle
include ':@notifee_react-native'
project(':@notifee_react-native').projectDir = new File(rootProject.projectDir, '../node_modules/@notifee/react-native/android')
```

#### Update `MainApplication.java`:

```java
import io.invertase.notifee.NotifeePackage;

@Override
protected List<ReactPackage> getPackages() {
    return Arrays.<ReactPackage>asList(
        new MainReactPackage(),
        new NotifeePackage()
    );
}
```

### 4. iOS Configuration

#### Add to `ios/Podfile`:

```ruby
pod 'RNNotifee', :path => '../node_modules/@notifee/react-native'
```

#### Update `AppDelegate.m`:

```objc
#import <RNNotifee/RNNotifee.h>

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  // ... existing code ...

  [RNNotifee configure];

  return YES;
}
```

## Basic Usage

### 1. Import and Initialize

```typescript
import notifee, {
  AndroidImportance,
  AndroidStyle,
  EventType,
  TriggerType,
  RepeatFrequency,
} from "@notifee/react-native";

// Request permissions (iOS)
const requestPermissions = async () => {
  const authStatus = await notifee.requestPermission();
  const enabled =
    authStatus.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
    authStatus.authorizationStatus === AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log("Authorization status:", authStatus.authorizationStatus);
  }
};
```

### 2. Create Notification Channels (Android)

```typescript
const createChannels = async () => {
  // Default channel
  await notifee.createChannel({
    id: "default",
    name: "Default Channel",
    importance: AndroidImportance.HIGH,
  });

  // Custom channel for different notification types
  await notifee.createChannel({
    id: "focus-sessions",
    name: "Focus Sessions",
    description: "Notifications for focus sessions",
    importance: AndroidImportance.HIGH,
    sound: "default",
    vibration: true,
    vibrationPattern: [300, 500],
    lights: true,
    lightColor: "#FF0000",
  });

  // Silent channel for background updates
  await notifee.createChannel({
    id: "background-updates",
    name: "Background Updates",
    importance: AndroidImportance.LOW,
    sound: null,
    vibration: false,
  });
};
```

### 3. Display Basic Notifications

```typescript
const showBasicNotification = async () => {
  // Request permission first
  await notifee.requestPermission();

  // Create channel (Android)
  const channelId = await notifee.createChannel({
    id: "default",
    name: "Default Channel",
  });

  // Display notification
  await notifee.displayNotification({
    title: "Hello World!",
    body: "This is a basic notification",
    android: {
      channelId,
      smallIcon: "ic_launcher",
      pressAction: {
        id: "default",
      },
    },
    ios: {
      foregroundPresentationOptions: {
        badge: true,
        sound: true,
        banner: true,
        list: true,
      },
    },
  });
};
```

### 4. Schedule Notifications

```typescript
const scheduleNotification = async () => {
  // Schedule for 5 seconds from now
  await notifee.createTriggerNotification(
    {
      title: "Scheduled Notification",
      body: "This was scheduled 5 seconds ago",
      android: {
        channelId: "default",
      },
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp: Date.now() + 5000, // 5 seconds from now
    }
  );

  // Schedule recurring notification
  await notifee.createTriggerNotification(
    {
      title: "Daily Reminder",
      body: "Time to focus!",
      android: {
        channelId: "default",
      },
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
      alarmManager: true,
      repeatFrequency: RepeatFrequency.DAILY,
    }
  );
};
```

## Advanced Features

### 1. Rich Notifications

```typescript
const showRichNotification = async () => {
  const channelId = await notifee.createChannel({
    id: "rich",
    name: "Rich Notifications",
    importance: AndroidImportance.HIGH,
  });

  await notifee.displayNotification({
    title: "Rich Notification",
    body: "This notification has rich content",
    android: {
      channelId,
      smallIcon: "ic_launcher",
      largeIcon: "https://example.com/large-icon.png",
      style: {
        type: AndroidStyle.BIGPICTURE,
        picture: "https://example.com/image.jpg",
      },
      pressAction: {
        id: "default",
      },
      actions: [
        {
          title: "Reply",
          pressAction: {
            id: "reply",
          },
        },
        {
          title: "Mark Complete",
          pressAction: {
            id: "complete",
          },
        },
      ],
    },
    ios: {
      attachments: [
        {
          url: "https://example.com/image.jpg",
          thumbnailHidden: false,
        },
      ],
      categoryId: "rich-category",
    },
  });
};
```

### 2. Notification Categories (iOS)

```typescript
const setupNotificationCategories = async () => {
  await notifee.setNotificationCategories([
    {
      id: "focus-session",
      actions: [
        {
          id: "start-session",
          title: "Start Session",
          options: {
            foreground: true,
          },
        },
        {
          id: "snooze",
          title: "Snooze 5 min",
          options: {
            foreground: false,
          },
        },
        {
          id: "dismiss",
          title: "Dismiss",
          options: {
            foreground: false,
            destructive: true,
          },
        },
      ],
    },
    {
      id: "task-reminder",
      actions: [
        {
          id: "complete-task",
          title: "Complete",
          options: {
            foreground: true,
          },
        },
        {
          id: "remind-later",
          title: "Remind Later",
          options: {
            foreground: false,
          },
        },
      ],
    },
  ]);
};
```

### 3. Background Tasks

```typescript
const setupBackgroundTasks = async () => {
  // Register background task
  await notifee.registerBackgroundTask(async (event) => {
    console.log("Background task triggered:", event);

    // Process data
    const data = event.detail.notification?.data;
    if (data?.type === "focus-session-complete") {
      // Update session statistics
      await updateSessionStats(data.sessionId);
    }

    // Return result
    return { success: true };
  });
};

// Trigger background task
const triggerBackgroundTask = async () => {
  await notifee.displayNotification({
    title: "Processing...",
    body: "Background task in progress",
    android: {
      channelId: "background-updates",
      ongoing: true,
      progress: {
        indeterminate: true,
      },
    },
    data: {
      type: "focus-session-complete",
      sessionId: "session-123",
    },
  });
};
```

### 4. Foreground Services (Android)

```typescript
const startForegroundService = async () => {
  const channelId = await notifee.createChannel({
    id: "foreground-service",
    name: "Foreground Service",
    importance: AndroidImportance.LOW,
  });

  await notifee.displayNotification({
    title: "Focus Session Active",
    body: "Your session is running in the background",
    android: {
      channelId,
      asForegroundService: true,
      ongoing: true,
      progress: {
        indeterminate: true,
      },
      actions: [
        {
          title: "Pause",
          pressAction: {
            id: "pause-session",
          },
        },
        {
          title: "End",
          pressAction: {
            id: "end-session",
          },
        },
      ],
    },
  });
};

const stopForegroundService = async () => {
  await notifee.stopForegroundService();
};
```

### 5. Event Handling

```typescript
const setupEventListeners = () => {
  const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
    switch (type) {
      case EventType.DISMISSED:
        console.log("User dismissed notification", detail.notification);
        break;
      case EventType.PRESS:
        console.log("User pressed notification", detail.notification);
        handleNotificationPress(detail.notification);
        break;
      case EventType.ACTION_PRESS:
        console.log(
          "User pressed action",
          detail.notification,
          detail.pressAction
        );
        handleActionPress(detail.pressAction);
        break;
    }
  });

  // Background event listener
  notifee.onBackgroundEvent(async ({ type, detail }) => {
    console.log("Background event:", type, detail);

    if (type === EventType.ACTION_PRESS) {
      const { pressAction } = detail;

      switch (pressAction.id) {
        case "start-session":
          await startFocusSession();
          break;
        case "complete-task":
          await completeTask(detail.notification?.data?.taskId);
          break;
      }
    }
  });

  return unsubscribe;
};

const handleNotificationPress = (notification) => {
  const data = notification?.data;
  if (data?.screen) {
    // Navigate to specific screen
    navigation.navigate(data.screen, data.params);
  }
};

const handleActionPress = (pressAction) => {
  switch (pressAction.id) {
    case "reply":
      // Open reply interface
      break;
    case "complete":
      // Mark task as complete
      break;
  }
};
```

## Best Practices

### 1. Permission Management

```typescript
class NotificationManager {
  private static instance: NotificationManager;
  private permissionStatus: AuthorizationStatus | null = null;

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  async requestPermission(): Promise<boolean> {
    try {
      const authStatus = await notifee.requestPermission();
      this.permissionStatus = authStatus.authorizationStatus;

      return (
        authStatus.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus.authorizationStatus === AuthorizationStatus.PROVISIONAL
      );
    } catch (error) {
      console.error("Failed to request notification permission:", error);
      return false;
    }
  }

  async checkPermission(): Promise<boolean> {
    if (this.permissionStatus === null) {
      const settings = await notifee.getNotificationSettings();
      this.permissionStatus = settings.authorizationStatus;
    }

    return (
      this.permissionStatus === AuthorizationStatus.AUTHORIZED ||
      this.permissionStatus === AuthorizationStatus.PROVISIONAL
    );
  }

  async ensurePermission(): Promise<boolean> {
    const hasPermission = await this.checkPermission();
    if (!hasPermission) {
      return await this.requestPermission();
    }
    return true;
  }
}
```

### 2. Channel Management

```typescript
class ChannelManager {
  private static channels = new Map<string, boolean>();

  static async createChannel(channelConfig: AndroidChannel): Promise<string> {
    const channelId = channelConfig.id;

    if (this.channels.has(channelId)) {
      return channelId;
    }

    try {
      await notifee.createChannel(channelConfig);
      this.channels.set(channelId, true);
      return channelId;
    } catch (error) {
      console.error(`Failed to create channel ${channelId}:`, error);
      return "default";
    }
  }

  static async createDefaultChannels() {
    const channels = [
      {
        id: "default",
        name: "Default",
        importance: AndroidImportance.HIGH,
      },
      {
        id: "focus-sessions",
        name: "Focus Sessions",
        description: "Notifications for focus sessions",
        importance: AndroidImportance.HIGH,
        sound: "default",
        vibration: true,
      },
      {
        id: "reminders",
        name: "Reminders",
        description: "Task and schedule reminders",
        importance: AndroidImportance.DEFAULT,
        sound: "default",
      },
      {
        id: "background",
        name: "Background Updates",
        description: "Silent background updates",
        importance: AndroidImportance.LOW,
        sound: null,
        vibration: false,
      },
    ];

    for (const channel of channels) {
      await this.createChannel(channel);
    }
  }
}
```

### 3. Notification Queue Management

```typescript
class NotificationQueue {
  private static queue: Array<{
    notification: any;
    trigger?: any;
    id: string;
  }> = [];

  static async add(notification: any, trigger?: any): Promise<string> {
    const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      if (trigger) {
        await notifee.createTriggerNotification(notification, trigger);
      } else {
        await notifee.displayNotification(notification);
      }

      this.queue.push({ notification, trigger, id });
      return id;
    } catch (error) {
      console.error("Failed to add notification to queue:", error);
      throw error;
    }
  }

  static async remove(id: string): Promise<void> {
    try {
      await notifee.cancelNotification(id);
      this.queue = this.queue.filter((item) => item.id !== id);
    } catch (error) {
      console.error("Failed to remove notification:", error);
    }
  }

  static async clearAll(): Promise<void> {
    try {
      await notifee.cancelAllNotifications();
      this.queue = [];
    } catch (error) {
      console.error("Failed to clear all notifications:", error);
    }
  }

  static getQueue(): Array<any> {
    return [...this.queue];
  }
}
```

### 4. Error Handling

```typescript
class NotificationErrorHandler {
  static async safeDisplayNotification(
    notification: any
  ): Promise<string | null> {
    try {
      // Ensure permission
      const hasPermission =
        await NotificationManager.getInstance().ensurePermission();
      if (!hasPermission) {
        console.warn("Notification permission not granted");
        return null;
      }

      // Ensure channel exists
      if (notification.android?.channelId) {
        await ChannelManager.createChannel({
          id: notification.android.channelId,
          name: "Default Channel",
          importance: AndroidImportance.HIGH,
        });
      }

      // Display notification
      return await notifee.displayNotification(notification);
    } catch (error) {
      console.error("Failed to display notification:", error);

      // Fallback to basic notification
      try {
        return await notifee.displayNotification({
          title: notification.title || "Notification",
          body: notification.body || "You have a new notification",
          android: {
            channelId: "default",
          },
        });
      } catch (fallbackError) {
        console.error("Fallback notification also failed:", fallbackError);
        return null;
      }
    }
  }

  static async safeScheduleNotification(
    notification: any,
    trigger: any
  ): Promise<string | null> {
    try {
      const hasPermission =
        await NotificationManager.getInstance().ensurePermission();
      if (!hasPermission) {
        console.warn("Notification permission not granted");
        return null;
      }

      return await notifee.createTriggerNotification(notification, trigger);
    } catch (error) {
      console.error("Failed to schedule notification:", error);
      return null;
    }
  }
}
```

## Platform-Specific Considerations

### iOS Specific

```typescript
// iOS notification categories
const setupIOSCategories = async () => {
  await notifee.setNotificationCategories([
    {
      id: "focus-session",
      actions: [
        {
          id: "start",
          title: "Start Session",
          options: {
            foreground: true,
            authenticationRequired: false,
          },
        },
        {
          id: "snooze",
          title: "Snooze",
          options: {
            foreground: false,
            authenticationRequired: false,
          },
        },
      ],
    },
  ]);
};

// iOS foreground presentation options
const showIOSNotification = async () => {
  await notifee.displayNotification({
    title: "iOS Notification",
    body: "This is an iOS-specific notification",
    ios: {
      categoryId: "focus-session",
      foregroundPresentationOptions: {
        badge: true,
        sound: true,
        banner: true,
        list: true,
      },
      attachments: [
        {
          url: "https://example.com/image.jpg",
          thumbnailHidden: false,
        },
      ],
    },
  });
};
```

### Android Specific

```typescript
// Android notification styles
const showAndroidRichNotification = async () => {
  const channelId = await notifee.createChannel({
    id: "rich",
    name: "Rich Notifications",
    importance: AndroidImportance.HIGH,
  });

  await notifee.displayNotification({
    title: "Android Rich Notification",
    body: "This notification has rich content",
    android: {
      channelId,
      smallIcon: "ic_launcher",
      largeIcon: "https://example.com/large-icon.png",
      style: {
        type: AndroidStyle.BIGTEXT,
        text: "This is the expanded text content that shows when the notification is expanded.",
      },
      pressAction: {
        id: "default",
      },
      actions: [
        {
          title: "Action 1",
          pressAction: {
            id: "action1",
          },
        },
        {
          title: "Action 2",
          pressAction: {
            id: "action2",
          },
        },
      ],
      progress: {
        indeterminate: false,
        max: 100,
        current: 50,
      },
    },
  });
};

// Android foreground service
const startAndroidForegroundService = async () => {
  const channelId = await notifee.createChannel({
    id: "foreground-service",
    name: "Foreground Service",
    importance: AndroidImportance.LOW,
  });

  await notifee.displayNotification({
    title: "Foreground Service",
    body: "Service is running",
    android: {
      channelId,
      asForegroundService: true,
      ongoing: true,
      progress: {
        indeterminate: true,
      },
    },
  });
};
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Notifications Not Showing

```typescript
const debugNotificationIssues = async () => {
  // Check permissions
  const settings = await notifee.getNotificationSettings();
  console.log("Notification settings:", settings);

  // Check if app is in foreground
  const appState = await notifee.getAppState();
  console.log("App state:", appState);

  // Check channel status (Android)
  const channels = await notifee.getChannels();
  console.log("Available channels:", channels);

  // Test basic notification
  try {
    await notifee.displayNotification({
      title: "Debug Test",
      body: "Testing notification system",
      android: {
        channelId: "default",
      },
    });
    console.log("Basic notification sent successfully");
  } catch (error) {
    console.error("Failed to send basic notification:", error);
  }
};
```

#### 2. Background Tasks Not Working

```typescript
const debugBackgroundTasks = async () => {
  // Check if background tasks are supported
  const isSupported = await notifee.isBackgroundTaskSupported();
  console.log("Background tasks supported:", isSupported);

  // Register background task with error handling
  await notifee.registerBackgroundTask(async (event) => {
    console.log("Background task triggered:", event);

    try {
      // Your background task logic here
      const result = await processBackgroundData(event);
      return { success: true, data: result };
    } catch (error) {
      console.error("Background task failed:", error);
      return { success: false, error: error.message };
    }
  });
};
```

#### 3. Permission Issues

```typescript
const handlePermissionIssues = async () => {
  const settings = await notifee.getNotificationSettings();

  switch (settings.authorizationStatus) {
    case AuthorizationStatus.DENIED:
      console.log("Notifications are denied");
      // Show custom permission request UI
      showCustomPermissionRequest();
      break;
    case AuthorizationStatus.NOT_DETERMINED:
      console.log("Permission not determined");
      // Request permission
      await notifee.requestPermission();
      break;
    case AuthorizationStatus.AUTHORIZED:
      console.log("Notifications are authorized");
      break;
    case AuthorizationStatus.PROVISIONAL:
      console.log("Notifications are provisionally authorized");
      break;
    case AuthorizationStatus.EPHEMERAL:
      console.log("Notifications are ephemerally authorized");
      break;
  }
};
```

## Real-World Examples

### 1. Focus Session Notifications

```typescript
class FocusSessionNotifications {
  static async startSessionNotification(sessionDuration: number) {
    const channelId = await notifee.createChannel({
      id: "focus-sessions",
      name: "Focus Sessions",
      importance: AndroidImportance.HIGH,
      sound: "default",
      vibration: true,
    });

    // Session start notification
    await notifee.displayNotification({
      title: "Focus Session Started",
      body: `Session duration: ${sessionDuration} minutes`,
      android: {
        channelId,
        smallIcon: "ic_launcher",
        ongoing: true,
        progress: {
          indeterminate: true,
        },
        actions: [
          {
            title: "Pause",
            pressAction: { id: "pause-session" },
          },
          {
            title: "End",
            pressAction: { id: "end-session" },
          },
        ],
      },
      ios: {
        categoryId: "focus-session",
      },
    });

    // Schedule session end notification
    await notifee.createTriggerNotification(
      {
        title: "Focus Session Complete!",
        body: "Great job! Your session has ended.",
        android: {
          channelId,
          sound: "default",
          vibration: true,
          pressAction: { id: "session-complete" },
        },
        ios: {
          categoryId: "focus-session",
          sound: "default",
        },
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: Date.now() + sessionDuration * 60 * 1000,
      }
    );
  }

  static async pauseSessionNotification() {
    await notifee.displayNotification({
      title: "Session Paused",
      body: "Your focus session is paused",
      android: {
        channelId: "focus-sessions",
        ongoing: false,
        actions: [
          {
            title: "Resume",
            pressAction: { id: "resume-session" },
          },
        ],
      },
    });
  }

  static async endSessionNotification() {
    await notifee.cancelAllNotifications();

    await notifee.displayNotification({
      title: "Session Ended",
      body: "Your focus session has been completed",
      android: {
        channelId: "focus-sessions",
        sound: "default",
        pressAction: { id: "session-summary" },
      },
    });
  }
}
```

### 2. Task Reminder System

```typescript
class TaskReminderSystem {
  static async scheduleTaskReminder(task: {
    id: string;
    title: string;
    dueDate: Date;
    priority: "high" | "medium" | "low";
  }) {
    const channelId = await notifee.createChannel({
      id: "task-reminders",
      name: "Task Reminders",
      importance: AndroidImportance.DEFAULT,
      sound: "default",
    });

    // Schedule reminder 1 hour before due date
    const reminderTime = new Date(task.dueDate.getTime() - 60 * 60 * 1000);

    await notifee.createTriggerNotification(
      {
        title: "Task Reminder",
        body: `"${task.title}" is due in 1 hour`,
        android: {
          channelId,
          smallIcon: "ic_launcher",
          pressAction: { id: "open-task" },
          actions: [
            {
              title: "Complete",
              pressAction: { id: "complete-task" },
            },
            {
              title: "Snooze",
              pressAction: { id: "snooze-task" },
            },
          ],
          data: {
            taskId: task.id,
            taskTitle: task.title,
          },
        },
        ios: {
          categoryId: "task-reminder",
          data: {
            taskId: task.id,
            taskTitle: task.title,
          },
        },
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: reminderTime.getTime(),
      }
    );

    // Schedule overdue notification
    await notifee.createTriggerNotification(
      {
        title: "Task Overdue",
        body: `"${task.title}" is overdue`,
        android: {
          channelId,
          sound: "default",
          vibration: true,
          pressAction: { id: "open-task" },
        },
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: task.dueDate.getTime(),
      }
    );
  }

  static async handleTaskAction(pressAction: any, notification: any) {
    const taskId = notification?.data?.taskId;

    switch (pressAction.id) {
      case "complete-task":
        await this.completeTask(taskId);
        break;
      case "snooze-task":
        await this.snoozeTask(taskId);
        break;
      case "open-task":
        await this.openTask(taskId);
        break;
    }
  }

  private static async completeTask(taskId: string) {
    // Mark task as complete
    console.log("Completing task:", taskId);

    // Cancel related notifications
    await notifee.cancelTriggerNotifications([`task-${taskId}`]);
  }

  private static async snoozeTask(taskId: string) {
    // Reschedule for 15 minutes later
    const newTime = Date.now() + 15 * 60 * 1000;

    await notifee.createTriggerNotification(
      {
        title: "Task Reminder (Snoozed)",
        body: "Your snoozed task reminder",
        android: {
          channelId: "task-reminders",
          pressAction: { id: "open-task" },
        },
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: newTime,
      }
    );
  }

  private static async openTask(taskId: string) {
    // Navigate to task detail screen
    console.log("Opening task:", taskId);
  }
}
```

### 3. Daily Streak System

```typescript
class StreakNotificationSystem {
  static async checkAndNotifyStreak(
    currentStreak: number,
    lastActivityDate: Date
  ) {
    const today = new Date();
    const lastActivity = new Date(lastActivityDate);

    // Check if user missed a day
    const daysSinceLastActivity = Math.floor(
      (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastActivity === 1) {
      // User missed yesterday, send streak warning
      await this.sendStreakWarning(currentStreak);
    } else if (daysSinceLastActivity >= 2) {
      // User lost streak, send motivation
      await this.sendStreakLostNotification(currentStreak);
    }
  }

  static async sendStreakWarning(currentStreak: number) {
    const channelId = await notifee.createChannel({
      id: "streak-notifications",
      name: "Streak Notifications",
      importance: AndroidImportance.HIGH,
      sound: "default",
    });

    await notifee.displayNotification({
      title: "🔥 Don't Break Your Streak!",
      body: `You're on a ${currentStreak} day streak. Complete a session today to keep it going!`,
      android: {
        channelId,
        smallIcon: "ic_launcher",
        pressAction: { id: "start-session" },
        actions: [
          {
            title: "Start Session",
            pressAction: { id: "start-session" },
          },
        ],
      },
      ios: {
        categoryId: "streak-notification",
      },
    });
  }

  static async sendStreakLostNotification(lostStreak: number) {
    const channelId = await notifee.createChannel({
      id: "streak-notifications",
      name: "Streak Notifications",
      importance: AndroidImportance.DEFAULT,
    });

    await notifee.displayNotification({
      title: "Streak Lost 😔",
      body: `Your ${lostStreak} day streak has ended. Start a new one today!`,
      android: {
        channelId,
        pressAction: { id: "start-session" },
        actions: [
          {
            title: "Start New Streak",
            pressAction: { id: "start-session" },
          },
        ],
      },
    });
  }

  static async sendStreakMilestone(currentStreak: number) {
    const milestones = [7, 30, 100, 365];

    if (milestones.includes(currentStreak)) {
      const channelId = await notifee.createChannel({
        id: "streak-notifications",
        name: "Streak Notifications",
        importance: AndroidImportance.HIGH,
        sound: "default",
      });

      await notifee.displayNotification({
        title: `🎉 ${currentStreak} Day Streak!`,
        body: `Congratulations! You've maintained your focus for ${currentStreak} days!`,
        android: {
          channelId,
          smallIcon: "ic_launcher",
          pressAction: { id: "view-achievement" },
        },
      });
    }
  }
}
```

## Performance Optimization

### 1. Batch Operations

```typescript
class NotificationBatchManager {
  static async batchScheduleNotifications(
    notifications: Array<{
      notification: any;
      trigger: any;
    }>
  ) {
    const promises = notifications.map(({ notification, trigger }) =>
      notifee.createTriggerNotification(notification, trigger)
    );

    try {
      const results = await Promise.allSettled(promises);
      const successful = results.filter(
        (result) => result.status === "fulfilled"
      );
      const failed = results.filter((result) => result.status === "rejected");

      console.log(
        `Scheduled ${successful.length} notifications, ${failed.length} failed`
      );
      return { successful, failed };
    } catch (error) {
      console.error("Batch scheduling failed:", error);
      throw error;
    }
  }

  static async batchCancelNotifications(notificationIds: string[]) {
    const promises = notificationIds.map((id) =>
      notifee.cancelNotification(id)
    );

    try {
      await Promise.allSettled(promises);
      console.log(`Cancelled ${notificationIds.length} notifications`);
    } catch (error) {
      console.error("Batch cancellation failed:", error);
    }
  }
}
```

### 2. Memory Management

```typescript
class NotificationMemoryManager {
  private static notificationCache = new Map<string, any>();
  private static maxCacheSize = 100;

  static cacheNotification(id: string, notification: any) {
    if (this.notificationCache.size >= this.maxCacheSize) {
      // Remove oldest entry
      const firstKey = this.notificationCache.keys().next().value;
      this.notificationCache.delete(firstKey);
    }

    this.notificationCache.set(id, notification);
  }

  static getCachedNotification(id: string) {
    return this.notificationCache.get(id);
  }

  static clearCache() {
    this.notificationCache.clear();
  }

  static getCacheSize() {
    return this.notificationCache.size;
  }
}
```

### 3. Efficient Channel Management

```typescript
class EfficientChannelManager {
  private static channelCache = new Set<string>();

  static async ensureChannel(channelConfig: AndroidChannel): Promise<string> {
    if (this.channelCache.has(channelConfig.id)) {
      return channelConfig.id;
    }

    try {
      await notifee.createChannel(channelConfig);
      this.channelCache.add(channelConfig.id);
      return channelConfig.id;
    } catch (error) {
      console.error(`Failed to create channel ${channelConfig.id}:`, error);
      return "default";
    }
  }

  static async preloadChannels(channels: AndroidChannel[]) {
    const promises = channels.map((channel) => this.ensureChannel(channel));
    await Promise.allSettled(promises);
  }
}
```

## Security Considerations

### 1. Data Validation

```typescript
class NotificationSecurity {
  static validateNotificationData(data: any): boolean {
    // Check for malicious content
    const maliciousPatterns = [/<script/i, /javascript:/i, /data:text\/html/i];

    const title = data.title || "";
    const body = data.body || "";

    for (const pattern of maliciousPatterns) {
      if (pattern.test(title) || pattern.test(body)) {
        console.warn("Malicious content detected in notification");
        return false;
      }
    }

    return true;
  }

  static sanitizeNotificationData(data: any) {
    return {
      ...data,
      title: this.sanitizeText(data.title),
      body: this.sanitizeText(data.body),
    };
  }

  private static sanitizeText(text: string): string {
    if (!text) return "";

    // Remove HTML tags
    return text.replace(/<[^>]*>/g, "");
  }
}
```

### 2. Permission Validation

```typescript
class PermissionValidator {
  static async validateNotificationPermission(): Promise<boolean> {
    try {
      const settings = await notifee.getNotificationSettings();

      // Check if notifications are enabled
      if (settings.authorizationStatus === AuthorizationStatus.DENIED) {
        console.warn("Notification permission denied");
        return false;
      }

      // Check if app is in background (iOS)
      if (Platform.OS === "ios") {
        const appState = await notifee.getAppState();
        if (appState === "background") {
          // Additional validation for background notifications
          return this.validateBackgroundPermissions();
        }
      }

      return true;
    } catch (error) {
      console.error("Permission validation failed:", error);
      return false;
    }
  }

  private static async validateBackgroundPermissions(): Promise<boolean> {
    // Add specific background permission checks here
    return true;
  }
}
```

## Conclusion

Notifee is a powerful library that provides comprehensive notification capabilities for React Native applications. By following these best practices and patterns, you can create robust, user-friendly notification systems that enhance your app's functionality and user experience.

### Key Takeaways

1. **Always request permissions** before showing notifications
2. **Use appropriate channels** for different notification types
3. **Handle errors gracefully** with fallback mechanisms
4. **Optimize performance** with batch operations and caching
5. **Consider platform differences** between iOS and Android
6. **Implement proper security measures** to prevent abuse
7. **Test thoroughly** on both platforms with different scenarios

### Additional Resources

- [Notifee Official Documentation](https://notifee.app/)
- [React Native Notifee GitHub](https://github.com/invertase/react-native-notifee)
- [iOS Notification Programming Guide](https://developer.apple.com/documentation/usernotifications)
- [Android Notification Guide](https://developer.android.com/guide/topics/ui/notifiers/notifications)

Remember to always test your notification implementation thoroughly on both iOS and Android devices, as behavior can vary significantly between platforms and OS versions.
