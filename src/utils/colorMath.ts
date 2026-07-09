/**
 * Lightens a hex color by a given percentage (towards white).
 * @param hex The input hex color code (e.g. "#ef4444", "#fff", "none")
 * @param percent The percentage to lighten the color, between 0 and 100.
 */
export function lightenHexColor(hex: string, percent: number = 75): string {
  if (hex === "none" || !hex) return "none";
  let cleanHex = hex.replace(/^#/, "");
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (cleanHex.length !== 6) return hex; // Fallback if invalid

  let r = parseInt(cleanHex.substring(0, 2), 16);
  let g = parseInt(cleanHex.substring(2, 4), 16);
  let b = parseInt(cleanHex.substring(4, 6), 16);

  // Interpolate towards 255 (white)
  r = Math.round(r + (255 - r) * (percent / 100));
  g = Math.round(g + (255 - g) * (percent / 100));
  b = Math.round(b + (255 - b) * (percent / 100));

  const rHex = r.toString(16).padStart(2, "0");
  const gHex = g.toString(16).padStart(2, "0");
  const bHex = b.toString(16).padStart(2, "0");

  return `#${rHex}${gHex}${bHex}`;
}
