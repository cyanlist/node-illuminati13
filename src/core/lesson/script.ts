/**
 * Das Drehbuch der Lernrunde: wie der Tisch zu Beginn aussieht, welche Karten in welcher Reihenfolge nachgezogen
 * werden, was Weishaupt spielt und was die Person am Gerät in jedem ihrer Züge lernt. Die Karten sind so gewählt,
 * dass in jedem eigenen Zug genau die vorgesehene 13 möglich ist – bzw. keine, wenn abgeworfen werden soll
 * (geprüft in tests/lesson.test.ts).
 */
import { type Card, MAX_RANK, type SuitIndex } from '../cards';
import type { Move } from '../game';
import { DEFAULT_SETTINGS, type Settings } from '../settings';

/** Ein Satz der Lernrunde: Text und Karten, die darin als kleine Karte erscheinen. */
export type Line = readonly (string | Card)[];

/** Eine Farbe für sich: Regel und Stapel ihrer Spalte und die Handkarten dieser Farbe (`suit-0` ist Herz). */
export type SuitFocus = `suit-${SuitIndex}`;

/** Worauf ein Satz zeigt – der Tisch hebt es hervor. */
export type Focus = 'rules' | 'hand' | 'piles' | 'hint' | 'opponent' | SuitFocus;

export interface Page {
  line: Line;
  focus?: Focus;
}

/** Was in einem eigenen Zug gespielt werden soll. */
export type Expected = { type: 'proof'; cards: Card[] } | { type: 'discard'; card: Card };

export interface YourTurn {
  who: 'you';
  /** Erklärungen vor dem Zug – jede mit „Weiter“ */
  pages: Page[];
  /** Wahre Werte ab diesem Zug zeigen oder verbergen */
  showValues?: boolean;
  /** Die Aufgabe, solange man am Zug ist */
  task: Page;
  /** Erst einen Tipp holen: Bis dahin steht `first` unter dem Knopf, danach gilt `next` als Aufgabe */
  hint?: { first: string; next: Page };
  /** Solange das Fenster offen ist, in dem man wählt, welche Karte einer Farbe oben liegt */
  order?: Line;
  expected: Expected;
  /** Wird etwas anderes gespielt: der Satz unter dem Knopf */
  help: string;
  /** … und dazu die vorgesehenen Karten markieren */
  pointOut: boolean;
  /** Während der Zug abgespielt wird */
  done: Line;
}

export interface OpponentTurn {
  who: 'opponent';
  move: Move;
  /** Während Weishaupt überlegt und ablegt */
  line: Line;
}

export type LessonTurn = YourTurn | OpponentTurn;

/** Adam Weishaupt gründete 1776 den Illuminatenorden – hier spielt er gegen dich. */
export const OPPONENT = 'Weishaupt';

/** Klassische Regeln (Herz Stapel + Hand, Pik Stapel − Hand, Karo kopiert, Kreuz Maximum), Tipps als Andeutung. */
export const LESSON_SETTINGS: Settings = {
  ...DEFAULT_SETTINGS,
  mode: 'cpu',
  cpuLevel: 'easy',
  names: ['', ''],
  showValues: true,
  openHands: false,
  variant: false,
  ruleMode: 'classic',
  hints: 'nudge',
  hintCost: false,
  truth: false,
};

const HERZ = 0;
const PIK = 1;
const KARO = 2;
const KREUZ = 3;

/** Eine Karte mit derselben id wie im echten Deck (createDeck). */
const card = (suit: SuitIndex, rank: number): Card => ({ id: suit * MAX_RANK + rank - 1, suit, rank });

/** Satz mit Karten: say`Wirf ${karte} ab.` */
function say(strings: TemplateStringsArray, ...cards: Card[]): Line {
  return strings
    .flatMap((text, i) => [text, ...(i < cards.length ? [cards[i] as Card] : [])])
    .filter((part) => part !== '');
}

// Karten, die in den Sätzen vorkommen
const herz4 = card(HERZ, 4);
const pik9 = card(PIK, 9);
const karo10 = card(KARO, 10);
const kreuz3 = card(KREUZ, 3);
const kreuz8 = card(KREUZ, 8);
const herz2 = card(HERZ, 2);
const kreuz7 = card(KREUZ, 7);
const pik5 = card(PIK, 5);
const pik3 = card(PIK, 3);
const karo12 = card(KARO, 12);
const karo3 = card(KARO, 3);
const herz3 = card(HERZ, 3);
const herz6 = card(HERZ, 6);
const karo2 = card(KARO, 2);
const karo6 = card(KARO, 6);
const kreuz11 = card(KREUZ, 11);
const pik12 = card(PIK, 12);

/**
 * Der Tisch zu Beginn – wie in jedem Spiel sind die Stapel leer. Nach dem ersten Beweis auf jeder Seite liegt auf
 * jedem Stapel eine Karte, und die Regeln haben etwas zu rechnen.
 */
export const LESSON_SETUP = {
  piles: [[], [], [], []] as Card[][],
  hands: [
    [herz4, pik9, karo12, kreuz8, kreuz7],
    [karo10, kreuz3, karo3, herz3, herz6],
  ],
  /** In der Reihenfolge, in der sie gezogen werden – danach kommt der Rest des Decks gemischt */
  draws: [
    // du nach dem Beweis bei leeren Stapeln
    herz2,
    pik5,
    // Weishaupt
    pik12,
    card(KREUZ, 2),
    // du nach dem ersten Beweis
    pik3,
    card(HERZ, 9),
    // Weishaupt
    card(PIK, 1),
    // du nach dem zweiten Beweis
    karo2,
    kreuz11,
    karo6,
    // Weishaupt
    card(HERZ, 11),
    card(KARO, 8),
    // du nach dem Abwurf
    card(KREUZ, 10),
    // Weishaupt
    card(PIK, 7),
  ],
};

/** Die Züge der Lernrunde der Reihe nach – du beginnst, danach immer abwechselnd. */
export const LESSON: LessonTurn[] = [
  {
    who: 'you',
    pages: [
      {
        line: say`Willkommen in der Loge! Bilde aus deinen Handkarten die 13 – jede Karte darin bringt dir einen Punkt.`,
      },
      {
        line: say`Zu Beginn sind alle Stapel leer. Solange ein Stapel leer ist, zählt jede Karte seiner Farbe einfach ihre Zahl.`,
        focus: 'piles',
      },
    ],
    task: {
      line: say`Wähle zwei Karten, deren Zahlen zusammen 13 ergeben, und tippe auf „13 beweisen“.`,
      focus: 'hand',
    },
    expected: { type: 'proof', cards: [herz4, pik9] },
    help: 'Nicht ganz: Herz 4 und Pik 9 ergeben zusammen 13.',
    pointOut: true,
    done: say`Zwei Karten, zwei Punkte! Sie liegen jetzt oben auf Herz und Pik – ab sofort rechnen diese Stapel mit ihnen.`,
  },
  {
    who: 'opponent',
    move: { type: 'proof', cardIds: [karo10.id, kreuz3.id] },
    line: say`Jetzt ist Weishaupt am Zug. Auch er sucht die 13.`,
  },
  {
    who: 'you',
    pages: [
      {
        line: say`Jetzt liegt auf jedem Stapel eine Karte. Über jedem steht seine Regel – schauen wir sie uns einzeln an.`,
        focus: 'rules',
      },
      {
        line: say`Herz rechnet Stapel + Hand: Oben liegt die 4, deine ${herz2} zählt also 4 + 2 = 6.`,
        focus: 'suit-0',
      },
      {
        line: say`Pik rechnet Stapel − Hand: Deine ${pik5} zählt 9 − 5 = 4. Ist deine Zahl größer, wird es negativ.`,
        focus: 'suit-1',
      },
      {
        line: say`Karo kopiert den Stapel: Deine ${karo12} zählt genau 10 wie die oberste Karte – ihre eigene Zahl ist egal.`,
        focus: 'suit-2',
      },
      {
        line: say`Kreuz nimmt die größere Zahl: Gegen die 3 auf dem Stapel zählen ${kreuz7} und ${kreuz8} einfach 7 und 8.`,
        focus: 'suit-3',
      },
      {
        line: say`Das Ergebnis ist der wahre Wert: Er steht in der Ecke deiner Karte, der Rechenweg darunter.`,
        focus: 'hand',
      },
    ],
    task: {
      line: say`Wähle zwei Karten, deren wahre Werte zusammen 13 ergeben, und tippe auf „13 beweisen“.`,
      focus: 'hand',
    },
    expected: { type: 'proof', cards: [herz2, kreuz7] },
    help: 'Nicht ganz: Herz 2 zählt hier 6, Kreuz 7 zählt 7.',
    pointOut: true,
    done: say`Wieder zwei Punkte! Deine Karten liegen jetzt oben – ab sofort rechnen Herz und Kreuz mit ihnen.`,
  },
  {
    who: 'opponent',
    move: { type: 'discard', cardId: karo3.id },
    line: say`Jetzt ist Weishaupt am Zug. Achte darauf, was er ablegt.`,
  },
  {
    who: 'you',
    pages: [
      {
        line: say`Weishaupt hat ${karo3} abgeworfen. Karo kopiert den Stapel: Jede deiner Karo-Karten zählt jetzt 3.`,
        focus: 'piles',
      },
    ],
    task: {
      line: say`Finde eine 13 aus drei Karten – je mehr Karten ein Beweis hat, desto mehr Punkte gibt es.`,
      focus: 'hand',
    },
    order: say`Zwei Pik-Karten: Du wählst, welche oben liegt. Mit ihr rechnet der Pik-Stapel danach.`,
    expected: { type: 'proof', cards: [pik5, pik3, karo12] },
    help: 'Noch nicht. Probier es mit beiden Pik-Karten und der Karo 12.',
    pointOut: true,
    done: say`Drei Karten, drei Punkte!`,
  },
  {
    who: 'opponent',
    move: { type: 'proof', cardIds: [herz3.id, herz6.id], topPick: { [HERZ]: herz6.id } },
    line: say`Weishaupt ist wieder am Zug.`,
  },
  {
    who: 'you',
    pages: [
      {
        line: say`Weishaupt hat die 13 mit ${herz3} und ${herz6} bewiesen. Seine Punkte stehen an seinem Platz.`,
        focus: 'opponent',
      },
    ],
    task: { line: say`Siehst du keine 13? Tippe auf „Tipp“.`, focus: 'hint' },
    hint: {
      first: 'Tippe zuerst auf „Tipp“ – er verrät, ob in deiner Hand eine 13 steckt.',
      next: {
        line: say`Keine 13 – dann wirf eine Karte ab. Nimm ${karo2}: Sie landet oben, und deine ${karo6} zählt danach 2.`,
        focus: 'hand',
      },
    },
    expected: { type: 'discard', card: karo2 },
    help: 'Wirf für die Lernrunde die Karo 2 ab.',
    pointOut: true,
    done: say`Abwerfen bringt keine Punkte, aber eine neue Karte.`,
  },
  {
    who: 'opponent',
    move: { type: 'discard', cardId: pik12.id },
    line: say`Weishaupt ist am Zug.`,
  },
  {
    who: 'you',
    showValues: false,
    pages: [
      {
        line: say`Jetzt ohne wahre Werte, wie im echten Spiel. Rechne selbst – der Tipp verrät, aus wie vielen Karten die 13 besteht.`,
        focus: 'piles',
      },
    ],
    task: { line: say`Finde die 13 und tippe auf „Ablegen“.`, focus: 'hand' },
    expected: { type: 'proof', cards: [karo6, kreuz11] },
    help: 'In deiner Hand steckt eine 13 – wirf noch nichts ab. Denk an die Karo 2 oben auf dem Stapel.',
    pointOut: false,
    done: say`Bewiesen – ganz ohne wahre Werte!`,
  },
];

/** Nach dem letzten Zug des Drehbuchs. */
export const LESSON_END: Line = say`Geschafft! Du kennst jetzt alles, was du brauchst. Spiel weiter gegen Weishaupt oder starte ein eigenes Spiel.`;
