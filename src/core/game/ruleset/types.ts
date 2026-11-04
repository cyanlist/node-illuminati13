/**
 * Die Bausteine des Spielablaufs. Jede Variante ist eine andere Zusammenstellung (`Ruleset`), die `rulesetFor`
 * aus den Einstellungen baut. Die Bausteine leben nicht im Spielstand – der bleibt reine Daten, damit er als
 * JSON zum anderen Gerät reisen und einen Neustart des Artifact-Viewers überstehen kann.
 */
import type { Card } from '../../cards';
import type { RuleKey } from '../../rules';
import type { HintLevel } from '../../settings';
import type { GameState, LogEntry, Player } from '../types';

/** Spielende: wann die letzte Runde beginnt, was die Plakette zeigt und wie allein gewertet wird. */
export interface Ending {
  /** Punkteziel für die Anzeige („7 / 13“), null ohne Ziel */
  goal: number | null;
  /** Unter diesem Namen speichert das Gerät den Bestwert allein */
  recordName: string;
  /** Nach jedem echten Zug (nicht nach einem ausgesetzten): beginnt jetzt die letzte Runde? Setzt ggf. finalTurnsLeft. */
  checkFinalRound(state: GameState): void;
  /** Allein: die Wertung – null, wenn das Ziel nicht erreicht wurde */
  soloScore(state: GameState): number | null;
  /** Schlägt `score` den bisherigen Bestwert (0 = noch keiner)? */
  beatsBest(score: number, best: number): boolean;
  /** Satz unter „Ziel“ im Regelfenster */
  aimText(solo: boolean): string;
  /** Absatz unter „Das Ende der Offenbarung“ im Regelfenster */
  endText(solo: boolean): string;
}

/** Nachziehen auf die Handgröße. */
export interface DrawPolicy {
  /** Zieht auf `target` Karten nach; gibt die ids der gezogenen Karten zurück */
  refill(state: GameState, player: Player, target: number): number[];
  /** Beginnt die letzte Runde, sobald der Nachziehstapel leer ist? */
  endsWhenEmpty: boolean;
}

/** Was passiert, wenn eine Karte auf ihrem Stapel landet. */
export interface PlacementEffect {
  /** Woran die Oberfläche den Effekt erkennt, z. B. um den Zähler der Weltordnung zu zeigen */
  id: 'none' | 'world-order';
  /** Eintrag im Protokoll beim Spielstart, sonst null */
  announcement: LogEntry | null;
  /** Abschnitt im Regelfenster während des Spiels, sonst null */
  rulesSection: { title: string; text: string } | null;
  /** Die Karte ist gerade gelandet: Regeln und Verschiebungen weiterführen; true, wenn sich etwas verschoben hat */
  afterPlace(state: GameState, card: Card): boolean;
  /** Für den Computer: die Regeln, die nach dem Ablegen dieser Karte gälten – ohne den Spielstand zu ändern */
  rulesAfter(state: GameState, card: Card): readonly RuleKey[];
  /** Für die Anzeige: würde diese Karte beim Ablegen etwas auslösen? */
  triggers(state: GameState, card: Card): boolean;
}

/** Was der Tipp zeigt: eine Meldung unter dem Knopf und ggf. markierte Karten. */
export interface HintReveal {
  message: string;
  highlight: number[];
}

/** Eine Tipp-Stufe: wie viel der Tipp-Knopf verrät – samt allen Texten dazu. */
export interface HintStyle {
  id: Exclude<HintLevel, 'off'>;
  /** Titel im Tipps-Fenster und in der Übersicht der Startseite */
  title: string;
  /** Beschreibung im Tipps-Fenster */
  description: string;
  /** Satz im Regelfenster während des Spiels */
  rulesText: string;
  /** Was der Tipp zur gefundenen 13 (ids, nicht leer) zeigt */
  reveal(combo: readonly number[]): HintReveal;
}

export interface Ruleset {
  ending: Ending;
  draw: DrawPolicy;
  placement: PlacementEffect;
  /** null: Tipps sind ausgeschaltet */
  hint: HintStyle | null;
}
