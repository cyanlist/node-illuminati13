/**
 * Die Bereiche, die auf der Startseite nur als Kurzfassung stehen: Zeile in der Übersicht, Kurzfassung in wenigen
 * Wörtern und das Fenster zum Anpassen. Neuer Bereich: Panel anlegen und hier eintragen.
 */
import type { Component } from 'svelte';
import { RULE_PACKS, RULES } from '../../core/rules';
import type { Settings } from '../../core/settings';
import { HINT_TITLES } from '../../ui/labels';
import EndingPanel from './EndingPanel.svelte';
import ExtrasPanel from './ExtrasPanel.svelte';
import HintsPanel from './HintsPanel.svelte';
import RulesPanel from './RulesPanel.svelte';

export type SectionId = 'ending' | 'rules' | 'hints' | 'extras';

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
  { id: 'ending', label: 'Länge', title: 'Länge des Spiels', summary: endingSummary, panel: EndingPanel },
  { id: 'rules', label: 'Regeln', title: 'Regeln der Stapel', summary: rulesSummary, panel: RulesPanel },
  { id: 'hints', label: 'Tipps', title: 'Tipps', summary: hintsSummary, panel: HintsPanel },
  { id: 'extras', label: 'Extras', title: 'Extras', summary: extrasSummary, panel: ExtrasPanel },
];

/** Wie lange gespielt wird – allein ist „Bis 13“ ein Wettlauf gegen die eigenen Züge. */
function endingSummary(draft: Settings): string {
  if (draft.ending === 'deck') return 'Ganzes Deck';
  return draft.mode === 'solo' ? 'Bis 13 – in möglichst wenigen Zügen' : 'Bis 13 Punkte';
}

/** „Klassisch“, „Bei jedem Spiel neu ausgelost“ oder die vier eigenen Regeln in Kurzform. */
function rulesSummary(draft: Settings): string {
  if (draft.ruleMode === 'random') return 'Bei jedem Spiel neu ausgelost';
  const pack = RULE_PACKS.find((p) => p.matches?.(draft.customRules));
  if (pack) return pack.title;
  return `Eigene: ${draft.customRules.map((key) => RULES[key].short).join(' · ')}`;
}

function hintsSummary(draft: Settings): string {
  const level = HINT_TITLES[draft.hints];
  return draft.hints !== 'off' && draft.hintCost ? `${level}, kostet einen Punkt` : level;
}

function extrasSummary(draft: Settings): string {
  const parts = [draft.showValues ? 'Wahre Werte sichtbar' : 'Kopfrechnen'];
  if (draft.openHands && draft.mode !== 'solo') parts.push('Offene Karten');
  if (draft.variant) parts.push('Weltordnung verschiebt sich');
  return parts.join(' · ');
}
