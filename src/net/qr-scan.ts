/**
 * QR-Codes mit der Kamera lesen. Gelesen wird mit dem eingebauten BarcodeDetector, wo es ihn gibt
 * (Chrome auf Android), sonst mit jsQR (z. B. Safari auf dem iPhone).
 */
import jsQR from 'jsqr';

interface Detector {
  detect(source: CanvasImageSource): Promise<{ rawValue: string }[]>;
}

declare global {
  interface Window {
    BarcodeDetector?: new (options: { formats: string[] }) => Detector;
  }
}

/**
 * Darf die Seite überhaupt nach der Kamera fragen? Eingebettet (z. B. als Claude-Artifact) ist sie oft
 * gesperrt – dann gar nicht erst anbieten. Browser ohne diese Auskunft probieren es einfach.
 */
export function cameraAllowed(): boolean {
  if (!hasCamera()) return false;
  const policy = (document as Document & { featurePolicy?: { allowsFeature(name: string): boolean } })
    .featurePolicy;
  return policy ? policy.allowsFeature('camera') : true;
}

/** Kann dieser Browser überhaupt eine Kamera öffnen? */
const hasCamera = (): boolean => !!navigator.mediaDevices?.getUserMedia;

/** So oft wird ein Kamerabild geprüft (ms) */
const SCAN_EVERY = 200;

export class CameraError extends Error {}

/**
 * Startet die Rückkamera im Video-Element und meldet den ersten gelesenen Code.
 * Gibt eine Funktion zurück, die Kamera und Suche wieder beendet.
 */
export async function scanQr(video: HTMLVideoElement, onCode: (text: string) => void): Promise<() => void> {
  if (!hasCamera()) throw new CameraError('Dieser Browser erlaubt hier keinen Zugriff auf die Kamera.');
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
      audio: false,
    });
  } catch {
    throw new CameraError('Die Kamera ließ sich nicht öffnen – vielleicht wurde der Zugriff abgelehnt.');
  }
  video.srcObject = stream;
  video.setAttribute('playsinline', ''); // iPhone: im Bild bleiben statt Vollbild
  await video.play().catch(() => {});

  const detector = window.BarcodeDetector ? new window.BarcodeDetector({ formats: ['qr_code'] }) : null;
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { willReadFrequently: true });
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const stop = (): void => {
    stopped = true;
    clearTimeout(timer);
    for (const track of stream.getTracks()) track.stop();
    video.srcObject = null;
  };

  const look = async (): Promise<void> => {
    if (stopped) return;
    const text = video.readyState >= 2 ? await read(video, detector, canvas, context) : null;
    if (stopped) return;
    if (text) {
      stop();
      onCode(text);
    } else {
      timer = setTimeout(look, SCAN_EVERY);
    }
  };
  void look();
  return stop;
}

async function read(
  video: HTMLVideoElement,
  detector: Detector | null,
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D | null,
): Promise<string | null> {
  if (detector) {
    const [found] = await detector.detect(video).catch(() => []);
    return found?.rawValue ?? null;
  }
  if (!context || !video.videoWidth) return null;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0);
  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  return jsQR(image.data, image.width, image.height, { inversionAttempts: 'dontInvert' })?.data ?? null;
}
