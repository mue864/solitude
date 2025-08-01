import { useNotifications } from "@/hooks/useNotifications";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function NotificationTestSimple() {
  const notifications = useNotifications();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setTestResults((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${result}`,
    ]);
  };

  const testSimpleNotification = async () => {
    try {
      addResult("🧪 Testing simple notification...");
      await notifications.showTestNotification();
      addResult("✅ Simple notification sent");
      Alert.alert("Success", "Test notification sent!");
    } catch (error) {
      addResult("❌ Simple notification failed: " + error);
      Alert.alert("Error", "Failed to send test notification");
    }
  };

  const testSessionStart = async () => {
    try {
      addResult("🧪 Testing session start notification...");
      await notifications.showSessionStartNotification("Classic", 25);
      addResult("✅ Session start notification sent");
      Alert.alert("Success", "Session start notification sent!");
    } catch (error) {
      addResult("❌ Session start failed: " + error);
      Alert.alert("Error", "Failed to send session start notification");
    }
  };

  const testSessionComplete = async () => {
    try {
      addResult("🧪 Testing session complete notification...");
      await notifications.showSessionCompleteNotification("Classic", 25);
      addResult("✅ Session complete notification sent");
      Alert.alert("Success", "Session complete notification sent!");
    } catch (error) {
      addResult("❌ Session complete failed: " + error);
      Alert.alert("Error", "Failed to send session complete notification");
    }
  };

  const testBreakReminder = async () => {
    try {
      addResult("🧪 Testing break reminder...");
      await notifications.scheduleBreakReminder(25);
      addResult("✅ Break reminder scheduled");
      Alert.alert("Success", "Break reminder scheduled!");
    } catch (error) {
      addResult("❌ Break reminder failed: " + error);
      Alert.alert("Error", "Failed to schedule break reminder");
    }
  };

  const testStreakMilestone = async () => {
    try {
      addResult("🧪 Testing streak milestone...");
      await notifications.showStreakMilestoneNotification(7);
      addResult("✅ Streak milestone sent");
      Alert.alert("Success", "Streak milestone notification sent!");
    } catch (error) {
      addResult("❌ Streak milestone failed: " + error);
      Alert.alert("Error", "Failed to send streak milestone");
    }
  };

  const cancelAllNotifications = async () => {
    try {
      addResult("🧪 Cancelling all notifications...");
      await notifications.cancelAllNotifications();
      addResult("✅ All notifications cancelled");
      Alert.alert("Success", "All notifications cancelled!");
    } catch (error) {
      addResult("❌ Cancel all failed: " + error);
      Alert.alert("Error", "Failed to cancel notifications");
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Simple Notification Test</Text>
      <Text style={styles.subtitle}>Testing Notifee notifications</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Notifications</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={testSimpleNotification}
        >
          <Text style={styles.buttonText}>Test Simple Notification</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testSessionStart}>
          <Text style={styles.buttonText}>Test Session Start</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testSessionComplete}>
          <Text style={styles.buttonText}>Test Session Complete</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testBreakReminder}>
          <Text style={styles.buttonText}>Test Break Reminder</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testStreakMilestone}>
          <Text style={styles.buttonText}>Test Streak Milestone</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={cancelAllNotifications}
        >
          <Text style={styles.buttonText}>Cancel All Notifications</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.resultsHeader}>
          <Text style={styles.sectionTitle}>Test Results</Text>
          <TouchableOpacity style={styles.clearButton} onPress={clearResults}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.resultsContainer}>
          {testResults.length === 0 ? (
            <Text style={styles.noResults}>
              No test results yet. Run some tests!
            </Text>
          ) : (
            testResults.map((result, index) => (
              <Text key={index} style={styles.resultText}>
                {result}
              </Text>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
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
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  clearButton: {
    backgroundColor: "#FF9500",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  clearButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  resultsContainer: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    minHeight: 200,
  },
  noResults: {
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
  },
  resultText: {
    fontSize: 12,
    marginBottom: 5,
    fontFamily: "monospace",
  },
});
