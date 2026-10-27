<script lang="ts">
import { SUIT_INDICES, SUITS } from '../../core/cards';
import { CLASSIC_RULES, RULE_KEYS, RULES, randomRules } from '../../core/rules';
import type { RuleMode, Settings } from '../../core/settings';
import { ruleExample, ruleLabel } from '../../ui/format';
import SuitIcon from '../../ui/SuitIcon.svelte';
import ChoiceGroup, { type Choice } from './ChoiceGroup.svelte';
import Panel from './Panel.svelte';

/** Welche Regel welcher Stapel hat: klassisch, selbst zugeordnet oder ausgelost. */
let { draft = $bindable() }: { draft: Settings } = $props();

const modes: Choice<RuleMode>[] = [
  { value: 'classic', title: 'Klassisch', description: 'Die vier Regeln aus der Anleitung.' },
  { value: 'custom', title: 'Eigene Zuordnung', description: 'Du legst fest, welcher Stapel welche Regel hat.' },
  { value: 'random', title: 'Zufällig', description: 'Jedes Spiel lost vier verschiedene Regeln aus.' },
];

const shownRules = $derived(draft.ruleMode === 'custom' ? draft.customRules : CLASSIC_RULES);
</script>

<Panel title="Regeln der Stapel">
  <ChoiceGroup name="rulemode" options={modes} bind:value={draft.ruleMode} />

  {#if draft.ruleMode === 'random'}
    <p class="note">
      Ausgelost wird aus {RULE_KEYS.length} Regeln, die Zuordnung siehst du dann über den Stapeln. Mit der Variante wandern
      auch ausgeloste Regeln weiter.
    </p>
  {:else}
    <div class="rows">
      {#each SUIT_INDICES as suit (suit)}
        {@const key = shownRules[suit] ?? 'plus'}
        <div class="row">
          <span class="suit suit-text suit-{suit}"><SuitIcon {suit} size="18px" />{SUITS[suit].name}</span>
          {#if draft.ruleMode === 'custom'}
            <select aria-label="Regel für {SUITS[suit].name}" bind:value={draft.customRules[suit]}>
              {#each RULE_KEYS as option (option)}
                <option value={option}>{RULES[option].label}</option>
              {/each}
            </select>
          {:else}
            <b>{ruleLabel(key)}</b>
          {/if}
          <small>{ruleExample(key)}</small>
        </div>
      {/each}
    </div>

    {#if draft.ruleMode === 'custom'}
      <div class="tools">
        <button type="button" class="btn btn--small" onclick={() => (draft.customRules = randomRules())}>
          Zufällig verteilen
        </button>
        <button type="button" class="btn btn--small btn--ghost" onclick={() => (draft.customRules = [...CLASSIC_RULES])}>
          Wie klassisch
        </button>
      </div>
    {/if}
  {/if}
</Panel>

<style>
  .rows {
    display: grid;
    gap: 12px;
    margin-top: 14px;
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

  small {
    grid-column: 2;
    color: var(--muted);
  }

  .tools {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 14px;
  }

  .note {
    color: var(--muted);
    margin: 12px 0 0;
  }
</style>
