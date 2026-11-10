import { describe, expect, it } from 'vitest';
import { EDGE, GAP, placeBubble, scrimPath, unionOf } from '../src/ui/bubble-position';

const phone = { width: 375, height: 812 };
const bubble = { width: 300, height: 120 };

describe('Sprechblase', () => {
  it('steht in der Mitte des Bildes', () => {
    expect(placeBubble(bubble, phone, { kind: 'center' })).toEqual({ left: 37.5, top: 346, arrow: null });
  });

  it('liegt mittig über einem Bereich, ohne aus dem Bild zu ragen', () => {
    const seat = { x: 16, y: 60, width: 343, height: 100 };
    expect(placeBubble(bubble, phone, { kind: 'over', rect: seat })).toMatchObject({ left: 37.5, top: 50 });
    const nearTop = { x: 16, y: 0, width: 343, height: 40 };
    expect(placeBubble(bubble, phone, { kind: 'over', rect: nearTop }).top).toBe(EDGE);
  });

  it('steht über ihrem Ziel und zeigt mit dem Pfeil darauf', () => {
    const hand = { x: 20, y: 500, width: 200, height: 150 };
    const position = placeBubble(bubble, phone, { kind: 'beside', rect: hand, prefer: 'above' });
    expect(position.top).toBe(500 - GAP - 120);
    expect(position.left).toBe(EDGE);
    expect(position.arrow).toEqual({ edge: 'bottom', x: 120 - EDGE });
  });

  it('weicht auf die andere Seite aus, wenn die bevorzugte zu eng ist', () => {
    const rules = { x: 20, y: 60, width: 335, height: 30 };
    const position = placeBubble(bubble, phone, { kind: 'beside', rect: rules, prefer: 'above' });
    expect(position.top).toBe(60 + 30 + GAP);
    expect(position.arrow?.edge).toBe('top');
  });

  it('hält den Pfeil von den Ecken fern, auch bei einem Ziel am Rand', () => {
    const hint = { x: 330, y: 700, width: 40, height: 30 };
    const position = placeBubble(bubble, phone, { kind: 'beside', rect: hint, prefer: 'above' });
    expect(position.left).toBe(375 - 300 - EDGE);
    expect(position.arrow?.x).toBe(300 - 22);
  });
});

describe('Grauschleier', () => {
  it('fasst mehrere Teile eines Ziels zusammen', () => {
    expect(
      unionOf([
        { x: 10, y: 20, width: 30, height: 10 },
        { x: 50, y: 15, width: 20, height: 10 },
      ]),
    ).toEqual({ x: 10, y: 15, width: 60, height: 15 });
    expect(unionOf([])).toBeNull();
  });

  it('spart jede Aussparung als eigenen Teilpfad aus', () => {
    const path = scrimPath(phone, [
      { x: 10, y: 10, width: 100, height: 40 },
      { x: 10, y: 100, width: 100, height: 40 },
    ]);
    expect(path.startsWith('M0 0H375V812H0Z')).toBe(true);
    expect(path.match(/Z/g)).toHaveLength(3);
  });
});
