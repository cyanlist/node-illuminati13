import { starter, turnsTaken } from '../../history';
import type { GameState } from '../../types';
import type { Ending } from '../types';

const reached = (state: GameState): boolean => state.log.some((entry) => entry.kind === 'goal');

/**
 * Bis `points` Punkte: Wer das Ziel zuerst erreicht, beendet das Spiel – die Runde wird noch zu Ende gespielt,
 * damit alle gleich viele Züge hatten. Allein zählt, in wie vielen Zügen das Ziel erreicht ist.
 */
export function firstTo(points: number): Ending {
  return {
    goal: points,
    // je Ziel ein eigener Bestwert; 13 liegt wie zu Zeiten von „Bis 13“ unter best-solo-13
    recordName: `best-solo-${points}`,

    /**
     * Hat die Person am Zug gerade das Ziel erreicht, wird nur noch die Runde zu Ende gespielt – egal, wer begonnen
     * hat. Läuft schon die letzte Runde nach leerem Nachziehstapel, bleibt es bei der kürzeren.
     */
    checkFinalRound(state) {
      const player = state.players[state.current];
      if (!player || player.points < points || reached(state)) return;
      const count = state.players.length;
      const untilRoundEnds = (starter(state) - state.current - 1 + count) % count;
      state.finalTurnsLeft = Math.min(state.finalTurnsLeft ?? untilRoundEnds, untilRoundEnds);
      state.log.push({ kind: 'goal', player: state.current, turnsLeft: state.finalTurnsLeft });
    },

    soloScore: (state) => (reached(state) ? turnsTaken(state, 0) : null),
    // weniger Züge sind besser
    beatsBest: (score, best) => best === 0 || score < best,

    aimText: (solo) =>
      solo
        ? `Schaffe ${points} Punkte in möglichst wenigen Zügen.`
        : 'Wer am Ende die meisten Punkte hat, gewinnt.',
    endText: (solo, draw) =>
      solo
        ? `Das Spiel endet, sobald du ${points} Punkte hast – gewertet wird, in wie vielen Zügen du sie schaffst. ${draw.emptyText(true)}`
        : `Wer zuerst ${points} Punkte hat, beendet das Spiel. Die Runde wird noch zu Ende gespielt, damit alle gleich viele Züge hatten – dann gewinnen die meisten Punkte. ${draw.emptyText(false)} Bei Punktgleichstand gewinnt, wer mehr 13er-Kombinationen gefunden hat.`,
  };
}
