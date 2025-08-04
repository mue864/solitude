# Notification System Troubleshooting Guide

## Common Issues and Solutions

### 1. Action Buttons Not Responding

**Symptoms:**

- Action buttons appear in notifications but don't trigger any response
- No console logs when buttons are pressed
- Actions don't work in foreground or background

**Possible Causes:**

#### A. Event Listeners Not Set Up

**Check:** Look for "Setting up notification event listeners..." in console
**Solution:** Ensure `notifications.initialize()` is called in your component

```typescript
useEffect(() => {
  notifications.initialize();
}, []);
```

#### B. Stores Not Available

**Check:** Look for "Session store not available" in console
**Solution:** Ensure stores are properly set in the notification service

```typescript
// In useNotifications hook
notificationService.setStores(router, sessionStore, taskStore, journalStore);
```

#### C. Action IDs Mismatch

**Check:** Compare action IDs in notification config vs handler
**Solution:** Ensure action IDs match exactly

```typescript
// In notification config
actions: [
  { id: "pause-session", title: "Pause", icon: "pause" },
  { id: "end-session", title: "End", icon: "stop", destructive: true },
]

// In action handler
case "pause-session":
  pauseSession();
  break;
case "end-session":
  reset();
  break;
```

#### D. Channel Issues

**Check:** Look for channel-related errors in console
**Solution:** Use predefined channels instead of creating new ones

```typescript
// Use predefined channels
let channelId = "focus-sessions"; // default
if (config.id.includes("task")) {
  channelId = "task-reminders";
}
```

### 2. Notifications Not Showing

**Symptoms:**

- No notifications appear when triggered
- No error messages in console

**Possible Causes:**

#### A. Permissions Not Granted

**Check:** Request permissions explicitly
**Solution:** Ensure permissions are requested

```typescript
await notifee.requestPermission();
```

#### B. Channel Creation Failed

**Check:** Look for channel creation errors
**Solution:** Use predefined channels or handle channel creation errors

#### C. Notification ID Conflicts

**Check:** Ensure unique notification IDs
**Solution:** Use unique IDs for each notification

```typescript
id: `session-start-${Date.now()}`;
```

### 3. Background Actions Not Working

**Symptoms:**

- Actions work in foreground but not in background
- No pending actions when app reopens

**Possible Causes:**

#### A. Background Event Handler Not Set Up

**Check:** Ensure background event listener is registered
**Solution:** Verify background event setup

```typescript
notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.ACTION_PRESS) {
    await this.handleBackgroundAction(detail.pressAction, detail.notification);
  }
});
```

#### B. AsyncStorage Issues

**Check:** Look for AsyncStorage errors
**Solution:** Handle AsyncStorage errors properly

```typescript
try {
  await AsyncStorage.setItem("pendingAction", "start-session");
} catch (error) {
  console.error("Failed to save pending action:", error);
}
```

### 4. Debugging Steps

#### Step 1: Check Console Logs

Look for these debug messages:

- "Setting up notification event listeners..."
- "Event listeners setup complete"
- "Displaying notification: ..."
- "Foreground event received: ..."
- "Action pressed: ..."

#### Step 2: Test Basic Notification

Use the NotificationTest component to test basic functionality:

```typescript
// Test custom notification with actions
await notifications.displayNotification({
  id: "test-custom",
  title: "Test Custom Notification",
  body: "This is a test notification with action buttons",
  actions: [
    { id: "test-action-1", title: "Action 1", icon: "play" },
    { id: "test-action-2", title: "Action 2", icon: "stop", destructive: true },
  ],
  priority: "high",
});
```

#### Step 3: Check Action Handler

Add console logs to action handler:

```typescript
private handleActionPress(pressAction: any, notification: any) {
  const actionId = pressAction.id;
  console.log("Action pressed:", actionId);

  switch (actionId) {
    case "test-action-1":
      console.log("Test action 1 pressed");
      Alert.alert("Success", "Action 1 triggered!");
      break;
    // ... other cases
  }
}
```

#### Step 4: Verify Store Availability

Check if stores are properly set:

```typescript
console.log("Session store available:", !!this.sessionStore);
console.log("Task store available:", !!this.taskStore);
console.log("Router available:", !!this.router);
```

### 5. Testing Checklist

- [ ] Permissions granted
- [ ] Event listeners set up
- [ ] Stores properly initialized
- [ ] Action IDs match between config and handler
- [ ] Channels created successfully
- [ ] Notifications display correctly
- [ ] Action buttons appear
- [ ] Actions trigger in foreground
- [ ] Actions trigger in background
- [ ] Pending actions work when app reopens

### 6. Common Fixes

#### Fix 1: Ensure Proper Initialization

```typescript
useEffect(() => {
  const initializeNotifications = async () => {
    try {
      await notifications.initialize();
      console.log("Notifications initialized successfully");
    } catch (error) {
      console.error("Failed to initialize notifications:", error);
    }
  };

  initializeNotifications();
}, []);
```

#### Fix 2: Add Error Handling

```typescript
const testNotification = async () => {
  try {
    await notifications.showSessionStartNotification("Classic", 25);
    console.log("Notification sent successfully");
  } catch (error) {
    console.error("Failed to send notification:", error);
  }
};
```

#### Fix 3: Verify Action IDs

```typescript
// In notification config
actions: [
  { id: "pause-session", title: "Pause", icon: "pause" },
  { id: "end-session", title: "End", icon: "stop", destructive: true },
]

// In action handler
case "pause-session":
  console.log("Pausing session");
  pauseSession();
  break;
case "end-session":
  console.log("Ending session");
  reset();
  break;
```

### 7. Platform-Specific Issues

#### Android

- Check notification channels are created
- Verify action buttons are properly configured
- Ensure proper icon names

#### iOS

- Check notification categories
- Verify action identifiers
- Test on physical device (simulator has limitations)

### 8. Performance Considerations

- Don't create new channels for each notification
- Use predefined channels
- Handle errors gracefully
- Clean up notifications when no longer needed

### 9. Best Practices

1. **Always add error handling**
2. **Use console logs for debugging**
3. **Test on both platforms**
4. **Verify permissions**
5. **Check store availability**
6. **Use unique notification IDs**
7. **Handle background actions properly**
8. **Clean up notifications**

### 10. Getting Help

If issues persist:

1. Check console logs for error messages
2. Test with NotificationTest component
3. Verify all setup steps are completed
4. Test on physical device
5. Check platform-specific requirements
