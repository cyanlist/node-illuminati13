/**
 * Verbinden per Raum-Code: Beide Geräte treten demselben „Raum“ bei und finden sich über öffentliche
 * Nostr-Relays (Bibliothek Trystero). Über die Relays laufen nur die Verbindungsdaten, verschlüsselt mit dem
 * Raum-Code als Passwort; das Spiel selbst läuft danach direkt zwischen den Geräten – wie beim QR-Code.
 */
import { joinRoom } from 'trystero/nostr';
import { ICE_SERVERS, type Peer, type PeerHandlers } from './peer';

/** Trennt dieses Spiel von allen anderen Apps, die dieselben Relays nutzen */
const APP_ID = 'illuminati13.cyanlist.v1';

/**
 * Tritt einem Raum bei. Verbunden ist man, sobald ein zweites Gerät im selben Raum ist; ein drittes wird
 * übergangen. Verlässt das Gegenüber den Raum, bleibt man drin – kommt es zurück, geht es nahtlos weiter.
 */
export function enterRoom(code: string, handlers: PeerHandlers): Peer {
  const room = joinRoom({ appId: APP_ID, password: code, rtcConfig: { iceServers: ICE_SERVERS } }, code);
  const channel = room.makeAction<string>('msg');
  let partner: string | null = null;

  room.onPeerJoin = (peerId) => {
    if (partner) return;
    partner = peerId;
    handlers.onopen();
  };
  room.onPeerLeave = (peerId) => {
    if (peerId !== partner) return;
    partner = null;
    handlers.onclose();
  };
  channel.onMessage = (data, { peerId }) => {
    if (peerId === partner && typeof data === 'string') handlers.onmessage(data);
  };

  return {
    code,
    send: (data) => {
      if (partner) void channel.send(data, { target: partner });
    },
    close: () => {
      partner = null;
      void room.leave();
    },
  };
}
