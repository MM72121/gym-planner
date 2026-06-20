import { getMuscleGroups } from "./recommendations";

const PREFERENCES_KEY = "gym-planner-preferences";

export interface Preferences {
  focusMuscles: string[];
}

export function getPreferences(): Preferences {
  if (typeof window === "undefined") {
    return { focusMuscles: [] };
  }

  const stored = localStorage.getItem(PREFERENCES_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return { focusMuscles: [] };
    }
  }

  return { focusMuscles: [] };
}

export function setPreferences(prefs: Preferences): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
}

export function toggleFocusMuscle(muscle: string): Preferences {
  const prefs = getPreferences();
  if (prefs.focusMuscles.includes(muscle)) {
    prefs.focusMuscles = prefs.focusMuscles.filter((m) => m !== muscle);
  } else {
    prefs.focusMuscles.push(muscle);
  }
  setPreferences(prefs);
  return prefs;
}

export function isFocused(muscle: string): boolean {
  const prefs = getPreferences();
  return prefs.focusMuscles.includes(muscle);
}

export function getFocusMuscles(): string[] {
  return getPreferences().focusMuscles;
}
