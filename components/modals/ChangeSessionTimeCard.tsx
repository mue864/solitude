import BottomSheet from "@/components/BottomSheet";
import { useTheme } from "@/context/ThemeContext";
import {
  SESSION_TYPES,
  SessionType,
  useSessionStore,
} from "@/store/sessionState";
import React, { useEffect, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface ChangeSessionTimeCardProps {
  isVisible: boolean;
  onClose: () => void;
  sessionType: SessionType;
}

const ChangeSessionTimeCard = ({
  isVisible,
  onClose,
  sessionType,
}: ChangeSessionTimeCardProps) => {
  const { colors } = useTheme();
  const setDuration = useSessionStore((s) => s.setDuration);
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("00");

  useEffect(() => {
    if (isVisible) {
      const totalSeconds = SESSION_TYPES[sessionType];
      const mins = Math.floor(totalSeconds / 60);
      const secs = totalSeconds % 60;
      setMinutes(mins.toString());
      setSeconds(secs.toString().padStart(2, "0"));
    }
  }, [isVisible, sessionType]);

  const handleSave = () => {
    const totalSeconds = parseInt(minutes) * 60 + parseInt(seconds || "0");
    if (!isNaN(totalSeconds) && totalSeconds > 0) {
      setDuration(totalSeconds);
      onClose();
    }
  };

  const clamp = (text: string, max: number): string | undefined => {
    const val = text.replace(/[^0-9]/g, "");
    if (val.length > 2) return undefined;
    if (val.length > 0 && parseInt(val) > max) return max.toString();
    return val;
  };

  return (
    <BottomSheet
      isVisible={isVisible}
      onClose={onClose}
      title={`Set ${sessionType} Time`}
    >
      {/* Time inputs */}
      <View style={s.row}>
        <View style={s.field}>
          <TextInput
            style={[
              s.input,
              {
                backgroundColor: colors.surfaceMuted,
                borderColor: colors.border,
                color: colors.textPrimary,
              },
              Platform.OS === "ios" && { paddingVertical: 16 },
            ]}
            value={minutes}
            onChangeText={(t) => {
              const v = clamp(t, 99);
              if (v !== undefined) setMinutes(v);
            }}
            keyboardType="number-pad"
            maxLength={2}
            placeholder="25"
            placeholderTextColor={colors.textSecondary}
            selectionColor={colors.accent}
          />
          <Text style={[s.fieldLabel, { color: colors.textSecondary }]}>
            Minutes
          </Text>
        </View>

        <Text style={[s.colon, { color: colors.textPrimary }]}>:</Text>

        <View style={s.field}>
          <TextInput
            style={[
              s.input,
              {
                backgroundColor: colors.surfaceMuted,
                borderColor: colors.border,
                color: colors.textPrimary,
              },
              Platform.OS === "ios" && { paddingVertical: 16 },
            ]}
            value={seconds}
            onChangeText={(t) => {
              const v = clamp(t, 59);
              if (v !== undefined) setSeconds(v);
            }}
            keyboardType="number-pad"
            maxLength={2}
            placeholder="00"
            placeholderTextColor={colors.textSecondary}
            selectionColor={colors.accent}
          />
          <Text style={[s.fieldLabel, { color: colors.textSecondary }]}>
            Seconds
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[s.saveBtn, { backgroundColor: colors.accent }]}
        onPress={handleSave}
        activeOpacity={0.85}
      >
        <Text style={s.saveBtnText}>Save</Text>
      </TouchableOpacity>
    </BottomSheet>
  );
};

export default ChangeSessionTimeCard;

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
    gap: 8,
  },
  field: { alignItems: "center" },
  input: {
    width: 88,
    height: 88,
    borderRadius: 18,
    borderWidth: 1,
    fontSize: 36,
    fontFamily: "SoraBold",
    textAlign: "center",
  },
  fieldLabel: { fontSize: 12, fontFamily: "Sora", marginTop: 8 },
  colon: {
    fontSize: 36,
    fontFamily: "SoraBold",
    marginBottom: 20,
    marginHorizontal: 4,
  },
  saveBtn: {
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: "center",
  },
  saveBtnText: { fontSize: 15, fontFamily: "SoraSemiBold", color: "#fff" },
});
