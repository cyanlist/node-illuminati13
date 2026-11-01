/**
 * Rundenablauf: Spiel starten, Zug vorbereiten, Computerzug, nach dem Zug weitergeben oder werten.
 * Wie ein Zug Karte für Karte abgespielt wird, steht in move-animation.ts. An zwei Geräten gehen eigene
 * Züge gleich hier hinaus; was mit Nachrichten des anderen Geräts passiert, steht in online-flow.ts.
 */
import { chooseCpuMove } from '../core/ai';
import {
  beatsBest,
  currentPlayer,
  finishTurn,
  type GameState,
  type Move,
  markYou,
  newGame,
  soloScore,
} from '../core/game';
import { isOnline, type Settings } from '../core/settings';
import { loadSoloBest, saveSoloBest } from '../storage';
import { animateMove } from './move-animation';
import { online, send } from './online.svelte';
import { closeSheets, sheets } from './sheets.svelte';
import { requireGame, table, type View } from './table.svelte';

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

export function startGame(settings: Settings): void {
  if (isOnline(settings)) {
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
  if (isOnline(game.settings)) markYou(game, me);
  table.me = me;
  table.game = game;
  table.anim = null;
  sheets.resultsHidden = false;
  showView('game');
  if (game.over) {
    table.resetTurn();
    table.phase = 'over';
  } else beginTurn();
}

/** Bereitet den Zug der Person am Zug vor. */
function beginTurn(): void {
  const game = requireGame();
  table.resetTurn();
  if (currentPlayer(game).cpu) {
    table.phase = 'cpu';
    if (table.view === 'game') scheduleCpu(TIMING.cpuThinking);
    return;
  }
  if (isOnline(game.settings) && game.current !== table.me) {
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
  if (isOnline(game.settings) && game.current === table.me) send({ type: 'move', move, at: game.log.length });
  if (await animateMove(move)) afterMove();
}

export function scheduleCpu(delay = TIMING.cpuResume): void {
  stopCpu();
  cpuTimer = setTimeout(cpuTurn, delay);
}

function stopCpu(): void {
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
  if (game.over) endGame(game);
  else beginTurn();
}

/** Spielende: Ergebnisfenster zeigen und allein den Bestwert dieses Geräts vergleichen und ggf. speichern. */
function endGame(game: GameState): void {
  table.phase = 'over';
  sheets.resultsHidden = false;
  if (game.players.length > 1) return;
  const { ending } = game.settings;
  // das Ergebnisfenster vergleicht mit dem Bestwert von vor diesem Spiel
  table.soloBest = loadSoloBest(ending);
  const score = soloScore(game);
  if (score !== null && beatsBest(game, score, table.soloBest)) saveSoloBest(ending, score);
}

export function goHome(): void {
  stopCpu();
  showView('start');
}

export function resume(): void {
  showView('game');
  if (table.phase === 'cpu' && !table.anim) scheduleCpu();
}

/** Nochmal spielen – an zwei Geräten mischt das einladende Gerät, der Gast bittet nur darum. */
export function playAgain(): void {
  const { settings } = requireGame();
  if (isOnline(settings) && online.role === 'guest') {
    send({ type: 'again' });
    sheets.resultsHidden = true;
    table.message = `${online.peerName || 'Das andere Gerät'} mischt gleich neu …`;
    return;
  }
  startGame(settings);
}

/** Wechselt zwischen Startseite und Tisch – oben beginnend und ohne offene Regeln oder Protokoll. */
function showView(view: View): void {
  table.view = view;
  closeSheets();
  window.scrollTo(0, 0);
}
