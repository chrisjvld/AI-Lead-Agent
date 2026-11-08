"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

export type ThemePreference = "system" | "light" | "dark";

const STORAGE_KEY = "scout-theme";
const listeners = new Set<() => void>();

function read(): ThemePreference {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return "system";
  }
}

function write(next: ThemePreference) {
  try {
    if (next === "system") window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Storage can be unavailable (private mode); the choice still applies.
  }
  if (next === "system") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", next);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Runs before first paint (see app/layout.tsx) so there is no theme flash. */
export const themeBootScript = `try{var t=localStorage.getItem("${STORAGE_KEY}");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}`;

const order: ThemePreference[] = ["system", "light", "dark"];
const labels: Record<ThemePreference, string> = {
  system: "Appearance: match system",
  light: "Appearance: light",
  dark: "Appearance: dark",
};

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, read, () => "system" as const);
  const next = order[(order.indexOf(theme) + 1) % order.length];
  const Icon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;

  return (
    <button
      type="button"
      className="pressable focus-ring inline-flex size-8 items-center justify-center rounded-full text-fg-2 hover:bg-fill hover:text-fg"
      aria-label={`${labels[theme]}. Switch to ${next}.`}
      title={labels[theme]}
      onClick={() => write(next)}
    >
      <Icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
    </button>
  );
}
