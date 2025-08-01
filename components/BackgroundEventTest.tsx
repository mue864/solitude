import notifee from "@notifee/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function BackgroundEventTest() {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  const testBackgroundEvent = async () => {
    try {
      addResult("🧪 Testing background event registration...");

      // Create the channel if it doesn't exist (Notifee handles this automatically)
      await notifee.createChannel({
        id: "focus-sessions",
        name: "Focus Sessions",
        description: "Notifications for focus sessions",
        importance: 4,
        sound: "default",
      });
      addResult("✅ Channel ensured to exist");

      // Create a test notification that should trigger background events
      await notifee.displayNotification({
        id: "background-test",
        title: "🧪 Background Event Test",
        body: "Tap this notification to test background events",
        android: {
          channelId: "focus-sessions",
          importance: 4, // HIGH
          pressAction: { id: "default" }, // Use default press action
          smallIcon: "ic_launcher",
          showTimestamp: true,
          timestamp: Date.now(),
        },
        ios: {
          categoryId: "background-test",
          sound: "default",
        },
      });

      addResult("✅ Test notification sent");
      addResult("📱 Now minimize the app and tap the notification");
      addResult("🔍 Check console for background event logs");
      addResult("⚠️ Make sure app is completely minimized (not just switched)");
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
      addResult(`❌ Error checking pending actions: ${error}`);
    }
  };

  const testForegroundEvent = async () => {
    try {
      addResult("🧪 Testing foreground event...");

      await notifee.displayNotification({
        id: "foreground-test",
        title: "🧪 Foreground Event Test",
        body: "Tap this notification while app is open",
        android: {
          channelId: "focus-sessions",
          importance: 4,
        },
      });

      addResult("✅ Foreground test notification sent");
      addResult("📱 Tap the notification while app is open");
      addResult("🔍 Should see foreground event in console");
    } catch (error) {
      addResult(`❌ Error: ${error}`);
    }
  };

  const comprehensiveTest = async () => {
    try {
      addResult("🔬 Starting comprehensive background event test...");

      // Step 1: Check permissions
      const permission = await notifee.requestPermission();
      addResult(`📋 Permission status: ${permission.authorizationStatus}`);

      // Step 2: Ensure channels exist
      await notifee.createChannel({
        id: "focus-sessions",
        name: "Focus Sessions",
        description: "Notifications for focus sessions",
        importance: 4,
        sound: "default",
      });
      addResult("✅ Focus sessions channel ensured");

      await notifee.createChannel({
        id: "background-sessions",
        name: "Background Session Reminders",
        description:
          "Notifications to keep the app alive when sessions are running in the background",
        importance: 4,
        sound: "default",
      });
      addResult("✅ Background sessions channel ensured");

      // Step 3: Test notification display
      await notifee.displayNotification({
        id: "comprehensive-test",
        title: "🔬 Comprehensive Test",
        body: "This tests the entire notification system",
        android: {
          channelId: "focus-sessions",
          importance: 4,
          pressAction: { id: "default" }, // Use default press action
          smallIcon: "ic_launcher",
          showTimestamp: true,
          timestamp: Date.now(),
        },
      });
      addResult("✅ Test notification displayed");

      // Step 4: Check if event handlers are registered
      addResult("🔍 Checking if event handlers are registered...");
      addResult("📝 Look for these console logs:");
      addResult("  - '🔧 Registering background event handler...'");
      addResult("  - '✅ Background event handler registered'");
      addResult(
        "  - '✅ Notification event listeners registered successfully'"
      );

      // Step 5: Instructions for testing
      addResult("📋 Testing Instructions:");
      addResult("1. Minimize app completely (not just switch)");
      addResult("2. Tap the notification from background");
      addResult("3. Check console for '🔄 Notifee background event triggered'");
      addResult("4. Open app and check pending actions");
    } catch (error) {
      addResult(`❌ Comprehensive test error: ${error}`);
    }
  };

  const clearTestResults = () => {
    setTestResults([]);
  };

  return (
    <View className="p-4 bg-white dark:bg-gray-800 rounded-lg m-4">
      <Text className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
        Background Event Test
      </Text>

      <TouchableOpacity
        onPress={comprehensiveTest}
        className="bg-red-500 p-3 rounded-lg mb-3"
      >
        <Text className="text-white text-center font-semibold">
          🔬 Comprehensive Test
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={testBackgroundEvent}
        className="bg-blue-500 p-3 rounded-lg mb-3"
      >
        <Text className="text-white text-center font-semibold">
          🧪 Test Background Event
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={testForegroundEvent}
        className="bg-purple-500 p-3 rounded-lg mb-3"
      >
        <Text className="text-white text-center font-semibold">
          🧪 Test Foreground Event
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

      <TouchableOpacity
        onPress={clearTestResults}
        className="bg-gray-500 p-3 rounded-lg mb-4"
      >
        <Text className="text-white text-center font-semibold">
          🗑️ Clear Results
        </Text>
      </TouchableOpacity>

      <View className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
        <Text className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">
          Test Results:
        </Text>
        {testResults.map((result, index) => (
          <Text
            key={index}
            className="text-xs text-gray-700 dark:text-gray-300 mb-1"
          >
            {result}
          </Text>
        ))}
        {testResults.length === 0 && (
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            No test results yet. Run a test to see results here.
          </Text>
        )}
      </View>
    </View>
  );
}
