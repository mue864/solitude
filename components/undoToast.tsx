import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function UndoToast({
  text1,
  onPress,
}: {
  text1: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.left}>
        <Ionicons name="trash" size={18} color={colors.destructive} />
        <Text style={[styles.text, { color: colors.textPrimary }]}>
          {text1}
        </Text>
      </View>
      <TouchableOpacity
        onPress={onPress}
        style={[
          styles.undoBtn,
          {
            backgroundColor: colors.accentMuted,
            borderColor: colors.accent + "60",
          },
        ]}
      >
        <Text style={[styles.undoText, { color: colors.accent }]}>Undo</Text>
      </TouchableOpacity>
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
  left: { flexDirection: "row", alignItems: "center", gap: 10 },
  text: { fontSize: 14, fontFamily: "SoraSemiBold" },
  undoBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  undoText: { fontSize: 13, fontFamily: "SoraSemiBold" },
});
