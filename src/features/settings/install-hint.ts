/**
 * Wie man das Spiel auf diesem Gerät als App auf den Startbildschirm legt. Chrome und Edge können den
 * Installieren-Dialog selbst öffnen (dann gibt es einen Knopf); Safari auf iPhone und iPad kann das nicht –
 * dort und in anderen Browsern steht stattdessen, wo man tippen muss.
 */

export type Platform = 'ios' | 'android' | 'other';

/** iPadOS gibt sich als Mac aus – verrät sich aber durch den Touchscreen. */
export function platformOf(userAgent: string, touchPoints: number): Platform {
  if (/iPhone|iPad|iPod/.test(userAgent) || (/Macintosh/.test(userAgent) && touchPoints > 1)) return 'ios';
  if (/Android/.test(userAgent)) return 'android';
  return 'other';
}

/** Was unter der Erklärung steht, wenn der Browser keinen eigenen Dialog anbietet. */
export function installSteps(platform: Platform): string {
  switch (platform) {
    case 'ios':
      return 'Tippe in Safari auf „Teilen“ (das Quadrat mit dem Pfeil nach oben) und dann auf „Zum Home-Bildschirm“.';
    case 'android':
      return 'Öffne das Browser-Menü (⋮) und wähle „App installieren“ oder „Zum Startbildschirm hinzufügen“.';
    default:
      return 'Öffne das Menü deines Browsers und wähle „App installieren“ – oder öffne die Seite auf dem Handy.';
  }
}
