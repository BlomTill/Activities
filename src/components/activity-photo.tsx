"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { buildFallbackChain, formatCredit, resolveActivityImage } from "@/lib/images";
import type { Activity } from "@/lib/types";

interface ActivityPhotoProps {
  activity: Activity;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /**
   * Show a small photo credit overlay (required by Wikimedia CC licences).
   * Defaults to true on detail pages, false on card thumbnails.
   */
  showCredit?: boolean;
  /** Aspect ratio preset. */
  aspect?: "16/10" | "16/9" | "4/3" | "3/2" | "1/1";
  fill?: boolean;
}

/**
 * Drop-in replacement for raw <Image> usage around activity photos.
 *
 * Uses resolveActivityImage() to pick the best available source and
 * cascades through buildFallbackChain() client-side if the chosen URL
 * fails to load (404, slow CDN, etc.) — so you always see a relevant
 * photo, never a broken image icon.
 *
 * Renders a discreet credit line when showCredit is true (required by
 * Wikimedia CC licences).
 */
export function ActivityPhoto({
  activity,
  className,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  priority,
  showCredit = false,
  aspect = "16/10",
  fill = true,
}: ActivityPhotoProps) {
  const resolved = resolveActivityImage(activity);
  const fallbacks = buildFallbackChain(activity);
  // Track which fallback we're currently showing (0 = best/resolved)
  const [srcIndex, setSrcIndex] = useState(0);

  const currentSrc = fallbacks[srcIndex] ?? resolved.src;
  const credit = showCredit ? formatCredit(resolved.credit) : null;

  function handleError() {
    // Silently advance to the next URL in the chain
    setSrcIndex((i) => Math.min(i + 1, fallbacks.length - 1));
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-slate-100",
        aspect === "16/10" && "aspect-[16/10]",
        aspect === "16/9" && "aspect-[16/9]",
        aspect === "4/3" && "aspect-[4/3]",
        aspect === "3/2" && "aspect-[3/2]",
        aspect === "1/1" && "aspect-square",
        className
      )}
    >
      <Image
        src={currentSrc}
        alt={resolved.alt}
        fill={fill}
        sizes={sizes}
        priority={priority}
        onError={handleError}
        className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
      />
      {credit && srcIndex === 0 && (
        // Only show credit for the highest-quality source (Wikipedia)
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent p-2 text-right">
          <span className="pointer-events-auto inline-block rounded-md bg-black/40 px-2 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-sm">
            {resolved.credit?.sourceUrl ? (
              <a
                href={resolved.credit.sourceUrl}
                target="_blank"
                rel="noopener nofollow"
                className="hover:underline"
              >
                {credit}
              </a>
            ) : (
              credit
            )}
          </span>
        </div>
      )}
    </div>
  );
}
