/**
 * Die Einstellungen eines Spiels in wenigen Wörtern – für die Kurzfassung auf der Startseite (sections.ts) und den
 * Text, mit dem man ein Ergebnis teilt. Ohne Svelte, damit beide sie nutzen können.
 */
import { HINTS_OFF, hintStyle } from '../../core/game';
import { RULE_PACKS, RULES } from '../../core/rules';
import type { Settings } from '../../core/settings';

const NO_VARIANT = 'Keine – das ganze Deck';

/** Die eingeschalteten Varianten einzeln, z. B. „Weltordnung nach rechts“ – leer, wenn keine. */
export function variantNames(draft: Settings): string[] {
  const parts: string[] = [];
  if (draft.truth) parts.push(`Wahre Wahrheit – bis ${draft.truthGoal} Punkte`);
  if (draft.variant) parts.push(`Weltordnung ${draft.dir === 'rechts' ? 'nach rechts' : 'nach links'}`);
  return parts;
}

/** Alle eingeschalteten Varianten in einer Zeile – ohne Variante wird das ganze Deck gespielt. */
export function variantsSummary(draft: Settings): string {
  const parts = variantNames(draft);
  return parts.length > 0 ? parts.join(' · ') : NO_VARIANT;
}

/** „Klassisch“, „Bei jedem Spiel neu ausgelost“ oder die vier eigenen Regeln in Kurzform. */
export function rulesSummary(draft: Settings): string {
  if (draft.ruleMode === 'random') return 'Bei jedem Spiel neu ausgelost';
  const pack = RULE_PACKS.find((p) => p.matches?.(draft.customRules));
  if (pack) return pack.title;
  return `Eigene: ${draft.customRules.map((key) => RULES[key].short).join(' · ')}`;
}

export function hintsSummary(draft: Settings): string {
  const level = (hintStyle(draft.hints) ?? HINTS_OFF).title;
  return draft.hints !== 'off' && draft.hintCost ? `${level}, kostet einen Punkt` : level;
}

export function extrasSummary(draft: Settings): string {
  const parts = [draft.showValues ? 'Wahre Werte sichtbar' : 'Kopfrechnen'];
  if (draft.openHands && draft.mode !== 'solo') parts.push('Offene Karten');
  return parts.join(' · ');
}
