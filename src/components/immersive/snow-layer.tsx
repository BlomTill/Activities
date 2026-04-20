"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface SnowLayerProps {
  count?: number;
  className?: string;
  /** 0..1 — visual density multiplier */
  density?: number;
}

const SYMBOLS = ["❄", "❆", "✦", "✧", "·"];

/**
 * Lightweight pure-CSS snowfall. Each flake gets its own random
 * left position, delay, duration, size and drift. Pointer-events: none.
 */
export function SnowLayer({ count = 26, className, density = 1 }: SnowLayerProps) {
  const flakes = useMemo(() => {
    const n = Math.round(count * density);
    return Array.from({ length: n }).map((_, i) => {
      const left = Math.random() * 100;
      const size = 0.6 + Math.random() * 1.6; // rem
      const duration = 14 + Math.random() * 20; // sec
      const delay = -Math.random() * duration; // start mid-anim
      const opacity = 0.35 + Math.random() * 0.5;
      const symbol = SYMBOLS[i % SYMBOLS.length];
      return { left, size, duration, delay, opacity, symbol, key: i };
    });
  }, [count, density]);

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
    >
      {flakes.map((f) => (
        <span
          key={f.key}
          className="snowflake animate-snow"
          style={{
            left: `${f.left}%`,
            fontSize: `${f.size}rem`,
            animationDuration: `${f.duration}s`,
            animationDelay: `${f.delay}s`,
            opacity: f.opacity,
          }}
        >
          {f.symbol}
        </span>
      ))}
    </div>
  );
}
