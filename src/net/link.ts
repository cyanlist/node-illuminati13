/**
 * Einladungen als Link: Läuft die App unter einer eigenen Web-Adresse, steckt der Einladungs-Code
 * hinter dem #. Wer den Link öffnet – per Messenger oder mit der normalen Kamera-App über den
 * QR-Code –, landet direkt beim Beitreten.
 */

const KEY = 'beitreten';

/** Link mit Einladung – null, wenn die App eingebettet läuft (z. B. als Claude-Artifact) und kein Link möglich ist. */
export function inviteLink(code: string): string | null {
  if (!/^https?:$/.test(location.protocol) || window.top !== window.self) return null;
  // die Zeichen eines Codes sind hinter dem # alle erlaubt – encodeURI hält den Link (und QR-Code) kurz
  return `${location.origin}${location.pathname}#${KEY}=${encodeURI(code)}`;
}

/** Holt einen Einladungs-Code aus der Adresse und entfernt ihn dort wieder. */
export function codeFromAddress(): string | null {
  const code = extractCode(location.hash);
  if (code) history.replaceState(null, '', `${location.pathname}${location.search}`);
  return code;
}

/** Nimmt einen Code – oder einen ganzen Einladungs-Link – und gibt den reinen Code zurück. */
export function extractCode(text: string): string | null {
  const marker = `#${KEY}=`;
  const at = text.indexOf(marker);
  const code = at >= 0 ? decodeURIComponent(text.slice(at + marker.length)) : text;
  return code.trim() || null;
}
