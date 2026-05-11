import { useTheme } from "@/context/ThemeContext";
import { useJournalStore, type JournalEntry } from "@/store/journalStore";
import { Ionicons } from "@expo/vector-icons";
import { format, parseISO } from "date-fns";
import { useRouter } from "expo-router";
import { Angry, Frown, Meh, Smile, Zap } from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Journal() {
  const { colors } = useTheme();
  const router = useRouter();
  const entries = useJournalStore((s) => s.entries);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return entries;
    const q = search.trim().toLowerCase();
    return entries.filter((e) => {
      const title = (e.title || "").toLowerCase();
      const text =
        (
          e.blocks?.find((b) => b.type === "text") as any
        )?.content?.toLowerCase() ?? "";
      return title.includes(q) || text.includes(q);
    });
  }, [entries, search]);

  const handleNew = useCallback(() => router.push("/journalEditor"), [router]);
  const handleOpen = useCallback(
    (id: string) => router.push({ pathname: "/journalEditor", params: { id } }),
    [router],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: JournalEntry; index: number }) => (
      <JournalCard
        item={item}
        index={index}
        onPress={() => handleOpen(item.id)}
        colors={colors}
      />
    ),
    [handleOpen, colors],
  );

  return (
    <View style={[s.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={[s.title, { color: colors.textPrimary }]}>Journal</Text>
          <Text style={[s.subtitle, { color: colors.textSecondary }]}>
            {entries.length > 0
              ? `${entries.length} reflection${entries.length === 1 ? "" : "s"}`
              : "Your thoughts, captured"}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleNew}
          style={[s.newBtn, { backgroundColor: colors.accent }]}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search — only when there are entries */}
      {entries.length > 0 && (
        <View
          style={[
            s.searchWrap,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Ionicons
            name="search-outline"
            size={16}
            color={colors.textSecondary}
          />
          <TextInput
            style={[s.searchInput, { color: colors.textPrimary }]}
            placeholder="Search entries..."
            placeholderTextColor={colors.textSecondary}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {!!search && (
            <TouchableOpacity onPress={() => setSearch("")} hitSlop={8}>
              <Ionicons
                name="close-circle"
                size={16}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* List / Empty */}
      {entries.length === 0 ? (
        <View style={s.empty}>
          <View style={[s.emptyIcon, { backgroundColor: colors.surfaceMuted }]}>
            <Ionicons
              name="journal-outline"
              size={32}
              color={colors.textSecondary}
            />
          </View>
          <Text style={[s.emptyTitle, { color: colors.textPrimary }]}>
            Nothing here yet
          </Text>
          <Text style={[s.emptyBody, { color: colors.textSecondary }]}>
            Use this space to reflect after sessions and track your growth over
            time.
          </Text>
          <TouchableOpacity
            onPress={handleNew}
            style={[s.emptyBtn, { backgroundColor: colors.accent }]}
            activeOpacity={0.85}
          >
            <Text style={s.emptyBtnText}>Write first entry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={[s.noResults, { color: colors.textSecondary }]}>
              No entries match "{search}"
            </Text>
          }
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews
        />
      )}
    </View>
  );
}

// ── Card sub-component ──────────────────────────────────────

function JournalCard({
  item,
  index,
  onPress,
  colors,
}: {
  item: JournalEntry;
  index: number;
  onPress: () => void;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  const textBlock = item.blocks?.find((b) => b.type === "text") as
    | { type: "text"; content: string }
    | undefined;
  const preview = textBlock?.content?.trim().slice(0, 100) ?? "";
  const dateStr = item.date ? format(parseISO(item.date), "MMM d, yyyy") : "";
  const blockCount = item.blocks?.length ?? 0;
  const MOOD_ICONS = [Angry, Frown, Meh, Smile, Zap];
  const MoodIcon = item.mood != null ? MOOD_ICONS[item.mood - 1] : null;
  const visibleTags = item.tags?.slice(0, 3) ?? [];

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        s.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
      activeOpacity={0.75}
    >
      {/* Amber left accent bar */}
      <View style={[s.cardAccent, { backgroundColor: colors.accent }]} />

      <View style={s.cardBody}>
        {/* Title row with mood */}
        <View style={s.cardTitleRow}>
          <Text
            style={[s.cardTitle, { color: colors.textPrimary }]}
            numberOfLines={1}
          >
            {item.title || "Untitled"}
          </Text>
          {MoodIcon != null && (
            <MoodIcon size={17} color={colors.textSecondary} />
          )}
        </View>
        {!!preview && (
          <Text
            style={[s.cardPreview, { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            {preview}
          </Text>
        )}
        {/* Tags */}
        {visibleTags.length > 0 && (
          <View style={s.tagsRow}>
            {visibleTags.map((tag) => (
              <View
                key={tag}
                style={[s.tagChip, { backgroundColor: colors.accentMuted }]}
              >
                <Text style={[s.tagChipText, { color: colors.accent }]}>
                  #{tag}
                </Text>
              </View>
            ))}
          </View>
        )}
        <View style={s.cardMeta}>
          <View style={s.metaChip}>
            <Ionicons
              name="calendar-outline"
              size={11}
              color={colors.textSecondary}
            />
            <Text style={[s.metaText, { color: colors.textSecondary }]}>
              {dateStr}
            </Text>
          </View>
          {!!item.time && (
            <View style={s.metaChip}>
              <Ionicons
                name="time-outline"
                size={11}
                color={colors.textSecondary}
              />
              <Text style={[s.metaText, { color: colors.textSecondary }]}>
                {item.time}
              </Text>
            </View>
          )}
          {item.sessionContext && (
            <View style={s.metaChip}>
              <Ionicons
                name="timer-outline"
                size={11}
                color={colors.textSecondary}
              />
              <Text style={[s.metaText, { color: colors.textSecondary }]}>
                {item.sessionContext.sessionType} ·{" "}
                {Math.floor(item.sessionContext.durationSeconds / 60)}m
              </Text>
            </View>
          )}
          {blockCount > 1 && (
            <View style={s.metaChip}>
              <Ionicons
                name="layers-outline"
                size={11}
                color={colors.textSecondary}
              />
              <Text style={[s.metaText, { color: colors.textSecondary }]}>
                {blockCount} blocks
              </Text>
            </View>
          )}
        </View>
      </View>

      <Ionicons name="chevron-forward" size={15} color={colors.border} />
    </TouchableOpacity>
  );
}

// ── Styles ──────────────────────────────────────────────────

const s = StyleSheet.create({
  screen: { flex: 1 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 12,
  },
  title: { fontSize: 24, fontFamily: "SoraBold", letterSpacing: -0.3 },
  subtitle: { fontSize: 13, fontFamily: "Sora", marginTop: 3 },
  newBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Sora", padding: 0 },

  list: { paddingHorizontal: 20, paddingBottom: 180 },

  // Entry card
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    overflow: "hidden",
  },
  cardAccent: { width: 3, alignSelf: "stretch" },
  cardBody: { flex: 1, paddingVertical: 14, paddingLeft: 14, paddingRight: 10 },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  cardTitle: { flex: 1, fontSize: 15, fontFamily: "SoraSemiBold" },
  cardPreview: {
    fontSize: 13,
    fontFamily: "Sora",
    lineHeight: 19,
    marginBottom: 6,
  },
  tagsRow: { flexDirection: "row", gap: 6, flexWrap: "wrap", marginBottom: 6 },
  tagChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  tagChipText: { fontSize: 10, fontFamily: "SoraSemiBold" },
  insightBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 6,
    alignSelf: "flex-start",
    maxWidth: "100%",
  },
  insightBadgeText: { fontSize: 11, fontFamily: "SoraMedium", flex: 1 },
  cardMeta: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  metaChip: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 11, fontFamily: "Sora" },

  // Empty
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 18, fontFamily: "SoraBold" },
  emptyBody: {
    fontSize: 14,
    fontFamily: "Sora",
    textAlign: "center",
    lineHeight: 22,
  },
  emptyBtn: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 14,
  },
  emptyBtnText: { fontSize: 14, fontFamily: "SoraSemiBold", color: "#fff" },
  noResults: {
    textAlign: "center",
    fontSize: 14,
    fontFamily: "Sora",
    marginTop: 40,
  },
});
