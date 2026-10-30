/**
 * Die Verbindung zu einem zweiten Gerät: wer einlädt und wer beitritt, wie weit der Aufbau ist und
 * welcher Code gerade gezeigt wird. Was mit eingehenden Nachrichten passiert, steht in online-flow.ts.
 */
import type { Message } from '../net/messages';
import { parseMessage } from '../net/messages';
import { createGuest, createHost, type HostPeer, InvalidCodeError, type Peer } from '../net/peer';

export type Role = 'host' | 'guest';

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

class OnlineState {
  role = $state<Role | null>(null);
  status = $state<LinkStatus>('idle');
  /** Der eigene Code, den die Gegenseite scannen oder einfügen soll */
  code = $state('');
  myName = $state('');
  peerName = $state('');
  error = $state('');
  /** Das Verbindungsfenster ist offen */
  sheetOpen = $state(false);
  /** Ein Einladungs-Code aus einem geöffneten Link, der gleich angenommen wird */
  linkCode = $state('');

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

/** Gastgeber*in: Einladung erstellen. */
export async function invite(name: string): Promise<void> {
  reset('host', name);
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
    waitForConnection();
  } catch (error) {
    // ein falscher Code ist kein Grund, alles neu zu beginnen
    online.error = describe(error);
  }
}

/** Gast: Einladung annehmen und den Antwort-Code erzeugen. */
export async function join(code: string, name: string): Promise<void> {
  reset('guest', name);
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

/** Neu beginnen, z. B. nach einer Unterbrechung – die Rolle bleibt. */
export function restart(): void {
  const role = online.role;
  close();
  online.role = role;
  online.status = 'idle';
  online.code = '';
  online.error = '';
}

/** Verbindung beenden und alles vergessen. */
export function disconnect(): void {
  close();
  online.role = null;
  online.status = 'idle';
  online.code = '';
  online.peerName = '';
  online.error = '';
}

function reset(role: Role, name: string): void {
  close();
  online.role = role;
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

function waitForConnection(): void {
  clearTimeout(connectTimer);
  connectTimer = setTimeout(() => {
    if (online.status === 'connecting')
      fail(
        'Die Verbindung kam nicht zustande. Am zuverlässigsten klappt es, wenn beide Geräte im selben WLAN sind.',
      );
  }, CONNECT_LIMIT);
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
