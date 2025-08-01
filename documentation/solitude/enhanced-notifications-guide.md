# Enhanced Notifications System Guide

## Overview

The enhanced notifications system provides a comprehensive solution for handling all notification types in the Solitude app, including action buttons, proper event handling, and background processing.

## Features

### Core Functionality

- **Action Buttons**: Interactive notification buttons for quick actions
- **Background Processing**: Handle actions when app is in background
- **Multiple Notification Types**: Session, task, streak, flow, and break notifications
- **Proper Event Handling**: Foreground and background event listeners
- **Scheduled Notifications**: Time-based notifications with triggers
- **Progress Indicators**: Ongoing notifications with progress bars
- **Priority Management**: High, default, and low priority notifications

## Architecture

### NotificationService Class

The `NotificationService` class handles all notification functionality:

```typescript
class NotificationService {
  private router: any;
  private sessionStore: any;
  private taskStore: any;
  private journalStore: any;

  // Methods for different notification types
  async showSessionStartNotification(sessionType: string, duration: number);
  async scheduleSessionEndNotification(sessionType: string, duration: number);
  async showSessionPauseNotification();
  async showSessionResumeNotification();
  async scheduleBreakReminder(sessionDuration: number);
  async showStreakMilestoneNotification(streakCount: number);
  async scheduleTaskReminder(task: Task);
  async showFlowProgressNotification(
    flowName: string,
    currentStep: number,
    totalSteps: number
  );
  async showFlowCompletionNotification(flowName: string, totalTime: number);
}
```

### useNotifications Hook

The hook provides a clean interface to the notification service:

```typescript
export const useNotifications = () => {
  const router = useRouter();
  const sessionStore = useSessionStore();
  const taskStore = useTaskStore();
  const journalStore = useJournalStore();

  return {
    initialize: () => notificationService.initialize(),
    displayNotification: (config: NotificationConfig) =>
      notificationService.displayNotification(config),
    scheduleNotification: (config: NotificationConfig, trigger: any) =>
      notificationService.scheduleNotification(config, trigger),
    cancelNotification: (id: string) =>
      notificationService.cancelNotification(id),
    cancelAllNotifications: () => notificationService.cancelAllNotifications(),
    // Session methods
    showSessionStartNotification: (sessionType: string, duration: number) =>
      notificationService.showSessionStartNotification(sessionType, duration),
    scheduleSessionEndNotification: (sessionType: string, duration: number) =>
      notificationService.scheduleSessionEndNotification(sessionType, duration),
    showSessionPauseNotification: () =>
      notificationService.showSessionPauseNotification(),
    showSessionResumeNotification: () =>
      notificationService.showSessionResumeNotification(),
    scheduleBreakReminder: (sessionDuration: number) =>
      notificationService.scheduleBreakReminder(sessionDuration),
    showStreakMilestoneNotification: (streakCount: number) =>
      notificationService.showStreakMilestoneNotification(streakCount),
    scheduleTaskReminder: (task: any) =>
      notificationService.scheduleTaskReminder(task),
    showFlowProgressNotification: (
      flowName: string,
      currentStep: number,
      totalSteps: number
    ) =>
      notificationService.showFlowProgressNotification(
        flowName,
        currentStep,
        totalSteps
      ),
    showFlowCompletionNotification: (flowName: string, totalTime: number) =>
      notificationService.showFlowCompletionNotification(flowName, totalTime),
  };
};
```

## Notification Types

### 1. Session Notifications

#### Session Start

- **Trigger**: When user starts a focus session
- **Actions**: Pause, End
- **Features**: Ongoing notification with progress indicator

```typescript
await notifications.showSessionStartNotification("Classic", 25);
```

#### Session End

- **Trigger**: Scheduled when session starts
- **Actions**: Reflect, Start Next
- **Features**: High priority with vibration

```typescript
await notifications.scheduleSessionEndNotification("Classic", 25);
```

#### Session Pause/Resume

- **Trigger**: When session is paused/resumed
- **Actions**: Resume, End Session (for pause)
- **Features**: Immediate feedback

```typescript
// Automatically handled by useEffect in focus.tsx
```

### 2. Task Notifications

#### Task Reminders

- **Trigger**: 30 minutes before task due date
- **Actions**: Start Task, Snooze
- **Features**: Task-specific data

```typescript
await notifications.scheduleTaskReminder({
  id: "task-1",
  name: "Complete project documentation",
  dueDate: new Date(Date.now() + 60 * 60 * 1000),
  priority: "important",
});
```

### 3. Streak Notifications

#### Milestone Achievements

- **Trigger**: When user reaches streak milestones (7, 30, 100, 365 days)
- **Actions**: Share, Continue
- **Features**: Celebratory messages

```typescript
await notifications.showStreakMilestoneNotification(7);
```

### 4. Break Notifications

#### Break Reminders

- **Trigger**: After session completion
- **Actions**: Start Break, Skip Break
- **Features**: Encourages healthy breaks

```typescript
await notifications.scheduleBreakReminder(25);
```

### 5. Flow Notifications

#### Flow Progress

- **Trigger**: When flow step is completed
- **Actions**: View Progress, Continue
- **Features**: Progress tracking

```typescript
await notifications.showFlowProgressNotification("Morning Routine", 2, 5);
```

#### Flow Completion

- **Trigger**: When flow is completed
- **Actions**: Reflect, View Stats
- **Features**: Completion celebration

```typescript
await notifications.showFlowCompletionNotification("Morning Routine", 120);
```

## Action Button Handling

### Foreground Actions

Actions are handled in the `handleActionPress` method:

```typescript
private handleActionPress(pressAction: any, notification: any) {
  const actionId = pressAction.id;
  const data = notification?.data;

  switch (actionId) {
    case "start-session":
      resumeSession();
      break;
    case "pause-session":
      pauseSession();
      break;
    case "end-session":
      reset();
      break;
    case "resume-session":
      resumeSession();
      break;
    case "start-task":
      if (data?.taskId && this.taskStore) {
        this.taskStore.getState().setCurrentTask(data.taskId);
        resumeSession();
      }
      break;
    case "complete-task":
      if (data?.taskId && this.taskStore) {
        this.taskStore.getState().completeCurrentTask();
      }
      break;
    case "reflect-session":
      if (this.router) {
        this.router.push("/(main)/journal");
      }
      break;
    case "view-stats":
      if (this.router) {
        this.router.push("/(main)/insights");
      }
      break;
    // ... more actions
  }
}
```

### Background Actions

Background actions are handled in `handleBackgroundAction`:

```typescript
private async handleBackgroundAction(pressAction: any, notification: any) {
  const actionId = pressAction.id;
  const data = notification?.data;

  switch (actionId) {
    case "start-session":
      await AsyncStorage.setItem("pendingAction", "start-session");
      break;
    case "complete-task":
      if (data?.taskId) {
        await this.completeTaskInBackground(data.taskId);
      }
      break;
    case "snooze-task":
      if (data?.taskId) {
        await this.rescheduleTaskReminder(data.taskId);
      }
      break;
  }
}
```

## Notification Channels

The system creates multiple notification channels for different purposes:

```typescript
const channels = [
  {
    id: "focus-sessions",
    name: "Focus Sessions",
    description: "Notifications for focus sessions",
    importance: AndroidImportance.HIGH,
    sound: "default",
    vibration: true,
    lights: true,
    lightColor: AndroidColor.BLUE,
  },
  {
    id: "task-reminders",
    name: "Task Reminders",
    description: "Reminders for tasks and to-dos",
    importance: AndroidImportance.DEFAULT,
    sound: "default",
    vibration: true,
  },
  {
    id: "streak-notifications",
    name: "Streak Notifications",
    description: "Daily streak reminders and achievements",
    importance: AndroidImportance.HIGH,
    sound: "default",
    vibration: true,
    lights: true,
    lightColor: AndroidColor.GREEN,
  },
  {
    id: "break-reminders",
    name: "Break Reminders",
    description: "Reminders to take breaks",
    importance: AndroidImportance.DEFAULT,
    sound: "default",
    vibration: true,
  },
  {
    id: "flow-notifications",
    name: "Flow Notifications",
    description: "Notifications for flow progress and completion",
    importance: AndroidImportance.HIGH,
    sound: "default",
    vibration: true,
    lights: true,
    lightColor: AndroidColor.PURPLE,
  },
];
```

## Usage Examples

### Basic Usage

```typescript
import { useNotifications } from "@/hooks/useNotifications";

export default function MyComponent() {
  const notifications = useNotifications();

  const handleSessionStart = async () => {
    await notifications.showSessionStartNotification("Classic", 25);
  };

  const handleTaskReminder = async () => {
    await notifications.scheduleTaskReminder({
      id: "task-1",
      name: "Complete documentation",
      dueDate: new Date(Date.now() + 60 * 60 * 1000),
      priority: "important",
    });
  };

  return (
    <View>
      <TouchableOpacity onPress={handleSessionStart}>
        <Text>Start Session</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### Custom Notifications

```typescript
await notifications.displayNotification({
  id: "custom-notification",
  title: "Custom Title",
  body: "Custom message",
  data: { customData: "value" },
  actions: [
    { id: "action-1", title: "Action 1", icon: "play" },
    { id: "action-2", title: "Action 2", icon: "stop", destructive: true },
  ],
  ongoing: true,
  progress: { indeterminate: true },
  priority: "high",
});
```

### Scheduled Notifications

```typescript
await notifications.scheduleNotification(
  {
    id: "scheduled-notification",
    title: "Scheduled Title",
    body: "Scheduled message",
    actions: [
      { id: "snooze", title: "Snooze", icon: "time" },
      { id: "dismiss", title: "Dismiss", icon: "close" },
    ],
  },
  {
    type: TriggerType.TIMESTAMP,
    timestamp: Date.now() + 60 * 60 * 1000, // 1 hour from now
  }
);
```

## Testing

Use the `NotificationTest` component to test all notification types:

```typescript
import NotificationTest from "@/components/NotificationTest";

// Add to any screen for testing
<NotificationTest />
```

## Best Practices

1. **Always handle errors**: Wrap notification calls in try-catch blocks
2. **Use appropriate priorities**: High for important actions, default for regular notifications
3. **Provide meaningful actions**: Give users useful quick actions
4. **Test background behavior**: Ensure actions work when app is in background
5. **Clean up notifications**: Cancel notifications when they're no longer needed
6. **Use consistent icons**: Use standard icon names for actions
7. **Handle pending actions**: Check for pending actions when app opens

## Troubleshooting

### Common Issues

1. **Notifications not showing**: Check permissions and channel creation
2. **Actions not working**: Verify action IDs match handler cases
3. **Background actions failing**: Ensure proper AsyncStorage handling
4. **Scheduled notifications not firing**: Check trigger configuration

### Debug Tips

1. Add console logs to action handlers
2. Test with different notification types
3. Verify channel creation
4. Check notification permissions
5. Test on both foreground and background

## Future Enhancements

1. **Rich notifications**: Add images and expanded content
2. **Custom sounds**: Support for custom notification sounds
3. **Notification groups**: Group related notifications
4. **Smart scheduling**: AI-powered notification timing
5. **User preferences**: Allow users to customize notification behavior
6. **Analytics**: Track notification engagement
7. **A/B testing**: Test different notification strategies
