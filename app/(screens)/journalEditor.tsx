import JournalInsightModal from "@/components/modals/JournalInsightModal";
import { useTheme } from "@/context/ThemeContext";
import { aiApi, storageApi } from "@/services/api";
import {
  DAILY_AUDIO_INSIGHT_LIMIT,
  useAiUsageStore,
} from "@/store/aiUsageStore";
import { useAuthStore } from "@/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { format, parseISO } from "date-fns";
import { Audio } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DraggableBlock from "../../components/DraggableBlock";
import {
  JOURNAL_TAGS,
  JournalBlock,
  JournalInsight,
  JournalMood,
  JournalTag,
  useJournalStore,
} from "../../store/journalStore";

// ─── Utilities ──────────────────────────────────────────────

function createEmptyBlock(type: JournalBlock["type"]): JournalBlock {
  switch (type) {
    case "text":
      return { type: "text", content: "" };
    case "checkbox":
      return {
        type: "checkbox",
        items: [{ text: "", checked: false }],
        title: "",
      };
    case "list":
      return { type: "list", items: [""] };
    case "image":
      return { type: "image", uri: "" };
    case "audio":
      return { type: "audio", uri: "", duration: 0, title: "" };
    default:
      return { type: "text", content: "" };
  }
}

const formatSecs = (s: number) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

// ─── AudioBlock ─────────────────────────────────────────────

function AudioBlock({
  block,
  idx,
  onUpdate,
  isRecording,
  setRecordingIdx,
}: {
  block: JournalBlock;
  idx: number;
  onUpdate: (b: JournalBlock) => void;
  isRecording: boolean;
  setRecordingIdx: (i: number | null) => void;
}) {
  const { colors } = useTheme();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioTitle, setAudioTitle] = useState((block as any).title || "");

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const recordingTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRecording) {
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      );
      const waveLoop = Animated.loop(
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      );
      pulseLoop.start();
      waveLoop.start();
      recordingTimer.current = setInterval(
        () => setRecordingTime((p) => p + 1),
        1000,
      );
      return () => {
        pulseLoop.stop();
        waveLoop.stop();
        if (recordingTimer.current) clearInterval(recordingTimer.current);
      };
    }
  }, [isRecording]);

  useEffect(() => {
    return () => {
      sound?.unloadAsync();
      try {
        recording?.stopAndUnloadAsync();
      } catch {}
      if (recordingTimer.current) clearInterval(recordingTimer.current);
    };
  }, [sound, recording]);

  if (block.type !== "audio") return null;

  const handleRecord = async () => {
    if (isRecording || recording) return;
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant microphone access to record.",
        );
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });
      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        (s) =>
          s.isRecording &&
          setRecordingTime(
            s.durationMillis ? Math.floor(s.durationMillis / 1000) : 0,
          ),
        100,
      );
      setRecording(rec);
      setRecordingIdx(idx);
      setRecordingTime(0);
    } catch {
      Alert.alert("Error", "Failed to start recording.");
      setRecording(null);
      setRecordingIdx(null);
    }
  };

  const handleStop = async () => {
    if (!recording) {
      setRecordingIdx(null);
      return;
    }
    if (recordingTimer.current) {
      clearInterval(recordingTimer.current);
      recordingTimer.current = null;
    }
    setRecordingIdx(null);
    const finalTime = recordingTime;
    setRecordingTime(0);
    try {
      let uri: string | null = null;
      try {
        const st = await recording.getStatusAsync();
        if (st.isRecording) await recording.stopAndUnloadAsync();
        uri = recording.getURI();
      } catch {
        uri = recording.getURI();
      }
      if (uri) {
        const title =
          audioTitle || `Recording ${new Date().toLocaleTimeString()}`;
        // Save locally first so playback works immediately
        onUpdate({ type: "audio", uri, duration: finalTime, title });

        // Upload to MinIO in the background — update block with URL when done
        const filename = `recording-${Date.now()}.m4a`;
        storageApi
          .uploadAudio(uri, filename)
          .then(({ url }) => {
            onUpdate({ type: "audio", uri, duration: finalTime, title, url });
          })
          .catch(() => {
            // Non-fatal: entry still saves, AI insight uses metadata fallback
          });
      } else throw new Error("No URI");
    } catch {
      Alert.alert(
        "Recording Error",
        "Failed to save recording. Please try again.",
      );
    } finally {
      setRecording(null);
    }
  };

  const handlePlayPause = async () => {
    if (!sound && (block as any).uri) {
      try {
        const { sound: s } = await Audio.Sound.createAsync(
          { uri: (block as any).uri },
          { shouldPlay: true },
        );
        setSound(s);
        setIsPlaying(true);
        s.setOnPlaybackStatusUpdate((st) => {
          if (st.isLoaded) {
            setPlaybackPosition(
              st.positionMillis ? st.positionMillis / 1000 : 0,
            );
            setAudioDuration(st.durationMillis ? st.durationMillis / 1000 : 0);
            if (st.didJustFinish) {
              setIsPlaying(false);
              setPlaybackPosition(0);
            }
          }
        });
      } catch {
        Alert.alert("Error", "Failed to play audio.");
      }
    } else if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
    }
  };

  const handleDelete = () =>
    Alert.alert("Delete Recording", "Remove this recording?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          if (sound) await sound.unloadAsync();
          onUpdate({ type: "audio", uri: "", duration: 0, title: "" });
        },
      },
    ]);

  const progressPct =
    audioDuration > 0 ? (playbackPosition / audioDuration) * 100 : 0;

  return (
    <View
      style={[
        es.blockCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <TextInput
        style={[
          es.audioTitleInput,
          { color: colors.textPrimary, borderBottomColor: colors.border },
        ]}
        placeholder="Recording title (optional)"
        placeholderTextColor={colors.textSecondary}
        value={audioTitle}
        onChangeText={setAudioTitle}
        onEndEditing={() => {
          if ((block as any).uri) {
            onUpdate({
              ...(block as any),
              title:
                audioTitle || `Recording ${new Date().toLocaleTimeString()}`,
            });
          }
        }}
      />

      {(block as any).uri ? (
        // ── Playback UI ──
        <View style={es.audioPlaybackRow}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text
              style={[es.audioRecordingName, { color: colors.textSecondary }]}
            >
              {(block as any).title || "Recording"}
            </Text>
            <View
              style={[
                es.progressTrack,
                { backgroundColor: colors.surfaceMuted },
              ]}
            >
              <View
                style={[
                  es.progressFill,
                  {
                    backgroundColor: colors.accent,
                    width: `${progressPct}%` as any,
                  },
                ]}
              />
            </View>
            <View style={es.progressTimes}>
              <Text style={[es.audioTimeText, { color: colors.textSecondary }]}>
                {formatSecs(Math.floor(playbackPosition))}
              </Text>
              <Text style={[es.audioTimeText, { color: colors.textSecondary }]}>
                {formatSecs(
                  Math.floor(audioDuration || (block as any).duration || 0),
                )}
              </Text>
            </View>
          </View>
          <View style={es.audioControls}>
            <TouchableOpacity
              style={[es.audioBtn, { backgroundColor: colors.accentMuted }]}
              onPress={handlePlayPause}
            >
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={18}
                color={colors.accent}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[es.audioBtn, { backgroundColor: "rgba(224,90,90,0.12)" }]}
              onPress={handleDelete}
            >
              <Ionicons
                name="trash-outline"
                size={18}
                color={colors.destructive}
              />
            </TouchableOpacity>
          </View>
        </View>
      ) : isRecording ? (
        // ── Recording UI ──
        <View style={es.recordingContainer}>
          <View style={es.recordingIndicator}>
            <Animated.View
              style={[es.recordingDot, { transform: [{ scale: pulseAnim }] }]}
            />
            <Text
              style={[
                es.recordingTimer,
                { color: colors.textPrimary, fontFamily: "SoraBold" },
              ]}
            >
              {formatSecs(recordingTime)}
            </Text>
          </View>
          <View style={es.waveContainer}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Animated.View
                key={i}
                style={[
                  es.waveBar,
                  { backgroundColor: colors.destructive + "99" },
                  {
                    transform: [
                      {
                        scaleY: waveAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.2, 0.2 + ((i * 7) % 5) * 0.16],
                        }),
                      },
                    ],
                  },
                ]}
              />
            ))}
          </View>
          <TouchableOpacity
            style={[es.stopBtn, { backgroundColor: "rgba(224,90,90,0.12)" }]}
            onPress={handleStop}
          >
            <Text
              style={[
                es.stopBtnText,
                { color: colors.destructive, fontFamily: "SoraSemiBold" },
              ]}
            >
              Stop Recording
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        // ── Idle ──
        <View style={es.recordIdle}>
          <TouchableOpacity
            style={[es.micBtn, { backgroundColor: colors.accentMuted }]}
            onPress={handleRecord}
          >
            <Ionicons name="mic-outline" size={24} color={colors.accent} />
          </TouchableOpacity>
          <Text
            style={[
              es.micHint,
              { color: colors.textSecondary, fontFamily: "Sora" },
            ]}
          >
            Tap to record
          </Text>
        </View>
      )}
    </View>
  );
}

// ─── Add Block Menu ──────────────────────────────────────────

const BLOCK_TYPES: {
  type: JournalBlock["type"];
  icon: string;
  label: string;
}[] = [
  { type: "text", icon: "document-text-outline", label: "Text" },
  { type: "checkbox", icon: "checkbox-outline", label: "Checklist" },
  { type: "list", icon: "list-outline", label: "List" },
  { type: "image", icon: "image-outline", label: "Image" },
  { type: "audio", icon: "mic-outline", label: "Recording" },
];

const AddBlockMenu = React.memo(function AddBlockMenu({
  visible,
  onAdd,
  menuAnimation,
}: {
  visible: boolean;
  onAdd: (type: JournalBlock["type"]) => void;
  menuAnimation: Animated.Value;
}) {
  const { colors } = useTheme();
  if (!visible) return null;

  return (
    <Animated.View
      style={[
        es.addMenu,
        { backgroundColor: colors.surface, borderColor: colors.border },
        {
          opacity: menuAnimation,
          transform: [
            {
              translateY: menuAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [16, 0],
              }),
            },
          ],
        },
      ]}
    >
      {BLOCK_TYPES.map((item, i) => (
        <TouchableOpacity
          key={item.type}
          onPress={() => onAdd(item.type)}
          style={[
            es.addMenuItem,
            i < BLOCK_TYPES.length - 1 && {
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <View
            style={[es.addMenuIcon, { backgroundColor: colors.surfaceMuted }]}
          >
            <Ionicons name={item.icon as any} size={18} color={colors.accent} />
          </View>
          <Text
            style={[
              es.addMenuLabel,
              { color: colors.textPrimary, fontFamily: "SoraSemiBold" },
            ]}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </Animated.View>
  );
});

// ─── JournalEditor ───────────────────────────────────────────

export default function JournalEditor() {
  const { colors } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const entries = useJournalStore((s) => s.entries);
  const addEntry = useJournalStore((s) => s.addEntry);
  const editEntry = useJournalStore((s) => s.editEntry);
  const saveInsight = useJournalStore((s) => s.saveInsight);
  const isPro = useAuthStore((s) => s.user?.isPro ?? false);
  const canRequestInsight = useAiUsageStore((s) => s.canRequestInsight);
  const recordInsight = useAiUsageStore((s) => s.recordInsight);

  const entry = useMemo(() => entries.find((e) => e.id === id), [entries, id]);

  const [title, setTitle] = useState(entry?.title || "");
  const [blocks, setBlocks] = useState<JournalBlock[]>(
    entry?.blocks?.length ? entry.blocks : [{ type: "text", content: "" }],
  );
  const [mood, setMood] = useState<JournalMood | undefined>(entry?.mood);
  const [tags, setTags] = useState<JournalTag[]>(entry?.tags ?? []);
  const [recordingIdx, setRecordingIdx] = useState<number | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // ── AI Insight state ───────────────────────────────────────
  const [showInsight, setShowInsight] = useState(false);
  const [insightLoading, setInsightLoading] = useState(false);
  const [insight, setInsight] = useState<JournalInsight | null>(null);
  const [insightError, setInsightError] = useState<string | null>(null);
  const [insightIsLimit, setInsightIsLimit] = useState(false);
  const savedEntryIdRef = useRef<string | null>(null);

  const wordCount = useMemo(() => {
    const text = blocks
      .filter((b) => b.type === "text")
      .map((b) => (b as any).content || "")
      .join(" ");
    const words = text.trim().split(/\s+/).filter(Boolean);
    return words.length;
  }, [blocks]);

  const menuAnimation = useRef(new Animated.Value(0)).current;

  // ── Track unsaved changes ──────────────────────────────────
  useEffect(() => {
    if (!entry) {
      const hasContent =
        title.trim() !== "" ||
        blocks.some((b) => {
          if (b.type === "text") return b.content?.trim() !== "";
          if (b.type === "checkbox")
            return b.items?.some((it) => it.text?.trim() !== "" || it.checked);
          if (b.type === "list")
            return b.items?.some((it) => it?.trim() !== "");
          if (b.type === "image" || b.type === "audio") return b.uri !== "";
          return false;
        });
      setUnsavedChanges(hasContent);
    } else {
      setUnsavedChanges(
        title !== entry.title ||
          blocks.length !== entry.blocks.length ||
          JSON.stringify(blocks) !== JSON.stringify(entry.blocks),
      );
    }
  }, [title, blocks, entry]);

  useEffect(() => {
    Animated.timing(menuAnimation, {
      toValue: showAddMenu ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [showAddMenu]);

  const isEmpty = useMemo(
    () =>
      !title.trim() &&
      blocks.every(
        (b) =>
          (b.type === "text" && !b.content?.trim()) ||
          (b.type === "checkbox" && b.items?.every((it) => !it.text?.trim())) ||
          (b.type === "list" && b.items?.every((it) => !it?.trim())) ||
          ((b.type === "image" || b.type === "audio") && !b.uri),
      ),
    [title, blocks],
  );

  // ── Actions ───────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (isEmpty) {
      Alert.alert("Empty Entry", "Add some content before saving.");
      return;
    }

    let savedId: string;
    if (entry) {
      editEntry(entry.id, { title, blocks, mood, tags });
      savedId = entry.id;
    } else {
      // addEntry doesn't return the id; read it from the store after
      addEntry({ title, blocks, mood, tags });
      savedId = useJournalStore.getState().entries[0]?.id ?? "";
    }
    savedEntryIdRef.current = savedId;
    setUnsavedChanges(false);

    if (isPro) {
      // hasAudio: backend only consumes tokens when a MinIO URL is present
      const hasAudio = blocks.some(
        (b) => b.type === "audio" && !!(b as any).url,
      );

      // Frontend hint only — real enforcement is on the backend (HTTP 429)
      if (!canRequestInsight(hasAudio)) {
        setInsightIsLimit(true);
        setInsightError(
          `You've reached your daily limit of ${DAILY_AUDIO_INSIGHT_LIMIT} AI insights for entries with audio. Resets at midnight.`,
        );
        setShowInsight(true);
        return;
      }

      setInsight(null);
      setInsightError(null);
      setInsightIsLimit(false);
      setInsightLoading(true);
      setShowInsight(true);
      try {
        const res = await aiApi.getJournalInsight({
          entryId: savedId,
          title,
          mood: mood ?? null,
          tags: tags as string[],
          blocks: blocks as object[],
        });
        const data = res.data;
        recordInsight(hasAudio);
        setInsight(data);
        saveInsight(savedId, {
          summary: data.summary,
          followUpQuestion: data.followUpQuestion,
          moodScore: data.moodScore,
          themes: data.themes,
        });
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 429) {
          setInsightIsLimit(true);
          setInsightError(
            err?.response?.data ||
              "You've reached your daily limit for audio AI insights. Resets at midnight.",
          );
        } else {
          setInsightError("Couldn't fetch insight right now. Try again later.");
        }
      } finally {
        setInsightLoading(false);
      }
    } else {
      router.back();
    }
  }, [
    isEmpty,
    entry,
    title,
    blocks,
    mood,
    tags,
    editEntry,
    addEntry,
    isPro,
    canRequestInsight,
    recordInsight,
    saveInsight,
    router,
  ]);

  const handleBack = useCallback(() => {
    if (unsavedChanges) {
      Alert.alert("Unsaved Changes", "Save before leaving?", [
        { text: "Discard", style: "destructive", onPress: () => router.back() },
        { text: "Cancel", style: "cancel" },
        { text: "Save", onPress: handleSave },
      ]);
    } else {
      router.back();
    }
  }, [unsavedChanges, handleSave, router]);

  const handleAddBlock = useCallback(async (type: JournalBlock["type"]) => {
    setShowAddMenu(false);
    if (type === "image") {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]?.uri) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setBlocks((p) => [...p, { type: "image", uri: result.assets[0].uri }]);
      }
      return;
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setBlocks((p) => [...p, createEmptyBlock(type)]);
  }, []);

  const handleRemoveBlock = useCallback(
    (idx: number) => {
      Alert.alert("Delete Block", "Remove this block?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            LayoutAnimation.configureNext(
              LayoutAnimation.Presets.easeInEaseOut,
            );
            setBlocks((p) => p.filter((_, i) => i !== idx));
            if (recordingIdx === idx) setRecordingIdx(null);
          },
        },
      ]);
    },
    [recordingIdx],
  );

  const handleUpdateBlock = useCallback((idx: number, block: JournalBlock) => {
    setBlocks((p) => p.map((b, i) => (i === idx ? block : b)));
  }, []);

  const handleReorder = useCallback((from: number, to: number) => {
    if (from === to) return;
    setBlocks((p) => {
      const next = [...p];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }, []);

  // ── Block renderers ───────────────────────────────────────
  const renderBlock = (block: JournalBlock, idx: number) => {
    switch (block.type) {
      case "text":
        return (
          <View
            style={[
              es.blockCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <TextInput
              style={[es.textBlockInput, { color: colors.textPrimary }]}
              placeholder="Start writing..."
              placeholderTextColor={colors.textSecondary}
              value={block.content}
              onChangeText={(t) =>
                handleUpdateBlock(idx, { ...block, content: t })
              }
              multiline
              textAlignVertical="top"
            />
          </View>
        );

      case "checkbox":
        return (
          <View
            style={[
              es.blockCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <TextInput
              style={[
                es.checklistTitle,
                { color: colors.textPrimary, borderBottomColor: colors.border },
              ]}
              placeholder="Checklist title (optional)"
              placeholderTextColor={colors.textSecondary}
              value={block.title || ""}
              onChangeText={(t) =>
                handleUpdateBlock(idx, { ...block, title: t })
              }
            />
            {block.items.map((item, i) => (
              <View key={i} style={es.checkRow}>
                <TouchableOpacity
                  style={[
                    es.checkbox,
                    item.checked
                      ? {
                          backgroundColor: colors.accent,
                          borderColor: colors.accent,
                        }
                      : {
                          backgroundColor: "transparent",
                          borderColor: colors.border,
                        },
                  ]}
                  onPress={() => {
                    const newItems = block.items.map((it, j) =>
                      j === i ? { ...it, checked: !it.checked } : it,
                    );
                    handleUpdateBlock(idx, { ...block, items: newItems });
                  }}
                >
                  {item.checked && (
                    <Ionicons name="checkmark" size={13} color="#fff" />
                  )}
                </TouchableOpacity>
                <TextInput
                  style={[
                    es.checkInput,
                    {
                      color: item.checked
                        ? colors.textSecondary
                        : colors.textPrimary,
                    },
                    item.checked && { textDecorationLine: "line-through" },
                  ]}
                  placeholder="Add item..."
                  placeholderTextColor={colors.textSecondary}
                  value={item.text}
                  onChangeText={(t) => {
                    const newItems = block.items.map((it, j) =>
                      j === i ? { ...it, text: t } : it,
                    );
                    handleUpdateBlock(idx, { ...block, items: newItems });
                  }}
                />
                {block.items.length > 1 && (
                  <TouchableOpacity
                    hitSlop={8}
                    onPress={() => {
                      const newItems = block.items.filter((_, j) => j !== i);
                      handleUpdateBlock(idx, { ...block, items: newItems });
                    }}
                  >
                    <Ionicons
                      name="close"
                      size={16}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                )}
              </View>
            ))}
            <TouchableOpacity
              style={es.addItemBtn}
              onPress={() =>
                handleUpdateBlock(idx, {
                  ...block,
                  items: [...block.items, { text: "", checked: false }],
                })
              }
            >
              <Ionicons name="add" size={16} color={colors.accent} />
              <Text
                style={[
                  es.addItemText,
                  { color: colors.accent, fontFamily: "SoraSemiBold" },
                ]}
              >
                Add item
              </Text>
            </TouchableOpacity>
          </View>
        );

      case "list":
        return (
          <View
            style={[
              es.blockCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[es.blockTypeLabel, { color: colors.textSecondary }]}>
              List
            </Text>
            {block.items.map((item, i) => (
              <View key={i} style={es.listRow}>
                <View
                  style={[es.listDot, { backgroundColor: colors.accent }]}
                />
                <TextInput
                  style={[es.listInput, { color: colors.textPrimary }]}
                  placeholder="Add item..."
                  placeholderTextColor={colors.textSecondary}
                  value={item}
                  onChangeText={(t) => {
                    const newItems = block.items.map((it, j) =>
                      j === i ? t : it,
                    );
                    handleUpdateBlock(idx, { ...block, items: newItems });
                  }}
                />
                {block.items.length > 1 && (
                  <TouchableOpacity
                    hitSlop={8}
                    onPress={() => {
                      const newItems = block.items.filter((_, j) => j !== i);
                      handleUpdateBlock(idx, { ...block, items: newItems });
                    }}
                  >
                    <Ionicons
                      name="close"
                      size={16}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                )}
              </View>
            ))}
            <TouchableOpacity
              style={es.addItemBtn}
              onPress={() =>
                handleUpdateBlock(idx, {
                  ...block,
                  items: [...block.items, ""],
                })
              }
            >
              <Ionicons name="add" size={16} color={colors.accent} />
              <Text
                style={[
                  es.addItemText,
                  { color: colors.accent, fontFamily: "SoraSemiBold" },
                ]}
              >
                Add item
              </Text>
            </TouchableOpacity>
          </View>
        );

      case "image":
        return (
          <View
            style={[
              es.blockCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            {block.uri ? (
              <Image
                source={{ uri: block.uri }}
                style={es.imageBlock}
                resizeMode="cover"
              />
            ) : (
              <View
                style={[
                  es.imagePlaceholder,
                  { backgroundColor: colors.surfaceMuted },
                ]}
              >
                <Ionicons
                  name="image-outline"
                  size={32}
                  color={colors.textSecondary}
                />
                <Text
                  style={[
                    es.imagePlaceholderText,
                    { color: colors.textSecondary, fontFamily: "Sora" },
                  ]}
                >
                  No image selected
                </Text>
              </View>
            )}
          </View>
        );

      case "audio":
        return (
          <AudioBlock
            block={block}
            idx={idx}
            onUpdate={(b) => handleUpdateBlock(idx, b)}
            isRecording={recordingIdx === idx}
            setRecordingIdx={setRecordingIdx}
          />
        );

      default:
        return (
          <View
            style={[
              es.blockCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={{ color: colors.textSecondary, fontFamily: "Sora" }}>
              Unknown block type
            </Text>
          </View>
        );
    }
  };

  const entryDate = entry?.date || new Date().toISOString().slice(0, 10);
  const formattedDate = format(parseISO(entryDate), "d MMMM yyyy");
  const saveEnabled = !isEmpty && unsavedChanges;

  return (
    <>
      <View style={[es.screen, { backgroundColor: colors.background }]}>
        {/* ── Header ── */}
        <View
          style={[
            es.header,
            { paddingTop: insets.top + 12, borderBottomColor: colors.border },
          ]}
        >
          <TouchableOpacity
            onPress={handleBack}
            style={es.headerBtn}
            hitSlop={8}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
          <View style={es.headerCenter}>
            <Text style={[es.headerDate, { color: colors.textPrimary }]}>
              {formattedDate}
            </Text>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              {wordCount > 0 && (
                <Text style={[es.unsavedText, { color: colors.textSecondary }]}>
                  {wordCount} {wordCount === 1 ? "word" : "words"}
                </Text>
              )}
              {unsavedChanges && (
                <Text style={[es.unsavedText, { color: colors.textSecondary }]}>
                  · Unsaved
                </Text>
              )}
            </View>
          </View>
          <TouchableOpacity
            onPress={handleSave}
            style={es.headerBtn}
            disabled={!saveEnabled}
            hitSlop={8}
          >
            <Text
              style={[
                es.saveText,
                { color: saveEnabled ? colors.accent : colors.border },
              ]}
            >
              Save
            </Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 20}
        >
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={[
              es.scrollContent,
              { paddingBottom: insets.bottom + 160 },
            ]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            showsVerticalScrollIndicator={false}
          >
            {/* ── Title ── */}
            <TextInput
              style={[
                es.titleInput,
                { color: colors.textPrimary, borderBottomColor: colors.border },
              ]}
              placeholder="Entry title..."
              placeholderTextColor={colors.textSecondary}
              value={title}
              onChangeText={setTitle}
            />

            {/* ── Mood picker ── */}
            <View style={es.moodRow}>
              {([1, 2, 3, 4, 5] as JournalMood[]).map((v, i) => {
                const emojis = ["😩", "😕", "😐", "🙂", "🔥"];
                const selected = mood === v;
                return (
                  <TouchableOpacity
                    key={v}
                    onPress={() => setMood((p) => (p === v ? undefined : v))}
                    style={[
                      es.moodBtn,
                      selected
                        ? {
                            backgroundColor: colors.accentMuted,
                            borderColor: colors.accent,
                          }
                        : {
                            backgroundColor: colors.surfaceMuted,
                            borderColor: "transparent",
                          },
                    ]}
                    activeOpacity={0.75}
                  >
                    <Text style={es.moodEmoji}>{emojis[i]}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* ── Tags ── */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={es.tagsScroll}
              contentContainerStyle={es.tagsContent}
            >
              {JOURNAL_TAGS.map((tag) => {
                const selected = tags.includes(tag);
                return (
                  <TouchableOpacity
                    key={tag}
                    onPress={() =>
                      setTags((p) =>
                        p.includes(tag)
                          ? p.filter((t) => t !== tag)
                          : [...p, tag],
                      )
                    }
                    style={[
                      es.tagChip,
                      selected
                        ? {
                            backgroundColor: colors.accentMuted,
                            borderColor: colors.accent,
                          }
                        : {
                            backgroundColor: colors.surfaceMuted,
                            borderColor: colors.border,
                          },
                    ]}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        es.tagChipText,
                        {
                          color: selected
                            ? colors.accent
                            : colors.textSecondary,
                        },
                      ]}
                    >
                      #{tag}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* ── AI Reflect banner (shown when insight is saved) ── */}
            {entry?.insight?.followUpQuestion ? (
              <View
                style={[
                  es.reflectBanner,
                  {
                    backgroundColor: colors.accentMuted,
                    borderColor: colors.accent + "40",
                  },
                ]}
              >
                <View style={es.reflectHeader}>
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={14}
                    color={colors.accent}
                  />
                  <Text style={[es.reflectLabel, { color: colors.accent }]}>
                    Reflect on this
                  </Text>
                </View>
                <Text style={[es.reflectText, { color: colors.textPrimary }]}>
                  {entry.insight.followUpQuestion}
                </Text>
              </View>
            ) : null}

            {/* ── Blocks ── */}
            <View style={{ paddingHorizontal: 16 }}>
              {blocks.map((block, idx) => (
                <DraggableBlock
                  key={idx}
                  index={idx}
                  onReorder={handleReorder}
                  isDragging={isDragging}
                  onDragStart={() => setIsDragging(true)}
                  onDragEnd={() => setIsDragging(false)}
                  blockHeight={200}
                  onDelete={() => handleRemoveBlock(idx)}
                  canDelete={blocks.length > 1}
                >
                  <View style={{ marginHorizontal: 0 }}>
                    {renderBlock(block, idx)}
                  </View>
                </DraggableBlock>
              ))}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* ── FAB + Add block menu ── */}
        <View style={es.fabContainer} pointerEvents="box-none">
          <AddBlockMenu
            visible={showAddMenu}
            onAdd={handleAddBlock}
            menuAnimation={menuAnimation}
          />
          <TouchableOpacity
            style={[es.fab, { backgroundColor: colors.accent }]}
            onPress={() => setShowAddMenu((p) => !p)}
            activeOpacity={0.85}
          >
            <Animated.View
              style={{
                transform: [
                  {
                    rotate: menuAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0deg", "45deg"],
                    }),
                  },
                ],
              }}
            >
              <Ionicons name="add" size={28} color="#fff" />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── AI Insight modal (Pro only) ── */}
      <JournalInsightModal
        isVisible={showInsight}
        loading={insightLoading}
        insight={insight}
        error={insightError}
        isLimitError={insightIsLimit}
        onDismiss={() => {
          setShowInsight(false);
          router.back();
        }}
      />
    </>
  );
}

// ─── Styles ─────────────────────────────────────────────────

const es = StyleSheet.create({
  screen: { flex: 1 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerBtn: {
    width: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  headerCenter: { flex: 1, alignItems: "center" },
  headerDate: { fontSize: 16, fontFamily: "SoraSemiBold", letterSpacing: -0.2 },
  unsavedText: { fontSize: 11, fontFamily: "Sora", marginTop: 2 },
  saveText: { fontSize: 15, fontFamily: "SoraSemiBold" },

  // Scroll content
  scrollContent: { paddingTop: 8 },

  // Title input
  titleInput: {
    fontSize: 22,
    fontFamily: "SoraBold",
    marginHorizontal: 20,
    marginBottom: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    letterSpacing: -0.3,
  },

  // Mood picker
  moodRow: {
    flexDirection: "row",
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  moodBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  moodEmoji: { fontSize: 20 },

  // Tags
  tagsScroll: { marginBottom: 16 },
  tagsContent: { paddingHorizontal: 20, gap: 8 },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  tagChipText: { fontSize: 12, fontFamily: "SoraSemiBold" },

  // Reflect banner
  reflectBanner: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  reflectHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  reflectLabel: {
    fontSize: 11,
    fontFamily: "SoraBold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  reflectText: {
    fontSize: 15,
    fontFamily: "SoraMedium",
    lineHeight: 23,
    fontStyle: "italic",
  },

  // Block card (base for all block types)
  blockCard: {
    borderRadius: 0,
    borderWidth: 0,
    padding: 16,
    overflow: "hidden",
  },

  // Text block
  textBlockInput: {
    fontSize: 15,
    fontFamily: "Sora",
    lineHeight: 24,
    minHeight: 80,
    textAlignVertical: "top",
  },

  // Checkbox block
  checklistTitle: {
    fontSize: 14,
    fontFamily: "SoraSemiBold",
    paddingBottom: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  checkInput: { flex: 1, fontSize: 14, fontFamily: "Sora" },

  // List block
  blockTypeLabel: {
    fontSize: 10,
    fontFamily: "SoraSemiBold",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },
  listDot: { width: 6, height: 6, borderRadius: 3 },
  listInput: { flex: 1, fontSize: 14, fontFamily: "Sora" },

  // Shared "add item" row
  addItemBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  addItemText: { fontSize: 13 },

  // Image block
  imageBlock: { width: "100%", aspectRatio: 16 / 9, borderRadius: 10 },
  imagePlaceholder: {
    width: "100%",
    height: 140,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  imagePlaceholderText: { fontSize: 13 },

  // Audio block
  audioTitleInput: {
    fontSize: 14,
    fontFamily: "SoraSemiBold",
    paddingBottom: 10,
    marginBottom: 12,
    borderBottomWidth: 1,
  },
  audioPlaybackRow: { flexDirection: "row", alignItems: "center" },
  audioRecordingName: { fontSize: 12, fontFamily: "Sora", marginBottom: 8 },
  progressTrack: {
    height: 4,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressFill: { height: 4, borderRadius: 4 },
  progressTimes: { flexDirection: "row", justifyContent: "space-between" },
  audioTimeText: { fontSize: 11, fontFamily: "Sora" },
  audioControls: { flexDirection: "row", gap: 8 },
  audioBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  recordingContainer: { alignItems: "center", paddingVertical: 8, gap: 16 },
  recordingIndicator: { flexDirection: "row", alignItems: "center", gap: 12 },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E05A5A",
  },
  recordingTimer: { fontSize: 20, letterSpacing: 1 },
  waveContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    gap: 3,
  },
  waveBar: { width: 3, height: 32, borderRadius: 3 },
  stopBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 12 },
  stopBtnText: { fontSize: 14 },

  recordIdle: { alignItems: "center", paddingVertical: 12, gap: 8 },
  micBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  micHint: { fontSize: 12 },

  // Add block menu
  addMenu: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 12,
    minWidth: 180,
  },
  addMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  addMenuIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  addMenuLabel: { fontSize: 14 },

  // FAB
  fabContainer: {
    position: "absolute",
    bottom: 28,
    right: 20,
    alignItems: "flex-end",
    zIndex: 50,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});
