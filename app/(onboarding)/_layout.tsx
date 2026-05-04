import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";

const OnboardingLayout = () => {
  return (
    <View style={{ flex: 1, backgroundColor: "#111318" }}>
      <StatusBar style="light" translucent />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          contentStyle: { backgroundColor: "transparent" },
        }}
      >
        <Stack.Screen name="welcome" />
        <Stack.Screen name="workType" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="completeSetup" />
      </Stack>
    </View>
  );
};

export default OnboardingLayout;
