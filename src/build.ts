/** Woran man einen Build wiedererkennt – wird beim Bauen eingesetzt (build/build-info.ts, vite.config.ts). */
export interface BuildInfo {
  /** Version aus package.json */
  version: string;
  /** Kurzer Commit-Hash */
  commit: string;
  /** Beim Bauen gab es Änderungen, die noch nicht committet waren */
  dirty: boolean;
  /** Zeitpunkt des Builds (ISO) */
  date: string;
}

declare const __BUILD__: BuildInfo;

export const BUILD: BuildInfo = __BUILD__;

/** „1.0.0 · 57ac4e1“, mit „+ lokal“, wenn noch nicht Committetes mitgebaut wurde. */
export const versionText = (build: BuildInfo = BUILD): string =>
  `${build.version} · ${build.commit}${build.dirty ? ' + lokal' : ''}`;
