import CustomTabBar from "@/components/CustomTabBar";
import { useTheme } from "@/context/ThemeContext";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

function TabNavigator() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          animation: "fade",
          sceneStyle: { backgroundColor: "transparent" },
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
  const { colors, isDarkMode } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <TabNavigator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    height: 0, // pill renders itself absolutely
  },
});
