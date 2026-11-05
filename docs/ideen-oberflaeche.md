# Ideen für die Oberfläche – noch offen

Dinge, die schon gebaut sind, aber noch nicht entschieden. Varianten des Spielablaufs stehen in
`docs/ideen-varianten.md`.

---

## Eigene Hand ausgrauen, wenn man nicht dran ist

Stand: 05.11.2026 – eingebaut, aber **ausgeschaltet**. Noch offen, ob der Effekt gefällt.

### Was er macht

- Gegen den Computer und zu zweit an zwei Geräten: Während das Gegenüber am Zug ist (überlegt und ablegt),
  werden die eigenen Karten blasser und leicht entsättigt, Avatar und Name ein wenig blasser.
- Während des eigenen Ablegens bleibt alles hell; sobald man wieder dran ist, kommt die volle Farbe zurück
  (Übergang 0,3 s).
- Allein und zu zweit an einem Gerät ändert sich nichts – dort liegt immer die Hand der Person am Zug offen.
- Die Marke „Letzter Zug“ wird nicht gedimmt.

### Einschalten

In `src/features/table/PlayerSeat.svelte` die Konstante `DIM_WHILE_WAITING` auf `true` setzen. Das Aussehen steht
in `src/features/table/Seat.svelte` unter `.waiting` (Karten: Deckkraft 0,55 und Graustufen 0,6; Kopfzeile und
Avatar: Deckkraft 0,7).

### Offene Fragen

- Zu stark oder zu schwach? Eventuell nur die Karten dimmen, Name und Punkte in voller Farbe lassen.
- Als Einstellung anbieten (Einstellungen → gilt nur auf diesem Gerät) statt fest ein- oder auszuschalten?
- Wenn er bleibt: Schalter entfernen und `waiting` direkt berechnen.
