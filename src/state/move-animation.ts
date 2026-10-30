/**
 * Ein Zug Karte für Karte. Der Zug wird sofort im Spielzustand ausgeführt; `table.anim` lässt die Anzeige
 * so lange den Stand davor zeigen, bis alle Karten geflogen sind:
 * 1. Beweis: Karten auf die Bühne, wahre Werte enthüllen, die 13 auflösen, dann auf die Stapel (presentProof)
 *    Abwurf: die Karte direkt auf ihren Stapel (layDown)
 * 2. Nachziehen vom Nachziehstapel in die Hand (drawUp)
 */
import { tick } from 'svelte';
import { applyMove, currentPlayer, type Move, type PlacementStep, type ProofPart } from '../core/game';
import { flyCard } from './flights.svelte';
import { drawPileRect, launchRect, pileRect, stageRect } from './positions';
import { type MoveAnimation, requireGame, table } from './table.svelte';

/** Taktung in Millisekunden */
const TIMING = {
  beforeFirstCard: 120,
  betweenCards: 300,
  betweenCardsCpu: 450,
  /** Abstand, in dem die Karten eines Beweises zur Bühne starten */
  stageStagger: 90,
  /** So lange ist der Rechenweg zu sehen, bevor der wahre Wert erscheint */
  showFormula: 450,
  afterValue: 200,
  /** So lange bleibt „= 13“ stehen */
  solved: 1000,
  /**
   * Versatz, mit dem die Karten von der Bühne starten – fürs Auge gleichzeitig, aber bei gleicher Farbe
   * landet so die gewählte Karte zuverlässig oben
   */
  stageToPileStagger: 60,
  betweenDraws: 80,
  afterMove: 250,
  afterMoveCpu: 800,
};

let nextAnimationId = 1;

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/* ---------- Überspringen ---------- */

const stageWaits = new Set<() => void>();

/** Pause auf der Bühne, die ein Antippen sofort beendet. */
function stageWait(ms: number): Promise<void> {
  if (table.anim?.proof?.skipped) return Promise.resolve();
  return new Promise((resolve) => {
    const done = (): void => {
      clearTimeout(timer);
      stageWaits.delete(done);
      resolve();
    };
    const timer = setTimeout(done, ms);
    stageWaits.add(done);
  });
}

/** Antippen der Bühne: alle Werte sofort zeigen und ohne weitere Pausen ablegen. */
export function skipProof(): void {
  const proof = table.anim?.proof;
  if (!proof || proof.skipped) return;
  proof.skipped = true;
  proof.revealed = proof.parts.length;
  proof.revealing = -1;
  for (const done of [...stageWaits]) done();
}

/* ---------- Zug abspielen ---------- */

/** Spielt den Zug ab. true, wenn er zu Ende gespielt wurde – false, wenn ein neues Spiel ihn abgebrochen hat. */
export async function animateMove(move: Move): Promise<boolean> {
  const game = requireGame();
  const player = game.current;
  // Züge, die man nur zusieht (Computer, anderes Gerät), laufen etwas gemächlicher
  const watched = currentPlayer(game).cpu || player !== table.viewer;
  // was die Anzeige bis zum Ende der Animation zeigt: der Stand direkt vor dem Zug
  const before = {
    rules: [...game.rules],
    rotations: game.rotations,
    points: game.players.map((p) => p.points),
    combos: game.players.map((p) => p.combos),
    deck: game.deck.length,
    logLength: game.log.length,
    handBefore: [...currentPlayer(game).hand],
  };
  const result = applyMove(game, move);
  const drawnIds = new Set(result.drawn);
  const anim: MoveAnimation = {
    ...before,
    id: nextAnimationId++,
    player,
    pending: result.steps.map((step) => step.card.id),
    launched: [],
    drawn: currentPlayer(game).hand.filter((card) => drawnIds.has(card.id)),
    incoming: [],
    arrived: [],
    proof: null,
  };
  table.anim = anim;
  table.hint = [];
  table.message = '';
  // ein neues Spiel oder der Weg zur Startseite beendet die Animation
  const running = (): boolean => table.anim?.id === anim.id;

  await wait(TIMING.beforeFirstCard);
  const laid =
    result.parts.length > 0
      ? await presentProof(result.parts, result.steps, player, running)
      : await layDown(result.steps, player, watched, running);
  if (!laid || !(await drawUp(player, running))) return false;
  await wait(watched ? TIMING.afterMoveCpu : TIMING.afterMove);
  if (!running()) return false;

  table.anim = null;
  table.selected = [];
  return true;
}

/** Abwurf: Die Karte bleibt in der Hand liegen, bis sie abhebt, und fliegt dann auf ihren Stapel. */
async function layDown(
  steps: PlacementStep[],
  player: number,
  watched: boolean,
  running: () => boolean,
): Promise<boolean> {
  for (const step of steps) {
    const anim = table.anim;
    if (!anim || !running()) return false;

    const from = handRect(step.card.id, player);
    anim.launched.push(step.card.id);
    await flyCard(step.card, from, pileRect(step.card.suit));
    if (!running()) return false;

    landOnPile(anim, step);
    await wait(watched ? TIMING.betweenCardsCpu : TIMING.betweenCards);
  }
  return running();
}

/**
 * Beweis: Die Karten werden allen auf der Bühne gezeigt, ihre wahren Werte nacheinander enthüllt und
 * die 13 aufgelöst. Danach fliegen sie von der Bühne auf ihre Stapel.
 */
async function presentProof(
  parts: ProofPart[],
  steps: PlacementStep[],
  player: number,
  running: () => boolean,
): Promise<boolean> {
  const anim = table.anim;
  if (!anim) return false;
  anim.proof = {
    parts,
    arrived: [],
    left: [],
    revealing: -1,
    revealed: 0,
    solved: false,
    clearing: false,
    skipped: false,
  };
  const proof = anim.proof;
  await tick(); // die Plätze auf der Bühne entstehen erst beim nächsten Zeichnen

  // 1. vorzeigen: die Karten fliegen kurz nacheinander aus der Hand auf die Bühne
  await Promise.all(
    parts.map(async (part, i) => {
      await wait(i * TIMING.stageStagger);
      if (!running()) return;
      const from = handRect(part.card.id, player);
      anim.launched.push(part.card.id);
      await flyCard(part.card, from, stageRect(part.card.id));
      proof.arrived.push(part.card.id);
    }),
  );

  // 2. enthüllen: unter jeder Karte erst der Rechenweg, dann der wahre Wert
  for (let i = 0; i < parts.length; i++) {
    if (!running()) return false;
    proof.revealing = i;
    await stageWait(TIMING.showFormula);
    proof.revealed = Math.max(proof.revealed, i + 1);
    await stageWait(TIMING.afterValue);
  }
  proof.revealing = -1;

  // 3. auflösen: „= 13“ und die Punkte gleich beim Platz der Person
  proof.solved = true;
  anim.points[player] = (anim.points[player] ?? 0) + parts.length;
  anim.combos[player] = (anim.combos[player] ?? 0) + 1;
  await stageWait(TIMING.solved);

  // 4. ablegen: Die Bühne löst sich auf und alle Karten fliegen gleichzeitig auf ihre Stapel,
  //    damit keine Karte allein in der Luft hängt. Sie landen in der gewählten Reihenfolge.
  proof.clearing = true;
  await Promise.all(
    steps.map(async (step, i) => {
      await wait(i * TIMING.stageToPileStagger);
      if (!running()) return;
      const from = stageRect(step.card.id);
      proof.left.push(step.card.id);
      await flyCard(step.card, from, pileRect(step.card.suit));
      if (running()) landOnPile(anim, step);
    }),
  );
  anim.proof = null;
  return running();
}

/**
 * Nachziehen: Jede neue Karte bekommt zuerst einen (noch unsichtbaren) Platz in der Hand und fliegt dann
 * vom Nachziehstapel genau dorthin – in die eigene Hand offen, zum Gegenüber verdeckt (außer mit offenen Karten).
 */
async function drawUp(player: number, running: () => boolean): Promise<boolean> {
  const hidden = player !== table.viewer;
  const faceDown = hidden && !table.game?.settings.openHands;
  for (const card of table.anim?.drawn ?? []) {
    const anim = table.anim;
    if (!anim || !running()) return false;

    const from = drawPileRect();
    anim.deck--;
    anim.incoming.push(card.id);
    await tick(); // Platz in der Hand entsteht erst beim nächsten Zeichnen
    await flyCard(card, from, handRect(card.id, player), { faceDown });
    if (!running()) return false;

    anim.arrived.push(card.id);
    await wait(TIMING.betweenDraws);
  }
  return running();
}

/* ---------- Hilfen ---------- */

/** Wo eine Karte gerade in der Hand (oder als verdeckte Karte des Gegenübers) liegt. */
function handRect(cardId: number, player: number): DOMRect | null {
  const slot = table.hand(player).findIndex((card) => card.id === cardId);
  return launchRect(cardId, player, slot);
}

/** Karte ist auf ihrem Stapel gelandet: ab jetzt sichtbar, ggf. mit verschobenen Regeln. */
function landOnPile(anim: MoveAnimation, step: PlacementStep): void {
  anim.pending = anim.pending.filter((cardId) => cardId !== step.card.id);
  anim.rules = step.rules;
  anim.rotations = step.rotations;
}
