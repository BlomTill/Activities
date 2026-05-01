"use client";

import Script from "next/script";
import { useCallback, useEffect, useState } from "react";

const CONSENT_KEY = "es_cookie_consent";
const CONSENT_EVENT = "es-consent-changed";
type ConsentState = "accepted" | "rejected" | null;

function readConsent(): ConsentState {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(CONSENT_KEY);
  if (value === "accepted" || value === "rejected") return value;
  return null;
}

/**
 * Public helper — call from anywhere (e.g. a "Manage cookies" link in
 * the footer or privacy page) to reset the user's choice and re-show
 * the banner. Required by GDPR/Swiss FADP — users must be able to
 * withdraw consent as easily as they gave it.
 */
export function resetConsent() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CONSENT_KEY);
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT));
}

export function AnalyticsConsent({ gaId }: { gaId?: string }) {
  const [consent, setConsent] = useState<ConsentState>(null);
  const [hydrated, setHydrated] = useState(false);
  const analyticsEnabled = Boolean(gaId && consent === "accepted");

  useEffect(() => {
    setConsent(readConsent());
    setHydrated(true);
    const handler = () => setConsent(readConsent());
    window.addEventListener(CONSENT_EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(CONSENT_EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const persist = useCallback((next: Exclude<ConsentState, null>) => {
    window.localStorage.setItem(CONSENT_KEY, next);
    setConsent(next);
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT));
  }, []);

  return (
    <>
      {analyticsEnabled && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('consent', 'default', { 'analytics_storage': 'granted', 'ad_storage': 'denied' });
gtag('config', '${gaId}', { 'anonymize_ip': true });`}
          </Script>
        </>
      )}

      {hydrated && gaId && consent === null && (
        <div
          role="dialog"
          aria-live="polite"
          aria-label="Cookie consent"
          className="fixed inset-x-4 bottom-4 z-[100] rounded-2xl border p-5 shadow-2xl md:inset-x-auto md:right-4 md:max-w-md"
          style={{
            background: "var(--card, #FFFDF6)",
            borderColor: "var(--line, #E9DFC8)",
            color: "var(--ink, #1F2A2E)",
            boxShadow: "0 22px 40px -18px rgba(31,42,46,.28)",
          }}
        >
          <p className="text-base font-semibold" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
            Cookies & analytics
          </p>
          <p className="mt-2 text-sm leading-6" style={{ color: "var(--ink-soft, #4A5862)" }}>
            We use anonymous analytics cookies to understand which pages help travellers most.
            No ads, no third-party tracking — just Google Analytics with IP anonymisation.
            See our <a href="/privacy" className="underline" style={{ color: "var(--accent, #E8634A)" }}>privacy policy</a>.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => persist("accepted")}
              className="rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              style={{ background: "var(--accent, #E8634A)" }}
            >
              Accept analytics
            </button>
            <button
              type="button"
              onClick={() => persist("rejected")}
              className="rounded-full border px-4 py-2 text-sm font-semibold transition hover:bg-[#FFEFD6]"
              style={{ borderColor: "var(--line, #E9DFC8)", color: "var(--ink-soft, #4A5862)" }}
            >
              Reject
            </button>
          </div>
          <p className="mt-3 text-[11px]" style={{ color: "var(--ink-mute, #7E8B92)" }}>
            You can change your choice anytime via &ldquo;Manage cookies&rdquo; in the footer.
          </p>
        </div>
      )}
    </>
  );
}
