/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
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