<script lang="ts">
import { type GameState, playerAt } from '../../core/game';
import { table } from '../../state/table.svelte';
import HandCards from './HandCards.svelte';
import Seat from './Seat.svelte';
import SmallCards from './SmallCards.svelte';

/**
 * Ein fester Platz am Tisch: Spieler*in 1 sitzt unten, Spieler*in 2 (oder der Computer) oben.
 * Wessen Karten gerade gezeigt werden (`table.viewer`), dessen Platz zeigt die ganze Hand –
 * die anderen Plätze nur kleine Karten, verdeckt oder mit offenen Karten offen.
 */
interface Props {
  game: GameState;
  index: number;
}
let { game, index }: Props = $props();

const player = $derived(playerAt(game, index));
const showsHand = $derived(index === table.viewer);
</script>

<Seat
  label={index === 0 ? 'Platz unten' : 'Platz oben'}
  name={player.name}
  points={table.points(index)}
  combos={table.combos(index)}
  active={index === game.current && game.players.length > 1 && table.phase !== 'over'}
  thinking={player.cpu && table.phase === 'cpu' && !table.anim}
>
  {#if showsHand}
    <HandCards {game} {index} />
  {:else}
    <SmallCards {index} open={game.settings.openHands} />
  {/if}
</Seat>
