/**
 * Die Verbindung zu einem zweiten Gerät: wer einlädt und wer beitritt, auf welchem Weg, wie weit der Aufbau
 * ist und welcher Code gerade gezeigt wird. Was mit eingehenden Nachrichten passiert, steht in online-flow.ts.
 *
 * Zwei Wege: per Raum-Code (die Geräte finden sich über öffentliche Relays) oder – ganz ohne fremde Dienste –
 * per Austausch zweier Codes, als QR-Code oder Text.
 */

import type { Invite } from '../net/link';
import type { Message } from '../net/messages';
import { parseMessage } from '../net/messages';
import { createGuest, createHost, type HostPeer, InvalidCodeError, type Peer } from '../net/peer';
import { enterRoom } from '../net/room';
import { newRoomCode } from '../net/room-code';

export type Role = 'host' | 'guest';
export type Method = 'room' | 'code';

export type LinkStatus =
  | 'idle' // noch nichts passiert
  | 'preparing' // der eigene Code entsteht
  | 'waiting' // der eigene Code ist zu sehen, die Gegenseite ist dran
  | 'connecting' // beide Codes sind ausgetauscht, die Geräte suchen sich
  | 'connected'
  | 'lost' // war verbunden, jetzt nicht mehr
  | 'failed';

/** So lange dürfen sich die Geräte nach dem Austausch suchen (ms) */
const CONNECT_LIMIT = 20000;
/** So lange sucht ein Gast nach dem Raum, bevor er aufgibt (ms) */
const ROOM_LIMIT = 30000;

class OnlineState {
  role = $state<Role | null>(null);
  method = $state<Method>('room');
  status = $state<LinkStatus>('idle');
  /** Raum-Code, z. B. „K7M4X“ – bleibt nach einer Unterbrechung für den Wiedereinstieg stehen */
  roomCode = $state('');
  /** Beim Austausch zweier Codes: der eigene Code, den die Gegenseite scannen oder einfügen soll */
  code = $state('');
  myName = $state('');
  peerName = $state('');
  error = $state('');
  /** Das Verbindungsfenster ist offen */
  sheetOpen = $state(false);
  /** Eine Einladung aus einem geöffneten Link, die gleich angenommen wird */
  linkInvite = $state<Invite | null>(null);

  get connected(): boolean {
    return this.status === 'connected';
  }
}

export const online = new OnlineState();

let peer: Peer | HostPeer | null = null;
/** Zählt jede neue Verbindung – Nachzügler einer alten Verbindung werden so erkannt und übergangen */
let generation = 0;
let connectTimer: ReturnType<typeof setTimeout> | undefined;
let receive: (message: Message) => void = () => {};
let opened: () => void = () => {};

/** online-flow.ts meldet sich hier an, um Nachrichten und das Zustandekommen der Verbindung zu bearbeiten. */
export function onLink(handlers: { message(message: Message): void; open(): void }): void {
  receive = handlers.message;
  opened = handlers.open;
}

export function send(message: Message): void {
  peer?.send(JSON.stringify(message));
}

/** Ereignisse genau einer Verbindung; meldet sich eine ältere noch, wird das übergangen. */
function handlersFor(own: number) {
  const current = (): boolean => own === generation;
  return {
    onopen(): void {
      if (current()) connectedNow();
    },
    onmessage(data: string): void {
      const message = current() ? parseMessage(data) : null;
      if (message) receive(message);
    },
    onclose(): void {
      if (current() && online.status === 'connected') online.status = 'lost';
    },
    onfail(): void {
      if (current())
        fail('Die Geräte haben keinen Weg zueinander gefunden. Am zuverlässigsten klappt es im selben WLAN.');
    },
  };
}

function connectedNow(): void {
  clearTimeout(connectTimer);
  online.status = 'connected';
  online.error = '';
  send({ type: 'hello', name: online.myName });
  opened();
}

/** Gastgeber*in: Raum öffnen und auf das andere Gerät warten. */
export function createRoom(name: string, code = newRoomCode()): void {
  reset('host', name, 'room');
  online.roomCode = code;
  try {
    peer = enterRoom(code, handlersFor(generation));
    online.status = 'waiting';
  } catch (error) {
    fail(describe(error));
  }
}

/** Gast: dem Raum mit diesem Code beitreten. */
export function joinRoom(code: string, name: string): void {
  reset('guest', name, 'room');
  online.roomCode = code;
  try {
    peer = enterRoom(code, handlersFor(generation));
    online.status = 'connecting';
    waitForConnection(
      ROOM_LIMIT,
      `Im Raum ${code} ist niemand. Stimmt der Code, und ist das Verbindungsfenster auf dem anderen Gerät noch offen?`,
    );
  } catch (error) {
    fail(describe(error));
  }
}

/** Gastgeber*in: Einladung als Code erstellen (ohne Relays). */
export async function invite(name: string): Promise<void> {
  reset('host', name, 'code');
  try {
    const host = await createHost(handlersFor(generation));
    peer = host;
    online.code = host.code;
    online.status = 'waiting';
  } catch (error) {
    fail(describe(error));
  }
}

/** Gastgeber*in: den Antwort-Code des Gastes annehmen. */
export async function acceptAnswer(code: string): Promise<void> {
  if (online.role !== 'host' || !peer || !('accept' in peer)) return;
  try {
    await peer.accept(code);
    online.error = '';
    online.status = 'connecting';
    waitForConnection(
      CONNECT_LIMIT,
      'Die Verbindung kam nicht zustande. Am zuverlässigsten klappt es, wenn beide Geräte im selben WLAN sind.',
    );
  } catch (error) {
    // ein falscher Code ist kein Grund, alles neu zu beginnen
    online.error = describe(error);
  }
}

/** Gast: Einladung als Code annehmen und den Antwort-Code erzeugen. */
export async function join(code: string, name: string): Promise<void> {
  reset('guest', name, 'code');
  online.status = 'preparing';
  try {
    peer = await createGuest(code, handlersFor(generation));
    online.code = peer.code;
    online.status = 'waiting';
  } catch (error) {
    online.status = 'idle';
    online.error = describe(error);
  }
}

/**
 * Nach einer Unterbrechung oder einem Fehlschlag wieder zueinanderfinden – auf demselben Weg wie zuvor.
 * Ein offener Raum bleibt einfach offen: Kommt das andere Gerät zurück, geht es von selbst weiter.
 */
export function reconnect(): void {
  const { role, method, roomCode, myName } = online;
  if (method === 'room' && role === 'host' && peer) {
    online.status = 'waiting';
    online.error = '';
  } else if (method === 'room' && role === 'host') {
    createRoom(myName, roomCode || undefined);
  } else if (method === 'room' && role === 'guest' && roomCode) {
    joinRoom(roomCode, myName);
  } else if (role === 'host') {
    void invite(myName);
  } else {
    close();
    online.status = 'idle';
    online.code = '';
    online.error = '';
  }
  online.sheetOpen = true;
}

/** Verbindung beenden und alles vergessen. */
export function disconnect(): void {
  close();
  online.role = null;
  online.method = 'room';
  online.roomCode = '';
  online.status = 'idle';
  online.code = '';
  online.peerName = '';
  online.error = '';
}

function reset(role: Role, name: string, method: Method): void {
  close();
  online.role = role;
  online.method = method;
  online.myName = name;
  online.status = 'preparing';
  online.code = '';
  online.error = '';
}

function close(): void {
  generation++;
  clearTimeout(connectTimer);
  const old = peer;
  peer = null;
  old?.close();
}

function waitForConnection(limit: number, message: string): void {
  clearTimeout(connectTimer);
  connectTimer = setTimeout(() => {
    if (online.status === 'connecting') fail(message);
  }, limit);
}

function fail(message: string): void {
  close();
  online.status = 'failed';
  online.error = message;
}

function describe(error: unknown): string {
  if (error instanceof InvalidCodeError)
    return `${error.message} Prüfe, ob du den richtigen Code erwischt hast.`;
  if (typeof RTCPeerConnection === 'undefined')
    return 'Dieser Browser kann keine direkten Verbindungen aufbauen.';
  return 'Etwas ist beim Verbinden schiefgegangen. Versucht es bitte noch einmal.';
}
