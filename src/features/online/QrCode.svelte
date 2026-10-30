<script lang="ts">
import { qrMatrix } from '../../net/qr';

/** Ein QR-Code – immer schwarz auf weiß, auch im dunklen Design, damit jede Kamera ihn liest. */
let { text, label }: { text: string; label: string } = $props();

const qr = $derived(qrMatrix(text));
/** Ruhezone um den Code, in Modulen */
const QUIET = 3;
</script>

<svg
  class="qr"
  viewBox="{-QUIET} {-QUIET} {qr.size + 2 * QUIET} {qr.size + 2 * QUIET}"
  role="img"
  aria-label={label}
  shape-rendering="crispEdges"
>
  <rect x={-QUIET} y={-QUIET} width={qr.size + 2 * QUIET} height={qr.size + 2 * QUIET} fill="#fff" />
  <path d={qr.path} fill="#000" />
</svg>

<style>
  .qr {
    display: block;
    width: min(240px, 70vw);
    height: auto;
    margin: 0 auto;
    border-radius: 12px;
  }
</style>
