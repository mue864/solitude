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
        className="mb-3 p-4 rounded-xl border border-onboarding-primary dark:border-gray-700 bg-tab-bg dark:bg-gray-800"
        onPress={onPress}
        activeOpacity={0.85}
      >
        <Text className="text-lg font-SoraSemiBold mb-1 text-text-primary">
          {item.title || "Untitled"}
        </Text>
        <Text
          className="text-sm text-text-secondary mb-2 font-Sora"
          numberOfLines={2}
        >
          {item.blocks
            ?.find((b: any) => b.type === "text")
            ?.content?.slice(0, 80) || ""}
        </Text>
        <View className="flex-row gap-4">
          <View className="flex-row gap-2 items-center">
            <Calendar width={18} height={18} />
            <Text className="text-xs text-text-secondary font-Sora">
              {item.date ? format(parseISO(item.date), "MMMM d, yyyy") : ""}
            </Text>
          </View>
          <View className="flex-row gap-2 items-center">
            <Clock width={18} height={18} />
            <Text className="text-xs text-text-secondary font-Sora">
              {item.time}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
);

export default JournalNoteCard;
