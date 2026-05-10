import { storageApi } from "@/services/api";
import { useJournalStore } from "@/store/journalStore";
import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";

/**
 * Runs silently in the background (mounted in the root layout).
 *
 * On every app-foreground event it:
 *  1. Retries any audio uploads that failed offline (block has uri but no url).
 *  2. Retries any audio deletions that failed offline.
 *
 * No UI — errors are swallowed so the user is never interrupted.
 */
export function useAudioSync() {
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        if (appState.current !== "active" && nextState === "active") {
          drainQueues();
        }
        appState.current = nextState;
      },
    );

    return () => subscription.remove();
  }, []);
}

async function drainQueues() {
  const store = useJournalStore.getState();

  // ── 1. Retry pending uploads ──────────────────────────────────────────────
  const uploads = [...store.pendingUploads];
  for (const item of uploads) {
    try {
      const { url } = await storageApi.uploadAudio(item.uri, item.filename);
      // Write url onto the block
      const entries = useJournalStore.getState().entries;
      const entry = entries.find((e) => e.id === item.entryId);
      if (entry) {
        const updatedBlocks = entry.blocks.map((b, i) => {
          if (i !== item.blockIdx || b.type !== "audio") return b;
          return { ...b, url };
        });
        useJournalStore.getState().editEntry(item.entryId, {
          blocks: updatedBlocks,
        });
      }
      useJournalStore
        .getState()
        .removePendingUpload(item.entryId, item.blockIdx);
    } catch {
      // Still offline or upload failed — leave in queue for next foreground
    }
  }

  // ── 2. Retry pending deletions ────────────────────────────────────────────
  const deletions = [...store.pendingDeletions];
  for (const item of deletions) {
    try {
      await storageApi.deleteAudio(item.url);
      useJournalStore.getState().removePendingDeletion(item.url);
    } catch {
      // Still offline — leave in queue
    }
  }
}
