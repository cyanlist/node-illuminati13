<script lang="ts">
/** „überlegt …“ mit nacheinander aufleuchtenden Punkten – solange der Computer oder das andere Gerät am Zug ist. */
</script>

<span class="thinking">überlegt<span>.</span><span>.</span><span>.</span></span>

<style>
  .thinking {
    margin-left: auto;
    flex: none;
    color: var(--muted);
    font-size: 13px;
    font-style: italic;
  }

  .thinking span {
    animation: blink 1.2s infinite;
  }

  .thinking span:nth-child(2) {
    animation-delay: 0.2s;
  }

  .thinking span:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes blink {
    0%,
    100% {
      opacity: 0.2;
    }
    50% {
      opacity: 1;
    }
  }
</style>
