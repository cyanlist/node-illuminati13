import { describe, expect, it } from 'vitest';
import { CLASSIC_RULES, ROTATION_DIRS } from '../src/core/rules';
import {
  CPU_LEVELS,
  ENDINGS,
  GAME_MODES,
  HINT_LEVELS,
  isOnline,
  normalizeSettings,
  RULE_MODES,
  resolveRuleMode,
  settingsForEditing,
} from '../src/core/settings';
import { settings } from './helpers';

describe('Einstellungen', () => {
  it('repariert kaputte oder veraltete Daten', () => {
    expect(normalizeSettings({ mode: 'netz', customRules: ['plus'], showValues: 'ja' })).toEqual(
      settings({ customRules: [...CLASSIC_RULES] }),
    );
    expect(normalizeSettings(null)).toEqual(settings());
  });

  it('übernimmt jeden gültigen Wert', () => {
    for (const mode of GAME_MODES) expect(normalizeSettings({ mode }).mode).toBe(mode);
    for (const cpuLevel of CPU_LEVELS) expect(normalizeSettings({ cpuLevel }).cpuLevel).toBe(cpuLevel);
    for (const dir of ROTATION_DIRS) expect(normalizeSettings({ dir }).dir).toBe(dir);
    for (const ruleMode of RULE_MODES) expect(normalizeSettings({ ruleMode }).ruleMode).toBe(ruleMode);
    for (const hints of HINT_LEVELS) expect(normalizeSettings({ hints }).hints).toBe(hints);
    for (const ending of ENDINGS) expect(normalizeSettings({ ending }).ending).toBe(ending);
    const customRules = ['dist', 'min', 'mod', 'mean'];
    expect(normalizeSettings({ customRules }).customRules).toEqual(customRules);
  });

  it('ersetzt eigene Regeln, die es nicht mehr gibt, durch die klassischen', () => {
    // „13 − Hand“ und „Hand bleibt Hand“ gab es in früheren Versionen
    const customRules = ['mirror', 'min', 'plain', 'mean'];
    expect(normalizeSettings({ customRules }).customRules).toEqual([...CLASSIC_RULES]);
  });

  it('macht aus einem früher gespeicherten Namen „Du“ ein leeres Feld', () => {
    expect(normalizeSettings({ names: ['Du', 'Bea'] }).names).toEqual(['', 'Bea']);
    expect(normalizeSettings({ names: ['Anna', ''] }).names).toEqual(['Anna', '']);
  });

  it('leitet den Regel-Modus beim Spielstart aus den Feldern ab', () => {
    expect(resolveRuleMode(settings({ ruleMode: 'custom', customRules: [...CLASSIC_RULES] })).ruleMode).toBe(
      'classic',
    );
    expect(
      resolveRuleMode(settings({ ruleMode: 'classic', customRules: ['min', 'minus', 'copy', 'max'] }))
        .ruleMode,
    ).toBe('custom');
    expect(resolveRuleMode(settings({ ruleMode: 'random' })).ruleMode).toBe('random');
  });

  it('zeigt im klassischen Modus die klassischen Regeln zum Bearbeiten', () => {
    const stored = settings({ ruleMode: 'classic', customRules: ['dist', 'min', 'mod', 'mean'] });
    expect(settingsForEditing(stored).customRules).toEqual([...CLASSIC_RULES]);
  });

  it('erkennt das Spiel an zwei Geräten', () => {
    expect(GAME_MODES.filter((mode) => isOnline({ mode }))).toEqual(['online']);
  });
});
