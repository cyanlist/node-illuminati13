/**
 * Eine direkte Verbindung zwischen zwei Browsern (WebRTC-Datenkanal), ganz ohne eigenen Server.
 * Gastgeber*in erzeugt eine Einladung, der Gast antwortet darauf; beides wird als Code ausgetauscht
 * (QR-Code oder Text). Danach laufen Nachrichten direkt zwischen den Geräten.
 */
import { decodeSignal, encodeSignal, fromSdp, type SignalKind, toSdp } from './signal';

/**
 * Ein öffentlicher STUN-Dienst verrät jedem Gerät, wie es von außen erreichbar ist – nötig, wenn die Geräte
 * nicht im selben WLAN sind. Er sieht nur die Adresse, keine Spieldaten.
 */
const ICE_SERVERS: RTCIceServer[] = [{ urls: 'stun:stun.l.google.com:19302' }];

/** So lange sammelt der Browser höchstens Adressen, bevor der Code entsteht (ms) */
const GATHER_LIMIT = 4000;
/** Nach der ersten Adresse noch so lange auf weitere warten (ms) */
const GATHER_AFTER_FIRST = 1500;

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

export interface HostPeer extends Peer {
  /** Nimmt den Antwort-Code des Gastes an; danach baut sich die Verbindung auf. */
  accept(answerCode: string): Promise<void>;
}

export class InvalidCodeError extends Error {}

/** Gastgeber*in: erstellt eine Einladung. */
export async function createHost(handlers: PeerHandlers): Promise<HostPeer> {
  const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
  const channel = pc.createDataChannel('illuminati13', { ordered: true });
  wire(channel, handlers);
  watch(pc, handlers);
  await pc.setLocalDescription(await pc.createOffer());
  const code = await ownCode(pc, 'offer');

  return {
    code,
    send: (data) => channel.readyState === 'open' && channel.send(data),
    close: () => pc.close(),
    async accept(answerCode) {
      const signal = decodeSignal(answerCode);
      if (signal?.kind !== 'answer') throw new InvalidCodeError('Das ist kein Antwort-Code.');
      await pc.setRemoteDescription({ type: 'answer', sdp: toSdp(signal) });
    },
  };
}

/** Gast: nimmt eine Einladung an und erzeugt den Antwort-Code. */
export async function createGuest(offerCode: string, handlers: PeerHandlers): Promise<Peer> {
  const signal = decodeSignal(offerCode);
  if (signal?.kind !== 'offer') throw new InvalidCodeError('Das ist kein Einladungs-Code.');

  const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
  let channel: RTCDataChannel | null = null;
  pc.ondatachannel = (event) => {
    channel = event.channel;
    wire(channel, handlers);
  };
  watch(pc, handlers);
  await pc.setRemoteDescription({ type: 'offer', sdp: toSdp(signal) });
  await pc.setLocalDescription(await pc.createAnswer());
  const code = await ownCode(pc, 'answer');

  return {
    code,
    send: (data) => channel?.readyState === 'open' && channel.send(data),
    close: () => pc.close(),
  };
}

function wire(channel: RTCDataChannel, handlers: PeerHandlers): void {
  channel.onopen = () => handlers.onopen();
  channel.onclose = () => handlers.onclose();
  channel.onmessage = (event) => {
    if (typeof event.data === 'string') handlers.onmessage(event.data);
  };
}

function watch(pc: RTCPeerConnection, handlers: PeerHandlers): void {
  pc.onconnectionstatechange = () => {
    if (pc.connectionState === 'failed') handlers.onfail();
  };
}

/** Wartet, bis der Browser seine Adressen gesammelt hat, und macht daraus den Code. */
async function ownCode(pc: RTCPeerConnection, kind: SignalKind): Promise<string> {
  await gathered(pc);
  const sdp = pc.localDescription?.sdp;
  if (!sdp) throw new Error('Der Browser hat keine Verbindungsdaten erzeugt.');
  return encodeSignal(fromSdp(sdp, kind));
}

function gathered(pc: RTCPeerConnection): Promise<void> {
  return new Promise((resolve) => {
    if (pc.iceGatheringState === 'complete') return resolve();
    let soon: ReturnType<typeof setTimeout> | undefined;
    const done = (): void => {
      clearTimeout(limit);
      clearTimeout(soon);
      pc.removeEventListener('icegatheringstatechange', onState);
      pc.removeEventListener('icecandidate', onCandidate);
      resolve();
    };
    const onState = (): void => {
      if (pc.iceGatheringState === 'complete') done();
    };
    // manche Netze antworten nie – dann reicht, was bis kurz nach der ersten Adresse da ist
    const onCandidate = (event: RTCPeerConnectionIceEvent): void => {
      if (event.candidate && !soon) soon = setTimeout(done, GATHER_AFTER_FIRST);
    };
    const limit = setTimeout(done, GATHER_LIMIT);
    pc.addEventListener('icegatheringstatechange', onState);
    pc.addEventListener('icecandidate', onCandidate);
  });
}
