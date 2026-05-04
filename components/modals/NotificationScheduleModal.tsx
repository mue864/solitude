import { useTheme } from "@/context/ThemeContext";
import {
  ProNotificationSchedule,
  useSettingsStore,
} from "@/store/settingsStore";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface NotificationScheduleModalProps {
  visible: boolean;
  onClose: () => void;
  editingSchedule?: ProNotificationSchedule | null;
}

const DAYS_OF_WEEK = [
  { id: 0, name: "Sun" },
  { id: 1, name: "Mon" },
  { id: 2, name: "Tue" },
  { id: 3, name: "Wed" },
  { id: 4, name: "Thu" },
  { id: 5, name: "Fri" },
  { id: 6, name: "Sat" },
];

const SCHEDULE_TYPES = [
  {
    value: "session",
    label: "Session Reminder",
    icon: "timer-outline",
    description: "Remind to start focus sessions",
  },
  {
    value: "break",
    label: "Break Reminder",
    icon: "cafe-outline",
    description: "Remind to take breaks",
  },
  {
    value: "reminder",
    label: "General Reminder",
    icon: "notifications-outline",
    description: "General productivity reminders",
  },
];

function describeDays(days: number[]): string {
  if (days.length === 0) return "No days selected";
  if (days.length === 7) return "Every day";
  if (days.length === 5 && days.every((d) => [1, 2, 3, 4, 5].includes(d)))
    return "Weekdays only";
  if (days.length === 2 && days.every((d) => [0, 6].includes(d)))
    return "Weekends only";
  return `${days.length} day${days.length > 1 ? "s" : ""} selected`;
}

export default function NotificationScheduleModal({
  visible,
  onClose,
  editingSchedule,
}: NotificationScheduleModalProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { addNotificationSchedule, updateNotificationSchedule, removeNotificationSchedule } =
    useSettingsStore();

  const [scheduleName, setScheduleName] = useState("");
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [scheduleType, setScheduleType] = useState<"session" | "break" | "reminder">("session");
  const [isEnabled, setIsEnabled] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const s = makeStyles(colors);

  useEffect(() => {
    if (editingSchedule) {
      setScheduleName(editingSchedule.name);
      setSelectedTime(editingSchedule.time);
      setSelectedDays(editingSchedule.days);
      setScheduleType(editingSchedule.type);
      setIsEnabled(editingSchedule.enabled);
      setIsEditing(true);
    } else {
      setScheduleName("");
      setSelectedTime("09:00");
      setSelectedDays([1, 2, 3, 4, 5]);
      setScheduleType("session");
      setIsEnabled(true);
      setIsEditing(false);
    }
  }, [editingSchedule, visible]);

  const handleSave = () => {
    if (!scheduleName.trim()) {
      Alert.alert("Error", "Please enter a schedule name");
      return;
    }
    if (selectedDays.length === 0) {
      Alert.alert("Error", "Please select at least one day");
      return;
    }

    const schedule: ProNotificationSchedule = {
      id: editingSchedule?.id || `schedule-${Date.now()}`,
      name: scheduleName.trim(),
      time: selectedTime,
      days: selectedDays,
      enabled: isEnabled,
      type: scheduleType,
    };

    if (isEditing && editingSchedule) {
      updateNotificationSchedule(editingSchedule.id, schedule);
    } else {
      addNotificationSchedule(schedule);
    }
    onClose();
  };

  const handleDelete = () => {
    if (!editingSchedule) return;
    Alert.alert(
      "Delete Schedule",
      `Are you sure you want to delete "${editingSchedule.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            removeNotificationSchedule(editingSchedule.id);
            onClose();
          },
        },
      ]
    );
  };

  const toggleDay = (dayId: number) => {
    setSelectedDays((prev) =>
      prev.includes(dayId) ? prev.filter((id) => id !== dayId) : [...prev, dayId].sort()
    );
  };

  const [hour, minute] = selectedTime.split(":");
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[s.root, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[s.header, { paddingTop: insets.top + 12, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={s.headerBtn}>
            <Ionicons name="close" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={[s.headerTitle, { color: colors.textPrimary }]}>
            {isEditing ? "Edit Schedule" : "New Schedule"}
          </Text>
          <TouchableOpacity onPress={handleSave} style={s.headerBtn}>
            <Text style={[s.headerSave, { color: colors.accent }]}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Name */}
          <Text style={[s.label, { color: colors.textSecondary }]}>Schedule Name</Text>
          <TextInput
            style={[s.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
            value={scheduleName}
            onChangeText={setScheduleName}
            placeholder="e.g. Morning Focus"
            placeholderTextColor={colors.textSecondary}
          />

          {/* Schedule Type */}
          <Text style={[s.label, { color: colors.textSecondary }]}>Type</Text>
          <View style={s.section}>
            {SCHEDULE_TYPES.map((type) => {
              const active = scheduleType === type.value;
              return (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    s.typeRow,
                    { borderBottomColor: colors.border },
                    active && { backgroundColor: colors.accentMuted },
                  ]}
                  onPress={() => setScheduleType(type.value as any)}
                >
                  <View style={[s.typeIcon, { backgroundColor: active ? colors.accentMuted : colors.surfaceMuted }]}>
                    <Ionicons
                      name={type.icon as any}
                      size={18}
                      color={active ? colors.accent : colors.textSecondary}
                    />
                  </View>
                  <View style={s.typeText}>
                    <Text style={[s.typeLabel, { color: active ? colors.accent : colors.textPrimary }]}>
                      {type.label}
                    </Text>
                    <Text style={[s.typeDesc, { color: colors.textSecondary }]}>
                      {type.description}
                    </Text>
                  </View>
                  {active && <Ionicons name="checkmark" size={16} color={colors.accent} />}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Time Picker */}
          <Text style={[s.label, { color: colors.textSecondary }]}>Time</Text>
          <View style={[s.section, s.timeRow]}>
            <View style={s.timePart}>
              <Text style={[s.timePartLabel, { color: colors.textSecondary }]}>Hour</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {hours.map((h) => {
                  const sel = h === hour;
                  return (
                    <TouchableOpacity
                      key={h}
                      style={[
                        s.timeChip,
                        { backgroundColor: sel ? colors.accent : colors.surfaceMuted },
                      ]}
                      onPress={() => setSelectedTime(`${h}:${minute}`)}
                    >
                      <Text style={[s.timeChipText, { color: sel ? colors.background : colors.textSecondary }]}>
                        {h}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
            <Text style={[s.timeSep, { color: colors.textSecondary }]}>:</Text>
            <View style={s.timePart}>
              <Text style={[s.timePartLabel, { color: colors.textSecondary }]}>Minute</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {minutes.map((m) => {
                  const sel = m === minute;
                  return (
                    <TouchableOpacity
                      key={m}
                      style={[
                        s.timeChip,
                        { backgroundColor: sel ? colors.accent : colors.surfaceMuted },
                      ]}
                      onPress={() => setSelectedTime(`${hour}:${m}`)}
                    >
                      <Text style={[s.timeChipText, { color: sel ? colors.background : colors.textSecondary }]}>
                        {m}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
          <Text style={[s.timePreview, { color: colors.textSecondary }]}>
            {selectedTime} {parseInt(hour) >= 12 ? "PM" : "AM"}
          </Text>

          {/* Day Selector */}
          <Text style={[s.label, { color: colors.textSecondary }]}>Days</Text>
          <View style={s.quickRow}>
            {[["All", () => setSelectedDays([0,1,2,3,4,5,6])], ["Weekdays", () => setSelectedDays([1,2,3,4,5])], ["Weekends", () => setSelectedDays([0,6])]].map(([label, fn]) => (
              <TouchableOpacity
                key={label as string}
                style={[s.quickChip, { backgroundColor: colors.surfaceMuted }]}
                onPress={fn as () => void}
              >
                <Text style={[s.quickChipText, { color: colors.textSecondary }]}>{label as string}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={[s.section, s.dayGrid]}>
            {DAYS_OF_WEEK.map((day) => {
              const sel = selectedDays.includes(day.id);
              return (
                <TouchableOpacity
                  key={day.id}
                  style={[
                    s.dayChip,
                    { backgroundColor: sel ? colors.accent : colors.surfaceMuted },
                  ]}
                  onPress={() => toggleDay(day.id)}
                >
                  <Text style={[s.dayChipText, { color: sel ? colors.background : colors.textSecondary }]}>
                    {day.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={[s.dayPreview, { color: colors.textSecondary }]}>
            {describeDays(selectedDays)}
          </Text>

          {/* Toggle */}
          <View style={[s.toggleRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons
              name={isEnabled ? "notifications-outline" : "notifications-off-outline"}
              size={20}
              color={isEnabled ? colors.accent : colors.textSecondary}
            />
            <View style={s.toggleText}>
              <Text style={[s.toggleLabel, { color: colors.textPrimary }]}>Enable Schedule</Text>
              <Text style={[s.toggleSub, { color: colors.textSecondary }]}>
                {isEnabled ? "Active" : "Paused"}
              </Text>
            </View>
            <Switch
              value={isEnabled}
              onValueChange={setIsEnabled}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Delete */}
          {isEditing && editingSchedule && (
            <TouchableOpacity
              style={[s.deleteBtn, { borderColor: colors.destructive }]}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={18} color={colors.destructive} />
              <Text style={[s.deleteBtnText, { color: colors.destructive }]}>Delete Schedule</Text>
            </TouchableOpacity>
          )}

          <View style={{ height: insets.bottom + 24 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    root: { flex: 1 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingBottom: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    headerBtn: { padding: 4, minWidth: 44 },
    headerTitle: { fontFamily: "SoraSemiBold", fontSize: 16 },
    headerSave: { fontFamily: "SoraSemiBold", fontSize: 15 },
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 16, paddingTop: 20 },
    label: {
      fontFamily: "SoraSemiBold",
      fontSize: 12,
      letterSpacing: 0.5,
      textTransform: "uppercase",
      marginBottom: 8,
      marginTop: 20,
    },
    input: {
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontFamily: "Sora",
      fontSize: 15,
      borderWidth: StyleSheet.hairlineWidth,
    },
    section: {
      borderRadius: 12,
      overflow: "hidden",
    },
    typeRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    typeIcon: {
      width: 36,
      height: 36,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    typeText: { flex: 1 },
    typeLabel: { fontFamily: "SoraSemiBold", fontSize: 14, marginBottom: 2 },
    typeDesc: { fontFamily: "Sora", fontSize: 12 },
    timeRow: { flexDirection: "row", alignItems: "flex-start", padding: 12, gap: 8 },
    timePart: { flex: 1 },
    timePartLabel: { fontFamily: "Sora", fontSize: 11, textAlign: "center", marginBottom: 6 },
    timeChip: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      marginRight: 6,
    },
    timeChipText: { fontFamily: "SoraSemiBold", fontSize: 13 },
    timeSep: { fontFamily: "SoraBold", fontSize: 20, paddingTop: 20 },
    timePreview: { fontFamily: "Sora", fontSize: 13, textAlign: "center", marginTop: 8 },
    quickRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
    quickChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    quickChipText: { fontFamily: "SoraSemiBold", fontSize: 12 },
    dayGrid: {
      flexDirection: "row",
      justifyContent: "space-between",
      padding: 12,
    },
    dayChip: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    dayChipText: { fontFamily: "SoraSemiBold", fontSize: 11 },
    dayPreview: { fontFamily: "Sora", fontSize: 13, textAlign: "center", marginTop: 8 },
    toggleRow: {
      flexDirection: "row",
      alignItems: "center",
      padding: 14,
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      marginTop: 20,
      gap: 12,
    },
    toggleText: { flex: 1 },
    toggleLabel: { fontFamily: "SoraSemiBold", fontSize: 14 },
    toggleSub: { fontFamily: "Sora", fontSize: 12, marginTop: 2 },
    deleteBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginTop: 20,
      paddingVertical: 14,
      borderRadius: 12,
      borderWidth: 1,
    },
    deleteBtnText: { fontFamily: "SoraSemiBold", fontSize: 14 },
  });
}
