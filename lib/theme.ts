export const THEME_STORAGE_KEY = "geekstore-theme";

export type Theme = "light" | "dark";
export type ThemePreference = Theme | "system";

export function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark";
}

export function isThemePreference(value: string | null): value is ThemePreference {
  return isTheme(value) || value === "system";
}

export function systemTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function resolveTheme(preference: ThemePreference): Theme {
  return preference === "system" ? systemTheme() : preference;
}

export function readStoredPreference(): ThemePreference {
  if (typeof window === "undefined") {
    return "system";
  }

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return isThemePreference(stored) ? stored : "system";
}

export function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}
