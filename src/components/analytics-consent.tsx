"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const CONSENT_KEY = "es_cookie_consent";
type ConsentState = "accepted" | "rejected" | null;

function readConsent(): ConsentState {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(CONSENT_KEY);
  if (value === "accepted" || value === "rejected") return value;
  return null;
}

export function AnalyticsConsent({ gaId }: { gaId?: string }) {
  const [consent, setConsent] = useState<ConsentState>(null);
  const analyticsEnabled = Boolean(gaId && consent === "accepted");

  useEffect(() => {
    setConsent(readConsent());
  }, []);

  function persist(next: Exclude<ConsentState, null>) {
    window.localStorage.setItem(CONSENT_KEY, next);
    setConsent(next);
  }

  return (
    <>
      {analyticsEnabled && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="google-analytics" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${gaId}');`}
          </Script>
        </>
      )}

      {gaId && consent === null && (
        <div className="fixed inset-x-4 bottom-4 z-[100] rounded-xl border border-[#2a261f] bg-[#131210] p-4 shadow-xl md:inset-x-auto md:right-4 md:max-w-md">
          <p className="text-sm font-semibold text-[#ede8df]">Cookies & analytics</p>
          <p className="mt-1 text-xs leading-5 text-[#9a9187]">
            We use analytics cookies to understand usage and improve ExploreSwitzerland. You can change your choice
            anytime by clearing site storage.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => persist("accepted")}
              className="rounded-md bg-red-700 px-3 py-2 text-xs font-semibold text-white hover:bg-red-600"
            >
              Accept analytics
            </button>
            <button
              type="button"
              onClick={() => persist("rejected")}
              className="rounded-md border border-[#2a261f] px-3 py-2 text-xs font-semibold text-[#9a9187] hover:bg-[#1e1b17]"
            >
              Reject analytics
            </button>
          </div>
        </div>
      )}
    </>
  );
}

