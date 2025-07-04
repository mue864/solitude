import { TransitionPresets } from "@react-navigation/stack";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";

const OnboardingLayout = () => {
  return (
    <LinearGradient
      colors={["#2764A1", "#2A77C4", "#318CE7"]}
      className="flex-1"
    >
      <View className="flex-1">
        <StatusBar style="auto" translucent />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            contentStyle: {backgroundColor: 'transparent'}
          }}
          
        >
          <Stack.Screen name="welcome" />
          <Stack.Screen name="widgets" />
          <Stack.Screen name="workType" />
          <Stack.Screen name="pomodoro" />
          <Stack.Screen name="personalization" />
          <Stack.Screen name="notifications" />
          <Stack.Screen name="completeSetup" />
        </Stack>
      </View>
    </LinearGradient>
  );
};

export default OnboardingLayout;
