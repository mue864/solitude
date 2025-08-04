# Notifee Examples for Focus App

This document provides practical examples of how to implement Notifee notifications specifically for your focus app, including focus sessions, task management, and streak tracking.

## Quick Setup

First, ensure you have the basic setup in your `focus.tsx` file:

```typescript
import notifee, {
  AndroidImportance,
  EventType,
  TriggerType,
  RepeatFrequency,
  AuthorizationStatus,
} from "@notifee/react-native";

// Initialize notification system
const initializeNotifications = async () => {
  // Request permissions
  await notifee.requestPermission();

  // Create channels
  await createNotificationChannels();

  // Setup event listeners
  setupNotificationListeners();
};
```

## 1. Focus Session Notifications

### Session Start Notification

```typescript
const showSessionStartNotification = async (
  sessionType: string,
  duration: number
) => {
  const channelId = await notifee.createChannel({
    id: "focus-sessions",
    name: "Focus Sessions",
    description: "Notifications for focus sessions",
    importance: AndroidImportance.HIGH,
    sound: "default",
    vibration: true,
  });

  await notifee.displayNotification({
    title: `🎯 ${sessionType} Session Started`,
    body: `Focus for ${duration} minutes`,
    android: {
      channelId,
      smallIcon: "ic_launcher",
      ongoing: true, // Keep notification persistent
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
      pressAction: {
        id: "open-app",
      },
    },
    ios: {
      categoryId: "focus-session",
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

### Session End Notification

```typescript
const scheduleSessionEndNotification = async (
  sessionType: string,
  duration: number
) => {
  const channelId = await notifee.createChannel({
    id: "focus-sessions",
    name: "Focus Sessions",
    importance: AndroidImportance.HIGH,
    sound: "default",
    vibration: true,
  });

  // Schedule notification for when session ends
  await notifee.createTriggerNotification(
    {
      title: "🎉 Session Complete!",
      body: `Great job! You've completed your ${sessionType} session.`,
      android: {
        channelId,
        smallIcon: "ic_launcher",
        sound: "default",
        vibration: true,
        pressAction: { id: "session-complete" },
        actions: [
          {
            title: "Reflect",
            pressAction: { id: "reflect-session" },
          },
          {
            title: "Start Next",
            pressAction: { id: "start-next-session" },
          },
        ],
      },
      ios: {
        categoryId: "session-complete",
        sound: "default",
      },
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp: Date.now() + duration * 60 * 1000, // Convert minutes to milliseconds
    }
  );
};
```

### Session Pause/Resume Notifications

```typescript
const showSessionPausedNotification = async () => {
  const channelId = await notifee.createChannel({
    id: "focus-sessions",
    name: "Focus Sessions",
    importance: AndroidImportance.DEFAULT,
  });

  await notifee.displayNotification({
    title: "⏸️ Session Paused",
    body: "Your focus session is paused. Tap to resume.",
    android: {
      channelId,
      smallIcon: "ic_launcher",
      ongoing: false,
      pressAction: { id: "resume-session" },
      actions: [
        {
          title: "Resume",
          pressAction: { id: "resume-session" },
        },
        {
          title: "End Session",
          pressAction: { id: "end-session" },
        },
      ],
    },
    ios: {
      categoryId: "session-paused",
    },
  });
};

const showSessionResumedNotification = async () => {
  const channelId = await notifee.createChannel({
    id: "focus-sessions",
    name: "Focus Sessions",
    importance: AndroidImportance.HIGH,
  });

  await notifee.displayNotification({
    title: "▶️ Session Resumed",
    body: "Back to focusing!",
    android: {
      channelId,
      smallIcon: "ic_launcher",
      ongoing: true,
      progress: {
        indeterminate: true,
      },
    },
    ios: {
      categoryId: "focus-session",
    },
  });
};
```

## 2. Task Management Notifications

### Task Reminder Notifications

```typescript
const scheduleTaskReminder = async (task: {
  id: string;
  name: string;
  dueDate: Date;
  priority: "urgent" | "important" | "quickwin" | "deepwork";
}) => {
  const channelId = await notifee.createChannel({
    id: "task-reminders",
    name: "Task Reminders",
    description: "Reminders for tasks and to-dos",
    importance: AndroidImportance.DEFAULT,
    sound: "default",
  });

  // Schedule reminder 30 minutes before due date
  const reminderTime = new Date(task.dueDate.getTime() - 30 * 60 * 1000);

  await notifee.createTriggerNotification(
    {
      title: `📋 Task Reminder: ${task.name}`,
      body: `Due in 30 minutes`,
      android: {
        channelId,
        smallIcon: "ic_launcher",
        pressAction: { id: "open-task" },
        actions: [
          {
            title: "Start Task",
            pressAction: { id: "start-task" },
          },
          {
            title: "Snooze",
            pressAction: { id: "snooze-task" },
          },
        ],
        data: {
          taskId: task.id,
          taskName: task.name,
          taskPriority: task.priority,
        },
      },
      ios: {
        categoryId: "task-reminder",
        data: {
          taskId: task.id,
          taskName: task.name,
          taskPriority: task.priority,
        },
      },
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp: reminderTime.getTime(),
    }
  );
};
```

### Task Completion Notifications

```typescript
const showTaskCompletedNotification = async (taskName: string) => {
  const channelId = await notifee.createChannel({
    id: "task-completion",
    name: "Task Completion",
    description: "Notifications when tasks are completed",
    importance: AndroidImportance.DEFAULT,
    sound: "default",
  });

  await notifee.displayNotification({
    title: "✅ Task Completed!",
    body: `"${taskName}" has been completed. Great work!`,
    android: {
      channelId,
      smallIcon: "ic_launcher",
      pressAction: { id: "view-tasks" },
    },
    ios: {
      categoryId: "task-completion",
    },
  });
};
```

## 3. Streak and Motivation Notifications

### Daily Streak Notifications

```typescript
const scheduleDailyStreakReminder = async (currentStreak: number) => {
  const channelId = await notifee.createChannel({
    id: "streak-notifications",
    name: "Streak Notifications",
    description: "Daily streak reminders and achievements",
    importance: AndroidImportance.HIGH,
    sound: "default",
  });

  // Schedule for 9 AM tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  await notifee.createTriggerNotification(
    {
      title: `🔥 ${currentStreak} Day Streak!`,
      body: "Don't break your streak! Start a focus session today.",
      android: {
        channelId,
        smallIcon: "ic_launcher",
        pressAction: { id: "start-session" },
        actions: [
          {
            title: "Start Session",
            pressAction: { id: "start-session" },
          },
          {
            title: "View Stats",
            pressAction: { id: "view-stats" },
          },
        ],
      },
      ios: {
        categoryId: "streak-reminder",
      },
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp: tomorrow.getTime(),
      repeatFrequency: RepeatFrequency.DAILY,
    }
  );
};
```

### Streak Milestone Notifications

```typescript
const showStreakMilestoneNotification = async (streakCount: number) => {
  const milestones = [7, 30, 100, 365];

  if (milestones.includes(streakCount)) {
    const channelId = await notifee.createChannel({
      id: "streak-notifications",
      name: "Streak Notifications",
      importance: AndroidImportance.HIGH,
      sound: "default",
      vibration: true,
    });

    const messages = {
      7: "🎉 One week streak! You're building a great habit!",
      30: "🏆 One month streak! You're unstoppable!",
      100: "💎 100 days! You're a focus master!",
      365: "👑 One year streak! Legendary dedication!",
    };

    await notifee.displayNotification({
      title: `🎊 ${streakCount} Day Streak!`,
      body: messages[streakCount as keyof typeof messages],
      android: {
        channelId,
        smallIcon: "ic_launcher",
        pressAction: { id: "view-achievement" },
        actions: [
          {
            title: "Share",
            pressAction: { id: "share-achievement" },
          },
          {
            title: "Continue",
            pressAction: { id: "start-session" },
          },
        ],
      },
      ios: {
        categoryId: "streak-milestone",
      },
    });
  }
};
```

### Motivation Notifications

```typescript
const scheduleMotivationalReminders = async () => {
  const channelId = await notifee.createChannel({
    id: "motivation",
    name: "Motivation",
    description: "Motivational messages and quotes",
    importance: AndroidImportance.DEFAULT,
  });

  const motivationalMessages = [
    {
      title: "💪 Time to Focus!",
      body: "Every minute of focus brings you closer to your goals.",
    },
    {
      title: "🚀 Ready to Crush It?",
      body: "Your future self will thank you for starting now.",
    },
    {
      title: "⭐ Small Steps, Big Results",
      body: "Consistency beats perfection every time.",
    },
    {
      title: "🎯 Focus Mode Activated",
      body: "Distractions are just opportunities to strengthen your focus.",
    },
  ];

  // Schedule random motivational messages throughout the day
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Schedule for 2 PM today
  const afternoonTime = new Date(today.getTime() + 14 * 60 * 60 * 1000);
  const randomMessage =
    motivationalMessages[
      Math.floor(Math.random() * motivationalMessages.length)
    ];

  await notifee.createTriggerNotification(
    {
      title: randomMessage.title,
      body: randomMessage.body,
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
        categoryId: "motivation",
      },
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp: afternoonTime.getTime(),
    }
  );
};
```

## 4. Break and Rest Notifications

### Break Reminders

```typescript
const scheduleBreakReminder = async (sessionDuration: number) => {
  const channelId = await notifee.createChannel({
    id: "break-reminders",
    name: "Break Reminders",
    description: "Reminders to take breaks",
    importance: AndroidImportance.DEFAULT,
    sound: "default",
  });

  // Schedule break reminder after session
  await notifee.createTriggerNotification(
    {
      title: "☕ Time for a Break!",
      body: "Take a 5-minute break to recharge.",
      android: {
        channelId,
        smallIcon: "ic_launcher",
        pressAction: { id: "start-break" },
        actions: [
          {
            title: "Start Break",
            pressAction: { id: "start-break" },
          },
          {
            title: "Skip Break",
            pressAction: { id: "skip-break" },
          },
        ],
      },
      ios: {
        categoryId: "break-reminder",
      },
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp: Date.now() + sessionDuration * 60 * 1000,
    }
  );
};
```

### Break End Notifications

```typescript
const scheduleBreakEndNotification = async (breakDuration: number) => {
  const channelId = await notifee.createChannel({
    id: "break-reminders",
    name: "Break Reminders",
    importance: AndroidImportance.DEFAULT,
  });

  await notifee.createTriggerNotification(
    {
      title: "⏰ Break Time Over",
      body: "Ready to get back to focusing?",
      android: {
        channelId,
        smallIcon: "ic_launcher",
        pressAction: { id: "start-session" },
        actions: [
          {
            title: "Start Session",
            pressAction: { id: "start-session" },
          },
          {
            title: "Extend Break",
            pressAction: { id: "extend-break" },
          },
        ],
      },
      ios: {
        categoryId: "break-end",
      },
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp: Date.now() + breakDuration * 60 * 1000,
    }
  );
};
```

## 5. Event Handling

### Setup Event Listeners

```typescript
const setupNotificationListeners = () => {
  // Foreground events
  const unsubscribeForeground = notifee.onForegroundEvent(
    ({ type, detail }) => {
      switch (type) {
        case EventType.PRESS:
          handleNotificationPress(detail.notification);
          break;
        case EventType.ACTION_PRESS:
          handleActionPress(detail.pressAction, detail.notification);
          break;
        case EventType.DISMISSED:
          console.log("Notification dismissed:", detail.notification);
          break;
      }
    }
  );

  // Background events
  notifee.onBackgroundEvent(async ({ type, detail }) => {
    if (type === EventType.ACTION_PRESS) {
      await handleBackgroundAction(detail.pressAction, detail.notification);
    }
  });

  return unsubscribeForeground;
};

const handleNotificationPress = (notification: any) => {
  const data = notification?.data;

  if (data?.screen) {
    // Navigate to specific screen
    router.push(data.screen);
  } else {
    // Default behavior - open app
    console.log("Opening app from notification");
  }
};

const handleActionPress = (pressAction: any, notification: any) => {
  const actionId = pressAction.id;
  const data = notification?.data;

  switch (actionId) {
    case "start-session":
      // Start a new focus session
      resumeSession();
      break;
    case "pause-session":
      // Pause current session
      pauseSession();
      break;
    case "end-session":
      // End current session
      reset();
      break;
    case "resume-session":
      // Resume paused session
      resumeSession();
      break;
    case "start-task":
      // Start working on a specific task
      if (data?.taskId) {
        // Set current task
        setCurrentTask(data.taskId);
        resumeSession();
      }
      break;
    case "complete-task":
      // Mark task as complete
      if (data?.taskId) {
        completeCurrentTask();
      }
      break;
    case "reflect-session":
      // Open reflection modal
      setShowReflect(true);
      break;
    case "view-stats":
      // Navigate to insights
      router.push("/(main)/insights");
      break;
    case "start-break":
      // Start break timer
      startBreak();
      break;
    default:
      console.log("Unknown action:", actionId);
  }
};

const handleBackgroundAction = async (pressAction: any, notification: any) => {
  // Handle actions when app is in background
  const actionId = pressAction.id;
  const data = notification?.data;

  switch (actionId) {
    case "start-session":
      // Schedule session start for when app opens
      await AsyncStorage.setItem("pendingAction", "start-session");
      break;
    case "complete-task":
      // Mark task as complete in background
      if (data?.taskId) {
        await completeTaskInBackground(data.taskId);
      }
      break;
    case "snooze-task":
      // Reschedule task reminder
      if (data?.taskId) {
        await rescheduleTaskReminder(data.taskId);
      }
      break;
  }
};
```

## 6. Notification Categories (iOS)

### Setup Categories

```typescript
const setupNotificationCategories = async () => {
  await notifee.setNotificationCategories([
    {
      id: "focus-session",
      actions: [
        {
          id: "pause-session",
          title: "Pause",
          options: {
            foreground: true,
          },
        },
        {
          id: "end-session",
          title: "End Session",
          options: {
            foreground: true,
            destructive: true,
          },
        },
      ],
    },
    {
      id: "session-complete",
      actions: [
        {
          id: "reflect-session",
          title: "Reflect",
          options: {
            foreground: true,
          },
        },
        {
          id: "start-next-session",
          title: "Start Next",
          options: {
            foreground: true,
          },
        },
      ],
    },
    {
      id: "task-reminder",
      actions: [
        {
          id: "start-task",
          title: "Start Task",
          options: {
            foreground: true,
          },
        },
        {
          id: "snooze-task",
          title: "Snooze 15 min",
          options: {
            foreground: false,
          },
        },
      ],
    },
    {
      id: "streak-reminder",
      actions: [
        {
          id: "start-session",
          title: "Start Session",
          options: {
            foreground: true,
          },
        },
        {
          id: "view-stats",
          title: "View Stats",
          options: {
            foreground: true,
          },
        },
      ],
    },
  ]);
};
```

## 7. Integration with Your Focus App

### Update Your Focus Component

```typescript
// In your focus.tsx file, add these functions:

const initializeNotificationSystem = async () => {
  try {
    // Request permissions
    await notifee.requestPermission();

    // Create channels
    await createNotificationChannels();

    // Setup categories
    await setupNotificationCategories();

    // Setup event listeners
    const unsubscribe = setupNotificationListeners();

    return unsubscribe;
  } catch (error) {
    console.error("Failed to initialize notification system:", error);
  }
};

const createNotificationChannels = async () => {
  const channels = [
    {
      id: "focus-sessions",
      name: "Focus Sessions",
      description: "Notifications for focus sessions",
      importance: AndroidImportance.HIGH,
      sound: "default",
      vibration: true,
    },
    {
      id: "task-reminders",
      name: "Task Reminders",
      description: "Reminders for tasks and to-dos",
      importance: AndroidImportance.DEFAULT,
      sound: "default",
    },
    {
      id: "streak-notifications",
      name: "Streak Notifications",
      description: "Daily streak reminders and achievements",
      importance: AndroidImportance.HIGH,
      sound: "default",
    },
    {
      id: "break-reminders",
      name: "Break Reminders",
      description: "Reminders to take breaks",
      importance: AndroidImportance.DEFAULT,
      sound: "default",
    },
  ];

  for (const channel of channels) {
    await notifee.createChannel(channel);
  }
};

// Add to your useEffect
useEffect(() => {
  const unsubscribe = initializeNotificationSystem();

  return () => {
    if (unsubscribe) {
      unsubscribe();
    }
  };
}, []);

// Update your session start function
const handleSessionStart = async () => {
  resumeSession();

  // Show session start notification
  await showSessionStartNotification(sessionType, durationMinutes);

  // Schedule session end notification
  await scheduleSessionEndNotification(sessionType, durationMinutes);

  // Schedule break reminder
  await scheduleBreakReminder(durationMinutes);
};

// Update your session end function
const handleSessionEnd = async () => {
  // Cancel ongoing notifications
  await notifee.cancelAllNotifications();

  // Show completion notification
  await showSessionCompleteNotification();

  // Check for streak milestones
  await showStreakMilestoneNotification(currentStreak);
};
```

## 8. Testing Your Notifications

### Test Function

```typescript
const testNotifications = async () => {
  console.log("Testing notifications...");

  // Test basic notification
  await notifee.displayNotification({
    title: "Test Notification",
    body: "This is a test notification",
    android: {
      channelId: "focus-sessions",
    },
  });

  // Test scheduled notification (5 seconds from now)
  await notifee.createTriggerNotification(
    {
      title: "Scheduled Test",
      body: "This was scheduled 5 seconds ago",
      android: {
        channelId: "focus-sessions",
      },
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp: Date.now() + 5000,
    }
  );

  console.log("Test notifications sent!");
};
```

This comprehensive guide provides practical examples that you can directly integrate into your focus app. The examples cover all the main use cases for a focus app and follow best practices for notification management.
