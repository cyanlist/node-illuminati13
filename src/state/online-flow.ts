/**
 * Spielablauf an zwei Geräten: was mit Nachrichten des anderen Geräts passiert. Züge und Tipps, die ankommen,
 * während hier noch Karten fliegen, warten in einer Schlange und werden der Reihe nach abgespielt.
 */
import { takeHint } from '../core/game';
import { isOnline, normalizeSettings, type Settings } from '../core/settings';
import type { Message } from '../net/messages';
import { enterGame, onRemoteTurn, playAgain, playTurn } from './flow';
import { onLink, online, send } from './online.svelte';
import { table } from './table.svelte';

type Turn = Extract<Message, { type: 'move' | 'hint' }>;

const queue: Turn[] = [];

/** Meldet den Spielablauf bei der Verbindung an – einmal beim Start der App. */
export function initOnlineFlow(): void {
  onLink({ message: receive, open: greet });
  onRemoteTurn(playQueuedTurn);
}

/** Gleich nach dem Verbinden: Läuft schon ein Spiel (Unterbrechung), bekommt der Gast den aktuellen Stand. */
function greet(): void {
  if (online.role === 'host' && table.game && isOnline(table.game.settings)) sendState();
}

function receive(message: Message): void {
  switch (message.type) {
    case 'hello':
      online.peerName =
        message.name.trim().slice(0, 20) || (online.role === 'host' ? 'Gast' : 'Gastgeber*in');
      return;
    case 'settings':
      // kommt vom anderen Gerät – nur Gültiges übernehmen
      if (online.role === 'guest') online.hostSettings = normalizeSettings(message.settings);
      return;
    case 'start':
      if (online.role !== 'guest') return;
      queue.length = 0;
      online.sheetOpen = false;
      enterGame(message.game, 1);
      return;
    case 'move':
    case 'hint':
      queue.push(message);
      playQueuedTurn();
      return;
    case 'resync':
      if (online.role === 'host') sendState();
      return;
    case 'again':
      if (online.role === 'host' && table.game?.over) playAgain();
      return;
  }
}

/** Gastgeber*in: zeigt dem Gast, wie das nächste Spiel gerade eingestellt ist. */
export function shareSettings(settings: Settings): void {
  if (online.role === 'host' && online.connected) send({ type: 'settings', settings });
}

/** Spielt den nächsten wartenden Zug ab, sobald das andere Gerät dran ist und hier nichts mehr fliegt. */
function playQueuedTurn(): void {
  const game = table.game;
  if (!game || table.phase !== 'remote' || table.anim) return;
  const turn = queue.shift();
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
  // ein Tipp kommt nur an, wenn er etwas kostet: hier genauso verrechnen, damit beide Stände gleich bleiben
  try {
    takeHint(game);
  } catch {
    resync();
    return;
  }
  playQueuedTurn();
}

function resync(): void {
  queue.length = 0;
  if (online.role === 'host') sendState();
  else send({ type: 'resync' });
}

function sendState(): void {
  if (table.game) send({ type: 'start', game: table.game });
}
