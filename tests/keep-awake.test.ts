import { afterEach, describe, expect, it, vi } from 'vitest';
import { keepScreenOn } from '../src/ui/keep-awake';

/** Ein Browser mit Wake Lock, dessen Sperren man von außen sehen und freigeben kann */
function fakeBrowser() {
  const locks: { released: boolean; release: () => Promise<void> }[] = [];
  const listeners = new Set<() => void>();
  const page = { visibilityState: 'visible' as 'visible' | 'hidden' };
  const request = vi.fn(async () => {
    const lock = {
      released: false,
      release: async () => {
        lock.released = true;
      },
    };
    locks.push(lock);
    return lock;
  });
  vi.stubGlobal('navigator', { wakeLock: { request } });
  vi.stubGlobal('document', {
    get visibilityState() {
      return page.visibilityState;
    },
    addEventListener: (_type: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_type: string, listener: () => void) => listeners.delete(listener),
  });
  /** Seite wird verdeckt oder wieder sichtbar – verdeckt gibt der Browser die Sperre selbst frei */
  const show = (visible: boolean): void => {
    page.visibilityState = visible ? 'visible' : 'hidden';
    if (!visible) for (const lock of locks) lock.released = true;
    for (const listener of listeners) listener();
  };
  return { request, locks, listeners, show };
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('Bildschirm anlassen', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fordert die Sperre an und gibt sie beim Beenden wieder frei', async () => {
    const browser = fakeBrowser();
    const stop = keepScreenOn();
    await settle();
    expect(browser.request).toHaveBeenCalledWith('screen');
    expect(browser.locks[0]?.released).toBe(false);
    stop();
    await settle();
    expect(browser.locks[0]?.released).toBe(true);
    expect(browser.listeners.size).toBe(0);
  });

  it('holt sich die Sperre zurück, wenn die Seite wieder sichtbar wird', async () => {
    const browser = fakeBrowser();
    const stop = keepScreenOn();
    await settle();
    browser.show(false);
    await settle();
    expect(browser.request).toHaveBeenCalledTimes(1);
    browser.show(true);
    await settle();
    expect(browser.request).toHaveBeenCalledTimes(2);
    expect(browser.locks[1]?.released).toBe(false);
    stop();
  });

  it('läuft ohne Wake Lock einfach weiter', () => {
    vi.stubGlobal('navigator', {});
    expect(() => keepScreenOn()()).not.toThrow();
  });

  it('läuft weiter, wenn der Browser die Sperre verweigert', async () => {
    const browser = fakeBrowser();
    browser.request.mockRejectedValueOnce(new Error('NotAllowedError'));
    const stop = keepScreenOn();
    await settle();
    expect(browser.locks).toHaveLength(0);
    stop();
  });
});
