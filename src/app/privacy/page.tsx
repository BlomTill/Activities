import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Privacy Policy — ${SITE_NAME}`,
  description: "How ExploreSwitzerland collects, uses, and protects personal data.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
      <p className="mt-3 text-sm text-gray-500">Last updated: April 23, 2026</p>

      <div className="prose prose-gray mt-8 max-w-none">
        <p>
          ExploreSwitzerland collects the minimum data needed to operate this website, improve user experience, and
          support affiliate-funded content.
        </p>

        <h2>What We Collect</h2>
        <ul>
          <li>Newsletter signups: email address and optional signup intent.</li>
          <li>Usage analytics: page views, events, and referral data (with consent).</li>
          <li>Technical data: IP address and browser metadata in server logs.</li>
        </ul>

        <h2>How We Use Data</h2>
        <ul>
          <li>Deliver newsletter updates and planning content.</li>
          <li>Measure site quality and improve pages/features.</li>
          <li>Understand which links drive bookings and content performance.</li>
        </ul>

        <h2>Third-Party Processors</h2>
        <ul>
          <li>Google Analytics (analytics, only after cookie consent).</li>
          <li>Resend (newsletter contact management and delivery).</li>
          <li>Affiliate partners when you click outbound booking links.</li>
        </ul>

        <h2>Legal Basis</h2>
        <p>
          Processing is based on consent (analytics and newsletter) and legitimate interest for secure operation and
          service reliability, in line with Swiss FADP/DSG and applicable GDPR principles.
        </p>

        <h2>Your Rights</h2>
        <ul>
          <li>Request access to your personal data.</li>
          <li>Request correction or deletion.</li>
          <li>Unsubscribe from newsletters at any time.</li>
          <li>Withdraw analytics consent by clearing site storage and revisiting the site.</li>
        </ul>

        <h2>Contact</h2>
        <p>
          For privacy requests, contact{" "}
          <a href="mailto:hello@exploreswitzerland.ch">hello@exploreswitzerland.ch</a>.
        </p>
      </div>
    </div>
  );
}

