"use client";

import { ScrollReveal } from "@/components/immersive/scroll-reveal";
import { cn } from "@/lib/utils";

interface ChapterProps {
  number: string;
  eyebrow?: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}

/**
 * A storybook-style section header: "Chapter I · Arrival"
 * Used to frame homepage sections as chapters of a journey.
 */
export function ChapterHeader({
  number,
  eyebrow,
  title,
  lede,
  align = "left",
  className,
}: ChapterProps) {
  return (
    <ScrollReveal
      direction="up"
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      <div
        className={cn(
          "kicker",
          align === "center" && "kicker-center justify-center"
        )}
      >
        <span className="chapter-num">Chapter {number}</span>
        {eyebrow && <span className="text-slate-400">· {eyebrow}</span>}
      </div>
      <h2 className="story-title mt-3 text-3xl leading-[1.05] text-slate-900 md:text-5xl">
        {title}
      </h2>
      {lede && (
        <p className="mt-4 text-base leading-7 text-slate-600 md:text-lg md:leading-8">
          {lede}
        </p>
      )}
      <div className={cn("alpine-rule mt-6", align === "center" && "mx-auto max-w-[220px]")} />
    </ScrollReveal>
  );
}
