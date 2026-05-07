import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface WarningToastProps {
  text1: string;
  text2?: string;
  icon?: string;
  iconColor?: string;
  onPress?: () => void;
}

export default function WarningToast({
  text1,
  text2,
  icon = "warning",
  iconColor,
  onPress,
}: WarningToastProps) {
  const { colors } = useTheme();
  const resolvedIconColor = iconColor ?? colors.accent;
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.left}>
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: resolvedIconColor + "22" },
          ]}
        >
          <Ionicons name={icon as any} size={16} color={resolvedIconColor} />
        </View>
        <View>
          <Text style={[styles.text, { color: colors.textPrimary }]}>
            {text1}
          </Text>
          {text2 ? (
            <Text style={[styles.sub, { color: colors.textSecondary }]}>
              {text2}
            </Text>
          ) : null}
        </View>
      </View>
      {onPress && (
        <TouchableOpacity onPress={onPress} hitSlop={10}>
          <Ionicons name="close" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
    marginHorizontal: 16,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  left: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { fontSize: 14, fontFamily: "SoraSemiBold" },
  sub: { fontSize: 12, fontFamily: "Sora", marginTop: 2 },
});
