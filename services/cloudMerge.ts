/**
 * cloudMerge.ts
 *
 * Pulls cloud data after login and merges it into local Zustand stores.
 * Imports stores directly — kept separate from syncService.ts to avoid
 * circular dependencies (stores import syncService, not cloudMerge).
 */

import { journalApi, sessionsApi, tasksApi } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { useJournalStore } from "@/store/journalStore";
import { useSessionIntelligence } from "@/store/sessionIntelligence";
import { useTaskStore } from "@/store/taskStore";

/**
 * Pull all cloud data and merge into local stores.
 * Called once after a successful login.
 * Only requires isLoggedIn — no Pro gate (restoring your own data is always allowed).
 * Cloud wins for items not already present locally (matched by name/title+date).
 */
export async function pullAndMerge(): Promise<void> {
  if (!useAuthStore.getState().isLoggedIn) return;

  try {
    const [tasksRes, journalRes, sessionsRes] = await Promise.all([
      tasksApi.getAll(),
      journalApi.getAll(),
      sessionsApi.getAll(),
    ]);

    // Merge tasks: add cloud tasks that don't exist locally
    const cloudTasks: any[] = tasksRes.data ?? [];
    const localTasks = useTaskStore.getState().tasks;
    const localNames = new Set(localTasks.map((t) => t.name.toLowerCase()));

    for (const ct of cloudTasks) {
      if (!localNames.has(ct.name.toLowerCase())) {
        useTaskStore.getState().addTask({
          id: ct.id,
          name: ct.name,
          tag: ct.tag ?? null,
          completed: ct.completed,
          onTime: ct.onTime ?? undefined,
          remoteId: ct.id,
        });
      }
    }

    // Merge journal entries: add cloud entries not present locally
    const cloudEntries: any[] = journalRes.data ?? [];
    const localEntries = useJournalStore.getState().entries;
    const localKeys = new Set(
      localEntries.map((e) => e.title.toLowerCase() + e.date),
    );

    for (const ce of cloudEntries) {
      const key = ce.title.toLowerCase() + (ce.entryDate ?? "");
      if (!localKeys.has(key)) {
        useJournalStore.getState().addEntry({
          title: ce.title,
          blocks: ce.blocks ?? [],
          mood: ce.mood ?? undefined,
          tags: ce.tags ?? [],
          sessionContext: ce.sessionContext ?? undefined,
          remoteId: ce.id,
        });
      }
    }

    // Merge sessions into sessionIntelligence (powers Insights tab)
    const cloudSessions: any[] = sessionsRes.data ?? [];
    const sessionRecords = cloudSessions
      .filter((s) => s.status === "COMPLETED" || s.status === "MISSED")
      .map((s) => ({
        id: s.id as string,
        sessionType: s.sessionType as string,
        duration: s.durationSeconds as number,
        completed: s.status === "COMPLETED",
        timestamp: new Date(s.startedAt).getTime(),
        flowId: s.flowId ?? null,
      }));
    if (sessionRecords.length > 0) {
      useSessionIntelligence.getState().mergeCloudSessions(sessionRecords);
    }
  } catch {}
}
