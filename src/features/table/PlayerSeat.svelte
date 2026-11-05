<script lang="ts">
import { type GameState, lastTurnPlayers, playerAt, rulesetFor } from '../../core/game';
import { isOnline } from '../../core/settings';
import { online } from '../../state/online.svelte';
import { table } from '../../state/table.svelte';
import HandCards from './HandCards.svelte';
import Seat from './Seat.svelte';
import SmallCards from './SmallCards.svelte';

/**
 * Ein fester Platz am Tisch: Spieler*in 1 sitzt unten, Spieler*in 2 (oder der Computer) oben –
 * an zwei Geräten sitzt die Person am Gerät unten.
 * Wessen Karten gerade gezeigt werden (`table.viewer`), dessen Platz zeigt die ganze Hand –
 * die anderen Plätze nur kleine Karten, verdeckt oder mit offenen Karten offen.
 */
interface Props {
  game: GameState;
  index: number;
  position: 'top' | 'bottom';
}
let { game, index, position }: Props = $props();

const player = $derived(playerAt(game, index));
const showsHand = $derived(index === table.viewer);

/**
 * Eigene Hand ausgrauen, während der Computer bzw. das andere Gerät am Zug ist. Vorerst ausgeschaltet – noch
 * offen, ob der Effekt bleibt (siehe docs/ideen-oberflaeche.md). Zum Ausprobieren auf true setzen.
 */
const DIM_WHILE_WAITING = false;
const waiting = $derived(DIM_WHILE_WAITING && showsHand && (table.phase === 'cpu' || table.phase === 'remote'));
</script>

<Seat
  label={position === 'bottom' ? 'Platz unten' : 'Platz oben'}
  name={player.name}
  cpu={player.cpu}
  points={table.points(index)}
  goal={rulesetFor(game.settings).ending.goal}
  combos={table.combos(index)}
  active={index === game.current && game.players.length > 1 && table.phase !== 'over'}
  compact={!showsHand}
  lastTurn={lastTurnPlayers(game).includes(index)}
  {waiting}
  presence={isOnline(game.settings) && index !== table.me ? (online.presence ?? 'lost') : null}
  thinking={((player.cpu && table.phase === 'cpu') || (index !== table.me && table.phase === 'remote')) && !table.anim}
>
  {#if showsHand}
    <HandCards {game} {index} />
  {:else}
    <SmallCards {index} open={game.settings.openHands} />
  {/if}
</Seat>
