/**
 * Einladungen erkennen und als Link verschicken. Läuft die App unter einer eigenen Web-Adresse, steckt die
 * Einladung hinter dem # – wer den Link öffnet (per Messenger oder mit der Kamera-App über den QR-Code),
 * landet direkt beim Beitreten. Eingetippt oder eingefügt werden darf ebenso der reine Code.
 */
import { normalizeRoomCode } from './room-code';

/** #raum=K7M4X – Raum-Code; #beitreten=I13~… – langer Code ohne Relays */
const ROOM_KEY = 'raum';
const OFFER_KEY = 'beitreten';
const OFFER_PREFIX = 'I13~';

export type Invite = { type: 'room'; room: string } | { type: 'code'; code: string };

/** Link zu einem Raum – null, wenn die App eingebettet läuft (z. B. als Claude-Artifact) und kein Link möglich ist. */
export const roomLink = (room: string): string | null => link(ROOM_KEY, room);

/** Link mit einer Einladung als langem Code. */
export const offerLink = (code: string): string | null =>
  // die Zeichen eines Codes sind hinter dem # alle erlaubt – encodeURI hält den Link (und QR-Code) kurz
  link(OFFER_KEY, encodeURI(code));

function link(key: string, value: string): string | null {
  if (!/^https?:$/.test(location.protocol) || window.top !== window.self) return null;
  return `${location.origin}${location.pathname}#${key}=${value}`;
}

/** Holt eine Einladung aus der Adresse und entfernt sie dort wieder. */
export function inviteFromAddress(): Invite | null {
  const invite = location.hash ? parseInvite(location.hash) : null;
  if (invite) history.replaceState(null, '', `${location.pathname}${location.search}`);
  return invite;
}

/**
 * Erkennt, was jemand eingetippt, eingefügt oder gescannt hat: Raum-Code, langer Code (Einladung oder Antwort)
 * oder einen Link darauf.
 */
export function parseInvite(text: string): Invite | null {
  const value = (key: string): string | null => {
    const marker = `#${key}=`;
    const at = text.indexOf(marker);
    return at >= 0 ? decodeURIComponent(text.slice(at + marker.length)).trim() : null;
  };
  const roomValue = value(ROOM_KEY);
  const offerValue = value(OFFER_KEY) ?? text.trim();

  const room = normalizeRoomCode(roomValue ?? text);
  if (room) return { type: 'room', room };
  if (roomValue === null && offerValue.startsWith(OFFER_PREFIX)) return { type: 'code', code: offerValue };
  return null;
}
