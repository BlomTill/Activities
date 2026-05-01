import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AgeGroupProvider } from "@/context/age-group-context";
import { GroupProvider } from "@/context/group-context";
import { ComparisonProvider } from "@/context/comparison-context";
import { Header } from "@/components/layout/header";
import { AgeBar } from "@/components/age-bar";
import { Footer } from "@/components/layout/footer";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";
import { WebsiteJsonLd } from "@/components/json-ld";
import { ServiceWorkerRegistration } from "@/components/sw-register";
import { Analytics } from "@vercel/analytics/next";
import { AnalyticsConsent } from "@/components/analytics-consent";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://realswitzerland.ch"),
  title: {
    default: `${SITE_NAME} – Compare Activities Across Switzerland`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: ["Switzerland", "activities", "compare", "pricing", "student", "hiking", "skiing", "museums"],
  manifest: "/manifest.json",
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": SITE_NAME,
  },
  openGraph: {
    type: "website",
    locale: "en_CH",
    siteName: SITE_NAME,
    title: `${SITE_NAME} – Compare Activities Across Switzerland`,
    description: SITE_DESCRIPTION,
    url: "https://realswitzerland.ch",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — The Independent Guide to Switzerland`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} – Compare Activities Across Switzerland`,
    description: SITE_DESCRIPTION,
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <WebsiteJsonLd />
        <meta name="theme-color" content="#dc2626" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} font-[family-name:var(--font-geist-sans)] antialiased min-h-screen flex flex-col alpine-page`}>
        <AgeGroupProvider>
          <GroupProvider>
            <ComparisonProvider>
              <AnalyticsConsent gaId={process.env.NEXT_PUBLIC_GA_ID} />
              <Header />
              <AgeBar />
              <main className="flex-1">{children}</main>
              <Footer />
              <ServiceWorkerRegistration />
            </ComparisonProvider>
          </GroupProvider>
        </AgeGroupProvider>
        <Analytics />
      </body>
    </html>
  );
}
