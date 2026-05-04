import Button from "@/components/Button";
import { Strings } from "@/constants";
import { useTheme } from "@/context/ThemeContext";
import {
  useOnboardingStore,
  WorkType as WorkTypeValue,
} from "@/store/onboardingStore";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

function ProgressDots({ step, total }: { step: number; total: number }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        gap: 6,
        alignSelf: "center",
        marginBottom: 32,
      }}
    >
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={{
            width: i + 1 <= step ? 20 : 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: i + 1 <= step ? colors.accent : colors.border,
          }}
        />
      ))}
    </View>
  );
}

export default function WorkType() {
  const { colors } = useTheme();
  const [selectedType, setSelectedType] = useState<WorkTypeValue>(null);
  const setWorkType = useOnboardingStore((state) => state.setWorkType);

  const workTypes: { id: NonNullable<WorkTypeValue>; label: string }[] = [
    { id: "screen", label: Strings.workType1 },
    { id: "reading", label: Strings.workType2 },
    { id: "writing", label: Strings.workType3 },
    { id: "creative", label: Strings.workType4 },
    { id: "other", label: Strings.workTypeOther },
  ];

  const s = StyleSheet.create({
    root: { flex: 1, paddingTop: 40 },
    heading: {
      fontFamily: "SoraBold",
      fontSize: 32,
      color: colors.textPrimary,
      textAlign: "center",
      marginBottom: 24,
      lineHeight: 40,
    },
    list: { flex: 1, paddingHorizontal: 24 },
    card: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 18,
      marginBottom: 10,
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    cardSelected: { borderColor: colors.accent },
    radio: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 14,
    },
    radioSelected: { borderColor: colors.accent },
    radioDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.accent,
    },
    label: {
      fontFamily: "Sora",
      fontSize: 15,
      color: colors.textPrimary,
      flex: 1,
    },
    footer: { marginBottom: 40 },
  });

  return (
    <View style={s.root}>
      <ProgressDots step={1} total={3} />
      <Text style={s.heading}>{Strings.workTypeHeading}</Text>
      <View style={s.list}>
        {workTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[s.card, selectedType === type.id && s.cardSelected]}
            onPress={() => setSelectedType(type.id)}
            activeOpacity={0.7}
          >
            <View
              style={[s.radio, selectedType === type.id && s.radioSelected]}
            >
              {selectedType === type.id && <View style={s.radioDot} />}
            </View>
            <Text style={s.label}>{type.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={s.footer}>
        <Button
          buttonText={Strings.onboardingPage2Button}
          nextPage={() => {
            if (selectedType) setWorkType(selectedType);
            router.push("/(onboarding)/notifications");
          }}
          disabled={!selectedType}
        />
      </View>
    </View>
  );
}
