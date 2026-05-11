import { useTheme } from "@/context/ThemeContext";
import type {
  FocusAudioCacheEntry,
  FocusAudioTrack,
} from "@/store/focusAudioStore";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  tracks: FocusAudioTrack[];
  preferredTrackId: string | null;
  cache: Record<string, FocusAudioCacheEntry>;
  soundEnabled: boolean;
  isPro: boolean;
  onSelectTrack: (trackId: string) => void;
  onSelectNone: () => void;
  onUpgrade: () => void;
};

export default function FocusSoundSheet({
  visible,
  onClose,
  tracks,
  preferredTrackId,
  cache,
  soundEnabled,
  isPro,
  onSelectTrack,
  onSelectNone,
  onUpgrade,
}: Props) {
  const { colors } = useTheme();
  const s = styles(colors);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={s.backdrop} onPress={onClose}>
        <Pressable style={s.sheet} onPress={() => {}}>
          <View style={s.handle} />
          <View style={s.headerRow}>
            <Text style={s.title}>Focus sound</Text>
            <Text style={s.subtitle}>
              {soundEnabled ? "Sound on" : "Sound off"}
            </Text>
          </View>

          <ScrollView
            style={s.scroll}
            contentContainerStyle={s.content}
            showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity
              style={[
                s.option,
                preferredTrackId === null && {
                  borderColor: colors.accent + "66",
                  backgroundColor: colors.accentMuted,
                },
              ]}
              onPress={onSelectNone}
            >
              <View style={s.left}>
                <Ionicons
                  name="volume-mute-outline"
                  size={16}
                  color={
                    preferredTrackId === null
                      ? colors.accent
                      : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    s.optionLabel,
                    {
                      color:
                        preferredTrackId === null
                          ? colors.accent
                          : colors.textSecondary,
                    },
                  ]}
                >
                  No sound
                </Text>
              </View>
              {preferredTrackId === null && (
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={colors.accent}
                />
              )}
            </TouchableOpacity>

            {tracks.map((track) => {
              const selected = preferredTrackId === track.id;
              const locked = track.isPremium && !isPro;
              const entry = cache[track.id];
              const status = locked
                ? "Premium"
                : entry?.status === "ready"
                  ? "Ready offline"
                  : entry?.status === "downloading"
                    ? "Downloading"
                    : entry?.status === "error"
                      ? "Download failed"
                      : "Stream then cache";

              return (
                <TouchableOpacity
                  key={track.id}
                  style={[
                    s.option,
                    selected &&
                      !locked && {
                        borderColor: colors.accent + "66",
                        backgroundColor: colors.accentMuted,
                      },
                    locked && { opacity: 0.6 },
                  ]}
                  onPress={() => {
                    if (locked) {
                      onUpgrade();
                    } else {
                      onSelectTrack(track.id);
                    }
                  }}
                >
                  <View style={s.left}>
                    <Ionicons
                      name={
                        locked
                          ? "lock-closed-outline"
                          : selected
                            ? "musical-notes"
                            : "musical-notes-outline"
                      }
                      size={16}
                      color={
                        locked
                          ? colors.textSecondary
                          : selected
                            ? colors.accent
                            : colors.textSecondary
                      }
                    />
                    <View>
                      <Text
                        style={[
                          s.optionLabel,
                          {
                            color: locked
                              ? colors.textSecondary
                              : selected
                                ? colors.accent
                                : colors.textPrimary,
                          },
                        ]}
                      >
                        {track.name}
                      </Text>
                      <Text style={s.status}>{status}</Text>
                    </View>
                  </View>
                  {!locked && selected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={colors.accent}
                    />
                  )}
                  {locked && (
                    <Ionicons
                      name="arrow-forward-circle-outline"
                      size={18}
                      color={colors.accent}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function styles(
  colors: ReturnType<
    typeof import("@/context/ThemeContext").useTheme
  >["colors"],
) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.34)",
      justifyContent: "flex-end",
    },
    sheet: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      backgroundColor: colors.background,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      maxHeight: "72%",
      paddingBottom: 18,
    },
    handle: {
      alignSelf: "center",
      width: 42,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      marginTop: 10,
      marginBottom: 12,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      marginBottom: 10,
    },
    title: {
      fontSize: 16,
      fontFamily: "SoraSemiBold",
      color: colors.textPrimary,
    },
    subtitle: {
      fontSize: 12,
      fontFamily: "Sora",
      color: colors.textSecondary,
    },
    scroll: {
      paddingHorizontal: 12,
    },
    content: {
      gap: 8,
      paddingBottom: 6,
    },
    option: {
      borderRadius: 14,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingHorizontal: 12,
      paddingVertical: 11,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    left: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      flex: 1,
    },
    optionLabel: {
      fontSize: 14,
      fontFamily: "SoraSemiBold",
    },
    status: {
      fontSize: 11,
      fontFamily: "Sora",
      color: colors.textSecondary,
      marginTop: 2,
    },
  });
}
