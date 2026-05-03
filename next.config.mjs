/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === "development";

const nextConfig = {
  images: {
    // In dev, bypass the /_next/image proxy. The proxy hammers
    // upload.wikimedia.org & images.unsplash.com on every cold start, which
    // (a) trips Wikimedia's per-IP rate limit (HTTP 429) and (b) spawns enough
    // workers to exhaust macOS file descriptors (ENOMEM/EAGAIN).
    // Letting the browser fetch & cache directly avoids both — and we still
    // get full AVIF/WebP optimization in production builds.
    unoptimized: isDev,
    remotePatterns: [
      // ── Unsplash ────────────────────────────────────────────────────────────
      { protocol: "https", hostname: "images.unsplash.com" },

      // ── Wikimedia Commons ────────────────────────────────────────────────────
      // Direct image CDN (upload.wikimedia.org) + Special:FilePath redirects
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "commons.wikimedia.org" },

      // ── Pexels ───────────────────────────────────────────────────────────────
      { protocol: "https", hostname: "images.pexels.com" },

      // ── Pixabay ──────────────────────────────────────────────────────────────
      { protocol: "https", hostname: "pixabay.com" },
      { protocol: "https", hostname: "cdn.pixabay.com" },

      // ── SwissActivities CDN (imgix-backed) ───────────────────────────────────
      { protocol: "https", hostname: "contentapi-swissactivities.imgix.net" },
      { protocol: "https", hostname: "swissactivities.imgix.net" },

      // ── Misc curated sources ─────────────────────────────────────────────────
      { protocol: "https", hostname: "live.staticflickr.com" },
      { protocol: "https", hostname: "i.imgur.com" },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days — these images are very stable
  },
  async redirects() {
    return [
      // Stories is the new home for editorial posts (see MASTER_PLAN)
      { source: "/blog/:slug*", destination: "/stories/:slug*", permanent: true },
    ];
  },
};

export default nextConfig;
