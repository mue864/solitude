# Background Survival Guide for Solitude App

## 🎯 **Overview**

This guide explains how the Solitude app maintains functionality when minimized or in the background, ensuring notifications work reliably and sessions continue tracking.

## 🛡️ **Background Survival Strategies**

### **1. Background Tasks & Fetch**

- ✅ **Expo Background Fetch**: Runs every 15 minutes minimum
- ✅ **Task Manager**: Defines background tasks that can run even when app is closed
- ✅ **Session Persistence**: Stores session data in AsyncStorage for background access

### **2. Persistent Notifications**

- ✅ **Ongoing Notifications**: Session start notifications stay persistent
- ✅ **High Priority**: Critical notifications use HIGH importance
- ✅ **Background Channel**: Dedicated channel for background session reminders

### **3. Android Permissions**

```xml
<uses-permission android:name="android.permission.WAKE_LOCK"/>
<uses-permission android:name="android.permission.FOREGROUND_SERVICE"/>
<uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS"/>
```

## 🔄 **How It Works**

### **Session Start**

1. **Save Session Data**: Stores session info in AsyncStorage
2. **Show Persistent Notification**: Ongoing notification keeps app alive
3. **Register Background Task**: Background fetch checks session status

### **Background Monitoring**

1. **Every 15 minutes**: Background task runs
2. **Check Active Sessions**: Reads session data from AsyncStorage
3. **Show Reminder**: If session still active, shows reminder notification

### **Session End**

1. **Clear Session Data**: Removes from AsyncStorage
2. **Cancel Notifications**: Removes persistent notifications
3. **Show Completion**: Displays session completion notification

## 📱 **Notification Channels**

### **Background Sessions Channel**

- **ID**: `background-sessions`
- **Importance**: HIGH
- **Purpose**: Keep app alive during active sessions
- **Features**: Persistent, high priority, sound, vibration

### **Focus Sessions Channel**

- **ID**: `focus-sessions`
- **Importance**: HIGH
- **Purpose**: Session start/end notifications
- **Features**: Ongoing during sessions

## 🔧 **Implementation Details**

### **Background Task Registration**

```typescript
TaskManager.defineTask("solitude-background-task", async () => {
  // Check for active sessions
  // Show reminder notifications
  // Return BackgroundFetchResult
});
```

### **Session State Management**

```typescript
// Save session data
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

// Update state changes
notifications.updateSessionState(isRunning, isPaused);
```

### **Persistent Notifications**

```typescript
await this.displayNotification({
  id: "session-start",
  title: "🎯 Session Started",
  body: "Focus session is running",
  priority: "high",
  ongoing: true, // Keeps notification persistent
});
```

## ⚠️ **Limitations & Considerations**

### **System Limitations**

- ❌ **iOS**: Background time is limited (30 seconds after app close)
- ❌ **Android**: Battery optimization may kill background tasks
- ❌ **Both**: System can kill app for memory pressure

### **User Settings**

- ⚠️ **Battery Optimization**: Users may need to disable for your app
- ⚠️ **Background App Refresh**: iOS users may need to enable
- ⚠️ **Notification Permissions**: Must be granted for background survival

## 🎯 **Best Practices**

### **For Users**

1. **Disable Battery Optimization** for Solitude app
2. **Enable Background App Refresh** (iOS)
3. **Grant Notification Permissions**
4. **Keep app in recent apps** when possible

### **For Developers**

1. **Test on real devices** (simulators don't show background behavior)
2. **Monitor battery usage** and optimize
3. **Handle edge cases** when app is killed
4. **Provide clear user guidance** on settings

## 🔍 **Testing Background Behavior**

### **Android Testing**

1. Start a session
2. Minimize app (don't close)
3. Wait 15+ minutes
4. Check for background reminder notifications
5. Test with battery optimization enabled/disabled

### **iOS Testing**

1. Start a session
2. Close app completely
3. Wait for scheduled notifications
4. Test with Background App Refresh on/off

## 📊 **Monitoring & Debugging**

### **Console Logs**

```typescript
console.log("🔄 Background task running...");
console.log("📱 Displaying notification:", { id, title, body });
console.log("✅ Session end notification scheduled successfully");
```

### **AsyncStorage Keys**

- `currentSession`: Active session data
- `pendingAction`: Background action to execute when app opens

## 🚀 **Future Enhancements**

### **Potential Improvements**

1. **Foreground Service**: Android service to keep app alive
2. **Work Manager**: More reliable background task scheduling
3. **Push Notifications**: Server-side notifications for critical events
4. **Battery Optimization**: Request ignore battery optimizations
5. **Adaptive Background**: Adjust background behavior based on device state

### **Advanced Features**

1. **Session Recovery**: Resume sessions if app was killed
2. **Smart Notifications**: Context-aware notification timing
3. **Background Analytics**: Track session completion rates
4. **User Engagement**: Remind users to return to app

## 📝 **Troubleshooting**

### **Common Issues**

1. **Notifications not showing**: Check permissions and channel setup
2. **Background tasks not running**: Check battery optimization settings
3. **Session data lost**: Verify AsyncStorage implementation
4. **App killed too quickly**: Implement foreground service

### **Debug Steps**

1. Check console logs for initialization errors
2. Verify notification channels are created
3. Test background fetch registration
4. Monitor AsyncStorage data persistence
5. Check device-specific settings

---

This implementation provides a robust foundation for background survival while respecting system limitations and user preferences.
