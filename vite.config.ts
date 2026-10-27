/// <reference types="vitest/config" />
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import { inlineAssets } from './build/inline-assets.ts';

export default defineConfig({
  // inlineAssets: JS und CSS landen inline in dist/index.html → lässt sich per Doppelklick (file://) öffnen
  plugins: [svelte(), inlineAssets()],
  // relative Pfade: der Build lässt sich in jeden Unterordner / auf jeden Webspace legen
  base: './',
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
