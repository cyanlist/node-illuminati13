# Spielablauf aus austauschbaren Bausteinen

Stand: 04.11.2026 – **umgesetzt** auf dem Branch `refactor/modular-ruleset`.

## Idee

Jeder Abschnitt des Spielablaufs ist ein austauschbarer **Baustein** mit fester Schnittstelle. Eine Variante ist nur
eine andere Zusammenstellung von Bausteinen. Statt verstreuter Abfragen wie `if (settings.truth)`
fragt der Code das **Regelwerk**:

```ts
const ruleset = rulesetFor(state.settings);
ruleset.ending.checkFinalRound(state);
ruleset.draw.refill(state, player, HAND_SIZE);
ruleset.placement.afterPlace(state, card);
ruleset.hint?.reveal(combo);
```

Außerhalb von `rulesetFor` fragt nur noch die Startseite die Einstellungen `truth`, `variant` und `hints` ab – dort,
wo man sie einstellt (`VariantsPanel` mit den Blöcken in `start/variants/`, `HintsPanel`, `sections.ts`).

## Grundsätze

1. **Schnittstelle + Objekte statt abstrakter Klassen** – wie bei den Stapel-Regeln (`defineRule`). Braucht ein
   Baustein eine Einstellung, erzeugt ihn eine kleine Funktion, z. B. `firstTo(13)` oder `worldOrder('links')`.
2. **Bausteine leben nicht im Spielstand.** `GameState` bleibt reine Daten (JSON zum anderen Gerät, Schnappschuss im
   Artifact-Viewer). Er speichert nur die Einstellungen; `rulesetFor(settings)` baut das Regelwerk bei Bedarf neu –
   rein und schnell, darf beliebig oft laufen.
3. **Gespeicherte Werte bleiben gültig.** Die Schlüssel der Einstellungen wurden nicht umbenannt; der Bestwert allein
   liegt weiter unter `illu13-best-solo` bzw. `illu13-best-solo-13`.
4. **Texte gehören zum Baustein.** Was das Regelfenster, das Tipps-Fenster oder die Meldung unter dem Knopf über einen
   Baustein sagt, steht beim Baustein selbst – so wie die Stapel-Regeln ihre Erklärungen mitbringen.

## Aufbau

Alles liegt in `src/core/game/ruleset/` und wird über `src/core/game/index.ts` exportiert.

| Datei                        | Inhalt                                                                              |
| ---------------------------- | ----------------------------------------------------------------------------------- |
| `types.ts`                   | Schnittstellen `Ending`, `DrawPolicy`, `PlacementEffect`, `HintStyle`, `Ruleset`    |
| `index.ts`                   | `rulesetFor(settings)` – ordnet jeder Einstellung ihren Baustein zu                 |
| `ending/full-deck.ts`        | `fullDeck` – bis der Stapel leer ist; meiste Punkte; allein zählen die Punkte       |
| `ending/first-to.ts`         | `firstTo(points)` – Punkteziel (13, 23, 33, 52, 100); faire letzte Runde; allein zählen die Züge |
| `draw/stop-when-empty.ts`    | `stopWhenEmpty` – nachziehen, solange es geht; leerer Stapel startet die letzte Runde |
| `draw/reshuffle.ts`          | `reshuffle` – leerer Stapel wird aus den Ablagestapeln nachgemischt („Die wahre Wahrheit erkennen“) |
| `placement/none.ts`          | `noEffect` – ohne Variante                                                          |
| `placement/world-order.ts`   | `worldOrder(dir)` – eine 13 verschiebt die Weltordnung                              |
| `hints.ts`                   | `HINT_STYLES` (Ja oder nein, Andeutung, Volle Hilfe), `HINTS_OFF`, `NO_THIRTEEN`, `HINT_CHOICES` |

Dazu `src/core/game/history.ts` mit `turnsTaken` und `starter` (was sich aus dem Protokoll ablesen lässt) – die
Bausteine nutzen es, der Rest des Spiels auch.

### Schnittstellen

```ts
interface Ending {
  goal: number | null;                       // Punkteziel für die Plakette („7 / 13“)
  recordName: string;                        // Name, unter dem das Gerät den Bestwert allein speichert
  checkFinalRound(state: GameState): void;   // nach jedem echten Zug: beginnt die letzte Runde?
  soloScore(state: GameState): number | null;
  beatsBest(score: number, best: number): boolean;
  aimText(solo: boolean): string;            // „Ziel“ im Regelfenster
  endText(solo: boolean, draw: DrawPolicy): string; // „Das Ende der Offenbarung“, samt Satz des Nachziehens
}

interface DrawPolicy {
  id: 'stop' | 'reshuffle';
  refill(state: GameState, player: Player, target: number): { drawn: number[]; reshuffled: number };
  exhausted(state: GameState): boolean;      // Nachziehstapel aufgebraucht → letzte Runde
  emptyText(solo: boolean): string;          // was bei leerem Nachziehstapel passiert
}

interface PlacementEffect {
  id: 'none' | 'world-order';                // woran die Oberfläche z. B. den Zähler der Weltordnung festmacht
  announcement: LogEntry | null;             // Protokoll beim Spielstart
  rulesSection: { title: string; text: string } | null;
  afterPlace(state: GameState, card: Card): boolean;          // true: Weltordnung verschoben
  rulesAfter(state: GameState, card: Card): readonly RuleKey[]; // für den Computer, ohne den Zustand zu ändern
  triggers(state: GameState, card: Card): boolean;            // für das Aufleuchten des Zählers
}

interface HintStyle {
  id: 'exists' | 'nudge' | 'full';
  title: string;  description: string;  rulesText: string;
  reveal(combo: readonly number[]): { message: string; highlight: number[] };
}
```

### Wer fragt welchen Baustein

| Baustein          | Kern                                                   | Zustand und Oberfläche                                        |
| ----------------- | ------------------------------------------------------ | ------------------------------------------------------------- |
| `ending`          | `turns.ts` (`finishTurn`)                              | `flow.ts` (Bestwert), `PlayerSeat`, `LogText`, `ResultsSheet`, `RulesSheet` |
| `draw`            | `moves.ts` (`refill`), `turns.ts` (letzte Runde)       | `move-animation.ts` (Nachmischen), `LogText`, `RulesSheet`    |
| `placement`       | `moves.ts` (`placeCard`), `new-game.ts`, `ai.ts`       | `Board`, `WorldOrder`, `GameView` (Höhenbudget), `RulesSheet` |
| `hint`            | `hints.ts` (`canTakeHint`)                             | `actions.ts` (`showHint`), `buttons.ts`, `GameView`, `RulesSheet`, `HintsPanel`, `sections.ts` |

## Neue Variante einbauen

1. Baustein-Datei im passenden Ordner anlegen, die Schnittstelle aus `types.ts` erfüllen (Texte inklusive).
2. Falls nötig: neuen Wert in den Einstellungen (`src/core/settings.ts`, Listen wie `TRUTH_GOALS`) und auf der Startseite
   ein Feld dafür.
3. In `rulesetFor` (`ruleset/index.ts`) zuordnen.
4. Tests in `tests/ruleset.test.ts` – der Baustein lässt sich dort direkt prüfen, ohne ein ganzes Spiel.

Auf der Startseite gehört jede Variante in den Bereich „Varianten“: ein Block in `src/features/start/variants/`,
eingebunden in `VariantsPanel.svelte`, und eine Kurzfassung in `variantsSummary` (`sections.ts`).

Beispiele:
- Ein Punkteziel von 20 ist nur `firstTo(20)`; der Test „ein anderes Punkteziel lässt sich einstecken“ prüft genau
  das, ohne außerhalb von `ruleset/` etwas zu ändern.
- „Die wahre Wahrheit erkennen“ ist `firstTo(truthGoal)` plus der neue Nachzieh-Baustein `reshuffle`. Dazu kamen nur
  die Einstellung (`truth`, `truthGoal`), der Block `TruthVariant`, ein Protokolleintrag und – damit zwei
  Geräte gleich mischen – der Zufall im Spielstand (`rngState`, `src/core/random.ts`).

Noch nicht als Baustein herausgezogen, weil ihre zweite Form noch fehlt: **Beweisprüfung** (kommt mit der
„Glaubensfrage“, dann mit zweiteiligem Zug), **Abwurf-Ziel** (mit „Vertuschung“) und **Regeln der Stapel** (mit der
„Geheimen Regel“). Ideen dazu: `docs/ideen-varianten.md`.

## Abweichungen vom ursprünglichen Plan

- Die Tipp-Stufen liegen zusammen in `hints.ts` statt in drei Dateien – jede ist nur ein paar Zeilen lang.
- `Ending` bringt zusätzlich `recordName` (Speichername des Bestwerts) und die Texte fürs Regelfenster mit.
- `PlacementEffect` hat `id`, `announcement` und `rulesSection`, damit Spielstart, Anzeige und Regelfenster ohne
  Blick in die Einstellungen auskommen.
- `cardCount` liegt jetzt in `src/core/cards.ts`, `DIR_LABELS` in `src/core/rules/rotation.ts` (beide brauchen die
  Bausteine); `src/ui/labels.ts` ist entfallen.
