# Ideen für spätere Varianten

Stand: 02.11.2026 – noch nicht eingebaut.

---

## 1. „Tiefer in den Kaninchenbau“ (Extended)

Kurzname in der Übersicht: **Kaninchenbau**
Weitere Namensideen: „Die Verschwörung nimmt kein Ende“, „Der Kreis schließt sich“, „Die ganze Wahrheit“

### Regel

- Ist der Nachziehstapel leer, werden alle Ablagestapel **außer ihrer obersten Karte** gemischt und bilden den
  neuen Nachziehstapel. Die obersten Karten bleiben liegen, damit die Regeln weiter etwas zum Rechnen haben.
- Gespielt wird, bis jemand das Punkteziel erreicht – dann wie bei „Bis 13“ die Runde fair zu Ende.
- Ziel: Standard **50**, wählbar 25 / 50 / 100. (Ein Deck bringt beiden zusammen grob 40–50 Punkte;
  100 Punkte für eine Person wären etwa 4–5 Mischungen.)

### Umsetzung

- **Einstellung:** „Länge“ bekommt eine dritte Wahl (Ganzes Deck / Bis 13 / Kaninchenbau) plus Punktzahl.
  „Bis 13“ ist im Grunde ein Sonderfall von „bis X Punkte ohne Nachmischen“: `goalOf()` liefert die
  eingestellte Zahl, `checkGoal()` mit der fairen letzten Runde bleibt unverändert.
- **Nachmischen** in `refill()` (core/game/moves.ts): statt bei leerem Deck aufzuhören, nachmischen und einen
  Protokolleintrag schreiben. Die „letzte Runde nach leerem Stapel“ entfällt in diesem Modus.
- **Wichtig – Zufall an zwei Geräten:** Bisher mischt nur das einladende Gerät einmal beim Start; danach tauschen
  die Geräte nur Züge aus und rechnen identisch. Nachmischen mitten im Spiel mit `Math.random` würde auf beiden
  Geräten verschieden ausgehen. Lösung: ein Zufallsgenerator mit gespeichertem Zustand im `GameState`
  (wie `seededRng` in den Tests), den beide Geräte gleich weiterdrehen.
- **Anzeige:** Plakette „37 / 50“ wie bei „Bis 13“; unter dem Nachziehstapel dezent „2. Mischung“
  (ähnlich wie der Weltordnungs-Zähler).
- **Sicherheitsnetz:** Falls kaum etwas nachzumischen ist (fast alle Karten in den Händen), nach X Mischungen
  nach Punkten beenden, damit es kein endloses Spiel gibt.
- **Texte:** Protokoll beim Nachmischen z. B. „Ihr geratet tiefer in den Kaninchenbau – das Deck wird neu gemischt.“

**Aufwand:** etwa wie „Bis 13“, plus der Zufallsgenerator im Spielstand.

---

## 2. „Wer's glaubt, wird selig“ (Challenger)

Kurzname in der Übersicht: **Glaubensfrage**
Weitere Namensideen: „Entlarvt!“, „Faktencheck“, „Trau keinem Beweis“

### Regel

1. Wer ablegt, **behauptet** eine 13. Die Karten kommen offen auf die Beweis-Bühne, die wahren Werte bleiben
   verborgen. Es wird nicht vorab geprüft, ob die Rechnung stimmt.
2. Das Gegenüber entscheidet: **„Glauben“** oder **„Anfechten“** – per Knopf, ohne Zeitdruck.
3. Die Bühne deckt die Rechnung auf. High Risk, High Reward für beide Seiten (n = Anzahl der Karten im Beweis):

| Fall                              | Folge                                                |
| --------------------------------- | ---------------------------------------------------- |
| Geglaubt (egal ob richtig)        | Beweis zählt: +n Punkte – Bluffen lohnt sich         |
| Angefochten und richtig           | Beweis zählt: +n, wer angefochten hat, verliert n    |
| Angefochten und falsch (entlarvt) | Wer geblufft hat, verliert n                         |

- Bei einem falschen Beweis landen die Karten trotzdem auf ihren Stapeln, es wird aber nicht nachgezogen.
- **Minuspunkte erlaubt** („Dein Ruf ist ruiniert“) – mit 0 als Untergrenze wäre ein früher Bluff fast risikolos.
  (Bisher kann man nicht unter 0 fallen, der Tipp verlangt vorher einen Punkt.)
- Mit „Bis 13“: Verliert jemand in der letzten Runde Punkte, zählt am Ende einfach der Stand.

### Zusammenspiel mit anderen Einstellungen

- „Wahre Werte anzeigen“ ist in diesem Modus aus (sonst sieht man alles), ebenso „Volle Hilfe“ beim Tipp.
- Allein ergibt die Variante keinen Sinn – nur zu zweit oder gegen den Computer wählbar.

### Umsetzung

- **Zwei Zughälften statt einer:**
  - `{ type: 'claim', cardIds, topPick }` – die Karten wandern aus der Hand in `pendingClaim` (neues Feld im
    `GameState`); die Summe wird **nicht** geprüft.
  - `{ type: 'respond', challenge: boolean }` vom Gegenüber – erst hier wird aufgelöst und gewertet.
  - Beides sind reine Daten, an zwei Geräten werden einfach beide Hälften als Züge ausgetauscht.
- **Rundenablauf:** neue Zwischenphase „Antwort ausstehend“. Zu zweit an einem Gerät mit kurzer Übergabe:
  „Gib das Gerät weiter – glaubst du den Beweis?“
- **Computer – Anfechten:** nicht perfekt nachrechnen, sondern das vorhandene Profil (`spotChance`) nutzen: Je mehr
  Karten, desto eher übersieht er einen Fehler – oder ficht einen richtigen Beweis fälschlich an.
- **Computer – Bluffen:** gelegentlich eine falsche 13 behaupten; „Leicht“ selten und plump, „Schwer“ gezielt
  (z. B. wenn die Summe nur knapp daneben liegt).
- **Anzeige:** Knöpfe für das Gegenüber auf der Bühne, danach die Auflösung mit deutlichem Urteil
  („Der Beweis hält!“ / „Entlarvt! Anna verliert 3 Punkte.“), Eintrag im Protokoll.
- **Tests** für alle vier Ausgänge.

**Aufwand:** etwa doppelt so viel wie Kaninchenbau (neue Zugart, neue Phase, Computer-Logik, Übergabe, Tests).

---

## Empfohlene Reihenfolge

1. **Kaninchenbau zuerst** – der Zufallsgenerator im Spielstand macht das Spiel an zwei Geräten ohnehin robuster.
2. **Glaubensfrage danach** – die Regel (vor allem die Strafen) vorher einmal am echten Tisch ausprobieren.

---

## Weitere Ideen aus früheren Gesprächen

- **Vertuschung:** Beim Abwerfen darf die Karte auf *jeden* Stapel – gezielt die oberste Karte verändern, die dem
  Gegenüber gepasst hätte. Wenig Aufwand, viel Interaktion.
- **Offene Auslage:** Drei Karten liegen offen neben dem Nachziehstapel; man wählt eine davon oder zieht blind.
- **Allsehendes Auge:** Ein Beweis mit allen vier Farben bringt Bonuspunkte.
- **Kettenreaktion:** Beweise in aufeinanderfolgenden Zügen bringen jedes Mal einen Punkt mehr; ein Abwurf bricht
  die Kette.
- **Erleuchtung:** Nach jedem Beweis wächst die Hand um eine Karte (höchstens 7).
- **Geheime Regel:** Die Regel eines Stapels ist verdeckt, bis jemand mit dieser Farbe einen Beweis schafft.
- **Zeitdruck:** Jeder Zug hat eine Uhr; läuft sie ab, wird automatisch eine Karte abgeworfen.
