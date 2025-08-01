import WarningToast from "@/components/modals/WarningToast";
import ReflectionSaveToast from "@/components/ReflectionSaveToast";
import UndoToast from "@/components/undoToast";
import { useSessionStore } from "@/store/sessionState";
import notifee, { EventType } from "@notifee/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TransitionPresets } from "@react-navigation/stack";
import * as BackgroundFetch from "expo-background-fetch";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import * as TaskManager from "expo-task-manager";
import { useCallback, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";

// load splashscreen
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Background task ID
  const BACKGROUND_TASK_ID = "solitude-background-task";

  // load fonts
  const [fontsLoaded] = useFonts({
    Sora: require("@/assets/fonts/Sora.ttf"),
    SoraBold: require("@/assets/fonts/Sora-Bold.ttf"),
    SoraSemiBold: require("@/assets/fonts/Sora-SemiBold.ttf"),
    SoraExtraBold: require("@/assets/fonts/Sora-ExtraBold.ttf"),
    Courgete: require("@/assets/fonts/Courgette.ttf"),
    WorkSansItalic: require("@/assets/fonts/WorkSans-MediumItalic.ttf"),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // if fonts are loaded
  useEffect(() => {
    if (fontsLoaded) {
      onLayoutRootView();
    }
  }, [fontsLoaded, onLayoutRootView]);

  // Check streak when the app loads
  const checkAndResetStreak = useSessionStore(
    (state) => state.checkAndResetStreak
  );

  useEffect(() => {
    checkAndResetStreak();
  }, [checkAndResetStreak]);

  // Register background task
  useEffect(() => {
    const registerBackgroundTask = async () => {
      try {
        // Define background task
        TaskManager.defineTask(BACKGROUND_TASK_ID, async () => {
          try {
            console.log("🔄 Background task running...");

            // Check for active sessions
            const sessionData = await AsyncStorage.getItem("currentSession");
            if (sessionData) {
              const session = JSON.parse(sessionData);
              const now = Date.now();

              // If session is still active, show a notification to keep app alive
              if (session.isRunning && session.endTime > now) {
                await notifee.displayNotification({
                  id: "background-session-reminder",
                  title: "🎯 Session in Progress",
                  body: "Your focus session is still running. Tap to return to the app.",
                  android: {
                    channelId: "background-sessions",
                    importance: 4, // HIGH
                    ongoing: true,
                    autoCancel: false,
                  },
                });
              }
            }

            return BackgroundFetch.BackgroundFetchResult.NewData;
          } catch (error) {
            console.error("❌ Background task error:", error);
            return BackgroundFetch.BackgroundFetchResult.Failed;
          }
        });

        // Register background fetch
        await BackgroundFetch.registerTaskAsync(BACKGROUND_TASK_ID, {
          minimumInterval: 15 * 60, // 15 minutes minimum
          stopOnTerminate: false,
          startOnBoot: true,
        });

        console.log("✅ Background task registered successfully");
      } catch (error) {
        console.error("❌ Failed to register background task:", error);
      }
    };

    registerBackgroundTask();
  }, []);

  // Setup notification event listeners
  useEffect(() => {
    // Handle notification press
    const unsubscribePress = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) {
        console.log("📱 Notification pressed:", detail.notification);

        // Handle different notification types
        const notificationId = detail.notification?.id;
        if (notificationId === "background-session-reminder") {
          // Navigate to focus screen when background reminder is pressed
          // This will be handled by the navigation system
          console.log(
            "🎯 Background session reminder pressed - should navigate to focus"
          );
        }
      }
    });

    // Handle background events
    console.log("🔧 Registering background event handler...");

    // Register the background event handler
    const backgroundHandler = async ({ type, detail }: any) => {
      console.log("🔄 Notifee background event triggered:", { type, detail });

      try {
        if (type === EventType.PRESS) {
          console.log(
            "📱 Background notification pressed:",
            detail.notification
          );

          // Store action to be handled when app opens
          const notificationId = detail.notification?.id;
          if (notificationId) {
            await AsyncStorage.setItem("pendingAction", notificationId);
            console.log("💾 Stored pending action:", notificationId);
          }
        } else if (type === EventType.ACTION_PRESS) {
          console.log("🔘 Background action pressed:", detail.pressAction);

          // Handle action button presses from background
          const actionId = detail.pressAction?.id;
          if (actionId) {
            await AsyncStorage.setItem("pendingAction", actionId);
            console.log("💾 Stored pending action:", actionId);
          }
        } else if (type === EventType.DISMISSED) {
          console.log("❌ Background notification dismissed");
        } else if (type === EventType.DELIVERED) {
          console.log("📨 Background notification delivered");
        } else {
          console.log("❓ Unknown background event type:", type);
        }
      } catch (error) {
        console.error("❌ Error in background event handler:", error);
      }
    };

    notifee.onBackgroundEvent(backgroundHandler);
    console.log("✅ Background event handler registered");

    // Clean up notification listeners when the component unmounts.
    // Notifee's onForegroundEvent returns an unsubscribe function,
    // but onBackgroundEvent does NOT return a function (it returns void).
    // So, only call unsubscribePress as a function.
    console.log("✅ Notification event listeners registered successfully");
    console.log("🔧 Background event handler should be ready for testing");

    return () => {
      if (typeof unsubscribePress === "function") {
        unsubscribePress();
      }
      // Note: onBackgroundEvent returns void, so no cleanup needed
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container} onLayout={onLayoutRootView}>
        <StatusBar style="dark" />
        <View style={styles.background} />
        <SafeAreaView className="flex-1">
          <Stack
            screenOptions={{
              headerShown: false,
              ...TransitionPresets.SlideFromRightIOS,
              gestureDirection: "horizontal",
              contentStyle: styles.screenContent,
            }}
          >
            <Stack.Screen
              name="index"
              options={{
                contentStyle: [
                  styles.screenContent,
                  { backgroundColor: "transparent" },
                ],
              }}
            />
            <Stack.Screen
              name="(main)"
              options={{
                headerShown: false,
                contentStyle: styles.screenContent,
              }}
            />
          </Stack>
          <Toast
            config={{
              undoToast: ({ text1, props }) => (
                <UndoToast
                  text1={text1 ?? ""}
                  onPress={props?.onPress ?? (() => {})}
                />
              ),
              warningToast: ({ props }) => (
                <WarningToast
                  text1={props?.text1 ?? ""}
                  text2={props?.text2}
                  onPress={props?.onPress ?? (() => {})}
                />
              ),
              reflectionSaveToast: ({ props }) => (
                <ReflectionSaveToast text1={props?.text1 ?? ""} />
              ),
              // You can keep the default toasts if you want:
              success: (props) => <BaseToast {...props} />,
              error: (props) => <ErrorToast {...props} />,
            }}
          />
        </SafeAreaView>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#F4F9FF",
  },
  screenContent: {
    backgroundColor: "transparent",
  },
});
