import { useTheme } from "@/context/ThemeContext";
import { useNotifications } from "@/hooks/useNotifications";
import {
  type ProNotificationSchedule,
  useSettingsStore,
} from "@/store/settingsStore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import UUID from "react-native-uuid";

const MAX_ACTIVE = 5;
const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

const TYPE_OPTIONS: {
  value: ProNotificationSchedule["type"];
  label: string;
  icon: string;
}[] = [
  { value: "session", label: "Start a session", icon: "timer-outline" },
  { value: "break", label: "Take a break", icon: "cafe-outline" },
  {
    value: "reminder",
    label: "General check-in",
    icon: "notifications-outline",
  },
];

function nextFire(time: string, days: number[]): string {
  if (!days.length) return "—";
  const [h, m] = time.split(":").map(Number);
  const now = new Date();
  for (let offset = 0; offset <= 7; offset++) {
    const candidate = new Date(now);
    candidate.setDate(now.getDate() + offset);
    if (!days.includes(candidate.getDay())) continue;
    candidate.setHours(h, m, 0, 0);
    if (candidate > now)
      return candidate.toLocaleDateString(undefined, {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
  }
  return "—";
}

const DEFAULT_FORM: Omit<ProNotificationSchedule, "id"> = {
  name: "",
  time: "09:00",
  days: [1, 2, 3, 4, 5],
  enabled: true,
  type: "session",
};

export default function ScheduledReminders() {
  const { colors } = useTheme();
  const notifications = useNotifications();
  const schedules = useSettingsStore(
    (s) => s.proFeatures.notificationSchedules,
  );
  const addSchedule = useSettingsStore((s) => s.addNotificationSchedule);
  const updateSchedule = useSettingsStore((s) => s.updateNotificationSchedule);
  const removeSchedule = useSettingsStore((s) => s.removeNotificationSchedule);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] =
    useState<Omit<ProNotificationSchedule, "id">>(DEFAULT_FORM);
  const [hourText, setHourText] = useState("09");
  const [minText, setMinText] = useState("00");
  const minuteRef = useRef<TextInput>(null);

  const activeCount = schedules.filter((s) => s.enabled).length;

  // Sync all enabled schedules with notifee on mount
  useEffect(() => {
    schedules.forEach((s) => {
      if (s.enabled) syncSchedule(s);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function syncSchedule(s: ProNotificationSchedule) {
    // Cancel old triggers for this schedule, then re-create per active day
    await notifications.cancelNotification(`sched-${s.id}`);
    if (!s.enabled || !s.days.length) return;

    const [h, min] = s.time.split(":").map(Number);
    const typeMessages: Record<ProNotificationSchedule["type"], string> = {
      session: "Time to start a focus session. Let's get to work.",
      break: "Step away and recharge. You've earned a break.",
      reminder: "Hey — how are things going today?",
    };

    // Schedule for the nearest upcoming day in the list
    const now = new Date();
    for (let offset = 0; offset <= 7; offset++) {
      const candidate = new Date(now);
      candidate.setDate(now.getDate() + offset);
      if (!s.days.includes(candidate.getDay())) continue;
      candidate.setHours(h, min, 0, 0);
      if (candidate <= now) continue;

      await notifications.scheduleNotification(
        {
          id: `sched-${s.id}`,
          title: s.name || "Reminder",
          body: typeMessages[s.type],
          priority: "high",
        },
        {
          type: 0, // TriggerType.TIMESTAMP
          timestamp: candidate.getTime(),
          // Note: notifee doesn't support per-weekday repeat natively.
          // We reschedule on the next app open via the mount effect.
        },
      );
      break;
    }
  }

  function openAdd() {
    setEditingId(null);
    setForm(DEFAULT_FORM);
    setHourText("09");
    setMinText("00");
    setShowForm(true);
  }

  function openEdit(s: ProNotificationSchedule) {
    setEditingId(s.id);
    const { id: _id, ...rest } = s;
    setForm(rest);
    const [eh, em] = s.time.split(":");
    setHourText(eh);
    setMinText(em);
    setShowForm(true);
  }

  function toggleDay(day: number) {
    setForm((f) => ({
      ...f,
      days: f.days.includes(day)
        ? f.days.filter((d) => d !== day)
        : [...f.days, day].sort(),
    }));
  }

  async function handleSave() {
    if (!form.days.length) {
      Alert.alert("Pick at least one day");
      return;
    }

    // Build and validate time from the two text boxes
    const hNum = parseInt(hourText || "0", 10);
    const mNum = parseInt(minText || "0", 10);
    if (
      isNaN(hNum) ||
      hNum < 0 ||
      hNum > 23 ||
      isNaN(mNum) ||
      mNum < 0 ||
      mNum > 59
    ) {
      Alert.alert("Invalid time", "Enter hours 0–23 and minutes 0–59.");
      return;
    }
    const time = `${String(hNum).padStart(2, "0")}:${String(mNum).padStart(2, "0")}`;
    const formWithTime = { ...form, time };

    const wouldBeActive = form.enabled
      ? editingId
        ? // editing: check if it was already active or new active
          activeCount -
          (schedules.find((s) => s.id === editingId)?.enabled ? 1 : 0) +
          1
        : activeCount + 1
      : activeCount;

    if (wouldBeActive > MAX_ACTIVE) {
      Alert.alert(
        "Active limit reached",
        `You can have up to ${MAX_ACTIVE} active schedules at a time. Disable one first.`,
      );
      return;
    }

    const finalSchedule: ProNotificationSchedule = {
      ...formWithTime,
      id: editingId ?? (UUID.v4() as string),
    };

    if (editingId) {
      updateSchedule(editingId, formWithTime);
    } else {
      addSchedule(finalSchedule);
    }

    await syncSchedule(finalSchedule);
    setShowForm(false);
  }

  async function handleDelete(id: string) {
    Alert.alert("Delete reminder", "Remove this schedule?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          removeSchedule(id);
          await notifications.cancelNotification(`sched-${id}`);
        },
      },
    ]);
  }

  async function handleToggle(s: ProNotificationSchedule) {
    if (!s.enabled && activeCount >= MAX_ACTIVE) {
      Alert.alert(
        "Active limit reached",
        `You can have up to ${MAX_ACTIVE} active schedules at a time. Disable one first.`,
      );
      return;
    }
    const next = { ...s, enabled: !s.enabled };
    updateSchedule(s.id, { enabled: next.enabled });
    await syncSchedule(next);
  }

  const typeColor: Record<ProNotificationSchedule["type"], string> = {
    session: colors.accent,
    break: "#4CAF7D",
    reminder: "#E8A43A",
  };
  const typeIcon: Record<ProNotificationSchedule["type"], string> = {
    session: "timer-outline",
    break: "cafe-outline",
    reminder: "notifications-outline",
  };

  return (
    <View style={[s.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <View>
          <Text style={[s.title, { color: colors.textPrimary }]}>
            Scheduled Reminders
          </Text>
          <Text style={[s.subtitle, { color: colors.textSecondary }]}>
            {activeCount}/{MAX_ACTIVE} active
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
      >
        {schedules.length === 0 && (
          <View style={s.empty}>
            <Ionicons
              name="calendar-outline"
              size={40}
              color={colors.textSecondary}
            />
            <Text style={[s.emptyText, { color: colors.textSecondary }]}>
              No schedules yet.{"\n"}Add one to stay on track.
            </Text>
          </View>
        )}

        {schedules.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              s.card,
              {
                backgroundColor: colors.surface,
                borderColor: item.enabled
                  ? typeColor[item.type]
                  : colors.border,
                opacity: item.enabled ? 1 : 0.55,
              },
            ]}
            onPress={() => openEdit(item)}
            activeOpacity={0.8}
          >
            <View style={s.cardLeft}>
              <View
                style={[
                  s.typeIcon,
                  { backgroundColor: typeColor[item.type] + "22" },
                ]}
              >
                <Ionicons
                  name={typeIcon[item.type] as any}
                  size={16}
                  color={typeColor[item.type]}
                />
              </View>
              <View>
                <Text style={[s.cardName, { color: colors.textPrimary }]}>
                  {item.name ||
                    TYPE_OPTIONS.find((t) => t.value === item.type)?.label}
                </Text>
                <Text style={[s.cardMeta, { color: colors.textSecondary }]}>
                  {item.time} · {item.days.map((d) => DAYS[d]).join(" ")}
                </Text>
                {item.enabled && (
                  <Text style={[s.nextFire, { color: colors.textSecondary }]}>
                    Next: {nextFire(item.time, item.days)}
                  </Text>
                )}
              </View>
            </View>
            <Switch
              value={item.enabled}
              onValueChange={() => handleToggle(item)}
              trackColor={{
                false: colors.border,
                true: typeColor[item.type] + "88",
              }}
              thumbColor={
                item.enabled ? typeColor[item.type] : colors.textSecondary
              }
            />
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[
            s.addBtn,
            { borderColor: colors.accent, backgroundColor: colors.accentMuted },
          ]}
          onPress={openAdd}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={18} color={colors.accent} />
          <Text style={[s.addBtnText, { color: colors.accent }]}>
            Add Schedule
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add / Edit Modal */}
      <Modal visible={showForm} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={[s.sheet, { backgroundColor: colors.surface }]}>
            <View style={s.sheetHeader}>
              <Text style={[s.sheetTitle, { color: colors.textPrimary }]}>
                {editingId ? "Edit Schedule" : "New Schedule"}
              </Text>
              <TouchableOpacity onPress={() => setShowForm(false)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Name */}
              <Text style={[s.label, { color: colors.textSecondary }]}>
                Name (optional)
              </Text>
              <TextInput
                style={[
                  s.input,
                  {
                    color: colors.textPrimary,
                    backgroundColor: colors.surfaceMuted,
                    borderColor: colors.border,
                  },
                ]}
                value={form.name}
                onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
                placeholder="e.g. Morning Focus"
                placeholderTextColor={colors.textSecondary}
                maxLength={40}
              />

              {/* Time */}
              <Text style={[s.label, { color: colors.textSecondary }]}>
                Time
              </Text>
              <View style={s.timeRow}>
                <View style={s.timeField}>
                  <TextInput
                    style={[
                      s.timeInput,
                      {
                        backgroundColor: colors.surfaceMuted,
                        borderColor: colors.border,
                        color: colors.textPrimary,
                      },
                      Platform.OS === "ios" && { paddingVertical: 16 },
                    ]}
                    value={hourText}
                    onChangeText={(t) => {
                      const v = t.replace(/[^0-9]/g, "");
                      const n = parseInt(v || "0", 10);
                      if (v === "") {
                        setHourText("");
                        return;
                      }
                      if (n > 23) return; // reject anything above 23
                      setHourText(v);
                      // auto-jump to minutes once 2 valid digits entered
                      if (v.length === 2) minuteRef.current?.focus();
                    }}
                    onBlur={() => {
                      // pad to 2 digits on blur
                      if (hourText.length === 1)
                        setHourText(hourText.padStart(2, "0"));
                    }}
                    keyboardType="number-pad"
                    maxLength={2}
                    placeholder="09"
                    placeholderTextColor={colors.textSecondary}
                    selectionColor={colors.accent}
                  />
                  <Text
                    style={[s.timeFieldLabel, { color: colors.textSecondary }]}
                  >
                    Hours
                  </Text>
                </View>

                <Text style={[s.timeColon, { color: colors.textPrimary }]}>
                  :
                </Text>

                <View style={s.timeField}>
                  <TextInput
                    style={[
                      s.timeInput,
                      {
                        backgroundColor: colors.surfaceMuted,
                        borderColor: colors.border,
                        color: colors.textPrimary,
                      },
                      Platform.OS === "ios" && { paddingVertical: 16 },
                    ]}
                    value={minText}
                    ref={minuteRef}
                    onChangeText={(t) => {
                      const v = t.replace(/[^0-9]/g, "");
                      const n = parseInt(v || "0", 10);
                      if (v === "") {
                        setMinText("");
                        return;
                      }
                      if (n > 59) return; // reject anything above 59
                      setMinText(v);
                    }}
                    onBlur={() => {
                      if (minText.length === 1)
                        setMinText(minText.padStart(2, "0"));
                    }}
                    keyboardType="number-pad"
                    maxLength={2}
                    placeholder="00"
                    placeholderTextColor={colors.textSecondary}
                    selectionColor={colors.accent}
                  />
                  <Text
                    style={[s.timeFieldLabel, { color: colors.textSecondary }]}
                  >
                    Minutes
                  </Text>
                </View>
              </View>

              {/* AM / PM quick toggle */}
              <View style={s.ampmRow}>
                {(["AM", "PM"] as const).map((period) => {
                  const h = parseInt(hourText || "0", 10);
                  const active = period === "AM" ? h < 12 : h >= 12;
                  return (
                    <TouchableOpacity
                      key={period}
                      onPress={() => {
                        const cur = parseInt(hourText || "0", 10);
                        let next = cur;
                        if (period === "AM" && cur >= 12)
                          next = cur === 12 ? 0 : cur - 12;
                        if (period === "PM" && cur < 12)
                          next = cur === 0 ? 12 : cur + 12;
                        setHourText(String(next).padStart(2, "0"));
                      }}
                      style={[
                        s.ampmBtn,
                        {
                          backgroundColor: active
                            ? colors.accent
                            : colors.surfaceMuted,
                          borderColor: active ? colors.accent : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          s.ampmText,
                          { color: active ? "#fff" : colors.textSecondary },
                        ]}
                      >
                        {period}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Days */}
              <Text style={[s.label, { color: colors.textSecondary }]}>
                Days
              </Text>
              <View style={s.dayRow}>
                {DAYS.map((d, i) => {
                  const active = form.days.includes(i);
                  return (
                    <TouchableOpacity
                      key={i}
                      onPress={() => toggleDay(i)}
                      style={[
                        s.dayChip,
                        {
                          backgroundColor: active
                            ? colors.accent
                            : colors.surfaceMuted,
                          borderColor: active ? colors.accent : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          s.dayChipText,
                          { color: active ? "#fff" : colors.textSecondary },
                        ]}
                      >
                        {d}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Type */}
              <Text style={[s.label, { color: colors.textSecondary }]}>
                Type
              </Text>
              {TYPE_OPTIONS.map((opt) => {
                const active = form.type === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setForm((f) => ({ ...f, type: opt.value }))}
                    style={[
                      s.typeRow,
                      {
                        backgroundColor: active
                          ? colors.accentMuted
                          : colors.surfaceMuted,
                        borderColor: active ? colors.accent : colors.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name={opt.icon as any}
                      size={16}
                      color={active ? colors.accent : colors.textSecondary}
                    />
                    <Text
                      style={[
                        s.typeRowText,
                        {
                          color: active ? colors.accent : colors.textPrimary,
                        },
                      ]}
                    >
                      {opt.label}
                    </Text>
                    {active && (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={colors.accent}
                        style={s.typeCheck}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}

              {/* Active toggle */}
              <View style={s.activeRow}>
                <Text
                  style={[
                    s.label,
                    { color: colors.textSecondary, marginBottom: 0 },
                  ]}
                >
                  Active
                </Text>
                <Switch
                  value={form.enabled}
                  onValueChange={(v) => setForm((f) => ({ ...f, enabled: v }))}
                  trackColor={{
                    false: colors.border,
                    true: colors.accent + "88",
                  }}
                  thumbColor={
                    form.enabled ? colors.accent : colors.textSecondary
                  }
                />
              </View>

              {/* Save */}
              <TouchableOpacity
                style={[s.saveBtn, { backgroundColor: colors.accent }]}
                onPress={handleSave}
                activeOpacity={0.85}
              >
                <Text style={s.saveBtnText}>
                  {editingId ? "Save Changes" : "Add Schedule"}
                </Text>
              </TouchableOpacity>

              {/* Delete */}
              {editingId && (
                <Pressable
                  style={s.deleteBtn}
                  onPress={() => {
                    setShowForm(false);
                    setTimeout(() => handleDelete(editingId!), 300);
                  }}
                >
                  <Text style={[s.deleteBtnText, { color: "#E05A5A" }]}>
                    Delete schedule
                  </Text>
                </Pressable>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontFamily: "SoraSemiBold",
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Sora",
    marginTop: 1,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 60,
    gap: 12,
  },
  empty: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Sora",
    textAlign: "center",
    lineHeight: 22,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  typeIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cardName: {
    fontSize: 15,
    fontFamily: "SoraSemiBold",
  },
  cardMeta: {
    fontSize: 12,
    fontFamily: "Sora",
    marginTop: 2,
  },
  nextFire: {
    fontSize: 11,
    fontFamily: "Sora",
    marginTop: 2,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: "dashed",
    marginTop: 4,
  },
  addBtnText: {
    fontSize: 14,
    fontFamily: "SoraSemiBold",
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: "90%",
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 17,
    fontFamily: "SoraSemiBold",
  },
  label: {
    fontSize: 12,
    fontFamily: "SoraSemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    fontFamily: "Sora",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 4,
  },
  timeField: { alignItems: "center" },
  timeInput: {
    width: 80,
    height: 80,
    borderRadius: 16,
    borderWidth: 1,
    fontSize: 32,
    fontFamily: "SoraBold",
    textAlign: "center",
  },
  timeFieldLabel: {
    fontSize: 12,
    fontFamily: "Sora",
    marginTop: 6,
  },
  timeColon: {
    fontSize: 32,
    fontFamily: "SoraBold",
    marginBottom: 20,
    marginHorizontal: 2,
  },
  ampmRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 10,
  },
  ampmBtn: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  ampmText: {
    fontSize: 14,
    fontFamily: "SoraSemiBold",
  },
  dayRow: {
    flexDirection: "row",
    gap: 8,
  },
  dayChip: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dayChipText: {
    fontSize: 13,
    fontFamily: "SoraSemiBold",
  },
  typeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 6,
  },
  typeRowText: {
    fontSize: 14,
    fontFamily: "Sora",
    flex: 1,
  },
  typeCheck: {
    marginLeft: "auto",
  },
  activeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
  },
  saveBtn: {
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginTop: 20,
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "SoraSemiBold",
  },
  deleteBtn: {
    alignItems: "center",
    paddingVertical: 14,
  },
  deleteBtnText: {
    fontSize: 14,
    fontFamily: "Sora",
  },
});
