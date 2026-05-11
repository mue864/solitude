import { useTheme } from "@/context/ThemeContext";
import { useJournalStore } from "@/store/journalStore";
import { useSessionIntelligence } from "@/store/sessionIntelligence";
import { useTaskStore } from "@/store/taskStore";
import {
  type DateRange,
  type ExportOptions,
  exportData,
  saveToDevice,
} from "@/utils/exportUtils";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const RANGES: { value: DateRange; label: string; sub: string }[] = [
  { value: "week", label: "Last 7 days", sub: "Past week of activity" },
  { value: "month", label: "Last 30 days", sub: "Past month of activity" },
  { value: "all", label: "All time", sub: "Everything in your account" },
];

const EXPORT_ITEMS = [
  {
    key: "includeSessions" as const,
    icon: "timer-outline" as const,
    label: "Focus sessions",
    sub: "Date, duration, quality rating, energy",
  },
  {
    key: "includeJournal" as const,
    icon: "journal-outline" as const,
    label: "Journal entries",
    sub: "Title, mood, tags, text content",
  },
  {
    key: "includeTasks" as const,
    icon: "checkmark-circle-outline" as const,
    label: "Tasks",
    sub: "Name, priority tag, completion status",
  },
];

export default function DataExport() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { sessionRecords } = useSessionIntelligence();
  const { entries: journalEntries } = useJournalStore();
  const tasks = useTaskStore((s) => s.tasks);

  const [range, setRange] = useState<DateRange>("month");
  const [options, setOptions] = useState<
    Pick<ExportOptions, "includeSessions" | "includeJournal" | "includeTasks">
  >({
    includeSessions: true,
    includeJournal: true,
    includeTasks: true,
  });
  const [loading, setLoading] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);

  const noneSelected =
    !options.includeSessions &&
    !options.includeJournal &&
    !options.includeTasks;

  function toggle(key: keyof typeof options) {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleExport() {
    if (noneSelected) return;
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await exportData(
        { range, ...options },
        { sessionRecords, journalEntries, tasks },
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Export failed.";
      Alert.alert("Export failed", msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveToDevice() {
    if (noneSelected) return;
    setLoadingSave(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await saveToDevice(
        { range, ...options },
        { sessionRecords, journalEntries, tasks },
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save failed.";
      Alert.alert("Save failed", msg);
    } finally {
      setLoadingSave(false);
    }
  }

  const s = styles(colors);

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.backBtn} hitSlop={12}>
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={s.title}>Export Data</Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          s.content,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Info blurb */}
        <View style={s.infoBox}>
          <Ionicons
            name="information-circle-outline"
            size={16}
            color={colors.accent}
          />
          <Text style={s.infoText}>
            Your data is exported as{" "}
            <Text
              style={{ color: colors.textPrimary, fontFamily: "SoraSemiBold" }}
            >
              CSV files
            </Text>{" "}
            — open them in Excel, Google Sheets, or any spreadsheet app.
          </Text>
        </View>

        {/* Date range */}
        <Text style={s.sectionLabel}>Date range</Text>
        <View style={s.card}>
          {RANGES.map((r, i) => (
            <React.Fragment key={r.value}>
              <Pressable style={s.optionRow} onPress={() => setRange(r.value)}>
                <View style={s.optionText}>
                  <Text style={s.optionLabel}>{r.label}</Text>
                  <Text style={s.optionSub}>{r.sub}</Text>
                </View>
                <View
                  style={[
                    s.radio,
                    range === r.value && { borderColor: colors.accent },
                  ]}
                >
                  {range === r.value && (
                    <View
                      style={[s.radioDot, { backgroundColor: colors.accent }]}
                    />
                  )}
                </View>
              </Pressable>
              {i < RANGES.length - 1 && <View style={s.divider} />}
            </React.Fragment>
          ))}
        </View>

        {/* What to include */}
        <Text style={s.sectionLabel}>What to include</Text>
        <View style={s.card}>
          {EXPORT_ITEMS.map((item, i) => {
            const checked = options[item.key];
            return (
              <React.Fragment key={item.key}>
                <Pressable style={s.optionRow} onPress={() => toggle(item.key)}>
                  <View
                    style={[
                      s.iconWrap,
                      {
                        backgroundColor: checked
                          ? colors.accentMuted
                          : colors.surfaceMuted,
                      },
                    ]}
                  >
                    <Ionicons
                      name={item.icon}
                      size={16}
                      color={checked ? colors.accent : colors.textSecondary}
                    />
                  </View>
                  <View style={[s.optionText, { marginLeft: 12 }]}>
                    <Text style={s.optionLabel}>{item.label}</Text>
                    <Text style={s.optionSub}>{item.sub}</Text>
                  </View>
                  <View
                    style={[
                      s.checkbox,
                      checked && {
                        backgroundColor: colors.accent,
                        borderColor: colors.accent,
                      },
                    ]}
                  >
                    {checked && (
                      <Ionicons name="checkmark" size={12} color="#fff" />
                    )}
                  </View>
                </Pressable>
                {i < EXPORT_ITEMS.length - 1 && <View style={s.divider} />}
              </React.Fragment>
            );
          })}
        </View>

        {/* Buttons */}
        <View style={s.btnRow}>
          {/* Save to Device */}
          <Pressable
            style={[
              s.exportBtn,
              s.btnHalf,
              {
                backgroundColor: noneSelected
                  ? colors.surfaceMuted
                  : colors.surface,
                borderWidth: 1,
                borderColor: noneSelected ? colors.border : colors.accent,
                opacity: loadingSave ? 0.7 : 1,
              },
            ]}
            onPress={handleSaveToDevice}
            disabled={noneSelected || loadingSave || loading}
          >
            {loadingSave ? (
              <ActivityIndicator color={colors.accent} size="small" />
            ) : (
              <>
                <Ionicons
                  name="download-outline"
                  size={18}
                  color={noneSelected ? colors.textSecondary : colors.accent}
                />
                <Text
                  style={[
                    s.exportBtnText,
                    {
                      color: noneSelected
                        ? colors.textSecondary
                        : colors.accent,
                    },
                  ]}
                >
                  Save
                </Text>
              </>
            )}
          </Pressable>

          {/* Export & Share */}
          <Pressable
            style={[
              s.exportBtn,
              s.btnHalf,
              {
                backgroundColor: noneSelected
                  ? colors.surfaceMuted
                  : colors.accent,
                opacity: loading ? 0.7 : 1,
              },
            ]}
            onPress={handleExport}
            disabled={noneSelected || loading || loadingSave}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons
                  name="share-outline"
                  size={18}
                  color={noneSelected ? colors.textSecondary : "#fff"}
                />
                <Text
                  style={[
                    s.exportBtnText,
                    { color: noneSelected ? colors.textSecondary : "#fff" },
                  ]}
                >
                  Share
                </Text>
              </>
            )}
          </Pressable>
        </View>

        <Text style={s.footerNote}>
          Save downloads directly to your device. Share opens the system share
          sheet. Nothing is sent to any server.
        </Text>
      </ScrollView>
    </View>
  );
}

function styles(
  colors: ReturnType<
    typeof import("@/context/ThemeContext").useTheme
  >["colors"],
) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    backBtn: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      fontSize: 17,
      fontFamily: "SoraSemiBold",
      color: colors.textPrimary,
    },
    content: { paddingHorizontal: 16, paddingTop: 8 },
    infoBox: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
      backgroundColor: colors.accentMuted,
      borderRadius: 12,
      padding: 12,
      marginBottom: 24,
    },
    infoText: {
      flex: 1,
      fontSize: 13,
      fontFamily: "Sora",
      color: colors.textSecondary,
      lineHeight: 19,
    },
    sectionLabel: {
      fontSize: 13,
      fontFamily: "SoraSemiBold",
      color: colors.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 0.6,
      marginBottom: 8,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 24,
      overflow: "hidden",
    },
    optionRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    optionText: { flex: 1 },
    optionLabel: {
      fontSize: 15,
      fontFamily: "SoraSemiBold",
      color: colors.textPrimary,
    },
    optionSub: {
      fontSize: 12,
      fontFamily: "Sora",
      color: colors.textSecondary,
      marginTop: 2,
    },
    radio: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    radioDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    iconWrap: {
      width: 34,
      height: 34,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
      marginHorizontal: 16,
    },
    exportBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      borderRadius: 14,
      paddingVertical: 15,
      marginBottom: 16,
    },
    btnRow: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 0,
    },
    btnHalf: {
      flex: 1,
    },
    exportBtnText: {
      fontSize: 16,
      fontFamily: "SoraSemiBold",
    },
    footerNote: {
      fontSize: 12,
      fontFamily: "Sora",
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 18,
      paddingHorizontal: 8,
    },
  });
}
