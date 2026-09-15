"use client";

import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  const next =
    theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
  const Icon = !mounted
    ? Laptop
    : theme === "dark"
      ? Moon
      : theme === "light"
        ? Sun
        : Laptop;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={`Theme: ${mounted ? theme : "system"}. Switch to ${next}.`}
      title={`Theme: ${mounted ? theme : "system"}`}
      onClick={() => setTheme(next)}
    >
      <Icon className="size-[18px]" aria-hidden="true" />
    </Button>
  );
}