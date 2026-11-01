/**
 * Was beide Verbindungswege gemeinsam haben – per Code (peer.ts) und per Raum-Code (room.ts): eine offene
 * Verbindung zum anderen Gerät und die Ereignisse, die sie meldet.
 */

/**
 * Ein öffentlicher STUN-Dienst verrät jedem Gerät, wie es von außen erreichbar ist – nötig, wenn die Geräte
 * nicht im selben WLAN sind. Er sieht nur die Adresse, keine Spieldaten.
 */
export const ICE_SERVERS: RTCIceServer[] = [{ urls: 'stun:stun.l.google.com:19302' }];

export interface PeerHandlers {
  onopen(): void;
  onmessage(data: string): void;
  onclose(): void;
  /** Die Geräte finden keinen Weg zueinander (z. B. verschiedene Netze, die sich abschotten) */
  onfail(): void;
}

export interface Peer {
  /** Der eigene Code für die Gegenseite */
  code: string;
  send(data: string): void;
  close(): void;
}
