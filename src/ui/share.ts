/**
 * Ein Bild weitergeben: auf Handys über das Teilen-Menü des Geräts (WhatsApp, Signal, Mail …), am Rechner – und wo
 * das Menü gesperrt ist – in die Zwischenablage zum Einfügen in einen Chat, notfalls als Datei speichern.
 *
 * Wichtig: Das Bild muss schon fertig sein, wenn jemand tippt. Telefone erlauben das Teilen nur unmittelbar nach dem
 * Tippen – deshalb geht hier vor dem Aufruf nichts Wartendes voraus.
 */

export type ShareOutcome = 'shared' | 'copied' | 'saved' | 'cancelled' | 'failed';

export async function shareImage(image: Blob, fileName: string, caption: string): Promise<ShareOutcome> {
  const file = new File([image], fileName, { type: image.type });
  const touch = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
  if (touch && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text: caption });
      return 'shared';
    } catch (error) {
      // abgebrochen heißt: bewusst nicht geteilt; alles andere (gesperrt) → kopieren oder speichern
      if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled';
    }
  }
  if (await copyImage(image)) return 'copied';
  return saveFile(file) ? 'saved' : 'failed';
}

async function copyImage(image: Blob): Promise<boolean> {
  try {
    if (typeof ClipboardItem === 'undefined' || !navigator.clipboard?.write) return false;
    await navigator.clipboard.write([new ClipboardItem({ [image.type]: image })]);
    return true;
  } catch {
    return false;
  }
}

/**
 * Als Datei herunterladen – der letzte Ausweg. Eingebettet (Claude-Artifact) dürfen Seiten nichts herunterladen;
 * dort lieber ehrlich „ging nicht“ melden als „gespeichert“.
 */
function saveFile(file: File): boolean {
  if (window.top !== window.self) return false;
  try {
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
    return true;
  } catch {
    return false;
  }
}
