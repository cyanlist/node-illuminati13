/**
 * Wo eine schwebende Sprechblase steht – reine Rechnung mit Rechtecken, damit sie sich testen lässt. Die Blase bleibt
 * immer ganz im Bild; neben ihrem Ziel weicht sie auf die andere Seite aus, wenn auf der bevorzugten kein Platz ist.
 */

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Size {
  width: number;
  height: number;
}

export type Side = 'above' | 'below';

export type BubbleAnchor =
  | { kind: 'center' }
  /** Über einem Bereich, der gerade nicht gebraucht wird – mittig darauf */
  | { kind: 'over'; rect: Rect }
  /** Neben dem Ziel, mit einem Pfeil darauf */
  | { kind: 'beside'; rect: Rect; prefer: Side };

export interface BubblePosition {
  left: number;
  top: number;
  /** Der Pfeil zum Ziel: an welcher Kante der Blase und wie weit von ihrem linken Rand */
  arrow: { edge: 'top' | 'bottom'; x: number } | null;
}

/** Mindestabstand zum Bildrand */
export const EDGE = 12;
/** Abstand zwischen Blase und Ziel – Platz für den Pfeil */
export const GAP = 16;
/** So nah kommt der Pfeil den Ecken der Blase höchstens */
const ARROW_INSET = 22;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), Math.max(min, max));

export function placeBubble(bubble: Size, viewport: Size, anchor: BubbleAnchor): BubblePosition {
  const fitX = (left: number): number => clamp(left, EDGE, viewport.width - bubble.width - EDGE);
  const fitY = (top: number): number => clamp(top, EDGE, viewport.height - bubble.height - EDGE);

  if (anchor.kind === 'center')
    return {
      left: fitX((viewport.width - bubble.width) / 2),
      top: fitY((viewport.height - bubble.height) / 2),
      arrow: null,
    };

  const { rect } = anchor;
  const middle = rect.x + rect.width / 2;
  const left = fitX(middle - bubble.width / 2);
  if (anchor.kind === 'over')
    return { left, top: fitY(rect.y + rect.height / 2 - bubble.height / 2), arrow: null };

  const side = chooseSide(bubble, viewport, rect, anchor.prefer);
  const top = side === 'above' ? rect.y - GAP - bubble.height : rect.y + rect.height + GAP;
  return {
    left,
    top: fitY(top),
    arrow: {
      edge: side === 'above' ? 'bottom' : 'top',
      x: clamp(middle - left, ARROW_INSET, bubble.width - ARROW_INSET),
    },
  };
}

/** Die bevorzugte Seite, wenn die Blase dort ganz hinpasst – sonst die, auf der mehr Platz ist. */
function chooseSide(bubble: Size, viewport: Size, rect: Rect, prefer: Side): Side {
  const room: Record<Side, number> = {
    above: rect.y - GAP - EDGE,
    below: viewport.height - (rect.y + rect.height) - GAP - EDGE,
  };
  const other: Side = prefer === 'above' ? 'below' : 'above';
  return room[prefer] >= bubble.height || room[prefer] >= room[other] ? prefer : other;
}

/** Das kleinste Rechteck um alle – für ein Ziel aus mehreren Teilen (z. B. die vier Regeln). */
export function unionOf(rects: readonly Rect[]): Rect | null {
  if (rects.length === 0) return null;
  const x = Math.min(...rects.map((r) => r.x));
  const y = Math.min(...rects.map((r) => r.y));
  const right = Math.max(...rects.map((r) => r.x + r.width));
  const bottom = Math.max(...rects.map((r) => r.y + r.height));
  return { x, y, width: right - x, height: bottom - y };
}

/** Pfad für einen Grauschleier über das ganze Bild mit abgerundeten Aussparungen (fill-rule: evenodd). */
export function scrimPath(viewport: Size, holes: readonly Rect[], radius = 12): string {
  const outer = `M0 0H${viewport.width}V${viewport.height}H0Z`;
  return [outer, ...holes.map((hole) => roundedRect(hole, radius))].join('');
}

function roundedRect({ x, y, width, height }: Rect, radius: number): string {
  const r = Math.min(radius, width / 2, height / 2);
  const n = (value: number): string => String(Math.round(value * 10) / 10);
  return (
    `M${n(x + r)} ${n(y)}H${n(x + width - r)}A${n(r)} ${n(r)} 0 0 1 ${n(x + width)} ${n(y + r)}` +
    `V${n(y + height - r)}A${n(r)} ${n(r)} 0 0 1 ${n(x + width - r)} ${n(y + height)}` +
    `H${n(x + r)}A${n(r)} ${n(r)} 0 0 1 ${n(x)} ${n(y + height - r)}` +
    `V${n(y + r)}A${n(r)} ${n(r)} 0 0 1 ${n(x + r)} ${n(y)}Z`
  );
}
