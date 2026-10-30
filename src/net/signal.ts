/**
 * Die „Visitenkarte“ einer WebRTC-Verbindung als kurzer Code. Ein Browser beschreibt sich mit einem
 * SDP-Text von 1–3 KB – zu viel für einen gut scanbaren QR-Code. Für eine reine Datenverbindung reichen
 * aber wenige Angaben: Zugangsdaten (ufrag, pwd), der Fingerabdruck des Schlüssels und die Adressen.
 * Daraus baut die Gegenseite wieder ein vollständiges SDP.
 *
 * Aufbau: I13~<A|B>~<setup>~<ufrag>~<pwd>~<fingerprint base64url>~<kandidat>~<kandidat>…
 * A = Einladung (offer), B = Antwort (answer); Kandidat = Art (h/m/s) + Adresse + "," + Port.
 */

export type SignalKind = 'offer' | 'answer';

/** Wer bei der Verschlüsselung den ersten Schritt macht (a=setup) */
type Setup = 'actpass' | 'active' | 'passive';

interface Candidate {
  /** host = Adresse im eigenen Netz, srflx = Adresse von außen (über STUN ermittelt) */
  type: 'host' | 'srflx';
  address: string;
  port: number;
}

export interface Signal {
  kind: SignalKind;
  setup: Setup;
  ufrag: string;
  pwd: string;
  /** SHA-256 des Zertifikats, 32 Bytes */
  fingerprint: Uint8Array;
  candidates: Candidate[];
}

const PREFIX = 'I13';
const SEP = '~';
/** Mehr Adressen helfen selten, machen den QR-Code aber dichter */
const MAX_CANDIDATES = 6;
const MDNS_SUFFIX = '.local';

/* ---------- SDP → Signal ---------- */

/** Liest die nötigen Angaben aus dem SDP des eigenen Browsers. */
export function fromSdp(sdp: string, kind: SignalKind): Signal {
  const attr = (name: string): string => {
    const line = sdp.split(/\r?\n/).find((l) => l.startsWith(`a=${name}:`));
    if (!line) throw new Error(`Im SDP fehlt a=${name}.`);
    return line.slice(name.length + 3).trim();
  };
  const [algorithm, hex = ''] = attr('fingerprint').split(' ');
  if (algorithm?.toLowerCase() !== 'sha-256') throw new Error('Unbekannter Fingerabdruck im SDP.');

  return {
    kind,
    setup: attr('setup') as Setup,
    ufrag: attr('ice-ufrag'),
    pwd: attr('ice-pwd'),
    fingerprint: Uint8Array.from(hex.split(':').map((byte) => Number.parseInt(byte, 16))),
    candidates: parseCandidates(sdp),
  };
}

/** a=candidate:<foundation> <component> <protocol> <priority> <address> <port> typ <type> … */
function parseCandidates(sdp: string): Candidate[] {
  const found: Candidate[] = [];
  for (const line of sdp.split(/\r?\n/)) {
    if (!line.startsWith('a=candidate:')) continue;
    const [, component, protocol, , address, port, , type] = line.slice(12).split(' ');
    if (component !== '1' || protocol?.toLowerCase() !== 'udp') continue;
    if ((type !== 'host' && type !== 'srflx') || !address) continue;
    if (found.some((c) => c.address === address && c.port === Number(port))) continue;
    found.push({ type, address, port: Number(port) });
  }
  return found.slice(0, MAX_CANDIDATES);
}

/* ---------- Signal → SDP ---------- */

const PRIORITY = { host: 2122260223, srflx: 1686052607 };

/** Baut aus dem Code der Gegenseite ein SDP, das jeder aktuelle Browser annimmt. */
export function toSdp(signal: Signal): string {
  const fingerprint = [...signal.fingerprint]
    .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
    .join(':');
  const candidates = signal.candidates.map((c, i) => {
    const related = c.type === 'srflx' ? ' raddr 0.0.0.0 rport 0' : '';
    return `a=candidate:${i + 1} 1 udp ${PRIORITY[c.type]} ${c.address} ${c.port} typ ${c.type}${related}`;
  });
  return [
    'v=0',
    'o=- 1 2 IN IP4 127.0.0.1',
    's=-',
    't=0 0',
    'a=group:BUNDLE 0',
    'a=msid-semantic: WMS',
    'm=application 9 UDP/DTLS/SCTP webrtc-datachannel',
    'c=IN IP4 0.0.0.0',
    ...candidates,
    'a=end-of-candidates',
    `a=ice-ufrag:${signal.ufrag}`,
    `a=ice-pwd:${signal.pwd}`,
    `a=fingerprint:sha-256 ${fingerprint}`,
    `a=setup:${signal.setup}`,
    'a=mid:0',
    'a=sctp-port:5000',
    'a=max-message-size:262144',
    '',
  ].join('\r\n');
}

/* ---------- Signal ↔ Code ---------- */

const SETUP_CODES: Record<Setup, string> = { actpass: 'x', active: 'a', passive: 'p' };

export function encodeSignal(signal: Signal): string {
  const candidates = signal.candidates.map((c) => {
    if (c.type === 'host' && c.address.endsWith(MDNS_SUFFIX))
      return `m${c.address.slice(0, -MDNS_SUFFIX.length)},${c.port}`;
    return `${c.type === 'host' ? 'h' : 's'}${c.address},${c.port}`;
  });
  return [
    PREFIX,
    signal.kind === 'offer' ? 'A' : 'B',
    SETUP_CODES[signal.setup],
    signal.ufrag,
    signal.pwd,
    toBase64Url(signal.fingerprint),
    ...candidates,
  ].join(SEP);
}

/** Liest einen Code; null, wenn er nicht von dieser App stammt oder beschädigt ist. */
export function decodeSignal(code: string): Signal | null {
  const [prefix, kind, setup, ufrag, pwd, fingerprint, ...candidates] = code.trim().split(SEP);
  if (prefix !== PREFIX || (kind !== 'A' && kind !== 'B') || !ufrag || !pwd || !fingerprint) return null;
  const setupKey = (Object.keys(SETUP_CODES) as Setup[]).find((key) => SETUP_CODES[key] === setup);
  const bytes = fromBase64Url(fingerprint);
  if (!setupKey || bytes?.length !== 32) return null;

  const parsed: Candidate[] = [];
  for (const entry of candidates) {
    const comma = entry.lastIndexOf(',');
    const port = Number(entry.slice(comma + 1));
    const address = entry.slice(1, comma);
    if (comma < 2 || !Number.isInteger(port) || port <= 0 || port > 65535) return null;
    if (entry[0] === 'm') parsed.push({ type: 'host', address: `${address}${MDNS_SUFFIX}`, port });
    else if (entry[0] === 'h') parsed.push({ type: 'host', address, port });
    else if (entry[0] === 's') parsed.push({ type: 'srflx', address, port });
    else return null;
  }
  return {
    kind: kind === 'A' ? 'offer' : 'answer',
    setup: setupKey,
    ufrag,
    pwd,
    fingerprint: bytes,
    candidates: parsed,
  };
}

function toBase64Url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function fromBase64Url(text: string): Uint8Array | null {
  try {
    const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/'));
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
  } catch {
    return null;
  }
}
