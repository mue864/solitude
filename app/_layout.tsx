import WarningToast from "@/components/modals/WarningToast";
import ReflectionSaveToast from "@/components/ReflectionSaveToast";
import UndoToast from "@/components/undoToast";
import { useSessionStore } from "@/store/sessionState";
import { TransitionPresets } from "@react-navigation/stack";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";

// load splashscreen
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
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
