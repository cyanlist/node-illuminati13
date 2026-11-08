import { describe, expect, it } from 'vitest';
import { CLASSIC_RULES, ROTATION_DIRS } from '../src/core/rules';
import {
  CPU_LEVELS,
  GAME_MODES,
  HINT_LEVELS,
  isOnline,
  normalizeSettings,
  RULE_MODES,
  resolveRuleMode,
  settingsForEditing,
  TRUTH_GOALS,
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
    for (const truthGoal of TRUTH_GOALS) expect(normalizeSettings({ truthGoal }).truthGoal).toBe(truthGoal);
    expect(normalizeSettings({ truth: true }).truth).toBe(true);
    const customRules = ['dist', 'min', 'mod', 'mean'];
    expect(normalizeSettings({ customRules }).customRules).toEqual(customRules);
  });

  it('ersetzt eigene Regeln, die es nicht mehr gibt, durch die klassischen', () => {
    // „13 − Hand“ und „Hand bleibt Hand“ gab es in früheren Versionen
    const customRules = ['mirror', 'min', 'plain', 'mean'];
    expect(normalizeSettings({ customRules }).customRules).toEqual([...CLASSIC_RULES]);
  });

  it('macht aus der früheren Länge „Bis 13“ die wahre Wahrheit mit dem Ziel 13', () => {
    expect(normalizeSettings({ ending: 'thirteen' })).toMatchObject({ truth: true, truthGoal: 13 });
    expect(normalizeSettings({ ending: 'truth', truthGoal: 23 })).toMatchObject({
      truth: true,
      truthGoal: 23,
    });
    expect(normalizeSettings({ ending: 'deck' })).toMatchObject({ truth: false, truthGoal: 33 });
    expect(normalizeSettings({}).truth).toBe(false);
  });

  it('nimmt nur bekannte Punkteziele – frühere (25, 50) und andere Zahlen landen beim nächstgelegenen', () => {
    expect(normalizeSettings({ truthGoal: 100 }).truthGoal).toBe(100);
    expect(normalizeSettings({ truthGoal: 25 }).truthGoal).toBe(23);
    expect(normalizeSettings({ truthGoal: 50 }).truthGoal).toBe(52);
    expect(normalizeSettings({ truthGoal: 70 }).truthGoal).toBe(52);
    expect(normalizeSettings({ truthGoal: 80 }).truthGoal).toBe(100);
    expect(normalizeSettings({ truthGoal: '25' }).truthGoal).toBe(33);
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
