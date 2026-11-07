/**
 * Das Auge in der Pyramide als reine Daten (viewBox 0 0 48 44): Daraus entstehen das Logo in der App
 * (SymbolSprite.svelte) und die App-Symbole für den Startbildschirm (build/pwa.ts). Das Favicon in index.html
 * ist eine vereinfachte Fassung mit dickeren Linien, weil es nur 16 Pixel groß erscheint.
 */
export const EYE = {
  viewBox: '0 0 48 44',
  width: 48,
  height: 44,
  pyramid: { d: 'M24 3 45 41H3Z', stroke: 2.6 },
  eye: { d: 'M12.5 29Q24 18.5 35.5 29 24 38.5 12.5 29Z', stroke: 2.2 },
  pupil: { cx: 24, cy: 29, r: 3.7 },
  rays: { d: 'M24 12v4.5M18 15.5l2 3M30 15.5l-2 3', stroke: 2 },
} as const;
