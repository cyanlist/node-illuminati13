import type { Plugin } from 'vite';

const escapeRegExp = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Bettet JS und CSS des Builds direkt in index.html ein.
 * Ergebnis: eine einzige Datei, die sich per Doppelklick (file://) öffnen lässt –
 * Browser blockieren nämlich externe Modul-Skripte, die über file:// geladen werden.
 */
export function inlineAssets(): Plugin {
  return {
    name: 'illuminati13-inline-assets',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const html = Object.values(bundle).find((f) => f.type === 'asset' && f.fileName.endsWith('.html'));
      if (html?.type !== 'asset') return;
      let source = String(html.source);

      for (const [name, file] of Object.entries(bundle)) {
        if (file.type === 'chunk' && file.isEntry) {
          // "</script" im Code würde das Skript-Tag vorzeitig beenden
          const code = file.code.replace(/<\/script/gi, '<\\/script');
          const tag = new RegExp(`<script[^>]*src="[^"]*${escapeRegExp(file.fileName)}"[^>]*></script>`);
          source = source.replace(tag, () => `<script type="module">${code}</script>`);
          delete bundle[name];
        } else if (file.type === 'asset' && file.fileName.endsWith('.css')) {
          const tag = new RegExp(`<link[^>]*href="[^"]*${escapeRegExp(file.fileName)}"[^>]*>`);
          source = source.replace(tag, () => `<style>${String(file.source)}</style>`);
          delete bundle[name];
        }
      }
      html.source = source;
    },
  };
}
