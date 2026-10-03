/**
 * Deterministic avatar hue from a stable seed (e.g. a supplier id).
 *
 * Same seed → same hue on every render/session, so each supplier keeps its own
 * colour. We return just the hue (0–359); the actual background/text lightness
 * is set in CSS per theme (see `.avatar--tinted`) so contrast stays right in
 * both light and dark.
 */
export function avatarHue(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return hash % 360
}
