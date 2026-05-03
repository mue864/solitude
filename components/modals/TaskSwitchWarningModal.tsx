import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface TaskSwitchWarningModalProps {
  isVisible: boolean;
  currentTaskName: string;
  newTaskName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function TaskSwitchWarningModal({
  isVisible,
  currentTaskName,
  newTaskName,
  onConfirm,
  onCancel,
}: TaskSwitchWarningModalProps) {
  const { colors } = useTheme();

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable style={s.overlay} onPress={onCancel}>
        <Pressable
          style={[
            s.sheet,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={[s.iconWrap, { backgroundColor: colors.accentMuted }]}>
            <Ionicons name="swap-horizontal" size={22} color={colors.accent} />
          </View>

          <Text style={[s.title, { color: colors.textPrimary }]}>
            Switch Task?
          </Text>

          <Text style={[s.body, { color: colors.textSecondary }]}>
            You're currently focused on{" "}
            <Text
              style={{ color: colors.textPrimary, fontFamily: "SoraSemiBold" }}
            >
              "{currentTaskName}"
            </Text>
            .{"\n\n"}
            Switching to{" "}
            <Text
              style={{ color: colors.textPrimary, fontFamily: "SoraSemiBold" }}
            >
              "{newTaskName}"
            </Text>{" "}
            will end your current session.
          </Text>

          <View style={s.row}>
            <TouchableOpacity
              style={[
                s.btn,
                {
                  backgroundColor: colors.surfaceMuted,
                  borderColor: colors.border,
                  borderWidth: 1,
                },
              ]}
              onPress={onCancel}
            >
              <Text style={[s.btnText, { color: colors.textSecondary }]}>
                Keep going
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.btn, { backgroundColor: colors.accent }]}
              onPress={onConfirm}
            >
              <Text style={[s.btnText, { color: "#fff" }]}>Switch</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
  },
  sheet: {
    width: "88%",
    maxWidth: 380,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: { fontSize: 18, fontFamily: "SoraBold", marginBottom: 10 },
  body: {
    fontSize: 14,
    fontFamily: "Sora",
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 24,
  },
  row: { flexDirection: "row", gap: 10, width: "100%" },
  btn: { flex: 1, paddingVertical: 13, borderRadius: 14, alignItems: "center" },
  btnText: { fontSize: 14, fontFamily: "SoraSemiBold" },
});
