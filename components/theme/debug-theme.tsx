"use client";

import { useTheme } from "./theme-provider";

export function DebugTheme() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-secondary text-secondary-foreground rounded-lg shadow-lg z-50">
      <p>
        Current theme: <strong>{theme}</strong>
      </p>
      <div className="flex gap-2 mt-2">
        <button
          onClick={() => setTheme("light")}
          className="px-3 py-1 bg-primary text-primary-foreground rounded-md"
        >
          Light
        </button>
        <button
          onClick={() => setTheme("dark")}
          className="px-3 py-1 bg-primary text-primary-foreground rounded-md"
        >
          Dark
        </button>
        <button
          onClick={() => setTheme("system")}
          className="px-3 py-1 bg-primary text-primary-foreground rounded-md"
        >
          System
        </button>
      </div>
    </div>
  );
}
