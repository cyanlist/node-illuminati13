/**
 * Lebenszeichen zwischen zwei verbundenen Geräten. Eine Verbindung meldet ihr Ende oft erst spät oder gar nicht –
 * etwa wenn das andere Handy den Bildschirm ausschaltet. Deshalb schicken sich die Geräte regelmäßig ein kleines
 * „ping“; bleibt es aus, wird die Verbindung erst als wackelig, dann als stumm angezeigt. Kommt wieder etwas an,
 * ist alles wieder gut.
 *
 * Geurteilt wird erst, wenn vom Gegenüber schon ein Lebenszeichen kam – ein Gerät mit älterem Stand schickt keine
 * und gilt sonst fälschlich als stumm.
 */

/** Wie es um die Verbindung steht: alles gut, wackelig oder schon länger nichts gehört */
export type Signal = 'ok' | 'slow' | 'gone';

export const HEARTBEAT = {
  /** So oft geht ein Lebenszeichen hinaus (ms) */
  every: 2500,
  /** Ab dieser Stille gilt die Verbindung als wackelig (ms) */
  slowAfter: 7000,
  /** Ab dieser Stille antwortet das Gegenüber nicht mehr (ms) */
  goneAfter: 20000,
} as const;

/** Wie es nach so viel Stille um die Verbindung steht. */
export function signalAfter(silence: number): Signal {
  if (silence >= HEARTBEAT.goneAfter) return 'gone';
  if (silence >= HEARTBEAT.slowAfter) return 'slow';
  return 'ok';
}

export interface Heartbeat {
  /** Vom Gegenüber kam etwas an; `ping`: es war ein Lebenszeichen */
  heard(ping: boolean): void;
  stop(): void;
}

interface Options {
  /** Schickt ein Lebenszeichen hinaus */
  ping(): void;
  /** Der Zustand der Verbindung hat sich geändert */
  onsignal(signal: Signal): void;
  now?: () => number;
}

/** Startet die Lebenszeichen für eine frisch geöffnete Verbindung. */
export function startHeartbeat({ ping, onsignal, now = Date.now }: Options): Heartbeat {
  let lastHeard = now();
  let lastSent = Number.NEGATIVE_INFINITY;
  /** Das Gegenüber schickt selbst Lebenszeichen – erst dann darf Stille etwas heißen */
  let pinging = false;
  let signal: Signal = 'ok';

  const update = (next: Signal): void => {
    if (next === signal) return;
    signal = next;
    onsignal(next);
  };

  const tick = (): void => {
    const time = now();
    if (time - lastSent >= HEARTBEAT.every) {
      lastSent = time;
      ping();
    }
    if (pinging) update(signalAfter(time - lastHeard));
  };

  tick();
  const timer = setInterval(tick, 1000);

  return {
    heard(isPing) {
      lastHeard = now();
      if (isPing) pinging = true;
      update('ok');
    },
    stop() {
      clearInterval(timer);
    },
  };
}
