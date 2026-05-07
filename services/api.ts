import { API_BASE_URL } from "@/constants/api";
import { useAuthStore } from "@/store/authStore";
import axios from "axios";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Attach token on every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, log the user out automatically
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (body: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => api.post("/auth/register", body),

  login: (body: { email: string; password: string }) =>
    api.post("/auth/login", body),
};

// ─── Tasks ───────────────────────────────────────────────────────────────────

export const tasksApi = {
  getAll: () => api.get("/tasks"),
  create: (body: { name: string; tag?: string | null }) =>
    api.post("/tasks", body),
  update: (
    id: string,
    body: {
      name?: string;
      tag?: string | null;
      completed?: boolean;
      onTime?: boolean | null;
    },
  ) => api.patch(`/tasks/${id}`, body),
  delete: (id: string) => api.delete(`/tasks/${id}`),
};

// ─── Sessions ────────────────────────────────────────────────────────────────

export const sessionsApi = {
  getAll: () => api.get("/sessions"),
  start: (body: {
    sessionType: string;
    durationSeconds: number;
    flowId?: string | null;
    flowStep?: number | null;
  }) => api.post("/sessions", body),
  complete: (id: string) => api.patch(`/sessions/${id}/complete`),
  miss: (id: string) => api.patch(`/sessions/${id}/miss`),
};

// ─── Journal ─────────────────────────────────────────────────────────────────

export const journalApi = {
  getAll: () => api.get("/journal"),
  create: (body: {
    title: string;
    blocks: object[];
    mood?: number | null;
    tags?: string[];
    sessionContext?: object | null;
  }) => api.post("/journal", body),
  update: (
    id: string,
    body: {
      title?: string;
      blocks?: object[];
      mood?: number | null;
      tags?: string[];
      sessionContext?: object | null;
    },
  ) => api.patch(`/journal/${id}`, body),
  delete: (id: string) => api.delete(`/journal/${id}`),
};

// ─── AI ──────────────────────────────────────────────────────────────────────

export type JournalInsightRequest = {
  entryId: string;
  title: string;
  mood?: number | null;
  tags?: string[];
  blocks: object[];
};

export type JournalInsightResponse = {
  entryId: string;
  summary: string;
  followUpQuestion: string;
  moodScore: number;
  themes: string[];
};

export const aiApi = {
  getJournalInsight: (body: JournalInsightRequest) =>
    api.post<JournalInsightResponse>("/ai/journal-insight", body),
};

// ─── Storage ─────────────────────────────────────────────────────────────────

/**
 * Uploads an audio file to the backend, which stores it in MinIO.
 * @param uri    local device URI from Expo AV (e.g. file:///...)
 * @param filename  original filename with extension, e.g. "recording.m4a"
 * @returns { url: string } — the MinIO public URL
 */
export const storageApi = {
  uploadAudio: async (
    uri: string,
    filename: string,
  ): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append("file", {
      uri,
      name: filename,
      type: "audio/m4a",
    } as any);

    const token = useAuthStore.getState().token;
    const response = await api.post<{ url: string }>("/files/audio", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      timeout: 30000, // audio uploads may take longer
    });
    return response.data;
  },
};
