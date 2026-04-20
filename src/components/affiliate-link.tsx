"use client";

import { type AnchorHTMLAttributes, type ReactNode, type MouseEvent } from "react";
import {
  AFFILIATE_REL,
  buildAffiliateUrl,
  trackAffiliateClick,
  type AffiliateSlot,
} from "@/lib/affiliate";

interface AffiliateLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "rel" | "target"> {
  href: string;
  slot: AffiliateSlot;
  slug?: string;
  providerName?: string;
  priceChf?: number;
  children: ReactNode;
}

/**
 * Drop-in replacement for <a> when pointing at a booking partner.
 * Automatically:
 *   – rewrites the URL with tracking params
 *   – sets rel="sponsored noopener nofollow" (FTC + SEO compliance)
 *   – opens in a new tab
 *   – fires a GA4 `affiliate_click` event
 */
export function AffiliateLink({
  href,
  slot,
  slug,
  providerName,
  priceChf,
  children,
  onClick,
  ...rest
}: AffiliateLinkProps) {
  const tracked = buildAffiliateUrl(href, { slot, slug });

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    trackAffiliateClick(href, { slot, slug, providerName, priceChf });
    onClick?.(e);
  }

  return (
    <a
      {...rest}
      href={tracked}
      target="_blank"
      rel={AFFILIATE_REL}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
