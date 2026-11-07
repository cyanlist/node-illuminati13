/**
 * Das Spiel als App auf dem Startbildschirm: meldet den Service Worker an (build/sw.js – damit startet die App
 * auch ohne Netz) und merkt sich, ob der Browser einen eigenen Installieren-Dialog anbietet.
 *
 * Nur auf einer echten Web-Adresse (GitHub Pages, beim Testen localhost). Als Claude-Artifact (eingebettet in
 * eine fremde Seite) und als Einzeldatei per Doppelklick lässt sich nichts installieren.
 */

/** Chromes Angebot, die Seite zu installieren – fehlt in den Typen von TypeScript */
interface InstallPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const standalone = (): boolean =>
  typeof matchMedia === 'function' && matchMedia('(display-mode: standalone)').matches;

class AppInstall {
  /** Hier lässt sich installieren: eigene Web-Adresse, nicht eingebettet, nicht schon als App gestartet */
  possible = $state(false);
  /** Eben installiert – über den Dialog des Browsers */
  installed = $state(false);
  /** Der Browser bietet seinen eigenen Dialog an (Chrome, Edge) */
  prompt = $state<InstallPrompt | null>(null);
}

export const appInstall = new AppInstall();

export function initAppInstall(): void {
  if (!/^https?:$/.test(location.protocol) || window.top !== window.self) return;
  appInstall.possible = !standalone();

  window.addEventListener('beforeinstallprompt', (event) => {
    // nicht sofort zeigen – erst, wenn jemand in den Einstellungen auf „Als App installieren“ tippt
    event.preventDefault();
    appInstall.prompt = event as InstallPrompt;
  });
  window.addEventListener('appinstalled', () => {
    appInstall.installed = true;
    appInstall.prompt = null;
  });

  // im Entwicklungsmodus nicht: Dort soll jede Änderung sofort zu sehen sein
  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    // erst nach dem Laden, damit der Start der Seite nicht wartet
    if (document.readyState === 'complete') registerWorker();
    else window.addEventListener('load', registerWorker, { once: true });
  }
}

function registerWorker(): void {
  navigator.serviceWorker.register('./sw.js').catch(() => {
    // ohne Service Worker geht es auch – nur nicht offline
  });
}

/** Öffnet den Installieren-Dialog des Browsers (nur einmal möglich, danach bietet er ihn neu an). */
export async function install(): Promise<void> {
  const prompt = appInstall.prompt;
  if (!prompt) return;
  appInstall.prompt = null;
  await prompt.prompt();
  const { outcome } = await prompt.userChoice;
  if (outcome === 'accepted') appInstall.installed = true;
}
