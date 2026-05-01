"use client";

import { SITE_NAME } from "@/lib/constants";
import { resetConsent } from "@/components/analytics-consent";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <p
        className="text-xs font-semibold uppercase tracking-[0.2em]"
        style={{ color: "var(--ink-mute, #7E8B92)" }}
      >
        Legal
      </p>
      <h1
        className="mt-3 text-4xl font-bold leading-tight md:text-5xl"
        style={{ fontFamily: "'Fraunces', Georgia, serif", color: "var(--ink, #1F2A2E)" }}
      >
        Privacy <em style={{ fontStyle: "italic", color: "var(--accent, #E8634A)" }}>Policy</em>
      </h1>
      <p className="mt-3 text-sm" style={{ color: "var(--ink-mute, #7E8B92)" }}>
        Last updated: May 1, 2026
      </p>

      <div
        className="prose mt-10 max-w-none"
        style={{ color: "var(--ink-soft, #4A5862)" }}
      >
        <p>
          {SITE_NAME} (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is an independent guide to Swiss
          activities, run by a small team based in Switzerland. This policy explains what
          personal data we collect, why we collect it, who processes it, and what rights
          you have. We collect the minimum data needed to operate the site, improve the
          experience, and earn affiliate commissions that keep the content free.
        </p>

        <h2>Who is the data controller?</h2>
        <p>
          The data controller for this site is the operator of {SITE_NAME}. For privacy
          requests, write to{" "}
          <a
            href="mailto:hello@realswitzerland.ch"
            style={{ color: "var(--accent, #E8634A)" }}
          >
            hello@realswitzerland.ch
          </a>
          . Our representative for the European Union is available on request.
        </p>

        <h2>What we collect</h2>
        <ul>
          <li>
            <strong>Newsletter signups.</strong> Email address and an optional &ldquo;intent&rdquo;
            tag (what kind of trip you&apos;re planning) when you submit the form.
          </li>
          <li>
            <strong>Anonymous usage analytics.</strong> Page views, session duration,
            referrer, device type, and browser language — only after you accept analytics
            cookies. IP addresses are anonymised at the analytics layer.
          </li>
          <li>
            <strong>Server logs.</strong> Standard access logs (IP, timestamp, requested
            URL, status code) retained for up to 30 days for security and abuse prevention.
          </li>
          <li>
            <strong>Comparison list and saved trips.</strong> Stored locally in your browser
            (localStorage) — never sent to our servers.
          </li>
        </ul>

        <h2>How we use it</h2>
        <ul>
          <li>Send the newsletter you signed up for.</li>
          <li>Measure which pages and itineraries help travellers most, so we can improve them.</li>
          <li>Detect abuse, spam submissions, and security incidents.</li>
          <li>Track which outbound booking links generate revenue (aggregate counts only — no personal data).</li>
        </ul>

        <h2>Third-party processors</h2>
        <ul>
          <li>
            <strong>Google Analytics 4.</strong> Anonymous usage analytics. Loads only after
            you accept cookies. IP anonymisation enabled. Data may be processed in the EU and US.
          </li>
          <li>
            <strong>Resend.</strong> Newsletter contact storage and delivery. EU-based provider.
          </li>
          <li>
            <strong>Vercel.</strong> Site hosting. Provides server logs and Web Vitals telemetry.
          </li>
          <li>
            <strong>Affiliate partners</strong> (GetYourGuide, Booking.com, Viator, Klook,
            SwissActivities, Rentalcars). When you click an outbound booking link, the
            partner sets its own cookies and is responsible for processing your booking.
          </li>
        </ul>

        <h2>Affiliate disclosure</h2>
        <p>
          Many booking links on this site are affiliate links. If you book through them,
          we may earn a commission at no extra cost to you. This funds the site and lets
          us keep all content free and without display ads. Editorial decisions
          (rankings, recommendations, ratings) are never influenced by commission rates —
          see our partners page for the policy.
        </p>

        <h2>Legal basis</h2>
        <p>
          We process data under the Swiss Federal Act on Data Protection (FADP / DSG) and,
          for visitors from the European Union, under the General Data Protection
          Regulation (GDPR). Our legal bases are:
        </p>
        <ul>
          <li>
            <strong>Consent</strong> — for analytics cookies and newsletter signups.
          </li>
          <li>
            <strong>Legitimate interest</strong> — for security, fraud prevention, and
            essential service operation (server logs).
          </li>
          <li>
            <strong>Contract</strong> — to deliver the newsletter you signed up for.
          </li>
        </ul>

        <h2>Your rights</h2>
        <ul>
          <li>Request access to the personal data we hold about you.</li>
          <li>Request correction or deletion of your data.</li>
          <li>Withdraw consent at any time (use the button below).</li>
          <li>Unsubscribe from the newsletter via the link in every email.</li>
          <li>Lodge a complaint with the Swiss FDPIC (or your national EU data protection authority).</li>
        </ul>

        <h2>Data retention</h2>
        <ul>
          <li>Newsletter subscribers: until you unsubscribe.</li>
          <li>Analytics data: 14 months (GA4 default), then automatically deleted.</li>
          <li>Server logs: up to 30 days.</li>
        </ul>

        <h2>International transfers</h2>
        <p>
          Some processors (Google Analytics, Vercel) may transfer data to the United
          States. These transfers are protected by the EU-U.S. Data Privacy Framework
          and standard contractual clauses where applicable.
        </p>

        <h2>Cookies</h2>
        <p>
          We use essential cookies that are required for the site to function (consent
          state, language preference). Analytics cookies (Google Analytics) are loaded
          only after you accept. We do not use advertising cookies or third-party
          tracking pixels.
        </p>

        <div
          className="my-8 rounded-2xl border p-5"
          style={{
            background: "var(--card, #FFFDF6)",
            borderColor: "var(--line, #E9DFC8)",
          }}
        >
          <p
            className="mb-3 text-base font-semibold"
            style={{ color: "var(--ink, #1F2A2E)", fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Manage your cookie preferences
          </p>
          <p className="mb-4 text-sm" style={{ color: "var(--ink-soft, #4A5862)" }}>
            Click below to reset your choice — the cookie banner will reappear so you can
            accept or reject analytics cookies again.
          </p>
          <button
            type="button"
            onClick={() => {
              resetConsent();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: "var(--accent, #E8634A)" }}
          >
            Manage cookies
          </button>
        </div>

        <h2>Changes to this policy</h2>
        <p>
          We&apos;ll update this page when we add new processors or change how data is used.
          The &ldquo;last updated&rdquo; date at the top reflects the most recent change.
          For material changes, we may also notify newsletter subscribers by email.
        </p>

        <h2>Contact</h2>
        <p>
          For privacy requests or any question about this policy, contact{" "}
          <a
            href="mailto:hello@realswitzerland.ch"
            style={{ color: "var(--accent, #E8634A)" }}
          >
            hello@realswitzerland.ch
          </a>
          . We aim to respond within 30 days.
        </p>
      </div>
    </div>
  );
}
