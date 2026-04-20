"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Direction = "up" | "left" | "right" | "zoom" | "none";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  direction?: Direction;
  delay?: number; // ms
  threshold?: number; // 0..1
  once?: boolean;
  as?: keyof JSX.IntrinsicElements;
}

const DIRECTION_CLASSES: Record<Direction, string> = {
  up: "reveal",
  left: "reveal reveal-left",
  right: "reveal reveal-right",
  zoom: "reveal reveal-zoom",
  none: "reveal",
};

/**
 * Wraps children and reveals them on scroll using IntersectionObserver.
 * Respects prefers-reduced-motion via the `.reveal` CSS rules.
 */
export function ScrollReveal({
  children,
  className,
  direction = "up",
  delay = 0,
  threshold = 0.15,
  once = true,
  as: Tag = "div",
}: ScrollRevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setVisible(false);
          }
        });
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once]);

  const Component = Tag as React.ElementType;
  return (
    <Component
      ref={ref as React.Ref<HTMLElement>}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn(DIRECTION_CLASSES[direction], visible && "is-visible", className)}
    >
      {children}
    </Component>
  );
}
