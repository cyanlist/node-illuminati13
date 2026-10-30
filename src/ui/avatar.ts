/**
 * Was ein Avatar braucht, solange es noch keine Accounts gibt: Initialen und eine Farbe, die immer aus dem
 * Namen folgt – dieselbe Person sieht also in jedem Spiel gleich aus. Mit Accounts käme ein Profilbild dazu.
 */

/** „Anna“ → „A“, „Anna Berg“ → „AB“, „Spieler*in 2“ → „S2“. */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const letters = words.length > 1 ? [words[0], words[1]] : words.slice(0, 1);
  return (
    letters
      .map((word) => [...(word ?? '')][0] ?? '')
      .join('')
      .toUpperCase() || '?'
  );
}

/** Farbton (0–359) aus dem Namen – einfache Prüfsumme, gleichmäßig über den Farbkreis verteilt. */
export function hueFor(name: string): number {
  let hash = 0;
  for (const char of name.trim().toLowerCase()) hash = (hash * 31 + (char.codePointAt(0) ?? 0)) | 0;
  return Math.abs(hash) % 360;
}
