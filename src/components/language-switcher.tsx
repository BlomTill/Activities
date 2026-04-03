"use client";

import { useState } from "react";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LOCALES, Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const [currentLocale, setCurrentLocale] = useState<Locale>("en");
  const [open, setOpen] = useState(false);

  const current = LOCALES.find((l) => l.code === currentLocale)!;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(!open)}
        className="gap-1.5 text-xs"
      >
        <Globe className="h-3.5 w-3.5" />
        {current.flag} {current.code.toUpperCase()}
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-1 w-40 rounded-lg border bg-white py-1 shadow-lg">
            {LOCALES.map((locale) => (
              <button
                key={locale.code}
                onClick={() => {
                  setCurrentLocale(locale.code);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50",
                  currentLocale === locale.code && "bg-gray-50 font-medium text-red-600"
                )}
              >
                <span>{locale.flag}</span>
                {locale.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
