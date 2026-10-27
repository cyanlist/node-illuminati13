/**
 * Rundenablauf: Spiel starten, Zug vorbereiten, Computerzug, nach dem Zug weitergeben oder werten.
 * Wie ein Zug Karte für Karte abgespielt wird, steht in move-animation.ts.
 */
import { chooseCpuMove } from '../core/ai';
import { currentPlayer, finishTurn, type Move, newGame, playerAt } from '../core/game';
import type { Settings } from '../core/settings';
import { loadSoloBest, saveSoloBest } from '../storage';
import { animateMove } from './move-animation';
import { requireGame, table } from './table.svelte';

/** Taktung in Millisekunden */
const TIMING = {
  cpuThinking: 1200,
  cpuResume: 900,
};

let cpuTimer: ReturnType<typeof setTimeout> | undefined;

export function startGame(settings: Settings): void {
  stopCpu();
  table.game = newGame(settings);
  table.anim = null;
  table.rulesOpen = false;
  table.resultsHidden = false;
  table.view = 'game';
  window.scrollTo(0, 0);
  beginTurn();
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
  table.phase = game.settings.mode === 'hotseat' ? 'handoff' : 'play';
}

/** Spielt einen Zug ab und führt danach den Rundenablauf weiter. */
export async function playTurn(move: Move): Promise<void> {
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

export function playAgain(): void {
  startGame(requireGame().settings);
}
