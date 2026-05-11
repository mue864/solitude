/**
 * HSL ↔ Hex color conversions and accent token derivation.
 * No external dependencies — pure math.
 */

/** Convert HSL (h: 0-360, s: 0-100, l: 0-100) to a 7-char hex string "#RRGGBB" */
export function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number): string => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/** Convert a 7-char hex "#RRGGBB" to HSL (h: 0-360, s: 0-100, l: 0-100) */
export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/** Returns true if the string is a valid 7-char hex color "#RRGGBB" */
export function isValidHex(hex: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(hex);
}

/**
 * From a single accent hex, derive the three accent color tokens:
 * accent, accentDim (darkened ~20 lightness points), accentMuted (15% opacity rgba)
 */
export function deriveAccentTokens(hex: string): {
  accent: string;
  accentDim: string;
  accentMuted: string;
} {
  const { h, s, l } = hexToHsl(hex);
  const dimHex = hslToHex(h, s, Math.max(0, l - 20));
  const rv = parseInt(hex.slice(1, 3), 16);
  const gv = parseInt(hex.slice(3, 5), 16);
  const bv = parseInt(hex.slice(5, 7), 16);
  return {
    accent: hex,
    accentDim: dimHex,
    accentMuted: `rgba(${rv}, ${gv}, ${bv}, 0.15)`,
  };
}
