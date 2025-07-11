import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface DraggableBlockProps {
  children: React.ReactNode;
  index: number;
  onReorder: (fromIndex: number, toIndex: number) => void;
  isDragging: boolean;
  onDragStart: (index: number) => void;
  onDragEnd: () => void;
  blockHeight: number;
  onDelete?: () => void;
  canDelete?: boolean;
}

export default function DraggableBlock({
  children,
  index,
  onReorder,
  isDragging,
  onDragStart,
  onDragEnd,
  blockHeight,
  onDelete,
  canDelete = false,
}: DraggableBlockProps) {
  const [dragActive, setDragActive] = useState(false);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const zIndex = useSharedValue(0);

  // Track drag state
  const isDragStarted = useSharedValue(false);
  const dragStartTime = useSharedValue(0);

  // Single pan gesture that handles both hold detection and dragging
  const panGesture = Gesture.Pan()
    .onBegin(() => {
      dragStartTime.value = Date.now();
      isDragStarted.value = false;
    })
    .onUpdate((event) => {
      const currentTime = Date.now();
      const holdDuration = currentTime - dragStartTime.value;

      // If we've held for 200ms OR moved more than 10px, start dragging
      const shouldStartDrag =
        holdDuration >= 200 || Math.abs(event.translationY) > 10;
      if (shouldStartDrag && !isDragStarted.value) {
        isDragStarted.value = true;
        runOnJS(setDragActive)(true);
        runOnJS(onDragStart)(index);
        runOnJS(Haptics.notificationAsync)(
          Haptics.NotificationFeedbackType.Success
        );

        zIndex.value = 1000;
        scale.value = withSpring(1.04);
        opacity.value = withSpring(0.92);
      }

      // Only update translation if dragging has started
      if (isDragStarted.value) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (isDragStarted.value) {
        const targetIndex =
          Math.round(event.translationY / blockHeight) + index;
        const clampedIndex = Math.max(0, Math.min(targetIndex, 999));

        if (clampedIndex !== index) {
          runOnJS(onReorder)(index, clampedIndex);
          runOnJS(Haptics.notificationAsync)(
            Haptics.NotificationFeedbackType.Success
          );
        } else {
          runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        }

        translateY.value = withSpring(0);
        scale.value = withSpring(1);
        opacity.value = withSpring(1);
        zIndex.value = 0;
        runOnJS(onDragEnd)();
        runOnJS(setDragActive)(false);
      }

      // Reset drag state
      isDragStarted.value = false;
      dragStartTime.value = 0;
    })
    .onFinalize(() => {
      // Cleanup if gesture is cancelled
      if (isDragStarted.value) {
        translateY.value = withSpring(0);
        scale.value = withSpring(1);
        opacity.value = withSpring(1);
        zIndex.value = 0;
        runOnJS(onDragEnd)();
        runOnJS(setDragActive)(false);
      }
      isDragStarted.value = false;
      dragStartTime.value = 0;
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }, { scale: scale.value }],
      opacity: opacity.value,
      zIndex: zIndex.value,
    };
  });

  const shadowStyle = useAnimatedStyle(() => {
    const shadowOpacity = interpolate(
      scale.value,
      [1, 1.04],
      [0.1, 0.25],
      Extrapolate.CLAMP
    );
    return {
      shadowOpacity,
      shadowRadius: interpolate(
        scale.value,
        [1, 1.04],
        [2, 8],
        Extrapolate.CLAMP
      ),
      shadowOffset: {
        width: 0,
        height: interpolate(scale.value, [1, 1.04], [1, 4], Extrapolate.CLAMP),
      },
      shadowColor: "#000000",
    };
  });

  return (
    <Animated.View
      style={[
        {
          marginBottom: 12,
          backgroundColor: "#ffffff",
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#e5e7eb",
          overflow: "hidden",
        },
        animatedStyle,
        shadowStyle,
      ]}
    >
      {/* Header with drag handle and delete button */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: "#f9fafb",
          borderBottomWidth: 1,
          borderBottomColor: "#e5e7eb",
        }}
      >
        {/* Drag Handle (hold then drag) */}
        <GestureDetector gesture={panGesture}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 4,
              paddingHorizontal: 8,
              backgroundColor: dragActive ? "#e0e7ff" : "#f3f4f6",
              borderRadius: 8,
              borderWidth: 1,
              borderColor: dragActive ? "#6366f1" : "#d1d5db",
              transform: [{ scale: dragActive ? 1.08 : 1 }],
              shadowColor: dragActive ? "#6366f1" : undefined,
              shadowOpacity: dragActive ? 0.15 : 0,
              shadowRadius: dragActive ? 6 : 0,
              shadowOffset: { width: 0, height: dragActive ? 2 : 0 },
            }}
          >
            <Ionicons
              name="reorder-three"
              size={16}
              color={dragActive ? "#6366f1" : "#6b7280"}
              style={{ marginRight: 6 }}
            />
            <Text
              style={{
                fontSize: 12,
                color: dragActive ? "#6366f1" : "#6b7280",
                fontWeight: "500",
              }}
            >
              Hold to reorder
            </Text>
          </View>
        </GestureDetector>

        {/* Delete Button */}
        {canDelete && (
          <TouchableOpacity
            style={{
              width: 32,
              height: 32,
              backgroundColor: "#fee2e2",
              borderRadius: 8,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "#fecaca",
            }}
            onPress={onDelete}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={16} color="#dc2626" />
          </TouchableOpacity>
        )}
      </View>

      {/* Block Content */}
      <View style={{ padding: 16 }}>{children}</View>
    </Animated.View>
  );
}
