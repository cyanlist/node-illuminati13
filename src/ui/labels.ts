/** Beschriftungen von Einstellungen, die an mehreren Stellen gleich lauten müssen. */
import type { RotationDir } from '../core/rules';
import type { HintLevel } from '../core/settings';

/** Richtung, in die die Stapel in der Variante weiterrücken */
export const DIR_LABELS: Record<RotationDir, string> = {
  rechts: 'nach rechts (Herz → Pik → Karo → Kreuz → Herz)',
  links: 'nach links (Herz → Kreuz → Karo → Pik → Herz)',
};

export const HINT_TITLES: Record<HintLevel, string> = { off: 'Aus', nudge: 'Andeutung', full: 'Volle Hilfe' };
