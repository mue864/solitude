import { useJournalStore } from "@/store/journalStore";
import { useSessionStore } from "@/store/sessionState";
import { useTaskStore } from "@/store/taskStore";
import notifee, {
  AndroidColor,
  AndroidImportance,
  EventType,
  TriggerType,
} from "@notifee/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Alert } from "react-native";

export interface NotificationAction {
  id: string;
  title: string;
  icon?: string;
  destructive?: boolean;
}

export interface NotificationData {
  screen?: string;
  taskId?: string;
  sessionType?: string;
  duration?: number;
  flowId?: string;
  [key: string]: any;
}

export interface NotificationConfig {
  id: string;
  title: string;
  body: string;
  data?: NotificationData;
  actions?: NotificationAction[];
  ongoing?: boolean;
  progress?: {
    indeterminate?: boolean;
    current?: number;
    max?: number;
  };
  sound?: string;
  vibration?: boolean;
  priority?: "high" | "default" | "low";
  autoCancel?: boolean;
  timestamp?: number;
}

class NotificationService {
  private router: any;
  private sessionStore: any;
  private taskStore: any;
  private journalStore: any;
  private isInitialized: boolean = false;
  private eventListeners: any[] = [];

  constructor() {
    this.initializeStores();
  }

  private initializeStores() {
    this.router = null;
    this.sessionStore = null;
    this.taskStore = null;
    this.journalStore = null;
  }

  setStores(router: any, sessionStore: any, taskStore: any, journalStore: any) {
    this.router = router;
    this.sessionStore = sessionStore;
    this.taskStore = taskStore;
    this.journalStore = journalStore;
  }

  async initialize() {
    if (this.isInitialized) {
      console.log("⚠️ Notification service already initialized");
      return;
    }

    try {
      console.log("🚀 Initializing notification service...");

      // Create notification channels
      await this.createNotificationChannels();

      // Setup event listeners
      this.setupEventListeners();

      this.isInitialized = true;
      console.log("✅ Notification service initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize notification service:", error);
      throw error;
    }
  }

  private async createNotificationChannels() {
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
        showBadge: true,
        allowBubbles: true, // Enable action buttons
      },
      {
        id: "task-reminders",
        name: "Task Reminders",
        description: "Reminders for tasks and to-dos",
        importance: AndroidImportance.DEFAULT,
        sound: "default",
        vibration: true,
        showBadge: true,
        allowBubbles: true, // Enable action buttons
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
        showBadge: true,
        allowBubbles: true, // Enable action buttons
      },
      {
        id: "break-reminders",
        name: "Break Reminders",
        description: "Reminders to take breaks",
        importance: AndroidImportance.DEFAULT,
        sound: "default",
        vibration: true,
        showBadge: true,
        allowBubbles: true, // Enable action buttons
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
        showBadge: true,
        allowBubbles: true, // Enable action buttons
      },
      {
        id: "test-channel",
        name: "Test Channel",
        description: "Test notifications with actions",
        importance: AndroidImportance.HIGH,
        sound: "default",
        vibration: true,
        lights: true,
        lightColor: AndroidColor.RED,
        showBadge: true,
        allowBubbles: true, // Enable action buttons
      },
      {
        id: "background-sessions",
        name: "Background Session Reminders",
        description:
          "Notifications to keep the app alive when sessions are running in the background",
        importance: AndroidImportance.HIGH,
        sound: "default",
        vibration: true,
        lights: true,
        lightColor: AndroidColor.YELLOW,
        showBadge: true,
        allowBubbles: true,
      },
    ];

    for (const channel of channels) {
      try {
        await notifee.createChannel(channel);
        console.log(`✅ Created channel: ${channel.id}`);
      } catch (error) {
        console.error(`❌ Failed to create channel ${channel.id}:`, error);
      }
    }
  }

  private setupEventListeners() {
    console.log("🔔 Setting up event listeners...");

    // Clear any existing listeners
    this.eventListeners.forEach((unsubscribe) => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    });
    this.eventListeners = [];

    // Test if notifee is available
    console.log("🔔 Notifee available:", !!notifee);
    console.log("🔔 Notifee methods:", Object.keys(notifee));

    // Foreground events
    const foregroundUnsubscribe = notifee.onForegroundEvent(
      ({ type, detail }) => {
        console.log("📱 Foreground event received:", { type, detail });
        console.log("📱 Event type:", type);
        console.log("📱 Event detail:", JSON.stringify(detail, null, 2));

        switch (type) {
          case EventType.PRESS:
            console.log("👆 Notification pressed");
            this.handleNotificationPress(detail.notification);
            break;
          case EventType.ACTION_PRESS:
            console.log("🔘 Action pressed:", detail.pressAction);
            console.log("🔘 Action ID:", detail.pressAction?.id);
            console.log(
              "🔘 Action data:",
              JSON.stringify(detail.pressAction, null, 2)
            );
            this.handleActionPress(detail.pressAction, detail.notification);
            break;
          case EventType.DISMISSED:
            console.log("❌ Notification dismissed");
            break;
          default:
            console.log("❓ Unknown event type:", type);
        }
      }
    );

    // Background events are now handled at the app level in _layout.tsx
    // to avoid conflicts and ensure proper registration

    this.eventListeners.push(foregroundUnsubscribe);
    console.log("✅ Event listeners setup complete");
    console.log("✅ Foreground listener registered:", !!foregroundUnsubscribe);
    console.log("✅ Background listener handled at app level");
  }

  private handleNotificationPress(notification: any) {
    console.log("👆 Handling notification press:", notification);
    const data = notification?.data;

    if (data?.screen && this.router) {
      console.log("🧭 Navigating to:", data.screen);
      this.router.push(data.screen);
    } else {
      console.log("🏠 Opening app from notification");
    }
  }

  private handleActionPress(pressAction: any, notification: any) {
    const actionId = pressAction.id;
    const data = notification?.data;

    console.log("🔘 Action pressed:", actionId, "with data:", data);

    if (!this.sessionStore) {
      console.log("❌ Session store not available");
      Alert.alert("Error", "Session store not available");
      return;
    }

    const { resumeSession, pauseSession, reset, setSessionType, startFlow } =
      this.sessionStore.getState();

    try {
      switch (actionId) {
        case "start-session":
          console.log("▶️ Starting session from notification");
          resumeSession();
          Alert.alert("Session Started", "Focus session has been started!");
          break;
        case "pause-session":
          console.log("⏸️ Pausing session from notification");
          pauseSession();
          Alert.alert("Session Paused", "Focus session has been paused!");
          break;
        case "end-session":
          console.log("⏹️ Ending session from notification");
          reset();
          Alert.alert("Session Ended", "Focus session has been ended!");
          break;
        case "resume-session":
          console.log("▶️ Resuming session from notification");
          resumeSession();
          Alert.alert("Session Resumed", "Focus session has been resumed!");
          break;
        case "start-task":
          if (data?.taskId && this.taskStore) {
            console.log("📋 Starting task from notification:", data.taskId);
            this.taskStore.getState().setCurrentTask(data.taskId);
            resumeSession();
            Alert.alert("Task Started", "Task has been set as current!");
          } else {
            console.log("❌ Task store not available or no taskId");
            Alert.alert("Error", "Task not available");
          }
          break;
        case "complete-task":
          if (data?.taskId && this.taskStore) {
            console.log("✅ Completing task from notification:", data.taskId);
            this.taskStore.getState().completeCurrentTask();
            Alert.alert("Task Completed", "Task has been marked as complete!");
          } else {
            console.log("❌ Task store not available or no taskId");
            Alert.alert("Error", "Task not available");
          }
          break;
        case "reflect-session":
          console.log("📝 Opening journal from notification");
          if (this.router) {
            this.router.push("/(main)/journal");
            Alert.alert("Journal Opened", "Journal page has been opened!");
          } else {
            console.log("❌ Router not available");
            Alert.alert("Error", "Navigation not available");
          }
          break;
        case "view-stats":
          console.log("📊 Opening insights from notification");
          if (this.router) {
            this.router.push("/(main)/insights");
            Alert.alert("Insights Opened", "Insights page has been opened!");
          } else {
            console.log("❌ Router not available");
            Alert.alert("Error", "Navigation not available");
          }
          break;
        case "start-break":
          console.log("☕ Starting break from notification");
          Alert.alert("Break Started", "Break timer has been started!");
          break;
        case "skip-break":
          console.log("⏭️ Skipping break from notification");
          Alert.alert("Break Skipped", "Break has been skipped!");
          break;
        case "share-achievement":
          console.log("📤 Sharing achievement from notification");
          Alert.alert("Share", "Achievement sharing feature coming soon!");
          break;
        case "view-achievement":
          console.log("🏆 Viewing achievement from notification");
          if (this.router) {
            this.router.push("/(main)/insights");
            Alert.alert("Achievement", "Achievement details opened!");
          } else {
            console.log("❌ Router not available");
            Alert.alert("Error", "Navigation not available");
          }
          break;
        case "start-next-session":
          console.log("🔄 Starting next session from notification");
          resumeSession();
          Alert.alert("Next Session", "Next session has been started!");
          break;
        case "open-task":
          console.log("📋 Opening task from notification");
          if (data?.taskId && this.taskStore) {
            this.taskStore.getState().setCurrentTask(data.taskId);
            Alert.alert("Task Opened", "Task has been set as current!");
          } else {
            console.log("❌ Task store not available or no taskId");
            Alert.alert("Error", "Task not available");
          }
          break;
        case "snooze-task":
          console.log("⏰ Snoozing task from notification");
          if (data?.taskId) {
            this.rescheduleTaskReminder(data.taskId);
            Alert.alert("Task Snoozed", "Task reminder has been snoozed!");
          } else {
            console.log("❌ No taskId for snooze");
            Alert.alert("Error", "Task not available");
          }
          break;
        case "test-action-1":
          console.log("🧪 Test action 1 pressed");
          Alert.alert(
            "Test Action 1",
            "This action was triggered from notification!"
          );
          break;
        case "test-action-2":
          console.log("🧪 Test action 2 pressed");
          Alert.alert(
            "Test Action 2",
            "This action was triggered from notification!"
          );
          break;
        case "session-complete":
          console.log("🎉 Session complete action pressed");
          Alert.alert("Session Complete", "Session completion handled!");
          break;
        case "open-app":
          console.log("🏠 Opening app from notification");
          Alert.alert("App Opened", "App has been opened!");
          break;
        default:
          console.log("❓ Unknown action:", actionId);
          Alert.alert(
            "Unknown Action",
            `Action "${actionId}" is not recognized`
          );
      }
    } catch (error) {
      console.error("❌ Error handling action:", error);
      Alert.alert("Error", "Failed to handle notification action");
    }
  }

  private async handleBackgroundAction(pressAction: any, notification: any) {
    const actionId = pressAction.id;
    const data = notification?.data;

    console.log("🌙 Background action:", actionId, "with data:", data);

    try {
      switch (actionId) {
        case "start-session":
          await AsyncStorage.setItem("pendingAction", "start-session");
          console.log("💾 Saved pending action: start-session");
          break;
        case "pause-session":
          await AsyncStorage.setItem("pendingAction", "pause-session");
          console.log("💾 Saved pending action: pause-session");
          break;
        case "end-session":
          await AsyncStorage.setItem("pendingAction", "end-session");
          console.log("💾 Saved pending action: end-session");
          break;
        case "complete-task":
          if (data?.taskId) {
            await this.completeTaskInBackground(data.taskId);
            console.log("✅ Task completed in background:", data.taskId);
          }
          break;
        case "snooze-task":
          if (data?.taskId) {
            await this.rescheduleTaskReminder(data.taskId);
            console.log("⏰ Task snoozed in background:", data.taskId);
          }
          break;
        default:
          console.log("❓ Unknown background action:", actionId);
      }
    } catch (error) {
      console.error("❌ Error handling background action:", error);
    }
  }

  private async completeTaskInBackground(taskId: string) {
    try {
      const tasks = await AsyncStorage.getItem("task-store");
      if (tasks) {
        const parsedTasks = JSON.parse(tasks);
        const updatedTasks = parsedTasks.state.tasks.map((task: any) =>
          task.id === taskId ? { ...task, completed: true } : task
        );
        await AsyncStorage.setItem(
          "task-store",
          JSON.stringify({
            ...parsedTasks,
            state: { ...parsedTasks.state, tasks: updatedTasks },
          })
        );
        console.log("✅ Task completed in background:", taskId);
      }
    } catch (error) {
      console.error("❌ Failed to complete task in background:", error);
    }
  }

  private async rescheduleTaskReminder(taskId: string) {
    try {
      const newTime = Date.now() + 15 * 60 * 1000; // 15 minutes
      await this.scheduleTaskReminder({
        id: taskId,
        name: "Task Reminder",
        dueDate: new Date(newTime),
        priority: "important" as any,
      });
      console.log("⏰ Task reminder rescheduled:", taskId);
    } catch (error) {
      console.error("❌ Failed to reschedule task reminder:", error);
    }
  }

  async displayNotification(config: NotificationConfig) {
    if (!this.isInitialized) {
      console.log("⚠️ Notification system not initialized");
      return;
    }

    try {
      // Use predefined channels based on notification type
      let channelId = "focus-sessions"; // default

      if (config.id.includes("task")) {
        channelId = "task-reminders";
      } else if (config.id.includes("streak")) {
        channelId = "streak-notifications";
      } else if (config.id.includes("break")) {
        channelId = "break-reminders";
      } else if (config.id.includes("flow")) {
        channelId = "flow-notifications";
      } else if (config.id.includes("background")) {
        channelId = "background-sessions";
      }

      const androidConfig: any = {
        channelId,
        smallIcon: "ic_launcher",
        pressAction: { id: "default" },
        showTimestamp: true,
        timestamp: Date.now(),
        ongoing: config.ongoing || false, // Keep notification persistent if needed
        autoCancel: config.autoCancel !== false,
        importance:
          config.priority === "high"
            ? AndroidImportance.HIGH
            : AndroidImportance.DEFAULT,
      };

      if (config.progress) {
        androidConfig.progress = config.progress;
      }

      if (config.actions && config.actions.length > 0) {
        androidConfig.actions = config.actions.map((action) => ({
          title: action.title,
          pressAction: { id: action.id },
          icon: action.icon,
          ...(action.destructive && { color: AndroidColor.RED }),
        }));
      }

      console.log("📱 Displaying notification:", {
        id: config.id,
        title: config.title,
        body: config.body,
        channelId,
        ongoing: config.ongoing,
      });

      await notifee.displayNotification({
        id: config.id,
        title: config.title,
        body: config.body,
        data: config.data,
        android: androidConfig,
        ios: {
          categoryId: config.id,
          sound: config.sound || "default",
        },
      });

      console.log("✅ Notification displayed successfully");
    } catch (error) {
      console.error("❌ Failed to display notification:", error);
      throw error;
    }
  }

  async scheduleNotification(config: NotificationConfig, trigger: any) {
    if (!this.isInitialized) {
      console.log("⚠️ Notification system not initialized");
      return;
    }

    try {
      // Use predefined channels based on notification type
      let channelId = "focus-sessions"; // default

      if (config.id.includes("task")) {
        channelId = "task-reminders";
      } else if (config.id.includes("streak")) {
        channelId = "streak-notifications";
      } else if (config.id.includes("break")) {
        channelId = "break-reminders";
      } else if (config.id.includes("flow")) {
        channelId = "flow-notifications";
      }

      const androidConfig: any = {
        channelId,
        smallIcon: "ic_launcher",
        pressAction: { id: "default" },
        showTimestamp: true,
        timestamp: Date.now(),
      };

      if (config.actions && config.actions.length > 0) {
        androidConfig.actions = config.actions.map((action) => ({
          title: action.title,
          pressAction: { id: action.id },
          icon: action.icon,
          ...(action.destructive && { color: AndroidColor.RED }),
        }));
      }

      console.log("📅 Scheduling notification:", {
        id: config.id,
        title: config.title,
        body: config.body,
        actions: config.actions,
        channelId,
        trigger,
      });

      await notifee.createTriggerNotification(
        {
          id: config.id,
          title: config.title,
          body: config.body,
          data: config.data,
          android: androidConfig,
          ios: {
            categoryId: config.id,
            sound: config.sound || "default",
          },
        },
        trigger
      );

      console.log("✅ Notification scheduled successfully");
    } catch (error) {
      console.error("❌ Failed to schedule notification:", error);
      throw error;
    }
  }

  async cancelNotification(id: string) {
    try {
      await notifee.cancelNotification(id);
      console.log("❌ Cancelled notification:", id);
    } catch (error) {
      console.error("❌ Failed to cancel notification:", error);
    }
  }

  async cancelAllNotifications() {
    try {
      await notifee.cancelAllNotifications();
      console.log("❌ Cancelled all notifications");
    } catch (error) {
      console.error("❌ Failed to cancel all notifications:", error);
    }
  }

  // Session-specific notification methods
  async showSessionStartNotification(sessionType: string, duration: number) {
    // Save session data for background task
    const sessionData = {
      sessionType,
      duration,
      startTime: Date.now(),
      endTime: Date.now() + duration * 60 * 1000,
      isRunning: true,
    };

    await AsyncStorage.setItem("currentSession", JSON.stringify(sessionData));

    await this.displayNotification({
      id: "session-start",
      title: `🎯 ${sessionType} Session Started`,
      body: `Focus for ${duration} minutes. Stay focused!`,
      data: { sessionType, duration },
      priority: "high",
      ongoing: true, // Keep this notification persistent during session
    });
  }

  async showSessionCompleteNotification(sessionType: string, duration: number) {
    // Clear session data
    await AsyncStorage.removeItem("currentSession");

    // Cancel any ongoing session notifications
    await this.cancelNotification("session-start");
    await this.cancelNotification("background-session-reminder");

    await this.displayNotification({
      id: "session-complete",
      title: "🎉 Session Complete!",
      body: `Great job! You've completed your ${sessionType} session.`,
      data: { sessionType, duration },
      priority: "high",
    });
  }

  async updateSessionState(isRunning: boolean, isPaused: boolean) {
    try {
      const sessionData = await AsyncStorage.getItem("currentSession");
      if (sessionData) {
        const session = JSON.parse(sessionData);
        session.isRunning = isRunning;
        session.isPaused = isPaused;

        await AsyncStorage.setItem("currentSession", JSON.stringify(session));

        if (!isRunning) {
          // Session ended, clear background notifications
          await this.cancelNotification("background-session-reminder");
        }
      }
    } catch (error) {
      console.error("❌ Failed to update session state:", error);
    }
  }

  async showSessionPauseNotification() {
    await this.displayNotification({
      id: "session-pause",
      title: "⏸️ Session Paused",
      body: "Your focus session is paused. Tap to resume when ready.",
      priority: "default",
    });
  }

  async showSessionResumeNotification() {
    await this.displayNotification({
      id: "session-resume",
      title: "▶️ Session Resumed",
      body: "Back to focusing! Keep up the great work.",
      priority: "high",
    });
  }

  async scheduleBreakReminder(sessionDuration: number) {
    try {
      console.log("📅 Scheduling break reminder:", { sessionDuration });

      await this.scheduleNotification(
        {
          id: "break-reminder",
          title: "☕ Time for a Break!",
          body: "Take a 5-minute break to recharge and stay productive.",
          priority: "default",
        },
        {
          type: TriggerType.TIMESTAMP,
          timestamp: Date.now() + sessionDuration * 60 * 1000,
        }
      );

      console.log("✅ Break reminder scheduled successfully");
    } catch (error) {
      console.error("❌ Failed to schedule break reminder:", error);
      throw error;
    }
  }

  async showStreakMilestoneNotification(streakCount: number) {
    const milestones = [7, 30, 100, 365];
    if (!milestones.includes(streakCount)) return;

    const messages = {
      7: "🎉 One week streak! You're building a great habit!",
      30: "🏆 One month streak! You're unstoppable!",
      100: "💎 100 days! You're a focus master!",
      365: "👑 One year streak! Legendary dedication!",
    };

    await this.displayNotification({
      id: `streak-${streakCount}`,
      title: `🎊 ${streakCount} Day Streak!`,
      body: messages[streakCount as keyof typeof messages],
      data: { streakCount },
      priority: "high",
    });
  }

  async scheduleTaskReminder(task: {
    id: string;
    name: string;
    dueDate: Date;
    priority: "urgent" | "important" | "quickwin" | "deepwork";
  }) {
    const reminderTime = new Date(task.dueDate.getTime() - 30 * 60 * 1000);

    await this.scheduleNotification(
      {
        id: `task-${task.id}`,
        title: `📋 Task Reminder: ${task.name}`,
        body: "Due in 30 minutes. Open app to view details.",
        data: { taskId: task.id, taskName: task.name },
        priority: "high",
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: reminderTime.getTime(),
      }
    );
  }

  async showFlowProgressNotification(
    flowName: string,
    currentStep: number,
    totalSteps: number
  ) {
    await this.displayNotification({
      id: `flow-progress-${flowName}`,
      title: `🔄 ${flowName} Progress`,
      body: `Step ${currentStep} of ${totalSteps} completed. Keep going!`,
      data: { flowName, currentStep, totalSteps },
      priority: "high",
    });
  }

  async showFlowCompletionNotification(flowName: string, totalTime: number) {
    await this.displayNotification({
      id: `flow-complete-${flowName}`,
      title: "🎊 Flow Complete!",
      body: `You've completed ${flowName} in ${Math.floor(totalTime / 60)} minutes. Amazing work!`,
      data: { flowName, totalTime },
      priority: "high",
    });
  }

  // Simple test notification for debugging
  async showTestNotification() {
    await this.displayNotification({
      id: "test-simple",
      title: "🔔 Notifications Working!",
      body: "Your notification system is ready to help you stay productive.",
      priority: "high",
    });
  }

  async scheduleSessionEndNotification(sessionType: string, duration: number) {
    try {
      console.log("📅 Scheduling session end notification:", {
        sessionType,
        duration,
      });

      await this.scheduleNotification(
        {
          id: "session-end",
          title: "🎉 Session Complete!",
          body: `Great job! You've completed your ${sessionType} session. Open app to reflect or start your next session.`,
          data: { sessionType, duration },
          priority: "high",
        },
        {
          type: TriggerType.TIMESTAMP,
          timestamp: Date.now() + duration * 60 * 1000,
        }
      );

      console.log("✅ Session end notification scheduled successfully");
    } catch (error) {
      console.error("❌ Failed to schedule session end notification:", error);
      throw error;
    }
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export const useNotifications = () => {
  const router = useRouter();
  const sessionStore = useSessionStore();
  const taskStore = useTaskStore();
  const journalStore = useJournalStore();

  // Set stores in the service
  notificationService.setStores(router, sessionStore, taskStore, journalStore);

  return {
    initialize: () => notificationService.initialize(),
    displayNotification: (config: NotificationConfig) =>
      notificationService.displayNotification(config),
    scheduleNotification: (config: NotificationConfig, trigger: any) =>
      notificationService.scheduleNotification(config, trigger),
    cancelNotification: (id: string) =>
      notificationService.cancelNotification(id),
    cancelAllNotifications: () => notificationService.cancelAllNotifications(),
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
    showTestNotification: () => notificationService.showTestNotification(),
    showSessionCompleteNotification: (sessionType: string, duration: number) =>
      notificationService.showSessionCompleteNotification(
        sessionType,
        duration
      ),
    updateSessionState: (isRunning: boolean, isPaused: boolean) =>
      notificationService.updateSessionState(isRunning, isPaused),
  };
};
