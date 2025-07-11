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
  Animated as RNAnimated,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { JournalBlock, useJournalStore } from "../../store/journalStore";

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

function AudioBlock({
  block,
  idx,
  onUpdate,
  isRecording,
  setRecordingIdx,
}: {
  block: JournalBlock;
  idx: number;
  onUpdate: (block: JournalBlock) => void;
  isRecording: boolean;
  setRecordingIdx: (idx: number | null) => void;
}) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioTitle, setAudioTitle] = useState((block as any).title || "");

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRecording) {
      // Start pulse animation
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();

      // Start wave animation
      const waveLoop = Animated.loop(
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      );
      waveLoop.start();

      // Start recording timer
      recordingTimer.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      return () => {
        pulseLoop.stop();
        waveLoop.stop();
        if (recordingTimer.current) {
          clearInterval(recordingTimer.current);
        }
      };
    }
  }, [isRecording]);

  useEffect(() => {
    return () => {
      // Cleanup function
      if (sound) {
        sound.unloadAsync();
      }
      if (recording) {
        try {
          recording.stopAndUnloadAsync();
        } catch (error) {
          console.log("Cleanup: Recording already stopped or invalid");
        }
      }
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
    };
  }, [sound, recording]);

  if (block.type !== "audio") return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStop = async () => {
    if (!recording) {
      console.log("No active recording found");
      setRecordingIdx(null);
      return;
    }

    // Start cleanup immediately to improve perceived performance
    if (recordingTimer.current) {
      clearInterval(recordingTimer.current);
      recordingTimer.current = null;
    }

    // Update UI state immediately
    setRecordingIdx(null);
    const finalRecordingTime = recordingTime;
    setRecordingTime(0);

    try {
      let recordingUri = null;

      // Get recording status and URI
      try {
        const status = await recording.getStatusAsync();
        if (status.isRecording) {
          await recording.stopAndUnloadAsync();
        }
        recordingUri = recording.getURI();
      } catch (error) {
        console.error("Error stopping recording:", error);
        // Try to get URI even if stop failed
        recordingUri = recording.getURI();
      }

      if (recordingUri) {
        onUpdate({
          type: "audio",
          uri: recordingUri,
          duration: finalRecordingTime,
          title: audioTitle || `Recording ${new Date().toLocaleTimeString()}`,
        });
      } else {
        throw new Error("No recording URI available");
      }
    } catch (error) {
      console.error("Failed to save recording", error);
      Alert.alert(
        "Recording Error",
        "There was an issue saving the recording. Please try again."
      );
    } finally {
      // Cleanup recording object
      setRecording(null);
    }
  };

  const handleRecord = async () => {
    // Prevent multiple recordings
    if (isRecording || recording) {
      console.log("Recording already in progress");
      return;
    }

    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant microphone permission to record audio."
        );
        return;
      }

      // Ensure audio mode is set correctly
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });

      // Create and prepare recording
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        (status) => {
          if (status.isRecording) {
            setRecordingTime(
              status.durationMillis
                ? Math.floor(status.durationMillis / 1000)
                : 0
            );
          }
        },
        100
      );

      setRecording(newRecording);
      setRecordingIdx(idx);
      setRecordingTime(0);
    } catch (err) {
      console.error("Failed to start recording", err);
      Alert.alert(
        "Recording Error",
        "Failed to start recording. Please try again."
      );
      // Clean up any partial recording state
      setRecording(null);
      setRecordingIdx(null);
      setRecordingTime(0);
    }
  };

  const handlePlayPause = async () => {
    if (!sound && (block as any).uri) {
      try {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: (block as any).uri },
          { shouldPlay: true }
        );
        setSound(newSound);
        setIsPlaying(true);

        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            setPlaybackPosition(
              status.positionMillis ? status.positionMillis / 1000 : 0
            );
            setDuration(
              status.durationMillis ? status.durationMillis / 1000 : 0
            );
            if (status.didJustFinish) {
              setIsPlaying(false);
              setPlaybackPosition(0);
            }
          }
        });
      } catch (error) {
        console.error("Failed to play audio", error);
        Alert.alert("Error", "Failed to play audio");
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

  const handleDelete = async () => {
    Alert.alert(
      "Delete Recording",
      "Are you sure you want to delete this recording?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (sound) {
              await sound.unloadAsync();
            }
            onUpdate({ type: "audio", uri: "", duration: 0, title: "" });
          },
        },
      ]
    );
  };

  return (
    <View className="mb-6 mx-2">
      <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-100 dark:border-gray-700">
        {/* Audio Title Input */}
        <TextInput
          className="text-base font-medium text-gray-800 dark:text-gray-200 mb-3 px-2 py-1 border-b border-gray-200 dark:border-gray-600"
          placeholder="Recording title (optional)"
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
          // Playback UI
          <View className="space-y-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-4">
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {(block as any).title || "Recording"}
                </Text>
                <View className="bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                  <View
                    className="bg-blue-500 h-1.5 rounded-full"
                    style={{
                      width: `${duration > 0 ? (playbackPosition / duration) * 100 : 0}%`,
                    }}
                  />
                </View>
                <View className="flex-row justify-between mt-1">
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTime(Math.floor(playbackPosition))}
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTime(
                      Math.floor(duration || (block as any).duration || 0)
                    )}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center gap-2">
                <TouchableOpacity
                  className="w-10 h-10 rounded-full bg-blue-500/10 items-center justify-center"
                  onPress={handlePlayPause}
                >
                  <Ionicons
                    name={isPlaying ? "pause" : "play"}
                    size={20}
                    color="#3B82F6"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  className="w-10 h-10 rounded-full bg-red-500/10 items-center justify-center"
                  onPress={handleDelete}
                >
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : isRecording ? (
          // Recording UI - More minimal and modern
          <View className="items-center py-2">
            {/* Recording indicator and timer */}
            <View className="flex-row items-center gap-4 mb-4">
              <Animated.View
                style={{
                  transform: [{ scale: pulseAnim }],
                }}
                className="w-3 h-3 rounded-full bg-red-500"
              />
              <Text className="text-xl font-mono text-gray-700 dark:text-gray-300">
                {formatTime(recordingTime)}
              </Text>
            </View>

            {/* Waveform visualization - More subtle */}
            <View className="flex-row items-center justify-center gap-1 h-12 mb-4">
              {[...Array(8)].map((_, i) => (
                <Animated.View
                  key={i}
                  className="w-1 bg-red-400/50 dark:bg-red-500/50 rounded-full"
                  style={{
                    transform: [
                      {
                        scaleY: waveAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.2, Math.random() * 0.8 + 0.2],
                        }),
                      },
                    ],
                    height: 32,
                  }}
                />
              ))}
            </View>

            {/* Stop button - More minimal */}
            <TouchableOpacity
              className="bg-red-500/10 rounded-xl px-6 py-2.5"
              onPress={handleStop}
            >
              <Text className="text-red-500 font-medium">Stop Recording</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Initial state - More minimal
          <View className="items-center py-6">
            <TouchableOpacity
              className="w-14 h-14 bg-blue-500/10 rounded-full items-center justify-center mb-3"
              onPress={handleRecord}
            >
              <Ionicons name="mic-outline" size={24} color="#3B82F6" />
            </TouchableOpacity>
            <Text className="text-gray-500 dark:text-gray-400 text-sm">
              Tap to record
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

// Floating Add Block Menu as a memoized component
const AddBlockMenu = React.memo(function AddBlockMenu({
  visible,
  onAdd,
  menuAnimation,
}: {
  visible: boolean;
  onAdd: (type: JournalBlock["type"]) => void;
  menuAnimation: Animated.Value;
}) {
  const menuItems = [
    {
      type: "text",
      icon: <Ionicons name="document-text-outline" size={20} color="#3B82F6" />,
      label: "Text",
    },
    {
      type: "checkbox",
      icon: <Ionicons name="checkbox-outline" size={20} color="#10B981" />,
      label: "Checklist",
    },
    {
      type: "list",
      icon: <Ionicons name="list-outline" size={20} color="#F59E0B" />,
      label: "List",
    },
    {
      type: "image",
      icon: <Ionicons name="image-outline" size={20} color="#8B5CF6" />,
      label: "Image",
    },
    {
      type: "audio",
      icon: <Ionicons name="mic-outline" size={20} color="#EF4444" />,
      label: "Recording",
    },
  ];
  return (
    <Animated.View
      style={{
        opacity: menuAnimation,
        transform: [
          {
            translateY: menuAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            }),
          },
        ],
      }}
      className="mb-4"
    >
      {visible && (
        <View className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden min-w-[180px]">
          {menuItems.map((item, i) => (
            <TouchableOpacity
              key={item.type}
              onPress={() => onAdd(item.type as JournalBlock["type"])}
              className="flex-row items-center p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0 gap-3"
            >
              <View className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center mr-2">
                {item.icon}
              </View>
              <Text className="text-gray-800 dark:text-gray-200 font-medium">
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </Animated.View>
  );
});

export default function JournalEditor() {
  const scrollRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const entries = useJournalStore((s) => s.entries);
  const addEntry = useJournalStore((s) => s.addEntry);
  const editEntry = useJournalStore((s) => s.editEntry);

  const entry = useMemo(() => entries.find((e) => e.id === id), [entries, id]);

  const [title, setTitle] = useState(entry?.title || "");
  const [blocks, setBlocks] = useState<JournalBlock[]>(
    entry?.blocks?.length ? entry.blocks : [{ type: "text", content: "" }]
  );
  const [recordingIdx, setRecordingIdx] = useState<number | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const menuAnimation = useRef(new Animated.Value(0)).current;

  // Add this useEffect to properly track unsaved changes
  useEffect(() => {
    if (!entry) {
      // For new entries, only mark as unsaved if there's actual content
      const hasContent =
        title.trim() !== "" ||
        blocks.some((block) => {
          switch (block.type) {
            case "text":
              return block.content?.trim() !== "";
            case "checkbox":
              return block.items?.some(
                (item) => item.text?.trim() !== "" || item.checked
              );
            case "list":
              return block.items?.some((item) => item?.trim() !== "");
            case "image":
              return block.uri !== "";
            case "audio":
              return block.uri !== "";
            default:
              return false;
          }
        });
      setUnsavedChanges(hasContent);
    } else {
      // For existing entries, compare with original content
      const contentChanged =
        title !== entry.title ||
        blocks.length !== entry.blocks.length ||
        JSON.stringify(blocks) !== JSON.stringify(entry.blocks);
      setUnsavedChanges(contentChanged);
    }
  }, [title, blocks, entry]);

  useEffect(() => {
    Animated.timing(menuAnimation, {
      toValue: showAddMenu ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [showAddMenu]);

  // Memoize handlers for performance
  const handleAddBlock = useCallback(async (type: JournalBlock["type"]) => {
    setShowAddMenu(false);
    if (type === "image") {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setBlocks((prev) => [
          ...prev,
          { type: "image", uri: result.assets[0].uri },
        ]);
      }
      return;
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setBlocks((prev) => [...prev, createEmptyBlock(type)]);
  }, []);

  const handleShowAddMenu = useCallback(() => {
    setShowAddMenu((prev) => !prev);
  }, []);

  const handleRemoveBlock = (idx: number) => {
    Alert.alert("Delete Block", "Are you sure you want to delete this block?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setBlocks(blocks.filter((_, i) => i !== idx));
          if (recordingIdx === idx) setRecordingIdx(null);
        },
      },
    ]);
  };

  const handleUpdateBlock = (idx: number, block: JournalBlock) => {
    setBlocks(blocks.map((b, i) => (i === idx ? block : b)));
  };

  const handleSave = () => {
    if (
      !title.trim() &&
      blocks.every(
        (b) =>
          (b.type === "text" && !b.content?.trim()) ||
          (b.type === "checkbox" &&
            b.items?.every((item) => !item.text?.trim())) ||
          (b.type === "list" && b.items?.every((item) => !item?.trim())) ||
          (b.type === "image" && !b.uri) ||
          (b.type === "audio" && !b.uri)
      )
    ) {
      Alert.alert("Empty Entry", "Please add some content before saving.");
      return;
    }

    if (entry) {
      editEntry(entry.id, { title, blocks });
    } else {
      addEntry({ title, blocks });
    }
    setUnsavedChanges(false);
    router.back();
  };

  const handleBack = () => {
    if (unsavedChanges) {
      Alert.alert(
        "Unsaved Changes",
        "You have unsaved changes. Do you want to save before leaving?",
        [
          {
            text: "Don't Save",
            style: "destructive",
            onPress: () => router.back(),
          },
          { text: "Cancel", style: "cancel" },
          { text: "Save", onPress: handleSave },
        ]
      );
    } else {
      router.back();
    }
  };

  const renderBlock = (block: JournalBlock, idx: number) => {
    const blockContainer =
      "bg-white dark:bg-gray-800 rounded-2xl p-4 mb-4 shadow-sm border border-gray-100 dark:border-gray-700";

    switch (block.type) {
      case "text":
        return (
          <View key={idx} className={blockContainer}>
            <TextInput
              className="text-base text-gray-800 dark:text-gray-200 leading-6"
              placeholder="Start writing..."
              placeholderTextColor="#9CA3AF"
              value={block.content}
              onChangeText={(text) =>
                handleUpdateBlock(idx, { ...block, content: text })
              }
              onFocus={() => {
                setTimeout(() => {
                  scrollRef.current?.scrollTo({
                    y: idx * 200, // Approximate height of each block
                    animated: true,
                  });
                }, 100);
              }}
              multiline
              textAlignVertical="top"
              style={{ minHeight: 60 }}
            />
          </View>
        );

      case "checkbox":
        return (
          <View key={idx} className={blockContainer}>
            <TextInput
              className="text-base font-medium text-gray-800 dark:text-gray-200 mb-3 px-2 py-1 border-b border-gray-200 dark:border-gray-600"
              placeholder="Checklist title (optional)"
              placeholderTextColor="#9CA3AF"
              value={block.title || ""}
              onChangeText={(text) =>
                handleUpdateBlock(idx, { ...block, title: text })
              }
              onFocus={() => {
                setTimeout(() => {
                  scrollRef.current?.scrollTo({
                    y: idx * 200,
                    animated: true,
                  });
                }, 100);
              }}
            />
            {block.items.map((item, i) => (
              <View key={i} className="flex-row items-center mb-3">
                <TouchableOpacity
                  className={`w-6 h-6 rounded-lg border-2 mr-3 items-center justify-center ${
                    item.checked
                      ? "bg-blue-500 border-blue-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  onPress={() => {
                    const newItems = block.items.map((it, j) =>
                      j === i ? { ...it, checked: !it.checked } : it
                    );
                    handleUpdateBlock(idx, { ...block, items: newItems });
                  }}
                >
                  {item.checked && (
                    <Text className="text-white font-bold text-sm">✓</Text>
                  )}
                </TouchableOpacity>
                <TextInput
                  className="flex-1 text-base text-gray-800 dark:text-gray-200"
                  placeholder="Add item..."
                  placeholderTextColor="#9CA3AF"
                  value={item.text}
                  onChangeText={(text) => {
                    const newItems = block.items.map((it, j) =>
                      j === i ? { ...it, text } : it
                    );
                    handleUpdateBlock(idx, { ...block, items: newItems });
                  }}
                  onFocus={() => {
                    setTimeout(() => {
                      scrollRef.current?.scrollTo({
                        y: idx * 200 + i * 50, // Adjust for item position within block
                        animated: true,
                      });
                    }, 100);
                  }}
                  style={{
                    textDecorationLine: item.checked ? "line-through" : "none",
                  }}
                />
                {block.items.length > 1 && (
                  <TouchableOpacity
                    className="ml-2 p-1"
                    onPress={() => {
                      const newItems = block.items.filter((_, j) => j !== i);
                      handleUpdateBlock(idx, { ...block, items: newItems });
                    }}
                  >
                    <Text className="text-red-500 text-lg">×</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
            <TouchableOpacity
              className="flex-row items-center mt-2"
              onPress={() =>
                handleUpdateBlock(idx, {
                  ...block,
                  items: [...block.items, { text: "", checked: false }],
                })
              }
            >
              <Text className="text-blue-500 text-lg mr-2">+</Text>
              <Text className="text-blue-500 font-medium">Add item</Text>
            </TouchableOpacity>
          </View>
        );

      case "list":
        return (
          <View key={idx} className={blockContainer}>
            <Text className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
              List
            </Text>
            {block.items.map((item, i) => (
              <View key={i} className="flex-row items-center mb-3">
                <View className="w-2 h-2 rounded-full bg-gray-400 mr-3 mt-2" />
                <TextInput
                  className="flex-1 text-base text-gray-800 dark:text-gray-200"
                  placeholder="Add item..."
                  placeholderTextColor="#9CA3AF"
                  value={item}
                  onChangeText={(text) => {
                    const newItems = block.items.map((it, j) =>
                      j === i ? text : it
                    );
                    handleUpdateBlock(idx, { ...block, items: newItems });
                  }}
                />
                {block.items.length > 1 && (
                  <TouchableOpacity
                    className="ml-2 p-1"
                    onPress={() => {
                      const newItems = block.items.filter((_, j) => j !== i);
                      handleUpdateBlock(idx, { ...block, items: newItems });
                    }}
                  >
                    <Text className="text-red-500 text-lg">×</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
            <TouchableOpacity
              className="flex-row items-center mt-2"
              onPress={() =>
                handleUpdateBlock(idx, {
                  ...block,
                  items: [...block.items, ""],
                })
              }
            >
              <Text className="text-blue-500 text-lg mr-2">+</Text>
              <Text className="text-blue-500 font-medium">Add item</Text>
            </TouchableOpacity>
          </View>
        );

      case "image":
        return (
          <View key={idx} className={blockContainer}>
            {block.uri ? (
              <Image
                source={{ uri: block.uri }}
                className="w-full rounded-xl"
                style={{ aspectRatio: 16 / 9 }}
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-xl items-center justify-center">
                <Text className="text-gray-500 dark:text-gray-400 text-lg">
                  📷
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 mt-2">
                  No image selected
                </Text>
              </View>
            )}
          </View>
        );

      case "audio":
        return (
          <AudioBlock
            key={idx}
            block={block}
            idx={idx}
            onUpdate={(b) => handleUpdateBlock(idx, b)}
            isRecording={recordingIdx === idx}
            setRecordingIdx={setRecordingIdx}
          />
        );

      default:
        return (
          <View key={idx} className={blockContainer}>
            <Text className="text-gray-500 dark:text-gray-400">
              Unknown block type
            </Text>
          </View>
        );
    }
  };

  // Get the date for the header (use entry.date if available, else today)
  const entryDate = entry?.date || new Date().toISOString().slice(0, 10);
  const formattedDate = format(parseISO(entryDate), "d MMMM yyyy");

  // Animated value for unsaved changes indicator
  const unsavedAnim = useRef(new RNAnimated.Value(0)).current;

  // Determine if Save should be enabled
  const isEmpty = useMemo(() => {
    return (
      !title.trim() &&
      blocks.every(
        (b) =>
          (b.type === "text" && !b.content?.trim()) ||
          (b.type === "checkbox" &&
            b.items?.every((item) => !item.text?.trim())) ||
          (b.type === "list" && b.items?.every((item) => !item?.trim())) ||
          (b.type === "image" && !b.uri) ||
          (b.type === "audio" && !b.uri)
      )
    );
  }, [title, blocks]);

  // Animate unsaved changes indicator
  useEffect(() => {
    if (unsavedChanges) {
      RNAnimated.timing(unsavedAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    } else {
      RNAnimated.timing(unsavedAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [unsavedChanges]);

  // Interpolate for vertical movement
  const dateTranslateY = unsavedAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -12],
  });
  const unsavedOpacity = unsavedAnim;

  return (
    <View className="flex-1 bg-primary dark:bg-gray-900">
      {/* Minimal Header with animated unsaved changes */}
      <View className="flex-row items-center px-4 pt-12 pb-4">
        <TouchableOpacity onPress={handleBack} className="p-2">
          <Ionicons name="chevron-back" size={28} color="#222" />
        </TouchableOpacity>
        <View className="flex-1 items-center justify-center">
          <RNAnimated.View
            style={{ transform: [{ translateY: dateTranslateY }] }}
          >
            <Text className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {formattedDate}
            </Text>
          </RNAnimated.View>
          <RNAnimated.View
            style={{
              opacity: unsavedOpacity,
              height: unsavedAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 18],
              }),
            }}
          >
            {unsavedChanges && (
              <Text className="text-xs text-orange-500 mt-1 font-SoraSemiBold">
                Unsaved changes
              </Text>
            )}
          </RNAnimated.View>
        </View>
        <TouchableOpacity
          onPress={handleSave}
          className="p-2"
          disabled={isEmpty || !unsavedChanges}
          style={{ opacity: isEmpty || !unsavedChanges ? 0.4 : 1 }}
        >
          <Text className="text-blue-600 font-bold text-lg">Save</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        className="flex-1 mx-4"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 20}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ paddingBottom: insets.bottom + 200 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          {/* Title Input */}
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <TextInput
              className="text-2xl font-bold text-gray-800 dark:text-gray-200"
              placeholder="Enter title..."
              placeholderTextColor="#9CA3AF"
              value={title}
              onChangeText={setTitle}
              onFocus={() => {
                setTimeout(() => {
                  scrollRef.current?.scrollTo({
                    y: 0,
                    animated: true,
                  });
                }, 100);
              }}
            />
          </View>

          {/* Blocks */}
          {blocks.map((block, idx) => (
            <View key={idx} className="relative">
              {renderBlock(block, idx)}
              {blocks.length > 1 && (
                <TouchableOpacity
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full items-center justify-center shadow-md z-10"
                  onPress={() => handleRemoveBlock(idx)}
                >
                  <Text className="text-white font-bold text-sm">×</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Add Block Menu & Floating Button */}
      <View className="absolute bottom-8 right-4 items-end z-50">
        <AddBlockMenu
          visible={showAddMenu}
          onAdd={handleAddBlock}
          menuAnimation={menuAnimation}
        />
        <TouchableOpacity
          className="w-16 h-16 bg-blue-600 rounded-full items-center justify-center shadow-lg"
          onPress={handleShowAddMenu}
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
            <Ionicons name="add" size={32} color="#fff" />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
