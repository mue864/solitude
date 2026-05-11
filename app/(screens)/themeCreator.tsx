import { BUILTIN_THEMES } from "@/constants/themes";
import { useTheme } from "@/context/ThemeContext";
import { useSettingsStore } from "@/store/settingsStore";
import {
  deriveAccentTokens,
  hexToHsl,
  hslToHex,
  isValidHex,
} from "@/utils/colorUtils";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  GestureResponderEvent,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";
import UUID from "react-native-uuid";

// ─── Wheel geometry ──────────────────────────────────────────────────────────
const SCREEN_W = Dimensions.get("window").width;
const WHEEL_SIZE = Math.min(SCREEN_W - 64, 240);
const CX = WHEEL_SIZE / 2;
const CY = WHEEL_SIZE / 2;
const OUTER_R = WHEEL_SIZE * 0.46;
const INNER_R = WHEEL_SIZE * 0.31;
const THUMB_R = 11;

function hueToXY(hue: number) {
  const rad = ((hue - 90) * Math.PI) / 180;
  const mid = (OUTER_R + INNER_R) / 2;
  return { x: CX + mid * Math.cos(rad), y: CY + mid * Math.sin(rad) };
}

// Pre-compute 120 arc paths once at module level — never re-computed
const SEGMENTS = 120;
const ARC_DATA = (() => {
  const toRad = (d: number) => (d * Math.PI) / 180;
  return Array.from({ length: SEGMENTS }, (_, i) => {
    const s0 = (i * 360) / SEGMENTS - 90;
    const s1 = ((i + 1) * 360) / SEGMENTS - 90;
    const arcHue = Math.round((i + 0.5) * (360 / SEGMENTS));
    const px = (angle: number, r: number) => ({
      x: (CX + r * Math.cos(toRad(angle))).toFixed(2),
      y: (CY + r * Math.sin(toRad(angle))).toFixed(2),
    });
    const op1 = px(s0, OUTER_R),
      op2 = px(s1, OUTER_R);
    const ip2 = px(s1, INNER_R),
      ip1 = px(s0, INNER_R);
    const path = `M ${op1.x} ${op1.y} A ${OUTER_R} ${OUTER_R} 0 0 1 ${op2.x} ${op2.y} L ${ip2.x} ${ip2.y} A ${INNER_R} ${INNER_R} 0 0 0 ${ip1.x} ${ip1.y} Z`;
    return { path, arcHue };
  });
})();

// ─── Preview Card ─────────────────────────────────────────────────────────────
function PreviewCard({
  accentHex,
  colors,
}: {
  accentHex: string;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  const tokens = deriveAccentTokens(accentHex);
  return (
    <View
      style={[
        pc.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={pc.body}>
        {/* Mini timer ring */}
        <View style={[pc.ring, { borderColor: tokens.accent }]}>
          <Text style={[pc.timer, { color: colors.textPrimary }]}>25:00</Text>
          <Text style={[pc.mode, { color: colors.textSecondary }]}>Focus</Text>
        </View>

        {/* Start button */}
        <View style={[pc.btn, { backgroundColor: tokens.accent }]}>
          <Text style={pc.btnText}>Start Focus</Text>
        </View>

        {/* Accent dot */}
        <View
          style={[
            pc.dot,
            {
              backgroundColor: tokens.accentMuted,
              borderColor: tokens.accent,
            },
          ]}
        >
          <View style={[pc.dotInner, { backgroundColor: tokens.accent }]} />
        </View>
      </View>
    </View>
  );
}

const pc = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  body: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  ring: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  timer: { fontSize: 10, fontWeight: "700", letterSpacing: -0.3 },
  mode: { fontSize: 8, marginTop: 1 },
  btn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  dot: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  dotInner: { width: 17, height: 17, borderRadius: 9 },
});

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function ThemeCreator() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const activeThemeId = useSettingsStore((s) => s.activeThemeId);
  const setActiveTheme = useSettingsStore((s) => s.setActiveTheme);
  const customThemes = useSettingsStore((s) => s.proFeatures.customThemes);
  const addCustomTheme = useSettingsStore((s) => s.addCustomTheme);
  const removeCustomTheme = useSettingsStore((s) => s.removeCustomTheme);

  const [tab, setTab] = useState<"presets" | "custom">("presets");

  // ── Picker state ──────────────────────────────────────────────────────────
  const [hue, setHue] = useState(38); // amber default
  const [sat, setSat] = useState(85);
  const [lig, setLig] = useState(55);
  const [themeName, setThemeName] = useState("");
  const [hexInput, setHexInput] = useState("");

  // Layout widths for sliders (from onLayout)
  const [satW, setSatW] = useState(1);
  const [ligW, setLigW] = useState(1);

  const pickedHex = hslToHex(hue, sat, lig);
  const satGradient: [string, string] = [
    hslToHex(hue, 0, lig),
    hslToHex(hue, 100, lig),
  ];
  const ligGradient: [string, string, string] = [
    hslToHex(hue, sat, 20),
    hslToHex(hue, sat, 50),
    hslToHex(hue, sat, 80),
  ];
  const { x: thumbX, y: thumbY } = hueToXY(hue);

  // Current accent for the preview card
  const previewAccent =
    tab === "custom"
      ? pickedHex
      : (BUILTIN_THEMES.find((t) => t.id === activeThemeId)?.accentColor ??
        customThemes.find((t) => t.id === activeThemeId)?.accentColor ??
        "#E8A43A");

  // ── Gesture handlers ──────────────────────────────────────────────────────
  const handleWheelGesture = (e: GestureResponderEvent) => {
    const { locationX, locationY } = e.nativeEvent;
    const dx = locationX - CX;
    const dy = locationY - CY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < INNER_R - 14 || dist > OUTER_R + 14) return;
    let angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    if (angle < 0) angle += 360;
    setHue(Math.round(angle) % 360);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSatGesture = (e: GestureResponderEvent) => {
    const pct = Math.max(0, Math.min(1, e.nativeEvent.locationX / satW));
    setSat(Math.round(pct * 100));
  };

  const handleLigGesture = (e: GestureResponderEvent) => {
    const pct = Math.max(0, Math.min(1, e.nativeEvent.locationX / ligW));
    setLig(Math.round(20 + pct * 60)); // range 20–80
  };

  const applyHex = () => {
    const raw = hexInput.trim();
    const hex = raw.startsWith("#") ? raw : `#${raw}`;
    if (!isValidHex(hex)) {
      Alert.alert("Invalid color", "Enter a valid 6-digit hex e.g. #3B82F6");
      return;
    }
    const { h, s, l } = hexToHsl(hex);
    setHue(h);
    setSat(s);
    setLig(l);
    setHexInput("");
  };

  const handleSave = () => {
    const name = themeName.trim();
    if (!name) {
      Alert.alert("Name required", "Give your theme a name before saving.");
      return;
    }
    const id = UUID.v4() as string;
    addCustomTheme({
      id,
      name,
      primaryColor: pickedHex,
      secondaryColor: hslToHex(hue, sat, Math.max(0, lig - 20)),
      accentColor: pickedHex,
    });
    setActiveTheme(id);
    setThemeName("");
    setTab("presets");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete theme", "Remove this theme?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          removeCustomTheme(id);
          if (activeThemeId === id) setActiveTheme("solitude");
        },
      },
    ]);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View
      style={[
        s.root,
        { backgroundColor: colors.background, paddingTop: insets.top },
      ]}
    >
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={s.backBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: colors.textPrimary }]}>
          Theme
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Live preview */}
      <PreviewCard accentHex={previewAccent} colors={colors} />

      {/* Tab bar */}
      <View
        style={[
          s.tabBar,
          {
            backgroundColor: colors.surfaceMuted,
            borderColor: colors.border,
          },
        ]}
      >
        {(["presets", "custom"] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[s.tabBtn, tab === t && { backgroundColor: colors.surface }]}
            onPress={() => setTab(t)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                s.tabLabel,
                {
                  color: tab === t ? colors.textPrimary : colors.textSecondary,
                },
              ]}
            >
              {t === "presets" ? "Presets" : "Custom"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Presets tab ── */}
      {tab === "presets" && (
        <ScrollView
          contentContainerStyle={[
            s.scroll,
            { paddingBottom: insets.bottom + 32 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[s.sectionLabel, { color: colors.textSecondary }]}>
            BUILT-IN
          </Text>
          <View style={s.grid}>
            {BUILTIN_THEMES.map((t) => {
              const active = activeThemeId === t.id;
              return (
                <TouchableOpacity
                  key={t.id}
                  style={s.gridItem}
                  onPress={() => {
                    setActiveTheme(t.id);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      s.swatch,
                      { backgroundColor: t.accentColor },
                      active && {
                        borderWidth: 3,
                        borderColor: colors.textPrimary,
                      },
                    ]}
                  >
                    {active && (
                      <Ionicons name="checkmark" size={22} color="#fff" />
                    )}
                  </View>
                  <Text
                    style={[
                      s.swatchLabel,
                      {
                        color: active
                          ? colors.textPrimary
                          : colors.textSecondary,
                        fontWeight: active ? "600" : "400",
                      },
                    ]}
                  >
                    {t.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={[s.divider, { backgroundColor: colors.border }]} />

          <Text style={[s.sectionLabel, { color: colors.textSecondary }]}>
            MY THEMES
          </Text>

          {customThemes.length === 0 ? (
            <Text style={[s.emptyText, { color: colors.textSecondary }]}>
              No custom themes yet.
            </Text>
          ) : (
            customThemes.map((t) => {
              const active = activeThemeId === t.id;
              return (
                <TouchableOpacity
                  key={t.id}
                  style={[s.userRow, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    setActiveTheme(t.id);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  activeOpacity={0.8}
                >
                  <View
                    style={[s.userCircle, { backgroundColor: t.accentColor }]}
                  >
                    {active && (
                      <Ionicons name="checkmark" size={13} color="#fff" />
                    )}
                  </View>
                  <Text
                    style={[
                      s.userName,
                      {
                        flex: 1,
                        color: active
                          ? colors.textPrimary
                          : colors.textSecondary,
                        fontWeight: active ? "600" : "400",
                      },
                    ]}
                  >
                    {t.name}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleDelete(t.id)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={17}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })
          )}

          <TouchableOpacity
            style={[s.createRow, { borderTopColor: colors.border }]}
            onPress={() => setTab("custom")}
            activeOpacity={0.7}
          >
            <Ionicons
              name="color-wand-outline"
              size={18}
              color={colors.accent}
            />
            <Text style={[s.createLabel, { color: colors.accent }]}>
              Create custom theme
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* ── Custom tab ── */}
      {tab === "custom" && (
        <ScrollView
          contentContainerStyle={[
            s.customScroll,
            { paddingBottom: insets.bottom + 32 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* HSL Wheel */}
          <View style={s.wheelWrap}>
            <View
              style={{ width: WHEEL_SIZE, height: WHEEL_SIZE }}
              onStartShouldSetResponder={() => true}
              onMoveShouldSetResponder={() => true}
              onResponderGrant={handleWheelGesture}
              onResponderMove={handleWheelGesture}
            >
              <Svg width={WHEEL_SIZE} height={WHEEL_SIZE}>
                {/* Hue ring */}
                {ARC_DATA.map(({ path, arcHue }, i) => (
                  <Path key={i} d={path} fill={`hsl(${arcHue}, 100%, 50%)`} />
                ))}
                {/* Centre background */}
                <Circle
                  cx={CX}
                  cy={CY}
                  r={INNER_R - 2}
                  fill={colors.background}
                />
                {/* Centre preview swatch */}
                <Circle cx={CX} cy={CY} r={INNER_R * 0.52} fill={pickedHex} />
                {/* Thumb */}
                <Circle cx={thumbX} cy={thumbY} r={THUMB_R + 3} fill="white" />
                <Circle cx={thumbX} cy={thumbY} r={THUMB_R} fill={pickedHex} />
              </Svg>
            </View>
          </View>

          {/* Sliders */}
          <View style={[s.sliders, { width: "100%" }]}>
            <Text style={[s.sliderLabel, { color: colors.textSecondary }]}>
              Saturation — {sat}%
            </Text>
            <View
              style={s.track}
              onLayout={(e) => setSatW(e.nativeEvent.layout.width || 1)}
              onStartShouldSetResponder={() => true}
              onMoveShouldSetResponder={() => true}
              onResponderGrant={handleSatGesture}
              onResponderMove={handleSatGesture}
            >
              <LinearGradient
                colors={satGradient}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={StyleSheet.absoluteFill}
              />
              <View
                style={[
                  s.thumb,
                  {
                    left: Math.max(0, (sat / 100) * (satW - 20)),
                    backgroundColor: pickedHex,
                  },
                ]}
              />
            </View>

            <Text
              style={[
                s.sliderLabel,
                { color: colors.textSecondary, marginTop: 18 },
              ]}
            >
              Lightness — {lig}%
            </Text>
            <View
              style={s.track}
              onLayout={(e) => setLigW(e.nativeEvent.layout.width || 1)}
              onStartShouldSetResponder={() => true}
              onMoveShouldSetResponder={() => true}
              onResponderGrant={handleLigGesture}
              onResponderMove={handleLigGesture}
            >
              <LinearGradient
                colors={ligGradient}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={StyleSheet.absoluteFill}
              />
              <View
                style={[
                  s.thumb,
                  {
                    left: Math.max(0, ((lig - 20) / 60) * (ligW - 20)),
                    backgroundColor: pickedHex,
                  },
                ]}
              />
            </View>
          </View>

          {/* Hex row */}
          <View
            style={[
              s.hexRow,
              {
                backgroundColor: colors.surfaceMuted,
                borderColor: colors.border,
                width: "100%",
              },
            ]}
          >
            <View style={[s.hexDot, { backgroundColor: pickedHex }]} />
            <Text style={[s.hexCode, { color: colors.textPrimary }]}>
              {pickedHex.toUpperCase()}
            </Text>
            <View style={{ flex: 1 }} />
            <TextInput
              style={[
                s.hexInput,
                {
                  color: colors.textPrimary,
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                },
              ]}
              value={hexInput}
              onChangeText={setHexInput}
              placeholder="#hex"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="characters"
              maxLength={7}
              returnKeyType="done"
              onSubmitEditing={applyHex}
            />
            <TouchableOpacity
              onPress={applyHex}
              style={[s.applyBtn, { borderColor: colors.border }]}
            >
              <Text
                style={{
                  color: colors.accent,
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                Apply
              </Text>
            </TouchableOpacity>
          </View>

          {/* Save area */}
          <View
            style={[
              s.saveArea,
              { borderTopColor: colors.border, width: "100%" },
            ]}
          >
            <TextInput
              style={[
                s.nameInput,
                {
                  backgroundColor: colors.surfaceMuted,
                  color: colors.textPrimary,
                  borderColor: colors.border,
                },
              ]}
              value={themeName}
              onChangeText={setThemeName}
              placeholder="Name this theme…"
              placeholderTextColor={colors.textSecondary}
              maxLength={30}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={[s.saveBtn, { backgroundColor: pickedHex }]}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Text style={s.saveBtnText}>Save Theme</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 17, fontWeight: "600", letterSpacing: -0.3 },

  tabBar: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 4,
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  tabLabel: { fontSize: 13, fontWeight: "600" },

  // Presets tab
  scroll: { paddingHorizontal: 20, paddingTop: 16 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.6,
    marginBottom: 14,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 4 },
  gridItem: { width: "30%", alignItems: "center", gap: 7, paddingVertical: 4 },
  swatch: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  swatchLabel: { fontSize: 12, textAlign: "center" },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 20 },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  userCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  userName: { fontSize: 14 },
  emptyText: { fontSize: 13, fontStyle: "italic", marginBottom: 16 },
  createRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 18,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 12,
  },
  createLabel: { fontSize: 14, fontWeight: "600" },

  // Custom tab
  customScroll: { paddingHorizontal: 20, paddingTop: 12, alignItems: "center" },
  wheelWrap: { alignItems: "center", marginBottom: 28 },
  sliders: { marginBottom: 20 },
  sliderLabel: { fontSize: 12, fontWeight: "500", marginBottom: 8 },
  track: {
    height: 28,
    borderRadius: 8,
    overflow: "hidden",
    justifyContent: "center",
    position: "relative",
  },
  thumb: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2.5,
    borderColor: "#fff",
    top: 4,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 4,
  },
  hexRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 10,
    marginBottom: 20,
  },
  hexDot: { width: 24, height: 24, borderRadius: 12 },
  hexCode: { fontSize: 14, fontWeight: "600", fontVariant: ["tabular-nums"] },
  hexInput: {
    fontSize: 13,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    width: 80,
    textAlign: "center",
  },
  applyBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  saveArea: {
    paddingTop: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  nameInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
  },
  saveBtn: { borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
