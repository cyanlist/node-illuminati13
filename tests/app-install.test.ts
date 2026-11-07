import { describe, expect, it } from 'vitest';
import { iconSvg, manifest, renderIcon } from '../build/pwa';
import { installSteps, platformOf } from '../src/features/settings/install-hint';

const IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 Version/18.5 Safari/604.1';
const IPAD =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/18.5 Safari/605.1.15';
const ANDROID =
  'Mozilla/5.0 (Linux; Android 15; Pixel 8) AppleWebKit/537.36 Chrome/141.0 Mobile Safari/537.36';
const WINDOWS = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/141.0 Safari/537.36';

describe('Als App aufs Handy', () => {
  it('erkennt iPhone, iPad (gibt sich als Mac aus), Android und den Rest', () => {
    expect(platformOf(IPHONE, 5)).toBe('ios');
    expect(platformOf(IPAD, 5)).toBe('ios');
    expect(platformOf(IPAD, 0)).toBe('other');
    expect(platformOf(ANDROID, 5)).toBe('android');
    expect(platformOf(WINDOWS, 0)).toBe('other');
  });

  it('sagt auf dem iPhone, wo man tippen muss', () => {
    expect(installSteps('ios')).toContain('Zum Home-Bildschirm');
    expect(installSteps('android')).toContain('Startbildschirm');
  });

  it('beschreibt die App im Manifest mit relativen Pfaden und Symbolen für Android', () => {
    const app = JSON.parse(manifest());
    expect(app).toMatchObject({ name: 'Illuminati 13', start_url: './', scope: './', display: 'standalone' });
    expect(
      app.icons.map((icon: { sizes: string; purpose: string }) => `${icon.sizes} ${icon.purpose}`),
    ).toEqual(['192x192 any', '512x512 any', '512x512 maskable']);
  });

  it('zeichnet das Symbol als PNG in der verlangten Größe', () => {
    expect(iconSvg(0.66)).toContain('<circle');
    const png = renderIcon({ file: 'test.png', size: 192, share: 0.66 });
    // PNG-Kennung und Breite/Höhe aus dem IHDR-Block
    expect([...png.slice(1, 4)].map((byte) => String.fromCharCode(byte)).join('')).toBe('PNG');
    const view = new DataView(png.buffer, png.byteOffset);
    expect([view.getUint32(16), view.getUint32(20)]).toEqual([192, 192]);
  });
});
