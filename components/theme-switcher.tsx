"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Changer le thème"
      className="relative w-9 h-9 flex items-center justify-center rounded-xl
        bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700
        text-gray-600 dark:text-gray-300
        hover:bg-gray-200 dark:hover:bg-gray-700
        transition-all duration-300 shadow-sm hover:shadow"
    >
      <span
        className={`absolute transition-all duration-300 ${
          isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-50"
        }`}
      >
        <Sun size={16} />
      </span>
      <span
        className={`absolute transition-all duration-300 ${
          isDark ? "opacity-0 -rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"
        }`}
      >
        <Moon size={16} />
      </span>
    </button>
  );
};

export { ThemeSwitcher };
