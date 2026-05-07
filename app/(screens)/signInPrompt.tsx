import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function SignInPrompt() {
  const { colors } = useTheme();

  const s = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 28,
    },
    closeBtn: {
      position: "absolute",
      top: 52,
      right: 24,
      zIndex: 10,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.surfaceMuted,
      alignItems: "center",
      justifyContent: "center",
    },
    body: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },
    iconWrap: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.accentMuted,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
    },
    heading: {
      fontFamily: "SoraBold",
      fontSize: 26,
      color: colors.textPrimary,
      textAlign: "center",
      letterSpacing: -0.4,
    },
    subtitle: {
      fontFamily: "Sora",
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 22,
      maxWidth: 280,
    },
    perks: {
      marginTop: 12,
      gap: 10,
      alignSelf: "stretch",
    },
    perkRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingHorizontal: 4,
    },
    perkText: {
      fontFamily: "Sora",
      fontSize: 14,
      color: colors.textSecondary,
    },
    footer: {
      paddingBottom: 44,
      gap: 12,
    },
    primaryBtn: {
      height: 52,
      borderRadius: 14,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    primaryBtnText: {
      fontFamily: "SoraBold",
      fontSize: 16,
      color: "#fff",
    },
    secondaryBtn: {
      height: 52,
      borderRadius: 14,
      backgroundColor: colors.surfaceMuted,
      alignItems: "center",
      justifyContent: "center",
    },
    secondaryBtnText: {
      fontFamily: "SoraSemiBold",
      fontSize: 15,
      color: colors.textPrimary,
    },
    skipBtn: {
      alignItems: "center",
      paddingVertical: 8,
    },
    skipText: {
      fontFamily: "Sora",
      fontSize: 14,
      color: colors.textSecondary,
    },
  });

  return (
    <View style={s.root}>
      {/* X button */}
      <Pressable
        style={s.closeBtn}
        onPress={() => router.replace("/(main)/focus" as any)}
      >
        <Ionicons name="close" size={18} color={colors.textSecondary} />
      </Pressable>

      <View style={s.body}>
        <View style={s.iconWrap}>
          <Ionicons name="cloud-outline" size={34} color={colors.accent} />
        </View>

        <Text style={s.heading}>Restore your data</Text>
        <Text style={s.subtitle}>
          Sign in to back up your sessions, tasks, and journal — and access them
          on any device.
        </Text>

        <View style={s.perks}>
          {[
            "Cloud backup across devices",
            "Never lose your streak or tasks",
            "Premium analytics & insights",
          ].map((perk) => (
            <View key={perk} style={s.perkRow}>
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={colors.accent}
              />
              <Text style={s.perkText}>{perk}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={s.footer}>
        <Pressable
          style={s.primaryBtn}
          onPress={() => router.push("/(auth)/login" as any)}
        >
          <Text style={s.primaryBtnText}>Sign In</Text>
        </Pressable>

        <Pressable
          style={s.secondaryBtn}
          onPress={() => router.push("/(auth)/register" as any)}
        >
          <Text style={s.secondaryBtnText}>Create Account</Text>
        </Pressable>

        <Pressable
          style={s.skipBtn}
          onPress={() => router.replace("/(main)/focus" as any)}
        >
          <Text style={s.skipText}>Maybe later</Text>
        </Pressable>
      </View>
    </View>
  );
}
