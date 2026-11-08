/**
 * Das Ergebnis als kurzer Text zum Teilen (Messenger, Mail): der Stand, mit welchen Stapelregeln und Varianten
 * gespielt wurde und wo man selbst spielen kann. Als Anzeigetafel geschrieben („Anna 24 : 19 Ben“) statt mit
 * „Du gewinnst“ – der Text geht ja an andere.
 */
import { SUIT_INDICES, SUITS } from '../../../core/cards';
import { type GameState, ranking, rulesAtStart, rulesetFor } from '../../../core/game';
import { RULES } from '../../../core/rules';
import { inTurns, pts } from '../../../ui/format';
import { variantNames } from '../../start/summaries';

/** Wo das Spiel öffentlich liegt – auch wenn gerade im Claude-Artifact oder lokal gespielt wird */
export const PUBLIC_URL = 'https://cyanlist.github.io/node-illuminati13/';

export function shareText(game: GameState): string {
  const rules = rulesAtStart(game);
  const lines = [
    'Illuminati 13',
    scoreLine(game),
    `Stapel: ${SUIT_INDICES.map((suit) => `${SUITS[suit].name} ${RULES[rules[suit] ?? 'plus'].short}`).join(' · ')}`,
  ];
  const variants = variantNames(game.settings);
  if (variants.length > 0) lines.push(`Varianten: ${variants.join(' · ')}`);
  lines.push(`Selbst spielen: ${PUBLIC_URL}`);
  return lines.join('\n');
}

function scoreLine(game: GameState): string {
  const [first, second] = ranking(game).order;
  if (!first) return '';
  if (!second) {
    const { ending } = rulesetFor(game.settings);
    const goal = ending.goal;
    if (goal === null) return `Allein: ${pts(first.points)} (${first.combos}× die 13)`;
    const turns = ending.soloScore(game);
    return turns === null
      ? `Allein: ${first.points} von ${goal} Punkten`
      : `Allein: ${goal} Punkte ${inTurns(turns)}`;
  }
  return `${first.name} ${first.points} : ${second.points} ${second.name} (13er: ${first.combos} : ${second.combos})`;
}
