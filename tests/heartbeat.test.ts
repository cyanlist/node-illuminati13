import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HEARTBEAT, type Signal, signalAfter, startHeartbeat } from '../src/net/heartbeat';
import { parseMessage } from '../src/net/messages';

describe('Lebenszeichen', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('ordnet Stille ein: gut, wackelig, weg', () => {
    expect(signalAfter(0)).toBe('ok');
    expect(signalAfter(HEARTBEAT.slowAfter - 1)).toBe('ok');
    expect(signalAfter(HEARTBEAT.slowAfter)).toBe('slow');
    expect(signalAfter(HEARTBEAT.goneAfter)).toBe('gone');
  });

  it('schickt sofort und dann regelmäßig ein Lebenszeichen', () => {
    const ping = vi.fn();
    const beat = startHeartbeat({ ping, onsignal: () => {}, now: Date.now });
    expect(ping).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(HEARTBEAT.every * 4);
    expect(ping.mock.calls.length).toBeGreaterThanOrEqual(4);
    beat.stop();
    const sent = ping.mock.calls.length;
    vi.advanceTimersByTime(HEARTBEAT.every * 4);
    expect(ping).toHaveBeenCalledTimes(sent);
  });

  it('meldet Stille erst wackelig, dann weg – und wieder gut, sobald etwas ankommt', () => {
    const signals: Signal[] = [];
    const beat = startHeartbeat({
      ping: () => {},
      onsignal: (signal) => signals.push(signal),
      now: Date.now,
    });
    beat.heard(true);
    vi.advanceTimersByTime(HEARTBEAT.slowAfter);
    expect(signals).toEqual(['slow']);
    vi.advanceTimersByTime(HEARTBEAT.goneAfter - HEARTBEAT.slowAfter);
    expect(signals).toEqual(['slow', 'gone']);
    beat.heard(false);
    expect(signals).toEqual(['slow', 'gone', 'ok']);
    beat.stop();
  });

  it('urteilt nicht über ein Gerät, das selbst keine Lebenszeichen schickt (älterer Stand)', () => {
    const onsignal = vi.fn();
    const beat = startHeartbeat({ ping: () => {}, onsignal, now: Date.now });
    beat.heard(false);
    vi.advanceTimersByTime(HEARTBEAT.goneAfter * 2);
    expect(onsignal).not.toHaveBeenCalled();
    beat.stop();
  });

  it('ist eine gültige Nachricht zwischen den Geräten', () => {
    expect(parseMessage(JSON.stringify({ type: 'ping' }))).toEqual({ type: 'ping' });
  });
});
