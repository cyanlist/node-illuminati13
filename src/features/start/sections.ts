/**
 * Die Bereiche, die auf der Startseite nur als Kurzfassung stehen: Zeile in der Übersicht, Kurzfassung in wenigen
 * Wörtern (summaries.ts) und das Fenster zum Anpassen. Neuer Bereich: Panel anlegen und hier eintragen.
 */
import type { Component } from 'svelte';
import type { Settings } from '../../core/settings';
import ExtrasPanel from './ExtrasPanel.svelte';
import HintsPanel from './HintsPanel.svelte';
import RulesPanel from './RulesPanel.svelte';
import { extrasSummary, hintsSummary, rulesSummary, variantsSummary } from './summaries';
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
