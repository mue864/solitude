import BottomSheet from "@/components/BottomSheet";
import { useTheme } from "@/context/ThemeContext";
import {
  FLOW_CATEGORIES,
  useFlowStore,
  type FlowCategory,
} from "@/store/flowStore";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface FlowsModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectFlow: (flowId: string) => void;
  onCreateFlow: () => void;
  onEditFlow: (flowId: string) => void;
}

export default function FlowsModal({
  isVisible,
  onClose,
  onSelectFlow,
  onCreateFlow,
  onEditFlow,
}: FlowsModalProps) {
  const { colors } = useTheme();
  const customFlows = useFlowStore((s) => s.customFlows);
  const deleteFlow = useFlowStore((s) => s.deleteFlow);

  const grouped = useMemo(() => {
    const map: Partial<Record<FlowCategory, typeof customFlows>> = {};
    for (const flow of customFlows) {
      if (!map[flow.category]) map[flow.category] = [];
      map[flow.category]!.push(flow);
    }
    return map;
  }, [customFlows]);

  const handleDelete = (id: string, name: string) => {
    Alert.alert("Delete Flow", `Delete "${name}"? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteFlow(id) },
    ]);
  };

  return (
    <BottomSheet isVisible={isVisible} onClose={onClose} title="Flows">
      {/* Create button */}
      <TouchableOpacity
        onPress={onCreateFlow}
        style={[styles.createBtn, { backgroundColor: colors.accent }]}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={18} color="#fff" />
        <Text style={styles.createBtnText}>Create New Flow</Text>
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        {Object.entries(grouped).map(([category, flows]) => {
          const catKey = category as FlowCategory;
          const catInfo = FLOW_CATEGORIES[catKey];
          const allFlows = [
            ...flows!.filter((f) => !f.readonly),
            ...flows!.filter((f) => f.readonly),
          ];

          return (
            <View key={category} style={styles.group}>
              <View style={styles.groupHeader}>
                <Text style={styles.groupEmoji}>{catInfo.icon}</Text>
                <Text
                  style={[styles.groupLabel, { color: colors.textSecondary }]}
                >
                  {catInfo.name.toUpperCase()}
                </Text>
              </View>

              {allFlows.map((flow) => {
                const totalMin = Math.round(
                  flow.steps.reduce((acc, step) => acc + step.duration, 0) / 60,
                );

                return (
                  <TouchableOpacity
                    key={flow.id}
                    onPress={() => {
                      onSelectFlow(flow.id);
                      onClose();
                    }}
                    style={[
                      styles.card,
                      {
                        backgroundColor: colors.surfaceMuted,
                        borderColor: colors.border,
                      },
                    ]}
                    activeOpacity={0.75}
                  >
                    <View style={styles.cardMain}>
                      <Text
                        style={[styles.flowName, { color: colors.textPrimary }]}
                        numberOfLines={1}
                      >
                        {flow.name}
                      </Text>
                      <Text
                        style={[
                          styles.flowSteps,
                          { color: colors.textSecondary },
                        ]}
                        numberOfLines={1}
                      >
                        {flow.steps.map((step) => step.type).join(" · ")}
                      </Text>
                    </View>

                    <View style={styles.cardRight}>
                      <View
                        style={[
                          styles.durationChip,
                          { backgroundColor: colors.surface },
                        ]}
                      >
                        <Ionicons
                          name="time-outline"
                          size={11}
                          color={colors.textSecondary}
                        />
                        <Text
                          style={[
                            styles.durationText,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {totalMin}m
                        </Text>
                      </View>
                      {!flow.readonly && (
                        <View style={styles.actions}>
                          <TouchableOpacity
                            onPress={() => {
                              onEditFlow(flow.id);
                              onClose();
                            }}
                            hitSlop={10}
                          >
                            <Ionicons
                              name="pencil-outline"
                              size={15}
                              color={colors.textSecondary}
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleDelete(flow.id, flow.name)}
                            hitSlop={10}
                          >
                            <Ionicons
                              name="trash-outline"
                              size={15}
                              color={colors.destructive}
                            />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })}

        {customFlows.length === 0 && (
          <View style={styles.empty}>
            <Ionicons
              name="flower-outline"
              size={32}
              color={colors.textSecondary}
            />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No flows yet
            </Text>
          </View>
        )}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 20,
  },
  createBtnText: { fontSize: 14, fontFamily: "SoraSemiBold", color: "#fff" },

  scroll: { maxHeight: 440 },
  scrollContent: { paddingBottom: 8 },

  group: { marginBottom: 18 },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  groupEmoji: { fontSize: 13 },
  groupLabel: { fontSize: 11, fontFamily: "SoraSemiBold", letterSpacing: 0.8 },

  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  cardMain: { flex: 1, marginRight: 12 },
  flowName: { fontSize: 14, fontFamily: "SoraSemiBold", marginBottom: 3 },
  flowSteps: { fontSize: 12, fontFamily: "Sora" },

  cardRight: { alignItems: "flex-end", gap: 8 },
  durationChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  durationText: { fontSize: 11, fontFamily: "SoraSemiBold" },
  actions: { flexDirection: "row", gap: 14, alignItems: "center" },

  empty: { alignItems: "center", paddingVertical: 48, gap: 10 },
  emptyText: { fontSize: 14, fontFamily: "Sora" },
});
