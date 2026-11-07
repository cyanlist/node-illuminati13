import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS } from '../src/core/settings';
import { type Link, startButton } from '../src/features/start/start-button';
import { parseMessage } from '../src/net/messages';

const link = (overrides: Partial<Link> = {}): Link => ({
  role: null,
  connected: false,
  pending: false,
  silent: false,
  peerName: 'Lena',
  ...overrides,
});

describe('Start-Knopf', () => {
  it('startet ohne 2. Gerät sofort', () => {
    expect(startButton(false, link())).toEqual({ label: 'Spiel starten', disabled: false, reason: null });
  });

  it('bleibt an zwei Geräten grau, bis verbunden ist – und sagt warum', () => {
    const none = startButton(true, link());
    expect(none.disabled).toBe(true);
    expect(none.label).toBe('Spiel starten');
    expect(none.reason).toContain('2. Gerät');
    expect(startButton(true, link({ role: 'host', pending: true })).reason).toBe(
      'Warte auf das andere Gerät …',
    );
  });

  it('startet als Gastgeber*in, sobald verbunden – außer das andere Gerät antwortet nicht', () => {
    expect(startButton(true, link({ role: 'host', connected: true })).disabled).toBe(false);
    const silent = startButton(true, link({ role: 'host', connected: true, silent: true }));
    expect(silent).toEqual({
      label: 'Spiel starten',
      disabled: true,
      reason: 'Lena antwortet gerade nicht.',
    });
  });

  it('sagt dem Gast, wer startet', () => {
    expect(startButton(true, link({ role: 'guest', connected: true }))).toEqual({
      label: 'Lena startet das Spiel …',
      disabled: true,
      reason: null,
    });
  });

  it('schickt die Einstellungen als gültige Nachricht', () => {
    const message = { type: 'settings', settings: DEFAULT_SETTINGS };
    expect(parseMessage(JSON.stringify(message))).toEqual(message);
  });
});
