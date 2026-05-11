import type { JournalEntry } from "@/store/journalStore";
import type { SessionRecord } from "@/store/sessionIntelligence";
import type { Task } from "@/store/taskStore";
import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";

// ── helpers ────────────────────────────────────────────────────────────────

/** Wrap a cell value so commas / quotes inside don't break CSV parsing. */
function cell(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function rows(header: string[], data: string[][]): string {
  return [header, ...data].map((r) => r.map(cell).join(",")).join("\n");
}

function startOf(range: DateRange): number {
  const now = new Date();
  switch (range) {
    case "week": {
      const d = new Date(now);
      d.setDate(now.getDate() - 6);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }
    case "month": {
      const d = new Date(now);
      d.setDate(now.getDate() - 29);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }
    default:
      return 0; // all time
  }
}

// ── types ──────────────────────────────────────────────────────────────────

export type DateRange = "week" | "month" | "all";

export interface ExportOptions {
  range: DateRange;
  includeSessions: boolean;
  includeJournal: boolean;
  includeTasks: boolean;
}

// ── CSV builders ───────────────────────────────────────────────────────────

export function buildSessionsCsv(
  records: SessionRecord[],
  range: DateRange,
): string {
  const since = startOf(range);
  const filtered = records.filter(
    (r) => r.timestamp >= since && r.completed && r.duration > 0,
  );

  const header = [
    "Date",
    "Time",
    "Session Type",
    "Duration (min)",
    "Completed",
    "Focus Quality (1-10)",
    "Energy Level (1-10)",
    "Interruptions",
  ];

  const data = filtered.map((r) => {
    const d = new Date(r.timestamp);
    return [
      d.toLocaleDateString("en-CA"), // YYYY-MM-DD
      d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      r.sessionType,
      String(Math.round(r.duration / 60)),
      r.completed ? "Yes" : "No",
      r.focusQuality != null ? String(r.focusQuality) : "",
      r.energyLevel != null ? String(r.energyLevel) : "",
      r.interruptions != null ? String(r.interruptions) : "",
    ];
  });

  return rows(header, data);
}

export function buildJournalCsv(
  entries: JournalEntry[],
  range: DateRange,
): string {
  const since = startOf(range);
  const filtered = entries.filter((e) => {
    const ts = e.createdAt ?? new Date(e.date).getTime();
    return ts >= since;
  });

  const MOOD_LABELS: Record<number, string> = {
    1: "Drained",
    2: "Low",
    3: "Neutral",
    4: "Good",
    5: "Energised",
  };

  const header = ["Date", "Time", "Title", "Mood", "Tags", "Content"];

  const data = filtered.map((e) => {
    const text = e.blocks
      .map((b) => {
        if (b.type === "text") return b.content;
        if (b.type === "list") return b.items.join("; ");
        if (b.type === "checkbox")
          return b.items
            .map((i) => `[${i.checked ? "x" : " "}] ${i.text}`)
            .join("; ");
        return "";
      })
      .filter(Boolean)
      .join(" | ");

    return [
      e.date,
      e.time,
      e.title,
      e.mood != null ? (MOOD_LABELS[e.mood] ?? String(e.mood)) : "",
      (e.tags ?? []).join("; "),
      text,
    ];
  });

  return rows(header, data);
}

export function buildTasksCsv(tasks: Task[]): string {
  const header = ["Title", "Tag", "Status", "On Time"];

  const data = tasks.map((t) => [
    t.name,
    t.tag ?? "",
    t.completed ? "Completed" : "Active",
    t.onTime === true ? "Yes" : t.onTime === false ? "No" : "",
  ]);

  return rows(header, data);
}

// ── main export function ───────────────────────────────────────────────────

/**
 * Generates CSV files for the requested data, writes them to the cache
 * directory, then opens the native share sheet.
 *
 * On Android each file is shared individually (Sharing API limitation).
 * On iOS they are all shared at once via the share sheet.
 */
export async function exportData(
  options: ExportOptions,
  data: {
    sessionRecords: SessionRecord[];
    journalEntries: JournalEntry[];
    tasks: Task[];
  },
): Promise<void> {
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");

  const files: { name: string; csv: string }[] = [];

  if (options.includeSessions) {
    files.push({
      name: `solitude_sessions_${timestamp}.csv`,
      csv: buildSessionsCsv(data.sessionRecords, options.range),
    });
  }

  if (options.includeJournal) {
    files.push({
      name: `solitude_journal_${timestamp}.csv`,
      csv: buildJournalCsv(data.journalEntries, options.range),
    });
  }

  if (options.includeTasks) {
    files.push({
      name: `solitude_tasks_${timestamp}.csv`,
      csv: buildTasksCsv(data.tasks),
    });
  }

  if (files.length === 0) return;

  // Dynamic import so the native module is only resolved at call-time
  // (avoids crashing the module before a native rebuild installs ExpoSharing)
  const Sharing = await import("expo-sharing");

  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {
    throw new Error("Sharing is not available on this device.");
  }

  for (const file of files) {
    const uri = `${FileSystem.cacheDirectory}${file.name}`;
    await FileSystem.writeAsStringAsync(uri, file.csv, {
      encoding: "utf8",
    });
    await Sharing.shareAsync(uri, {
      mimeType: "text/csv",
      dialogTitle: "Export Solitude Data",
      UTI: "public.comma-separated-values-text",
    });
  }
}

/**
 * Saves CSV files directly to the device:
 * - Android: opens a folder picker (SAF) and writes into the chosen directory.
 * - iOS: falls back to the share sheet where users can tap "Save to Files".
 */
export async function saveToDevice(
  options: ExportOptions,
  data: {
    sessionRecords: SessionRecord[];
    journalEntries: JournalEntry[];
    tasks: Task[];
  },
): Promise<void> {
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");

  const files: { name: string; csv: string }[] = [];
  if (options.includeSessions)
    files.push({
      name: `solitude_sessions_${timestamp}.csv`,
      csv: buildSessionsCsv(data.sessionRecords, options.range),
    });
  if (options.includeJournal)
    files.push({
      name: `solitude_journal_${timestamp}.csv`,
      csv: buildJournalCsv(data.journalEntries, options.range),
    });
  if (options.includeTasks)
    files.push({
      name: `solitude_tasks_${timestamp}.csv`,
      csv: buildTasksCsv(data.tasks),
    });

  if (files.length === 0) return;

  if (Platform.OS === "android") {
    // SAF: let the user pick a folder (e.g. Downloads), then write there
    const perms =
      await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
    if (!perms.granted) return; // user cancelled

    for (const file of files) {
      const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
        perms.directoryUri,
        file.name,
        "text/csv",
      );
      await FileSystem.StorageAccessFramework.writeAsStringAsync(
        fileUri,
        file.csv,
        { encoding: "utf8" },
      );
    }
  } else {
    // iOS has no public Downloads folder — share sheet with "Save to Files" is canonical
    const Sharing = await import("expo-sharing");
    for (const file of files) {
      const uri = `${FileSystem.cacheDirectory}${file.name}`;
      await FileSystem.writeAsStringAsync(uri, file.csv, { encoding: "utf8" });
      await Sharing.shareAsync(uri, {
        mimeType: "text/csv",
        dialogTitle: "Save to Files",
        UTI: "public.comma-separated-values-text",
      });
    }
  }
}
