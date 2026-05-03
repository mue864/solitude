import BottomSheet from "@/components/BottomSheet";
import { useTheme } from "@/context/ThemeContext";
import { useSettingsStore } from "@/store/settingsStore";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const SESSION_DURATIONS = [15, 25, 30, 45, 60];
const BREAK_DURATIONS = [5, 10, 15, 20];
const THEME_OPTIONS: {
  value: "light" | "dark" | "auto";
  icon: string;
  label: string;
}[] = [
  { value: "light", icon: "sunny-outline", label: "Light" },
  { value: "dark", icon: "moon-outline", label: "Dark" },
  { value: "auto", icon: "contrast-outline", label: "Auto" },
];

export default function Settings() {
  const { colors } = useTheme();

  const defaultSessionDuration = useSettingsStore(
    (s) => s.defaultSessionDuration,
  );
  const breakDuration = useSettingsStore((s) => s.breakDuration);
  const autoStartNext = useSettingsStore((s) => s.autoStartNext);
  const notifications = useSettingsStore((s) => s.notifications);
  const theme = useSettingsStore((s) => s.theme);
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const vibrationEnabled = useSettingsStore((s) => s.vibrationEnabled);
  const isPro = useSettingsStore((s) => s.isPro);
  const upgradeToPro = useSettingsStore((s) => s.upgradeToPro);
  const updateSessionDuration = useSettingsStore(
    (s) => s.updateSessionDuration,
  );
  const updateBreakDuration = useSettingsStore((s) => s.updateBreakDuration);
  const toggleAutoStart = useSettingsStore((s) => s.toggleAutoStart);
  const updateNotifications = useSettingsStore((s) => s.updateNotifications);
  const updateTheme = useSettingsStore((s) => s.updateTheme);
  const toggleSound = useSettingsStore((s) => s.toggleSound);
  const toggleVibration = useSettingsStore((s) => s.toggleVibration);
  const resetToDefaults = useSettingsStore((s) => s.resetToDefaults);

  const [proSheet, setProSheet] = useState(false);
  const [openSection, setOpenSection] = useState<
    "sessions" | "notifications" | "appearance" | null
  >("sessions");

  const toggleSection = (
    section: "sessions" | "notifications" | "appearance",
  ) => setOpenSection((prev) => (prev === section ? null : section));

  const handleReset = () => {
    Alert.alert("Reset Settings", "Restore all settings to defaults?", [
      { text: "Cancel", style: "cancel" },
      { text: "Reset", style: "destructive", onPress: resetToDefaults },
    ]);
  };

  return (
    <View style={[s.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <Text style={[s.title, { color: colors.textPrimary }]}>Settings</Text>
          <Text style={[s.subtitle, { color: colors.textSecondary }]}>
            Customize your experience
          </Text>
        </View>

        {/* ── Sessions ── */}
        <Section
          label="Sessions"
          icon="timer-outline"
          open={openSection === "sessions"}
          onToggle={() => toggleSection("sessions")}
          colors={colors}
        >
          {/* Session duration */}
          <View style={s.row}>
            <Text style={[s.rowLabel, { color: colors.textPrimary }]}>
              Focus duration
            </Text>
            <Text style={[s.rowValue, { color: colors.textSecondary }]}>
              {defaultSessionDuration} min
            </Text>
          </View>
          <View style={s.chips}>
            {SESSION_DURATIONS.map((d) => (
              <TouchableOpacity
                key={d}
                onPress={() => updateSessionDuration(d)}
                style={[
                  s.chip,
                  {
                    backgroundColor:
                      defaultSessionDuration === d
                        ? colors.accent
                        : colors.surfaceMuted,
                  },
                ]}
              >
                <Text
                  style={[
                    s.chipText,
                    {
                      color:
                        defaultSessionDuration === d
                          ? "#fff"
                          : colors.textSecondary,
                    },
                  ]}
                >
                  {d}m
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[s.divider, { backgroundColor: colors.border }]} />

          {/* Break duration */}
          <View style={s.row}>
            <Text style={[s.rowLabel, { color: colors.textPrimary }]}>
              Break duration
            </Text>
            <Text style={[s.rowValue, { color: colors.textSecondary }]}>
              {breakDuration} min
            </Text>
          </View>
          <View style={s.chips}>
            {BREAK_DURATIONS.map((d) => (
              <TouchableOpacity
                key={d}
                onPress={() => updateBreakDuration(d)}
                style={[
                  s.chip,
                  {
                    backgroundColor:
                      breakDuration === d ? colors.accent : colors.surfaceMuted,
                  },
                ]}
              >
                <Text
                  style={[
                    s.chipText,
                    {
                      color:
                        breakDuration === d ? "#fff" : colors.textSecondary,
                    },
                  ]}
                >
                  {d}m
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[s.divider, { backgroundColor: colors.border }]} />

          {/* Auto-start */}
          <ToggleRow
            label="Auto-start next session"
            value={autoStartNext}
            onToggle={toggleAutoStart}
            colors={colors}
          />
        </Section>

        {/* ── Notifications ── */}
        <Section
          label="Notifications"
          icon="notifications-outline"
          open={openSection === "notifications"}
          onToggle={() => toggleSection("notifications")}
          colors={colors}
        >
          <ToggleRow
            label="Session start"
            value={notifications.sessionStart}
            onToggle={() =>
              updateNotifications({ sessionStart: !notifications.sessionStart })
            }
            colors={colors}
          />
          <View style={[s.divider, { backgroundColor: colors.border }]} />
          <ToggleRow
            label="Session end"
            value={notifications.sessionEnd}
            onToggle={() =>
              updateNotifications({ sessionEnd: !notifications.sessionEnd })
            }
            colors={colors}
          />
          <View style={[s.divider, { backgroundColor: colors.border }]} />
          <ToggleRow
            label="Break reminders"
            value={notifications.breakReminder}
            onToggle={() =>
              updateNotifications({
                breakReminder: !notifications.breakReminder,
              })
            }
            colors={colors}
          />
          <View style={[s.divider, { backgroundColor: colors.border }]} />
          <ToggleRow
            label="Streak reminders"
            value={notifications.streakReminder}
            onToggle={() =>
              updateNotifications({
                streakReminder: !notifications.streakReminder,
              })
            }
            colors={colors}
          />
          <View style={[s.divider, { backgroundColor: colors.border }]} />
          {/* Scheduled notifications — Pro */}
          <LockedRow
            label="Scheduled reminders"
            hint="Set custom times and days"
            onPress={() => setProSheet(true)}
            colors={colors}
          />
        </Section>

        {/* ── Appearance ── */}
        <Section
          label="Appearance"
          icon="color-palette-outline"
          open={openSection === "appearance"}
          onToggle={() => toggleSection("appearance")}
          colors={colors}
        >
          {/* Theme selector */}
          <Text
            style={[
              s.rowLabel,
              { color: colors.textPrimary, marginBottom: 10 },
            ]}
          >
            Theme
          </Text>
          <View style={s.themeRow}>
            {THEME_OPTIONS.map((opt) => {
              const active = theme === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => updateTheme(opt.value)}
                  style={[
                    s.themeChip,
                    {
                      backgroundColor: active
                        ? colors.accentMuted
                        : colors.surfaceMuted,
                      borderColor: active ? colors.accent : "transparent",
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
                      s.chipText,
                      { color: active ? colors.accent : colors.textSecondary },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={[s.divider, { backgroundColor: colors.border }]} />

          <ToggleRow
            label="Sound effects"
            value={soundEnabled}
            onToggle={toggleSound}
            colors={colors}
          />
          <View style={[s.divider, { backgroundColor: colors.border }]} />
          <ToggleRow
            label="Vibration"
            value={vibrationEnabled}
            onToggle={toggleVibration}
            colors={colors}
          />
          <View style={[s.divider, { backgroundColor: colors.border }]} />
          {/* Custom themes — Pro */}
          <LockedRow
            label="Custom color themes"
            hint="Create your own look"
            onPress={() => setProSheet(true)}
            colors={colors}
          />
        </Section>

        {/* Footer actions */}
        <View style={s.footer}>
          <TouchableOpacity
            onPress={handleReset}
            style={[s.footerBtn, { borderColor: colors.border }]}
          >
            <Ionicons
              name="refresh-outline"
              size={15}
              color={colors.textSecondary}
            />
            <Text style={[s.footerBtnText, { color: colors.textSecondary }]}>
              Reset defaults
            </Text>
          </TouchableOpacity>

          {!isPro && (
            <TouchableOpacity
              onPress={() => setProSheet(true)}
              style={[
                s.footerBtn,
                {
                  borderColor: colors.accent,
                  backgroundColor: colors.accentMuted,
                },
              ]}
            >
              <Ionicons
                name="diamond-outline"
                size={15}
                color={colors.accent}
              />
              <Text style={[s.footerBtnText, { color: colors.accent }]}>
                Upgrade to Pro
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={[s.version, { color: colors.textSecondary }]}>
          Solitude v1.0.0
        </Text>
      </ScrollView>

      {/* Pro upgrade sheet */}
      <BottomSheet
        isVisible={proSheet}
        onClose={() => setProSheet(false)}
        title="Unlock Pro"
      >
        <Text style={[s.proBody, { color: colors.textSecondary }]}>
          Get access to scheduled reminders, custom color themes, advanced
          analytics, and more.
        </Text>
        <View style={s.proPerks}>
          {[
            "Scheduled notifications (custom times & days)",
            "Custom color themes",
            "Advanced analytics dashboard",
            "Data export (CSV)",
          ].map((perk) => (
            <View key={perk} style={s.perkRow}>
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={colors.accent}
              />
              <Text style={[s.perkText, { color: colors.textPrimary }]}>
                {perk}
              </Text>
            </View>
          ))}
        </View>
        <TouchableOpacity
          style={[s.upgradeBtn, { backgroundColor: colors.accent }]}
          onPress={() => {
            upgradeToPro();
            setProSheet(false);
          }}
        >
          <Text style={s.upgradeBtnText}>Upgrade Now</Text>
        </TouchableOpacity>
      </BottomSheet>
    </View>
  );
}

// ── Sub-components ──────────────────────────────────────────

function Section({
  label,
  icon,
  open,
  onToggle,
  colors,
  children,
}: {
  label: string;
  icon: string;
  open: boolean;
  onToggle: () => void;
  colors: ReturnType<typeof useTheme>["colors"];
  children: React.ReactNode;
}) {
  return (
    <View
      style={[
        s.section,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <TouchableOpacity
        style={s.sectionHeader}
        onPress={onToggle}
        activeOpacity={0.75}
      >
        <View
          style={[s.sectionIconWrap, { backgroundColor: colors.surfaceMuted }]}
        >
          <Ionicons name={icon as any} size={16} color={colors.accent} />
        </View>
        <Text style={[s.sectionLabel, { color: colors.textPrimary }]}>
          {label}
        </Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={16}
          color={colors.textSecondary}
        />
      </TouchableOpacity>
      {open && <View style={s.sectionBody}>{children}</View>}
    </View>
  );
}

function ToggleRow({
  label,
  value,
  onToggle,
  colors,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  return (
    <View style={s.toggleRow}>
      <Text style={[s.rowLabel, { color: colors.textPrimary }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.surfaceMuted, true: colors.accent }}
        thumbColor="#fff"
        ios_backgroundColor={colors.surfaceMuted}
      />
    </View>
  );
}

function LockedRow({
  label,
  hint,
  onPress,
  colors,
}: {
  label: string;
  hint?: string;
  onPress: () => void;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  return (
    <TouchableOpacity
      style={s.lockedRow}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={s.lockedLeft}>
        <Text style={[s.rowLabel, { color: colors.textSecondary }]}>
          {label}
        </Text>
        {hint && (
          <Text style={[s.lockedHint, { color: colors.textSecondary }]}>
            {hint}
          </Text>
        )}
      </View>
      <View style={[s.lockBadge, { backgroundColor: colors.surfaceMuted }]}>
        <Ionicons name="lock-closed" size={11} color={colors.textSecondary} />
        <Text style={[s.lockText, { color: colors.textSecondary }]}>Pro</Text>
      </View>
    </TouchableOpacity>
  );
}

// ── Styles ──────────────────────────────────────────────────

const s = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { paddingBottom: 180 },
  header: { paddingHorizontal: 24, paddingTop: 56, paddingBottom: 20 },
  title: { fontSize: 24, fontFamily: "SoraBold", letterSpacing: -0.3 },
  subtitle: { fontSize: 14, fontFamily: "Sora", marginTop: 4 },

  // Sections
  section: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  sectionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionLabel: { flex: 1, fontSize: 15, fontFamily: "SoraSemiBold" },
  sectionBody: { paddingHorizontal: 16, paddingBottom: 16 },

  // Rows
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  rowLabel: { fontSize: 14, fontFamily: "SoraSemiBold" },
  rowValue: { fontSize: 13, fontFamily: "Sora" },
  divider: { height: 1, marginVertical: 12 },

  // Chips
  chips: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  chipText: { fontSize: 13, fontFamily: "SoraSemiBold" },

  // Theme chips
  themeRow: { flexDirection: "row", gap: 8, marginBottom: 4 },
  themeChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
  },

  // Toggle row
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  // Locked row
  lockedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    opacity: 0.65,
  },
  lockedLeft: { flex: 1 },
  lockedHint: { fontSize: 11, fontFamily: "Sora", marginTop: 2, opacity: 0.8 },
  lockBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  lockText: { fontSize: 11, fontFamily: "SoraSemiBold" },

  // Footer
  footer: { flexDirection: "row", gap: 10, marginHorizontal: 20, marginTop: 8 },
  footerBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 13,
    borderRadius: 16,
    borderWidth: 1,
  },
  footerBtnText: { fontSize: 13, fontFamily: "SoraSemiBold" },
  version: {
    textAlign: "center",
    fontSize: 12,
    fontFamily: "Sora",
    marginTop: 20,
    opacity: 0.5,
  },

  // Pro sheet
  proBody: {
    fontSize: 14,
    fontFamily: "Sora",
    lineHeight: 22,
    marginBottom: 20,
  },
  proPerks: { gap: 12, marginBottom: 24 },
  perkRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  perkText: { fontSize: 14, fontFamily: "Sora", flex: 1 },
  upgradeBtn: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  upgradeBtnText: { fontSize: 15, fontFamily: "SoraBold", color: "#fff" },
});
