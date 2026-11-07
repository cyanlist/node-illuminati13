import { readFileSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';
import type { Plugin } from 'vite';
import { EYE } from '../src/ui/eye.ts';

/**
 * Was das Spiel braucht, um sich als App auf den Startbildschirm legen zu lassen (Web-App / PWA):
 * - manifest.webmanifest: Name, Farben, „ohne Adressleiste starten“, Symbole
 * - App-Symbole als PNG, gezeichnet aus dem Auge in der Pyramide (src/ui/eye.ts)
 * - sw.js (build/sw.js): merkt sich die Seite, damit die App auch ohne Netz startet
 *
 * Alles entsteht nur beim Bauen und liegt neben dist/index.html. Gebraucht wird es nur auf GitHub Pages; die
 * Einzeldatei per Doppelklick und das Claude-Artifact kommen ohne aus (scripts/build-artifact.mjs lässt die
 * Verweise weg).
 */

const APP = {
  name: 'Illuminati 13',
  description: 'Das Kartenspiel Illuminati 13: Verrechne deine Karten mit den Stapeln und bilde die 13.',
  /** Hintergrund von Symbol und Startbildschirm – das dunkle Farbschema der App */
  background: '#14161b',
  /** Farbe des Auges – das Rot der Herz-Karten */
  ink: '#c81e3a',
};

interface Icon {
  file: string;
  size: number;
  /** Anteil der Breite, den die Pyramide einnimmt */
  share: number;
  /** maskable: Android schneidet das Symbol rund oder eckig zu – das Auge muss im inneren Kreis bleiben */
  purpose?: 'any' | 'maskable';
}

const ICONS: Icon[] = [
  { file: 'icon-192.png', size: 192, share: 0.66, purpose: 'any' },
  { file: 'icon-512.png', size: 512, share: 0.66, purpose: 'any' },
  { file: 'icon-maskable-512.png', size: 512, share: 0.52, purpose: 'maskable' },
  // iPhone und iPad nehmen nicht das Manifest, sondern dieses Symbol (ohne Transparenz, Ecken rundet iOS selbst)
  { file: 'apple-touch-icon.png', size: 180, share: 0.66 },
];

/** Das Symbol als SVG: das Auge mittig auf dunklem Grund, quadratisch und randlos. */
export function iconSvg(share: number): string {
  const scale = (100 * share) / EYE.width;
  const x = (100 - EYE.width * scale) / 2;
  const y = (100 - EYE.height * scale) / 2;
  const line = (part: { d: string; stroke: number }, cap = '') =>
    `<path d="${part.d}" fill="none" stroke="${APP.ink}" stroke-width="${part.stroke}" stroke-linejoin="round"${cap} />`;
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">',
    `<rect width="100" height="100" fill="${APP.background}" />`,
    `<g transform="translate(${x} ${y}) scale(${scale})">`,
    line(EYE.pyramid),
    line(EYE.eye),
    `<circle cx="${EYE.pupil.cx}" cy="${EYE.pupil.cy}" r="${EYE.pupil.r}" fill="${APP.ink}" />`,
    line(EYE.rays, ' stroke-linecap="round"'),
    '</g>',
    '</svg>',
  ].join('');
}

export function renderIcon(icon: Icon): Uint8Array {
  return new Resvg(iconSvg(icon.share), { fitTo: { mode: 'width', value: icon.size } }).render().asPng();
}

/** Das Manifest – Pfade relativ, damit es in jedem Unterordner läuft (GitHub Pages: /node-illuminati13/). */
export function manifest(): string {
  const icons = ICONS.filter((icon) => icon.purpose).map((icon) => ({
    src: icon.file,
    sizes: `${icon.size}x${icon.size}`,
    type: 'image/png',
    purpose: icon.purpose,
  }));
  return JSON.stringify(
    {
      name: APP.name,
      short_name: APP.name,
      description: APP.description,
      lang: 'de',
      start_url: './',
      scope: './',
      display: 'standalone',
      background_color: APP.background,
      theme_color: APP.background,
      icons,
    },
    null,
    2,
  );
}

export function pwa(): Plugin {
  return {
    name: 'illuminati13-pwa',
    apply: 'build',
    transformIndexHtml: () => [
      { tag: 'link', attrs: { rel: 'manifest', href: 'manifest.webmanifest' }, injectTo: 'head' },
      { tag: 'link', attrs: { rel: 'apple-touch-icon', href: 'apple-touch-icon.png' }, injectTo: 'head' },
      { tag: 'meta', attrs: { name: 'apple-mobile-web-app-title', content: APP.name }, injectTo: 'head' },
    ],
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'manifest.webmanifest', source: manifest() });
      for (const icon of ICONS)
        this.emitFile({ type: 'asset', fileName: icon.file, source: renderIcon(icon) });
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: readFileSync('build/sw.js', 'utf8') });
    },
  };
}
