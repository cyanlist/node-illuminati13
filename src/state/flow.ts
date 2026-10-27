/**
 * Spielablauf: Spiel starten, Zug vorbereiten, Computerzug und das Abspielen eines Zugs Karte für Karte.
 */
import { tick } from 'svelte';
import { chooseCpuMove } from '../core/ai';
import {
  applyMove,
  currentPlayer,
  finishTurn,
  type GameState,
  type Move,
  newGame,
  type PlacementStep,
  playerAt,
} from '../core/game';
import type { Settings } from '../core/settings';
import { loadSoloBest, saveSoloBest } from '../storage';
import { flyCard } from './flights.svelte';
import { drawPileRect, launchRect, pileRect } from './positions';
import { type MoveAnimation, requireGame, table } from './table.svelte';

/** Taktung in Millisekunden */
const TIMING = {
  cpuThinking: 1200,
  cpuResume: 900,
  beforeFirstCard: 120,
  betweenCards: 300,
  betweenCardsCpu: 450,
  betweenDraws: 80,
  afterMove: 250,
  afterMoveCpu: 800,
};

let cpuTimer: ReturnType<typeof setTimeout> | undefined;
let nextAnimationId = 1;

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

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
  table.message = '';
  table.topPick = null;
  if (currentPlayer(game).cpu) {
    table.phase = 'cpu';
    if (table.view === 'game') scheduleCpu(TIMING.cpuThinking);
    return;
  }
  table.phase = game.settings.mode === 'hotseat' ? 'handoff' : 'play';
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
  void playMove(chooseCpuMove(game));
}

/** Was die Anzeige während der Animation weiter zeigt: der Stand direkt vor dem Zug. */
function animationStart(
  game: GameState,
): Omit<
  MoveAnimation,
  'id' | 'player' | 'pending' | 'landed' | 'launched' | 'drawn' | 'incoming' | 'arrived'
> {
  return {
    rules: [...game.rules],
    rotations: game.rotations,
    points: game.players.map((player) => player.points),
    combos: game.players.map((player) => player.combos),
    deck: game.deck.length,
    logLength: game.log.length,
    handBefore: [...currentPlayer(game).hand],
  };
}

/**
 * Führt einen Zug aus und spielt ihn ab: erst fliegen die gespielten Karten einzeln aus der Hand auf ihre
 * Stapel, dann die nachgezogenen Karten vom Nachziehstapel in die Hand. Erst danach zeigt die Anzeige
 * Punkte und Protokoll, und die nächste Person ist dran.
 */
export async function playMove(move: Move): Promise<void> {
  const game = requireGame();
  const player = game.current;
  const isCpu = currentPlayer(game).cpu;
  const before = animationStart(game);
  const result = applyMove(game, move);
  const drawnIds = new Set(result.drawn);
  const anim: MoveAnimation = {
    ...before,
    id: nextAnimationId++,
    player,
    pending: result.steps.map((step) => step.card.id),
    landed: [],
    launched: [],
    drawn: currentPlayer(game).hand.filter((card) => drawnIds.has(card.id)),
    incoming: [],
    arrived: [],
  };
  table.anim = anim;
  table.hint = [];
  table.message = '';
  // ein neues Spiel oder der Weg zur Startseite beendet die Animation
  const running = (): boolean => table.anim?.id === anim.id;

  await wait(TIMING.beforeFirstCard);
  if (!(await layDown(result.steps, player, isCpu, running))) return;
  if (!(await drawUp(player, running))) return;
  await wait(isCpu ? TIMING.afterMoveCpu : TIMING.afterMove);
  if (!running()) return;

  table.anim = null;
  table.selected = [];
  afterMove();
}

/** Ablegen: Jede Karte bleibt in der Hand liegen, bis sie abhebt, und fliegt dann auf ihren Stapel. */
async function layDown(
  steps: PlacementStep[],
  player: number,
  isCpu: boolean,
  running: () => boolean,
): Promise<boolean> {
  for (const step of steps) {
    const anim = table.anim;
    if (!anim || !running()) return false;

    // abheben: Startpunkt messen, dann verschwindet die Karte aus der Hand und fliegt los
    const slot = table.hand(player).findIndex((card) => card.id === step.card.id);
    const from = launchRect(step.card.id, player, slot);
    anim.launched.push(step.card.id);
    await flyCard(step.card, from, pileRect(step.card.suit));
    if (!running()) return false;

    // gelandet: Karte liegt oben auf dem Stapel, ggf. mit verschobenen Regeln
    anim.pending = anim.pending.filter((cardId) => cardId !== step.card.id);
    anim.landed.push(step.card);
    anim.rules = step.rules;
    anim.rotations = step.rotations;
    await wait(isCpu ? TIMING.betweenCardsCpu : TIMING.betweenCards);
  }
  return running();
}

/**
 * Nachziehen: Jede neue Karte bekommt zuerst einen (noch unsichtbaren) Platz in der Hand und fliegt dann
 * vom Nachziehstapel genau dorthin – in die eigene Hand offen, zum Gegenüber verdeckt.
 */
async function drawUp(player: number, running: () => boolean): Promise<boolean> {
  const faceDown = player !== table.handOwner || table.phase === 'handoff';
  for (const card of table.anim?.drawn ?? []) {
    const anim = table.anim;
    if (!anim || !running()) return false;

    const from = drawPileRect();
    anim.deck--;
    anim.incoming.push(card.id);
    await tick(); // Platz in der Hand entsteht erst beim nächsten Zeichnen
    const slot = table.hand(player).findIndex((c) => c.id === card.id);
    await flyCard(card, from, launchRect(card.id, player, slot), { faceDown });
    if (!running()) return false;

    anim.arrived.push(card.id);
    await wait(TIMING.betweenDraws);
  }
  return running();
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
