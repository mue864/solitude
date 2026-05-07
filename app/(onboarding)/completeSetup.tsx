import Button from "@/components/Button";
import { Strings } from "@/constants";
import { useTheme } from "@/context/ThemeContext";
import { useAuthStore } from "@/store/authStore";
import { useOnboardingStore } from "@/store/onboardingStore";
import { router } from "expo-router";
import LottieView from "lottie-react-native";
import { StyleSheet, Text, View } from "react-native";

function ProgressDots({ step, total }: { step: number; total: number }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        gap: 6,
        alignSelf: "center",
        marginBottom: 32,
      }}
    >
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={{
            width: i + 1 <= step ? 20 : 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: i + 1 <= step ? colors.accent : colors.border,
          }}
        />
      ))}
    </View>
  );
}

export default function CompleteSetup() {
  const { colors } = useTheme();
  const setOnboardingComplete = useOnboardingStore(
    (state) => state.setFinishedOnboarding,
  );
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  const s = StyleSheet.create({
    root: { flex: 1, paddingTop: 40 },
    body: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
    heading: {
      fontFamily: "SoraBold",
      fontSize: 36,
      color: colors.textPrimary,
      textAlign: "center",
    },
    lottie: { width: 180, height: 180 },
    subtitle: {
      fontFamily: "SoraSemiBold",
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: "center",
    },
    footer: { marginBottom: 40 },
  });

  return (
    <View style={s.root}>
      <ProgressDots step={3} total={3} />
      <View style={s.body}>
        <Text style={s.heading}>{Strings.completeSetupHeading}</Text>
        <LottieView
          source={require("@/assets/lottie/checkmark.json")}
          autoPlay
          loop={false}
          style={s.lottie}
        />
        <Text style={s.subtitle}>{Strings.completeSetupContent}</Text>
      </View>
      <View style={s.footer}>
        <Button
          buttonText={Strings.completeSetupBtn}
          nextPage={() => {
            setOnboardingComplete();
            if (isLoggedIn) {
              router.replace("/(main)/focus" as any);
            } else {
              router.replace("/(screens)/signInPrompt" as any);
            }
          }}
        />
      </View>
    </View>
  );
}
