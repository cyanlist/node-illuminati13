/**
 * Die Verbindung zu einem zweiten Gerät: wer einlädt und wer beitritt, auf welchem Weg, wie weit der Aufbau
 * ist und welcher Code gerade gezeigt wird. Was mit eingehenden Nachrichten passiert, steht in online-flow.ts.
 *
 * Zwei Wege: per Raum-Code (die Geräte finden sich über öffentliche Relays) oder – ganz ohne fremde Dienste –
 * per Austausch zweier Codes, als QR-Code oder Text.
 */

import type { Settings } from '../core/settings';
import { type Heartbeat, type Signal, startHeartbeat } from '../net/heartbeat';
import type { Invite } from '../net/link';
import { type Message, parseMessage } from '../net/messages';
import { createGuest, createHost, type HostPeer, InvalidCodeError } from '../net/peer';
import { enterRoom } from '../net/room';
import { newRoomCode } from '../net/room-code';
import type { Peer } from '../net/transport';

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

/**
 * Wie es um das Gegenüber steht – für den Platz auf der Startseite und den Punkt am Avatar am Tisch:
 * Verbindung wird aufgebaut, steht, wackelt oder ist weg (bzw. das Gegenüber antwortet nicht mehr).
 */
export type Presence = 'pending' | 'ok' | 'unstable' | 'lost';

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
  /** Als Gast: wie die Gastgeber*in das nächste Spiel gerade einstellt (null: noch nichts angekommen) */
  hostSettings = $state<Settings | null>(null);
  /** Bei bestehender Verbindung: kommen die Lebenszeichen des Gegenübers an? */
  signal = $state<Signal>('ok');
  /** Das Verbindungsfenster ist offen */
  sheetOpen = $state(false);
  /** Eine Einladung aus einem geöffneten Link, die gleich angenommen wird */
  linkInvite = $state<Invite | null>(null);

  get connected(): boolean {
    return this.status === 'connected';
  }

  /** Ein 2. Gerät ist verbunden, wird erwartet oder soll zurückkommen – dann bleibt der Bildschirm an */
  get active(): boolean {
    return this.status !== 'idle' && this.status !== 'failed';
  }

  /** null: Es ist noch niemand eingeladen oder beigetreten. */
  get presence(): Presence | null {
    if (this.status === 'connected')
      return this.signal === 'ok' ? 'ok' : this.signal === 'slow' ? 'unstable' : 'lost';
    if (this.status === 'lost' || this.status === 'failed') return 'lost';
    if (this.status === 'idle' && this.role === null) return null;
    return 'pending';
  }
}

export const online = new OnlineState();

let peer: Peer | HostPeer | null = null;
/** Zählt jede neue Verbindung – Nachzügler einer alten Verbindung werden so erkannt und übergangen */
let generation = 0;
let connectTimer: ReturnType<typeof setTimeout> | undefined;
let heartbeat: Heartbeat | null = null;
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

/** Öffnet das Verbindungsfenster – mit dem eigenen Namen, den das andere Gerät zu sehen bekommt. */
export function openConnect(name: string): void {
  online.myName = name.trim();
  online.sheetOpen = true;
}

/** Dieses Gerät tritt bei: Im Verbindungsfenster wird als Nächstes der Raum-Code eingegeben. */
export function chooseGuest(): void {
  online.role = 'guest';
  online.method = 'room';
  online.error = '';
}

/** Ereignisse genau einer Verbindung; meldet sich eine ältere noch, wird das übergangen. */
function handlersFor(own: number) {
  const current = (): boolean => own === generation;
  return {
    onopen(): void {
      if (current()) connectedNow();
    },
    onmessage(data: string): void {
      if (!current()) return;
      const message = parseMessage(data);
      // jede Nachricht zeigt, dass das Gegenüber noch da ist; Lebenszeichen selbst braucht der Spielablauf nicht
      heartbeat?.heard(message?.type === 'ping');
      if (message && message.type !== 'ping') receive(message);
    },
    onclose(): void {
      if (!current() || online.status !== 'connected') return;
      stopHeartbeat();
      online.status = 'lost';
    },
    onfail(): void {
      if (current())
        fail('Die Geräte haben keinen Weg zueinander gefunden. Am zuverlässigsten klappt es im selben WLAN.');
    },
  };
}

function connectedNow(): void {
  clearTimeout(connectTimer);
  setStatus('connected');
  stopHeartbeat();
  heartbeat = startHeartbeat({
    ping: () => send({ type: 'ping' }),
    onsignal: (signal) => (online.signal = signal),
  });
  send({ type: 'hello', name: online.myName });
  opened();
}

function stopHeartbeat(): void {
  heartbeat?.stop();
  heartbeat = null;
  online.signal = 'ok';
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
    setStatus('connecting');
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
    setStatus('idle', describe(error));
  }
}

/**
 * Nach einer Unterbrechung oder einem Fehlschlag wieder zueinanderfinden – auf demselben Weg wie zuvor.
 * Ein offener Raum bleibt einfach offen: Kommt das andere Gerät zurück, geht es von selbst weiter. Gilt die
 * Verbindung noch als offen, antwortet das Gegenüber aber nicht mehr, wird der Raum neu betreten.
 */
export function reconnect(): void {
  const { role, method, roomCode, myName } = online;
  if (method === 'room' && role === 'host' && peer && online.status !== 'connected') {
    setStatus('waiting');
  } else if (method === 'room' && role === 'host') {
    createRoom(myName, roomCode || undefined);
  } else if (method === 'room' && role === 'guest' && roomCode) {
    joinRoom(roomCode, myName);
  } else if (role === 'host') {
    void invite(myName);
  } else {
    close();
    online.code = '';
    setStatus('idle');
  }
  online.sheetOpen = true;
}

/** Verbindung beenden und alles vergessen. */
export function disconnect(): void {
  close();
  online.role = null;
  online.method = 'room';
  online.roomCode = '';
  online.code = '';
  online.peerName = '';
  online.hostSettings = null;
  setStatus('idle');
}

function reset(role: Role, name: string, method: Method): void {
  close();
  online.role = role;
  online.method = method;
  online.myName = name;
  online.code = '';
  online.hostSettings = null;
  setStatus('preparing');
}

/** Neuer Stand des Aufbaus – eine alte Fehlermeldung verschwindet dabei. */
function setStatus(status: LinkStatus, error = ''): void {
  online.status = status;
  online.error = error;
}

function close(): void {
  generation++;
  clearTimeout(connectTimer);
  stopHeartbeat();
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
  setStatus('failed', message);
}

function describe(error: unknown): string {
  if (error instanceof InvalidCodeError)
    return `${error.message} Prüfe, ob du den richtigen Code erwischt hast.`;
  if (typeof RTCPeerConnection === 'undefined')
    return 'Dieser Browser kann keine direkten Verbindungen aufbauen.';
  return 'Etwas ist beim Verbinden schiefgegangen. Versucht es bitte noch einmal.';
}
