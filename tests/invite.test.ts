import { describe, expect, it } from 'vitest';
import { parseInvite } from '../src/net/link';
import { newRoomCode, normalizeRoomCode } from '../src/net/room-code';
import { encodeSignal, fromSdp } from '../src/net/signal';
import { CHROME_OFFER, seededRng } from './helpers';

describe('Einladungen', () => {
  it('erkennt Raum-Codes – auch klein geschrieben, mit Leerzeichen oder als Link', () => {
    expect(parseInvite('K7M4X')).toEqual({ type: 'room', room: 'K7M4X' });
    expect(parseInvite(' k7m 4x ')).toEqual({ type: 'room', room: 'K7M4X' });
    expect(parseInvite('https://example.org/illuminati13/#raum=K7M4X')).toEqual({
      type: 'room',
      room: 'K7M4X',
    });
    expect(parseInvite('K7M4')).toBeNull();
    expect(parseInvite('hallo')).toBeNull();
  });

  it('erkennt lange Codes – auch als Link', () => {
    const code = encodeSignal(fromSdp(CHROME_OFFER, 'offer'));
    expect(parseInvite(`  ${code}\n`)).toEqual({ type: 'code', code });
    expect(parseInvite(`https://example.org/x/#beitreten=${encodeURI(code)}`)).toEqual({
      type: 'code',
      code,
    });
    expect(parseInvite(`https://example.org/#beitreten=${encodeURIComponent(code)}`)).toEqual({
      type: 'code',
      code,
    });
  });

  it('erzeugt Raum-Codes ohne leicht verwechselbare Zeichen', () => {
    const rng = seededRng(3);
    const codes = Array.from({ length: 200 }, () => newRoomCode(rng));
    for (const code of codes) {
      expect(code).toMatch(/^[A-Z2-9]{5}$/);
      expect(code).not.toMatch(/[01OIL]/);
      expect(normalizeRoomCode(code.toLowerCase())).toBe(code);
    }
    expect(new Set(codes).size).toBeGreaterThan(195);
  });
});
