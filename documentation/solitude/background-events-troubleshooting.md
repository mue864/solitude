# Background Events Troubleshooting Guide

## 🚨 **Common Issues & Solutions**

### **1. Background Events Not Triggering**

#### **Possible Causes:**

- ❌ **App killed by system** (most common)
- ❌ **Battery optimization** enabled
- ❌ **Background app refresh** disabled (iOS)
- ❌ **Notification permissions** not granted
- ❌ **Event handler not registered** properly

#### **Solutions:**

##### **A. Check Device Settings**

```bash
# Android
Settings > Apps > Solitude > Battery > Unrestricted

# iOS
Settings > General > Background App Refresh > Solitude > ON
```

##### **B. Verify Event Registration**

```typescript
// Should see this in console on app start
console.log("✅ Notification event listeners registered successfully");
```

##### **C. Test with Debug Component**

1. Go to Journal screen
2. Use "Background Event Test" component
3. Send test notification
4. Minimize app
5. Tap notification
6. Check console logs

### **2. Debugging Steps**

#### **Step 1: Verify Registration**

```typescript
// In app/_layout.tsx - should see this log
console.log("✅ Notification event listeners registered successfully");
```

#### **Step 2: Test Foreground Events**

```typescript
// Tap notification while app is open
// Should see: "📱 Notification pressed: {...}"
```

#### **Step 3: Test Background Events**

```typescript
// 1. Send test notification
// 2. Minimize app completely
// 3. Tap notification
// 4. Should see: "🔄 Notifee background event triggered: {...}"
```

#### **Step 4: Check Pending Actions**

```typescript
// After tapping background notification
// Check AsyncStorage for "pendingAction"
const pendingAction = await AsyncStorage.getItem("pendingAction");
console.log("Pending action:", pendingAction);
```

### **3. Platform-Specific Issues**

#### **Android Issues:**

- **Battery Optimization**: Disable for your app
- **Doze Mode**: Can prevent background events
- **App Standby**: Can kill background processes
- **Foreground Service**: May be needed for reliable background

#### **iOS Issues:**

- **Background App Refresh**: Must be enabled
- **Background Modes**: Limited background time
- **App State**: Background events only work briefly
- **Silent Push**: May be needed for reliable background

### **4. Alternative Solutions**

#### **A. Use Foreground Service (Android)**

```typescript
// More reliable than background events
// Keeps app alive in background
// Requires additional permissions
```

#### **B. Use Push Notifications**

```typescript
// Server-side notifications
// More reliable than local background events
// Requires backend implementation
```

#### **C. Use Background Fetch**

```typescript
// Periodic background tasks
// Less reliable than foreground events
// Good for periodic checks
```

### **5. Testing Checklist**

#### **✅ Pre-Test Setup:**

- [ ] App has notification permissions
- [ ] Battery optimization disabled
- [ ] Background app refresh enabled (iOS)
- [ ] Event handlers registered in `_layout.tsx`
- [ ] Console logs enabled

#### **✅ Test Steps:**

- [ ] Send test notification
- [ ] Verify foreground event works
- [ ] Minimize app completely
- [ ] Tap notification from background
- [ ] Check console for background event
- [ ] Verify pending action stored
- [ ] Open app and check pending action

#### **✅ Expected Results:**

- [ ] Foreground events work
- [ ] Background events trigger
- [ ] Pending actions stored
- [ ] Actions processed when app opens

### **6. Common Error Messages**

#### **"Background event not triggered"**

- **Cause**: App killed by system
- **Solution**: Disable battery optimization

#### **"Event handler not found"**

- **Cause**: Handler not registered
- **Solution**: Check `_layout.tsx` registration

#### **"Permission denied"**

- **Cause**: Notification permissions not granted
- **Solution**: Request permissions again

#### **"App killed immediately"**

- **Cause**: Aggressive battery optimization
- **Solution**: Use foreground service

### **7. Performance Considerations**

#### **Background Event Limitations:**

- ⚠️ **iOS**: Limited to ~30 seconds after app close
- ⚠️ **Android**: Can be killed by system anytime
- ⚠️ **Both**: Not guaranteed to work reliably

#### **Best Practices:**

- ✅ **Store actions immediately** when event fires
- ✅ **Use AsyncStorage** for persistence
- ✅ **Handle gracefully** when events don't fire
- ✅ **Provide fallback** mechanisms

### **8. Debug Tools**

#### **Console Logs:**

```typescript
// Add these to track background events
console.log("🔄 Background event triggered:", { type, detail });
console.log("💾 Stored pending action:", actionId);
console.log("📱 App opened, checking pending actions");
```

#### **Test Component:**

```typescript
// Use BackgroundEventTest component
// Located in components/BackgroundEventTest.tsx
// Access via Journal screen
```

#### **AsyncStorage Monitoring:**

```typescript
// Check stored actions
const pendingAction = await AsyncStorage.getItem("pendingAction");
console.log("Pending action:", pendingAction);
```

---

**Remember**: Background events are not guaranteed to work reliably due to system limitations. Always provide fallback mechanisms and handle cases where events don't fire.
