/**
 * Kurzfassungen der Einstellungen für die Startseite: womit man gleich spielt, in wenigen Wörtern.
 */
import { RULE_PACKS, RULES } from '../../core/rules';
import type { Settings } from '../../core/settings';

/** Die Bereiche, die auf der Startseite zusammengefasst sind und je ein eigenes Fenster haben. */
export type Section = 'ending' | 'rules' | 'hints' | 'extras';

const HINT_LABELS = { off: 'Aus', nudge: 'Andeutung', full: 'Volle Hilfe' } as const;

/** Wie lange gespielt wird – allein ist „Bis 13“ ein Wettlauf gegen die eigenen Züge. */
export function endingSummary(draft: Settings): string {
  if (draft.ending === 'deck') return 'Ganzes Deck';
  return draft.mode === 'solo' ? 'Bis 13 – in möglichst wenigen Zügen' : 'Bis 13 Punkte';
}

/** „Klassisch“, „Bei jedem Spiel neu ausgelost“ oder die vier eigenen Regeln in Kurzform. */
export function rulesSummary(draft: Settings): string {
  if (draft.ruleMode === 'random') return 'Bei jedem Spiel neu ausgelost';
  const pack = RULE_PACKS.find((p) => p.matches?.(draft.customRules));
  if (pack) return pack.title;
  return `Eigene: ${draft.customRules.map((key) => RULES[key].short).join(' · ')}`;
}

export function hintsSummary(draft: Settings): string {
  const level = HINT_LABELS[draft.hints];
  return draft.hints !== 'off' && draft.hintCost ? `${level}, kostet einen Punkt` : level;
}

export function extrasSummary(draft: Settings): string {
  const parts = [draft.showValues ? 'Wahre Werte sichtbar' : 'Kopfrechnen'];
  if (draft.openHands && draft.mode !== 'solo') parts.push('Offene Karten');
  if (draft.variant) parts.push('Weltordnung verschiebt sich');
  return parts.join(' · ');
}
