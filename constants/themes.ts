export interface BuiltInTheme {
  id: string;
  name: string;
  accentColor: string;
}

/**
 * Curated built-in accent presets.
 * "solitude" (amber) is always active for free users.
 * All other presets require Pro.
 */
export const BUILTIN_THEMES: BuiltInTheme[] = [
  { id: "solitude", name: "Solitude", accentColor: "#E8A43A" },
  { id: "ocean", name: "Ocean", accentColor: "#3B82F6" },
  { id: "forest", name: "Forest", accentColor: "#10B981" },
  { id: "twilight", name: "Twilight", accentColor: "#8B5CF6" },
  { id: "rose", name: "Rose", accentColor: "#F43F5E" },
  { id: "teal", name: "Teal", accentColor: "#14B8A6" },
];
