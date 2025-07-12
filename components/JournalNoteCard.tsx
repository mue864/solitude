import { format, parseISO } from "date-fns";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Calendar from "../assets/svg/Calendar_duotone.svg";
import Clock from "../assets/svg/Clock_duotone.svg";

interface JournalNoteCardProps {
  item: any;
  onPress: () => void;
}

const JournalNoteCard = React.memo(
  ({ item, onPress }: JournalNoteCardProps) => {
    return (
      <TouchableOpacity
        className="mb-4 p-5 rounded-2xl border border-onboarding-primary/20 dark:border-gray-700/30 bg-white dark:bg-gray-800 shadow-sm"
        onPress={onPress}
        activeOpacity={0.85}
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        {/* Header Section */}
        <View className="mb-3">
          <Text className="text-lg font-SoraSemiBold mb-2 text-text-primary leading-6">
            {item.title || "Untitled"}
          </Text>
          <View className="h-px bg-onboarding-primary/10 dark:bg-gray-700/50" />
        </View>

        {/* Content Preview */}
        <View className="mb-4">
          <Text
            className="text-sm text-text-secondary font-Sora leading-5"
            numberOfLines={2}
          >
            {item.blocks
              ?.find((b: any) => b.type === "text")
              ?.content?.slice(0, 80) || "No content available..."}
          </Text>
        </View>

        {/* Metadata Section */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-4">
            <View className="flex-row items-center gap-2">
              <View className="p-1.5 rounded-lg bg-onboarding-primary/10 dark:bg-gray-700/50">
                <Calendar width={16} height={16} />
              </View>
              <Text className="text-xs text-text-secondary font-Sora">
                {item.date ? format(parseISO(item.date), "MMM d, yyyy") : ""}
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <View className="p-1.5 rounded-lg bg-onboarding-primary/10 dark:bg-gray-700/50">
                <Clock width={16} height={16} />
              </View>
              <Text className="text-xs text-text-secondary font-Sora">
                {item.time}
              </Text>
            </View>
          </View>

          {/* Optional: Add a subtle indicator */}
          <View className="w-2 h-2 rounded-full bg-onboarding-primary/30 dark:bg-gray-600" />
        </View>
      </TouchableOpacity>
    );
  }
);

JournalNoteCard.displayName = "JournalNoteCard";

export default JournalNoteCard;
