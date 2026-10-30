/**
 * Farbschema dieses Geräts: automatisch wie das System, oder fest hell bzw. dunkel. Die Farben selbst
 * stehen in global.css; hier wird nur `data-theme` am Wurzelelement gesetzt.
 */

export type Theme = 'auto' | 'light' | 'dark';

export const isTheme = (value: unknown): value is Theme =>
  value === 'auto' || value === 'light' || value === 'dark';

class ThemeChoice {
  current = $state<Theme>('auto');
}

export const themeChoice = new ThemeChoice();

export function applyTheme(theme: Theme): void {
  themeChoice.current = theme;
  const root = document.documentElement;
  if (theme === 'auto') delete root.dataset.theme;
  else root.dataset.theme = theme;
}
