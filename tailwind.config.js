/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // --- Design system: dark palette ---
        "bg-dark": "#111318",
        "surface-dark": "#1A1A1F",
        "surface-muted-dark": "#22222A",
        "border-dark": "#2A2A35",
        "text-dark": "#F5F1EB",
        "text-muted-dark": "#8A8A96",
        // --- Design system: light palette ---
        "bg-light": "#FAF8F5",
        "surface-light": "#FFFFFF",
        "surface-muted-light": "#F2F0ED",
        "border-light": "#E5E3E0",
        "text-light": "#1A1A1F",
        "text-muted-light": "#7A7A86",
        // --- Design system: shared tokens ---
        "accent": "#E8A43A",
        "accent-dim": "#B8812E",
        "destructive": "#E05A5A",
        // --- Design system: session tints (dark) ---
        "tint-focus-dark": "#0D1520",
        "tint-break-dark": "#1A1408",
        "tint-creative-dark": "#150D1A",
        // --- Design system: session tints (light) ---
        "tint-focus-light": "#EEF3FA",
        "tint-break-light": "#FDF8EE",
        "tint-creative-light": "#F5EEF8",
        // --- Legacy tokens (kept during screen migration) ---
        "onboarding-primary": "#337EC9",
        "primary": "#F4F9FF",
        "text-primary": "#2C3E50",
        "text-secondary": "#506070",
        "active-tab": "#337EC9",
        "tab-bg": "#F5F8FB",
      },
      fontFamily: {
        Sora: ["Sora"],
        SoraBold: ["SoraBold"],
        SoraSemiBold: ["SoraSemiBold"],
        SoraExtraBold: ["SoraExtraBold"],
        Courgete: ["Courgete"],
        WorkSansItalic: ["WorkSansItalic"],
      }
    },
  },
  plugins: [],
}