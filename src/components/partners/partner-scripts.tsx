"use client";

import Script from "next/script";

/**
 * Mounts the four partner widget loader scripts globally so any
 * <PartnerWidget …/> on the page can render.
 *
 *  • GetYourGuide  — pa.umd.production.min.js  (also their attribution
 *                    "analytics" script — required for ALL gyg widgets).
 *                    The data-gyg-partner-id on this script tag is what
 *                    GYG uses for cross-page partner attribution.
 *  • Klook         — fetch-iframe-init.js (renders <ins.klk-aff-widget>)
 *  • Viator        — orion/partner/widget.js (renders <div data-vi-*>)
 *  • Travelpayouts — Drive AI overlay. Inserted as a body-injected
 *                    <script async> per their install snippet.
 *
 * All scripts use strategy="afterInteractive" so they don't block first
 * paint. They're idempotent — Next.js handles dedup if a layout remounts.
 */
export function PartnerScripts() {
  const gygPartnerId = process.env.NEXT_PUBLIC_GYG_PARTNER_ID || "";
  const driveSrc = process.env.NEXT_PUBLIC_TRAVELPAYOUTS_DRIVE_SRC || "";

  return (
    <>
      {/* GetYourGuide widget loader + cross-page attribution */}
      {gygPartnerId && (
        <Script
          id="gyg-loader"
          src="https://widget.getyourguide.com/dist/pa.umd.production.min.js"
          strategy="afterInteractive"
          data-gyg-partner-id={gygPartnerId}
          async
          defer
        />
      )}

      {/* Klook widget loader */}
      <Script
        id="klook-loader"
        src="https://affiliate.klook.com/widget/fetch-iframe-init.js"
        strategy="afterInteractive"
        async
      />

      {/* Viator widget loader */}
      <Script
        id="viator-loader"
        src="https://www.viator.com/orion/partner/widget.js"
        strategy="afterInteractive"
        async
      />

      {/* Travelpayouts Drive AI — paste-as-given install snippet */}
      {driveSrc && (
        <Script
          id="travelpayouts-drive"
          strategy="afterInteractive"
          // The dynamic-injection wrapper exactly mirrors the snippet
          // Travelpayouts gives in their install instructions; using
          // dangerouslySetInnerHTML preserves its exact behaviour.
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                var s = document.createElement("script");
                s.async = 1;
                s.src = ${JSON.stringify(driveSrc)};
                document.head.appendChild(s);
              })();
            `,
          }}
        />
      )}
    </>
  );
}
