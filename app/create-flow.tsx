import { useTheme } from "@/context/ThemeContext";
import {
  useFlowStore,
  type FlowCategory,
  type FlowStep,
} from "@/store/flowStore";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const STEP_TYPES: {
  value: string;
  label: string;
  icon: string;
  color: string;
}[] = [
  { value: "focus", label: "Focus", icon: "flame-outline", color: "#E05A5A" },
  { value: "break", label: "Break", icon: "cafe-outline", color: "#4CAF7D" },
  {
    value: "longBreak",
    label: "Long Break",
    icon: "leaf-outline",
    color: "#5B8DEF",
  },
];

const DURATION_OPTIONS = [5, 10, 15, 20, 25, 30, 45, 60];

export default function CreateFlow() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const flowId = params.id as string;

  const { addFlow, updateFlow, customFlows } = useFlowStore();
  const existingFlow = flowId ? customFlows.find((f) => f.id === flowId) : null;
  const isEditing = !!existingFlow;

  const [flowName, setFlowName] = useState(existingFlow?.name || "");
  const [steps, setSteps] = useState<FlowStep[]>(
    existingFlow?.steps || [{ type: "focus", duration: 25 * 60 }],
  );
  const [selectedCategory, setSelectedCategory] = useState<FlowCategory>(
    existingFlow?.category || "focus",
  );
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  useEffect(() => {
    if (existingFlow) {
      setFlowName(existingFlow.name);
      setSteps(existingFlow.steps);
      setSelectedCategory(existingFlow.category);
    }
  }, [existingFlow]);

  const addStep = () =>
    setSteps([...steps, { type: "focus", duration: 25 * 60 }]);

  const removeStep = (index: number) => {
    if (steps.length > 1) setSteps(steps.filter((_, i) => i !== index));
  };

  const updateStep = (index: number, field: keyof FlowStep, value: any) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  const getLivePreview = () =>
    steps
      .map((step) => {
        const t = STEP_TYPES.find((s) => s.value === step.type);
        return `${t?.label} ${Math.floor(step.duration / 60)}m`;
      })
      .join(" → ");

  const totalDuration = steps.reduce((t, s) => t + s.duration, 0);
  const isValid = flowName.trim().length > 0 && steps.length > 0;

  const handleSave = () => {
    if (!isValid) return;
    if (isEditing && existingFlow) {
      updateFlow(flowId, {
        ...existingFlow,
        name: flowName.trim(),
        category: selectedCategory,
        steps,
      });
    } else {
      addFlow({
        id: Date.now().toString(),
        name: flowName.trim(),
        category: selectedCategory,
        steps,
        isReadonly: false,
      });
    }
    router.back();
  };

  const handleCancel = () => {
    if (flowName.trim().length > 0 || steps.length > 1) {
      setShowDiscardModal(true);
    } else {
      router.back();
    }
  };

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: colors.background, paddingTop: insets.top },
      ]}
    >
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={handleCancel} hitSlop={12}>
          <Ionicons name="close" size={22} color={colors.textSecondary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          {isEditing ? "Edit Flow" : "New Flow"}
        </Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={!isValid}
          style={[styles.saveBtn, { opacity: isValid ? 1 : 0.4 }]}
        >
          <Text style={[styles.saveBtnText, { color: colors.accent }]}>
            {isEditing ? "Update" : "Save"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Flow Name */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
          Flow name
        </Text>
        <TextInput
          value={flowName}
          onChangeText={setFlowName}
          placeholder="E.g. Deep work sprint…"
          placeholderTextColor={colors.textSecondary}
          style={[
            styles.input,
            {
              backgroundColor: colors.surfaceMuted,
              borderColor: colors.border,
              color: colors.textPrimary,
            },
          ]}
        />

        {/* Preview */}
        <View
          style={[
            styles.previewCard,
            {
              backgroundColor: colors.surfaceMuted,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>
            Preview
          </Text>
          <Text style={[styles.previewText, { color: colors.textPrimary }]}>
            {getLivePreview()}
          </Text>
          <Text style={[styles.previewTotal, { color: colors.textSecondary }]}>
            Total · {Math.floor(totalDuration / 60)} min
          </Text>
        </View>

        {/* Steps */}
        <View style={styles.stepsHeader}>
          <Text
            style={[
              styles.sectionLabel,
              { color: colors.textSecondary, marginBottom: 0 },
            ]}
          >
            Steps ({steps.length})
          </Text>
          <TouchableOpacity
            style={[
              styles.addStepBtn,
              {
                backgroundColor: colors.accentMuted,
                borderColor: colors.accent + "40",
              },
            ]}
            onPress={addStep}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={15} color={colors.accent} />
            <Text style={[styles.addStepText, { color: colors.accent }]}>
              Add step
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ gap: 12 }}>
          {steps.map((step, index) => (
            <View
              key={index}
              style={[
                styles.stepCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              {/* Step row header */}
              <View style={styles.stepCardHeader}>
                <Text
                  style={[styles.stepIndex, { color: colors.textSecondary }]}
                >
                  Step {index + 1}
                </Text>
                {steps.length > 1 && (
                  <TouchableOpacity
                    onPress={() => removeStep(index)}
                    hitSlop={8}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={17}
                      color={colors.destructive}
                    />
                  </TouchableOpacity>
                )}
              </View>

              {/* Type chips */}
              <Text
                style={[styles.fieldLabel, { color: colors.textSecondary }]}
              >
                Type
              </Text>
              <View style={styles.chipRow}>
                {STEP_TYPES.map((type) => {
                  const sel = step.type === type.value;
                  return (
                    <TouchableOpacity
                      key={type.value}
                      style={[
                        styles.typeChip,
                        {
                          backgroundColor: sel
                            ? type.color + "22"
                            : colors.surfaceMuted,
                          borderColor: sel ? type.color : colors.border,
                        },
                      ]}
                      onPress={() => updateStep(index, "type", type.value)}
                      activeOpacity={0.75}
                    >
                      <Ionicons
                        name={type.icon as any}
                        size={14}
                        color={sel ? type.color : colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.typeChipLabel,
                          { color: sel ? type.color : colors.textSecondary },
                        ]}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Duration chips */}
              <Text
                style={[styles.fieldLabel, { color: colors.textSecondary }]}
              >
                Duration
              </Text>
              <View style={styles.durationRow}>
                {DURATION_OPTIONS.map((min) => {
                  const sel = step.duration === min * 60;
                  return (
                    <TouchableOpacity
                      key={min}
                      style={[
                        styles.durationChip,
                        {
                          backgroundColor: sel
                            ? colors.accentMuted
                            : colors.surfaceMuted,
                          borderColor: sel ? colors.accent : colors.border,
                        },
                      ]}
                      onPress={() => updateStep(index, "duration", min * 60)}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={[
                          styles.durationChipLabel,
                          { color: sel ? colors.accent : colors.textSecondary },
                        ]}
                      >
                        {min}m
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Discard confirmation */}
      <Modal
        animationType="fade"
        transparent
        visible={showDiscardModal}
        onRequestClose={() => setShowDiscardModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setShowDiscardModal(false)}
          />
          <View
            style={[
              styles.discardCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.discardTitle, { color: colors.textPrimary }]}>
              Discard changes?
            </Text>
            <Text style={[styles.discardBody, { color: colors.textSecondary }]}>
              Your unsaved changes will be lost.
            </Text>
            <View style={styles.discardBtns}>
              <TouchableOpacity
                style={[
                  styles.discardSecondary,
                  { backgroundColor: colors.surfaceMuted },
                ]}
                onPress={() => setShowDiscardModal(false)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.discardSecondaryText,
                    { color: colors.textSecondary },
                  ]}
                >
                  Keep editing
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.discardPrimary,
                  { backgroundColor: colors.destructive },
                ]}
                onPress={() => {
                  setShowDiscardModal(false);
                  router.back();
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.discardPrimaryText, { color: "#fff" }]}>
                  Discard
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: 16, fontFamily: "SoraSemiBold" },
  saveBtn: { paddingHorizontal: 4, paddingVertical: 4 },
  saveBtnText: { fontSize: 15, fontFamily: "SoraSemiBold" },
  scrollContent: { paddingHorizontal: 20, paddingTop: 24 },
  sectionLabel: {
    fontSize: 12,
    fontFamily: "SoraSemiBold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: "Sora",
    marginBottom: 20,
  },
  previewCard: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    marginBottom: 28,
    gap: 4,
  },
  previewLabel: {
    fontSize: 11,
    fontFamily: "SoraSemiBold",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  previewText: { fontSize: 14, fontFamily: "SoraSemiBold", lineHeight: 22 },
  previewTotal: { fontSize: 12, fontFamily: "Sora" },
  stepsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  addStepBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  addStepText: { fontSize: 13, fontFamily: "SoraSemiBold" },
  stepCard: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
  },
  stepCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  stepIndex: { fontSize: 12, fontFamily: "SoraSemiBold", letterSpacing: 0.3 },
  fieldLabel: { fontSize: 12, fontFamily: "Sora", marginBottom: 8 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 },
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  typeChipLabel: { fontSize: 13, fontFamily: "SoraSemiBold" },
  durationRow: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  durationChip: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  durationChipLabel: { fontSize: 12, fontFamily: "SoraSemiBold" },
  // Discard modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  discardCard: {
    width: "100%",
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 24,
  },
  discardTitle: { fontSize: 17, fontFamily: "SoraBold", marginBottom: 8 },
  discardBody: {
    fontSize: 14,
    fontFamily: "Sora",
    lineHeight: 20,
    marginBottom: 24,
  },
  discardBtns: { flexDirection: "row", gap: 10 },
  discardSecondary: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
  },
  discardSecondaryText: { fontSize: 14, fontFamily: "SoraSemiBold" },
  discardPrimary: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
  },
  discardPrimaryText: { fontSize: 14, fontFamily: "SoraBold" },
});
