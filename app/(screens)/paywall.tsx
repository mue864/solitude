import { useTheme } from "@/context/ThemeContext";
import { useSettingsStore } from "@/store/settingsStore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const PRO_FEATURES = [
  { icon: "cloud-upload-outline", label: "Cloud backup & sync across devices" },
  { icon: "analytics-outline", label: "Advanced analytics & insights" },
  { icon: "color-palette-outline", label: "Custom themes" },
  { icon: "timer-outline", label: "Custom session durations" },
  { icon: "notifications-outline", label: "Scheduled notifications" },
  { icon: "musical-notes-outline", label: "Background focus sounds" },
];

export default function PaywallScreen() {
  const { colors } = useTheme();
  const upgradeToPro = useSettingsStore((s) => s.upgradeToPro);

  function handleUpgrade() {
    // TODO: integrate real in-app purchase (RevenueCat / Expo IAP)
    // For now, unlocks pro locally so the sync layer activates
    upgradeToPro();
    router.replace("/(auth)/login" as any);
  }

  const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    scroll: {
      flexGrow: 1,
      paddingHorizontal: 28,
      paddingTop: 60,
      paddingBottom: 48,
    },
    badge: {
      alignSelf: "center",
      backgroundColor: colors.accentMuted,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 6,
      marginBottom: 24,
    },
    badgeText: {
      fontFamily: "SoraSemiBold",
      fontSize: 13,
      color: colors.accent,
    },
    heading: {
      fontFamily: "SoraBold",
      fontSize: 30,
      color: colors.textPrimary,
      textAlign: "center",
      lineHeight: 38,
      marginBottom: 12,
    },
    accent: { color: colors.accent },
    sub: {
      fontFamily: "SoraRegular",
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 24,
      marginBottom: 36,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 20,
      gap: 16,
      marginBottom: 32,
    },
    featureRow: { flexDirection: "row", alignItems: "center", gap: 14 },
    featureText: {
      fontFamily: "SoraRegular",
      fontSize: 15,
      color: colors.textPrimary,
      flex: 1,
    },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: 4 },
    priceRow: { alignItems: "center", marginBottom: 20 },
    price: { fontFamily: "SoraBold", fontSize: 36, color: colors.textPrimary },
    priceSub: {
      fontFamily: "SoraRegular",
      fontSize: 14,
      color: colors.textSecondary,
    },
    btn: {
      backgroundColor: colors.accent,
      borderRadius: 16,
      height: 56,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 12,
    },
    btnText: { fontFamily: "SoraSemiBold", fontSize: 16, color: "#FFFFFF" },
    ghost: {
      height: 48,
      justifyContent: "center",
      alignItems: "center",
    },
    ghostText: {
      fontFamily: "SoraRegular",
      fontSize: 14,
      color: colors.textSecondary,
    },
    disclaimer: {
      fontFamily: "SoraRegular",
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: "center",
      marginTop: 16,
      lineHeight: 18,
    },
  });

  return (
    <ScrollView style={s.root} contentContainerStyle={s.scroll}>
      <View style={s.badge}>
        <Text style={s.badgeText}>Solitude Pro</Text>
      </View>

      <Text style={s.heading}>
        Your focus,{"\n"}
        <Text style={s.accent}>everywhere.</Text>
      </Text>
      <Text style={s.sub}>
        Back up your sessions, tasks, and reflections. Access them on any
        device.
      </Text>

      <View style={s.card}>
        {PRO_FEATURES.map((f, i) => (
          <View key={f.label}>
            <View style={s.featureRow}>
              <Ionicons name={f.icon as any} size={22} color={colors.accent} />
              <Text style={s.featureText}>{f.label}</Text>
            </View>
            {i < PRO_FEATURES.length - 1 && (
              <View style={[s.divider, { marginTop: 16 }]} />
            )}
          </View>
        ))}
      </View>

      <View style={s.priceRow}>
        <Text style={s.price}>$2.99</Text>
        <Text style={s.priceSub}>per month · cancel any time</Text>
      </View>

      <Pressable style={s.btn} onPress={handleUpgrade}>
        <Text style={s.btnText}>Unlock Pro</Text>
      </Pressable>

      <Pressable style={s.ghost} onPress={() => router.back()}>
        <Text style={s.ghostText}>Maybe later</Text>
      </Pressable>

      <Text style={s.disclaimer}>
        Payment is charged to your account at confirmation of purchase.
        Subscription auto-renews unless cancelled at least 24 hours before the
        end of the current period.
      </Text>
    </ScrollView>
  );
}
