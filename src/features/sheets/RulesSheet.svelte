<script lang="ts">
import { SUIT_INDICES, SUITS } from '../../core/cards';
import { fullDeck, MAX_RESHUFFLES, rulesetFor, stopWhenEmpty } from '../../core/game';
import { CLASSIC_RULES, RULE_KEYS, RULES } from '../../core/rules';
import { TRUTH_GOALS } from '../../core/settings';
import { startLesson } from '../../state/lesson.svelte';
import { sheets } from '../../state/sheets.svelte';
import { table } from '../../state/table.svelte';
import { ruleExample, ruleLabel } from '../../ui/format';
import Motto from '../../ui/Motto.svelte';
import Sheet from '../../ui/Sheet.svelte';
import SuitSymbol from '../../ui/SuitSymbol.svelte';

/**
 * Die Spielregeln in Kürze. Auf der Startseite steht alles, was man einstellen kann; im Spiel nur, was für dieses
 * Spiel gilt – die aktuellen Regeln der Stapel mit Beispiel und die Texte der Bausteine im Regelwerk: Spielende,
 * Tipp-Stufe und Variante, soweit eingeschaltet.
 */
const game = $derived(table.shownGame);
/** Im Spiel das Regelwerk dieses Spiels; auf der Startseite null */
const ruleset = $derived(game ? rulesetFor(game.settings) : null);
const rules = $derived(game ? table.rules : CLASSIC_RULES);
const extraRules = RULE_KEYS.filter((key) => !CLASSIC_RULES.includes(key));
const solo = $derived(game?.players.length === 1);
const HINT_COST_TEXT = 'Ein Tipp kostet einen Punkt – einmal pro Zug, und nur, wenn du einen Punkt hast.';

/** „13, 23, 33, 52 oder 100“ – wie im Fenster der Variante */
const goalList = `${TRUTH_GOALS.slice(0, -1).join(', ')} oder ${TRUTH_GOALS.at(-1)}`;

const close = (): void => {
  sheets.rulesOpen = false;
};

/** Vom Regelfenster der Startseite direkt in die Lernrunde */
const learn = (): void => {
  close();
  startLesson();
};
</script>

<Sheet title="So funktioniert Illuminati 13" onclose={close}>
  <Motto />

  <h3>Ziel</h3>
  <p>
    Bilde aus deinen Handkarten immer wieder die 13. Jede Karte in einer gültigen Kombination bringt einen Punkt.
    {(ruleset?.ending ?? fullDeck).aimText(solo)}
  </p>

  <h3>1. Die wahren Werte entschlüsseln</h3>
  <p>
    Jede Handkarte wird einzeln mit der obersten Karte des gleichfarbigen Stapels verrechnet.
    {game ? 'In diesem Spiel gilt gerade:' : 'Klassisch gilt:'}
  </p>
  <table>
    <tbody>
      {#each SUIT_INDICES as suit (suit)}
        <tr>
          <td class="suit suit-{suit}"><SuitSymbol {suit} size="16px" /> {SUITS[suit].name}</td>
          <td>
            {ruleLabel(rules[suit])}
            {#if game && rules[suit]}<br /><small class="muted">{ruleExample(rules[suit])}</small>{/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
  <p>
    Ist ein Stapel noch leer, zählt die Karte ihre Zahl. Das Deck hat 52 Karten: jede Farbe von 1 bis 13, jede im
    selben Farbton wie ihr Stapel.
  </p>

  <h3>2. Ablegen</h3>
  <ul>
    <li>
      <b>Du findest die 13:</b> Wähle beliebig viele Karten, deren wahre Werte zusammen genau 13 ergeben. Der Knopf zeigt
      dann „13 beweisen“. Du bekommst so viele Punkte, wie du Karten verwendet hast, und ziehst auf 5 Karten nach. Bei
      mehreren Karten derselben Farbe wählst du, welche oben liegt.
    </li>
    <li>
      <b>Noch keine Erleuchtung:</b> Wähle eine einzelne Karte. Der Knopf zeigt „Karte abwerfen“. Sie kommt auf ihren
      Stapel, und du ziehst eine neue.
    </li>
  </ul>

  <h3>3. Das Ende der Offenbarung</h3>
  <p>{(ruleset?.ending ?? fullDeck).endText(solo, ruleset?.draw ?? stopWhenEmpty)}</p>

  {#if !ruleset}
    <h3>Eigene oder zufällige Regeln</h3>
    <p>
      Auf der Startseite kannst du jedem Stapel eine Regel zuordnen oder sie auslosen lassen. Zusätzlich zu den vier
      klassischen gibt es:
    </p>
    <table>
      <tbody>
        {#each extraRules as key (key)}
          <tr>
            <td><b>{RULES[key].label}</b></td>
            <td class="muted">{ruleExample(key)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}

  {#if ruleset}
    {#if ruleset.hint}
      <h3>Tipps</h3>
      <p>{ruleset.hint.rulesText} {game?.settings.hintCost ? HINT_COST_TEXT : ''}</p>
    {/if}
    {#if ruleset.placement.rulesSection}
      <h3>{ruleset.placement.rulesSection.title}</h3>
      <p>{ruleset.placement.rulesSection.text}</p>
    {/if}
  {:else}
    <h3>Tipps</h3>
    <p>
      Auf der Startseite stellst du ein, wie viel der Tipp-Knopf verrät: gar nichts (aus), nur ob es eine 13 gibt
      (ja oder nein), zusätzlich aus wie vielen Karten (Andeutung) oder welche Karten es sind (volle Hilfe). Wahlweise
      kostet ein Tipp einen Punkt – einmal pro Zug, und nur, wenn du einen Punkt hast.
    </p>

    <h3>Varianten</h3>
    <p>Auf der Startseite unter „Varianten“ lässt sich der Spielablauf verändern:</p>
    <ul>
      <li>
        <b>Die wahre Wahrheit erkennen:</b> Statt des ganzen Decks gilt ein Punkteziel – {goalList}.
        Wer es zuerst erreicht, beendet das Spiel; die Runde wird noch zu Ende gespielt, damit alle gleich viele Züge
        hatten. Ist der Nachziehstapel leer, werden die Ablagestapel bis auf ihre oberste Karte gemischt und bilden einen
        neuen – nach {MAX_RESHUFFLES} Mischungen ist spätestens Schluss. Allein zählt, in wie vielen Zügen du das Ziel
        schaffst.
      </li>
      <li>
        <b>Wenn die Weltordnung sich verschiebt:</b> Landet eine 13 auf einem Stapel, rücken alle vier Stapel eine
        Position in die vereinbarte Richtung weiter – der letzte wieder an den Anfang. Die Regeln bleiben an ihrem
        Platz: Jeder Stapel gilt ab jetzt nach der Regel, unter der er nun liegt.
      </li>
    </ul>
  {/if}

  {#snippet actions()}
    {#if !ruleset}
      <button type="button" class="btn btn--ghost" onclick={learn}>Lernrunde spielen</button>
    {/if}
    <button type="button" class="btn btn--primary" onclick={close}>Verstanden</button>
  {/snippet}
</Sheet>

<style>
  table {
    width: 100%;
    margin: 8px 0;
    border-collapse: collapse;
  }

  td {
    padding: 7px 10px;
    text-align: left;
    vertical-align: top;
    border-bottom: 1px solid var(--line);
  }

  .suit {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 700;
    color: var(--suit);
    white-space: nowrap;
  }
</style>
