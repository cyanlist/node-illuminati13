<script lang="ts">
import { RULES, type RuleKey } from '../../core/rules';

/** Die Regel über einer Spalte des Boards – sie bleibt stehen, auch wenn die Stapel weiterrücken. */
let { ruleKey }: { ruleKey: RuleKey | undefined } = $props();

const rule = $derived(ruleKey ? RULES[ruleKey] : null);
</script>

<div class="rule">
  <span class="long">{rule?.label}</span><span class="short">{rule?.short}</span>
</div>

<style>
  .rule {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 2.4em;
    font-size: clamp(12px, 1.6vw, 14px);
    font-weight: 700;
    line-height: 1.2;
    text-align: center;
    color: var(--muted);
    overflow-wrap: break-word;
  }

  .short {
    display: none;
  }

  @media (max-width: 620px) {
    .long {
      display: none;
    }

    .short {
      display: inline;
    }
  }
</style>
