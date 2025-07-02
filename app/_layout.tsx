import { TransitionPresets } from "@react-navigation/stack";
import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

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

  return (
    <LinearGradient
      colors={["#2764A1", "#2A77C4", "#318CE7"]}
      className="flex-1"
      onLayout={onLayoutRootView}
    >
      <StatusBar style="auto" translucent />
      <SafeAreaView className="flex-1">
        <Stack
          screenOptions={{
            headerShown: false,
            ...TransitionPresets.SlideFromRightIOS,
            gestureDirection: "horizontal"
          }}
        >
          <Stack.Screen name="index" />
        </Stack>
      </SafeAreaView>
    </LinearGradient>
  );
}
