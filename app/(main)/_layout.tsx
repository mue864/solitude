import CustomTabBar from "@/components/CustomTabBar";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const SPRING_CONFIG = {
  damping: 20,
  stiffness: 100,
  overshootClamping: true,
};

function TabNavigator() {
  const translateX = useSharedValue(0);
  const prevIndex = useSharedValue(0);

  const handleIndexChange = (index: number) => {
    // Optional: Add haptic feedback here if needed
  };

  // Animation style for tab transitions
  useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withSpring(translateX.value, SPRING_CONFIG),
      },
    ],
  }));

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
        screenListeners={{
          state: (e) => {
            "worklet";
            const index = e.data?.state?.index || 0;
            const direction = index > prevIndex.value ? 1 : -1;
            translateX.value = direction * 30;
            translateX.value = withTiming(0, {
              duration: 250,
              easing: Easing.inOut(Easing.quad),
            });
            prevIndex.value = index;
            runOnJS(handleIndexChange)(index);
          },
        }}
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarBackground: () => <View style={styles.tabBarBackground} />,
        }}
        tabBar={(props) => <CustomTabBar {...props} />}
      >
        <Tabs.Screen name="focus" options={{ tabBarLabel: "Focus" }} />
        <Tabs.Screen name="plan" options={{ tabBarLabel: "Plan" }} />
        <Tabs.Screen name="journal" options={{ tabBarLabel: "Journal" }} />
        <Tabs.Screen name="insights" options={{ tabBarLabel: "Insights" }} />
        <Tabs.Screen name="settings" options={{ tabBarLabel: "Settings" }} />
      </Tabs>
    </GestureHandlerRootView>
  );
}

export default function Layout() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <TabNavigator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F9FF",
  },
  tabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 0,
    shadowOpacity: 0,
    borderTopWidth: 0,
    backgroundColor: "transparent",
  },
  tabBarBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#F5F8FB",
  },
});
