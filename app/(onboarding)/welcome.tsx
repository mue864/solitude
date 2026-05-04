import Button from "@/components/Button";
import { Strings } from "@/constants";
import { useTheme } from "@/context/ThemeContext";
import { router } from "expo-router";
import LottieView from "lottie-react-native";
import { StyleSheet, Text, View } from "react-native";

export default function Welcome() {
  const { colors } = useTheme();

  const s = StyleSheet.create({
    root: { flex: 1, paddingTop: 60, paddingHorizontal: 32 },
    body: { flex: 1, justifyContent: "space-between" },
    heading: {
      fontFamily: "SoraBold",
      fontSize: 40,
      color: colors.textPrimary,
      textAlign: "center",
      lineHeight: 48,
    },
    accent: { color: colors.accent },
    lottie: { width: 200, height: 200, alignSelf: "center" },
    tagline: {
      fontFamily: "SoraSemiBold",
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 26,
    },
    footer: { marginBottom: 40 },
  });

  return (
    <View style={s.root}>
      <View style={s.body}>
        <Text style={s.heading}>
          {Strings.welcomeHeading}
          {"\n"}
          <Text style={s.accent}>{Strings.appName}</Text>
        </Text>
        <LottieView
          source={require("@/assets/lottie/plant.json")}
          autoPlay
          loop={false}
          style={s.lottie}
        />
        <Text style={s.tagline}>{Strings.welcomeContent}</Text>
        <View style={s.footer}>
          <Button
            buttonText={Strings.onboadingPage1Button}
            nextPage={() => router.push("/(onboarding)/workType")}
          />
        </View>
      </View>
    </View>
  );
}
