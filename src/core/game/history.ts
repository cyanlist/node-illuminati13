/** Was sich aus dem Protokoll eines Spiels ablesen lässt. */
import type { GameState } from './types';

/** Wie viele Züge eine Person schon gemacht hat (Beweise und Abwürfe). */
export function turnsTaken(state: GameState, player: number): number {
  return state.log.filter(
    (entry) => (entry.kind === 'proof' || entry.kind === 'discard') && entry.player === player,
  ).length;
}

/** Wer das Spiel begonnen hat; bis die Reihe wieder an dieser Person ist, ist eine Runde komplett. */
export function starter(state: GameState): number {
  const begins = state.log.find((entry) => entry.kind === 'begins');
  return begins?.kind === 'begins' ? begins.player : 0;
}
