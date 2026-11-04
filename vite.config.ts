/// <reference types="vitest/config" />
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import { buildInfo } from './build/build-info.ts';
import { inlineAssets } from './build/inline-assets.ts';

export default defineConfig({
  // inlineAssets: JS und CSS landen inline in dist/index.html → lässt sich per Doppelklick (file://) öffnen
  plugins: [svelte(), inlineAssets()],
  // relative Pfade: der Build lässt sich in jeden Unterordner / auf jeden Webspace legen
  base: './',
  // Version, Commit und Build-Zeitpunkt – für die Entwicklerinfo in den Einstellungen (src/build.ts)
  define: { __BUILD__: JSON.stringify(buildInfo()) },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
