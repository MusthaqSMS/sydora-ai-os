"use client";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
export function ThemeToggle() { const { resolvedTheme, setTheme } = useTheme(); const isDark = resolvedTheme === "dark"; return <Button aria-label="Toggle color theme" onClick={() => setTheme(isDark ? "light" : "dark")} size="icon" variant="ghost">{isDark ? "☀" : "◐"}</Button>; }
