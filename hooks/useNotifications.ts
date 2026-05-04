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
    if (this.isInitialized) return;

    try {
      await this.createNotificationChannels();
      this.setupEventListeners();
      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize notification service:", error);
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
      },
      {
        id: "task-reminders",
        name: "Task Reminders",
        description: "Reminders for tasks and to-dos",
        importance: AndroidImportance.DEFAULT,
        sound: "default",
        vibration: true,
        showBadge: true,
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
      },
      {
        id: "break-reminders",
        name: "Break Reminders",
        description: "Reminders to take breaks",
        importance: AndroidImportance.DEFAULT,
        sound: "default",
        vibration: true,
        showBadge: true,
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
      },
      {
        id: "background-sessions",
        name: "Background Session Reminders",
        description: "Keeps session state alive in the background",
        importance: AndroidImportance.HIGH,
        sound: "default",
        vibration: true,
        lights: true,
        lightColor: AndroidColor.YELLOW,
        showBadge: true,
      },
    ];

    for (const channel of channels) {
      await notifee.createChannel(channel);
    }
  }

  private setupEventListeners() {
    this.eventListeners.forEach((unsubscribe) => {
      if (typeof unsubscribe === "function") unsubscribe();
    });
    this.eventListeners = [];

    const foregroundUnsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
      switch (type) {
        case EventType.PRESS:
          this.handleNotificationPress(detail.notification);
          break;
        case EventType.ACTION_PRESS:
          this.handleActionPress(detail.pressAction, detail.notification);
          break;
      }
    });

    this.eventListeners.push(foregroundUnsubscribe);
  }

  private handleNotificationPress(notification: any) {
    const data = notification?.data;
    if (data?.screen && this.router) {
      this.router.push(data.screen);
    }
  }

  private handleActionPress(pressAction: any, notification: any) {
    const actionId = pressAction?.id;
    const data = notification?.data;

    if (!this.sessionStore) return;

    const { resumeSession, pauseSession, reset } =
      this.sessionStore.getState();

    switch (actionId) {
      case "start-session":
      case "resume-session":
      case "start-next-session":
        resumeSession();
        break;
      case "pause-session":
        pauseSession();
        break;
      case "end-session":
        reset();
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
      case "open-task":
        if (data?.taskId && this.taskStore) {
          this.taskStore.getState().setCurrentTask(data.taskId);
        }
        break;
      case "snooze-task":
        if (data?.taskId) {
          this.rescheduleTaskReminder(data.taskId);
        }
        break;
      case "reflect-session":
        if (this.router) this.router.push("/(main)/journal");
        break;
      case "view-stats":
      case "view-achievement":
        if (this.router) this.router.push("/(main)/insights");
        break;
    }
  }

  private async handleBackgroundAction(pressAction: any, notification: any) {
    const actionId = pressAction?.id;
    const data = notification?.data;

    switch (actionId) {
      case "start-session":
        await AsyncStorage.setItem("pendingAction", "start-session");
        break;
      case "pause-session":
        await AsyncStorage.setItem("pendingAction", "pause-session");
        break;
      case "end-session":
        await AsyncStorage.setItem("pendingAction", "end-session");
        break;
      case "complete-task":
        if (data?.taskId) await this.completeTaskInBackground(data.taskId);
        break;
      case "snooze-task":
        if (data?.taskId) await this.rescheduleTaskReminder(data.taskId);
        break;
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
      }
    } catch (error) {
      console.error("Failed to complete task in background:", error);
    }
  }

  private async rescheduleTaskReminder(taskId: string) {
    try {
      const newTime = Date.now() + 15 * 60 * 1000;
      await this.scheduleTaskReminder({
        id: taskId,
        name: "Task Reminder",
        dueDate: new Date(newTime),
        priority: "important" as any,
      });
    } catch (error) {
      console.error("Failed to reschedule task reminder:", error);
    }
  }

  async displayNotification(config: NotificationConfig) {
    if (!this.isInitialized) return;

    try {
      let channelId = "focus-sessions";
      if (config.id.includes("task")) channelId = "task-reminders";
      else if (config.id.includes("streak")) channelId = "streak-notifications";
      else if (config.id.includes("break")) channelId = "break-reminders";
      else if (config.id.includes("flow")) channelId = "flow-notifications";
      else if (config.id.includes("background")) channelId = "background-sessions";

      const androidConfig: any = {
        channelId,
        smallIcon: "ic_launcher",
        pressAction: { id: "default" },
        showTimestamp: true,
        timestamp: Date.now(),
        ongoing: config.ongoing || false,
        autoCancel: config.autoCancel !== false,
        importance:
          config.priority === "high"
            ? AndroidImportance.HIGH
            : AndroidImportance.DEFAULT,
      };

      if (config.progress) androidConfig.progress = config.progress;

      if (config.actions && config.actions.length > 0) {
        androidConfig.actions = config.actions.map((action) => ({
          title: action.title,
          pressAction: { id: action.id },
          icon: action.icon,
          ...(action.destructive && { color: AndroidColor.RED }),
        }));
      }

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
    } catch (error) {
      console.error("Failed to display notification:", error);
      throw error;
    }
  }

  async scheduleNotification(config: NotificationConfig, trigger: any) {
    if (!this.isInitialized) return;

    try {
      let channelId = "focus-sessions";
      if (config.id.includes("task")) channelId = "task-reminders";
      else if (config.id.includes("streak")) channelId = "streak-notifications";
      else if (config.id.includes("break")) channelId = "break-reminders";
      else if (config.id.includes("flow")) channelId = "flow-notifications";

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
    } catch (error) {
      console.error("Failed to schedule notification:", error);
      throw error;
    }
  }

  async cancelNotification(id: string) {
    try {
      await notifee.cancelNotification(id);
    } catch (error) {
      console.error("Failed to cancel notification:", error);
    }
  }

  async cancelAllNotifications() {
    try {
      await notifee.cancelAllNotifications();
    } catch (error) {
      console.error("Failed to cancel all notifications:", error);
    }
  }

  async showSessionStartNotification(sessionType: string, duration: number) {
    await AsyncStorage.setItem(
      "currentSession",
      JSON.stringify({
        sessionType,
        duration,
        startTime: Date.now(),
        endTime: Date.now() + duration * 60 * 1000,
        isRunning: true,
      })
    );

    await this.displayNotification({
      id: "session-start",
      title: `${sessionType} Session`,
      body: `${duration} minute session started. Stay focused.`,
      data: { sessionType, duration },
      priority: "high",
      ongoing: true,
    });
  }

  async showSessionCompleteNotification(sessionType: string, duration: number) {
    await AsyncStorage.removeItem("currentSession");
    await this.cancelNotification("session-start");
    await this.cancelNotification("background-session-reminder");

    await this.displayNotification({
      id: "session-complete",
      title: "Session Complete",
      body: `You completed your ${sessionType} session. Well done.`,
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
          await this.cancelNotification("background-session-reminder");
        }
      }
    } catch (error) {
      console.error("Failed to update session state:", error);
    }
  }

  async showSessionPauseNotification() {
    await this.displayNotification({
      id: "session-pause",
      title: "Session Paused",
      body: "Your focus session is paused. Tap to resume when ready.",
      priority: "default",
    });
  }

  async showSessionResumeNotification() {
    await this.displayNotification({
      id: "session-resume",
      title: "Session Resumed",
      body: "Back to focusing. Keep it up.",
      priority: "high",
    });
  }

  async scheduleBreakReminder(sessionDuration: number) {
    await this.scheduleNotification(
      {
        id: "break-reminder",
        title: "Time for a Break",
        body: "Take a short break to recharge and stay productive.",
        priority: "default",
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: Date.now() + sessionDuration * 60 * 1000,
      }
    );
  }

  async showStreakMilestoneNotification(streakCount: number) {
    const milestones = [7, 30, 100, 365];
    if (!milestones.includes(streakCount)) return;

    const messages: Record<number, string> = {
      7: "One week streak. You're building a great habit.",
      30: "One month streak. Keep the momentum going.",
      100: "100 days of focus. Impressive consistency.",
      365: "One year streak. Truly remarkable dedication.",
    };

    await this.displayNotification({
      id: `streak-${streakCount}`,
      title: `${streakCount} Day Streak`,
      body: messages[streakCount],
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
        title: `Task Due Soon: ${task.name}`,
        body: "Due in 30 minutes.",
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
      title: `${flowName}`,
      body: `Step ${currentStep} of ${totalSteps} complete.`,
      data: { flowName, currentStep, totalSteps },
      priority: "high",
    });
  }

  async showFlowCompletionNotification(flowName: string, totalTime: number) {
    await this.displayNotification({
      id: `flow-complete-${flowName}`,
      title: "Flow Complete",
      body: `${flowName} finished in ${Math.floor(totalTime / 60)} minutes.`,
      data: { flowName, totalTime },
      priority: "high",
    });
  }

  async scheduleSessionEndNotification(sessionType: string, duration: number) {
    await this.scheduleNotification(
      {
        id: "session-end",
        title: "Session Complete",
        body: `Your ${sessionType} session is done. Open the app to reflect or start your next session.`,
        data: { sessionType, duration },
        priority: "high",
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: Date.now() + duration * 60 * 1000,
      }
    );
  }
}

const notificationService = new NotificationService();

export const useNotifications = () => {
  const router = useRouter();
  const sessionStore = useSessionStore();
  const taskStore = useTaskStore();
  const journalStore = useJournalStore();

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
    showSessionCompleteNotification: (sessionType: string, duration: number) =>
      notificationService.showSessionCompleteNotification(sessionType, duration),
    updateSessionState: (isRunning: boolean, isPaused: boolean) =>
      notificationService.updateSessionState(isRunning, isPaused),
  };
};
