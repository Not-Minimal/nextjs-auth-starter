"use client";

import { Moon, Sun, SunMoon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useTheme } from "@/components/theme/theme-provider";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import React from "react";

const THEME_LABELS = {
  light: "Claro",
  dark: "Oscuro",
  system: "Sistema",
};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { state, isMobile } = useSidebar();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Determina el ícono actual
  const icon =
    theme === "light" ? (
      <Sun className="h-5 w-5" />
    ) : theme === "dark" ? (
      <Moon className="h-5 w-5" />
    ) : (
      <SunMoon className="h-5 w-5" />
    );

  // Tooltip solo cuando la sidebar está colapsada o en mobile
  const showTooltip = state === "collapsed" || isMobile;

  // Evita hydration mismatch: solo renderiza el tema real tras montar
  const currentTheme = mounted ? theme : "system";
  const currentIcon = mounted ? icon : <SunMoon className="h-5 w-5" />;
  const currentLabel = mounted ? THEME_LABELS[theme] : THEME_LABELS["system"];

  const button = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          variant="default"
          size="default"
          aria-label="Cambiar tema"
          className={cn(
            "justify-start items-center gap-2",
            showTooltip && "mx-auto"
          )}
        >
          {currentIcon}
          <span className="text-sm font-normal select-none">
            {currentLabel}
          </span>
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        <DropdownMenuItem onClick={() => setTheme("light")}
          className={currentTheme === "light" ? "font-bold bg-muted" : ""}
        >
          <Sun className=" h-4 w-4" />
          <span>Claro</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}
          className={currentTheme === "dark" ? "font-bold bg-muted" : ""}
        >
          <Moon className=" h-4 w-4" />
          <span>Oscuro</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}
          className={currentTheme === "system" ? "font-bold bg-muted" : ""}
        >
          <SunMoon className=" h-4 w-4" />
          <span>Sistema</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (showTooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right" align="center">
          Cambiar tema
        </TooltipContent>
      </Tooltip>
    );
  }
  return button;
}
