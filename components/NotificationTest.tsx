import { useNotifications } from "@/hooks/useNotifications";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function NotificationTest() {
  const notifications = useNotifications();

  const testSessionStart = async () => {
    try {
      console.log("Testing session start notification...");
      await notifications.showSessionStartNotification("Classic", 25);
      Alert.alert("Success", "Session start notification sent!");
    } catch (error) {
      console.error("Error sending session start notification:", error);
      Alert.alert("Error", "Failed to send session start notification");
    }
  };

  const testSessionEnd = async () => {
    try {
      console.log("Testing session end notification...");
      await notifications.scheduleSessionEndNotification("Classic", 25);
      Alert.alert("Success", "Session end notification scheduled!");
    } catch (error) {
      console.error("Error scheduling session end notification:", error);
      Alert.alert("Error", "Failed to schedule session end notification");
    }
  };

  const testBreakReminder = async () => {
    try {
      console.log("Testing break reminder notification...");
      await notifications.scheduleBreakReminder(25);
      Alert.alert("Success", "Break reminder notification scheduled!");
    } catch (error) {
      console.error("Error scheduling break reminder notification:", error);
      Alert.alert("Error", "Failed to schedule break reminder notification");
    }
  };

  const testStreakMilestone = async () => {
    try {
      console.log("Testing streak milestone notification...");
      await notifications.showStreakMilestoneNotification(7);
      Alert.alert("Success", "Streak milestone notification sent!");
    } catch (error) {
      console.error("Error sending streak milestone notification:", error);
      Alert.alert("Error", "Failed to send streak milestone notification");
    }
  };

  const testTaskReminder = async () => {
    try {
      console.log("Testing task reminder notification...");
      await notifications.scheduleTaskReminder({
        id: "test-task",
        name: "Complete project documentation",
        dueDate: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
        priority: "important",
      });
      Alert.alert("Success", "Task reminder notification scheduled!");
    } catch (error) {
      console.error("Error scheduling task reminder notification:", error);
      Alert.alert("Error", "Failed to schedule task reminder notification");
    }
  };

  const testFlowProgress = async () => {
    try {
      console.log("Testing flow progress notification...");
      await notifications.showFlowProgressNotification("Morning Routine", 2, 5);
      Alert.alert("Success", "Flow progress notification sent!");
    } catch (error) {
      console.error("Error sending flow progress notification:", error);
      Alert.alert("Error", "Failed to send flow progress notification");
    }
  };

  const testFlowCompletion = async () => {
    try {
      console.log("Testing flow completion notification...");
      await notifications.showFlowCompletionNotification(
        "Morning Routine",
        120
      );
      Alert.alert("Success", "Flow completion notification sent!");
    } catch (error) {
      console.error("Error sending flow completion notification:", error);
      Alert.alert("Error", "Failed to send flow completion notification");
    }
  };

  const testCustomNotification = async () => {
    try {
      console.log("Testing custom notification with actions...");
      await notifications.displayNotification({
        id: "test-custom",
        title: "Test Custom Notification",
        body: "This is a test notification with action buttons",
        data: { testData: "value" },
        actions: [
          { id: "test-action-1", title: "Action 1", icon: "play" },
          {
            id: "test-action-2",
            title: "Action 2",
            icon: "stop",
            destructive: true,
          },
        ],
        priority: "high",
      });
      Alert.alert("Success", "Custom notification sent!");
    } catch (error) {
      console.error("Error sending custom notification:", error);
      Alert.alert("Error", "Failed to send custom notification");
    }
  };

  const cancelAll = async () => {
    try {
      console.log("Cancelling all notifications...");
      await notifications.cancelAllNotifications();
      Alert.alert("Success", "All notifications cancelled!");
    } catch (error) {
      console.error("Error cancelling notifications:", error);
      Alert.alert("Error", "Failed to cancel notifications");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notification Test</Text>
      <Text style={styles.subtitle}>Check console for debug logs</Text>

      <TouchableOpacity style={styles.button} onPress={testSessionStart}>
        <Text style={styles.buttonText}>Test Session Start</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={testSessionEnd}>
        <Text style={styles.buttonText}>Test Session End</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={testBreakReminder}>
        <Text style={styles.buttonText}>Test Break Reminder</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={testStreakMilestone}>
        <Text style={styles.buttonText}>Test Streak Milestone</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={testTaskReminder}>
        <Text style={styles.buttonText}>Test Task Reminder</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={testFlowProgress}>
        <Text style={styles.buttonText}>Test Flow Progress</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={testFlowCompletion}>
        <Text style={styles.buttonText}>Test Flow Completion</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={testCustomNotification}>
        <Text style={styles.buttonText}>Test Custom Notification</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.cancelButton]}
        onPress={cancelAll}
      >
        <Text style={styles.buttonText}>Cancel All Notifications</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
  },
  cancelButton: {
    backgroundColor: "#FF3B30",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
});
