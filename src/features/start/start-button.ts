/**
 * Der Start-Knopf der Startseite. Er heißt immer „Spiel starten“ – an zwei Geräten bleibt er grau, bis es losgehen
 * kann, und darunter steht, warum noch nicht. Der Gast startet nie selbst: Darunter steht, wer startet. (Stünde das
 * im Knopf, bräche er bei langen Namen auf dem Handy in eine eigene Zeile um.)
 */
import type { Role } from '../../state/online.svelte';

export interface StartButton {
  label: string;
  disabled: boolean;
  /** Warum es noch nicht losgehen kann – steht unter dem Knopf */
  reason: string | null;
}

/** Was der Knopf über die Verbindung zum 2. Gerät wissen muss */
export interface Link {
  role: Role | null;
  connected: boolean;
  /** Ein Raum ist offen oder die Geräte suchen sich gerade */
  pending: boolean;
  /** Verbunden, aber das andere Gerät antwortet gerade nicht */
  silent: boolean;
  peerName: string;
}

const READY: StartButton = { label: 'Spiel starten', disabled: false, reason: null };

const blocked = (reason: string): StartButton => ({ label: 'Spiel starten', disabled: true, reason });

export function startButton(onlineMode: boolean, link: Link): StartButton {
  if (!onlineMode) return READY;
  const peer = link.peerName || 'Das andere Gerät';
  if (link.role === 'guest' && link.connected) return blocked(`${peer} startet das Spiel.`);
  if (!link.connected && link.pending) return blocked('Warte auf das andere Gerät …');
  if (!link.connected) return blocked('Verbinde erst ein 2. Gerät – oben bei „Gegenüber“.');
  if (link.silent) return blocked(`${peer} antwortet gerade nicht.`);
  return READY;
}
