import Button from "@/components/Button";
import { Strings } from "@/constants";
import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import notifee from "@notifee/react-native";
import { router } from "expo-router";
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

export default function Notifications() {
  const { colors } = useTheme();

  const getPermissions = async () => {
    await notifee.requestPermission();
  };

  const s = StyleSheet.create({
    root: { flex: 1, paddingTop: 40 },
    heading: {
      fontFamily: "SoraBold",
      fontSize: 32,
      color: colors.textPrimary,
      textAlign: "center",
      lineHeight: 40,
      marginBottom: 8,
      paddingHorizontal: 32,
    },
    body: { flex: 1, alignItems: "center", justifyContent: "center", gap: 24 },
    iconWrap: {
      width: 100,
      height: 100,
      borderRadius: 28,
      backgroundColor: colors.accentMuted,
      alignItems: "center",
      justifyContent: "center",
    },
    subtitle: {
      fontFamily: "SoraSemiBold",
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 26,
      paddingHorizontal: 40,
    },
    footer: { marginBottom: 40, gap: 12 },
  });

  return (
    <View style={s.root}>
      <ProgressDots step={2} total={3} />
      <Text style={s.heading}>{Strings.notificationsHeading}</Text>
      <View style={s.body}>
        <View style={s.iconWrap}>
          <Ionicons
            name="notifications-outline"
            size={44}
            color={colors.accent}
          />
        </View>
        <Text style={s.subtitle}>{Strings.notificationsContent}</Text>
      </View>
      <View style={s.footer}>
        <Button
          buttonText={Strings.notificationsBtn1}
          nextPage={() => {
            getPermissions();
            router.push("/(onboarding)/completeSetup");
          }}
        />
        <Button
          buttonText={Strings.notificationsBtn2}
          nextPage={() => router.push("/(onboarding)/completeSetup")}
          variant="ghost"
        />
      </View>
    </View>
  );
}
