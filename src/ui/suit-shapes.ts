/**
 * Die vier Farbsymbole als Pfade (viewBox 0 0 24 24): Daraus entstehen die Symbole in der App (SymbolSprite.svelte)
 * und auf dem Bild, das man vom Ergebnis teilt (results/result-image.ts). Kreise stehen als Pfad da, damit sich
 * jedes Symbol einheitlich als Pfadliste zeichnen lässt.
 */
import type { SuitIndex } from '../core/cards';

/** Kreis als Pfad: zwei Halbbögen um den Mittelpunkt */
const circle = (cx: number, cy: number, r: number): string =>
  `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0z`;

export const SUIT_SHAPES: Record<SuitIndex, readonly string[]> = {
  0: [
    'M12 21.3C10.6 20 2.6 14.2 2.1 8.9 1.7 5.4 4.2 2.8 7.2 2.8c2.1 0 3.7 1.2 4.8 3 1.1-1.8 2.7-3 4.8-3 3 0 5.5 2.6 5.1 6.1-.5 5.3-8.5 11.1-9.9 12.4z',
  ],
  1: [
    'M12 1.8C10.4 4.6 2.6 9.4 2.6 14.1c0 2.8 2.2 4.6 4.6 4.6 1.8 0 3.1-.8 3.9-1.9-.3 2.2-1.3 3.9-3.1 5.4h8c-1.8-1.5-2.8-3.2-3.1-5.4.8 1.1 2.1 1.9 3.9 1.9 2.4 0 4.6-1.8 4.6-4.6 0-4.7-7.8-9.5-9.4-12.3z',
  ],
  2: [
    'M12 1.5C13.7 5.6 16.6 9 20.8 12 16.6 15 13.7 18.4 12 22.5 10.3 18.4 7.4 15 3.2 12 7.4 9 10.3 5.6 12 1.5z',
  ],
  3: [
    circle(12, 6.6, 4.5),
    circle(6.6, 13.4, 4.5),
    circle(17.4, 13.4, 4.5),
    circle(12, 12, 3),
    'M10.7 12h2.6l.4 4.6c.4 2.4 1.5 4.1 3.3 5.4H7c1.8-1.3 2.9-3 3.3-5.4z',
  ],
};
