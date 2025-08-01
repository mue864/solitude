import BackgroundEventTest from "@/components/BackgroundEventTest";
import NotificationTestSimple from "@/components/NotificationTestSimple";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Ring from "../../assets/svg/Add_ring_white.svg";
import JournalNoteCard from "../../components/JournalNoteCard";
import { useJournalStore } from "../../store/journalStore";

// Define a type for journal entry if not already defined
// import { JournalEntry } from "../../types"; // Uncomment and use if you have a type

type JournalEntry = any; // Replace with your actual type if available

export default function Journal() {
  const router = useRouter();
  const entries = useJournalStore((s) => s.entries);
  const [search, setSearch] = useState("");

  const filteredEntries = useMemo(() => {
    if (!search.trim()) return entries;
    const q = search.trim().toLowerCase();
    return entries.filter((item) => {
      const title = (item.title || "").toLowerCase();
      const textBlock = item.blocks?.find((b) => b.type === "text");
      const content = (textBlock?.content || "").toLowerCase();
      return title.includes(q) || content.includes(q);
    });
  }, [entries, search]);

  const handleNewNote = useCallback(() => {
    router.push("/journalEditor");
  }, [router]);

  const handleNotePress = useCallback(
    (id: string) => {
      router.push({ pathname: "/journalEditor", params: { id } });
    },
    [router]
  );

  const renderItem = useCallback(
    ({ item }: { item: JournalEntry }) => (
      <JournalNoteCard item={item} onPress={() => handleNotePress(item.id)} />
    ),
    [handleNotePress]
  );

  return (
    <View className="flex-1 bg-primary pt-8 relative">
      <NotificationTestSimple />
      <BackgroundEventTest />
      {entries.length === 0 ? (
        <View className="flex-1 items-center justify-center px-4">
          {/* Placeholder for empty state illustration */}
          <Text className="text-text-secondary text-center mb-6">
            You haven&apos;t written anything yet. Use this space to reflect on
            your day, sessions and track your progress.
          </Text>
          <TouchableOpacity
            className="bg-blue-600 rounded-lg px-8 py-3"
            onPress={handleNewNote}
          >
            <Text className="text-white font-SoraSemiBold text-base">
              + Start Writing
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Search Bar */}
          <View className="flex-row items-center bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-3 mb-4 border border-gray-200 dark:border-gray-700 shadow-sm mx-4">
            <TextInput
              className="flex-1 text-base text-gray-800 dark:text-gray-200 font-SoraRegular"
              placeholder="Revisit your words ..."
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
            />
            <Ionicons name="search" size={20} color="#9CA3AF" />
          </View>
          <FlatList
            className="px-4"
            data={filteredEntries}
            contentContainerStyle={{ paddingBottom: 160 }}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <Text className="text-center text-text-secondary mt-12">
                No notes found.
              </Text>
            }
            renderItem={renderItem}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={true}
          />
          {/* Floating New Note Button */}
          <View className="absolute bottom-28 left-1/2 -translate-x-1/2 z-50">
            <TouchableOpacity
              className="bg-blue-600 rounded-md px-24 py-4 shadow-lg flex-row items-center gap-2"
              onPress={handleNewNote}
              activeOpacity={0.85}
            >
              <Ring />
              <Text className="font-SoraSemiBold text-white text-base">
                New Note
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}
