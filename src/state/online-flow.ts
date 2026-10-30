/**
 * Spielablauf an zwei Geräten: was mit Nachrichten des anderen Geräts passiert. Züge, die ankommen,
 * während hier noch Karten fliegen, warten in einer Schlange und werden der Reihe nach abgespielt.
 */

import type { Message } from '../net/messages';
import { applyHint } from './actions';
import { enterGame, onRemoteTurn, playAgain, playTurn } from './flow';
import { onLink, online, send } from './online.svelte';
import { table } from './table.svelte';

type Turn = Extract<Message, { type: 'move' | 'hint' }>;

const waiting: Turn[] = [];

onLink({ message: receive, open: greet });
onRemoteTurn(next);

/** Gleich nach dem Verbinden: Läuft schon ein Spiel (Unterbrechung), bekommt der Gast den aktuellen Stand. */
function greet(): void {
  if (online.role === 'host' && table.game?.settings.mode === 'online') sendState();
}

function receive(message: Message): void {
  switch (message.type) {
    case 'hello':
      online.peerName =
        message.name.trim().slice(0, 20) || (online.role === 'host' ? 'Gast' : 'Gastgeber*in');
      return;
    case 'start':
      if (online.role !== 'guest') return;
      waiting.length = 0;
      online.sheetOpen = false;
      enterGame(message.game, 1);
      return;
    case 'move':
    case 'hint':
      waiting.push(message);
      next();
      return;
    case 'resync':
      if (online.role === 'host') sendState();
      return;
    case 'again':
      if (online.role === 'host' && table.game?.over) playAgain();
      return;
  }
}

/** Spielt den nächsten wartenden Zug ab, sobald das andere Gerät dran ist und hier nichts mehr fliegt. */
function next(): void {
  const game = table.game;
  if (!game || table.phase !== 'remote' || table.anim) return;
  const turn = waiting.shift();
  if (!turn) return;

  // laufen die Stände auseinander, gilt der Stand des einladenden Geräts
  if (turn.at !== game.log.length) {
    resync();
    return;
  }
  if (turn.type === 'move') {
    playTurn(turn.move).catch(resync);
    return;
  }
  try {
    applyHint(game);
  } catch {
    resync();
    return;
  }
  next();
}

function resync(): void {
  waiting.length = 0;
  if (online.role === 'host') sendState();
  else send({ type: 'resync' });
}

function sendState(): void {
  if (table.game) send({ type: 'start', game: table.game });
}
