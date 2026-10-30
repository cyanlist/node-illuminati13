import { describe, expect, it } from 'vitest';
import { parseInvite } from '../src/net/link';
import { newRoomCode, normalizeRoomCode } from '../src/net/room-code';
import { decodeSignal, encodeSignal, fromSdp, toSdp } from '../src/net/signal';
import { seededRng } from './helpers';

// gekürztes Angebot, wie Chrome es für eine reine Datenverbindung erzeugt
const CHROME_OFFER = [
  'v=0',
  'o=- 4611731400430051336 2 IN IP4 127.0.0.1',
  's=-',
  't=0 0',
  'a=group:BUNDLE 0',
  'a=extmap-allow-mixed',
  'a=msid-semantic: WMS',
  'm=application 54321 UDP/DTLS/SCTP webrtc-datachannel',
  'c=IN IP4 203.0.113.7',
  'a=candidate:1467250027 1 udp 2122260223 3f1c2a9e-7b1d-4c55-9a2e-1b6d0c8e4f21.local 54321 typ host generation 0 network-id 1',
  'a=candidate:1467250027 1 tcp 1518280447 3f1c2a9e-7b1d-4c55-9a2e-1b6d0c8e4f21.local 9 typ host tcptype active generation 0',
  'a=candidate:842163049 1 udp 1686052607 203.0.113.7 61002 typ srflx raddr 0.0.0.0 rport 0 generation 0',
  'a=ice-ufrag:Kq3e',
  'a=ice-pwd:Xb9aRrGkL7cY2mD1pZvTqW0e',
  'a=ice-options:trickle',
  'a=fingerprint:sha-256 0A:1B:2C:3D:4E:5F:60:71:82:93:A4:B5:C6:D7:E8:F9:0A:1B:2C:3D:4E:5F:60:71:82:93:A4:B5:C6:D7:E8:F9',
  'a=setup:actpass',
  'a=mid:0',
  'a=sctp-port:5000',
  'a=max-message-size:262144',
  '',
].join('\r\n');

describe('Verbindungs-Code', () => {
  it('fasst ein Angebot kurz zusammen und liest es verlustfrei zurück', () => {
    const signal = fromSdp(CHROME_OFFER, 'offer');
    const code = encodeSignal(signal);
    expect(code.length).toBeLessThan(160);
    expect(code).toMatch(/^I13~A~x~Kq3e~/);
    expect(decodeSignal(code)).toEqual(signal);
  });

  it('nimmt nur UDP-Adressen mit, jede nur einmal', () => {
    const { candidates } = fromSdp(CHROME_OFFER, 'offer');
    expect(candidates).toEqual([
      { type: 'host', address: '3f1c2a9e-7b1d-4c55-9a2e-1b6d0c8e4f21.local', port: 54321 },
      { type: 'srflx', address: '203.0.113.7', port: 61002 },
    ]);
  });

  it('baut daraus wieder ein SDP mit allen nötigen Angaben', () => {
    const sdp = toSdp(fromSdp(CHROME_OFFER, 'offer'));
    expect(sdp).toContain('a=ice-ufrag:Kq3e\r\n');
    expect(sdp).toContain('a=ice-pwd:Xb9aRrGkL7cY2mD1pZvTqW0e\r\n');
    expect(sdp).toContain('a=fingerprint:sha-256 0A:1B:2C:3D:4E:5F:60:71:82:93:A4:B5:C6:D7:E8:F9:0A:1B');
    expect(sdp).toContain('a=setup:actpass\r\n');
    expect(sdp).toContain('typ srflx raddr 0.0.0.0 rport 0');
    // das neu gebaute SDP lässt sich wieder lesen und ergibt dasselbe
    expect(fromSdp(sdp, 'offer')).toEqual(fromSdp(CHROME_OFFER, 'offer'));
  });

  it('erkennt fremde oder beschädigte Codes', () => {
    const code = encodeSignal(fromSdp(CHROME_OFFER, 'offer'));
    expect(decodeSignal('hallo')).toBeNull();
    expect(decodeSignal(code.replace('~A~', '~Z~'))).toBeNull();
    expect(decodeSignal(code.slice(0, 40))).toBeNull();
    expect(decodeSignal(`${code}~q1.2.3.4,5`)).toBeNull();
  });
});

describe('Einladungen', () => {
  it('erkennt Raum-Codes – auch klein geschrieben, mit Leerzeichen oder als Link', () => {
    expect(parseInvite('K7M4X')).toEqual({ type: 'room', room: 'K7M4X' });
    expect(parseInvite(' k7m 4x ')).toEqual({ type: 'room', room: 'K7M4X' });
    expect(parseInvite('https://example.org/illuminati13/#raum=K7M4X')).toEqual({
      type: 'room',
      room: 'K7M4X',
    });
    expect(parseInvite('K7M4')).toBeNull();
    expect(parseInvite('hallo')).toBeNull();
  });

  it('erkennt lange Codes – auch als Link', () => {
    const code = encodeSignal(fromSdp(CHROME_OFFER, 'offer'));
    expect(parseInvite(`  ${code}\n`)).toEqual({ type: 'code', code });
    expect(parseInvite(`https://example.org/x/#beitreten=${encodeURI(code)}`)).toEqual({
      type: 'code',
      code,
    });
    expect(parseInvite(`https://example.org/#beitreten=${encodeURIComponent(code)}`)).toEqual({
      type: 'code',
      code,
    });
  });

  it('erzeugt Raum-Codes ohne leicht verwechselbare Zeichen', () => {
    const rng = seededRng(3);
    const codes = Array.from({ length: 200 }, () => newRoomCode(rng));
    for (const code of codes) {
      expect(code).toMatch(/^[A-Z2-9]{5}$/);
      expect(code).not.toMatch(/[01OIL]/);
      expect(normalizeRoomCode(code.toLowerCase())).toBe(code);
    }
    expect(new Set(codes).size).toBeGreaterThan(195);
  });
});
