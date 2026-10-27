# Illuminati 13

Das Kartenspiel aus dem Game-Design-Kurs (Semester 6) als Web-App: Karten 1–13 in vier Farben, und jede Farbe
wird nach ihrer eigenen „Illuminati-Regel“ mit ihrem Stapel verrechnet. Wer aus den wahren Werten seiner Hand
die 13 bildet, bekommt pro Karte einen Punkt.

- **Spielarten:** gegen den Computer, zu zweit an einem Gerät (Karten bleiben bis zur Übergabe verdeckt) oder allein.
- **Regeln der Stapel:** klassisch (wie in der Anleitung), eigene Zuordnung aus zehn Regeln oder ausgelost.
- **Variante „Wenn die Weltordnung sich verschiebt“:** Landet eine 13 auf einem Stapel, wandern alle Regeln weiter.
- Abgelegte Karten fliegen nacheinander auf ihre Stapel, damit man sieht, was das Gegenüber spielt.

## Schnellstart

```bash
npm install
npm run dev        # Entwicklungsserver auf http://localhost:5173
```

`npm run build` erzeugt **`dist/index.html`** – eine einzelne Datei, die man per Doppelklick im Browser öffnen oder
auf jeden Webspace legen kann (kein Server nötig). Daneben entsteht **`dist/artifact.html`**, dieselbe Seite ohne
HTML-Grundgerüst, zum Veröffentlichen als Claude-Artifact.

| Befehl | Zweck |
|---|---|
| `npm run dev` | Entwicklungsserver mit Hot-Reload |
| `npm run build` | Produktions-Build → `dist/index.html` (Einzeldatei) und `dist/artifact.html` |
| `npm test` | Unit-Tests der Spiellogik (Vitest) |
| `npm run check` | Typprüfung (TypeScript) |
| `npm run lint` / `npm run format` | Biome: prüfen / automatisch formatieren |
| `npm run verify` | Typprüfung + Lint + Tests + Build in einem Rutsch |

## Technik

TypeScript · [Svelte 5](https://svelte.dev) (Oberfläche) · [Vite](https://vite.dev) (Build) · Vitest (Tests) ·
Biome (Lint/Format).

## Ordnerstruktur

```
src/
  core/            Spielkern ohne UI-Bezug (framework-frei, getestet)
    cards.ts         Farben, Karten, Deck, Mischen
    rules/           eine Datei pro Regel (plus.ts, minus.ts, …), registry.ts trägt sie ein, rotation.ts für die Variante
    values.ts        wahrer Wert einer Handkarte
    combos.ts        13er-Kombinationen finden
    settings.ts      Einstellungen und deren Prüfung
    game/            Spielzustand: types, new-game, moves (Beweis/Abwurf), turns (Rundenablauf), ranking
    ai.ts            Zugwahl des Computers
  state/           Zustand und Ablauf der Oberfläche
    table.svelte.ts  was der Tisch zeigt (Spiel, Phase, Auswahl, laufende Ablege-Animation)
    flow.ts          Rundenablauf: Spiel starten, Computerzug, nächster Zug, Wertung
    move-animation.ts  einen Zug Karte für Karte abspielen: Beweis-Bühne, Ablegen, Nachziehen
    actions.ts       Eingaben: Karten wählen, Tipp, ablegen, Reihenfolge, aufdecken
    main-button.ts   Beschriftung und Zustand des Ablegen-Knopfs
    flights.svelte.ts, positions.ts   fliegende Karten und ihre Start-/Zielpunkte
    snapshot.svelte.ts                Spielstand über neue Artifact-Versionen hinweg
  features/
    start/           Startseite: Hero, PlayersPanel, RulesPanel, OptionsPanel, ChoiceGroup, Panel
    table/           Spieltisch: TopBar, GameStatus, Opponents, Seat, Board, Pile, DrawPile, ProofStage, Hand, HandCard, Actions, GameLog, …
    sheets/          Fenster: Regeln, Übergabe, Reihenfolge, Ergebnis
  ui/              gemeinsame Bausteine: Card, CardBack, Chip, SuitIcon, Logo, Sheet, Subject, format.ts
  styles/global.css  Design-Tokens (hell/dunkel), Knöpfe, Formularfelder – alles andere steht in den Komponenten
  storage.ts       Einstellungen und Bestwert im Browser-Speicher
  App.svelte, main.ts
tests/             Unit-Tests · build/  Build-Plugin · scripts/  Artifact-Fassung
legacy/            erste Version als einzelne HTML-Datei (nur zur Referenz, kann gelöscht werden)
```

Faustregel: **`core/` kennt weder Svelte noch den Browser.** Die Oberfläche (`state/`, `features/`, `ui/`) nutzt den
Kern, nie umgekehrt. Ein Zug ist reine Daten (`{ type: 'proof', cardIds, topPick }` oder
`{ type: 'discard', cardId }`), den `applyMove` prüft und ausführt. Damit lässt sich der Kern auch für ein Spiel über
mehrere Geräte nutzen: Züge werden übertragen und auf jedem Gerät gleich angewendet.

## Eine Regel hinzufügen

1. Neue Datei in `src/core/rules/`, z. B. `double.ts`:

   ```ts
   import { defineRule } from './rule';

   /** Zusatzregel: die Handkarte doppelt. */
   export const double = defineRule({
     label: 'Hand × 2',
     short: 'H × 2',
     calc: (_stack, hand) => hand * 2,
     show: (_stack, hand) => `${hand} × 2`,
   });
   ```

2. In `src/core/rules/registry.ts` importieren und in `RULES` eintragen. Damit erscheint sie in der Auswahl auf der
   Startseite, im Regelfenster und kann ausgelost werden.

## Spielregeln in Kürze

Jede Handkarte wird mit der obersten Karte ihres Stapels verrechnet (klassisch: Herz = Stapel + Hand,
Pik = Stapel − Hand, Karo = Stapel, Kreuz = Maximum). Ist der Stapel leer, zählt die Zahl der Karte. Ergeben
beliebig viele Handkarten zusammen genau 13, gibt es pro Karte einen Punkt; sonst wird eine Karte abgeworfen.
Ist der Nachziehstapel leer, hat jede*r noch einen Zug. Bei Punktgleichstand entscheidet die Zahl der 13er.
Die vollständigen Regeln stehen im Spiel unter „Regeln“.
