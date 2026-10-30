<script lang="ts">
/**
 * Ein Text, der beim Erscheinen kurz durcheinanderrattert und dann einrastet – wie beim Entschlüsseln.
 * Zum Schluss steht immer der richtige Text da, auch wenn der Browser die Zwischenschritte verschluckt.
 */
let { text }: { text: string } = $props();

const GLYPHS = '0123456789#%&$@?';
/** Gesamtdauer und Takt des Ratterns (ms) */
const DURATION = 420;
const STEP = 45;

let shown = $state('');

$effect(() => {
  const target = text;
  const started = performance.now();
  const timer = setInterval(() => {
    if (performance.now() - started >= DURATION) {
      shown = target;
      clearInterval(timer);
      return;
    }
    shown = [...target].map(() => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]).join('');
  }, STEP);
  shown = target.replace(/./g, '#');
  return () => {
    clearInterval(timer);
    shown = target;
  };
});
</script>

<span class="scramble">{shown}</span>

<style>
  .scramble {
    font-family: ui-monospace, 'Cascadia Mono', Consolas, 'Courier New', monospace;
    font-variant-numeric: tabular-nums;
  }
</style>
