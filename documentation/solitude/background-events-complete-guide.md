# 📱 **Complete Guide: Background Events & Notifications in React Native**

_This guide explains how to implement background events that open your app when notifications are tapped, written for junior developers._

## 🎯 **What Are Background Events?**

### **Background Events vs Foreground Events**

| **Foreground Events**                  | **Background Events**                   |
| -------------------------------------- | --------------------------------------- |
| App is **open and active**             | App is **closed or minimized**          |
| User taps notification while using app | User taps notification from system tray |
| Immediate response                     | Delayed response when app opens         |
| Direct function calls                  | Store actions to execute later          |

### **Why Background Events Matter**

- ✅ **User engagement**: Bring users back to your app
- ✅ **Session continuity**: Resume where user left off
- ✅ **Critical actions**: Handle important notifications
- ✅ **App survival**: Keep app alive in background

## 🏗️ **Architecture Overview**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Notification  │    │  Background      │    │   App Opens     │
│   is Displayed  │───▶│  Event Handler   │───▶│  Process Action │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
   User sees notification    Handler stores action    Action executed
```

## 🔧 **Step-by-Step Implementation**

### **Step 1: Set Up Dependencies**

First, install the required packages:

```bash
npx expo install @notifee/react-native expo-background-fetch expo-task-manager
```

### **Step 2: Create Notification Channels**

Channels are categories for notifications. Each channel can have different settings:

```typescript
// hooks/useNotifications.ts
private async createNotificationChannels() {
  const channels = [
    {
      id: "focus-sessions",
      name: "Focus Sessions",
      description: "Notifications for focus sessions",
      importance: AndroidImportance.HIGH, // HIGH = more likely to show
      sound: "default",
      vibration: true,
      lights: true,
      lightColor: AndroidColor.BLUE,
      showBadge: true,
      allowBubbles: true, // Enable action buttons
    },
    // Add more channels as needed
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
```

### **Step 3: Register Background Event Handler**

This is the **most important part**. Register the handler at the app level:

```typescript
// app/_layout.tsx
import notifee, { EventType } from "@notifee/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RootLayout() {
  // Register background event handler
  useEffect(() => {
    console.log("🔧 Registering background event handler...");

    const backgroundHandler = async ({ type, detail }: any) => {
      console.log("🔄 Background event triggered:", { type, detail });

      try {
        if (type === EventType.PRESS) {
          // User tapped the notification
          const notificationId = detail.notification?.id;
          if (notificationId) {
            // Store action to handle when app opens
            await AsyncStorage.setItem("pendingAction", notificationId);
            console.log("💾 Stored pending action:", notificationId);
          }
        } else if (type === EventType.ACTION_PRESS) {
          // User tapped an action button
          const actionId = detail.pressAction?.id;
          if (actionId) {
            await AsyncStorage.setItem("pendingAction", actionId);
            console.log("💾 Stored pending action:", actionId);
          }
        }
      } catch (error) {
        console.error("❌ Error in background event handler:", error);
      }
    };

    // Register the handler
    notifee.onBackgroundEvent(backgroundHandler);
    console.log("✅ Background event handler registered");
  }, []);

  return (
    // Your app layout
  );
}
```

### **Step 4: Display Notifications with Proper Configuration**

```typescript
// Display a notification that can trigger background events
await notifee.displayNotification({
  id: "session-start",
  title: "🎯 Session Started",
  body: "Your focus session is running",
  android: {
    channelId: "focus-sessions",
    importance: 4, // HIGH importance
    pressAction: { id: "default" }, // Required for background events
    smallIcon: "ic_launcher", // App icon
    showTimestamp: true,
    timestamp: Date.now(),
  },
  ios: {
    categoryId: "focus-sessions",
    sound: "default",
  },
});
```

### **Step 5: Handle Pending Actions When App Opens**

```typescript
// In your main screen (e.g., focus.tsx)
useEffect(() => {
  const checkPendingActions = async () => {
    try {
      const pendingAction = await AsyncStorage.getItem("pendingAction");
      if (pendingAction) {
        console.log("Found pending action:", pendingAction);

        // Handle different action types
        switch (pendingAction) {
          case "session-start":
            resumeSession();
            break;
          case "session-pause":
            pauseSession();
            break;
          case "session-end":
            reset();
            break;
          default:
            console.log("Unknown pending action:", pendingAction);
        }

        // Clear the pending action
        await AsyncStorage.removeItem("pendingAction");
      }
    } catch (error) {
      console.error("Error checking pending actions:", error);
    }
  };

  checkPendingActions();
}, []);
```

## 📱 **Event Types Explained**

### **EventType.PRESS**

- **When**: User taps the notification itself
- **Use case**: Open app to specific screen
- **Example**: "Tap to return to your focus session"

### **EventType.ACTION_PRESS**

- **When**: User taps an action button
- **Use case**: Perform specific actions
- **Example**: "Start Session", "Pause Session", "End Session"

### **EventType.DISMISSED**

- **When**: User dismisses the notification
- **Use case**: Track user behavior
- **Example**: Log that user ignored the notification

### **EventType.DELIVERED**

- **When**: Notification is delivered to device
- **Use case**: Confirm notification was sent
- **Example**: Analytics tracking

## 🔧 **Advanced Configuration**

### **Action Buttons on Notifications**

```typescript
await notifee.displayNotification({
  id: "session-actions",
  title: "🎯 Focus Session",
  body: "What would you like to do?",
  android: {
    channelId: "focus-sessions",
    importance: 4,
    pressAction: { id: "default" },
    actions: [
      {
        title: "Start",
        pressAction: { id: "start-session" },
        icon: "play",
      },
      {
        title: "Pause",
        pressAction: { id: "pause-session" },
        icon: "pause",
      },
      {
        title: "End",
        pressAction: { id: "end-session" },
        icon: "stop",
        color: "red",
      },
    ],
  },
});
```

### **Persistent Notifications (Ongoing)**

```typescript
await notifee.displayNotification({
  id: "active-session",
  title: "🎯 Session in Progress",
  body: "Your focus session is running",
  android: {
    channelId: "focus-sessions",
    importance: 4,
    ongoing: true, // Can't be dismissed by user
    autoCancel: false, // Won't auto-dismiss
    pressAction: { id: "return-to-app" },
  },
});
```

### **Scheduled Notifications**

```typescript
import { TriggerType } from "@notifee/react-native";

await notifee.createTriggerNotification(
  {
    id: "session-end",
    title: "🎉 Session Complete!",
    body: "Great job! Your session has ended.",
    android: {
      channelId: "focus-sessions",
      importance: 4,
      pressAction: { id: "session-complete" },
    },
  },
  {
    type: TriggerType.TIMESTAMP,
    timestamp: Date.now() + 25 * 60 * 1000, // 25 minutes from now
  }
);
```

## 🚨 **Common Issues & Solutions**

### **Issue 1: Background Events Not Triggering**

**Symptoms:**

- No console logs when tapping notifications
- App doesn't open when notification is tapped

**Solutions:**

1. **Check registration**: Ensure handler is registered in `_layout.tsx`
2. **Verify permissions**: Request notification permissions
3. **Check notification config**: Ensure `pressAction` is set
4. **Test on real device**: Simulators don't show background behavior

```typescript
// Check if handler is registered
console.log("🔧 Registering background event handler...");
notifee.onBackgroundEvent(backgroundHandler);
console.log("✅ Background event handler registered");
```

### **Issue 2: "No task registered" Error**

**Cause:** Background event handler not properly registered

**Solution:**

```typescript
// Make sure handler is a proper function
const backgroundHandler = async ({ type, detail }: any) => {
  // Your handler code
};

// Register it properly
notifee.onBackgroundEvent(backgroundHandler);
```

### **Issue 3: App Killed Too Quickly**

**Symptoms:**

- Background events work briefly, then stop
- App killed by system before events can fire

**Solutions:**

1. **Disable battery optimization** for your app
2. **Use persistent notifications** (`ongoing: true`)
3. **Request ignore battery optimizations**

```typescript
// Add to AndroidManifest.xml
<uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS"/>
```

### **Issue 4: Duplicate Event Handlers**

**Symptoms:**

- Events fire multiple times
- Conflicting behavior

**Solution:**

- **Only register handlers in one place** (`_layout.tsx`)
- **Remove duplicate handlers** from other components
- **Use proper cleanup** for foreground handlers

## 🧪 **Testing Your Implementation**

### **Create a Test Component**

```typescript
// components/BackgroundEventTest.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import notifee from "@notifee/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function BackgroundEventTest() {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testBackgroundEvent = async () => {
    try {
      addResult("🧪 Testing background event...");

      await notifee.displayNotification({
        id: "background-test",
        title: "🧪 Background Event Test",
        body: "Tap this notification to test background events",
        android: {
          channelId: "focus-sessions",
          importance: 4,
          pressAction: { id: "default" },
          smallIcon: "ic_launcher",
          showTimestamp: true,
          timestamp: Date.now(),
        },
      });

      addResult("✅ Test notification sent");
      addResult("📱 Now minimize app and tap the notification");
      addResult("🔍 Check console for background event logs");

    } catch (error) {
      addResult(`❌ Error: ${error}`);
    }
  };

  const checkPendingActions = async () => {
    try {
      const pendingAction = await AsyncStorage.getItem("pendingAction");
      if (pendingAction) {
        addResult(`💾 Found pending action: ${pendingAction}`);
        await AsyncStorage.removeItem("pendingAction");
        addResult("🗑️ Cleared pending action");
      } else {
        addResult("📭 No pending actions found");
      }
    } catch (error) {
      addResult(`❌ Error: ${error}`);
    }
  };

  return (
    <View className="p-4 bg-white rounded-lg m-4">
      <Text className="text-lg font-bold mb-4">Background Event Test</Text>

      <TouchableOpacity
        onPress={testBackgroundEvent}
        className="bg-blue-500 p-3 rounded-lg mb-3"
      >
        <Text className="text-white text-center font-semibold">
          🧪 Test Background Event
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={checkPendingActions}
        className="bg-green-500 p-3 rounded-lg mb-3"
      >
        <Text className="text-white text-center font-semibold">
          🔍 Check Pending Actions
        </Text>
      </TouchableOpacity>

      <View className="bg-gray-100 p-3 rounded-lg">
        <Text className="text-sm font-semibold mb-2">Test Results:</Text>
        {testResults.map((result, index) => (
          <Text key={index} className="text-xs text-gray-700 mb-1">
            {result}
          </Text>
        ))}
      </View>
    </View>
  );
}
```

### **Testing Checklist**

#### **✅ Pre-Test Setup:**

- [ ] App has notification permissions
- [ ] Battery optimization disabled
- [ ] Background app refresh enabled (iOS)
- [ ] Event handlers registered in `_layout.tsx`
- [ ] Console logs enabled

#### **✅ Test Steps:**

1. **Send test notification**
2. **Verify foreground event works** (tap while app open)
3. **Minimize app completely** (not just switch)
4. **Tap notification from background**
5. **Check console for background event**
6. **Verify pending action stored**
7. **Open app and check pending action**

#### **✅ Expected Results:**

- [ ] Foreground events work immediately
- [ ] Background events trigger when app minimized
- [ ] Pending actions stored and retrieved
- [ ] Console shows all registration logs

## 📊 **Debugging Console Logs**

### **Registration Logs (Should See on App Start):**

```
🔧 Registering background event handler...
✅ Background event handler registered
✅ Notification event listeners registered successfully
🔧 Background event handler should be ready for testing
```

### **Event Trigger Logs (When Notification Tapped):**

```
🔄 Notifee background event triggered: { type: 1, detail: {...} }
📱 Background notification pressed: { id: "test", title: "..." }
💾 Stored pending action: test
```

### **Action Processing Logs (When App Opens):**

```
Found pending action: test
Processing pending action...
Cleared pending action
```

## 🎯 **Best Practices**

### **1. Register Handlers at App Level**

```typescript
// ✅ Do this in app/_layout.tsx
notifee.onBackgroundEvent(backgroundHandler);

// ❌ Don't register in individual components
```

### **2. Use Proper Error Handling**

```typescript
const backgroundHandler = async ({ type, detail }: any) => {
  try {
    // Your handler code
  } catch (error) {
    console.error("❌ Error in background event handler:", error);
  }
};
```

### **3. Store Actions Immediately**

```typescript
// ✅ Store action right away
await AsyncStorage.setItem("pendingAction", actionId);

// ❌ Don't try to execute complex logic in background
```

### **4. Clear Pending Actions**

```typescript
// Always clear after processing
await AsyncStorage.removeItem("pendingAction");
```

### **5. Test on Real Devices**

```bash
# Background events don't work reliably on simulators
# Always test on physical devices
```

## 🚀 **Advanced Features**

### **Background Tasks with TaskManager**

```typescript
import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";

// Define background task
TaskManager.defineTask("background-task", async () => {
  try {
    // Check for active sessions
    const sessionData = await AsyncStorage.getItem("currentSession");
    if (sessionData) {
      // Show reminder notification
      await notifee.displayNotification({
        id: "session-reminder",
        title: "🎯 Session in Progress",
        body: "Your focus session is still running",
        android: {
          channelId: "focus-sessions",
          importance: 4,
          ongoing: true,
        },
      });
    }
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Register background fetch
await BackgroundFetch.registerTaskAsync("background-task", {
  minimumInterval: 15 * 60, // 15 minutes
  stopOnTerminate: false,
  startOnBoot: true,
});
```

### **Foreground Service (Android)**

```typescript
// Keep app alive in background
await notifee.displayNotification({
  id: "foreground-service",
  title: "🎯 Session Active",
  body: "Your focus session is running in the background",
  android: {
    channelId: "focus-sessions",
    importance: 4,
    ongoing: true,
    autoCancel: false,
    asForegroundService: true, // Android foreground service
  },
});
```

## 📝 **Summary**

### **Key Points to Remember:**

1. **Register handlers at app level** (`_layout.tsx`)
2. **Use proper notification configuration** (`pressAction`, `channelId`)
3. **Store actions in AsyncStorage** for later processing
4. **Test on real devices** (not simulators)
5. **Handle errors gracefully**
6. **Clear pending actions** after processing

### **Common Pitfalls:**

- ❌ **Registering handlers in components** (causes conflicts)
- ❌ **Missing `pressAction`** in notification config
- ❌ **Testing on simulators** (background events don't work)
- ❌ **Not handling errors** in background handlers
- ❌ **Forgetting to clear** pending actions

### **Success Indicators:**

- ✅ **Console logs show registration**
- ✅ **Background events trigger** when app minimized
- ✅ **Pending actions stored** and retrieved
- ✅ **App opens** when notification tapped
- ✅ **No duplicate handlers** or conflicts

This implementation provides a robust foundation for background events that will reliably bring users back to your app when they tap notifications! 🚀
