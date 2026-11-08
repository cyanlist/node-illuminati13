/**
 * Text weitergeben: auf Handys über das Teilen-Menü des Geräts (WhatsApp, Signal, Mail …), sonst – und wo das
 * Menü gesperrt ist, etwa eingebettet als Claude-Artifact – in die Zwischenablage.
 */

export type ShareOutcome = 'shared' | 'copied' | 'cancelled' | 'failed';

export async function shareOrCopy(title: string, text: string): Promise<ShareOutcome> {
  const touch = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
  if (touch && typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, text });
      return 'shared';
    } catch (error) {
      // abgebrochen heißt: bewusst nicht geteilt; alles andere (gesperrt) → kopieren
      if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled';
    }
  }
  return (await copyText(text)) ? 'copied' : 'failed';
}

/** In die Zwischenablage – notfalls über ein kurz eingefügtes, unsichtbares Textfeld. */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Zwischenablage gesperrt (eingebettet, ältere Browser) – dann der alte Weg
  }
  const field = document.createElement('textarea');
  field.value = text;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.opacity = '0';
  document.body.append(field);
  field.select();
  let copied = false;
  try {
    copied = document.execCommand('copy');
  } catch {
    copied = false;
  }
  field.remove();
  return copied;
}
