/**
 * syncService.ts
 *
 * Pure push/pull API functions for background sync.
 * Does NOT import stores — call these from stores or hooks to avoid circular deps.
 * Only runs when the user is logged in AND isPro (premium).
 * All functions are fire-and-forget; failures are silent.
 */

import { journalApi, sessionsApi, tasksApi } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { useSettingsStore } from "@/store/settingsStore";

export function isSyncEnabled(): boolean {
  return (
    useAuthStore.getState().isLoggedIn && useSettingsStore.getState().isPro
  );
}

// ─── Tasks ───────────────────────────────────────────────────────────────────

/** Push a single task creation to the backend. Returns the remote ID or null. */
export async function pushCreateTask(
  name: string,
  tag: string | null,
): Promise<string | null> {
  if (!isSyncEnabled()) return null;
  try {
    const res = await tasksApi.create({ name, tag });
    return res.data?.id ?? null;
  } catch {
    return null;
  }
}

/** Push a task update silently. */
export async function pushUpdateTask(
  remoteId: string,
  patch: {
    name?: string;
    tag?: string | null;
    completed?: boolean;
    onTime?: boolean | null;
  },
): Promise<void> {
  if (!isSyncEnabled()) return;
  try {
    await tasksApi.update(remoteId, patch);
  } catch {}
}

/** Push a task deletion silently. */
export async function pushDeleteTask(remoteId: string): Promise<void> {
  if (!isSyncEnabled()) return;
  try {
    await tasksApi.delete(remoteId);
  } catch {}
}

// ─── Journal ─────────────────────────────────────────────────────────────────

/** Push a new journal entry. Returns the remote ID or null. */
export async function pushCreateJournalEntry(entry: {
  title: string;
  blocks: object[];
  mood?: number | null;
  tags?: string[];
  sessionContext?: object | null;
}): Promise<string | null> {
  if (!isSyncEnabled()) return null;
  try {
    const res = await journalApi.create(entry);
    return res.data?.id ?? null;
  } catch {
    return null;
  }
}

/** Push a journal entry update silently. */
export async function pushUpdateJournalEntry(
  remoteId: string,
  patch: {
    title?: string;
    blocks?: object[];
    mood?: number | null;
    tags?: string[];
    sessionContext?: object | null;
  },
): Promise<void> {
  if (!isSyncEnabled()) return;
  try {
    await journalApi.update(remoteId, patch);
  } catch {}
}

/** Push a journal entry deletion silently. */
export async function pushDeleteJournalEntry(remoteId: string): Promise<void> {
  if (!isSyncEnabled()) return;
  try {
    await journalApi.delete(remoteId);
  } catch {}
}

// ─── Sessions ────────────────────────────────────────────────────────────────

/** Push a completed session record to the backend silently. */
export async function pushSession(session: {
  sessionType: string;
  durationSeconds: number;
  flowId?: string | null;
  flowStep?: number | null;
  completed: boolean;
}): Promise<void> {
  if (!isSyncEnabled()) return;
  try {
    const res = await sessionsApi.start({
      sessionType: session.sessionType,
      durationSeconds: session.durationSeconds,
      flowId: session.flowId,
      flowStep: session.flowStep,
    });
    const id = res.data?.id;
    if (id) {
      if (session.completed) {
        await sessionsApi.complete(id);
      } else {
        await sessionsApi.miss(id);
      }
    }
  } catch {}
}
