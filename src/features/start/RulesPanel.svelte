<script lang="ts">
import { SUIT_INDICES, SUITS } from '../../core/cards';
import { RULE_KEYS, RULE_PACKS, RULES, type RulePack } from '../../core/rules';
import type { Settings } from '../../core/settings';
import { ruleExample } from '../../ui/format';
import SuitSymbol from '../../ui/SuitSymbol.svelte';
import CheckOption from './CheckOption.svelte';
import Panel from './Panel.svelte';

/**
 * Welche Regel welcher Stapel hat: vier Auswahlfelder, darüber Regelpakete, die alle vier auf einmal füllen.
 * Wahlweise wird bei jedem Spiel neu ausgelost – dann sind die Felder gesperrt.
 */
let { draft = $bindable(), plain = false }: { draft: Settings; plain?: boolean } = $props();

const rerolled = $derived(draft.ruleMode === 'random');

function applyPack(pack: RulePack): void {
  draft.customRules = pack.rules();
  draft.ruleMode = 'custom';
}
</script>

<Panel title="Regeln der Stapel" {plain}>
  <div class="packs">
    {#each RULE_PACKS as pack (pack.id)}
      <button
        type="button"
        class="pack"
        class:active={!rerolled && pack.matches?.(draft.customRules)}
        disabled={rerolled}
        onclick={() => applyPack(pack)}
      >
        <b>{pack.title}</b>
        <small>{pack.description}</small>
      </button>
    {/each}
  </div>

  <div class="rows" class:locked={rerolled}>
    {#each SUIT_INDICES as suit (suit)}
      {@const key = draft.customRules[suit] ?? 'plus'}
      <div class="row">
        <span class="suit suit-text suit-{suit}"><SuitSymbol {suit} size="18px" />{SUITS[suit].name}</span>
        <select aria-label="Regel für {SUITS[suit].name}" disabled={rerolled} bind:value={draft.customRules[suit]}>
          {#each RULE_KEYS as option (option)}
            <option value={option}>{RULES[option].label}</option>
          {/each}
        </select>
        <small>{rerolled ? 'wird beim Spielstart ausgelost' : ruleExample(key)}</small>
      </div>
    {/each}
  </div>

  <div class="reroll">
    <CheckOption
      title="Bei jedem Spiel neu auslosen"
      description="Vier verschiedene Regeln aus {RULE_KEYS.length}, die Zuordnung siehst du dann über den Stapeln."
      bind:checked={() => rerolled, (on) => (draft.ruleMode = on ? 'random' : 'custom')}
    />
  </div>
</Panel>

<style>
  .packs {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 8px;
  }

  .pack {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 10px 12px;
    text-align: left;
    font: inherit;
    color: inherit;
    background: var(--surface-2);
    border: 1.5px solid var(--line);
    border-radius: 12px;
    cursor: pointer;
  }

  .pack:hover:not(:disabled) {
    border-color: var(--muted);
  }

  .pack:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .active {
    border-color: var(--accent);
    box-shadow: inset 0 0 0 1px var(--accent);
  }

  .pack small {
    color: var(--muted);
  }

  .rows {
    display: grid;
    gap: 12px;
    margin-top: 14px;
  }

  .locked {
    opacity: 0.6;
  }

  .row {
    display: grid;
    grid-template-columns: 6em minmax(0, 1fr);
    gap: 2px 12px;
    align-items: center;
  }

  .suit {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .row small {
    grid-column: 2;
    color: var(--muted);
  }

  .reroll {
    margin-top: 14px;
  }
</style>
