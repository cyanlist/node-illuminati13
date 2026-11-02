# Umbau: Spielablauf aus austauschbaren Bausteinen

Stand: 02.11.2026 – **geplant, noch nicht umgesetzt.** Dieses Dokument ist der Auftrag für den Umbau.

## Ziel

Jeder Abschnitt des Spielablaufs wird ein austauschbarer **Baustein** mit fester Schnittstelle. Eine Variante ist
dann nur eine andere Zusammenstellung von Bausteinen. Statt verstreuter Abfragen wie
`if (settings.ending === 'thirteen')` in Kern, Zustand und Oberfläche fragt der Code das **Regelwerk**:

```ts
const ruleset = rulesetFor(state.settings);
ruleset.ending.checkFinalRound(state);
ruleset.draw.refill(state, player, HAND_SIZE);
ruleset.placement.afterPlace(state, card);
```

Damit stecken neue Varianten wie „Kaninchenbau“ oder „Glaubensfrage“ (siehe `docs/ideen-varianten.md`) später an
**einer** Stelle, statt durch das ganze Projekt verteilt zu werden.

## Grundsätze

1. **Schnittstelle + Objekte statt abstrakter Klassen.** So wie die Stapel-Regeln heute schon gebaut sind
   (`defineRule`, eine Datei pro Regel, ein Verzeichnis per Schlüssel). Braucht ein Baustein eine Einstellung,
   erzeugt ihn eine kleine Funktion, z. B. `firstTo(13)`. Eine abstrakte Basisklasse nur dann, wenn mehrere
   Bausteine wirklich gemeinsames Verhalten erben.
2. **Bausteine leben nicht im Spielstand.** `GameState` bleibt reine Daten, denn er reist als JSON zum anderen Gerät
   und übersteht den Neustart im Artifact-Viewer (Schnappschuss). Er speichert weiter nur die Einstellungen;
   `rulesetFor(settings)` sucht daraus jedes Mal die Bausteine heraus (rein und schnell, darf beliebig oft laufen).
3. **Erster Schritt ohne Verhaltensänderung.** Alle Tests bleiben unverändert grün; dazu kommen Tests je Baustein.
4. **Gespeicherte Werte bleiben gültig.** Die Schlüssel in den Einstellungen (`ending: 'deck' | 'thirteen'`,
   `hints`, `variant`, …) werden nicht umbenannt – sie stehen in gespeicherten Einstellungen und Schnappschüssen.

## Die Bausteine

| Baustein          | Frage                                         | Heute                               | Später                                   |
| ----------------- | --------------------------------------------- | ----------------------------------- | ---------------------------------------- |
| **Spielende**     | Wann ist Schluss, wie wird gewertet?          | Ganzes Deck, Bis 13                 | Bis 50 mit Nachmischen (Kaninchenbau)    |
| **Nachziehen**    | Was passiert bei leerem Nachziehstapel?       | Aufhören                            | Nachmischen (Kaninchenbau)               |
| **Ablage-Effekt** | Was passiert, wenn eine Karte landet?         | Nichts, Weltordnung                 | Allsehendes Auge, Kettenreaktion         |
| **Tipp**          | Was verrät der Tipp-Knopf?                    | Aus, Ja oder nein, Andeutung, Volle Hilfe | –                                  |
| Beweisprüfung     | Wird ein Beweis sofort geprüft?               | Sofort                              | Behaupten + Anfechten (Glaubensfrage)    |
| Abwurf-Ziel       | Wohin darf eine abgeworfene Karte?            | Eigener Stapel                      | Jeder Stapel (Vertuschung)               |
| Regeln der Stapel | Woher kommen die vier Regeln?                 | Klassisch, eigene, ausgelost        | Geheime Regel                            |

**Fett** = Teil dieses Umbaus. Die übrigen erst zusammen mit der Variante, die sie braucht – ihre Schnittstelle sieht
man erst, wenn man die zweite Form wirklich baut (vor allem die Beweisprüfung, bei der ein Zug zweiteilig wird).

## Schnittstellen (Entwurf)

```ts
/** Spielende: wann die letzte Runde beginnt, was die Plakette zeigt und wie allein gewertet wird. */
export interface Ending {
  /** Punkteziel für die Anzeige („7 / 13“), null ohne Ziel */
  goal: number | null;
  /** Nach jedem echten Zug (nicht nach Aussetzen): beginnt jetzt die letzte Runde? Setzt ggf. finalTurnsLeft. */
  checkFinalRound(state: GameState): void;
  /** Allein: Wertung – Punkte, oder Züge bis zum Ziel; null, wenn das Ziel nicht erreicht wurde */
  soloScore(state: GameState): number | null;
  beatsBest(score: number, best: number): boolean;
}

/** Nachziehen auf die Handgröße. */
export interface DrawPolicy {
  refill(state: GameState, player: Player, target: number): number[]; // ids der gezogenen Karten
  /** Beginnt nach leerem Nachziehstapel die letzte Runde? (Nachmischen: nie) */
  endsWhenEmpty: boolean;
}

/** Was passiert, wenn eine Karte auf ihrem Stapel landet. */
export interface PlacementEffect {
  /** Setzt z. B. Regeln und Verschiebungen weiter; true, wenn sich die Weltordnung verschoben hat */
  afterPlace(state: GameState, card: Card): boolean;
  /** Für den Computer (ai.ts): Regeln, die nach dem Ablegen dieser Karte gelten würden – ohne den Zustand zu ändern */
  rulesAfter(state: GameState, card: Card): RuleKey[];
  /** Für die Anzeige (WorldOrder.svelte): würde diese Karte etwas auslösen? */
  triggers(state: GameState, card: Card): boolean;
}

/** Was der Tipp verrät – gemeinsam für Logik (actions.ts) und Texte (RulesSheet, HintsPanel). */
export interface HintStyle {
  title: string;        // „Andeutung“
  description: string;  // Text im Tipps-Fenster
  rulesText: string;    // Satz im Regelfenster
  /** Was der Tipp für diese Kombination zeigt: Meldung und markierte Karten */
  reveal(combo: Card[] | null): { message: string; highlight: number[] };
}

export interface Ruleset {
  ending: Ending;
  draw: DrawPolicy;
  placement: PlacementEffect;
  hint: HintStyle | null; // null = Tipps aus
}

export function rulesetFor(settings: Settings): Ruleset;
```

Die genauen Felder darf der Umbau anpassen, wenn sich beim Bauen etwas Besseres zeigt – Hauptsache, die Aufrufer
fragen nur noch das Regelwerk.

### Konkrete Bausteine im ersten Schritt

| Datei                                   | Baustein                                                                 |
| --------------------------------------- | ------------------------------------------------------------------------ |
| `ending/full-deck.ts`                   | `fullDeck` – meiste Punkte; nach leerem Stapel hat jede*r noch einen Zug |
| `ending/first-to.ts`                    | `firstTo(points)` – „Bis 13“ = `firstTo(GOAL_POINTS)`; faire letzte Runde, allein zählen die Züge |
| `draw/stop-when-empty.ts`               | `stopWhenEmpty` – heutiges Verhalten von `refill`                        |
| `placement/none.ts`                     | `noEffect`                                                               |
| `placement/world-order.ts`              | `worldOrder(dir)` – heutiges `rotatesRules` / `rotateRules`              |
| `hints/{exists,nudge,full}.ts`          | die drei Tipp-Stufen                                                     |
| `ruleset.ts`                            | `rulesetFor(settings)` setzt alles zusammen                              |

Vorschlag für den Ort: `src/core/game/ruleset/` (die Bausteine gehören zum Spielkern; Texte der Tipp-Stufen dürfen
dort stehen, weil auch die Regeln heute schon ihre Texte mitbringen).

## Wo heute verzweigt wird (Stand des Umbaus)

Diese Stellen sollen danach nur noch das Regelwerk fragen:

**Spielende** (`ending`)
- `src/core/game/goal.ts` – `goalOf`, `checkGoal` → in `firstTo`
- `src/core/game/score.ts` – `soloScore`, `beatsBest` → in die Spielende-Bausteine (`ranking` bleibt gemeinsam)
- `src/core/game/turns.ts` – `finishTurn`: letzte Runde nach leerem Stapel + `checkGoal`
- `src/state/flow.ts` – `endGame` (Bestwert allein)
- `src/features/table/GameStatus.svelte`, `PlayerSeat.svelte` – `goalOf`
- `src/features/sheets/ResultsSheet.svelte` – `goalOf`, `soloScore`, `beatsBest`
- `src/features/sheets/RulesSheet.svelte` – Texte je nach `settings.ending`
- `src/features/start/sections.ts` (`endingSummary`), `EndingPanel.svelte` – Texte

**Nachziehen** (`draw`)
- `src/core/game/moves.ts` – `refill`
- `src/core/game/turns.ts` – „Nachziehstapel leer → jede*r noch einen Zug“

**Ablage-Effekt** (`placement`)
- `src/core/game/moves.ts` – `placeCard` (`rotatesRules`, `rotateRules`, `rotations`)
- `src/core/ai.ts` – `discardScore` (Regeln nach dem Abwurf vorausberechnen)
- `src/core/game/new-game.ts` – Protokolleintrag „Variante aktiv“
- `src/features/table/WorldOrder.svelte` – Aufleuchten (`rotatesRules`)
- `src/features/table/Board.svelte`, `GameView.svelte` (Höhenbudget) – `settings.variant`

**Tipp** (`hint`)
- `src/state/actions.ts` – `showHint` (Meldung je Stufe, Markieren bei voller Hilfe)
- `src/features/table/buttons.ts` – `hintButton` (`hints === 'off'`)
- `src/features/table/GameView.svelte` – Höhenbudget (`hints === 'off'`)
- `src/features/sheets/RulesSheet.svelte` – `HINT_TEXT`
- `src/features/start/HintsPanel.svelte`, `src/ui/labels.ts` (`HINT_TITLES`), `sections.ts` (`hintsSummary`)

## Ablauf des Umbaus

1. **Schnittstellen und `rulesetFor`** anlegen, zunächst mit den heutigen Bausteinen.
2. **Spielende** umziehen: `finishTurn`, Wertung, Anzeige. Tests: „Bis 13“ und „Ganzes Deck“ laufen wie bisher;
   neue Tests direkt gegen `fullDeck` und `firstTo(n)` (auch mit anderem n, z. B. 20).
3. **Nachziehen** umziehen (`refill`, letzte Runde nach leerem Stapel).
4. **Ablage-Effekt** umziehen (Weltordnung samt Computer und Anzeige).
5. **Tipp** umziehen (Logik und alle Texte an einer Stelle).
6. Aufräumen: alte Hilfsfunktionen (`goalOf`, `rotatesRules`, `HINT_TITLES`, …) entfernen, wenn nichts sie mehr
   nutzt; Kommentare und `docs/ideen-varianten.md` anpassen.

## Fertig ist der Umbau, wenn

- `npm.cmd run verify` grün ist und alle bisherigen Tests unverändert bestehen.
- Es außerhalb von `rulesetFor` keine Abfrage mehr auf `settings.ending`, `settings.variant` oder `settings.hints`
  gibt (Ausnahme: die Einstellungs-Panels der Startseite, die diese Werte bearbeiten).
- Jeder Baustein eigene Tests hat.
- Das Spiel im Browser unverändert läuft: Ganzes Deck, Bis 13 (zu zweit und allein), Weltordnung nach rechts und
  links, alle vier Tipp-Stufen; zwei Geräte mindestens per Raum-Code einmal durchgespielt.
- Probe aufs Exempel: Ein Test-Baustein `firstTo(20)` lässt sich einstecken, ohne außerhalb von `ruleset/` etwas zu
  ändern.
