import { chooseCpuMove } from '../src/core/ai';
import { type Card, MAX_RANK, type Rng, type SuitIndex } from '../src/core/cards';
import { applyMove, currentPlayer, finishTurn, type GameState } from '../src/core/game';
import { DEFAULT_SETTINGS, type Settings } from '../src/core/settings';

/** Reproduzierbare Zufallsquelle (mulberry32). */
export function seededRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Karte aus Farbe und Zahl, mit derselben id wie im echten Deck. */
export const card = (suit: SuitIndex, rank: number): Card => ({ id: suit * MAX_RANK + rank - 1, suit, rank });

export const settings = (overrides: Partial<Settings> = {}): Settings => ({
  ...DEFAULT_SETTINGS,
  ...overrides,
});

/** Beispiel aus der Anleitung: auf den Stapeln liegen ♥4, ♠2, ♦10 und ♣6. */
export const examplePiles = (): Card[][] => [[card(0, 4)], [card(1, 2)], [card(2, 10)], [card(3, 6)]];

/** Die Hand aus dem Beispiel der Anleitung; ♠7, ♦13 und ♣8 ergeben zusammen 13 (die einzige 13er-Kombination). */
export const exampleHand = (): Card[] => [card(0, 5), card(1, 7), card(3, 3), card(3, 8), card(2, 13)];

/**
 * Legt die Stapel und die Hand aus dem Beispiel der Anleitung ins Spiel; die Hand bekommt die Person am Zug.
 * Ihre bisherigen Karten kommen zurück in den Nachziehstapel – ohne die Karten des Beispiels.
 */
export function dealExample(game: GameState): GameState {
  const player = currentPlayer(game);
  game.piles = examplePiles();
  const hand = exampleHand();
  const placed = new Set([...hand, ...game.piles.flat()].map((c) => c.id));
  game.deck = [...game.deck, ...player.hand].filter((c) => !placed.has(c.id));
  player.hand = hand;
  return game;
}

/** Der Computer spielt für alle, bis das Spiel vorbei ist – höchstens `maxTurns` Züge; nach jedem `afterTurn`. */
export function playOut(game: GameState, rng: Rng, maxTurns = 200, afterTurn?: () => void): void {
  for (let turn = 0; turn < maxTurns && !game.over; turn++) {
    applyMove(game, chooseCpuMove(game, rng));
    finishTurn(game);
    afterTurn?.();
  }
}

/** Gekürztes Angebot, wie Chrome es für eine reine Datenverbindung erzeugt. */
export const CHROME_OFFER = [
  'v=0',
  'o=- 4611731400430051336 2 IN IP4 127.0.0.1',
  's=-',
  't=0 0',
  'a=group:BUNDLE 0',
  'a=extmap-allow-mixed',
  'a=msid-semantic: WMS',
  'm=application 54321 UDP/DTLS/SCTP webrtc-datachannel',
  'c=IN IP4 203.0.113.7',
  'a=candidate:1467250027 1 udp 2122260223 3f1c2a9e-7b1d-4c55-9a2e-1b6d0c8e4f21.local 54321 typ host generation 0 network-id 1',
  'a=candidate:1467250027 1 tcp 1518280447 3f1c2a9e-7b1d-4c55-9a2e-1b6d0c8e4f21.local 9 typ host tcptype active generation 0',
  'a=candidate:842163049 1 udp 1686052607 203.0.113.7 61002 typ srflx raddr 0.0.0.0 rport 0 generation 0',
  'a=ice-ufrag:Kq3e',
  'a=ice-pwd:Xb9aRrGkL7cY2mD1pZvTqW0e',
  'a=ice-options:trickle',
  'a=fingerprint:sha-256 0A:1B:2C:3D:4E:5F:60:71:82:93:A4:B5:C6:D7:E8:F9:0A:1B:2C:3D:4E:5F:60:71:82:93:A4:B5:C6:D7:E8:F9',
  'a=setup:actpass',
  'a=mid:0',
  'a=sctp-port:5000',
  'a=max-message-size:262144',
  '',
].join('\r\n');
