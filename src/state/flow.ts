/**
 * Rundenablauf: Spiel starten, Zug vorbereiten, Computerzug, nach dem Zug weitergeben oder werten.
 * Wie ein Zug Karte für Karte abgespielt wird, steht in move-animation.ts; was an zwei Geräten
 * hinzukommt, in online-flow.ts.
 */
import { chooseCpuMove } from '../core/ai';
import {
  currentPlayer,
  finishTurn,
  type GameState,
  type Move,
  markYou,
  newGame,
  playerAt,
} from '../core/game';
import type { Settings } from '../core/settings';
import { loadSoloBest, saveSoloBest } from '../storage';
import { animateMove } from './move-animation';
import { online, send } from './online.svelte';
import { requireGame, table } from './table.svelte';

/** Taktung in Millisekunden */
const TIMING = {
  cpuThinking: 1200,
  cpuResume: 900,
};

let cpuTimer: ReturnType<typeof setTimeout> | undefined;

/** Wird gerufen, sobald das andere Gerät am Zug ist (online-flow.ts spielt dann wartende Züge ab). */
let remoteTurn: () => void = () => {};

export function onRemoteTurn(handler: () => void): void {
  remoteTurn = handler;
}

const isOnline = (game: GameState): boolean => game.settings.mode === 'online';

export function startGame(settings: Settings): void {
  if (settings.mode === 'online') {
    // an zwei Geräten mischt und verteilt immer das einladende Gerät und schickt den Stand hinüber
    if (online.role !== 'host' || !online.connected) return;
    enterGame(newGame({ ...settings, names: [online.myName, online.peerName] }), 0);
    send({ type: 'start', game: requireGame() });
    return;
  }
  enterGame(newGame(settings), 0);
}

/** Setzt sich an den Tisch: neues Spiel oder – an zwei Geräten – der Stand, den das andere Gerät geschickt hat. */
export function enterGame(game: GameState, me: number): void {
  stopCpu();
  if (isOnline(game)) markYou(game, me);
  table.me = me;
  table.game = game;
  table.anim = null;
  table.rulesOpen = false;
  table.resultsHidden = false;
  table.view = 'game';
  window.scrollTo(0, 0);
  if (game.over) table.phase = 'over';
  else beginTurn();
}

/** Bereitet den Zug der Person am Zug vor. */
function beginTurn(): void {
  const game = requireGame();
  table.selected = [];
  table.hint = [];
  table.hintTaken = null;
  table.message = '';
  table.topPick = null;
  if (currentPlayer(game).cpu) {
    table.phase = 'cpu';
    if (table.view === 'game') scheduleCpu(TIMING.cpuThinking);
    return;
  }
  if (isOnline(game) && game.current !== table.me) {
    table.phase = 'remote';
    remoteTurn();
    return;
  }
  // zu zweit wird das Gerät mit verdeckten Karten weitergegeben – mit offenen Karten ist das unnötig
  const handoff = game.settings.mode === 'hotseat' && !game.settings.openHands;
  table.phase = handoff ? 'handoff' : 'play';
}

/** Spielt einen Zug ab und führt danach den Rundenablauf weiter. Eigene Züge gehen an das andere Gerät. */
export async function playTurn(move: Move): Promise<void> {
  const game = requireGame();
  if (isOnline(game) && game.current === table.me) send({ type: 'move', move, at: game.log.length });
  if (await animateMove(move)) afterMove();
}

export function scheduleCpu(delay = TIMING.cpuResume): void {
  stopCpu();
  cpuTimer = setTimeout(cpuTurn, delay);
}

export function stopCpu(): void {
  clearTimeout(cpuTimer);
}

function cpuTurn(): void {
  const game = table.game;
  if (!game || table.phase !== 'cpu' || table.anim) return;
  void playTurn(chooseCpuMove(game));
}

/** Nach dem Zug: Rundenablauf weiterführen und entweder den nächsten Zug vorbereiten oder werten. */
export function afterMove(): void {
  const game = requireGame();
  finishTurn(game);
  if (!game.over) {
    beginTurn();
    return;
  }
  table.phase = 'over';
  table.resultsHidden = false;
  if (game.players.length === 1) {
    table.soloBest = loadSoloBest();
    const { points } = playerAt(game, 0);
    if (points > table.soloBest) saveSoloBest(points);
  }
}

export function goHome(): void {
  stopCpu();
  table.rulesOpen = false;
  table.view = 'start';
  window.scrollTo(0, 0);
}

export function resume(): void {
  table.view = 'game';
  window.scrollTo(0, 0);
  if (table.phase === 'cpu' && !table.anim) scheduleCpu();
}

/** Nochmal spielen – an zwei Geräten mischt das einladende Gerät, der Gast bittet nur darum. */
export function playAgain(): void {
  const { settings } = requireGame();
  if (settings.mode === 'online' && online.role === 'guest') {
    send({ type: 'again' });
    table.resultsHidden = true;
    table.message = `${online.peerName || 'Das andere Gerät'} mischt gleich neu …`;
    return;
  }
  startGame(settings);
}
