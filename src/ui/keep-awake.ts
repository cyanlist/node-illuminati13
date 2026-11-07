/**
 * Hält den Bildschirm an (Screen Wake Lock). An zwei Geräten wartet man oft eine Weile, während das Gegenüber
 * überlegt – geht dabei das Display aus, legt der Browser die Seite schlafen und die Verbindung reißt ab.
 *
 * Der Browser gibt die Sperre von selbst frei, sobald die Seite verdeckt ist (anderer Tab, andere App); kommt sie
 * zurück, wird sie neu angefordert. Kann der Browser das nicht oder darf er es nicht (ältere Geräte,
 * Energiesparmodus, eingebettet als Claude-Artifact), geht der Bildschirm eben wie gewohnt aus.
 */

/** Hält den Bildschirm an, bis die zurückgegebene Funktion aufgerufen wird. */
export function keepScreenOn(): () => void {
  if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) return () => {};

  let lock: WakeLockSentinel | null = null;
  let asking = false;
  let stopped = false;

  async function request(): Promise<void> {
    if (stopped || asking || document.visibilityState !== 'visible' || (lock && !lock.released)) return;
    asking = true;
    try {
      const granted = await navigator.wakeLock.request('screen');
      if (stopped) void granted.release();
      else lock = granted;
    } catch {
      // nicht erlaubt – dann eben ohne
    } finally {
      asking = false;
    }
  }

  const onvisible = (): void => void request();
  document.addEventListener('visibilitychange', onvisible);
  void request();

  return () => {
    stopped = true;
    document.removeEventListener('visibilitychange', onvisible);
    void lock?.release().catch(() => {});
    lock = null;
  };
}
