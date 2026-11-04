/**
 * Die Bereiche, die auf der Startseite nur als Kurzfassung stehen: Zeile in der Übersicht, Kurzfassung in wenigen
 * Wörtern und das Fenster zum Anpassen. Neuer Bereich: Panel anlegen und hier eintragen.
 */
import type { Component } from 'svelte';
import { HINTS_OFF, hintStyle } from '../../core/game';
import { RULE_PACKS, RULES } from '../../core/rules';
import type { Settings } from '../../core/settings';
import ExtrasPanel from './ExtrasPanel.svelte';
import HintsPanel from './HintsPanel.svelte';
import RulesPanel from './RulesPanel.svelte';
import VariantsPanel from './VariantsPanel.svelte';

export type SectionId = 'variants' | 'rules' | 'hints' | 'extras';

/** Ein Einstellungs-Panel; `plain` lässt den eigenen Kasten weg, weil das Fenster schon einer ist. */
type SettingsPanel = Component<{ draft: Settings; plain?: boolean }, object, 'draft'>;

export interface Section {
  id: SectionId;
  /** Beschriftung der Zeile in der Übersicht */
  label: string;
  /** Überschrift des Fensters */
  title: string;
  summary(draft: Settings): string;
  panel: SettingsPanel;
}

export const SECTIONS: readonly Section[] = [
  { id: 'variants', label: 'Varianten', title: 'Varianten', summary: variantsSummary, panel: VariantsPanel },
  { id: 'rules', label: 'Regeln', title: 'Regeln der Stapel', summary: rulesSummary, panel: RulesPanel },
  { id: 'hints', label: 'Tipps', title: 'Tipps', summary: hintsSummary, panel: HintsPanel },
  { id: 'extras', label: 'Extras', title: 'Extras', summary: extrasSummary, panel: ExtrasPanel },
];

/** Alle eingeschalteten Varianten in einer Zeile – ohne Variante wird das ganze Deck gespielt. */
function variantsSummary(draft: Settings): string {
  const parts: string[] = [];
  if (draft.truth) parts.push(`Wahre Wahrheit – bis ${draft.truthGoal} Punkte`);
  if (draft.variant) parts.push(`Weltordnung ${draft.dir === 'rechts' ? 'nach rechts' : 'nach links'}`);
  return parts.length > 0 ? parts.join(' · ') : 'Keine – das ganze Deck';
}

/** „Klassisch“, „Bei jedem Spiel neu ausgelost“ oder die vier eigenen Regeln in Kurzform. */
function rulesSummary(draft: Settings): string {
  if (draft.ruleMode === 'random') return 'Bei jedem Spiel neu ausgelost';
  const pack = RULE_PACKS.find((p) => p.matches?.(draft.customRules));
  if (pack) return pack.title;
  return `Eigene: ${draft.customRules.map((key) => RULES[key].short).join(' · ')}`;
}

function hintsSummary(draft: Settings): string {
  const level = (hintStyle(draft.hints) ?? HINTS_OFF).title;
  return draft.hints !== 'off' && draft.hintCost ? `${level}, kostet einen Punkt` : level;
}

function extrasSummary(draft: Settings): string {
  const parts = [draft.showValues ? 'Wahre Werte sichtbar' : 'Kopfrechnen'];
  if (draft.openHands && draft.mode !== 'solo') parts.push('Offene Karten');
  return parts.join(' · ');
}
