<script lang="ts">
import type { Player } from '../core/game';

/**
 * Satzanfang mit einer Person: „Du findest …“ für die Person am Gerät, sonst „Anna findet …“.
 * `second` ist das Verb in der zweiten, `third` in der dritten Person.
 */
interface Props {
  player: Player;
  third: string;
  second: string;
}
let { player, third, second }: Props = $props();
</script>

{#if player.you}<b>Du</b> {second}{:else}<b>{player.name}</b> {third}{/if}
