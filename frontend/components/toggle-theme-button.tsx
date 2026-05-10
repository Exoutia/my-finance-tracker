import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/components/theme-provider.tsx";
import { Button } from "@/components/ui/button.tsx";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="neutral"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Moon className="h-6 w-6 scale-120 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Sun className="absolute h-6 w-6 scale-0 rotate-90 transition-all dark:scale-120 dark:rotate-0" />
    </Button>
  );
}
