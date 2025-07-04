import { TransitionPresets } from "@react-navigation/stack";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect } from "react";
import { View, StyleSheet } from "react-native";
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
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F4F9FF',
  },
  screenContent: {
    backgroundColor: 'transparent',
  },
});
