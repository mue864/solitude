import { FOCUS_AUDIO_MANIFEST_URL } from "@/constants/env";
import {
  type FocusAudioCacheEntry,
  type FocusAudioTrack,
  useFocusAudioStore,
} from "@/store/focusAudioStore";
import { Directory, File, Paths } from "expo-file-system";

const AUDIO_CACHE_DIR = new Directory(Paths.document, "focus-audio");

function sanitizeId(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function fileFor(trackId: string, version: string): File {
  return new File(
    AUDIO_CACHE_DIR,
    `${sanitizeId(trackId)}_${sanitizeId(version)}.mp3`,
  );
}

function ensureCacheDir() {
  AUDIO_CACHE_DIR.create({ idempotent: true });
}

function toTrackList(data: unknown): FocusAudioTrack[] {
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const row = item as Record<string, unknown>;
      const id = typeof row.id === "string" ? row.id.trim() : "";
      const name = typeof row.name === "string" ? row.name.trim() : "";
      const url = typeof row.url === "string" ? row.url.trim() : "";
      const versionRaw =
        typeof row.version === "string" ? row.version.trim() : "";
      const version = versionRaw || "v1";

      if (!id || !name || !url) {
        return null;
      }

      return {
        id,
        name,
        url,
        version,
        category:
          typeof row.category === "string" ? row.category.trim() : undefined,
        sizeBytes:
          typeof row.sizeBytes === "number" ? row.sizeBytes : undefined,
        isPremium: row.isPremium === true,
      } satisfies FocusAudioTrack;
    })
    .filter((item): item is FocusAudioTrack => Boolean(item));
}

class FocusAudioService {
  async syncCatalog(): Promise<FocusAudioTrack[]> {
    if (!FOCUS_AUDIO_MANIFEST_URL) {
      useFocusAudioStore.getState().setCatalog([]);
      return [];
    }

    try {
      const response = await fetch(FOCUS_AUDIO_MANIFEST_URL, {
        method: "GET",
      });

      if (!response.ok) {
        useFocusAudioStore.getState().setCatalog([]);
        return [];
      }

      const json = await response.json();
      const tracks = toTrackList(json);
      useFocusAudioStore.getState().setCatalog(tracks);
      return tracks;
    } catch {
      useFocusAudioStore.getState().setCatalog([]);
      return [];
    }
  }

  async ensureTrackDownloaded(trackId: string): Promise<string | null> {
    if (!trackId) return null;

    const state = useFocusAudioStore.getState();
    const track = state.catalog.find((t) => t.id === trackId);
    if (!track) return null;

    const existing = state.cache[track.id];
    if (existing && existing.version === track.version && existing.localUri) {
      const existingFile = new File(existing.localUri);
      if (existingFile.exists) {
        state.patchCacheEntry(track.id, {
          lastUsedAt: Date.now(),
          status: "ready",
        });
        return existing.localUri;
      }
    }

    ensureCacheDir();

    const targetFile = fileFor(track.id, track.version);
    const downloadingEntry: FocusAudioCacheEntry = {
      trackId: track.id,
      version: track.version,
      localUri: targetFile.uri,
      status: "downloading",
      lastUsedAt: Date.now(),
      lastError: undefined,
    };
    state.upsertCacheEntry(downloadingEntry);

    try {
      await File.downloadFileAsync(track.url, targetFile, { idempotent: true });

      state.patchCacheEntry(track.id, {
        localUri: targetFile.uri,
        status: "ready",
        version: track.version,
        lastUsedAt: Date.now(),
        lastError: undefined,
      });

      return targetFile.uri;
    } catch (error: any) {
      state.patchCacheEntry(track.id, {
        status: "error",
        lastError: error?.message || "Download failed",
      });
      return null;
    }
  }

  async getPlayableUri(trackId: string): Promise<string | null> {
    const state = useFocusAudioStore.getState();
    const entry = state.cache[trackId];

    if (entry?.localUri) {
      const f = new File(entry.localUri);
      if (f.exists) {
        state.patchCacheEntry(trackId, {
          status: "ready",
          lastUsedAt: Date.now(),
        });
        return entry.localUri;
      }
    }

    return this.ensureTrackDownloaded(trackId);
  }

  clearCachedTrack(trackId: string): void {
    const entry = useFocusAudioStore.getState().cache[trackId];
    if (entry?.localUri) {
      const f = new File(entry.localUri);
      if (f.exists) {
        f.delete();
      }
    }
    useFocusAudioStore.getState().removeCacheEntry(trackId);
  }
}

export const focusAudioService = new FocusAudioService();
