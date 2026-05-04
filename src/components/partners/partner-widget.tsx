"use client";

/**
 * <PartnerWidget /> — wraps the per-partner embed snippets so any page
 * can drop in a one-liner instead of pasting raw HTML. The loader
 * scripts live in <PartnerScripts /> (mounted once in layout.tsx).
 *
 * Usage examples:
 *
 *   // Switzerland-wide GYG carousel on the homepage
 *   <PartnerWidget partner="getyourguide" type="city" locationId={169023} />
 *
 *   // Zurich page — GYG city widget
 *   <PartnerWidget partner="getyourguide" type="city" locationId={GYG_CITIES.zurich} />
 *
 *   // A specific tour widget
 *   <PartnerWidget partner="getyourguide" type="activity" tourIds={["1209994"]} />
 *
 *   // Klook dynamic widget (the user's existing aff_adid)
 *   <PartnerWidget partner="klook" adId="1269917" cid={138} />
 *
 *   // Viator preset widget (token from their dashboard)
 *   <PartnerWidget partner="viator" widgetRef="W-7701fe59-8ef9-401c-864d-4b3c90c087fd" />
 */

import { useEffect, useRef } from "react";

/** GetYourGuide location IDs (the IDs gyg uses for city widgets). */
export const GYG_CITIES = {
  zurich: 55,
  bern: 52,
  switzerland: 169023, // country-wide
} as const;

type Partner = "getyourguide" | "klook" | "viator";

type GygType = "city" | "activity";

type Props =
  | {
      partner: "getyourguide";
      type: GygType;
      /** required for type="city" */
      locationId?: number;
      /** required for type="activity" — comma-separated GYG tour ids */
      tourIds?: string[];
      /** how many cards to render (activity widget) */
      count?: number;
      locale?: string;
      className?: string;
    }
  | {
      partner: "klook";
      /** Klook ad id (data-adid) — get from My Ads → Dynamic Widgets */
      adId: string;
      /** Klook category id, e.g. 138 = Things to do */
      cid?: number;
      /** Number of activity cards to display */
      amount?: number;
      className?: string;
    }
  | {
      partner: "viator";
      /** Viator widget ref token (data-vi-widget-ref) */
      widgetRef: string;
      className?: string;
    };

/**
 * Rerun the loader scripts so they pick up <ins>/<div> nodes that
 * were inserted by React after the script first ran. The loaders are
 * idempotent — calling them again won't double-render existing widgets.
 */
function rebootLoader(partner: Partner) {
  if (typeof window === "undefined") return;
  if (partner === "getyourguide") {
    // GYG exposes window.GYG?.PartnerAttribution in newer builds; the
    // loader auto-scans on mount, so we re-inject the loader script as
    // a no-op rescan.
    const existing = document.getElementById("gyg-loader") as HTMLScriptElement | null;
    if (existing && existing.src) {
      const s = document.createElement("script");
      s.async = true;
      s.defer = true;
      s.src = existing.src;
      const partnerId = existing.getAttribute("data-gyg-partner-id");
      if (partnerId) s.setAttribute("data-gyg-partner-id", partnerId);
      document.head.appendChild(s);
      // Clean it up after init so we don't accumulate <script> nodes.
      setTimeout(() => s.remove(), 4000);
    }
  } else if (partner === "klook") {
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://affiliate.klook.com/widget/fetch-iframe-init.js";
    document.head.appendChild(s);
    setTimeout(() => s.remove(), 4000);
  } else if (partner === "viator") {
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://www.viator.com/orion/partner/widget.js";
    document.head.appendChild(s);
    setTimeout(() => s.remove(), 4000);
  }
}

export function PartnerWidget(props: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // small delay so the inserted DOM exists before the loader scans
    const t = setTimeout(() => rebootLoader(props.partner), 50);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.partner]);

  const partnerId = process.env.NEXT_PUBLIC_GYG_PARTNER_ID || "";
  const viatorPid = process.env.NEXT_PUBLIC_VIATOR_PID || "";

  if (props.partner === "getyourguide") {
    if (!partnerId) return null;
    const locale = props.locale ?? "en-US";

    if (props.type === "city" && props.locationId) {
      return (
        <div
          ref={ref}
          className={props.className}
          // eslint-disable-next-line react/no-unknown-property
          data-gyg-href="https://widget.getyourguide.com/default/city.frame"
          data-gyg-location-id={String(props.locationId)}
          data-gyg-locale-code={locale}
          data-gyg-widget="city"
          data-gyg-partner-id={partnerId}
        />
      );
    }

    if (props.type === "activity" && props.tourIds?.length) {
      return (
        <div
          ref={ref}
          className={props.className}
          data-gyg-href="https://widget.getyourguide.com/default/activities.frame"
          data-gyg-locale-code={locale}
          data-gyg-widget="activities"
          data-gyg-number-of-items={String(props.count ?? props.tourIds.length)}
          data-gyg-partner-id={partnerId}
          data-gyg-tour-ids={props.tourIds.join(",")}
        >
          <span>
            Powered by{" "}
            <a
              target="_blank"
              rel="sponsored noopener nofollow"
              href="https://www.getyourguide.com/zurich-l55/"
            >
              GetYourGuide
            </a>
          </span>
        </div>
      );
    }

    return null;
  }

  if (props.partner === "klook") {
    return (
      <ins
        ref={ref as unknown as React.RefObject<HTMLModElement>}
        className={"klk-aff-widget " + (props.className ?? "")}
        data-adid={props.adId}
        data-lang=""
        data-currency=""
        data-cardh="126"
        data-padding="92"
        data-lgh="470"
        data-edgevalue="655"
        data-cid={String(props.cid ?? 138)}
        data-tid="-1"
        data-amount={String(props.amount ?? 6)}
        data-prod="dynamic_widget"
      >
        <a href="//www.klook.com/">Klook.com</a>
      </ins>
    );
  }

  if (props.partner === "viator") {
    if (!viatorPid) return null;
    return (
      <div
        ref={ref}
        className={props.className}
        data-vi-partner-id={viatorPid}
        data-vi-widget-ref={props.widgetRef}
      />
    );
  }

  return null;
}
